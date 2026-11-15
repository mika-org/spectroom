import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, Ticket } from "lucide-react";
import { Planet, Rocket, Sparkle, ThemeArt } from "@/components/art";
import { EventGrid } from "@/components/event-card";
import { SearchBar } from "@/components/search-bar";
import { NewsletterForm } from "@/components/newsletter-form";
import { SplashScreen } from "@/components/splash-screen";
import { getCities, getFavoriteIds, getHomeData } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { longDate, rupiah, shortDate, timeRange } from "@/lib/format";

function compact(n: number) {
  if (n >= 1000) return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n / 1000)}rb+`;
  return `${n}+`;
}

export default async function HomePage() {
  const [{ trending, hot, categories, stats }, cities, session] = await Promise.all([
    getHomeData(),
    getCities(),
    getSession(),
  ]);
  const favorites = await getFavoriteIds(session?.userId);
  const heroCards = hot.slice(0, 2);

  return (
    <>
      {/* Splash hanya di halaman depan, diputar setiap kali halaman ini dibuka */}
      <SplashScreen />

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="chip">
            <Sparkle size={9} color="#ffd84d" className="mr-1.5" /> Tiket event Bandung
          </span>
          <h1 className="heading mt-5 text-5xl leading-[1.05] md:text-6xl">
            Temukan event seru, meluncur bareng SpectRoom.
          </h1>
          <p className="mt-5 max-w-md text-white/90">
            Konser, komedi, festival, sampai fun run. Pilih tiket, bayar, dan langsung masuk dengan QR.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/jelajah" className="btn-sun">
              Jelajahi Event
            </Link>
            <Link href="/#cara-kerja" className="btn-cream">
              Cara Kerja
            </Link>
          </div>
          <dl className="mt-9 flex gap-10">
            {[
              [compact(stats.events), "Event seru"],
              [compact(stats.tickets), "Tiket terjual"],
              ["4,9", "Rating pengguna"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl font-bold text-sun text-outline">{v}</dt>
                <dd className="text-xs text-white/80">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto hidden h-[400px] w-full max-w-md lg:block">
          <Rocket size={48} className="absolute top-0 right-0 rotate-[25deg]" />
          <Sparkle size={18} color="#ffd84d" className="absolute top-10 left-6" />
          <Sparkle size={12} color="#fff" className="absolute right-10 bottom-16" />
          {heroCards.map((e, i) => (
            <Link
              key={e.id}
              href={`/event/${e.slug}`}
              className={`card absolute w-56 overflow-hidden transition hover:z-20 hover:scale-105 ${
                i === 0 ? "top-12 left-4 -rotate-8" : "top-2 right-12 z-10 rotate-6"
              }`}
            >
              <ThemeArt theme={e.theme} planetSize={i === 0 ? 70 : 100} className="h-72">
                <span className="chip absolute top-3 left-3">{e.category.name}</span>
                <div className="absolute inset-x-3 bottom-3">
                  <p className="heading text-xl leading-tight">{e.title}</p>
                  <p className="mt-1 text-xs font-semibold text-white">{shortDate(e.startAt)}</p>
                </div>
              </ThemeArt>
            </Link>
          ))}
          <Planet size={90} color="#ffd84d" ring="#ff7a59" className="absolute right-28 -bottom-2 z-30" />
          <Planet size={40} color="#ff7a59" ring="#ffd84d" className="absolute right-0 bottom-24" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <SearchBar cities={cities} />
      </div>

      {/* TRENDING */}
      {trending && (
        <section className="mx-auto max-w-6xl px-4 pt-12">
          <ThemeArt theme={trending.theme} planetSize={0} className="card relative min-h-56 overflow-hidden">
            <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-8 md:p-10">
              <span className="chip w-fit">Sedang trending</span>
              <h2 className="heading text-4xl md:text-5xl">{trending.title}</h2>
              <p className="font-semibold text-white">
                {longDate(trending.startAt)} · {timeRange(trending.startAt)} · {trending.venue}
              </p>
              <Link href={`/event/${trending.slug}`} className="btn-sun mt-2 w-fit">
                Beli Tiket
              </Link>
            </div>
            <div className="absolute top-1/2 right-8 hidden -translate-y-1/2 items-center gap-6 md:flex">
              <div className="grid size-28 rotate-[-8deg] place-items-center rounded-full border-2 border-ink bg-sun text-center shadow-brutal">
                <div>
                  <p className="text-[10px] font-bold uppercase">Mulai</p>
                  <p className="font-display text-xl font-bold">{rupiah(trending.minPrice).replace(".000", "rb")}</p>
                </div>
              </div>
              <Planet size={170} color="#ffd84d" ring="#ff7a59" />
            </div>
          </ThemeArt>
        </section>
      )}

      {/* KATEGORI */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="heading text-3xl">Jelajahi Kategori</h2>
        <p className="mt-1 text-sm text-white/85">Pilih jenis acara yang paling bikin kamu semangat.</p>
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.id} href={`/jelajah?kategori=${c.slug}`} className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-brutal-lg">
              <ThemeArt theme={c.theme} planetSize={60} className="h-24 border-b-2 border-ink" />
              <div className="px-3 py-2">
                <p className="font-display font-bold">{c.name}</p>
                <p className="text-[11px] text-ink/60">{c.eventCount} event</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEDANG HANGAT */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="flex items-end justify-between">
          <h2 className="heading text-3xl">Sedang Hangat</h2>
          <Link href="/jelajah" className="flex items-center gap-1 text-sm font-semibold text-sun hover:underline">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-6">
          {hot.length ? (
            <EventGrid events={hot} favorites={favorites} />
          ) : (
            <p className="card p-6 text-center">Belum ada event yang akan datang.</p>
          )}
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16">
        <div className="text-center">
          <h2 className="heading text-3xl">Cara Kerja</h2>
          <p className="mt-1 text-sm text-white/85">Tiga langkah mudah menuju event favoritmu.</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            [Search, "Pilih Event", "Cari event favoritmu berdasarkan kategori, lokasi, atau tanggal dari ratusan acara."],
            [Ticket, "Pilih Tiket", "Tentukan kategori dan jumlah tiket, lalu isi data pemesan dengan cepat."],
            [CheckCircle2, "Bayar & Masuk", "Bayar lewat QRIS, transfer, atau e-wallet. Tunjukkan QR di pintu masuk."],
          ].map(([Icon, title, desc], i) => {
            const I = Icon as typeof Search;
            return (
              <div key={title as string} className="card p-6">
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl border-2 border-ink bg-sun">
                    <I size={20} />
                  </span>
                  <span className="font-display text-4xl font-bold">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{title as string}</h3>
                <p className="mt-1 text-sm text-ink/70">{desc as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card relative overflow-hidden p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold">Jangan ketinggalan event seru</h2>
          <p className="mt-1 text-sm text-ink/70">Dapatkan info event dan promo tiket langsung di email kamu.</p>
          <NewsletterForm />
          <Planet size={120} color="#ff7a59" ring="#1a9c99" className="absolute top-6 right-8 hidden md:block" />
        </div>
      </section>
    </>
  );
}
