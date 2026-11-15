import { CalendarDays, MapPin, Search } from "lucide-react";

export function SearchBar({ cities }: { cities: string[] }) {
  return (
    <form action="/jelajah" className="card grid gap-3 p-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center md:gap-0 md:p-2">
      <label className="flex items-center gap-3 px-3 md:border-r-2 md:border-ink/15">
        <Search size={18} className="shrink-0 text-teal-dark" />
        <span className="flex-1">
          <span className="block text-[10px] text-ink/60">Cari event</span>
          <input name="q" placeholder="Konser, komedi, festival…" className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-ink/50" />
        </span>
      </label>
      <label className="flex items-center gap-3 px-3 md:border-r-2 md:border-ink/15">
        <MapPin size={18} className="shrink-0 text-teal-dark" />
        <span className="flex-1">
          <span className="block text-[10px] text-ink/60">Lokasi</span>
          <select name="lokasi" defaultValue="" className="w-full bg-transparent text-sm font-semibold outline-none">
            <option value="">Semua kota</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </span>
      </label>
      <label className="flex items-center gap-3 px-3">
        <CalendarDays size={18} className="shrink-0 text-teal-dark" />
        <span className="flex-1">
          <span className="block text-[10px] text-ink/60">Tanggal</span>
          <input type="date" name="dari" className="w-full bg-transparent text-sm font-semibold outline-none" />
        </span>
      </label>
      <button type="submit" className="btn-sun">
        Cari Event
      </button>
    </form>
  );
}
