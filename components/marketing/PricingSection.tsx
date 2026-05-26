import { IconCheck } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/cn";

const TIERS = [
  {
    name: "Starter",
    range: "25–49 cards",
    price: "₹6.50",
    perks: ["PVC base material", "Single-side print", "Free delivery above ₹500"],
    featured: false,
  },
  {
    name: "Business",
    range: "50–199 cards",
    price: "₹5.00",
    perks: ["Everything in Starter", "10–15% bulk discount", "Priority graphics review"],
    featured: true,
  },
  {
    name: "Bulk",
    range: "200+ cards",
    price: "₹4.00",
    perks: ["Everything in Business", "Up to 25% bulk discount", "Dedicated account manager"],
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section className="bg-bg-page section-pad" id="pricing">
      <div className="container-px mx-auto max-w-container">
        <SectionHeading
          eyebrow="PRICING"
          title="Simple, transparent pricing"
          align="center"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={cn(
                "relative flex flex-col rounded-card p-8 shadow-card transition hover:shadow-hover",
                t.featured
                  ? "bg-bg-dark text-white ring-1 ring-orange"
                  : "bg-white text-text-primary"
              )}
            >
              {t.featured && (
                <span className="absolute -top-3 right-6 rounded-badge bg-orange px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Most popular
                </span>
              )}
              <div className={cn("eyebrow", t.featured ? "text-white/60" : "text-text-muted")}>
                <span className="text-orange">■</span> {t.name}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-extrabold tracking-tight">
                  {t.price}
                </span>
                <span className={cn("text-sm", t.featured ? "text-white/70" : "text-text-muted")}>
                  /card
                </span>
              </div>
              <div className={cn("mt-1 text-sm", t.featured ? "text-white/60" : "text-text-muted")}>
                {t.range}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full",
                        t.featured ? "bg-orange/30 text-orange" : "bg-orange-tint text-orange"
                      )}
                    >
                      <IconCheck size={12} />
                    </span>
                    <span className={cn(t.featured ? "text-white/90" : "text-text-body")}>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <LinkButton
                  href="/designer/new"
                  variant={t.featured ? "primary" : "outline"}
                  showArrow
                  className="w-full justify-center"
                >
                  Start designing
                </LinkButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
