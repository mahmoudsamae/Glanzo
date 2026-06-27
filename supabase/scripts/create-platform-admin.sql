-- =============================================================================
-- Glanzo — Platform-Admin anlegen / zuweisen
-- =============================================================================
-- Wo ausführen: Supabase Dashboard → SQL Editor → New query → Run
--
-- Danach einloggen unter: http://localhost:3000/admin  (nicht /login)
--
-- Zwei Wege — nur EINEN Block ausführen (den anderen auskommentiert lassen):
--   A) Bestehenden User (bereits registriert) zum Admin machen
--   B) Neuen Admin-User mit E-Mail + Passwort anlegen
-- =============================================================================


-- -----------------------------------------------------------------------------
-- OPTION A — Bestehenden User zum Plattform-Admin machen (empfohlen für Hosted)
-- -----------------------------------------------------------------------------
-- Voraussetzung: User existiert schon (über /register oder Auth → Users).
-- Nur E-Mail unten anpassen und diesen Block ausführen.

DO $$
DECLARE
  v_email text := 'DEINE-EMAIL@BEISPIEL.DE';  -- ← HIER ANPASSEN
  v_user_id uuid;
  v_display_name text;
BEGIN
  SELECT u.id, COALESCE(u.raw_user_meta_data ->> 'display_name', 'Platform Admin')
  INTO v_user_id, v_display_name
  FROM auth.users u
  WHERE lower(u.email) = lower(btrim(v_email));

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION
      'Kein User mit E-Mail "%". Zuerst unter /register registrieren oder im Supabase-Dashboard unter Authentication → Users anlegen.',
      v_email;
  END IF;

  INSERT INTO public.profiles (id, display_name)
  VALUES (v_user_id, v_display_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.platform_admins (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE '✓ Plattform-Admin aktiv: % (user_id: %)', v_email, v_user_id;
  RAISE NOTICE '→ Login: /admin mit dieser E-Mail und deinem Passwort';
END $$;


-- -----------------------------------------------------------------------------
-- OPTION B — Neuen Admin-User komplett anlegen (lokal oder Hosted)
-- -----------------------------------------------------------------------------
-- E-Mail, Passwort und Anzeigename unten anpassen.
-- Block A oben auskommentieren oder nicht ausführen, dann nur diesen Block run.

/*
DO $$
DECLARE
  v_email text := 'admin@deine-domain.de';       -- ← HIER ANPASSEN
  v_password text := 'DeinSicheresPasswort123!'; -- ← HIER ANPASSEN (min. 8 Zeichen)
  v_display_name text := 'Platform Admin';
  v_user_id uuid;
  v_instance_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  IF length(btrim(v_password)) < 8 THEN
    RAISE EXCEPTION 'Passwort zu kurz — mindestens 8 Zeichen.';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(btrim(v_email));

  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'User existiert bereits (%). Nur Admin-Rechte werden gesetzt.', v_user_id;
  ELSE
    v_user_id := gen_random_uuid();

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
    VALUES (
      v_instance_id,
      v_user_id,
      'authenticated',
      'authenticated',
      lower(btrim(v_email)),
      extensions.crypt(v_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name', v_display_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

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
    VALUES (
      gen_random_uuid(),
      v_user_id,
      v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', lower(btrim(v_email))),
      'email',
      now(),
      now(),
      now()
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✓ Auth-User angelegt: %', v_email;
  END IF;

  INSERT INTO public.profiles (id, display_name)
  VALUES (v_user_id, v_display_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.platform_admins (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE '✓ Plattform-Admin aktiv: % (user_id: %)', v_email, v_user_id;
  RAISE NOTICE '→ Login: /admin';
END $$;
*/


-- -----------------------------------------------------------------------------
-- Prüfen (optional)
-- -----------------------------------------------------------------------------
-- SELECT pa.user_id, u.email, p.display_name, pa.created_at
-- FROM public.platform_admins pa
-- JOIN auth.users u ON u.id = pa.user_id
-- LEFT JOIN public.profiles p ON p.id = pa.user_id;
