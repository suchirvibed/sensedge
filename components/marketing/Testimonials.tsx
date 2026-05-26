"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

const ITEMS = [
  {
    quote:
      "PrintCard turned a two-week back-and-forth with our old vendor into a one-evening job. The designer is genuinely the best we've tried.",
    name: "Priya Nair",
    role: "HR Lead",
    company: "Lumen Health · Bengaluru",
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
        <SectionHeading eyebrow="Testimonials" title="Trusted by teams across India." />

        <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Quote card */}
          <div className="relative min-h-[280px] rounded-card border border-border bg-white p-10">
            <span className="absolute left-10 top-10 font-display text-7xl leading-none text-orange/15">
              &ldquo;
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <blockquote className="font-display text-xl font-medium leading-snug text-text-primary md:text-2xl">
                  {active.quote}
                </blockquote>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-tint text-sm font-bold text-orange">
                    {active.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{active.name}</div>
                    <div className="text-xs text-text-muted">
                      {active.role} · {active.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-start gap-6 lg:items-end">
            <div className="font-mono text-sm tracking-widest text-text-muted">
              <span className="text-text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span> / {String(total).padStart(2, "0")}</span>
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Previous"
                onClick={() => setI((p) => (p - 1 + total) % total)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-primary transition hover:border-text-primary hover:bg-bg-subtle"
              >
                <IconArrowLeft size={16} />
              </button>
              <button
                aria-label="Next"
                onClick={() => setI((p) => (p + 1) % total)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-text-primary text-white transition hover:bg-orange"
              >
                <IconArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
