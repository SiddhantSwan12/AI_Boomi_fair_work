"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Quote, Star } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const TESTIMONIALS = [
    {
        quote: "Got paid instantly after delivery. No dispute, no delay — the smart contract just worked.",
        name: "0xRamirez",
        role: "Solidity Developer",
        seed: "Ramirez",
        accentColor: "#1DBF73",
        surface: "#E7F8EF",
    },
    {
        quote: "As a client, I felt safe knowing my funds were locked until I approved. No more chargeback anxiety.",
        name: "0xPriya",
        role: "DeFi Startup Founder",
        seed: "Priya",
        accentColor: "#0F9EAC",
        surface: "#EAF6F7",
    },
    {
        quote: "The AI dispute resolution saved me weeks of back-and-forth. Fair, transparent, and fast.",
        name: "0xTomasz",
        role: "NFT Artist",
        seed: "Tomasz",
        accentColor: "#B98512",
        surface: "#FFF8EA",
    },
];

export default function CTAFooterSection() {
    const testimonialRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".testim-header", {
            scrollTrigger: { trigger: testimonialRef.current, start: "top 80%" },
            y: 40, opacity: 0, duration: 1, ease: "power3.out"
        });

        gsap.from(".cta-content", {
            scrollTrigger: { trigger: ctaRef.current, start: "top 70%" },
            y: 60, opacity: 0, duration: 1.2, ease: "power3.out"
        });

        gsap.from(".cta-button", {
            scrollTrigger: { trigger: ctaRef.current, start: "top 65%" },
            scale: 0.9, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)", delay: 0.3
        });
    }, { scope: testimonialRef }); // Using testimonialRef to wrap the whole file

    return (
        <div ref={testimonialRef}>
            {/* ── Testimonials ─────────────────────────────────────────────── */}
            <section className="relative z-10 overflow-hidden border-b border-black/10 py-12 md:py-14" style={{ backgroundColor: "#fafaf8" }}>
                <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 50% 8%, rgba(29,191,115,0.07), transparent 28%)" }} />
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">

                    <div className="testim-header relative mb-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#CFE9DA] bg-white px-4 py-2 shadow-[0_12px_34px_rgba(16,24,32,0.05)]">
                            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#1DBF73]" />
                            <span className="text-xs font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>Testimonials</span>
                        </div>
                        <h2
                            className="font-black text-[#0a0a0b]"
                            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}
                        >
                            Trusted by Web3 builders
                        </h2>
                    </div>

                    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
                        {TESTIMONIALS.map((t, index) => (
                            <div
                                key={t.name}
                                className={`testim-card group relative flex min-h-[330px] flex-col overflow-hidden rounded-[30px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(16,24,32,0.12)] ${index === 1 ? "bg-[#101820] text-white" : "bg-white text-[#101820]"}`}
                                style={{ borderColor: index === 1 ? "rgba(255,255,255,0.12)" : "#DFE7E2" }}
                            >
                                <div className="absolute inset-x-0 top-0 h-32" style={{ background: `radial-gradient(circle at 18% 0%, ${t.accentColor}24, transparent 65%)` }} />

                                <div className="relative z-10 flex flex-col flex-1">
                                    {/* Stars + badge */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} className="h-4 w-4 fill-[#FFBE00] text-[#FFBE00]" />
                                            ))}
                                        </div>
                                        <div
                                            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5"
                                            style={{ background: index === 1 ? "rgba(255,255,255,0.08)" : t.surface, borderColor: `${t.accentColor}24` }}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: t.accentColor }} />
                                            <span className="text-[10px] uppercase font-bold" style={{ color: t.accentColor, letterSpacing: 0 }}>On-chain</span>
                                        </div>
                                    </div>

                                    <Quote className="mb-4 h-9 w-9" style={{ color: t.accentColor, opacity: 0.45 }} />

                                    {/* Quote */}
                                    <p className={`mb-6 flex-1 text-[17px] leading-7 ${index === 1 ? "text-white/[0.82]" : "text-[#24313D]"}`}>
                                        {t.quote}
                                    </p>

                                    {/* Gradient divider */}
                                    <div
                                        className="mb-6 h-px"
                                        style={{ background: `linear-gradient(90deg, ${t.accentColor}55, transparent)` }}
                                    />

                                    {/* Author */}
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl text-sm font-black text-white"
                                            style={{ background: t.accentColor }}
                                        >
                                            {t.seed.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={`text-[15px] font-black ${index === 1 ? "text-white" : "text-[#101820]"}`}>{t.name}</div>
                                            <div className={`text-xs ${index === 1 ? "text-white/[0.52]" : "text-[#64717D]"}`}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner — dark & dramatic ─────────────────────────────── */}
            <section ref={ctaRef} className="relative z-10 overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0a0b 0%, rgba(10,15,30,1) 100%)" }}>

                {/* Grid Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                        opacity: 0.5
                    }}
                />

                <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-32 md:py-40 text-center">
                    <div className="cta-content">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-[11px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(29,191,115,0.1)]">
                            <span className="w-2 h-2 rounded-full bg-[#1DBF73] animate-pulse flex-shrink-0 shadow-[0_0_8px_#1DBF73]" />
                            Live on Polygon · Escrow-protected
                        </div>

                        <h2
                            className="font-extrabold text-white mb-6 tracking-tight"
                            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.05 }}
                        >
                            Ready to work{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DBF73] to-[#86efac] drop-shadow-[0_0_20px_rgba(29,191,115,0.4)]">fairly?</span>
                        </h2>
                        <p className="text-white/60 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                            Join 12,000+ Web3 freelancers and clients on the only escrow-protected blockchain marketplace.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/jobs/create"
                                className="cta-button inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full text-[15px] font-bold transition-all duration-300 hover:scale-105"
                                style={{
                                    background: "#1DBF73",
                                    color: "white",
                                    boxShadow: "0 8px 32px rgba(29,191,115,0.4)",
                                }}
                            >
                                Post a Job <ArrowRight className="w-5 h-5" />
                            </Link>

                            <Link
                                href="/jobs"
                                className="cta-button inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full text-[15px] font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-md"
                            >
                                Browse Services
                            </Link>


                        </div>

                        {/* Trust indicators */}
                        <div className="flex items-center justify-center gap-8 mt-14 flex-wrap opacity-60">
                            {[
                                "Flat 2.5% fee",
                                "Non-custodial",
                                "Open source contracts",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-white/70 text-[13px] uppercase tracking-wider font-bold">
                                    <span className="w-1 h-1 rounded-full bg-[#1DBF73] flex-shrink-0" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
