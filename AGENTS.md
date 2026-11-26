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
- `.env.base44-defaults` is committed on purpose (placeholders only, no real secrets) and un-ignored in `.gitignore`; without it Prisma fails with "Environment variable not found: DIRECT_URL"
- `prisma db push` (not migrations) is how the schema reaches the DB; new models are created on the next `docker compose up`

## VideoFlow Studio (`/studio`)
The product workspace on this branch. `/` redirects to `/studio` (see `next.config.js`); the original
booking pages stay reachable at their own routes (`/portfolio`, `/about`, `/dashboard`, `/admin`, …).

- **Models** (`prisma/schema.prisma`): `Project` → `SceneShot` (ordered by `position`), `ExportPreset`.
  Prisma enums: `VideoFormat`, `ProjectStatus`, `ShotType`, `SwapType`, `RenderStatus`.
- **Domain logic** (`lib/studio/`): `plan.ts` owns duration/timecode/quality-checklist and the
  production-plan JSON (`videoflow.production_plan/v1`); `service.ts` owns validation + Prisma access;
  `constants.ts` owns the French labels and status colours.
- **API**: `GET/POST /api/studio/projects`, `GET/PATCH/DELETE /api/studio/projects/[id]`,
  `POST /api/studio/projects/[id]/shots`, `POST …/shots/reorder`, `PATCH/DELETE /api/studio/shots/[id]`,
  `GET /api/studio/presets`, `POST /api/studio/projects/[id]/export`.
- **External engines (extension point)**: `Project.engine_webhook_url` is posted the production plan by
  `…/export` with `{ dispatch: true }`. Statuses come back through
  `POST /api/studio/webhooks/render-status` (`{ shot_id, status: queued|rendered|review|draft, notes }`);
  set `STUDIO_WEBHOOK_SECRET` to require the `x-webhook-secret` header. Everything works without any
  engine configured (draft/planning mode).
- **Seed**: `prisma/seed.ts` bootstraps one demo project + 3 export presets only when `Project` is empty.
- **Verify**: `curl -s localhost:3000/api/studio/projects` returns the demo project; `/studio` renders the
  three-column workspace. Swap shots cannot be saved without the consent attestation (client-side gate) and
  are flagged by the "Conformité swap" checklist item.

## Open-source edition (`open-source/`)
A standalone Next.js app extracted from the studio: own `package.json`, Prisma schema, seed, `docker-compose.yml`,
README and MIT LICENSE — no Supabase, Base44 or booking dependency.
- Run it independently with `cd open-source && APP_PORT=3010 docker compose up -d` (the port override avoids
  clashing with the main app on 3000; the compose project name is `open-source`).
- `ALLOWED_DEV_ORIGINS` (comma-separated hosts) must be set when the dev server is reached through any host
  other than localhost — Next 16 blocks cross-origin dev assets, which leaves the page stuck on "Chargement du studio…".
- Publish it as its own repository with `git subtree push --prefix open-source <remote> main`.
- The studio sources are duplicated between the main app and `open-source/`; a change to `components/studio`,
  `lib/studio` or `app/api/studio` has to be mirrored there.
