import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Stepper } from "@/components/ui";
import { TicketSelector } from "@/components/ticket-pickers";
import { getEventBySlug } from "@/lib/queries";
import { shortDate, timeRange } from "@/lib/format";
import { themeStyle } from "@/lib/themes";

export const metadata: Metadata = { title: "Pilih Tiket" };

export default async function ChooseTicketPage({ params }: PageProps<"/event/[slug]/tiket">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  if (event.status !== "PUBLISHED" || event.startAt < new Date()) redirect(`/event/${slug}`);
  const t = themeStyle(event.theme);

  return (
    <>
      <Stepper step={1} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <TicketSelector
          slug={event.slug}
          event={{
            title: event.title,
            dateLabel: `${shortDate(event.startAt)} · ${timeRange(event.startAt)}`,
            venue: `${event.venue}, ${event.city}`,
            planet: t.planet,
            gradient: t.gradient,
          }}
          tickets={event.ticketTypes.map((tt) => ({
            id: tt.id,
            name: tt.name,
            description: tt.description,
            price: tt.price,
            badge: tt.badge,
            remaining: Math.max(0, tt.quota - tt.sold),
          }))}
        />
      </div>
    </>
  );
}
