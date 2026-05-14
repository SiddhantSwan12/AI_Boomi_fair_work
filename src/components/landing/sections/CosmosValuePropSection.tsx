"use client";

import Link from "next/link";

export default function CosmosValuePropSection() {
  return (
    <section className="bg-[#fafaf8] px-6 py-24 text-[#0a0a0b]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-8 rounded-[32px] border border-black/10 bg-white px-8 py-10 shadow-[0_24px_80px_rgba(10,10,11,0.06)] md:flex-row md:px-12">
        <div>
          <p className="text-sm font-bold uppercase text-[#15945A]" style={{ letterSpacing: 0 }}>
            Start protected
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#0a0a0b] md:text-5xl">
            Build the next project with escrow on.
          </h2>
        </div>

        <Link
          href="/register"
          className="inline-flex min-h-14 items-center justify-center rounded-full bg-black px-8 text-sm font-bold text-white transition-colors hover:bg-black/85"
        >
          Get started
        </Link>
      </div>
    </section>
  );
}
