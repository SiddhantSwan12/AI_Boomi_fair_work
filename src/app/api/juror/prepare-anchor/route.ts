import { NextRequest, NextResponse } from "next/server";
import { buildTreeFromHashes } from "@/lib/merkle";
import { publicClient } from "@/lib/viemServer";
import { VERIFY_ABI, VERIFY_ADDRESS } from "@/lib/contracts";
import { supabase } from "@/lib/supabase";
import { type Hex } from "viem";

// POST /api/juror/prepare-anchor
// Receives file hashes from the browser (files never leave the device).
// Builds the Merkle tree, fetches the juror's current nonce from Verify.sol,
// stores pending data in Supabase, and returns EIP-712 typed data for signing.
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { wallet, fileHashes, profileData } = body as {
            wallet: string;
            fileHashes: Hex[];
            profileData: {
                display_name: string;
                expertise: string[];
                bio: string;
                experience_level: string;
            };
        };

        if (!wallet || !fileHashes?.length || !profileData?.display_name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if already registered
        const { data: existing } = await supabase
            .from("juror_profiles")
            .select("wallet")
            .eq("wallet", wallet.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json({ error: "Wallet already registered as juror" }, { status: 409 });
        }

        // Build Merkle tree from client-supplied hashes
        const tree = buildTreeFromHashes(fileHashes);
        const rootHex = tree.root;

        // Fetch current nonce from Verify.sol
        const nonce = await publicClient.readContract({
            address: VERIFY_ADDRESS,
            abi: VERIFY_ABI,
            functionName: "nonces",
            args: [wallet as `0x${string}`],
        });

        // Deadline: 1 hour from now
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

        // Cache pending data — best-effort, non-blocking.
        // The anchor route no longer depends on this table; leaf_hashes are passed
        // directly by the client so this is just an optional audit trail.
        supabase.from("juror_pending").upsert({
            wallet: wallet.toLowerCase(),
            root_hex: rootHex,
            leaf_hashes: fileHashes,
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }).then(() => {});

        // EIP-712 typed data — matches Verify.sol constructor TYPE_HASH exactly
        const typedData = {
            domain: {
                name: "DocAnchor",
                version: "1",
                chainId: 80002,
                verifyingContract: VERIFY_ADDRESS,
            },
            types: {
                Anchor: [
                    { name: "root",     type: "bytes32" },
                    { name: "owner",    type: "address" },
                    { name: "nonce",    type: "uint256" },
                    { name: "deadline", type: "uint256" },
                ],
            },
            primaryType: "Anchor" as const,
            message: {
                root:     rootHex,
                owner:    wallet,
                nonce:    nonce.toString(),
                deadline: deadline.toString(),
            },
        };

        return NextResponse.json({ root_hex: rootHex, deadline: deadline.toString(), typed_data: typedData });

    } catch (err) {
        console.error("[prepare-anchor]", err);
        return NextResponse.json({ error: "Failed to prepare anchor" }, { status: 500 });
    }
}
