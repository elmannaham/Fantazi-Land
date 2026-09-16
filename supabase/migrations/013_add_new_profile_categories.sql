-- Migration: 013 - Add new profile categories
-- Description: Adds 'intime rencontre', 'Dinner & Show' (previously added at the
-- application layer only, never migrated to the DB enum) and 'Homme' to the
-- profile_category enum.
-- Created: 2026-09-16

ALTER TYPE profile_category ADD VALUE IF NOT EXISTS 'intime rencontre';
ALTER TYPE profile_category ADD VALUE IF NOT EXISTS 'Dinner & Show';
ALTER TYPE profile_category ADD VALUE IF NOT EXISTS 'Homme';
