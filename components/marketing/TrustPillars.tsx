import {
  IconPrinter,
  IconTruck,
  IconShieldLock,
  IconHeadset,
  IconDiscount,
  IconCpu,
} from "@tabler/icons-react";

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
        <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {PILLARS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <Icon size={32} strokeWidth={1.4} className="text-white" />
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/70">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
