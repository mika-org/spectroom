"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveCategory, savePromo } from "@/actions/admin";
import { FieldError, SubmitButton } from "@/components/ui";
import { THEMES } from "@/lib/themes";

export function CategoryForm({
  values,
}: {
  values?: { id: string; name: string; slug: string; description: string; theme: string; sortOrder: number };
}) {
  const [state, action] = useActionState(saveCategory, {});
  const e = state.errors ?? {};
  return (
    <form action={action} key={values?.id ?? "new"} className="card space-y-3 bg-white p-5">
      <h2 className="font-display text-lg font-bold">{values ? "Edit kategori" : "Kategori baru"}</h2>
      {values && <input type="hidden" name="id" value={values.id} />}
      <div>
        <label className="label" htmlFor="c-name">Nama</label>
        <input id="c-name" name="name" defaultValue={values?.name} className="input bg-white" required />
        <FieldError message={e.name} />
      </div>
      <div>
        <label className="label" htmlFor="c-slug">Slug (opsional)</label>
        <input id="c-slug" name="slug" defaultValue={values?.slug} className="input bg-white" />
        <FieldError message={e.slug} />
      </div>
      <div>
        <label className="label" htmlFor="c-desc">Deskripsi</label>
        <input id="c-desc" name="description" defaultValue={values?.description} className="input bg-white" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="c-theme">Tema</label>
          <select id="c-theme" name="theme" defaultValue={values?.theme ?? "SUNSET"} className="input bg-white">
            {Object.entries(THEMES).map(([k, t]) => (
              <option key={k} value={k}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="c-sort">Urutan</label>
          <input id="c-sort" name="sortOrder" type="number" min={0} defaultValue={values?.sortOrder ?? 0} className="input bg-white" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <SubmitButton>Simpan</SubmitButton>
        {values && (
          <Link href="/admin/categories" className="btn-cream">
            Batal
          </Link>
        )}
      </div>
    </form>
  );
}

export function PromoForm({
  values,
}: {
  values?: {
    id: string;
    code: string;
    description: string;
    type: string;
    value: number;
    maxDiscount: string;
    active: boolean;
    expiresAt: string;
  };
}) {
  const [state, action] = useActionState(savePromo, {});
  const e = state.errors ?? {};
  return (
    <form action={action} key={values?.id ?? "new"} className="card space-y-3 bg-white p-5">
      <h2 className="font-display text-lg font-bold">{values ? "Edit promo" : "Promo baru"}</h2>
      {values && <input type="hidden" name="id" value={values.id} />}
      <div>
        <label className="label" htmlFor="p-code">Kode</label>
        <input id="p-code" name="code" defaultValue={values?.code} className="input bg-white uppercase" required />
        <FieldError message={e.code} />
      </div>
      <div>
        <label className="label" htmlFor="p-desc">Deskripsi</label>
        <input id="p-desc" name="description" defaultValue={values?.description} className="input bg-white" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="p-type">Tipe</label>
          <select id="p-type" name="type" defaultValue={values?.type ?? "PERCENT"} className="input bg-white">
            <option value="PERCENT">Persen (%)</option>
            <option value="FIXED">Nominal (Rp)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="p-value">Nilai</label>
          <input id="p-value" name="value" type="number" min={1} defaultValue={values?.value} className="input bg-white" required />
          <FieldError message={e.value} />
        </div>
        <div>
          <label className="label" htmlFor="p-max">Maks. diskon (Rp)</label>
          <input id="p-max" name="maxDiscount" type="number" min={0} defaultValue={values?.maxDiscount} className="input bg-white" />
        </div>
        <div>
          <label className="label" htmlFor="p-exp">Berlaku s/d</label>
          <input id="p-exp" name="expiresAt" type="date" defaultValue={values?.expiresAt} className="input bg-white" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={values?.active ?? true} className="size-4 accent-[#1a9c99]" /> Aktif
      </label>
      <div className="flex gap-2 pt-1">
        <SubmitButton>Simpan</SubmitButton>
        {values && (
          <Link href="/admin/promos" className="btn-cream">
            Batal
          </Link>
        )}
      </div>
    </form>
  );
}
