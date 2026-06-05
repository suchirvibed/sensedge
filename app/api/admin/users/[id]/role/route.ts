import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const ALLOWED_ROLES: Role[] = ["CUSTOMER", "GRAPHICS", "PRINTER", "ADMIN"];

/**
 * PUT /api/admin/users/[id]/role
 *
 * Body: { role: Role }
 * Admin-only. Changes a user's role. Refuses to demote the calling
 * admin themselves (no self-lockout).
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.role || !ALLOWED_ROLES.includes(body.role as Role)) {
    return NextResponse.json({ error: "Valid `role` is required" }, { status: 400 });
  }

  // Don't let an admin demote themselves — protects against accidental lockout.
  if (params.id === session.user.id && body.role !== "ADMIN") {
    return NextResponse.json(
      { error: "You can't change your own role." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: body.role as Role },
  });

  return NextResponse.json({ ok: true });
}
