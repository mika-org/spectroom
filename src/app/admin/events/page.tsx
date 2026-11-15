import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { dateTimeShort, rupiah } from "@/lib/format";
import { deleteEvent } from "@/actions/admin";
import { Alert, Badge, PageHeader, Table } from "@/components/admin/common";
import { ConfirmButton } from "@/components/admin/confirm-button";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Event" };

const STATUSES = ["PUBLISHED", "DRAFT", "CANCELLED"] as const;

export default async function AdminEventsPage({ searchParams }: PageProps<"/admin/events">) {
  const { q, status, saved } = await searchParams;
  const where: Prisma.EventWhereInput = {};
  if (typeof q === "string" && q) where.title = { contains: q, mode: "insensitive" };
  if (typeof status === "string" && (STATUSES as readonly string[]).includes(status)) where.status = status as (typeof STATUSES)[number];

  const events = await db.event.findMany({
    where,
    orderBy: { startAt: "desc" },
    include: {
      category: { select: { name: true } },
      ticketTypes: { select: { sold: true, quota: true } },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Event" subtitle={`${events.length} event`} action={{ href: "/admin/events/new", label: "+ Event baru" }} />
      {saved && <Alert tone="ok">Event berhasil disimpan.</Alert>}
      <form className="mb-4 flex flex-wrap gap-3">
        <input name="q" defaultValue={typeof q === "string" ? q : ""} placeholder="Cari judul event…" className="input max-w-xs bg-white" />
        <select name="status" defaultValue={typeof status === "string" ? status : ""} className="input w-44 bg-white">
          <option value="">Semua status</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="btn-cream">Filter</button>
      </form>
      <Table head={["Event", "Kategori", "Jadwal", "Harga mulai", "Terjual", "Status", ""]}>
        {events.map((e) => {
          const sold = e.ticketTypes.reduce((s, t) => s + t.sold, 0);
          const quota = e.ticketTypes.reduce((s, t) => s + t.quota, 0);
          return (
            <tr key={e.id}>
              <td className="px-4 py-3">
                <p className="font-semibold">
                  {e.title} {e.isTrending && <span title="Trending">🔥</span>}
                </p>
                <p className="text-xs text-ink/50">
                  {e.venue}, {e.city}
                </p>
              </td>
              <td className="px-4 py-3">{e.category.name}</td>
              <td className="px-4 py-3 text-xs whitespace-nowrap">{dateTimeShort(e.startAt)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{rupiah(e.minPrice)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {sold}/{quota}
              </td>
              <td className="px-4 py-3">
                <Badge value={e.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link href={`/event/${e.slug}`} className="btn-cream btn-sm" target="_blank">
                    Lihat
                  </Link>
                  <Link href={`/admin/events/${e.id}`} className="btn-sun btn-sm">
                    Edit
                  </Link>
                  <form action={deleteEvent}>
                    <input type="hidden" name="id" value={e.id} />
                    <ConfirmButton
                      message={
                        e._count.orders > 0
                          ? "Event ini sudah punya pesanan, jadi akan DIBATALKAN (bukan dihapus). Lanjutkan?"
                          : "Hapus event ini secara permanen?"
                      }
                    >
                      {e._count.orders > 0 ? "Batalkan" : "Hapus"}
                    </ConfirmButton>
                  </form>
                </div>
              </td>
            </tr>
          );
        })}
        {events.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-8 text-center text-ink/60">
              Tidak ada event
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
}
