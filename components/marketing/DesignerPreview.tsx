"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { IconCheck } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/shared/Reveal";

const FEATURES = [
  "Drag & drop, snap-to-grid",
  "50+ fonts and 1000s of icons",
  "RFID, NFC & LED chip options",
  "Bulk pricing built in",
];

export function DesignerPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Subtle parallax on the mockup
  const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [40, -40]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-bg-darker section-pad text-white"
    >
      <div className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-orange/10 blur-3xl" />

      <div className="container-px relative mx-auto grid max-w-container items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
        {/* Text */}
        <Reveal>
          <span className="eyebrow text-white/60">
            <span className="text-orange">■</span> THE DESIGNER
          </span>
          <h2 className="h2 mt-3 text-white">
            A full design studio,
            <br />
            in your browser.
          </h2>
          <hr className="orange-divider" />

          <ul className="mt-8 space-y-3">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 text-white/85"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange/20 text-orange">
                  <IconCheck size={14} />
                </span>
                <span className="text-sm">{f}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-10">
            <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
              Try the designer
            </LinkButton>
          </div>
        </Reveal>

        {/* Mockup with parallax */}
        <motion.div style={{ y }} className="relative">
          <Reveal y={48} duration={0.9}>
            <div className="rounded-card bg-canvas p-2 shadow-[0_0_60px_-10px_rgba(232,93,4,0.6)] ring-1 ring-orange/40">
              {/* fake toolbar */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  designer · untitled
                </div>
                <div className="h-6 w-20 rounded bg-orange/90" />
              </div>

              {/* fake canvas area */}
              <div className="flex h-72 gap-2 p-2 sm:h-80">
                <div className="hidden w-40 rounded bg-white/5 p-3 text-[10px] uppercase tracking-widest text-white/40 sm:block">
                  <div className="mb-2 text-white/60">Fields</div>
                  <div className="space-y-1.5">
                    <div className="h-5 rounded bg-white/10" />
                    <div className="h-5 rounded bg-white/10" />
                    <div className="h-5 w-3/4 rounded bg-white/10" />
                  </div>
                </div>
                <div className="relative flex flex-1 items-center justify-center rounded bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:18px_18px]">
                  <motion.div
                    animate={prefersReduced ? undefined : { y: [0, -6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative aspect-[1.6/1] w-3/4 rounded-md bg-white shadow-2xl ring-2 ring-orange/70"
                  >
                    <div className="absolute left-4 top-4 h-3 w-24 rounded bg-bg-page" />
                    <div className="absolute left-4 top-9 h-2 w-16 rounded bg-bg-page" />
                    <div className="absolute bottom-4 left-4 h-10 w-10 rounded-md bg-bg-page" />
                    <div className="absolute bottom-4 right-4 h-5 w-12 rounded-sm bg-gradient-to-tr from-amber-300 to-amber-500" />
                  </motion.div>
                </div>
              </div>
            </div>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
