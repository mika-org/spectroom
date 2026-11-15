import type { Theme } from "@/generated/prisma/enums";
import { themeStyle } from "@/lib/themes";

/** Planet bercincin bergaya kartun (outline hitam tebal) */
export function Planet({
  color = "#ffd84d",
  ring = "#ff7a59",
  size = 80,
  className = "",
}: {
  color?: string;
  ring?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 100 72" className={className} aria-hidden>
      <ellipse cx="50" cy="40" rx="46" ry="12" fill="none" stroke="#1b1b1f" strokeWidth="7" transform="rotate(-12 50 40)" />
      <ellipse cx="50" cy="40" rx="46" ry="12" fill="none" stroke={ring} strokeWidth="3.5" transform="rotate(-12 50 40)" />
      <circle cx="50" cy="36" r="26" fill={color} stroke="#1b1b1f" strokeWidth="3.5" />
      <path d="M30 30 Q50 24 70 30" fill="none" stroke="#1b1b1f" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
      <path d="M27 40 Q50 34 73 40" fill="none" stroke="#1b1b1f" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
      <circle cx="41" cy="25" r="4" fill="#fff" opacity=".55" />
      <path
        d="M12 46 Q50 60 88 34"
        fill="none"
        stroke="#1b1b1f"
        strokeWidth="7"
        strokeLinecap="round"
        transform="rotate(-2 50 40)"
      />
      <path d="M12 46 Q50 60 88 34" fill="none" stroke={ring} strokeWidth="3.5" strokeLinecap="round" transform="rotate(-2 50 40)" />
    </svg>
  );
}

export function Sparkle({ size = 14, className = "", color = "#1b1b1f" }: { size?: number; className?: string; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={color} />
    </svg>
  );
}

export function Rocket({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 40 60" className={className} aria-hidden>
      <path d="M14 46 L20 58 L26 46 Z" fill="#ff7a59" stroke="#1b1b1f" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 2 C30 12 30 30 27 44 H13 C10 30 10 12 20 2 Z" fill="#fff5d9" stroke="#1b1b1f" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M13 30 L5 42 L13 42 Z M27 30 L35 42 L27 42 Z" fill="#ff7a59" stroke="#1b1b1f" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="5" fill="#9ad7f5" stroke="#1b1b1f" strokeWidth="2.5" />
    </svg>
  );
}

/** Area bergradasi tema + efek sunburst + planet di tengah */
export function ThemeArt({
  theme,
  planetSize = 90,
  className = "",
  children,
}: {
  theme: Theme;
  planetSize?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const t = themeStyle(theme);
  return (
    <div className={`sunburst ${className}`} style={{ background: t.gradient }}>
      {planetSize > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Planet color={t.planet} ring={t.ring} size={planetSize} />
        </div>
      )}
      {children}
    </div>
  );
}

export function Logo({ className = "text-2xl" }: { className?: string }) {
  return <span className={`logo-text leading-none ${className}`}>SpectRoom</span>;
}
