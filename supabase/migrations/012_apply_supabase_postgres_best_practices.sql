-- Migration: 012 - Apply Supabase Postgres Best Practices
-- Description: Indexes optimization, RLS performance boost, Security Definer hardening & cleanup
-- Created: 2026-08-26

-- ============================================================================
-- 1. EXTENSIONS & SEARCH OPTIMIZATION
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index Trigramme pour recherche textuelle performante (accélère ILIKE '%...%')
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm 
  ON public.profiles USING gin (name gin_trgm_ops);

-- ============================================================================
-- 2. MISSING FOREIGN KEY INDEXES (PREVENTS CASCADE SEQ SCANS)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by 
  ON public.media_assets(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_reviews_client_id 
  ON public.reviews(client_id);

CREATE INDEX IF NOT EXISTS idx_failed_syncs_resolved_by 
  ON public.failed_syncs(resolved_by);

-- ============================================================================
-- 3. COMPOSITE & PARTIAL INDEXES
-- ============================================================================
-- Supprimer l'index B-tree sur booléen seul (très faible sélectivité)
DROP INDEX IF EXISTS public.idx_profiles_is_public;

-- Index partiel composite pour la liste filtrée et triée des créatrices publiques
CREATE INDEX IF NOT EXISTS idx_profiles_category_created_at_public 
  ON public.profiles (category, created_at DESC) 
  WHERE is_public = true;

-- Index partiel pour les syncs en échec en attente de retry
CREATE INDEX IF NOT EXISTS idx_failed_syncs_pending_active 
  ON public.failed_syncs (created_at ASC) 
  WHERE status IN ('pending', 'retrying');

-- ============================================================================
-- 4. SECURITY DEFINER HELPER FUNCTION (IS_ADMIN)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = (select auth.uid()) AND role = 'admin'
  );
$$;

-- ============================================================================
-- 5. FUNCTION SEARCH_PATH HARDENING
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_profiles_updated_at') THEN
    ALTER FUNCTION public.update_profiles_updated_at() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_performance_stats_on_profile') THEN
    ALTER FUNCTION public.create_performance_stats_on_profile() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'recalculate_profile_avg_rating') THEN
    ALTER FUNCTION public.recalculate_profile_avg_rating() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_booking_completion_stats') THEN
    ALTER FUNCTION public.update_booking_completion_stats() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'recalculate_all_stats') THEN
    ALTER FUNCTION public.recalculate_all_stats(UUID) SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'archive_old_sync_logs') THEN
    ALTER FUNCTION public.archive_old_sync_logs() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'resolve_successful_retries') THEN
    ALTER FUNCTION public.resolve_successful_retries() SET search_path = public;
  END IF;
END $$;

-- ============================================================================
-- 6. REMOVE PERMISSIVE DLQ INSERT POLICIES (SERVICE_ROLE ALREADY BYPASSES RLS)
-- ============================================================================
DROP POLICY IF EXISTS "Service can insert failed syncs" ON public.failed_syncs;
DROP POLICY IF EXISTS "Service can insert sync logs" ON public.sync_logs;

-- ============================================================================
-- 7. REFACTOR RLS POLICIES FOR OPTIMAL QUERY PERFORMANCE & SECURITY
-- ============================================================================

-- --- PROFILES ---
DROP POLICY IF EXISTS "Creators view own profile" ON public.profiles;
CREATE POLICY "Creators view own profile" ON public.profiles 
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Creators update own profile" ON public.profiles;
CREATE POLICY "Creators update own profile" ON public.profiles 
  FOR UPDATE USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Creators create own profile" ON public.profiles;
CREATE POLICY "Creators create own profile" ON public.profiles 
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles 
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles" ON public.profiles 
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
CREATE POLICY "Admins delete profiles" ON public.profiles 
  FOR DELETE USING (public.is_admin());

-- --- MEDIA_ASSETS ---
DROP POLICY IF EXISTS "Creators view own media" ON public.media_assets;
CREATE POLICY "Creators view own media" ON public.media_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = media_assets.profile_id
      AND profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Creators upload media" ON public.media_assets;
CREATE POLICY "Creators upload media" ON public.media_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = media_assets.profile_id
      AND profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Creators delete own media" ON public.media_assets;
CREATE POLICY "Creators delete own media" ON public.media_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = media_assets.profile_id
      AND profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins manage all media" ON public.media_assets;
CREATE POLICY "Admins manage all media" ON public.media_assets FOR ALL
  USING (public.is_admin());

-- --- REVIEWS ---
DROP POLICY IF EXISTS "Creators view own reviews" ON public.reviews;
CREATE POLICY "Creators view own reviews" ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = reviews.profile_id
      AND profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients create reviews" ON public.reviews;
CREATE POLICY "Clients create reviews" ON public.reviews FOR INSERT
  WITH CHECK ((select auth.uid()) = client_id);

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL
  USING (public.is_admin());

-- --- BOOKINGS ---
DROP POLICY IF EXISTS "Creators view own bookings" ON public.bookings;
CREATE POLICY "Creators view own bookings" ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = bookings.profile_id
      AND profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients view own bookings" ON public.bookings;
CREATE POLICY "Clients view own bookings" ON public.bookings FOR SELECT
  USING ((select auth.uid()) = client_id);

DROP POLICY IF EXISTS "Clients create bookings" ON public.bookings;
CREATE POLICY "Clients create bookings" ON public.bookings FOR INSERT
  WITH CHECK ((select auth.uid()) = client_id);

DROP POLICY IF EXISTS "Clients update own bookings" ON public.bookings;
CREATE POLICY "Clients update own bookings" ON public.bookings FOR UPDATE
  USING ((select auth.uid()) = client_id)
  WITH CHECK ((select auth.uid()) = client_id);

DROP POLICY IF EXISTS "Admins manage bookings" ON public.bookings;
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL
  USING (public.is_admin());

-- --- PERFORMANCE_STATS ---
DROP POLICY IF EXISTS "Creators view own stats" ON public.performance_stats;
CREATE POLICY "Creators view own stats" ON public.performance_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = performance_stats.profile_id
      AND profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins manage stats" ON public.performance_stats;
CREATE POLICY "Admins manage stats" ON public.performance_stats FOR ALL
  USING (public.is_admin());

-- --- USER_ROLES ---
DROP POLICY IF EXISTS "Users view own role" ON public.user_roles;
CREATE POLICY "Users view own role" ON public.user_roles 
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles 
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles 
  FOR ALL USING (public.is_admin());

-- --- FAILED_SYNCS & SYNC_LOGS ---
DROP POLICY IF EXISTS "Admins view failed syncs" ON public.failed_syncs;
CREATE POLICY "Admins view failed syncs" ON public.failed_syncs 
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update failed syncs" ON public.failed_syncs;
CREATE POLICY "Admins update failed syncs" ON public.failed_syncs 
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete failed syncs" ON public.failed_syncs;
CREATE POLICY "Admins delete failed syncs" ON public.failed_syncs 
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins view sync logs" ON public.sync_logs;
CREATE POLICY "Admins view sync logs" ON public.sync_logs 
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Creators view own sync logs" ON public.sync_logs;
CREATE POLICY "Creators view own sync logs" ON public.sync_logs FOR SELECT
  USING (
    profile_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = sync_logs.profile_id
      AND profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins view anonymous sync logs" ON public.sync_logs;
CREATE POLICY "Admins view anonymous sync logs" ON public.sync_logs 
  FOR SELECT USING (profile_id IS NULL AND public.is_admin());
