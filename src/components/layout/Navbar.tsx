"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { BriefcaseBusiness, Menu, Scale, ShieldCheck, X } from "lucide-react";
import { useState, useEffect } from "react";
import ProfileMenu from "./ProfileMenu";
import WalletButton from "./WalletButton";
import { supabase } from "@/lib/supabase";

const navLinks = [
    { href: "/jobs",       label: "Marketplace", icon: BriefcaseBusiness },
    { href: "/disputes",   label: "Disputes",    icon: Scale             },
    { href: "/dashboard",  label: "Dashboard",   icon: null              },
];

export default function Navbar() {
    const pathname = usePathname();
    const { isConnected, address } = useAccount();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isJuror, setIsJuror] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Check if connected wallet is a registered juror
    useEffect(() => {
        if (!isConnected || !address) { setIsJuror(false); return; }
        supabase
            .from("juror_profiles")
            .select("wallet")
            .eq("wallet", address.toLowerCase())
            .maybeSingle()
            .then(({ data }) => setIsJuror(!!data));
    }, [isConnected, address]);

    return (
        <nav
            className={`sticky top-0 z-50 bg-white/90 backdrop-blur-xl transition-all duration-200 ${
                scrolled ? "border-b border-[#DFE7E2] shadow-nav" : "border-b border-[#DFE7E2]/80"
            }`}
        >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 bg-[#1DBF73]">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8.5L6.5 12L13 4" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="font-bold text-[#101820] text-[17px] tracking-normal transition-colors duration-300">FairWork</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                                pathname === link.href || pathname.startsWith(link.href + "/")
                                    ? "text-[#15945A] bg-[#E7F8EF]"
                                    : "text-[#64717D] hover:text-[#101820] hover:bg-[#EEF5F1]"
                            }`}
                        >
                            {link.icon && <link.icon className="h-4 w-4" />}
                            {link.label}
                        </Link>
                    ))}

                    {/* Juror Panel — only shown when connected wallet is a verified juror */}
                    {isJuror && (
                        <Link
                            href="/jurors/dashboard"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                                pathname.startsWith("/jurors/dashboard")
                                    ? "text-[#15945A] bg-[#E7F8EF]"
                                    : "text-[#64717D] hover:text-[#101820] hover:bg-[#EEF5F1]"
                            }`}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Juror Panel
                        </Link>
                    )}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:block">
                        {isConnected ? <ProfileMenu /> : <WalletButton />}
                    </div>
                    <Link
                        href="/jobs/create"
                        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1DBF73] hover:bg-[#15945A] text-white text-sm font-bold transition-all duration-150 flex-shrink-0"
                    >
                        Post a Job
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-[#64717D] hover:bg-[#EEF5F1] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#DFE7E2]">
                    <div className="max-w-[1600px] mx-auto px-4 py-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    pathname === link.href
                                        ? "text-[#15945A] bg-[#E7F8EF]"
                                        : "text-[#64717D] hover:text-[#101820] hover:bg-[#EEF5F1]"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isJuror && (
                            <Link
                                href="/jurors/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    pathname.startsWith("/jurors/dashboard")
                                        ? "text-[#15945A] bg-[#E7F8EF]"
                                        : "text-[#64717D] hover:text-[#101820] hover:bg-[#EEF5F1]"
                                }`}
                            >
                                <ShieldCheck className="w-4 h-4" /> Juror Panel
                            </Link>
                        )}
                        <div className="pt-3 border-t border-[#DFE7E2] flex flex-col gap-2">
                            <Link
                                href="/jobs/create"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1DBF73] hover:bg-[#15945A] text-white text-sm font-bold transition-all duration-150 justify-center"
                            >
                                Post a Job
                            </Link>
                            <div className="flex justify-center mt-2">
                                <WalletButton />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
