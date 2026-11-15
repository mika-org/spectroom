const TZ = "Asia/Jakarta";

export function rupiah(value: number) {
  return "Rp" + new Intl.NumberFormat("id-ID").format(value);
}

/** "Sabtu, 12 Des 2026" */
export function longDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(date);
}

/** "Sab, 12 Des 2026" */
export function shortDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(date);
}

/** "19.00" */
export function time(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(date);
}

export function timeRange(start: Date, end?: Date | null) {
  return end ? `${time(start)} – ${time(end)} WIB` : `${time(start)} WIB`;
}

export function dateTimeShort(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(date);
}

/** Nilai untuk <input type="datetime-local"> dalam zona WIB */
export function toDateTimeLocal(date: Date | null | undefined) {
  if (!date) return "";
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 16);
}

/** Parse nilai datetime-local (diasumsikan WIB) */
export function fromDateTimeLocal(value: string) {
  return new Date(`${value}:00+07:00`);
}

export function toDateInput(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Tanggal n hari dari sekarang (negatif = ke belakang) */
export function daysFromNow(days: number) {
  return new Date(Date.now() + days * 864e5);
}
