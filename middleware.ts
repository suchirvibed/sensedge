import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: middleware uses the bare auth config (no Prisma/bcrypt).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const token = req.auth?.user as { role?: string } | undefined;
  const role = token?.role;
  const path = req.nextUrl.pathname;
  const isAuthed = !!req.auth;

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", path);

  if (path.startsWith("/admin")) {
    if (!isAuthed) return NextResponse.redirect(loginUrl);
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }
  if (path.startsWith("/graphics")) {
    if (!isAuthed) return NextResponse.redirect(loginUrl);
    if (!["GRAPHICS", "ADMIN"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  if (path.startsWith("/printer")) {
    if (!isAuthed) return NextResponse.redirect(loginUrl);
    if (!["PRINTER", "ADMIN"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  if (path.startsWith("/dashboard") && !isAuthed) {
    return NextResponse.redirect(loginUrl);
  }
  if (path.startsWith("/designer") && !isAuthed) {
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/graphics/:path*",
    "/printer/:path*",
    "/admin/:path*",
    "/designer/:path*",
  ],
};
