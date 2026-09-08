# Task 3: Create ProfileCard Component

**Context:** Task 2 (navbar/styles) is complete. Web app has Tailwind styling foundation.

**Scope:** Build a reusable ProfileCard component for displaying creator profiles in a grid.

**Files to Create:**
- `app/_components/ProfileCard.tsx`
- `app/_components/ProfileCard.test.tsx`

**Files to Modify:** (none)

**Interface Requirements:**
- **Consumes:** `Profile` from `@shared/lib/types`
- **Produces:** `ProfileCard` component
  - Props: `profile: Profile, onClick?: (id: string) => void`
  - Returns: JSX showing profile image, name, category, rate

**Testing (TDD):**
1. Write failing test: ProfileCard renders name, category, rate
2. Implement ProfileCard component
3. Run test — should pass
4. No additional tests needed for MVP

**Code (from plan):**
- Card with image (fallback to grey box if none)
- Hover effect (scale image, shadow)
- Title, category, rate display
- Link to `/profiles/[id]` route

**Success Criteria:**
- Tests pass (npm test -- ProfileCard.test.tsx)
- Component renders correctly
- Responsive on mobile/desktop
- No TypeScript errors
- Build passes

**Commits expected:** 1 (ProfileCard component with tests)
