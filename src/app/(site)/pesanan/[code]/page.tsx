import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Planet, Rocket, Sparkle } from "@/components/art";
import { Stepper } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Pesanan Berhasil" };

const METHOD_LABEL = { QRIS: "QRIS", BANK_TRANSFER: "Transfer Bank", EWALLET: "E-Wallet" } as const;

export default async function OrderDonePage({ params }: PageProps<"/pesanan/[code]">) {
  const { code } = await params;
  const user = await requireUser(`/pesanan/${code}`);
  const order = await db.order.findUnique({
    where: { code },
    include: { event: true, items: { include: { ticketType: true } } },
  });
  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  const rows: [string, string][] = [
    ["Kode pesanan", order.code],
    ["Event", order.event.title],
    ["Tiket", order.items.map((i) => `${i.quantity}× ${i.ticketType.name}`).join(", ")],
    ["Total dibayar", rupiah(order.total)],
    ["Metode", METHOD_LABEL[order.paymentMethod]],
  ];

  return (
    <div className="sunburst sunburst-teal">
      <Stepper step={3} />
      <div className="relative mx-auto max-w-xl px-4 pt-6 pb-20">
        <Rocket size={52} className="mx-auto" />
        <Planet size={90} color="#ffd84d" className="absolute top-24 -right-16 hidden md:block" />
        <Planet size={60} color="#ff7a59" ring="#ffd84d" className="absolute top-64 -left-20 hidden md:block" />
        <Sparkle size={18} color="#ffd84d" className="absolute top-10 left-10" />
        <div className="card mt-6 p-8 text-center">
          <h1 className="font-display text-4xl font-bold">Siap Meluncur!</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink/70">
            Pembayaran berhasil. Tiketmu sudah terbit{order.sendEmail ? " dan dikirim ke email kamu" : ""}.
          </p>
          <dl className="mt-6 rounded-xl border-2 border-ink bg-cream-dark/70 p-4 text-left text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-1">
                <dt className="text-ink/60">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/akun/tiket" className="btn-sun">
              Lihat Tiket
            </Link>
            <Link href="/" className="btn-cream">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
