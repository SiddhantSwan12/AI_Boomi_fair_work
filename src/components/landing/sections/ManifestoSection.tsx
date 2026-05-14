const LINES = [
  {
    eyebrow: "Trust layer",
    text: "Trust isn't assumed. It's built.",
    accent: "from-[#7FE0B0]/24",
  },
  {
    eyebrow: "Payment rail",
    text: "Escrow protects the promise.",
    accent: "from-[#0F9EAC]/24",
  },
  {
    eyebrow: "Resolution",
    text: "AI helps resolve the hard moments.",
    accent: "from-[#B98512]/20",
  },
  {
    eyebrow: "FairWork",
    text: "Freelance work, made fair.",
    accent: "from-[#7FE0B0]/20",
  },
] as const;

export default function ManifestoSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#050907] text-white"
      aria-label="FairWork product principles"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      {LINES.map((line, i) => (
        <div
          key={line.text}
          className="manifesto-screen relative px-5"
          style={{ minHeight: "112vh" }}
        >
          <div className="sticky top-0 flex h-screen items-center justify-center">
            <div className="relative mx-auto max-w-5xl text-center">
              <div className={`absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${line.accent} to-transparent blur-3xl`} />
              <div className="relative">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 backdrop-blur-xl">
                  <span className="h-2 w-2 rounded-full bg-[#7FE0B0]" />
                  <span className="text-xs font-bold uppercase text-white/62" style={{ letterSpacing: 0 }}>
                    {line.eyebrow} / 0{i + 1}
                  </span>
                </div>
                <h2
                  className="font-black text-white"
                  style={{
                    fontSize: "clamp(42px, 7vw, 104px)",
                    lineHeight: 0.96,
                    letterSpacing: "-0.055em",
                    textShadow: "0 24px 90px rgba(0,0,0,0.45)",
                  }}
                >
                  {line.text}
                </h2>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
