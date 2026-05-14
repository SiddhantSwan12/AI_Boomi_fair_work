"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowUpRight, LockKeyhole, Search, ShieldCheck, Wallet } from "lucide-react";

const CATEGORIES = ["Smart contracts", "AI agents", "Design", "Audit"] as const;

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fw-landing-reveal",
        { opacity: 0, y: 26, filter: "blur(12px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.08,
          ease: "power3.out",
        }
      );

      gsap.to(".fw-hero-float", {
        y: -9,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.24,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} data-section="hero" className="relative min-h-[92dvh] overflow-hidden bg-[#050907]">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-55 saturate-[0.9]"
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(127,224,176,0.24),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(15,158,172,0.20),transparent_32%),linear-gradient(90deg,rgba(5,9,7,0.96),rgba(5,9,7,0.70)_48%,rgba(5,9,7,0.92))]" />
        <div className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050907] to-transparent" />

        <div className="relative mx-auto grid min-h-[92dvh] max-w-[1600px] items-center gap-10 px-6 pb-16 pt-28 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:pb-20 lg:pt-28">
          <div className="max-w-4xl lg:pr-8">
            <div className="fw-landing-reveal inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-[#7FE0B0] shadow-[0_0_18px_rgba(127,224,176,0.8)]" />
              Escrow-first freelance marketplace
            </div>

            <h1 className="fw-landing-reveal mt-8 max-w-4xl text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-[82px] xl:text-[94px]">
              Premium work.
              <br />
              Protected money.
            </h1>

            <p className="fw-landing-reveal mt-6 max-w-xl text-lg leading-8 text-white/68">
              Hire Web3 talent with escrow, wallet proof, and AI dispute support.
            </p>

            <div className="fw-landing-reveal mt-8 max-w-3xl rounded-[28px] border border-white/12 bg-white/10 p-3 shadow-[0_26px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl bg-white/92 px-5">
                  <Search className="h-5 w-5 text-[#15945A]" />
                  <span className="text-sm font-semibold text-[#64717D]">Search designers, auditors, AI engineers...</span>
                </div>
                <Link href="/jobs" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#7FE0B0] px-7 text-sm font-black text-[#07110C] transition-transform hover:-translate-y-0.5">
                  Explore jobs
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/jobs/create" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/16 px-7 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  Post a brief
                </Link>
              </div>
            </div>

            <div className="fw-landing-reveal mt-5 flex flex-wrap gap-2.5">
              {CATEGORIES.map((category) => (
                <Link key={category} href="/jobs" className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-xl transition-colors hover:bg-white/14 hover:text-white">
                  {category}
                </Link>
              ))}
            </div>

            <div className="fw-landing-reveal mt-7 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["Escrow", "Locked"],
                ["Identity", "Wallet proof"],
                ["Disputes", "AI assisted"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase text-white/38" style={{ letterSpacing: 0 }}>{label}</p>
                  <p className="mt-1 text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fw-landing-reveal relative hidden lg:block">
            <div className="absolute -left-6 top-12 h-36 w-36 rounded-full bg-[#7FE0B0]/18 blur-3xl" />
            <div className="absolute -right-8 bottom-8 h-44 w-44 rounded-full bg-[#0F9EAC]/20 blur-3xl" />

            <div className="relative rounded-[38px] border border-white/12 bg-white/[0.09] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
              <div className="rounded-[30px] border border-white/10 bg-[#0B1214]/92 p-6 text-white">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-sm font-bold text-[#7FE0B0]">Live protected contract</p>
                    <h2 className="mt-3 text-4xl font-black leading-tight text-white">AI audit redesign</h2>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                    <ShieldCheck className="h-7 w-7 text-[#7FE0B0]" />
                  </div>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Budget", value: "$4,800" },
                    { label: "Escrow", value: "Locked" },
                    { label: "Due", value: "6 days" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                      <p className="text-xs font-bold uppercase text-white/[0.42]" style={{ letterSpacing: 0 }}>{item.label}</p>
                      <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 p-3 pt-5 md:grid-cols-[0.95fr_1.05fr]">
                <div className="fw-hero-float rounded-[24px] border border-white/12 bg-white/92 p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E7F8EF]">
                      <Wallet className="h-5 w-5 text-[#15945A]" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#101820]">Wallet verified</p>
                      <p className="mt-1 text-xs font-semibold text-[#64717D]">0x4cF4...F003</p>
                    </div>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E7EEE9]">
                    <div className="h-full w-[72%] rounded-full bg-[#15945A]" />
                  </div>
                </div>

                <div className="fw-hero-float rounded-[24px] border border-white/12 bg-white/92 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-[#101820]">Payment rail</p>
                    <LockKeyhole className="h-5 w-5 text-[#15945A]" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {["Client deposits", "Work submitted", "Funds released"].map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${index < 2 ? "bg-[#15945A]" : "bg-[#D8E2DC]"}`} />
                        <span className="text-sm font-semibold text-[#24313D]">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/46 lg:flex">
          <span className="text-[10px] font-bold uppercase" style={{ letterSpacing: 0 }}>Scroll</span>
          <div className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
    </section>
  );
}
