"use client";

import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

export function SubmitButton({
  children,
  className = "btn-sun",
  pendingText = "Memproses…",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-700">{message}</p>;
}

export function FormMessage({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p
      className={`rounded-xl border-2 border-ink px-3 py-2 text-sm font-medium ${
        ok ? "bg-mint text-ink" : "bg-coral/20 text-red-800"
      }`}
    >
      {message}
    </p>
  );
}

export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Pilih Tiket", "Pembayaran", "Selesai"];
  return (
    <div className="mx-auto flex max-w-2xl items-start px-4 pt-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`grid size-9 place-items-center rounded-full border-2 border-ink font-display font-bold shadow-brutal-sm ${
                  done || active ? "bg-sun" : "bg-cream"
                }`}
              >
                {done ? <Check size={16} strokeWidth={3} /> : n}
              </span>
              <span className="text-xs font-semibold whitespace-nowrap text-white">{label}</span>
            </div>
            {n < steps.length && <div className={`mt-4 h-1 flex-1 ${done ? "bg-sun" : "bg-white/40"}`} />}
          </div>
        );
      })}
    </div>
  );
}
