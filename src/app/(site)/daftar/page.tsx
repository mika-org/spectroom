import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Planet } from "@/components/art";
import { RegisterForm } from "@/components/auth-forms";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage({ searchParams }: PageProps<"/daftar">) {
  const { next } = await searchParams;
  if (await getSession()) redirect("/akun/tiket");
  return (
    <div className="relative mx-auto max-w-lg px-4 py-16">
      <Planet size={80} color="#ffd84d" className="absolute top-4 -right-10 hidden sm:block" />
      <div className="card p-8">
        <h1 className="font-display text-3xl font-bold">Buat akun SpectRoom</h1>
        <p className="mt-1 mb-6 text-sm text-ink/70">Gratis, cuma butuh satu menit.</p>
        <RegisterForm next={typeof next === "string" ? next : undefined} />
      </div>
    </div>
  );
}
