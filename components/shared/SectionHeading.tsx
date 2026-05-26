import { cn } from "@/lib/cn";
import { Reveal } from "@/components/shared/Reveal";

interface Props {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
  inverse?: boolean;
}

export function SectionHeading({ eyebrow, title, align = "left", inverse = false }: Props) {
  return (
    <Reveal className={cn(align === "center" && "text-center", "mb-12")}>
      <span
        className={cn(
          "eyebrow",
          inverse ? "text-white/70" : "text-text-muted",
          align === "center" && "justify-center"
        )}
      >
        <span className="text-orange">■</span>
        {eyebrow}
      </span>
      <h2 className={cn("h2 mt-3", inverse ? "text-white" : "text-text-primary")}>{title}</h2>
      <hr className={cn("orange-divider", align === "center" && "mx-auto")} />
    </Reveal>
  );
}
