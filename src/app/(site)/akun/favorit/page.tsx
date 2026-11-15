import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventCardSelect } from "@/lib/queries";

export const metadata: Metadata = { title: "Event Favorit" };

export default async function FavoritesPage() {
  const user = await requireUser("/akun/favorit");
  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { event: { select: eventCardSelect } },
  });
  return (
    <div>
      <h1 className="heading text-4xl">Event Favorit</h1>
      {favorites.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-xl font-bold">Belum ada event favorit</p>
          <p className="mt-1 text-sm text-ink/70">Tekan ikon hati pada event untuk menyimpannya di sini.</p>
          <Link href="/jelajah" className="btn-sun mt-4">
            Jelajahi Event
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map(({ event }) => (
            <EventCard key={event.id} event={event} favorite />
          ))}
        </div>
      )}
    </div>
  );
}
