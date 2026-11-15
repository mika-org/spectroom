import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/common";
import { EventForm } from "@/components/admin/event-form";

export const metadata: Metadata = { title: "Event baru" };

export default async function NewEventPage() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <div className="max-w-5xl">
      <PageHeader title="Event baru" />
      <EventForm
        categories={categories}
        values={{
          title: "",
          slug: "",
          summary: "",
          description: "",
          terms: "",
          venue: "",
          address: "",
          city: "Bandung",
          startAt: "",
          endAt: "",
          theme: "SUNSET",
          isTrending: false,
          status: "PUBLISHED",
          categoryId: "",
          organizerName: "",
          ticketTypes: [],
        }}
      />
    </div>
  );
}
