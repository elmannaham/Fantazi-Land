# Design Doc : Redesign Storage → DB Sync with JSON descrip.txt

**Date** : 2026-08-26  
**Author** : Claude Code + Di Vibez Developer  
**Status** : APPROVED ✅  
**Phase** : Architectural Design + Phase 1 Implementation

---

## 📋 Executive Summary

Currently, profile auto-generation relies on base64-encoded JSON in folder names. This design replaces that with a **simpler, more maintainable approach**:

- **Each folder in HOTESS bucket = 1 Profile**
- **Each `descrip.txt` file (JSON) = Profile metadata**
- **Edge Function reads JSON** instead of decoding base64

**Benefits**:
- ✅ Human-readable JSON (easier debugging)
- ✅ Flexible metadata structure (easy to extend)
- ✅ Simpler Edge Function logic
- ✅ Better error handling & validation

---

## 🏗️ Architecture

### Folder Structure (HOTESS Bucket)

```
HOTESS/
├── SHANEL/
│   ├── avatar.jpg              ← Photo principale (racine)
│   ├── descrip.txt             ← JSON avec toutes les métadonnées
│   ├── images/
│   │   ├── photo1.jpg
│   │   ├── photo2.jpg
│   │   └── ...
│   └── videos/
│       ├── video1.mp4
│       └── ...
```

### Sync Flow

```
Admin upload folder HOTESS/SHANEL/
  ↓
Webhook Storage detects new folder
  ↓
POST /api/webhooks/storage-sync
  ↓
Edge Function: sync-storage-to-db-v2 (MODIFIED)
  1. Read HOTESS/SHANEL/descrip.txt
  2. Parse JSON
  3. Validate schema (Zod)
  4. Generate avatar_url = https://.../HOTESS/SHANEL/avatar.jpg
  5. CREATE or UPDATE profile (Prisma)
  6. Initialize performance_stats
  7. Log in sync_logs
  ↓
On Error → INSERT failed_syncs (DLQ)
  ↓
✅ Profile visible on homepage
```

---

## 📄 JSON Schema (descrip.txt)

### Example

```json
{
  "nom": "Shanel Smith",
  "categorie": "Photographie",
  "bio": "Photographe professionnelle spécialisée en mode et beauté. 8 ans d'expérience créative. Je transforme vos projets en contenus visuels captivants pour les réseaux sociaux et campagnes commerciales.",
  "base_rate": 1500,
  "currency": "EUR",
  "instagram": "https://instagram.com/shanel_photography",
  "tiktok": "https://tiktok.com/@shanel_pro",
  "twitter": "https://twitter.com/shanel_photo",
  "website": "https://shanel-photo.com"
}
```

### Zod Schema

```typescript
export const ProfileDescripSchema = z.object({
  nom: z.string().min(1, "Nom requis").max(255),
  categorie: z.enum([
    "Photographie",
    "Videographie",
    "Contenu Mode",
    "Beauté",
    "Lifestyle",
    "Gaming"
  ]),
  bio: z.string().min(10, "Bio min 10 caractères").max(1000),
  base_rate: z.number().positive("Tarif doit être positif").optional().nullable(),
  currency: z.string().default("EUR"),
  instagram: z.string().url("URL Instagram invalide").optional().nullable(),
  tiktok: z.string().url("URL TikTok invalide").optional().nullable(),
  twitter: z.string().url("URL Twitter invalide").optional().nullable(),
  website: z.string().url("URL website invalide").optional().nullable(),
});

export type ProfileDescrip = z.infer<typeof ProfileDescripSchema>;
```

### Field Validation Rules

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `nom` | string | ✅ | 1-255 chars |
| `categorie` | enum | ✅ | Must be one of 6 categories |
| `bio` | string | ✅ | 10-1000 chars |
| `base_rate` | number | ❌ | Positive if provided |
| `currency` | string | ❌ | Default: EUR |
| `instagram` | URL | ❌ | Valid URL if provided |
| `tiktok` | URL | ❌ | Valid URL if provided |
| `twitter` | URL | ❌ | Valid URL if provided |
| `website` | URL | ❌ | Valid URL if provided |

---

## 🔄 Error Handling & DLQ

### Error Scenarios

| Error | Cause | DLQ Entry | Retry |
|-------|-------|-----------|-------|
| **File Not Found** | `descrip.txt` missing | ✅ file_not_found | Yes (3x) |
| **JSON Parse Error** | Malformed JSON | ✅ json_parse_error | Yes (3x) |
| **Validation Error** | Invalid field/type | ✅ validation_error | Yes (3x) |
| **Avatar Not Found** | `avatar.jpg` missing | ⚠️ Warning | Use default |
| **DB Error** | Prisma constraint | ✅ db_error | Yes (3x) |
| **Network Error** | Timeout | ✅ network_error | Yes (3x) |

### Flow

```
Error detected
  ↓
INSERT failed_syncs (
  event_type: "json_parse_error" | "validation_error" | ...
  source_data: { folder, bucket, ... }
  error_message: "..."
  error_stack: "..."
  status: "pending"
  retry_count: 0
)
  ↓
INSERT sync_logs (
  sync_type: "storage_to_db"
  status: "error"
  error_message: "..."
  duration_ms: ...
)
  ↓
[CRON] retry-failed-syncs runs hourly
  - SELECT failed_syncs WHERE status='pending' AND retry_count < 3
  - Retry sync
  - On success → status='resolved'
  - On fail → retry_count++, status='retrying'
  - After 3 retries → status='failed'
  ↓
Admin sees error in /admin/failed-syncs
  - Can view error message
  - Can fix descrip.txt manually
  - Can re-submit (status='pending')
```

---

## 🔐 Security & RLS

### Database RLS Policies

**failed_syncs table** :
- Admins only can SELECT/UPDATE (viewing DLQ, retrying)
- Service role can INSERT/UPDATE (Edge Functions)

**sync_logs table** :
- Admins can SELECT all
- Creators can SELECT their own logs
- Service role can INSERT (Edge Functions)

### Storage RLS Policies (HOTESS Bucket)

- **SELECT** : Public (anyone can download files)
- **INSERT** : Authenticated users in their own folder OR admins
- **UPDATE/DELETE** : Authenticated users in their own folder OR admins

---

## 📊 Implementation Phases

### Phase 1 : SQL Migrations ✅ (THIS PHASE)
- Create Migration 009 : RLS for failed_syncs & sync_logs
- Create Migration 010 : HOTESS bucket + Storage RLS

### Phase 2 : Backend Code (Next)
- Add ProfileDescripSchema to lib/schemas.ts
- Modify sync-storage-to-db-v2 Edge Function
- Implement error handling (DLQ + logs)

### Phase 3 : Tests & Validation (Next)
- Unit tests for JSON parsing
- Integration tests for sync flow
- Error scenario tests

### Phase 4 : Documentation & Deploy (Next)
- Update docs/SECURITY_RLS.md
- Update CLAUDE.md
- Deploy migrations + functions

---

## 📝 Files to Create/Modify

| File | Action | Phase |
|------|--------|-------|
| `supabase/migrations/009_add_dlq_rls.sql` | CREATE | 1 ✅ |
| `supabase/migrations/010_add_hotess_bucket.sql` | CREATE | 1 ✅ |
| `lib/schemas.ts` | MODIFY | 2 |
| `supabase/functions/sync-storage-to-db-v2/index.ts` | MODIFY | 2 |
| `tests/integration/sync-storage-to-db.test.ts` | CREATE | 3 |
| `docs/SECURITY_RLS.md` | UPDATE | 4 |
| `CLAUDE.md` | UPDATE | 4 |

---

## ✅ Acceptance Criteria

- [ ] Migrations 009 & 010 apply without errors
- [ ] RLS policies work (only admins see DLQ)
- [ ] HOTESS bucket created with correct MIME types
- [ ] JSON parsing works (valid + invalid inputs)
- [ ] Zod validation rejects bad data
- [ ] DLQ captures errors correctly
- [ ] sync_logs records all operations
- [ ] Avatar fallback works (default avatar used if missing)
- [ ] Profile created with avatar_url pointing to avatar.jpg
- [ ] Dashboard shows failed syncs
- [ ] CRON retry works (exponential backoff)

---

**Version**: 1.0  
**Status**: APPROVED ✅  
**Next**: Phase 1 Implementation (Migrations)
