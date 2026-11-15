import Link from "next/link";
import { Planet } from "@/components/art";

export default function NotFound() {
  return (
    <div className="bg-space flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-10 text-center">
        <Planet size={110} className="mx-auto" />
        <h1 className="mt-4 font-display text-4xl font-bold">404</h1>
        <p className="mt-1 text-ink/70">Halaman ini tersesat di luar angkasa.</p>
        <Link href="/" className="btn-sun mt-6">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
