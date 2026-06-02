"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconDeviceDesktop } from "@tabler/icons-react";
import { DesignerToolbar } from "./DesignerToolbar";
import { DesignerLeftPanel } from "./DesignerLeftPanel";
import { DesignerRightPanel } from "./DesignerRightPanel";
import { DesignerTabBar, type TabMeta } from "./DesignerTabBar";
import { useFabricCanvas } from "./useFabricCanvas";
import {
  DEFAULT_SPECS,
  DISPLAY_PPMM,
  getCanvasPx,
  getCardSize,
  type CardSpecs,
  type CardType,
  type Orientation,
} from "./types";
import {
  validateSide,
  summarise,
  SAFE_AREA_MM,
  type PrintIssue,
} from "./printValidation";
import { PrintValidationBadge } from "./PrintValidationBadge";
import { getDefaultFields } from "./cardTypeDefaults";
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

interface StoredTabs {
  list: TabMeta[];
  activeId: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SCHEMA_V2 = "v2" as const;
const MAX_TABS = 6;
const TABS_KEY = "printcard:tabs:v1";
const storageKey = (id: string) => `printcard:design:${id}`;

function isV2(j: unknown): j is CanvasV2 {
  return (
    typeof j === "object" &&
    j !== null &&
    (j as Record<string, unknown>).schema === SCHEMA_V2
  );
}

function isTempId(id: string): boolean {
  return id.startsWith("new-") || id === "new";
}

function makeTempId(): string {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function loadStoredTabs(): StoredTabs | null {
  try {
    const raw = localStorage.getItem(TABS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTabs;
    if (!Array.isArray(parsed.list) || parsed.list.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistTabs(list: TabMeta[], activeId: string) {
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify({ list, activeId }));
  } catch (e) {
    console.warn("Failed to persist tabs", e);
  }
}

export function DesignerApp({
  designId: initialDesignId,
  userName,
  initialName = "Untitled design",
  initialCanvas,
}: Props) {
  const router = useRouter();

  // ── Active-tab live state ──────────────────────────────
  const [designId, setDesignId] = useState(initialDesignId);
  const [designName, setDesignName] = useState(initialName);
  const [specs, setSpecs] = useState<CardSpecs>(DEFAULT_SPECS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [side, setSide] = useState<Side>("FRONT");
  const [frontIssues, setFrontIssues] = useState<PrintIssue[]>([]);
  const [backIssues, setBackIssues] = useState<PrintIssue[]>([]);

  // ── Tab strip state ────────────────────────────────────
  const [tabs, setTabs] = useState<TabMeta[]>(() => [
    { id: initialDesignId, name: initialName, isUnsaved: isTempId(initialDesignId) },
  ]);

  const sideRef = useRef<Side>(side);
  sideRef.current = side;
  const designIdRef = useRef<string>(designId);
  designIdRef.current = designId;
  const designNameRef = useRef(designName);
  designNameRef.current = designName;
  const specsRef = useRef(specs);
  specsRef.current = specs;

  const frontJsonRef = useRef<object | null>(null);
  const backJsonRef = useRef<object | null>(null);

  const localSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);

  // ─── Canvas change handler ─────────────────────────────
  function handleCanvasChange() {
    if (!canvas.ready) return;
    const snaps = canvas.getObjectSnapshots();
    const issues = validateSide({ side: sideRef.current, objects: snaps });
    if (sideRef.current === "FRONT") setFrontIssues(issues);
    else setBackIssues(issues);
    schedulePersistLocal();
  }

  const canvas = useFabricCanvas({
    onChange: handleCanvasChange,
    orientation: specs.orientation,
    sizeId: specs.sizeId,
  });

  // ─── Build the full {front, back} payload from refs + current canvas ─────
  const captureBothSides = useCallback((): CanvasV2 => {
    const currentJson = canvas.toJSON();
    const front = sideRef.current === "FRONT" ? currentJson : frontJsonRef.current;
    const back = sideRef.current === "BACK" ? currentJson : backJsonRef.current;
    return { schema: SCHEMA_V2, front, back };
  }, [canvas]);

  // ─── Local autosave (debounced) ────────────────────────
  function schedulePersistLocal() {
    if (localSaveTimer.current) clearTimeout(localSaveTimer.current);
    localSaveTimer.current = setTimeout(() => flushLocalSave(), 500);
  }

  // Synchronous flush — used before switching tabs so nothing is lost.
  const flushLocalSave = useCallback(() => {
    if (localSaveTimer.current) {
      clearTimeout(localSaveTimer.current);
      localSaveTimer.current = null;
    }
    if (!canvas.ready) return;
    try {
      const payload: PersistedLocal = {
        name: designNameRef.current,
        canvas: captureBothSides(),
        specs: specsRef.current,
      };
      localStorage.setItem(storageKey(designIdRef.current), JSON.stringify(payload));
    } catch (e) {
      console.warn("Local autosave failed", e);
    }
  }, [canvas, captureBothSides]);

  // ─── Apply a stored design payload to the live canvas ──
  const applyToCanvas = useCallback(
    (data: PersistedLocal | null) => {
      const safe = data ?? { name: "Untitled design", canvas: null, specs: DEFAULT_SPECS };
      setDesignName(safe.name);
      setSpecs(safe.specs);
      setSide("FRONT");
      setFrontIssues([]);
      setBackIssues([]);

      if (isV2(safe.canvas)) {
        frontJsonRef.current = safe.canvas.front;
        backJsonRef.current = safe.canvas.back;
        canvas.loadFromJSON(safe.canvas.front);
      } else if (safe.canvas) {
        frontJsonRef.current = safe.canvas;
        backJsonRef.current = null;
        canvas.loadFromJSON(safe.canvas);
      } else {
        frontJsonRef.current = null;
        backJsonRef.current = null;
        canvas.loadFromJSON(null);
      }
    },
    [canvas]
  );

  // ─── Restore tabs + initial canvas on mount ────────────
  useEffect(() => {
    if (!canvas.ready || restoredRef.current) return;
    restoredRef.current = true;

    // Active tab: comes from URL/props.
    // Tabs list: persisted in localStorage; we merge with the current designId.
    const stored = loadStoredTabs();
    let nextTabs: TabMeta[] = stored?.list ?? [];
    nextTabs = nextTabs.slice(0, MAX_TABS);
    if (!nextTabs.find((t) => t.id === initialDesignId)) {
      nextTabs = [
        { id: initialDesignId, name: initialName, isUnsaved: isTempId(initialDesignId) },
        ...nextTabs,
      ].slice(0, MAX_TABS);
    }
    setTabs(nextTabs);
    persistTabs(nextTabs, initialDesignId);

    // Server-provided canvas wins for the initial tab.
    try {
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
      } else {
        const raw = localStorage.getItem(storageKey(initialDesignId));
        if (raw) {
          const data = JSON.parse(raw) as PersistedLocal;
          applyToCanvas(data);
        }
      }
    } catch (e) {
      console.warn("Failed to restore design", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas.ready]);

  // Keep the active tab's metadata in sync with the live name.
  useEffect(() => {
    setTabs((prev) => {
      const found = prev.find((t) => t.id === designId);
      if (!found || found.name === designName) return prev;
      const next = prev.map((t) =>
        t.id === designId ? { ...t, name: designName } : t
      );
      persistTabs(next, designId);
      return next;
    });
  }, [designName, designId]);

  // Persist on name / specs changes
  useEffect(() => {
    if (!canvas.ready) return;
    schedulePersistLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designName, specs, canvas.ready]);

  // ─── Tab actions ───────────────────────────────────────
  const switchToTab = useCallback(
    (targetId: string) => {
      if (targetId === designIdRef.current) return;
      if (!canvas.ready) return;

      // 1. Persist the leaving tab so the entering one is fresh.
      flushLocalSave();

      // 2. Load target from localStorage (DB load is via full nav for real ids).
      let other: PersistedLocal | null = null;
      try {
        const raw = localStorage.getItem(storageKey(targetId));
        if (raw) other = JSON.parse(raw) as PersistedLocal;
      } catch {
        /* ignore */
      }

      setDesignId(targetId);
      applyToCanvas(other);
      persistTabs(
        // refresh active in storage (list stays the same)
        tabs,
        targetId
      );

      // 3. URL: real id → /designer/{id}; temp id → /designer/new
      const urlId = isTempId(targetId) ? "new" : targetId;
      window.history.replaceState(null, "", `/designer/${urlId}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvas, flushLocalSave, applyToCanvas, tabs]
  );

  const addTab = useCallback(() => {
    if (tabs.length >= MAX_TABS) return;
    const tempId = makeTempId();
    flushLocalSave();

    const nextTabs: TabMeta[] = [
      ...tabs,
      { id: tempId, name: "Untitled design", isUnsaved: true },
    ];
    setTabs(nextTabs);
    setDesignId(tempId);
    applyToCanvas(null);
    persistTabs(nextTabs, tempId);
    window.history.replaceState(null, "", `/designer/new`);
  }, [tabs, flushLocalSave, applyToCanvas]);

  const closeTab = useCallback(
    (idToClose: string) => {
      const remaining = tabs.filter((t) => t.id !== idToClose);

      // Drop the tab's localStorage cache. (Real designs stay in DB.)
      try {
        localStorage.removeItem(storageKey(idToClose));
      } catch {
        /* ignore */
      }

      // Don't ever leave the editor empty — auto-create a fresh tab.
      let finalTabs = remaining;
      if (finalTabs.length === 0) {
        const tempId = makeTempId();
        finalTabs = [{ id: tempId, name: "Untitled design", isUnsaved: true }];
      }

      setTabs(finalTabs);

      // If the closed tab was active, switch to the first remaining tab.
      if (idToClose === designIdRef.current) {
        const next = finalTabs[0];
        flushLocalSave();
        setDesignId(next.id);
        let other: PersistedLocal | null = null;
        try {
          const raw = localStorage.getItem(storageKey(next.id));
          if (raw) other = JSON.parse(raw) as PersistedLocal;
        } catch {
          /* ignore */
        }
        applyToCanvas(other);
        const urlId = isTempId(next.id) ? "new" : next.id;
        window.history.replaceState(null, "", `/designer/${urlId}`);
        persistTabs(finalTabs, next.id);
      } else {
        persistTabs(finalTabs, designIdRef.current);
      }
    },
    [tabs, flushLocalSave, applyToCanvas]
  );

  // ─── Side toggle (front ↔ back) ────────────────────────
  function handleSetSide(next: Side) {
    if (next === side) return;
    const currentJson = canvas.toJSON();
    if (side === "FRONT") frontJsonRef.current = currentJson;
    else backJsonRef.current = currentJson;
    const otherJson = next === "FRONT" ? frontJsonRef.current : backJsonRef.current;
    canvas.loadFromJSON(otherJson);
    setSide(next);
  }

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
    const wasTemp = isTempId(designIdRef.current);
    const tempIdAtStart = designIdRef.current;

    async function send(withPreview: boolean): Promise<{ design: { id: string } }> {
      const body: Record<string, unknown> = { name: designName, canvasJson };
      if (withPreview && previewUrl) body.previewUrl = previewUrl;
      const method = wasTemp ? "POST" : "PUT";
      const url = wasTemp ? "/api/designs" : `/api/designs/${tempIdAtStart}`;
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
        console.warn("Save with preview failed, retrying without:", firstErr);
        data = await send(false);
      }

      if (wasTemp) {
        const newId = data.design.id;
        // Migrate localStorage key
        try {
          const stash = localStorage.getItem(storageKey(tempIdAtStart));
          if (stash) {
            localStorage.setItem(storageKey(newId), stash);
            localStorage.removeItem(storageKey(tempIdAtStart));
          }
        } catch {
          /* ignore */
        }
        // Update tabs metadata: temp id → real id
        setTabs((prev) => {
          const next = prev.map((t) =>
            t.id === tempIdAtStart ? { id: newId, name: designName, isUnsaved: false } : t
          );
          persistTabs(next, newId);
          return next;
        });
        setDesignId(newId);
        window.history.replaceState(null, "", `/designer/${newId}`);
      } else {
        // Sync the saved=true flag (in case this tab was previously isUnsaved=true)
        setTabs((prev) => {
          const found = prev.find((t) => t.id === designIdRef.current);
          if (!found || !found.isUnsaved) return prev;
          const next = prev.map((t) =>
            t.id === designIdRef.current ? { ...t, isUnsaved: false } : t
          );
          persistTabs(next, designIdRef.current);
          return next;
        });
      }

      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1500);
      return { ok: true, id: wasTemp ? data.design.id : tempIdAtStart };
    } catch (e) {
      console.error("DB save failed:", e);
      setSaveStatus("error");
      window.setTimeout(() => setSaveStatus("idle"), 2500);
      return { ok: false };
    }
  }, [canvas, captureBothSides, designName]);

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

  // ─── Validation summary ────────────────────────────────
  const summary = summarise([...frontIssues, ...backIssues]);
  const handleJumpToIssue = useCallback(
    (issue: PrintIssue) => {
      if (issue.side !== side) {
        handleSetSide(issue.side);
        window.setTimeout(() => canvas.selectByIndex(issue.objectIndex), 80);
      } else {
        canvas.selectByIndex(issue.objectIndex);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side, canvas]
  );
  const handleDeleteIssue = useCallback(
    (issue: PrintIssue) => {
      if (issue.side !== side) {
        handleSetSide(issue.side);
        // Wait one tick for the canvas to repaint the other side, then remove.
        window.setTimeout(() => canvas.removeByIndex(issue.objectIndex), 80);
      } else {
        canvas.removeByIndex(issue.objectIndex);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side, canvas]
  );

  const doubleSided = specs.side === "DOUBLE";
  const safeInset = SAFE_AREA_MM * DISPLAY_PPMM;
  const canvasPx = getCanvasPx(specs.sizeId, specs.orientation);
  const currentSize = getCardSize(specs.sizeId);

  // ─── Card-type defaults ────────────────────────────────
  const handleLoadCardTypeDefaults = useCallback(() => {
    if (specs.cardType === "OTHERS") return;
    if (
      !window.confirm(
        "Replace the current side's design with the default fields? This can be undone."
      )
    ) {
      return;
    }
    const fields = getDefaultFields(specs.cardType);
    canvas.runBatch(() => {
      canvas.clear();
      for (const f of fields) {
        if (f.kind === "text") {
          canvas.addText({
            text: f.text,
            label: f.label,
            left: f.left,
            top: f.top,
            width: f.width,
            fontSize: f.fontSize,
            fontWeight: f.fontWeight,
            fill: f.fill,
            textAlign: f.textAlign,
          });
        } else {
          canvas.addPlaceholderRect({
            label: f.label,
            left: f.left,
            top: f.top,
            width: f.width,
            height: f.height,
          });
        }
      }
    });
  }, [specs.cardType, canvas]);

  // ─── Clear current side ────────────────────────────────
  const handleClearSide = useCallback(() => {
    if (canvas.getObjectSnapshots().length === 0) return;
    if (!window.confirm("Clear all fields on this side? You can undo.")) return;
    canvas.clearAll();
  }, [canvas]);

  // ─── Per-side fields snapshot for the field list ───────
  const fields = canvas.getObjectSnapshots();

  // ─── Undo / redo keyboard shortcuts ────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      if (canvas.isEditingText()) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      }
      // Ctrl+Z / Cmd+Z → undo
      // Ctrl+Shift+Z OR Ctrl+Y → redo
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        if (e.shiftKey) canvas.redo();
        else canvas.undo();
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        canvas.redo();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [canvas]);

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

      <div className="hidden h-screen flex-col bg-canvas pt-3 lg:flex">
        <DesignerTabBar
          tabs={tabs}
          activeId={designId}
          onSwitch={switchToTab}
          onAdd={addTab}
          onClose={closeTab}
          canAdd={tabs.length < MAX_TABS}
        />

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
            cardType={specs.cardType}
            onCardTypeChange={(cardType: CardType) =>
              setSpecs((s) => ({ ...s, cardType }))
            }
            onLoadCardTypeDefaults={handleLoadCardTypeDefaults}
            sizeId={specs.sizeId}
            onSizeChange={(sizeId) => setSpecs((s) => ({ ...s, sizeId }))}
            orientation={specs.orientation}
            onOrientationChange={(orientation: Orientation) =>
              setSpecs((s) => ({ ...s, orientation }))
            }
            onAddText={() => canvas.addText()}
            onAddImageFile={canvas.addImageFromFile}
            onAddImageDataUrl={canvas.addImage}
            onSave={handleSaveDraft}
            onClear={handleClearSide}
            onUndo={canvas.undo}
            onRedo={canvas.redo}
            canUndo={canvas.canUndo}
            canRedo={canvas.canRedo}
            saveStatus={saveStatus}
            side={side}
            fields={fields}
            onSelectField={canvas.selectByIndex}
            onRemoveField={canvas.removeByIndex}
          />

          {/* Canvas workspace */}
          <main className="relative flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:18px_18px]">
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
                onDeleteIssue={handleDeleteIssue}
              />
            </div>

            <div className="mb-4 text-xs uppercase tracking-widest text-white/40">
              Card {side === "FRONT" ? "front" : "back"} · {currentSize.w} × {currentSize.h} mm ·{" "}
              {specs.orientation === "HORIZONTAL" ? "Landscape" : "Portrait"}
            </div>

            <div
              className="relative overflow-hidden rounded-card shadow-[0_20px_60px_-15px_rgba(232,93,4,0.4)] ring-1 ring-orange/40"
              style={{ width: canvasPx.w, height: canvasPx.h }}
            >
              <canvas ref={canvas.elRef} width={canvasPx.w} height={canvasPx.h} />
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
              Click to select · Drag corners to resize · Press{" "}
              <kbd className="rounded bg-white/10 px-1 py-0.5 text-[9px] text-white">
                Delete
              </kbd>{" "}
              to remove
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
