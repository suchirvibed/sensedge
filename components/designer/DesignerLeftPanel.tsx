"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";
import {
  IconTypography,
  IconPhoto,
  IconQrcode,
  IconLayoutBoard,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDeviceFloppy,
  IconTrash,
  IconChevronRight,
  IconUser,
  IconLetterT,
  IconQrcode as IconQR,
  IconSquare,
  IconBuilding,
  IconSchool,
  IconCircleDashed,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import {
  CARD_SIZES,
  type CardType,
  type Orientation,
  type PrinterKind,
  type CardSide,
} from "./types";
import type { ObjectSnapshot } from "./useFabricCanvas";

interface Props {
  /** Printer compatibility radio */
  printer: PrinterKind;
  onPrinterChange: (p: PrinterKind) => void;

  /** Print side radio (Single = front only, Double = both sides editable) */
  printSide: CardSide;
  onPrintSideChange: (s: CardSide) => void;

  /** Card-type radio */
  cardType: CardType;
  onCardTypeChange: (t: CardType) => void;
  onLoadCardTypeDefaults: () => void;

  /** Size dropdown */
  sizeId: string;
  onSizeChange: (id: string) => void;

  /** Orientation radio */
  orientation: Orientation;
  onOrientationChange: (o: Orientation) => void;

  /** Add field buttons */
  onAddText: () => void;
  onAddImageFile: (file: File) => void;
  onAddImageDataUrl: (dataUrl: string) => void;

  /** Save / Clear / Undo / Redo row */
  onSave: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";

  /** Field list */
  side: "FRONT" | "BACK";
  fields: ObjectSnapshot[];
  onSelectField: (index: number) => void;
  onRemoveField: (index: number) => void;
}

type Tab = "content" | "templates";

export function DesignerLeftPanel(props: Props) {
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
    props.onAddImageDataUrl(dataUrl);
    setQrInput("");
  }

  return (
    <aside className="flex w-72 flex-none flex-col border-r border-white/10 bg-bg-darker">
      {/* Tabs */}
      <div className="flex flex-none border-b border-white/10">
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

      <div className="flex-1 overflow-y-auto">
        {tab === "content" ? (
          <ContentTab
            {...props}
            qrInput={qrInput}
            setQrInput={setQrInput}
            makeQR={makeQR}
            fileRef={fileRef}
          />
        ) : (
          <TemplatesTab />
        )}
      </div>
    </aside>
  );
}

// ─── Content tab ─────────────────────────────────────────
function ContentTab({
  printer,
  onPrinterChange,
  printSide,
  onPrintSideChange,
  cardType,
  onCardTypeChange,
  onLoadCardTypeDefaults,
  sizeId,
  onSizeChange,
  orientation,
  onOrientationChange,
  onAddText,
  onAddImageFile,
  onSave,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  saveStatus,
  side,
  fields,
  onSelectField,
  onRemoveField,
  qrInput,
  setQrInput,
  makeQR,
  fileRef,
}: Props & {
  qrInput: string;
  setQrInput: (s: string) => void;
  makeQR: () => void;
  fileRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="space-y-5 p-5">
      {/* Printer Compatibility */}
      <Section title="Printer Compatibility">
        <RadioRow
          options={[
            { value: "THERMAL", label: "Thermal" },
            { value: "INKJET", label: "Inkjet" },
          ]}
          value={printer}
          onChange={(v) => onPrinterChange(v as PrinterKind)}
        />
      </Section>

      {/* Print Side */}
      <Section title="Print Side">
        <RadioRow
          options={[
            { value: "SINGLE", label: "Single Side" },
            { value: "DOUBLE", label: "Both Sides" },
          ]}
          value={printSide}
          onChange={(v) => onPrintSideChange(v as CardSide)}
        />
        {printSide === "DOUBLE" && (
          <p className="mt-2 text-[10px] leading-relaxed text-white/45">
            Use the FRONT / BACK pills above the card to switch sides.
          </p>
        )}
      </Section>

      {/* Card Type */}
      <Section title="Card Type">
        <RadioRow
          options={[
            { value: "COMPANY", label: "Company", icon: <IconBuilding size={14} /> },
            { value: "SCHOOL", label: "School", icon: <IconSchool size={14} /> },
            { value: "OTHERS", label: "Others", icon: <IconCircleDashed size={14} /> },
          ]}
          value={cardType}
          onChange={(v) => onCardTypeChange(v as CardType)}
        />
        <button
          type="button"
          onClick={onLoadCardTypeDefaults}
          disabled={cardType === "OTHERS"}
          className="mt-3 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-orange/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Load default fields
        </button>
      </Section>

      {/* ID Card Size */}
      <Section title="ID Card Size">
        <select
          value={sizeId}
          onChange={(e) => onSizeChange(e.target.value)}
          className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 text-xs text-white focus:border-orange focus:outline-none"
        >
          {CARD_SIZES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </Section>

      {/* Card Orientation */}
      <Section title="Card Orientation">
        <RadioRow
          options={[
            { value: "HORIZONTAL", label: "Horizontal" },
            { value: "VERTICAL", label: "Vertical" },
          ]}
          value={orientation}
          onChange={(v) => onOrientationChange(v as Orientation)}
        />
      </Section>

      {/* Add Fields */}
      <Section title="Add Fields">
        <div className="grid grid-cols-3 gap-2">
          <FieldButton icon={<IconTypography size={16} />} label="Text" onClick={onAddText} />
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
            if (f) onAddImageFile(f);
            e.currentTarget.value = "";
          }}
        />
        <input
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
          placeholder="QR text (optional)"
          className="mt-2 h-8 w-full rounded-md border border-white/10 bg-black/20 px-3 text-xs text-white placeholder:text-white/30 focus:border-orange focus:outline-none"
        />
      </Section>

      {/* Save / Clear / Undo / Redo */}
      <div className="grid grid-cols-4 gap-2">
        <SmallActionButton
          icon={<IconDeviceFloppy size={14} />}
          label="Save"
          onClick={onSave}
          tone={saveStatus === "saved" ? "green" : "default"}
          busy={saveStatus === "saving"}
        />
        <SmallActionButton
          icon={<IconTrash size={14} />}
          label="Clear"
          onClick={onClear}
          tone="red"
        />
        <SmallActionButton
          icon={<IconArrowBackUp size={14} />}
          label="Undo"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <SmallActionButton
          icon={<IconArrowForwardUp size={14} />}
          label="Redo"
          onClick={onRedo}
          disabled={!canRedo}
        />
      </div>

      {/* Field list */}
      <FieldList
        side={side}
        fields={fields}
        onSelect={onSelectField}
        onRemove={onRemoveField}
      />
    </div>
  );
}

// ─── Templates tab ───────────────────────────────────────
function TemplatesTab() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-5 text-center text-white/50">
      <IconLayoutBoard size={40} strokeWidth={1.2} className="text-white/30" />
      <div className="mt-4 text-sm font-semibold text-white/70">
        Templates coming soon
      </div>
      <p className="mt-1 text-xs">
        We&rsquo;re curating a library of professional templates. For now,
        design from scratch or load a card-type default.
      </p>
    </div>
  );
}

// ─── Small subcomponents ─────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/55">
        {title}
      </div>
      {children}
    </div>
  );
}

function RadioRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-[11px] font-semibold transition",
              active
                ? "border-orange bg-orange/15 text-white"
                : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
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
      <span className="text-white/55 transition group-hover:text-orange">{icon}</span>
      {label}
    </button>
  );
}

function SmallActionButton({
  icon,
  label,
  onClick,
  disabled,
  busy,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  tone?: "default" | "green" | "red";
}) {
  const toneClass = {
    default: "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:text-white",
    green:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
    red: "border-tint-redText/30 bg-tint-redText/10 text-tint-redText hover:bg-tint-redText/20",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-md border px-1 py-2 text-[10px] font-semibold transition",
        toneClass,
        disabled && "cursor-not-allowed opacity-30"
      )}
    >
      <span>{icon}</span>
      {busy ? "…" : label}
    </button>
  );
}

function FieldList({
  side,
  fields,
  onSelect,
  onRemove,
}: {
  side: "FRONT" | "BACK";
  fields: ObjectSnapshot[];
  onSelect: (i: number) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
          {side === "FRONT" ? "Front" : "Back"} fields ({fields.length})
        </div>
      </div>
      {fields.length === 0 ? (
        <div className="rounded border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-white/40">
          No fields yet. Add one above.
        </div>
      ) : (
        <ul className="space-y-1">
          {fields.map((f) => (
            <li key={f.index}>
              <div className="group flex items-center gap-2 rounded border border-white/5 bg-white/[0.02] px-2 py-1.5 transition hover:border-white/10 hover:bg-white/[0.05]">
                <button
                  type="button"
                  onClick={() => onSelect(f.index)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  <FieldIcon type={f.type} />
                  <span className="truncate text-xs text-white/85">{f.label}</span>
                  {f.text && (
                    <span className="truncate text-[10px] text-white/40">
                      · {f.text.slice(0, 18)}
                    </span>
                  )}
                  <IconChevronRight
                    size={12}
                    className="ml-auto text-white/30 opacity-0 transition group-hover:opacity-100"
                  />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${f.label}`}
                  onClick={() => onRemove(f.index)}
                  className="flex h-6 w-6 items-center justify-center rounded text-white/35 transition hover:bg-tint-redText/15 hover:text-tint-redText"
                >
                  <IconTrash size={11} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FieldIcon({ type }: { type: string }) {
  if (type === "image") return <IconUser size={12} className="text-white/55" />;
  if (type === "textbox" || type === "i-text" || type === "text")
    return <IconLetterT size={12} className="text-white/55" />;
  if (type === "rect") return <IconSquare size={12} className="text-white/55" />;
  return <IconQR size={12} className="text-white/55" />;
}
