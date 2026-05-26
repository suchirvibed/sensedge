"use client";

/**
 * Three product collages for the hero carousel.
 * Built as CSS-art mockups so they look refined out-of-the-box; swap any
 * inner `<div>` for an `<img>` of a real product photo when you have them.
 */

import { motion, useReducedMotion } from "framer-motion";

// ───── 1. Cards ─────────────────────────────────────────
export function CardsCollage() {
  const prefersReduced = useReducedMotion();
  const float = (delay: number) =>
    prefersReduced
      ? {}
      : {
          animate: { y: [0, -6, 0] },
          transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const, delay },
        };

  return (
    <div className="relative aspect-square w-full">
      {/* Back card — Membership (purple gradient) */}
      <motion.div
        {...float(0.6)}
        className="absolute left-[6%] top-[8%] aspect-[1.6/1] w-[58%] rotate-[-10deg] rounded-card bg-gradient-to-br from-violet-500 to-indigo-700 p-5 text-white shadow-hover ring-card"
      >
        <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/70">
          Member
        </div>
        <div className="mt-1 font-display text-[18px] font-bold tracking-tight">
          Priya Nair
        </div>
        <div className="mt-0.5 text-[10px] text-white/60">Lumen Club · Gold</div>
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
          <div className="font-mono text-[9px] tracking-widest text-white/60">
            MEM-009021
          </div>
          <div className="h-4 w-9 rounded-sm bg-gradient-to-tr from-amber-300 to-amber-500" />
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-10 rounded-bl-card bg-orange" />
      </motion.div>

      {/* Middle card — Visitor (light) */}
      <motion.div
        {...float(0.3)}
        className="absolute right-[4%] top-[20%] aspect-[1.6/1] w-[56%] rotate-[8deg] rounded-card bg-white p-5 shadow-hover ring-card"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-text-muted">
              Visitor
            </div>
            <div className="mt-1 font-display text-[18px] font-bold tracking-tight text-text-primary">
              Day Pass
            </div>
            <div className="mt-0.5 text-[10px] text-text-muted">26 May 2026</div>
          </div>
          {/* QR placeholder */}
          <div className="grid h-10 w-10 grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className={
                  [0, 2, 3, 5, 7, 8, 10, 13, 15].includes(i)
                    ? "bg-text-primary"
                    : "bg-white"
                }
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
          <div className="font-mono text-[9px] tracking-widest text-text-muted">
            VST-220031
          </div>
          <div className="h-4 w-9 rounded-sm bg-bg-subtle" />
        </div>
      </motion.div>

      {/* Front card — Employee ID (dark, branded) */}
      <motion.div
        {...float(0)}
        className="absolute left-[14%] top-[42%] aspect-[1.6/1] w-[64%] rotate-[-3deg] rounded-card bg-text-primary p-5 text-white shadow-hover ring-1 ring-white/5"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Employee
            </div>
            <div className="mt-1 font-display text-[20px] font-bold tracking-tight">
              Aarav Sharma
            </div>
            <div className="mt-0.5 text-[10px] text-white/55">Product · Bengaluru</div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M7 16h4" />
            </svg>
          </div>
        </div>
        <div className="mt-5 flex items-end gap-3">
          <div className="h-12 w-12 rounded bg-white/[0.06]" />
          <div className="flex-1 space-y-1 pb-1">
            <div className="h-1 w-3/4 rounded bg-white/10" />
            <div className="h-1 w-1/2 rounded bg-white/10" />
            <div className="h-1 w-2/3 rounded bg-white/10" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-10 rounded-bl-card bg-orange" />
      </motion.div>
    </div>
  );
}

// ───── 2. Lanyards ───────────────────────────────────────
export function LanyardsCollage() {
  const prefersReduced = useReducedMotion();
  const sway = (delay: number) =>
    prefersReduced
      ? {}
      : {
          animate: { rotate: [-1.2, 1.2, -1.2] },
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay },
        };

  const LANYARDS = [
    {
      strap: "bg-orange",
      title: "Tech Summit",
      sub: "All Access",
      id: "TS-441",
      left: "6%",
      delay: 0,
      scale: "scale-95",
    },
    {
      strap: "bg-text-primary",
      title: "Lumen Health",
      sub: "Staff",
      id: "LH-198",
      left: "38%",
      delay: 0.4,
      scale: "scale-100",
    },
    {
      strap: "bg-tint-blueText",
      title: "Bright Horizons",
      sub: "Faculty",
      id: "BH-072",
      left: "70%",
      delay: 0.2,
      scale: "scale-95",
    },
  ];

  return (
    <div className="relative aspect-square w-full">
      {LANYARDS.map((l, i) => (
        <motion.div
          key={i}
          {...sway(l.delay)}
          className={`absolute top-0 ${l.scale}`}
          style={{ left: l.left, transformOrigin: "top center" }}
        >
          {/* Strap */}
          <div className={`mx-auto h-20 w-2 ${l.strap}`} />
          {/* Clip */}
          <div className="mx-auto h-2 w-6 -translate-y-1 rounded-sm bg-text-muted/40 ring-1 ring-text-primary/10" />
          {/* Hole punch */}
          <div className="mx-auto -mt-0.5 h-1.5 w-3 rounded-full bg-text-primary/15" />
          {/* Card */}
          <div className="mt-1 aspect-[0.62] w-[110px] rounded-md bg-white p-2.5 shadow-hover ring-card">
            <div className="text-[7px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              ID
            </div>
            <div className="mt-1 font-display text-[10px] font-bold leading-tight tracking-tight text-text-primary">
              {l.title}
            </div>
            <div className="text-[7px] text-text-muted">{l.sub}</div>
            <div className="mt-3 h-12 w-full rounded-sm bg-bg-subtle" />
            <div className="mt-2 flex items-center justify-between">
              <div className="font-mono text-[6px] tracking-widest text-text-muted">
                {l.id}
              </div>
              <div className="h-1.5 w-3 rounded-sm bg-gradient-to-tr from-amber-300 to-amber-500" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ───── 3. NFC / Premium materials ────────────────────────
export function NfcCollage() {
  const prefersReduced = useReducedMotion();
  const float = (delay: number) =>
    prefersReduced
      ? {}
      : {
          animate: { y: [0, -6, 0] },
          transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const, delay },
        };

  return (
    <div className="relative aspect-square w-full">
      {/* Wooden card — back */}
      <motion.div
        {...float(0.6)}
        className="absolute left-[4%] top-[6%] aspect-[1.6/1] w-[58%] rotate-[-9deg] overflow-hidden rounded-card p-5 shadow-hover ring-card"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #8b5a2b 0px, #8b5a2b 1px, transparent 1px, transparent 6px), linear-gradient(135deg, #b58455 0%, #8b5a2b 100%)",
        }}
      >
        <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/75">
          Wooden
        </div>
        <div className="mt-1 font-display text-[16px] font-bold tracking-tight text-white">
          Premium
        </div>
        <div className="absolute bottom-4 right-4">
          <NfcWaves color="rgba(255,255,255,0.85)" />
        </div>
      </motion.div>

      {/* Metal card — middle (dark gradient + brushed) */}
      <motion.div
        {...float(0.3)}
        className="absolute right-[4%] top-[20%] aspect-[1.6/1] w-[58%] rotate-[10deg] overflow-hidden rounded-card p-5 shadow-hover ring-1 ring-white/10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px), linear-gradient(135deg, #2a2a2e 0%, #0a0a0a 100%)",
        }}
      >
        <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/55">
          Metal
        </div>
        <div className="mt-1 font-display text-[16px] font-bold tracking-tight text-white">
          Black Edition
        </div>
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div className="font-mono text-[9px] tracking-widest text-white/55">
            ●●●● 4096
          </div>
          <NfcWaves color="rgba(232,93,4,0.9)" />
        </div>
      </motion.div>

      {/* LED card — front */}
      <motion.div
        {...float(0)}
        className="absolute left-[14%] top-[44%] aspect-[1.6/1] w-[64%] overflow-hidden rotate-[-3deg] rounded-card bg-bg-darker p-5 shadow-hover ring-1 ring-orange/30"
      >
        {/* glow */}
        <div className="pointer-events-none absolute -bottom-12 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-orange/35 blur-3xl" />
        <div className="relative">
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-orange">
            LED edition
          </div>
          <div className="mt-1 font-display text-[18px] font-bold tracking-tight text-white">
            Glow Card
          </div>
          <div className="mt-0.5 text-[10px] text-white/55">
            Touch to illuminate
          </div>
        </div>
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
          {/* tiny LED dots */}
          <div className="flex gap-1">
            <Led />
            <Led delay={0.2} />
            <Led delay={0.4} />
          </div>
          <NfcWaves color="rgba(255,255,255,0.85)" />
        </div>
      </motion.div>
    </div>
  );
}

function NfcWaves({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 8 Q4 12, 6 16"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 6 Q6 12, 10 18"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 4 Q8 12, 14 20"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Led({ delay = 0 }: { delay?: number }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.span
      animate={prefersReduced ? undefined : { opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay }}
      className="h-1.5 w-1.5 rounded-full bg-orange"
      style={{ boxShadow: "0 0 8px rgba(232,93,4,0.8)" }}
    />
  );
}
