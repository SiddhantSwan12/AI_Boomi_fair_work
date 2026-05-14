"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useGSAP } from "@/hooks/useGSAP";

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface GalleryItem {
  src: string;
  alt: string;
  label: string;
  tall: boolean;
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const GALLERY_ITEMS: GalleryItem[] = [
  { src: "/images/landing/studio.png",                alt: "Studio workspace",   label: "Studio",      tall: true  },
  { src: "/assets/hero/futuristic-molecular-art.png", alt: "Molecular network",  label: "Protocol",    tall: false },
  { src: "/images/landing/workspace.png",             alt: "Workspace",          label: "Workspace",   tall: false },
  { src: "/assets/hero/global-connectivity-art.png",  alt: "Global network",     label: "Network",     tall: true  },
  { src: "/images/landing/trio.png",                  alt: "Team collaboration", label: "Community",   tall: false },
  { src: "/images/landing/soundwave.png",             alt: "Communication",      label: "Communicate", tall: false },
];

/* ─── Easing constant ─────────────────────────────────────────────────────── */
const EXPO_OUT = [0.22, 1, 0.36, 1] as const;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function CosmosGallerySection() {
  const sectionRef = useRef<HTMLElement>(null);

  /* GSAP — header scroll-scrub reveal */
  useGSAP((gsap) => {
    gsap.fromTo(
      ".gallery-header-cosmos",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: ".gallery-header-cosmos",
          start: "top 82%",
          end: "top 50%",
          scrub: 0.7,
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0a0a0b] py-28 md:py-40 px-5 sm:px-8 overflow-hidden"
    >
      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(29,191,115,0.03) 0%, transparent 68%)",
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="gallery-header-cosmos mx-auto max-w-5xl mb-14 md:mb-20">
        <p className="text-[10px] tracking-[0.22em] uppercase text-white/30 mb-5">
          Platform
        </p>

        <h2
          className="font-editorial font-light leading-[1.18] tracking-[-0.025em] text-white"
          style={{ fontSize: "clamp(2.4rem, 5.5vw, 5.2rem)" }}
        >
          Built for the web3 era.{" "}
          <em className="not-italic font-editorial font-light italic text-white/70">
            Crafted for creators.
          </em>
        </h2>
      </div>

      {/* ── Masonry grid ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {GALLERY_ITEMS.map((item, index) => (
          <GalleryCard key={item.src} item={item} index={index} />
        ))}
      </div>

      {/* ── Bottom note ────────────────────────────────────────────────────── */}
      <p className="mt-14 text-center text-[11px] tracking-[0.14em] text-white/20 uppercase">
        Your project. Protected.
      </p>
    </section>
  );
}

/* ─── GalleryCard ─────────────────────────────────────────────────────────── */
function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.9,
        ease: EXPO_OUT,
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.5, ease: EXPO_OUT },
      }}
      style={{
        aspectRatio: item.tall ? "4/5" : "1/1",
        position: "relative",
        overflow: "hidden",
        borderRadius: "1rem",
        cursor: "pointer",
      }}
    >
      {/* Image */}
      <Image
        src={item.src}
        alt={item.alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* Dark gradient overlay — fades in on hover */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.20) 40%, transparent 100%)",
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      {/* Label — fades in on hover */}
      <motion.span
        className="absolute bottom-4 left-4 font-editorial italic text-white text-[15px] pointer-events-none"
        initial={{ opacity: 0, y: 6 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {item.label}
      </motion.span>
    </motion.div>
  );
}
