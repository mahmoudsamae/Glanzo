# Phase 6 Acceptance Report

Verification execution deferred for hosted DB/security/concurrency — see [DEFERRED-VERIFICATION.md](DEFERRED-VERIFICATION.md).

**Local gates (2026-06-12):** `pnpm typecheck` green · `pnpm test:unit` **249 tests / 36 files** green · `pnpm test:integration` **5 skipped** (Supabase unreachable — Docker off) · `pnpm lint` green (pre-existing warnings only).

---

## Phase-level acceptance

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Migration: `skipped` status, `reminders_enabled`, `claimed_at`, `owner_new_booking`, `claim_outbox_batch` | **Done** | `20250616010000_phase6_notifications.sql` (commit `f89d929`) |
| `book_appointment` enqueues customer + owner rows | **Done** | `enqueue_booking_outbox_rows` |
| Payload recipient via `payload.to` (no schema change) | **Done** | SQL comments + `resolveRecipientEmail` |
| Resend adapter isolated under `integrations/resend/` | **Done** | SDK only in `resend-adapter.ts` |
| Log adapter (`.dev-emails/`, idempotent by outbox id) | **Done** | `log-adapter.ts`, `.gitignore` |
| 4 German templates + unit tests | **Done** | `templates/*`, `notifications-templates.test.ts` |
| Backoff `2^attempts` min, dead at attempts ≥5 | **Done** | `backoff.ts`, unit tests |
| State machine transitions | **Done** | `outbox-transitions.ts`, unit tests |
| Worker batch ≤25, runtime <10s | **Done** | `notifications.service.ts` constants |
| CRON_SECRET constant-time 401 | **Done** | `cron-auth.ts`, `notifications-route.test.ts` |
| Skip reminder when `reminders_enabled=false` | **Done** | worker + settings UI copy |
| Skip reminder when appointment not `booked` | **Done** | worker guard |
| Settings `/d/settings/notifications` + previews | **Done** | settings layout + form |
| Toggle audit `shop.reminders_toggled` | **Done** | `notification-settings.service.ts` |
| `pnpm jobs:dispatch` local tick | **Done** | `scripts/dispatch-notifications.mjs` |
| Integration lifecycle (book → dispatch → `.dev-emails`) | **Written** | `tests/integration/notifications-dispatch.test.ts` — **skipped locally** (no Supabase) |
| Claim concurrency SKIP LOCKED | **Written, not executed** | `tests/rls/claim-concurrency.test.ts` |
| Security matrix Phase 6 touch-up | **Written, not executed** | `matrix-phase6.ts` |
| Real Resend send + SPF/DKIM | **Deploy-time [HUMAN]** | [DEPLOYMENT.md](DEPLOYMENT.md) |

---

## Unit test counts (paste)

```
Test Files  36 passed (36)
     Tests  249 passed (249)
```

Notification-specific: backoff (5) · outbox transitions (4) · cron auth (3) · templates (8) · route (3).

---

## Integration (when Supabase up)

```bash
pnpm db:reset
pnpm test:integration
```

Expect: confirmation + owner emails in `.dev-emails/`, reminder skip paths, dead after 5 failures, stale reclaim.

---

## Phase 7 handoff

Platform admin (Phase 7) may read **outbox stats per shop** and treat **`dead` rows** as the support signal — no retry UI in V1. Worker + templates are complete; Phase 7 does not add new enqueue paths.

---

*Last updated: Phase 6 boundary.*
