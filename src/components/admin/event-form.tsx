"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { saveEvent } from "@/actions/admin";
import { FieldError, FormMessage } from "@/components/ui";
import { THEMES } from "@/lib/themes";

type Ticket = { key: string; id?: string; name: string; description: string; price: string; quota: string; badge: string; sold?: number };

export type EventFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  terms: string;
  venue: string;
  address: string;
  city: string;
  startAt: string;
  endAt: string;
  theme: string;
  isTrending: boolean;
  status: string;
  categoryId: string;
  organizerName: string;
  ticketTypes: Omit<Ticket, "key">[];
};

let counter = 0;
const newKey = () => `t${++counter}`;

export function EventForm({ values, categories }: { values: EventFormValues; categories: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(saveEvent, {});
  const [tickets, setTickets] = useState<Ticket[]>(() =>
    values.ticketTypes.length
      ? values.ticketTypes.map((t) => ({ ...t, key: newKey() }))
      : [{ key: newKey(), name: "Regular", description: "", price: "100000", quota: "100", badge: "" }],
  );
  const [theme, setTheme] = useState(values.theme);
  const e = state.errors ?? {};

  const update = (key: string, patch: Partial<Ticket>) => setTickets((ts) => ts.map((t) => (t.key === key ? { ...t, ...patch } : t)));

  const field = (name: keyof EventFormValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={values[name] as string} className="input bg-white" {...props} />
      <FieldError message={e[name]} />
    </div>
  );

  return (
    <form
      className="space-y-6"
      onSubmit={(ev) => {
        // onSubmit manual agar isian form tidak di-reset saat ada error validasi
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <input
        type="hidden"
        name="ticketTypes"
        value={JSON.stringify(
          tickets.map(({ id, name, description, price, quota, badge }) => ({ id, name, description, price, quota, badge })),
        )}
      />

      <section className="card space-y-4 bg-white p-5">
        <h2 className="font-display text-lg font-bold">Informasi Event</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {field("title", "Judul event", { required: true })}
          {field("slug", "Slug URL (opsional)", { placeholder: "otomatis dari judul" })}
        </div>
        {field("summary", "Ringkasan singkat")}
        <div>
          <label className="label" htmlFor="description">Deskripsi</label>
          <textarea id="description" name="description" rows={5} defaultValue={values.description} className="input bg-white" required />
          <FieldError message={e.description} />
        </div>
        <div>
          <label className="label" htmlFor="terms">Syarat & ketentuan (satu per baris)</label>
          <textarea id="terms" name="terms" rows={3} defaultValue={values.terms} className="input bg-white" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label" htmlFor="categoryId">Kategori</label>
            <select id="categoryId" name="categoryId" defaultValue={values.categoryId} className="input bg-white" required>
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError message={e.categoryId} />
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={values.status} className="input bg-white">
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
          {field("organizerName", "Penyelenggara")}
        </div>
      </section>

      <section className="card space-y-4 bg-white p-5">
        <h2 className="font-display text-lg font-bold">Jadwal & Lokasi</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {field("startAt", "Mulai (WIB)", { type: "datetime-local", required: true })}
          {field("endAt", "Selesai (WIB, opsional)", { type: "datetime-local" })}
          {field("venue", "Nama tempat", { required: true })}
          {field("city", "Kota", { required: true, placeholder: "Bandung" })}
        </div>
        {field("address", "Alamat", { required: true })}
      </section>

      <section className="card space-y-4 bg-white p-5">
        <h2 className="font-display text-lg font-bold">Tampilan</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(THEMES).map(([key, t]) => (
            <label key={key} className="cursor-pointer text-center">
              <input type="radio" name="theme" value={key} checked={theme === key} onChange={() => setTheme(key)} className="peer sr-only" />
              <span
                className="block h-14 w-20 rounded-xl border-2 border-ink peer-checked:shadow-brutal peer-checked:ring-4 peer-checked:ring-sun"
                style={{ background: t.gradient }}
              />
              <span className="mt-1 block text-xs font-semibold">{t.label}</span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="isTrending" defaultChecked={values.isTrending} className="size-4 accent-[#1a9c99]" />
          Tampilkan sebagai banner &quot;Sedang Trending&quot; di beranda
        </label>
      </section>

      <section className="card space-y-4 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Jenis Tiket</h2>
          <button
            type="button"
            className="btn-cream btn-sm"
            onClick={() => setTickets((ts) => [...ts, { key: newKey(), name: "", description: "", price: "", quota: "", badge: "" }])}
          >
            <Plus size={14} /> Tambah tiket
          </button>
        </div>
        <FieldError message={e.ticketTypes} />
        {tickets.map((t, i) => (
          <div key={t.key} className="grid gap-3 rounded-xl border-2 border-ink/20 p-3 md:grid-cols-[1fr_1.5fr_120px_90px_120px_auto] md:items-end">
            <div>
              <label className="label">Nama</label>
              <input value={t.name} onChange={(ev) => update(t.key, { name: ev.target.value })} className="input bg-white" required />
              <FieldError message={e[`ticketTypes.${i}.name`]} />
            </div>
            <div>
              <label className="label">Deskripsi</label>
              <input value={t.description} onChange={(ev) => update(t.key, { description: ev.target.value })} className="input bg-white" />
            </div>
            <div>
              <label className="label">Harga (Rp)</label>
              <input type="number" min={0} value={t.price} onChange={(ev) => update(t.key, { price: ev.target.value })} className="input bg-white" required />
              <FieldError message={e[`ticketTypes.${i}.price`]} />
            </div>
            <div>
              <label className="label">Kuota</label>
              <input type="number" min={1} value={t.quota} onChange={(ev) => update(t.key, { quota: ev.target.value })} className="input bg-white" required />
              <FieldError message={e[`ticketTypes.${i}.quota`]} />
            </div>
            <div>
              <label className="label">Badge</label>
              <input value={t.badge} placeholder="Hampir habis" onChange={(ev) => update(t.key, { badge: ev.target.value })} className="input bg-white" />
            </div>
            <div className="flex items-center gap-2 pb-1">
              {t.sold ? <span className="text-xs text-ink/60">{t.sold} terjual</span> : null}
              <button
                type="button"
                aria-label="Hapus tiket"
                disabled={tickets.length === 1 || !!t.sold}
                onClick={() => setTickets((ts) => ts.filter((x) => x.key !== t.key))}
                className="grid size-9 place-items-center rounded-lg border-2 border-ink bg-coral text-white disabled:opacity-30"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <FormMessage message={state.message} />
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-sun">
          {pending ? "Menyimpan…" : "Simpan Event"}
        </button>
        <Link href="/admin/events" className="btn-cream">
          Batal
        </Link>
      </div>
    </form>
  );
}
