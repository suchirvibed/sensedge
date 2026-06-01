"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconDeviceDesktop } from "@tabler/icons-react";
import { DesignerToolbar } from "./DesignerToolbar";
import { DesignerLeftPanel } from "./DesignerLeftPanel";
import { DesignerRightPanel } from "./DesignerRightPanel";
import { useFabricCanvas } from "./useFabricCanvas";
import { CANVAS_PX, CARD_MM, DEFAULT_SPECS, type CardSpecs } from "./types";

interface Props {
  /** Either a real design id, or the literal "new" for an unsaved design. */
  designId: string;
  userName: string;
  initialName?: string;
  /** Loaded server-side from DB when designId is a real id. */
  initialCanvas?: object | null;
}

interface PersistedLocal {
  name: string;
  canvas: object;
  specs: CardSpecs;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const storageKey = (id: string) => `printcard:design:${id}`;

export function DesignerApp({
  designId: initialDesignId,
  userName,
  initialName = "Untitled design",
  initialCanvas,
}: Props) {
  const router = useRouter();

  // designId can change once: from "new" to a real id after the first save.
  const [designId, setDesignId] = useState(initialDesignId);
  const [designName, setDesignName] = useState(initialName);
  const [specs, setSpecs] = useState<CardSpecs>(DEFAULT_SPECS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Track whether anything has changed since the last DB save. Used to gate
  // the explicit "Save draft" button so we don't hit the API for nothing.
  const dirtyRef = useRef(false);
  const localSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);

  // ─── Local autosave (fast, every change) ───────────────
  const persistLocal = useCallback(() => {
    if (typeof window === "undefined") return;
    dirtyRef.current = true;
    if (localSaveTimer.current) clearTimeout(localSaveTimer.current);
    localSaveTimer.current = setTimeout(() => {
      try {
        const payload: PersistedLocal = {
          name: designName,
          canvas: (canvas.toJSON() ?? {}) as object,
          specs,
        };
        localStorage.setItem(storageKey(designId), JSON.stringify(payload));
      } catch (e) {
        console.warn("Local autosave failed", e);
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designId, designName, specs]);

  const canvas = useFabricCanvas({ onChange: persistLocal });

  // ─── Restore canvas on mount ───────────────────────────
  // Priority: server-loaded canvas > localStorage cache > blank.
  useEffect(() => {
    if (!canvas.ready || restoredRef.current) return;
    restoredRef.current = true;
    try {
      if (initialCanvas) {
        canvas.loadFromJSON(initialCanvas);
        return;
      }
      const raw = localStorage.getItem(storageKey(designId));
      if (!raw) return;
      const data = JSON.parse(raw) as PersistedLocal;
      if (data.name) setDesignName(data.name);
      if (data.specs) setSpecs(data.specs);
      if (data.canvas) canvas.loadFromJSON(data.canvas);
    } catch (e) {
      console.warn("Failed to restore design", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas.ready, designId]);

  // Mirror name/specs changes into the local autosave.
  useEffect(() => {
    if (!canvas.ready) return;
    persistLocal();
  }, [designName, specs, canvas.ready, persistLocal]);

  // ─── DB save ───────────────────────────────────────────
  const saveToDb = useCallback(async (): Promise<{ ok: boolean; id?: string }> => {
    if (!canvas.ready) return { ok: false };
    setSaveStatus("saving");
    try {
      const canvasJson = canvas.toJSON() ?? {};
      const previewUrl = canvas.toDataURL();

      if (designId === "new") {
        const res = await fetch("/api/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: designName, canvasJson, previewUrl }),
        });
        if (!res.ok) throw new Error(`POST /api/designs ${res.status}`);
        const data: { design: { id: string } } = await res.json();
        // Migrate localStorage key from "new" to the real id so we don't
        // accidentally clobber other "new" drafts.
        try {
          const stash = localStorage.getItem(storageKey("new"));
          if (stash) {
            localStorage.setItem(storageKey(data.design.id), stash);
            localStorage.removeItem(storageKey("new"));
          }
        } catch {
          /* localStorage may be unavailable; ignore */
        }
        setDesignId(data.design.id);
        // Update the URL so a refresh loads the saved design.
        window.history.replaceState(null, "", `/designer/${data.design.id}`);
        dirtyRef.current = false;
        setSaveStatus("saved");
        window.setTimeout(() => setSaveStatus("idle"), 1500);
        return { ok: true, id: data.design.id };
      }

      const res = await fetch(`/api/designs/${designId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: designName, canvasJson, previewUrl }),
      });
      if (!res.ok) throw new Error(`PUT /api/designs/${designId} ${res.status}`);
      dirtyRef.current = false;
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1500);
      return { ok: true, id: designId };
    } catch (e) {
      console.error("DB save failed", e);
      setSaveStatus("error");
      window.setTimeout(() => setSaveStatus("idle"), 2500);
      return { ok: false };
    }
  }, [canvas, designId, designName]);

  const handleSaveDraft = useCallback(() => {
    void saveToDb();
  }, [saveToDb]);

  // ─── Continue to order ─────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    const result = await saveToDb();
    if (!result.ok || !result.id) {
      alert("Couldn't save your design before checkout. Try again in a moment.");
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
            <div className="mb-4 text-xs uppercase tracking-widest text-white/40">
              Card front · {CARD_MM.w} × {CARD_MM.h} mm
            </div>
            <div
              className="relative overflow-hidden rounded-card shadow-[0_20px_60px_-15px_rgba(232,93,4,0.4)] ring-1 ring-orange/40"
              style={{ width: CANVAS_PX.w, height: CANVAS_PX.h }}
            >
              <canvas ref={canvas.elRef} width={CANVAS_PX.w} height={CANVAS_PX.h} />
            </div>
            <div className="mt-4 text-[10px] uppercase tracking-widest text-white/30">
              Click on objects to edit · Drag to move · Hold corners to resize
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
