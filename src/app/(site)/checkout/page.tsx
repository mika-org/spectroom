import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { Stepper } from "@/components/ui";
import { CheckoutForm } from "@/components/checkout-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceFee } from "@/lib/pricing";
import { shortDate, timeRange } from "@/lib/format";
import { themeStyle } from "@/lib/themes";
import { MAX_TICKETS_PER_ORDER } from "@/lib/validations";

export const metadata: Metadata = { title: "Pembayaran" };

const querySchema = z.object({
  event: z.string().min(1),
  item: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .pipe(
      z.array(
        z
          .string()
          .regex(/^[^:]+:\d+$/)
          .transform((s) => {
            const [id, q] = s.split(":");
            return { ticketTypeId: id!, quantity: Number(q) };
          }),
      ),
    ),
});

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const raw = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) (Array.isArray(v) ? v : v ? [v] : []).forEach((x) => qs.append(k, x));
  const user = await requireUser(`/checkout?${qs}`);

  const parsed = querySchema.safeParse(raw);
  const event = parsed.success
    ? await db.event.findFirst({
        where: { slug: parsed.data.event, status: "PUBLISHED", startAt: { gte: new Date() } },
        include: { ticketTypes: true },
      })
    : null;

  const items =
    parsed.success && event
      ? parsed.data.item
          .map((i) => {
            const tt = event.ticketTypes.find((t) => t.id === i.ticketTypeId);
            return tt && i.quantity > 0 ? { ticketTypeId: tt.id, name: tt.name, price: tt.price, quantity: i.quantity } : null;
          })
          .filter((x) => x !== null)
      : [];
  const qty = items.reduce((s, i) => s + i.quantity, 0);

  if (!event || items.length === 0 || qty > MAX_TICKETS_PER_ORDER) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="card p-8 text-center">
          <p className="font-display text-2xl font-bold">Pesanan tidak valid</p>
          <p className="mt-2 text-sm text-ink/70">Pilih ulang tiket dari halaman event (maksimal {MAX_TICKETS_PER_ORDER} tiket).</p>
          <Link href="/jelajah" className="btn-sun mt-5">
            Jelajahi Event
          </Link>
        </div>
      </div>
    );
  }

  const t = themeStyle(event.theme);
  return (
    <>
      <Stepper step={2} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <CheckoutForm
          event={{
            id: event.id,
            title: event.title,
            dateLabel: `${shortDate(event.startAt)} · ${timeRange(event.startAt)}`,
            venue: `${event.venue}, ${event.city}`,
            gradient: t.gradient,
            planet: t.planet,
          }}
          items={items}
          fee={serviceFee()}
          buyer={{ name: user.name, email: user.email, phone: user.phone ?? "", city: user.city ?? "" }}
        />
      </div>
    </>
  );
}
