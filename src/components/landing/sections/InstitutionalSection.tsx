"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const GIGS = [
    {
        title: "Solidity escrow contract audit",
        seller: "0xAlexW",
        initials: "AW",
        rating: "4.9",
        reviews: "312",
        price: "$299",
        badge: "Top Rated",
        tags: ["Solidity", "Audit"],
        accent: "#1DBF73",
    },
    {
        title: "Web3 product dashboard design",
        seller: "0xMariaD",
        initials: "MD",
        rating: "5.0",
        reviews: "187",
        price: "$149",
        badge: "Pro",
        tags: ["Figma", "React"],
        accent: "#0F9EAC",
    },
    {
        title: "DeFi protocol integration",
        seller: "0xChrisK",
        initials: "CK",
        rating: "4.8",
        reviews: "94",
        price: "$499",
        badge: "Expert",
        tags: ["DeFi", "TypeScript"],
        accent: "#B98512",
    },
    {
        title: "NFT metadata and mint flow",
        seller: "0xSophieL",
        initials: "SL",
        rating: "4.7",
        reviews: "231",
        price: "$399",
        badge: "Rising",
        tags: ["NFT", "IPFS"],
        accent: "#15945A",
    },
];

export default function InstitutionalSection() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".inst-header", {
            scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
            y: 34,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
        });

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative z-10 overflow-hidden py-10 md:py-12" style={{ backgroundColor: "#fafaf8" }}>
            <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 12% 20%, rgba(29,191,115,0.075), transparent 26%), radial-gradient(circle at 90% 10%, rgba(15,158,172,0.07), transparent 26%)" }} />
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                <div className="relative grid gap-5 rounded-[36px] border border-[#DFE7E2] bg-white/78 p-4 shadow-[0_26px_90px_rgba(16,24,32,0.07)] backdrop-blur-xl md:p-6 lg:grid-cols-[0.62fr_1.38fr] lg:p-7">
                    <div className="inst-header rounded-[28px] bg-[#F5FAF7] p-7 md:p-8 lg:min-h-[440px]">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#CFE9DA] bg-white px-4 py-2 shadow-[0_12px_34px_rgba(16,24,32,0.05)]">
                            <span className="h-2 w-2 rounded-full bg-[#1DBF73]" />
                            <span className="text-xs font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>Elite talent</span>
                        </div>
                        <h2 className="font-black text-[#0a0a0b]" style={{ fontSize: "clamp(2.1rem, 3.6vw, 4rem)", lineHeight: 1 }}>
                            Premium Web3 services.
                        </h2>
                        <p className="mt-5 max-w-md text-base leading-8 text-[#64717D]">Marketplace cards with skill, proof, pricing, and escrow confidence in one glance.</p>
                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-[#DFE7E2] bg-white p-4">
                                <p className="text-2xl font-black text-[#101820]">4.9</p>
                                <p className="mt-1 text-xs font-bold uppercase text-[#64717D]" style={{ letterSpacing: 0 }}>Avg rating</p>
                            </div>
                            <div className="rounded-2xl border border-[#DFE7E2] bg-white p-4">
                                <p className="text-2xl font-black text-[#101820]">$299+</p>
                                <p className="mt-1 text-xs font-bold uppercase text-[#64717D]" style={{ letterSpacing: 0 }}>Starting</p>
                            </div>
                        </div>
                        <Link href="/jobs" className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#101820] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#15945A]">
                            View all talent <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {GIGS.map((gig) => (
                            <Link key={gig.title} href="/jobs" className="inst-card group overflow-hidden rounded-[28px] border border-[#DFE7E2] bg-white p-3 shadow-[0_18px_55px_rgba(16,24,32,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#15945A]/30 hover:shadow-[0_28px_80px_rgba(16,24,32,0.11)]">
                                <div className="relative overflow-hidden rounded-[22px] p-5" style={{ background: `linear-gradient(135deg, ${gig.accent}24, #F8FBF9 65%)` }}>
                                    <div className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-bold text-[#24313D] backdrop-blur">
                                        {gig.badge}
                                    </div>
                                    <div className="grid h-14 w-14 place-items-center rounded-2xl text-base font-black text-white shadow-[0_14px_34px_rgba(16,24,32,0.16)]" style={{ background: gig.accent }}>
                                        {gig.initials}
                                    </div>
                                    <div className="mt-8 flex flex-wrap gap-2">
                                        {gig.tags.map((tag) => (
                                            <span key={tag} className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#24313D]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-2 pb-2 pt-5">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span className="font-mono text-sm font-bold text-[#64717D]">{gig.seller}</span>
                                        <span className="flex items-center gap-1 text-sm font-bold text-[#101820]">
                                            <Star className="h-4 w-4 fill-[#B98512] text-[#B98512]" />
                                            {gig.rating}
                                        </span>
                                    </div>
                                    <p className="min-h-[50px] text-[16px] font-black leading-snug text-[#101820] transition-colors group-hover:text-[#15945A]">{gig.title}</p>
                                    <div className="mt-4 flex items-end justify-between border-t border-[#E7EEE9] pt-4">
                                        <span className="text-xs font-semibold text-[#8B959F]">{gig.reviews} reviews</span>
                                        <span className="text-right text-lg font-black text-[#101820]">{gig.price} <span className="text-xs font-semibold text-[#8B959F]">USDC</span></span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
