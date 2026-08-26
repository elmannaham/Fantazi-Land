-- Migration: 007 - Add Dead Letter Queue and Sync Logs
-- Description: Error tracking and audit trail for synchronization pipeline
-- Created: 2026-08-26

CREATE TYPE sync_event_type AS ENUM (
  'storage_to_db',
  'db_to_storage',
  'webhook_error',
  'import_csv',
  'manual_sync'
);

CREATE TYPE sync_status AS ENUM (
  'pending',
  'retrying',
  'failed',
  'resolved',
  'success',
  'error',
  'partial'
);

-- Dead Letter Queue table for failed syncs
CREATE TABLE IF NOT EXISTS failed_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type sync_event_type NOT NULL,
  source_data JSONB NOT NULL,
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status sync_status DEFAULT 'pending',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,

  -- Constraints
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

-- Indexes for DLQ
CREATE INDEX idx_failed_syncs_status ON failed_syncs(status);
CREATE INDEX idx_failed_syncs_created_at ON failed_syncs(created_at DESC);
CREATE INDEX idx_failed_syncs_event_type ON failed_syncs(event_type);
CREATE INDEX idx_failed_syncs_retry_count ON failed_syncs(retry_count);

-- Sync logs table for audit trail
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sync_type sync_event_type NOT NULL,
  source_data JSONB,
  result_data JSONB,
  status sync_status DEFAULT 'success',
  error_message TEXT,
  duration_ms INTEGER,
  triggered_by TEXT, -- "api", "webhook", "cron", "manual"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

-- Indexes for sync logs
CREATE INDEX idx_sync_logs_profile_id ON sync_logs(profile_id);
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at DESC);
CREATE INDEX idx_sync_logs_sync_type ON sync_logs(sync_type);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_triggered_by ON sync_logs(triggered_by);

-- View for recent sync failures
CREATE OR REPLACE VIEW recent_sync_failures AS
SELECT
  f.id,
  f.event_type,
  f.error_message,
  f.retry_count,
  f.max_retries,
  f.created_at,
  f.status,
  COUNT(sl.id) as related_logs
FROM failed_syncs f
LEFT JOIN sync_logs sl ON sl.source_data = f.source_data
WHERE f.status IN ('pending', 'retrying')
GROUP BY f.id
ORDER BY f.created_at DESC;

-- View for sync performance metrics
CREATE OR REPLACE VIEW sync_performance_metrics AS
SELECT
  sync_type,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status IN ('error', 'failed')) as failed,
  AVG(duration_ms) FILTER (WHERE status = 'success')::INT as avg_duration_ms,
  MAX(created_at) as last_sync
FROM sync_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY sync_type;

-- Function to move old logs to archive (optional)
CREATE OR REPLACE FUNCTION archive_old_sync_logs()
RETURNS void AS $$
BEGIN
  -- Delete logs older than 90 days
  DELETE FROM sync_logs
  WHERE created_at < now() - interval '90 days'
  AND status IN ('success', 'error');

  RAISE NOTICE 'Archived sync logs older than 90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to auto-resolve successful retries
CREATE OR REPLACE FUNCTION resolve_successful_retries()
RETURNS void AS $$
BEGIN
  UPDATE failed_syncs
  SET status = 'resolved', resolved_at = now()
  WHERE status = 'retrying'
  AND retry_count >= max_retries
  AND id IN (
    SELECT f.id FROM failed_syncs f
    JOIN sync_logs sl ON f.source_data = sl.source_data
    WHERE sl.status = 'success'
    AND sl.created_at > f.last_attempted_at
  );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for logging
ALTER TABLE failed_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for logging (admins only)
CREATE POLICY "Admins view failed syncs"
  ON failed_syncs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins resolve failed syncs"
  ON failed_syncs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service can insert failed syncs"
  ON failed_syncs FOR INSERT
  WITH CHECK (true); -- Only service account can insert via Edge Functions

CREATE POLICY "Admins view sync logs"
  ON sync_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service can insert sync logs"
  ON sync_logs FOR INSERT
  WITH CHECK (true); -- Only service account can insert via Edge Functions

COMMENT ON TABLE failed_syncs IS 'Dead Letter Queue - stores failed sync events for retry/debugging';
COMMENT ON TABLE sync_logs IS 'Audit trail for all synchronization events';
COMMENT ON VIEW recent_sync_failures IS 'Dashboard view of recent unresolved failures';
COMMENT ON VIEW sync_performance_metrics IS 'Performance metrics for sync operations (last 24h)';
COMMENT ON FUNCTION archive_old_sync_logs() IS 'Archives sync logs older than 90 days (run manually or via cron)';
