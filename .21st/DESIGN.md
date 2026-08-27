# Fantazi-Land Design System

## Visual Identity

**Brand Color**: Purple (#a855f7) – energetic, creative, modern
**Palette**: Purple + Slate grays (neutral foundation)
**Typography**: Inter (clean, modern, highly legible)
**Density**: Comfortable spacing (16px base) with mobile-first responsive

## Component Hierarchy

### Atoms (Primitive UI)
- Button (4 variants: primary, secondary, outline, danger | 3 sizes: sm, md, lg)
- Card (container with optional hover effect, sub-components: Header, Body, Footer)
- Badge (5 variants: success, warning, error, info, default)
- Rating (interactive/display 5-star component with optional review count)
- Avatar (image + name fallback, 4 sizes: sm, md, lg, xl)

### Molecules (Composed Components)
- KPICard (dashboard metric with label, value, icon, change percentage, type)

### Organisms (Complex UI Sections)
- **ProfileForm**: 3-col layout form (avatar uploader + info/pricing/social sections + danger zone)
- **BookingsList**: Card-based list of bookings with status badges and context actions
- **ReviewsList**: Review cards with avatar, rating, verified badge, comment
- **ProfileGrid**: 1-3 column responsive grid of profile cards with avatar, price, rating, CTAs
- **SyncHealthMonitor**: Dashboard widget showing system health, sync events, status summary

## Layout Patterns

### Public Routes (`/`)
- SSR homepage with profile grid + filters
- Single profile detail page with avatar, rating, reviews, social links

### Dashboard Routes (`/dashboard/*`, protected)
- Sticky navigation sidebar with user menu
- KPI dashboard with recent bookings + stats
- Profile editor (uses ProfileForm organism)
- Bookings management (uses BookingsList)
- Reviews & ratings view
- Settings & account

### Admin Routes (`/admin/*`, protected)
- Admin dashboard with sync health monitor
- Profile management grid + manual create
- Failed sync queue (Dead Letter Queue) dashboard
- System logs & monitoring

## Interaction Patterns

- **Primary Actions** (purple background): Book, Save, Submit
- **Secondary Actions** (slate outline): Cancel, View, Details
- **Danger Actions** (red): Delete, Decline
- **Hover States**: Subtle shadow lift on cards (transition-all)
- **Loading States**: Skeleton loaders (animated pulse) for lists/grids
- **Animations**: fade-in (0.3s) for content reveals, slide-up (0.4s) for modals

## Responsive Breakpoints

- **Mobile** (< 640px): Single column, full-width cards, compact spacing
- **Tablet** (640-1024px): 2 columns, reduced padding
- **Desktop** (> 1024px): 3 columns, comfortable spacing

## Accessibility

- All interactive elements have focus states
- ARIA labels on icon buttons
- Color contrast >= WCAG AA (4.5:1 body text, 3:1 large text)
- Keyboard navigation supported
- Reduced motion respected (no auto-animations if prefers-reduced-motion)

## Real Data Context

- Profiles: name, category, avatar, bio, location, base_rate, social links, rating, review_count
- Bookings: client, service, date, price, status (pending/confirmed/completed/cancelled)
- Reviews: client, rating, comment, date, verified badge
- Sync events: type, title, message, timestamp, source (storage/db/api/webhook)

---

**Last Updated**: 2026-08-26  
**Maintained by**: Design + Development team  
**Related**: CLAUDE.md (project instructions), tailwind.config.ts (tokens)
