import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, body, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-white px-6 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-tint text-orange">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm text-text-body">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
