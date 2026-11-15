import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { Sparkle, ThemeArt } from "@/components/art";
import { EventGrid } from "@/components/event-card";
import { EventTabs } from "@/components/event-tabs";
import { FavoriteButton } from "@/components/favorite-button";
import { ShareButton } from "@/components/share-button";
import { QuickTicketPicker } from "@/components/ticket-pickers";
import { getEventBySlug, getFavoriteIds, getRelatedEvents } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { initials, longDate, rupiah, shortDate, timeRange } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/event/[slug]">): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  return event ? { title: event.title, description: event.summary ?? undefined } : {};
}

export default async function EventDetailPage({ params }: PageProps<"/event/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const session = await getSession();
  const [related, favorites] = await Promise.all([
    getRelatedEvents(event.id, event.categoryId),
    getFavoriteIds(session?.userId),
  ]);
  const closed = event.status !== "PUBLISHED" || event.startAt < new Date();
  const tickets = event.ticketTypes.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    price: t.price,
    badge: t.badge,
    remaining: Math.max(0, t.quota - t.sold),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-white/80">
        <Link href="/" className="hover:text-sun">
          Beranda
        </Link>{" "}
        /{" "}
        <Link href="/jelajah" className="hover:text-sun">
          Jelajah
        </Link>{" "}
        / <span className="text-white">{event.title}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <ThemeArt theme={event.theme} planetSize={200} className="card h-72 md:h-80">
            <span className="chip absolute top-4 left-4">{event.category.name}</span>
            <div className="absolute top-4 right-4 flex gap-2">
              <ShareButton title={event.title} />
              <FavoriteButton eventId={event.id} initial={favorites.has(event.id)} />
            </div>
            <Sparkle size={20} className="absolute top-16 left-1/3" />
            <Sparkle size={14} className="absolute bottom-12 left-16" />
            <Sparkle size={16} className="absolute right-16 bottom-20" />
          </ThemeArt>

          <h1 className="heading mt-6 text-4xl md:text-5xl">{event.title}</h1>
          {event.status === "CANCELLED" && (
            <p className="mt-3 inline-block rounded-xl border-2 border-ink bg-coral px-3 py-1 font-semibold text-white">Event dibatalkan</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="card flex items-center gap-1.5 px-3 py-1.5 shadow-brutal-sm">
              <CalendarDays size={14} /> {shortDate(event.startAt)}
            </span>
            <span className="card flex items-center gap-1.5 px-3 py-1.5 shadow-brutal-sm">
              <Clock size={14} /> {timeRange(event.startAt, event.endAt)}
            </span>
            <span className="card flex items-center gap-1.5 px-3 py-1.5 shadow-brutal-sm">
              <MapPin size={14} /> {event.venue}, {event.city}
            </span>
          </div>

          <div className="mt-8">
            <EventTabs
              tabs={[
                {
                  id: "deskripsi",
                  label: "Deskripsi",
                  content: (
                    <div className="text-white">
                      <h2 className="heading text-2xl">Tentang Event</h2>
                      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/90">
                        {event.description.split(/\n+/).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "syarat",
                  label: "Syarat & Ketentuan",
                  content: (
                    <ul className="list-disc space-y-2 pl-5 text-sm text-white/90">
                      {(event.terms || "Tiket yang sudah dibeli tidak dapat dikembalikan.\nTunjukkan QR tiket di pintu masuk.")
                        .split(/\n+/)
                        .map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                    </ul>
                  ),
                },
                {
                  id: "lokasi",
                  label: "Lokasi",
                  content: (
                    <p className="text-sm text-white/90">
                      {event.venue} — {event.address}, {event.city}
                    </p>
                  ),
                },
              ]}
            />
          </div>

          <h2 className="heading mt-10 text-2xl">Lokasi</h2>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.address}, ${event.city}`)}`}
            target="_blank"
            rel="noreferrer"
            className="card relative mt-3 block h-48 overflow-hidden"
            style={{
              backgroundColor: "#fbe6ad",
              backgroundImage:
                "linear-gradient(#fff5d9 2px, transparent 2px), linear-gradient(90deg, #fff5d9 2px, transparent 2px), linear-gradient(90deg, transparent 54%, #fff 54%, #fff 58%, transparent 58%), linear-gradient(transparent 46%, #fff 46%, #fff 52%, transparent 52%)",
              backgroundSize: "40px 40px, 40px 40px, 100% 100%, 100% 100%",
            }}
          >
            <MapPin size={36} className="absolute top-1/3 left-1/2 -translate-x-1/2 fill-coral text-ink" />
            <span className="absolute bottom-3 left-3 rounded-lg border-2 border-ink bg-cream px-3 py-1 text-xs font-semibold">
              {event.venue} · {event.address}
            </span>
          </a>

          {event.organizer && (
            <div className="card mt-4 flex items-center gap-3 p-4">
              <span className="grid size-11 place-items-center rounded-full border-2 border-ink bg-teal font-display font-bold text-white">
                {initials(event.organizer.name)}
              </span>
              <div className="flex-1">
                <p className="font-display font-bold">{event.organizer.name}</p>
                <p className="text-xs text-ink/60">
                  {event.organizer.verified ? "Penyelenggara terverifikasi" : "Penyelenggara"} · {event.organizer._count.events} event
                </p>
              </div>
              <Link href={`/jelajah?q=${encodeURIComponent(event.organizer.name)}`} className="btn-cream btn-sm">
                Lihat Profil
              </Link>
            </div>
          )}
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <p className="text-xs text-ink/60">Mulai dari</p>
          <p className="font-display text-4xl font-bold text-teal-dark">{rupiah(event.minPrice)}</p>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <CalendarDays size={15} /> {longDate(event.startAt)} · {timeRange(event.startAt, event.endAt)}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm">
            <MapPin size={15} /> {event.venue}, {event.city}
          </p>
          <div className="mt-4 border-t-2 border-dashed border-ink/30" />
          <QuickTicketPicker slug={event.slug} tickets={tickets} disabled={closed} />
          {!closed && (
            <Link href={`/event/${event.slug}/tiket`} className="mt-3 block text-center text-xs font-semibold text-teal-dark hover:underline">
              Beli beberapa jenis tiket sekaligus →
            </Link>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <h2 className="heading text-3xl">Event Lainnya</h2>
            <Link href="/jelajah" className="flex items-center gap-1 text-sm font-semibold text-sun hover:underline">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-6">
            <EventGrid events={related} favorites={favorites} />
          </div>
        </section>
      )}
    </div>
  );
}
