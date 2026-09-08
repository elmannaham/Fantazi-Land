# Task 6: Create Browse Profiles Page

**Context:** Tasks 2-5 complete. All components (Navbar, ProfileGrid, CategoryFilter) ready. Tailwind base styles applied.

**Scope:** Implement `/` route to browse all public profiles with category filtering.

**Files to Modify:**
- `app/page.tsx` — main browse page

**Files to Create:** (none)

**Interface Requirements:**
- **Consumes:** `ProfileGrid`, `CategoryFilter` components, `supabase` client, `Profile[]` type from `@shared/lib/types`
- **Produces:** Browse page component that fetches and renders profiles

**Implementation (from plan):**
1. Use `useEffect` to fetch profiles from Supabase
2. Query: `select * from profiles where is_public = true`
3. Validate responses with `ProfileSchema.parse()`
4. Display ProfileGrid with CategoryFilter
5. Handle loading state
6. Handle error state

**Testing:**
- Verify `npx tsc --noEmit` passes
- Verify `npm run build` succeeds
- (Manual test in browser: profiles load, filter works)

**Success Criteria:**
- Page fetches profiles from Supabase
- Category filter works (hides/shows profiles)
- Loading and error states render
- All profiles validated with Zod schema
- No TypeScript errors
- Build passes

**Commits expected:** 1 (browse profiles page with filtering)
