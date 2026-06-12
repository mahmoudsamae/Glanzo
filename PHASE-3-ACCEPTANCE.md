# Phase 3 Acceptance Report

Verification execution deferred — see [DEFERRED-VERIFICATION.md](DEFERRED-VERIFICATION.md). DB/hosted suites are **written, not executed** unless stated **passed locally**.

**Local gates (2026-06-11):** `pnpm typecheck` green · `pnpm test:unit` **140 tests / 17 files** green · `pnpm test:static` green (route budgets: `/d/services` 145 kB, `/d/staff` 130 kB, `/s/[shopSlug]` 0 kB route-specific) · `pnpm lint` green (pre-existing warnings only) · `pnpm build` green.

---

## Phase-level acceptance criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Customers never authenticate; `customers` has no `user_id` | **Done** | `20250613010000_phase3_booking.sql` |
| No phone-lookup endpoint of any kind | **Done** | No route/action exposes customer search by phone |
| Post-booking manage = capability token URL only | **Done** | `/bookings/[token]` + manage RPCs |
| Booking input = name + phone (+ optional email) | **Done** | `book_appointment` RPC + public POST bookings |
| `EXCLUDE` double-booking constraint (barber + overlapping `booked`/`completed`) | **Done** | Migration + `phase3-constraints.test.ts` — **written, not executed** (`pnpm vitest run tests/rls/phase3-constraints.test.ts`) |
| Anon zero direct table access; writes via SECURITY DEFINER RPCs | **Done** | Phase 3 RLS + `matrix-phase3.ts` — **written, not executed** (`pnpm test:security`) |
| `book_appointment`: idempotent, rate-limited, fair barber, outbox + audit | **Done** | `20250613020000_phase3_booking_rpcs.sql` + `booking-rpc.test.ts` — **written, not executed** |
| 20 parallel same-slot bookings → exactly 1 winner | **Done** | `booking-concurrency.test.ts` — **written, not executed** |
| Typed errors only at API boundary (no raw Postgres) | **Done** | `errors.ts`, `http-status.ts`, public envelope |
| E.164 normalization in app; RPC re-validates | **Done** | `normalize-e164.ts` — **passed locally** |
| Availability: shop hours ∩ staff − time off − appointments − lead time | **Done** | `availability/` module — **41 cases passed locally** |
| Public API: availability + book + get/cancel/reschedule manage | **Done** | `src/app/api/public/**` |
| `SLOT_TAKEN` returns 3 nearest alternatives | **Done** | `alternative-slots.ts` + public booking service |
| `Idempotency-Key` required on POST bookings | **Done** | Route + zod — **passed locally** |
| Walk-in: nullable `customer_id`, availability check, status machine | **Done** | `appointments.service.ts` — status unit **passed locally**; RLS **written, not executed** |
| Manage page on root domain | **Done** | `app/bookings/[token]/page.tsx` |
| Dev booking harness (non-prod, owner-only) | **Done** | `/d/dev/booking` |
| Notification outbox rows on book (worker deferred Phase 6) | **Done** | RPC inserts `pending` rows — proved in `booking-rpc.test.ts` **written, not executed** |
| Route budgets unchanged / within limits | **Done** | `pnpm test:static` **passed locally** |
| Full API e2e: availability → book → manage → reschedule → cancel | **Written, not executed** | `tests/e2e/phase3-api.dev.spec.ts` (`pnpm test:e2e`) |

---

## Step 1 — Migrations, RLS, attack matrix, constraint proofs

| Item | Status |
|------|--------|
| `20250613010000_phase3_booking.sql` | Done |
| `customers`, `appointments`, `notification_outbox`, `booking_requests`, `booking_attempts` | Done |
| Phase 3 seed fixtures | Done |
| Attack matrix +3 tables | Written, not executed |
| `phase3-constraints.test.ts` | Written, not executed |

## Step 2 — Availability module

| Item | Status |
|------|--------|
| Pure `src/server/modules/availability/` | Done |
| Unit suite (41 cases) | **Passed locally** |

## Step 3 — Booking/manage RPCs

| Item | Status |
|------|--------|
| `20250613020000_phase3_booking_rpcs.sql` | Done |
| `book_appointment` / manage RPCs | Done |
| RPC + concurrency suites | Written, not executed |
| Pure-logic unit tests | **Passed locally** |

## Step 4 — Public API routes

| Item | Status |
|------|--------|
| Five public routes + envelope + cache headers | Done |
| Validation + HTTP status unit tests | **Passed locally** |
| `phase3-api.dev.spec.ts` | Written, not executed |

## Step 5 — Walk-in + status machine

| Item | Status |
|------|--------|
| `appointment-status.ts` + `appointments.service.ts` | Done |
| Dashboard actions | Done |
| Status unit tests | **Passed locally** |
| `walk-in-appointments.test.ts` | Written, not executed |

## Step 6 — Manage page + dev harness

| Item | Status |
|------|--------|
| `/bookings/[token]` manage UI | Done |
| Cancel / reschedule flows | Done |
| Inactive link state | Done |
| `/d/dev/booking` | Done |
| `format-appointment` unit tests | **Passed locally** |

**N/A:** Shop phone on TOO_LATE — no `shops.phone` column in schema; UI uses generic “contact the shop directly” copy.

## Step 7 — Phase closure

| Item | Status |
|------|--------|
| This acceptance report | Done |
| `DEFERRED-VERIFICATION.md` ledger | Done |
| Phase 4 handoff (below) | Done |

---

## Phase 4 handoff — what the calendar may assume

Phase 4 (staff calendar UI) can build on the following **without re-implementing booking core**:

| Capability | Location | Notes |
|------------|----------|-------|
| **Appointments table + RLS** | `appointments` | Members SELECT; owner write; barber walk-in INSERT + own UPDATE |
| **Status state machine** | `appointment-status.ts`, `updateAppointmentStatus` | `booked → completed \| no_show \| cancelled`; time guards enforced |
| **Walk-in creation** | `createWalkInAppointment` / action | Availability-checked insert; `source = walk_in` |
| **Availability I/O** | `availability-io.service.ts` | Same slot algorithm as public API — use for calendar slot picker |
| **Pure slot core** | `computeAvailabilitySlots`, `pickFairBarber` | No I/O; feed from queries |
| **Booking queries** | `booking.queries.ts` | Shop context, staff hours, appointments blocks for a day |
| **Public manage API** | `/api/public/bookings/*` | Customer self-service (not calendar, but coexists) |
| **Exclusion constraint** | DB | Overlapping `booked`/`completed` per barber impossible |
| **Audit trail** | `writeAuditLog` on walk-in + status changes | Extend for calendar drag-drop in Phase 4 |

**Polling-ready queries (suggested for Phase 4):**

- `appointments` filtered by `shop_id`, date range, `membership_id` — already used in `booking.queries.ts` for availability; calendar can SELECT same rows via authenticated client (RLS permits members).
- Status updates via `updateAppointmentStatusAction` — single code path; do not bypass for UI writes.

**Not in Phase 3 (do not assume):**

- Email/SMS delivery worker (outbox is `pending` only)
- Customer auth or customer portal beyond manage token
- Calendar UI, drag-drop, or real-time subscriptions
- Phase 5 visual restyle of manage page

---

*Phase 3 complete. Proceed with Phase 4 prompt.*
