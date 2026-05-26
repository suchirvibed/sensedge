import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

type Tone = "orange" | "blue" | "purple" | "green" | "neutral";

const ICON_BG: Record<Tone, string> = {
  orange: "bg-orange-tint text-orange",
  blue: "bg-tint-blue text-tint-blueText",
  purple: "bg-tint-purple text-tint-purpleText",
  green: "bg-tint-green text-tint-greenText",
  neutral: "bg-bg-subtle text-text-primary",
};

export function ServiceCard({
  icon,
  title,
  subtitle,
  tone = "neutral",
  href,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  tone?: Tone;
  href?: string;
}) {
  const inner = (
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

  const cls =
    "group block rounded-card border border-border bg-white p-6 transition-all duration-200 hover:border-text-primary/20 hover:shadow-hover";

  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
