import type { Metadata } from "next";
import { db } from "@/lib/db";
import { dateTimeShort } from "@/lib/format";
import { updateUserRole } from "@/actions/admin";
import { Alert, Badge, PageHeader, Table } from "@/components/admin/common";
import { ConfirmButton } from "@/components/admin/confirm-button";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Pengguna" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const { q, error } = await searchParams;
  const where: Prisma.UserWhereInput =
    typeof q === "string" && q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : {};
  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      role: true,
      points: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Pengguna" subtitle={`${users.length} pengguna ditampilkan`} />
      {typeof error === "string" && <Alert>{error}</Alert>}
      <form className="mb-4 flex gap-3">
        <input name="q" defaultValue={typeof q === "string" ? q : ""} placeholder="Cari nama atau email…" className="input max-w-xs bg-white" />
        <button className="btn-cream">Cari</button>
      </form>
      <Table head={["Nama", "Kontak", "Pesanan", "Poin", "Bergabung", "Role", ""]}>
        {users.map((u) => (
          <tr key={u.id}>
            <td className="px-4 py-3 font-semibold">{u.name}</td>
            <td className="px-4 py-3">
              <p>{u.email}</p>
              <p className="text-xs text-ink/50">{[u.phone, u.city].filter(Boolean).join(" · ")}</p>
            </td>
            <td className="px-4 py-3">{u._count.orders}</td>
            <td className="px-4 py-3">{u.points}</td>
            <td className="px-4 py-3 text-xs whitespace-nowrap text-ink/60">{dateTimeShort(u.createdAt)}</td>
            <td className="px-4 py-3">
              <Badge value={u.role} />
            </td>
            <td className="px-4 py-3 text-right">
              <form action={updateUserRole}>
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="role" value={u.role === "ADMIN" ? "USER" : "ADMIN"} />
                <ConfirmButton
                  message={u.role === "ADMIN" ? `Cabut akses admin dari ${u.name}?` : `Jadikan ${u.name} sebagai admin?`}
                  className="btn-cream btn-sm whitespace-nowrap"
                >
                  {u.role === "ADMIN" ? "Jadikan user" : "Jadikan admin"}
                </ConfirmButton>
              </form>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
