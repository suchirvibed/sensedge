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

interface SP {
  designId?: string;
  material?: string;
  finish?: string;
  chip?: string;
  side?: string;
  printer?: string;
  quantity?: string;
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

  const designId = searchParams.designId;
  if (!designId) {
    redirect("/dashboard/designs");
  }

  const design = await prisma.design.findUnique({
    where: { id: designId },
    select: {
      id: true,
      userId: true,
      name: true,
      previewUrl: true,
    },
  });
  if (!design || design.userId !== session.user.id) {
    redirect("/dashboard/designs");
  }

  // Pull specs from query params with safe fallbacks.
  const material = parseEnum<Material>(searchParams.material, ["PVC", "PAPER", "COMPOSITE"], "PVC");
  const finish = parseEnum<Finish>(searchParams.finish, ["MATTE", "GLOSSY", "METALLIC"], "MATTE");
  const chip = parseEnum<ChipType>(searchParams.chip, ["NONE", "RFID", "NFC", "LED"], "NONE");
  const side = parseEnum<PrintSide>(searchParams.side, ["SINGLE", "DOUBLE"], "SINGLE");
  const printer = parseEnum(searchParams.printer, ["THERMAL", "INKJET"] as const, "THERMAL");

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
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });

  return (
    <CheckoutFlow
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
      design={{ id: design.id, name: design.name, previewUrl: design.previewUrl }}
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
