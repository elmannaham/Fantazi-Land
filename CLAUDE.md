# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📋 Projet: Fantazi-Land — Plateforme & Agence de Booking pour Hôtesses d'Exception

### ⚠️ Monorepo Structure
This repository contains **two separate projects**:
1. **Web platform** (this root directory) — Next.js 14.2 booking platform for browsers
2. **Mobile companion** (`fantazi-land-mobile/`) — Expo 57 React Native app for iOS/Android

Each project has its own `package.json`, dependencies, and build pipeline. See `fantazi-land-mobile/CLAUDE.md` for mobile-specific guidance. **Web and mobile share the same Supabase backend** but maintain separate codebases.

**Description :** Application web full-stack de pointe pour une agence d'hôtesses et d'égéries de marque. Elle offre un site vitrine avec animations 21st.dev, une galerie photos interactive issue du bucket Supabase Storage (`HOTESS`), un système de réservation avec modal interactif et devis en temps réel, un moteur de synchronisation automatique et une intégration avec le CRM Base44.

**Statut :** Version 1.0.2 (Main Official Release) — Production-ready & Image Optimized  
**Mainteneur :** Lead Developer & Claude Code  
**Date de dernière mise à jour :** 2026-08-29  

---

## 🚦 Statut d'Implémentation & Architecture

| Composant | Status | Notes |
|---|---|---|
| **Design System & UI 21st.dev** | ✅ Complète | Hero gradient glow, Bento Grid, 1:1 Avatar Profile Grid, Category Filter Pills |
| **Galerie Photos Exclusive** | ✅ Complète | `/portfolio` : Photos réelles du bucket `HOTESS`, ordre aléatoire, vue 3D cylindrique, Lightbox HD |
| **Modal de Réservation** | ✅ Complète | `BookingModal.tsx` : Date picker, slider de durée, tarification live, soumission API |
| **Moteur de Synchronisation Storage** | ✅ Complète | `sync.service.ts` : Scan asynchrone parallèle, parsing `descrip.json`/`txt`, cache TTL 30s |
| **API Routes & Admin Monitoring** | ✅ Complète | `/api/profiles`, `/api/bookings`, `/api/reviews`, `/api/admin/sync`, `/admin` |
| **Multi-Plateforme Deployment** | ✅ Prêt | Configs prêtes : Vercel (`vercel.json`), Base44 (`Dockerfile`), Cloudflare (`wrangler.toml`), Render (`render.yaml`), Wasmer (`wasmer.toml`) |

---

## 🏗️ Stack Technique

- **Front-end** : Next.js 14.2 (App Router), React 18, Tailwind CSS v3.4, Framer Motion v11.3, Lucide Icons.
- **Back-end & API** : Next.js API Routes (Node.js runtime), Zod v3.23 (validation runtime).
- **ORM & Base de Données** : Prisma 5.18 (schema generation), PostgreSQL (Supabase), Supabase Storage (Bucket `HOTESS`).
- **CRM & Workflows** : Base44 REST API (App ID: `6a8ea8ad929a72d7ec63fc9d`).
- **Tests & Qualité** : TypeScript 5.5 (strict mode), Vitest (unit/integration), Playwright (E2E), ESlint, Prettier.

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de l'environnement
Créer `.env.local` à la racine du projet :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uytihmscyjpwpdhqvnbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Prisma Database URL (PostgreSQL via Supabase)
DATABASE_URL=postgresql://<user>:<password>@db.uytihmscyjpwpdhqvnbw.supabase.co:5432/postgres

# Base44 CRM
BASE44_API_URL=https://agence-de-booking-crud-ec63fc9d.base44.app/api
BASE44_API_KEY=<api_key>

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Initialisation de la base de données
```bash
# Generate Prisma client
npm run prisma:generate

# Generate database types from Supabase (optional)
npm run db:types

# Start Supabase local dev (if using local development)
npm run db:start
```

### 4. Lancer l'application
```bash
npm run dev
```
L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

---

## 📋 Commandes Essentielles

### Développement
```bash
npm run dev              # Lancer le serveur de développement (Next.js)
npm run build            # Build de production
npm run start            # Lancer le serveur de production
npm run preview          # Build + serveur local production
```

### Vérification de la qualité du code
```bash
npm run type-check       # Vérifier les types TypeScript (strict mode, 0 erreur requis)
npm run lint             # ESLint check
npm run lint:fix         # ESLint fix (auto-correction)
npm run format           # Prettier format
npm run format:check     # Prettier check (sans modifier)
```

### Tests
```bash
npm run test             # Tests unitaires + intégration (Vitest, run mode)
npm run test:watch      # Tests en mode watch
npm run test:coverage   # Tests + rapport de couverture (80% minimum requis)
npm run test:e2e        # Tests E2E (Playwright, tous les navigateurs)
npm run test:e2e:ui     # Tests E2E avec UI (debug mode)
npm run test:e2e:headed # Tests E2E en mode headed (visualiser le navigateur)
```

### Base de données
```bash
npm run db:start        # Lancer PostgreSQL local + Supabase (dev mode)
npm run db:stop         # Arrêter PostgreSQL local
npm run db:reset        # Reset complet de la DB (destructif)
npm run db:seed         # Seed la DB (reset + seeds)
npm run db:types        # Générer les types TypeScript depuis Supabase
npm run db:studio       # Ouvrir Supabase Studio (Web UI)
npm run db:migrate      # Appliquer les migrations
npm run db:migrate:new  # Créer une nouvelle migration
```

### Prisma ORM
```bash
npm run prisma:generate # Générer le client Prisma
npm run prisma:push     # Synchroniser le schema.prisma avec la base de données
npm run prisma:pull     # Importer le schema depuis la base de données existante
```

### Déploiement
```bash
npm run deploy:vercel   # Déployer en production sur Vercel
npm run deploy:functions # Déployer les Edge Functions Supabase
```

### Synchronisation
```bash
node scripts/sync-all-storage-profiles.cjs # Sync complet du bucket HOTESS
```

---

## 🏛️ Architecture & Patterns

### Layered Architecture
The project uses **Repositories → Services → API Routes** for clean separation of concerns:

```
┌─────────────────────────────────────────┐
│  Components (UI only)                   │ ← React components call hooks/API
├─────────────────────────────────────────┤
│  API Routes (HTTP endpoints)            │ ← Receive request, call service
├─────────────────────────────────────────┤
│  Services (Business Logic)              │ ← Validation, orchestration, errors
├─────────────────────────────────────────┤
│  Repositories (Data Access)             │ ← Prisma queries, return domain models
├─────────────────────────────────────────┤
│  Database (PostgreSQL via Supabase)     │ ← Single source of truth
└─────────────────────────────────────────┘
```

- **Repositories** (`lib/repositories/`) : Direct database access via Prisma, return domain models
  - Methods: `findAll()`, `findById()`, `create()`, `update()`, `delete()`
  - Example: `profileRepository.findById(id)` → `Profile | null`

- **Services** (`lib/services/`) : Business logic, validation, orchestration of repositories
  - Validate input with Zod schemas
  - Handle errors explicitly (throw with meaningful messages)
  - Orchestrate multiple repositories if needed
  - Example: `bookingService.create(data)` → validates input, checks dates, calls repository

- **API Routes** (`app/api/`) : HTTP endpoints, delegate to services, return typed responses
  - Parse request body with Zod
  - Call service, catch errors
  - Return typed JSON response via schema

- **Components** (`components/`) : UI rendering only, accept props, call API via hooks
  - No direct database access
  - No business logic
  - Hooks for async data loading

### Repository Pattern Example

```typescript
// lib/repositories/profiles.ts
import { prisma } from '@/lib/prisma'
import { ProfileSchema, type Profile } from '@/lib/types'

export class ProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    const row = await prisma.profile.findUnique({ where: { id } })
    return row ? ProfileSchema.parse(row) : null
  }

  async findAll(limit = 50, offset = 0): Promise<Profile[]> {
    const rows = await prisma.profile.findMany({ take: limit, skip: offset })
    return rows.map(r => ProfileSchema.parse(r))
  }

  async create(data: unknown): Promise<Profile> {
    const validated = ProfileCreateSchema.parse(data)
    const row = await prisma.profile.create({ data: validated })
    return ProfileSchema.parse(row)
  }
}

export const profileRepository = new ProfileRepository()
```

### Service Pattern Example

```typescript
// lib/services/bookings.ts
import { bookingRepository } from '@/lib/repositories/bookings'
import { profileRepository } from '@/lib/repositories/profiles'
import { BookingCreateSchema, BookingResponseSchema } from '@/lib/schemas'

export class BookingService {
  async create(data: unknown) {
    // 1. Validate input
    const validated = BookingCreateSchema.parse(data)
    
    // 2. Check business rules
    const profile = await profileRepository.findById(validated.profileId)
    if (!profile) throw new Error('Profile not found')
    
    if (validated.endDate <= validated.startDate) {
      throw new Error('End date must be after start date')
    }
    
    // 3. Delegate to repository
    const booking = await bookingRepository.create(validated)
    
    // 4. Return validated response
    return BookingResponseSchema.parse(booking)
  }
}

export const bookingService = new BookingService()
```

### API Route Pattern Example

```typescript
// app/api/bookings/route.ts
import { bookingService } from '@/lib/services/bookings'
import { BookingResponseSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const booking = await bookingService.create(data)
    
    return Response.json(
      { success: true, data: booking },
      { status: 201 }
    )
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
```

### Data Validation
- **Zod schemas** (`lib/schemas.ts`) : Runtime validation for all user input and API responses
- Infer TypeScript types from schemas with `z.infer<typeof schema>`
- Validate at system boundaries (API routes before services) to ensure type safety

### Supabase + Prisma Integration
- **PostgreSQL** accessed via Prisma ORM (`schema.prisma`)
- **Supabase Storage** (`HOTESS` bucket) accessed via `@supabase/supabase-js`
- **RLS Policies** on PostgreSQL tables for row-level security
- Generate types from Supabase with `npm run db:types` (overwrites `lib/database.types.ts`)
- **Never commit `.env` or `DATABASE_URL`** — use `.env.local` for local development

### Naming Conventions
- **Files/Components**: `PascalCase` for React components (`.tsx`), `camelCase` for utilities (`.ts`)
- **Variables/Functions**: `camelCase`
- **Interfaces/Types**: `PascalCase` (e.g., `ProfileType`, `BookingResponse`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Repository classes**: `PascalCase` + `Repository` suffix (e.g., `ProfileRepository`)

---

## 📋 Code Quality Standards

### Pre-commit Requirements (MANDATORY)
Before any commit:
- [ ] `npm run type-check` passes (0 TypeScript errors)
- [ ] `npm run lint` passes (no ESLint violations)
- [ ] `npm run format:check` passes (Prettier alignment)
- [ ] `npm run test:coverage` ≥ 80% coverage
- [ ] No hardcoded secrets or API keys
- [ ] No `console.log`, `console.warn`, or `console.error` in production code

### Key Rules
- **Immutability**: Use spread operator for state updates, never mutate objects
- **Error Handling**: Explicit error handling at all levels, never silently swallow errors
- **Input Validation**: Validate ALL user input with Zod at API boundaries
- **Type Safety**: Strict TypeScript mode enabled; avoid `any` and `unknown`
- **No Mutation**: Prefer `const` and immutable patterns over mutable state

### Repository Pattern
All data access must go through repositories:

```typescript
// WRONG: Direct Prisma in a service
const user = await prisma.profile.findUnique({ where: { id } })

// CORRECT: Via repository
const user = await profileRepository.findById(id)
```

Repositories provide:
- `findAll(filters?)` → returns array
- `findById(id)` → returns single or null
- `create(data)` → returns created entity
- `update(id, data)` → returns updated entity
- `delete(id)` → returns void

---

## 📁 Structure des Dossiers

```
fantazi-land/
├── app/                            # Next.js 14 App Router
│   ├── (public)/                   # Pages publiques marketing
│   │   ├── layout.tsx              # Root public layout & Navbar
│   │   ├── page.tsx                # Accueil (Hero, Bento, Category Filters, 1:1 Profile Grid, Booking Modal)
│   │   ├── portfolio/page.tsx      # Galerie Photos exclusive du bucket (HD Grid, 3D Carousel, Lightbox)
│   │   ├── about/page.tsx          # Présentation agence & mission
│   │   ├── profiles/[id]/page.tsx  # Fiche détaillée hôtesse + portfolio dédié + réservation
│   │   └── profiles/create/page.tsx# Formulaire de création de profil hôtesse
│   ├── (dashboard)/                # Espace privé hôtesses (/dashboard)
│   ├── admin/                      # Espace administration & monitoring (/admin, /admin/profiles, /admin/activity)
│   └── api/                        # Routes API RESTful
│       ├── profiles/               # GET liste (support include=media_assets), POST création
│       ├── bookings/               # GET, POST réservations
│       ├── reviews/                # GET, POST avis clients
│       ├── admin/sync/             # GET statut, POST déclencheur de synchronisation du bucket
│       └── webhooks/storage-sync/  # Webhook reverse sync Storage
│
├── components/                     # Architecture Atomic Design & 21st.dev
│   ├── atoms/                      # Button, Badge, Card, Rating
│   ├── molecules/                  # CategoryFilterBar, KPICard
│   ├── organisms/                  # ProfileGrid (Avatars 1:1), BentoCreatorGrid, BookingModal, ProfileForm
│   ├── sections/                   # HeroSection, StatsSection, PortfolioTeaserSection
│   ├── navigation/                 # Navbar principale
│   └── ui/                         # 3D Cylinder Carousel (3d-carousel.tsx)
│
├── lib/                            # Logique métier & Services
│   ├── bucket-media.ts             # Registre dynamique des médias du bucket & utilitaires shuffle
│   ├── supabase.ts                 # Clients Supabase (Public & Service Role)
│   ├── types.ts                    # Interfaces TypeScript (Profile, MediaAsset, Booking, Review)
│   ├── schemas.ts                  # Schémas Zod de validation
│   ├── repositories/               # profiles, bookings, reviews, dlq repositories
│   └── services/                   # profiles, sync, bookings, reviews services
│
├── data/                           # Données locales synchronisées
│   └── creators-catalog.json       # Catalogue JSON synchronisé du bucket
│
├── scripts/                        # Scripts CLI
│   └── sync-all-storage-profiles.cjs # Synchronisation instantanée du bucket Supabase
│
├── docs/                           # Documentation technique
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md               # Guide complet Vercel, Base44, Cloudflare, Render, Wasmer
│
├── Dockerfile                      # Image multi-stage production standalone
├── render.yaml                     # Blueprint Render.com Web Service
├── wrangler.toml                   # Configuration Cloudflare Pages
├── wasmer.toml                     # Configuration Wasmer Edge
├── vercel.json                     # Configuration Vercel Edge & Serverless
└── package.json
```

---

## 🧪 Testing Strategy

### Test Types & Coverage
- **Unit Tests**: Vitest + React Testing Library (lib utilities, hooks, components logic)
- **Integration Tests**: API routes, database operations, service layer
- **E2E Tests**: Playwright (critical user flows: booking, admin sync)
- **Minimum Coverage**: 80% across lib/, components/ (enforced in CI/CD)

### Running Tests

```bash
# Single run (CI mode)
npm run test

# Watch mode (active development)
npm run test:watch

# With coverage report
npm run test:coverage

# E2E tests - all browsers
npm run test:e2e

# E2E debug UI
npm run test:e2e:ui

# E2E with visible browser
npm run test:e2e:headed
```

### Test Organization
```
tests/
  ├── setup.ts                 # Vitest setup (jsdom, mocks)
  ├── unit/                    # Unit tests for lib/ utilities
  │   ├── repositories/        # Test repository patterns (findById, create, etc.)
  │   ├── services/            # Test business logic, validation, error handling
  │   └── schemas/             # Test Zod schema validation
  ├── integration/             # API routes, services with DB
  │   ├── api/                 # Test API route behavior + response schemas
  │   └── services/            # Test services with mocked DB
  └── e2e/                     # Playwright critical flows
      ├── booking.spec.ts
      ├── admin-sync.spec.ts
      └── navigation.spec.ts
```

### Common Test Patterns

```typescript
// Unit test: Arrange-Act-Assert pattern
test('should_format_price_correctly', () => {
  // Arrange
  const price = 150
  
  // Act
  const result = formatPrice(price)
  
  // Assert
  expect(result).toBe('€150.00')
})

// API test with Zod validation
test('GET /api/profiles returns valid ProfileResponse[]', async () => {
  const response = await fetch('/api/profiles')
  const data = await response.json()
  
  expect(ProfileResponseSchema.array().safeParse(data).success).toBe(true)
})

// Service test with error handling
test('BookingService.create throws when dates are invalid', async () => {
  const service = new BookingService(mockRepository)
  
  await expect(
    service.create({ 
      profileId: '123', 
      startDate: new Date('2000-01-01'),
      endDate: new Date('2000-01-01')
    })
  ).rejects.toThrow('End date must be after start date')
})

// Repository test pattern
test('ProfileRepository.findById returns typed Profile', async () => {
  const profile = await profileRepository.findById('test-id')
  
  expect(profile).toMatchObject({
    id: 'test-id',
    name: expect.any(String),
    rate: expect.any(Number),
  })
  
  // Zod validation passes
  expect(ProfileSchema.safeParse(profile).success).toBe(true)
})
```

### Test Coverage Requirements

- **lib/repositories/** — 85%+ (data access layer must be reliable)
- **lib/services/** — 80%+ (business logic validation)
- **components/** — 70%+ (UI testing, avoid testing implementation details)
- **app/api/** — 80%+ (all happy paths + error cases)

---

## 🔄 Development Workflow

### Before Starting Work
1. Pull latest from main: `git pull origin main`
2. Create feature branch: `git checkout -b feat/description`
3. Install/update deps: `npm install`
4. Verify setup: `npm run type-check && npm run test` (should pass)

### While Developing
1. Keep dev server running: `npm run dev` (terminal 1)
2. Watch tests in another terminal: `npm run test:watch` (terminal 2)
3. Format on save: most editors run Prettier automatically
4. If adding DB changes: create migration `npm run db:migrate:new`, then `npm run db:push`

### Before Committing
```bash
# 1. Type check
npm run type-check

# 2. Lint & format
npm run lint:fix
npm run format

# 3. Run full test suite
npm run test:coverage  # Must be ≥ 80%

# 4. Run E2E on critical paths
npm run test:e2e

# 5. Commit
git add .
git commit -m "feat: description"
```

### Commit Message Format
```
<type>: <description>

<optional body with reasoning>

Types: feat, fix, refactor, docs, test, chore, perf
```

### Creating a Pull Request
1. Push: `git push origin feat/description`
2. Open PR on GitHub with:
   - Clear title (follows commit message format)
   - Description of changes and reasoning
   - Link to related issues
   - Test plan (what was tested, how to verify)
3. Wait for CI checks to pass (type-check, lint, tests)
4. Request review from team

---

## 🚢 Déploiement Multi-Plateforme

### 1. Vercel
- Fichier : [`vercel.json`](./vercel.json)
- Commande : `vercel deploy --prod`

### 2. Base44 App Engine
- Fichier : [`Dockerfile`](./Dockerfile) & [`.dockerignore`](./.dockerignore)
- Commande : `docker build -t fantazi-land:latest .`

### 3. Cloudflare Pages
- Fichier : [`wrangler.toml`](./wrangler.toml)
- Commande : `npx @cloudflare/next-on-pages && npx wrangler pages deploy .vercel/output/static`

### 4. Render.com
- Fichier : [`render.yaml`](./render.yaml)
- Déploiement automatique via Blueprint Git.

### 5. Wasmer
- Fichier : [`wasmer.toml`](./wasmer.toml)
- Commande : `wasmer deploy`

---

## 🔧 Troubleshooting

### TypeScript Errors After Pull
If you see TypeScript errors after pulling:
```bash
npm install           # Update deps
npm run prisma:generate  # Regenerate Prisma client
npm run type-check    # Re-check types
```

### Tests Fail with "Cannot find module"
```bash
npm run test:coverage  # Regenerates test cache
```

### Database Connection Issues
```bash
# Verify environment
cat .env.local | grep DATABASE_URL

# Ensure Supabase is running (if local dev)
npm run db:start

# Check Supabase credentials in .env.local
```

### Prisma Client Out of Sync
```bash
# Regenerate Prisma client
npm run prisma:generate

# Or if schema changed:
npm run prisma:push
```

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001  # Run on different port
```

### Node Version Mismatch
```bash
# Check required version
cat package.json | grep engines

# Use nvm to switch (if installed)
nvm use 18
```

---

## 📚 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js build config (image optimization, caching headers, output format) |
| `tsconfig.json` | TypeScript compiler options (strict mode enabled) |
| `vitest.config.ts` | Unit/integration test configuration (jsdom, coverage thresholds) |
| `playwright.config.ts` | E2E test configuration (browsers, base URL, server start) |
| `tailwind.config.ts` | Tailwind CSS theme & plugin configuration |
| `prisma/schema.prisma` | Database schema definition (tables, relations, RLS) |
| `.env.local` | Local environment variables (MUST NOT commit) |
| `lib/schemas.ts` | Zod validation schemas (runtime type safety) |
| `lib/repositories/` | Data access layer (repository pattern) |
| `lib/services/` | Business logic layer (validation, orchestration) |
| `app/api/` | HTTP API routes (entrypoint for services) |
| `components/` | React components (UI only, no business logic) |

---

## 🎓 Learning Resources

- **Next.js 14 App Router**: https://nextjs.org/docs/app
- **Prisma ORM**: https://www.prisma.io/docs/
- **Supabase**: https://supabase.com/docs
- **Zod Validation**: https://zod.dev/
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **React Testing Library**: https://testing-library.com/react
- **Tailwind CSS**: https://tailwindcss.com/docs
- **ECC Rules** (this project follows): `~/.claude/rules/ecc/`

---

## ❓ Questions or Issues?

- **API Question?** Check `docs/API.md` for endpoints and usage
- **Database Question?** Check `docs/DATABASE.md` for schema and migrations
- **Deployment Question?** Check `docs/DEPLOYMENT.md` for platform-specific guides
- **Architecture Question?** Check `docs/ARCHITECTURE.md` for system design
