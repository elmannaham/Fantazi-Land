# Database Schema & Security — Fantazi-Land

## 📊 Schema Overview

The Fantazi-Land database consists of 8 main tables + 2 views for audit trail and monitoring.

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Core Tables:                                                   │
│  ├── profiles (main creator data)                              │
│  ├── media_assets (images, videos, documents)                  │
│  ├── reviews (ratings & testimonials)                          │
│  ├── bookings (project history)                                │
│  └── performance_stats (denormalized metrics)                  │
│                                                                 │
│  Security Tables:                                              │
│  ├── user_roles (client, creator, admin mapping)              │
│  ├── failed_syncs (dead letter queue)                          │
│  └── sync_logs (audit trail)                                   │
│                                                                 │
│  External:                                                      │
│  └── auth.users (Supabase Auth, managed by Supabase)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Tables in Detail

### 1. `profiles` — Creator Profiles

**Primary table** storing information about content creators.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,                      -- e.g., "Marina Dupont"
  category profile_category NOT NULL,      -- enum: Photographie, Vidéographie, etc.
  bio TEXT,                                -- Long-form bio
  avatar_url TEXT,                         -- URL to avatar in Storage
  
  -- Pricing
  base_rate DECIMAL(10,2),                 -- e.g., 1500.00
  currency TEXT DEFAULT 'EUR',             -- EUR, USD, GBP
  
  -- Social Links
  instagram_url TEXT,                      -- https://instagram.com/...
  tiktok_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  
  -- Visibility & Availability
  is_public BOOLEAN DEFAULT true,          -- Public on homepage?
  is_available BOOLEAN DEFAULT true,       -- Available for projects?
  availability_calendar JSONB,             -- { "2024-09": 5, "2024-10": 8 }
  
  -- System
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),      -- Auto-updated via trigger
  synced_at TIMESTAMP,                     -- Last sync with Storage
  storage_folder_id TEXT UNIQUE,           -- e.g., "Marina_Dupont_Photographie_eyJ..."
  
  -- Constraints
  CONSTRAINT valid_base_rate CHECK (base_rate IS NULL OR base_rate > 0),
  CONSTRAINT valid_currency CHECK (currency IN ('EUR', 'USD', 'GBP'))
);

-- Key Indexes
CREATE INDEX idx_profiles_category ON profiles(category);        -- Filter by category
CREATE INDEX idx_profiles_is_public ON profiles(is_public);      -- List public profiles
CREATE INDEX idx_profiles_created_at ON profiles(created_at);    -- Sort by newest
CREATE INDEX idx_profiles_user_id ON profiles(user_id);          -- Find user's profile
```

**Example Row:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "11110000-0000-0000-0000-000000000000",
  "name": "Marina Dupont",
  "category": "Photographie",
  "bio": "Photographe spécialisée en mode et lifestyle...",
  "avatar_url": "https://storage.../avatars/marina.jpg",
  "base_rate": 1500.00,
  "currency": "EUR",
  "instagram_url": "https://instagram.com/marinadupont",
  "is_public": true,
  "is_available": true,
  "availability_calendar": {"2024-09": 5, "2024-10": 8},
  "created_at": "2024-08-26T10:00:00Z",
  "updated_at": "2024-08-26T12:30:00Z",
  "synced_at": "2024-08-26T12:30:00Z",
  "storage_folder_id": "Marina_Dupont_Photographie_eyJ..."
}
```

---

### 2. `media_assets` — Files & Media

Stores images, videos, and documents uploaded by creators.

```sql
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  file_url TEXT NOT NULL,                  -- URL in Storage
  file_type media_type,                    -- enum: image, video, document
  file_size_bytes INTEGER,                 -- Size in bytes
  
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0)
);

CREATE INDEX idx_media_assets_profile_id ON media_assets(profile_id);
```

**Common Use Cases:**
- Display portfolio images on profile page
- Gallery lightbox on detail page
- Media management dashboard for creators

---

### 3. `reviews` — Ratings & Testimonials

Client reviews and ratings for creators.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  client_name TEXT,                        -- Display name (if anonymous)
  rating INTEGER NOT NULL,                 -- 1-5 stars
  comment TEXT,                            -- Review text
  is_verified BOOLEAN DEFAULT false,       -- From actual booking?
  
  created_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT comment_length CHECK (comment IS NULL OR length(comment) <= 1000)
);

CREATE INDEX idx_reviews_profile_id ON reviews(profile_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

**Triggers:**
- Auto-recalculate `performance_stats.avg_rating` when review added/removed

---

### 4. `bookings` — Project History

Project bookings and collaboration records.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Project Details
  project_title TEXT NOT NULL,
  project_description TEXT,
  status booking_status,                   -- pending → in_progress → completed
  deliverables JSONB,                      -- Array of items to deliver
  notes TEXT,
  
  -- Dates
  start_date DATE,
  end_date DATE,
  completed_at TIMESTAMP,
  
  -- Financial
  budget DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_budget CHECK (budget IS NULL OR budget > 0),
  CONSTRAINT valid_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

CREATE INDEX idx_bookings_profile_id ON bookings(profile_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
```

**Booking Statuses:**
- `pending` — Awaiting confirmation
- `confirmed` — Accepted
- `in_progress` — Work underway
- `completed` — Finished
- `cancelled` — Cancelled
- `disputed` — In dispute

---

### 5. `performance_stats` — Denormalized Metrics

**Denormalized table** for fast queries of creator statistics. Updated via triggers.

```sql
CREATE TABLE performance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  total_projects INTEGER DEFAULT 0,        -- Completed bookings count
  total_reviews INTEGER DEFAULT 0,         -- Review count
  avg_rating NUMERIC(3,2) DEFAULT 0,       -- 0-5.00
  response_time_hours INTEGER,             -- Avg response time
  completion_rate NUMERIC(5,2) DEFAULT 0,  -- 0-100
  repeat_client_rate NUMERIC(5,2) DEFAULT 0, -- 0-100
  
  last_project_date DATE,
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_avg_rating CHECK (avg_rating >= 0 AND avg_rating <= 5),
  CONSTRAINT valid_completion_rate CHECK (completion_rate >= 0 AND completion_rate <= 100)
);

CREATE INDEX idx_performance_stats_avg_rating ON performance_stats(avg_rating DESC);
CREATE INDEX idx_performance_stats_completion_rate ON performance_stats(completion_rate DESC);
```

**Why Denormalized?**
- Avoid expensive `GROUP BY` queries every time we display profiles
- Enable fast sorting by rating on homepage
- No N+1 queries when fetching profile lists

**Kept in Sync By:**
- Trigger on `reviews` table
- Trigger on `bookings` table
- Manual `recalculate_all_stats(profile_id)` function for admin

---

### 6. `user_roles` — Authorization Mapping

Maps users to their roles.

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL,                      -- enum: client, creator, admin
  created_at TIMESTAMP DEFAULT now(),
  
  CHECK (role IN ('client', 'creator', 'admin'))
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

**Roles:**
- `client` — Can view profiles, create bookings, leave reviews
- `creator` — Can view/edit own profile, upload media, view bookings
- `admin` — Full access to all data, management tools, DLQ

---

### 7. `failed_syncs` — Dead Letter Queue (DLQ)

Tracks failed synchronization events for debugging and retry.

```sql
CREATE TABLE failed_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_type sync_event_type,              -- storage_to_db, db_to_storage, webhook_error
  source_data JSONB NOT NULL,              -- Original payload that failed
  
  error_message TEXT,                      -- Exception message
  error_stack TEXT,                        -- Stack trace for debugging
  
  retry_count INTEGER DEFAULT 0,           -- How many retries so far
  max_retries INTEGER DEFAULT 3,           -- Max retries before giving up
  last_attempted_at TIMESTAMP,
  
  status sync_status DEFAULT 'pending',    -- pending, retrying, failed, resolved
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,                   -- Admin notes on how it was resolved
  
  created_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

CREATE INDEX idx_failed_syncs_status ON failed_syncs(status);
CREATE INDEX idx_failed_syncs_created_at ON failed_syncs(created_at DESC);
CREATE INDEX idx_failed_syncs_event_type ON failed_syncs(event_type);
```

**Example Usage:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "event_type": "storage_to_db",
  "source_data": {
    "type": "insert",
    "record": { "name": "Marina_Dupont_Photographie_eyJ..." }
  },
  "error_message": "Invalid metadata: name field missing",
  "retry_count": 2,
  "max_retries": 3,
  "status": "pending",
  "created_at": "2024-08-26T10:00:00Z"
}
```

**Admin Dashboard:**
- View failed syncs by type, status, date
- Manually resolve issues
- Trigger retries with exponential backoff
- View error logs

---

### 8. `sync_logs` — Audit Trail

Complete audit trail of all synchronization operations.

```sql
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sync_type sync_event_type NOT NULL,      -- storage_to_db, db_to_storage, etc.
  
  source_data JSONB,                       -- What was sent
  result_data JSONB,                       -- What was returned
  
  status sync_status DEFAULT 'success',    -- success, error, partial
  error_message TEXT,
  
  duration_ms INTEGER,                     -- How long the sync took
  triggered_by TEXT,                       -- "api", "webhook", "cron", "manual"
  
  created_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

CREATE INDEX idx_sync_logs_profile_id ON sync_logs(profile_id);
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at DESC);
CREATE INDEX idx_sync_logs_sync_type ON sync_logs(sync_type);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
```

**Analytics Queries:**
```sql
-- How many syncs today by type?
SELECT sync_type, COUNT(*) FROM sync_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY sync_type;

-- Average sync duration by type?
SELECT sync_type, AVG(duration_ms)::INT as avg_ms
FROM sync_logs
WHERE status = 'success'
GROUP BY sync_type;

-- Any errors in past hour?
SELECT * FROM sync_logs
WHERE status IN ('error', 'partial')
AND created_at > now() - interval '1 hour'
ORDER BY created_at DESC;
```

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled. Policies enforce authorization at the database level.

### Key Principles

1. **Default Deny** — Unless a policy explicitly allows access, data is hidden
2. **Role-Based** — Access depends on `user_roles.role` column
3. **Row-Scoped** — Different rows can have different access levels
4. **Transparent** — Queries automatically filtered based on `auth.uid()`

### Example: `profiles` RLS Policies

```sql
-- 1. Public profiles visible to everyone (including anonymous)
CREATE POLICY "Public profiles visible to all"
  ON profiles FOR SELECT
  USING (is_public = true);

-- 2. Creators see their own profile (even if not public)
CREATE POLICY "Creators view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Creators can only update their own profile
CREATE POLICY "Creators update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)           -- Can only update if user owns it
  WITH CHECK (auth.uid() = user_id);     -- Can only set their own user_id

-- 4. Admins see all profiles
CREATE POLICY "Admins view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 5. Admins can update/delete any profile
CREATE POLICY "Admins update all profiles"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_roles ...));
```

### Complete RLS Summary

| Table | Anonymous | Client | Creator | Admin |
|-------|-----------|--------|---------|-------|
| `profiles` | Read public | Read public | Read own, Edit own | All |
| `media_assets` | Read public | Read public | Read own, Write own | All |
| `reviews` | Read public | Read own, Write | Read own | All |
| `bookings` | None | Read/Edit own | Read own | All |
| `performance_stats` | Read public | Read public | Read own | All |
| `user_roles` | None | Read own | None | Read/Write all |
| `failed_syncs` | None | None | None | Read/Write |
| `sync_logs` | None | None | None | Read |

---

## 🔄 Triggers & Automation

### Trigger 1: Update `updated_at` Automatically

```sql
CREATE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at_trigger
BEFORE UPDATE ON profiles FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();
```

Applied to: `profiles`, `media_assets`, `reviews`, `bookings`, `performance_stats`

---

### Trigger 2: Auto-Create `performance_stats` When Profile Created

```sql
CREATE FUNCTION create_performance_stats_on_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO performance_stats (profile_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_create_stats
AFTER INSERT ON profiles FOR EACH ROW
EXECUTE FUNCTION create_performance_stats_on_profile();
```

---

### Trigger 3: Recalculate Average Rating When Reviews Change

```sql
CREATE FUNCTION recalculate_profile_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE performance_stats
  SET avg_rating = (
    SELECT AVG(rating)::NUMERIC(3,2) FROM reviews
    WHERE profile_id = COALESCE(NEW.profile_id, OLD.profile_id)
  )
  WHERE profile_id = COALESCE(NEW.profile_id, OLD.profile_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_recalc_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION recalculate_profile_avg_rating();
```

---

### Trigger 4: Update Completion Stats When Booking Completed

```sql
CREATE FUNCTION update_booking_completion_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
    UPDATE performance_stats
    SET total_projects = total_projects + 1
    WHERE profile_id = NEW.profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_completion_stats
BEFORE UPDATE ON bookings FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_booking_completion_stats();
```

---

## 📊 Useful Views

### View 1: Recent Sync Failures

```sql
CREATE VIEW recent_sync_failures AS
SELECT
  f.id,
  f.event_type,
  f.error_message,
  f.retry_count,
  f.max_retries,
  f.created_at,
  f.status
FROM failed_syncs f
WHERE f.status IN ('pending', 'retrying')
ORDER BY f.created_at DESC;
```

**Used in:** Admin DLQ dashboard

---

### View 2: Sync Performance Metrics (Last 24h)

```sql
CREATE VIEW sync_performance_metrics AS
SELECT
  sync_type,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status IN ('error', 'failed')) as failed,
  AVG(duration_ms)::INT as avg_duration_ms
FROM sync_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY sync_type;
```

**Used in:** Monitoring dashboard

---

## 🛠️ Useful Queries

### Get Creator's Profile with Stats

```sql
SELECT
  p.*,
  ps.avg_rating,
  ps.total_projects,
  ps.completion_rate,
  COUNT(r.id) as review_count
FROM profiles p
LEFT JOIN performance_stats ps ON ps.profile_id = p.id
LEFT JOIN reviews r ON r.profile_id = p.id
WHERE p.user_id = $1
GROUP BY p.id, ps.id;
```

### List Public Profiles by Category with Top Ratings

```sql
SELECT
  p.id,
  p.name,
  p.category,
  p.base_rate,
  ps.avg_rating,
  ps.total_projects,
  (SELECT COUNT(*) FROM media_assets WHERE profile_id = p.id) as media_count
FROM profiles p
LEFT JOIN performance_stats ps ON ps.profile_id = p.id
WHERE p.is_public = true
AND p.category = $1
ORDER BY ps.avg_rating DESC, ps.total_projects DESC
LIMIT 20;
```

### Find Failed Syncs Not Yet Retried

```sql
SELECT
  id,
  event_type,
  error_message,
  retry_count,
  max_retries,
  created_at
FROM failed_syncs
WHERE status = 'pending'
AND retry_count < max_retries
ORDER BY created_at ASC
LIMIT 10;
```

---

## 📈 Migrations & Versions

| Migration | Description | Status |
|-----------|-------------|--------|
| 001_init_profiles.sql | Create profiles table, enums, triggers | ✅ |
| 002_add_media_assets.sql | Media assets for portfolios | ✅ |
| 003_add_reviews.sql | Reviews & ratings | ✅ |
| 004_add_bookings.sql | Bookings & project history | ✅ |
| 005_add_performance_stats.sql | Denormalized stats + triggers | ✅ |
| 006_add_rls_policies.sql | Row-level security policies | ✅ |
| 007_add_failed_syncs_and_logs.sql | DLQ + audit trail | ✅ |

**To Run Migrations:**
```bash
# Local
npx supabase migration up

# Production (linked)
npx supabase migrations up --linked
```

---

## 🔍 Monitoring Checklist

- [ ] Check `failed_syncs` for unresolved errors
- [ ] Monitor `sync_logs` for performance degradation
- [ ] Verify `performance_stats` accuracy (vs. manual counts)
- [ ] Check disk usage (Supabase dashboard)
- [ ] Monitor connection pool (Supabase dashboard)
- [ ] Validate RLS policies are being enforced (test queries as different roles)

---

**Last Updated:** 2026-08-26  
**Version:** 1.0
