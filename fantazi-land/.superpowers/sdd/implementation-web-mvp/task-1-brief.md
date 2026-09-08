# Task 1: Setup Monorepo & Shared Package

**Brief:** Create a shared package at `shared/` containing types, schemas, constants, and Supabase/Base44 clients that both mobile and web apps can reuse. Update the web app's `package.json` and `tsconfig.json` to depend on `@shared`.

**Scope:** New files only — no modifications to existing mobile or web code except package.json and tsconfig.json.

**Files to Create:**
- `shared/package.json`
- `shared/tsconfig.json`
- `shared/lib/types.ts` (copy from `fantazi-land-mobile/lib/types.ts`)
- `shared/lib/schemas.ts` (copy from `fantazi-land-mobile/lib/schemas.ts`)
- `shared/lib/constants.ts` (copy from `fantazi-land-mobile/lib/constants.ts`)
- `shared/lib/supabase.ts` (copy from `fantazi-land-mobile/lib/supabase.ts`)
- `shared/lib/base44.ts` (copy from `fantazi-land-mobile/lib/base44.ts`)

**Files to Modify:**
- `fantazi-land/package.json` — add `@shared` dependency
- `fantazi-land/tsconfig.json` — add path alias for `@shared/*`

**Interface Requirements:**
- **Produces:** `@shared/lib/types` (Profile, Booking, Review, MediaAsset, PerformanceStats, ProfileCategory)
- **Produces:** `@shared/lib/schemas` (Zod validators for all types)
- **Produces:** `@shared/lib/constants` (category list, booking statuses)
- **Produces:** `@shared/lib/supabase` (initialized Supabase client)
- **Produces:** `@shared/lib/base44` (Base44 API client)

**Testing:**
- Verify `npx tsc --noEmit` passes (no type errors)
- Verify `npm run build` succeeds in web app

**Success Criteria:**
- All 5 shared modules exist
- Web app can import from `@shared/lib/types`, `@shared/lib/schemas`, etc.
- No TypeScript errors
- Build passes

**Global Constraints (from plan):**
- TypeScript strict mode enabled
- No hardcoded secrets
- All code must pass `npm run type-check` and `npm run build`
