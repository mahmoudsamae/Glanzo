-- Velvet hero background videos: allow MP4/WebM in shop-media (hero_video/ prefix).

UPDATE storage.buckets
SET
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]::text[]
WHERE id = 'shop-media';

CREATE OR REPLACE FUNCTION public.shop_media_path_owned(p_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (storage.foldername(p_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.is_shop_owner(((storage.foldername(p_name))[1])::uuid)
    AND (storage.foldername(p_name))[2] IN ('logo', 'cover', 'gallery', 'service', 'hero_video');
$$;

CREATE OR REPLACE FUNCTION public.shop_media_path_writable(p_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (storage.foldername(p_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND (
      public.is_shop_owner(((storage.foldername(p_name))[1])::uuid)
      OR public.is_platform_admin()
    )
    AND (storage.foldername(p_name))[2] IN ('logo', 'cover', 'gallery', 'service', 'hero_video');
$$;

GRANT EXECUTE ON FUNCTION public.shop_media_path_owned(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.shop_media_path_writable(text) TO authenticated, service_role;
