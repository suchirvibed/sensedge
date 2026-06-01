import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// ─── GET /api/designs — list current user's designs ─────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const designs = await prisma.design.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      previewUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ designs });
}

// ─── POST /api/designs — create a design owned by the user ─────
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      : "Untitled design";
  const canvasJson = body.canvasJson;
  if (canvasJson === undefined || canvasJson === null) {
    return NextResponse.json({ error: "canvasJson is required" }, { status: 400 });
  }
  const previewUrl =
    typeof body.previewUrl === "string" ? body.previewUrl.slice(0, 2_000_000) : null;

  const design = await prisma.design.create({
    data: {
      userId: session.user.id,
      name,
      canvasJson: canvasJson as object,
      previewUrl,
      status: "DRAFT",
    },
    select: { id: true, name: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ design }, { status: 201 });
}
