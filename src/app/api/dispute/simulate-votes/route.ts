import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEMO_JUROR_ADDRESSES = [
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
];

export async function POST(req: NextRequest) {
    try {
        const { disputeId, outcome } = (await req.json()) as {
            disputeId: string;
            outcome: "CLIENT" | "FREELANCER";
        };

        if (!disputeId || !outcome) {
            return NextResponse.json({ error: "disputeId and outcome required" }, { status: 400 });
        }

        // Fetch assigned jurors — auto-assign demo jurors if none exist yet
        let { data: jurors, error: jurorError } = await supabase
            .from("jurors")
            .select("juror_address")
            .eq("dispute_id", disputeId);

        if (jurorError) throw jurorError;

        if (!jurors || jurors.length < 3) {
            // No jurors yet — insert demo addresses and advance status to VOTING
            const { error: insertError } = await supabase.from("jurors").insert(
                DEMO_JUROR_ADDRESSES.map((addr) => ({
                    dispute_id: disputeId,
                    juror_address: addr,
                }))
            );
            if (insertError) throw insertError;

            await supabase
                .from("disputes")
                .update({ status: "VOTING" })
                .eq("id", disputeId);

            jurors = DEMO_JUROR_ADDRESSES.map((addr) => ({ juror_address: addr }));
        }

        // Remove any existing votes so simulation is idempotent
        await supabase.from("votes").delete().eq("dispute_id", disputeId);

        // Insert 2 votes for the chosen side (majority out of 3)
        const decision: "CLIENT" | "FREELANCER" = outcome === "CLIENT" ? "CLIENT" : "FREELANCER";
        const votingJurors = jurors.slice(0, 2);

        const { error: voteError } = await supabase.from("votes").insert(
            votingJurors.map((j) => ({
                dispute_id: disputeId,
                juror: j.juror_address,
                decision,
            }))
        );
        if (voteError) throw voteError;

        // Mark dispute resolved
        const { error: resolveError } = await supabase
            .from("disputes")
            .update({
                status: "RESOLVED",
                outcome: outcome === "CLIENT" ? "CLIENT_WINS" : "FREELANCER_WINS",
                resolved_at: new Date().toISOString(),
            })
            .eq("id", disputeId);
        if (resolveError) throw resolveError;

        return NextResponse.json({ success: true, outcome, votes: votingJurors.length });
    } catch (err) {
        console.error("[simulate-votes]", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to simulate votes" },
            { status: 500 }
        );
    }
}
