import {
  IconPrinter,
  IconTruck,
  IconShieldLock,
  IconHeadset,
  IconDiscount,
  IconCpu,
} from "@tabler/icons-react";
import { Stagger, StaggerItem } from "@/components/shared/Reveal";

const PILLARS = [
  { icon: IconPrinter, label: "Quality print" },
  { icon: IconTruck, label: "Fast delivery" },
  { icon: IconShieldLock, label: "Secure checkout" },
  { icon: IconHeadset, label: "24/7 support" },
  { icon: IconDiscount, label: "Bulk discounts" },
  { icon: IconCpu, label: "RFID & NFC ready" },
];

export function TrustPillars() {
  return (
    <section className="border-y border-border bg-bg-page py-16">
      <div className="container-px mx-auto max-w-container">
        <Stagger
          className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6"
          gap={0.06}
        >
          {PILLARS.map(({ icon: Icon, label }) => (
            <StaggerItem key={label}>
              <div className="group flex flex-col items-center text-center">
                <Icon
                  size={24}
                  strokeWidth={1.3}
                  className="text-text-muted transition-colors duration-200 group-hover:text-orange"
                />
                <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-text-muted transition-colors group-hover:text-text-primary">
                  {label}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
