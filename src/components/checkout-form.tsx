"use client";

import { useState, useTransition } from "react";
import { placeOrder, checkPromo } from "@/actions/checkout";
import { Planet } from "./art";
import { FieldError, FormMessage } from "./ui";
import { rupiah } from "@/lib/format";
import type { ActionState } from "@/lib/validations";

type Item = { ticketTypeId: string; name: string; quantity: number; price: number };

const METHODS = [
  { id: "QRIS", code: "QR", label: "QRIS", desc: "Scan & bayar instan dari semua aplikasi", color: "bg-sun" },
  { id: "BANK_TRANSFER", code: "TF", label: "Transfer Bank", desc: "BCA, Mandiri, BNI, BRI", color: "bg-[#c9b8ff]" },
  { id: "EWALLET", code: "EW", label: "E-Wallet", desc: "GoPay, OVO, DANA, ShopeePay", color: "bg-sky" },
] as const;

export function CheckoutForm({
  event,
  items,
  fee,
  buyer,
}: {
  event: { id: string; title: string; dateLabel: string; venue: string; gradient: string; planet: string };
  items: Item[];
  fee: number;
  buyer: { name: string; email: string; phone: string; city: string };
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ActionState>({});
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("QRIS");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [checkingPromo, startPromo] = useTransition();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promo?.discount ?? 0;
  const total = subtotal + fee - discount;
  const err = state.errors ?? {};

  function submit(formData: FormData) {
    start(async () => {
      const res = await placeOrder({
        eventId: event.id,
        items: items.map(({ ticketTypeId, quantity }) => ({ ticketTypeId, quantity })),
        buyerName: String(formData.get("buyerName") ?? ""),
        buyerEmail: String(formData.get("buyerEmail") ?? ""),
        buyerPhone: String(formData.get("buyerPhone") ?? ""),
        buyerCity: String(formData.get("buyerCity") ?? ""),
        sendEmail: formData.get("sendEmail") === "on",
        paymentMethod: method,
        promoCode: promo?.code,
      });
      if (res) setState(res);
    });
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1fr_360px]"
      onSubmit={(ev) => {
        ev.preventDefault();
        submit(new FormData(ev.currentTarget));
      }}
    >
      <div className="space-y-8">
        <section>
          <h2 className="heading text-3xl">Data Pemesan</h2>
          <div className="card mt-4 grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="buyerName">Nama lengkap</label>
              <input id="buyerName" name="buyerName" defaultValue={buyer.name} className="input" required />
              <FieldError message={err.buyerName} />
            </div>
            <div>
              <label className="label" htmlFor="buyerEmail">Email</label>
              <input id="buyerEmail" name="buyerEmail" type="email" defaultValue={buyer.email} className="input" required />
              <FieldError message={err.buyerEmail} />
            </div>
            <div>
              <label className="label" htmlFor="buyerPhone">No. HP</label>
              <input id="buyerPhone" name="buyerPhone" defaultValue={buyer.phone} placeholder="0812-3456-7890" className="input" required />
              <FieldError message={err.buyerPhone} />
            </div>
            <div>
              <label className="label" htmlFor="buyerCity">Kota</label>
              <input id="buyerCity" name="buyerCity" defaultValue={buyer.city} placeholder="Bandung" className="input" required />
              <FieldError message={err.buyerCity} />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="sendEmail" defaultChecked className="size-4 accent-[#ffd84d]" />
              Kirim e-tiket ke email ini
            </label>
          </div>
        </section>

        <section>
          <h2 className="heading text-3xl">Metode Pembayaran</h2>
          <div className="card mt-4 overflow-hidden" role="radiogroup">
            {METHODS.map((m, i) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-4 px-5 py-4 ${i > 0 ? "border-t-2 border-dashed border-ink/30" : ""} ${
                  method === m.id ? "bg-sun/40" : ""
                }`}
              >
                <span className={`grid size-10 place-items-center rounded-lg border-2 border-ink text-xs font-bold ${m.color}`}>{m.code}</span>
                <span className="flex-1">
                  <span className="block font-display font-bold">{m.label}</span>
                  <span className="text-xs text-ink/60">{m.desc}</span>
                </span>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.id}
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                  className="size-5 accent-[#ff7a59]"
                />
              </label>
            ))}
          </div>
          <FieldError message={err.paymentMethod} />
        </section>

        <section>
          <h2 className="heading text-3xl">Kode Promo</h2>
          <div className="card mt-4 flex gap-3 p-4">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Masukkan kode promo"
              className="input flex-1"
              aria-label="Kode promo"
            />
            {promo ? (
              <button type="button" className="btn-cream" onClick={() => { setPromo(null); setPromoInput(""); }}>
                Hapus
              </button>
            ) : (
              <button
                type="button"
                className="btn-sun"
                disabled={!promoInput || checkingPromo}
                onClick={() =>
                  startPromo(async () => {
                    const res = await checkPromo(promoInput, subtotal);
                    if (res.ok) {
                      setPromo({ code: promoInput, discount: res.discount, message: res.message });
                      setPromoError("");
                    } else setPromoError(res.message ?? "Kode promo tidak valid");
                  })
                }
              >
                {checkingPromo ? "Cek…" : "Pakai"}
              </button>
            )}
          </div>
          {promo && <p className="mt-2 text-sm font-semibold text-sun">{promo.message}</p>}
          {promoError && <p className="mt-2 text-sm font-semibold text-white">⚠ {promoError}</p>}
        </section>
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
          {items.map((i) => (
            <div key={i.ticketTypeId} className="flex justify-between">
              <span>
                {i.quantity}× {i.name}
              </span>
              <span className="font-semibold">{rupiah(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Biaya layanan</span>
            <span className="font-semibold">{rupiah(fee)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-teal-dark">
              <span>Diskon ({promo?.code})</span>
              <span className="font-semibold">−{rupiah(discount)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-ink/30 pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-display text-2xl font-bold text-teal-dark">{rupiah(total)}</span>
        </div>
        {state.message && (
          <div className="mt-4">
            <FormMessage message={state.message} />
          </div>
        )}
        {(err.items || err._form) && <FieldError message={err.items || err._form} />}
        <button type="submit" disabled={pending} className="btn-sun mt-4 w-full py-3 text-lg">
          {pending ? "Memproses pembayaran…" : "Bayar"}
        </button>
        <p className="mt-3 text-center text-[11px] text-ink/60">Pembayaran aman · Tiket langsung terbit</p>
      </aside>
    </form>
  );
}
