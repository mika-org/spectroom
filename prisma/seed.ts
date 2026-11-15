import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Theme } from "../src/generated/prisma/enums";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const wib = (s: string) => new Date(`${s}:00+07:00`);

const categories: { name: string; slug: string; theme: Theme; description: string }[] = [
  { name: "Konser", slug: "konser", theme: "SUNSET", description: "Musik live dari band & musisi favorit." },
  { name: "Komedi", slug: "komedi", theme: "GRAPE", description: "Stand up, sketsa, dan open mic yang bikin ngakak." },
  { name: "Festival", slug: "festival", theme: "OCEAN", description: "Festival musik, kuliner, dan budaya." },
  { name: "Olahraga", slug: "olahraga", theme: "FOREST", description: "Fun run, marathon, dan turnamen seru." },
  { name: "Teater", slug: "teater", theme: "NIGHT", description: "Pertunjukan teater & seni panggung." },
];

type SeedEvent = {
  title: string;
  category: string;
  theme: Theme;
  start: string;
  end?: string;
  venue: string;
  address: string;
  organizer: string;
  trending?: boolean;
  description: string;
  tickets: { name: string; description: string; price: number; quota: number; badge?: string }[];
};

const events: SeedEvent[] = [
  {
    title: "Jazz Night Bandung",
    category: "konser",
    theme: "SUNSET",
    start: "2026-12-12T19:00",
    end: "2026-12-12T22:00",
    venue: "Gedung Sabuga",
    address: "Jl. Tamansari No. 73",
    organizer: "Bandung Jazz Society",
    trending: true,
    description:
      "Malam jazz bersama musisi terbaik tanah air. Nikmati live music, area kuliner, dan suasana hangat di jantung kota Bandung.\nHadir dengan 6 penampil, panggung dengan tata suara terbaik, dan area makanan sepanjang acara. Pintu dibuka satu jam sebelum acara dimulai.",
    tickets: [
      { name: "Regular", description: "Tribun berdiri · 1 orang · Akses area umum · Free welcome snack", price: 150000, quota: 300 },
      { name: "VIP", description: "Kursi bernomor + welcome drink · Area VIP · Lounge eksklusif", price: 300000, quota: 100 },
      { name: "VVIP", description: "Meja depan panggung + meet & greet · Merchandise eksklusif", price: 500000, quota: 20, badge: "Hampir habis" },
    ],
  },
  {
    title: "Stand Up Comedy Tour",
    category: "komedi",
    theme: "GRAPE",
    start: "2026-11-27T19:30",
    end: "2026-11-27T22:00",
    venue: "Teater Kecil Dago",
    address: "Jl. Ir. H. Juanda No. 50",
    organizer: "Ketawa Bareng ID",
    description: "Tur stand up comedy dengan lima komika nasional. Siapkan perutmu untuk tertawa semalaman!",
    tickets: [
      { name: "Regular", description: "Kursi bebas", price: 120000, quota: 200 },
      { name: "Front Row", description: "Kursi 3 baris terdepan", price: 220000, quota: 40 },
    ],
  },
  {
    title: "Festival Musik Dago",
    category: "festival",
    theme: "OCEAN",
    start: "2026-12-20T14:00",
    end: "2026-12-20T23:00",
    venue: "Lapangan Dago Pakar",
    address: "Jl. Dago Pakar Raya",
    organizer: "Dago Creative Hub",
    description: "Festival musik outdoor dengan belasan band indie, area kuliner, dan instalasi seni di udara sejuk Dago.",
    tickets: [
      { name: "Daily Pass", description: "Akses festival 1 hari", price: 85000, quota: 1000 },
      { name: "Pass Premium", description: "Area depan panggung + merchandise", price: 175000, quota: 200 },
    ],
  },
  {
    title: "Fun Run Lembang 5K",
    category: "olahraga",
    theme: "FOREST",
    start: "2026-12-05T06:00",
    end: "2026-12-05T10:00",
    venue: "Taman Lembang",
    address: "Jl. Raya Lembang",
    organizer: "Lembang Runners",
    description: "Lari santai 5K melewati kebun dan perbukitan Lembang. Termasuk jersey, medali, dan sarapan.",
    tickets: [{ name: "Race Pack", description: "Jersey · BIB · Medali · Sarapan", price: 100000, quota: 500 }],
  },
  {
    title: "Pesta Kopi & Jazz",
    category: "festival",
    theme: "SAND",
    start: "2026-11-28T15:00",
    end: "2026-11-28T21:00",
    venue: "Taman Lembang",
    address: "Jl. Raya Lembang",
    organizer: "Bandung Jazz Society",
    description: "Cicipi kopi dari 30 roaster lokal sambil menikmati jazz akustik di sore hari.",
    tickets: [
      { name: "Regular", description: "Akses area + 2 voucher kopi", price: 90000, quota: 400 },
      { name: "Barista Class", description: "Termasuk kelas manual brew", price: 200000, quota: 30 },
    ],
  },
  {
    title: "Neon Nights Live",
    category: "konser",
    theme: "CORAL",
    start: "2026-12-18T20:00",
    end: "2026-12-18T23:30",
    venue: "Sasana Budaya Ganesha",
    address: "Jl. Tamansari No. 73",
    organizer: "Neon Nights",
    description: "Konser elektronik dengan tata cahaya neon spektakuler dan DJ tamu dari Jakarta.",
    tickets: [
      { name: "Festival", description: "Berdiri", price: 250000, quota: 600 },
      { name: "VIP", description: "Balkon + 1 minuman", price: 450000, quota: 80 },
    ],
  },
  {
    title: "Teater Sang Dalang",
    category: "teater",
    theme: "NIGHT",
    start: "2026-12-06T19:00",
    end: "2026-12-06T21:30",
    venue: "Gedung Rumentang Siang",
    address: "Jl. Baranangsiang No. 1",
    organizer: "Teater Kopi Hitam",
    description: "Pertunjukan teater kontemporer yang memadukan wayang dan musik modern.",
    tickets: [{ name: "Regular", description: "Kursi bebas", price: 120000, quota: 250 }],
  },
  {
    title: "Festival Lampion",
    category: "festival",
    theme: "CORAL",
    start: "2026-12-26T17:00",
    end: "2026-12-26T22:00",
    venue: "Lapangan Gasibu",
    address: "Jl. Diponegoro",
    organizer: "Kota Bandung Kreatif",
    description: "Ribuan lampion menerangi langit Gasibu, lengkap dengan bazar UMKM dan pertunjukan budaya.",
    tickets: [{ name: "Regular", description: "Termasuk 1 lampion", price: 75000, quota: 1500 }],
  },
  {
    title: "Open Mic Komedi Braga",
    category: "komedi",
    theme: "GRAPE",
    start: "2026-11-21T20:00",
    venue: "Braga Citywalk",
    address: "Jl. Braga No. 99",
    organizer: "Ketawa Bareng ID",
    description: "Malam open mic untuk komika muda Bandung. Siapa tahu kamu menemukan bintang berikutnya!",
    tickets: [{ name: "Regular", description: "Kursi bebas", price: 50000, quota: 120 }],
  },
  {
    title: "Bandung Night Run 10K",
    category: "olahraga",
    theme: "OCEAN",
    start: "2027-01-10T19:00",
    venue: "Gedung Sate",
    address: "Jl. Diponegoro No. 22",
    organizer: "Lembang Runners",
    description: "Lari malam 10K mengelilingi pusat kota Bandung dengan rute tertutup dan lampu kota.",
    tickets: [
      { name: "10K", description: "Jersey · BIB · Medali", price: 180000, quota: 800 },
      { name: "5K", description: "Jersey · BIB · Medali", price: 130000, quota: 600 },
    ],
  },
];

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("🧹 Mengosongkan data lama…");
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.favorite.deleteMany();
  await db.ticketType.deleteMany();
  await db.event.deleteMany();
  await db.organizer.deleteMany();
  await db.category.deleteMany();
  await db.promoCode.deleteMany();
  await db.subscriber.deleteMany();
  await db.user.deleteMany();

  console.log("👤 Membuat pengguna…");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@spectroom.id";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";
  await db.user.create({
    data: { name: "Admin SpectRoom", email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10), role: "ADMIN" },
  });
  const risky = await db.user.create({
    data: {
      name: "Risky Pratama",
      email: "risky@email.com",
      passwordHash: await bcrypt.hash("password123", 10),
      phone: "0812-3456-7890",
      city: "Bandung, Jawa Barat",
      birthDate: new Date("1998-03-14T00:00:00+07:00"),
      points: 1250,
    },
  });

  console.log("🗂️  Membuat kategori…");
  const cat: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const created = await db.category.create({ data: { ...c, sortOrder: i } });
    cat[c.slug] = created.id;
  }

  console.log("🎫 Membuat event…");
  const ev: Record<string, { id: string; tickets: Record<string, { id: string; price: number }> }> = {};
  for (const e of events) {
    const orgSlug = slug(e.organizer);
    const organizer = await db.organizer.upsert({
      where: { slug: orgSlug },
      create: { name: e.organizer, slug: orgSlug, verified: true },
      update: {},
    });
    const created = await db.event.create({
      data: {
        title: e.title,
        slug: slug(e.title),
        summary: e.description.split("\n")[0]!.slice(0, 180),
        description: e.description,
        terms: "Tiket yang sudah dibeli tidak dapat dikembalikan.\nTunjukkan QR tiket di pintu masuk.\nMaksimal 4 tiket per transaksi.\nDilarang membawa makanan & minuman dari luar.",
        venue: e.venue,
        address: e.address,
        city: "Bandung",
        startAt: wib(e.start),
        endAt: e.end ? wib(e.end) : null,
        theme: e.theme,
        isTrending: e.trending ?? false,
        categoryId: cat[e.category]!,
        organizerId: organizer.id,
        minPrice: Math.min(...e.tickets.map((t) => t.price)),
        ticketTypes: { create: e.tickets.map((t, i) => ({ ...t, sortOrder: i })) },
      },
      include: { ticketTypes: true },
    });
    ev[e.title] = {
      id: created.id,
      tickets: Object.fromEntries(created.ticketTypes.map((t) => [t.name, { id: t.id, price: t.price }])),
    };
  }

  console.log("🏷️  Membuat kode promo…");
  await db.promoCode.createMany({
    data: [
      { code: "MELUNCUR10", description: "Diskon 10% maks Rp50.000", type: "PERCENT", value: 10, maxDiscount: 50000 },
      { code: "HEMAT25K", description: "Potongan Rp25.000", type: "FIXED", value: 25000 },
    ],
  });

  console.log("🧾 Membuat pesanan contoh…");
  const sample: [string, string, number, "QRIS" | "BANK_TRANSFER" | "EWALLET", string][] = [
    ["Jazz Night Bandung", "Regular", 2, "QRIS", "SR-8K3QXM"],
    ["Festival Musik Dago", "Pass Premium", 1, "EWALLET", "SR-2NX7BD"],
    ["Neon Nights Live", "VIP", 1, "BANK_TRANSFER", "SR-9YQ2LM"],
  ];
  for (const [title, ticket, qty, method, code] of sample) {
    const e = ev[title]!;
    const t = e.tickets[ticket]!;
    const subtotal = t.price * qty;
    await db.order.create({
      data: {
        code,
        userId: risky.id,
        eventId: e.id,
        buyerName: risky.name,
        buyerEmail: risky.email,
        buyerPhone: risky.phone!,
        buyerCity: "Bandung",
        subtotal,
        serviceFee: 5000,
        total: subtotal + 5000,
        paymentMethod: method,
        status: "PAID",
        paidAt: new Date(),
        items: { create: { ticketTypeId: t.id, quantity: qty, unitPrice: t.price } },
      },
    });
    await db.ticketType.update({ where: { id: t.id }, data: { sold: { increment: qty } } });
  }
  for (const title of ["Stand Up Comedy Tour", "Festival Lampion", "Fun Run Lembang 5K", "Pesta Kopi & Jazz", "Teater Sang Dalang", "Open Mic Komedi Braga"]) {
    await db.favorite.create({ data: { userId: risky.id, eventId: ev[title]!.id } });
  }

  console.log(`✅ Selesai! Admin: ${adminEmail} / ${adminPassword} · User demo: risky@email.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
