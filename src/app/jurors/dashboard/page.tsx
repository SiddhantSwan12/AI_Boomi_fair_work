"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";
import WalletButton from "@/components/layout/WalletButton";
import { supabase } from "@/lib/supabase";
import { formatAddress } from "@/lib/utils";
import {
    ShieldCheck, Bell, Scale, CheckCircle2, Clock,
    ArrowRight, ExternalLink, AlertTriangle, Award,
    ThumbsUp, ThumbsDown, User,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type JurorProfile = {
    wallet: string;
    display_name: string;
    expertise: string[];
    bio: string | null;
    experience_level: string | null;
    credential_root: string;
    anchor_tx: string;
    anchored_at: string | null;
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
        resolved_at: string | null;
        jobs: { title: string; amount: number; client: string; freelancer: string } | null;
    } | null;
};

type Vote = {
    dispute_id: string;
    decision: string;
    voted_at: string;
};

const STATUS_LABEL: Record<string, { label: string; bg: string; text: string }> = {
    OPEN:        { label: "Open",        bg: "bg-amber-50",  text: "text-amber-600"  },
    AI_ANALYZED: { label: "AI Analyzed", bg: "bg-purple-50", text: "text-purple-600" },
    VOTING:      { label: "Voting",      bg: "bg-blue-50",   text: "text-blue-600"   },
    RESOLVED:    { label: "Resolved",    bg: "bg-[#E9F9F0]", text: "text-[#19A463]"  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-6 max-w-4xl mx-auto px-6 py-12">
            <div className="h-8 bg-[#EEF5F1] rounded-lg w-1/3" />
            <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-[#EEF5F1] rounded-xl" />)}
            </div>
            {[1,2,3].map(i => <div key={i} className="h-20 bg-[#EEF5F1] rounded-xl" />)}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JurorDashboard() {
    const { address, isConnected } = useAccount();

    const [profile, setProfile]       = useState<JurorProfile | null>(null);
    const [disputes, setDisputes]     = useState<AssignedDispute[]>([]);
    const [votes, setVotes]           = useState<Vote[]>([]);
    const [loading, setLoading]       = useState(true);
    const [notJuror, setNotJuror]     = useState(false);

    useEffect(() => {
        if (!isConnected || !address) { setLoading(false); return; }
        fetchDashboard(address.toLowerCase());
    }, [address, isConnected]);

    async function fetchDashboard(wallet: string) {
        setLoading(true);

        const [profileRes, disputesRes, votesRes] = await Promise.all([
            supabase.from("juror_profiles").select("*").eq("wallet", wallet).single(),
            supabase
                .from("jurors")
                .select(`dispute_id, selected_at, disputes(id, contract_dispute_id, reason, status, outcome, created_at, resolved_at, jobs(title, amount, client, freelancer))`)
                .eq("juror_address", wallet)
                .order("selected_at", { ascending: false }),
            supabase.from("votes").select("dispute_id, decision, voted_at").eq("juror", wallet),
        ]);

        if (!profileRes.data) {
            setNotJuror(true);
        } else {
            setProfile(profileRes.data);
            setDisputes((disputesRes.data as unknown as AssignedDispute[]) ?? []);
            setVotes((votesRes.data as Vote[]) ?? []);
        }
        setLoading(false);
    }

    // ── Derived state ──────────────────────────────────────────────────────────
    const voteMap       = new Map(votes.map(v => [v.dispute_id, v]));
    const pending       = disputes.filter(d => d.disputes?.status === "VOTING" && !voteMap.has(d.dispute_id));
    const voted         = disputes.filter(d => voteMap.has(d.dispute_id));
    const resolved      = disputes.filter(d => d.disputes?.status === "RESOLVED");
    const other         = disputes.filter(d => d.disputes?.status !== "VOTING" && d.disputes?.status !== "RESOLVED" && !voteMap.has(d.dispute_id));

    // ── Not connected ──────────────────────────────────────────────────────────
    if (!isConnected) return (
        <div className="fw-product-shell">
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-[#E7F8EF] flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-[#1DBF73]" />
                </div>
                <h2 className="text-2xl font-bold text-[#101820]">Connect your wallet</h2>
                <p className="text-[#64717D] max-w-xs">Connect the wallet you registered as a juror to access your dashboard.</p>
                <WalletButton />
            </div>
            <LandingFooter />
        </div>
    );

    if (loading) return <div className="fw-product-shell"><Navbar /><DashboardSkeleton /></div>;

    // ── Not a juror ────────────────────────────────────────────────────────────
    if (notJuror) return (
        <div className="fw-product-shell">
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#101820]">Not registered as a juror</h2>
                <p className="text-[#64717D] max-w-sm">
                    The wallet <span className="font-mono font-semibold text-[#101820]">{formatAddress(address!)}</span> has no verified juror profile.
                </p>
                <Link
                    href="/jurors/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DBF73] hover:bg-[#15945A] text-white text-sm font-bold rounded-lg transition-colors"
                >
                    <ShieldCheck className="w-4 h-4" /> Become a Juror
                </Link>
            </div>
            <LandingFooter />
        </div>
    );

    return (
        <div className="fw-product-shell fw-unified-page">
            <Navbar />

            {/* ── Header ── */}
            <div className="border-b border-[#DFE7E2] bg-white">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center justify-between flex-wrap gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#15945A] flex items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-lg font-black text-white">
                                    {profile!.display_name.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold text-[#101820]">{profile!.display_name}</h1>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F8EF] text-[#15945A] text-[11px] font-bold border border-[#CFE9DA]">
                                        <ShieldCheck className="w-3 h-3" /> Verified Juror
                                    </span>
                                </div>
                                <p className="text-sm text-[#64717D] font-mono">{formatAddress(address!)}</p>
                            </div>
                        </div>

                        <Link
                            href={`/jurors/${address}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DFE7E2] bg-white hover:bg-[#F5F8F6] text-sm font-semibold text-[#64717D] transition-colors"
                        >
                            <User className="w-4 h-4" /> Public Profile
                        </Link>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

                {/* ── Pending vote notification banner ── */}
                {pending.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex items-start gap-4 p-5 rounded-xl bg-amber-50 border border-amber-200"
                    >
                        <Bell className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
                        <div className="flex-1">
                            <p className="font-bold text-amber-800 text-sm">
                                {pending.length === 1
                                    ? "You have 1 dispute awaiting your vote"
                                    : `You have ${pending.length} disputes awaiting your vote`}
                            </p>
                            <p className="text-amber-700 text-xs mt-0.5">
                                Cast your vote to help resolve these disputes fairly.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ── Stats ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    {[
                        { label: "Assigned",      value: disputes.length, icon: Scale,        color: "text-[#1DBF73]", bg: "bg-[#E7F8EF]" },
                        { label: "Needs Vote",    value: pending.length,  icon: Bell,         color: "text-amber-500", bg: "bg-amber-50"  },
                        { label: "Votes Cast",    value: voted.length,    icon: CheckCircle2, color: "text-blue-500",  bg: "bg-blue-50"   },
                        { label: "Resolved",      value: resolved.length, icon: Award,        color: "text-purple-500",bg: "bg-purple-50" },
                    ].map(stat => (
                        <div key={stat.label} className="fw-panel p-5 text-center">
                            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="text-2xl font-black text-[#101820]">{stat.value}</div>
                            <div className="text-xs text-[#64717D] font-medium mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* ── Needs vote ── */}
                {pending.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                    >
                        <h2 className="text-base font-bold text-[#101820] mb-3 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-amber-500" />
                            Awaiting Your Vote
                        </h2>
                        <div className="space-y-3">
                            {pending.map(row => (
                                <DisputeCard key={row.dispute_id} row={row} vote={undefined} actionLabel="Vote Now" actionStyle="primary" />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Other (assigned but not in voting phase yet) ── */}
                {other.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <h2 className="text-base font-bold text-[#101820] mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#64717D]" />
                            Assigned — Pending Voting Phase
                        </h2>
                        <div className="space-y-3">
                            {other.map(row => (
                                <DisputeCard key={row.dispute_id} row={row} vote={undefined} actionLabel="View" actionStyle="ghost" />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Voted ── */}
                {voted.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                    >
                        <h2 className="text-base font-bold text-[#101820] mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            Voted
                        </h2>
                        <div className="space-y-3">
                            {voted.map(row => (
                                <DisputeCard key={row.dispute_id} row={row} vote={voteMap.get(row.dispute_id)} actionLabel="View" actionStyle="ghost" />
                            ))}
                        </div>
                    </motion.div>
                )}

                {disputes.length === 0 && (
                    <div className="fw-panel p-14 text-center">
                        <Scale className="w-10 h-10 mx-auto mb-4 text-[#DFE7E2]" />
                        <p className="text-[#64717D] font-medium">No disputes assigned yet.</p>
                        <p className="text-sm text-[#A0ADB4] mt-1">You&apos;ll be notified here when selected for a dispute.</p>
                    </div>
                )}

                {/* ── Credential ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="fw-panel p-5 flex items-center justify-between flex-wrap gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#E7F8EF] flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-[#1DBF73]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#101820]">Credential Anchor</p>
                            <p className="text-xs text-[#64717D] font-mono">{profile!.credential_root.slice(0, 26)}…</p>
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
                </motion.div>
            </div>

            <LandingFooter />
        </div>
    );
}

// ─── Dispute card ─────────────────────────────────────────────────────────────

function DisputeCard({
    row, vote, actionLabel, actionStyle,
}: {
    row: AssignedDispute;
    vote: Vote | undefined;
    actionLabel: string;
    actionStyle: "primary" | "ghost";
}) {
    const d = row.disputes;
    if (!d) return null;

    const cfg = STATUS_LABEL[d.status] ?? { label: d.status, bg: "bg-gray-50", text: "text-gray-500" };

    return (
        <div className="fw-panel p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-[#101820] truncate">
                        {d.jobs?.title ?? `Dispute #${d.contract_dispute_id}`}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                    </span>
                    {vote && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            vote.decision === "CLIENT" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                        }`}>
                            {vote.decision === "CLIENT"
                                ? <ThumbsUp className="w-3 h-3" />
                                : <ThumbsDown className="w-3 h-3" />
                            }
                            Voted {vote.decision === "CLIENT" ? "Client" : "Freelancer"}
                        </span>
                    )}
                </div>
                <p className="text-xs text-[#64717D] truncate">{d.reason}</p>
                <p className="text-xs text-[#A0ADB4] mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Assigned {new Date(row.selected_at).toLocaleDateString()}
                    {d.jobs?.amount && (
                        <span className="font-medium text-[#64717D]">
                            · ${(d.jobs.amount / 1e6).toFixed(2)} USDC
                        </span>
                    )}
                </p>
            </div>
            <Link
                href={`/disputes/${d.id}`}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                    actionStyle === "primary"
                        ? "bg-[#1DBF73] hover:bg-[#15945A] text-white"
                        : "bg-[#F5F8F6] hover:bg-[#EEF5F1] border border-[#DFE7E2] text-[#15945A]"
                }`}
            >
                {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}
