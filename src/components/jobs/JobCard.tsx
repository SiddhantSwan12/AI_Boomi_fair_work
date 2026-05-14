"use client";

import { motion } from "framer-motion";
import { formatUSDC, formatRelativeTime } from "@/lib/utils";
import { getJobStatusLabel, normalizeJobStatus } from "@/lib/status";
import { ArrowRight, Clock, Shield } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
    job: {
        id: string;
        contract_job_id: number;
        title: string;
        description: string;
        amount: number;
        deadline: number;
        client: string;
        freelancer?: string;
        status: string;
        created_at: string;
    };
}

// ── Status → minimal label only, no color ─────────────────────────────────────
const STATUS_LABEL: Record<string, { label: string; dot: string }> = {
    OPEN: { label: getJobStatusLabel("OPEN"), dot: "#1DBF73" },
    WAITING_CLIENT_APPROVAL: { label: getJobStatusLabel("WAITING_CLIENT_APPROVAL"), dot: "#f59e0b" },
    ACCEPTED: { label: getJobStatusLabel("ACCEPTED"), dot: "#6366f1" },
    SUBMITTED: { label: getJobStatusLabel("SUBMITTED"), dot: "#f59e0b" },
    APPROVED: { label: getJobStatusLabel("APPROVED"), dot: "#10b981" },
    DISPUTED: { label: getJobStatusLabel("DISPUTED"), dot: "#ef4444" },
    RESOLVED: { label: getJobStatusLabel("RESOLVED"), dot: "#8b5cf6" },
    CANCELLED: { label: getJobStatusLabel("CANCELLED"), dot: "#94a3b8" },
};

// ── Category tag extraction ───────────────────────────────────────────────────
const TAG_MAP: [string[], string[]][] = [
    [["smart contract", "solidity", "erc20", "erc721"],         ["Solidity", "Smart Contract"]],
    [["nft", "erc-721", "mint", "metadata"],                    ["NFT", "ERC-721"]],
    [["defi", "protocol", "amm", "liquidity", "swap", "yield"], ["DeFi", "Protocol"]],
    [["frontend", "react", "ui", "interface", "nextjs"],        ["React", "Frontend"]],
    [["ai", "machine learning", "agent", "llm", "gpt"],         ["AI/ML", "Agents"]],
    [["audit", "security", "vulnerability", "exploit"],         ["Audit", "Security"]],
    [["dao", "governance", "voting", "proposal"],               ["DAO", "Governance"]],
    [["backend", "api", "server", "node", "graphql"],           ["Backend", "API"]],
    [["layer2", "l2", "zk", "rollup", "polygon"],               ["Layer 2", "ZK"]],
    [["mobile", "ios", "android", "flutter"],                   ["Mobile"]],
];

function extractTags(title: string, description: string): string[] {
    const text = (title + " " + description).toLowerCase();
    for (const [kw, tags] of TAG_MAP) {
        if (kw.some((k) => text.includes(k))) return tags;
    }
    return ["Web3", "Blockchain"];
}

function formatAddress(addr: string): string {
    if (!addr || addr.length < 10) return addr ?? "Unknown";
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatPostedTime(isoDate: string): string {
    try {
        const diff = Date.now() - new Date(isoDate).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return "Just now";
        if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24);
        return d < 30 ? `${d}d ago` : `${Math.floor(d / 30)}mo ago`;
    } catch { return "Recently"; }
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function JobCard({ job }: JobCardProps) {
    const status = STATUS_LABEL[normalizeJobStatus(job.status)] ?? STATUS_LABEL.OPEN;
    const tags   = extractTags(job.title ?? "", job.description ?? "");
    const initials = job.client ? job.client.slice(2, 4).toUpperCase() : "??";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 group w-full"
        >
            <Link href={`/jobs/${job.id}`} className="block">
                <div className="relative overflow-hidden rounded-lg border border-[#DFE7E2] bg-white transition-all duration-200 group-hover:border-[#1DBF73]/40 group-hover:shadow-card">
                    <div className="relative flex flex-col md:flex-row md:items-stretch py-6 px-6">
                        
                        {/* ── Avatar ── */}
                        <div className="shrink-0 mb-4 md:mb-0 md:mr-6">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black select-none"
                                style={{ background: "#E7F8EF", color: "#15945A", border: "1px solid #B7EED2" }}
                            >
                                {initials}
                            </div>
                        </div>

                        {/* ── Main info ── */}
                        <div className="flex-1 min-w-0 pr-0 md:pr-6">
                            {/* Meta row */}
                            <div className="flex items-center gap-3 mb-2 flex-wrap text-[12px] font-medium tracking-wide">
                                <span className="flex items-center gap-1.5" style={{ color: "#e2e8f0" }}>
                                    <span
                                        className="w-2 h-2 rounded-full inline-block shrink-0 shadow-[0_0_8px_currentColor]"
                                        style={{ color: status.dot, backgroundColor: status.dot }}
                                    />
                                    {status.label}
                                </span>
                                <span className="text-[#C8D3CE]">•</span>
                                <span className="font-mono text-[#64717D]">
                                    {formatAddress(job.client)}
                                </span>
                                <span className="text-[#C8D3CE]">•</span>
                                <span className="text-[#64717D]">
                                    {formatPostedTime(job.created_at)}
                                </span>
                            </div>

                            {/* Title */}
                            <h3
                                className="font-bold mb-2 line-clamp-1 group-hover:text-[#15945A] transition-colors duration-200 text-[#101820]"
                                style={{ fontSize: "17px", letterSpacing: 0, lineHeight: 1.4 }}
                            >
                                {job.title}
                            </h3>

                            {/* Description */}
                            <p
                                className="text-[14px] leading-relaxed mb-4 line-clamp-2 text-[#64717D]"
                            >
                                {job.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded border"
                                        style={{ background: "#F6F9F7", color: "#64717D", borderColor: "#DFE7E2" }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                                <span
                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded"
                                    style={{ background: "rgba(29, 191, 115, 0.1)", color: "#1DBF73", border: "1px solid rgba(29, 191, 115, 0.2)" }}
                                >
                                    <Shield className="w-3 h-3" />
                                    Escrowed
                                </span>
                            </div>
                        </div>

                        {/* Divider for mobile */}
                        <div className="w-full h-px bg-[#DFE7E2] my-6 md:hidden" />

                        {/* ── Right: price + CTA ── */}
                        <div
                            className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-40 md:pl-6 md:border-l border-[#DFE7E2] relative z-10"
                        >
                            {/* Budget */}
                            <div className="text-left md:text-right">
                                <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "#64717D" }}>
                                    Budget
                                </div>
                                <div
                                    className="font-black leading-none text-[#101820]"
                                    style={{ fontSize: "24px", letterSpacing: 0 }}
                                >
                                    ${formatUSDC(BigInt(job.amount))}
                                </div>
                                <div className="text-[11px] mt-1 font-bold tracking-widest text-[#1DBF73]">USDC</div>
                            </div>

                            {/* CTA + deadline */}
                            <div className="text-right flex flex-col items-end md:mt-auto">
                                <span
                                    className="inline-flex items-center justify-end gap-1 text-[13px] font-bold transition-all duration-200 group-hover:text-[#15945A]"
                                    style={{ color: "#1DBF73" }}
                                >
                                    View Details <ArrowRight className="w-4 h-4" />
                                </span>
                                <div className="flex items-center justify-end gap-1.5 mt-2 text-[11px] font-medium text-[#64717D]">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatRelativeTime(job.deadline)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
