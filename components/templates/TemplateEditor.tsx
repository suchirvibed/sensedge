"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconTrash,
  IconTypography,
  IconPhoto,
  IconQrcode,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconLogout,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { useFabricCanvas } from "@/components/designer/useFabricCanvas";
import {
  CARD_MM,
  DISPLAY_PPMM,
  getCanvasPx,
} from "@/components/designer/types";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "@/lib/template-categories";
import { cn } from "@/lib/cn";

interface Props {
  /** "new" for a fresh template, else the real template id. */
  templateId: string;
  initialName: string;
  initialCategory: TemplateCategory;
  initialIsPublic: boolean;
  initialCanvas: object | null;
  userName: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function TemplateEditor({
  templateId: initialId,
  initialName,
  initialCategory,
  initialIsPublic,
  initialCanvas,
  userName,
}: Props) {
  const router = useRouter();

  const [templateId, setTemplateId] = useState(initialId);
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<TemplateCategory>(initialCategory);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const canvas = useFabricCanvas({
    orientation: "HORIZONTAL",
    sizeId: "STANDARD",
  });

  // ─── Restore initial canvas once ───────────────────────
  const restoredRef = useRef(false);
  useEffect(() => {
    if (!canvas.ready || restoredRef.current) return;
    restoredRef.current = true;
    if (initialCanvas) {
      canvas.loadFromJSON(initialCanvas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas.ready]);

  // ─── Save ──────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!canvas.ready) return;
    if (name.trim().length === 0) {
      setError("Name is required");
      return;
    }
    setError(null);
    setSaveStatus("saving");
    try {
      const canvasJson = canvas.toJSON() ?? {};
      const previewUrl = canvas.toDataURL();
      const body = {
        name: name.trim(),
        category,
        isPublic,
        canvasJson,
        previewUrl,
      };
      const isNew = templateId === "new";
      const res = await fetch(
        isNew ? "/api/templates" : `/api/templates/${templateId}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (isNew) {
        setTemplateId(data.template.id);
        window.history.replaceState(
          null,
          "",
          `/graphics/templates/${data.template.id}`
        );
      }
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (e) {
      setSaveStatus("error");
      setError((e as Error).message);
      window.setTimeout(() => setSaveStatus("idle"), 2500);
    }
  }, [canvas, name, category, isPublic, templateId]);

  // ─── Delete ────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (templateId === "new") {
      router.push("/graphics/templates");
      return;
    }
    if (
      !window.confirm(
        "Delete this template? It will disappear from the customer's designer immediately."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      router.push("/graphics/templates");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [templateId, router]);

  // ─── Add QR ────────────────────────────────────────────
  const [qrInput, setQrInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function makeQR() {
    const text = qrInput.trim() || "https://printcard.co.in";
    const dataUrl = await QRCode.toDataURL(text, {
      margin: 0,
      width: 220,
      color: { dark: "#17191a", light: "#ffffff" },
    });
    canvas.addImage(dataUrl, { label: "QR code" });
    setQrInput("");
  }

  // ─── Delete-key shortcut for selected object ───────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (canvas.isEditingText()) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (canvas.selection.type === null) return;
        e.preventDefault();
        canvas.deleteActive();
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          if (e.shiftKey) canvas.redo();
          else canvas.undo();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [canvas]);

  const canvasPx = getCanvasPx("STANDARD", "HORIZONTAL");

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      {/* Header */}
      <header className="flex h-14 flex-none items-center justify-between border-b border-white/10 bg-bg-darker px-5">
        <div className="flex items-center gap-4">
          <Link
            href="/graphics/templates"
            className="flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <IconArrowLeft size={16} />
            Back
          </Link>
          <span className="h-5 w-px bg-white/10" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            className="w-64 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/40"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TemplateCategory)}
            className="h-8 rounded-md border border-white/10 bg-black/20 px-2 text-xs text-white focus:border-orange focus:outline-none"
          >
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-white/70">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/20 text-orange focus:ring-orange"
            />
            Published (visible to customers)
          </label>
          <span className="text-xs text-white/40">
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && (
              <span className="text-tint-redText">Save failed</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-btn border border-tint-redText/30 bg-transparent px-3 py-1.5 text-xs font-semibold text-tint-redText transition hover:bg-tint-redText/10"
          >
            <IconTrash size={14} />
            {templateId === "new" ? "Discard" : "Delete"}
          </button>
          <button
            type="button"
            onClick={save}
            className="flex items-center gap-2 rounded-btn bg-orange px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-orange-dark"
          >
            <IconDeviceFloppy size={16} />
            {saveStatus === "saving" ? "Saving…" : "Save template"}
          </button>
          <span className="hidden text-xs text-white/40 md:inline">{userName}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <IconLogout size={16} />
          </button>
        </div>
      </header>

      {/* Mobile gate */}
      <div className="flex flex-1 items-center justify-center px-8 text-center text-white lg:hidden">
        <div>
          Open this page on a desktop browser to edit templates.
        </div>
      </div>

      {/* Body */}
      <div className="hidden flex-1 overflow-hidden lg:flex">
        {/* Left panel — add fields */}
        <aside className="flex w-64 flex-none flex-col border-r border-white/10 bg-bg-darker">
          <div className="space-y-5 p-5">
            <div>
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/55">
                Add fields
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FieldButton
                  icon={<IconTypography size={16} />}
                  label="Text"
                  onClick={() => canvas.addText()}
                />
                <FieldButton
                  icon={<IconPhoto size={16} />}
                  label="Image"
                  onClick={() => fileRef.current?.click()}
                />
                <FieldButton
                  icon={<IconQrcode size={16} />}
                  label="QR"
                  onClick={makeQR}
                />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) canvas.addImageFromFile(f);
                  e.currentTarget.value = "";
                }}
              />
              <input
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="QR text (optional)"
                className="mt-2 h-8 w-full rounded-md border border-white/10 bg-black/20 px-3 text-xs text-white placeholder:text-white/30 focus:border-orange focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/55">
                Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SmallActionButton
                  icon={<IconArrowBackUp size={14} />}
                  label="Undo"
                  onClick={canvas.undo}
                  disabled={!canvas.canUndo}
                />
                <SmallActionButton
                  icon={<IconArrowForwardUp size={14} />}
                  label="Redo"
                  onClick={canvas.redo}
                  disabled={!canvas.canRedo}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Clear everything on the canvas? You can undo."
                    )
                  ) {
                    canvas.clearAll();
                  }
                }}
                className="mt-2 w-full rounded-md border border-tint-redText/30 bg-tint-redText/10 py-2 text-xs font-semibold text-tint-redText transition hover:bg-tint-redText/20"
              >
                Clear canvas
              </button>
            </div>

            {error && (
              <p className="rounded-input bg-tint-red/20 px-3 py-2 text-xs text-tint-redText">
                {error}
              </p>
            )}

            <p className="text-[10px] leading-relaxed text-white/40">
              Templates are shared. Anything you save as Published is loaded
              into customer designers immediately.
            </p>
          </div>
        </aside>

        {/* Canvas workspace */}
        <main className="flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:18px_18px]">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-white/40">
            Template · {CARD_MM.w} × {CARD_MM.h} mm
          </div>
          <div
            className="relative overflow-hidden rounded-card shadow-[0_20px_60px_-15px_rgba(232,93,4,0.4)] ring-1 ring-orange/40"
            style={{ width: canvasPx.w, height: canvasPx.h }}
          >
            <canvas
              ref={canvas.elRef}
              width={canvasPx.w}
              height={canvasPx.h}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute border border-dashed border-orange/50"
              style={{
                top: 2 * DISPLAY_PPMM,
                left: 2 * DISPLAY_PPMM,
                right: 2 * DISPLAY_PPMM,
                bottom: 2 * DISPLAY_PPMM,
              }}
            />
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-widest text-white/30">
            Click an object to edit · Press Delete to remove
          </div>
        </main>
      </div>
    </div>
  );
}

function FieldButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-3 text-[10px] font-medium uppercase tracking-widest text-white/75 transition hover:border-orange/50 hover:bg-orange/10 hover:text-white"
    >
      <span className="text-white/55 transition group-hover:text-orange">
        {icon}
      </span>
      {label}
    </button>
  );
}

function SmallActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-2 text-xs font-semibold text-white/75 transition",
        disabled
          ? "cursor-not-allowed opacity-30"
          : "hover:bg-white/[0.08] hover:text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
