"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  CardPreviewOverlay,
  type PreviewCard,
} from "@/components/marketing/CardPreviewOverlay";

const CARDS: PreviewCard[] = [
  {
    icon: <IconId size={22} strokeWidth={1.6} />,
    title: "ID cards",
    subtitle: "Employee & student credentials",
    tone: "orange",
    href: "/designer/new?type=id",
    kind: "id",
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
    tone: "blue",
    href: "/designer/new?type=rfid",
    kind: "rfid",
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
    tone: "purple",
    href: "/designer/new?type=smart",
    kind: "smart",
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
    tone: "green",
    href: "/designer/new?type=membership",
    kind: "membership",
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
    tone: "orange",
    href: "/designer/new?type=student",
    kind: "student",
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
    tone: "blue",
    href: "/designer/new?type=visitor",
    kind: "visitor",
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

// ─── Hover-intent timings ────────────────────────────────
// Wait this long before opening on first hover, so accidental cursor
// passes through the grid don't trigger anything.
const OPEN_INTENT_MS = 220;
// Grace period after mouse leaves card/panel before closing — lets the
// cursor bridge between card and panel without flicker.
const CLOSE_GRACE_MS = 160;

export function CardTypesGrid() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpen = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  }, []);
  const clearClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Open intent — fires only if cursor stays on the card past the delay.
  // If overlay is already open (browsing), switch immediately.
  const requestOpen = useCallback(
    (idx: number) => {
      clearClose();
      clearOpen();
      setActiveIndex((current) => {
        if (current === idx) return current;
        if (current !== null) {
          // Already browsing — switch content instantly.
          return idx;
        }
        // Cold-start: wait for intent.
        openTimer.current = setTimeout(() => {
          setActiveIndex(idx);
          openTimer.current = null;
        }, OPEN_INTENT_MS);
        return null;
      });
    },
    [clearOpen, clearClose]
  );

  // Schedule a close after the grace period.
  const requestClose = useCallback(() => {
    clearOpen();
    clearClose();
    closeTimer.current = setTimeout(() => {
      setActiveIndex(null);
      closeTimer.current = null;
    }, CLOSE_GRACE_MS);
  }, [clearOpen, clearClose]);

  const cancelClose = useCallback(() => {
    clearClose();
  }, [clearClose]);

  const closeNow = useCallback(() => {
    clearOpen();
    clearClose();
    setActiveIndex(null);
  }, [clearOpen, clearClose]);

  // Escape closes immediately
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNow();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeIndex, closeNow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearOpen();
      clearClose();
    };
  }, [clearOpen, clearClose]);

  const activeCard = activeIndex !== null ? CARDS[activeIndex] : null;

  return (
    <section className="bg-bg-page section-pad">
      <div className="container-px mx-auto max-w-container">
        <SectionHeading
          eyebrow="Card types"
          title="Every card type, covered."
          subtitle="From employee badges to NFC chips — choose your starting point, customise it, and we'll handle the rest."
        />
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c, i) => (
            <StaggerItem key={c.title}>
              <div
                onMouseEnter={() => requestOpen(i)}
                onMouseLeave={requestClose}
                onFocus={() => requestOpen(i)}
                onBlur={requestClose}
                className="h-full"
              >
                <ServiceCard
                  icon={c.icon}
                  title={c.title}
                  subtitle={c.subtitle}
                  tone={c.tone}
                  href={c.href}
                />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <CardPreviewOverlay
        card={activeCard}
        activeIndex={activeIndex}
        onEnter={cancelClose}
        onLeave={requestClose}
        onClose={closeNow}
      />
    </section>
  );
}
