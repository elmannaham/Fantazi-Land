# AGENTS.md — Base44 Dev Environment

## Overview
Next.js 16 app (Turbopack) for a booking platform ("Fantazi-Land"). Uses Prisma + PostgreSQL for data, Supabase for auth/storage.

## Running the app
```bash
docker compose -f docker-compose.base44.yml up -d
```
- **DB**: `postgres:16-alpine` service named `db` (user/pass: postgres/postgres, db: fantazi_land)
- **App**: `node:22-slim` with source bind-mounted at `/app`, runs `next dev` on port 3000
- On first boot the app container auto-runs: `npm install` → `prisma db push` → `tsx prisma/seed.ts` → `next dev`
- Seed is idempotent (deletes existing profiles first), safe on every restart

## Environment
- `.env.base44-defaults` — local dev placeholders (local DB URL, dummy Supabase keys). Listed FIRST in `env_file`.
- `/run/base44/app.env` — user-supplied secrets, listed LAST (always wins).
- `DATABASE_URL` / `DIRECT_URL` point to local postgres by default; user can override with a remote Supabase DB URL.
- Supabase credentials are **optional for boot** — `lib/supabase.ts` has code-level fallbacks. Auth/storage features won't work without real values, but the app renders.

## Next.js config
- `allowedDevOrigins` in `next.config.js` uses `BASE44_PUBLIC_HOST_SUFFIX` to allow the preview origin for HMR/dev assets.
- `output: "standalone"` is set for non-Vercel production builds; ignored by `next dev`.

## Key files
- `prisma/schema.prisma` — database schema (no migration files; uses `prisma db push`)
- `prisma/seed.ts` — seeds 6 test profiles with reviews, bookings, media assets
- `lib/prisma.ts` — Prisma client singleton
- `lib/supabase.ts` — Supabase client with fallbacks
- `app/(public)/page.tsx` — home page (fetches `/api/profiles`)
- `app/api/profiles/route.ts` — profiles API endpoint

## Notes
- `package-lock.json` is out of sync with `package.json` — use `npm install` (not `npm ci`)
- Some `@supabase/*` packages warn about Node >=22 requirement; using `node:22-slim` resolves this
- Prisma warns about OpenSSL detection on slim images; works fine in practice
