import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { ExploreFilters, SortSelect } from "@/components/explore-filters";
import { exploreEvents, getCategoriesWithCount, getCities, getFavoriteIds } from "@/lib/queries";
import { exploreQuerySchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Jelajah Event" };

export default async function ExplorePage({ searchParams }: PageProps<"/jelajah">) {
  const raw = await searchParams;
  const query = exploreQuerySchema.parse(raw);
  const [{ events, total, pages }, categories, cities, session] = await Promise.all([
    exploreEvents(query),
    getCategoriesWithCount(),
    getCities(),
    getSession(),
  ]);
  const favorites = await getFavoriteIds(session?.userId);

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(raw)) {
      if (k === "page" || v === undefined) continue;
      (Array.isArray(v) ? v : [v]).forEach((x) => params.append(k, x));
    }
    if (page > 1) params.set("page", String(page));
    const s = params.toString();
    return s ? `/jelajah?${s}` : "/jelajah";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-white/80">
        <Link href="/" className="hover:text-sun">
          Beranda
        </Link>{" "}
        / <span className="text-white">Jelajah</span>
      </nav>
      <h1 className="heading mt-2 text-4xl">Jelajahi Semua Event</h1>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <form action="/jelajah" className="card flex flex-1 items-center gap-2 p-1.5 pl-4">
          <Search size={18} className="text-ink/60" />
          {query.kategori.map((k) => (
            <input key={k} type="hidden" name="kategori" value={k} />
          ))}
          <input name="q" defaultValue={query.q} placeholder="Cari konser, komedi, festival…" className="flex-1 bg-transparent text-sm outline-none" />
          <button className="btn-sun btn-sm px-6">Cari</button>
        </form>
        <SortSelect value={query.urut} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
        <ExploreFilters categories={categories} cities={cities} query={query} />
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Menampilkan {total} event</p>
          {events.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} favorite={favorites.has(e.id)} />
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="font-display text-xl font-bold">Belum ada event yang cocok</p>
              <p className="mt-1 text-sm text-ink/70">Coba ubah kata kunci atau filter kamu.</p>
              <Link href="/jelajah" className="btn-sun mt-4">
                Reset filter
              </Link>
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-10 flex justify-center gap-2" aria-label="Halaman">
              <PageLink href={pageHref(query.page - 1)} disabled={query.page <= 1} label="Sebelumnya">
                <ChevronLeft size={16} />
              </PageLink>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <PageLink key={p} href={pageHref(p)} active={p === query.page} label={`Halaman ${p}`}>
                  {p}
                </PageLink>
              ))}
              <PageLink href={pageHref(query.page + 1)} disabled={query.page >= pages} label="Berikutnya">
                <ChevronRight size={16} />
              </PageLink>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function PageLink({
  href,
  children,
  active,
  disabled,
  label,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  const cls = `grid size-9 place-items-center rounded-full border-2 border-ink font-display text-sm font-bold shadow-brutal-sm ${
    active ? "bg-sun" : "bg-cream"
  }`;
  if (disabled) return <span className={`${cls} opacity-40`} aria-disabled>{children}</span>;
  return (
    <Link href={href} className={cls} aria-label={label} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
