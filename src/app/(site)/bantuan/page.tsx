import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bantuan" };

const FAQ = [
  ["Bagaimana cara membeli tiket?", "Pilih event, tentukan jenis & jumlah tiket, isi data pemesan, lalu bayar. Tiket langsung muncul di menu Tiket Saya."],
  ["Metode pembayaran apa saja yang tersedia?", "QRIS, transfer bank (BCA, Mandiri, BNI, BRI), dan e-wallet (GoPay, OVO, DANA, ShopeePay)."],
  ["Berapa maksimal tiket per transaksi?", "Maksimal 4 tiket per transaksi agar semua penjelajah kebagian."],
  ["Apakah tiket bisa dikembalikan?", "Tiket tidak dapat dikembalikan kecuali event dibatalkan oleh penyelenggara."],
  ["Bagaimana cara masuk ke venue?", "Tunjukkan QR code di menu Tiket Saya kepada petugas di pintu masuk."],
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="heading text-4xl">Pusat Bantuan</h1>
      <p className="mt-1 text-white/85">Pertanyaan yang sering ditanyakan penjelajah SpectRoom.</p>
      <div className="mt-8 space-y-4">
        {FAQ.map(([q, a]) => (
          <details key={q} className="card group p-5">
            <summary className="cursor-pointer list-none font-display text-lg font-bold">
              <span className="mr-2 inline-block transition group-open:rotate-90">›</span>
              {q}
            </summary>
            <p className="mt-2 pl-5 text-sm text-ink/75">{a}</p>
          </details>
        ))}
      </div>
      <div id="kontak" className="card mt-10 p-6">
        <h2 className="font-display text-xl font-bold">Masih butuh bantuan?</h2>
        <p className="mt-1 text-sm text-ink/70">Hubungi tim kami di halo@spectroom.id atau WhatsApp 0812-0000-0000 (09.00–21.00 WIB).</p>
      </div>
    </div>
  );
}
