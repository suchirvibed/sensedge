"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft, IconArrowRight, IconQuote } from "@tabler/icons-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

const ITEMS = [
  {
    quote:
      "PrintCard turned a two-week back-and-forth with our old vendor into a one-evening job. The designer is genuinely the best we've tried.",
    name: "Priya Nair",
    role: "HR Lead",
    company: "Lumen Health, Bengaluru",
  },
  {
    quote:
      "We ordered 850 RFID cards for our staff and got them in four days. Print quality is excellent — the chips worked first try.",
    name: "Rohan Mehta",
    role: "Operations Manager",
    company: "Devraj Industries",
  },
  {
    quote:
      "Our school IDs used to be a nightmare every year. Now I upload the student CSV, hit print, and they show up. Saved my August.",
    name: "Aisha Khan",
    role: "Admin",
    company: "Bright Horizons Academy",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const total = ITEMS.length;
  const active = ITEMS[i];

  return (
    <section className="bg-bg-page section-pad">
      <div className="container-px mx-auto max-w-container">
        <SectionHeading eyebrow="TESTIMONIALS" title="Trusted by teams across India" />

        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* Quote */}
          <div className="min-h-[260px]">
            <IconQuote size={42} className="text-orange" />
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug text-text-primary md:text-3xl">
                  &ldquo;{active.quote}&rdquo;
                </blockquote>
                <div className="mt-7">
                  <div className="font-semibold text-text-primary">{active.name}</div>
                  <div className="text-sm text-text-muted">
                    {active.role} · {active.company}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-start gap-6 lg:items-end">
            <div className="font-display text-5xl font-extrabold tracking-tight text-text-primary">
              {String(i + 1).padStart(2, "0")}
              <span className="text-text-muted">/{String(total).padStart(2, "0")}</span>
            </div>
            <div className="flex gap-3">
              <button
                aria-label="Previous"
                onClick={() => setI((p) => (p - 1 + total) % total)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-text-primary transition hover:bg-text-primary hover:text-white"
              >
                <IconArrowLeft size={18} />
              </button>
              <button
                aria-label="Next"
                onClick={() => setI((p) => (p + 1) % total)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-orange text-white transition hover:bg-orange-dark"
              >
                <IconArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
