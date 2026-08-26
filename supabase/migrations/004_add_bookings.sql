-- Migration: 004 - Add Bookings/Projects Table
-- Description: Store project bookings and collaboration history
-- Created: 2026-08-26

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'disputed'
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT,
  client_email TEXT,
  project_title TEXT NOT NULL,
  project_description TEXT,
  status booking_status DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  deliverables JSONB, -- Array of deliverable items
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_budget CHECK (budget IS NULL OR budget > 0),
  CONSTRAINT valid_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- Indexes
CREATE INDEX idx_bookings_profile_id ON bookings(profile_id);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);

-- Trigger for updated_at
CREATE TRIGGER bookings_updated_at_trigger
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Function to update completion stats when booking completed
CREATE OR REPLACE FUNCTION update_booking_completion_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Mark completion time
    NEW.completed_at = now();

    -- Trigger performance stats update
    UPDATE performance_stats
    SET total_projects = total_projects + 1
    WHERE profile_id = NEW.profile_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_completion_stats
BEFORE UPDATE ON bookings
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_booking_completion_stats();

COMMENT ON TABLE bookings IS 'Stores project bookings and collaboration history';
COMMENT ON COLUMN bookings.status IS 'Current status of the booking/project';
COMMENT ON COLUMN bookings.deliverables IS 'JSON array of project deliverables';
