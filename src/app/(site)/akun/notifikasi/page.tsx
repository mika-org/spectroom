import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateTimeShort, daysFromNow, shortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Notifikasi" };

/** Notifikasi diturunkan dari pesanan & event favorit yang akan datang. */
export default async function NotificationsPage() {
  const user = await requireUser("/akun/notifikasi");
  const soon = daysFromNow(14);
  const [orders, favs] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.favorite.findMany({
      where: { userId: user.id, event: { startAt: { gte: new Date(), lte: soon }, status: "PUBLISHED" } },
      include: { event: true },
    }),
  ]);

  const items = [
    ...orders.map((o) => ({
      id: o.id,
      at: o.createdAt,
      icon: CheckCircle2,
      title: o.status === "PAID" ? "Pembayaran berhasil" : `Pesanan ${o.status.toLowerCase()}`,
      body: `Pesanan ${o.code} untuk ${o.event.title}.`,
      href: `/pesanan/${o.code}`,
    })),
    ...favs.map((f) => ({
      id: `fav-${f.eventId}`,
      at: f.createdAt,
      icon: Bell,
      title: "Event favoritmu segera dimulai",
      body: `${f.event.title} berlangsung ${shortDate(f.event.startAt)}. Jangan sampai kehabisan tiket!`,
      href: `/event/${f.event.slug}`,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div>
      <h1 className="heading text-4xl">Notifikasi</h1>
      <div className="card mt-6 divide-y-2 divide-dashed divide-ink/20">
        {items.length === 0 && <p className="p-8 text-center text-sm text-ink/70">Belum ada notifikasi.</p>}
        {items.map(({ id, icon: Icon, title, body, href, at }) => (
          <Link key={id} href={href} className="flex gap-4 p-4 hover:bg-cream-dark/50">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-sun">
              <Icon size={18} />
            </span>
            <span className="flex-1">
              <span className="block font-display font-bold">{title}</span>
              <span className="block text-sm text-ink/70">{body}</span>
              <span className="text-[11px] text-ink/50">{dateTimeShort(at)}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
