"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import {
  CardTypePreview,
  type CardKind,
} from "@/components/marketing/CardTypePreview";
import {
  SERVICE_CARD_ICON_BG,
  type ServiceCardDetails,
} from "@/components/shared/ServiceCard";

export interface PreviewCard {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "orange" | "blue" | "purple" | "green" | "neutral";
  href?: string;
  kind: CardKind;
  details: ServiceCardDetails;
}

interface Props {
  /** The card currently being previewed. `null` means the overlay is closed. */
  card: PreviewCard | null;
  /** Index of the active card (used as React key for cross-fade between cards). */
  activeIndex: number | null;
  onEnter: () => void;
  onLeave: () => void;
  onClose: () => void;
}

// Easing & timings — slow enough to feel intentional, fast enough to not drag.
const EASE = [0.16, 1, 0.3, 1] as const;

export function CardPreviewOverlay({
  card,
  activeIndex,
  onEnter,
  onLeave,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop — click closes; mouse enter also closes
              (cursor-on-backdrop means user is "outside the page"). */}
          <div
            onClick={onClose}
            onMouseEnter={onLeave}
            className="absolute inset-0 cursor-default bg-bg-darker/55 backdrop-blur-sm"
          />

          {/* Panel — animates scale + y for substantial entrance.
              Hover events keep the close timer cancelled while
              the cursor is inside. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{
              duration: 0.42,
              ease: EASE,
              opacity: { duration: 0.28 },
            }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-card bg-white shadow-hover"
            role="dialog"
            aria-modal="true"
            aria-label={`${card.title} preview`}
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/90 text-text-muted transition hover:border-text-primary hover:text-text-primary"
            >
              <IconX size={16} />
            </button>

            {/* Content — cross-fades when switching between cards.
                The outer panel stays mounted; only this inner block
                swaps via its `key`. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex ?? "none"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="grid gap-10 p-8 md:grid-cols-[1.05fr_1fr] md:p-10"
              >
                {/* Left — visuals */}
                <div>
                  <CardTypePreview kind={card.kind} />
                </div>

                {/* Right — info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-card",
                        SERVICE_CARD_ICON_BG[card.tone]
                      )}
                    >
                      {card.icon}
                    </div>
                    {card.details.fromPrice && (
                      <span className="text-xs font-semibold uppercase tracking-widest text-orange">
                        From {card.details.fromPrice}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-text-primary">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-body">
                    {card.details.description ?? card.subtitle}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {card.details.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm leading-relaxed text-text-body"
                      >
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-orange" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {card.href && (
                    <div className="mt-auto pt-8">
                      <Link
                        href={card.href}
                        className="group/cta inline-flex h-11 items-center gap-2.5 rounded-btn bg-orange px-5 text-sm font-semibold text-white transition hover:bg-orange-dark"
                      >
                        Start designing
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] bg-white/20 text-white transition-transform group-hover/cta:translate-x-0.5">
                          <IconArrowRight size={12} />
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
