import { IconTemplate, IconBrush, IconTruckDelivery } from "@tabler/icons-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Stagger, StaggerItem } from "@/components/shared/Reveal";

const STEPS = [
  {
    n: "01",
    icon: <IconTemplate size={20} strokeWidth={1.6} />,
    title: "Choose a template",
    body: "Start from one of 50+ professionally designed templates — or a blank card.",
  },
  {
    n: "02",
    icon: <IconBrush size={20} strokeWidth={1.6} />,
    title: "Customise & design",
    body: "Drag, drop and tune your design in our browser studio. No installs, no learning curve.",
  },
  {
    n: "03",
    icon: <IconTruckDelivery size={20} strokeWidth={1.6} />,
    title: "Order & receive",
    body: "We print on quality PVC and ship across India in 3–5 days. Tracked end-to-end.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-bg-page section-pad">
      <div className="container-px mx-auto max-w-container">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to in-hand, in three steps."
        />
        <Stagger className="grid gap-4 md:grid-cols-3" gap={0.1}>
          {STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <div className="h-full rounded-card border border-border bg-white p-7 transition-all duration-200 hover:border-text-primary/20 hover:shadow-hover">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-widest text-text-muted">
                    {s.n}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-card bg-orange-tint text-orange">
                    {s.icon}
                  </span>
                </div>
                <h3 className="h3 mt-10 text-text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-body">{s.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
