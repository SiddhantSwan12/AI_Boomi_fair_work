"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Briefcase, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
    { href: "/jobs", label: "Browse Jobs" },
    { href: "/jobs/create", label: "Post Job" },
    { href: "/disputes", label: "Disputes" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isHomePage = pathname === "/";

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white shadow-lg shadow-black/5"
                : isHomePage
                    ? "bg-transparent"
                    : "bg-white border-b border-gray-100"
                }`}
        >
            <div className="container-custom h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/images/logo-icon-new.png"
                            alt="FairWork Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="relative w-32 h-8">
                        <Image
                            src="/images/logo-text-new.png"
                            alt="FairWork"
                            fill
                            className="object-contain object-left"
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-all relative group ${pathname === link.href
                                ? "text-[#6B5DD3]"
                                : scrolled || !isHomePage
                                    ? "text-gray-600 hover:text-[#6B5DD3]"
                                    : "text-white/90 hover:text-white"
                                }`}
                        >
                            {link.label}
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#6B5DD3] transition-all ${pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                                }`} />
                        </Link>
                    ))}
                </div>

                {/* Right Side: CTA + Wallet */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/jobs/create"
                        className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${scrolled || !isHomePage
                            ? "bg-[#6B5DD3] text-white hover:bg-[#5B4FC5]"
                            : "bg-white text-[#003912] hover:bg-gray-100"
                            }`}
                    >
                        Post a Job
                    </Link>

                    <div className="hidden md:block">
                        <ConnectButton
                            showBalance={false}
                            accountStatus="avatar"
                            chainStatus="icon"
                        />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${scrolled || !isHomePage
                            ? "text-gray-600 hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                            }`}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
                    <div className="container-custom py-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block text-base font-medium py-2 ${pathname === link.href
                                    ? "text-[#6B5DD3]"
                                    : "text-gray-600"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-gray-100">
                            <ConnectButton />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
