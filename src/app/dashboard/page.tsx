"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase";
import { formatUSDC, formatAddress } from "@/lib/utils";
import { JOB_STATUS, DISPUTE_STATUS, getJobStatusLabel, getDisputeStatusLabel } from "@/lib/status";
import {
    Briefcase, Scale, DollarSign, CheckCircle2,
    Plus, ArrowRight, Loader2,
    User, ShieldCheck,
} from "lucide-react";

interface Job {
    id: string;
    title: string;
    amount: number;
    status: string;
    client: string;
    freelancer: string | null;
    created_at: string;
}

interface Dispute {
    id: string;
    reason: string;
    status: string;
    outcome: string;
    created_at: string;
    jobs: { title: string } | null;
}

interface Profile {
    display_name: string | null;
    title: string | null;
    role: string | null;
}

const STATUS_COLORS: Record<string, string> = {
    OPEN:                    "bg-emerald-50 text-emerald-700 border-emerald-200",
    WAITING_CLIENT_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
    ACCEPTED:                "bg-blue-50 text-blue-700 border-blue-200",
    SUBMITTED:               "bg-purple-50 text-purple-700 border-purple-200",
    APPROVED:                "bg-[#E9F9F0] text-[#19A463] border-[#1DBF73]/30",
    DISPUTED:                "bg-red-50 text-red-700 border-red-200",
    RESOLVED:                "bg-slate-50 text-slate-600 border-slate-200",
    CANCELLED:               "bg-slate-50 text-slate-500 border-slate-200",
    VOTING:                  "bg-indigo-50 text-indigo-700 border-indigo-200",
    AI_ANALYZED:             "bg-violet-50 text-violet-700 border-violet-200",
};

function StatusBadge({ status, label }: { status: string; label: string }) {
    const cls = STATUS_COLORS[status] ?? "bg-slate-50 text-slate-600 border-slate-200";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
            {label}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string | number; color: string;
}) {
    return (
        <div className="bg-white border border-[#E4E5E7] rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-bold text-[#404145] leading-tight">{value}</p>
                <p className="text-xs text-[#95979D] font-medium mt-0.5">{label}</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { address, isConnected } = useAccount();

    const [profile,         setProfile]         = useState<Profile | null>(null);
    const [clientJobs,      setClientJobs]      = useState<Job[]>([]);
    const [freelancerJobs,  setFreelancerJobs]  = useState<Job[]>([]);
    const [disputes,        setDisputes]        = useState<Dispute[]>([]);
    const [loading,         setLoading]         = useState(true);

    useEffect(() => {
        if (!isConnected || !address) { setLoading(false); return; }
        fetchAll(address.toLowerCase());
    }, [address, isConnected]);

    async function fetchAll(wallet: string) {
        setLoading(true);
        const [profileRes, clientRes, freelancerRes, disputeRes] = await Promise.all([
            supabase.from("profiles").select("display_name, title, role").eq("wallet", wallet).single(),
            supabase.from("jobs").select("id, title, amount, status, client, freelancer, created_at")
                .eq("client", wallet).order("created_at", { ascending: false }).limit(5),
            supabase.from("jobs").select("id, title, amount, status, client, freelancer, created_at")
                .eq("freelancer", wallet).order("created_at", { ascending: false }).limit(5),
            supabase.from("disputes")
                .select("id, reason, status, outcome, created_at, jobs(title)")
                .or(`raised_by.eq.${wallet}`)
                .order("created_at", { ascending: false }).limit(5),
        ]);

        setProfile(profileRes.data ?? null);
        setClientJobs((clientRes.data ?? []) as Job[]);
        setFreelancerJobs((freelancerRes.data ?? []) as Job[]);
        setDisputes((disputeRes.data ?? []) as unknown as Dispute[]);
        setLoading(false);
    }

    // Derived stats
    const totalEarned = freelancerJobs
        .filter(j => j.status === JOB_STATUS.APPROVED)
        .reduce((sum, j) => sum + j.amount, 0);

    const activeAsClient     = clientJobs.filter(j => ![JOB_STATUS.APPROVED, JOB_STATUS.CANCELLED, JOB_STATUS.RESOLVED].includes(j.status as never)).length;
    const activeAsFreelancer = freelancerJobs.filter(j => ![JOB_STATUS.APPROVED, JOB_STATUS.CANCELLED, JOB_STATUS.RESOLVED].includes(j.status as never)).length;
    const openDisputes       = disputes.filter(d => d.status !== DISPUTE_STATUS.RESOLVED).length;

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-surface">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <User className="w-14 h-14 text-[#95979D]" />
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-[#404145] mb-2">Connect your wallet</h2>
                        <p className="text-[#95979D] text-sm">Your personal workspace is tied to your wallet address.</p>
                    </div>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-surface">
                <Navbar />
                <div className="flex items-center justify-center py-40">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1DBF73]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />
            <main className="max-w-5xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <p className="text-xs font-semibold text-[#95979D] uppercase tracking-widest mb-1">Your Workspace</p>
                        <h1 className="text-3xl font-bold text-[#404145]">
                            {profile?.display_name ? `Welcome back, ${profile.display_name}` : `Welcome, ${formatAddress(address!)}`}
                        </h1>
                        {profile?.title && <p className="text-[#62646A] mt-1 text-sm">{profile.title}</p>}
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/jobs/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DBF73] text-white text-sm font-semibold hover:bg-[#19A463] transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Post a Job
                        </Link>
                        <Link
                            href={`/profile/${address}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E5E7] text-[#62646A] text-sm font-semibold hover:border-[#C5C6C9] transition-colors"
                        >
                            <User className="w-4 h-4" /> Profile
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <StatCard icon={Briefcase}     label="Active as Client"     value={activeAsClient}                      color="bg-blue-50 text-blue-600" />
                    <StatCard icon={CheckCircle2}  label="Active as Freelancer" value={activeAsFreelancer}                  color="bg-emerald-50 text-emerald-600" />
                    <StatCard icon={Scale}         label="Open Disputes"        value={openDisputes}                        color="bg-red-50 text-red-500" />
                    <StatCard icon={DollarSign}    label="Total Earned"         value={`$${formatUSDC(BigInt(totalEarned))}`} color="bg-amber-50 text-amber-600" />
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Jobs as Client */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-[#404145] flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#1DBF73]" /> Jobs Posted
                            </h2>
                            <Link href="/jobs" className="text-xs text-[#1DBF73] font-semibold hover:underline flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        {clientJobs.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#E4E5E7] p-8 text-center">
                                <p className="text-sm text-[#95979D] mb-3">No jobs posted yet</p>
                                <Link href="/jobs/create" className="text-xs text-[#1DBF73] font-semibold hover:underline">Post your first job →</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {clientJobs.map((job) => (
                                    <Link key={job.id} href={`/jobs/${job.id}`}
                                        className="block bg-white border border-[#E4E5E7] rounded-xl p-4 hover:border-[#1DBF73]/40 hover:shadow-sm transition-all">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[#404145] truncate">{job.title}</p>
                                                <p className="text-xs text-[#95979D] mt-0.5">${formatUSDC(BigInt(job.amount))} USDC</p>
                                            </div>
                                            <StatusBadge status={job.status} label={getJobStatusLabel(job.status)} />
                                        </div>
                                        {job.freelancer && (
                                            <p className="text-xs text-[#62646A] mt-2 flex items-center gap-1">
                                                <User className="w-3 h-3" /> {formatAddress(job.freelancer)}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Jobs as Freelancer */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-[#404145] flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#1DBF73]" /> Jobs Working On
                            </h2>
                            <Link href="/jobs" className="text-xs text-[#1DBF73] font-semibold hover:underline flex items-center gap-1">
                                Browse jobs <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        {freelancerJobs.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#E4E5E7] p-8 text-center">
                                <p className="text-sm text-[#95979D] mb-3">No active jobs as freelancer</p>
                                <Link href="/jobs" className="text-xs text-[#1DBF73] font-semibold hover:underline">Browse open jobs →</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {freelancerJobs.map((job) => (
                                    <Link key={job.id} href={`/jobs/${job.id}`}
                                        className="block bg-white border border-[#E4E5E7] rounded-xl p-4 hover:border-[#1DBF73]/40 hover:shadow-sm transition-all">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[#404145] truncate">{job.title}</p>
                                                <p className="text-xs text-[#95979D] mt-0.5">${formatUSDC(BigInt(job.amount))} USDC · Client: {formatAddress(job.client)}</p>
                                            </div>
                                            <StatusBadge status={job.status} label={getJobStatusLabel(job.status)} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Disputes */}
                    <section className="md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-[#404145] flex items-center gap-2">
                                <Scale className="w-4 h-4 text-red-500" /> Disputes
                            </h2>
                            <Link href="/disputes" className="text-xs text-[#1DBF73] font-semibold hover:underline flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        {disputes.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#E4E5E7] p-8 text-center">
                                <ShieldCheck className="w-8 h-8 text-[#1DBF73] mx-auto mb-2" />
                                <p className="text-sm text-[#95979D]">No disputes — great track record!</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {disputes.map((dispute) => (
                                    <Link key={dispute.id} href={`/disputes/${dispute.id}`}
                                        className="block bg-white border border-[#E4E5E7] rounded-xl p-4 hover:border-red-300 hover:shadow-sm transition-all">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <p className="text-sm font-semibold text-[#404145] truncate flex-1">
                                                {dispute.jobs?.title ?? "Unknown Job"}
                                            </p>
                                            <StatusBadge status={dispute.status} label={getDisputeStatusLabel(dispute.status)} />
                                        </div>
                                        <p className="text-xs text-[#62646A] truncate">{dispute.reason}</p>
                                        {dispute.status === DISPUTE_STATUS.RESOLVED && dispute.outcome && (
                                            <p className={`text-xs font-semibold mt-2 ${dispute.outcome === "CLIENT_WINS" ? "text-blue-600" : "text-purple-600"}`}>
                                                {dispute.outcome === "CLIENT_WINS" ? "Client won" : "Freelancer won"}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                </div>

                {/* Quick Actions */}
                <div className="mt-10 pt-8 border-t border-[#E4E5E7]">
                    <p className="text-xs font-semibold text-[#95979D] uppercase tracking-widest mb-4">Quick Actions</p>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/jobs/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E5E7] text-sm text-[#62646A] font-medium hover:border-[#1DBF73]/40 hover:text-[#1DBF73] transition-colors">
                            <Plus className="w-4 h-4" /> Post a Job
                        </Link>
                        <Link href="/jobs" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E5E7] text-sm text-[#62646A] font-medium hover:border-[#1DBF73]/40 hover:text-[#1DBF73] transition-colors">
                            <Briefcase className="w-4 h-4" /> Browse Jobs
                        </Link>
                        <Link href="/disputes" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E5E7] text-sm text-[#62646A] font-medium hover:border-red-300 hover:text-red-500 transition-colors">
                            <Scale className="w-4 h-4" /> All Disputes
                        </Link>
                        <Link href="/jurors/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E5E7] text-sm text-[#62646A] font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                            <ShieldCheck className="w-4 h-4" /> Become a Juror
                        </Link>
                        <Link href={`/profile/${address}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E5E7] text-sm text-[#62646A] font-medium hover:border-[#1DBF73]/40 hover:text-[#1DBF73] transition-colors">
                            <User className="w-4 h-4" /> View Profile
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}
