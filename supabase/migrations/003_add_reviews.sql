-- Migration: 003 - Add Reviews/Testimonials Table
-- Description: Store client reviews and ratings for creators
-- Created: 2026-08-26

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT,
  rating INTEGER NOT NULL,
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT comment_length CHECK (comment IS NULL OR length(comment) <= 1000)
);

-- Indexes
CREATE INDEX idx_reviews_profile_id ON reviews(profile_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_is_verified ON reviews(is_verified);

-- Trigger for updated_at
CREATE TRIGGER reviews_updated_at_trigger
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Function to recalculate average rating for profile
CREATE OR REPLACE FUNCTION recalculate_profile_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update performance_stats with new average rating
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

COMMENT ON TABLE reviews IS 'Stores client reviews and ratings for creators';
COMMENT ON COLUMN reviews.is_verified IS 'Flag for verified purchases/projects';
