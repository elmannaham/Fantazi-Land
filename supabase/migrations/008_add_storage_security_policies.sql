-- Migration: 008 - Add Storage Security Policies (RLS for Supabase Storage)
-- Description: Implement fine-grained RLS for 'profiles' and 'avatars' storage buckets
-- Created: 2026-08-26

-- 1. Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profiles', 'profiles', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/octet-stream']),
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Public Read Access (Anon and Authenticated users can view public assets)
CREATE POLICY "Public Read on Storage Assets"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('profiles', 'avatars')
);

-- 3. Authenticated Insert (Creators in their folder, or Admins everywhere)
CREATE POLICY "Authorized Insert on Storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('profiles', 'avatars')
  AND (
    -- Admin role check
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
    OR
    -- Creator can upload into their profile or user directory
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND (
        storage.objects.name LIKE profiles.id || '/%'
        OR storage.objects.name LIKE profiles.storage_folder_id || '/%'
        OR storage.objects.name LIKE auth.uid() || '/%'
        OR storage.objects.name LIKE 'uploads/' || auth.uid() || '/%'
      )
    )
  )
);

-- 4. Authorized Update
CREATE POLICY "Authorized Update on Storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('profiles', 'avatars')
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND (
        storage.objects.name LIKE profiles.id || '/%'
        OR storage.objects.name LIKE profiles.storage_folder_id || '/%'
        OR storage.objects.name LIKE auth.uid() || '/%'
      )
    )
  )
);

-- 5. Authorized Delete
CREATE POLICY "Authorized Delete on Storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('profiles', 'avatars')
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND (
        storage.objects.name LIKE profiles.id || '/%'
        OR storage.objects.name LIKE profiles.storage_folder_id || '/%'
        OR storage.objects.name LIKE auth.uid() || '/%'
      )
    )
  )
);
