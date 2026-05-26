"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { IconCheck } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/shared/Reveal";

const FEATURES = [
  "Drag & drop with snap-to-grid",
  "50+ fonts and thousands of icons",
  "RFID, NFC & LED chip options",
  "Bulk pricing calculated live",
];

export function DesignerPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [30, -30]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-bg-dark section-pad text-white"
    >
      <div className="container-px relative mx-auto grid max-w-container items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        {/* Text */}
        <Reveal>
          <div className="eyebrow mb-4">The designer</div>
          <h2 className="h2 max-w-md text-white">
            A full design studio, built into your browser.
          </h2>

          <ul className="mt-8 space-y-3.5">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 text-white/80"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 text-orange">
                  <IconCheck size={12} strokeWidth={3} />
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

        {/* Mockup */}
        <motion.div style={{ y }} className="relative">
          <Reveal y={32} duration={0.8}>
            <div className="rounded-card border border-white/10 bg-bg-darker p-2 shadow-hover">
              {/* fake toolbar */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  designer · untitled
                </div>
                <div className="h-6 w-20 rounded bg-orange/90 text-center text-[10px] font-semibold leading-6 text-white">
                  Order
                </div>
              </div>

              <div className="flex h-72 gap-2 p-2 sm:h-80">
                <div className="hidden w-40 rounded bg-white/[0.03] p-3 text-[10px] uppercase tracking-widest text-white/40 sm:block">
                  <div className="mb-2 text-white/60">Fields</div>
                  <div className="space-y-1.5">
                    <div className="h-5 rounded bg-white/[0.06]" />
                    <div className="h-5 rounded bg-white/[0.06]" />
                    <div className="h-5 w-3/4 rounded bg-white/[0.06]" />
                  </div>
                </div>
                <div className="relative flex flex-1 items-center justify-center rounded bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:16px_16px]">
                  <motion.div
                    animate={prefersReduced ? undefined : { y: [0, -4, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative aspect-[1.6/1] w-3/4 rounded-md bg-white shadow-2xl"
                  >
                    <div className="absolute left-4 top-4 h-2.5 w-24 rounded bg-bg-subtle" />
                    <div className="absolute left-4 top-8 h-1.5 w-16 rounded bg-bg-subtle" />
                    <div className="absolute bottom-4 left-4 h-9 w-9 rounded-md bg-bg-subtle" />
                    <div className="absolute bottom-4 right-4 h-4 w-10 rounded-sm bg-gradient-to-tr from-amber-200 to-amber-400" />
                    <div className="absolute bottom-0 left-0 h-1 w-10 rounded-bl-md bg-orange" />
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
