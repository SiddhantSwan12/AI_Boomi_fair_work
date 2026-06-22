import { NextRequest, NextResponse } from "next/server";
import { publicClient } from "@/lib/viemServer";
import { ESCROW_ABI, ESCROW_ADDRESS } from "@/lib/contracts";
import { supabase } from "@/lib/supabase";

// Fallback demo addresses used when fewer than 3 real juror profiles exist.
// These simulate the VRF-selected jury pool for demo/presentation purposes.
const DEMO_JUROR_ADDRESSES = [
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
];

export async function POST(req: NextRequest) {
    try {
        const { disputeId, contractDisputeId } = (await req.json()) as {
            disputeId: string;
            contractDisputeId: number;
        };

        if (!disputeId) {
            return NextResponse.json({ error: "disputeId required" }, { status: 400 });
        }

        // Bail early if jurors are already assigned
        const { data: existing } = await supabase
            .from("jurors")
            .select("juror_address")
            .eq("dispute_id", disputeId);

        if (existing && existing.length >= 3) {
            return NextResponse.json({
                jurors: existing.map((j) => j.juror_address),
                simulated: false,
            });
        }

        let jurorAddresses: string[] = [];
        let simulated = false;

        // ── Try on-chain first (VRF may have already fulfilled) ────────────────
        if (contractDisputeId != null && ESCROW_ADDRESS) {
            try {
                const onChain = (await publicClient.readContract({
                    address: ESCROW_ADDRESS,
                    abi: ESCROW_ABI,
                    functionName: "getDisputeJurors",
                    args: [BigInt(contractDisputeId)],
                })) as string[];

                if (onChain.length >= 3) {
                    jurorAddresses = onChain.slice(0, 3).map((a) => a.toLowerCase());
                }
            } catch {
                // Contract call failed or VRF hasn't fulfilled yet — fall through to simulation
            }
        }

        // ── Simulation: pick from registered juror profiles ────────────────────
        if (jurorAddresses.length < 3) {
            simulated = true;

            const { data: profiles } = await supabase
                .from("juror_profiles")
                .select("wallet")
                .limit(20);

            const pool = (profiles ?? []).map((p) => p.wallet.toLowerCase());

            // Shuffle pool and take up to 3
            const shuffled = pool.sort(() => Math.random() - 0.5);
            jurorAddresses = shuffled.slice(0, 3);

            // Fill remaining slots with demo addresses so there are always exactly 3
            let demoIdx = 0;
            while (jurorAddresses.length < 3) {
                const demo = DEMO_JUROR_ADDRESSES[demoIdx % DEMO_JUROR_ADDRESSES.length];
                if (!jurorAddresses.includes(demo)) {
                    jurorAddresses.push(demo);
                }
                demoIdx++;
            }
        }

        // ── Write juror assignments ────────────────────────────────────────────
        const { error: insertError } = await supabase.from("jurors").insert(
            jurorAddresses.map((addr) => ({
                dispute_id: disputeId,
                juror_address: addr,
            }))
        );

        if (insertError) throw insertError;

        // Advance dispute status to VOTING
        await supabase
            .from("disputes")
            .update({ status: "VOTING" })
            .eq("id", disputeId);

        return NextResponse.json({ jurors: jurorAddresses, simulated });
    } catch (err) {
        console.error("[assign-jurors]", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to assign jurors" },
            { status: 500 }
        );
    }
}
