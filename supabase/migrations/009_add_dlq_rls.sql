-- Migration: 009 - Add Row Level Security for failed_syncs & sync_logs
-- Description: Restrict Dead Letter Queue and audit logs to admins only
-- Created: 2026-08-26

-- Enable RLS on failed_syncs and sync_logs
ALTER TABLE failed_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FAILED_SYNCS RLS POLICIES (Dead Letter Queue)
-- ============================================================================

-- 1. Admins can view all failed syncs
DROP POLICY IF EXISTS "Admins view failed syncs" ON failed_syncs;
CREATE POLICY "Admins view failed syncs"
  ON failed_syncs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Admins can update failed syncs (to retry or resolve)
DROP POLICY IF EXISTS "Admins update failed syncs" ON failed_syncs;
CREATE POLICY "Admins update failed syncs"
  ON failed_syncs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Admins can delete failed syncs (cleanup)
DROP POLICY IF EXISTS "Admins delete failed syncs" ON failed_syncs;
CREATE POLICY "Admins delete failed syncs"
  ON failed_syncs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Note: Service role bypasses RLS and can INSERT/UPDATE as needed by Edge Functions

-- ============================================================================
-- SYNC_LOGS RLS POLICIES (Audit Trail)
-- ============================================================================

-- 1. Admins can view all sync logs
DROP POLICY IF EXISTS "Admins view sync logs" ON sync_logs;
CREATE POLICY "Admins view sync logs"
  ON sync_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Creators can view sync logs for their own profile
DROP POLICY IF EXISTS "Creators view own sync logs" ON sync_logs;
CREATE POLICY "Creators view own sync logs"
  ON sync_logs FOR SELECT
  USING (
    profile_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = sync_logs.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 3. Anonymous logs visible only to admins
DROP POLICY IF EXISTS "Admins view anonymous sync logs" ON sync_logs;
CREATE POLICY "Admins view anonymous sync logs"
  ON sync_logs FOR SELECT
  USING (
    profile_id IS NULL
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Note: Service role bypasses RLS and can INSERT as needed by Edge Functions

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE failed_syncs IS 'Dead Letter Queue - stores failed sync operations with retry logic. Restricted to admins.';
COMMENT ON TABLE sync_logs IS 'Audit trail - logs all sync operations (success/error). Admins see all, creators see their own.';
COMMENT ON COLUMN failed_syncs.status IS 'pending, retrying, failed, resolved';
COMMENT ON COLUMN failed_syncs.retry_count IS 'Number of retry attempts (max 3)';
COMMENT ON COLUMN sync_logs.sync_type IS 'storage_to_db, db_to_storage, base44_user_created, etc';
COMMENT ON COLUMN sync_logs.status IS 'success, error, partial';
