import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { deleteCategory } from "@/actions/admin";
import { THEMES } from "@/lib/themes";
import { Alert, PageHeader, Table } from "@/components/admin/common";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CategoryForm } from "@/components/admin/simple-forms";

export const metadata: Metadata = { title: "Kategori" };

export default async function AdminCategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  const { edit, error } = await searchParams;
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { events: true } } },
  });
  const editing = typeof edit === "string" ? categories.find((c) => c.id === edit) : undefined;

  return (
    <div>
      <PageHeader title="Kategori" subtitle={`${categories.length} kategori`} />
      {typeof error === "string" && <Alert>{error}</Alert>}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Table head={["", "Nama", "Slug", "Event", "Urutan", ""]}>
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3">
                <span className="block size-8 rounded-lg border-2 border-ink" style={{ background: THEMES[c.theme].gradient }} />
              </td>
              <td className="px-4 py-3 font-semibold">{c.name}</td>
              <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
              <td className="px-4 py-3">{c._count.events}</td>
              <td className="px-4 py-3">{c.sortOrder}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/categories?edit=${c.id}`} className="btn-sun btn-sm">
                    Edit
                  </Link>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message={`Hapus kategori ${c.name}?`}>Hapus</ConfirmButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <CategoryForm
          values={
            editing && {
              id: editing.id,
              name: editing.name,
              slug: editing.slug,
              description: editing.description ?? "",
              theme: editing.theme,
              sortOrder: editing.sortOrder,
            }
          }
        />
      </div>
    </div>
  );
}
