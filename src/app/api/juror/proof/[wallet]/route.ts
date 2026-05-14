import { NextRequest, NextResponse } from "next/server";
import { buildTreeFromHashes, getProof } from "@/lib/merkle";
import { supabase } from "@/lib/supabase";
import { type Hex } from "viem";

// GET /api/juror/proof/[wallet]
// Reconstructs the Merkle proof for a juror's first credential leaf.
// Used by the dispute UI when a juror needs to pass proof alongside castVote (future).
export async function GET(
    _req: NextRequest,
    { params }: { params: { wallet: string } }
) {
    try {
        const wallet = params.wallet.toLowerCase();

        const { data: profile } = await supabase
            .from("juror_profiles")
            .select("credential_root, leaf_hashes")
            .eq("wallet", wallet)
            .single();

        if (!profile) {
            return NextResponse.json({ error: "Juror not found" }, { status: 404 });
        }

        const tree = buildTreeFromHashes(profile.leaf_hashes as Hex[]);

        // Proof for leaf at index 0 (first credential document)
        const merkleProof = getProof(tree, 0);

        return NextResponse.json({
            root:    profile.credential_root,
            leaf:    merkleProof.leaf,
            proof:   merkleProof.proof,
            isLeft:  merkleProof.isLeft,
        });

    } catch (err) {
        console.error("[proof]", err);
        return NextResponse.json({ error: "Failed to generate proof" }, { status: 500 });
    }
}
