"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, LogOut, Ticket, UserRound } from "lucide-react";
import { logout } from "@/actions/auth";

const ITEMS = [
  { href: "/akun/tiket", label: "Tiket Saya", icon: Ticket },
  { href: "/akun/favorit", label: "Event Favorit", icon: Heart },
  { href: "/akun/notifikasi", label: "Notifikasi", icon: Bell },
  { href: "/akun/profil", label: "Pengaturan Profil", icon: UserRound },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-4 space-y-1.5">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
              active ? "border-ink bg-sun shadow-brutal-sm" : "border-transparent hover:bg-cream-dark"
            }`}
          >
            <Icon size={16} /> {label}
          </Link>
        );
      })}
      <form action={logout}>
        <button className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2 text-sm font-semibold hover:bg-cream-dark">
          <LogOut size={16} /> Keluar
        </button>
      </form>
    </nav>
  );
}
