# Task 7: Create LoadingSpinner Component

**Context:** Tasks 1-6 complete. Week 1 foundation ready. LoadingSpinner needed by Task 6 and later tasks.

**Scope:** Build a simple, reusable loading spinner component.

**Files to Create:**
- `app/_components/LoadingSpinner.tsx`

**Files to Modify:** (none)

**Interface Requirements:**
- **Consumes:** (none)
- **Produces:** `LoadingSpinner` component
  - Props: none required
  - Returns: Animated spinner with "Loading..." text

**Implementation (from plan):**
- Animated spinning circle (using CSS @keyframes)
- "Loading..." text next to spinner
- Centered on page (flex)

**Testing:**
- Component renders without errors
- No TypeScript errors

**Success Criteria:**
- Component renders
- Spinner animates smoothly
- Text displays
- No TypeScript errors
- Build passes

**Commits expected:** 1 (LoadingSpinner component)

**Note:** This is a utility component used by Tasks 6, 8, 9, 11 for their loading states.
