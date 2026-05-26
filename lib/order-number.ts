import { prisma } from "@/lib/prisma";

/**
 * Generates an order number in the form PCO-000123.
 * Uses the total order count + 1 as the sequence — fine for low volume.
 * For production, swap to a Postgres sequence or atomic counter table.
 */
export async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  const n = (count + 1).toString().padStart(6, "0");
  return `PCO-${n}`;
}
