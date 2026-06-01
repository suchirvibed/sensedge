"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowUpRight,
  IconX,
  IconArrowRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { CardTypePreview, type CardKind } from "@/components/marketing/CardTypePreview";

type Tone = "orange" | "blue" | "purple" | "green" | "neutral";

const ICON_BG: Record<Tone, string> = {
  orange: "bg-orange-tint text-orange",
  blue: "bg-tint-blue text-tint-blueText",
  purple: "bg-tint-purple text-tint-purpleText",
  green: "bg-tint-green text-tint-greenText",
  neutral: "bg-bg-subtle text-text-primary",
};

export interface ServiceCardDetails {
  features: string[];
  fromPrice?: string;
  description?: string;
}

// 90 ms grace period for the cursor to travel from the card to the
// overlay panel. Cancelled if either edge re-enters.
const CLOSE_DELAY = 90;

export function ServiceCard({
  icon,
  title,
  subtitle,
  tone = "neutral",
  href,
  kind,
  details,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone?: Tone;
  href?: string;
  kind?: CardKind;
  details?: ServiceCardDetails;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canOverlay = Boolean(kind && details);

  // ─── Open / close helpers ──────────────────────────────
  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openNow = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const closeSoon = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, [cancelClose]);

  const closeNow = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);

  // Escape closes immediately
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNow();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeNow]);

  // Clean up timer on unmount
  useEffect(() => () => cancelClose(), [cancelClose]);

  // ─── Card ──────────────────────────────────────────────
  const cardInner = (
    <>
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-card",
            ICON_BG[tone]
          )}
        >
          {icon}
        </div>
        {href && (
          <IconArrowUpRight
            size={18}
            className="text-text-hint opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-orange"
          />
        )}
      </div>
      <h3 className="h3 mt-8 text-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
    </>
  );

  const cardClasses =
    "group block rounded-card border border-border bg-white p-6 transition-all duration-200 hover:border-text-primary/20 hover:shadow-hover";

  // Hover/focus only attach the open-on-enter handlers when we have an
  // overlay to show. Without `kind` + `details` the card behaves exactly
  // like before.
  const hoverProps = canOverlay
    ? {
        onMouseEnter: openNow,
        onMouseLeave: closeSoon,
        onFocus: openNow,
        onBlur: closeSoon,
      }
    : {};

  const card = href ? (
    <Link href={href} className={cardClasses} {...hoverProps}>
      {cardInner}
    </Link>
  ) : (
    <div className={cardClasses} {...hoverProps}>
      {cardInner}
    </div>
  );

  return (
    <>
      {card}

      <AnimatePresence>
        {open && canOverlay && (
          // Fullscreen flex container — handles centering with zero
          // transform-fighting with motion's animations.
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop (click + cursor-enter both close) */}
            <div
              onClick={closeNow}
              onMouseEnter={closeSoon}
              className="absolute inset-0 cursor-default bg-bg-darker/55 backdrop-blur-sm"
            />

            {/* Panel — only animates opacity + scale.
                Hover events on the panel cancel the pending close so the
                cursor can travel card → panel without flicker. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={cancelClose}
              onMouseLeave={closeSoon}
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-card bg-white shadow-hover"
              role="dialog"
              aria-modal="true"
              aria-label={`${title} preview`}
            >
              {/* Close button */}
              <button
                type="button"
                aria-label="Close"
                onClick={closeNow}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/90 text-text-muted transition hover:border-text-primary hover:text-text-primary"
              >
                <IconX size={16} />
              </button>

              <div className="grid gap-10 p-8 md:grid-cols-[1.05fr_1fr] md:p-10">
                {/* Left — visuals */}
                <div>
                  <CardTypePreview kind={kind!} />
                </div>

                {/* Right — info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-card",
                        ICON_BG[tone]
                      )}
                    >
                      {icon}
                    </div>
                    {details!.fromPrice && (
                      <span className="text-xs font-semibold uppercase tracking-widest text-orange">
                        From {details!.fromPrice}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-text-primary">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-body">
                    {details!.description ?? subtitle}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {details!.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm leading-relaxed text-text-body"
                      >
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-orange" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {href && (
                    <div className="mt-auto pt-8">
                      <Link
                        href={href}
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
