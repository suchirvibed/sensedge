import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculatePrice } from "@/lib/pricing";
import { nextOrderNumber } from "@/lib/order-number";
import { sendOrderEmail } from "@/lib/resend";
import type {
  Material,
  Finish,
  ChipType,
  PrintSide,
  PrinterType,
  Prisma,
} from "@prisma/client";

const MATERIALS = ["PVC", "PAPER", "COMPOSITE"] as const;
const FINISHES = ["MATTE", "GLOSSY", "METALLIC"] as const;
const CHIPS = ["NONE", "RFID", "NFC", "LED"] as const;
const SIDES = ["SINGLE", "DOUBLE"] as const;
const PRINTERS = ["THERMAL", "INKJET"] as const;
const PAYMENT_METHODS = ["RAZORPAY", "COD"] as const;

function pick<T extends string>(
  raw: unknown,
  values: readonly T[],
  fallback: T
): T {
  return typeof raw === "string" && (values as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback;
}

function nonEmptyString(v: unknown, maxLen = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t.length === 0) return null;
  return t.slice(0, maxLen);
}

// ─── GET /api/orders ─────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      quantity: true,
      material: true,
      totalPrice: true,
      status: true,
    },
  });
  return NextResponse.json({ orders });
}

// ─── POST /api/orders ────────────────────────────────────
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Design ──
  const designId = nonEmptyString(body.designId, 120);
  if (!designId) {
    return NextResponse.json({ error: "designId is required" }, { status: 400 });
  }
  const design = await prisma.design.findUnique({
    where: { id: designId },
    select: { id: true, userId: true },
  });
  if (!design || design.userId !== userId) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  // ── Specs (server pickles them so client can't lie) ──
  const material: Material = pick(body.material, MATERIALS, "PVC");
  const finish: Finish = pick(body.finish, FINISHES, "MATTE");
  const chipType: ChipType = pick(body.chipType, CHIPS, "NONE");
  const printSide: PrintSide = pick(body.printSide, SIDES, "SINGLE");
  const printerType: PrinterType = pick(body.printerType, PRINTERS, "THERMAL");

  let quantity = 0;
  if (typeof body.quantity === "number") quantity = body.quantity;
  else if (typeof body.quantity === "string") quantity = parseInt(body.quantity, 10);
  if (!Number.isFinite(quantity) || quantity < 25) {
    return NextResponse.json(
      { error: "Quantity must be at least 25" },
      { status: 400 }
    );
  }
  if (quantity > 10_000) quantity = 10_000;
  quantity = Math.floor(quantity);

  const paymentMethod = pick(body.paymentMethod, PAYMENT_METHODS, "RAZORPAY");

  // ── Address — either pick existing, or create new ──
  let resolvedAddressId: string | null = nonEmptyString(body.addressId, 120);
  const newAddress = (body.newAddress ?? null) as Record<string, unknown> | null;

  if (resolvedAddressId) {
    const owned = await prisma.address.findUnique({
      where: { id: resolvedAddressId },
      select: { id: true, userId: true },
    });
    if (!owned || owned.userId !== userId) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
  } else if (newAddress) {
    const a = {
      name: nonEmptyString(newAddress.name, 100),
      line1: nonEmptyString(newAddress.line1, 200),
      line2: nonEmptyString(newAddress.line2, 200),
      city: nonEmptyString(newAddress.city, 80),
      state: nonEmptyString(newAddress.state, 80),
      pincode: nonEmptyString(newAddress.pincode, 12),
      phone: nonEmptyString(newAddress.phone, 20),
      saveForLater: Boolean(newAddress.saveForLater),
    };
    const missing = (["name", "line1", "city", "state", "pincode", "phone"] as const).find(
      (k) => !a[k]
    );
    if (missing) {
      return NextResponse.json(
        { error: `Address ${missing} is required` },
        { status: 400 }
      );
    }
    // Address row is always created so the Order can FK to it. If user
    // chose NOT to save, we still create the row but it stays one-shot.
    // (Better than denormalising address fields onto Order.)
    const created = await prisma.address.create({
      data: {
        userId,
        name: a.name!,
        line1: a.line1!,
        line2: a.line2,
        city: a.city!,
        state: a.state!,
        pincode: a.pincode!,
        phone: a.phone!,
        isDefault: false,
      },
      select: { id: true },
    });
    resolvedAddressId = created.id;
  } else {
    return NextResponse.json(
      { error: "Address is required (addressId or newAddress)" },
      { status: 400 }
    );
  }

  // ── Server-side price (NEVER trust client) ──
  const price = calculatePrice({
    quantity,
    material,
    finish,
    chipType,
    printSide,
  });

  // ── Atomic create: order + payment + status log ──
  const orderNumber = await nextOrderNumber();

  try {
    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber,
          userId,
          designId,
          addressId: resolvedAddressId!,
          quantity,
          material,
          finish,
          chipType,
          printSide,
          printerType,
          basePrice: price.pricePerCard,
          addonsPrice: 0, // already folded into pricePerCard by calculatePrice
          subtotal: price.subtotal,
          shippingPrice: price.shipping,
          totalPrice: price.total,
          status: "CONFIRMED",
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
        },
        select: { id: true, orderNumber: true },
      });

      await tx.payment.create({
        data: {
          orderId: o.id,
          amount: price.total,
          currency: "INR",
          method: paymentMethod,
          status: "PENDING",
        },
      });

      await tx.orderStatusLog.create({
        data: {
          orderId: o.id,
          status: "CONFIRMED",
          changedBy: userId,
          notes: "Order placed",
        },
      });

      // Promote design status from DRAFT → SUBMITTED so the graphics
      // queue (eventually) can pick it up.
      await tx.design.update({
        where: { id: designId },
        data: { status: "SUBMITTED" },
      });

      return o;
    });

    // Fire confirmation email (non-blocking — order creation already
    // succeeded, the email failing should never roll that back).
    try {
      await sendOrderEmail({
        to: session.user.email ?? "",
        orderNumber: order.orderNumber,
        status: "CONFIRMED",
        customerName: session.user.name ?? "Customer",
      });
    } catch (mailErr) {
      console.warn("Order confirmation email failed (non-fatal):", mailErr);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "Order could not be created (database error).";
    // Unique constraint on orderNumber is the most likely culprit; retry once.
    if (
      err instanceof Error &&
      "code" in err &&
      (err as unknown as Prisma.PrismaClientKnownRequestError).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Order number collision, please retry." },
        { status: 503 }
      );
    }
    console.error("[/api/orders]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
