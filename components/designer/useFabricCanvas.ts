"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { CANVAS_PX, getCanvasPx, type Orientation } from "./types";
import { computeAlignment, type GuideLine } from "./alignmentGuides";

export interface SelectionInfo {
  type: "text" | "image" | "shape" | null;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fill?: string;
  textAlign?: string;
}

export interface ObjectSnapshot {
  index: number;
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  effectiveWidth: number;
  effectiveHeight: number;
  /** Custom label set on creation (Photo, Name, Logo, …). Falls back to type. */
  label: string;
  fontSize?: number;
  text?: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

interface UseFabricCanvasArgs {
  /** Called on every meaningful change (used for autosave + validation). */
  onChange?: () => void;
  /** Orientation drives canvas dimensions. */
  orientation?: Orientation;
  /** Size id (lookup into CARD_SIZES). */
  sizeId?: string;
  /** Called continuously during a drag with the current alignment guide
   *  lines. Called with [] when the drag ends so the consumer can clear. */
  onGuideLines?: (lines: GuideLine[]) => void;
}

const HISTORY_LIMIT = 30;

// Monkey-patch Fabric serialisation once, globally, so our custom
// `label` property round-trips through toJSON / loadFromJSON.
let serializationPatched = false;
function patchSerialization() {
  if (serializationPatched) return;
  serializationPatched = true;
  const proto = fabric.Object.prototype as fabric.Object & {
    toObject: (props?: string[]) => Record<string, unknown>;
  };
  const baseToObject = proto.toObject;
  proto.toObject = function (propsToInclude?: string[]) {
    return baseToObject.call(this, ["label", ...(propsToInclude ?? [])]);
  };
}

export function useFabricCanvas({
  onChange,
  orientation = "HORIZONTAL",
  sizeId = "STANDARD",
  onGuideLines,
}: UseFabricCanvasArgs = {}) {
  const elRef = useRef<HTMLCanvasElement>(null);
  const fcRef = useRef<fabric.Canvas | null>(null);
  const [selection, setSelection] = useState<SelectionInfo>({ type: null });
  const [ready, setReady] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onGuideLinesRef = useRef(onGuideLines);
  onGuideLinesRef.current = onGuideLines;

  // ── Undo / redo history ──────────────────────────────
  const historyRef = useRef<{ stack: object[]; index: number }>({
    stack: [],
    index: -1,
  });
  const suppressHistoryRef = useRef(false);
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  function refreshUndoRedoFlags() {
    const h = historyRef.current;
    setCanUndo(h.index > 0);
    setCanRedo(h.index < h.stack.length - 1);
  }

  function pushHistorySnapshot(snap: object) {
    const h = historyRef.current;
    // Drop the redo branch
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(snap);
    if (h.stack.length > HISTORY_LIMIT) {
      h.stack.shift();
    } else {
      h.index++;
    }
    refreshUndoRedoFlags();
  }

  function pushHistoryFromCanvas() {
    const fc = fcRef.current;
    if (!fc) return;
    const snap = fc.toJSON(["label"]);
    pushHistorySnapshot(snap);
  }

  function resetHistory() {
    const fc = fcRef.current;
    if (!fc) {
      historyRef.current = { stack: [], index: -1 };
    } else {
      historyRef.current = { stack: [fc.toJSON(["label"])], index: 0 };
    }
    refreshUndoRedoFlags();
  }

  // ── Init ────────────────────────────────────────────────
  useEffect(() => {
    if (!elRef.current) return;
    patchSerialization();
    const initial = getCanvasPx(sizeId, orientation);
    const fc = new fabric.Canvas(elRef.current, {
      width: initial.w,
      height: initial.h,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selectionColor: "rgba(232, 93, 4, 0.12)",
      selectionBorderColor: "#E85D04",
      selectionLineWidth: 1,
    });

    // Apply orange / circle handles globally for any object selection.
    fabric.Object.prototype.set({
      cornerColor: "#E85D04",
      cornerStrokeColor: "#ffffff",
      borderColor: "#E85D04",
      cornerStyle: "circle",
      cornerSize: 9,
      transparentCorners: false,
      borderScaleFactor: 1.5,
      padding: 2,
    });
    fcRef.current = fc;
    resetHistory();
    setReady(true);

    const refresh = () => {
      const o = fc.getActiveObject();
      if (!o) return setSelection({ type: null });
      if (o.type === "textbox" || o.type === "i-text" || o.type === "text") {
        const t = o as fabric.Textbox;
        setSelection({
          type: "text",
          fontFamily: t.fontFamily,
          fontSize: t.fontSize,
          fontWeight: t.fontWeight,
          fill: typeof t.fill === "string" ? t.fill : undefined,
          textAlign: t.textAlign,
        });
      } else if (o.type === "image") {
        setSelection({ type: "image" });
      } else {
        setSelection({ type: "shape" });
      }
    };

    const fireChange = () => onChangeRef.current?.();

    // Debounced history push so a long drag = one entry, not 60.
    const scheduleHistory = () => {
      if (suppressHistoryRef.current) return;
      if (historyTimer.current) clearTimeout(historyTimer.current);
      historyTimer.current = setTimeout(() => {
        pushHistoryFromCanvas();
      }, 250);
    };

    const isFullyOffCanvas = (obj: fabric.Object): boolean => {
      const left = obj.left ?? 0;
      const top = obj.top ?? 0;
      const w =
        typeof (obj as fabric.Object & { getScaledWidth?: () => number }).getScaledWidth === "function"
          ? (obj as fabric.Object & { getScaledWidth: () => number }).getScaledWidth()
          : (obj.width ?? 0) * (obj.scaleX ?? 1);
      const h =
        typeof (obj as fabric.Object & { getScaledHeight?: () => number }).getScaledHeight === "function"
          ? (obj as fabric.Object & { getScaledHeight: () => number }).getScaledHeight()
          : (obj.height ?? 0) * (obj.scaleY ?? 1);
      return (
        left + w < 0 ||
        left > fc.getWidth() ||
        top + h < 0 ||
        top > fc.getHeight()
      );
    };

    fc.on("selection:created", refresh);
    fc.on("selection:updated", refresh);
    fc.on("selection:cleared", () => setSelection({ type: null }));

    // ── Smart alignment guides ────────────────────────
    fc.on("object:moving", (e) => {
      const obj = e.target as fabric.Object | undefined;
      if (!obj) return;
      const others = fc.getObjects().filter((o) => o !== obj);
      const getBox = (o: fabric.Object) => {
        const w = (o as fabric.Object & { getScaledWidth?: () => number })
          .getScaledWidth?.() ?? (o.width ?? 0) * (o.scaleX ?? 1);
        const h = (o as fabric.Object & { getScaledHeight?: () => number })
          .getScaledHeight?.() ?? (o.height ?? 0) * (o.scaleY ?? 1);
        return { left: o.left ?? 0, top: o.top ?? 0, width: w, height: h };
      };
      const movBox = getBox(obj);
      const otherBoxes = others.map(getBox);
      const result = computeAlignment(movBox, otherBoxes, fc.getWidth(), fc.getHeight());

      // Apply snap by adjusting object position
      if (result.left !== undefined) obj.set({ left: result.left });
      if (result.top !== undefined) obj.set({ top: result.top });

      // Push guide lines up to the renderer
      onGuideLinesRef.current?.(result.lines);
    });

    // Clear guides when the user releases the mouse
    fc.on("mouse:up", () => {
      onGuideLinesRef.current?.([]);
    });

    fc.on("object:modified", (e) => {
      const obj = e.target as fabric.Object | undefined;
      if (obj && isFullyOffCanvas(obj)) {
        fc.remove(obj);
        fc.discardActiveObject();
        fc.requestRenderAll();
        return; // object:removed will fire change + history
      }
      scheduleHistory();
      fireChange();
    });
    fc.on("object:added", () => {
      scheduleHistory();
      fireChange();
    });
    fc.on("object:removed", () => {
      scheduleHistory();
      fireChange();
    });

    return () => {
      if (historyTimer.current) clearTimeout(historyTimer.current);
      fc.dispose();
      fcRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resize canvas when orientation or size changes ─────
  useEffect(() => {
    const fc = fcRef.current;
    if (!fc || !ready) return;
    const next = getCanvasPx(sizeId, orientation);
    fc.setWidth(next.w);
    fc.setHeight(next.h);
    fc.requestRenderAll();
  }, [orientation, sizeId, ready]);

  // ── Mutators ────────────────────────────────────────────
  interface AddTextOpts {
    text?: string;
    label?: string;
    left?: number;
    top?: number;
    width?: number;
    fontSize?: number;
    fontWeight?: string | number;
    fontFamily?: string;
    fill?: string;
    textAlign?: string;
  }

  const addText = useCallback((opts?: AddTextOpts) => {
    const fc = fcRef.current;
    if (!fc) return;
    const t = new fabric.Textbox(opts?.text ?? "Your text", {
      left: opts?.left ?? 40,
      top: opts?.top ?? 40,
      fontFamily: opts?.fontFamily ?? "Inter",
      fontSize: opts?.fontSize ?? 18,
      fontWeight: opts?.fontWeight ?? "normal",
      fill: opts?.fill ?? "#17191a",
      width: opts?.width ?? 200,
      textAlign: opts?.textAlign ?? "left",
    });
    (t as fabric.Object & { label?: string }).label = opts?.label ?? "Text";
    fc.add(t);
    fc.setActiveObject(t);
    fc.requestRenderAll();
  }, []);

  interface AddImageOpts {
    label?: string;
    left?: number;
    top?: number;
    maxWidth?: number; // px
  }

  const addImage = useCallback((dataUrl: string, opts?: AddImageOpts) => {
    const fc = fcRef.current;
    if (!fc) return;
    fabric.Image.fromURL(
      dataUrl,
      (img) => {
        const maxW = opts?.maxWidth ?? fc.getWidth() * 0.4;
        if (img.width && img.width > maxW) {
          img.scale(maxW / img.width);
        }
        img.set({ left: opts?.left ?? 30, top: opts?.top ?? 30 });
        (img as fabric.Object & { label?: string }).label = opts?.label ?? "Image";
        fc.add(img);
        fc.setActiveObject(img);
        fc.requestRenderAll();
      },
      { crossOrigin: "anonymous" }
    );
  }, []);

  const addImageFromFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string")
          addImage(e.target.result, { label: "Photo" });
      };
      reader.readAsDataURL(file);
    },
    [addImage]
  );

  const addPlaceholderRect = useCallback((opts: {
    label: string;
    left: number;
    top: number;
    width: number;
    height: number;
    fill?: string;
  }) => {
    const fc = fcRef.current;
    if (!fc) return;
    const r = new fabric.Rect({
      left: opts.left,
      top: opts.top,
      width: opts.width,
      height: opts.height,
      fill: opts.fill ?? "rgba(0,0,0,0.06)",
      stroke: "rgba(0,0,0,0.25)",
      strokeDashArray: [4, 4],
      strokeWidth: 1,
    });
    (r as fabric.Object & { label?: string }).label = opts.label;
    fc.add(r);
    fc.requestRenderAll();
  }, []);

  const updateActive = useCallback(
    (props: Partial<fabric.Textbox & fabric.Object>) => {
      const fc = fcRef.current;
      if (!fc) return;
      const o = fc.getActiveObject();
      if (!o) return;
      o.set(props as Partial<fabric.Object>);
      fc.requestRenderAll();
      if (o.type === "textbox" || o.type === "i-text" || o.type === "text") {
        const t = o as fabric.Textbox;
        setSelection({
          type: "text",
          fontFamily: t.fontFamily,
          fontSize: t.fontSize,
          fontWeight: t.fontWeight,
          fill: typeof t.fill === "string" ? t.fill : undefined,
          textAlign: t.textAlign,
        });
      }
      onChangeRef.current?.();
    },
    []
  );

  const deleteActive = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const o = fc.getActiveObject();
    if (!o) return;
    fc.remove(o);
    fc.discardActiveObject();
    fc.requestRenderAll();
  }, []);

  const toJSON = useCallback((): object | null => {
    const fc = fcRef.current;
    if (!fc) return null;
    return fc.toJSON(["label"]);
  }, []);

  const loadFromJSON = useCallback(
    (json: object | null | undefined, done?: () => void) => {
      const fc = fcRef.current;
      if (!fc) return;
      suppressHistoryRef.current = true;
      if (!json) {
        fc.clear();
        fc.backgroundColor = "#ffffff";
        fc.requestRenderAll();
        resetHistory();
        suppressHistoryRef.current = false;
        done?.();
        return;
      }
      fc.loadFromJSON(json, () => {
        fc.requestRenderAll();
        resetHistory();
        suppressHistoryRef.current = false;
        done?.();
      });
    },
    []
  );

  const clear = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    fc.clear();
    fc.backgroundColor = "#ffffff";
    fc.requestRenderAll();
  }, []);

  /** Like clear() but emits one history entry so it's undoable. */
  const clearAll = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    // Suppress per-object removals → one batched history entry at the end
    suppressHistoryRef.current = true;
    fc.getObjects().slice().forEach((o) => fc.remove(o));
    fc.discardActiveObject();
    fc.requestRenderAll();
    suppressHistoryRef.current = false;
    pushHistoryFromCanvas();
    onChangeRef.current?.();
  }, []);

  /** Run multiple add operations as a single undo step. */
  const runBatch = useCallback((fn: () => void) => {
    suppressHistoryRef.current = true;
    fn();
    suppressHistoryRef.current = false;
    pushHistoryFromCanvas();
    onChangeRef.current?.();
  }, []);

  const undo = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const h = historyRef.current;
    if (h.index <= 0) return;
    h.index--;
    refreshUndoRedoFlags();
    suppressHistoryRef.current = true;
    fc.loadFromJSON(h.stack[h.index], () => {
      fc.requestRenderAll();
      suppressHistoryRef.current = false;
      onChangeRef.current?.();
    });
  }, []);

  const redo = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index++;
    refreshUndoRedoFlags();
    suppressHistoryRef.current = true;
    fc.loadFromJSON(h.stack[h.index], () => {
      fc.requestRenderAll();
      suppressHistoryRef.current = false;
      onChangeRef.current?.();
    });
  }, []);

  const toDataURL = useCallback((): string | null => {
    const fc = fcRef.current;
    if (!fc) return null;
    try {
      return fc.toDataURL({ format: "jpeg", quality: 0.6, multiplier: 0.4 });
    } catch (err) {
      console.warn("toDataURL failed (likely a CORS-tainted image)", err);
      return null;
    }
  }, []);

  const isEditingText = useCallback((): boolean => {
    const fc = fcRef.current;
    if (!fc) return false;
    const o = fc.getActiveObject() as fabric.Textbox | undefined;
    return Boolean(o && (o as fabric.Textbox & { isEditing?: boolean }).isEditing);
  }, []);

  const getObjectSnapshots = useCallback((): ObjectSnapshot[] => {
    const fc = fcRef.current;
    if (!fc) return [];
    return fc.getObjects().map((o, index) => {
      const obj = o as fabric.Object & {
        getScaledWidth?: () => number;
        getScaledHeight?: () => number;
        label?: string;
      };
      const effectiveWidth =
        typeof obj.getScaledWidth === "function"
          ? obj.getScaledWidth()
          : (o.width ?? 0) * (o.scaleX ?? 1);
      const effectiveHeight =
        typeof obj.getScaledHeight === "function"
          ? obj.getScaledHeight()
          : (o.height ?? 0) * (o.scaleY ?? 1);

      const fallbackLabel = ((): string => {
        if (o.type === "textbox" || o.type === "i-text" || o.type === "text") return "Text";
        if (o.type === "image") return "Image";
        if (o.type === "rect") return "Shape";
        return o.type ?? "Field";
      })();

      const snap: ObjectSnapshot = {
        index,
        type: o.type ?? "unknown",
        left: o.left ?? 0,
        top: o.top ?? 0,
        width: o.width ?? 0,
        height: o.height ?? 0,
        effectiveWidth,
        effectiveHeight,
        label: obj.label ?? fallbackLabel,
      };
      if (o.type === "textbox" || o.type === "i-text" || o.type === "text") {
        const t = o as fabric.Textbox;
        snap.fontSize = t.fontSize;
        snap.text = t.text;
      }
      if (o.type === "image") {
        const im = o as fabric.Image;
        const elem = im.getElement?.() as HTMLImageElement | undefined;
        snap.naturalWidth = elem?.naturalWidth ?? im.width;
        snap.naturalHeight = elem?.naturalHeight ?? im.height;
      }
      return snap;
    });
  }, []);

  const selectByIndex = useCallback((index: number) => {
    const fc = fcRef.current;
    if (!fc) return;
    const obj = fc.getObjects()[index];
    if (!obj) return;
    fc.setActiveObject(obj);
    fc.requestRenderAll();
  }, []);

  const removeByIndex = useCallback((index: number) => {
    const fc = fcRef.current;
    if (!fc) return;
    const obj = fc.getObjects()[index];
    if (!obj) return;
    fc.remove(obj);
    fc.discardActiveObject();
    fc.requestRenderAll();
  }, []);

  /** Move the active object by dx/dy pixels (keyboard nudging). */
  const nudgeActive = useCallback((dx: number, dy: number) => {
    const fc = fcRef.current;
    if (!fc) return;
    const o = fc.getActiveObject();
    if (!o) return;
    o.set({ left: (o.left ?? 0) + dx, top: (o.top ?? 0) + dy });
    o.setCoords();
    fc.requestRenderAll();
    fc.fire("object:modified", { target: o });
  }, []);

  /** Clone the active object 10px offset. */
  const duplicateActive = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const o = fc.getActiveObject();
    if (!o) return;
    o.clone(
      (clone: fabric.Object) => {
        clone.set({
          left: (o.left ?? 0) + 12,
          top: (o.top ?? 0) + 12,
        });
        (clone as fabric.Object & { label?: string }).label =
          (o as fabric.Object & { label?: string }).label;
        fc.add(clone);
        fc.setActiveObject(clone);
        fc.requestRenderAll();
      },
      ["label"]
    );
  }, []);

  const bringForward = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const o = fc.getActiveObject();
    if (!o) return;
    fc.bringForward(o);
    fc.requestRenderAll();
    onChangeRef.current?.();
  }, []);

  const sendBackward = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const o = fc.getActiveObject();
    if (!o) return;
    fc.sendBackwards(o);
    fc.requestRenderAll();
    onChangeRef.current?.();
  }, []);

  const bringToFront = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const o = fc.getActiveObject();
    if (!o) return;
    fc.bringToFront(o);
    fc.requestRenderAll();
    onChangeRef.current?.();
  }, []);

  const sendToBack = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const o = fc.getActiveObject();
    if (!o) return;
    fc.sendToBack(o);
    fc.requestRenderAll();
    onChangeRef.current?.();
  }, []);

  // Re-export CANVAS_PX-style getter for the live size.
  const getDimensions = useCallback((): { w: number; h: number } => {
    const fc = fcRef.current;
    if (!fc) return { w: CANVAS_PX.w, h: CANVAS_PX.h };
    return { w: fc.getWidth(), h: fc.getHeight() };
  }, []);

  /** Force Fabric to redraw. Called after we un-hide the canvas wrapper
   *  (Inkjet → Thermal toggle) just to be defensive. */
  const requestRenderAll = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    fc.requestRenderAll();
  }, []);

  return {
    elRef,
    ready,
    selection,
    addText,
    addImage,
    addImageFromFile,
    addPlaceholderRect,
    updateActive,
    deleteActive,
    toJSON,
    loadFromJSON,
    clear,
    clearAll,
    runBatch,
    undo,
    redo,
    canUndo,
    canRedo,
    toDataURL,
    isEditingText,
    getObjectSnapshots,
    selectByIndex,
    removeByIndex,
    getDimensions,
    nudgeActive,
    duplicateActive,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    requestRenderAll,
  };
}
