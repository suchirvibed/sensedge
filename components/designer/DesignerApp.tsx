"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconDeviceDesktop } from "@tabler/icons-react";
import { DesignerToolbar } from "./DesignerToolbar";
import { DesignerLeftPanel } from "./DesignerLeftPanel";
import { DesignerRightPanel } from "./DesignerRightPanel";
import { useFabricCanvas } from "./useFabricCanvas";
import {
  CANVAS_PX,
  CARD_MM,
  DEFAULT_SPECS,
  DISPLAY_PPMM,
  type CardSpecs,
} from "./types";
import {
  validateSide,
  summarise,
  SAFE_AREA_MM,
  type PrintIssue,
} from "./printValidation";
import { PrintValidationBadge } from "./PrintValidationBadge";
import { cn } from "@/lib/cn";

interface Props {
  designId: string;
  userName: string;
  initialName?: string;
  initialCanvas?: object | null;
}

type Side = "FRONT" | "BACK";

interface CanvasV2 {
  schema: "v2";
  front: object | null;
  back: object | null;
}

interface PersistedLocal {
  name: string;
  canvas: CanvasV2 | object | null;
  specs: CardSpecs;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SCHEMA_V2 = "v2" as const;
const storageKey = (id: string) => `printcard:design:${id}`;

function isV2(j: unknown): j is CanvasV2 {
  return (
    typeof j === "object" &&
    j !== null &&
    (j as Record<string, unknown>).schema === SCHEMA_V2
  );
}

export function DesignerApp({
  designId: initialDesignId,
  userName,
  initialName = "Untitled design",
  initialCanvas,
}: Props) {
  const router = useRouter();

  const [designId, setDesignId] = useState(initialDesignId);
  const [designName, setDesignName] = useState(initialName);
  const [specs, setSpecs] = useState<CardSpecs>(DEFAULT_SPECS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [side, setSide] = useState<Side>("FRONT");
  const [frontIssues, setFrontIssues] = useState<PrintIssue[]>([]);
  const [backIssues, setBackIssues] = useState<PrintIssue[]>([]);

  // Mirrors so canvas event callbacks always see the latest values
  const sideRef = useRef<Side>(side);
  sideRef.current = side;

  // Per-side serialized canvas (the one not currently in the canvas widget)
  const frontJsonRef = useRef<object | null>(null);
  const backJsonRef = useRef<object | null>(null);

  const localSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);

  // ─── Canvas change handler ─────────────────────────────
  // Runs validation for the CURRENT side, then schedules local autosave.
  function handleCanvasChange() {
    if (!canvas.ready) return;
    const snaps = canvas.getObjectSnapshots();
    const issues = validateSide({ side: sideRef.current, objects: snaps });
    if (sideRef.current === "FRONT") setFrontIssues(issues);
    else setBackIssues(issues);
    schedulePersistLocal();
  }

  const canvas = useFabricCanvas({ onChange: handleCanvasChange });

  // ─── Build the full {front, back} payload from refs + current canvas ─────
  const captureBothSides = useCallback((): CanvasV2 => {
    const currentJson = canvas.toJSON();
    const front = sideRef.current === "FRONT" ? currentJson : frontJsonRef.current;
    const back = sideRef.current === "BACK" ? currentJson : backJsonRef.current;
    return { schema: SCHEMA_V2, front, back };
  }, [canvas]);

  // ─── Local autosave (fast) ─────────────────────────────
  function schedulePersistLocal() {
    if (localSaveTimer.current) clearTimeout(localSaveTimer.current);
    localSaveTimer.current = setTimeout(() => {
      try {
        const payload: PersistedLocal = {
          name: designName,
          canvas: captureBothSides(),
          specs,
        };
        localStorage.setItem(storageKey(designId), JSON.stringify(payload));
      } catch (e) {
        console.warn("Local autosave failed", e);
      }
    }, 500);
  }

  // ─── Restore on mount ──────────────────────────────────
  useEffect(() => {
    if (!canvas.ready || restoredRef.current) return;
    restoredRef.current = true;
    try {
      // Server-provided canvas wins
      if (initialCanvas) {
        if (isV2(initialCanvas)) {
          frontJsonRef.current = initialCanvas.front;
          backJsonRef.current = initialCanvas.back;
          canvas.loadFromJSON(initialCanvas.front);
        } else {
          frontJsonRef.current = initialCanvas;
          backJsonRef.current = null;
          canvas.loadFromJSON(initialCanvas);
        }
        return;
      }
      // Fallback: localStorage
      const raw = localStorage.getItem(storageKey(designId));
      if (!raw) return;
      const data = JSON.parse(raw) as PersistedLocal;
      if (data.name) setDesignName(data.name);
      if (data.specs) setSpecs(data.specs);
      if (data.canvas) {
        if (isV2(data.canvas)) {
          frontJsonRef.current = data.canvas.front;
          backJsonRef.current = data.canvas.back;
          canvas.loadFromJSON(data.canvas.front);
        } else {
          frontJsonRef.current = data.canvas as object;
          backJsonRef.current = null;
          canvas.loadFromJSON(data.canvas as object);
        }
      }
    } catch (e) {
      console.warn("Failed to restore design", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas.ready, designId]);

  // Persist on name / specs changes
  useEffect(() => {
    if (!canvas.ready) return;
    schedulePersistLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designName, specs, canvas.ready]);

  // ─── Side toggle (front ↔ back) ────────────────────────
  function handleSetSide(next: Side) {
    if (next === side) return;
    // Save current canvas to current side's slot
    const currentJson = canvas.toJSON();
    if (side === "FRONT") frontJsonRef.current = currentJson;
    else backJsonRef.current = currentJson;
    // Load the other side's stored canvas (may be null = blank)
    const otherJson = next === "FRONT" ? frontJsonRef.current : backJsonRef.current;
    canvas.loadFromJSON(otherJson);
    setSide(next);
  }

  // Auto-clamp side to FRONT if user switches printSide to SINGLE while on BACK
  useEffect(() => {
    if (specs.side === "SINGLE" && side === "BACK") {
      handleSetSide("FRONT");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs.side]);

  // ─── Delete key removes selected object ────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      // Don't fight Fabric's Textbox edit-mode keyboard handling
      if (canvas.isEditingText()) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if ((target as HTMLElement).isContentEditable) return;
      }
      if (canvas.selection.type === null) return;
      e.preventDefault();
      canvas.deleteActive();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [canvas]);

  // ─── DB save (with retry) ──────────────────────────────
  const saveToDb = useCallback(async (): Promise<{ ok: boolean; id?: string }> => {
    if (!canvas.ready) return { ok: false };
    setSaveStatus("saving");

    const canvasJson = captureBothSides();
    const previewUrl = canvas.toDataURL();

    async function send(withPreview: boolean): Promise<{ design: { id: string } }> {
      const body: Record<string, unknown> = { name: designName, canvasJson };
      if (withPreview && previewUrl) body.previewUrl = previewUrl;
      const method = designId === "new" ? "POST" : "PUT";
      const url = designId === "new" ? "/api/designs" : `/api/designs/${designId}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`${method} ${url} → ${res.status} ${errText.slice(0, 200)}`);
      }
      return res.json();
    }

    try {
      let data: { design: { id: string } };
      try {
        data = await send(true);
      } catch (firstErr) {
        // Most likely a payload-size error. Retry without the preview.
        console.warn("Save with preview failed, retrying without preview:", firstErr);
        data = await send(false);
      }

      if (designId === "new") {
        // Migrate the localStorage key so a refresh on the new URL still works.
        try {
          const stash = localStorage.getItem(storageKey("new"));
          if (stash) {
            localStorage.setItem(storageKey(data.design.id), stash);
            localStorage.removeItem(storageKey("new"));
          }
        } catch {
          /* ignore */
        }
        setDesignId(data.design.id);
        window.history.replaceState(null, "", `/designer/${data.design.id}`);
      }

      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1500);
      return { ok: true, id: designId === "new" ? data.design.id : designId };
    } catch (e) {
      console.error("DB save failed:", e);
      setSaveStatus("error");
      window.setTimeout(() => setSaveStatus("idle"), 2500);
      return { ok: false };
    }
  }, [canvas, captureBothSides, designId, designName]);

  const handleSaveDraft = useCallback(() => {
    void saveToDb();
  }, [saveToDb]);

  const handlePlaceOrder = useCallback(async () => {
    const result = await saveToDb();
    if (!result.ok || !result.id) {
      alert(
        "Couldn't save your design before checkout. Check the console for details and try again."
      );
      return;
    }
    const sp = new URLSearchParams({
      designId: result.id,
      material: specs.material,
      finish: specs.finish,
      chip: specs.chip,
      side: specs.side,
      printer: specs.printer,
      quantity: String(specs.quantity),
    });
    router.push(`/checkout?${sp.toString()}`);
  }, [saveToDb, specs, router]);

  // ─── Validation summary across both sides ──────────────
  const summary = summarise([...frontIssues, ...backIssues]);
  const handleJumpToIssue = useCallback(
    (issue: PrintIssue) => {
      if (issue.side !== side) {
        handleSetSide(issue.side);
        // wait a tick for the new side to load before selecting
        window.setTimeout(() => canvas.selectByIndex(issue.objectIndex), 80);
      } else {
        canvas.selectByIndex(issue.objectIndex);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side, canvas]
  );

  const doubleSided = specs.side === "DOUBLE";
  const safeInset = SAFE_AREA_MM * DISPLAY_PPMM;

  return (
    <>
      {/* Mobile gate */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas p-8 text-white lg:hidden">
        <div className="max-w-sm text-center">
          <IconDeviceDesktop size={42} className="mx-auto text-orange" />
          <h2 className="h3 mt-5 text-white">Please open the designer on desktop</h2>
          <p className="mt-3 text-sm text-white/60">
            The PrintCard designer is built for a larger screen. Open this link on a
            laptop or desktop browser to start designing.
          </p>
        </div>
      </div>

      <div className="hidden h-screen flex-col lg:flex">
        <DesignerToolbar
          designName={designName}
          onNameChange={setDesignName}
          saveStatus={saveStatus}
          onSaveLocal={handleSaveDraft}
          onPlaceOrder={handlePlaceOrder}
          userName={userName}
        />

        <div className="flex flex-1 overflow-hidden">
          <DesignerLeftPanel
            hasSelection={canvas.selection.type !== null}
            onAddText={canvas.addText}
            onAddImageFile={canvas.addImageFromFile}
            onAddImageDataUrl={canvas.addImage}
            onDeleteActive={canvas.deleteActive}
          />

          {/* Canvas workspace */}
          <main className="relative flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:18px_18px]">
            {/* Top bar — side toggle + validation badge */}
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
              {doubleSided ? (
                <SideToggle current={side} onChange={handleSetSide} />
              ) : (
                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  Single side · enable “Both sides” in card options for a back design
                </div>
              )}
            </div>
            <div className="absolute right-4 top-4 z-10">
              <PrintValidationBadge
                summary={summary}
                currentSide={side}
                onJumpToIssue={handleJumpToIssue}
              />
            </div>

            <div className="mb-4 text-xs uppercase tracking-widest text-white/40">
              Card {side === "FRONT" ? "front" : "back"} · {CARD_MM.w} × {CARD_MM.h} mm
            </div>

            {/* Canvas + safe-area dashed overlay */}
            <div
              className="relative overflow-hidden rounded-card shadow-[0_20px_60px_-15px_rgba(232,93,4,0.4)] ring-1 ring-orange/40"
              style={{ width: CANVAS_PX.w, height: CANVAS_PX.h }}
            >
              <canvas ref={canvas.elRef} width={CANVAS_PX.w} height={CANVAS_PX.h} />
              {/* Safe area guide — never captures pointer events */}
              <div
                aria-hidden
                className="pointer-events-none absolute border border-dashed border-orange/50"
                style={{
                  top: safeInset,
                  left: safeInset,
                  right: safeInset,
                  bottom: safeInset,
                }}
              />
            </div>

            <div className="mt-4 text-[10px] uppercase tracking-widest text-white/30">
              Click to select · Drag corners to resize · Press <kbd className="rounded bg-white/10 px-1 py-0.5 text-[9px] text-white">Delete</kbd> to remove
            </div>
          </main>

          <DesignerRightPanel
            selection={canvas.selection}
            specs={specs}
            onSpecsChange={setSpecs}
            onUpdateActive={(props) =>
              canvas.updateActive(props as Parameters<typeof canvas.updateActive>[0])
            }
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </>
  );
}

// ─── Side toggle pills ─────────────────────────────────────
function SideToggle({
  current,
  onChange,
}: {
  current: Side;
  onChange: (s: Side) => void;
}) {
  return (
    <div className="flex rounded-full border border-white/10 bg-bg-darker p-1">
      {(["FRONT", "BACK"] as const).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={cn(
            "rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-widest transition",
            current === s
              ? "bg-orange text-white"
              : "text-white/60 hover:text-white"
          )}
        >
          {s === "FRONT" ? "Front" : "Back"}
        </button>
      ))}
    </div>
  );
}
