-- Migration 7: Phase 3 — customers, appointments, notification outbox, booking idempotency
-- Glanzo Phase 3 · customers never authenticate; public traffic via definer RPCs (Step 3+)

-- btree_gist already enabled in Phase 2 migration

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.appointment_status AS ENUM ('booked', 'completed', 'no_show', 'cancelled');
CREATE TYPE public.appointment_source AS ENUM ('online', 'walk_in');
CREATE TYPE public.notification_channel AS ENUM ('email');
CREATE TYPE public.notification_template AS ENUM (
  'booking_confirmed',
  'booking_cancelled',
  'reminder_24h'
);
CREATE TYPE public.outbox_status AS ENUM ('pending', 'sent', 'failed', 'dead');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_valid_e164_phone(p_phone text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT p_phone ~ '^\+[1-9]\d{1,14}$';
$$;

COMMENT ON FUNCTION public.is_valid_e164_phone(text) IS
  'E.164 phone format gate used by customers.phone CHECK and booking RPCs.';

-- ---------------------------------------------------------------------------
-- customers — never principals; NO user_id column by design
-- ---------------------------------------------------------------------------

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL REFERENCES public.shops (id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email extensions.citext,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customers_name_length CHECK (char_length(btrim(name)) BETWEEN 2 AND 80),
  CONSTRAINT customers_phone_e164 CHECK (public.is_valid_e164_phone(phone)),
  CONSTRAINT customers_shop_id_id_unique UNIQUE (shop_id, id),
  CONSTRAINT customers_shop_phone_unique UNIQUE (shop_id, phone)
);

COMMENT ON TABLE public.customers IS
  'Returning-customer key is (shop_id, phone). Customers are NEVER auth principals — no user_id column.';

COMMENT ON COLUMN public.customers.phone IS
  'E.164 only (+49…). Normalized in app code before RPC; DB re-checks format.';

CREATE INDEX customers_shop_phone_idx ON public.customers (shop_id, phone);

CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- appointments — double-booking prevented by exclusion constraint
-- ---------------------------------------------------------------------------

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL REFERENCES public.shops (id) ON DELETE CASCADE,
  customer_id uuid,
  membership_id uuid NOT NULL,
  service_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'booked',
  service_name text NOT NULL,
  price_cents integer NOT NULL,
  source public.appointment_source NOT NULL,
  manage_token text NOT NULL,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_time_order CHECK (ends_at > starts_at),
  CONSTRAINT appointments_price_nonneg CHECK (price_cents >= 0),
  CONSTRAINT appointments_service_name_length CHECK (char_length(btrim(service_name)) BETWEEN 2 AND 80),
  CONSTRAINT appointments_manage_token_length CHECK (char_length(manage_token) >= 32),
  CONSTRAINT appointments_online_requires_customer CHECK (
    source <> 'online'::public.appointment_source
    OR customer_id IS NOT NULL
  ),
  CONSTRAINT appointments_customer_fk
    FOREIGN KEY (shop_id, customer_id)
    REFERENCES public.customers (shop_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT appointments_membership_fk
    FOREIGN KEY (shop_id, membership_id)
    REFERENCES public.memberships (shop_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT appointments_service_fk
    FOREIGN KEY (shop_id, service_id)
    REFERENCES public.services (shop_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT appointments_shop_id_id_unique UNIQUE (shop_id, id),
  CONSTRAINT appointments_manage_token_unique UNIQUE (manage_token),
  CONSTRAINT appointments_no_double_booking
    EXCLUDE USING gist (
      membership_id WITH =,
      tstzrange(starts_at, ends_at) WITH &&
    )
    WHERE (status IN ('booked', 'completed'))
);

COMMENT ON TABLE public.appointments IS
  'Snapshots service_name/price_cents at booking time. Walk-ins may omit customer_id; online bookings require customer.';

COMMENT ON CONSTRAINT appointments_no_double_booking ON public.appointments IS
  'THE exclusion constraint: overlapping booked/completed slots per barber are unrepresentable.';

CREATE INDEX appointments_shop_starts_at_idx ON public.appointments (shop_id, starts_at);
CREATE INDEX appointments_membership_starts_at_idx ON public.appointments (membership_id, starts_at);
CREATE INDEX appointments_booked_future_idx
  ON public.appointments (shop_id, starts_at)
  WHERE status = 'booked';

CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notification_outbox — rows written this phase; worker consumes in Phase 6
-- ---------------------------------------------------------------------------

CREATE TABLE public.notification_outbox (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL REFERENCES public.shops (id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL,
  channel public.notification_channel NOT NULL,
  template public.notification_template NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.outbox_status NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz NOT NULL,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_outbox_attempts_nonneg CHECK (attempts >= 0),
  CONSTRAINT notification_outbox_appointment_fk
    FOREIGN KEY (shop_id, appointment_id)
    REFERENCES public.appointments (shop_id, id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.notification_outbox IS
  'Outbox rows are INSERTed by booking/cancel RPCs. No worker this phase — Phase 6 consumes pending rows.';

CREATE INDEX notification_outbox_pending_schedule_idx
  ON public.notification_outbox (status, scheduled_for)
  WHERE status = 'pending';

CREATE TRIGGER notification_outbox_set_updated_at
  BEFORE UPDATE ON public.notification_outbox
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- booking_requests — idempotency replay for book_appointment RPC (Step 3)
-- ---------------------------------------------------------------------------

CREATE TABLE public.booking_requests (
  idempotency_key text PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops (id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_requests_appointment_fk
    FOREIGN KEY (shop_id, appointment_id)
    REFERENCES public.appointments (shop_id, id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.booking_requests IS
  'Idempotency ledger for public booking RPC. Replay returns original appointment_id.';

-- ---------------------------------------------------------------------------
-- booking_attempts — Postgres rate limits (no Redis); cleaned on insert (Step 3 RPC)
-- ---------------------------------------------------------------------------

CREATE TABLE public.booking_attempts (
  id uuid PRIMARY KEY DEFAULT public.uuid_v7(),
  shop_id uuid NOT NULL REFERENCES public.shops (id) ON DELETE CASCADE,
  ip inet NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX booking_attempts_shop_ip_time_idx
  ON public.booking_attempts (shop_id, ip, attempted_at DESC);

COMMENT ON TABLE public.booking_attempts IS
  'Sliding-window rate limit attempts per (shop, ip). Service-role / definer RPC only.';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_attempts ENABLE ROW LEVEL SECURITY;

-- customers: shop members SELECT; owner full write (hard delete allowed for GDPR)
CREATE POLICY customers_select_member_or_admin
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY customers_insert_owner
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_shop_owner(shop_id));

CREATE POLICY customers_update_owner
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (public.is_shop_owner(shop_id))
  WITH CHECK (public.is_shop_owner(shop_id));

CREATE POLICY customers_delete_owner
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (public.is_shop_owner(shop_id));

-- appointments: members SELECT; owner full write; barber INSERT walk-in self; barber UPDATE own rows
CREATE POLICY appointments_select_member_or_admin
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT public.user_shop_ids())
    OR public.is_platform_admin()
  );

CREATE POLICY appointments_insert_owner
  ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_shop_owner(shop_id));

CREATE POLICY appointments_insert_barber_walk_in
  ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    source = 'walk_in'::public.appointment_source
    AND membership_id = public.user_membership_id(shop_id)
  );

CREATE POLICY appointments_update_owner
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (public.is_shop_owner(shop_id))
  WITH CHECK (public.is_shop_owner(shop_id));

CREATE POLICY appointments_update_self_barber
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (membership_id = public.user_membership_id(shop_id))
  WITH CHECK (membership_id = public.user_membership_id(shop_id));

COMMENT ON POLICY appointments_update_self_barber ON public.appointments IS
  'Barbers may UPDATE only their own appointments. Status-only transitions enforced in appointments.service (Step 5).';

-- notification_outbox: owner SELECT own shop (debug); writes via service-role / definer RPC only
CREATE POLICY notification_outbox_select_owner
  ON public.notification_outbox
  FOR SELECT
  TO authenticated
  USING (public.is_shop_owner(shop_id));

-- booking_requests / booking_attempts: no authenticated policies — definer RPC + service role only

-- ---------------------------------------------------------------------------
-- Table grants
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT SELECT ON public.notification_outbox TO authenticated;

-- booking_requests, booking_attempts: no grants to authenticated (service_role bypasses RLS)
