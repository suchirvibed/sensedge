import { cn } from "@/lib/cn";
import { Reveal } from "@/components/shared/Reveal";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  inverse?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  inverse = false,
}: Props) {
  return (
    <Reveal className={cn(align === "center" && "text-center", "mb-14")}>
      {eyebrow && (
        <div
          className={cn(
            "eyebrow mb-4",
            inverse && "text-orange/90"
          )}
        >
          {eyebrow}
        </div>
      )}
      <h2 className={cn("h2 max-w-2xl", inverse ? "text-white" : "text-text-primary", align === "center" && "mx-auto")}>
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-xl text-base",
            inverse ? "text-white/70" : "text-text-body",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
