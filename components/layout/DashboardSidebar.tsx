"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconLayoutGrid,
  IconPackage,
  IconUser,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: IconLayoutDashboard },
  { href: "/dashboard/designs", label: "My designs", icon: IconLayoutGrid },
  { href: "/dashboard/orders", label: "Orders", icon: IconPackage },
  { href: "/dashboard/settings", label: "Account", icon: IconUser },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-none flex-col border-r border-border bg-white lg:flex">
      <div className="flex h-nav items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-text-primary text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M3 11h18" />
              <path d="M7 16h4" />
            </svg>
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-text-primary">
            PrintCard
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-btn px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-bg-subtle text-text-primary"
                  : "text-text-body hover:bg-bg-subtle hover:text-text-primary"
              )}
            >
              <Icon
                size={17}
                strokeWidth={1.6}
                className={active ? "text-orange" : "text-text-muted"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/designer/new"
          className="flex items-center justify-center gap-2 rounded-btn bg-text-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange"
        >
          + New design
        </Link>
      </div>
    </aside>
  );
}
