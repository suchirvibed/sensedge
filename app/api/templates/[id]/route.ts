import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isTemplateCategory } from "@/lib/template-categories";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

async function getCallerOrUnauthorized() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    } as const;
  }
  return { err: null, session } as const;
}

/** GET /api/templates/[id] — any signed-in user can read a public template;
 *  GRAPHICS/ADMIN can read drafts too. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const a = await getCallerOrUnauthorized();
  if (a.err) return a.err;
  const tmpl = await prisma.template.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      category: true,
      previewUrl: true,
      isPublic: true,
      canvasJson: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!tmpl) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  const isPrivileged = ["GRAPHICS", "ADMIN"].includes(a.session!.user.role);
  if (!tmpl.isPublic && !isPrivileged) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  return NextResponse.json({ template: tmpl });
}

/** PUT /api/templates/[id] — GRAPHICS / ADMIN only. */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const a = await getCallerOrUnauthorized();
  if (a.err) return a.err;
  if (!["GRAPHICS", "ADMIN"].includes(a.session!.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const exists = await prisma.template.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
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

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    const n = body.name.trim();
    if (n.length === 0) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    data.name = n.slice(0, 120);
  }
  if (typeof body.category === "string") {
    if (!isTemplateCategory(body.category)) {
      return NextResponse.json(
        { error: "category must be one of the allowed values" },
        { status: 400 }
      );
    }
    data.category = body.category;
  }
  if (body.canvasJson !== undefined && body.canvasJson !== null) {
    data.canvasJson = body.canvasJson as object;
  }
  if (body.previewUrl !== undefined) {
    if (body.previewUrl === null) data.previewUrl = null;
    else if (typeof body.previewUrl === "string")
      data.previewUrl = body.previewUrl.slice(0, 2_000_000);
  }
  if (body.isPublic !== undefined) {
    data.isPublic = body.isPublic === true || body.isPublic === "true";
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No updatable fields supplied" },
      { status: 400 }
    );
  }

  const template = await prisma.template.update({
    where: { id: params.id },
    data,
    select: {
      id: true,
      name: true,
      category: true,
      isPublic: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ template });
}

/** DELETE /api/templates/[id] — GRAPHICS / ADMIN only. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const a = await getCallerOrUnauthorized();
  if (a.err) return a.err;
  if (!["GRAPHICS", "ADMIN"].includes(a.session!.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const exists = await prisma.template.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  await prisma.template.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
