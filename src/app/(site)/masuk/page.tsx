import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Planet, Rocket } from "@/components/art";
import { LoginForm } from "@/components/auth-forms";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: PageProps<"/masuk">) {
  const { next } = await searchParams;
  if (await getSession()) redirect(typeof next === "string" && next.startsWith("/") ? next : "/akun/tiket");
  return (
    <div className="relative mx-auto max-w-md px-4 py-16">
      <Rocket size={44} className="absolute top-6 -right-6 rotate-[20deg]" />
      <Planet size={70} color="#ff7a59" ring="#ffd84d" className="absolute top-40 -left-16 hidden sm:block" />
      <div className="card p-8">
        <h1 className="font-display text-3xl font-bold">Selamat datang lagi!</h1>
        <p className="mt-1 mb-6 text-sm text-ink/70">Masuk untuk membeli tiket dan melihat tiketmu.</p>
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
    </div>
  );
}
