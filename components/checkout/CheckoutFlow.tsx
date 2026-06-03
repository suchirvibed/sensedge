"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconCircleCheck,
  IconLock,
  IconCash,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatINR, type PriceBreakdown } from "@/lib/pricing";

// ─── Razorpay JS types ───────────────────────────────────
interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler?: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
}
type RazorpayConstructor = new (opts: RazorpayOptions) => RazorpayInstance;

let razorpayScriptPromise: Promise<void> | null = null;
function ensureRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Failed to load Razorpay script"));
    };
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

interface AddressLite {
  id: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface Props {
  user: { name: string; email: string };
  design: { id: string; name: string; previewUrl: string | null };
  specs: {
    material: "PVC" | "PAPER" | "COMPOSITE";
    finish: "MATTE" | "GLOSSY" | "METALLIC";
    chip: "NONE" | "RFID" | "NFC" | "LED";
    side: "SINGLE" | "DOUBLE";
    printer: "THERMAL" | "INKJET";
    quantity: number;
  };
  price: PriceBreakdown;
  addresses: AddressLite[];
}

type Step = 1 | 2 | 3;

interface AddressForm {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  saveForLater: boolean;
}

const EMPTY_ADDRESS: AddressForm = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  saveForLater: true,
};

type PaymentMethod = "RAZORPAY" | "COD";

export function CheckoutFlow({ user, design, specs, price, addresses }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Address state — either selectedAddressId (from saved list) or addressForm
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null
  );
  const [addingNewAddress, setAddingNewAddress] = useState(addresses.length === 0);
  const [form, setForm] = useState<AddressForm>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateForm<K extends keyof AddressForm>(key: K, value: AddressForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addressValid(): boolean {
    if (selectedAddressId && !addingNewAddress) return true;
    const required: (keyof AddressForm)[] = [
      "name",
      "line1",
      "city",
      "state",
      "pincode",
      "phone",
    ];
    return required.every((k) => String(form[k]).trim().length > 0);
  }

  async function placeOrder() {
    setError(null);
    setBusy(true);
    try {
      // ── 1. Create the order ──
      const payload: Record<string, unknown> = {
        designId: design.id,
        material: specs.material,
        finish: specs.finish,
        chipType: specs.chip,
        printSide: specs.side,
        printerType: specs.printer,
        quantity: specs.quantity,
        paymentMethod,
      };
      if (selectedAddressId && !addingNewAddress) {
        payload.addressId = selectedAddressId;
      } else {
        payload.newAddress = {
          name: form.name.trim(),
          line1: form.line1.trim(),
          line2: form.line2.trim() || null,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          phone: form.phone.trim(),
          saveForLater: form.saveForLater,
        };
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order could not be placed");
      }
      const orderId = data.order.id as string;

      // ── 2. COD path ── done; redirect.
      if (paymentMethod === "COD") {
        router.push(`/dashboard/orders/${orderId}?placed=1`);
        return;
      }

      // ── 3. Razorpay path ── ask the server for a Razorpay order
      const payCreate = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payData = await payCreate.json();
      if (!payCreate.ok) {
        throw new Error(payData.error || "Could not start payment");
      }

      // Stub mode (no Razorpay keys): auto-succeed via verify with no-op
      // signature so dev environments work end-to-end without keys.
      if (payData.stub) {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            razorpay_order_id: payData.razorpay_order_id,
            razorpay_payment_id: `stub_pay_${Date.now()}`,
            razorpay_signature: "stub_signature_accept_in_dev",
          }),
        });
        const v = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(v.error || "Stub payment verification failed");
        }
        router.push(`/dashboard/orders/${orderId}?placed=1`);
        return;
      }

      // Real Razorpay — load the JS and open the modal
      await ensureRazorpayScript();
      const RazorpayCtor = (window as unknown as { Razorpay?: RazorpayConstructor })
        .Razorpay;
      if (!RazorpayCtor) {
        throw new Error("Razorpay script failed to load");
      }
      const rzp = new RazorpayCtor({
        key: payData.key_id,
        amount: payData.amount,
        currency: payData.currency,
        name: "PrintCard",
        description: `Order ${data.order.orderNumber}`,
        order_id: payData.razorpay_order_id,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#E85D04" },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const v = await verifyRes.json();
            if (!verifyRes.ok) {
              setError(v.error || "Payment verification failed");
              setBusy(false);
              return;
            }
            router.push(`/dashboard/orders/${orderId}?placed=1`);
          } catch (verr) {
            setError((verr as Error).message);
            setBusy(false);
          }
        },
        modal: {
          ondismiss: async () => {
            // User closed the modal without paying. Cancel the order so
            // it doesn't sit forever in CONFIRMED/PENDING.
            try {
              await fetch("/api/payments/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
              });
            } catch {
              /* ignore */
            }
            setError(
              "Payment was cancelled. The order has been cancelled — you can place a new one when ready."
            );
            setBusy(false);
          },
        },
      });
      rzp.open();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_360px]">
      {/* ─── Main column ───────────────────────────── */}
      <div>
        <Stepper step={step} />

        <div className="mt-8 rounded-card border border-border bg-white p-8">
          {step === 1 && (
            <StepReview
              design={design}
              specs={specs}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepAddress
              user={user}
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              addingNewAddress={addingNewAddress}
              setAddingNewAddress={setAddingNewAddress}
              form={form}
              updateForm={updateForm}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              canContinue={addressValid()}
            />
          )}
          {step === 3 && (
            <StepPayment
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onBack={() => setStep(2)}
              onPlace={placeOrder}
              busy={busy}
              error={error}
              priceTotal={price.total}
            />
          )}
        </div>
      </div>

      {/* ─── Sticky order summary ──────────────────── */}
      <OrderSummary design={design} specs={specs} price={price} />
    </div>
  );
}

// ─── Stepper ──────────────────────────────────────────────
function Stepper({ step }: { step: Step }) {
  const STEPS = [
    { n: 1, label: "Review" },
    { n: 2, label: "Address" },
    { n: 3, label: "Payment" },
  ];
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition",
                  done && "bg-orange text-white",
                  active && "bg-text-primary text-white",
                  !done && !active && "bg-bg-subtle text-text-muted"
                )}
              >
                {done ? <IconCircleCheck size={16} /> : s.n}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold transition",
                  active ? "text-text-primary" : "text-text-muted"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px w-10 transition",
                  done ? "bg-orange" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 — review ──────────────────────────────────────
function StepReview({
  design,
  specs,
  onNext,
}: {
  design: Props["design"];
  specs: Props["specs"];
  onNext: () => void;
}) {
  const isInkjet = specs.printer === "INKJET";

  return (
    <>
      <h2 className="font-display text-xl font-bold tracking-tight text-text-primary">
        {isInkjet ? "Review your order" : "Review your design"}
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        {isInkjet
          ? "Blank Inkjet cards ship as plain PVC stock — no design printed. Confirm the quantity below and continue to delivery."
          : "Make sure everything looks right before continuing to delivery details."}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1.3fr]">
        {/* Preview / Inkjet card mockup */}
        <div className="overflow-hidden rounded-card border border-border bg-bg-page">
          {isInkjet ? (
            <div className="flex aspect-[1.6/1] w-full flex-col items-center justify-center bg-white p-6 text-center">
              <Badge tone="orange" className="mb-3 uppercase">
                Inkjet
              </Badge>
              <div className="font-display text-base font-bold text-text-primary">
                Blank PVC card
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-text-muted">
                Standard 87 × 57 mm
              </div>
            </div>
          ) : design.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={design.previewUrl}
              alt={design.name}
              className="aspect-[1.6/1] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[1.6/1] w-full items-center justify-center text-xs uppercase tracking-widest text-text-muted">
              No preview
            </div>
          )}
        </div>

        {/* Info column */}
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted">
            {isInkjet ? "Product" : "Design"}
          </div>
          <div className="mt-1 font-semibold text-text-primary">
            {isInkjet ? "Blank Inkjet cards" : design.name}
          </div>
          {!isInkjet && (
            <Link
              href={`/designer/${design.id}`}
              className="mt-2 inline-block text-sm font-semibold text-orange hover:underline"
            >
              Edit design →
            </Link>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {!isInkjet && (
              <>
                <Spec label="Material" value={specs.material} />
                <Spec label="Finish" value={specs.finish} />
                <Spec label="Chip" value={specs.chip} />
                <Spec label="Side" value={specs.side} />
              </>
            )}
            <Spec label="Printer" value={specs.printer} />
            <Spec label="Quantity" value={`${specs.quantity} cards`} />
          </dl>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="primary" size="lg" showArrow onClick={onNext}>
          Continue to address
        </Button>
      </div>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-text-primary">{value}</dd>
    </div>
  );
}

// ─── Step 2 — address ─────────────────────────────────────
function StepAddress({
  user,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  addingNewAddress,
  setAddingNewAddress,
  form,
  updateForm,
  onBack,
  onNext,
  canContinue,
}: {
  user: { name: string; email: string };
  addresses: AddressLite[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  addingNewAddress: boolean;
  setAddingNewAddress: (b: boolean) => void;
  form: AddressForm;
  updateForm: <K extends keyof AddressForm>(k: K, v: AddressForm[K]) => void;
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  return (
    <>
      <h2 className="font-display text-xl font-bold tracking-tight text-text-primary">
        Delivery address
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        We&apos;ll ship the cards to this address. Order confirmation will be emailed
        to <span className="font-semibold text-text-primary">{user.email}</span>.
      </p>

      {addresses.length > 0 && (
        <div className="mt-6 space-y-3">
          {addresses.map((a) => {
            const selected = selectedAddressId === a.id && !addingNewAddress;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedAddressId(a.id);
                  setAddingNewAddress(false);
                }}
                className={cn(
                  "block w-full rounded-card border bg-white p-4 text-left transition",
                  selected
                    ? "border-orange ring-1 ring-orange/30"
                    : "border-border hover:border-text-primary/20"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-text-primary">
                      {a.name}{" "}
                      {a.isDefault && (
                        <Badge tone="orange" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-text-muted">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                    </div>
                    <div className="mt-0.5 text-xs text-text-muted">{a.phone}</div>
                  </div>
                  {selected && <IconCircleCheck className="text-orange" size={20} />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setAddingNewAddress(!addingNewAddress);
          if (!addingNewAddress) setSelectedAddressId(null);
        }}
        className="mt-4 text-sm font-semibold text-orange hover:underline"
      >
        {addingNewAddress
          ? "Use one of my saved addresses"
          : addresses.length > 0
          ? "+ Add a new address"
          : ""}
      </button>

      {addingNewAddress && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            name="name"
            label="Full name"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
          />
          <Input
            name="line1"
            label="Address line 1"
            value={form.line1}
            onChange={(e) => updateForm("line1", e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            name="line2"
            label="Address line 2 (optional)"
            value={form.line2}
            onChange={(e) => updateForm("line2", e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            name="city"
            label="City"
            value={form.city}
            onChange={(e) => updateForm("city", e.target.value)}
          />
          <Input
            name="state"
            label="State"
            value={form.state}
            onChange={(e) => updateForm("state", e.target.value)}
          />
          <Input
            name="pincode"
            label="Pincode"
            value={form.pincode}
            onChange={(e) => updateForm("pincode", e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm text-text-body sm:col-span-2">
            <input
              type="checkbox"
              checked={form.saveForLater}
              onChange={(e) => updateForm("saveForLater", e.target.checked)}
              className="h-4 w-4 rounded border-border text-orange focus:ring-orange"
            />
            Save this address to my account
          </label>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack}>
          <IconArrowLeft size={16} /> Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          showArrow
          onClick={onNext}
          disabled={!canContinue}
        >
          Continue to payment
        </Button>
      </div>
    </>
  );
}

// ─── Step 3 — payment ─────────────────────────────────────
function StepPayment({
  paymentMethod,
  setPaymentMethod,
  onBack,
  onPlace,
  busy,
  error,
  priceTotal,
}: {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  onBack: () => void;
  onPlace: () => void;
  busy: boolean;
  error: string | null;
  priceTotal: number;
}) {
  return (
    <>
      <h2 className="font-display text-xl font-bold tracking-tight text-text-primary">
        Payment
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        Choose how you&apos;d like to pay. All Razorpay options (UPI, card,
        netbanking) are supported.
      </p>

      <div className="mt-6 space-y-3">
        <PaymentOption
          method="RAZORPAY"
          icon={<IconLock size={20} />}
          title="UPI / Card / Netbanking"
          body="Pay securely via Razorpay. Recommended."
          selected={paymentMethod === "RAZORPAY"}
          onSelect={() => setPaymentMethod("RAZORPAY")}
        />
        <PaymentOption
          method="COD"
          icon={<IconCash size={20} />}
          title="Cash on delivery"
          body="Pay when your order arrives."
          selected={paymentMethod === "COD"}
          onSelect={() => setPaymentMethod("COD")}
        />
      </div>

      {error && (
        <p className="mt-5 rounded-input bg-tint-red px-3 py-2 text-sm text-tint-redText">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
        <Button variant="ghost" size="lg" onClick={onBack} disabled={busy}>
          <IconArrowLeft size={16} /> Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          showArrow
          onClick={onPlace}
          disabled={busy}
        >
          {busy ? "Placing order…" : `Place order · ${formatINR(priceTotal)}`}
        </Button>
      </div>

      <p className="mt-5 text-xs text-text-muted">
        Razorpay sandbox is enabled for development — no real money moves until
        live keys are added.
      </p>
    </>
  );
}

function PaymentOption({
  icon,
  title,
  body,
  selected,
  onSelect,
}: {
  method: PaymentMethod;
  icon: React.ReactNode;
  title: string;
  body: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-4 rounded-card border bg-white p-4 text-left transition",
        selected
          ? "border-orange ring-1 ring-orange/30"
          : "border-border hover:border-text-primary/20"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 flex-none items-center justify-center rounded-card",
          selected ? "bg-orange-tint text-orange" : "bg-bg-subtle text-text-muted"
        )}
      >
        {icon}
      </span>
      <div className="flex-1">
        <div className="font-semibold text-text-primary">{title}</div>
        <div className="mt-0.5 text-sm text-text-muted">{body}</div>
      </div>
      {selected && <IconCircleCheck className="mt-1 text-orange" size={20} />}
    </button>
  );
}

// ─── Order summary ────────────────────────────────────────
function OrderSummary({
  design,
  specs,
  price,
}: {
  design: Props["design"];
  specs: Props["specs"];
  price: PriceBreakdown;
}) {
  return (
    <aside className="rounded-card border border-border bg-white p-6 lg:sticky lg:top-24">
      <div className="text-xs uppercase tracking-widest text-text-muted">
        Order summary
      </div>

      <div className="mt-4 flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-12 w-16 flex-none items-center justify-center overflow-hidden rounded-md bg-bg-page">
          {design.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={design.previewUrl}
              alt={design.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[9px] uppercase tracking-widest text-text-muted">
              No preview
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-text-primary">
            {design.name}
          </div>
          <div className="text-xs text-text-muted">
            {specs.quantity} × {specs.material}
          </div>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Per card" value={formatINR(price.pricePerCard)} />
        <Row
          label={`Subtotal (${specs.quantity} cards)`}
          value={formatINR(price.subtotalBeforeDiscount)}
        />
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
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-xs uppercase tracking-widest text-text-muted">Total</span>
        <span className="font-display text-2xl font-bold tracking-tight text-text-primary">
          {formatINR(price.total)}
        </span>
      </div>
    </aside>
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
    <div className="flex items-baseline justify-between">
      <span className="text-text-muted">{label}</span>
      <span className={cn("font-mono", tone === "orange" ? "text-orange" : "text-text-primary")}>
        {value}
      </span>
    </div>
  );
}
