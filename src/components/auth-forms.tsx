"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, register } from "@/actions/auth";
import { FieldError, FormMessage, SubmitButton } from "./ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        <FieldError message={state.errors?.email} />
      </div>
      <div>
        <label className="label" htmlFor="password">Kata sandi</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
        <FieldError message={state.errors?.password} />
      </div>
      <FormMessage message={state.message} />
      <SubmitButton className="btn-sun w-full py-3">Masuk</SubmitButton>
      <p className="text-center text-sm">
        Belum punya akun?{" "}
        <Link href={next ? `/daftar?next=${encodeURIComponent(next)}` : "/daftar"} className="font-semibold text-teal-dark underline">
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(register, {});
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label className="label" htmlFor="name">Nama lengkap</label>
        <input id="name" name="name" autoComplete="name" required className="input" />
        <FieldError message={state.errors?.name} />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        <FieldError message={state.errors?.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="password">Kata sandi</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required className="input" />
          <FieldError message={state.errors?.password} />
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">Ulangi kata sandi</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="input" />
          <FieldError message={state.errors?.confirmPassword} />
        </div>
      </div>
      <FormMessage message={state.message} />
      <SubmitButton className="btn-sun w-full py-3">Daftar</SubmitButton>
      <p className="text-center text-sm">
        Sudah punya akun?{" "}
        <Link href={next ? `/masuk?next=${encodeURIComponent(next)}` : "/masuk"} className="font-semibold text-teal-dark underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
