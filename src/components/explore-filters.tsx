"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { rupiah } from "@/lib/format";

type Props = {
  categories: { slug: string; name: string }[];
  cities: string[];
  query: {
    q?: string;
    kategori: string[];
    min?: number;
    max?: number;
    tanggal?: string;
    dari?: string;
    lokasi?: string;
    urut: string;
  };
};

const PRICE_MAX = 1_000_000;

export function ExploreFilters({ categories, cities, query }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [min, setMin] = useState(query.min ?? 0);
  const [max, setMax] = useState(query.max ?? PRICE_MAX);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} action="/jelajah" id="explore-filter" className="card h-fit space-y-5 p-5" onChange={(e) => {
      if ((e.target as unknown as HTMLInputElement).type !== "range") submit();
    }}>
      {query.q && <input type="hidden" name="q" value={query.q} />}
      <input type="hidden" name="urut" value={query.urut} />
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Filter</h2>
        <Link href="/jelajah" className="text-xs font-semibold text-teal-dark hover:underline">
          Reset
        </Link>
      </div>

      <fieldset>
        <legend className="mb-2 font-display font-semibold">Kategori</legend>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                name="kategori"
                value={c.slug}
                defaultChecked={query.kategori.includes(c.slug)}
                className="size-4 accent-[#ffd84d]"
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t-2 border-dashed border-ink/25 pt-4">
        <legend className="mb-2 pt-4 font-display font-semibold">Rentang Harga</legend>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={25_000}
            value={min}
            onChange={(e) => setMin(Math.min(Number(e.target.value), max))}
            onPointerUp={submit}
            onKeyUp={submit}
            className="w-full accent-[#1a9c99]"
            aria-label="Harga minimum"
          />
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={25_000}
            value={max}
            onChange={(e) => setMax(Math.max(Number(e.target.value), min))}
            onPointerUp={submit}
            onKeyUp={submit}
            className="w-full accent-[#1a9c99]"
            aria-label="Harga maksimum"
          />
          {min > 0 && <input type="hidden" name="min" value={min} />}
          {max < PRICE_MAX && <input type="hidden" name="max" value={max} />}
          <div className="flex justify-between text-xs text-ink/70">
            <span>{rupiah(min)}</span>
            <span>{max >= PRICE_MAX ? `${rupiah(PRICE_MAX)}+` : rupiah(max)}</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="border-t-2 border-dashed border-ink/25">
        <legend className="mb-2 pt-4 font-display font-semibold">Tanggal</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["", "Kapan saja"],
            ["minggu-ini", "Minggu ini"],
            ["bulan-ini", "Bulan ini"],
          ].map(([v, l]) => (
            <label key={v} className="cursor-pointer">
              <input type="radio" name="tanggal" value={v} defaultChecked={(query.tanggal ?? "") === v} className="peer sr-only" />
              <span className="inline-block rounded-full border-2 border-ink bg-cream px-3 py-1 text-xs font-semibold peer-checked:bg-sun peer-focus-visible:ring-2">
                {l}
              </span>
            </label>
          ))}
        </div>
        <input type="date" name="dari" defaultValue={query.dari} className="input mt-3 py-1.5" aria-label="Pilih tanggal" />
      </fieldset>

      <fieldset className="border-t-2 border-dashed border-ink/25">
        <legend className="mb-2 pt-4 font-display font-semibold">Lokasi</legend>
        <select name="lokasi" defaultValue={query.lokasi ?? ""} className="input py-2">
          <option value="">Semua kota</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </fieldset>
    </form>
  );
}

export function SortSelect({ value }: { value: string }) {
  return (
    <select
      defaultValue={value}
      onChange={(e) => {
        const form = document.getElementById("explore-filter") as HTMLFormElement | null;
        const hidden = form?.querySelector<HTMLInputElement>('input[type=hidden][name="urut"]');
        if (hidden) hidden.value = e.target.value;
        form?.requestSubmit();
      }}
      className="btn-cream cursor-pointer appearance-none pr-8 text-sm"
      aria-label="Urutkan"
    >
      <option value="populer">Urutkan: Terpopuler</option>
      <option value="terdekat">Urutkan: Terdekat</option>
      <option value="termurah">Urutkan: Termurah</option>
      <option value="termahal">Urutkan: Termahal</option>
    </select>
  );
}
