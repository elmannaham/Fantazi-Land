# Task 5: Create CategoryFilter Component

**Context:** Task 4 (ProfileGrid) complete. Grid component ready to receive category filter.

**Scope:** Build CategoryFilter to let users filter profiles by category.

**Files to Create:**
- `app/_components/CategoryFilter.tsx`
- `app/_components/CategoryFilter.test.tsx`

**Files to Modify:** (none)

**Interface Requirements:**
- **Consumes:** `ProfileCategory[]` from `@shared/lib/types`, callback function
- **Produces:** `CategoryFilter` component
  - Props: `onSelect: (category: ProfileCategory | null) => void, selected?: ProfileCategory | null`
  - Returns: Pill-style buttons for category selection

**Testing (TDD):**
1. Write failing test: CategoryFilter renders all categories
2. Write failing test: CategoryFilter calls onSelect when clicked
3. Write failing test: CategoryFilter highlights selected category
4. Implement CategoryFilter component
5. Run tests — should pass

**Categories (from @shared/lib/constants):**
Photography, Videography, Contenu Mode, Beauté, Lifestyle, Gaming

**Code (from plan):**
- "All" button to clear filter
- Category buttons with hover/active states
- Selected category highlighted in purple

**Success Criteria:**
- Tests pass
- All categories render
- Selection callback works
- Styling reflects selection
- No TypeScript errors
- Build passes

**Commits expected:** 1 (CategoryFilter component with tests)
