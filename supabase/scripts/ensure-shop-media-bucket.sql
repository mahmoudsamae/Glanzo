-- =============================================================================
-- Fix: "Bucket not found" when uploading minisite images
-- Run in Supabase Dashboard → SQL Editor → Run
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-media',
  'shop-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS shop_media_public_read ON storage.objects;
CREATE POLICY shop_media_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'shop-media');

-- Verify:
-- SELECT id, name, public FROM storage.buckets WHERE id = 'shop-media';
