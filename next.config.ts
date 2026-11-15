import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components dimatikan: halaman membaca DB & cookie sesi secara dinamis
  // (model caching klasik Next.js).
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
