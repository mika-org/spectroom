"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { fromDateTimeLocal, slugify } from "@/lib/format";
import {
  categorySchema,
  eventSchema,
  fieldErrors,
  orderStatusSchema,
  promoSchema,
  userRoleSchema,
  type ActionState,
} from "@/lib/validations";

const idSchema = z.string().min(1);

function refreshPublic() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(base: string, table: "event" | "category", excludeId?: string) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; ; i++) {
    const found =
      table === "event"
        ? await db.event.findFirst({ where: { slug, id: excludeId ? { not: excludeId } : undefined }, select: { id: true } })
        : await db.category.findFirst({ where: { slug, id: excludeId ? { not: excludeId } : undefined }, select: { id: true } });
    if (!found) return slug;
    slug = `${root}-${i}`;
  }
}

// ---------------- EVENT ----------------

export async function saveEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = (formData.get("id") as string) || undefined;

  let ticketTypes: unknown = [];
  try {
    ticketTypes = JSON.parse(String(formData.get("ticketTypes") ?? "[]"));
  } catch {
    return { message: "Data tiket tidak valid" };
  }

  const parsed = eventSchema.safeParse({
    ...Object.fromEntries(formData),
    isTrending: formData.get("isTrending") === "on",
    ticketTypes,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Periksa kembali isian form." };
  const d = parsed.data;

  const slug = await uniqueSlug(d.slug || d.title, "event", id);
  let organizerId: string | null = null;
  if (d.organizerName) {
    const orgSlug = slugify(d.organizerName);
    const org = await db.organizer.upsert({
      where: { slug: orgSlug },
      create: { name: d.organizerName, slug: orgSlug },
      update: {},
    });
    organizerId = org.id;
  }

  const data = {
    title: d.title,
    slug,
    summary: d.summary || null,
    description: d.description,
    terms: d.terms || null,
    venue: d.venue,
    address: d.address,
    city: d.city,
    startAt: fromDateTimeLocal(d.startAt),
    endAt: d.endAt ? fromDateTimeLocal(d.endAt) : null,
    theme: d.theme,
    isTrending: d.isTrending,
    status: d.status,
    categoryId: d.categoryId,
    organizerId,
    minPrice: Math.min(...d.ticketTypes.map((t) => t.price)),
  };

  try {
    await db.$transaction(async (tx) => {
      const event = id ? await tx.event.update({ where: { id }, data }) : await tx.event.create({ data });

      const existing = await tx.ticketType.findMany({
        where: { eventId: event.id },
        include: { _count: { select: { orderItems: true } } },
      });
      const keepIds = new Set(d.ticketTypes.map((t) => t.id).filter(Boolean));
      for (const old of existing) {
        if (keepIds.has(old.id)) continue;
        if (old._count.orderItems > 0) throw new Error(`Tiket "${old.name}" sudah terjual, tidak bisa dihapus`);
        await tx.ticketType.delete({ where: { id: old.id } });
      }
      for (const [i, t] of d.ticketTypes.entries()) {
        const fields = {
          name: t.name,
          description: t.description || null,
          price: t.price,
          quota: t.quota,
          badge: t.badge || null,
          sortOrder: i,
        };
        const old = t.id ? existing.find((e) => e.id === t.id) : undefined;
        if (old) {
          if (t.quota < old.sold) throw new Error(`Kuota "${t.name}" tidak boleh kurang dari terjual (${old.sold})`);
          await tx.ticketType.update({ where: { id: old.id }, data: fields });
        } else {
          await tx.ticketType.create({ data: { ...fields, eventId: event.id } });
        }
      }
    });
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Gagal menyimpan event" };
  }

  refreshPublic();
  redirect("/admin/events?saved=1");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const orders = await db.order.count({ where: { eventId: id } });
  if (orders > 0) {
    // Event yang sudah punya pesanan tidak dihapus, hanya dibatalkan
    await db.event.update({ where: { id }, data: { status: "CANCELLED" } });
  } else {
    await db.event.delete({ where: { id } });
  }
  refreshPublic();
}

// ---------------- KATEGORI ----------------

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = (formData.get("id") as string) || undefined;
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const clash = await db.category.findFirst({ where: { name: d.name, id: id ? { not: id } : undefined } });
  if (clash) return { errors: { name: "Nama kategori sudah ada" } };

  const data = {
    name: d.name,
    slug: await uniqueSlug(d.slug || d.name, "category", id),
    description: d.description || null,
    theme: d.theme,
    sortOrder: d.sortOrder,
  };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });
  refreshPublic();
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const count = await db.event.count({ where: { categoryId: id } });
  if (count > 0) redirect(`/admin/categories?error=${encodeURIComponent("Kategori masih dipakai " + count + " event")}`);
  await db.category.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/categories");
}

// ---------------- PESANAN ----------------

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const { id, status } = orderStatusSchema.parse(Object.fromEntries(formData));

  await db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    const holdsQuota = (s: string) => s === "PAID" || s === "PENDING";
    if (holdsQuota(order.status) && !holdsQuota(status)) {
      for (const item of order.items) {
        await tx.ticketType.update({ where: { id: item.ticketTypeId }, data: { sold: { decrement: item.quantity } } });
      }
    } else if (!holdsQuota(order.status) && holdsQuota(status)) {
      for (const item of order.items) {
        const n = await tx.$executeRaw`
          UPDATE "TicketType" SET "sold" = "sold" + ${item.quantity}
          WHERE "id" = ${item.ticketTypeId} AND "sold" + ${item.quantity} <= "quota"`;
        if (n === 0) throw new Error("Kuota tiket tidak cukup untuk mengaktifkan kembali pesanan");
      }
    }
    await tx.order.update({
      where: { id },
      data: { status, paidAt: status === "PAID" ? (order.paidAt ?? new Date()) : order.paidAt },
    });
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// ---------------- PENGGUNA ----------------

export async function updateUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const { id, role } = userRoleSchema.parse(Object.fromEntries(formData));
  if (id === admin.id && role !== "ADMIN") {
    redirect(`/admin/users?error=${encodeURIComponent("Tidak bisa mencabut role admin milik sendiri")}`);
  }
  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

// ---------------- PROMO ----------------

export async function savePromo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = (formData.get("id") as string) || undefined;
  const parsed = promoSchema.safeParse({ ...Object.fromEntries(formData), active: formData.get("active") === "on" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const clash = await db.promoCode.findFirst({ where: { code: d.code, id: id ? { not: id } : undefined } });
  if (clash) return { errors: { code: "Kode promo sudah ada" } };

  const data = {
    code: d.code,
    description: d.description || null,
    type: d.type,
    value: d.value,
    maxDiscount: d.maxDiscount === "" || d.maxDiscount === undefined ? null : d.maxDiscount,
    active: d.active,
    expiresAt: d.expiresAt ? new Date(`${d.expiresAt}T23:59:59+07:00`) : null,
  };
  if (id) await db.promoCode.update({ where: { id }, data });
  else await db.promoCode.create({ data });
  redirect("/admin/promos");
}

export async function deletePromo(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  await db.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promos");
}
