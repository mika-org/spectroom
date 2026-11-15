import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/art";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { initials } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin SpectRoom" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b-2 border-ink bg-deep text-white lg:sticky lg:top-0 lg:h-screen lg:border-r-2 lg:border-b-0">
        <div className="flex items-center justify-between p-5">
          <Link href="/admin" className="flex items-baseline gap-2">
            <Logo className="text-2xl" />
            <span className="rounded bg-sun px-1.5 text-[10px] font-bold text-ink">ADMIN</span>
          </Link>
        </div>
        <AdminNav />
        <div className="hidden border-t border-white/15 p-5 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border-2 border-ink bg-sun text-xs font-bold text-ink">
              {initials(admin.name)}
            </span>
            <div className="min-w-0 text-sm">
              <p className="truncate font-semibold">{admin.name}</p>
              <p className="truncate text-xs text-white/60">{admin.email}</p>
            </div>
          </div>
          <Link href="/" className="mt-3 block text-xs text-sun hover:underline">
            ← Lihat situs
          </Link>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-8">{children}</main>
    </div>
  );
}
