"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Browse Jobs",    href: "/jobs"             },
  { label: "How It Works",   href: "#how-it-works"     },
  { label: "Become a Juror", href: "/jurors/register"  },
];

export default function LandingNavbar() {
  // "dark" = over the dark hero → text should be white
  // "light" = over white sections → text should be #0a0a0b
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-section='hero']");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the hero is no longer intersecting the top ~30% of viewport → light nav
        setTheme(entry.isIntersecting ? "dark" : "light");
      },
      { threshold: 0.15 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const isDark = theme === "dark";
  const textColor = isDark ? "rgba(255,255,255,0.92)" : "#0a0a0b";
  const mutedColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(10,10,11,0.50)";
  const signUpBg   = isDark ? "rgba(255,255,255,1)"  : "#0a0a0b";
  const signUpText = isDark ? "#0a0a0b" : "#ffffff";
  const logInHover = isDark ? "rgba(255,255,255,0.10)" : "rgba(10,10,11,0.06)";

  return (
    <header
      className="sticky top-0 z-50 -mb-[72px]"
      style={{
        height: 72,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        alignItems: "center",
        padding: "0 32px",
        background: "transparent",
        color: textColor,
        transition: "color 0.5s ease",
        /* isolate so backdrop-filter children don't bleed */
        isolation: "isolate",
      }}
    >
      {/* ── Left: Logo + nav links ── */}
      <div className="flex items-center gap-6">
        {/* Logo wordmark */}
        <Link
          href="/"
          className="font-semibold text-[16px] tracking-tight"
          style={{ color: textColor, letterSpacing: "-0.03em", transition: "color 0.5s ease" }}
        >
          FairWork
        </Link>

        {/* Nav links */}
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden md:block text-[14px] font-medium transition-opacity duration-150 hover:opacity-70"
            style={{ color: textColor, transition: "color 0.5s ease, opacity 0.15s ease" }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* ── Center: empty (or search on inner pages) ── */}
      <div />

      {/* ── Right: Log in + Sign up ── */}
      <div className="flex items-center gap-2 justify-end">
        <Link
          href="/register"
          className="hidden sm:inline-flex items-center px-4 py-3 rounded-full text-[14px] font-medium transition-all duration-150"
          style={{
            color: mutedColor,
            transition: "color 0.5s ease, background 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = logInHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Log in
        </Link>

        <Link
          href="/register"
          className="inline-flex items-center px-4 py-3 rounded-full text-[14px] font-medium transition-all duration-300"
          style={{
            background: signUpBg,
            color: signUpText,
            transition: "background 0.5s ease, color 0.5s ease",
            fontWeight: 520,
          }}
        >
          Sign up
        </Link>
      </div>
    </header>
  );
}
