import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "orange" | "blue" | "purple" | "green" | "amber" | "red" | "neutral";

const TONES: Record<Tone, string> = {
  orange: "bg-orange-tint text-orange",
  blue: "bg-tint-blue text-tint-blueText",
  purple: "bg-tint-purple text-tint-purpleText",
  green: "bg-tint-green text-tint-greenText",
  amber: "bg-tint-amber text-tint-amberText",
  red: "bg-tint-red text-tint-redText",
  neutral: "bg-black/5 text-text-primary",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-badge px-3 py-1 text-xs font-semibold",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
