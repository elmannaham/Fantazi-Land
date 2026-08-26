-- Migration: 010 - Add HOTESS Storage Bucket & RLS Policies
-- Description: Create HOTESS bucket for creator profiles + fine-grained Storage RLS
-- Created: 2026-08-26

-- ============================================================================
-- CREATE HOTESS BUCKET
-- ============================================================================

-- Create the HOTESS bucket (public, for profiles)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'HOTESS',
  'HOTESS',
  true,
  104857600,  -- 100MB max file size
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'text/plain',
    'application/json',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE RLS POLICIES FOR HOTESS BUCKET
-- ============================================================================

-- 1. Public Read Access - Anyone can view files in HOTESS
CREATE POLICY "Public Read HOTESS Assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'HOTESS');

-- 2. Authenticated Insert - Admins or creators in their own folder
CREATE POLICY "Authorized Insert HOTESS"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'HOTESS'
    AND (
      -- Admin role check (can upload anywhere in HOTESS)
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
      )
      OR
      -- Creator can upload to their own folder (by user_id prefix)
      storage.objects.name LIKE auth.uid() || '/%'
    )
  );

-- 3. Authenticated Update - Admins or folder owner
CREATE POLICY "Authorized Update HOTESS"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'HOTESS'
    AND (
      -- Admin role check
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
      )
      OR
      -- Creator can update their own folder
      storage.objects.name LIKE auth.uid() || '/%'
    )
  );

-- 4. Authenticated Delete - Admins or folder owner
CREATE POLICY "Authorized Delete HOTESS"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'HOTESS'
    AND (
      -- Admin role check
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
      )
      OR
      -- Creator can delete from their own folder
      storage.objects.name LIKE auth.uid() || '/%'
    )
  );

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Public Read HOTESS Assets" ON storage.objects IS 'Anyone can download profile photos, videos, and media from HOTESS bucket';
COMMENT ON POLICY "Authorized Insert HOTESS" ON storage.objects IS 'Only admins or creators uploading to their own folder can insert files';
COMMENT ON POLICY "Authorized Update HOTESS" ON storage.objects IS 'Only admins or file owners can update files';
COMMENT ON POLICY "Authorized Delete HOTESS" ON storage.objects IS 'Only admins or file owners can delete files';
