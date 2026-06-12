-- Local-dev seed for Glanzo Phase 1 (runs after migrations on `supabase db reset`)
-- Auth users are inserted via SQL using pgcrypto; profiles are created by the on_auth_user_created trigger.
-- Password for all seed users: password123

-- Stable UUIDs for cross-tenant RLS tests (tests/rls/constants.ts mirrors these)
-- owner-a@glanzo.test  → a0000000-0000-4000-8000-000000000001
-- owner-b@glanzo.test  → a0000000-0000-4000-8000-000000000002
-- barber-a@glanzo.test → a0000000-0000-4000-8000-000000000003
-- platform-admin@glanzo.test → a0000000-0000-4000-8000-000000000004

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'owner-a@glanzo.test',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Owner A"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'owner-b@glanzo.test',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Owner B"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'barber-a@glanzo.test',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Barber A"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'platform-admin@glanzo.test',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Platform Admin"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    'c0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'sub', 'a0000000-0000-4000-8000-000000000001',
      'email', 'owner-a@glanzo.test'
    ),
    'email',
    now(),
    now(),
    now()
  ),
  (
    'c0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000002',
    jsonb_build_object(
      'sub', 'a0000000-0000-4000-8000-000000000002',
      'email', 'owner-b@glanzo.test'
    ),
    'email',
    now(),
    now(),
    now()
  ),
  (
    'c0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000003',
    jsonb_build_object(
      'sub', 'a0000000-0000-4000-8000-000000000003',
      'email', 'barber-a@glanzo.test'
    ),
    'email',
    now(),
    now(),
    now()
  ),
  (
    'c0000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000004',
    jsonb_build_object(
      'sub', 'a0000000-0000-4000-8000-000000000004',
      'email', 'platform-admin@glanzo.test'
    ),
    'email',
    now(),
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.platform_admins (user_id)
VALUES ('a0000000-0000-4000-8000-000000000004')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.shops (
  id,
  slug,
  name,
  status,
  timezone,
  currency
)
VALUES
  (
    'b0000000-0000-4000-8000-000000000001',
    'demo-barber-a',
    'Demo Barber A',
    'active',
    'Europe/Berlin',
    'EUR'
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'demo-barber-b',
    'Demo Barber B',
    'suspended',
    'Europe/Berlin',
    'EUR'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.memberships (id, shop_id, user_id, role)
VALUES
  (
    'd0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    'd0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000002',
    'owner'
  ),
  (
    'd0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000003',
    'barber'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_logs (id, shop_id, actor_id, actor_type, action, entity, entity_id)
VALUES
  (
    'e0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'user',
    'shop.created',
    'shops',
    'b0000000-0000-4000-8000-000000000001'
  ),
  (
    'e0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000002',
    'user',
    'shop.created',
    'shops',
    'b0000000-0000-4000-8000-000000000002'
  )
ON CONFLICT (id) DO NOTHING;

-- Phase 2 fixtures (shop A) — stable IDs for RLS/security matrix tests
INSERT INTO public.services (
  id,
  shop_id,
  name,
  duration_min,
  price_cents,
  sort_order
)
VALUES
  (
    'f0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'Classic Cut',
    30,
    2500,
    0
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.service_staff (shop_id, service_id, membership_id)
VALUES
  (
    'b0000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000003'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.staff_hours (
  id,
  shop_id,
  membership_id,
  weekday,
  start_time,
  end_time
)
VALUES
  (
    'f0000000-0000-4000-8000-000000000010',
    'b0000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000003',
    0,
    '09:00',
    '17:00'
  ),
  (
    'f0000000-0000-4000-8000-000000000011',
    'b0000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000001',
    0,
    '09:00',
    '13:00'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.time_off (
  id,
  shop_id,
  membership_id,
  starts_at,
  ends_at,
  note
)
VALUES
  (
    'f0000000-0000-4000-8000-000000000020',
    'b0000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000003',
    '2026-08-01 00:00:00+00',
    '2026-08-08 00:00:00+00',
    'Vacation'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_invites (
  id,
  shop_id,
  email,
  role,
  token,
  expires_at,
  created_by
)
VALUES
  (
    'f0000000-0000-4000-8000-000000000030',
    'b0000000-0000-4000-8000-000000000001',
    'pending-barber@glanzo.test',
    'barber',
    'seed-invite-token-shop-a-32chars-min',
    now() + interval '7 days',
    'a0000000-0000-4000-8000-000000000001'
  ),
  (
    'f0000000-0000-4000-8000-000000000031',
    'b0000000-0000-4000-8000-000000000002',
    'pending-barber-b@glanzo.test',
    'barber',
    'seed-invite-token-shop-b-32chars-min',
    now() + interval '7 days',
    'a0000000-0000-4000-8000-000000000002'
  )
ON CONFLICT (id) DO NOTHING;

-- Phase 3 fixtures (shop A) — stable IDs for RLS/security/constraint tests
INSERT INTO public.customers (
  id,
  shop_id,
  name,
  phone,
  email
)
VALUES
  (
    'a0000003-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'Seed Customer A',
    '+491701234567',
    'seed-customer-a@glanzo.test'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.appointments (
  id,
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
VALUES
  (
    'a0000003-0000-4000-8000-000000000010',
    'b0000000-0000-4000-8000-000000000001',
    'a0000003-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000003',
    'f0000000-0000-4000-8000-000000000001',
    '2026-06-15T10:00:00Z',
    '2026-06-15T10:30:00Z',
    'booked',
    'Classic Cut',
    2500,
    'online',
    'seed-manage-token-barber-a-32chars-min'
  ),
  (
    'a0000003-0000-4000-8000-000000000011',
    'b0000000-0000-4000-8000-000000000001',
    'a0000003-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000001',
    '2026-06-15T14:00:00Z',
    '2026-06-15T14:30:00Z',
    'booked',
    'Classic Cut',
    2500,
    'online',
    'seed-manage-token-owner-a-32chars-minimum'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notification_outbox (
  id,
  shop_id,
  appointment_id,
  channel,
  template,
  payload,
  status,
  scheduled_for
)
VALUES
  (
    'a0000003-0000-4000-8000-000000000020',
    'b0000000-0000-4000-8000-000000000001',
    'a0000003-0000-4000-8000-000000000010',
    'email',
    'booking_confirmed',
    '{"to":"seed-customer-a@glanzo.test"}'::jsonb,
    'pending',
    now()
  )
ON CONFLICT (id) DO NOTHING;
