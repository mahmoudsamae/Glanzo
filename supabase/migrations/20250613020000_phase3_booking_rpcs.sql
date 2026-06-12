-- Migration 8: Phase 3 booking + manage RPCs (SECURITY DEFINER, search_path pinned)

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_manage_token()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = ''
AS $$
  SELECT pg_catalog.encode(extensions.gen_random_bytes(32), 'hex'::text);
$$;

COMMENT ON FUNCTION public.generate_manage_token() IS
  'Cryptographic manage token (32 random bytes, hex-encoded). Server-only — never log.';

REVOKE ALL ON FUNCTION public.generate_manage_token() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_manage_token() TO service_role;

-- ---------------------------------------------------------------------------
-- book_appointment — anon-callable public booking
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.book_appointment(
  p_shop_slug text,
  p_service_id uuid,
  p_membership_id uuid,
  p_starts_at timestamptz,
  p_name text,
  p_phone text,
  p_email text,
  p_idempotency_key text,
  p_client_ip inet DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_shop public.shops;
  v_service public.services;
  v_membership_id uuid;
  v_customer_id uuid;
  v_appointment public.appointments;
  v_existing public.appointments;
  v_manage_token text;
  v_ends_at timestamptz;
  v_phone_active integer;
  v_attempt_count integer;
  v_customer_email text;
  v_reminder_at timestamptz;
BEGIN
  IF p_idempotency_key IS NULL OR btrim(p_idempotency_key) = '' THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  SELECT a.*
  INTO v_existing
  FROM public.booking_requests br
  INNER JOIN public.appointments a
    ON a.shop_id = br.shop_id AND a.id = br.appointment_id
  WHERE br.idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'id', v_existing.id,
      'shop_id', v_existing.shop_id,
      'manage_token', v_existing.manage_token,
      'starts_at', v_existing.starts_at,
      'ends_at', v_existing.ends_at,
      'idempotent_replay', true
    );
  END IF;

  IF p_name IS NULL OR char_length(btrim(p_name)) < 2 OR char_length(btrim(p_name)) > 80 THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  IF p_phone IS NULL OR NOT public.is_valid_e164_phone(p_phone) THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  IF p_starts_at IS NULL THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_shop
  FROM public.shops s
  WHERE s.slug = p_shop_slug;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  IF v_shop.status <> 'active'::public.shop_status THEN
    RAISE EXCEPTION 'SHOP_SUSPENDED' USING ERRCODE = '22023';
  END IF;

  IF p_client_ip IS NOT NULL THEN
    DELETE FROM public.booking_attempts ba
    WHERE ba.shop_id = v_shop.id
      AND ba.attempted_at < pg_catalog.now() - interval '1 hour';

    SELECT pg_catalog.count(*)::integer
    INTO v_attempt_count
    FROM public.booking_attempts ba
    WHERE ba.shop_id = v_shop.id
      AND ba.ip = p_client_ip
      AND ba.attempted_at > pg_catalog.now() - interval '1 hour';

    IF v_attempt_count >= 10 THEN
      RAISE EXCEPTION 'RATE_LIMITED' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.booking_attempts (shop_id, ip)
    VALUES (v_shop.id, p_client_ip);
  END IF;

  SELECT pg_catalog.count(*)::integer
  INTO v_phone_active
  FROM public.appointments a
  INNER JOIN public.customers c
    ON c.shop_id = a.shop_id AND c.id = a.customer_id
  WHERE a.shop_id = v_shop.id
    AND c.phone = p_phone
    AND a.status = 'booked'::public.appointment_status
    AND a.starts_at > pg_catalog.now();

  IF v_phone_active >= 3 THEN
    RAISE EXCEPTION 'PHONE_LIMIT' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_service
  FROM public.services s
  WHERE s.shop_id = v_shop.id
    AND s.id = p_service_id
    AND s.archived_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  IF p_starts_at < pg_catalog.now() + (v_shop.booking_lead_time_min || ' minutes')::interval THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  v_ends_at := p_starts_at + (v_service.duration_min || ' minutes')::interval;

  IF p_membership_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.service_staff ss
      INNER JOIN public.memberships m
        ON m.shop_id = ss.shop_id AND m.id = ss.membership_id
      WHERE ss.shop_id = v_shop.id
        AND ss.service_id = p_service_id
        AND ss.membership_id = p_membership_id
        AND m.archived_at IS NULL
    ) THEN
      RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
    END IF;
    v_membership_id := p_membership_id;
  ELSE
    SELECT ss.membership_id
    INTO v_membership_id
    FROM public.service_staff ss
    INNER JOIN public.memberships m
      ON m.shop_id = ss.shop_id AND m.id = ss.membership_id
    WHERE ss.shop_id = v_shop.id
      AND ss.service_id = p_service_id
      AND m.archived_at IS NULL
    ORDER BY (
      SELECT pg_catalog.count(*)::integer
      FROM public.appointments a
      WHERE a.shop_id = v_shop.id
        AND a.membership_id = ss.membership_id
        AND a.status IN ('booked'::public.appointment_status, 'completed'::public.appointment_status)
        AND (a.starts_at AT TIME ZONE v_shop.timezone)::date = (p_starts_at AT TIME ZONE v_shop.timezone)::date
    ), ss.membership_id
    LIMIT 1;

    IF v_membership_id IS NULL THEN
      RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
    END IF;
  END IF;

  INSERT INTO public.customers (shop_id, name, phone, email)
  VALUES (
    v_shop.id,
    btrim(p_name),
    p_phone,
    NULLIF(btrim(p_email), '')::extensions.citext
  )
  ON CONFLICT ON CONSTRAINT customers_shop_phone_unique
  DO UPDATE SET
    name = EXCLUDED.name,
    email = COALESCE(EXCLUDED.email, public.customers.email),
    updated_at = pg_catalog.now()
  RETURNING id, email::text INTO v_customer_id, v_customer_email;

  SELECT pg_catalog.encode(extensions.gen_random_bytes(32), 'hex'::text) INTO v_manage_token;

  BEGIN
    INSERT INTO public.appointments (
      shop_id,
      customer_id,
      membership_id,
      service_id,
      starts_at,
      ends_at,
      status,
      service_name,
      price_cents,
      source,
      manage_token
    )
    VALUES (
      v_shop.id,
      v_customer_id,
      v_membership_id,
      v_service.id,
      p_starts_at,
      v_ends_at,
      'booked'::public.appointment_status,
      v_service.name,
      v_service.price_cents,
      'online'::public.appointment_source,
      v_manage_token
    )
    RETURNING * INTO v_appointment;
  EXCEPTION
    WHEN exclusion_violation THEN
      RAISE EXCEPTION 'SLOT_TAKEN' USING ERRCODE = '23505';
  END;

  IF v_customer_email IS NOT NULL AND btrim(v_customer_email) <> '' THEN
    INSERT INTO public.notification_outbox (
      shop_id,
      appointment_id,
      channel,
      template,
      payload,
      scheduled_for
    )
    VALUES (
      v_shop.id,
      v_appointment.id,
      'email'::public.notification_channel,
      'booking_confirmed'::public.notification_template,
      jsonb_build_object('to', v_customer_email, 'appointment_id', v_appointment.id),
      pg_catalog.now()
    );

    v_reminder_at := v_appointment.starts_at - interval '24 hours';
    IF v_reminder_at > pg_catalog.now() THEN
      INSERT INTO public.notification_outbox (
        shop_id,
        appointment_id,
        channel,
        template,
        payload,
        scheduled_for
      )
      VALUES (
        v_shop.id,
        v_appointment.id,
        'email'::public.notification_channel,
        'reminder_24h'::public.notification_template,
        jsonb_build_object('to', v_customer_email, 'appointment_id', v_appointment.id),
        v_reminder_at
      );
    END IF;
  END IF;

  INSERT INTO public.booking_requests (idempotency_key, shop_id, appointment_id)
  VALUES (p_idempotency_key, v_shop.id, v_appointment.id);

  INSERT INTO public.audit_logs (
    shop_id,
    actor_id,
    actor_type,
    action,
    entity,
    entity_id,
    diff
  )
  VALUES (
    v_shop.id,
    NULL,
    'system'::public.actor_type,
    'appointment.booked',
    'appointment',
    v_appointment.id,
    jsonb_build_object(
      'source', 'online',
      'service_id', v_service.id,
      'membership_id', v_membership_id,
      'customer_id', v_customer_id
    )
  );

  RETURN jsonb_build_object(
    'id', v_appointment.id,
    'shop_id', v_appointment.shop_id,
    'manage_token', v_appointment.manage_token,
    'starts_at', v_appointment.starts_at,
    'ends_at', v_appointment.ends_at,
    'idempotent_replay', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_appointment(
  text, uuid, uuid, timestamptz, text, text, text, text, inet
) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_booking_by_token — whitelisted manage view
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_booking_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row record;
BEGIN
  IF p_token IS NULL OR char_length(p_token) < 32 THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  SELECT
    s.name AS shop_name,
    a.service_name,
    p.display_name AS barber_display_name,
    a.starts_at,
    a.ends_at,
    a.status,
    a.shop_id,
    a.id AS appointment_id
  INTO v_row
  FROM public.appointments a
  INNER JOIN public.shops s ON s.id = a.shop_id
  INNER JOIN public.memberships m ON m.shop_id = a.shop_id AND m.id = a.membership_id
  INNER JOIN public.profiles p ON p.id = m.user_id
  WHERE a.manage_token = p_token
    AND a.ends_at > pg_catalog.now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  RETURN jsonb_build_object(
    'shop_name', v_row.shop_name,
    'service_name', v_row.service_name,
    'barber_display_name', v_row.barber_display_name,
    'starts_at', v_row.starts_at,
    'ends_at', v_row.ends_at,
    'status', v_row.status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_by_token(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- cancel_booking_by_token
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cancel_booking_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_appointment public.appointments;
  v_shop public.shops;
  v_customer_email text;
  v_minutes_until_start numeric;
BEGIN
  IF p_token IS NULL OR char_length(p_token) < 32 THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  SELECT a.*
  INTO v_appointment
  FROM public.appointments a
  WHERE a.manage_token = p_token
    AND a.ends_at > pg_catalog.now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  IF v_appointment.status <> 'booked'::public.appointment_status THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_shop FROM public.shops s WHERE s.id = v_appointment.shop_id;

  v_minutes_until_start := extract(epoch FROM (v_appointment.starts_at - pg_catalog.now())) / 60.0;
  IF v_minutes_until_start < v_shop.cancellation_window_min THEN
    RAISE EXCEPTION 'TOO_LATE' USING ERRCODE = '22023';
  END IF;

  UPDATE public.appointments
  SET
    status = 'cancelled'::public.appointment_status,
    cancelled_at = pg_catalog.now()
  WHERE id = v_appointment.id
  RETURNING * INTO v_appointment;

  UPDATE public.notification_outbox no
  SET status = 'dead'::public.outbox_status
  WHERE no.shop_id = v_appointment.shop_id
    AND no.appointment_id = v_appointment.id
    AND no.template = 'reminder_24h'::public.notification_template
    AND no.status = 'pending'::public.outbox_status;

  SELECT c.email::text
  INTO v_customer_email
  FROM public.customers c
  WHERE c.shop_id = v_appointment.shop_id AND c.id = v_appointment.customer_id;

  IF v_customer_email IS NOT NULL AND btrim(v_customer_email) <> '' THEN
    INSERT INTO public.notification_outbox (
      shop_id,
      appointment_id,
      channel,
      template,
      payload,
      scheduled_for
    )
    VALUES (
      v_appointment.shop_id,
      v_appointment.id,
      'email'::public.notification_channel,
      'booking_cancelled'::public.notification_template,
      jsonb_build_object('to', v_customer_email, 'appointment_id', v_appointment.id),
      pg_catalog.now()
    );
  END IF;

  INSERT INTO public.audit_logs (
    shop_id,
    actor_id,
    actor_type,
    action,
    entity,
    entity_id,
    diff
  )
  VALUES (
    v_appointment.shop_id,
    NULL,
    'system'::public.actor_type,
    'appointment.cancelled',
    'appointment',
    v_appointment.id,
    jsonb_build_object('via', 'manage_token')
  );

  RETURN jsonb_build_object(
    'id', v_appointment.id,
    'status', v_appointment.status,
    'cancelled_at', v_appointment.cancelled_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_booking_by_token(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- reschedule_booking_by_token — regenerates manage token
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reschedule_booking_by_token(
  p_token text,
  p_new_starts_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_appointment public.appointments;
  v_shop public.shops;
  v_service public.services;
  v_ends_at timestamptz;
  v_new_token text;
  v_customer_email text;
  v_reminder_at timestamptz;
BEGIN
  IF p_token IS NULL OR char_length(p_token) < 32 THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  IF p_new_starts_at IS NULL THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  SELECT a.*
  INTO v_appointment
  FROM public.appointments a
  WHERE a.manage_token = p_token
    AND a.ends_at > pg_catalog.now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = '22023';
  END IF;

  IF v_appointment.status <> 'booked'::public.appointment_status THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_shop FROM public.shops s WHERE s.id = v_appointment.shop_id;

  IF v_shop.status <> 'active'::public.shop_status THEN
    RAISE EXCEPTION 'SHOP_SUSPENDED' USING ERRCODE = '22023';
  END IF;

  IF p_new_starts_at < pg_catalog.now() + (v_shop.booking_lead_time_min || ' minutes')::interval THEN
    RAISE EXCEPTION 'INVALID_INPUT' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_service
  FROM public.services s
  WHERE s.shop_id = v_appointment.shop_id AND s.id = v_appointment.service_id;

  v_ends_at := p_new_starts_at + (v_service.duration_min || ' minutes')::interval;
  SELECT pg_catalog.encode(extensions.gen_random_bytes(32), 'hex'::text) INTO v_new_token;

  BEGIN
    UPDATE public.appointments
    SET
      starts_at = p_new_starts_at,
      ends_at = v_ends_at,
      manage_token = v_new_token
    WHERE id = v_appointment.id
    RETURNING * INTO v_appointment;
  EXCEPTION
    WHEN exclusion_violation THEN
      RAISE EXCEPTION 'SLOT_TAKEN' USING ERRCODE = '23505';
  END;

  UPDATE public.notification_outbox no
  SET status = 'dead'::public.outbox_status
  WHERE no.shop_id = v_appointment.shop_id
    AND no.appointment_id = v_appointment.id
    AND no.template = 'reminder_24h'::public.notification_template
    AND no.status = 'pending'::public.outbox_status;

  SELECT c.email::text
  INTO v_customer_email
  FROM public.customers c
  WHERE c.shop_id = v_appointment.shop_id AND c.id = v_appointment.customer_id;

  IF v_customer_email IS NOT NULL AND btrim(v_customer_email) <> '' THEN
    v_reminder_at := v_appointment.starts_at - interval '24 hours';
    IF v_reminder_at > pg_catalog.now() THEN
      INSERT INTO public.notification_outbox (
        shop_id,
        appointment_id,
        channel,
        template,
        payload,
        scheduled_for
      )
      VALUES (
        v_appointment.shop_id,
        v_appointment.id,
        'email'::public.notification_channel,
        'reminder_24h'::public.notification_template,
        jsonb_build_object('to', v_customer_email, 'appointment_id', v_appointment.id),
        v_reminder_at
      );
    END IF;
  END IF;

  INSERT INTO public.audit_logs (
    shop_id,
    actor_id,
    actor_type,
    action,
    entity,
    entity_id,
    diff
  )
  VALUES (
    v_appointment.shop_id,
    NULL,
    'system'::public.actor_type,
    'appointment.rescheduled',
    'appointment',
    v_appointment.id,
    jsonb_build_object('via', 'manage_token', 'starts_at', p_new_starts_at)
  );

  RETURN jsonb_build_object(
    'id', v_appointment.id,
    'manage_token', v_appointment.manage_token,
    'starts_at', v_appointment.starts_at,
    'ends_at', v_appointment.ends_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reschedule_booking_by_token(text, timestamptz) TO anon, authenticated;

COMMENT ON FUNCTION public.book_appointment IS
  'Public booking RPC: idempotent, rate-limited, fair barber assignment, outbox + audit in one transaction.';

COMMENT ON FUNCTION public.get_booking_by_token IS
  'Manage view by token — whitelisted fields only; identical 404 for missing/expired tokens.';

COMMENT ON FUNCTION public.cancel_booking_by_token IS
  'Cancel via manage token; enforces cancellation_window_min; kills pending reminder outbox row.';

COMMENT ON FUNCTION public.reschedule_booking_by_token IS
  'Reschedule via manage token; regenerates token (old token dead); reschedules reminder outbox.';
