"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { resolvePromo, serviceFee } from "@/lib/pricing";
import { rupiah } from "@/lib/format";
import { checkoutSchema, fieldErrors, type ActionState, type CheckoutInput } from "@/lib/validations";

function orderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return "SR-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

class CheckoutError extends Error {}

export async function checkPromo(code: string, subtotal: number) {
  const res = await resolvePromo(code.trim(), Math.max(0, Math.floor(subtotal)));
  if ("error" in res) return { ok: false as const, message: res.error };
  return {
    ok: true as const,
    discount: res.discount,
    message: `Promo ${res.promo?.code} dipakai: hemat ${rupiah(res.discount)}`,
  };
}

export async function placeOrder(input: CheckoutInput): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Silakan masuk dulu untuk melanjutkan pembayaran." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const data = parsed.data;

  let code: string;
  try {
    code = await db.$transaction(async (tx) => {
      const event = await tx.event.findFirst({
        where: { id: data.eventId, status: "PUBLISHED" },
        include: { ticketTypes: true },
      });
      if (!event) throw new CheckoutError("Event tidak tersedia");
      if (event.startAt < new Date()) throw new CheckoutError("Event sudah berlangsung");

      let subtotal = 0;
      const items = data.items.map((item) => {
        const tt = event.ticketTypes.find((t) => t.id === item.ticketTypeId);
        if (!tt) throw new CheckoutError("Jenis tiket tidak valid");
        subtotal += tt.price * item.quantity;
        return { ticketTypeId: tt.id, quantity: item.quantity, unitPrice: tt.price, name: tt.name };
      });

      // Kurangi kuota secara atomik: gagal jika sisa kuota tidak cukup
      for (const item of items) {
        const updated = await tx.$executeRaw`
          UPDATE "TicketType" SET "sold" = "sold" + ${item.quantity}
          WHERE "id" = ${item.ticketTypeId} AND "sold" + ${item.quantity} <= "quota"`;
        if (updated === 0) throw new CheckoutError(`Tiket ${item.name} sudah habis / kuota tidak cukup`);
      }

      const promo = await resolvePromo(data.promoCode || undefined, subtotal, tx);
      if ("error" in promo) throw new CheckoutError(promo.error);

      const fee = serviceFee();
      const total = subtotal + fee - promo.discount;
      const order = await tx.order.create({
        data: {
          code: orderCode(),
          userId: session.userId,
          eventId: event.id,
          buyerName: data.buyerName,
          buyerEmail: data.buyerEmail,
          buyerPhone: data.buyerPhone,
          buyerCity: data.buyerCity,
          sendEmail: data.sendEmail,
          subtotal,
          serviceFee: fee,
          discount: promo.discount,
          total,
          paymentMethod: data.paymentMethod,
          promoCodeId: promo.promo?.id,
          // Simulasi pembayaran: langsung lunas. Ganti dengan payment gateway (Midtrans/Xendit) di production.
          status: "PAID",
          paidAt: new Date(),
          items: {
            create: items.map(({ ticketTypeId, quantity, unitPrice }) => ({ ticketTypeId, quantity, unitPrice })),
          },
        },
      });
      await tx.user.update({
        where: { id: session.userId },
        data: { points: { increment: Math.floor(total / 1000) } },
      });
      return order.code;
    }, { timeout: 15_000 });
  } catch (e) {
    if (e instanceof CheckoutError) return { message: e.message };
    console.error(e);
    return { message: "Terjadi kesalahan saat memproses pesanan. Coba lagi." };
  }

  revalidatePath("/akun/tiket");
  redirect(`/pesanan/${code}`);
}
