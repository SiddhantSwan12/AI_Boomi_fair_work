"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Client,
    type DecodedMessage,
    type Dm,
    type Identifier,
    type Signer,
    type XmtpEnv,
} from "@xmtp/browser-sdk";
import { hexToBytes } from "viem";
import { useWalletClient } from "wagmi";
import { canChatForJobStatus } from "@/lib/status";

export type ChatMessage = {
    id: string;
    text: string;
    sentAt: number;
    isMine: boolean;
    isAudio?: boolean;
    audioUrl?: string;
};

const XMTP_ENVS = ["local", "dev", "production"] as const satisfies readonly XmtpEnv[];

function normalizeXmtpEnv(value: string | undefined): XmtpEnv {
    const normalized = value?.trim();
    return XMTP_ENVS.includes(normalized as XmtpEnv) ? (normalized as XmtpEnv) : "dev";
}

const XMTP_ENV = normalizeXmtpEnv(process.env.NEXT_PUBLIC_XMTP_ENV);

function normalizeAddress(address: string): string {
    return address.toLowerCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessageText(message: any): string {
    const content = message?.content;
    if (typeof content === "string") return content;
    if (content && typeof content?.text === "string") return content.text;
    if (content instanceof Uint8Array || content instanceof ArrayBuffer) {
        try {
            const bytes = content instanceof Uint8Array ? content : new Uint8Array(content);
            return new TextDecoder().decode(bytes);
        } catch {
            return "[Binary message]";
        }
    }
    if (message?.contentBytes instanceof Uint8Array) {
        try {
            return new TextDecoder().decode(message.contentBytes);
        } catch {
            return "[Binary message]";
        }
    }
    return "[Unsupported message type]";
}

function toMillis(sentAtNs: bigint | number | undefined): number {
    if (typeof sentAtNs === "bigint") return Number(sentAtNs / 1_000_000n);
    if (typeof sentAtNs === "number") return sentAtNs;
    return Date.now();
}

interface UseXmtpChatProps {
    currentUserAddress?: string;
    clientAddress: string;
    freelancerAddress: string;
    jobStatus: string;
}

export function useXmtpChat({
    currentUserAddress,
    clientAddress,
    freelancerAddress,
    jobStatus,
}: UseXmtpChatProps) {
    const { data: walletClient } = useWalletClient();
    const xmtpClientRef = useRef<Client | null>(null);

    const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
    const [dm, setDm] = useState<Dm | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [isInitializing, setIsInitializing] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusHint, setStatusHint] = useState<string | null>(null);

    const normalizedCurrent = currentUserAddress ? normalizeAddress(currentUserAddress) : "";
    const normalizedClient = normalizeAddress(clientAddress);
    const normalizedFreelancer = normalizeAddress(freelancerAddress);

    const isParticipant =
        normalizedCurrent === normalizedClient || normalizedCurrent === normalizedFreelancer;

    const peerAddress = useMemo(() => {
        if (!normalizedCurrent) return "";
        if (normalizedCurrent === normalizedClient) return normalizedFreelancer;
        if (normalizedCurrent === normalizedFreelancer) return normalizedClient;
        return "";
    }, [normalizedClient, normalizedCurrent, normalizedFreelancer]);

    const canChatByStatus = canChatForJobStatus(jobStatus);
    const counterPartyAddress =
        normalizedCurrent === normalizedClient ? freelancerAddress : clientAddress;

    const refreshMessages = useCallback(async (activeDm: Dm, activeClient: Client) => {
        await activeClient.conversations.sync();
        await activeDm.sync();
        const history = await activeDm.messages({ limit: 50n });

        const parsed = (history as DecodedMessage[])
            .map((message) => {
                const text = extractMessageText(message);
                const isAudio = text.startsWith("[VOICE]:");
                return {
                    id: String(message?.id || `${message?.sentAtNs || Date.now()}`),
                    text: isAudio ? "Voice message" : text,
                    sentAt: toMillis(message?.sentAtNs),
                    isMine: message?.senderInboxId === activeClient.inboxId,
                    isAudio,
                    audioUrl: isAudio ? text.substring(8) : undefined,
                };
            })
            .sort((a, b) => a.sentAt - b.sentAt);

        setMessages(parsed);
    }, []);

    const initializeChat = useCallback(async () => {
        setIsInitializing(true);
        setError(null);
        setStatusHint(null);

        if (!canChatByStatus || !currentUserAddress || !isParticipant) {
            setIsInitializing(false);
            return;
        }

        if (!walletClient?.account) {
            setIsInitializing(false);
            setError("Connect your wallet to start XMTP chat.");
            return;
        }

        if (!peerAddress) {
            setIsInitializing(false);
            setError("Unable to resolve the counterparty for this job.");
            return;
        }

        const signer: Signer = {
            type: "EOA",
            getIdentifier: () => ({
                identifier: walletClient.account!.address,
                identifierKind: "Ethereum",
            }),
            signMessage: async (message: string) => {
                const signatureHex = await walletClient.signMessage({
                    account: walletClient.account!,
                    message,
                });
                return hexToBytes(signatureHex);
            },
        };

        if (xmtpClientRef.current) {
            xmtpClientRef.current.close();
            xmtpClientRef.current = null;
        }

        const dbKey = new Uint8Array(32);
        const addrBytes = new TextEncoder().encode(walletClient.account!.address.toLowerCase());
        dbKey.set(addrBytes.slice(0, 32));

        let createdClient: Client;
        try {
            createdClient = await Client.create(signer, {
                env: XMTP_ENV,
                appVersion: "fairwork-chat/1.0.0",
                dbEncryptionKey: dbKey,
            });
        } catch (createError) {
            setIsInitializing(false);
            setError(
                createError instanceof Error
                    ? `XMTP failed to initialize: ${createError.message}`
                    : "XMTP failed to initialize."
            );
            return;
        }
        xmtpClientRef.current = createdClient;

        await createdClient.conversations.syncAll();

        const identifier: Identifier = {
            identifier: peerAddress,
            identifierKind: "Ethereum",
        };

        const peerInboxId = await createdClient.findInboxIdByIdentifier(identifier);
        if (!peerInboxId) {
            setStatusHint(
                "Counterparty XMTP inbox not found yet. They must open chat once; you can still try sending."
            );
        }

        const conversation = peerInboxId
            ? await createdClient.conversations.newDm(peerInboxId)
            : await createdClient.conversations.newDmWithIdentifier(identifier);

        setXmtpClient(createdClient);
        setDm(conversation);
        await refreshMessages(conversation, createdClient);
        setIsInitializing(false);
    }, [canChatByStatus, currentUserAddress, isParticipant, peerAddress, refreshMessages, walletClient]);

    const handleSend = useCallback(async () => {
        if (!draft.trim() || !dm || !xmtpClient) return;
        try {
            setIsSending(true);
            setError(null);
            await dm.send(draft.trim());
            setDraft("");
            await refreshMessages(dm, xmtpClient);
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : "Failed to send message.");
        } finally {
            setIsSending(false);
        }
    }, [draft, dm, refreshMessages, xmtpClient]);

    const handleSendAudio = useCallback(async (base64Message: string) => {
        if (!dm || !xmtpClient) return;
        try {
            setIsSending(true);
            await dm.send(base64Message);
            await refreshMessages(dm, xmtpClient);
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : "Failed to send voice message.");
        } finally {
            setIsSending(false);
        }
    }, [dm, refreshMessages, xmtpClient]);

    // Initialize on mount
    useEffect(() => {
        let isCancelled = false;
        const init = async () => {
            try {
                await initializeChat();
            } catch (initError) {
                if (!isCancelled) {
                    setError(initError instanceof Error ? initError.message : "Failed to initialize XMTP chat.");
                    setIsInitializing(false);
                }
            }
        };
        init();
        return () => {
            isCancelled = true;
            if (xmtpClientRef.current) {
                xmtpClientRef.current.close();
                xmtpClientRef.current = null;
            }
        };
    }, [initializeChat]);

    // Poll for new messages every 5s
    useEffect(() => {
        if (!dm || !xmtpClient) return;
        let isCancelled = false;
        const intervalId = setInterval(async () => {
            if (isCancelled) return;
            try {
                setIsRefreshing(true);
                await refreshMessages(dm, xmtpClient);
            } catch {
                // suppress background poll errors
            } finally {
                if (!isCancelled) setIsRefreshing(false);
            }
        }, 5000);
        return () => {
            isCancelled = true;
            clearInterval(intervalId);
        };
    }, [dm, refreshMessages, xmtpClient]);

    return {
        xmtpClient,
        dm,
        messages,
        draft,
        setDraft,
        isInitializing,
        isRefreshing,
        isSending,
        error,
        setError,
        statusHint,
        canChatByStatus,
        isParticipant,
        normalizedCurrent,
        counterPartyAddress,
        handleSend,
        handleSendAudio,
        initializeChat,
        XMTP_ENV,
    };
}
