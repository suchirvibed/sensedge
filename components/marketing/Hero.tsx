"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  const prefersReduced = useReducedMotion();

  const eased = [0.22, 1, 0.36, 1] as const;

  const wordVariants = (delay: number) => ({
    hidden: { opacity: 0, y: prefersReduced ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay, ease: eased },
    },
  });

  return (
    <section className="relative overflow-hidden bg-bg-page">
      {/* Soft orange glow blob bottom-left for depth */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-orange/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[360px] w-[360px] rounded-full bg-orange/5 blur-3xl" />

      <div className="container-px relative mx-auto max-w-container pt-24 pb-32 md:pt-32 md:pb-40">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
          {/* Left */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: eased }}
              className="eyebrow text-text-muted"
            >
              <span className="text-orange">■</span> SMART CARDS · ID CARDS · RFID
            </motion.span>

            <h1 className="display mt-6 text-text-primary">
              <motion.span
                className="block overflow-hidden"
                initial="hidden"
                animate="show"
                variants={wordVariants(0.1)}
              >
                Design.
              </motion.span>
              <motion.span
                className="block overflow-hidden"
                initial="hidden"
                animate="show"
                variants={wordVariants(0.22)}
              >
                Print.
              </motion.span>
              <motion.span
                className="block overflow-hidden text-orange"
                initial="hidden"
                animate="show"
                variants={wordVariants(0.34)}
              >
                Deliver.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: eased }}
              className="mt-7 max-w-xl text-lg text-text-body"
            >
              Professional cards for businesses, schools and organisations — designed
              in minutes, printed and delivered to your door.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.62, ease: eased }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
                Start designing
              </LinkButton>
              <LinkButton href="/templates" variant="outline" size="lg">
                View templates
              </LinkButton>
            </motion.div>
          </div>

          {/* Right — floating CSS card mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: eased }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative aspect-[1.6/1] w-full">
              {/* back card — slow float */}
              <motion.div
                animate={
                  prefersReduced
                    ? undefined
                    : { y: [0, -10, 0], rotate: [6, 7.5, 6] }
                }
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 translate-x-4 translate-y-4 rounded-card bg-bg-dark shadow-hover"
              />
              {/* front card — opposite float */}
              <motion.div
                animate={
                  prefersReduced ? undefined : { y: [0, -16, 0], rotate: [-3, -1.8, -3] }
                }
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="relative h-full w-full -rotate-[3deg] rounded-card bg-white p-6 shadow-hover ring-1 ring-black/5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                      Employee ID
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tracking-tight text-text-primary">
                      Aarav Sharma
                    </div>
                    <div className="text-xs text-text-muted">Product · Bengaluru</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <rect x="3" y="6" width="18" height="13" rx="2" />
                      <path d="M7 16h4" />
                    </svg>
                  </div>
                </div>

                <div className="mt-6 flex items-end gap-4">
                  <div className="h-16 w-16 rounded-md bg-bg-page ring-1 ring-black/5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-1.5 w-3/4 rounded bg-bg-page" />
                    <div className="h-1.5 w-1/2 rounded bg-bg-page" />
                    <div className="h-1.5 w-2/3 rounded bg-bg-page" />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-[10px] font-mono tracking-widest text-text-muted">
                    ID · PCO-000142
                  </div>
                  <div className="h-5 w-12 rounded-sm bg-gradient-to-tr from-amber-300 to-amber-500" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.a
          href="#after-hero"
          aria-label="Scroll down"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-text-muted md:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.22em]">Scroll</span>
          <motion.span
            animate={prefersReduced ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="block h-6 w-px bg-text-primary/40"
          />
        </motion.a>
      </div>
    </section>
  );
}
