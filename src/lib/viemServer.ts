// Server-only viem clients — do NOT import in client components.
// Used by API routes that interact with Polygon Amoy contracts.

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";

const rpc = process.env.POLYGON_AMOY_RPC!;

export const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(rpc),
});

export function getRelayerWalletClient() {
    const key = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
    const account = privateKeyToAccount(key);
    return createWalletClient({
        account,
        chain: polygonAmoy,
        transport: http(rpc),
    });
}
