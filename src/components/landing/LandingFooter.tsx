"use client";

import Link from "next/link";

const LINKS = [
  { label: "Jobs", href: "/jobs" },
  { label: "How It Works", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function LandingFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#fafaf8",
        borderTop: "1px solid rgba(10,10,11,0.08)",
      }}
    >
      <div
        className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        {/* Logo wordmark */}
        <Link
          href="/"
          className="font-sans font-semibold text-[15px] tracking-tight"
          style={{ color: "#0a0a0b", letterSpacing: "-0.02em" }}
        >
          FairWork
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[13px] font-sans transition-colors duration-150"
              style={{ color: "rgba(10,10,11,0.45)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-[12px] font-sans" style={{ color: "rgba(10,10,11,0.30)" }}>
          © {new Date().getFullYear()} FairWork
        </p>
      </div>
    </footer>
  );
}
