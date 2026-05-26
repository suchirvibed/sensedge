"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface Props {
  /** Final numeric value to count to. */
  to: number;
  /** Optional prefix (e.g. "₹"). */
  prefix?: string;
  /** Optional suffix (e.g. "K+", "%", "★"). */
  suffix?: string;
  /** Milliseconds for the animation. */
  duration?: number;
  /** Decimals to render. */
  decimals?: number;
  className?: string;
  /** Suffix color override (for the orange accent on stats). */
  suffixClassName?: string;
}

/**
 * Number that counts up when scrolled into view. Honours reduced-motion.
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1600,
  decimals = 0,
  className,
  suffixClassName,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReduced = useReducedMotion();
  const [value, setValue] = useState(prefersReduced ? to : 0);

  useEffect(() => {
    if (!inView || prefersReduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, prefersReduced]);

  const display = decimals === 0 ? Math.floor(value).toString() : value.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix && <span className={suffixClassName}>{suffix}</span>}
    </span>
  );
}
