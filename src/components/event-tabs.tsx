"use client";

import { useState } from "react";

export function EventTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div className="flex gap-6 border-b-2 border-white/25" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`-mb-0.5 border-b-2 pb-2 font-display text-sm font-semibold transition ${
              active === t.id ? "border-sun text-sun" : "border-transparent text-white hover:text-sun"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-6" role="tabpanel">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
