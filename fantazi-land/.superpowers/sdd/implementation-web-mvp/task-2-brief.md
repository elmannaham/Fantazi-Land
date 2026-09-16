# Task 2: Setup Navbar & Tailwind Base

**Context:** Task 1 (monorepo) is complete. Web app now has `@shared` available.

**Scope:** Create root layout with navbar, update global styles with Tailwind base.

**Files to Create:**
- `app/_components/Navbar.tsx`

**Files to Modify:**
- `app/layout.tsx` — import Navbar, structure
- `app/globals.css` — add Tailwind directives and base styles

**Interface Requirements:**
- **Consumes:** (none)
- **Produces:** `Navbar` component (React functional)
  - Sticky top navigation with logo and links
  - Props: none required

**Testing:**
- Component renders without errors
- Navbar sticks to top when scrolling (CSS)

**Success Criteria:**
- `app/layout.tsx` exports RootLayout
- Navbar displays with logo and navigation links
- Tailwind base styles applied globally
- No TypeScript errors
- Build passes

**Commits expected:** 1 (setup navbar and tailwind base)
