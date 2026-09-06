# Task 8: Create ProfileDetail Component

**Context:** Week 1 complete. All foundation components ready. Web app can fetch and display profiles.

**Scope:** Build ProfileDetail component to show creator's full profile with bio, portfolio, social links, and booking button.

**Files to Create:**
- `app/profiles/[id]/_components/ProfileDetail.tsx`
- `app/profiles/[id]/_components/ProfileDetail.test.tsx`

**Files to Modify:** (none)

**Interface Requirements:**
- **Consumes:** `Profile`, `MediaAsset[]` from `@shared/lib/types`
- **Produces:** `ProfileDetail` component
  - Props: `profile: Profile, mediaAssets?: any[], averageRating?: number`
  - Returns: Full profile layout with hero image, bio, portfolio grid, social links, booking button

**Testing (TDD):**
1. Write failing tests:
   - ProfileDetail renders name, category, rate
   - ProfileDetail renders bio
   - ProfileDetail renders social links
2. Implement ProfileDetail component
3. Run tests — should pass

**Code Features (from plan):**
- Large hero image (responsive)
- Creator name, category, bio
- Portfolio grid (thumbnail images)
- Social links (Instagram, website, Twitter)
- Sticky "Request Booking" button on right (desktop) or bottom (mobile)
- Average rating display

**Success Criteria:**
- Tests pass
- Profile info displays correctly
- Portfolio grid responsive
- Social links render properly
- Booking button links to `/booking/[profileId]`
- No TypeScript errors
- Build passes

**Commits expected:** 1 (ProfileDetail component with tests)
