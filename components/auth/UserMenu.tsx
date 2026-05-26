"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import { getInitials } from "@/lib/initials";
import { cn } from "@/lib/cn";

interface Props {
  user: {
    name: string;
    email: string;
    role?: string;
  };
  /** Pass "light" on dark surfaces (e.g. designer toolbar) — flips colours. */
  variant?: "default" | "light";
}

export function UserMenu({ user, variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = getInitials(user.name);
  const isLight = variant === "light";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex items-center gap-2 rounded-full p-1 pr-2 transition",
          isLight ? "hover:bg-white/10" : "hover:bg-black/5"
        )}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-xs font-bold text-white">
          {initials}
        </span>
        <IconChevronDown
          size={14}
          className={cn(
            "transition-transform",
            open && "rotate-180",
            isLight ? "text-white/70" : "text-text-muted"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-card border border-border bg-white shadow-hover"
        >
          {/* Header */}
          <div className="border-b border-border px-4 py-3">
            <div className="truncate text-sm font-semibold text-text-primary">
              {user.name}
            </div>
            <div className="truncate text-xs text-text-muted">{user.email}</div>
            {user.role && user.role !== "CUSTOMER" && (
              <span className="mt-2 inline-flex rounded-badge bg-orange-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-orange">
                {user.role}
              </span>
            )}
          </div>

          {/* Links */}
          <nav className="py-1">
            <MenuLink href="/dashboard" icon={<IconLayoutDashboard size={16} />}>
              Dashboard
            </MenuLink>
            <MenuLink href="/dashboard/designs" icon={<IconLayoutGrid size={16} />}>
              My designs
            </MenuLink>
          </nav>

          <div className="border-t border-border py-1">
            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-bg-page disabled:opacity-60"
            >
              <IconLogout size={16} className="text-text-muted" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-bg-page"
    >
      <span className="text-text-muted">{icon}</span>
      {children}
    </Link>
  );
}
