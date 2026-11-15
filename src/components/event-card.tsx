import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { ThemeArt } from "./art";
import { FavoriteButton } from "./favorite-button";
import { rupiah, shortDate } from "@/lib/format";
import type { EventCardData } from "@/lib/queries";

export function EventCard({ event, favorite = false }: { event: EventCardData; favorite?: boolean }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-brutal-lg">
      <Link href={`/event/${event.slug}`} className="absolute inset-0 z-10" aria-label={event.title} />
      <ThemeArt theme={event.theme} planetSize={84} className="h-36 border-b-2 border-ink">
        <span className="chip absolute top-3 left-3">{event.category.name}</span>
        <div className="absolute top-2.5 right-2.5 z-20">
          <FavoriteButton eventId={event.id} initial={favorite} />
        </div>
      </ThemeArt>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1.5 text-xs text-ink/70">
          <CalendarDays size={13} /> {shortDate(event.startAt)}
        </p>
        <h3 className="mt-1 line-clamp-1 font-display text-lg font-bold">{event.title}</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/70">
          <MapPin size={13} /> <span className="line-clamp-1">{event.venue}</span>
        </p>
        <div className="mt-auto flex items-end justify-between border-t-2 border-dashed border-ink/30 pt-3 mt-3">
          <div>
            <p className="text-[10px] text-ink/60">Mulai dari</p>
            <p className="font-display text-lg font-bold text-teal-dark">{rupiah(event.minPrice)}</p>
          </div>
          <Link href={`/event/${event.slug}/tiket`} className="btn-sun btn-sm relative z-20 px-4">
            Beli
          </Link>
        </div>
      </div>
    </article>
  );
}

export function EventGrid({ events, favorites }: { events: EventCardData[]; favorites?: Set<string> }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {events.map((e) => (
        <EventCard key={e.id} event={e} favorite={favorites?.has(e.id)} />
      ))}
    </div>
  );
}
