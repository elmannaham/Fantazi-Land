# Fantazi-Land Web MVP — Architecture & Implementation Specification

**Date:** 2026-09-02  
**Status:** Design Approved  
**Author:** Claude Code + Team  
**Scope:** Client booking flow MVP (2-3 weeks) + roadmap to full parity with mobile v1.0.0

---

## Executive Summary

**Goal:** Build a web client for Fantazi-Land booking platform that lets users browse creator profiles and submit booking requests.

**Approach:** Thin web client that reuses the mobile app's backend (Supabase + Base44 CRM), eliminating data duplication and ensuring consistency.

**Timeline:**
- **MVP (Phase 1):** 2-3 weeks → Live client booking flow
- **Full Parity (Phase 2):** 4-5 weeks → Feature-complete match to mobile v1.0.0

**Team:** Solo developer

**Technology Stack:**
- Frontend: Vinext (React 19 + Vite)
- Runtime: Cloudflare Workers
- Backend: Shared (Supabase PostgreSQL + Base44 CRM)
- Styling: Tailwind CSS
- Code Sharing: Monorepo with `@shared` package

---

## Architecture Overview

### System Design

```
┌──────────────────────────────────────────────────┐
│         Shared Backend (Single Source)           │
│  ─────────────────────────────────────────────   │
│  Supabase PostgreSQL (Profiles, Bookings, etc.)  │
│  Supabase Auth (User sessions)                   │
│  Supabase Storage (Profile photos)               │
│  Base44 CRM (Booking sync, creator management)   │
└────────┬──────────────────────────────┬──────────┘
         │                              │
    ┌────▼──────────┐          ┌───────▼────────┐
    │  Mobile App   │          │   Web App      │
    │  (Expo 57.0)  │          │   (Vinext)     │
    │  ────────────  │          │   ──────────── │
    │  • All flows   │          │   • Browse     │
    │  • Full auth   │          │   • Book       │
    │  • Push notif  │          │   • Confirm    │
    │  • v1.0.0 Live │          │   • (Auth P2)  │
    └───────────────┘          └────────────────┘

    Shared Code Layer
    ├── types.ts (Profile, Booking, Review, etc.)
    ├── schemas.ts (Zod validation)
    ├── constants.ts (URLs, enums)
    ├── supabase.ts (client init)
    └── base44.ts (CRM client)
```

### Key Principle: No Duplication

- **Mobile** defines the data model → **Web** reuses it
- **Supabase** is the single source of truth
- **Type safety** enforced via shared TypeScript types
- **No separate web backend** — thin client pattern

---

## Phase 1: MVP (Client Booking Flow)

### Scope

**What's included:**
- ✅ Browse public creator profiles
- ✅ Filter by category
- ✅ View creator detail & portfolio
- ✅ Submit booking requests (date, duration, budget)
- ✅ Booking confirmation page
- ✅ Responsive design (mobile-first)
- ✅ Basic error handling

**What's NOT included (Phase 2):**
- ❌ User authentication (public booking only)
- ❌ Creator dashboard
- ❌ Reviews & ratings
- ❌ Design system / component library
- ❌ Analytics
- ❌ Admin panel

### Pages & Routes

| Route | Component | Description | Data Source |
|-------|-----------|-------------|-------------|
| `/` | `ProfilesPage` | Browse all public profiles with category filter | Supabase: `profiles` table |
| `/profiles/[id]` | `ProfileDetailPage` | View creator bio, portfolio, rates, reviews | Supabase: `profiles`, `media_assets`, `reviews` |
| `/booking/[profileId]` | `BookingFormPage` | Date picker, duration, budget, submit form | Form submission to Supabase |
| `/bookings/[bookingId]` | `BookingStatusPage` | Booking confirmation & status tracking | Supabase: `bookings` table |

### Components to Build

```
app/
├── layout.tsx
├── page.tsx (Browse profiles)
├── profiles/
│   ├── [id]/
│   │   └── page.tsx (Profile detail)
│   └── _components/
│       ├── ProfileGrid.tsx
│       ├── ProfileCard.tsx
│       ├── ProfileDetail.tsx
│       └── CategoryFilter.tsx
├── booking/
│   ├── [profileId]/
│   │   └── page.tsx (Booking form)
│   └── _components/
│       ├── BookingForm.tsx
│       └── DatePicker.tsx (or use library)
├── bookings/
│   ├── [bookingId]/
│   │   └── page.tsx (Booking status)
│   └── _components/
│       └── BookingStatus.tsx
└── _components/
    ├── Navbar.tsx
    └── LoadingSpinner.tsx
```

### Data Model (Shared with Mobile)

**Profile**
```typescript
interface Profile {
  id: string
  user_id: string | null
  name: string
  category: ProfileCategory // "Photography" | "Videography" | etc.
  bio: string | null
  avatar_url: string | null
  base_rate: number | null
  currency: string // "EUR"
  instagram_url: string | null
  website_url: string | null
  is_public: boolean
  is_available: boolean
  created_at: string
  updated_at: string
}
```

**Booking**
```typescript
interface Booking {
  id: string
  profile_id: string
  client_name: string | null
  client_email: string | null
  project_title: string
  project_description: string | null
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
  budget: number | null
  currency: string
  created_at: string
  updated_at: string
}
```

### API Contracts (Reusing Mobile's Queries)

**Fetch Profiles:**
```typescript
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .eq('is_public', true)
  .order('created_at', { ascending: false })
```

**Fetch Profile Detail:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('*, media_assets(*), reviews(*), performance_stats(*)')
  .eq('id', profileId)
  .single()
```

**Submit Booking:**
```typescript
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    profile_id: profileId,
    client_name: formData.name,
    client_email: formData.email,
    project_title: formData.title,
    start_date: formData.startDate,
    end_date: formData.endDate,
    budget: formData.budget,
    currency: 'EUR',
    status: 'pending'
  })
  .select()
  .single()

// Also sync to Base44 CRM
await base44.createBooking(booking)
```

---

## Code Sharing Strategy

### Monorepo Structure

```
fantazi-land-workspace/
├── package.json (workspace root)
├── shared/ (NEW)
│   ├── package.json
│   ├── lib/
│   │   ├── types.ts (moved from mobile, shared with web)
│   │   ├── schemas.ts (Zod validation)
│   │   ├── constants.ts (enums, category names, etc.)
│   │   ├── supabase.ts (Supabase client init)
│   │   └── base44.ts (Base44 CRM client)
│   └── tsconfig.json
├── fantazi-land-mobile/
│   ├── package.json (depends on @shared)
│   └── ...
└── fantazi-land/
    ├── package.json (depends on @shared)
    └── ...
```

### Setup Steps (Week 0)

1. Create `shared/` package with TypeScript config
2. Move `types.ts`, `schemas.ts`, `constants.ts` from mobile to shared
3. Both projects import from `@shared/lib/*`
4. Update `tsconfig.json` paths in both projects
5. Test that both build successfully

### What's Shared vs. Separate

| Code | Shared | Reason |
|------|--------|--------|
| `types.ts` | ✅ YES | Single source of truth |
| `schemas.ts` | ✅ YES | Runtime validation is identical |
| `constants.ts` | ✅ YES | Same values everywhere |
| `supabase.ts` | ✅ YES | Same project URL + keys |
| `base44.ts` | ✅ YES | Same API endpoint |
| UI Components | ❌ NO | React Native ≠ React |
| Routes/pages | ❌ NO | Different navigation models |
| Styling | ❌ NO | StyleSheet ≠ Tailwind |

---

## Timeline & Phases

### Phase 1: MVP (Weeks 1-3)

**Week 1: Foundation & Browse**
- Setup monorepo
- Create `/` and `/profiles/[id]` routes
- Build `ProfileGrid` component (list view)
- Build `ProfileCard` component (individual card)
- Fetch profiles from Supabase
- Add category filter
- Basic Tailwind styling

**Week 2: Detail & Booking Form**
- Build `ProfileDetail` component (full info, portfolio, rates)
- Create `/booking/[profileId]` page
- Build `BookingForm` component with validation
- Date picker (use library or custom)
- Duration slider
- Booking submission to Supabase + Base44

**Week 3: Confirmation & Polish**
- Create `/bookings/[bookingId]` confirmation page
- Build `BookingStatus` component
- Error handling (loading, error states, retries)
- Responsive polish (mobile devices)
- Deploy to Cloudflare Workers

### Phase 2: Full Parity (Weeks 4-8)

| Week | Feature | Effort |
|------|---------|--------|
| 4 | Creator dashboard (profile management) | 2-3 days |
| 5 | Authentication (Supabase Auth) | 2-3 days |
| 5 | Reviews & ratings display/submit | 1-2 days |
| 6 | Design system (component library) | 2-3 days |
| 7 | Analytics (Google Analytics / Segment) | 1-2 days |
| 8 | Admin panel (sync, moderation) | 2-3 days |

---

## Testing Strategy

### Unit Tests (MVP)

- Zod schema validation
- Booking price calculations
- Filter/sort logic
- Form validation

**Target Coverage:** 60% for MVP (can increase to 80% in Phase 2)

### Integration Tests

- Supabase queries (fetch profiles, insert bookings)
- Form submission → database flow

### E2E Tests (Optional for MVP)

- Browse → Detail → Book → Confirmation flow
- Can be manual or automated with Playwright

### Pre-Commit Checklist

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint . --fix

# Run tests
npm test

# Build for production
npm run build
```

---

## Deployment

### Hosting

- **Platform:** Cloudflare Workers (via Wrangler)
- **Domain:** fantazi-land.pages.dev (or custom domain)
- **CDN:** Automatic (Cloudflare edge network)
- **SSL:** Automatic (Cloudflare managed)

### Build & Deploy Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Deploy to Cloudflare
npm run deploy
```

### Environment Variables

```env
# .env.local (never commit)
VITE_SUPABASE_URL=https://uytihmscyjpwpdhqvnbw.supabase.co
VITE_SUPABASE_ANON_KEY=<public-key>
VITE_BASE44_API_URL=https://agence-de-booking-crud...
VITE_BASE44_API_KEY=<api-key>
```

### Post-Deploy Verification

- [ ] Site loads
- [ ] Browse profiles works
- [ ] Booking form submits
- [ ] Confirmation page displays
- [ ] Mobile-responsive ✓
- [ ] No console errors

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **Shared backend divergence** | Import types from `@shared`, not duplicated |
| **Supabase RLS blocking web** | Use anon key (same as mobile), RLS policies allow public browse |
| **Booking submission fails** | Fallback error message, retry logic, email fallback |
| **Mobile app breaks during web build** | Separate branches, test on mobile after `@shared` changes |
| **Deployment issues** | Test locally first, manual verification before committing |

---

## Success Criteria

### MVP (Phase 1)

- ✅ Web site is live and accessible
- ✅ Users can browse creator profiles
- ✅ Users can submit booking requests
- ✅ Booking appears in Supabase + Base44
- ✅ Confirmation page works
- ✅ Mobile-responsive ✓
- ✅ Tests pass (60%+ coverage)

### Full Parity (Phase 2)

- ✅ All mobile v1.0.0 features on web (except push notifications)
- ✅ Creator dashboard
- ✅ User authentication
- ✅ Reviews & ratings
- ✅ Design system
- ✅ Analytics tracking
- ✅ Admin tools

---

## Known Limitations & Future Work

### MVP Limitations

- Public booking only (no auth)
- No notifications (users check email)
- No creator dashboard (Phase 2)
- No advanced filtering (Phase 2)

### Technical Debt (Phase 3+)

- Add Sentry error tracking
- Setup GitHub Actions for CI/CD
- Add E2E tests with Playwright
- Performance monitoring (Core Web Vitals)
- API rate limiting & caching

---

## References & Resources

- **Expo Mobile App:** `fantazi-land-mobile/` (v1.0.0, production)
- **Mobile Types:** `fantazi-land-mobile/lib/types.ts` (to be moved to `shared/`)
- **Supabase Docs:** https://supabase.com/docs
- **Vinext Docs:** https://github.com/cloudflare/vinext
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/

---

## Appendix: File Checklist (MVP)

| File | Status | Notes |
|------|--------|-------|
| `shared/lib/types.ts` | 📝 Create | Copy from mobile, update imports |
| `shared/lib/schemas.ts` | 📝 Create | Copy from mobile |
| `shared/lib/constants.ts` | 📝 Create | Copy from mobile |
| `shared/lib/supabase.ts` | 📝 Create | Copy from mobile |
| `shared/lib/base44.ts` | 📝 Create | Copy from mobile |
| `app/page.tsx` | 📝 Create | Browse profiles |
| `app/profiles/[id]/page.tsx` | 📝 Create | Profile detail |
| `app/booking/[profileId]/page.tsx` | 📝 Create | Booking form |
| `app/bookings/[bookingId]/page.tsx` | 📝 Create | Booking confirmation |
| `components/ProfileGrid.tsx` | 📝 Create | List component |
| `components/ProfileCard.tsx` | 📝 Create | Card component |
| `components/ProfileDetail.tsx` | 📝 Create | Detail component |
| `components/BookingForm.tsx` | 📝 Create | Form component |
| `components/BookingStatus.tsx` | 📝 Create | Confirmation component |
| `components/Navbar.tsx` | 📝 Create | Navigation header |
| `app/globals.css` | ✅ Exists | Tailwind base styles |
| `package.json` | ✅ Update | Add dependencies (date-fns, etc.) |
| `vite.config.ts` | ✅ Exists | Already configured |

---

**Status:** ✅ Architecture Approved  
**Next Step:** Implementation plan (via writing-plans skill)  
**Owner:** Solo developer  
**Last Updated:** 2026-09-02
