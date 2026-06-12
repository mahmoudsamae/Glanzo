-- Phase 7: platform admin RPCs — aggregates only, no raw cross-tenant table reads from the app.

-- ---------------------------------------------------------------------------
-- Status trigger: allow platform_set_shop_status via session flag (not PostgREST)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_shop_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role' THEN
      RETURN NEW;
    END IF;
    IF current_setting('glanzo.platform_status_change', true) = '1' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'only service role may change shop status';
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.protect_shop_status_change() IS
  'Blocks direct status UPDATE. Allowed: service_role JWT or glanzo.platform_status_change inside platform_set_shop_status.';

-- ---------------------------------------------------------------------------
-- staff_invites: allow owner role (platform onboarding path)
-- ---------------------------------------------------------------------------

ALTER TABLE public.staff_invites
  DROP CONSTRAINT IF EXISTS staff_invites_role_barber_only;

ALTER TABLE public.staff_invites
  ADD CONSTRAINT staff_invites_role_valid
  CHECK (role IN ('barber'::public.membership_role, 'owner'::public.membership_role));

-- ---------------------------------------------------------------------------
-- Internal guard
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.require_platform_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.require_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.require_platform_admin() TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- platform_get_overview
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_get_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now timestamptz := pg_catalog.now();
BEGIN
  PERFORM public.require_platform_admin();

  RETURN jsonb_build_object(
    'shops', jsonb_build_object(
      'total', (SELECT pg_catalog.count(*)::integer FROM public.shops),
      'active', (SELECT pg_catalog.count(*)::integer FROM public.shops WHERE status = 'active'::public.shop_status),
      'suspended', (SELECT pg_catalog.count(*)::integer FROM public.shops WHERE status = 'suspended'::public.shop_status)
    ),
    'signups', jsonb_build_object(
      'last_7d', (
        SELECT pg_catalog.count(*)::integer FROM public.shops
        WHERE created_at >= v_now - interval '7 days'
      ),
      'last_30d', (
        SELECT pg_catalog.count(*)::integer FROM public.shops
        WHERE created_at >= v_now - interval '30 days'
      )
    ),
    'bookings', jsonb_build_object(
      'last_7d', (
        SELECT pg_catalog.count(*)::integer FROM public.appointments
        WHERE created_at >= v_now - interval '7 days'
      ),
      'last_30d', (
        SELECT pg_catalog.count(*)::integer FROM public.appointments
        WHERE created_at >= v_now - interval '30 days'
      )
    ),
    'outbox', jsonb_build_object(
      'pending', (
        SELECT pg_catalog.count(*)::integer FROM public.notification_outbox
        WHERE status = 'pending'::public.outbox_status
      ),
      'dead', (
        SELECT pg_catalog.count(*)::integer FROM public.notification_outbox
        WHERE status = 'dead'::public.outbox_status
      )
    ),
    'recent_platform_actions', COALESCE((
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT al.action, al.entity, al.created_at, al.diff
        FROM public.audit_logs al
        WHERE al.actor_type = 'platform'::public.actor_type
        ORDER BY al.created_at DESC
        LIMIT 5
      ) t
    ), '[]'::jsonb)
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- platform_list_shops (cursor: created_at|uuid, descending)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_list_shops(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_cursor text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cursor_ts timestamptz;
  v_cursor_id uuid;
  v_limit integer := 25;
  v_rows jsonb;
  v_count integer;
  v_next_cursor text;
BEGIN
  PERFORM public.require_platform_admin();

  IF p_cursor IS NOT NULL AND btrim(p_cursor) <> '' THEN
    v_cursor_ts := split_part(p_cursor, '|', 1)::timestamptz;
    v_cursor_id := split_part(p_cursor, '|', 2)::uuid;
  END IF;

  WITH page AS (
    SELECT
      s.id,
      s.slug,
      s.name,
      s.status,
      s.created_at,
      (
        SELECT p.display_name
        FROM public.memberships m
        INNER JOIN public.profiles p ON p.id = m.user_id
        WHERE m.shop_id = s.id
          AND m.role = 'owner'::public.membership_role
          AND m.archived_at IS NULL
        ORDER BY m.created_at
        LIMIT 1
      ) AS owner_display_name,
      (
        SELECT u.email::text
        FROM public.memberships m
        INNER JOIN auth.users u ON u.id = m.user_id
        WHERE m.shop_id = s.id
          AND m.role = 'owner'::public.membership_role
          AND m.archived_at IS NULL
        ORDER BY m.created_at
        LIMIT 1
      ) AS owner_email,
      (
        SELECT pg_catalog.count(*)::integer
        FROM public.memberships m
        WHERE m.shop_id = s.id AND m.archived_at IS NULL
      ) AS staff_count,
      (
        SELECT pg_catalog.count(*)::integer
        FROM public.appointments a
        WHERE a.shop_id = s.id
          AND a.created_at >= pg_catalog.now() - interval '30 days'
      ) AS bookings_last_30d,
      (
        SELECT pg_catalog.count(*)::integer
        FROM public.notification_outbox no
        WHERE no.shop_id = s.id AND no.status = 'dead'::public.outbox_status
      ) AS dead_outbox_count
    FROM public.shops s
    WHERE (
      p_search IS NULL OR btrim(p_search) = ''
      OR s.name ILIKE '%' || btrim(p_search) || '%'
      OR s.slug ILIKE '%' || btrim(p_search) || '%'
    )
    AND (
      p_status IS NULL OR btrim(p_status) = ''
      OR s.status::text = btrim(p_status)
    )
    AND (
      v_cursor_ts IS NULL
      OR (s.created_at, s.id) < (v_cursor_ts, v_cursor_id)
    )
    ORDER BY s.created_at DESC, s.id DESC
    LIMIT v_limit + 1
  )
  SELECT
    COALESCE(jsonb_agg(jsonb_build_object(
      'id', p.id,
      'slug', p.slug,
      'name', p.name,
      'status', p.status,
      'created_at', p.created_at,
      'owner_display_name', p.owner_display_name,
      'owner_email', p.owner_email,
      'staff_count', p.staff_count,
      'bookings_last_30d', p.bookings_last_30d,
      'dead_outbox_count', p.dead_outbox_count
    ) ORDER BY p.created_at DESC, p.id DESC), '[]'::jsonb),
    pg_catalog.count(*)::integer
  INTO v_rows, v_count
  FROM page p;

  IF v_count > v_limit THEN
    SELECT (elem->>'created_at')::timestamptz || '|' || (elem->>'id')
    INTO v_next_cursor
    FROM (
      SELECT elem
      FROM jsonb_array_elements(v_rows) WITH ORDINALITY AS t(elem, ord)
      ORDER BY ord DESC
      OFFSET 1
      LIMIT 1
    ) last_row(elem);

    v_rows := (
      SELECT COALESCE(jsonb_agg(elem ORDER BY ord), '[]'::jsonb)
      FROM (
        SELECT elem, ord
        FROM jsonb_array_elements(v_rows) WITH ORDINALITY AS t(elem, ord)
        ORDER BY ord
        LIMIT v_limit
      ) trimmed
    );
  END IF;

  RETURN jsonb_build_object('items', v_rows, 'next_cursor', v_next_cursor);
END;
$$;

-- ---------------------------------------------------------------------------
-- platform_get_shop — operational metadata ONLY (no customers/appointments/notes)
-- ---------------------------------------------------------------------------

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

  -- Deliberate exclusion: no customer names, appointment rows, or notes — support metadata only.
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

COMMENT ON FUNCTION public.platform_get_shop(uuid) IS
  'Platform shop detail: operational metadata only. Excludes customer PII, appointment details, and notes by design.';

-- ---------------------------------------------------------------------------
-- platform_set_shop_status
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_set_shop_status(
  p_shop_id uuid,
  p_status public.shop_status,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old public.shops;
  v_actor uuid := auth.uid();
BEGIN
  PERFORM public.require_platform_admin();

  IF p_reason IS NULL OR char_length(btrim(p_reason)) < 10 THEN
    RAISE EXCEPTION 'REASON_REQUIRED' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_old FROM public.shops WHERE id = p_shop_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  PERFORM set_config('glanzo.platform_status_change', '1', true);

  UPDATE public.shops
  SET status = p_status
  WHERE id = p_shop_id;

  INSERT INTO public.audit_logs (
    shop_id, actor_id, actor_type, action, entity, entity_id, diff
  )
  VALUES (
    p_shop_id,
    v_actor,
    'platform'::public.actor_type,
    CASE WHEN p_status = 'suspended'::public.shop_status THEN 'shop.suspended' ELSE 'shop.reactivated' END,
    'shop',
    p_shop_id,
    jsonb_build_object(
      'reason', btrim(p_reason),
      'before', jsonb_build_object('status', v_old.status),
      'after', jsonb_build_object('status', p_status)
    )
  );

  RETURN jsonb_build_object('id', p_shop_id, 'status', p_status);
END;
$$;

-- ---------------------------------------------------------------------------
-- platform_create_shop + owner invite
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_create_shop(
  p_name text,
  p_slug text,
  p_owner_email text,
  p_timezone text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_shop public.shops;
  v_token text;
  v_invite public.staff_invites;
  v_default_hours jsonb := '{"mon":null,"tue":{"open":"09:00","close":"19:00"},"wed":{"open":"09:00","close":"19:00"},"thu":{"open":"09:00","close":"19:00"},"fri":{"open":"09:00","close":"19:00"},"sat":{"open":"09:00","close":"17:00"},"sun":null}'::jsonb;
BEGIN
  PERFORM public.require_platform_admin();

  IF p_name IS NULL OR char_length(btrim(p_name)) < 2 THEN
    RAISE EXCEPTION 'INVALID_NAME' USING ERRCODE = '22023';
  END IF;

  IF p_slug IS NULL
    OR p_slug !~ '^[a-z0-9](-?[a-z0-9])*$'
    OR char_length(p_slug) < 3
    OR char_length(p_slug) > 40
    OR public.is_shop_slug_reserved(p_slug)
    OR EXISTS (SELECT 1 FROM public.shops s WHERE s.slug = p_slug)
  THEN
    RAISE EXCEPTION 'SLUG_INVALID' USING ERRCODE = '22023';
  END IF;

  IF p_owner_email IS NULL OR btrim(p_owner_email) = '' OR position('@' in p_owner_email) < 2 THEN
    RAISE EXCEPTION 'INVALID_EMAIL' USING ERRCODE = '22023';
  END IF;

  IF NOT public.is_valid_iana_timezone(p_timezone) THEN
    RAISE EXCEPTION 'TIMEZONE_INVALID' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.shops (name, slug, timezone, opening_hours, currency)
  VALUES (btrim(p_name), p_slug, p_timezone, v_default_hours, 'EUR')
  RETURNING * INTO v_shop;

  v_token := pg_catalog.encode(extensions.gen_random_bytes(32), 'hex');

  INSERT INTO public.staff_invites (
    shop_id, email, role, token, expires_at, created_by
  )
  VALUES (
    v_shop.id,
    lower(btrim(p_owner_email)),
    'owner'::public.membership_role,
    v_token,
    pg_catalog.now() + interval '7 days',
    v_actor
  )
  RETURNING * INTO v_invite;

  INSERT INTO public.audit_logs (
    shop_id, actor_id, actor_type, action, entity, entity_id, diff
  )
  VALUES (
    v_shop.id,
    v_actor,
    'platform'::public.actor_type,
    'shop.created',
    'shop',
    v_shop.id,
    jsonb_build_object(
      'slug', v_shop.slug,
      'owner_email', v_invite.email,
      'invite_id', v_invite.id
    )
  );

  RETURN jsonb_build_object(
    'shop_id', v_shop.id,
    'slug', v_shop.slug,
    'invite_token', v_token,
    'invite_path', '/join/' || v_token
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- platform_create_owner_invite (re-issue)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_create_owner_invite(
  p_shop_id uuid,
  p_owner_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_token text;
  v_invite public.staff_invites;
BEGIN
  PERFORM public.require_platform_admin();

  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id) THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  IF p_owner_email IS NULL OR btrim(p_owner_email) = '' OR position('@' in p_owner_email) < 2 THEN
    RAISE EXCEPTION 'INVALID_EMAIL' USING ERRCODE = '22023';
  END IF;

  v_token := pg_catalog.encode(extensions.gen_random_bytes(32), 'hex');

  INSERT INTO public.staff_invites (
    shop_id, email, role, token, expires_at, created_by
  )
  VALUES (
    p_shop_id,
    lower(btrim(p_owner_email)),
    'owner'::public.membership_role,
    v_token,
    pg_catalog.now() + interval '7 days',
    v_actor
  )
  RETURNING * INTO v_invite;

  INSERT INTO public.audit_logs (
    shop_id, actor_id, actor_type, action, entity, entity_id, diff
  )
  VALUES (
    p_shop_id,
    v_actor,
    'platform'::public.actor_type,
    'invite.owner_created',
    'staff_invite',
    v_invite.id,
    jsonb_build_object('email', v_invite.email, 'role', 'owner')
  );

  RETURN jsonb_build_object(
    'invite_token', v_token,
    'invite_path', '/join/' || v_token
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- platform_get_shop_today — counts + hourly histogram only (no PII)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_get_shop_today(p_shop_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_tz text;
  v_today date;
BEGIN
  PERFORM public.require_platform_admin();

  SELECT timezone INTO v_tz FROM public.shops WHERE id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  v_today := (pg_catalog.now() AT TIME ZONE v_tz)::date;

  RETURN jsonb_build_object(
    'date', v_today::text,
    'timezone', v_tz,
    'total', (
      SELECT pg_catalog.count(*)::integer
      FROM public.appointments a
      WHERE a.shop_id = p_shop_id
        AND (a.starts_at AT TIME ZONE v_tz)::date = v_today
        AND a.status IN ('booked'::public.appointment_status, 'completed'::public.appointment_status)
    ),
    'by_hour', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('hour', h.hour, 'count', h.cnt) ORDER BY h.hour)
      FROM (
        SELECT
          pg_catalog.date_part('hour', a.starts_at AT TIME ZONE v_tz)::integer AS hour,
          pg_catalog.count(*)::integer AS cnt
        FROM public.appointments a
        WHERE a.shop_id = p_shop_id
          AND (a.starts_at AT TIME ZONE v_tz)::date = v_today
          AND a.status IN ('booked'::public.appointment_status, 'completed'::public.appointment_status)
        GROUP BY 1
      ) h
    ), '[]'::jsonb)
  );
END;
$$;

COMMENT ON FUNCTION public.platform_get_shop_today(uuid) IS
  'Support view: appointment counts and hourly histogram only — no customer or barber names.';

-- ---------------------------------------------------------------------------
-- platform_record_support_view — audit each support tab open
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_record_support_view(p_shop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.require_platform_admin();

  IF NOT EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id) THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.audit_logs (
    shop_id, actor_id, actor_type, action, entity, entity_id, diff
  )
  VALUES (
    p_shop_id,
    auth.uid(),
    'platform'::public.actor_type,
    'platform.support_view',
    'shop',
    p_shop_id,
    jsonb_build_object('view', 'today_histogram')
  );
END;
$$;

COMMENT ON FUNCTION public.platform_record_support_view(uuid) IS
  'Audit row when platform admin opens support today view. No reason required — read-only aggregate.';

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.platform_get_overview() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.platform_list_shops(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.platform_get_shop(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.platform_set_shop_status(uuid, public.shop_status, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.platform_create_shop(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.platform_create_owner_invite(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.platform_get_shop_today(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.platform_record_support_view(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.platform_get_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_list_shops(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_get_shop(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_set_shop_status(uuid, public.shop_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_create_shop(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_create_owner_invite(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_get_shop_today(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_record_support_view(uuid) TO authenticated;
