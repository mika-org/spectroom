import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { CalendarDays, MapPin } from "lucide-react";
import { ThemeArt } from "@/components/art";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { shortDate, timeRange } from "@/lib/format";

export const metadata: Metadata = { title: "Tiket Saya" };

export default async function MyTicketsPage({ searchParams }: PageProps<"/akun/tiket">) {
  const user = await requireUser("/akun/tiket");
  const { tab } = await searchParams;
  const history = tab === "riwayat";
  const now = new Date();

  const upcomingWhere = { userId: user.id, status: "PAID" as const, event: { startAt: { gte: now } } };
  const historyWhere = {
    userId: user.id,
    OR: [{ event: { startAt: { lt: now } } }, { status: { in: ["CANCELLED" as const, "REFUNDED" as const] } }],
  };

  const [upcomingCount, historyCount, orders] = await Promise.all([
    db.order.count({ where: upcomingWhere }),
    db.order.count({ where: historyWhere }),
    db.order.findMany({
      where: history ? historyWhere : upcomingWhere,
      include: { event: { include: { category: true } }, items: { include: { ticketType: true } } },
      orderBy: { event: { startAt: history ? "desc" : "asc" } },
    }),
  ]);

  const withQr = await Promise.all(
    orders.map(async (o) => ({
      ...o,
      qr: await QRCode.toDataURL(`SPECTROOM:${o.code}`, { margin: 1, width: 160, color: { dark: "#1b1b1f", light: "#fff5d9" } }),
    })),
  );

  return (
    <div>
      <h1 className="heading text-4xl">Tiket Saya</h1>
      <div className="mt-4 flex gap-6 border-b-2 border-white/25">
        {[
          ["", `Akan Datang (${upcomingCount})`],
          ["riwayat", `Riwayat (${historyCount})`],
        ].map(([v, l]) => {
          const active = (v === "riwayat") === history;
          return (
            <Link
              key={v}
              href={v ? `/akun/tiket?tab=${v}` : "/akun/tiket"}
              className={`-mb-0.5 border-b-2 pb-2 font-display text-sm font-semibold ${
                active ? "border-sun text-sun" : "border-transparent text-white hover:text-sun"
              }`}
            >
              {l}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 space-y-5">
        {withQr.length === 0 && (
          <div className="card p-10 text-center">
            <p className="font-display text-xl font-bold">{history ? "Belum ada riwayat" : "Belum ada tiket"}</p>
            <p className="mt-1 text-sm text-ink/70">Yuk cari event seru dan amankan tiketmu.</p>
            <Link href="/jelajah" className="btn-sun mt-4">
              Jelajahi Event
            </Link>
          </div>
        )}
        {withQr.map((o) => {
          const qty = o.items.reduce((s, i) => s + i.quantity, 0);
          return (
            <article key={o.id} className={`card flex flex-col overflow-hidden sm:flex-row ${history ? "opacity-80" : ""}`}>
              <ThemeArt theme={o.event.theme} planetSize={80} className="h-32 shrink-0 border-b-2 border-ink sm:h-auto sm:w-40 sm:border-r-2 sm:border-b-0" />
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-bold tracking-wider text-coral uppercase">{o.event.category.name}</p>
                  <span className="rounded-full border-2 border-ink bg-sun px-2 py-0.5 text-[10px] font-bold">
                    {o.status === "PAID" ? `${qty} TIKET` : o.status}
                  </span>
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold">{o.event.title}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/70">
                  <CalendarDays size={13} /> {shortDate(o.event.startAt)} · {timeRange(o.event.startAt)}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink/70">
                  <MapPin size={13} /> {o.event.venue}, {o.event.city}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-display font-bold text-teal-dark">
                    {o.items.map((i) => `${i.quantity}× ${i.ticketType.name}`).join(", ")}
                  </p>
                  <Link href={`/pesanan/${o.code}`} className="btn-cream btn-sm">
                    Lihat Detail
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center border-t-2 border-dashed border-ink p-4 sm:border-t-0 sm:border-l-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.qr} alt={`QR tiket ${o.code}`} width={110} height={110} className="rounded-lg border-2 border-ink" />
                <p className="mt-2 font-mono text-[11px] font-bold">{o.code}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
