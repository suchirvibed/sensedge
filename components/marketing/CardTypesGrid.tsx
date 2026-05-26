import {
  IconId,
  IconRadar2,
  IconCpu,
  IconStar,
  IconSchool,
  IconQrcode,
} from "@tabler/icons-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { Stagger, StaggerItem } from "@/components/shared/Reveal";

const CARDS = [
  {
    icon: <IconId size={22} strokeWidth={1.6} />,
    title: "ID cards",
    subtitle: "Employee & student credentials",
    tone: "orange" as const,
    href: "/designer/new?type=id",
  },
  {
    icon: <IconRadar2 size={22} strokeWidth={1.6} />,
    title: "RFID cards",
    subtitle: "Access control & smart entry",
    tone: "blue" as const,
    href: "/designer/new?type=rfid",
  },
  {
    icon: <IconCpu size={22} strokeWidth={1.6} />,
    title: "Smart cards",
    subtitle: "NFC chips & payment-ready",
    tone: "purple" as const,
    href: "/designer/new?type=smart",
  },
  {
    icon: <IconStar size={22} strokeWidth={1.6} />,
    title: "Membership cards",
    subtitle: "Loyalty & customer rewards",
    tone: "green" as const,
    href: "/designer/new?type=membership",
  },
  {
    icon: <IconSchool size={22} strokeWidth={1.6} />,
    title: "Student IDs",
    subtitle: "Schools, colleges, universities",
    tone: "orange" as const,
    href: "/designer/new?type=student",
  },
  {
    icon: <IconQrcode size={22} strokeWidth={1.6} />,
    title: "Visitor cards",
    subtitle: "Barcode, QR & temporary access",
    tone: "blue" as const,
    href: "/designer/new?type=visitor",
  },
];

export function CardTypesGrid() {
  return (
    <section className="bg-bg-page section-pad">
      <div className="container-px mx-auto max-w-container">
        <SectionHeading
          eyebrow="Card types"
          title="Every card type, covered."
          subtitle="From employee badges to NFC chips — choose your starting point, customise it, and we'll handle the rest."
        />
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <StaggerItem key={c.title}>
              <ServiceCard {...c} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
