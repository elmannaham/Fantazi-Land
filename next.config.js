/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" produces a lean, self-contained server for the Docker/Base44
  // target (see Dockerfile). It is NOT compatible with Vercel's own build
  // pipeline — it breaks Vercel's trace-file generation and every deploy
  // fails with "ENOENT .next/next-server.js.nft.json". Vercel sets the
  // VERCEL env var automatically during its builds, so skip it there.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  serverExternalPackages: ["@prisma/client", "prisma"],
  allowedDevOrigins: process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? ["3000-" + process.env.BASE44_PUBLIC_HOST_SUFFIX]
    : [],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 heures de cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "uytihmscyjpwpdhqvnbw.storage.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "commondatastorage.googleapis.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Optimisations de headers pour le caching d'images & assets statiques
  async headers() {
    return [
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)\\.(ico|png|svg|jpg|jpeg|webp|avif|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
