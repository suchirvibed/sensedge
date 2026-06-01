"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconAlertCircle,
  IconChevronDown,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import type { PrintIssue, ValidationSummary } from "./printValidation";

interface Props {
  summary: ValidationSummary;
  currentSide: "FRONT" | "BACK";
  /** Click an issue to navigate to its side + select the object. */
  onJumpToIssue: (issue: PrintIssue) => void;
}

export function PrintValidationBadge({ summary, currentSide, onJumpToIssue }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { errors, warnings, ready, issues } = summary;

  let badgeClass = "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  let icon = <IconCircleCheck size={14} />;
  let label = "Print-ready";
  if (errors > 0) {
    badgeClass = "border-tint-redText/50 bg-tint-redText/15 text-tint-redText";
    icon = <IconAlertCircle size={14} />;
    label = `${errors} ${errors === 1 ? "error" : "errors"}${
      warnings > 0 ? ` · ${warnings} warning${warnings === 1 ? "" : "s"}` : ""
    }`;
  } else if (warnings > 0) {
    badgeClass = "border-amber-500/40 bg-amber-500/15 text-amber-300";
    icon = <IconAlertTriangle size={14} />;
    label = `${warnings} ${warnings === 1 ? "warning" : "warnings"}`;
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition",
          badgeClass
        )}
      >
        {icon}
        {label}
        <IconChevronDown
          size={12}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-40 w-80 overflow-hidden rounded-card border border-white/10 bg-bg-darker text-white shadow-hover">
          <div className="border-b border-white/10 px-4 py-3 text-xs">
            <div className="font-semibold">Print check</div>
            <div className="mt-0.5 text-white/55">
              Fiery + Citron-style ID-card printers. Targets safe-area, text size and image resolution.
            </div>
          </div>
          <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto">
            {ready ? (
              <li className="px-4 py-6 text-center text-xs text-white/55">
                Nothing to flag — your design is good to print.
              </li>
            ) : (
              issues.map((issue, i) => {
                const isCurrent = issue.side === currentSide;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToIssue(issue);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left text-xs transition hover:bg-white/5"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full",
                          issue.severity === "error"
                            ? "bg-tint-redText/20 text-tint-redText"
                            : "bg-amber-500/15 text-amber-300"
                        )}
                      >
                        {issue.severity === "error" ? (
                          <IconAlertCircle size={12} />
                        ) : (
                          <IconAlertTriangle size={12} />
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold text-white">
                          {issue.label} · {issue.side === "FRONT" ? "Front" : "Back"}
                          {!isCurrent && (
                            <span className="ml-1.5 text-[10px] uppercase tracking-widest text-orange">
                              Switch
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-white/65">{issue.message}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
