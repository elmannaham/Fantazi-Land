# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📋 Projet: Fantazi-Land — Plateforme de Booking pour Créatrices de Contenu

**Description :** Application web full-stack pour une agence de créatrices de contenu permettant de lister, filtrer, créer et synchroniser les profils des créatrices à travers trois canaux d'intégration (Web Form, CSV Import, Storage Webhooks).

**Statut :** Architecture complète, implémentation avancée  
**Responsable :** Architecte Full-Stack & Lead Developer  
**Date de création :** 2026-08-26  
**Dernière mise à jour :** 2026-08-26

---

## 🚦 Statut d'Implémentation Actuel

| Composant | Status | Notes |
|-----------|--------|-------|
| Architecture & Design | ✅ Complète | Design validé, diagrammes actualisés |
| Schéma BD (Prisma + SQL) | ✅ Complète | 8 migrations SQL, Prisma schema finalisé avec indices |
| API Routes (CRUD) | ✅ Complète | Tous les endpoints implémentés avec validation Zod |
| Services & Repositories | ✅ Complète | Pattern couche métier établi (profiles, bookings, reviews, sync, base44-user) |
| Authentification & RBAC | ✅ Complète | Module `lib/auth.ts` complet : JWT, extraction token, vérification rôles |
| Edge Functions | ✅ Complète | 3 fonctions actives : sync-storage-to-db-v2, sync-db-to-storage, retry-failed-syncs |
| Base44 Integration | ✅ Complète | Atomic creation, error handling, DLQ retry system |
| Tests (Unit & Integration) | ✅ Complète | Phase 3: error handling, rollback, retry tests |
| Admin Dashboard (DLQ) | ✅ Complète | `/admin/failed-syncs` with manual retry/delete |
| Composants UI & Pages | 🟡 En cours | Atoms/Molecules OK, organisms + pages en développement |
| Déploiement Vercel | 🟡 À faire | Techniquement prêt, config prod à valider |

---

## 🏗️ Architecture Globale

### Stack Technique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Front-end** | Next.js 14+ (App Router) | SSR pour marketing, CSR pour app interactive |
| **Styling** | Tailwind CSS v3+ | Responsive design mobile-first, atomic design |
| **Animations** | Framer Motion | Interactions fluides, micro-animations |
| **ORM** | Prisma | Type-safe ORM avec auto-completion + migrations |
| **Back-end** | Next.js API Routes + Edge Functions | Serverless, native PostgreSQL, webhooks |
| **Base de Données** | PostgreSQL (Supabase) | Relationnelle, RLS, transactions ACID, Row-level security |
| **Authentification** | Supabase Auth + Custom RBAC | OAuth intégré, JWT, session management, rôles en DB |
| **Stockage** | Supabase Storage | Bucket-based, webhooks, permissions granulaires, RLS policies |
| **Langage** | TypeScript | Type-safety, DX amélioré, strict mode |
| **Validation** | Zod | Runtime validation, schémas strictes, type inference |
| **HTTP Client** | @supabase/supabase-js | Client officiel Supabase, subscriptions real-time |
| **État** | Zustand / React Context | Lightweight, no boilerplate |
| **Testing** | Vitest + Playwright | Unit/Integration/E2E coverage |
| **Déploiement** | Vercel + Supabase | Edge Network, auto-scaling, région Paris (cdg1) |

### Architecture & Data Layers

- **Presentation** (Next.js App Router): `app/` directory avec SSR marketing pages + CSR dashboard
- **API & Business Logic** (Next.js API Routes + Services): `lib/services/` + `lib/repositories/` pattern
- **ORM & Migrations** (Prisma): `prisma/schema.prisma` pour schema-first development + `supabase/migrations/` pour SQL avancé
- **Authentication** (Supabase Auth + Custom RBAC): JWT tokens via `lib/auth.ts`, rôles stockés dans `user_roles` table
- **Real-Time & Storage** (Supabase): Webhooks déclenchent Edge Functions pour sync cross-system
- **Edge Functions** (Deno TypeScript): Serverless compute pour orchestration sync (`sync-storage-to-db-v2`, `sync-db-to-storage`, `retry-failed-syncs`)

---

## 📁 Structure des Dossiers

```
fantazi-land/
├── .agents/                        # Configuration agents Claude Code (subagents.yaml)
├── .claude/
│   ├── settings.json              # Configuration Claude Code
│   └── rules/                      # Rules personnalisées si besoin
│
├── app/                            # Next.js 14 App Router
│   ├── (public)/                   # Layout public (Marketing)
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Home - Listing profiles (SSR)
│   │   ├── profiles/[id]/page.tsx  # Profile detail view
│   │   └── about/page.tsx          # À propos / Marketing
│   │
│   ├── (dashboard)/                # Layout protégé (App)
│   │   ├── layout.tsx              # Navbar, sidebar, auth check
│   │   ├── dashboard/page.tsx      # Dashboard créatrice
│   │   ├── profile/[id]/page.tsx   # View profil
│   │   ├── profile/[id]/edit/page.tsx # Edit profil
│   │   ├── bookings/page.tsx       # Gestion réservations
│   │   ├── reviews/page.tsx        # Avis reçus
│   │   └── settings/page.tsx       # Paramètres compte
│   │
│   ├── admin/                      # Routes admin protégées
│   │   ├── page.tsx                # Dashboard admin
│   │   ├── profiles/page.tsx       # Gestion tous les profils
│   │   ├── profiles/create/page.tsx # Création manuelle
│   │   ├── profiles/import-csv/page.tsx # Import CSV batch
│   │   ├── failed-syncs/page.tsx   # Dead Letter Queue dashboard
│   │   └── logs/page.tsx           # Sync logs & monitoring
│   │
│   ├── api/                        # API Routes (serverless)
│   │   ├── profiles/route.ts       # GET list, POST create
│   │   ├── profiles/[id]/route.ts  # GET, PUT, DELETE
│   │   ├── profiles/import-csv/route.ts # POST batch import
│   │   ├── bookings/route.ts       # Booking endpoints
│   │   ├── bookings/[id]/route.ts
│   │   ├── reviews/route.ts        # Review endpoints
│   │   ├── upload/route.ts         # File upload
│   │   ├── auth/me/route.ts        # Get current user
│   │   ├── base44/users/route.ts   # Proxy Base44 API
│   │   ├── base44/users/[id]/route.ts
│   │   ├── webhooks/storage-sync/route.ts # Webhook Storage
│   │   └── failed-syncs/route.ts   # DLQ monitoring & retries
│   │
│   ├── layout.tsx                  # Root layout global
│   └── globals.css                 # Tailwind + custom styles
│
├── components/                     # Composants UI (Atomic Design)
│   ├── atoms/                      # Composants atomiques
│   ├── molecules/                  # Composants composés
│   ├── organisms/                  # Composants complexes
│   ├── sections/                   # Sections de page
│   ├── navigation/                 # Navbar, Sidebar, Footer
│   └── layout/                     # Wrappers de layout
│
├── lib/
│   ├── supabase.ts                 # Client Supabase (public + service role)
│   ├── prisma.ts                   # Prisma client instance
│   ├── auth.ts                     # Module auth complet : JWT, roles, permissions
│   ├── types.ts                    # Types TypeScript centralisés
│   ├── constants.ts                # Constantes globales
│   ├── schemas.ts                  # Zod validation schemas
│   ├── errors.ts                   # Gestion centralisée des erreurs ApiError
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useProfiles.ts
│   │   ├── useAuth.ts
│   │   └── ...
│   │
│   ├── utils/                      # Utilitaires
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── ...
│   │
│   ├── repositories/               # Couche d'accès données (anti N+1)
│   │   ├── profiles.repository.ts
│   │   ├── bookings.repository.ts
│   │   ├── reviews.repository.ts
│   │   └── dlq.repository.ts
│   │
│   ├── services/                   # Couche logique métier
│   │   ├── profiles.service.ts
│   │   ├── bookings.service.ts
│   │   ├── reviews.service.ts
│   │   ├── sync.service.ts
│   │   └── base44-user.service.ts
│   │
│   ├── clients/                    # Clients SDK externes
│   │   └── base44.client.ts        # Client typé pour l'API Base44
│   │
│   └── store/                      # État global (Zustand)
│       └── appStore.ts
│
├── prisma/
│   ├── schema.prisma               # Schéma Prisma (source de vérité ORM)
│   └── seed.ts                     # Seeding data
│
├── supabase/
│   ├── migrations/                 # SQL migrations (versionnées)
│   │   ├── 001_init_profiles.sql
│   │   ├── 002_add_media_assets.sql
│   │   ├── ... (8 migrations)
│   │   └── 008_add_storage_security_policies.sql
│   │
│   ├── functions/                  # Edge Functions (Deno/TypeScript)
│   │   ├── sync-storage-to-db-v2/index.ts   # Storage → DB avec retry
│   │   ├── sync-db-to-storage/index.ts      # DB → Storage
│   │   └── retry-failed-syncs/index.ts      # CRON retry handler
│   │
│   └── config.toml                 # Supabase CLI config
│
├── tests/
│   ├── unit/                       # Tests unitaires
│   │   ├── base44.client.test.ts
│   │   └── ...
│   ├── integration/                # Tests d'intégration API
│   │   └── ...
│   └── e2e/                        # Tests End-to-End (Playwright)
│       └── ...
│
├── docs/
│   ├── ARCHITECTURE.md             # Documentation architecture
│   ├── API.md                      # Spécification API REST
│   ├── DATABASE.md                 # Schéma & RLS policies
│   ├── SECURITY_RLS.md             # Guide complet RLS & Storage policies
│   ├── DEPLOYMENT.md               # Guide déploiement Vercel
│   └── TROUBLESHOOTING.md          # Debugging guide
│
├── .env.example                    # Template variables d'env
├── .env.local                      # ⚠️ LOCAL ONLY (gitignored)
├── .gitignore
├── package.json                    # 30+ npm scripts
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── vercel.json                     # Config Vercel (région Paris, timeouts)
├── prisma/schema.prisma
├── supabase.json
├── README.md                       # Overview du projet
└── skills-lock.json               # Lock file pour dependencies
```

---

## 🚀 Commandes de Développement

### Installation & Setup

```bash
# 1. Clone et installation
git clone <repo-url> agence-de-booking
cd agence-de-booking
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Remplir: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, BASE44_API_URL, BASE44_API_KEY

# 3. Démarrer Supabase localement
npm run db:start

# 4. Appliquer migrations
npm run db:migrate

# 5. Seeder data de test
npm run db:seed

# 6. Générer types Prisma
npx prisma generate

# 7. Lancer dev server
npm run dev
# Accès: http://localhost:3000
```

### Développement - Commandes Complètes

```bash
# Dev server Next.js (hot reload)
npm run dev

# Type checking (strict TypeScript)
npm run type-check

# Linting avec ESLint
npm run lint
npm run lint:fix

# Format code avec Prettier
npm run format
npm run format:check

# Inspecteur base de données (Prisma Studio)
npx prisma studio

# Logs Supabase local (Edge Functions)
npx supabase logs --local
```

### Prisma Workflow

```bash
# Générer Prisma client après schéma change
npx prisma generate

# Créer une migration depuis schéma local
npx prisma migrate dev --name <migration_name>
# Ex: npx prisma migrate dev --name add_profile_category

# Appliquer migrations (dev local)
npx prisma migrate dev

# Vérifier status migrations
npx prisma migrate status

# Rollback dernière migration (dev only)
npx prisma migrate resolve --rolled-back <migration_name>

# Générer types TypeScript depuis prisma schema
npx prisma generate

# Seed database avec données de test
npx prisma db seed
```

### Database Management

```bash
# Démarrer Supabase localement
npm run db:start

# Arrêter Supabase
npm run db:stop

# Reset complètement BD (⚠️ destructive, local only)
npm run db:reset

# Appliquer migrations manuellement
npm run db:migrate

# Seeder avec données test uniquement
npm run db:seed

# Ouvrir Supabase Studio (UI DB)
npm run db:studio

# Générer types TypeScript depuis Supabase schema
npm run db:types
```

### Testing

```bash
# Lancer tous les tests (unit + integration)
npm run test

# Mode watch (re-run on file change)
npm run test:watch

# Coverage report
npm run test:coverage

# Exécuter un fichier de test spécifique
npx vitest tests/unit/base44.client.test.ts

# E2E tests (Playwright)
npm run test:e2e

# E2E with UI (visual mode)
npm run test:e2e:ui

# E2E headless (voir navigateur)
npm run test:e2e:headed

# Exécuter un test E2E spécifique
npx playwright test tests/e2e/home-page.spec.ts
```

### Build & Déploiement

```bash
# Build optimisé (production)
npm run build

# Preview du build localement (avant deployment)
npm run preview

# Deploy Edge Functions
npm run deploy:functions
# Ou individuellement:
npx supabase functions deploy sync-storage-to-db-v2
npx supabase functions deploy sync-db-to-storage
npx supabase functions deploy retry-failed-syncs

# Deploy sur Vercel (production)
npm run deploy:vercel

# Ou avec CLI Vercel directement
vercel deploy --prod
```

---

## 🔄 Flux de Synchronisation & Architecture

### 3 Canaux d'Entrée

**Canal 1 : Web Form (Principal)**
```
Admin/Créatrice → ProfileForm → POST /api/profiles
  ↓ Valider + Upload avatar via Supabase Storage
  ↓ INSERT profiles (Prisma + Supabase)
  ↓ Trigger DB: update_profiles_updated_at
  ↓ Edge Function: sync-db-to-storage (décodé depuis payload)
  ↓ CREATE /profiles/ENCODED_NAME_CATEGORY_JSON/ (Storage)
  ✅ Visible sur homepage
```

**Canal 2 : CSV Import (Batch)**
```
Admin → CSVImporter → POST /api/profiles/import-csv
  ↓ PapaParse + Validate chaque ligne avec Zod
  ↓ Batch INSERT transaction (Prisma)
  ↓ N × Edge Functions: sync-db-to-storage (parallel)
  ✅ N profils visibles instantanément
```

**Canal 3 : Storage Webhook (Reverse Sync)**
```
Admin crée dossier → Webhook Storage
  ↓ POST /api/webhooks/storage-sync
  ↓ Edge Function: sync-storage-to-db-v2
  ↓ Parse JSON encodé depuis nom du dossier
  ↓ INSERT ou UPDATE profiles (Prisma upsert)
  ✅ Profil synchronisé
```

### Résilience & Dead Letter Queue

```
Erreur lors de sync
  ↓ INSERT failed_syncs table avec payload complet
  ↓ Log dans sync_logs avec error_message et duration_ms
  ↓ Admin peut voir erreur dans dashboard /admin/failed-syncs
  ↓ Edge Function CRON: retry-failed-syncs (backoff exponentiel)
  ↓ Max 3 tentatives avant marquer "failed"
  ↓ Admin peut corriger source et re-soumettre
```

### Base44 CRM — Intégration Atomique

**Flux :** Création profil + Base44 User simultanée ou rollback complet

```
Admin/Créatrice → POST /api/profiles
  ↓ Valider données avec Zod
  ↓ Authentifier utilisateur (JWT)
  ↓ Créer Profile (Prisma transaction)
  ↓ Créer Base44 User (SDK client)
  ↓ Lier base44_user_id au Profile
  ↓ Log succès dans sync_logs
  ✅ Retourner { profile, base44_user_id, sync_log_id }

ERROR HANDLING:
  ✗ Base44 échoue → DELETE Base44 User
  ✗ Prisma rollback automatique (transaction)
  ✗ INSERT failed_syncs avec source_data
  ✗ Admin peut retry via dashboard
  ✗ Exponential backoff: 1min → 5min → 30min
```

**Mappage des champs** (voir `lib/services/base44-user.service.ts`):
- `name` → `full_name`
- `bio` → `description`
- `category` → `category` (custom field)
- `avatar_url` → `avatar_url`
- `base_rate` → `base_rate` (custom field)
- `instagram/tiktok/twitter` → social links (custom fields)

---

## 💡 Development Tips & Debugging

### Common Workflows

**Ajouter un nouveau champ Profile :**
```bash
# 1. Éditer prisma/schema.prisma (ajouter champ Profile model)
# 2. Créer migration
npx prisma migrate dev --name add_profile_<field_name>
# 3. Prisma client auto-généré, types mis à jour
# 4. Éditer lib/schemas.ts pour ajouter validation Zod
# 5. Éditer services/profiles.service.ts si logique métier change
# 6. Tester avec npm run test
```

**Debugging Sync Issues :**
```bash
# 1. Vérifier logs Supabase local
npm run db:studio  # Inspecter tables: failed_syncs, sync_logs, profiles

# 2. Vérifier Edge Function logs
npx supabase functions logs sync-storage-to-db-v2 --local

# 3. Tester Edge Function manuellement
curl -i http://localhost:54321/functions/v1/sync-storage-to-db-v2 \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"folder_name": "test_encoding"}'

# 4. Inspecter failed_syncs table
# Aller sur Supabase Studio → failed_syncs → voir dernier enregistrement
```

**Testing API Changes :**
```bash
# 1. Modifier API route ou service
# 2. Run tests du service modifié
npx vitest tests/unit/profiles.service.test.ts --watch

# 3. Test l'endpoint directement
curl http://localhost:3000/api/profiles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# 4. Valider avec npm test complet
npm run test
```

### Debugging Database

```bash
# Ouvrir Prisma Studio (UI interactive)
npx prisma studio
# Voir/éditer données en temps réel

# Vérifier migrations appliquées
npx prisma migrate status

# Voir détails dernière erreur migration
npx supabase migration list --linked  # Pour prod
npx supabase migration list --local   # Pour local

# Query directement en SQL
npx supabase db pull  # Générer SQL du schéma courant
```

### Common Issues

**"Prisma client not found"**
```bash
# Solution
npx prisma generate
npm install
```

**"Migration conflict"**
```bash
# Ne jamais rebaser migrations après push
# À la place:
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate dev --name fix_conflict
```

**"Edge Function timeout"**
- Check function logs: `npx supabase functions logs sync-storage-to-db-v2 --local`
- Augmenter timeout dans vercel.json si nécessaire
- Vérifier failed_syncs pour détails erreur

---

## 🧪 Testing Strategy Détaillée

### Unit Tests
- Services & repositories (logique métier isolée)
- Validators Zod (schémas validation)
- Utils & formatters (logique pure)
- Hooks personnalisés

### Integration Tests
- API routes complètes (requête HTTP → réponse)
- Supabase client interactions (read/write DB)
- Services calling repositories
- Prisma operations

### E2E Tests (Playwright)
- Page publique: chargement, filtres, recherche
- Création profil: form validation, upload, sync
- Import CSV: parse, batch insert, erreurs
- Dashboard admin: DLQ management, retries

**Exécuter tests spécifiques :**
```bash
# Un fichier entier
npx vitest tests/unit/base44.client.test.ts

# Tous les tests contenant "profile"
npx vitest --grep="profile"

# Avec couverture
npx vitest run --coverage

# E2E spécifique
npx playwright test tests/e2e/home-page.spec.ts --headed
```

---

## 📝 Important Notes

### Secrets & Environment Variables

**JAMAIS commiter :**
- `.env.local` (tous tokens)
- `SUPABASE_SERVICE_ROLE_KEY`
- `BASE44_API_KEY`
- Credentials AWS/Stripe/etc

**À mettre dans Vercel (Settings → Environment Variables) :**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (server-only)
BASE44_API_URL=...
BASE44_API_KEY=... (server-only)
NODE_ENV=production
```

### About `.agents/` Folder

Le dossier `.agents/` contient la configuration pour les sous-agents Claude Code :
- `subagents.yaml` : définit les agents disponibles
- Permet de dispatcher travail complexe à agents spécialisés
- Utilisé par `/code-review`, `/plan`, etc.

### Key Dependencies

| Package | Raison | Docs |
|---------|--------|------|
| `@supabase/supabase-js` | Client officiel Supabase | https://supabase.com/docs/reference/javascript |
| `@prisma/client` | ORM type-safe | https://www.prisma.io/docs/orm/reference/prisma-client-reference |
| `zod` | Runtime validation | https://zod.dev |
| `framer-motion` | Animations React | https://www.framer.com/motion/ |
| `zustand` | State management | https://github.com/pmndrs/zustand |
| `papaparse` | CSV parser | https://www.papaparse.com/ |
| `date-fns` | Date utils | https://date-fns.org/ |
| `lucide-react` | Icon library | https://lucide.dev/ |

---

## 🔐 Authentification & Security

### Auth Flow

1. User clique "Login" → redirection OAuth Supabase
2. Supabase retourne JWT token + user info
3. Token stocké en secure cookie (httpOnly)
4. `lib/auth.ts` vérifie token + récupère rôle utilisateur depuis `user_roles` table
5. API routes utilisent `authenticateRequest()` pour vérifier accès
6. RLS policies sur DB et Storage enforcer permissions

### Roles & Permissions

- **client** : Voit uniquement profils publics
- **creator** : Gère son profil + galerie + bookings
- **admin** : Accès complet (CRUD tous profils + DLQ + logs)

Voir `docs/SECURITY_RLS.md` pour détails complets des politiques RLS.

---

## 📊 Performance & Optimization

### Frontend Optimizations
- **SSR/ISR** : Home page static generation
- **Next.js Image** : Lazy loading + optimization
- **Code splitting** : Dynamic imports pour composants lourds
- **Caching** : SWR hooks + Supabase subscriptions real-time

### Backend Optimization
- **Database indices** : Sur `profile_id`, `category`, `created_at`, `is_public`
- **Query optimization** : Prisma `.include()` / `.select()` pour éviter N+1
- **Edge Functions** : Deno runtime + colocation proche des données
- **Rate limiting** : Middleware sur endpoints sensibles

### Monitoring
- Dead Letter Queue : Dashboard `/admin/failed-syncs`
- Sync logs : Dashboard `/admin/logs`
- Edge Function logs : `npx supabase logs --local`

---

## 📚 Documentation Complète

- **`docs/ARCHITECTURE.md`** : Diagrammes, design decisions, data flow
- **`docs/API.md`** : Endpoints REST avec exemples curl
- **`docs/DATABASE.md`** : Schéma complet, indices, relations
- **`docs/SECURITY_RLS.md`** : Politiques RLS détaillées + Storage policies
- **`docs/DEPLOYMENT.md`** : Checklist prod Vercel + Supabase
- **`docs/TROUBLESHOOTING.md`** : Solutions erreurs communes
- **`README.md`** : Overview projet, quick start

---

## 🛠️ Maintenance Checklist

Avant chaque deployment en production :

- [ ] `npm run type-check` → No errors
- [ ] `npm run lint` → No errors
- [ ] `npm run test` → All tests green
- [ ] `npm run test:coverage` → Coverage >= 80%
- [ ] Vérifier secrets dans Vercel ✅
- [ ] Migrations sont à jour (Prisma + SQL)
- [ ] Edge Functions déployées et testées
- [ ] Database backups configurés

---

**Last Updated :** 2026-08-26  
**Version :** 1.1 (implémentation avancée, statut actualisé)  
**Maintainers :** Di Vibez Developer, Claude Code
