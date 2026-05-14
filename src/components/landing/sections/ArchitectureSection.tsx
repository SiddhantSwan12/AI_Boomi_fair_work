"use client";

import { useRef } from "react";
import { CheckCircle2, Lock, MessageSquare, Search } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
    {
        number: "01",
        Icon: Search,
        title: "Find the right fit",
        desc: "Browse verified specialists or publish a scoped brief.",
        detail: "Search + shortlists",
    },
    {
        number: "02",
        Icon: Lock,
        title: "Lock escrow",
        desc: "Agree on milestones and secure USDC before work starts.",
        detail: "Smart contract",
    },
    {
        number: "03",
        Icon: MessageSquare,
        title: "Collaborate",
        desc: "Chat, submit files, and keep milestone proof in one flow.",
        detail: "Workspace",
    },
    {
        number: "04",
        Icon: CheckCircle2,
        title: "Release funds",
        desc: "Approve work, release payment, and build reputation.",
        detail: "Review + proof",
    },
];

export default function ArchitectureSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".arch-header", {
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
            y: 34,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
        });

    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} id="how-it-works" className="relative z-10 overflow-hidden py-10 md:py-12" style={{ backgroundColor: "#fafaf8" }}>
            <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 18% 12%, rgba(29,191,115,0.07), transparent 24%), radial-gradient(circle at 80% 35%, rgba(16,24,32,0.045), transparent 30%)" }} />
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                <div className="relative grid gap-5 rounded-[36px] border border-[#DFE7E2] bg-white/78 p-4 shadow-[0_26px_90px_rgba(16,24,32,0.07)] backdrop-blur-xl md:p-6 lg:grid-cols-[0.62fr_1.38fr] lg:p-7">
                    <div className="arch-header rounded-[28px] bg-white p-7 md:p-8 lg:min-h-[430px]">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#CFE9DA] bg-white px-4 py-2 shadow-[0_12px_34px_rgba(16,24,32,0.05)]">
                            <span className="h-2 w-2 rounded-full bg-[#1DBF73]" />
                            <span className="text-xs font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>How it works</span>
                        </div>
                        <h2 className="font-black text-[#0a0a0b]" style={{ fontSize: "clamp(2.1rem, 3.8vw, 4rem)", lineHeight: 1 }}>
                            Four steps from brief to paid.
                        </h2>
                        <p className="mt-5 max-w-md text-base leading-8 text-[#64717D]">
                            A familiar marketplace flow, with contract-backed proof at every important payment moment.
                        </p>
                        <div className="mt-8 rounded-3xl border border-[#DFE7E2] bg-[#F5FAF7] p-5">
                            <p className="text-xs font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>Protected workflow</p>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                                <div className="h-full w-[78%] rounded-full bg-[#15945A]" />
                            </div>
                            <div className="mt-4 flex justify-between text-xs font-bold text-[#64717D]">
                                <span>Brief</span>
                                <span>Escrow</span>
                                <span>Release</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
                        {STEPS.map((step, index) => (
                            <div key={step.number} className={`arch-step group relative min-h-[205px] overflow-hidden rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(16,24,32,0.10)] ${index === 1 ? "bg-[#101820] text-white" : "bg-white text-[#101820]"}`} style={{ borderColor: index === 1 ? "rgba(255,255,255,0.12)" : "#DFE7E2" }}>
                                <div className="absolute right-5 top-4 text-7xl font-black leading-none opacity-[0.05]">{step.number}</div>
                                <div className="relative z-10">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${index === 1 ? "bg-[#7FE0B0]" : "bg-[#E7F8EF]"}`}>
                                            <step.Icon className={`h-5 w-5 ${index === 1 ? "text-[#07110C]" : "text-[#15945A]"}`} strokeWidth={2.4} />
                                        </div>
                                        <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase ${index === 1 ? "bg-white/10 text-[#7FE0B0]" : "bg-[#F3F7F4] text-[#64717D]"}`} style={{ letterSpacing: 0 }}>
                                            {step.detail}
                                        </span>
                                    </div>
                                    <p className={`mb-2 text-xs font-bold uppercase ${index === 1 ? "text-[#7FE0B0]" : "text-[#15945A]"}`} style={{ letterSpacing: 0 }}>Step {step.number}</p>
                                    <h3 className={`mb-2 text-xl font-black ${index === 1 ? "text-white" : "text-[#101820]"}`}>{step.title}</h3>
                                    <p className={`text-[15px] leading-7 ${index === 1 ? "text-white/[0.64]" : "text-[#64717D]"}`}>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
