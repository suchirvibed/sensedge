/**
 * Smart alignment guides (Canva-style).
 *
 * Given a moving object + the other objects on the canvas + canvas size,
 * compute:
 *   - Snap offsets (left/top) when the object's edges or centre line up
 *     within SNAP_PX of a meaningful reference.
 *   - The dashed guide lines to render so the user sees what they aligned
 *     with.
 *
 * References we check, in priority order:
 *   - Canvas centre X / Y
 *   - Canvas edges (0 and W or H)
 *   - Safe-area edges
 *   - Each other object's left / centre-X / right
 *   - Each other object's top / centre-Y / bottom
 */

import { DISPLAY_PPMM } from "./types";
import { SAFE_AREA_MM } from "./printValidation";

export const SNAP_PX = 5;
const SAFE_PX = SAFE_AREA_MM * DISPLAY_PPMM;

export interface GuideLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** A simplified bounding box for an object that we can use without Fabric. */
export interface AlignedObject {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface SnapResult {
  /** New left position (px) — undefined when no horizontal snap happens. */
  left?: number;
  /** New top position (px) — undefined when no vertical snap happens. */
  top?: number;
  /** Lines to render as dashed magenta guides. */
  lines: GuideLine[];
}

interface SnapCandidate {
  /** Snapped object position so the relevant edge aligns. */
  newPos: number;
  /** Diff between current and snap target — used to pick the best. */
  delta: number;
  /** The line to draw. */
  line: GuideLine;
}

/**
 * Compute snap + guide lines for the moving object.
 *
 * @param moving      The object being dragged (with .left/.top/.width/.height).
 * @param others      Every other object on the canvas.
 * @param canvasW     Canvas width (px).
 * @param canvasH     Canvas height (px).
 */
export function computeAlignment(
  moving: AlignedObject,
  others: AlignedObject[],
  canvasW: number,
  canvasH: number
): SnapResult {
  const lines: GuideLine[] = [];
  let bestX: SnapCandidate | null = null;
  let bestY: SnapCandidate | null = null;

  const movLeft = moving.left;
  const movRight = moving.left + moving.width;
  const movCenterX = moving.left + moving.width / 2;
  const movTop = moving.top;
  const movBottom = moving.top + moving.height;
  const movCenterY = moving.top + moving.height / 2;

  // ── X-axis (vertical guide lines) ──
  const xCandidates: SnapCandidate[] = [];

  // Canvas centre
  xCandidates.push({
    newPos: canvasW / 2 - moving.width / 2,
    delta: Math.abs(movCenterX - canvasW / 2),
    line: { x1: canvasW / 2, y1: 0, x2: canvasW / 2, y2: canvasH },
  });
  // Canvas left edge
  xCandidates.push({
    newPos: 0,
    delta: Math.abs(movLeft - 0),
    line: { x1: 0, y1: 0, x2: 0, y2: canvasH },
  });
  // Canvas right edge
  xCandidates.push({
    newPos: canvasW - moving.width,
    delta: Math.abs(movRight - canvasW),
    line: { x1: canvasW, y1: 0, x2: canvasW, y2: canvasH },
  });
  // Safe area left
  xCandidates.push({
    newPos: SAFE_PX,
    delta: Math.abs(movLeft - SAFE_PX),
    line: { x1: SAFE_PX, y1: 0, x2: SAFE_PX, y2: canvasH },
  });
  // Safe area right
  xCandidates.push({
    newPos: canvasW - SAFE_PX - moving.width,
    delta: Math.abs(movRight - (canvasW - SAFE_PX)),
    line: { x1: canvasW - SAFE_PX, y1: 0, x2: canvasW - SAFE_PX, y2: canvasH },
  });

  // Other objects — left / centre / right alignment
  for (const o of others) {
    const oLeft = o.left;
    const oRight = o.left + o.width;
    const oCenterX = o.left + o.width / 2;
    const oTop = o.top;
    const oBottom = o.top + o.height;
    const oCenterY = o.top + o.height / 2;

    // Visual extent of the guide line — span both objects vertically
    const yA = Math.min(movTop, oTop);
    const yB = Math.max(movBottom, oBottom);

    // moving left → other left
    xCandidates.push({
      newPos: oLeft,
      delta: Math.abs(movLeft - oLeft),
      line: { x1: oLeft, y1: yA, x2: oLeft, y2: yB },
    });
    // moving left → other right
    xCandidates.push({
      newPos: oRight,
      delta: Math.abs(movLeft - oRight),
      line: { x1: oRight, y1: yA, x2: oRight, y2: yB },
    });
    // moving right → other left
    xCandidates.push({
      newPos: oLeft - moving.width,
      delta: Math.abs(movRight - oLeft),
      line: { x1: oLeft, y1: yA, x2: oLeft, y2: yB },
    });
    // moving right → other right
    xCandidates.push({
      newPos: oRight - moving.width,
      delta: Math.abs(movRight - oRight),
      line: { x1: oRight, y1: yA, x2: oRight, y2: yB },
    });
    // centres
    xCandidates.push({
      newPos: oCenterX - moving.width / 2,
      delta: Math.abs(movCenterX - oCenterX),
      line: { x1: oCenterX, y1: yA, x2: oCenterX, y2: yB },
    });

    // ── Y-axis candidates ──
    const xA = Math.min(movLeft, oLeft);
    const xB = Math.max(movRight, oRight);
    pushIfBest(
      bestY,
      {
        newPos: oTop,
        delta: Math.abs(movTop - oTop),
        line: { x1: xA, y1: oTop, x2: xB, y2: oTop },
      },
      (b) => (bestY = b)
    );
    pushIfBest(
      bestY,
      {
        newPos: oBottom,
        delta: Math.abs(movTop - oBottom),
        line: { x1: xA, y1: oBottom, x2: xB, y2: oBottom },
      },
      (b) => (bestY = b)
    );
    pushIfBest(
      bestY,
      {
        newPos: oTop - moving.height,
        delta: Math.abs(movBottom - oTop),
        line: { x1: xA, y1: oTop, x2: xB, y2: oTop },
      },
      (b) => (bestY = b)
    );
    pushIfBest(
      bestY,
      {
        newPos: oBottom - moving.height,
        delta: Math.abs(movBottom - oBottom),
        line: { x1: xA, y1: oBottom, x2: xB, y2: oBottom },
      },
      (b) => (bestY = b)
    );
    pushIfBest(
      bestY,
      {
        newPos: oCenterY - moving.height / 2,
        delta: Math.abs(movCenterY - oCenterY),
        line: { x1: xA, y1: oCenterY, x2: xB, y2: oCenterY },
      },
      (b) => (bestY = b)
    );
  }

  // ── Y-axis canvas + safe area ──
  const yCandidates: SnapCandidate[] = [
    {
      newPos: canvasH / 2 - moving.height / 2,
      delta: Math.abs(movCenterY - canvasH / 2),
      line: { x1: 0, y1: canvasH / 2, x2: canvasW, y2: canvasH / 2 },
    },
    {
      newPos: 0,
      delta: Math.abs(movTop - 0),
      line: { x1: 0, y1: 0, x2: canvasW, y2: 0 },
    },
    {
      newPos: canvasH - moving.height,
      delta: Math.abs(movBottom - canvasH),
      line: { x1: 0, y1: canvasH, x2: canvasW, y2: canvasH },
    },
    {
      newPos: SAFE_PX,
      delta: Math.abs(movTop - SAFE_PX),
      line: { x1: 0, y1: SAFE_PX, x2: canvasW, y2: SAFE_PX },
    },
    {
      newPos: canvasH - SAFE_PX - moving.height,
      delta: Math.abs(movBottom - (canvasH - SAFE_PX)),
      line: { x1: 0, y1: canvasH - SAFE_PX, x2: canvasW, y2: canvasH - SAFE_PX },
    },
  ];

  // Pick the closest X candidate within snap range
  for (const c of xCandidates) {
    if (c.delta < SNAP_PX && (!bestX || c.delta < bestX.delta)) bestX = c;
  }
  for (const c of yCandidates) {
    if (c.delta < SNAP_PX && (!bestY || c.delta < bestY.delta)) bestY = c;
  }

  if (bestX) lines.push(bestX.line);
  if (bestY) lines.push(bestY.line);

  return {
    left: bestX?.newPos,
    top: bestY?.newPos,
    lines,
  };
}

function pushIfBest(
  current: SnapCandidate | null,
  candidate: SnapCandidate,
  setBest: (s: SnapCandidate) => void
) {
  if (candidate.delta < SNAP_PX && (!current || candidate.delta < current.delta)) {
    setBest(candidate);
  }
}
