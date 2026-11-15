import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { rupiah, shortDate, toDateInput } from "@/lib/format";
import { deletePromo } from "@/actions/admin";
import { Badge, PageHeader, Table } from "@/components/admin/common";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PromoForm } from "@/components/admin/simple-forms";

export const metadata: Metadata = { title: "Kode Promo" };

export default async function AdminPromosPage({ searchParams }: PageProps<"/admin/promos">) {
  const { edit } = await searchParams;
  const promos = await db.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  const editing = typeof edit === "string" ? promos.find((p) => p.id === edit) : undefined;

  return (
    <div>
      <PageHeader title="Kode Promo" subtitle={`${promos.length} kode promo`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Table head={["Kode", "Diskon", "Berlaku s/d", "Dipakai", "Status", ""]}>
          {promos.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3">
                <p className="font-mono font-bold">{p.code}</p>
                {p.description && <p className="text-xs text-ink/50">{p.description}</p>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {p.type === "PERCENT" ? `${p.value}%` : rupiah(p.value)}
                {p.maxDiscount ? <span className="text-xs text-ink/50"> (maks {rupiah(p.maxDiscount)})</span> : null}
              </td>
              <td className="px-4 py-3 text-xs">{p.expiresAt ? shortDate(p.expiresAt) : "—"}</td>
              <td className="px-4 py-3">{p._count.orders}×</td>
              <td className="px-4 py-3">
                <Badge value={p.active ? "AKTIF" : "NONAKTIF"} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/promos?edit=${p.id}`} className="btn-sun btn-sm">
                    Edit
                  </Link>
                  <form action={deletePromo}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message={`Hapus kode promo ${p.code}?`}>Hapus</ConfirmButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
          {promos.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-ink/60">
                Belum ada kode promo
              </td>
            </tr>
          )}
        </Table>
        <PromoForm
          values={
            editing && {
              id: editing.id,
              code: editing.code,
              description: editing.description ?? "",
              type: editing.type,
              value: editing.value,
              maxDiscount: editing.maxDiscount?.toString() ?? "",
              active: editing.active,
              expiresAt: toDateInput(editing.expiresAt),
            }
          }
        />
      </div>
    </div>
  );
}
