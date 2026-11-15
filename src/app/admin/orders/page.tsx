import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { dateTimeShort, rupiah } from "@/lib/format";
import { Badge, PageHeader, Table } from "@/components/admin/common";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Pesanan" };

const STATUSES = ["PAID", "PENDING", "CANCELLED", "REFUNDED"] as const;
const PER_PAGE = 20;

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" && (STATUSES as readonly string[]).includes(sp.status) ? (sp.status as (typeof STATUSES)[number]) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { buyerName: { contains: q, mode: "insensitive" } },
      { buyerEmail: { contains: q, mode: "insensitive" } },
      { event: { title: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { event: { select: { title: true } }, items: { select: { quantity: true } } },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (p: number) => `/admin/orders?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), page: String(p) })}`;

  return (
    <div>
      <PageHeader title="Pesanan" subtitle={`${total} pesanan`} />
      <form className="mb-4 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Kode, nama, email, atau event…" className="input max-w-xs bg-white" />
        <select name="status" defaultValue={status ?? ""} className="input w-44 bg-white">
          <option value="">Semua status</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="btn-cream">Filter</button>
      </form>
      <Table head={["Kode", "Pembeli", "Event", "Tiket", "Total", "Metode", "Status", "Waktu"]}>
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-cream/60">
            <td className="px-4 py-3 font-mono text-xs font-bold">
              <Link href={`/admin/orders/${o.id}`} className="text-teal-dark hover:underline">
                {o.code}
              </Link>
            </td>
            <td className="px-4 py-3">
              <p className="font-semibold">{o.buyerName}</p>
              <p className="text-xs text-ink/50">{o.buyerEmail}</p>
            </td>
            <td className="px-4 py-3">{o.event.title}</td>
            <td className="px-4 py-3">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
            <td className="px-4 py-3 font-semibold whitespace-nowrap">{rupiah(o.total)}</td>
            <td className="px-4 py-3 text-xs">{o.paymentMethod}</td>
            <td className="px-4 py-3">
              <Badge value={o.status} />
            </td>
            <td className="px-4 py-3 text-xs whitespace-nowrap text-ink/60">{dateTimeShort(o.createdAt)}</td>
          </tr>
        ))}
        {orders.length === 0 && (
          <tr>
            <td colSpan={8} className="px-4 py-8 text-center text-ink/60">
              Tidak ada pesanan
            </td>
          </tr>
        )}
      </Table>
      {pages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          {page > 1 && (
            <Link href={href(page - 1)} className="btn-cream btn-sm">
              ← Sebelumnya
            </Link>
          )}
          <span>
            Halaman {page} / {pages}
          </span>
          {page < pages && (
            <Link href={href(page + 1)} className="btn-cream btn-sm">
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
