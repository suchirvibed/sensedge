"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";
import {
  IconTypography,
  IconPhoto,
  IconQrcode,
  IconTrash,
  IconLayoutBoard,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

interface Props {
  hasSelection: boolean;
  onAddText: () => void;
  onAddImageFile: (file: File) => void;
  onAddImageDataUrl: (dataUrl: string) => void;
  onDeleteActive: () => void;
}

type Tab = "content" | "templates";

export function DesignerLeftPanel({
  hasSelection,
  onAddText,
  onAddImageFile,
  onAddImageDataUrl,
  onDeleteActive,
}: Props) {
  const [tab, setTab] = useState<Tab>("content");
  const fileRef = useRef<HTMLInputElement>(null);
  const [qrInput, setQrInput] = useState("");

  async function makeQR() {
    const text = qrInput.trim() || "https://printcard.co.in";
    const dataUrl = await QRCode.toDataURL(text, {
      margin: 0,
      width: 220,
      color: { dark: "#17191a", light: "#ffffff" },
    });
    onAddImageDataUrl(dataUrl);
    setQrInput("");
  }

  return (
    <aside className="flex w-72 flex-none flex-col border-r border-white/10 bg-bg-darker">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(["content", "templates"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-widest transition",
              tab === t
                ? "border-b-2 border-orange text-white"
                : "text-white/50 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {tab === "content" && (
          <>
            <div className="mb-3 text-xs uppercase tracking-widest text-white/40">
              Add fields
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldButton icon={<IconTypography size={18} />} label="Text" onClick={onAddText} />
              <FieldButton
                icon={<IconPhoto size={18} />}
                label="Image"
                onClick={() => fileRef.current?.click()}
              />
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onAddImageFile(f);
                e.currentTarget.value = "";
              }}
            />

            <div className="mt-6 mb-3 text-xs uppercase tracking-widest text-white/40">
              QR code
            </div>
            <div className="space-y-2">
              <input
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="URL or text"
                className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 text-xs text-white placeholder:text-white/30 focus:border-orange focus:outline-none"
              />
              <button
                onClick={makeQR}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <IconQrcode size={14} /> Generate QR
              </button>
            </div>

            {hasSelection && (
              <>
                <div className="mt-8 border-t border-white/10 pt-5">
                  <button
                    onClick={onDeleteActive}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-tint-redText/10 px-3 py-2 text-xs font-semibold text-tint-redText transition hover:bg-tint-redText/20"
                  >
                    <IconTrash size={14} /> Delete selected
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {tab === "templates" && (
          <div className="flex h-full flex-col items-center justify-center text-center text-white/50">
            <IconLayoutBoard size={40} strokeWidth={1.2} className="text-white/30" />
            <div className="mt-4 text-sm font-semibold text-white/70">Templates coming soon</div>
            <p className="mt-1 text-xs">
              We&rsquo;re curating a library of professional templates. For now, design from scratch.
            </p>
          </div>
        )}
      </div>
    </aside>
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
      className="group flex flex-col items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-4 text-xs font-medium text-white/80 transition hover:border-orange/50 hover:bg-orange/10 hover:text-white"
    >
      <span className="text-white/60 transition group-hover:text-orange">{icon}</span>
      {label}
    </button>
  );
}
