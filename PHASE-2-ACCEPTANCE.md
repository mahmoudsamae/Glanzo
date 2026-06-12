# Phase 2 Acceptance Report

Generated after implementation steps 1–6. RLS/security suites against `glanzo-test` are **pending human verification** (`supabase login` → `pnpm db:push:test` → `pnpm test:secure`).

## Step 1 — Migration, RLS, attack matrix, RPC + tests

| Item | Status |
|------|--------|
| `20250612010000_phase2_services_staff.sql` (services, service_staff, staff_hours, time_off, staff_invites) | Done |
| Exclusion constraints (shift overlap, time-off overlap) | Done |
| Composite FKs on `(shop_id, id)` / `(shop_id, membership_id)` | Done |
| RLS: owner catalog/invites; barber self-scoped hours/time-off | Done |
| `accept_staff_invite(p_token)` SECURITY DEFINER RPC | Done |
| Phase 2 seed fixtures (`f0000000-…` UUIDs) | Done |
| Attack matrix extension (`matrix-phase2.ts`) | Done |
| RLS/constraint tests (`phase2-constraints`, `accept-staff-invite`) | **Pending verification** |
| `pnpm test:rls` / `pnpm test:security` on hosted test project | **Pending verification** |

## Step 2 — Server modules, validations, thin actions

| Item | Status |
|------|--------|
| `services.service.ts`, `services.queries.ts`, `services.loader.ts` | Done |
| `staff.service.ts`, `staff.queries.ts` | Done |
| `shop-settings.service.ts` | Done |
| `assert-shop-access.ts`, `write-audit-log.ts` | Done |
| Zod: `lib/validations/service.ts`, `staff.ts` | Done |
| Unit tests: `hours-overlap`, `price` (53 tests) | Passed locally |
| Thin actions: `features/services/api.ts`, `staff/api.ts`, `settings/api.ts` | Done |

## Step 3 — `/d/services` price-board UI

| Item | Status |
|------|--------|
| Owner-only route (`requireOwnerDashboardAccess`) | Done |
| Ledger rows 36px (`h-9`) | Done |
| `text-data` price/duration columns | Done |
| FLIP reorder (up/down controls + `layout` via `framer-motion/m`) | Done |
| Sheet form (mobile bottom / desktop right panel) | Done |
| `ConfirmSheet` archive flow | Done |
| Fraunces empty state: “What do you charge?” | Done |
| Brass on single primary CTA only (default `Button` variant) | Done |

**Bundle (production build):** route **5.39 kB**, First Load JS **145 kB** (dashboard budget ≤150 kB).

## Step 4 — `/d/staff` + `/join/[token]`

| Item | Status |
|------|--------|
| Owner: team list, invite create, copy link, revoke | Done |
| Barber: own hours + time-off only (server-scoped via `getStaffPageData`) | Done |
| Join page: summary, login/register with `?next=/join/[token]` | Done |
| Register preserves `next` through `registerWithPassword` | Done |
| `acceptStaffInviteAction` → RPC | Done |
| Barber redirected from `/d/services` | Done |

**Bundle:** route **2.29 kB**, First Load JS **130 kB**.

## Step 5 — `/d/settings/shop` + shared hours

| Item | Status |
|------|--------|
| `components/shared/opening-hours-editor.tsx` | Done |
| Onboarding wizard uses shared editor | Done |
| Shop settings form (name, timezone, hours) | Done |
| Settings nav enabled for owners | Done |

## Step 6 — E2E journey + static verification

| Item | Status |
|------|--------|
| `tests/e2e/phase2-journey.spec.ts` (owner shell + barber redirect + two-context invite) | Added |
| **Criterion #6 — route bundle budgets** | **Passed** (see history below) |
| `scripts/check-route-budgets.mjs` enforced in `pnpm test:static` | Done |
| `pnpm typecheck` | Passed |
| `pnpm lint` | Passed (pre-existing warnings only) |
| `pnpm test:unit` | Passed (53 tests) |
| `pnpm test:static` | Passed (includes route budgets) |
| `pnpm build` | Passed |
| `pnpm test:e2e` (phase2 journey on live stack) | **Run locally against dev + hosted Supabase** |
| `pnpm test:secure` | **Pending verification** |

### Criterion #6 history — dashboard First Load JS ≤150 kB

| When | `/d/services` First Load JS | Result |
|------|----------------------------|--------|
| Initial Phase 2 ship | **177 kB** | **Failed** — `Reorder` imported from full `framer-motion` (not `m`/LazyMotion), pulling drag/reorder into the page's initial chunk (~32 kB over budget). |
| After fix | **145 kB** | **Passed** — replaced drag `Reorder` with up/down controls + FLIP via `layout` on `framer-motion/m` (`MotionLi`) inside the existing LazyMotion boundary. |

**Diagnosis:** `framer-motion`'s `Reorder` uses the internal `motion` proxy and cannot participate in the app's `LazyMotion` + `m` contract. It landed in the `/d/services` First Load JS graph despite a nested `LazyMotion strict={false}` wrapper.

**Enforcement:** `pnpm build` writes `.next/build-routes.txt`; `pnpm test:static` fails if any `/d/*` route exceeds **150 kB** total First Load JS, or any `/s/*` route exceeds **70 kB** route-specific JS (total First Load minus the shared baseline).

## Pending verification (human)

After `supabase login` and `pnpm db:push:test`:

```bash
pnpm test:rls
pnpm test:security
pnpm test:secure
pnpm test:e2e
```

Do **not** treat RLS/security matrix results as passed until the above completes against `glanzo-test`.
