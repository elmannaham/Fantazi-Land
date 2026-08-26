-- Migration: 006 - Add Row Level Security (RLS) Policies
-- Description: Implement role-based access control via RLS
-- Created: 2026-08-26

-- Create user_roles table first
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'creator', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- 1. Anonymous/Clients can see all public profiles
CREATE POLICY "Public profiles visible to all"
  ON profiles FOR SELECT
  USING (is_public = true);

-- 2. Creators can see their own profile
CREATE POLICY "Creators view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Creators can update their own profile
CREATE POLICY "Creators update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_public = (SELECT COALESCE((SELECT is_public FROM profiles WHERE id = profiles.id), true)));

-- 4. Creators can insert their own profile (for signup flow)
CREATE POLICY "Creators create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Admins can see all profiles
CREATE POLICY "Admins view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Admins can update all profiles
CREATE POLICY "Admins update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Admins can delete profiles
CREATE POLICY "Admins delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- MEDIA_ASSETS RLS POLICIES
-- ============================================================================

-- 1. Media visible if profile is public
CREATE POLICY "Public profile media visible to all"
  ON media_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = media_assets.profile_id
      AND profiles.is_public = true
    )
  );

-- 2. Creator can view media in their own profile
CREATE POLICY "Creators view own media"
  ON media_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = media_assets.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 3. Creator can upload media to their profile
CREATE POLICY "Creators upload media"
  ON media_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = media_assets.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 4. Creator can delete their own media
CREATE POLICY "Creators delete own media"
  ON media_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = media_assets.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 5. Admins have full access
CREATE POLICY "Admins manage all media"
  ON media_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- REVIEWS RLS POLICIES
-- ============================================================================

-- 1. Reviews visible for public profiles
CREATE POLICY "Public profile reviews visible"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = reviews.profile_id
      AND profiles.is_public = true
    )
  );

-- 2. Creators can view reviews on their profile
CREATE POLICY "Creators view own reviews"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = reviews.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 3. Clients can create reviews
CREATE POLICY "Clients create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- 4. Admins have full access
CREATE POLICY "Admins manage reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- BOOKINGS RLS POLICIES
-- ============================================================================

-- 1. Creators see bookings for their profile
CREATE POLICY "Creators view own bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = bookings.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 2. Clients see their own bookings
CREATE POLICY "Clients view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = client_id);

-- 3. Clients can create bookings
CREATE POLICY "Clients create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- 4. Clients can update their own bookings
CREATE POLICY "Clients update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- 5. Admins have full access
CREATE POLICY "Admins manage bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PERFORMANCE_STATS RLS POLICIES
-- ============================================================================

-- 1. Stats visible for public profiles
CREATE POLICY "Public profile stats visible"
  ON performance_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = performance_stats.profile_id
      AND profiles.is_public = true
    )
  );

-- 2. Creators can view their own stats
CREATE POLICY "Creators view own stats"
  ON performance_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = performance_stats.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 3. Admins have full access
CREATE POLICY "Admins manage stats"
  ON performance_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- USER_ROLES RLS POLICIES
-- ============================================================================

-- 1. Users can see their own role
CREATE POLICY "Users view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Admins can view all roles
CREATE POLICY "Admins view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Only admins can insert/update roles
CREATE POLICY "Admins manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE user_roles IS 'Maps users to their roles (client, creator, admin)';
COMMENT ON TABLE profiles IS 'Main profiles table - RLS prevents unauthorized access';
