"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClipboardCheck, IconLayoutGrid } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/graphics", label: "Review queue", icon: IconClipboardCheck },
  { href: "/graphics/templates", label: "Templates", icon: IconLayoutGrid },
];

export function GraphicsSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 flex-none flex-col border-r border-border bg-white lg:flex">
      <div className="flex h-nav items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-tint-purpleText text-white">
            <IconClipboardCheck size={16} strokeWidth={1.8} />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-text-primary">
            Graphics
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/graphics"
              ? pathname === "/graphics"
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
