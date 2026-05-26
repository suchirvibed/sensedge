"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import {
  CardsCollage,
  LanyardsCollage,
  NfcCollage,
} from "@/components/marketing/HeroCollages";

const eased = [0.22, 1, 0.36, 1] as const;

type SlideKind = "cards" | "lanyards" | "nfc";

interface Slide {
  kind: SlideKind;
  badge: string;
  title: React.ReactNode;
  description: string;
  primaryBtn: { label: string; href: string };
  secondaryBtn: { label: string; href: string };
}

const SLIDES: Slide[] = [
  {
    kind: "cards",
    badge: "ID & business cards",
    title: (
      <>
        Start designing <span className="text-orange">cards</span> in minutes.
      </>
    ),
    description:
      "Employee IDs, business cards, memberships and visitor passes — printed on PVC and shipped across India in 3–5 days.",
    primaryBtn: { label: "Start designing", href: "/designer/new" },
    secondaryBtn: { label: "Browse templates", href: "/templates" },
  },
  {
    kind: "lanyards",
    badge: "Lanyards",
    title: (
      <>
        Branded <span className="text-orange">lanyards</span> for every event.
      </>
    ),
    description:
      "Custom-printed lanyards in any colour with your logo. Pair them with badges, IDs or RFID cards — ready for staff, students or attendees.",
    primaryBtn: { label: "Customise lanyards", href: "/designer/new?type=lanyard" },
    secondaryBtn: { label: "See colour options", href: "/pricing#lanyards" },
  },
  {
    kind: "nfc",
    badge: "NFC · Metal · Wooden · LED",
    title: (
      <>
        Premium <span className="text-orange">NFC cards</span> in metal, wood &amp; LED.
      </>
    ),
    description:
      "Make a real impression — programmable NFC chips inside metal, wooden and light-up cards. Perfect for executives, networking and exclusive memberships.",
    primaryBtn: { label: "Explore premium", href: "/designer/new?type=nfc" },
    secondaryBtn: { label: "How NFC works", href: "/about#nfc" },
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

  // Auto-rotate; pause on tab hidden
  useEffect(() => {
    if (prefersReduced) return;
    const timer = setInterval(() => paginate(1), 7000);
    return () => clearInterval(timer);
  }, [paginate, prefersReduced]);

  const slide = SLIDES[current];

  return (
    <section className="relative flex min-h-[700px] items-center overflow-hidden bg-bg-page">
      {/* Faint geometric grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container-px relative mx-auto w-full max-w-container py-24 md:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Left — content */}
          <div className="relative min-h-[440px]">
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

                <h1 className="display mt-6 text-text-primary">{slide.title}</h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-text-body md:text-lg">
                  {slide.description}
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <LinkButton href={slide.primaryBtn.href} variant="primary" size="lg" showArrow>
                    {slide.primaryBtn.label}
                  </LinkButton>
                  <LinkButton href={slide.secondaryBtn.href} variant="outline" size="lg">
                    {slide.secondaryBtn.label}
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
                    <Dot /> 25–10,000 units
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — collage */}
          <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, scale: 0.92, rotate: direction > 0 ? 4 : -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.92, rotate: direction > 0 ? -4 : 4 }}
                transition={{ duration: 0.55, ease: eased }}
                className="relative h-full w-full"
              >
                {slide.kind === "cards" && <CardsCollage />}
                {slide.kind === "lanyards" && <LanyardsCollage />}
                {slide.kind === "nfc" && <NfcCollage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="mt-10 flex items-center justify-center gap-2 lg:justify-start">
          {SLIDES.map((s, i) => (
            <button
              key={s.kind}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-orange" : "w-1.5 bg-text-hint hover:bg-text-muted"
              }`}
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
