# Base44 Dev Environment — Fantazi-Land

## Stack
Next.js 14.2.5 (App Router) + TypeScript + Tailwind + Framer Motion. Data layer: Supabase
(Postgres + Storage bucket `HOTESS`) and Prisma. External CRM: Base44 API (key committed as a
code default in `lib/clients/base44.client.ts`).

## Running the app
```
docker compose -f docker-compose.base44.yml up -d
```
- Dev server: `npx next dev -H 0.0.0.0 -p 3000` (live reload; bind-mounted source).
- Deps installed at container start via `npm ci`, then `npx prisma generate`.
- `node_modules` lives in a named volume (not the bind mount).
- Health: `GET /` (there is no `/api/health` route despite the repo's own compose referencing one).

## Credentials
The app boots WITHOUT real credentials: `lib/repositories/profiles.repository.ts` tries Supabase
then falls back to the committed `data/creators-catalog.json`, and `lib/supabase.ts` falls back to
dummy keys. Profile images load from the public Supabase Storage bucket (hardcoded URLs in the
catalog). Real Supabase keys + `DATABASE_URL`/`DIRECT_URL` are only needed for live DB writes and
the Storage sync engine — provide them via the Base44 secrets dashboard to enable those.

## Preview origin
`next.config.js` sets `allowedDevOrigins` from `BASE44_PUBLIC_HOST_SUFFIX` so the preview's
external origin can fetch `_next` dev assets / HMR. `BASE44_PUBLIC_HOST_SUFFIX` is passed into the
web service environment.

## Env file precedence
`docker-compose.base44.yml` loads `./.env.base44-defaults` (placeholders) then
`/run/base44/app.env` (platform secrets, last = wins). Never put user-supplied keys under
`environment:` — they would shadow the dashboard values.

## Notes
- `npm ci` warns about engine mismatches (Supabase JS wants Node >=22); harmless on Node 20.
- Prisma warns about OpenSSL detection on alpine; client still generates and queries fail
  gracefully (wrapped in try/catch) when no real DB is configured.
