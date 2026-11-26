/** @type {import('next').NextConfig} */
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Next.js 16 refuse les requêtes cross-origin vers les assets du serveur de
  // développement. Renseignez ALLOWED_DEV_ORIGINS (liste séparée par des
  // virgules) si vous ouvrez `next dev` via un reverse proxy ou un tunnel.
  ...(allowedDevOrigins.length ? { allowedDevOrigins } : {}),
};

module.exports = nextConfig;
