"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/actions/favorites";

export function FavoriteButton({ eventId, initial }: { eventId: string; initial: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [fav, setFav] = useOptimistic(initial);

  return (
    <button
      type="button"
      aria-label={fav ? "Hapus dari favorit" : "Tambah ke favorit"}
      aria-pressed={fav}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          setFav(!fav);
          const res = await toggleFavorite(eventId);
          if (res.needLogin) router.push(`/masuk?next=${encodeURIComponent(window.location.pathname)}`);
        });
      }}
      className="grid size-8 place-items-center rounded-full border-2 border-ink bg-cream transition hover:scale-110"
    >
      <Heart size={15} className={fav ? "fill-coral text-coral" : "text-ink"} />
    </button>
  );
}
