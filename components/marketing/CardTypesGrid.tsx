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
    kind: "id" as const,
    details: {
      fromPrice: "₹4.50 / card",
      description:
        "Premium PVC ID cards with photo, barcode, and brand colours. The most ordered card on PrintCard — perfect for offices, campuses and team events.",
      features: [
        "PVC, paper or composite base material",
        "Custom photo, name, role and barcode/QR",
        "Lamination and dual-side print available",
        "Bulk discounts above 50 cards",
      ],
    },
  },
  {
    icon: <IconRadar2 size={22} strokeWidth={1.6} />,
    title: "RFID cards",
    subtitle: "Access control & smart entry",
    tone: "blue" as const,
    href: "/designer/new?type=rfid",
    kind: "rfid" as const,
    details: {
      fromPrice: "₹5.90 / card",
      description:
        "Programmable RFID cards for door access, attendance and smart entry systems. Both legacy 125 kHz and modern 13.56 MHz frequencies supported.",
      features: [
        "125 kHz (EM4100) or 13.56 MHz (MIFARE)",
        "Compatible with most access control systems",
        "Pre-programmable in bulk to your reader",
        "Optional photo + name printing on top",
      ],
    },
  },
  {
    icon: <IconCpu size={22} strokeWidth={1.6} />,
    title: "Smart cards",
    subtitle: "NFC chips & payment-ready",
    tone: "purple" as const,
    href: "/designer/new?type=smart",
    kind: "smart" as const,
    details: {
      fromPrice: "₹5.50 / card",
      description:
        "NFC-enabled smart cards for digital business cards, tap-to-pay loyalty and modern brand experiences. Encrypted, re-writable and standards-compliant.",
      features: [
        "NTAG216 or MIFARE Ultralight C chips",
        "Tap to open URL, vCard, app or payment",
        "Encrypted, re-writable up to 100k cycles",
        "Pair with metal, wood or LED finishes",
      ],
    },
  },
  {
    icon: <IconStar size={22} strokeWidth={1.6} />,
    title: "Membership cards",
    subtitle: "Loyalty & customer rewards",
    tone: "green" as const,
    href: "/designer/new?type=membership",
    kind: "membership" as const,
    details: {
      fromPrice: "₹4.50 / card",
      description:
        "Tier-based membership cards that look the part. Silver, Gold, Platinum — or your own tier names — with custom designs per tier.",
      features: [
        "Tier-based designs (Silver, Gold, Platinum)",
        "Barcode or QR for in-store scanning",
        "Metallic and matte finishes available",
        "Up to 25% bulk discount above 200 cards",
      ],
    },
  },
  {
    icon: <IconSchool size={22} strokeWidth={1.6} />,
    title: "Student IDs",
    subtitle: "Schools, colleges, universities",
    tone: "orange" as const,
    href: "/designer/new?type=student",
    kind: "student" as const,
    details: {
      fromPrice: "₹4.00 / card",
      description:
        "Bulk-friendly student ID cards designed for the annual academic rush. Upload your student list as a CSV and we'll generate every card automatically.",
      features: [
        "CSV upload → instant per-student designs",
        "Photo + class + academic year + school logo",
        "Durable PVC built to last the school year",
        "Up to 25% bulk discount for 200+ cards",
      ],
    },
  },
  {
    icon: <IconQrcode size={22} strokeWidth={1.6} />,
    title: "Visitor cards",
    subtitle: "Barcode, QR & temporary access",
    tone: "blue" as const,
    href: "/designer/new?type=visitor",
    kind: "visitor" as const,
    details: {
      fromPrice: "₹4.50 / card",
      description:
        "Reusable visitor passes or single-use day passes for events, conferences and corporate offices. Pre-punched for lanyards.",
      features: [
        "Lanyard hole pre-punched at top",
        "QR or barcode integrated with check-in apps",
        "Re-usable PVC or eco-friendly paper option",
        "Custom colour-coding for visitor types",
      ],
    },
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
