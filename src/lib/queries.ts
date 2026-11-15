import "server-only";
import { db } from "./db";
import type { Prisma } from "@/generated/prisma/client";
import type { z } from "zod";
import type { exploreQuerySchema } from "./validations";

export const eventCardSelect = {
  id: true,
  title: true,
  slug: true,
  startAt: true,
  venue: true,
  city: true,
  theme: true,
  minPrice: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.EventSelect;

export type EventCardData = Prisma.EventGetPayload<{ select: typeof eventCardSelect }>;

const upcoming = (): Prisma.EventWhereInput => ({
  status: "PUBLISHED",
  startAt: { gte: new Date() },
});

export async function getHomeData() {
  const [trending, hot, categories, stats] = await Promise.all([
    db.event.findFirst({
      where: { ...upcoming(), isTrending: true },
      orderBy: { startAt: "asc" },
      select: eventCardSelect,
    }),
    db.event.findMany({
      where: upcoming(),
      orderBy: [{ orders: { _count: "desc" } }, { startAt: "asc" }],
      take: 4,
      select: eventCardSelect,
    }),
    getCategoriesWithCount(),
    getStats(),
  ]);
  return { trending, hot, categories, stats };
}

export async function getCategoriesWithCount() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { events: { where: { status: "PUBLISHED" } } } } },
  });
  return categories.map((c) => ({ ...c, eventCount: c._count.events }));
}

async function getStats() {
  const [events, tickets] = await Promise.all([
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.orderItem.aggregate({ _sum: { quantity: true }, where: { order: { status: "PAID" } } }),
  ]);
  return { events, tickets: tickets._sum.quantity ?? 0 };
}

export async function getCities() {
  const rows = await db.event.findMany({
    where: { status: "PUBLISHED" },
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });
  return rows.map((r) => r.city);
}

export const PAGE_SIZE = 9;

export async function exploreEvents(query: z.infer<typeof exploreQuerySchema>) {
  const now = new Date();
  const where: Prisma.EventWhereInput = { status: "PUBLISHED", startAt: { gte: now } };
  const and: Prisma.EventWhereInput[] = [];

  if (query.q) {
    and.push({
      OR: [
        { title: { contains: query.q, mode: "insensitive" } },
        { venue: { contains: query.q, mode: "insensitive" } },
        { category: { name: { contains: query.q, mode: "insensitive" } } },
      ],
    });
  }
  if (query.kategori.length) and.push({ category: { slug: { in: query.kategori } } });
  if (query.min !== undefined) and.push({ minPrice: { gte: query.min } });
  if (query.max !== undefined) and.push({ minPrice: { lte: query.max } });
  if (query.lokasi) and.push({ city: { contains: query.lokasi.split(",")[0]!.trim(), mode: "insensitive" } });

  if (query.tanggal === "minggu-ini") {
    and.push({ startAt: { lte: new Date(now.getTime() + 7 * 864e5) } });
  } else if (query.tanggal === "bulan-ini") {
    and.push({ startAt: { lte: new Date(now.getTime() + 31 * 864e5) } });
  }
  if (query.dari) {
    const from = new Date(`${query.dari}T00:00:00+07:00`);
    and.push({ startAt: { gte: from, lt: new Date(from.getTime() + 864e5) } });
  }
  if (and.length) where.AND = and;

  const orderBy: Prisma.EventOrderByWithRelationInput[] =
    query.urut === "terdekat"
      ? [{ startAt: "asc" }]
      : query.urut === "termurah"
        ? [{ minPrice: "asc" }]
        : query.urut === "termahal"
          ? [{ minPrice: "desc" }]
          : [{ isTrending: "desc" }, { orders: { _count: "desc" } }, { startAt: "asc" }];

  const [total, events] = await Promise.all([
    db.event.count({ where }),
    db.event.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: eventCardSelect,
    }),
  ]);
  return { total, events, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getEventBySlug(slug: string) {
  return db.event.findFirst({
    where: { slug, status: { not: "DRAFT" } },
    include: {
      category: true,
      organizer: { include: { _count: { select: { events: true } } } },
      ticketTypes: { orderBy: [{ sortOrder: "asc" }, { price: "asc" }] },
    },
  });
}

export async function getRelatedEvents(eventId: string, categoryId: string) {
  const sameCategory = await db.event.findMany({
    where: { ...upcoming(), id: { not: eventId }, categoryId },
    orderBy: { startAt: "asc" },
    take: 4,
    select: eventCardSelect,
  });
  if (sameCategory.length >= 4) return sameCategory;
  const others = await db.event.findMany({
    where: { ...upcoming(), id: { notIn: [eventId, ...sameCategory.map((e) => e.id)] } },
    orderBy: { startAt: "asc" },
    take: 4 - sameCategory.length,
    select: eventCardSelect,
  });
  return [...sameCategory, ...others];
}

export async function getFavoriteIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const favs = await db.favorite.findMany({ where: { userId }, select: { eventId: true } });
  return new Set(favs.map((f) => f.eventId));
}
