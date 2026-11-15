"use client";

import { useEffect, useState } from "react";
import { Logo, Planet, Rocket, Sparkle } from "./art";

/** Durasi (ms) tiap fase, mengikuti frame Figma "Splash (Awal)" → "Splash (Akhir)". */
const AWAL_MS = 700;
const AKHIR_MS = 1700;
const FADE_MS = 450;

type Phase = "awal" | "akhir" | "keluar" | "selesai";

/**
 * Splash screen halaman depan. Dipasang di `(site)/page.tsx` sehingga selalu diputar
 * setiap kali halaman depan dibuka (refresh maupun navigasi), dan tidak bisa dilewati.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("awal");

  useEffect(() => {
    document.documentElement.classList.add("splash-lock");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const awal = reduce ? 0 : AWAL_MS;
    const akhir = reduce ? 600 : AKHIR_MS;
    const timers = [
      window.setTimeout(() => setPhase("akhir"), awal),
      window.setTimeout(() => setPhase("keluar"), awal + akhir),
      window.setTimeout(() => setPhase("selesai"), awal + akhir + FADE_MS),
    ];
    return () => {
      timers.forEach(clearTimeout);
      document.documentElement.classList.remove("splash-lock");
    };
  }, []);

  useEffect(() => {
    if (phase === "keluar" || phase === "selesai") document.documentElement.classList.remove("splash-lock");
  }, [phase]);

  if (phase === "selesai") return null;
  const akhir = phase !== "awal";

  return (
    <div
      id="splash"
      role="status"
      aria-label="Memuat SpectRoom"
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-teal transition-opacity ease-out ${
        phase === "keluar" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* Sinar sunburst berputar pelan + bintang */}
      <div className="splash-rays absolute top-1/2 left-1/2 aspect-square w-[220vmax] -translate-x-1/2 -translate-y-1/2" />
      <div className="bg-space absolute inset-0 !bg-transparent" />

      {/* Planet-planet (sudah ada sejak fase Awal) */}
      <Planet size={130} color="#ffd84d" ring="#ff7a59" className="splash-float absolute top-[14%] right-[8%]" />
      <Planet size={70} color="#ff7a59" ring="#ffd84d" className="splash-float-alt absolute bottom-[16%] left-[10%]" />
      <Sparkle size={18} color="#ffd84d" className="splash-twinkle absolute top-[22%] left-[18%]" />
      <Sparkle size={14} color="#ffd84d" className="splash-twinkle absolute top-[48%] right-[22%] [animation-delay:.6s]" />
      <Sparkle size={12} color="#ffd84d" className="splash-twinkle absolute right-[30%] bottom-[22%] [animation-delay:1.1s]" />

      {/* Fase Akhir: roket, logo, tagline, loading bar */}
      <div className="relative flex flex-col items-center">
        <div
          className={`transition-all duration-700 ease-out ${akhir ? "translate-y-0 opacity-100" : "translate-y-[40vh] opacity-0"}`}
        >
          <Rocket size={56} className={akhir ? "splash-rocket" : ""} />
        </div>
        <div
          className={`mt-4 transition-all delay-200 duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] ${
            akhir ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <Logo className="h-20 md:h-32" priority />
        </div>
        <p
          className={`mt-3 font-display text-lg font-semibold text-white text-outline transition-opacity delay-500 duration-500 md:text-2xl ${
            akhir ? "opacity-100" : "opacity-0"
          }`}
        >
          Tiket event, siap meluncur!
        </p>
        <div
          className={`mt-6 h-3.5 w-48 overflow-hidden rounded-full border-2 border-ink bg-cream/40 shadow-brutal-sm transition-opacity delay-500 duration-300 md:w-64 ${
            akhir ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="h-full rounded-full bg-sun transition-[width] ease-in-out"
            style={{ width: akhir ? "100%" : "0%", transitionDuration: `${AKHIR_MS - 500}ms`, transitionDelay: "500ms" }}
          />
        </div>
      </div>
    </div>
  );
}
