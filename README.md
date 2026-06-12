# Glanzo

Multi-tenant SaaS for Barbershops, Friseure & Beauty-Studios.

## Stack

- Next.js 15 (App Router) · TypeScript strict · Tailwind CSS · shadcn/ui · Supabase · pnpm

## Local setup

```bash
pnpm install
cp .env.example .env.local
# Fill the 3 Supabase values from Dashboard → Project Settings → API
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Windows:** `pnpm dev` runs Node with `--use-system-ca` so server actions can reach hosted Supabase over HTTPS. If login/register shows a generic error while the user exists in the Dashboard, stop the server and start again with `pnpm dev` (not `npm run dev` without that flag).

### Environment (`.env.local`)

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → API → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → API → **service_role** (server only) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `glanzo.app` in production; `localhost:3000` in `.env.local` for local dev |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | `false` until OAuth is configured |

**Important:** URL and anon key must be from the **same** Supabase project. The local Docker demo key does not work with a hosted `*.supabase.co` URL.

Optional — apply migrations to your hosted dev project (once):

```bash
supabase login
pnpm db:push:test
```

## Database workflow

| Command | Description |
|---------|-------------|
| `pnpm db:push:test` | Link your project + apply migrations |
| `pnpm db:reset:test` | Reset + seed (dev project only — refuses if real users exist) |
| `pnpm db:types` | Regenerate types from linked project |
| `pnpm db:types:check` | Fail if committed types differ |
| `pnpm db:diff` | Create a new migration (`-f <name>`) |
| `pnpm test:secure` | Reset + full RLS/security suites |
| `pnpm verify` | lint + typecheck + unit + static + types check |

Security test suites also run on every push in **GitHub Actions CI** (Docker on the runner — no local setup needed).

### Creating a migration

1. Edit SQL by hand in `supabase/migrations/` (forward-only — never edit applied migrations), **or**
2. Change schema locally and run `pnpm db:diff new_migration_name`
3. Run `pnpm db:reset:test` to verify from scratch (or rely on CI)
4. Run `pnpm db:types` and commit `src/types/database.types.ts`

Migrations live in `supabase/migrations/` with timestamp prefixes.

| Migration | Purpose |
|-----------|---------|
| `20250611210000_*` | Extensions, UUIDv7, enums |
| `20250611210001_*` | Phase 1 tables + RLS |
| `20250611220000_*` | Anon mini-site read (column grant + policy) |
| `20250611230000_*` | `create_shop_with_owner` RPC + slug availability |
| `20250611240000_*` | Shop status changes restricted to `service_role` only |
| `20250612010000_*` | Phase 2: services, staff hours, invites + RLS + `accept_staff_invite` |

Run `pnpm db:push:test` after pulling new migrations, then `pnpm db:reset:test`.

### Seed data (test project + CI only — never production)

`supabase/seed.sql` runs only via `pnpm db:reset:test` or CI `supabase db reset`. It is **not** applied to `glanzo-prod`. Guards refuse to seed if non-`@glanzo.test` users exist.

| User | Password | Role |
|------|----------|------|
| `owner-a@glanzo.test` | `password123` | Owner of `demo-barber-a` |
| `owner-b@glanzo.test` | `password123` | Owner of `demo-barber-b` (suspended) |
| `barber-a@glanzo.test` | `password123` | Barber on `demo-barber-a` |
| `platform-admin@glanzo.test` | `password123` | Platform admin (no shop) |

Profiles are created automatically via the `on_auth_user_created` trigger.

### Platform Super Admin (hosted — manual, once)

Local/CI seed inserts `platform-admin@glanzo.test` into `platform_admins` for security tests. **Hosted production** still uses a one-time manual insert after your user registers:

```sql
INSERT INTO public.platform_admins (user_id)
VALUES ('<your-auth-user-uuid>');
```

Run in the Supabase SQL editor (or psql) against the **hosted** EU project.

### Hosted Supabase region

Production/staging Supabase projects must use **EU (Frankfurt)** (`eu-central-1`) for GDPR alignment.

### Local env

See `.env.example` — three Supabase values from Dashboard → API.

### Email confirmation (test project vs production)

Local Supabase sets `enable_confirmations = false` in `supabase/config.toml` (CI only). Hosted test/production should enable confirmations; auth actions handle both paths.

## Auth (Step 5)

- `@supabase/ssr` browser + server clients in `src/lib/supabase/`
- Middleware refreshes session on **root domain only** (tenant subdomains skip auth — public mini-sites)
- OAuth callback: `/auth/callback` (add `http://localhost:3000/auth/callback` and production URL to Supabase redirect allow-list)
- Google sign-in button renders only when `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`

### Google Cloud Console (manual)

1. Create OAuth client (Web application)
2. Authorized redirect URIs:
   - Local: `http://127.0.0.1:54321/auth/v1/callback` (Supabase Auth) **and** your app callback if required by provider config
   - App callback: `http://localhost:3000/auth/callback`
   - Production: `https://<your-domain>/auth/callback`
3. Paste Client ID/Secret into Supabase Auth → Providers → Google (hosted dashboard)

### Post-auth routing (`getActorState`)

| Actor state | Redirect |
|-------------|----------|
| Unauthenticated | `/login` |
| Authenticated, no memberships, not platform admin | `/onboarding` |
| Has active membership(s) | `/d` |
| Platform admin (no shop) | `/admin` |
| Platform admin + shop | `/d` (memberships win) |

Onboarding wizard state is in-memory only — refresh restarts (documented; no draft persistence).

### Dashboard shell (Step 6 — “The Counter”)

- Nav config: `src/components/layout/nav.ts` (single source of truth)
- AppShell: `src/components/layout/app-shell.tsx` — rail ≥1024px, bottom tabs <1024px (CSS visibility, no JS breakpoint)
- Client islands: **2** — `rail-nav-chrome.client.tsx` (collapse + user menu), `bottom-tabs-chrome.client.tsx` (More sheet)
- Active shop: earliest membership by `created_at` (no switcher UI — // DECISION: in code)
- `/d` Today: shop-timezone date line, `CutLine`, Fraunces empty state “A quiet morning.”

## Security suite (Step 7 — permanent gate)

Runs on every PR via `.github/workflows/ci.yml`. **Do not weaken policies to make tests pass** — a failure here is a Step 3–5 bug; fix at the source.

| Suite | Path | Purpose |
|-------|------|---------|
| Attack matrix | `tests/security/cross-tenant.test.ts` + `matrix.ts` | Named rows: actors × tenant tables × ops; extend `TENANT_TABLE_REGISTRY` in Phase 2+ |
| Tenancy hardening | `tests/security/tenancy.test.ts` + `tests/e2e/tenancy.prod.spec.ts` | Host/`?shop=` rules, header spoofing, prod auth boundaries |
| Phase 1 journey | `tests/e2e/journey.spec.ts` | Register → onboarding → `/d` → mini-site → sign out → login (360px + 1280px) |
| Static checks | `scripts/check-*.mjs` via `pnpm test:static` | `NEXT_PUBLIC_*` allowlist, service-role import isolation, no `console.log`, no hex outside tokens |

Local full security gate (Docker-free):

```bash
pnpm db:push:test        # first time / after new migrations
pnpm test:secure         # reset:test + RLS + security matrix
pnpm test:e2e:dev        # requires pnpm dev + test env in .env.local
pnpm test:e2e:prod       # prod-mode tenancy hardening
```

Phase 1 gate counts are satisfied by **`pnpm test:secure`** (local) **or** a green **CI** workflow run link.

### CI & branch protection

- Workflow: **CI** (`.github/workflows/ci.yml`) — jobs ordered: verify → Supabase reset + security → build + prod tenancy + Playwright.
- **CI uses `supabase start` on the GitHub runner (Docker)** — isolated DB per run, no secrets in the repo.
- **`main` branch protection**: require the **CI** workflow to pass before merge.
- **Prove the gate works once**: scratch branch → weaken a shop SELECT policy → push → CI `db-security` fails → revert → green. Capture the failed run URL.

### Tenancy header contract

Middleware reads **`Host` only** (`request.headers.get("host")`) — not `X-Forwarded-Host`. Vercel sets `Host` at the edge; spoofed forwarded headers must not change tenant resolution.

## Tenancy & local subdomains

Host parsing lives **only** in `src/lib/tenant.ts`. Middleware rewrites tenant hosts to `/s/{slug}`.

| Host (local) | Result |
|--------------|--------|
| `http://localhost:3000` | Marketing placeholder (root app) |
| `http://www.localhost:3000` | Marketing placeholder |
| `http://demo-barber-a.localhost:3000` | Shop A mini-site (after seed + migration 3) |
| `http://demo-barber-b.localhost:3000` | Shop B mini-site (seed status: **suspended**) |
| `http://unknown-shop.localhost:3000` | Designed 404 — “This shop doesn't exist.” |

Modern browsers resolve `*.localhost` natively — no `/etc/hosts` entry required. If a browser/OS fails to resolve tenant subdomains, add:

```text
127.0.0.1 demo-barber-a.localhost
127.0.0.1 demo-barber-b.localhost
```

Production uses `{slug}.glanzo.app`; dashboard/admin stay on the root domain (`/d`, `/admin`).

Dev-only: `?shop=demo-barber-a` on the root host simulates a tenant on Vercel previews (`*.vercel.app` → root).

## App scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint with architectural boundary rules |
| `pnpm typecheck` | TypeScript check |

## Project structure

- `src/app/` — routing and wiring only (no business logic)
- `src/features/` — domain UI and hooks (cross-feature imports forbidden)
- `src/server/modules/` — server-side business logic
- `src/lib/tenant.ts` — host → tenant resolution (single source of truth)
- `src/types/database.types.ts` — generated Supabase types (`pnpm db:types`)
- `supabase/migrations/` — forward-only SQL migrations + RLS

## Phase 1 delivery status

- [x] Step 1 — Scaffold, shadcn tokens, ESLint boundaries, `env.ts`
- [x] Step 2 — Self-hosted fonts, `lib/motion.ts`, typography utilities, MotionProvider
- [x] Step 3 — Supabase migrations + RLS + seed + type pipeline + RLS smoke tests
- [x] Step 4 — Tenancy middleware + placeholder mini-site + tests
- [x] Step 5 — Auth + onboarding + atomic shop RPC
- [x] Step 6 — AppShell (rail + bottom tabs) + Today placeholder
- [x] Step 7 — Cross-tenant attack matrix + tenancy hardening + journey E2E + static checks + CI
- [ ] Step 8 — Vercel deploy + wildcard domain + final acceptance walkthrough

### Phase 1 acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Vercel deploy + wildcard `{slug}.glanzo.app` | Step 8 |
| 2 | Auth + onboarding + dashboard shell journey | Complete |
| 5 | Admin gate (platform admin only) | Complete |
| 6 | Permanent security suite + CI blocking merge | Complete |
| 7 | Onboarding wizard | Complete |
