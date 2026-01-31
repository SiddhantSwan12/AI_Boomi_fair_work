import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format wallet address to short form (0x1234...5678)
 */
export function formatAddress(address: string): string {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format USDC amount (6 decimals) to readable string
 */
export function formatUSDC(amount: bigint): string {
    const value = Number(amount) / 1_000_000; // USDC has 6 decimals
    return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Parse USDC amount from string to bigint (with 6 decimals)
 */
export function parseUSDC(amount: string): bigint {
    const value = parseFloat(amount);
    if (isNaN(value)) return 0n;
    return BigInt(Math.floor(value * 1_000_000));
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp * 1000; // Convert to ms

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
}

/**
 * Truncate IPFS hash for display
 */
export function formatIPFSHash(hash: string): string {
    if (!hash) return "";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Get IPFS gateway URL
 */
export function getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
}
