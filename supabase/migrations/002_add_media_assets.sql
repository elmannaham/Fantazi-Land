-- Migration: 002 - Add Media Assets Table
-- Description: Store media files (images, videos, documents) for profiles
-- Created: 2026-08-26

CREATE TYPE media_type AS ENUM ('image', 'video', 'document');

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type media_type NOT NULL DEFAULT 'image',
  file_size_bytes INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0)
);

-- Indexes
CREATE INDEX idx_media_assets_profile_id ON media_assets(profile_id);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at DESC);
CREATE INDEX idx_media_assets_file_type ON media_assets(file_type);

-- Trigger for updated_at
CREATE TRIGGER media_assets_updated_at_trigger
BEFORE UPDATE ON media_assets
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

COMMENT ON TABLE media_assets IS 'Stores media files associated with creator profiles';
COMMENT ON COLUMN media_assets.file_url IS 'URL to the file in Supabase Storage';
COMMENT ON COLUMN media_assets.file_type IS 'Type of media: image, video, or document';
COMMENT ON COLUMN media_assets.uploaded_by IS 'User who uploaded the file';
