import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateTimeShort, rupiah } from "@/lib/format";
import { updateOrderStatus } from "@/actions/admin";
import { Badge, PageHeader } from "@/components/admin/common";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const metadata: Metadata = { title: "Detail pesanan" };

export default async function AdminOrderDetail({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      event: true,
      user: { select: { name: true, email: true } },
      promoCode: { select: { code: true } },
      items: { include: { ticketType: { select: { name: true } } } },
    },
  });
  if (!order) notFound();

  const info: [string, React.ReactNode][] = [
    ["Status", <Badge key="s" value={order.status} />],
    ["Event", <Link key="e" href={`/admin/events/${order.eventId}`} className="text-teal-dark underline">{order.event.title}</Link>],
    ["Akun", `${order.user.name} (${order.user.email})`],
    ["Nama pemesan", order.buyerName],
    ["Email", order.buyerEmail],
    ["No. HP", order.buyerPhone],
    ["Kota", order.buyerCity],
    ["Metode bayar", order.paymentMethod],
    ["Dibuat", dateTimeShort(order.createdAt)],
    ["Dibayar", order.paidAt ? dateTimeShort(order.paidAt) : "-"],
  ];

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="text-sm font-semibold text-teal-dark hover:underline">
        ← Semua pesanan
      </Link>
      <PageHeader title={`Pesanan ${order.code}`} />
      <div className="grid gap-6 md:grid-cols-2">
        <dl className="card space-y-2 bg-white p-5 text-sm">
          {info.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-ink/60">{k}</dt>
              <dd className="text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-6">
          <div className="card bg-white p-5 text-sm">
            <h2 className="mb-3 font-display text-lg font-bold">Rincian</h2>
            {order.items.map((i) => (
              <div key={i.id} className="flex justify-between py-0.5">
                <span>
                  {i.quantity}× {i.ticketType.name} @ {rupiah(i.unitPrice)}
                </span>
                <span>{rupiah(i.quantity * i.unitPrice)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-ink/15 pt-2">
              <span>Biaya layanan</span>
              <span>{rupiah(order.serviceFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>Diskon {order.promoCode ? `(${order.promoCode.code})` : ""}</span>
                <span>−{rupiah(order.discount)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t-2 border-ink pt-2 font-display text-lg font-bold">
              <span>Total</span>
              <span>{rupiah(order.total)}</span>
            </div>
          </div>

          <div className="card bg-white p-5">
            <h2 className="mb-3 font-display text-lg font-bold">Ubah status</h2>
            <p className="mb-3 text-xs text-ink/60">
              Membatalkan / refund pesanan akan mengembalikan kuota tiket. Mengaktifkan kembali akan memotong kuota.
            </p>
            <div className="flex flex-wrap gap-2">
              {(["PAID", "PENDING", "CANCELLED", "REFUNDED"] as const)
                .filter((s) => s !== order.status)
                .map((s) => (
                  <form key={s} action={updateOrderStatus}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="status" value={s} />
                    <ConfirmButton message={`Ubah status pesanan menjadi ${s}?`} className={s === "PAID" ? "btn-sun btn-sm" : "btn-cream btn-sm"}>
                      Jadikan {s}
                    </ConfirmButton>
                  </form>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
