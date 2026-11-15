"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      aria-label="Bagikan"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) await navigator.share({ title, url }).catch(() => {});
        else await navigator.clipboard?.writeText(url);
      }}
      className="grid size-8 place-items-center rounded-full border-2 border-ink bg-cream transition hover:scale-110"
    >
      <Share2 size={15} />
    </button>
  );
}
