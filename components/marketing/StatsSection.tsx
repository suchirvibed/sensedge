const STATS = [
  { value: "50K+", label: "Cards designed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Customer rating" },
];

export function StatsSection() {
  return (
    <section className="bg-bg-dark section-pad text-white">
      <div className="container-px mx-auto max-w-container">
        <div className="grid gap-12 md:grid-cols-3 md:gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-display text-[clamp(56px,8vw,96px)] font-extrabold leading-none tracking-tight">
                <span className="text-white">{s.value.replace(/[★+%]/, "")}</span>
                <span className="text-orange">{s.value.match(/[★+%]/)?.[0] ?? ""}</span>
              </div>
              <div className="mt-3 text-sm uppercase tracking-[0.18em] text-white/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
