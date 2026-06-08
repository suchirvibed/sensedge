import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SEED_TEMPLATES } from "@/lib/template-seeds";

/**
 * POST /api/templates/seed
 *
 * GRAPHICS or ADMIN only. Idempotent: skips any seed whose name is already
 * present in the DB. Returns the count of rows inserted.
 *
 * Useful for first-run setup so the customer-side template picker isn't
 * empty.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["GRAPHICS", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.template.findMany({
    where: { name: { in: SEED_TEMPLATES.map((t) => t.name) } },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((e) => e.name));

  const toInsert = SEED_TEMPLATES.filter((t) => !existingNames.has(t.name));
  if (toInsert.length === 0) {
    return NextResponse.json({
      ok: true,
      inserted: 0,
      skipped: SEED_TEMPLATES.length,
      message: "All sample templates already exist.",
    });
  }

  await prisma.template.createMany({
    data: toInsert.map((t) => ({
      name: t.name,
      category: t.category,
      canvasJson: t.canvasJson,
      isPublic: true,
      createdById: session.user.id,
    })),
  });

  return NextResponse.json({
    ok: true,
    inserted: toInsert.length,
    skipped: SEED_TEMPLATES.length - toInsert.length,
  });
}
