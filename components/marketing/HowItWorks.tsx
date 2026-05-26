import { IconTemplate, IconBrush, IconTruckDelivery } from "@tabler/icons-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Stagger, StaggerItem } from "@/components/shared/Reveal";

const STEPS = [
  {
    n: "01",
    icon: <IconTemplate size={28} />,
    title: "Choose your template",
    body: "Start from one of 50+ professionally designed templates — or a blank card.",
  },
  {
    n: "02",
    icon: <IconBrush size={28} />,
    title: "Customise & design",
    body: "Drag, drop and tune your design in our browser studio. No installs.",
  },
  {
    n: "03",
    icon: <IconTruckDelivery size={28} />,
    title: "Order & receive",
    body: "We print on quality PVC and ship across India in 3–5 days.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-bg-page section-pad">
      <div className="container-px mx-auto max-w-container">
        <SectionHeading eyebrow="HOW IT WORKS" title="From idea to in-hand, in 3 steps" />
        <Stagger className="grid gap-8 md:grid-cols-3" gap={0.12}>
          {STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <div className="group relative h-full rounded-card bg-white p-8 shadow-card transition duration-500 hover:-translate-y-1 hover:shadow-hover">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange text-sm font-bold text-white transition group-hover:scale-110">
                    {s.n}
                  </span>
                  <span className="text-orange transition group-hover:scale-110">{s.icon}</span>
                </div>
                <h3 className="h3 mt-6 text-text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-text-body">{s.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
