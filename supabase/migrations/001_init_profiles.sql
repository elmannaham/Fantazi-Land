-- Migration: 001 - Initialize Profiles Table
-- Description: Create the main profiles table for content creators
-- Created: 2026-08-26

-- Create enum for profile categories
CREATE TYPE profile_category AS ENUM (
  'Photographie',
  'Vidéographie',
  'Contenu Mode',
  'Beauté',
  'Lifestyle',
  'Gaming'
);

-- Main profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category profile_category NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  base_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  instagram_url TEXT,
  tiktok_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  availability_calendar JSONB, -- { "2024-09": 5, "2024-10": 8 }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE,
  storage_folder_id TEXT UNIQUE,

  -- Constraints
  CONSTRAINT valid_base_rate CHECK (base_rate IS NULL OR base_rate > 0),
  CONSTRAINT valid_currency CHECK (currency IN ('EUR', 'USD', 'GBP'))
);

-- Indexes for performance
CREATE INDEX idx_profiles_category ON profiles(category);
CREATE INDEX idx_profiles_is_public ON profiles(is_public);
CREATE INDEX idx_profiles_is_available ON profiles(is_available);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_storage_folder_id ON profiles(storage_folder_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Comments for documentation
COMMENT ON TABLE profiles IS 'Stores creator profiles for the booking platform';
COMMENT ON COLUMN profiles.id IS 'Unique profile identifier';
COMMENT ON COLUMN profiles.user_id IS 'Reference to authenticated user';
COMMENT ON COLUMN profiles.storage_folder_id IS 'Identifier for synced Storage folder';
COMMENT ON COLUMN profiles.synced_at IS 'Last sync timestamp with Storage';
COMMENT ON COLUMN profiles.availability_calendar IS 'JSON object tracking availability by month';
