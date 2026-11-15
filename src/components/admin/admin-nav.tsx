"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, LogOut, Receipt, Shapes, TicketPercent, Users } from "lucide-react";
import { logout } from "@/actions/auth";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Event", icon: CalendarDays },
  { href: "/admin/categories", label: "Kategori", icon: Shapes },
  { href: "/admin/orders", label: "Pesanan", icon: Receipt },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/promos", label: "Kode Promo", icon: TicketPercent },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
              active ? "border-ink bg-sun text-ink shadow-brutal-sm" : "border-transparent text-white/85 hover:bg-white/10"
            }`}
          >
            <Icon size={16} /> {label}
          </Link>
        );
      })}
      <form action={logout} className="shrink-0">
        <button className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10">
          <LogOut size={16} /> Keluar
        </button>
      </form>
    </nav>
  );
}
