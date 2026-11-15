import "server-only";
import { db } from "./db";
import type { Prisma } from "@/generated/prisma/client";

export function serviceFee() {
  const fee = Number(process.env.SERVICE_FEE ?? 5000);
  return Number.isFinite(fee) && fee >= 0 ? fee : 5000;
}

/** Validasi kode promo, kembalikan nilai diskon untuk subtotal tertentu. */
export async function resolvePromo(
  code: string | undefined,
  subtotal: number,
  client: Prisma.TransactionClient = db,
) {
  if (!code) return { promo: null, discount: 0 };
  const promo = await client.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!promo || !promo.active) return { error: "Kode promo tidak ditemukan atau tidak aktif" };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { error: "Kode promo sudah kedaluwarsa" };

  let discount = promo.type === "PERCENT" ? Math.floor((subtotal * promo.value) / 100) : promo.value;
  if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { promo, discount };
}
