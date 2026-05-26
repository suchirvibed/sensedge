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
    icon: <IconId size={26} />,
    title: "ID Cards",
    subtitle: "Employee & student",
    tone: "orange" as const,
    href: "/designer/new?type=id",
  },
  {
    icon: <IconRadar2 size={26} />,
    title: "RFID Cards",
    subtitle: "Access & smart",
    tone: "blue" as const,
    href: "/designer/new?type=rfid",
  },
  {
    icon: <IconCpu size={26} />,
    title: "Smart Cards",
    subtitle: "NFC & chip",
    tone: "purple" as const,
    href: "/designer/new?type=smart",
  },
  {
    icon: <IconStar size={26} />,
    title: "Membership Cards",
    subtitle: "Loyalty & access",
    tone: "green" as const,
    href: "/designer/new?type=membership",
  },
  {
    icon: <IconSchool size={26} />,
    title: "Student IDs",
    subtitle: "Schools & colleges",
    tone: "orange" as const,
    href: "/designer/new?type=student",
  },
  {
    icon: <IconQrcode size={26} />,
    title: "Visitor Cards",
    subtitle: "Barcode & QR",
    tone: "blue" as const,
    href: "/designer/new?type=visitor",
  },
];

export function CardTypesGrid() {
  return (
    <section className="bg-bg-page section-pad">
      <div className="container-px mx-auto max-w-container">
        <SectionHeading eyebrow="WHAT WE OFFER" title="Every card type, covered" />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
