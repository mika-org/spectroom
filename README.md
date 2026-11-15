# SpectRoom 🪐

Aplikasi tiket event (konser, komedi, festival, olahraga, teater) berdasarkan desain Figma **Spectroom**.

**Stack:** Next.js 16 (App Router, Server Actions) · PostgreSQL · Prisma 7 · Zod 4 · Tailwind CSS 4

## Fitur

**Pengguna**
- Beranda: hero, pencarian (kata kunci/kota/tanggal), banner trending, kategori, "Sedang Hangat", cara kerja, newsletter
- Jelajah: filter kategori, rentang harga, tanggal, lokasi, urutan, paginasi
- Detail event (tab deskripsi/syarat/lokasi, peta, penyelenggara, event lainnya) + pemilih tiket cepat
- Alur beli 3 langkah: **Pilih Tiket → Pembayaran (QRIS/Transfer/E-Wallet + kode promo) → Selesai**
- Akun: Tiket Saya (QR code, akan datang/riwayat), Event Favorit, Notifikasi, Pengaturan Profil
- Daftar / Masuk (bcrypt + cookie sesi JWT httpOnly)

**Admin (`/admin`)**
- Dashboard: pendapatan, tiket terjual, pesanan terbaru, event terlaris
- CRUD Event (beserta jenis tiket, kuota, badge, tema warna, trending)
- CRUD Kategori, Kode Promo
- Pesanan: cari/filter, detail, ubah status (batal/refund otomatis mengembalikan kuota)
- Pengguna: cari, jadikan/cabut admin

Semua input divalidasi dengan **Zod** di server (`src/lib/validations.ts`).

## Menjalankan

1. Siapkan PostgreSQL dan buat database, mis. `spectroom`.
2. Sesuaikan `DATABASE_URL` di `.env` (sudah disediakan; contoh lain di `.env.example`).
3. Install, migrasi, seed:

```bash
npm install
npm run db:deploy      # atau: npm run db:migrate (mode dev)
npm run db:seed
npm run dev
```

Buka http://localhost:3000

| Akun | Email | Password |
| --- | --- | --- |
| Admin | `admin@spectroom.id` (dari `ADMIN_EMAIL`) | `admin12345` (dari `ADMIN_PASSWORD`) |
| User demo | `risky@email.com` | `password123` |

Kode promo contoh: `MELUNCUR10` (10%, maks Rp50.000), `HEMAT25K` (potongan Rp25.000).

> ⚠️ `npm run db:seed` **mengosongkan** semua tabel sebelum mengisi data contoh. Jangan jalankan di production.

## Environment

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL |
| `AUTH_SECRET` | Secret penandatangan cookie sesi (wajib diganti di production) |
| `NEXT_PUBLIC_APP_URL` | URL publik aplikasi |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Akun admin yang dibuat oleh seed |
| `SERVICE_FEE` | Biaya layanan per transaksi (Rupiah) |

## Catatan

- **Pembayaran masih simulasi**: pesanan langsung berstatus `PAID` (lihat `src/actions/checkout.ts`). Untuk production, sambungkan ke payment gateway (Midtrans/Xendit) dan set status `PENDING` sampai webhook konfirmasi.
- Kuota tiket dikurangi secara atomik di dalam transaksi, maksimal 4 tiket per transaksi.
- Waktu event disimpan UTC dan ditampilkan dalam WIB.

## Struktur

```
prisma/              schema, migrasi, seed
src/actions/         server actions (auth, checkout, profil, favorit, admin)
src/app/(site)/      halaman publik & akun
src/app/admin/       panel admin
src/components/      komponen UI (planet/sunburst, kartu event, form, dll)
src/lib/             db, auth/sesi, validasi Zod, query, format
src/proxy.ts         proteksi route /akun, /admin, /checkout
```
