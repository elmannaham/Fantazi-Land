-- Migration: 011 - Add Base44 User ID Link to Profiles
-- Description: Link profiles to Base44 users for atomic creation and sync
-- Created: 2026-08-26

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS base44_user_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_base44_user_id
  ON profiles(base44_user_id);

COMMENT ON COLUMN profiles.base44_user_id IS
  'External ID linking to Base44 User entity for CRM bidirectional sync';
