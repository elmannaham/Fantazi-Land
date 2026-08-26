# Security: Row-Level Security & Storage Policies

## Base44 CRM Integration Security

### Atomic Creation Pattern

**Profile + Base44 User created simultaneously or rolled back entirely**

```typescript
// lib/services/profile-creation.service.ts
async createProfile(data, userId, userEmail) {
  // Step 1: Create Profile (Prisma transaction)
  const profile = await prisma.profile.create({ ... });
  
  // Step 2: Create Base44 User
  const base44User = await base44Client.createUser({
    email: userEmail,
    full_name: data.nom,
    custom_fields: { category, description, avatar_url, rates }
  });
  
  // Step 3: Link base44_user_id
  const linked = await prisma.profile.update({
    where: { id: profile.id },
    data: { base44_user_id: base44User.id }
  });
  
  // Step 4: Log success
  await prisma.syncLog.create({ ... });
  
  return { profile: linked, base44UserId, syncLogId };
}

// ON ERROR:
// - Delete Base44 User if created
// - Prisma rollbacks Profile automatically
// - Store in failed_syncs DLQ
// - Admin can retry via dashboard
```

### Field Mapping (Safe)

| Fantazi Profile | Base44 Custom Field | Notes |
|---|---|---|
| name | full_name | Sanitized |
| bio | description | Validated |
| category | category | Enum |
| avatar_url | avatar_url | HTTPS only |
| base_rate | base_rate | Decimal |
| instagram/tiktok/twitter | social_links | URL validated |

### Base44 API Key Protection

```typescript
// ✅ Server-side only
const base44Client = new Base44Client({
  appId: process.env.BASE44_APP_ID,
  apiKey: process.env.BASE44_API_KEY // never in bundle
});

// ❌ Never expose to browser
// POST /api/profiles calls profileCreationService internally
// Client only sees created profile, not base44_user_id in some contexts
```

## Role-Level Security Policies

### Admin Dashboard Access

```sql
-- /admin/failed-syncs: admin-only
CREATE POLICY failed_syncs_admin ON failed_syncs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Profile Creation Permissions

- **Creator**: Can create 1 profile (linked to auth.users via user_id)
- **Admin**: Can create any profile, sync to Base44
- **Client**: Read-only public profiles

## Error Handling & DLQ

### Failed Sync Entry

```sql
INSERT INTO failed_syncs (
  event_type,        -- 'profile_creation_error'
  source_data,       -- { user_id, user_email, profile_data, attempted_base44_user_id }
  error_message,     -- "Base44 API error: Invalid email"
  status,            -- 'pending' → admin retries
  retry_count,       -- 0, 1, 2 (max 3)
  max_retries        -- 3
) VALUES (...);
```

### Retry Policy (Exponential Backoff)

- **Attempt 1**: After 1 minute
- **Attempt 2**: After 5 minutes
- **Attempt 3**: After 30 minutes
- **Failed**: After 3 attempts, mark 'failed' for manual admin review

---

**Last Updated**: 2026-08-26
