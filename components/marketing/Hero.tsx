"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";

const eased = [0.22, 1, 0.36, 1] as const;

const SLIDES = [
  {
    badge: "Corporate IDs",
    title: (
      <>
        Professional <span className="text-orange">ID Cards</span> for your whole team.
      </>
    ),
    description:
      "High-quality plastic cards with premium finishes. Perfect for offices, co-working spaces, and corporate events across India.",
    primaryBtn: "Start designing",
    secondaryBtn: "View pricing",
    mockup: {
      type: "employee",
      name: "Aarav Sharma",
      dept: "Product · Bengaluru",
      id: "PCO-000142",
      color: "from-amber-200 to-amber-400",
    },
  },
  {
    badge: "NFC & RFID",
    title: (
      <>
        Next-gen <span className="text-orange">Smart Cards</span> for seamless access.
      </>
    ),
    description:
      "Programmed NFC and RFID cards for secure entry, digital business cards, or event check-ins. Designed in minutes.",
    primaryBtn: "Create smart card",
    secondaryBtn: "How it works",
    mockup: {
      type: "access",
      name: "Tech Summit 2026",
      dept: "All Access Pass",
      id: "NFC-772910",
      color: "from-blue-400 to-indigo-500",
    },
  },
  {
    badge: "Institutions",
    title: (
      <>
        Durable <span className="text-orange">Student IDs</span> for schools & colleges.
      </>
    ),
    description:
      "Bulk ordering made simple. Durable, scratch-resistant cards that withstand daily use by students and faculty.",
    primaryBtn: "Bulk inquiry",
    secondaryBtn: "See samples",
    mockup: {
      type: "student",
      name: "Ishani Gupta",
      dept: "Class XII-B · Delhi",
      id: "STU-992011",
      color: "from-emerald-400 to-teal-500",
    },
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReduced = useReducedMotion();

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  const slide = SLIDES[current];

  return (
    <section className="relative overflow-hidden bg-bg-page min-h-[700px] flex items-center">
      {/* Faint geometric grid for subtle texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container-px relative mx-auto max-w-container py-24 md:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Left — content */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
                transition={{ duration: 0.5, ease: eased }}
                className="flex flex-col items-start"
              >
                <div className="inline-flex items-center gap-2 rounded-badge border border-border bg-white py-1.5 pl-1.5 pr-3 text-xs font-medium text-text-body shadow-card">
                  <span className="rounded-badge bg-orange-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-orange">
                    {slide.badge}
                  </span>
                  Ready to ship in 3–5 days
                </div>

                <h1 className="display mt-6 text-text-primary">
                  {slide.title}
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-text-body md:text-lg">
                  {slide.description}
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
                    {slide.primaryBtn}
                  </LinkButton>
                  <LinkButton href="/templates" variant="outline" size="lg">
                    {slide.secondaryBtn}
                  </LinkButton>
                </div>

                <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-text-muted">
                  <span className="flex items-center gap-2">
                    <Dot /> No design experience required
                  </span>
                  <span className="flex items-center gap-2">
                    <Dot /> Free shipping above ₹500
                  </span>
                  <span className="flex items-center gap-2">
                    <Dot /> 25–10,000 cards
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — card mockup */}
          <div className="relative mx-auto w-full max-w-md h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, scale: 0.9, rotate: direction > 0 ? 5 : -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: direction > 0 ? -5 : 5 }}
                transition={{ duration: 0.6, ease: eased }}
                className="relative w-full"
              >
                {/* Back layer */}
                <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-[4deg] rounded-card bg-bg-dark/95 ring-card" />

                {/* Front card */}
                <motion.div
                  animate={
                    prefersReduced
                      ? undefined
                      : { rotate: [-1.2, 0.8, -1.2], y: [0, -4, 0] }
                  }
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative aspect-[1.6/1] w-full rounded-card bg-white p-6 shadow-hover ring-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                        {slide.mockup.type}
                      </div>
                      <div className="mt-1.5 font-display text-[26px] font-bold leading-tight tracking-tight text-text-primary">
                        {slide.mockup.name}
                      </div>
                      <div className="mt-0.5 text-xs text-text-muted">
                        {slide.mockup.dept}
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-text-primary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4">
                        <rect x="3" y="6" width="18" height="13" rx="2" />
                        <path d="M7 16h4" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end gap-4">
                    <div className="h-16 w-16 rounded-md bg-bg-subtle" />
                    <div className="flex-1 space-y-1.5 pb-1">
                      <div className="h-1.5 w-3/4 rounded-full bg-bg-subtle" />
                      <div className="h-1.5 w-1/2 rounded-full bg-bg-subtle" />
                      <div className="h-1.5 w-2/3 rounded-full bg-bg-subtle" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="font-mono text-[10px] tracking-widest text-text-muted">
                      {slide.mockup.id}
                    </div>
                    <div className={`h-5 w-12 rounded-sm bg-gradient-to-tr ${slide.mockup.color}`} />
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 w-12 rounded-bl-card bg-orange" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="mt-12 flex justify-center gap-2.5">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > current ? 1 : -1);
                setCurrent(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current ? "w-8 bg-orange" : "w-1.5 bg-border hover:bg-text-muted"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-orange" />;
}

