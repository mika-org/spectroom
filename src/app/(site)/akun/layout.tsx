import { Planet } from "@/components/art";
import { AccountNav } from "@/components/account-nav";
import { requireUser } from "@/lib/auth";

export default async function AccountLayout({ children }: LayoutProps<"/akun">) {
  const user = await requireUser("/akun/tiket");
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="card h-fit p-4 lg:sticky lg:top-24">
        <div className="flex items-center gap-3 border-b-2 border-dashed border-ink/30 pb-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun">
            <Planet size={36} color="#ff7a59" ring="#ffd84d" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display font-bold">{user.name}</p>
            <p className="truncate text-xs text-ink/60">{user.email}</p>
          </div>
        </div>
        <AccountNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
