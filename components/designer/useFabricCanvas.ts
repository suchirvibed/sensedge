"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { CANVAS_PX } from "./types";

export interface SelectionInfo {
  type: "text" | "image" | "shape" | null;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fill?: string;
  textAlign?: string;
}

export interface ObjectSnapshot {
  /** stable index — Fabric doesn't expose ids by default */
  index: number;
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Effective on-canvas pixel size after scale. */
  effectiveWidth: number;
  effectiveHeight: number;
  /** Text-only */
  fontSize?: number;
  text?: string;
  /** Image-only — the underlying natural size, useful for DPI checks. */
  naturalWidth?: number;
  naturalHeight?: number;
}

interface UseFabricCanvasArgs {
  /** Called on every meaningful change (used for autosave). */
  onChange?: () => void;
}

export function useFabricCanvas({ onChange }: UseFabricCanvasArgs = {}) {
  const elRef = useRef<HTMLCanvasElement>(null);
  const fcRef = useRef<fabric.Canvas | null>(null);
  const [selection, setSelection] = useState<SelectionInfo>({ type: null });
  const [ready, setReady] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // ── Init ────────────────────────────────────────────────
  useEffect(() => {
    if (!elRef.current) return;
    const fc = new fabric.Canvas(elRef.current, {
      width: CANVAS_PX.w,
      height: CANVAS_PX.h,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    fcRef.current = fc;
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

    const fireChange = () => {
      onChangeRef.current?.();
    };

    /** Returns true if the object's bounding rect has zero overlap with the
     *  canvas — i.e. the user dragged it completely off the card. */
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
      const right = left + w;
      const bottom = top + h;
      return (
        right < 0 ||
        left > CANVAS_PX.w ||
        bottom < 0 ||
        top > CANVAS_PX.h
      );
    };

    fc.on("selection:created", refresh);
    fc.on("selection:updated", refresh);
    fc.on("selection:cleared", () => setSelection({ type: null }));
    fc.on("object:modified", (e) => {
      // If the user dragged/scaled an object completely off the card,
      // treat that as "throw it away" and remove silently. Partial
      // overflow stays — the print validator will flag it as an error.
      const obj = e.target as fabric.Object | undefined;
      if (obj && isFullyOffCanvas(obj)) {
        fc.remove(obj);
        fc.discardActiveObject();
        fc.requestRenderAll();
        // object:removed will fire and emit the change for us.
        return;
      }
      fireChange();
    });
    fc.on("object:added", fireChange);
    fc.on("object:removed", fireChange);

    return () => {
      fc.dispose();
      fcRef.current = null;
      setReady(false);
    };
  }, []);

  // ── Mutators ────────────────────────────────────────────
  const addText = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const t = new fabric.Textbox("Your text", {
      left: 40,
      top: 40,
      fontFamily: "Inter",
      fontSize: 18,
      fill: "#17191a",
      width: 200,
    });
    fc.add(t);
    fc.setActiveObject(t);
    fc.requestRenderAll();
  }, []);

  const addImage = useCallback((dataUrl: string) => {
    const fc = fcRef.current;
    if (!fc) return;
    fabric.Image.fromURL(
      dataUrl,
      (img) => {
        const maxW = CANVAS_PX.w * 0.4;
        if (img.width && img.width > maxW) {
          img.scale(maxW / img.width);
        }
        img.set({ left: 30, top: 30 });
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
        if (typeof e.target?.result === "string") addImage(e.target.result);
      };
      reader.readAsDataURL(file);
    },
    [addImage]
  );

  const updateActive = useCallback(
    (props: Partial<fabric.Textbox & fabric.Object>) => {
      const fc = fcRef.current;
      if (!fc) return;
      const o = fc.getActiveObject();
      if (!o) return;
      o.set(props as Partial<fabric.Object>);
      fc.requestRenderAll();
      // refresh selection panel
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
    return fc.toJSON();
  }, []);

  const loadFromJSON = useCallback(
    (json: object | null | undefined, done?: () => void) => {
      const fc = fcRef.current;
      if (!fc) return;
      if (!json) {
        fc.clear();
        fc.backgroundColor = "#ffffff";
        fc.requestRenderAll();
        done?.();
        return;
      }
      fc.loadFromJSON(json, () => {
        fc.requestRenderAll();
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

  /**
   * Generate a small thumbnail for the design preview.
   * multiplier=0.4 + quality=0.6 keeps the JPEG under ~50 KB so the
   * Design.previewUrl column doesn't blow up the JSON payload.
   */
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

  /** Whether the currently-selected object is a Textbox in edit mode. */
  const isEditingText = useCallback((): boolean => {
    const fc = fcRef.current;
    if (!fc) return false;
    const o = fc.getActiveObject() as fabric.Textbox | undefined;
    return Boolean(o && (o as fabric.Textbox & { isEditing?: boolean }).isEditing);
  }, []);

  /** Snapshot every object on the canvas — used by print validation. */
  const getObjectSnapshots = useCallback((): ObjectSnapshot[] => {
    const fc = fcRef.current;
    if (!fc) return [];
    return fc.getObjects().map((o, index) => {
      const obj = o as fabric.Object & {
        getScaledWidth?: () => number;
        getScaledHeight?: () => number;
      };
      const effectiveWidth =
        typeof obj.getScaledWidth === "function" ? obj.getScaledWidth() : (o.width ?? 0) * (o.scaleX ?? 1);
      const effectiveHeight =
        typeof obj.getScaledHeight === "function" ? obj.getScaledHeight() : (o.height ?? 0) * (o.scaleY ?? 1);
      const snap: ObjectSnapshot = {
        index,
        type: o.type ?? "unknown",
        left: o.left ?? 0,
        top: o.top ?? 0,
        width: o.width ?? 0,
        height: o.height ?? 0,
        effectiveWidth,
        effectiveHeight,
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

  /** Programmatically select an object by index — used by validation jump-to. */
  const selectByIndex = useCallback((index: number) => {
    const fc = fcRef.current;
    if (!fc) return;
    const obj = fc.getObjects()[index];
    if (!obj) return;
    fc.setActiveObject(obj);
    fc.requestRenderAll();
  }, []);

  /** Programmatically remove an object by index — used by the
   *  "Remove field" action on validation issues. */
  const removeByIndex = useCallback((index: number) => {
    const fc = fcRef.current;
    if (!fc) return;
    const obj = fc.getObjects()[index];
    if (!obj) return;
    fc.remove(obj);
    fc.discardActiveObject();
    fc.requestRenderAll();
  }, []);

  return {
    elRef,
    ready,
    selection,
    addText,
    addImage,
    addImageFromFile,
    updateActive,
    deleteActive,
    toJSON,
    loadFromJSON,
    clear,
    toDataURL,
    isEditingText,
    getObjectSnapshots,
    selectByIndex,
    removeByIndex,
  };
}
