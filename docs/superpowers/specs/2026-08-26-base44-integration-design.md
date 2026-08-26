# Design Doc : Base44 Integration - Atomic Profile + User Creation

**Date** : 2026-08-26  
**Author** : Claude Code + Di Vibez Developer  
**Status** : APPROVED ✅  
**Phase** : Architectural Design + Phase 2 Implementation

---

## 📋 Executive Summary

This design implements **bidirectional sync between Fantazi-Land profiles and Base44 CRM users**.

When a creator profile is created:
1. **Fantazi-Land Profile** created (Prisma) + performance_stats
2. **Base44 User** created simultaneously with profile data mapped to custom fields
3. **Atomic Transaction** : If Base44 fails → Profile rollback (ACID guarantee)
4. **Error Handling** : Failed syncs captured in DLQ, retried with exponential backoff

**Benefits**:
- ✅ CRM always in sync with profile data
- ✅ No orphaned profiles (atomicity)
- ✅ Resilient retry with 3 attempts
- ✅ Admin visibility into sync failures
- ✅ Custom fields for extensibility

---

## 🏗️ Architecture

### Atomic Creation Flow

```
Admin creates profile (form or HOTESS folder)
  ↓
POST /api/profiles
  ↓
ProfileCreationService.createProfile(data, userId, userEmail)
  ┌─────────────────────────────────────┐
  │ TRANSACTION START (Prisma)          │
  │                                      │
  │ 1. Create Profile + performance_stats
  │    ✓ name, category, bio, urls      │
  │    ✓ avatar_url                     │
  │    ↓ SUCCESS/FAIL                   │
  │                                      │
  │ 2. Create Base44 User (API call)    │
  │    ✓ full_name, email               │
  │    ✓ custom: category, bio, urls    │
  │    ↓ SUCCESS/FAIL                   │
  │                                      │
  │ 3. Link: UPDATE profile.base44_user_id
  │    ↓ SUCCESS/FAIL                   │
  │                                      │
  └─────────────────────────────────────┘
  ↓
  ✅ COMMIT (both succeed)
    - Profile + Base44 User created
    - Log in sync_logs
  ↓
  ❌ ROLLBACK (any fail)
    - Delete Base44 User (if created)
    - Discard Profile (Prisma rollback)
    - INSERT failed_syncs (DLQ)
    - Log error in sync_logs
```

### Field Mapping

**Fantazi-Land Profile → Base44 User**

| Profile Field | Base44 Field | Type |
|---|---|---|
| nom | full_name | required |
| email (auth.users) | email | required |
| category | custom.category | custom |
| bio | custom.description | custom |
| avatar_url | custom.avatar_url | custom |
| base_rate | custom.base_rate | custom |
| currency | custom.currency | custom |
| instagram_url | custom.instagram | custom |
| tiktok_url | custom.tiktok | custom |
| twitter_url | custom.twitter | custom |
| website_url | custom.website | custom |

---

## 🔄 Service Layer

### ProfileCreationService

**Responsibility**: Orchestrate atomic creation of Profile + Base44 User

**Methods**:
- `createProfile(data, userId, userEmail)` → {profile, base44UserId, syncLogId}
  - Creates Profile (Prisma transaction)
  - Creates Base44 User (HTTP API)
  - Links base44_user_id
  - Handles rollback + DLQ on failure

- `updateProfile(profileId, data)` → Profile
  - Updates Profile + Base44 User simultaneously
  - Handles partial updates

### Base44UserService

**Responsibility**: Map Profile ↔ Base44 User fields

**Static Methods**:
- `mapProfileToBase44User(profile, email)` → CreateBase44UserDto
- `mapProfileToBase44UserUpdate(profile)` → UpdateBase44UserDto
- `mapBase44UserToProfile(base44User)` → Partial<Profile>

---

## 🛡️ Error Handling & DLQ

### Error Scenarios

| Scenario | Action | DLQ |
|----------|--------|-----|
| Profile OK, Base44 FAIL | Rollback profile, DELETE Base44 user | ✅ |
| Profile FAIL | Skip Base44 creation | ✅ |
| Base44 duplicate email | Rollback, notify admin | ✅ |
| Base44 network timeout | Retry with backoff | ✅ |
| Base44 invalid field | Validation error in DLQ | ✅ |

### Retry Strategy

```
[CRON] retry-failed-syncs (hourly)
  ↓
  SELECT failed_syncs WHERE status='pending' AND retry_count < 3
  ↓
  For each failure:
    1. Re-attempt createProfile()
    2. If success → status='resolved'
    3. If fail → retry_count++, last_attempted_at=now()
    4. After 3 retries → status='failed', notify admin
  ↓
  Exponential backoff: 1min, 5min, 30min
```

### DLQ Entry Structure

```json
{
  "event_type": "profile_creation_error",
  "source_data": {
    "user_id": "uuid",
    "user_email": "email@example.com",
    "profile_data": { ...profile },
    "attempted_base44_user_id": "base44-id"
  },
  "error_message": "Base44 API error: ...",
  "error_stack": "...",
  "status": "pending|retrying|failed|resolved",
  "retry_count": 0,
  "max_retries": 3
}
```

---

## 📊 Implementation Phases

### Phase 1 : Migrations SQL ✅ COMPLETE
- Migration 009 : RLS for DLQ + sync_logs
- Migration 010 : HOTESS bucket + Storage RLS

### Phase 2 : Backend Services (THIS PHASE)
- Create ProfileCreationService (orchestration)
- Create Base44UserService (mapping)
- Create Migration 011 (add base44_user_id to profiles)
- Modify Prisma schema (add field)
- Modify /api/profiles route (use new service)

### Phase 3 : Error Handling & Testing
- Update retry-failed-syncs Edge Function
- Create error scenario tests
- Create admin dashboard

### Phase 4 : Documentation & Deploy
- Update SECURITY_RLS.md, CLAUDE.md, API.md
- Deploy to production

---

## 📁 Files to Create/Modify

| File | Action | Phase |
|---|---|---|
| `lib/services/profile-creation.service.ts` | CREATE | 2 |
| `lib/services/base44-user.service.ts` | CREATE | 2 |
| `prisma/schema.prisma` | MODIFY | 2 |
| `supabase/migrations/011_add_base44_user_id.sql` | CREATE | 2 |
| `app/api/profiles/route.ts` | MODIFY | 2 |
| `supabase/functions/retry-failed-syncs/index.ts` | MODIFY | 3 |
| `tests/integration/profile-creation-errors.test.ts` | CREATE | 3 |
| `docs/SECURITY_RLS.md` | UPDATE | 4 |
| `CLAUDE.md` | UPDATE | 4 |

---

## ✅ Acceptance Criteria

- [ ] ProfileCreationService creates Profile + Base44 User atomically
- [ ] If Base44 fails → Profile automatically rolled back
- [ ] base44_user_id link created and unique constraint works
- [ ] DLQ captures profile_creation_error events
- [ ] Retry logic runs hourly via CRON
- [ ] Exponential backoff: 1min → 5min → 30min
- [ ] Admin can view failures in /admin/failed-syncs
- [ ] Tests pass: rollback, retry, max retries scenarios
- [ ] Documentation updated with Base44 integration details

---

**Version**: 1.0  
**Status**: APPROVED ✅  
**Next**: Phase 2 Implementation (Services + Migrations)
