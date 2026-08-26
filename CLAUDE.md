# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📋 Projet: Fantazi-Land — Plateforme de Booking pour Créatrices de Contenu

**Description :** Application web full-stack pour une agence de créatrices de contenu permettant de lister, filtrer, créer et synchroniser les profils des créatrices à travers trois canaux d'intégration (Web Form, CSV Import, Storage Webhooks).

**Statut :** Architecture en cours de conception  
**Responsable :** Architecte Full-Stack & Lead Developer  
**Date de création :** 2026-08-26

---

## 🏗️ Architecture Globale

### Stack Technique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Front-end** | Next.js 14+ (App Router) | SSR pour marketing, CSR pour app interactive |
| **Styling** | Tailwind CSS v3+ | Responsive design mobile-first, atomic design |
| **Animations** | Framer Motion | Interactions fluides, micro-animations |
| **Back-end** | Supabase Edge Functions | Serverless, native PostgreSQL, webhooks |
| **Base de Données** | PostgreSQL (Supabase) | Relationnelle, RLS, transactions ACID |
| **Authentification** | Supabase Auth | OAuth intégré, JWT, session management |
| **Stockage** | Supabase Storage | Bucket-based, webhooks, permissions granulaires |
| **Langage** | TypeScript | Type-safety, DX amélioré |
| **Validation** | Zod / Yup | Runtime validation, schémas strictes |
| **HTTP Client** | @supabase/supabase-js | Client officiel, subscriptions real-time |
| **État** | Zustand / React Context | Lightweight, no boilerplate |
| **Testing** | Vitest + Playwright | Unit/Integration/E2E coverage |
| **Déploiement** | Vercel + Supabase | Edge functions, auto-scaling, CDN global |

---

## 📁 Structure des Dossiers

```
fantazi-land/
├── .claude/
│   ├── settings.json              # Configuration Claude Code
│   └── rules/                      # Rules personnalisées si besoin
│
├── app/                            # Next.js 14 App Router
│   ├── (public)/                   # Layout public (Marketing)
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Home - Listing profiles (SSR)
│   │   ├── profiles/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Profile detail view
│   │   └── about/
│   │       └── page.tsx            # À propos / Marketing
│   │
│   ├── (dashboard)/                # Layout protégé (App)
│   │   ├── layout.tsx              # Navbar, sidebar, auth check
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard créatrice
│   │   ├── profile/
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # View profil
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit profil
│   │   ├── gallery/
│   │   │   ├── page.tsx            # Galerie médias
│   │   │   └── [id]/page.tsx
│   │   ├── bookings/
│   │   │   └── page.tsx            # Historique projets
│   │   ├── reviews/
│   │   │   └── page.tsx            # Avis clients
│   │   └── settings/
│   │       └── page.tsx            # Paramètres compte
│   │
│   ├── admin/                      # Routes admin protégées
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Dashboard admin
│   │   ├── profiles/
│   │   │   ├── page.tsx            # Gestion tous les profils
│   │   │   ├── create/page.tsx     # Création manuelle
│   │   │   └── import-csv/page.tsx # Import CSV batch
│   │   ├── failed-syncs/
│   │   │   └── page.tsx            # Dead Letter Queue dashboard
│   │   └── logs/
│   │       └── page.tsx            # Sync logs & monitoring
│   │
│   ├── api/                        # API Routes (serverless)
│   │   ├── profiles/
│   │   │   ├── create/route.ts     # POST /api/profiles/create
│   │   │   ├── update/route.ts     # PUT /api/profiles/[id]
│   │   │   ├── import-csv/route.ts # POST /api/profiles/import-csv
│   │   │   ├── [id]/route.ts       # GET /api/profiles/[id]
│   │   │   └── [id]/delete/route.ts# DELETE /api/profiles/[id]
│   │   ├── upload/
│   │   │   └── route.ts            # POST /api/upload (images)
│   │   ├── auth/
│   │   │   ├── callback/route.ts   # OAuth callback
│   │   │   └── logout/route.ts     # Logout
│   │   └── webhooks/
│   │       └── storage-sync/route.ts# Webhook handler Storage
│   │
│   ├── layout.tsx                  # Root layout global
│   └── globals.css                 # Tailwind + custom styles
│
├── components/
│   ├── atoms/                      # Composants atomiques
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── StarRating.tsx
│   │   ├── Avatar.tsx
│   │   └── Icon.tsx
│   │
│   ├── molecules/                  # Composants composés (2-3 atoms)
│   │   ├── ProfileCard.tsx         # Carte profile (list view)
│   │   ├── SocialLinks.tsx         # Liens réseaux sociaux
│   │   ├── StatsCard.tsx           # Cartes stats
│   │   ├── FilterChip.tsx          # Chips filtrables
│   │   └── SearchBar.tsx
│   │
│   ├── organisms/                  # Composants complexes
│   │   ├── ProfileHero.tsx         # Hero section detail page
│   │   ├── MediaGallery.tsx        # Galerie dynamique
│   │   ├── ReviewSection.tsx       # Section avis + form
│   │   ├── BookingHistory.tsx      # Historique projets
│   │   ├── ProfileFilters.tsx      # Filtres + recherche
│   │   ├── ProfileGrid.tsx         # Grid animée
│   │   ├── ProfileForm.tsx         # Form création/édition
│   │   ├── CSVImporter.tsx         # Import CSV drag-drop
│   │   └── FailedSyncsTable.tsx    # DLQ table
│   │
│   ├── sections/                   # Sections de page
│   │   ├── HeroSection.tsx         # Hero marketing
│   │   ├── FeaturesSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── CTASection.tsx
│   │
│   ├── navigation/
│   │   ├── Navbar.tsx              # Header public
│   │   ├── Sidebar.tsx             # Sidebar app
│   │   └── Footer.tsx
│   │
│   └── layout/
│       ├── PublicLayout.tsx        # Wrapper layout public
│       └── DashboardLayout.tsx     # Wrapper layout app
│
├── lib/
│   ├── supabase.ts                 # Supabase client config
│   ├── types.ts                    # Types TypeScript centralisés
│   ├── constants.ts                # Constantes (CATEGORIES, etc)
│   ├── schemas.ts                  # Zod/Yup validation schemas
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useProfiles.ts          # Hook fetch profiles
│   │   ├── useProfile.ts           # Hook single profile
│   │   ├── useAuth.ts              # Hook authentification
│   │   ├── useRealtime.ts          # Hook Supabase realtime
│   │   └── usePagination.ts        # Hook pagination
│   │
│   ├── utils/
│   │   ├── formatters.ts           # Format dates, prix, etc
│   │   ├── validators.ts           # Validation formulaires
│   │   ├── helpers.ts              # Fonctions utilitaires
│   │   └── api-client.ts           # Client API wrapper
│   │
│   └── store/                      # État global (Zustand)
│       └── appStore.ts             # Store principal
│
├── supabase/
│   ├── migrations/                 # SQL migrations (versionnées)
│   │   ├── 001_init_profiles.sql
│   │   ├── 002_add_media_assets.sql
│   │   ├── 003_add_reviews.sql
│   │   ├── 004_add_bookings.sql
│   │   ├── 005_add_performance_stats.sql
│   │   ├── 006_add_rls_policies.sql
│   │   └── 007_add_failed_syncs.sql
│   │
│   ├── functions/                  # Edge Functions (Deno/TypeScript)
│   │   ├── sync-storage-to-db-v2/
│   │   │   └── index.ts            # Storage → DB avec retry
│   │   ├── sync-db-to-storage/
│   │   │   └── index.ts            # DB → Storage
│   │   ├── retry-failed-syncs/
│   │   │   └── index.ts            # CRON retry handler
│   │   └── README.md               # Deploy instructions
│   │
│   ├── seed.sql                    # Data de test/démo
│   └── config.toml                 # Supabase CLI config
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero.jpg
│   │   └── placeholder.svg
│   └── fonts/
│       └── custom.woff2
│
├── styles/
│   ├── globals.css                 # Tailwind + custom CSS
│   └── animations.css              # Animations réutilisables
│
├── tests/
│   ├── unit/
│   │   ├── utils.test.ts
│   │   └── validators.test.ts
│   ├── integration/
│   │   └── profiles.api.test.ts
│   └── e2e/
│       ├── home-page.spec.ts
│       ├── profile-creation.spec.ts
│       └── csv-import.spec.ts
│
├── scripts/
│   ├── deploy.sh                   # Script déploiement
│   ├── migrate.sh                  # Script migrations
│   └── seed.sh                     # Script seeding data
│
├── docs/
│   ├── ARCHITECTURE.md             # Documentation architecture
│   ├── API.md                      # API documentation
│   ├── DATABASE.md                 # Schema & RLS policies
│   ├── DEPLOYMENT.md               # Guide déploiement
│   └── TROUBLESHOOTING.md          # Debugging guide
│
├── .env.example                    # Exemple variables d'env
├── .env.local                      # ⚠️ LOCAL ONLY (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── vercel.json
├── supabase.json
└── README.md
```

---

## 🗄️ Schéma de Base de Données (Clés)

### Tables Principales

```sql
-- 1. Profils (créatrices)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  base_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  instagram_url TEXT,
  tiktok_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  availability_calendar JSONB, -- { "2024-09": 5, "2024-10": 8 }
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  synced_at TIMESTAMP,
  storage_folder_id TEXT UNIQUE
);

-- 2. Médias
CREATE TABLE media_assets (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT, -- "image", "video", "document"
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Avis
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. Projets/Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id),
  project_title TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 5. Statistiques de performance
CREATE TABLE performance_stats (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_projects INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  response_time_hours INTEGER,
  completion_rate DECIMAL(5,2), -- 0-100
  updated_at TIMESTAMP DEFAULT now()
);

-- 6. Dead Letter Queue (erreurs)
CREATE TABLE failed_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- "storage_to_db", "db_to_storage", "webhook_error"
  source_data JSONB NOT NULL,
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_attempted_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  status TEXT DEFAULT 'pending', -- pending, retrying, failed, resolved
  resolved_at TIMESTAMP
);

-- 7. Sync logs (audit trail)
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sync_type TEXT NOT NULL, -- "storage_to_db", "db_to_storage"
  source_data JSONB,
  result_data JSONB,
  status TEXT DEFAULT 'success', -- success, error, partial
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- 8. User Roles (permissions)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- "client", "creator", "admin"
  created_at TIMESTAMP DEFAULT now()
);
```

**RLS Policies :**
- Clients voient tous les profils publics
- Créatrices voient/éditent leur propre profil
- Admins ont accès complet
- Voir `supabase/migrations/006_add_rls_policies.sql`

---

## 🔄 Flux de Synchronisation (3 Canaux)

### Canal 1 : Web Form (Principal)

```
Admin/Créatrice → ProfileForm → POST /api/profiles/create
  ↓
  Valider + Upload avatar
  ↓
  INSERT profiles (DB)
  ↓
  Trigger: update_profiles_updated_at
  ↓
  Edge Function: sync-db-to-storage
  ↓
  CREATE /profiles/NAME_CATEGORY_BASE64JSON/ (Storage)
  ↓
  ✅ Visible sur homepage
```

### Canal 2 : CSV Import (Batch)

```
Admin → CSVImporter → POST /api/profiles/import-csv
  ↓
  Parse + Validate
  ↓
  Batch INSERT (transaction)
  ↓
  Edge Functions: sync-db-to-storage (x N parallel)
  ↓
  CREATE folders (Storage)
  ↓
  ✅ N profils visibles sur homepage
```

### Canal 3 : Storage Webhook (Backup/Sync)

```
Admin crée dossier → Webhook Storage
  ↓
  POST sync-storage-to-db-v2
  ↓
  Parse JSON du nom du dossier
  ↓
  INSERT ou UPDATE profiles (DB)
  ↓
  ✅ Profil synchronisé
```

### Gestion des Erreurs & Résilience

```
Erreur lors de sync
  ↓
  INSERT failed_syncs (DLQ)
  ↓
  Log dans sync_logs
  ↓
  Admin dashboard : voir l'erreur
  ↓
  Cron: retry-failed-syncs (exponential backoff)
  ↓
  Max 3 tentatives → si toujours fail, marquer "failed"
  ↓
  Admin peut corriger et re-soumettre
```

---

## 🚀 Commandes de Développement

### Installation & Setup

```bash
# Clone du repo
git clone <repo-url> fantazi-land
cd fantazi-land

# Install dépendances
npm install

# Setup env vars
cp .env.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc

# Init Supabase (si local)
npx supabase init
npx supabase start

# Run migrations
npx supabase migration up

# Seed data
npm run db:seed
```

### Développement

```bash
# Dev server Next.js (port 3000)
npm run dev

# Dev server Supabase local
npx supabase start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

### Testing

```bash
# Unit + Integration tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:ui  # Playwright UI

# Single E2E file
npx playwright test tests/e2e/home-page.spec.ts
```

### Build & Déploiement

```bash
# Build optimisé
npm run build

# Preview build localement
npm run preview

# Deploy Edge Functions
npx supabase functions deploy sync-storage-to-db-v2
npx supabase functions deploy sync-db-to-storage
npx supabase functions deploy retry-failed-syncs

# Deploy sur Vercel
vercel deploy --prod

# Migrations en prod
npx supabase migrations up --linked
```

### Database & Migrations

```bash
# Créer une nouvelle migration
npx supabase migration new <name>

# Voir status des migrations
npx supabase migration list

# Rollback dernière migration
npx supabase migration down

# Générer types TypeScript depuis schema
npx supabase gen types typescript --local > lib/database.types.ts
```

---

## 📊 Cas d'Usage Concret

**Scénario complet :** Marina Dupont crée son profil via formulaire web, l'admin importe 5 créatrices via CSV, un client visite la homepage et filtre par catégorie.

**Voir détails complets dans :** `SECTION 7` du brainstorming (cas d'usage détaillé avec timeline, métadonnées, et flux technique).

**Étapes clés :**
1. Création Marina → Web Form → INSERT DB → CREATE Storage folder
2. Import CSV (5 créatrices) → Batch INSERT → Parallel syncs
3. Homepage SSR fetch profiles + Client-side filters
4. Erreurs enregistrées dans DLQ et visibles en admin dashboard

---

## 🔐 Authentification & Permissions

### Flow OAuth (Supabase Auth)

```
Client → /auth/login → Supabase OAuth
  ↓
  Callback → /api/auth/callback
  ↓
  Create session + JWT token
  ↓
  Redirect /dashboard
  ↓
  ✅ Authentifié
```

### Roles & RLS

- **Client** : Voit profils publics uniquement
- **Creator** : Voit/édite son profil + galerie + bookings
- **Admin** : Accès complet (gestion tous profils, logs, DLQ)

Voir `supabase/migrations/006_add_rls_policies.sql` pour implémentation RLS complète.

---

## 📈 Performance & Optimisations

### Front-end

- **SSR/SSG** : Home page générée statiquement (ISR)
- **Image optimization** : Next.js Image component avec lazy loading
- **Code splitting** : Dynamic imports pour composants lourds
- **Caching** : SWR + Supabase subscriptions pour data real-time
- **Bundle size** : Tree-shaking, minification Tailwind

### Back-end

- **Database indexing** : Index sur `profile_id`, `created_at`, `category`
- **Query optimization** : Avoid N+1 via `.select()` joins
- **Edge Functions** : Deno runtime, colocation data
- **Rate limiting** : Middleware sur API routes sensibles

### Storage

- **CDN global** : Vercel Edge Network
- **Image compression** : Redimensionner côté serveur
- **Webhooks async** : Non-blocking pour sync

---

## 🧪 Testing Strategy

### Unit Tests
- Formatters, validators, helpers
- Hooks (useProfiles, useAuth)
- Zod schemas

### Integration Tests
- API routes (create, update, import-csv)
- Supabase client interactions
- Edge Functions avec mock requests

### E2E Tests
- Home page : chargement, filtres, recherche
- Profile creation : form validation, upload, sync
- CSV import : parse, validation, batch insert
- Admin dashboard : DLQ management

**Voir :** `tests/` directory structure

---

## 📝 Important Notes

### ⚠️ Secrets & Environment Variables

**JAMAIS commiter :**
- `.env.local` (tokens Supabase, clés API)
- `SUPABASE_SERVICE_ROLE_KEY` (read/write admin)
- Credentials AWS, Stripe, etc.

**À mettre dans Vercel Secrets :**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Autres tokens API

### 📦 Dependencies à Connaître

| Package | Raison |
|---------|--------|
| `@supabase/supabase-js` | Client officiel Supabase |
| `@supabase/auth-helpers-nextjs` | Auth middleware Next.js |
| `zod` | Schema validation runtime |
| `framer-motion` | Animations React |
| `zustand` | État global léger |
| `papaparse` | Parse CSV |
| `date-fns` | Manipulation dates |
| `lucide-react` | Icons SVG |

### 🔍 Debugging Tips

1. **Supabase Logs** : Dashboard → Logs (Edge Functions errors)
2. **Network Tab** : DevTools → voir requests/responses
3. **Supabase Studio** : Inspect DB directly (tables, RLS, data)
4. **Vercel Logs** : Dashboard → Deployments → Logs
5. **Local dev** : `npx supabase logs` pour Edge Functions

---

## 📚 Documentation Complète

- **`docs/ARCHITECTURE.md`** : Diagrammes & design decisions
- **`docs/API.md`** : Endpoints API avec examples
- **`docs/DATABASE.md`** : Schema complet + RLS policies
- **`docs/DEPLOYMENT.md`** : Checklist déploiement prod
- **`docs/TROUBLESHOOTING.md`** : Solutions erreurs communes

---

## 🛠️ Maintenance & Monitoring

### Checklist Régulière

- [ ] Vérifier DLQ dashboard (failed syncs)
- [ ] Monitorer Edge Functions logs
- [ ] Vérifier storage usage (Supabase)
- [ ] Tester RLS policies (sécurité)
- [ ] Review sync_logs (performances)

### Alerting

- Dead Letter Queue : Si > 10 failed syncs non-résolus
- API latency : Si > 500ms moyenne
- Storage quota : Si > 80% utilisé
- Database connections : Si > 90% utilisées

---

## 🚦 Status du Projet

| Composant | Status | Notes |
|-----------|--------|-------|
| Architecture | ✅ Complète | Design validé |
| DB Schema | ✅ Finalisé | Migrations versionnées |
| API Routes | 🟡 En cours | CRUD profiles OK, auth à finir |
| Edge Functions | 🟡 En cours | sync-storage-to-db v2 OK, retry handler en dev |
| Front-end Components | 🟡 En cours | Atoms/Molecules OK, organisms en dev |
| Authentification | 🟡 En cours | Setup Supabase Auth |
| Testing | ❌ À faire | Setup Vitest + Playwright |
| Déploiement | ❌ À faire | Setup Vercel + Supabase prod |

---

## 👥 Contact & Support

**Architecte Principal :** Claude Code  
**Stack :** Next.js 14, Supabase, Tailwind CSS, TypeScript  
**Mode de collaboration :** Brainstorming → Design → Implementation → Testing → Deployment

Pour questions architecturales ou modifications : cf. `docs/ARCHITECTURE.md`

---

**Last Updated :** 2026-08-26  
**Version :** 1.0-design (architecture finalisée, implémentation en cours)
