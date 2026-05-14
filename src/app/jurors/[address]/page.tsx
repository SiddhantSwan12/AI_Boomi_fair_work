"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { supabase } from "@/lib/supabase";
import { formatAddress } from "@/lib/utils";
import {
    ShieldCheck, ExternalLink, Scale, Award,
    Clock, CheckCircle2, ArrowRight, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type JurorProfile = {
    id: string;
    wallet: string;
    display_name: string;
    expertise: string[];
    bio: string | null;
    experience_level: string | null;
    credential_root: string;
    anchor_tx: string;
    anchored_at: string | null;
    created_at: string;
};

type AssignedDispute = {
    dispute_id: string;
    selected_at: string;
    disputes: {
        id: string;
        contract_dispute_id: number;
        reason: string;
        status: string;
        outcome: string;
        created_at: string;
        jobs: { title: string; amount: number } | null;
    } | null;
};

type Vote = {
    dispute_id: string;
    decision: string;
    voted_at: string;
};

const EXPERIENCE_LABELS: Record<string, string> = {
    entry:        "Entry Level",
    intermediate: "Intermediate",
    expert:       "Expert",
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
    OPEN:        { bg: "bg-amber-50",    text: "text-amber-600",    label: "Open"        },
    VOTING:      { bg: "bg-blue-50",     text: "text-blue-600",     label: "Voting"      },
    RESOLVED:    { bg: "bg-[#E9F9F0]",   text: "text-[#19A463]",    label: "Resolved"    },
    AI_ANALYZED: { bg: "bg-purple-50",   text: "text-purple-600",   label: "AI Analyzed" },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="animate-pulse space-y-6 max-w-4xl mx-auto px-6 py-12">
            <div className="h-8 bg-[#EEF5F1] rounded-lg w-1/3" />
            <div className="h-4 bg-[#EEF5F1] rounded w-1/2" />
            <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-[#EEF5F1] rounded-xl" />)}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JurorProfilePage() {
    const { address: paramAddress } = useParams<{ address: string }>();
    const { address: connectedAddress } = useAccount();

    const isOwnProfile = connectedAddress?.toLowerCase() === paramAddress?.toLowerCase();

    const [profile, setProfile]   = useState<JurorProfile | null>(null);
    const [disputes, setDisputes] = useState<AssignedDispute[]>([]);
    const [votes, setVotes]       = useState<Vote[]>([]);
    const [loading, setLoading]   = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (paramAddress) fetchAll(paramAddress.toLowerCase());
    }, [paramAddress]);

    async function fetchAll(wallet: string) {
        setLoading(true);

        const [profileRes, disputesRes, votesRes] = await Promise.all([
            supabase.from("juror_profiles").select("*").eq("wallet", wallet).single(),
            supabase
                .from("jurors")
                .select(`dispute_id, selected_at, disputes(id, contract_dispute_id, reason, status, outcome, created_at, jobs(title, amount))`)
                .eq("juror_address", wallet)
                .order("selected_at", { ascending: false }),
            supabase.from("votes").select("dispute_id, decision, voted_at").eq("juror", wallet),
        ]);

        if (!profileRes.data) {
            setNotFound(true);
        } else {
            setProfile(profileRes.data);
            setDisputes((disputesRes.data as unknown as AssignedDispute[]) ?? []);
            setVotes((votesRes.data as Vote[]) ?? []);
        }
        setLoading(false);
    }

    const voteMap = new Map(votes.map(v => [v.dispute_id, v]));
    const totalAssigned = disputes.length;
    const totalVoted    = votes.length;
    const totalResolved = disputes.filter(d => d.disputes?.status === "RESOLVED").length;

    if (loading) return <div className="fw-product-shell"><Navbar /><Skeleton /></div>;

    if (notFound) return (
        <div className="fw-product-shell">
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
                <AlertCircle className="w-12 h-12 text-[#DFE7E2]" />
                <h2 className="text-2xl font-bold text-[#101820]">Juror Not Found</h2>
                <p className="text-[#64717D]">No verified juror profile exists for this wallet address.</p>
                <Link href="/jurors/register" className="mt-2 px-6 py-2.5 bg-[#1DBF73] text-white text-sm font-semibold rounded-lg hover:bg-[#15945A] transition-colors">
                    Become a Juror
                </Link>
            </div>
            <LandingFooter />
        </div>
    );

    return (
        <div className="fw-product-shell fw-unified-page">
            <Navbar />

            {/* ── Hero banner ── */}
            <div className="border-b border-[#DFE7E2] bg-white">
                <div className="max-w-4xl mx-auto px-6 py-10">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
                    >
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1DBF73] to-[#15945A] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-2xl font-black text-white">
                                {profile!.display_name.slice(0, 2).toUpperCase()}
                            </span>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-[#101820]">{profile!.display_name}</h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F8EF] text-[#15945A] text-xs font-bold border border-[#CFE9DA]">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Juror
                                </span>
                                {profile!.experience_level && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0F4FF] text-[#4F6BED] text-xs font-semibold border border-[#D8DFFF]">
                                        <Award className="w-3.5 h-3.5" />
                                        {EXPERIENCE_LABELS[profile!.experience_level] ?? profile!.experience_level}
                                    </span>
                                )}
                            </div>
                            <p className="text-[#64717D] text-sm font-mono">{formatAddress(profile!.wallet)}</p>
                            {profile!.bio && (
                                <p className="mt-3 text-[#24313D] text-[15px] leading-relaxed max-w-xl">{profile!.bio}</p>
                            )}
                        </div>

                        {isOwnProfile && (
                            <Link
                                href="/jurors/dashboard"
                                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DBF73] hover:bg-[#15945A] text-white text-sm font-semibold transition-colors"
                            >
                                My Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </motion.div>

                    {/* Expertise tags */}
                    {profile!.expertise?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                            {profile!.expertise.map(tag => (
                                <span key={tag} className="px-3 py-1.5 rounded-lg bg-[#EEF5F1] text-[#15945A] text-xs font-semibold border border-[#DFE7E2]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

                {/* ── Stats ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid grid-cols-3 gap-4"
                >
                    {[
                        { label: "Disputes Assigned", value: totalAssigned, icon: Scale,        color: "text-[#1DBF73]" },
                        { label: "Votes Cast",         value: totalVoted,    icon: CheckCircle2, color: "text-blue-500"   },
                        { label: "Cases Resolved",     value: totalResolved, icon: Award,        color: "text-amber-500"  },
                    ].map(stat => (
                        <div key={stat.label} className="fw-panel p-5 text-center">
                            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                            <div className="text-2xl font-black text-[#101820]">{stat.value}</div>
                            <div className="text-xs text-[#64717D] font-medium mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* ── Credential anchor ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="fw-panel p-5"
                >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#E7F8EF] flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-5 h-5 text-[#1DBF73]" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#101820]">On-chain Credential Anchor</p>
                                <p className="text-xs text-[#64717D] font-mono mt-0.5">{profile!.credential_root.slice(0, 20)}…</p>
                            </div>
                        </div>
                        <a
                            href={`https://amoy.polygonscan.com/tx/${profile!.anchor_tx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F8F6] hover:bg-[#EEF5F1] border border-[#DFE7E2] text-xs font-semibold text-[#15945A] transition-colors"
                        >
                            View on Polygonscan <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </motion.div>

                {/* ── Dispute history ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="text-lg font-bold text-[#101820] mb-4">Dispute History</h2>

                    {disputes.length === 0 ? (
                        <div className="fw-panel p-10 text-center text-[#64717D]">
                            <Scale className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Not assigned to any disputes yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {disputes.map((row) => {
                                const d = row.disputes;
                                if (!d) return null;
                                const vote      = voteMap.get(row.dispute_id);
                                const cfg       = STATUS_CONFIG[d.status] ?? { bg: "bg-gray-50", text: "text-gray-500", label: d.status };
                                return (
                                    <div key={row.dispute_id} className="fw-panel p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-sm font-semibold text-[#101820] truncate">
                                                    {d.jobs?.title ?? `Dispute #${d.contract_dispute_id}`}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                                                    {cfg.label}
                                                </span>
                                                {vote && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                                                        <CheckCircle2 className="w-3 h-3" /> Voted {vote.decision}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#64717D] truncate">{d.reason}</p>
                                            <p className="text-xs text-[#A0ADB4] mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(row.selected_at).toLocaleDateString()}
                                                {d.jobs?.amount && (
                                                    <span className="ml-2 font-medium text-[#64717D]">
                                                        ${(d.jobs.amount / 1e6).toFixed(2)} USDC
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/disputes/${d.id}`}
                                            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F8F6] hover:bg-[#E7F8EF] border border-[#DFE7E2] text-xs font-semibold text-[#15945A] transition-colors"
                                        >
                                            View <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            <LandingFooter />
        </div>
    );
}
