-- Fix shop creation: new shops default to allowed template "forge" but minisite
-- trigger inserted "midnight", tripping enforce_minisite_template_allowed.

CREATE OR REPLACE FUNCTION public.create_minisite_for_new_shop()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_template public.minisite_template;
BEGIN
  v_template := COALESCE(
    NEW.allowed_minisite_templates[1],
    'forge'::public.minisite_template
  );

  INSERT INTO public.minisite (shop_id, template)
  VALUES (NEW.id, v_template)
  ON CONFLICT (shop_id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.create_minisite_for_new_shop() IS
  'Creates minisite row using the shop''s first allowed template (defaults to forge).';
