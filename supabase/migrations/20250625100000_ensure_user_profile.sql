-- Repair missing profiles when auth.users exists but handle_new_user did not run.

CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user auth.users;
  v_profile public.profiles;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
  IF FOUND THEN
    RETURN v_profile;
  END IF;

  SELECT * INTO v_user FROM auth.users WHERE id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.profiles (id, display_name)
  VALUES (
    v_user.id,
    COALESCE(v_user.raw_user_meta_data ->> 'display_name', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

COMMENT ON FUNCTION public.ensure_user_profile() IS
  'Idempotent profile row for the current auth user — repairs missed on_auth_user_created triggers.';

REVOKE ALL ON FUNCTION public.ensure_user_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;
