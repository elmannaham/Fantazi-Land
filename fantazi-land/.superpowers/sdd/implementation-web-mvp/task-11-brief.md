# Task 11: Create Booking Form Page

**Context:** Task 10 (BookingForm component) complete. Form ready to render.

**Scope:** Implement `/booking/[profileId]` route to display booking form for a creator.

**Files to Create:**
- `app/booking/[profileId]/page.tsx`

**Files to Modify:** (none)

**Interface Requirements:**
- **Consumes:** `BookingForm` component, `supabase` client, `Profile` type from `@shared/lib/types`
- **Produces:** Dynamic booking form page
  - Fetches creator profile by ID
  - Displays creator name + booking form

**Implementation (from plan):**
1. Use dynamic route param `[profileId]` to get creator ID
2. `useEffect` to fetch profile from Supabase
3. Validate response with ProfileSchema
4. Display BookingForm component with fetched profile
5. Handle loading/error states

**Testing:**
- Verify `npx tsc --noEmit` passes
- Verify `npm run build` succeeds
- (Manual: navigate to `/booking/123`, should load form)

**Success Criteria:**
- Page fetches profile from Supabase
- Creator name displays above form
- BookingForm renders with correct profile
- Loading and error states display
- All data validated with Zod
- No TypeScript errors
- Build passes

**Commits expected:** 1 (booking form page)
