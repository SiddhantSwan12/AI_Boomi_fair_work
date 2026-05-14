"use client";

import { useRef } from "react";
import { Check, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const ROWS = [
    { feature: "Escrow-protected payments", fairwork: true, others: false },
    { feature: "AI dispute support", fairwork: true, others: false },
    { feature: "On-chain proof", fairwork: true, others: false },
    { feature: "Non-custodial wallet flow", fairwork: true, others: false },
    { feature: "Flat platform fee", fairwork: true, others: false },
    { feature: "Chargeback risk", fairwork: false, others: true },
];

export default function ComparisonSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".comp-header", {
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
            y: 34,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
        });

        gsap.from(".comp-table", {
            scrollTrigger: { trigger: sectionRef.current, start: "top 74%" },
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="relative z-10 border-b border-black/10 py-24 md:py-32" style={{ backgroundColor: "#fafaf8" }}>
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="comp-header mx-auto mb-14 max-w-3xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#CFE9DA] bg-white px-4 py-2 shadow-[0_12px_34px_rgba(16,24,32,0.05)]">
                        <span className="h-2 w-2 rounded-full bg-[#1DBF73]" />
                        <span className="text-xs font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>The difference</span>
                    </div>
                    <h2 className="mb-5 font-black text-[#0a0a0b]" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}>
                        Built for trust-sensitive work.
                    </h2>
                    <p className="text-lg leading-relaxed text-[#64717D]">
                        Traditional marketplaces optimize discovery. FairWork adds payment protection and verifiable proof.
                    </p>
                </div>

                <div className="comp-table overflow-hidden rounded-[30px] border border-[#DFE7E2] bg-white shadow-[0_26px_80px_rgba(16,24,32,0.08)]">
                    <div className="grid grid-cols-[1.25fr_0.85fr_0.85fr] border-b border-[#E7EEE9] bg-[#F8FBF9]">
                        <div className="px-5 py-5 text-xs font-bold uppercase text-[#64717D] sm:px-8" style={{ letterSpacing: 0 }}>Feature</div>
                        <div className="border-x border-[#CFE9DA] bg-[#E7F8EF] px-4 py-5 text-center text-sm font-black text-[#0F5132] sm:px-8">FairWork</div>
                        <div className="px-4 py-5 text-center text-sm font-black text-[#64717D] sm:px-8">Others</div>
                    </div>

                    {ROWS.map((row) => (
                        <div key={row.feature} className="grid grid-cols-[1.25fr_0.85fr_0.85fr] border-b border-[#E7EEE9] last:border-0 transition-colors hover:bg-[#FBFDFC]">
                            <div className="flex items-center px-5 py-5 text-sm font-semibold text-[#24313D] sm:px-8 sm:text-[15px]">{row.feature}</div>
                            <div className="flex items-center justify-center border-x border-[#E7EEE9] bg-[#F7FCF9] px-4 py-5">
                                {row.fairwork ? (
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#E7F8EF] text-[#15945A]">
                                        <Check className="h-5 w-5" strokeWidth={3} />
                                    </span>
                                ) : (
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-500">
                                        <X className="h-5 w-5" strokeWidth={2.5} />
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-center px-4 py-5">
                                {row.others ? (
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-500">
                                        <Check className="h-5 w-5" strokeWidth={3} />
                                    </span>
                                ) : (
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#F3F7F4] text-[#9AA7A0]">
                                        <X className="h-5 w-5" strokeWidth={2.5} />
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
