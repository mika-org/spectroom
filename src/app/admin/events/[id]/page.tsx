import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toDateTimeLocal } from "@/lib/format";
import { PageHeader } from "@/components/admin/common";
import { EventForm } from "@/components/admin/event-form";

export const metadata: Metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: PageProps<"/admin/events/[id]">) {
  const { id } = await params;
  const [event, categories] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: { organizer: true, ticketTypes: { orderBy: { sortOrder: "asc" } } },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!event) notFound();

  return (
    <div className="max-w-5xl">
      <PageHeader title={`Edit: ${event.title}`} />
      <EventForm
        categories={categories}
        values={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          summary: event.summary ?? "",
          description: event.description,
          terms: event.terms ?? "",
          venue: event.venue,
          address: event.address,
          city: event.city,
          startAt: toDateTimeLocal(event.startAt),
          endAt: toDateTimeLocal(event.endAt),
          theme: event.theme,
          isTrending: event.isTrending,
          status: event.status,
          categoryId: event.categoryId,
          organizerName: event.organizer?.name ?? "",
          ticketTypes: event.ticketTypes.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description ?? "",
            price: String(t.price),
            quota: String(t.quota),
            badge: t.badge ?? "",
            sold: t.sold,
          })),
        }}
      />
    </div>
  );
}
