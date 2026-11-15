"use server";

import { db } from "@/lib/db";
import { fieldErrors, subscribeSchema, type ActionState } from "@/lib/validations";

export async function subscribe(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = subscribeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await db.subscriber.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email },
    update: {},
  });
  return { ok: true, message: "Yeay! Kamu sudah berlangganan info event seru." };
}
