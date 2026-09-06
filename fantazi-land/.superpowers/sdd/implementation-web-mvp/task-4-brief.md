# Task 4: Create ProfileGrid Component

**Context:** Task 3 (ProfileCard) complete. ProfileCard component available for use.

**Scope:** Build ProfileGrid to display multiple ProfileCard components with optional category filtering.

**Files to Create:**
- `app/_components/ProfileGrid.tsx`
- `app/_components/ProfileGrid.test.tsx`

**Files to Modify:** (none)

**Interface Requirements:**
- **Consumes:** `Profile[]` from `@shared/lib/types`, `ProfileCard` component
- **Produces:** `ProfileGrid` component
  - Props: `profiles: Profile[], selectedCategory?: string`
  - Returns: Grid of ProfileCard components

**Testing (TDD):**
1. Write failing test: ProfileGrid renders profile cards
2. Write failing test: ProfileGrid shows empty state
3. Implement ProfileGrid component
4. Run tests — should pass

**Code (from plan):**
- Grid layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- Optional filtering by category
- Empty state message when no profiles

**Success Criteria:**
- Tests pass
- Grid displays multiple cards
- Empty state renders when needed
- Responsive layout works
- No TypeScript errors
- Build passes

**Commits expected:** 1 (ProfileGrid component with tests)
