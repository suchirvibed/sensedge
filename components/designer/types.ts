// Shared types for the designer.

export type CardMaterial = "PVC" | "PAPER" | "COMPOSITE";
export type CardFinish = "MATTE" | "GLOSSY" | "METALLIC";
export type CardChip = "NONE" | "RFID" | "NFC" | "LED";
export type CardSide = "SINGLE" | "DOUBLE";
export type PrinterKind = "THERMAL" | "INKJET";
export type Orientation = "HORIZONTAL" | "VERTICAL";

export interface CardSpecs {
  material: CardMaterial;
  finish: CardFinish;
  chip: CardChip;
  side: CardSide;
  printer: PrinterKind;
  quantity: number;
  orientation: Orientation;
}

export const DEFAULT_SPECS: CardSpecs = {
  material: "PVC",
  finish: "MATTE",
  chip: "NONE",
  side: "SINGLE",
  printer: "THERMAL",
  quantity: 50,
  orientation: "HORIZONTAL",
};

// Spec dimensions: 87 × 57 mm
export const CARD_MM = { w: 87, h: 57 } as const;

// Display scale (pixels per mm) — fits comfortably in the workspace
export const DISPLAY_PPMM = 5; // 87mm × 5 = 435px wide

export const CANVAS_PX = {
  w: CARD_MM.w * DISPLAY_PPMM, // 435
  h: CARD_MM.h * DISPLAY_PPMM, // 285
} as const;
