/**
 * Print-readiness validation.
 *
 * We target Fiery + Citron / Magicard-style card printers. Common rules:
 *
 *  - Bleed: full edge-to-edge print not guaranteed by direct-to-card
 *    printers, so we WARN if any object's bounding box extends past the
 *    card canvas. (Most printers tolerate 1mm overshoot but you lose
 *    pixels.)
 *  - Safe area: keep important content (text, logos, faces) inside
 *    a 2mm inset from each edge so it doesn't get clipped on print.
 *  - Text size: < 6pt prints unreadable on PVC cards. Warn under 8pt.
 *  - Image DPI: at 300 DPI on a 5px/mm canvas, an image scaled larger
 *    than its native resolution starts pixellating. Flag images whose
 *    on-canvas size is >= 110% of their natural raster size.
 *
 * Tune the constants if your shop tolerates different bleed.
 */

import { DISPLAY_PPMM, CANVAS_PX } from "./types";
import type { ObjectSnapshot } from "./useFabricCanvas";

// 2 mm safe-area inset from each edge.
export const SAFE_AREA_MM = 2;
// Treat anything that protrudes past the card as a bleed-overflow error.
export const BLEED_MM = 0;
// Minimum readable text size in canvas pixels (approx 8pt @ 96dpi).
export const MIN_TEXT_PX = 11;
// Image upscale tolerance (1.10 = OK to scale 110% above natural).
export const IMAGE_UPSCALE_RATIO = 1.1;

const SAFE_PX = SAFE_AREA_MM * DISPLAY_PPMM;

export type IssueSeverity = "error" | "warning";

export interface PrintIssue {
  side: "FRONT" | "BACK";
  objectIndex: number;
  severity: IssueSeverity;
  code:
    | "OUTSIDE_CARD"
    | "OUTSIDE_SAFE_AREA"
    | "TEXT_TOO_SMALL"
    | "IMAGE_UPSCALED";
  label: string;
  message: string;
}

interface ValidateArgs {
  side: "FRONT" | "BACK";
  objects: ObjectSnapshot[];
}

function typeLabel(t: string): string {
  if (t === "textbox" || t === "i-text" || t === "text") return "Text";
  if (t === "image") return "Image";
  if (t === "rect") return "Rectangle";
  if (t === "circle") return "Circle";
  if (t === "line") return "Line";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Run validation on one side's objects. Returns an array of issues
 * (empty if nothing is wrong).
 */
export function validateSide({ side, objects }: ValidateArgs): PrintIssue[] {
  const out: PrintIssue[] = [];

  for (const o of objects) {
    const right = o.left + o.effectiveWidth;
    const bottom = o.top + o.effectiveHeight;
    const label = typeLabel(o.type);

    // Outside card — error.
    if (
      o.left < -BLEED_MM ||
      o.top < -BLEED_MM ||
      right > CANVAS_PX.w + BLEED_MM ||
      bottom > CANVAS_PX.h + BLEED_MM
    ) {
      out.push({
        side,
        objectIndex: o.index,
        severity: "error",
        code: "OUTSIDE_CARD",
        label,
        message: `${label} extends past the card edge — the printer will clip it.`,
      });
      continue; // a single object can't be both outside the card AND outside safe area
    }

    // Outside safe area — warning.
    if (
      o.left < SAFE_PX ||
      o.top < SAFE_PX ||
      right > CANVAS_PX.w - SAFE_PX ||
      bottom > CANVAS_PX.h - SAFE_PX
    ) {
      out.push({
        side,
        objectIndex: o.index,
        severity: "warning",
        code: "OUTSIDE_SAFE_AREA",
        label,
        message: `${label} is in the ${SAFE_AREA_MM} mm safety margin — it may get clipped on print.`,
      });
    }

    // Text size — warning if under 8pt.
    if ((o.type === "textbox" || o.type === "i-text" || o.type === "text") && o.fontSize) {
      if (o.fontSize < MIN_TEXT_PX) {
        out.push({
          side,
          objectIndex: o.index,
          severity: "warning",
          code: "TEXT_TOO_SMALL",
          label,
          message: `Text at ${Math.round(o.fontSize)} px will be hard to read printed. Use 11 px (≈ 8 pt) or larger.`,
        });
      }
    }

    // Image scaled past native resolution.
    if (o.type === "image" && o.naturalWidth && o.naturalHeight) {
      const ratioW = o.effectiveWidth / o.naturalWidth;
      const ratioH = o.effectiveHeight / o.naturalHeight;
      if (ratioW > IMAGE_UPSCALE_RATIO || ratioH > IMAGE_UPSCALE_RATIO) {
        out.push({
          side,
          objectIndex: o.index,
          severity: "warning",
          code: "IMAGE_UPSCALED",
          label,
          message: `Image is being scaled ${Math.round(Math.max(ratioW, ratioH) * 100)}% — it will pixellate. Upload a higher-resolution source.`,
        });
      }
    }
  }

  return out;
}

export interface ValidationSummary {
  errors: number;
  warnings: number;
  total: number;
  ready: boolean;
  issues: PrintIssue[];
}

export function summarise(issues: PrintIssue[]): ValidationSummary {
  let errors = 0;
  let warnings = 0;
  for (const i of issues) {
    if (i.severity === "error") errors++;
    else warnings++;
  }
  return {
    errors,
    warnings,
    total: issues.length,
    ready: errors === 0 && warnings === 0,
    issues,
  };
}
