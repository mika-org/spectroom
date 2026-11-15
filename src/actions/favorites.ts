"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function toggleFavorite(eventId: string) {
  const id = z.string().min(1).parse(eventId);
  const session = await getSession();
  if (!session) return { needLogin: true as const };

  const key = { userId_eventId: { userId: session.userId, eventId: id } };
  const existing = await db.favorite.findUnique({ where: key });
  if (existing) {
    await db.favorite.delete({ where: key });
  } else {
    await db.favorite.create({ data: { userId: session.userId, eventId: id } });
  }
  revalidatePath("/akun/favorit");
  return { favorite: !existing };
}
