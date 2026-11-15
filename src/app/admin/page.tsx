import Link from "next/link";
import { db } from "@/lib/db";
import { dateTimeShort, daysFromNow, rupiah } from "@/lib/format";
import { Badge, PageHeader, Table } from "@/components/admin/common";

export default async function AdminDashboard() {
  const since = daysFromNow(-30);
  const [revenue, revenue30, tickets, orders, users, upcoming, subscribers, recent, topEvents] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: "PAID" } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: "PAID", paidAt: { gte: since } } }),
    db.orderItem.aggregate({ _sum: { quantity: true }, where: { order: { status: "PAID" } } }),
    db.order.count(),
    db.user.count(),
    db.event.count({ where: { status: "PUBLISHED", startAt: { gte: new Date() } } }),
    db.subscriber.count(),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { event: { select: { title: true } } },
    }),
    db.event.findMany({
      take: 5,
      where: { status: "PUBLISHED" },
      orderBy: { orders: { _count: "desc" } },
      select: { id: true, title: true, ticketTypes: { select: { sold: true, quota: true } } },
    }),
  ]);

  const stats = [
    ["Total pendapatan", rupiah(revenue._sum.total ?? 0)],
    ["Pendapatan 30 hari", rupiah(revenue30._sum.total ?? 0)],
    ["Tiket terjual", String(tickets._sum.quantity ?? 0)],
    ["Total pesanan", String(orders)],
    ["Pengguna", String(users)],
    ["Event akan datang", String(upcoming)],
    ["Subscriber newsletter", String(subscribers)],
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan performa SpectRoom" action={{ href: "/admin/events/new", label: "+ Event baru" }} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="card bg-white p-4">
            <p className="text-xs font-semibold text-ink/60">{l}</p>
            <p className="mt-1 font-display text-2xl font-bold text-teal-dark">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Pesanan terbaru</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-teal-dark hover:underline">
              Semua →
            </Link>
          </div>
          <Table head={["Kode", "Pembeli", "Event", "Total", "Status", "Waktu"]}>
            {recent.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-mono text-xs font-bold">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                    {o.code}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.buyerName}</td>
                <td className="px-4 py-3">{o.event.title}</td>
                <td className="px-4 py-3 font-semibold">{rupiah(o.total)}</td>
                <td className="px-4 py-3">
                  <Badge value={o.status} />
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap text-ink/60">{dateTimeShort(o.createdAt)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink/60">
                  Belum ada pesanan
                </td>
              </tr>
            )}
          </Table>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Event terlaris</h2>
          <div className="card space-y-4 bg-white p-4">
            {topEvents.map((e) => {
              const sold = e.ticketTypes.reduce((s, t) => s + t.sold, 0);
              const quota = e.ticketTypes.reduce((s, t) => s + t.quota, 0) || 1;
              const pct = Math.round((sold / quota) * 100);
              return (
                <div key={e.id}>
                  <div className="flex justify-between text-sm">
                    <Link href={`/admin/events/${e.id}`} className="font-semibold hover:underline">
                      {e.title}
                    </Link>
                    <span className="text-ink/60">
                      {sold}/{quota}
                    </span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full border-2 border-ink bg-cream">
                    <div className="h-full bg-teal" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
