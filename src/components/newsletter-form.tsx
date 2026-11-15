"use client";

import { useActionState } from "react";
import { subscribe } from "@/actions/newsletter";
import { FieldError, FormMessage, SubmitButton } from "./ui";

export function NewsletterForm() {
  const [state, action] = useActionState(subscribe, {});
  return (
    <form action={action} className="mt-4 space-y-2">
      <div className="flex max-w-lg flex-col gap-3 sm:flex-row">
        <input name="email" type="email" required placeholder="Alamat email kamu" className="input flex-1" />
        <SubmitButton>Berlangganan</SubmitButton>
      </div>
      <FieldError message={state.errors?.email} />
      <div className="max-w-lg">
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
