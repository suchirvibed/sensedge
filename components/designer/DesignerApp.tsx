"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconDeviceDesktop, IconPrinter, IconArrowRight } from "@tabler/icons-react";
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
import type { GuideLine } from "./alignmentGuides";
import { calculatePrice, formatINR } from "@/lib/pricing";
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

  const [guideLines, setGuideLines] = useState<GuideLine[]>([]);

  const canvas = useFabricCanvas({
    onChange: handleCanvasChange,
    orientation: specs.orientation,
    sizeId: specs.sizeId,
    onGuideLines: setGuideLines,
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

  // When switching from INKJET back to THERMAL, the canvas wrapper goes
  // from invisible to visible. Defensively kick Fabric to re-render so
  // the white background + objects are guaranteed to paint.
  useEffect(() => {
    if (specs.printer === "THERMAL" && canvas.ready) {
      const id = window.setTimeout(() => canvas.requestRenderAll(), 0);
      return () => window.clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs.printer, canvas.ready]);

  // ─── Editor keyboard shortcuts ─────────────────────────
  // Delete / Backspace — remove
  // Arrow keys           — nudge 1px (Shift = 10px)
  // Ctrl/Cmd+D           — duplicate
  // Ctrl/Cmd+]           — bring forward
  // Ctrl/Cmd+[           — send backward
  // Ctrl/Cmd+Shift+]     — bring to front
  // Ctrl/Cmd+Shift+[     — send to back
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (canvas.isEditingText()) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if ((target as HTMLElement).isContentEditable) return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      const hasSelection = canvas.selection.type !== null;

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!hasSelection) return;
        e.preventDefault();
        canvas.deleteActive();
        return;
      }

      // Arrow nudge
      if (hasSelection && !isMod) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          canvas.nudgeActive(-step, 0);
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          canvas.nudgeActive(step, 0);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          canvas.nudgeActive(0, -step);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          canvas.nudgeActive(0, step);
          return;
        }
      }

      if (!isMod) return;

      // Cmd+D duplicate
      if (e.key === "d" || e.key === "D") {
        if (!hasSelection) return;
        e.preventDefault();
        canvas.duplicateActive();
        return;
      }
      // Layer order
      if (e.key === "]") {
        if (!hasSelection) return;
        e.preventDefault();
        if (e.shiftKey) canvas.bringToFront();
        else canvas.bringForward();
        return;
      }
      if (e.key === "[") {
        if (!hasSelection) return;
        e.preventDefault();
        if (e.shiftKey) canvas.sendToBack();
        else canvas.sendBackward();
        return;
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [canvas]);

  // ─── DB save (with retry) ──────────────────────────────
  const saveToDb = useCallback(async (): Promise<{
    ok: boolean;
    id?: string;
    error?: string;
  }> => {
    if (!canvas.ready) return { ok: false, error: "Canvas isn't ready yet." };
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
      const message = (e as Error).message ?? "Unknown error";
      // Common case: dev DB isn't running. Make that diagnosable.
      const friendlyHint = /5\d\d|Failed to fetch|fetch failed|reach database/i.test(message)
        ? "\n\nServer may be down or the database isn't running. Make sure `docker compose up -d` is up."
        : "";
      return { ok: false, error: message + friendlyHint };
    }
  }, [canvas, captureBothSides, designName]);

  const handleSaveDraft = useCallback(() => {
    void saveToDb();
  }, [saveToDb]);

  const handlePlaceOrder = useCallback(async () => {
    // ── Inkjet path ──────────────────────────────────
    // Inkjet cards are blank — there's nothing to save. Go straight to
    // checkout. The /checkout page auto-creates (or reuses) a single
    // "[BLANK INKJET]" design row per user so the order has something
    // to FK to without forcing the user through a design save.
    if (specs.printer === "INKJET") {
      const sp = new URLSearchParams({
        inkjet: "1",
        quantity: String(specs.quantity),
      });
      router.push(`/checkout?${sp.toString()}`);
      return;
    }

    // ── Thermal path ─────────────────────────────────
    // Save the design so the order references a real Design row.
    const result = await saveToDb();
    if (!result.ok || !result.id) {
      alert(
        `Couldn't save your design before checkout.\n\n${
          result.error ?? "Unknown error — open the browser console for details."
        }`
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
            isInkjet={specs.printer === "INKJET"}
            printer={specs.printer}
            onPrinterChange={(printer) =>
              setSpecs((s) =>
                printer === "INKJET"
                  ? {
                      // Inkjet cards are blank — clamp the design-relevant
                      // specs to neutral so pricing is consistent.
                      ...s,
                      printer,
                      material: "PVC",
                      finish: "MATTE",
                      chip: "NONE",
                      side: "SINGLE",
                    }
                  : { ...s, printer }
              )
            }
            printSide={specs.side}
            onPrintSideChange={(side) =>
              setSpecs((s) => ({ ...s, side }))
            }
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
            canvasHasContent={fields.length > 0}
            onPickTemplate={(canvasJson, name) => {
              // Replace the current side's content with the template's
              // canvas JSON. Then update the design name if it's still the
              // generic default — saves the user a click.
              canvas.loadFromJSON(canvasJson);
              if (designName === "Untitled design") {
                setDesignName(name);
              }
            }}
          />

          {/* Canvas workspace */}
          <main className="relative flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:18px_18px]">
            {/* Inkjet bypass overlay — sits on top when Inkjet is selected */}
            {specs.printer === "INKJET" && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-canvas">
                <InkjetBypassPanel
                  onSwitchToThermal={() =>
                    setSpecs((s) => ({ ...s, printer: "THERMAL" }))
                  }
                  onContinue={handlePlaceOrder}
                  quantity={specs.quantity}
                  onQuantityChange={(q) =>
                    setSpecs((s) => ({ ...s, quantity: q }))
                  }
                />
              </div>
            )}

            {/* Side toggle — hidden when Inkjet */}
            {specs.printer !== "INKJET" && (
              <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
                {doubleSided ? (
                  <SideToggle current={side} onChange={handleSetSide} />
                ) : (
                  <div className="text-[10px] uppercase tracking-widest text-white/40">
                    Single side · enable “Both sides” in card options for a back design
                  </div>
                )}
              </div>
            )}

            {/* Validation badge — hidden when Inkjet */}
            {specs.printer !== "INKJET" && (
              <div className="absolute right-4 top-4 z-10">
                <PrintValidationBadge
                  summary={summary}
                  currentSide={side}
                  onJumpToIssue={handleJumpToIssue}
                  onDeleteIssue={handleDeleteIssue}
                />
              </div>
            )}

            {/* Card label — hidden when Inkjet */}
            {specs.printer !== "INKJET" && (
              <div className="mb-4 text-xs uppercase tracking-widest text-white/40">
                Card {side === "FRONT" ? "front" : "back"} · {currentSize.w} × {currentSize.h} mm ·{" "}
                {specs.orientation === "HORIZONTAL" ? "Landscape" : "Portrait"}
              </div>
            )}

            {/* Canvas wrapper — ALWAYS mounted so Fabric keeps its DOM
                reference. CSS-hidden during Inkjet to avoid the remount
                glitch that wipes the white background on switch-back. */}
            <div
              className={cn(
                "relative overflow-hidden rounded-card shadow-[0_20px_60px_-15px_rgba(232,93,4,0.4)] ring-1 ring-orange/40",
                specs.printer === "INKJET" && "invisible pointer-events-none absolute"
              )}
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
              {/* Alignment guide overlay — magenta dashed lines while dragging */}
              {guideLines.length > 0 && (
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  width={canvasPx.w}
                  height={canvasPx.h}
                  viewBox={`0 0 ${canvasPx.w} ${canvasPx.h}`}
                >
                  {guideLines.map((g, i) => (
                    <line
                      key={i}
                      x1={g.x1}
                      y1={g.y1}
                      x2={g.x2}
                      y2={g.y2}
                      stroke="#ec4899"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />
                  ))}
                </svg>
              )}
            </div>

            {/* Keyboard hints — hidden when Inkjet */}
            {specs.printer !== "INKJET" && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest text-white/30">
                <span>
                  <Kbd>↑↓←→</Kbd> nudge · <Kbd>Shift</Kbd>+arrow = 10 px
                </span>
                <span>
                  <Kbd>Del</Kbd> remove · <Kbd>Ctrl</Kbd>+<Kbd>D</Kbd> duplicate
                </span>
                <span>
                  <Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd> undo
                </span>
              </div>
            )}
          </main>

          {specs.printer !== "INKJET" && (
            <DesignerRightPanel
              selection={canvas.selection}
              specs={specs}
              onSpecsChange={setSpecs}
              onUpdateActive={(props) =>
                canvas.updateActive(props as Parameters<typeof canvas.updateActive>[0])
              }
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ─── Inkjet bypass panel ──────────────────────────────────
// Inkjet cards are blank — no design, no finish, no chip, no print side.
// The bypass panel becomes the complete order form: edit quantity, see
// live price, place the order. We force neutral specs upstream so the
// pricing engine returns a clean PVC-base × qty number.
function InkjetBypassPanel({
  onSwitchToThermal,
  onContinue,
  quantity,
  onQuantityChange,
}: {
  onSwitchToThermal: () => void;
  onContinue: () => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
}) {
  const canCheckout = quantity >= 25;
  // Price for blank PVC at the chosen quantity. Specs are forced neutral
  // upstream when the printer is INKJET, so this stays consistent with
  // what the orders API will compute server-side.
  const safeQty = Math.max(quantity, 1);
  const price = calculatePrice({
    quantity: safeQty,
    material: "PVC",
    finish: "MATTE",
    chipType: "NONE",
    printSide: "SINGLE",
  });

  const stepQty = (delta: number) => {
    onQuantityChange(Math.max(0, quantity + delta));
  };

  return (
    <div className="flex w-full max-w-lg flex-col px-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange/15 text-orange">
          <IconPrinter size={26} strokeWidth={1.6} />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">
          Blank Inkjet cards
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
          Plain unprinted PVC cards ready for your office inkjet printer. No
          design, finish or chip — just pick a quantity and order.
        </p>
      </div>

      {/* Quantity stepper */}
      <div className="mt-7 rounded-card border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/55">
            Quantity
          </span>
          <span className="text-[10px] text-white/40">Minimum 25 cards</span>
        </div>
        <div className="flex items-stretch gap-3">
          <button
            type="button"
            aria-label="Decrease by 25"
            onClick={() => stepQty(-25)}
            disabled={quantity <= 0}
            className="flex h-12 w-12 flex-none items-center justify-center rounded-md border border-white/10 text-xl text-white transition hover:bg-white/10 disabled:opacity-30"
          >
            −
          </button>
          <input
            type="number"
            min={0}
            step={1}
            value={quantity ? quantity : ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return onQuantityChange(0);
              const n = parseInt(raw, 10);
              if (Number.isFinite(n) && n >= 0) onQuantityChange(n);
            }}
            placeholder="0"
            className={cn(
              "h-12 w-full rounded-md border bg-black/20 text-center text-xl font-semibold text-white focus:outline-none",
              quantity > 0 && quantity < 25
                ? "border-tint-redText/40 focus:border-tint-redText"
                : "border-white/10 focus:border-orange"
            )}
          />
          <button
            type="button"
            aria-label="Increase by 25"
            onClick={() => stepQty(25)}
            className="flex h-12 w-12 flex-none items-center justify-center rounded-md border border-white/10 text-xl text-white transition hover:bg-white/10"
          >
            +
          </button>
        </div>
        {quantity > 0 && quantity < 25 && (
          <p className="mt-2 text-[11px] text-tint-redText">
            Minimum order is 25 cards. We can&rsquo;t print fewer than that.
          </p>
        )}
      </div>

      {/* Live price (hidden until valid) */}
      {canCheckout && (
        <div className="mt-4 rounded-card border border-white/10 bg-white/[0.03] p-5">
          <div className="space-y-2 text-sm">
            <RowKV label="Per card" value={formatINR(price.pricePerCard)} />
            <RowKV
              label={`Subtotal (${quantity} cards)`}
              value={formatINR(price.subtotalBeforeDiscount)}
            />
            {price.discountRate > 0 && (
              <RowKV
                label={`Bulk discount (${Math.round(price.discountRate * 100)}%)`}
                value={`− ${formatINR(price.discountAmount)}`}
                tone="orange"
              />
            )}
            <RowKV
              label="Shipping"
              value={price.shipping === 0 ? "Free" : formatINR(price.shipping)}
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
            <span className="text-xs uppercase tracking-widest text-white/55">
              Total
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              {formatINR(price.total)}
            </span>
          </div>
        </div>
      )}

      {/* CTAs */}
      <button
        type="button"
        onClick={onContinue}
        disabled={!canCheckout}
        className={cn(
          "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn text-sm font-semibold transition",
          canCheckout
            ? "bg-orange text-white hover:bg-orange-dark"
            : "cursor-not-allowed bg-white/5 text-white/30"
        )}
      >
        {canCheckout
          ? `Place order · ${formatINR(price.total)}`
          : "Set quantity to continue"}
        {canCheckout && <IconArrowRight size={16} />}
      </button>
      <button
        type="button"
        onClick={onSwitchToThermal}
        className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-btn border border-white/10 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
      >
        Switch to Thermal to design custom cards
      </button>
    </div>
  );
}

function RowKV({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "orange";
}) {
  return (
    <div className="flex items-baseline justify-between text-xs">
      <span className="text-white/55">{label}</span>
      <span
        className={cn(
          "font-mono",
          tone === "orange" ? "text-orange" : "text-white/90"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Kbd helper ────────────────────────────────────────────
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-white/10 px-1 py-0.5 text-[9px] font-semibold text-white">
      {children}
    </kbd>
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
