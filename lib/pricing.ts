// Pricing engine — single source of truth for card prices.
// Used by the designer (live price), checkout, and admin pricing screens.

export type Material = "PVC" | "PAPER" | "COMPOSITE";
export type Finish = "MATTE" | "GLOSSY" | "METALLIC";
export type ChipType = "NONE" | "RFID" | "NFC" | "LED";
export type PrintSide = "SINGLE" | "DOUBLE";

export interface PriceInput {
  quantity: number;
  material: Material;
  finish: Finish;
  chipType: ChipType;
  printSide: PrintSide;
}

const BASE_PRICES: Record<Material, number> = {
  PVC: 4.5,
  PAPER: 3.0,
  COMPOSITE: 6.0,
};

const ADDON_PRICES = {
  finish: { MATTE: 0, GLOSSY: 0.3, METALLIC: 0.8 } as Record<Finish, number>,
  chip: { NONE: 0, RFID: 1.4, NFC: 1.0, LED: 2.0 } as Record<ChipType, number>,
  side: { SINGLE: 0, DOUBLE: 0.5 } as Record<PrintSide, number>,
};

const BULK_DISCOUNTS = [
  { minQty: 200, discount: 0.25 },
  { minQty: 100, discount: 0.15 },
  { minQty: 50, discount: 0.1 },
  { minQty: 25, discount: 0 },
];

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FLAT = 50;

export interface PriceBreakdown {
  pricePerCard: number;
  subtotalBeforeDiscount: number;
  discountRate: number;
  discountAmount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const base = BASE_PRICES[input.material];
  const addons =
    ADDON_PRICES.finish[input.finish] +
    ADDON_PRICES.chip[input.chipType] +
    ADDON_PRICES.side[input.printSide];

  const pricePerCard = +(base + addons).toFixed(2);
  const subtotalBeforeDiscount = +(pricePerCard * input.quantity).toFixed(2);

  const discountRate =
    BULK_DISCOUNTS.find((d) => input.quantity >= d.minQty)?.discount ?? 0;
  const discountAmount = +(subtotalBeforeDiscount * discountRate).toFixed(2);
  const subtotal = +(subtotalBeforeDiscount - discountAmount).toFixed(2);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = +(subtotal + shipping).toFixed(2);

  return {
    pricePerCard,
    subtotalBeforeDiscount,
    discountRate,
    discountAmount,
    subtotal,
    shipping,
    total,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
