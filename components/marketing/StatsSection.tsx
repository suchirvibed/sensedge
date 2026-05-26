import { CountUp } from "@/components/shared/CountUp";
import { Stagger, StaggerItem } from "@/components/shared/Reveal";

const STATS = [
  { to: 50, suffix: "K+", label: "Cards designed" },
  { to: 99.9, suffix: "%", label: "Uptime", decimals: 1 },
  { to: 4.9, suffix: "★", label: "Customer rating", decimals: 1 },
];

export function StatsSection() {
  return (
    <section className="bg-bg-dark section-pad text-white">
      <div className="container-px mx-auto max-w-container">
        <Stagger className="grid gap-12 md:grid-cols-3 md:gap-6" gap={0.12}>
          {STATS.map((s) => (
            <StaggerItem key={s.label} className="text-center md:text-left">
              <div className="font-display text-[clamp(56px,8vw,96px)] font-extrabold leading-none tracking-tight">
                <CountUp
                  to={s.to}
                  suffix={s.suffix}
                  decimals={s.decimals ?? 0}
                  suffixClassName="text-orange"
                />
              </div>
              <div className="mt-3 text-sm uppercase tracking-[0.18em] text-white/60">
                {s.label}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
