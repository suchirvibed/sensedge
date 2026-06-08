"use client";

import { useEffect, useState } from "react";
import { IconLayoutBoard, IconLoader2 } from "@tabler/icons-react";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "@/lib/template-categories";
import { cn } from "@/lib/cn";

interface TemplateRow {
  id: string;
  name: string;
  category: string;
  previewUrl: string | null;
}

interface Props {
  /** Called when the user picks a template. Receives the canvasJson
   *  fetched from /api/templates/[id]. */
  onPickTemplate: (canvasJson: object, name: string) => void;
  /** True if the canvas has existing fields the user might lose. */
  canvasHasContent: boolean;
}

export function DesignerTemplatePicker({
  onPickTemplate,
  canvasHasContent,
}: Props) {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<TemplateCategory | "">("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = category
      ? `/api/templates?category=${encodeURIComponent(category)}`
      : "/api/templates";
    fetch(url)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load templates");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setTemplates(data.templates ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError((e as Error).message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  async function pick(id: string, name: string) {
    if (canvasHasContent) {
      if (
        !window.confirm(
          `Load "${name}" — this will replace what's on the canvas. Continue?`
        )
      ) {
        return;
      }
    }
    setLoadingId(id);
    try {
      const res = await fetch(`/api/templates/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load template");
      onPickTemplate(data.template.canvasJson as object, name);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="p-5">
      <div className="mb-3 text-xs uppercase tracking-widest text-white/40">
        Category
      </div>
      <div className="flex flex-wrap gap-1.5">
        <CategoryChip
          label="All"
          active={category === ""}
          onClick={() => setCategory("")}
        />
        {TEMPLATE_CATEGORIES.map((c) => (
          <CategoryChip
            key={c}
            label={c}
            active={category === c}
            onClick={() => setCategory(c)}
          />
        ))}
      </div>

      <div className="mt-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-white/40">
            <IconLoader2 size={20} className="animate-spin" />
            <span className="mt-2 text-xs">Loading templates…</span>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-tint-redText/30 bg-tint-redText/10 px-3 py-2 text-xs text-tint-redText">
            {error}
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-white/50">
            <IconLayoutBoard
              size={32}
              strokeWidth={1.2}
              className="text-white/30"
            />
            <div className="mt-3 text-xs font-semibold text-white/70">
              No templates here yet
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/45">
              Pick another category, or design from scratch.
            </p>
          </div>
        )}

        {!loading && !error && templates.length > 0 && (
          <ul className="space-y-2">
            {templates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => pick(t.id, t.name)}
                  disabled={loadingId === t.id}
                  className="flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-2 text-left transition hover:border-orange/40 hover:bg-orange/10 disabled:opacity-50"
                >
                  <div className="h-10 w-16 flex-none overflow-hidden rounded bg-bg-page">
                    {t.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.previewUrl}
                        alt={t.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-widest text-white/30">
                        No preview
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-white">
                      {t.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">
                      {t.category}
                    </div>
                  </div>
                  {loadingId === t.id && (
                    <IconLoader2
                      size={14}
                      className="animate-spin text-white/55"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition",
        active
          ? "border-orange bg-orange/15 text-white"
          : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}
