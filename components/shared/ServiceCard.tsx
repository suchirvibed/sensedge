import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "orange" | "blue" | "purple" | "green";

const ICON_BG: Record<Tone, string> = {
  orange: "bg-orange-tint text-orange",
  blue: "bg-tint-blue text-tint-blueText",
  purple: "bg-tint-purple text-tint-purpleText",
  green: "bg-tint-green text-tint-greenText",
};

export function ServiceCard({
  icon,
  title,
  subtitle,
  tone = "orange",
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
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-card mb-6",
          ICON_BG[tone]
        )}
      >
        {icon}
      </div>
      <h3 className="h3 text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted">{subtitle}</p>
    </>
  );

  const cls =
    "block rounded-card bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-hover";

  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
