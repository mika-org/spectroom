import type { Metadata } from "next";
import Link from "next/link";
import { ThemeArt } from "@/components/art";
import { getCategoriesWithCount } from "@/lib/queries";

export const metadata: Metadata = { title: "Kategori" };

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCount();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="heading text-4xl">Semua Kategori</h1>
      <p className="mt-1 text-white/85">Pilih jenis acara yang paling bikin kamu semangat.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} href={`/jelajah?kategori=${c.slug}`} className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-brutal-lg">
            <ThemeArt theme={c.theme} planetSize={100} className="h-40 border-b-2 border-ink" />
            <div className="p-4">
              <p className="font-display text-xl font-bold">{c.name}</p>
              {c.description && <p className="mt-1 text-sm text-ink/70">{c.description}</p>}
              <p className="mt-2 text-xs font-semibold text-teal-dark">{c.eventCount} event</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
