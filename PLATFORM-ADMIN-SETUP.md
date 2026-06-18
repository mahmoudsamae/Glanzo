# Platform-Admin einrichten (Hosted Supabase)

`/admin` ist der **eigene Login** für Plattform-Administratoren (nicht der Shop-Login unter `/login`).

## 1. User in Supabase anlegen

1. [Supabase Dashboard](https://supabase.com/dashboard) → dein Projekt  
2. **Authentication** → **Users** → **Add user** → **Create new user**  
3. E-Mail + Passwort setzen (E-Mail bestätigt lassen, wenn Confirmations an sind)

Alternativ: einmal unter `/register` registrieren und die User-ID aus dem Dashboard kopieren.

## 2. User-ID in `platform_admins` eintragen

**SQL Editor** → New query:

```sql
INSERT INTO public.platform_admins (user_id)
VALUES ('DEINE-USER-UUID-HIER')
ON CONFLICT (user_id) DO NOTHING;
```

UUID findest du unter Authentication → Users → Spalte **UID**.

## 3. Anmelden

1. App starten: `pnpm dev`  
2. Öffnen: [http://localhost:3000/admin](http://localhost:3000/admin)  
3. E-Mail + Passwort des Users eingeben  

Nach erfolgreichem Login siehst du die Plattform-Übersicht (Shops, Suspended, …).

## Seed (nur lokal / `db:reset:test`)

| E-Mail | Passwort |
|--------|----------|
| `platform-admin@glanzo.test` | `password123` |

Dieser User ist in `supabase/seed.sql` bereits in `platform_admins` eingetragen.

## Fehler „Kein Plattform-Zugang“

Login hat funktioniert, aber der User fehlt in `platform_admins` → Schritt 2 wiederholen.

## Shop-Besitzer vs. Plattform-Admin

| Route | Zielgruppe |
|-------|------------|
| `/login` | Salon-Inhaber, Barber, Staff |
| `/admin` | Glanzo Plattform-Team nur |

Ein User kann **beides** sein (Shop + Plattform). Dann: Shop unter `/d`, Plattform unter `/admin`.
