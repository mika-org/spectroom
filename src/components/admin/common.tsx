import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-ink/60">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-sun">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b-2 border-ink bg-cream-dark">
          <tr>
            {head.map((h, i) => (
              // Judul kolom bisa kosong/duplikat (kolom aksi), jadi pakai posisi sebagai key
              <th key={i} className="px-4 py-3 text-xs font-bold tracking-wider whitespace-nowrap uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">{children}</tbody>
      </table>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-mint",
  PUBLISHED: "bg-mint",
  PENDING: "bg-sun",
  DRAFT: "bg-sun",
  CANCELLED: "bg-coral text-white",
  REFUNDED: "bg-sky",
  ADMIN: "bg-grape text-white",
  USER: "bg-cream",
  AKTIF: "bg-mint",
  NONAKTIF: "bg-cream-dark",
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`inline-block rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[value] ?? "bg-cream"}`}>
      {label ?? value}
    </span>
  );
}

export function Alert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "ok" }) {
  return (
    <p className={`mb-4 rounded-xl border-2 border-ink px-4 py-2 text-sm font-medium ${tone === "ok" ? "bg-mint" : "bg-coral/25"}`}>
      {children}
    </p>
  );
}
