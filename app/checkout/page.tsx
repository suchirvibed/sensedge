import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculatePrice,
  type Material,
  type Finish,
  type ChipType,
  type PrintSide,
} from "@/lib/pricing";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { getOrCreateBlankInkjetDesign } from "@/lib/blank-inkjet";

interface SP {
  designId?: string;
  material?: string;
  finish?: string;
  chip?: string;
  side?: string;
  printer?: string;
  quantity?: string;
  /** "1" when arriving from the Inkjet bypass panel — no designId. */
  inkjet?: string;
}

function parseEnum<T extends string>(
  raw: string | undefined,
  values: readonly T[],
  fallback: T
): T {
  if (raw && (values as readonly string[]).includes(raw)) return raw as T;
  return fallback;
}

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: SP }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?from=/checkout");
  }
  const userId = session.user.id;

  // Detect Inkjet routes (either via flag or via printer param).
  const isInkjet =
    searchParams.inkjet === "1" || searchParams.printer === "INKJET";

  // ── Resolve the Design row ──
  // Thermal: must have a real designId in the URL.
  // Inkjet : auto-create/reuse a single "[BLANK INKJET]" design per user.
  let designRow: { id: string; name: string; previewUrl: string | null };

  if (isInkjet) {
    const stub = await getOrCreateBlankInkjetDesign(userId);
    designRow = { id: stub.id, name: "Blank Inkjet cards", previewUrl: null };
  } else {
    const designId = searchParams.designId;
    if (!designId) redirect("/dashboard/designs");
    const found = await prisma.design.findUnique({
      where: { id: designId },
      select: { id: true, userId: true, name: true, previewUrl: true },
    });
    if (!found || found.userId !== userId) redirect("/dashboard/designs");
    designRow = {
      id: found.id,
      name: found.name,
      previewUrl: found.previewUrl,
    };
  }

  // ── Specs ──
  // For Inkjet we force material/finish/chip/side neutral. The pricing
  // engine then returns a clean blank-PVC × qty figure that matches what
  // the user saw in the Inkjet bypass panel.
  const material: Material = isInkjet
    ? "PVC"
    : parseEnum<Material>(searchParams.material, ["PVC", "PAPER", "COMPOSITE"], "PVC");
  const finish: Finish = isInkjet
    ? "MATTE"
    : parseEnum<Finish>(searchParams.finish, ["MATTE", "GLOSSY", "METALLIC"], "MATTE");
  const chip: ChipType = isInkjet
    ? "NONE"
    : parseEnum<ChipType>(searchParams.chip, ["NONE", "RFID", "NFC", "LED"], "NONE");
  const side: PrintSide = isInkjet
    ? "SINGLE"
    : parseEnum<PrintSide>(searchParams.side, ["SINGLE", "DOUBLE"], "SINGLE");
  const printer = isInkjet
    ? "INKJET"
    : parseEnum(searchParams.printer, ["THERMAL", "INKJET"] as const, "THERMAL");

  let qty = parseInt(searchParams.quantity ?? "50", 10);
  if (!Number.isFinite(qty) || qty < 25) qty = 25;
  if (qty > 10000) qty = 10000;

  const price = calculatePrice({
    quantity: qty,
    material,
    finish,
    chipType: chip,
    printSide: side,
  });

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });

  return (
    <CheckoutFlow
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
      design={designRow}
      specs={{ material, finish, chip, side, printer, quantity: qty }}
      price={price}
      addresses={addresses.map((a) => ({
        id: a.id,
        name: a.name,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        phone: a.phone,
        isDefault: a.isDefault,
      }))}
    />
  );
}
