# Architecture — Fantazi-Land Booking Platform

## 📐 Vue d'Ensemble

Fantazi-Land est une plateforme de booking web full-stack utilisant une **architecture hybride serverless** combinant :

- **Next.js 14** (App Router) pour le front-end SSR/CSR
- **Supabase** (PostgreSQL + Edge Functions) pour le back-end
- **Tailwind CSS** pour le design système
- **TypeScript** pour la type-safety

---

## 🎯 Principes Architecturaux

### 1. **Separation of Concerns (SoC)**
- **Public Layer** (`(public)/`) : Pages marketing, SEO-friendly
- **Dashboard Layer** (`(dashboard)/`) : Application interactive, authentifiée
- **Admin Layer** (`/admin`) : Gestion administrative, protégée

### 2. **API-First Design**
- Back-end stateless via Edge Functions + PostgreSQL
- API REST via Next.js API Routes (`/api`)
- Client-side state management avec Zustand

### 3. **Real-time Ready**
- Supabase Realtime subscriptions pour updates live
- Webhooks Storage pour synchronisation bidirectionnelle
- JSONB pour données flexibles (calendar, deliverables)

### 4. **Security by Default**
- RLS (Row Level Security) au niveau database
- Middleware authentification sur routes protégées
- Validation côté serveur + client (Zod)
- Service Role Key jamais exposé au front-end

---

## 🏗️ Architecture des Couches

```
┌─────────────────────────────────────────────────────────────────┐
│                         FANTAZI-LAND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         PRESENTATION LAYER (Next.js Front-end)          │  │
│  │                                                          │  │
│  │  (public)              (dashboard)        (admin)        │  │
│  │  Home Page    →        Dashboard    →     Management     │  │
│  │  Profiles             Profile Edit        Logs           │  │
│  │  Details              Gallery              DLQ           │  │
│  │                       Bookings             Analytics      │  │
│  └──────────────────────────────────────────────────────────┘  │
│             ↓ (HTTP/JSON)                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API LAYER (Next.js API Routes + Edge Functions)        │  │
│  │                                                          │  │
│  │  POST   /api/profiles/create                            │  │
│  │  PUT    /api/profiles/[id]                              │  │
│  │  POST   /api/profiles/import-csv                        │  │
│  │  POST   /api/upload (images)                            │  │
│  │  POST   /webhooks/storage-sync                          │  │
│  │                                                          │  │
│  │  Edge Functions:                                        │  │
│  │  - sync-storage-to-db-v2 (Storage → DB)                │  │
│  │  - sync-db-to-storage (DB → Storage)                    │  │
│  │  - retry-failed-syncs (CRON handler)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│             ↓ (SQL + Webhooks)                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      DATA LAYER (PostgreSQL + Supabase Storage)          │  │
│  │                                                          │  │
│  │  Tables:                    Storage Buckets:            │  │
│  │  - profiles                 - /profiles (folder tree)   │  │
│  │  - media_assets            - /avatars                   │  │
│  │  - reviews                                              │  │
│  │  - bookings                                             │  │
│  │  - performance_stats                                    │  │
│  │  - failed_syncs (DLQ)                                   │  │
│  │  - sync_logs                                            │  │
│  │  - user_roles                                           │  │
│  │                                                          │  │
│  │  RLS Policies: Enforced at DB level                     │  │
│  │  Indexes: On frequently queried columns                 │  │
│  │  Triggers: Auto-compute stats, update timestamps        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Synchronisation (3 Canaux)

### Canal 1 : Web Form (Principal)

```
User (Admin/Creator) → Fill ProfileForm → Click "Create"
  ↓
POST /api/profiles/create (Next.js API Route)
  ↓
  1. Validate form data (Zod schema)
  2. Upload avatar to Storage
  3. INSERT profile into DB (profiles table)
  4. Trigger DB updated_at
  ↓
Trigger executes: update_profiles_updated_at()
  ↓
Edge Function called: sync-db-to-storage
  ↓
  1. Fetch profile from DB
  2. Encode metadata to JSON
  3. Encode JSON to Base64
  4. CREATE folder: /profiles/{name}_{category}_{base64_json}
  5. Update profile.storage_folder_id
  ↓
✅ Profile synced to Storage + visible on homepage
```

### Canal 2 : CSV Import (Batch)

```
Admin → Upload CSV file → POST /api/profiles/import-csv
  ↓
  1. Parse CSV (papaparse library)
  2. Validate each row (Zod schema)
  3. Batch INSERT into profiles (transaction)
  4. Trigger executes x N (one per profile)
  ↓
Edge Functions: sync-db-to-storage (parallel x N)
  ↓
  CREATE folders in Storage (all N profiles)
  ↓
✅ N profiles synced + visible on homepage
```

### Canal 3 : Storage Webhook (Backup/Sync)

```
Admin creates folder in Storage manually
  e.g., /profiles/Marina_Dupont_Photographie_eyJ...
  ↓
Supabase Storage webhook triggers
  ↓
POST sync-storage-to-db-v2 (Edge Function)
  ↓
  1. Parse folder name
  2. Decode Base64 JSON metadata
  3. Validate metadata
  4. INSERT or UPDATE profile in DB
  ↓
✅ Profile synced to DB + visible on homepage
```

---

## 🛡️ Sécurité & Authentification

### Authentication Flow

```
Client → /auth/login
  ↓
Redirect to Supabase OAuth (Google, GitHub, etc.)
  ↓
User authorizes
  ↓
OAuth callback → /api/auth/callback
  ↓
Create Supabase session + JWT token
  ↓
Set httpOnly cookie (token)
  ↓
Redirect to /dashboard
  ↓
Middleware verifies token
  ↓
✅ User authenticated
```

### Authorization (RLS)

```
Every DB query is filtered by RLS policies based on:
  - auth.uid() (current user)
  - user_roles table (client, creator, admin)
  - row ownership (user_id column)

Example:
  SELECT * FROM profiles
    → Only returns public profiles (if not logged in)
    → Or own profile + public profiles (if creator logged in)
    → Or all profiles (if admin)
```

---

## 📊 Data Model Relationships

```
                        ┌─────────────────┐
                        │   auth.users    │
                        │  (Supabase Auth)│
                        └────────┬────────┘
                                 │ (user_id)
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼────┐  ┌────▼─────┐  ┌─▼──────────┐
            │  profiles  │  │user_roles │  │ bookings   │
            │            │  │(role map) │  │            │
            └───────┬────┘  └───────────┘  └────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────▼───┐  ┌───▼────┐  ┌──▼──────────────┐
    │ reviews │  │ media  │  │performance_stats│
    │         │  │ assets │  │                 │
    └─────────┘  └────────┘  └─────────────────┘

Dead Letter Queue:
    failed_syncs → (tracks errors from any sync)
    sync_logs → (audit trail of all syncs)
```

---

## 🔌 API Design

### REST Endpoints

```
# Profiles
POST   /api/profiles/create            # Create profile (form)
GET    /api/profiles                   # List profiles (with filters)
GET    /api/profiles/[id]              # Get single profile
PUT    /api/profiles/[id]              # Update profile
DELETE /api/profiles/[id]              # Delete profile (admin)
POST   /api/profiles/import-csv        # Batch import via CSV

# Media
POST   /api/upload                     # Upload image
DELETE /api/upload/[id]                # Delete uploaded file

# Authentication
POST   /api/auth/callback              # OAuth callback
POST   /api/auth/logout                # Logout

# Webhooks (internal)
POST   /api/webhooks/storage-sync      # Storage webhook handler
```

### Request/Response Pattern

```typescript
// Request
POST /api/profiles/create
Content-Type: application/json

{
  "name": "Marina Dupont",
  "category": "Photographie",
  "baseRate": 1500,
  ...
}

// Response (201 Created)
{
  "success": true,
  "profile": {
    "id": "uuid-1234",
    "name": "Marina Dupont",
    "storage_folder_id": "Marina_Dupont_Photographie_eyJ..."
  }
}

// Error Response (400/500)
{
  "success": false,
  "error": "Invalid category",
  "code": "VALIDATION_ERROR"
}
```

---

## 🎨 Component Architecture (Atomic Design)

### Hierarchy

```
Atoms (Small, reusable)
├── Button.tsx
├── Badge.tsx
├── StarRating.tsx
├── Avatar.tsx
└── Icon.tsx

  ↓ (compose 2-3 atoms)

Molecules (Medium, specific)
├── ProfileCard.tsx
├── SocialLinks.tsx
├── StatsCard.tsx
├── FilterChip.tsx
└── SearchBar.tsx

  ↓ (compose molecules)

Organisms (Large, complex)
├── ProfileHero.tsx (hero section)
├── MediaGallery.tsx (lightbox gallery)
├── ReviewSection.tsx (reviews + form)
├── ProfileFilters.tsx (filters + search)
├── ProfileGrid.tsx (animated grid)
└── ProfileForm.tsx (creation/edit form)

  ↓ (compose organisms)

Pages (Full pages)
├── app/(public)/page.tsx (Home)
├── app/(public)/profiles/[id]/page.tsx (Detail)
├── app/(dashboard)/dashboard/page.tsx (Creator dashboard)
└── app/admin/profiles/page.tsx (Admin management)
```

---

## 📈 State Management

### Global State (Zustand)

```typescript
// appStore.ts
interface AppState {
  // Auth
  user: User | null;
  role: 'client' | 'creator' | 'admin';

  // UI
  sidebarOpen: boolean;
  filterCategory: string;
  searchQuery: string;

  // Data
  profiles: Profile[];
  selectedProfile: Profile | null;

  // Actions
  setUser: (user: User) => void;
  toggleSidebar: () => void;
  setFilters: (category, search) => void;
}
```

### Local State (React Hooks)

```typescript
// Per-component state
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

// Custom hooks
const { profiles, loading, error } = useProfiles(options);
const { user, logout } = useAuth();
```

### Server State (SWR / Supabase Subscriptions)

```typescript
// Fetch profiles with SWR
const { data: profiles, mutate } = useSWR(
  '/api/profiles',
  fetcher
);

// Real-time subscriptions
const subscription = supabase
  .from('profiles')
  .on('INSERT', (payload) => {
    // Update UI when profile created
  })
  .subscribe();
```

---

## 🚀 Performance Optimizations

### Front-end

| Technique | Implementation |
|-----------|-----------------|
| SSR/SSG | Home page generated statically (ISR) |
| Image Optimization | Next.js Image component + lazy loading |
| Code Splitting | Dynamic imports for heavy components |
| Bundling | Tree-shaking, Tailwind CSS minification |
| Caching | SWR stale-while-revalidate pattern |
| Compression | Gzip + Brotli at CDN level |

### Back-end

| Technique | Implementation |
|-----------|-----------------|
| Database Indexing | Index on category, created_at, user_id |
| Query Optimization | Avoid N+1 via `.select()` with joins |
| Connection Pooling | Supabase manages connection pool |
| Caching | Cache API responses via CDN headers |
| Edge Functions | Deploy at edge, colocation with data |

### Storage

| Technique | Implementation |
|-----------|-----------------|
| CDN Global | Vercel Edge Network (170+ locations) |
| Image Compression | Redimensionner côté serveur |
| Lazy Loading | Load images on-scroll |
| WebP Format | Serve modern formats when supported |

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

```typescript
// Tests formatters, validators, utils
test('formatPrice formats currency correctly', () => {
  expect(formatPrice(1500, 'EUR')).toBe('€1,500');
});
```

### Integration Tests (Vitest)

```typescript
// Tests API routes + DB interactions
test('POST /api/profiles/create inserts profile', async () => {
  const res = await fetch('/api/profiles/create', {
    method: 'POST',
    body: JSON.stringify({...})
  });
  expect(res.status).toBe(201);
});
```

### E2E Tests (Playwright)

```typescript
// Tests user workflows
test('Create profile via form', async ({ page }) => {
  await page.goto('/admin/profiles/create');
  await page.fill('input[name="name"]', 'Marina Dupont');
  await page.click('button:text("Create")');
  await expect(page).toHaveURL('/');
});
```

---

## 🚢 Deployment Architecture

### Development

```
Local Dev
  ├── Next.js dev server (port 3000)
  └── Supabase local stack
      ├── PostgreSQL (port 5432)
      └── Storage (port 3000)
```

### Production

```
Vercel (Next.js)
  ├── Edge Network (170+ locations)
  ├── Serverless Functions
  └── API Routes

Supabase Production
  ├── PostgreSQL (managed)
  ├── Edge Functions (Deno runtime)
  ├── Storage (S3-compatible)
  └── Auth (managed)
```

### Monitoring

```
Vercel Analytics
  ├── Core Web Vitals (LCP, FID, CLS)
  ├── Performance metrics
  └── Deployment logs

Supabase Logs
  ├── Edge Function errors
  ├── Database query performance
  └── Auth events

Custom Monitoring
  ├── Sentry (error tracking)
  ├── Datadog (infrastructure)
  └── DLQ dashboard (sync monitoring)
```

---

## 📝 Design Decisions & Trade-offs

### 1. Hybrid Sync Architecture (Storage + DB)

**Chosen:** Bidirectional sync with Storage webhooks + API routes

**Why:** 
- Flexibility (3 creation channels)
- Audit trail (sync_logs)
- Error recovery (failed_syncs DLQ)

**Trade-off:**
- More complex than single source of truth
- Requires careful conflict resolution

---

### 2. RLS at Database Level

**Chosen:** Row-Level Security policies in PostgreSQL

**Why:**
- Enforced at lowest level (database)
- No way to bypass via API
- Fine-grained control per row

**Trade-off:**
- More complex queries
- Harder to debug (need to check policies)

---

### 3. Denormalized Performance Stats

**Chosen:** Separate `performance_stats` table with triggers

**Why:**
- Avoid N+1 queries when fetching profile stats
- Fast sorting/filtering by rating

**Trade-off:**
- Must keep in sync via triggers
- Extra storage overhead

---

### 4. Zustand over Redux/Jotai

**Chosen:** Zustand for global state

**Why:**
- Minimal boilerplate
- No provider wrapper required
- Small bundle size

**Trade-off:**
- Less ecosystem tooling
- Not ideal for very large apps

---

## 🔮 Future Enhancements

1. **Advanced Analytics**
   - Heatmaps (user interactions)
   - Funnel analysis (booking flow)
   - Cohort analysis

2. **AI Features**
   - Auto-tagging media (vision API)
   - Smart recommendations (embeddings)
   - Chatbot support

3. **Payment Integration**
   - Stripe/Paypal checkout
   - Invoice generation
   - Payout management

4. **Scaling**
   - Read replicas for analytics
   - Message queue (Bull/RabbitMQ) for heavy workloads
   - ElasticSearch for advanced search

---

**Last Updated:** 2026-08-26  
**Version:** 1.0
