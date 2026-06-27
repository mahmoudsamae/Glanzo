-- Ensure shop-media bucket exists (fixes "Bucket not found" on image upload).
-- Safe to re-run after a partial reset or if storage was wiped separately from public schema.

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

-- Public read (minisite images)
DROP POLICY IF EXISTS shop_media_public_read ON storage.objects;
CREATE POLICY shop_media_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'shop-media');
