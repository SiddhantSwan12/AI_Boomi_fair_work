import { NextRequest, NextResponse } from "next/server";
import { publicClient, getRelayerWalletClient } from "@/lib/viemServer";
import { VERIFY_ABI, VERIFY_ADDRESS, ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contracts";
import { buildTreeFromHashes } from "@/lib/merkle";
import { supabase } from "@/lib/supabase";
import { type Hex } from "viem";

// POST /api/juror/anchor
// Receives leaf_hashes from the client (no staging table needed).
// Verifies the hashes produce the signed root, then anchors on-chain.
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { wallet, root_hex, deadline, signature, leaf_hashes, profileData } = body as {
            wallet: string;
            root_hex: Hex;
            deadline: string;
            leaf_hashes: Hex[];
            signature: { v: number; r: Hex; s: Hex };
            profileData: {
                display_name: string;
                expertise: string[];
                bio: string;
                experience_level: string;
            };
        };

        if (!wallet || !root_hex || !deadline || !signature || !leaf_hashes?.length || !profileData) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify the client-supplied hashes actually produce the claimed root.
        // The EIP-712 signature covers root_hex, so a tampered root would fail on-chain anyway —
        // this is an early check to catch mistakes before spending gas.
        const tree = buildTreeFromHashes(leaf_hashes);
        if (tree.root !== root_hex) {
            return NextResponse.json({ error: "Leaf hashes do not match the provided root" }, { status: 400 });
        }

        const walletClient = getRelayerWalletClient();

        // Step 1: anchor root on Verify.sol
        const anchorTxHash = await walletClient.writeContract({
            address: VERIFY_ADDRESS,
            abi: VERIFY_ABI,
            functionName: "anchorWithSig",
            args: [
                root_hex,
                wallet as `0x${string}`,
                BigInt(deadline),
                signature.v,
                signature.r,
                signature.s,
            ],
        });

        const anchorReceipt = await publicClient.waitForTransactionReceipt({ hash: anchorTxHash });

        if (anchorReceipt.status !== "success") {
            return NextResponse.json({ error: "anchorWithSig transaction reverted" }, { status: 500 });
        }

        // Step 2: add juror to FairWorkEscrow jury pool (skip if already registered)
        const alreadyJuror = await publicClient.readContract({
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "isJuror",
            args: [wallet as `0x${string}`],
        });

        if (!alreadyJuror) {
            const addJurorTxHash = await walletClient.writeContract({
                address: ESCROW_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "addJuror",
                args: [wallet as `0x${string}`],
            });
            await publicClient.waitForTransactionReceipt({ hash: addJurorTxHash });
        }

        // Step 3: create juror profile (only after both txs confirm)
        const { data: profile, error: insertError } = await supabase
            .from("juror_profiles")
            .insert({
                wallet:           wallet.toLowerCase(),
                display_name:     profileData.display_name,
                expertise:        profileData.expertise ?? [],
                bio:              profileData.bio ?? "",
                experience_level: profileData.experience_level || null,
                credential_root:  root_hex,
                leaf_hashes,
                anchor_tx:        anchorTxHash,
                anchored_at:      new Date().toISOString(),
            })
            .select("id")
            .single();

        if (insertError) {
            console.error("[anchor] profile insert failed:", insertError);
            return NextResponse.json({ error: "Profile creation failed after anchoring" }, { status: 500 });
        }

        // Clean up pending row if it exists (best-effort, non-blocking)
        supabase.from("juror_pending").delete()
            .eq("wallet", wallet.toLowerCase())
            .eq("root_hex", root_hex)
            .then(() => {});

        return NextResponse.json({
            success:    true,
            anchor_tx:  anchorTxHash,
            profile_id: profile?.id,
        });

    } catch (err) {
        console.error("[anchor]", err);
        return NextResponse.json({ error: "Anchor failed" }, { status: 500 });
    }
}
