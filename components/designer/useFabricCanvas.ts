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

    fc.on("selection:created", refresh);
    fc.on("selection:updated", refresh);
    fc.on("selection:cleared", () => setSelection({ type: null }));
    fc.on("object:modified", fireChange);
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

  const loadFromJSON = useCallback((json: object) => {
    const fc = fcRef.current;
    if (!fc) return;
    fc.loadFromJSON(json, () => {
      fc.requestRenderAll();
    });
  }, []);

  const clear = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    fc.clear();
    fc.backgroundColor = "#ffffff";
    fc.requestRenderAll();
  }, []);

  const toDataURL = useCallback((): string | null => {
    const fc = fcRef.current;
    if (!fc) return null;
    return fc.toDataURL({ format: "jpeg", quality: 0.85 });
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
  };
}
