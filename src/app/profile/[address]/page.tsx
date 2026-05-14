"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import { getJobStatusLabel } from "@/lib/status";
import Navbar from "@/components/layout/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Image from "next/image";
import {
    Star, Globe, Twitter, Github, Edit3, Briefcase,
    Award, MapPin, Calendar, ExternalLink, CheckCircle2,
    Zap, Shield, Activity,
} from "lucide-react";
import { useGSAP } from "@/hooks/useGSAP";

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
    wallet: string;
    display_name: string | null;
    bio: string | null;
    title: string | null;
    skills: string[];
    avatar_url: string | null;
    website: string | null;
    twitter: string | null;
    github: string | null;
    location: string | null;
    role: string | null;
    experience_level: string | null;
    hourly_rate: number | null;
    total_jobs_completed: number;
    total_earned: number;
    avg_rating: number;
    created_at: string;
};

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    reviewer: string;
    reviewer_role: string;
    created_at: string;
};

type Job = {
    id: string;
    title: string;
    amount: number;
    status: string;
    created_at: string;
};

// ─── Activity Grid ────────────────────────────────────────────────────────────

const WEEKS = 52;
const DAYS = 7;
const DAY_MS = 86400000;

function buildActivityGrid(dates: string[]) {
    const countMap: Record<string, number> = {};
    dates.forEach((d) => { const key = d.slice(0, 10); countMap[key] = (countMap[key] || 0) + 1; });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startOffset = (today.getDay() + 1) % 7;
    const gridStart = new Date(today.getTime() - (WEEKS * DAYS - 1 + startOffset) * DAY_MS);
    const grid: { date: string; count: number }[][] = [];
    for (let w = 0; w < WEEKS; w++) {
        const week: { date: string; count: number }[] = [];
        for (let d = 0; d < DAYS; d++) {
            const cell = new Date(gridStart.getTime() + (w * DAYS + d) * DAY_MS);
            const key = cell.toISOString().slice(0, 10);
            week.push({ date: key, count: countMap[key] || 0 });
        }
        grid.push(week);
    }
    return grid;
}

function getCellBg(count: number) {
    if (count === 0) return "#EEF5F1";
    if (count === 1) return "rgba(21,148,90,0.35)";
    if (count === 2) return "rgba(21,148,90,0.58)";
    if (count === 3) return "rgba(21,148,90,0.78)";
    return "#15945A";
}

function getMonthLabels(grid: { date: string; count: number }[][]) {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = "";
    grid.forEach((week, wi) => {
        const month = new Date(week[0].date).toLocaleString("default", { month: "short" });
        if (month !== lastMonth) { labels.push({ label: month, weekIndex: wi }); lastMonth = month; }
    });
    return labels;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="border-b border-[#DFE7E2] bg-white pb-8">
                <div className="h-40 bg-[#E7F8EF]" />
                <div className="max-w-5xl mx-auto px-6 pt-4 pb-8">
                    <div className="flex items-end gap-6 mb-10">
                        <div className="w-[100px] h-[100px] rounded-full bg-[#D7E6DE] shrink-0 -mt-16 border-[4px] border-white" />
                        <div className="flex-1 space-y-3 pb-2">
                            <div className="h-8 w-64 rounded-xl bg-[#D7E6DE]" />
                            <div className="h-5 w-40 rounded-lg bg-[#E7EEE9]" />
                            <div className="flex gap-3">
                                <div className="h-6 w-24 rounded-full bg-[#E7F8EF]" />
                                <div className="h-6 w-20 rounded-full bg-[#E7EEE9]" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-2xl bg-[#F3F7F4] border border-[#DFE7E2]" />
                        ))}
                    </div>
                </div>
            </div>
            <div className="max-w-5xl mx-auto px-6 py-12 grid lg:grid-cols-[320px_1fr] gap-8">
                <div className="space-y-6">
                    <div className="h-48 rounded-2xl bg-white border border-[#DFE7E2]" />
                    <div className="h-40 rounded-2xl bg-white border border-[#DFE7E2]" />
                </div>
                <div className="space-y-6">
                    <div className="h-64 rounded-2xl bg-white border border-[#DFE7E2]" />
                    <div className="h-64 rounded-2xl bg-white border border-[#DFE7E2]" />
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5"
                    style={{ fill: i <= rating ? "#f59e0b" : "transparent", color: i <= rating ? "#f59e0b" : "#D8E2DC" }} />
            ))}
        </div>
    );
}

type StatVariant = "green" | "amber" | "indigo" | "teal" | "purple" | "rose" | "dark";
const STAT_STYLES: Record<StatVariant, { bg: string; border: string; value: string; label: string; shadow: string }> = {
    dark: { bg: "#FFFFFF", border: "#DFE7E2", value: "#101820", label: "#64717D", shadow: "0 16px 44px rgba(16,24,32,0.06)" },
    green: { bg: "#F0FBF5", border: "rgba(21,148,90,0.22)", value: "#15945A", label: "#34795A", shadow: "0 16px 44px rgba(21,148,90,0.08)" },
    amber: { bg: "#FFF8EA", border: "rgba(245,158,11,0.24)", value: "#B46B04", label: "#8A620F", shadow: "0 16px 44px rgba(245,158,11,0.08)" },
    indigo: { bg: "#EFFBFD", border: "rgba(6,151,181,0.2)", value: "#087C94", label: "#3E7280", shadow: "0 16px 44px rgba(6,151,181,0.08)" },
    teal: { bg: "#EFFBFD", border: "rgba(6,151,181,0.2)", value: "#087C94", label: "#3E7280", shadow: "0 16px 44px rgba(6,151,181,0.08)" },
    purple: { bg: "#F0FBF5", border: "rgba(21,148,90,0.2)", value: "#15945A", label: "#34795A", shadow: "0 16px 44px rgba(21,148,90,0.08)" },
    rose: { bg: "#FFF2F2", border: "rgba(220,38,38,0.18)", value: "#B42318", label: "#8C4B45", shadow: "0 16px 44px rgba(220,38,38,0.06)" },
};

function StatCard({ value, label, variant = "dark" }: { value: string; label: string; variant?: StatVariant }) {
    const s = STAT_STYLES[variant];
    return (
        <div
            className="text-center px-4 py-6 rounded-2xl transition-transform duration-300 hover:-translate-y-1 group"
            style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: s.shadow }}
        >
            <div className="text-[32px] font-black mb-1 transition-all" style={{ color: s.value, lineHeight: 1 }}>
                {value}
            </div>
            <div className="text-[11px] font-bold uppercase mt-3" style={{ color: s.label, letterSpacing: 0 }}>
                {label}
            </div>
        </div>
    );
}

const JOB_STATUS: Record<string, { label: string; bg: string; color: string; border: string }> = {
    OPEN: { label: getJobStatusLabel("OPEN"), bg: "rgba(29,191,115,0.1)", color: "#1DBF73", border: "rgba(29,191,115,0.2)" },
    WAITING_CLIENT_APPROVAL: { label: getJobStatusLabel("WAITING_CLIENT_APPROVAL"), bg: "rgba(99,102,241,0.1)", color: "#818cf8", border: "rgba(99,102,241,0.2)" },
    ACCEPTED: { label: getJobStatusLabel("ACCEPTED"), bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.2)" },
    SUBMITTED: { label: getJobStatusLabel("SUBMITTED"), bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.2)" },
    APPROVED: { label: getJobStatusLabel("APPROVED"), bg: "rgba(29,191,115,0.1)", color: "#1DBF73", border: "rgba(29,191,115,0.2)" },
    DISPUTED: { label: getJobStatusLabel("DISPUTED"), bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.2)" },
    RESOLVED: { label: getJobStatusLabel("RESOLVED"), bg: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "rgba(139,92,246,0.2)" },
    CANCELLED: { label: getJobStatusLabel("CANCELLED"), bg: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "rgba(148,163,184,0.2)" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "about" | "activity" | "jobs" | "reviews";

export default function ProfilePage() {
    const { address: walletAddress } = useParams<{ address: string }>();
    const { address: myAddress } = useAccount();
    const isOwn = myAddress?.toLowerCase() === walletAddress?.toLowerCase();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [activityDates, setActivityDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("about");
    const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

    const avatarRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!walletAddress) return;
        const addr = typeof walletAddress === 'string' ? walletAddress.toLowerCase() : '';
        Promise.all([
            supabase.from("profiles").select("*").eq("wallet", addr).maybeSingle(),
            supabase.from("reviews").select("*").eq("reviewee", addr).order("created_at", { ascending: false }).limit(20),
            supabase.from("jobs").select("id,title,amount,status,created_at")
                .or(`client.eq.${addr},freelancer.eq.${addr}`)
                .neq("status", "CANCELLED")
                .order("created_at", { ascending: false })
                .limit(8),
        ]).then(([p, r, j]) => {
            setProfile(p.data as Profile | null);
            setReviews((r.data as Review[]) || []);
            const allJobs = (j.data as Job[]) || [];
            setJobs(allJobs);
            setActivityDates(allJobs.map((jb) => jb.created_at));
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching profile stats:", err);
            setLoading(false);
        });
    }, [walletAddress]);

    // ── GSAP ──────────────────────────────────────────────────────────────────
    useGSAP((gsap) => {
        if (loading) return;
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (avatarRef.current)
            tl.from(avatarRef.current, { scale: 0.7, opacity: 0, duration: 0.8, ease: "back.out(1.5)" });
        if (nameRef.current)
            tl.from(nameRef.current.children, { y: 30, opacity: 0, stagger: 0.1, duration: 0.8 }, "-=0.6");
        if (statsRef.current)
            tl.from(statsRef.current.children, { y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: "back.out(1.2)" }, "-=0.5");

        if (sidebarRef.current)
            gsap.from(sidebarRef.current.children, { x: -40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: sidebarRef.current, start: "top 85%" } });
        if (mainRef.current)
            gsap.from(mainRef.current.children, { y: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: mainRef.current, start: "top 85%" } });

        if (gridRef.current) {
            const cells = gridRef.current.querySelectorAll(".hcell");
            gsap.from(cells, { opacity: 0, scale: 0, stagger: { amount: 1.5, from: "start" }, ease: "power2.out", duration: 0.4, scrollTrigger: { trigger: gridRef.current, start: "top 85%" } });
        }
    }, [loading]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const parsedAddress = typeof walletAddress === 'string' ? walletAddress : '';
    const initials = profile?.display_name ? profile.display_name.slice(0, 2).toUpperCase() : parsedAddress?.slice(2, 4).toUpperCase() ?? "??";
    const shortAddr = parsedAddress ? `${parsedAddress.slice(0, 6)}…${parsedAddress.slice(-4)}` : "";
    const displayName = profile?.display_name || shortAddr;
    const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";
    const grid = buildActivityGrid(activityDates);
    const monthLabels = getMonthLabels(grid);
    const totalActivity = activityDates.length;

    // Streak & activity stats
    const flatCells = grid.flat();
    const activeDays = flatCells.filter((c) => c.count > 0).length;
    const busiestCell = [...flatCells].sort((a, b) => b.count - a.count)[0];
    // current streak
    let currentStreak = 0;
    for (let i = flatCells.length - 1; i >= 0; i--) {
        if (flatCells[i].count > 0) currentStreak++;
        else if (currentStreak > 0) break;
    }
    // longest streak
    let longestStreak = 0, tempStreak = 0;
    flatCells.forEach((c) => {
        if (c.count > 0) { tempStreak++; longestStreak = Math.max(longestStreak, tempStreak); }
        else tempStreak = 0;
    });
    const roleLabel = profile?.role === "client" ? "Client" : profile?.role === "both" ? "Client & Freelancer" : "Freelancer";
    const expLabel = profile?.experience_level
        ? profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)
        : null;

    const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: "about", label: "Overview", icon: <Shield className="w-4 h-4" /> },
        { id: "activity", label: "Activity", icon: <Activity className="w-4 h-4" />, count: totalActivity },
        { id: "jobs", label: "Jobs", icon: <Briefcase className="w-4 h-4" />, count: jobs.length },
        { id: "reviews", label: "Reviews", icon: <Award className="w-4 h-4" />, count: reviews.length },
    ];

    if (loading) {
        return (
            <div className="fw-product-shell fw-profile-page relative z-10">
                <Navbar />
                <ProfileSkeleton />
            </div>
        );
    }

    return (
        <div className="fw-product-shell fw-profile-page relative z-10">
            <Navbar />

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="relative border-b border-[#DFE7E2] bg-white/90 backdrop-blur-xl">
                <div
                    className="relative h-44 sm:h-56 overflow-hidden w-full"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#F5FBF7_0%,#E7F8EF_48%,#DDF4F6_100%)]" />
                    <div className="absolute left-[10%] top-8 h-28 w-28 rounded-full bg-[#15945A]/15 blur-3xl" />
                    <div className="absolute right-[12%] bottom-4 h-32 w-32 rounded-full bg-[#0697B5]/14 blur-3xl" />
                    <div className="absolute inset-0 opacity-[0.25]" style={{ backgroundImage: "linear-gradient(rgba(21,148,90,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(21,148,90,0.12) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/75 to-transparent" />
                </div>

                <div className="max-w-[1600px] mx-auto px-6 pt-4 pb-12">
                    <div className="relative">

                        {/* Avatar + name row */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-wrap mb-12">
                            {/* Avatar */}
                            <div ref={avatarRef} className="relative shrink-0 -mt-24 md:-mt-32">
                                {profile?.avatar_url ? (
                                    <Image src={profile.avatar_url} width={160} height={160} alt={displayName}
                                        className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full object-cover shadow-[0_24px_70px_rgba(16,24,32,0.16)]"
                                        style={{ border: "6px solid #FFFFFF" }}
                                    />
                                ) : (
                                    <div
                                        className="fw-avatar-initials w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full flex items-center justify-center text-5xl font-black text-white shadow-[0_24px_70px_rgba(16,24,32,0.16)]"
                                        style={{ background: "linear-gradient(135deg, #15945A, #0F766E)", border: "6px solid #FFFFFF" }}
                                    >
                                        {initials}
                                    </div>
                                )}
                                {/* Online indicator */}
                                <div
                                    className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-5 h-5 md:w-6 md:h-6 rounded-full"
                                    style={{ background: "#15945A", border: "4px solid #FFFFFF", boxShadow: "0 8px 20px rgba(21,148,90,0.3)" }}
                                />
                            </div>

                            {/* Name + meta */}
                            <div ref={nameRef} className="flex-1 min-w-[300px] text-center md:text-left">
                                {/* Name row */}
                                <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap mb-3">
                                    <h1
                                        className="font-extrabold text-[#101820]"
                                        style={{ fontSize: "clamp(2rem,4vw,3.5rem)", lineHeight: 1.1 }}
                                    >
                                        {displayName}
                                    </h1>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-[#1DBF73]/20"
                                            style={{ background: "rgba(29,191,115,0.1)", color: "#1DBF73", boxShadow: "0 0 10px rgba(29,191,115,0.1) inset" }}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                        </span>

                                        {isOwn && (
                                            <Link href="/profile/edit"
                                                className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase transition-all duration-300 rounded border border-[#DFE7E2] bg-white text-[#24313D] hover:border-[#15945A]/30 hover:text-[#15945A]"
                                                style={{ letterSpacing: 0 }}
                                            >
                                                <Edit3 className="w-3 h-3" /> Edit
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                {profile?.title && (
                                    <p className="text-xl md:text-2xl font-medium mb-4" style={{ color: "#15945A" }}>
                                        {profile.title}
                                    </p>
                                )}

                                {/* Meta row */}
                                <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap mb-5">
                                    {profile?.location && (
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#64717D]">
                                            <MapPin className="w-4 h-4" />{profile.location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-[#64717D]">
                                        <Calendar className="w-4 h-4" />Since {memberSince}
                                    </span>
                                    {expLabel && (
                                        <span
                                            className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded border border-white/10"
                                            style={{ background: "#F3F7F4", color: "#24313D" }}
                                        >
                                            {expLabel}
                                        </span>
                                    )}
                                    <span
                                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded border border-white/10"
                                        style={{ background: "#F3F7F4", color: "#24313D" }}
                                    >
                                        <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                                        {roleLabel}
                                    </span>
                                </div>

                                {/* Social links */}
                                <div className="flex items-center justify-center md:justify-start gap-6 flex-wrap">
                                    {profile?.github && (
                                        <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener"
                                            className="flex items-center gap-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                                            style={{ color: "#64717D" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "#15945A")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "#64717D")}
                                        >
                                            <Github className="w-4 h-4" />{profile.github}
                                        </a>
                                    )}
                                    {profile?.twitter && (
                                        <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener"
                                            className="flex items-center gap-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                                            style={{ color: "#64717D" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "#15945A")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "#64717D")}
                                        >
                                            <Twitter className="w-4 h-4" />@{profile.twitter}
                                        </a>
                                    )}
                                    {profile?.website && (
                                        <a href={profile.website} target="_blank" rel="noopener"
                                            className="flex items-center gap-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                                            style={{ color: "#64717D" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "#15945A")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "#64717D")}
                                        >
                                            <Globe className="w-4 h-4" />Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats glass row */}
                        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
                            <StatCard value={String(profile?.total_jobs_completed ?? 0)} label="Jobs Done" variant="dark" />
                            <StatCard value={profile?.avg_rating ? `${profile.avg_rating.toFixed(1)} ★` : "—"} label="Avg Rating" variant="amber" />
                            <StatCard value={String(reviews.length)} label="Reviews" variant="indigo" />
                            {profile?.hourly_rate
                                ? <StatCard value={`$${profile.hourly_rate}/hr`} label="Hourly Rate" variant="teal" />
                                : <StatCard value={String(totalActivity)} label="Activity" variant="teal" />
                            }
                        </div>
                    </div>{/* end relative */}
                </div>{/* end max-w-[1600px] content */}

                {/* ── Tab Bar ─────────────────────────────────────────────── */}
                <div className="max-w-[1600px] mx-auto px-6 mt-4">
                    <div className="inline-flex gap-2 rounded-2xl border border-[#DFE7E2] bg-[#F8FBF9] p-1.5 flex-wrap">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="relative flex items-center gap-2 rounded-xl px-5 py-3 text-[13px] font-bold uppercase transition-all duration-300"
                                style={
                                    activeTab === tab.id
                                        ? { color: "#0F5132", background: "#FFFFFF", boxShadow: "0 10px 24px rgba(16,24,32,0.08)", letterSpacing: 0 }
                                        : { color: "#64717D", letterSpacing: 0 }
                                }
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span
                                        className="text-[10px] font-black px-2 py-0.5 rounded ml-1"
                                        style={
                                            activeTab === tab.id
                                                ? { background: "rgba(21,148,90,0.12)", color: "#15945A" }
                                                : { background: "#EEF5F1", color: "#64717D" }
                                        }
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ───────────────────────────────────────────────── */}
            <div className="max-w-[1600px] mx-auto px-6 py-12 pb-32">

                {/* ABOUT tab */}
                {activeTab === "about" && (
                    <div className="grid xl:grid-cols-[380px_1fr] gap-8 items-start">
                        <aside ref={sidebarRef} className="flex flex-col gap-5">
                            <div className="rounded-[24px] border border-[#DFE7E2] bg-white p-7 shadow-[0_18px_55px_rgba(16,24,32,0.07)]">
                                <div className="flex items-center justify-between gap-4 border-b border-[#E7EEE9] pb-5">
                                    <div>
                                        <p className="text-[12px] font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>Profile score</p>
                                        <p className="mt-1 text-sm text-[#64717D]">Marketplace-ready trust signals</p>
                                    </div>
                                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#E7F8EF] text-2xl font-black text-[#15945A]">
                                        {Math.min(100, 52 + (profile?.bio ? 12 : 0) + ((profile?.skills?.length ?? 0) > 0 ? 12 : 0) + (reviews.length > 0 ? 12 : 0) + (jobs.length > 0 ? 12 : 0))}
                                    </div>
                                </div>
                                <div className="mt-5 grid gap-3">
                                    {[
                                        { label: "Wallet verified", ok: true },
                                        { label: "Escrow history", ok: jobs.length > 0 },
                                        { label: "Client feedback", ok: reviews.length > 0 },
                                        { label: "Skills listed", ok: (profile?.skills?.length ?? 0) > 0 },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#E7EEE9] bg-[#F8FBF9] px-4 py-3">
                                            <span className="text-sm font-semibold text-[#24313D]">{item.label}</span>
                                            <CheckCircle2 className={`h-4 w-4 ${item.ok ? "text-[#15945A]" : "text-[#B6C3BB]"}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-[#DFE7E2] bg-white p-7 shadow-[0_18px_55px_rgba(16,24,32,0.06)]">
                                <p className="text-[12px] font-bold uppercase text-[#64717D]" style={{ letterSpacing: 0 }}>About</p>
                                <p className="mt-4 text-[15px] leading-7 text-[#24313D]">
                                    {profile?.bio || "This profile is still being shaped. Add a clear intro, services, and proof of work to make clients confident before they open a conversation."}
                                </p>
                            </div>

                            {(profile?.skills ?? []).length > 0 && (
                                <div className="rounded-[24px] border border-[#DFE7E2] bg-white p-7 shadow-[0_18px_55px_rgba(16,24,32,0.06)]">
                                    <p className="text-[12px] font-bold uppercase text-[#64717D]" style={{ letterSpacing: 0 }}>Core skills</p>
                                    <div className="mt-4 flex flex-wrap gap-2.5">
                                        {profile!.skills.map((skill) => (
                                            <span key={skill} className="rounded-full border border-[#CFE9DA] bg-[#F0FBF5] px-3.5 py-2 text-sm font-semibold text-[#0F5132]">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-[24px] border border-[#DFE7E2] bg-[#101820] p-7 text-white shadow-[0_24px_70px_rgba(16,24,32,0.18)]">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                                        <Shield className="h-5 w-5 text-[#7FE0B0]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">On-chain identity</p>
                                        <p className="text-xs text-white/50">Transparent wallet proof</p>
                                    </div>
                                </div>
                                <p className="mt-5 break-all rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-xs leading-6 text-white/75">{parsedAddress}</p>
                                <a
                                    href={`https://polygonscan.com/address/${parsedAddress}`}
                                    target="_blank" rel="noopener"
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#7FE0B0] transition-transform hover:-translate-y-0.5"
                                >
                                    View on Polygonscan <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </aside>

                        <div ref={mainRef} className="flex flex-col gap-6">
                            <section className="overflow-hidden rounded-[28px] border border-[#DFE7E2] bg-white shadow-[0_24px_80px_rgba(16,24,32,0.08)]">
                                <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
                                    <div className="p-8 md:p-10">
                                        <p className="text-[12px] font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>Freelance marketplace profile</p>
                                        <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[#101820] md:text-4xl">
                                            Built for high-trust work, fast hiring, and escrow-backed delivery.
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-base leading-8 text-[#64717D]">
                                            {displayName} combines marketplace reputation with wallet transparency, giving clients a clean view of work history, feedback, and on-chain activity before they commit.
                                        </p>
                                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                            {[
                                                { label: "Rating", value: profile?.avg_rating ? profile.avg_rating.toFixed(1) : "New", tone: "text-[#B46B04]" },
                                                { label: "Completed", value: String(profile?.total_jobs_completed ?? 0), tone: "text-[#15945A]" },
                                                { label: "Reviews", value: String(reviews.length), tone: "text-[#087C94]" },
                                            ].map((item) => (
                                                <div key={item.label} className="rounded-2xl border border-[#E7EEE9] bg-[#F8FBF9] p-5">
                                                    <p className={`text-3xl font-black ${item.tone}`}>{item.value}</p>
                                                    <p className="mt-1 text-sm font-semibold text-[#64717D]">{item.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative min-h-[260px] border-t border-[#E7EEE9] bg-[#EAF6F7] p-8 lg:border-l lg:border-t-0">
                                        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(6,151,181,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(6,151,181,0.14) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                                        <div className="relative flex h-full flex-col justify-between">
                                            <div className="rounded-2xl bg-white/80 p-5 shadow-[0_18px_50px_rgba(16,24,32,0.08)]">
                                                <p className="text-sm font-bold text-[#101820]">Hiring confidence</p>
                                                <p className="mt-2 text-sm leading-6 text-[#64717D]">Identity, escrow, activity, and social proof sit together instead of feeling scattered across tabs.</p>
                                            </div>
                                            <div className="mt-6 rounded-2xl bg-[#101820] p-5 text-white shadow-[0_18px_50px_rgba(16,24,32,0.18)]">
                                                <p className="text-xs font-bold uppercase text-white/50" style={{ letterSpacing: 0 }}>Current role</p>
                                                <p className="mt-2 text-2xl font-black text-white">{roleLabel}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <section className="rounded-[24px] border border-[#DFE7E2] bg-white p-7 shadow-[0_18px_55px_rgba(16,24,32,0.06)]">
                                    <div className="flex items-center justify-between gap-4 border-b border-[#E7EEE9] pb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E7F8EF]">
                                                <Briefcase className="h-5 w-5 text-[#15945A]" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-[#101820]">Recent work</h2>
                                                <p className="text-sm text-[#64717D]">{jobs.length} visible jobs</p>
                                            </div>
                                        </div>
                                        {jobs.length > 0 && (
                                            <button onClick={() => setActiveTab("jobs")} className="text-sm font-bold text-[#15945A] hover:text-[#0F5132]">
                                                View all
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-5 grid gap-3">
                                        {jobs.length === 0 ? (
                                            <p className="rounded-2xl border border-dashed border-[#D8E2DC] bg-[#F8FBF9] p-6 text-sm text-[#64717D]">No public job history yet.</p>
                                        ) : jobs.slice(0, 4).map((job) => {
                                            const s = JOB_STATUS[job.status] ?? JOB_STATUS.OPEN;
                                            return (
                                                <Link key={job.id} href={`/jobs/${job.id}`} className="group flex items-center gap-4 rounded-2xl border border-[#E7EEE9] bg-[#F8FBF9] p-4 transition-all hover:-translate-y-0.5 hover:border-[#15945A]/30 hover:bg-white hover:shadow-[0_14px_34px_rgba(16,24,32,0.08)]">
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-bold text-[#24313D] group-hover:text-[#15945A]">{job.title}</p>
                                                        <p className="mt-1 text-xs font-semibold text-[#8B959F]">{s.label}</p>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-[#8B959F] transition-colors group-hover:text-[#15945A]" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section className="rounded-[24px] border border-[#DFE7E2] bg-white p-7 shadow-[0_18px_55px_rgba(16,24,32,0.06)]">
                                    <div className="flex items-center justify-between gap-4 border-b border-[#E7EEE9] pb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFF8EA]">
                                                <Award className="h-5 w-5 text-[#B46B04]" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-[#101820]">Client signal</h2>
                                                <p className="text-sm text-[#64717D]">Latest marketplace feedback</p>
                                            </div>
                                        </div>
                                        {reviews.length > 0 && (
                                            <button onClick={() => setActiveTab("reviews")} className="text-sm font-bold text-[#15945A] hover:text-[#0F5132]">
                                                View all
                                            </button>
                                        )}
                                    </div>
                                    {reviews.length === 0 ? (
                                        <p className="mt-5 rounded-2xl border border-dashed border-[#D8E2DC] bg-[#F8FBF9] p-6 text-sm text-[#64717D]">No reviews yet. The first completed escrow will unlock stronger social proof here.</p>
                                    ) : (() => {
                                        const r = reviews[0];
                                        return (
                                            <div className="mt-5 rounded-2xl bg-[#101820] p-6 text-white">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="fw-avatar-initials grid h-12 w-12 place-items-center rounded-full bg-[#15945A] text-sm font-black text-white">
                                                            {r.reviewer.slice(2, 4).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{r.reviewer.slice(0, 6)}…{r.reviewer.slice(-4)}</p>
                                                            <p className="mt-1 text-xs font-semibold uppercase text-white/[0.45]" style={{ letterSpacing: 0 }}>{r.reviewer_role}</p>
                                                        </div>
                                                    </div>
                                                    <StarRow rating={r.rating} />
                                                </div>
                                                {r.comment && (
                                                    <p className="mt-6 border-l-2 border-[#7FE0B0] pl-4 text-[15px] leading-7 text-white/[0.78]">
                                                        &quot;{r.comment}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </section>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIVITY tab */}
                {activeTab === "activity" && (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
                        <div className="flex flex-col gap-6">
                            <section className="rounded-[28px] border border-[#DFE7E2] bg-white p-7 shadow-[0_24px_80px_rgba(16,24,32,0.08)] md:p-9">
                                <div className="flex flex-col justify-between gap-6 border-b border-[#E7EEE9] pb-7 lg:flex-row lg:items-end">
                                    <div>
                                        <p className="text-[12px] font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>Activity ledger</p>
                                        <h2 className="mt-2 text-3xl font-black text-[#101820]">On-chain work rhythm</h2>
                                        <p className="mt-3 max-w-2xl text-base leading-7 text-[#64717D]">
                                            A GitHub-style activity map for marketplace momentum: jobs created, escrow events, submissions, and reputation movements over time.
                                        </p>
                                    </div>
                                    {busiestCell?.count > 0 && (
                                        <div className="rounded-2xl border border-[#CFE9DA] bg-[#F0FBF5] px-5 py-4">
                                            <p className="text-xs font-bold uppercase text-[#34795A]" style={{ letterSpacing: 0 }}>Busiest day</p>
                                            <p className="mt-1 text-sm font-black text-[#0F5132]">
                                                {new Date(busiestCell.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {busiestCell.count} tx
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
                                    {[
                                        { label: "Contributions", value: String(totalActivity), accent: "#15945A" },
                                        { label: "Active days", value: String(activeDays), accent: "#087C94" },
                                        { label: "Current streak", value: `${currentStreak}d`, accent: "#B46B04" },
                                        { label: "Longest streak", value: `${longestStreak}d`, accent: "#101820" },
                                    ].map((metric) => (
                                        <div key={metric.label} className="rounded-2xl border border-[#E7EEE9] bg-[#F8FBF9] p-5">
                                            <p className="text-3xl font-black" style={{ color: metric.accent }}>{metric.value}</p>
                                            <p className="mt-1 text-sm font-semibold text-[#64717D]">{metric.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div ref={gridRef} className="relative mt-8 overflow-x-auto rounded-[24px] border border-[#E7EEE9] bg-[#FBFDFC] p-6">
                                    {hoveredCell && (
                                        <div
                                            className="pointer-events-none fixed z-50 flex flex-col items-center rounded-xl border border-[#DFE7E2] bg-white px-4 py-3 text-[13px] font-bold shadow-[0_18px_45px_rgba(16,24,32,0.16)]"
                                            style={{
                                                left: hoveredCell.x,
                                                top: hoveredCell.y - 54,
                                                transform: "translateX(-50%)",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            <span style={{ color: "#15945A" }}>{hoveredCell.count} contribution{hoveredCell.count !== 1 ? "s" : ""}</span>
                                            <span className="mt-1 font-medium text-[#64717D]">
                                                {new Date(hoveredCell.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex gap-[4px] mb-2 pl-8">
                                        {grid.map((week, wi) => {
                                            const found = monthLabels.find((m) => m.weekIndex === wi);
                                            return (
                                                <div key={wi} className="w-[14px] shrink-0 text-[10px] font-bold uppercase text-[#8B959F]" style={{ letterSpacing: 0 }}>
                                                    {found ? found.label : ""}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-[4px]">
                                        <div className="flex flex-col gap-[4px] mr-2 justify-between">
                                            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                                                <div key={i} className="h-[14px] w-6 text-right text-[10px] font-bold uppercase leading-[14px] text-[#8B959F]" style={{ letterSpacing: 0 }}>{d}</div>
                                            ))}
                                        </div>

                                        <div className="flex gap-[4px]">
                                            {grid.map((week, wi) => (
                                                <div key={wi} className="flex flex-col gap-[4px]">
                                                    {week.map((cell, di) => (
                                                        <div
                                                            key={di}
                                                            className="hcell h-[14px] w-[14px] rounded-[4px] ring-1 ring-black/[0.03] transition-all duration-150"
                                                            style={{
                                                                background: getCellBg(cell.count),
                                                                cursor: cell.count > 0 ? "pointer" : "default",
                                                                boxShadow: cell.count > 2 ? "0 6px 14px rgba(21,148,90,0.22)" : "none",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                                setHoveredCell({ date: cell.date, count: cell.count, x: rect.left + rect.width / 2, y: rect.top });
                                                                (e.currentTarget as HTMLElement).style.transform = "scale(1.55)";
                                                                (e.currentTarget as HTMLElement).style.zIndex = "10";
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                setHoveredCell(null);
                                                                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                                                                (e.currentTarget as HTMLElement).style.zIndex = "auto";
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-end gap-2">
                                        <span className="text-[10px] font-bold uppercase text-[#8B959F]" style={{ letterSpacing: 0 }}>Less</span>
                                        {[0, 1, 2, 3, 4].map((lvl) => (
                                            <div key={lvl} className="h-[14px] w-[14px] rounded-[4px] ring-1 ring-black/[0.03]" style={{ background: getCellBg(lvl) }} />
                                        ))}
                                        <span className="text-[10px] font-bold uppercase text-[#8B959F]" style={{ letterSpacing: 0 }}>More</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="flex flex-col gap-4 xl:sticky xl:top-28">
                            <div className="fw-profile-dark-card rounded-[28px] border border-[#1D2A2E] bg-[#101820] p-7 text-white shadow-[0_24px_80px_rgba(16,24,32,0.16)]">
                                <p className="text-[12px] font-bold uppercase text-[#7FE0B0]" style={{ letterSpacing: 0 }}>Reputation read</p>
                                <h3 className="mt-3 text-2xl font-black text-white">Consistent work creates visible trust.</h3>
                                <p className="mt-4 text-sm leading-7 text-white/[0.62]">
                                    Clients should not need to decode wallet activity. This view translates activity into simple marketplace signals.
                                </p>
                                <div className="mt-6 grid grid-cols-3 gap-2">
                                    {["Escrow", "Work", "Proof"].map((label) => (
                                        <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-center">
                                            <p className="text-[11px] font-bold text-white/[0.58]">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {[
                                { title: "Delivery cadence", value: activeDays > 0 ? "Active" : "Quiet", body: `${activeDays} active days in the last year.` },
                                { title: "Escrow footprint", value: `${jobs.length} jobs`, body: "Visible job history connected to this wallet." },
                                { title: "Social proof", value: `${reviews.length} reviews`, body: reviews.length > 0 ? "Client feedback is available." : "No client feedback has been published yet." },
                            ].map((signal) => (
                                <div key={signal.title} className="rounded-[20px] border border-[#DFE7E2] bg-white p-5 shadow-[0_14px_40px_rgba(16,24,32,0.055)]">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm font-bold text-[#24313D]">{signal.title}</p>
                                        <span className="rounded-full bg-[#E7F8EF] px-3 py-1 text-xs font-bold text-[#15945A]">{signal.value}</span>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-[#64717D]">{signal.body}</p>
                                </div>
                            ))}
                        </aside>
                    </div>
                )}

                {/* JOBS tab */}
                {activeTab === "jobs" && (
                    <div
                        className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                        style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                    >
                        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#1DBF73]/20" style={{ background: "rgba(29,191,115,0.1)" }}>
                                <Briefcase className="w-5 h-5 text-[#1DBF73]" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">All Jobs</h2>
                            <span className="text-[13px] font-bold text-[#1DBF73] ml-2">({jobs.length})</span>
                        </div>
                        {jobs.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-[15px] font-light text-white/40">No jobs yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {jobs.map((job) => {
                                    const s = JOB_STATUS[job.status] ?? JOB_STATUS.OPEN;
                                    return (
                                        <Link key={job.id} href={`/jobs/${job.id}`}
                                            className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 rounded-xl transition-all duration-300 group hover:-translate-y-1 backdrop-blur-md"
                                            style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
                                        >
                                            <span
                                                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border self-start sm:self-auto shrink-0"
                                                style={{ background: s.bg, color: s.color, borderColor: s.border }}
                                            >
                                                {s.label}
                                            </span>
                                            <span className="flex-1 text-[15px] font-bold truncate text-white/80 group-hover:text-white transition-colors">
                                                {job.title}
                                            </span>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-white/30 shrink-0">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="hidden sm:flex w-8 h-8 rounded-full bg-white/5 items-center justify-center group-hover:bg-[#1DBF73] transition-colors border border-white/10">
                                                <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* REVIEWS tab */}
                {activeTab === "reviews" && (
                    <div
                        className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                        style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                    >
                        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-amber-500/20" style={{ background: "rgba(245,158,11,0.1)" }}>
                                <Award className="w-5 h-5 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Reviews</h2>
                            {reviews.length > 0 && <span className="text-[13px] font-bold text-amber-500 ml-2">({reviews.length})</span>}
                        </div>
                        {reviews.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-[15px] font-light text-white/40">No reviews yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {reviews.map((r) => (
                                    <div
                                        key={r.id}
                                        className="px-6 py-6 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-white/5 bg-black/20"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="fw-avatar-initials w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-black text-white shrink-0 border border-white/10 shadow-[0_0_15px_rgba(29,191,115,0.2)]"
                                                    style={{ background: "linear-gradient(135deg, #1DBF73, #158a53)" }}
                                                >
                                                    {r.reviewer.slice(2, 4).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-white">
                                                        {r.reviewer.slice(0, 6)}…{r.reviewer.slice(-4)}
                                                    </p>
                                                    <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                                                        {r.reviewer_role}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start sm:items-end gap-2">
                                                <StarRow rating={r.rating} />
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {r.comment && (
                                            <p className="text-[15px] leading-relaxed font-light italic text-white/80 border-l-2 border-[#1DBF73]/50 pl-4 py-1">
                                                &quot;{r.comment}&quot;
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <LandingFooter />
        </div>
    );
}
