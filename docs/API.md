# API Documentation — Fantazi-Land

## 🔌 Overview

RESTful API built with Next.js API Routes + Supabase Edge Functions. All endpoints use JSON.

**Base URL:** `https://fantazi-land.vercel.app` (production)  
**API Version:** v1  
**Authentication:** Supabase Auth (Bearer token in Authorization header)

---

## 🔑 Authentication

### Getting an Auth Token

```javascript
// Client-side with Supabase
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Token automatically stored in session cookie
// Automatically sent with requests
```

### Using the Token

```bash
# In API requests, token is automatically sent as httpOnly cookie
# OR manually in Authorization header:

curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  https://fantazi-land.vercel.app/api/profiles
```

---

## 📋 Endpoints

### Profiles

#### GET `/api/profiles` — List Profiles

Fetch all public profiles with optional filtering.

**Query Parameters:**
```typescript
{
  category?: string;        // Filter by category (e.g., "Photographie")
  search?: string;          // Search by name
  limit?: number;           // Default: 20
  offset?: number;          // Default: 0
  sortBy?: 'rating' | 'newest' | 'projects';  // Default: 'newest'
}
```

**Example Request:**
```bash
GET /api/profiles?category=Photographie&limit=10&sortBy=rating
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Marina Dupont",
      "category": "Photographie",
      "bio": "Photographe spécialisée en mode...",
      "avatar_url": "https://storage.../marina.jpg",
      "base_rate": 1500,
      "currency": "EUR",
      "is_available": true,
      "performance_stats": {
        "avg_rating": 4.8,
        "total_projects": 25,
        "completion_rate": 98
      }
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

**Errors:**
```json
{
  "success": false,
  "error": "Invalid category",
  "code": "VALIDATION_ERROR"
}
```

---

#### GET `/api/profiles/[id]` — Get Single Profile

Fetch detailed information about a specific profile.

**Path Parameters:**
```typescript
{
  id: string;  // Profile UUID
}
```

**Query Parameters:**
```typescript
{
  includeMedia?: boolean;     // Include media assets (default: true)
  includeReviews?: boolean;   // Include reviews (default: true)
  reviewLimit?: number;       // Limit reviews (default: 5)
}
```

**Example Request:**
```bash
GET /api/profiles/550e8400-e29b-41d4-a716-446655440000?includeMedia=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Marina Dupont",
    "category": "Photographie",
    "bio": "Photographe spécialisée...",
    "avatar_url": "https://storage.../marina.jpg",
    "base_rate": 1500,
    "currency": "EUR",
    "instagram_url": "https://instagram.com/marinadupont",
    "tiktok_url": "https://tiktok.com/@marinadupont",
    "website_url": "https://marinadupont.com",
    "is_available": true,
    "availability_calendar": {
      "2024-09": 5,
      "2024-10": 8
    },
    "performance_stats": {
      "avg_rating": 4.8,
      "total_projects": 25,
      "completion_rate": 98,
      "response_time_hours": 4
    },
    "media_assets": [
      {
        "id": "media-id-1",
        "file_url": "https://storage.../photo1.jpg",
        "file_type": "image",
        "created_at": "2024-08-20T10:00:00Z"
      }
    ],
    "reviews": [
      {
        "id": "review-id-1",
        "client_name": "Jean M.",
        "rating": 5,
        "comment": "Travail excellent!",
        "is_verified": true,
        "created_at": "2024-08-15T00:00:00Z"
      }
    ]
  }
}
```

**Errors:**
```json
{
  "success": false,
  "error": "Profile not found",
  "code": "NOT_FOUND"
}
```

---

#### POST `/api/profiles/create` — Create Profile

Create a new profile (admin or signup flow).

**Authentication:** Required (admin or creator signup)

**Request Body:**
```typescript
{
  name: string;                    // Required: "Marina Dupont"
  category: string;                // Required: "Photographie"
  bio?: string;                    // Optional
  baseRate?: number;               // Optional: 1500
  currency?: string;               // Optional: "EUR" | "USD" | "GBP"
  instagram?: string;              // Optional URL
  tiktok?: string;                 // Optional URL
  twitter?: string;                // Optional URL
  website?: string;                // Optional URL
  isAvailable?: boolean;           // Optional: true
  avatarUrl?: string;              // Optional: URL to uploaded avatar
}
```

**Example Request:**
```bash
POST /api/profiles/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Marina Dupont",
  "category": "Photographie",
  "bio": "Photographe spécialisée en mode...",
  "baseRate": 1500,
  "currency": "EUR",
  "instagram": "https://instagram.com/marinadupont",
  "isAvailable": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Marina Dupont",
    "category": "Photographie",
    "storage_folder_id": "Marina_Dupont_Photographie_eyJ...",
    "created_at": "2024-08-26T10:00:00Z"
  }
}
```

**Errors:**
```json
{
  "success": false,
  "error": "Profile already exists for this user",
  "code": "CONFLICT"
}
```

```json
{
  "success": false,
  "error": "Validation error: baseRate must be positive",
  "code": "VALIDATION_ERROR"
}
```

---

#### PUT `/api/profiles/[id]` — Update Profile

Update an existing profile (only by owner or admin).

**Path Parameters:**
```typescript
{ id: string; }  // Profile UUID
```

**Request Body:** (same as POST, but all fields optional)
```typescript
{
  name?: string;
  category?: string;
  bio?: string;
  baseRate?: number;
  // ... etc
}
```

**Example Request:**
```bash
PUT /api/profiles/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
Authorization: Bearer <token>

{
  "bio": "Photographe spécialisée en mode et lifestyle. 8+ ans d'expérience.",
  "baseRate": 1800
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bio": "Photographe spécialisée...",
    "baseRate": 1800,
    "updated_at": "2024-08-26T12:30:00Z",
    "storage_folder_id": "Marina_Dupont_Photographie_eyJ..." // Updated
  }
}
```

**Errors:**
```json
{
  "success": false,
  "error": "Unauthorized: You can only edit your own profile",
  "code": "FORBIDDEN"
}
```

---

#### DELETE `/api/profiles/[id]` — Delete Profile

Delete a profile (admin or owner).

**Path Parameters:**
```typescript
{ id: string; }  // Profile UUID
```

**Example Request:**
```bash
DELETE /api/profiles/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

#### POST `/api/profiles/import-csv` — Batch Import

Import multiple profiles from CSV file (admin only).

**Authentication:** Required (admin role)

**Request (multipart/form-data):**
```
file: <csv file>
```

**CSV Format:**
```csv
name,category,bio,baseRate,currency,instagram,isAvailable
"Marina Dupont","Photographie","Bio...",1500,"EUR","https://instagram.com/...",true
"Sophie Martin","Vidéographie","Bio...",2000,"EUR","https://instagram.com/...",true
```

**Example Request:**
```bash
POST /api/profiles/import-csv
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=@profiles.csv
```

**Response (201 Created):**
```json
{
  "success": true,
  "inserted": 5,
  "failed": 0,
  "results": [
    {
      "name": "Marina Dupont",
      "status": "success",
      "profileId": "uuid-1"
    },
    {
      "name": "Sophie Martin",
      "status": "success",
      "profileId": "uuid-2"
    }
  ]
}
```

**Errors:**
```json
{
  "success": false,
  "error": "CSV parsing failed",
  "code": "PARSE_ERROR",
  "details": {
    "line": 3,
    "error": "Invalid baseRate: expected number"
  }
}
```

---

### Media & Uploads

#### POST `/api/upload` — Upload Image

Upload an image file (for avatars, media assets).

**Authentication:** Required

**Request (multipart/form-data):**
```
file: <image file>
profileId?: string  // Optional: associate with profile
```

**Example Request:**
```bash
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=@marina-avatar.jpg
profileId=550e8400-e29b-41d4-a716-446655440000
```

**Response (201 Created):**
```json
{
  "success": true,
  "file": {
    "id": "media-id-1",
    "url": "https://storage.../media-id-1.jpg",
    "name": "marina-avatar.jpg",
    "size": 256000,
    "type": "image/jpeg"
  }
}
```

**Errors:**
```json
{
  "success": false,
  "error": "File too large (max 10MB)",
  "code": "VALIDATION_ERROR"
}
```

---

#### DELETE `/api/upload/[id]` — Delete File

Delete an uploaded file.

**Path Parameters:**
```typescript
{ id: string; }  // Media asset UUID
```

**Example Request:**
```bash
DELETE /api/upload/media-id-1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File deleted"
}
```

---

### Authentication

#### POST `/api/auth/callback` — OAuth Callback

Handled automatically by Supabase. Redirects to `/dashboard` after login.

#### POST `/api/auth/logout` — Logout

Logout current user and clear session.

**Example Request:**
```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out"
}
```

---

## 🔄 Webhooks

### POST `/api/webhooks/storage-sync` — Storage Webhook Handler

**Triggered by:** Supabase Storage webhook (internal)

**Payload:**
```json
{
  "type": "insert",
  "record": {
    "name": "Marina_Dupont_Photographie_eyJ...",
    "bucket_id": "profiles"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "action": "created",
  "profileId": "uuid-1"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid folder name format",
  "severity": "validation"
}
```

---

## 📊 Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `SUCCESS` | 200 | Operation successful |
| `CREATED` | 201 | Resource created |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Auth token missing/invalid |
| `FORBIDDEN` | 403 | User lacks permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `PARSE_ERROR` | 422 | CSV/JSON parse error |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 🔒 Rate Limiting

**Not yet implemented.** Will add:
- 100 requests per minute per user
- 1000 requests per minute per IP
- Tracked via `X-RateLimit-*` headers

---

## 📝 Request/Response Format

All requests/responses use JSON.

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>  (optional, required for protected endpoints)
```

### Response Structure
```json
{
  "success": true|false,
  "data": { /* response data */ } | null,
  "error": "error message" | null,
  "code": "ERROR_CODE" | null
}
```

---

## 🧪 Example: Complete Create Flow

```bash
# 1. Sign up
curl -X POST https://fantazi-land.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"marina@example.com","password":"secure123"}'

# 2. Upload avatar
curl -X POST https://fantazi-land.vercel.app/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@marina-avatar.jpg"

# 3. Create profile
curl -X POST https://fantazi-land.vercel.app/api/profiles/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name":"Marina Dupont",
    "category":"Photographie",
    "baseRate":1500,
    "avatarUrl":"<url-from-step-2>"
  }'

# 4. View profile on homepage (no auth needed)
curl https://fantazi-land.vercel.app/api/profiles?category=Photographie
```

---

## 🚀 Changelog

### v1.0 (2024-08-26)
- Initial API release
- All endpoints documented
- CSV import working
- Storage sync functional

---

**Last Updated:** 2026-08-26  
**Version:** 1.0

## POST /api/profiles — Create Profile + Base44 User (Atomic)

**Authenticated**: Yes (required)  
**Role**: creator, admin  
**Returns**: Profile object + base44_user_id link

### Request

```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Alice Photography",
    "categorie": "Photographie",
    "bio": "Professional portrait & wedding photography",
    "avatar_url": "https://storage.example.com/avatar.jpg",
    "base_rate": 2500,
    "currency": "EUR",
    "instagram": "https://instagram.com/alice_photo",
    "tiktok": "https://tiktok.com/@alice_photo",
    "twitter": "https://twitter.com/alice_photo",
    "website": "https://alicephoto.com"
  }'
```

### Response (201 Created)

```json
{
  "success": true,
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-uuid-123",
    "name": "Alice Photography",
    "category": "Photographie",
    "bio": "Professional portrait & wedding photography",
    "avatar_url": "https://storage.example.com/avatar.jpg",
    "base_rate": "2500.00",
    "currency": "EUR",
    "instagram_url": "https://instagram.com/alice_photo",
    "base44_user_id": "base44-user-abc123",
    "is_public": true,
    "is_available": true,
    "created_at": "2026-08-26T10:30:00Z",
    "updated_at": "2026-08-26T10:30:00Z",
    "performance_stats": {
      "total_projects": 0,
      "total_reviews": 0,
      "avg_rating": 5.0,
      "response_time_hours": 4,
      "completion_rate": 100.0
    }
  },
  "base44_user_id": "base44-user-abc123",
  "sync_log_id": "sync-log-uuid-123"
}
```

### Error Responses

**400 Bad Request** — Validation failed
```json
{
  "success": false,
  "error": "Validation error: nom is required"
}
```

**500 Server Error** — Base44 creation failed, rolled back
```json
{
  "success": false,
  "error": "Erreur création profil + Base44: Base44 API error: Invalid email",
  "code": "PROFILE_CREATION_ERROR"
}
```
⚠️ Check `/admin/failed-syncs` dashboard for retry options.

---

## GET /api/failed-syncs?status=pending — Admin DLQ Dashboard

**Authenticated**: Yes (admin only)  
**Returns**: Array of failed sync entries

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "dlq-entry-123",
      "event_type": "profile_creation_error",
      "error_message": "Base44 API error: Invalid email",
      "retry_count": 0,
      "max_retries": 3,
      "status": "pending",
      "last_attempted_at": "2026-08-26T10:30:00Z",
      "created_at": "2026-08-26T10:29:00Z",
      "source_data": {
        "user_id": "user-uuid",
        "user_email": "creator@example.com",
        "profile_data": { "nom": "...", "categorie": "..." }
      }
    }
  ]
}
```

---

**Last Updated**: 2026-08-26
