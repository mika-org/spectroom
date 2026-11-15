"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/jelajah", label: "Jelajah" },
  { href: "/kategori", label: "Kategori" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/bantuan", label: "Bantuan" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href) && !l.href.includes("#");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-1.5 font-display text-sm font-semibold transition ${
              active ? "text-sun underline decoration-2 underline-offset-8" : "text-white hover:text-sun"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
