-- Run in Supabase SQL Editor if service image upload fails with RLS error.
-- Same as migration 20250627100000_fix_service_image_storage_rls.sql

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
    AND (storage.foldername(p_name))[2] IN ('logo', 'cover', 'gallery', 'service');
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
    AND (storage.foldername(p_name))[2] IN ('logo', 'cover', 'gallery', 'service');
$$;

GRANT EXECUTE ON FUNCTION public.shop_media_path_owned(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.shop_media_path_writable(text) TO authenticated, service_role;

DROP POLICY IF EXISTS shop_media_owner_insert ON storage.objects;
CREATE POLICY shop_media_owner_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'shop-media'
    AND public.shop_media_path_writable(name)
  );

DROP POLICY IF EXISTS shop_media_owner_update ON storage.objects;
CREATE POLICY shop_media_owner_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'shop-media'
    AND public.shop_media_path_writable(name)
  )
  WITH CHECK (
    bucket_id = 'shop-media'
    AND public.shop_media_path_writable(name)
  );

DROP POLICY IF EXISTS shop_media_owner_delete ON storage.objects;
CREATE POLICY shop_media_owner_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'shop-media'
    AND public.shop_media_path_writable(name)
  );
