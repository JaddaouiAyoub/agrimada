import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Modules natifs / volumineux chargés directement par Node côté serveur.
  serverExternalPackages: ["@node-rs/argon2", "exceljs"],
  // Site vitrine : photos servies en AVIF (puis WebP), 30 à 50 % plus légères que le JPEG.
  // Les images importées ont un nom unique par version : leur version optimisée peut être
  // gardée longtemps en cache sans risque d'afficher une ancienne photo.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    deviceSizes: [640, 828, 1080, 1280, 1920, 2560],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
