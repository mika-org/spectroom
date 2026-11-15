import Link from "next/link";
import { Logo } from "./art";

const COLS = [
  {
    title: "Jelajah",
    links: [
      ["Konser", "/jelajah?kategori=konser"],
      ["Komedi", "/jelajah?kategori=komedi"],
      ["Festival", "/jelajah?kategori=festival"],
      ["Olahraga", "/jelajah?kategori=olahraga"],
    ],
  },
  {
    title: "Perusahaan",
    links: [
      ["Tentang Kami", "/bantuan#tentang"],
      ["Karier", "/bantuan#karier"],
      ["Blog", "/bantuan#blog"],
      ["Kontak", "/bantuan#kontak"],
    ],
  },
  {
    title: "Bantuan",
    links: [
      ["Cara Kerja", "/#cara-kerja"],
      ["FAQ", "/bantuan"],
      ["Syarat & Ketentuan", "/bantuan#syarat"],
      ["Kebijakan Privasi", "/bantuan#privasi"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-ink bg-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo className="text-3xl" />
          <p className="mt-3 max-w-xs text-sm text-white/70">
            Tiket event seru di Bandung dan sekitarnya. Pilih, bayar, lalu meluncur ke event favoritmu.
          </p>
          <div className="mt-4 flex gap-2">
            {["IG", "X", "YT"].map((s) => (
              <span key={s} className="grid size-8 place-items-center rounded-full border-2 border-ink bg-cream text-[10px] font-bold text-ink">
                {s}
              </span>
            ))}
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="font-display font-semibold text-sun">{col.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-sun">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 border-t border-white/15 px-4 py-5 text-xs text-white/60">
        <span>© {new Date().getFullYear()} SpectRoom. Semua hak dilindungi.</span>
        <span>
          Dibuat dengan <span className="text-coral">♥</span> di Bandung
        </span>
      </div>
    </footer>
  );
}
