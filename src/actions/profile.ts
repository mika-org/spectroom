"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fieldErrors, profileSchema, type ActionState } from "@/lib/validations";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan masuk lagi." };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const clash = await db.user.findFirst({
    where: { email: d.email, id: { not: session.userId } },
    select: { id: true },
  });
  if (clash) return { errors: { email: "Email sudah dipakai akun lain" } };

  await db.user.update({
    where: { id: session.userId },
    data: {
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      city: d.city || null,
      birthDate: d.birthDate ? new Date(`${d.birthDate}T00:00:00+07:00`) : null,
      ...(d.password ? { passwordHash: await bcrypt.hash(d.password, 10) } : {}),
    },
  });
  revalidatePath("/akun", "layout");
  return { ok: true, message: "Profil berhasil disimpan." };
}
