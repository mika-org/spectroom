import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./art";
import { getCurrentUser } from "@/lib/auth";
import { initials } from "@/lib/format";
import { NavLinks } from "./nav-links";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-teal-dark">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" aria-label="SpectRoom beranda">
          <Logo className="h-9" priority />
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/jelajah"
            aria-label="Cari event"
            className="grid size-9 place-items-center rounded-full border-2 border-ink bg-cream shadow-brutal-sm"
          >
            <Search size={16} />
          </Link>
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="btn-ink btn-sm hidden sm:inline-flex">
                  Admin
                </Link>
              )}
              <Link href="/akun/tiket" className="btn-cream btn-sm gap-2 pl-1.5">
                <span className="grid size-6 place-items-center rounded-full border-2 border-ink bg-sun text-[10px] font-bold">
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{user.name.split(" ")[0]}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/masuk" className="btn-cream btn-sm">
                Masuk
              </Link>
              <Link href="/daftar" className="btn-sun btn-sm hidden sm:inline-flex">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
