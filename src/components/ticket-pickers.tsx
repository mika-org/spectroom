"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Minus, Plus } from "lucide-react";
import { Planet } from "./art";
import { rupiah } from "@/lib/format";

export type PickerTicket = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  remaining: number;
  badge: string | null;
};

const MAX = 4;

function checkoutUrl(slug: string, qty: Record<string, number>) {
  const p = new URLSearchParams({ event: slug });
  for (const [id, q] of Object.entries(qty)) if (q > 0) p.append("item", `${id}:${q}`);
  return `/checkout?${p}`;
}

export function Counter({
  value,
  onChange,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label={`Jumlah ${label}`}>
      <button
        type="button"
        aria-label={`Kurangi ${label}`}
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
        className="grid size-8 place-items-center rounded-full border-2 border-ink bg-cream disabled:opacity-40"
      >
        <Minus size={14} strokeWidth={3} />
      </button>
      <span className="w-4 text-center font-display font-bold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Tambah ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid size-8 place-items-center rounded-full border-2 border-ink bg-sun disabled:opacity-40"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  );
}

/** Sidebar di halaman Detail Event: pilih 1 jenis tiket + jumlah */
export function QuickTicketPicker({ slug, tickets, disabled }: { slug: string; tickets: PickerTicket[]; disabled?: boolean }) {
  const router = useRouter();
  const first = tickets.find((t) => t.remaining > 0);
  const [selected, setSelected] = useState(first?.id ?? "");
  const [qty, setQty] = useState(first ? 1 : 0);
  const ticket = tickets.find((t) => t.id === selected);
  const max = Math.min(MAX, ticket?.remaining ?? 0);

  return (
    <div>
      <h3 className="mt-5 font-display font-bold">Pilih Tiket</h3>
      <div className="mt-2 space-y-2" role="radiogroup">
        {tickets.map((t) => {
          const soldOut = t.remaining <= 0;
          return (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-ink px-3 py-2.5 text-sm ${
                selected === t.id ? "bg-sun/50" : "bg-cream"
              } ${soldOut ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <input
                type="radio"
                name="ticket"
                value={t.id}
                checked={selected === t.id}
                disabled={soldOut || disabled}
                onChange={() => {
                  setSelected(t.id);
                  setQty((q) => Math.max(1, Math.min(q, t.remaining, MAX)));
                }}
                className="size-4 accent-[#ff7a59]"
              />
              <span className="flex-1 font-semibold">
                {t.name}
                {(t.badge || soldOut) && (
                  <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                    {soldOut ? "Habis" : t.badge}
                  </span>
                )}
              </span>
              <span className="font-display font-bold text-teal-dark">{rupiah(t.price)}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold">Jumlah</span>
        <Counter value={qty} onChange={(v) => setQty(Math.max(1, v))} max={max} label="tiket" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-ink/30 pt-4">
        <span className="font-semibold">Total</span>
        <span className="font-display text-2xl font-bold text-teal-dark">{rupiah((ticket?.price ?? 0) * qty)}</span>
      </div>
      <button
        type="button"
        disabled={!ticket || qty < 1 || disabled}
        onClick={() => router.push(checkoutUrl(slug, { [selected]: qty }))}
        className="btn-sun mt-4 w-full py-3 text-lg"
      >
        {disabled ? "Penjualan ditutup" : "Beli Tiket"}
      </button>
    </div>
  );
}

/** Halaman Pilih Tiket: banyak jenis tiket sekaligus */
export function TicketSelector({
  slug,
  tickets,
  event,
}: {
  slug: string;
  tickets: PickerTicket[];
  event: { title: string; dateLabel: string; venue: string; planet: string; gradient: string };
}) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>({});
  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0);
  const total = useMemo(() => tickets.reduce((s, t) => s + t.price * (qty[t.id] ?? 0), 0), [qty, tickets]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="heading text-3xl">Pilih Kategori Tiket</h1>
        <div className="mt-5 space-y-4">
          {tickets.map((t) => {
            const q = qty[t.id] ?? 0;
            const soldOut = t.remaining <= 0;
            return (
              <div key={t.id} className={`card flex overflow-hidden ${q > 0 ? "bg-cream-dark" : ""} ${soldOut ? "opacity-60" : ""}`}>
                <div className="sunburst grid w-24 shrink-0 place-items-center border-r-2 border-ink sm:w-28" style={{ background: event.gradient }}>
                  <Planet size={64} color={event.planet} />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold">{t.name}</h2>
                    {(t.badge || soldOut) && (
                      <span className="rounded-full border-2 border-ink bg-coral px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                        {soldOut ? "Habis" : t.badge}
                      </span>
                    )}
                  </div>
                  {t.description && <p className="mt-0.5 text-xs text-ink/70">{t.description}</p>}
                  <p className="mt-1 font-display text-lg font-bold text-teal-dark">{rupiah(t.price)}</p>
                  <p className="text-[11px] text-ink/50">Sisa {t.remaining} tiket</p>
                </div>
                <div className="grid place-items-center border-l-2 border-dashed border-ink px-4 sm:px-6">
                  <Counter
                    value={q}
                    label={t.name}
                    max={Math.min(t.remaining, q + (MAX - totalQty))}
                    onChange={(v) => setQty((s) => ({ ...s, [t.id]: Math.max(0, v) }))}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-white/85">
          <Info size={14} /> Maksimal {MAX} tiket per transaksi. Tiket tidak dapat dikembalikan.
        </p>
      </div>

      <aside className="card h-fit p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-bold">Ringkasan Pesanan</h2>
        <div className="mt-4 flex gap-3">
          <div className="sunburst grid size-14 shrink-0 place-items-center rounded-xl border-2 border-ink" style={{ background: event.gradient }}>
            <Planet size={36} color={event.planet} />
          </div>
          <div>
            <p className="font-display font-bold">{event.title}</p>
            <p className="text-xs text-ink/70">{event.dateLabel}</p>
            <p className="text-xs text-ink/70">{event.venue}</p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5 border-t-2 border-dashed border-ink/30 pt-4 text-sm">
          {tickets
            .filter((t) => (qty[t.id] ?? 0) > 0)
            .map((t) => (
              <div key={t.id} className="flex justify-between">
                <span>
                  {qty[t.id]}× {t.name}
                </span>
                <span className="font-semibold">{rupiah(t.price * qty[t.id]!)}</span>
              </div>
            ))}
          {totalQty === 0 && <p className="text-ink/50">Belum ada tiket dipilih</p>}
        </div>
        <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-ink/30 pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-display text-2xl font-bold text-teal-dark">{rupiah(total)}</span>
        </div>
        <button
          type="button"
          disabled={totalQty === 0}
          onClick={() => router.push(checkoutUrl(slug, qty))}
          className="btn-sun mt-4 w-full py-3 text-lg"
        >
          Lanjutkan
        </button>
        <p className="mt-3 text-center text-[11px] text-ink/60">Pembayaran aman · Tiket langsung terbit</p>
      </aside>
    </div>
  );
}
