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
  { icon: IconCpu, label: "RFID options" },
];

export function TrustPillars() {
  return (
    <section className="bg-bg-dark py-20 text-white">
      <div className="container-px mx-auto max-w-container">
        <Stagger
          className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6"
          gap={0.08}
        >
          {PILLARS.map(({ icon: Icon, label }) => (
            <StaggerItem key={label}>
              <div className="group flex flex-col items-center text-center transition">
                <Icon
                  size={32}
                  strokeWidth={1.4}
                  className="text-white transition duration-500 group-hover:scale-110 group-hover:text-orange"
                />
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/70 transition group-hover:text-white">
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
