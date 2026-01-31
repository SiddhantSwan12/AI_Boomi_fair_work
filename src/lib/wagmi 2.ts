import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonAmoy } from "wagmi/chains";

// Wagmi configuration for Polygon Amoy testnet (replacement for deprecated Mumbai)
export const config = getDefaultConfig({
    appName: "FairWork",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
    chains: [polygonAmoy],
    ssr: true, // Enable server-side rendering support
});

// Contract addresses (filled after deployment)
export const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;
export const JURY_POOL_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_JURY_POOL_CONTRACT_ADDRESS as `0x${string}`;
export const USDC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}` || "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23";
