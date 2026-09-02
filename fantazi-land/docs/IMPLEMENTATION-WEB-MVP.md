# Fantazi-Land Web MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working web client that lets users browse creator profiles and submit booking requests, deployed to Cloudflare Workers in 2-3 weeks (solo).

**Architecture:** Thin web client consuming shared Supabase + Base44 backend. Code sharing via monorepo (`@shared` package). TypeScript with Tailwind CSS on Vinext/Cloudflare Workers.

**Tech Stack:**
- Frontend: Vinext (React 19 + Vite)
- Runtime: Cloudflare Workers
- Backend: Supabase (PostgreSQL, Auth, Storage)
- CRM: Base44 API
- Styling: Tailwind CSS
- Testing: Vitest + React Testing Library

**Spec:** `docs/ARCHITECTURE-WEB-MVP.md`

## Global Constraints

- TypeScript strict mode enabled
- Vite as build tool (no Next.js)
- Vinext framework for Cloudflare Workers
- Supabase anon key (public read, authenticated write via RLS)
- Shared types in `@shared/lib/` (do NOT duplicate)
- Monorepo: imports use `@shared/lib/types`, not `../shared/`
- TDD: write failing test first, implement minimal code
- Test coverage target: 60% for MVP
- All commits must pass `npm run build` and `npm run type-check`

---

## File Structure

### New Files to Create (Week 1-3)

```
fantazi-land/
├── shared/                           (NEW: shared package)
│   ├── package.json
│   ├── tsconfig.json
│   └── lib/
│       ├── types.ts                  (copied from mobile)
│       ├── schemas.ts                (copied from mobile)
│       ├── constants.ts              (copied from mobile)
│       ├── supabase.ts               (copied from mobile)
│       └── base44.ts                 (copied from mobile)
│
└── fantazi-land/                     (web app)
    ├── app/
    │   ├── layout.tsx                (root layout + navbar)
    │   ├── page.tsx                  (browse profiles)
    │   ├── globals.css               (already exists)
    │   ├── profiles/
    │   │   └── [id]/
    │   │       ├── page.tsx          (profile detail)
    │   │       └── _components/
    │   │           ├── ProfileDetail.tsx
    │   │           └── ProfileDetail.test.tsx
    │   ├── booking/
    │   │   └── [profileId]/
    │   │       ├── page.tsx          (booking form)
    │   │       └── _components/
    │   │           ├── BookingForm.tsx
    │   │           ├── DatePicker.tsx
    │   │           └── BookingForm.test.tsx
    │   ├── bookings/
    │   │   └── [bookingId]/
    │   │       ├── page.tsx          (booking confirmation)
    │   │       └── _components/
    │   │           ├── BookingStatus.tsx
    │   │           └── BookingStatus.test.tsx
    │   └── _components/
    │       ├── Navbar.tsx
    │       ├── ProfileGrid.tsx
    │       ├── ProfileCard.tsx
    │       ├── CategoryFilter.tsx
    │       ├── LoadingSpinner.tsx
    │       └── (test files)
    │
    ├── lib/
    │   └── (hooks, utilities — import types from @shared)
    │
    ├── tests/
    │   ├── setup.ts                  (vitest config)
    │   └── (integration tests)
    │
    ├── package.json                  (updated with dependencies)
    ├── vite.config.ts                (already exists)
    ├── tsconfig.json                 (already exists)
    └── wrangler.json                 (Cloudflare config)
```

---

## WEEK 1: Foundation & Browse (Days 1-5)

### Task 1: Setup Monorepo & Shared Package

**Files:**
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/lib/types.ts` (copy from mobile)
- Create: `shared/lib/schemas.ts` (copy from mobile)
- Create: `shared/lib/constants.ts` (copy from mobile)
- Create: `shared/lib/supabase.ts` (copy from mobile)
- Create: `shared/lib/base44.ts` (copy from mobile)
- Modify: `fantazi-land/package.json` (add @shared dependency)
- Modify: `fantazi-land/tsconfig.json` (add path alias)

**Interfaces:**
- Produces: `@shared/lib/types` (Profile, Booking, Review, etc.)
- Produces: `@shared/lib/schemas` (Zod validators)
- Produces: `@shared/lib/supabase` (initialized Supabase client)

**Steps:**

- [ ] **Step 1: Create shared package.json**

```json
{
  "name": "@shared",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "lib/index.ts",
  "exports": {
    "./lib/types": "./lib/types.ts",
    "./lib/schemas": "./lib/schemas.ts",
    "./lib/constants": "./lib/constants.ts",
    "./lib/supabase": "./lib/supabase.ts",
    "./lib/base44": "./lib/base44.ts"
  }
}
```

- [ ] **Step 2: Create shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist"
  },
  "include": ["lib"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Copy mobile types to shared**

From `fantazi-land-mobile/lib/types.ts` → `shared/lib/types.ts`

File should contain:
```typescript
export interface Profile {
  id: string
  user_id: string | null
  name: string
  category: ProfileCategory
  // ... rest of interface
}

export type ProfileCategory = "Photography" | "Videography" | "Contenu Mode" | "Beauté" | "Lifestyle" | "Gaming"

export interface Booking {
  id: string
  profile_id: string
  // ... rest of interface
}

export interface Review {
  id: string
  profile_id: string
  // ... rest of interface
}

export interface MediaAsset {
  id: string
  profile_id: string
  // ... rest of interface
}

export interface PerformanceStats {
  id: string
  profile_id: string
  // ... rest of interface
}
```

- [ ] **Step 4: Copy mobile schemas to shared**

From `fantazi-land-mobile/lib/schemas.ts` → `shared/lib/schemas.ts`

Should contain Zod validators for Profile, Booking, Review, etc.

- [ ] **Step 5: Copy mobile constants to shared**

From `fantazi-land-mobile/lib/constants.ts` → `shared/lib/constants.ts`

Should contain profile categories, booking statuses, etc.

- [ ] **Step 6: Copy Supabase client to shared**

From `fantazi-land-mobile/lib/supabase.ts` → `shared/lib/supabase.ts`

Should export initialized Supabase client

- [ ] **Step 7: Copy Base44 client to shared**

From `fantazi-land-mobile/lib/base44.ts` → `shared/lib/base44.ts`

Should export Base44 API client

- [ ] **Step 8: Update web package.json**

```json
{
  "dependencies": {
    "@shared": "workspace:*",
    "@supabase/supabase-js": "^2.112.4",
    "react": "latest",
    "react-dom": "latest",
    "zod": "^4.5.4"
  }
}
```

- [ ] **Step 9: Update web tsconfig.json**

Add paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/lib/*"]
    }
  }
}
```

- [ ] **Step 10: Test import works**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 11: Commit**

```bash
git add shared/ fantazi-land/package.json fantazi-land/tsconfig.json
git commit -m "feat: setup monorepo with @shared package

- Create shared/ package with types, schemas, constants
- Copy types from mobile (types.ts, schemas.ts, constants.ts)
- Copy Supabase and Base44 clients
- Configure path aliases in tsconfig
- Update web package.json to depend on @shared"
```

---

### Task 2: Setup Navbar & Tailwind Base

**Files:**
- Modify: `fantazi-land/app/layout.tsx`
- Modify: `fantazi-land/app/globals.css`
- Create: `fantazi-land/app/_components/Navbar.tsx`

**Interfaces:**
- Consumes: (none)
- Produces: `Navbar` component (React functional component)

**Steps:**

- [ ] **Step 1: Update globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #7c3aed; /* purple from mobile */
  --primary-dark: #6d28d9;
}

body {
  @apply bg-slate-50 text-slate-950;
}
```

- [ ] **Step 2: Create Navbar component**

File: `app/_components/Navbar.tsx`

```typescript
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-purple-600">
          Fantazi-Land
        </Link>
        <div className="flex gap-4">
          <Link href="/" className="text-sm hover:text-purple-600">
            Browse
          </Link>
          <a href="#" className="text-sm hover:text-purple-600">
            Help
          </a>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Update layout.tsx**

```typescript
import type { Metadata } from 'next'
import { Navbar } from './_components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fantazi-Land | Book Professional Creators',
  description: 'Browse and book professional creators for your next project',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css app/_components/Navbar.tsx
git commit -m "feat: setup navbar and tailwind base styles"
```

---

### Task 3: Create ProfileCard Component

**Files:**
- Create: `app/_components/ProfileCard.tsx`
- Create: `app/_components/ProfileCard.test.tsx`

**Interfaces:**
- Consumes: `Profile` from `@shared/lib/types`
- Produces: `ProfileCard` component (React functional component)

**Steps:**

- [ ] **Step 1: Write failing test**

File: `app/_components/ProfileCard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import { ProfileCard } from './ProfileCard'
import type { Profile } from '@shared/lib/types'

describe('ProfileCard', () => {
  const mockProfile: Profile = {
    id: '1',
    name: 'Alice',
    category: 'Photography',
    avatar_url: 'https://example.com/alice.jpg',
    base_rate: 150,
    currency: 'EUR',
    is_public: true,
    is_available: true,
    bio: 'Professional photographer',
    user_id: null,
    instagram_url: null,
    tiktok_url: null,
    twitter_url: null,
    website_url: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    synced_at: null,
    storage_folder_id: null,
  }

  it('renders profile name', () => {
    render(<ProfileCard profile={mockProfile} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders category', () => {
    render(<ProfileCard profile={mockProfile} />)
    expect(screen.getByText('Photography')).toBeInTheDocument()
  })

  it('renders rate', () => {
    render(<ProfileCard profile={mockProfile} />)
    expect(screen.getByText('€150/hour')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProfileCard.test.tsx`
Expected: FAIL (component doesn't exist)

- [ ] **Step 3: Write ProfileCard component**

File: `app/_components/ProfileCard.tsx`

```typescript
'use client'

import Link from 'next/link'
import type { Profile } from '@shared/lib/types'

interface ProfileCardProps {
  profile: Profile
  onClick?: (id: string) => void
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const handleClick = () => {
    if (onClick) onClick(profile.id)
  }

  return (
    <Link href={`/profiles/${profile.id}`}>
      <div
        onClick={handleClick}
        className="group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-lg"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="h-48 w-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-400">No photo</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg">{profile.name}</h3>
          <p className="text-sm text-slate-600">{profile.category}</p>
          {profile.base_rate && (
            <p className="text-lg font-bold text-purple-600 mt-3">
              €{profile.base_rate}/hour
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ProfileCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/_components/ProfileCard.tsx app/_components/ProfileCard.test.tsx
git commit -m "feat: add ProfileCard component with tests"
```

---

### Task 4: Create ProfileGrid Component

**Files:**
- Create: `app/_components/ProfileGrid.tsx`
- Create: `app/_components/ProfileGrid.test.tsx`

**Interfaces:**
- Consumes: `Profile[]` from `@shared/lib/types`, `ProfileCard` component
- Produces: `ProfileGrid` component (React functional component)

**Steps:**

- [ ] **Step 1: Write failing test**

File: `app/_components/ProfileGrid.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import { ProfileGrid } from './ProfileGrid'
import type { Profile } from '@shared/lib/types'

describe('ProfileGrid', () => {
  const mockProfiles: Profile[] = [
    {
      id: '1',
      name: 'Alice',
      category: 'Photography',
      avatar_url: 'https://example.com/alice.jpg',
      base_rate: 150,
      currency: 'EUR',
      is_public: true,
      is_available: true,
      bio: null,
      user_id: null,
      instagram_url: null,
      tiktok_url: null,
      twitter_url: null,
      website_url: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      synced_at: null,
      storage_folder_id: null,
    },
  ]

  it('renders profile cards', () => {
    render(<ProfileGrid profiles={mockProfiles} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders empty state when no profiles', () => {
    render(<ProfileGrid profiles={[]} />)
    expect(screen.getByText(/no creators found/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProfileGrid.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write ProfileGrid component**

File: `app/_components/ProfileGrid.tsx`

```typescript
'use client'

import type { Profile } from '@shared/lib/types'
import { ProfileCard } from './ProfileCard'

interface ProfileGridProps {
  profiles: Profile[]
  selectedCategory?: string
}

export function ProfileGrid({ profiles, selectedCategory }: ProfileGridProps) {
  const filtered = selectedCategory
    ? profiles.filter(p => p.category === selectedCategory)
    : profiles

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No creators found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map(profile => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ProfileGrid.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/_components/ProfileGrid.tsx app/_components/ProfileGrid.test.tsx
git commit -m "feat: add ProfileGrid component with empty state"
```

---

### Task 5: Create CategoryFilter Component

**Files:**
- Create: `app/_components/CategoryFilter.tsx`
- Create: `app/_components/CategoryFilter.test.tsx`

**Interfaces:**
- Consumes: `ProfileCategory[]` from `@shared/lib/types`, callback function
- Produces: `CategoryFilter` component (React functional component)

**Steps:**

- [ ] **Step 1: Write failing test**

File: `app/_components/CategoryFilter.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter } from './CategoryFilter'

describe('CategoryFilter', () => {
  it('renders all categories', () => {
    const mockHandler = jest.fn()
    render(<CategoryFilter onSelect={mockHandler} />)
    
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Photography')).toBeInTheDocument()
    expect(screen.getByText('Videography')).toBeInTheDocument()
  })

  it('calls onSelect when category clicked', () => {
    const mockHandler = jest.fn()
    render(<CategoryFilter onSelect={mockHandler} />)
    
    fireEvent.click(screen.getByText('Photography'))
    expect(mockHandler).toHaveBeenCalledWith('Photography')
  })

  it('highlights selected category', () => {
    const mockHandler = jest.fn()
    render(<CategoryFilter onSelect={mockHandler} selected="Photography" />)
    
    const button = screen.getByRole('button', { name: 'Photography' })
    expect(button).toHaveClass('bg-purple-600')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- CategoryFilter.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write CategoryFilter component**

File: `app/_components/CategoryFilter.tsx`

```typescript
'use client'

import type { ProfileCategory } from '@shared/lib/types'

const CATEGORIES: ProfileCategory[] = [
  'Photography',
  'Videography',
  'Contenu Mode',
  'Beauté',
  'Lifestyle',
  'Gaming',
]

interface CategoryFilterProps {
  onSelect: (category: ProfileCategory | null) => void
  selected?: ProfileCategory | null
}

export function CategoryFilter({ onSelect, selected }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-2 font-medium transition-colors ${
          !selected
            ? 'bg-purple-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        All
      </button>
      {CATEGORIES.map(category => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`rounded-full px-4 py-2 font-medium transition-colors ${
            selected === category
              ? 'bg-purple-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- CategoryFilter.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/_components/CategoryFilter.tsx app/_components/CategoryFilter.test.tsx
git commit -m "feat: add CategoryFilter component with category selection"
```

---

### Task 6: Create Browse Profiles Page

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `ProfileGrid`, `CategoryFilter` components, `supabase` client, `Profile[]` type
- Produces: Browse page (fetches & renders profiles)

**Steps:**

- [ ] **Step 1: Implement browse page**

File: `app/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@shared/lib/supabase'
import type { Profile, ProfileCategory } from '@shared/lib/types'
import { ProfileSchema } from '@shared/lib/schemas'
import { ProfileGrid } from './_components/ProfileGrid'
import { CategoryFilter } from './_components/CategoryFilter'
import { LoadingSpinner } from './_components/LoadingSpinner'

export default function BrowsePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ProfileCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        const validated = data?.map(p => ProfileSchema.parse(p)) || []
        setProfiles(validated)
      } catch (err) {
        console.error('Failed to fetch profiles:', err)
        setError('Failed to load profiles. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Creators</h1>
        <p className="text-slate-600">Find and book professional creators for your next project</p>
      </div>

      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <ProfileGrid profiles={profiles} selectedCategory={selectedCategory} />
    </div>
  )
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Test the page builds**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: implement browse profiles page with filtering

- Fetch public profiles from Supabase
- Display ProfileGrid with CategoryFilter
- Handle loading and error states
- Validate responses with Zod schemas"
```

---

### Task 7: Create LoadingSpinner Component

**Files:**
- Create: `app/_components/LoadingSpinner.tsx`

**Interfaces:**
- Consumes: (none)
- Produces: `LoadingSpinner` component

**Steps:**

- [ ] **Step 1: Write LoadingSpinner component**

File: `app/_components/LoadingSpinner.tsx`

```typescript
'use client'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin">
        <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
      <span className="ml-3 text-slate-600">Loading...</span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/_components/LoadingSpinner.tsx
git commit -m "feat: add LoadingSpinner component"
```

---

**WEEK 1 SUMMARY**

✅ Monorepo setup with shared package  
✅ Navbar & base styles  
✅ ProfileCard component  
✅ ProfileGrid component  
✅ CategoryFilter component  
✅ Browse profiles page (live fetching from Supabase)  
✅ LoadingSpinner component  

**Verification:**
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] `npm test` passes (60%+ coverage)

---

## WEEK 2: Profile Detail & Booking Form (Days 6-10)

### Task 8: Create ProfileDetail Component

**Files:**
- Create: `app/profiles/[id]/_components/ProfileDetail.tsx`
- Create: `app/profiles/[id]/_components/ProfileDetail.test.tsx`

**Interfaces:**
- Consumes: `Profile`, `Review[]`, `MediaAsset[]` from `@shared/lib/types`
- Produces: `ProfileDetail` component

**Steps:**

- [ ] **Step 1: Write failing test**

```typescript
import { render, screen } from '@testing-library/react'
import { ProfileDetail } from './ProfileDetail'
import type { Profile } from '@shared/lib/types'

describe('ProfileDetail', () => {
  const mockProfile: Profile = {
    id: '1',
    name: 'Alice',
    category: 'Photography',
    bio: 'Professional photographer',
    avatar_url: 'https://example.com/alice.jpg',
    base_rate: 150,
    currency: 'EUR',
    is_public: true,
    is_available: true,
    user_id: null,
    instagram_url: 'https://instagram.com/alice',
    tiktok_url: null,
    twitter_url: null,
    website_url: 'https://alice.com',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    synced_at: null,
    storage_folder_id: null,
  }

  it('renders profile name', () => {
    render(<ProfileDetail profile={mockProfile} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders bio', () => {
    render(<ProfileDetail profile={mockProfile} />)
    expect(screen.getByText('Professional photographer')).toBeInTheDocument()
  })

  it('renders rate', () => {
    render(<ProfileDetail profile={mockProfile} />)
    expect(screen.getByText('€150/hour')).toBeInTheDocument()
  })

  it('renders social links', () => {
    render(<ProfileDetail profile={mockProfile} />)
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Website')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProfileDetail.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write ProfileDetail component**

File: `app/profiles/[id]/_components/ProfileDetail.tsx`

```typescript
'use client'

import Link from 'next/link'
import type { Profile } from '@shared/lib/types'

interface ProfileDetailProps {
  profile: Profile
  mediaAssets?: any[]
  averageRating?: number
}

export function ProfileDetail({ profile, mediaAssets = [], averageRating }: ProfileDetailProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-full rounded-lg object-cover mb-6 max-h-96"
          />
        )}

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          <p className="text-slate-600 mb-4">{profile.category}</p>

          {profile.bio && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-slate-700">{profile.bio}</p>
            </div>
          )}

          {mediaAssets && mediaAssets.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaAssets.map(asset => (
                  <img
                    key={asset.id}
                    src={asset.file_url}
                    alt="Portfolio"
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          {profile.instagram_url || profile.website_url || profile.twitter_url ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Connect</h2>
              <div className="flex gap-4">
                {profile.instagram_url && (
                  <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    Instagram
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    Website
                  </a>
                )}
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    Twitter
                  </a>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-20">
          <p className="text-sm text-slate-600 mb-1">Rate</p>
          <p className="text-3xl font-bold text-purple-600 mb-6">
            €{profile.base_rate || 'TBD'}/hour
          </p>

          {averageRating && (
            <div className="mb-6">
              <p className="text-sm text-slate-600">Rating</p>
              <p className="text-lg font-semibold">{averageRating.toFixed(1)} ⭐</p>
            </div>
          )}

          <Link
            href={`/booking/${profile.id}`}
            className="w-full bg-purple-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-purple-700 transition-colors text-center block"
          >
            Request Booking
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ProfileDetail.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/profiles/[id]/_components/ProfileDetail.tsx app/profiles/[id]/_components/ProfileDetail.test.tsx
git commit -m "feat: add ProfileDetail component with bio, portfolio, social links"
```

---

### Task 9: Create Profile Detail Page

**Files:**
- Create: `app/profiles/[id]/page.tsx`

**Interfaces:**
- Consumes: `ProfileDetail` component, `supabase` client, `Profile` type
- Produces: Dynamic profile page

**Steps:**

- [ ] **Step 1: Write profile detail page**

File: `app/profiles/[id]/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@shared/lib/supabase'
import type { Profile } from '@shared/lib/types'
import { ProfileSchema } from '@shared/lib/schemas'
import { ProfileDetail } from './_components/ProfileDetail'
import { LoadingSpinner } from '@/app/_components/LoadingSpinner'
import Link from 'next/link'

export default function ProfileDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [mediaAssets, setMediaAssets] = useState([])
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (profileError) throw profileError

        const validated = ProfileSchema.parse(profileData)
        setProfile(validated)

        // Fetch media assets
        const { data: assets } = await supabase
          .from('media_assets')
          .select('*')
          .eq('profile_id', id)

        setMediaAssets(assets || [])

        // Fetch reviews for rating
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('profile_id', id)

        if (reviews && reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          setAverageRating(avg)
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError('Profile not found')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
        <Link href="/" className="text-purple-600 hover:underline">
          Back to browse
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link href="/" className="text-purple-600 hover:underline mb-6 inline-block">
        ← Back to browse
      </Link>
      <ProfileDetail
        profile={profile}
        mediaAssets={mediaAssets}
        averageRating={averageRating || undefined}
      />
    </>
  )
}
```

- [ ] **Step 2: Test builds**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Commit**

```bash
git add app/profiles/[id]/page.tsx
git commit -m "feat: create dynamic profile detail page with media and ratings"
```

---

### Task 10: Create DatePicker & Booking Form

**Files:**
- Create: `app/booking/[profileId]/_components/BookingForm.tsx`
- Create: `app/booking/[profileId]/_components/BookingForm.test.tsx`
- Create: `app/booking/[profileId]/_components/DatePicker.tsx`

**Interfaces:**
- Consumes: `Booking` type from `@shared/lib/types`, `supabase` client
- Produces: `BookingForm` component (submits to Supabase + Base44)

**Steps:**

- [ ] **Step 1: Write DatePicker component**

File: `app/booking/[profileId]/_components/DatePicker.tsx`

```typescript
'use client'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  label: string
  minDate?: string
}

export function DatePicker({ value, onChange, label, minDate }: DatePickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={minDate}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
    </div>
  )
}
```

- [ ] **Step 2: Write failing test for BookingForm**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookingForm } from './BookingForm'

describe('BookingForm', () => {
  const mockProfile = {
    id: '1',
    name: 'Alice',
    base_rate: 150,
    currency: 'EUR',
  }

  it('renders form fields', () => {
    render(<BookingForm profile={mockProfile} />)
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request booking/i })).toBeInTheDocument()
  })

  it('calculates price based on duration', async () => {
    render(<BookingForm profile={mockProfile} />)
    
    const durationInput = screen.getByLabelText(/duration/i)
    fireEvent.change(durationInput, { target: { value: '3' } })
    
    await waitFor(() => {
      expect(screen.getByText(/€450/)).toBeInTheDocument()
    })
  })

  it('submits form with client data', async () => {
    const mockSubmit = jest.fn()
    render(<BookingForm profile={mockProfile} onSubmit={mockSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /request booking/i }))
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled()
    })
  })
})
```

- [ ] **Step 3: Write BookingForm component**

File: `app/booking/[profileId]/_components/BookingForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@shared/lib/supabase'
import { base44 } from '@shared/lib/base44'
import type { Profile } from '@shared/lib/types'
import { DatePicker } from './DatePicker'

interface BookingFormProps {
  profile: Profile
  onSubmit?: (booking: any) => void
}

export function BookingForm({ profile, onSubmit }: BookingFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    projectTitle: '',
    projectDescription: '',
    startDate: '',
    duration: 1,
    budget: profile.base_rate || 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculatedBudget = (profile.base_rate || 0) * formData.duration

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value,
      budget: name === 'duration' ? (profile.base_rate || 0) * parseInt(value) : prev.budget,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create booking in Supabase
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          profile_id: profile.id,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          project_title: formData.projectTitle,
          project_description: formData.projectDescription,
          start_date: formData.startDate,
          end_date: new Date(new Date(formData.startDate).getTime() + formData.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: calculatedBudget,
          currency: profile.currency,
          status: 'pending',
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Sync to Base44 CRM
      try {
        await base44.createBooking({
          booking_id: booking.id,
          creator_id: profile.id,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          project_title: formData.projectTitle,
          status: 'pending',
          budget: calculatedBudget,
        })
      } catch (crmError) {
        console.warn('Failed to sync to Base44:', crmError)
        // Don't fail the booking if CRM sync fails
      }

      if (onSubmit) onSubmit(booking)
      
      router.push(`/bookings/${booking.id}`)
    } catch (err) {
      console.error('Booking submission failed:', err)
      setError('Failed to submit booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg border border-slate-200 p-8">
      <h1 className="text-3xl font-bold mb-6">Request Booking</h1>
      <p className="text-slate-600 mb-6">Booking with {profile.name}</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project Title</label>
          <input
            type="text"
            name="projectTitle"
            value={formData.projectTitle}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="My project name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project Description</label>
          <textarea
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Tell us about your project"
            rows={4}
          />
        </div>

        <DatePicker
          label="Start Date"
          value={formData.startDate}
          onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
          minDate={new Date().toISOString().split('T')[0]}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Duration (days)</label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            {[1, 2, 3, 5, 7, 14, 30].map(days => (
              <option key={days} value={days}>
                {days} day{days > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-slate-600">Estimated Budget</p>
        <p className="text-3xl font-bold text-purple-600">
          €{calculatedBudget.toFixed(2)}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !formData.clientName || !formData.clientEmail || !formData.projectTitle || !formData.startDate}
        className="w-full bg-purple-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-purple-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Request Booking'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- BookingForm.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/booking/[profileId]/_components/BookingForm.tsx app/booking/[profileId]/_components/BookingForm.test.tsx app/booking/[profileId]/_components/DatePicker.tsx
git commit -m "feat: add BookingForm with date picker and price calculation

- Form captures client info, project details, dates, duration
- Auto-calculates budget based on creator rate
- Submits to Supabase + Base44 CRM
- Includes validation and error handling"
```

---

### Task 11: Create Booking Form Page

**Files:**
- Create: `app/booking/[profileId]/page.tsx`

**Interfaces:**
- Consumes: `BookingForm` component, `supabase` client
- Produces: Dynamic booking page

**Steps:**

- [ ] **Step 1: Write booking page**

File: `app/booking/[profileId]/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@shared/lib/supabase'
import type { Profile } from '@shared/lib/types'
import { ProfileSchema } from '@shared/lib/schemas'
import { BookingForm } from './_components/BookingForm'
import { LoadingSpinner } from '@/app/_components/LoadingSpinner'

export default function BookingPage() {
  const params = useParams()
  const profileId = params.profileId as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single()

        if (fetchError) throw fetchError

        const validated = ProfileSchema.parse(data)
        setProfile(validated)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError('Creator not found')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [profileId])

  if (loading) return <LoadingSpinner />
  if (error || !profile) {
    return <div className="text-center text-red-600 py-12">{error || 'Creator not found'}</div>
  }

  return <BookingForm profile={profile} />
}
```

- [ ] **Step 2: Test builds**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Commit**

```bash
git add app/booking/[profileId]/page.tsx
git commit -m "feat: create dynamic booking request page"
```

---

## WEEK 3: Confirmation & Deployment (Days 11-15)

### Task 12: Create BookingStatus Confirmation Page

**Files:**
- Create: `app/bookings/[bookingId]/_components/BookingStatus.tsx`
- Create: `app/bookings/[bookingId]/page.tsx`

**Steps:**

- [ ] **Step 1: Write BookingStatus component**

File: `app/bookings/[bookingId]/_components/BookingStatus.tsx`

```typescript
'use client'

import Link from 'next/link'
import type { Booking } from '@shared/lib/types'

interface BookingStatusProps {
  booking: Booking
  creatorName: string
}

export function BookingStatus({ booking, creatorName }: BookingStatusProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-slate-50 text-slate-700 border-slate-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Booking Requested! ✓</h1>
        <p className="text-slate-600">Your request has been sent to {creatorName}</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Project:</span>
              <span className="font-medium">{booking.project_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Creator:</span>
              <span className="font-medium">{creatorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Duration:</span>
              <span className="font-medium">
                {booking.start_date} to {booking.end_date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Budget:</span>
              <span className="font-bold text-purple-600">
                €{booking.budget?.toFixed(2) || 'TBD'}
              </span>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-4 border ${statusColors[booking.status]}`}>
          <p className="font-semibold capitalize">{booking.status.replace('_', ' ')}</p>
          <p className="text-sm mt-1">
            {booking.status === 'pending'
              ? 'The creator will review your request and contact you shortly'
              : 'Check your email for updates'}
          </p>
        </div>
      </div>

      {booking.project_description && (
        <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Project</h2>
          <p className="text-slate-700">{booking.project_description}</p>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/"
          className="inline-block bg-purple-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-purple-700 transition-colors"
        >
          Browse More Creators
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write booking confirmation page**

File: `app/bookings/[bookingId]/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@shared/lib/supabase'
import type { Booking, Profile } from '@shared/lib/types'
import { BookingSchema, ProfileSchema } from '@shared/lib/schemas'
import { BookingStatus } from './_components/BookingStatus'
import { LoadingSpinner } from '@/app/_components/LoadingSpinner'

export default function BookingConfirmationPage() {
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [creator, setCreator] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true)

        // Fetch booking
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()

        if (bookingError) throw bookingError

        const validatedBooking = BookingSchema.parse(bookingData)
        setBooking(validatedBooking)

        // Fetch creator
        const { data: creatorData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', validatedBooking.profile_id)
          .single()

        if (creatorData) {
          const validatedCreator = ProfileSchema.parse(creatorData)
          setCreator(validatedCreator)
        }
      } catch (err) {
        console.error('Failed to fetch booking:', err)
        setError('Booking not found')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) return <LoadingSpinner />
  if (error || !booking) {
    return <div className="text-center text-red-600 py-12">{error || 'Booking not found'}</div>
  }

  return (
    <BookingStatus booking={booking} creatorName={creator?.name || 'Creator'} />
  )
}
```

- [ ] **Step 3: Test builds**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 4: Commit**

```bash
git add app/bookings/[bookingId]/_components/BookingStatus.tsx app/bookings/[bookingId]/page.tsx
git commit -m "feat: add booking confirmation page with status display"
```

---

### Task 13: Polish & Error Handling

**Files:**
- Modify: Various component files for better error boundaries
- Modify: `app/layout.tsx` for global error handling

**Steps:**

- [ ] **Step 1: Add global error handling to layout**

Update `app/layout.tsx`:

```typescript
'use client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ... existing code
    <ErrorBoundary>
      <main>{children}</main>
    </ErrorBoundary>
  )
}
```

Create simple ErrorBoundary:

```typescript
'use client'

import { ReactNode } from 'react'

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return <>{children}</>
  // In real app, wrap with try/catch
}
```

- [ ] **Step 2: Add responsive media queries to globals.css**

```css
@media (max-width: 640px) {
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Test on mobile (using dev tools)**

Run: `npm run dev`
Expected: Page responds correctly on mobile

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "refactor: improve error handling and mobile responsiveness"
```

---

### Task 14: Deployment Setup & Testing

**Files:**
- Verify: `vite.config.ts`
- Verify: `.env.local` (local only, not committed)

**Steps:**

- [ ] **Step 1: Create .env.local (not committed)**

```env
VITE_SUPABASE_URL=https://uytihmscyjpwpdhqvnbw.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_BASE44_API_URL=https://agence-de-booking-crud-ec63fc9d.base44.app/api
VITE_BASE44_API_KEY=<your-api-key>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build completes without errors

- [ ] **Step 3: Verify type check**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: Tests pass (60%+ coverage)

- [ ] **Step 5: Commit .env.example**

Create `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BASE44_API_URL=https://your-crm.base44.app/api
VITE_BASE44_API_KEY=your-api-key
```

```bash
git add .env.example
git commit -m "docs: add environment variables example"
```

---

### Task 15: Deploy to Cloudflare Workers

**Files:**
- Verify: `wrangler.json`
- Verify: Cloudflare account setup

**Steps:**

- [ ] **Step 1: Verify Cloudflare config**

File: `wrangler.json` (should already exist)

```json
{
  "name": "fantazi-land",
  "main": "dist/server/index.js",
  "site": {
    "bucket": "./dist/client"
  },
  "build": {
    "cwd": ".",
    "command": "npm run build"
  },
  "env": {
    "production": {
      "name": "fantazi-land-prod",
      "route": "fantazi-land.pages.dev"
    }
  }
}
```

- [ ] **Step 2: Login to Cloudflare**

Run: `npx wrangler login`
Expected: Opens browser, authenticates

- [ ] **Step 3: Deploy**

Run: `npm run deploy`
Expected: Deployment succeeds, URL provided

- [ ] **Step 4: Verify live site**

Open: `https://fantazi-land.pages.dev`
Expected: Browse page loads, profiles display

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: deploy MVP to Cloudflare Workers

✓ Browse profiles from Supabase
✓ Filter by category
✓ View creator detail page
✓ Submit booking requests
✓ Confirmation page
✓ Live at https://fantazi-land.pages.dev"
```

---

## VERIFICATION CHECKLIST (Week 3)

- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Deployed to Cloudflare (`npm run deploy`)
- [ ] Browse profiles page works
- [ ] Profile detail pages load
- [ ] Booking form submits
- [ ] Confirmation page displays
- [ ] Mobile-responsive ✓
- [ ] No console errors
- [ ] Coverage meets 60%+

---

## Execution Handoff

Plan complete and saved to `docs/IMPLEMENTATION-WEB-MVP.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints

**Which approach?**
