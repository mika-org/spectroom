import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s]{8,20}$/, "Nomor HP tidak valid");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
    email: z.email("Email tidak valid").trim().toLowerCase(),
    password: z.string().min(8, "Kata sandi minimal 8 karakter").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Email tidak valid").trim().toLowerCase(),
  password: z.string().min(1, "Kata sandi wajib diisi"),
  next: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: z.email("Email tidak valid").trim().toLowerCase(),
  phone: z.union([phone, z.literal("")]).optional(),
  city: z.string().trim().max(80).optional(),
  birthDate: z.union([z.iso.date("Tanggal tidak valid"), z.literal("")]).optional(),
  password: z.union([z.string().min(8, "Kata sandi minimal 8 karakter"), z.literal("")]).optional(),
});

/** Item keranjang: id tipe tiket + jumlah */
export const cartItemSchema = z.object({
  ticketTypeId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(4),
});

export const MAX_TICKETS_PER_ORDER = 4;

export const checkoutSchema = z.object({
  eventId: z.string().min(1),
  items: z
    .array(cartItemSchema)
    .min(1, "Pilih minimal 1 tiket")
    .refine((items) => items.reduce((s, i) => s + i.quantity, 0) <= MAX_TICKETS_PER_ORDER, {
      message: `Maksimal ${MAX_TICKETS_PER_ORDER} tiket per transaksi`,
    }),
  buyerName: z.string().trim().min(2, "Nama lengkap wajib diisi").max(80),
  buyerEmail: z.email("Email tidak valid").trim().toLowerCase(),
  buyerPhone: phone,
  buyerCity: z.string().trim().min(2, "Kota wajib diisi").max(80),
  sendEmail: z.boolean().default(true),
  paymentMethod: z.enum(["QRIS", "BANK_TRANSFER", "EWALLET"], { message: "Pilih metode pembayaran" }),
  promoCode: z.string().trim().toUpperCase().max(30).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const subscribeSchema = z.object({
  email: z.email("Email tidak valid").trim().toLowerCase(),
});

/** Query halaman Jelajah */
export const exploreQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  kategori: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => [...new Set((v === undefined ? [] : Array.isArray(v) ? v : v.split(",")).filter(Boolean))])
    .catch([]),
  min: z.coerce.number().int().min(0).optional().catch(undefined),
  max: z.coerce.number().int().min(0).optional().catch(undefined),
  tanggal: z.enum(["minggu-ini", "bulan-ini"]).optional().catch(undefined),
  dari: z.iso.date().optional().catch(undefined),
  lokasi: z.string().trim().max(80).optional().catch(undefined),
  urut: z.enum(["populer", "terdekat", "termurah", "termahal"]).default("populer").catch("populer"),
  page: z.coerce.number().int().min(1).default(1).catch(1),
});

// ---------- Admin ----------

const themeEnum = z.enum(["SUNSET", "GRAPE", "OCEAN", "FOREST", "NIGHT", "CORAL", "SAND"]);

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(50),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]*$/, "Slug hanya huruf kecil, angka, dan tanda -")
    .optional(),
  description: z.string().trim().max(200).optional(),
  theme: themeEnum,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const ticketTypeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Nama tiket wajib diisi").max(50),
  description: z.string().trim().max(200).optional(),
  price: z.coerce.number().int().min(0, "Harga tidak boleh negatif"),
  quota: z.coerce.number().int().min(1, "Kuota minimal 1"),
  badge: z.string().trim().max(30).optional(),
});

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, "Judul minimal 3 karakter").max(120),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]*$/, "Slug hanya huruf kecil, angka, dan tanda -")
      .optional(),
    summary: z.string().trim().max(200).optional(),
    description: z.string().trim().min(10, "Deskripsi minimal 10 karakter"),
    terms: z.string().trim().optional(),
    venue: z.string().trim().min(2, "Nama tempat wajib diisi"),
    address: z.string().trim().min(2, "Alamat wajib diisi"),
    city: z.string().trim().min(2, "Kota wajib diisi"),
    startAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Tanggal mulai tidak valid"),
    endAt: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), z.literal("")]).optional(),
    theme: themeEnum,
    isTrending: z.boolean().default(false),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
    categoryId: z.string().min(1, "Pilih kategori"),
    organizerName: z.string().trim().max(80).optional(),
    ticketTypes: z.array(ticketTypeInputSchema).min(1, "Tambahkan minimal 1 jenis tiket"),
  })
  .refine((d) => !d.endAt || d.endAt > d.startAt, {
    message: "Waktu selesai harus setelah waktu mulai",
    path: ["endAt"],
  });

export const promoSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{3,30}$/, "Kode 3–30 huruf/angka tanpa spasi"),
    description: z.string().trim().max(120).optional(),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().int().min(1, "Nilai minimal 1"),
    maxDiscount: z.union([z.coerce.number().int().min(0), z.literal("")]).optional(),
    active: z.boolean().default(true),
    expiresAt: z.union([z.iso.date(), z.literal("")]).optional(),
  })
  .refine((d) => d.type !== "PERCENT" || d.value <= 100, {
    message: "Persentase maksimal 100",
    path: ["value"],
  });

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "CANCELLED", "REFUNDED"]),
});

export const userRoleSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]),
});

/** Ubah error Zod jadi { field: pesan } */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};
