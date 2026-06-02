// Shared types for the designer.

export type CardMaterial = "PVC" | "PAPER" | "COMPOSITE";
export type CardFinish = "MATTE" | "GLOSSY" | "METALLIC";
export type CardChip = "NONE" | "RFID" | "NFC" | "LED";
export type CardSide = "SINGLE" | "DOUBLE";
export type PrinterKind = "THERMAL" | "INKJET";
export type Orientation = "HORIZONTAL" | "VERTICAL";
export type CardType = "COMPANY" | "SCHOOL" | "OTHERS";

export interface CardSpecs {
  material: CardMaterial;
  finish: CardFinish;
  chip: CardChip;
  side: CardSide;
  printer: PrinterKind;
  quantity: number;
  orientation: Orientation;
  cardType: CardType;
  /** Lookup key into CARD_SIZES. */
  sizeId: string;
}

export const DEFAULT_SPECS: CardSpecs = {
  material: "PVC",
  finish: "MATTE",
  chip: "NONE",
  side: "SINGLE",
  printer: "THERMAL",
  quantity: 50,
  orientation: "HORIZONTAL",
  cardType: "OTHERS",
  sizeId: "STANDARD",
};

// CR80-style ID card sizes. Width × height in mm (horizontal orientation).
// The active spec stays 87 × 57 (matches the project spec). Add more
// entries here if your printer supports them.
export interface CardSize {
  id: string;
  label: string;
  w: number; // mm
  h: number; // mm
}

export const CARD_SIZES: readonly CardSize[] = [
  { id: "STANDARD", label: "Standard (87 × 57 mm)", w: 87, h: 57 },
  { id: "CR80", label: "CR80 (85.6 × 53.98 mm)", w: 85.6, h: 53.98 },
  { id: "MINI", label: "Mini (70 × 45 mm)", w: 70, h: 45 },
] as const;

export function getCardSize(id: string): CardSize {
  return CARD_SIZES.find((s) => s.id === id) ?? CARD_SIZES[0];
}

// Default size matches the existing project spec.
export const CARD_MM = { w: 87, h: 57 } as const;

// Display scale (pixels per mm).
export const DISPLAY_PPMM = 5;

// Backwards-compatible — used where horizontal orientation is assumed.
export const CANVAS_PX = {
  w: CARD_MM.w * DISPLAY_PPMM,
  h: CARD_MM.h * DISPLAY_PPMM,
} as const;

/** Compute canvas dimensions for a given size + orientation. */
export function getCanvasPx(
  sizeId: string,
  orientation: Orientation
): { w: number; h: number } {
  const size = getCardSize(sizeId);
  if (orientation === "HORIZONTAL") {
    return { w: size.w * DISPLAY_PPMM, h: size.h * DISPLAY_PPMM };
  }
  return { w: size.h * DISPLAY_PPMM, h: size.w * DISPLAY_PPMM };
}
