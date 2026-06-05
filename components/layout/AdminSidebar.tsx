"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconPackage,
  IconUsers,
  IconCurrencyRupee,
  IconChartBar,
  IconSettings,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Overview", icon: IconLayoutDashboard },
  { href: "/admin/orders", label: "All orders", icon: IconPackage },
  { href: "/admin/users", label: "Users", icon: IconUsers },
  { href: "/admin/pricing", label: "Pricing", icon: IconCurrencyRupee },
  { href: "/admin/analytics", label: "Analytics", icon: IconChartBar },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
];

export function AdminSidebar() {
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
            Admin
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
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
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-btn border border-border px-4 py-2 text-xs font-semibold text-text-body transition hover:border-text-primary hover:bg-bg-subtle"
        >
          ← Customer view
        </Link>
      </div>
    </aside>
  );
}
