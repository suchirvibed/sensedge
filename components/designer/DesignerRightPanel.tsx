"use client";

import type { CardSpecs } from "./types";
import type { SelectionInfo } from "./useFabricCanvas";
import { calculatePrice, formatINR } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Props {
  selection: SelectionInfo;
  specs: CardSpecs;
  onSpecsChange: (next: CardSpecs) => void;
  onUpdateActive: (props: Record<string, unknown>) => void;
  onPlaceOrder: () => void;
}

const FONTS = ["Inter", "Plus Jakarta Sans", "Arial", "Georgia", "Courier New"];
const COLORS = ["#17191a", "#ffffff", "#E85D04", "#1a6bc4", "#2d7a1a", "#c0003c"];
const ALIGN = ["left", "center", "right"] as const;

export function DesignerRightPanel({
  selection,
  specs,
  onSpecsChange,
  onUpdateActive,
  onPlaceOrder,
}: Props) {
  const price = calculatePrice({
    quantity: specs.quantity,
    material: specs.material,
    finish: specs.finish,
    chipType: specs.chip,
    printSide: specs.side,
  });

  function update<K extends keyof CardSpecs>(key: K, value: CardSpecs[K]) {
    onSpecsChange({ ...specs, [key]: value });
  }

  return (
    <aside className="flex w-80 flex-none flex-col border-l border-white/10 bg-bg-darker">
      <div className="flex-1 overflow-y-auto">
        {/* Field properties */}
        <div className="border-b border-white/10 p-5">
          <div className="mb-3 text-xs uppercase tracking-widest text-white/40">
            {selection.type ? "Field properties" : "Select a field"}
          </div>

          {!selection.type && (
            <p className="text-xs text-white/40">
              Click any element on the card to edit its properties.
            </p>
          )}

          {selection.type === "text" && (
            <div className="space-y-4 text-xs text-white/80">
              <div>
                <div className="mb-1.5 text-white/50">Font</div>
                <select
                  value={selection.fontFamily}
                  onChange={(e) => onUpdateActive({ fontFamily: e.target.value })}
                  className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-2 text-white focus:border-orange focus:outline-none"
                >
                  {FONTS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="mb-1.5 text-white/50">Size</div>
                  <input
                    type="number"
                    min={6}
                    max={120}
                    value={selection.fontSize ?? 16}
                    onChange={(e) => onUpdateActive({ fontSize: Number(e.target.value) })}
                    className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-2 text-white focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <div className="mb-1.5 text-white/50">Weight</div>
                  <select
                    value={String(selection.fontWeight ?? "normal")}
                    onChange={(e) => onUpdateActive({ fontWeight: e.target.value })}
                    className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-2 text-white focus:border-orange focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="600">Semibold</option>
                    <option value="bold">Bold</option>
                    <option value="800">Heavy</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-white/50">Alignment</div>
                <div className="flex gap-1">
                  {ALIGN.map((a) => (
                    <button
                      key={a}
                      onClick={() => onUpdateActive({ textAlign: a })}
                      className={cn(
                        "flex-1 rounded-md border border-white/10 py-1.5 text-xs capitalize",
                        selection.textAlign === a
                          ? "border-orange bg-orange/20 text-white"
                          : "bg-black/20 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-white/50">Colour</div>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateActive({ fill: c })}
                      style={{ background: c }}
                      className={cn(
                        "h-6 w-6 rounded-md border transition",
                        selection.fill === c
                          ? "border-orange ring-2 ring-orange/40"
                          : "border-white/20 hover:border-white/40"
                      )}
                      aria-label={c}
                    />
                  ))}
                  <input
                    type="color"
                    value={selection.fill ?? "#000000"}
                    onChange={(e) => onUpdateActive({ fill: e.target.value })}
                    className="h-6 w-6 cursor-pointer rounded-md border border-white/20 bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {selection.type === "image" && (
            <p className="text-xs text-white/60">
              Drag the corners to resize, drag the centre to move. Use Delete to remove.
            </p>
          )}
        </div>

        {/* Card options */}
        <div className="space-y-4 border-b border-white/10 p-5">
          <div className="mb-1 text-xs uppercase tracking-widest text-white/40">
            Card options
          </div>

          <Select
            label="Material"
            value={specs.material}
            onChange={(v) => update("material", v as CardSpecs["material"])}
            options={[
              { value: "PVC", label: "PVC" },
              { value: "PAPER", label: "Paper" },
              { value: "COMPOSITE", label: "Composite" },
            ]}
          />
          <Select
            label="Finish"
            value={specs.finish}
            onChange={(v) => update("finish", v as CardSpecs["finish"])}
            options={[
              { value: "MATTE", label: "Matte" },
              { value: "GLOSSY", label: "Glossy (+₹0.30)" },
              { value: "METALLIC", label: "Metallic (+₹0.80)" },
            ]}
          />
          <Select
            label="Chip"
            value={specs.chip}
            onChange={(v) => update("chip", v as CardSpecs["chip"])}
            options={[
              { value: "NONE", label: "None" },
              { value: "RFID", label: "RFID (+₹1.40)" },
              { value: "NFC", label: "NFC (+₹1.00)" },
              { value: "LED", label: "LED (+₹2.00)" },
            ]}
          />
          <Select
            label="Print side"
            value={specs.side}
            onChange={(v) => update("side", v as CardSpecs["side"])}
            options={[
              { value: "SINGLE", label: "Single" },
              { value: "DOUBLE", label: "Double (+₹0.50)" },
            ]}
          />
          <div>
            <div className="mb-1.5 text-xs text-white/50">Quantity (min 25)</div>
            <input
              type="number"
              min={25}
              step={25}
              value={specs.quantity}
              onChange={(e) =>
                update("quantity", Math.max(25, Number(e.target.value) || 25))
              }
              className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-2 text-white focus:border-orange focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Live pricing */}
      <div className="space-y-2 border-t border-white/10 bg-black/20 p-5">
        <Row label="Per card" value={formatINR(price.pricePerCard)} />
        <Row label={`Subtotal (${specs.quantity} cards)`} value={formatINR(price.subtotalBeforeDiscount)} />
        {price.discountRate > 0 && (
          <Row
            label={`Bulk discount (${Math.round(price.discountRate * 100)}%)`}
            value={`− ${formatINR(price.discountAmount)}`}
            tone="orange"
          />
        )}
        <Row
          label="Shipping"
          value={price.shipping === 0 ? "Free" : formatINR(price.shipping)}
        />
        <div className="mt-2 border-t border-white/10 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-widest text-white/50">Total</span>
            <span className="font-display text-2xl font-extrabold text-white">
              {formatINR(price.total)}
            </span>
          </div>
        </div>
        <Button
          onClick={onPlaceOrder}
          variant="primary"
          size="lg"
          showArrow
          className="mt-4 w-full justify-center"
        >
          Place order
        </Button>
      </div>
    </aside>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs text-white/50">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-2 text-xs text-white focus:border-orange focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Row({
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
      <span className="text-white/50">{label}</span>
      <span className={cn("font-mono", tone === "orange" ? "text-orange" : "text-white/90")}>
        {value}
      </span>
    </div>
  );
}
