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
  designId: string;
  userName: string;
}

interface PersistedDesign {
  name: string;
  canvas: object;
  specs: CardSpecs;
}

const storageKey = (id: string) => `printcard:design:${id}`;

export function DesignerApp({ designId, userName }: Props) {
  const router = useRouter();
  const [designName, setDesignName] = useState("Untitled design");
  const [specs, setSpecs] = useState<CardSpecs>(DEFAULT_SPECS);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const restoredRef = useRef(false);

  // Autosave debounce timer
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(() => {
    if (typeof window === "undefined") return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const payload: PersistedDesign = {
          name: designName,
          canvas: (canvas.toJSON() ?? {}) as object,
          specs,
        };
        localStorage.setItem(storageKey(designId), JSON.stringify(payload));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
      } catch (e) {
        console.error("autosave failed", e);
        setSaveStatus("idle");
      }
    }, 600);
  }, [designId, designName, specs]); // eslint-disable-line react-hooks/exhaustive-deps

  const canvas = useFabricCanvas({ onChange: persist });

  // Restore from localStorage once canvas is ready
  useEffect(() => {
    if (!canvas.ready || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(storageKey(designId));
      if (!raw) return;
      const data = JSON.parse(raw) as PersistedDesign;
      if (data.name) setDesignName(data.name);
      if (data.specs) setSpecs(data.specs);
      if (data.canvas) canvas.loadFromJSON(data.canvas);
    } catch (e) {
      console.warn("Failed to restore design", e);
    }
  }, [canvas.ready, designId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save when name or specs change
  useEffect(() => {
    if (!canvas.ready) return;
    persist();
  }, [designName, specs, canvas.ready, persist]);

  function handlePlaceOrder() {
    // Checkout isn't built yet. The design is already autosaved locally,
    // so we route the user to their dashboard where they'll be able to
    // resume / place orders once /checkout exists.
    alert(
      "Checkout is coming next — your design is autosaved locally. You'll be taken to your dashboard."
    );
    router.push("/dashboard");
  }

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
          onSaveLocal={persist}
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
