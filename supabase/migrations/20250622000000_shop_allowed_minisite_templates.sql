-- Per-shop allowed minisite templates (platform admin assigns; owner picks among allowed).

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS allowed_minisite_templates public.minisite_template[] NOT NULL
  DEFAULT ARRAY['midnight'::public.minisite_template];

-- Backfill: each shop may use its current active template.
UPDATE public.shops s
SET allowed_minisite_templates = ARRAY[m.template]::public.minisite_template[]
FROM public.minisite m
WHERE m.shop_id = s.id;

COMMENT ON COLUMN public.shops.allowed_minisite_templates IS
  'Templates the platform admin assigned to this shop. Owner may only activate templates in this set.';

-- Ensure active template stays within allowed set on owner updates.
CREATE OR REPLACE FUNCTION public.enforce_minisite_template_allowed()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_allowed public.minisite_template[];
BEGIN
  SELECT allowed_minisite_templates
  INTO v_allowed
  FROM public.shops
  WHERE id = NEW.shop_id;

  IF v_allowed IS NULL OR NOT (NEW.template = ANY (v_allowed)) THEN
    RAISE EXCEPTION 'TEMPLATE_NOT_ALLOWED' USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS minisite_template_allowed_trg ON public.minisite;
CREATE TRIGGER minisite_template_allowed_trg
  BEFORE INSERT OR UPDATE OF template ON public.minisite
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_minisite_template_allowed();

-- When allowed set shrinks, fall back active template to first allowed entry.
CREATE OR REPLACE FUNCTION public.enforce_shop_allowed_templates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.allowed_minisite_templates IS NULL
     OR array_length(NEW.allowed_minisite_templates, 1) IS NULL
     OR array_length(NEW.allowed_minisite_templates, 1) < 1 THEN
    RAISE EXCEPTION 'ALLOWED_REQUIRED' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.minisite m
    WHERE m.shop_id = NEW.id
      AND m.template = ANY (NEW.allowed_minisite_templates)
  ) THEN
    UPDATE public.minisite
    SET template = NEW.allowed_minisite_templates[1]
    WHERE shop_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shops_allowed_templates_trg ON public.shops;
CREATE TRIGGER shops_allowed_templates_trg
  BEFORE INSERT OR UPDATE OF allowed_minisite_templates ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_shop_allowed_templates();

-- Extend platform shop detail payload.
CREATE OR REPLACE FUNCTION public.platform_get_shop(p_shop_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_shop public.shops;
  v_minisite public.minisite;
BEGIN
  PERFORM public.require_platform_admin();

  SELECT * INTO v_shop FROM public.shops WHERE id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_minisite FROM public.minisite WHERE shop_id = p_shop_id;

  RETURN jsonb_build_object(
    'id', v_shop.id,
    'slug', v_shop.slug,
    'name', v_shop.name,
    'status', v_shop.status,
    'created_at', v_shop.created_at,
    'timezone', v_shop.timezone,
    'booking_lead_time_min', v_shop.booking_lead_time_min,
    'cancellation_window_min', v_shop.cancellation_window_min,
    'slot_granularity_min', v_shop.slot_granularity_min,
    'reminders_enabled', v_shop.reminders_enabled,
    'owner_user_id', (
      SELECT m.user_id
      FROM public.memberships m
      WHERE m.shop_id = p_shop_id
        AND m.role = 'owner'::public.membership_role
        AND m.archived_at IS NULL
      ORDER BY m.created_at
      LIMIT 1
    ),
    'owner_display_name', (
      SELECT p.display_name
      FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.user_id
      WHERE m.shop_id = p_shop_id AND m.role = 'owner'::public.membership_role AND m.archived_at IS NULL
      ORDER BY m.created_at LIMIT 1
    ),
    'owner_email', (
      SELECT u.email::text
      FROM public.memberships m
      INNER JOIN auth.users u ON u.id = m.user_id
      WHERE m.shop_id = p_shop_id AND m.role = 'owner'::public.membership_role AND m.archived_at IS NULL
      ORDER BY m.created_at LIMIT 1
    ),
    'staff_count', (
      SELECT pg_catalog.count(*)::integer FROM public.memberships m
      WHERE m.shop_id = p_shop_id AND m.archived_at IS NULL
    ),
    'bookings_last_30d', (
      SELECT pg_catalog.count(*)::integer FROM public.appointments a
      WHERE a.shop_id = p_shop_id AND a.created_at >= pg_catalog.now() - interval '30 days'
    ),
    'dead_outbox_count', (
      SELECT pg_catalog.count(*)::integer FROM public.notification_outbox no
      WHERE no.shop_id = p_shop_id AND no.status = 'dead'::public.outbox_status
    ),
    'minisite_template', v_minisite.template,
    'minisite_accent_hex', v_minisite.accent_hex,
    'allowed_minisite_templates', COALESCE(
      (
        SELECT jsonb_agg(t.val ORDER BY t.ord)
        FROM unnest(v_shop.allowed_minisite_templates) WITH ORDINALITY AS t(val, ord)
      ),
      '[]'::jsonb
    ),
    'outbox_by_template', COALESCE((
      SELECT jsonb_object_agg(t.template, t.stats)
      FROM (
        SELECT
          no.template::text AS template,
          jsonb_build_object(
            'sent', pg_catalog.count(*) FILTER (WHERE no.status = 'sent'::public.outbox_status),
            'pending', pg_catalog.count(*) FILTER (WHERE no.status = 'pending'::public.outbox_status),
            'failed', pg_catalog.count(*) FILTER (WHERE no.status = 'failed'::public.outbox_status),
            'dead', pg_catalog.count(*) FILTER (WHERE no.status = 'dead'::public.outbox_status),
            'skipped', pg_catalog.count(*) FILTER (WHERE no.status = 'skipped'::public.outbox_status)
          ) AS stats
        FROM public.notification_outbox no
        WHERE no.shop_id = p_shop_id
        GROUP BY no.template
      ) t
    ), '{}'::jsonb),
    'audit_trail', COALESCE((
      SELECT jsonb_agg(row_to_json(a))
      FROM (
        SELECT al.action, al.actor_type, al.entity, al.entity_id, al.diff, al.created_at
        FROM public.audit_logs al
        WHERE al.shop_id = p_shop_id
        ORDER BY al.created_at DESC
        LIMIT 20
      ) a
    ), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.platform_set_shop_minisite_templates(
  p_shop_id uuid,
  p_allowed public.minisite_template[],
  p_active public.minisite_template
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.require_platform_admin();

  IF p_allowed IS NULL
     OR array_length(p_allowed, 1) IS NULL
     OR array_length(p_allowed, 1) < 1 THEN
    RAISE EXCEPTION 'ALLOWED_REQUIRED' USING ERRCODE = '22023';
  END IF;

  IF NOT (p_active = ANY (p_allowed)) THEN
    RAISE EXCEPTION 'ACTIVE_NOT_ALLOWED' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id) THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  UPDATE public.shops
  SET allowed_minisite_templates = p_allowed
  WHERE id = p_shop_id;

  UPDATE public.minisite
  SET template = p_active
  WHERE shop_id = p_shop_id;

  RETURN jsonb_build_object(
    'allowed_minisite_templates', to_jsonb(p_allowed),
    'minisite_template', p_active
  );
END;
$$;

REVOKE ALL ON FUNCTION public.platform_set_shop_minisite_templates(uuid, public.minisite_template[], public.minisite_template) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_set_shop_minisite_templates(uuid, public.minisite_template[], public.minisite_template) TO authenticated;
