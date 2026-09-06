# Task 9: Create Profile Detail Page

**Context:** Task 8 (ProfileDetail component) complete. Component ready to render profile data.

**Scope:** Implement `/profiles/[id]` route to fetch and display a creator's full profile.

**Files to Create:**
- `app/profiles/[id]/page.tsx`

**Files to Modify:** (none)

**Interface Requirements:**
- **Consumes:** `ProfileDetail` component, `supabase` client, `Profile` type from `@shared/lib/types`
- **Produces:** Dynamic profile detail page
  - Fetches profile by ID from Supabase
  - Fetches media assets and reviews
  - Calculates average rating

**Implementation (from plan):**
1. Use dynamic route param `[id]` to get profile ID
2. `useEffect` to fetch from Supabase:
   - Profile: `select * from profiles where id = ?`
   - Media: `select * from media_assets where profile_id = ?`
   - Reviews: `select rating from reviews where profile_id = ?` (for average)
3. Validate all responses with Zod schemas
4. Display ProfileDetail component with fetched data
5. Handle loading/error states

**Testing:**
- Verify `npx tsc --noEmit` passes
- Verify `npm run build` succeeds
- (Manual: navigate to `/profiles/123`, should load and display profile)

**Success Criteria:**
- Page fetches profile from Supabase
- Media assets and reviews load
- Average rating calculated correctly
- All data validated with Zod
- Loading and error states render
- "Back to browse" link works
- No TypeScript errors
- Build passes

**Commits expected:** 1 (dynamic profile detail page)
