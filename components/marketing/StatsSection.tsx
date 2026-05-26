import { CountUp } from "@/components/shared/CountUp";
import { Stagger, StaggerItem } from "@/components/shared/Reveal";

const STATS = [
  {
    to: 50,
    suffix: "K+",
    label: "Cards designed",
    body: "Trusted by teams shipping cards across India.",
  },
  {
    to: 99.9,
    suffix: "%",
    label: "Uptime",
    decimals: 1,
    body: "Reliable enough to print on a deadline.",
  },
  {
    to: 4.9,
    suffix: "★",
    label: "Customer rating",
    decimals: 1,
    body: "From hundreds of verified reviews.",
  },
];

export function StatsSection() {
  return (
    <section className="bg-bg-dark section-pad text-white">
      <div className="container-px mx-auto max-w-container">
        <Stagger className="grid gap-y-14 md:grid-cols-3 md:gap-10" gap={0.1}>
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <div className="border-l border-white/10 pl-6">
                <div className="font-display text-[clamp(40px,5vw,64px)] font-bold leading-none tracking-tight">
                  <CountUp
                    to={s.to}
                    suffix={s.suffix}
                    decimals={s.decimals ?? 0}
                    suffixClassName="text-orange"
                  />
                </div>
                <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/50">
                  {s.label}
                </div>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
                  {s.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
