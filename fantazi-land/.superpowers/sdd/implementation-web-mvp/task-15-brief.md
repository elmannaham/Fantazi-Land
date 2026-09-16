# Task 15: Deploy to Cloudflare Workers

**Context:** All 14 tasks complete. App ready for production. Final deployment.

**Scope:** Deploy web app to Cloudflare Workers.

**Files to Verify:**
- `wrangler.json` — Cloudflare Workers config (should already exist)
- `.env.local` (local only) — environment variables for local dev
- `.env.example` — template for env vars (to be created)

**Pre-Deploy Checklist:**
1. Verify TypeScript type check passes: `npx tsc --noEmit`
2. Verify linting passes: `npx expo lint` (or equivalent eslint)
3. Verify build succeeds: `npm run build`
4. Verify tests pass: `npm test` (if applicable for MVP)

**Deployment Steps:**
1. **Create .env.example** — template showing required env vars without secrets
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_BASE44_API_URL=https://your-crm.base44.app/api
   VITE_BASE44_API_KEY=your-api-key
   ```

2. **Verify wrangler.json** — check name, route, build command, env config

3. **Login to Cloudflare:** `npx wrangler login`

4. **Deploy:** `npm run deploy` (or manual: `npx wrangler deploy`)

5. **Verify Live Site:**
   - Open deployed URL (e.g., fantazi-land.pages.dev)
   - Test browse page loads
   - Test profile detail page loads
   - Test booking form loads
   - Test booking submission (if possible)
   - Check browser console for errors

**Testing:**
- Verify site loads at Cloudflare URL
- Verify all pages render
- Verify API calls work (fetch profiles, submit booking)
- No console errors

**Success Criteria:**
- App deployed to Cloudflare Workers
- Live URL accessible
- Browse, detail, booking, confirmation flows work
- No errors in console
- Profile data loads from Supabase
- Bookings submit to Supabase + Base44

**Commits expected:** 1 (.env.example, final deployment config)

**Documentation:**
- Add deployment notes to README if needed
- Note the live URL for testing
