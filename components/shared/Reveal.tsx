"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}

/**
 * Scroll-triggered reveal. Fades in and slides up when the element
 * enters the viewport. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  y = 32,
  once = true,
  className,
  as = "div",
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0 : duration,
        delay: prefersReduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1], // expo-out — dzcard's smooth feel
      },
    },
  };

  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.18 }}
      variants={variants}
    >
      {children}
    </Comp>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  gap?: number;
  once?: boolean;
}

/**
 * Wrap any grid/list and direct children will stagger in.
 * Use with <Reveal> children OR <motion.div> children.
 */
export function Stagger({ children, className, gap = 0.08, once = true }: StaggerProps) {
  const prefersReduced = useReducedMotion();

  const parent: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReduced ? 0 : gap,
        delayChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={parent}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

/** A child cell inside <Stagger>. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={childVariants}>
      {children}
    </motion.div>
  );
}
