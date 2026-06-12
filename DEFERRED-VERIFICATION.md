# Deferred Verification Ledger

Operator decision: execution against the hosted `glanzo-test` project and CI are **deferred** to final hardening before launch. Suites listed here are **written** as each phase specifies; they are **not** marked passed until executed green with zero skips.

## Run order (dependency order)

Execute top-to-bottom before any real shop uses the product:

```bash
# 0 — Prerequisites (hosted test project)
supabase login
pnpm db:push:test

# 1 — Local pure logic (no DB; must pass before every commit)
pnpm typecheck
pnpm test:unit

# 2 — Static / budget gates (uses last build for route budgets)
pnpm build
pnpm test:static

# 3 — Database suites (require live Supabase — local or hosted)
pnpm vitest run tests/rls/phase3-constraints.test.ts
pnpm vitest run tests/rls/booking-rpc.test.ts
pnpm vitest run tests/rls/booking-concurrency.test.ts
pnpm vitest run tests/rls/walk-in-appointments.test.ts
pnpm test:rls

# 4 — Cross-tenant attack matrix (Phase 1–3 tables)
pnpm test:security

# 5 — Combined secure gate
pnpm test:secure

# 6 — Browser / API e2e (dev server + DB)
pnpm test:e2e
```

---

## Phase 2 (still deferred)

| Suite | Command | Status |
|-------|---------|--------|
| RLS smoke | `pnpm test:rls` | Written, not executed |
| Security attack matrix | `pnpm test:security` | Written, not executed |
| Full secure gate | `pnpm test:secure` | Written, not executed |
| E2E journeys | `pnpm test:e2e` | Written, not executed |
| GitHub CI | push → `.github/workflows/ci.yml` | Not run (no remote configured) |

## Phase 3

| Suite | Command | Status |
|-------|---------|--------|
| **Local unit (all)** | `pnpm test:unit` | **140 tests / 17 files — passed locally** |
| Availability pure core | `pnpm vitest run tests/unit/availability.test.ts` | **41 cases — passed locally** |
| Booking pure logic (phone, errors, alt slots, token, http status, validation, format) | `pnpm test:unit` (subset) | **Passed locally** |
| Appointment status machine | `pnpm vitest run tests/unit/appointment-status.test.ts` | **Passed locally** |
| Static + route budgets | `pnpm test:static` | **Passed locally** (after `pnpm build`) |
| Exclusion constraints | `pnpm vitest run tests/rls/phase3-constraints.test.ts` | Written, not executed |
| Booking RPC suite | `pnpm vitest run tests/rls/booking-rpc.test.ts` | Written, not executed |
| Booking concurrency (20 parallel) | `pnpm vitest run tests/rls/booking-concurrency.test.ts` | Written, not executed |
| Walk-in RLS | `pnpm vitest run tests/rls/walk-in-appointments.test.ts` | Written, not executed |
| Full RLS smoke | `pnpm test:rls` | Written, not executed |
| Security matrix (+customers, +appointments, +notification_outbox) | `pnpm test:security` | Written, not executed |
| Public API e2e | `pnpm vitest run tests/e2e/phase3-api.dev.spec.ts` or `pnpm test:e2e` | Written, not executed |
| Full secure gate | `pnpm test:secure` | Written, not executed |

## Phase 4

| Suite | Command | Status |
|-------|---------|--------|
| **Local unit (all)** | `pnpm test:unit` | **175 tests / 21 files — passed locally** |
| Calendar grid + url + today + lands | `pnpm test:unit` (subset) | **Passed locally** |
| Static + route budgets | `pnpm test:static` (after `pnpm build`) | **Passed locally** — `/d` 132 kB, `/d/calendar` 145 kB, `/d/customers` 142 kB |
| Customer notes member RLS | `pnpm db:push:test` + manual verify | Migration written — **not executed** |
| Phase 4 calendar e2e | `pnpm test:e2e` → `phase4-calendar.dev.spec.ts` | Written, not executed |
| Full RLS / security / e2e | (unchanged from Phase 3) | Written, not executed |

## Phase 5

| Suite | Command | Status |
|-------|---------|--------|
| **Local unit (all)** | `pnpm test:unit` | **226 tests / 31 files — passed locally** |
| Minisite editor validation + JSON-LD | `pnpm test:unit` (subset) | **Passed locally** |
| Static + route budgets | `pnpm test:static` (after `pnpm build`) | **Passed locally** — `/d/minisite` 104 kB, `/s/[shopSlug]` 55 kB route-specific |
| Security matrix Phase 5 (`minisite`) | `pnpm test:security` → `matrix-phase5.ts` | Written, not executed |
| Minisite editor e2e | `pnpm test:e2e` | **Not written** — manual editor verify deferred |
| Public booking e2e | `pnpm test:e2e` | Written (Phase 3 API suite); **device booking confirmed by operator** — automated green run deferred |
| Lighthouse mobile (mini-site perf / LCP) | Lighthouse CLI on `/s/{slug}` | **Not executed** — npm TLS + no local seeded shop |
| Full RLS / security / e2e | (unchanged prior phases) | Written, not executed |

## Phase 6

| Suite | Command | Status |
|-------|---------|--------|
| **Local unit (all)** | `pnpm test:unit` | **249 tests / 36 files — passed locally** |
| Notification templates + backoff + route auth | `pnpm test:unit` (subset) | **Passed locally** |
| Notification dispatch integration | `pnpm test:integration` | **Written** — 5 tests skip when Supabase unreachable (Docker off locally) |
| Claim concurrency (SKIP LOCKED) | `pnpm vitest run tests/rls/claim-concurrency.test.ts` | Written, not executed |
| Security matrix Phase 6 | `pnpm test:security` → `matrix-phase6.ts` | Written, not executed |
| Real Resend send + domain verification | Manual after deploy | **[HUMAN]** — see [DEPLOYMENT.md](DEPLOYMENT.md) |
| Full RLS / security / e2e | (unchanged prior phases) | Written, not executed |

## Phase 7

| Suite | Command | Status |
|-------|---------|--------|
| **Local unit (all)** | `pnpm test:unit` | **Written** — run at boundary |
| Platform admin utils | `pnpm vitest run tests/unit/platform-admin-utils.test.ts` | **Written** |
| Static + route budgets (incl. `/admin/*` ≤150 kB) | `pnpm build` + `pnpm test:static` | **Written** |
| Security matrix Phase 7 | `pnpm test:security` → `matrix-phase7.ts` | Written, not executed |
| Owner invite → owner membership | `pnpm vitest run tests/rls/platform-owner-invite.test.ts` | Written, not executed |
| Phase 7 admin e2e | `pnpm test:e2e` → `phase7-admin.dev.spec.ts` | Written, not executed |
| Full RLS / security / e2e | (unchanged prior phases) | Written, not executed |

---

*Last updated: Phase 7 boundary.*
