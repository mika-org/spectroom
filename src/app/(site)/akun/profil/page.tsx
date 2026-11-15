import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toDateInput } from "@/lib/format";

export const metadata: Metadata = { title: "Pengaturan Profil" };

export default async function ProfilePage() {
  const user = await requireUser("/akun/profil");
  const [activeTickets, favorites] = await Promise.all([
    db.orderItem.aggregate({
      _sum: { quantity: true },
      where: { order: { userId: user.id, status: "PAID", event: { startAt: { gte: new Date() } } } },
    }),
    db.favorite.count({ where: { userId: user.id } }),
  ]);
  const stats = [
    [activeTickets._sum.quantity ?? 0, "Tiket aktif"],
    [favorites, "Event favorit"],
    [new Intl.NumberFormat("id-ID").format(user.points), "Poin SpectRoom"],
  ];

  return (
    <div>
      <h1 className="heading text-4xl">Pengaturan Profil</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map(([v, l]) => (
          <div key={l} className="card p-4">
            <p className="font-display text-3xl font-bold text-teal-dark">{v}</p>
            <p className="text-xs text-ink/60">{l}</p>
          </div>
        ))}
      </div>
      <ProfileForm
        name={user.name}
        email={user.email}
        phone={user.phone ?? ""}
        city={user.city ?? ""}
        birthDate={toDateInput(user.birthDate)}
      />
    </div>
  );
}
