"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/profile";
import { Planet } from "./art";
import { FieldError, FormMessage, SubmitButton } from "./ui";

type Props = { name: string; email: string; phone: string; city: string; birthDate: string };

export function ProfileForm(user: Props) {
  const [state, action] = useActionState(updateProfile, {});
  const e = state.errors ?? {};
  const fields: { name: keyof Props | "password"; label: string; type?: string; value?: string; placeholder?: string }[] = [
    { name: "name", label: "Nama lengkap", value: user.name },
    { name: "email", label: "Email", type: "email", value: user.email },
    { name: "phone", label: "No. HP", value: user.phone, placeholder: "0812-3456-7890" },
    { name: "birthDate", label: "Tanggal lahir", type: "date", value: user.birthDate },
    { name: "city", label: "Kota", value: user.city, placeholder: "Bandung, Jawa Barat" },
    { name: "password", label: "Kata sandi baru", type: "password", placeholder: "Kosongkan jika tidak diubah" },
  ];
  return (
    <form action={action} className="card mt-6 p-6">
      <div className="flex items-center gap-4 border-b-2 border-dashed border-ink/30 pb-5">
        <span className="grid size-16 place-items-center rounded-full border-2 border-ink bg-sun">
          <Planet size={46} color="#ff7a59" ring="#ffd84d" />
        </span>
        <div>
          <p className="font-display text-lg font-bold">{user.name}</p>
          <p className="text-xs text-ink/60">Avatar planet otomatis untuk semua penjelajah SpectRoom.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="label" htmlFor={f.name}>{f.label}</label>
            <input
              id={f.name}
              name={f.name}
              type={f.type ?? "text"}
              defaultValue={f.value}
              placeholder={f.placeholder}
              autoComplete={f.name === "password" ? "new-password" : undefined}
              className="input"
            />
            <FieldError message={e[f.name]} />
          </div>
        ))}
      </div>
      <div className="mt-5">
        <FormMessage ok={state.ok} message={state.message} />
      </div>
      <div className="mt-5 flex gap-3">
        <SubmitButton>Simpan Perubahan</SubmitButton>
        <button type="reset" className="btn-cream">
          Batal
        </button>
      </div>
    </form>
  );
}
