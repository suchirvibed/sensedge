import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

async function authOrError() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
    } as const;
  }
  return { error: null, userId: session.user.id } as const;
}

async function ownedOrError(id: string, userId: string) {
  const design = await prisma.design.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      canvasJson: true,
      previewUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!design) {
    return {
      error: NextResponse.json({ error: "Design not found" }, { status: 404 }),
      design: null,
    } as const;
  }
  if (design.userId !== userId) {
    // Treat as 404 (don't leak existence to other users)
    return {
      error: NextResponse.json({ error: "Design not found" }, { status: 404 }),
      design: null,
    } as const;
  }
  return { error: null, design } as const;
}

// ─── GET /api/designs/[id] ───────────────────────────────
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const a = await authOrError();
  if (a.error) return a.error;
  const o = await ownedOrError(params.id, a.userId);
  if (o.error) return o.error;
  return NextResponse.json({ design: o.design });
}

// ─── PUT /api/designs/[id] ───────────────────────────────
// Accepts any subset of { name, canvasJson, previewUrl } and updates.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const a = await authOrError();
  if (a.error) return a.error;
  const o = await ownedOrError(params.id, a.userId);
  if (o.error) return o.error;

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
  if (body.canvasJson !== undefined && body.canvasJson !== null) {
    data.canvasJson = body.canvasJson as object;
  }
  if (body.previewUrl !== undefined) {
    if (body.previewUrl === null) data.previewUrl = null;
    else if (typeof body.previewUrl === "string") {
      data.previewUrl = body.previewUrl.slice(0, 2_000_000);
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields supplied" }, { status: 400 });
  }

  const design = await prisma.design.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, status: true, updatedAt: true },
  });
  return NextResponse.json({ design });
}

// ─── DELETE /api/designs/[id] ────────────────────────────
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const a = await authOrError();
  if (a.error) return a.error;
  const o = await ownedOrError(params.id, a.userId);
  if (o.error) return o.error;

  // Hard delete is fine for drafts. If the design is referenced by an order
  // we keep it (delete would cascade via FK constraint failure anyway).
  try {
    await prisma.design.delete({ where: { id: params.id } });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete a design that has orders" },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}
