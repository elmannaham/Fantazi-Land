-- Migration: 005 - Add Performance Statistics Table
-- Description: Denormalized performance metrics for quick queries
-- Created: 2026-08-26

CREATE TABLE IF NOT EXISTS performance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_projects INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  response_time_hours INTEGER,
  completion_rate NUMERIC(5,2) DEFAULT 0, -- 0-100
  repeat_client_rate NUMERIC(5,2) DEFAULT 0, -- 0-100
  last_project_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_avg_rating CHECK (avg_rating >= 0 AND avg_rating <= 5),
  CONSTRAINT valid_completion_rate CHECK (completion_rate >= 0 AND completion_rate <= 100),
  CONSTRAINT valid_repeat_rate CHECK (repeat_client_rate >= 0 AND repeat_client_rate <= 100)
);

-- Indexes
CREATE INDEX idx_performance_stats_profile_id ON performance_stats(profile_id);
CREATE INDEX idx_performance_stats_avg_rating ON performance_stats(avg_rating DESC);
CREATE INDEX idx_performance_stats_completion_rate ON performance_stats(completion_rate DESC);

-- Trigger to update updated_at
CREATE TRIGGER performance_stats_updated_at_trigger
BEFORE UPDATE ON performance_stats
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Function to insert stats when profile created
CREATE OR REPLACE FUNCTION create_performance_stats_on_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO performance_stats (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_create_stats
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_performance_stats_on_profile();

-- Function to recalculate all stats for a profile
CREATE OR REPLACE FUNCTION recalculate_all_stats(profile_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE performance_stats SET
    total_projects = COALESCE(
      (SELECT COUNT(*) FROM bookings WHERE profile_id = profile_id_param AND status = 'completed'),
      0
    ),
    total_reviews = COALESCE(
      (SELECT COUNT(*) FROM reviews WHERE profile_id = profile_id_param),
      0
    ),
    avg_rating = COALESCE(
      (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE profile_id = profile_id_param),
      0
    ),
    completion_rate = COALESCE(
      (SELECT (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0) * 100)::NUMERIC(5,2)
       FROM bookings WHERE profile_id = profile_id_param),
      0
    ),
    last_project_date = (
      SELECT MAX(completed_at)::DATE FROM bookings
      WHERE profile_id = profile_id_param AND status = 'completed'
    ),
    updated_at = now()
  WHERE profile_id = profile_id_param;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE performance_stats IS 'Denormalized performance metrics for creators (updated via triggers)';
COMMENT ON FUNCTION recalculate_all_stats(UUID) IS 'Manually recalculate all stats for a profile';
