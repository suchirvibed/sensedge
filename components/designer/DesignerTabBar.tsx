"use client";

import { IconX, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export interface TabMeta {
  /** Either a real Design.id, or a temp id starting with "new-". */
  id: string;
  name: string;
  /** True if this tab has never been saved to the DB. */
  isUnsaved: boolean;
}

interface Props {
  tabs: TabMeta[];
  activeId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onClose: (id: string) => void;
  /** False when at the tab cap. */
  canAdd: boolean;
}

export function DesignerTabBar({
  tabs,
  activeId,
  onSwitch,
  onAdd,
  onClose,
  canAdd,
}: Props) {
  return (
    <div className="flex h-10 items-end border-b border-white/10 bg-bg-darker">
      <div className="flex h-full flex-1 items-end gap-0.5 overflow-x-auto px-2">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <div
              key={tab.id}
              className={cn(
                "group relative flex h-full items-center gap-2 rounded-t-md border-t-2 px-3 transition",
                active
                  ? "border-orange bg-canvas text-white"
                  : "border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <button
                type="button"
                onClick={() => onSwitch(tab.id)}
                className="flex max-w-40 items-center gap-2 text-xs font-medium"
              >
                {tab.isUnsaved && (
                  <span
                    aria-label="Unsaved"
                    className={cn(
                      "h-1.5 w-1.5 flex-none rounded-full",
                      active ? "bg-orange" : "bg-white/40"
                    )}
                  />
                )}
                <span className="truncate">{tab.name || "Untitled"}</span>
              </button>
              {tabs.length > 1 && (
                <button
                  type="button"
                  aria-label={`Close ${tab.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(tab.id);
                  }}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-white/50 transition hover:bg-white/10 hover:text-white",
                    !active && "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <IconX size={12} />
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          aria-label="New design"
          title={canAdd ? "New design" : "Max 6 tabs — close one first"}
          onClick={onAdd}
          disabled={!canAdd}
          className={cn(
            "ml-1 mb-1 flex h-7 w-7 flex-none items-center justify-center rounded text-white/55 transition",
            canAdd
              ? "hover:bg-white/10 hover:text-white"
              : "cursor-not-allowed opacity-30"
          )}
        >
          <IconPlus size={14} />
        </button>
      </div>
      <div className="hidden h-full items-center pr-4 text-[10px] uppercase tracking-widest text-white/30 sm:flex">
        {tabs.length} / 6 tabs
      </div>
    </div>
  );
}
