import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isTemplateCategory } from "@/lib/template-categories";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * GET /api/templates
 *
 * Public listing of templates. Open to any signed-in user.
 * Query params:
 *   ?category=Business     filter by exact category
 *   ?includeDrafts=1       (GRAPHICS/ADMIN only) include private/draft rows
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const includeDrafts = url.searchParams.get("includeDrafts") === "1";

  const isPrivileged = ["GRAPHICS", "ADMIN"].includes(session.user.role);

  const where: Record<string, unknown> = {};
  if (category && isTemplateCategory(category)) where.category = category;
  if (!includeDrafts || !isPrivileged) {
    where.isPublic = true;
  }

  const templates = await prisma.template.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
    select: {
      id: true,
      name: true,
      category: true,
      previewUrl: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ templates });
}

/**
 * POST /api/templates
 *
 * Create a template. GRAPHICS or ADMIN only.
 * Body: { name, category, canvasJson, previewUrl?, isPublic? }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["GRAPHICS", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!isPlainObject(body)) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const name =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim().slice(0, 120)
      : null;
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const category = typeof body.category === "string" ? body.category : "Other";
  if (!isTemplateCategory(category)) {
    return NextResponse.json(
      { error: "category must be one of the allowed values" },
      { status: 400 }
    );
  }
  const canvasJson = body.canvasJson;
  if (canvasJson === undefined || canvasJson === null) {
    return NextResponse.json(
      { error: "canvasJson is required" },
      { status: 400 }
    );
  }
  const previewUrl =
    typeof body.previewUrl === "string"
      ? body.previewUrl.slice(0, 2_000_000)
      : null;
  const isPublic = body.isPublic === true || body.isPublic === "true";

  const template = await prisma.template.create({
    data: {
      name,
      category,
      canvasJson: canvasJson as object,
      previewUrl,
      isPublic,
      createdById: session.user.id,
    },
    select: { id: true, name: true, category: true, isPublic: true, updatedAt: true },
  });
  return NextResponse.json({ template }, { status: 201 });
}
