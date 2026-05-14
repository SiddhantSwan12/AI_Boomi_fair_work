"use client";

import { useRef } from "react";
import { BadgeCheck, Brain, CircleDollarSign, Network, ShieldCheck, Wallet } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const FEATURES = [
    {
        Icon: ShieldCheck,
        title: "Escrow-protected",
        desc: "Funds lock before work begins and release only when delivery is approved.",
        tag: "Payments",
        accent: "#1DBF73",
        surface: "#E7F8EF",
        featured: true,
    },
    {
        Icon: Brain,
        title: "AI dispute assist",
        desc: "Disputes get structured evidence, summaries, and resolution support.",
        tag: "AI",
        accent: "#0F9EAC",
        surface: "#EAF6F7",
    },
    {
        Icon: Network,
        title: "On-chain proof",
        desc: "Contracts, escrow states, and payment trails stay verifiable.",
        tag: "Web3",
        accent: "#B98512",
        surface: "#FFF8EA",
    },
    {
        Icon: BadgeCheck,
        title: "Verified reputation",
        desc: "Profiles combine reviews, wallet identity, and visible work history.",
        tag: "Trust",
        accent: "#15945A",
        surface: "#F0FBF5",
    },
    {
        Icon: Wallet,
        title: "Non-custodial",
        desc: "Workers and clients keep wallet control while escrow handles trust.",
        tag: "Wallets",
        accent: "#0F9EAC",
        surface: "#EAF6F7",
    },
    {
        Icon: CircleDollarSign,
        title: "Transparent fees",
        desc: "Simple platform economics with no hidden chargeback surprises.",
        tag: "2.5%",
        accent: "#101820",
        surface: "#F7FAF8",
    },
];

export default function FeatureChipsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".fc-header", {
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
            y: 34,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
        });

    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} id="why-fairwork" className="relative z-10 overflow-hidden border-b border-black/10 py-10 md:py-12" style={{ backgroundColor: "#fafaf8" }}>
            <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 12% 18%, rgba(29,191,115,0.08), transparent 28%), radial-gradient(circle at 88% 8%, rgba(15,158,172,0.08), transparent 26%)" }} />
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                <div className="relative grid gap-5 rounded-[36px] border border-[#DFE7E2] bg-white/78 p-4 shadow-[0_26px_90px_rgba(16,24,32,0.07)] backdrop-blur-xl md:p-6 lg:grid-cols-[0.72fr_1.28fr] lg:p-7">
                    <div className="fc-header rounded-[28px] bg-[#101820] p-7 text-white md:p-8 lg:min-h-[520px]">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 shadow-[0_12px_34px_rgba(0,0,0,0.12)]">
                            <span className="h-2 w-2 rounded-full bg-[#7FE0B0]" />
                            <span className="text-xs font-bold uppercase text-[#7FE0B0]" style={{ letterSpacing: 0 }}>Why FairWork</span>
                        </div>
                        <h2 className="mb-5 font-black text-white" style={{ fontSize: "clamp(2.15rem, 4vw, 4.2rem)", lineHeight: 0.98 }}>
                            Marketplace speed.
                            <br />
                            Contract-grade trust.
                        </h2>
                        <p className="max-w-lg text-base leading-8 text-white/64">
                            Clean rails for hiring, delivery, payment, and reputation.
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-3">
                            {["Escrow", "Wallet proof", "AI assist", "Reviews"].map((item) => (
                                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-bold text-white/76">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                className={`fc-card group relative min-h-[214px] overflow-hidden rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(16,24,32,0.10)] ${feature.featured ? "bg-[#101820] text-white" : "bg-white text-[#101820]"}`}
                                style={{ borderColor: feature.featured ? "rgba(255,255,255,0.12)" : "#DFE7E2" }}
                            >
                                <div className="absolute inset-x-0 top-0 h-28 opacity-80" style={{ background: `radial-gradient(circle at 20% 0%, ${feature.accent}24, transparent 65%)` }} />
                                <div className="relative z-10 flex h-full flex-col">
                                    <div className="mb-5 flex items-start justify-between gap-4">
                                        <div className="grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105" style={{ background: feature.accent, boxShadow: `0 12px 34px ${feature.accent}33` }}>
                                            <feature.Icon className="h-5 w-5 text-white" strokeWidth={2.4} />
                                        </div>
                                        <span className="rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase" style={{ color: feature.featured ? "#7FE0B0" : feature.accent, background: feature.featured ? "rgba(255,255,255,0.08)" : feature.surface, borderColor: feature.featured ? "rgba(255,255,255,0.12)" : `${feature.accent}22`, letterSpacing: 0 }}>
                                            {feature.tag}
                                        </span>
                                    </div>

                                    <h3 className={`mb-2 text-xl font-black leading-snug ${feature.featured ? "text-white" : "text-[#101820]"}`}>{feature.title}</h3>
                                    <p className={`text-[15px] leading-7 ${feature.featured ? "text-white/[0.64]" : "text-[#64717D]"}`}>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
