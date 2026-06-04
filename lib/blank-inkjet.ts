/**
 * Blank Inkjet cards have no design. To keep the Order schema unchanged
 * (every Order has a designId FK), we maintain a single per-user
 * "[BLANK INKJET]" Design row and point every Inkjet order at it.
 *
 * The row is hidden from the dashboard designs grid.
 */

import { prisma } from "@/lib/prisma";

export const BLANK_INKJET_NAME = "[BLANK INKJET]";

export async function getOrCreateBlankInkjetDesign(
  userId: string
): Promise<{ id: string; name: string }> {
  const existing = await prisma.design.findFirst({
    where: { userId, name: BLANK_INKJET_NAME },
    select: { id: true, name: true },
  });
  if (existing) return existing;

  const created = await prisma.design.create({
    data: {
      userId,
      name: BLANK_INKJET_NAME,
      // Minimal v2 payload — empty front, empty back. Tagged with `inkjet`
      // so future jobs can distinguish.
      canvasJson: { schema: "v2", front: null, back: null, inkjet: true },
      status: "APPROVED", // blank cards skip graphics review
    },
    select: { id: true, name: true },
  });
  return created;
}
