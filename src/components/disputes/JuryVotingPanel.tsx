"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs } from "viem";
import { ESCROW_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { formatAddress } from "@/lib/utils";
import { CheckCircle2, Loader2, FlaskConical } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface JuryVotingPanelProps {
    disputeId: bigint;
    supabaseDisputeId: string;
    jurors: string[];
    votes: {
        juror: string;
        decision: "CLIENT" | "FREELANCER";
        votedAt: number;
    }[];
    clientAddress: string;
    freelancerAddress: string;
    onResolved?: () => void;
}

export default function JuryVotingPanel({
    disputeId,
    supabaseDisputeId,
    jurors,
    votes,
    clientAddress,
    freelancerAddress,
    onResolved,
}: JuryVotingPanelProps) {
    const { address } = useAccount();
    const { data: voteTxHash, writeContract, isPending } = useWriteContract();
    const { data: voteReceipt } = useWaitForTransactionReceipt({ hash: voteTxHash });
    const lastVoteRef = useRef<boolean | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const isJuror = address
        ? jurors.map(j => j.toLowerCase()).includes(address.toLowerCase())
        : false;
    const hasVoted = votes.some(v => v.juror.toLowerCase() === address?.toLowerCase());

    const clientVotes = votes.filter(v => v.decision === "CLIENT").length;
    const freelancerVotes = votes.filter(v => v.decision === "FREELANCER").length;

    // Fired when on-chain castVote tx confirms
    useEffect(() => {
        if (!voteReceipt || !address || lastVoteRef.current === null) return;
        const voteForClient = lastVoteRef.current;
        lastVoteRef.current = null;

        const syncOnChainVote = async () => {
            await supabase.from("votes").insert({
                dispute_id: supabaseDisputeId,
                juror: address.toLowerCase(),
                decision: voteForClient ? "CLIENT" : "FREELANCER",
            });

            const resolvedLogs = parseEventLogs({
                abi: ESCROW_ABI,
                eventName: "DisputeResolved",
                logs: voteReceipt.logs,
            });

            if (resolvedLogs.length > 0) {
                const winner = resolvedLogs[0].args.winner as string;
                const outcome =
                    winner.toLowerCase() === clientAddress.toLowerCase()
                        ? "CLIENT_WINS"
                        : "FREELANCER_WINS";
                await supabase.from("disputes").update({
                    status: "RESOLVED",
                    outcome,
                    resolved_at: new Date().toISOString(),
                }).eq("id", supabaseDisputeId);
                onResolved?.();
            } else {
                // Not yet resolved — just refresh parent to show new vote
                onResolved?.();
            }
        };

        syncOnChainVote().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [voteReceipt]);

    const handleOffChainVote = async (voteForClient: boolean) => {
        if (!address) return;
        const decision: "CLIENT" | "FREELANCER" = voteForClient ? "CLIENT" : "FREELANCER";

        await supabase.from("votes").insert({
            dispute_id: supabaseDisputeId,
            juror: address.toLowerCase(),
            decision,
        });

        // Tally after this new vote
        const newClientVotes = clientVotes + (voteForClient ? 1 : 0);
        const newFreelancerVotes = freelancerVotes + (voteForClient ? 0 : 1);

        if (newClientVotes >= 2 || newFreelancerVotes >= 2) {
            const outcome = newClientVotes >= 2 ? "CLIENT_WINS" : "FREELANCER_WINS";
            await supabase.from("disputes").update({
                status: "RESOLVED",
                outcome,
                resolved_at: new Date().toISOString(),
            }).eq("id", supabaseDisputeId);
        }

        onResolved?.();
    };

    const handleSimulate = async (outcome: "CLIENT" | "FREELANCER") => {
        setIsSimulating(true);
        try {
            const res = await fetch("/api/dispute/simulate-votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ disputeId: supabaseDisputeId, outcome }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? "Simulation failed");
            }
            onResolved?.();
        } catch (err) {
            console.error("[simulate-votes]", err);
            alert("Simulation failed: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsSimulating(false);
        }
    };

    const handleVote = (voteForClient: boolean) => {
        if (!isJuror || hasVoted) return;

        // Off-chain path: no on-chain dispute (simulated jury) → record directly in Supabase
        if (!disputeId || disputeId === BigInt(0)) {
            handleOffChainVote(voteForClient).catch(console.error);
            return;
        }

        // On-chain path
        lastVoteRef.current = voteForClient;
        writeContract({
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "castVote",
            args: [disputeId, voteForClient],
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Jury Voting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Vote Tally */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">
                            Client
                        </div>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {clientVotes} / 3
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {formatAddress(clientAddress)}
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">
                            Freelancer
                        </div>
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {freelancerVotes} / 3
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            {formatAddress(freelancerAddress)}
                        </div>
                    </div>
                </div>

                {/* Juror List */}
                <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                        Selected Jurors
                    </h4>
                    <div className="space-y-2">
                        {jurors.map((juror, index) => {
                            const vote = votes.find(v => v.juror.toLowerCase() === juror.toLowerCase());
                            const isCurrentUser = juror.toLowerCase() === address?.toLowerCase();

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${isCurrentUser
                                        ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "border-slate-200 dark:border-slate-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                                            {formatAddress(juror)}
                                        </span>
                                        {isCurrentUser && (
                                            <Badge variant="info" className="text-xs">You</Badge>
                                        )}
                                    </div>

                                    {vote ? (
                                        <Badge variant={vote.decision === "CLIENT" ? "info" : "default"}>
                                            Voted: {vote.decision}
                                        </Badge>
                                    ) : (
                                        <Badge variant="warning">Pending</Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Simulate Jury Decision (demo tool) */}
                {votes.length === 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <FlaskConical className="w-4 h-4 text-amber-500" />
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                Demo — Simulate Jury Decision
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleSimulate("CLIENT")}
                                disabled={isSimulating}
                                className="flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 transition-colors disabled:opacity-50"
                            >
                                {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Client Wins
                            </button>
                            <button
                                onClick={() => handleSimulate("FREELANCER")}
                                disabled={isSimulating}
                                className="flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 transition-colors disabled:opacity-50"
                            >
                                {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Freelancer Wins
                            </button>
                        </div>
                    </div>
                )}

                {/* Voting Interface */}
                {isJuror && !hasVoted && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                            Cast Your Vote
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handleVote(true)}
                                disabled={isPending}
                                className="h-auto py-4 flex-col gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                        <span className="font-semibold">Vote for Client</span>
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handleVote(false)}
                                disabled={isPending}
                                className="h-auto py-4 flex-col gap-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-6 h-6 text-purple-600" />
                                        <span className="font-semibold">Vote for Freelancer</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {isJuror && hasVoted && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            You have cast your vote
                        </p>
                    </div>
                )}

                {!isJuror && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            You are not a juror for this dispute
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
