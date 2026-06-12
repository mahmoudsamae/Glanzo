# Phase 4 Acceptance Report

Verification execution deferred for DB/e2e — see [DEFERRED-VERIFICATION.md](DEFERRED-VERIFICATION.md).

**Local gates (2026-06-11):** `pnpm typecheck` green · `pnpm test:unit` **175 tests / 21 files** green · `pnpm test:static` green · `pnpm lint` green (pre-existing warnings only) · `pnpm build` green.

**Route budgets (First Load JS):** `/d` **132 kB** · `/d/calendar` **145 kB** · `/d/customers` **142 kB** (dashboard budget 150 kB).

---

## Phase-level acceptance

| Criterion | Status | Evidence |
|-----------|--------|----------|
| TanStack Query foundation (`[shopId, domain, …]`, 25s stale, 30s calendar poll) | **Done** | `src/lib/query/`, `DashboardQueryProvider` |
| Calendar day view + live Cut Line + appointment sheet | **Done** | `/d/calendar`, `calendar-day-grid`, `useNow` |
| Drag vertical + optimistic move + SLOT_TAKEN rollback/toast | **Done** | `draggable-appointment-blocks`, `useMoveAppointmentMutation` |
| Reschedule via availability-io slot picker (cross-barber) | **Done** | `reschedule-slot-picker`, `moveAppointmentAction` |
| Walk-in FAB (owner + barber locked to self) | **Done** | `walk-in-sheet`, calendar shell FAB |
| Week view (one barber, 7 columns) | **Done** | `calendar-week-grid`, `loadWeekAppointments` |
| Today: revenue MetricNumber, subline, ledger, Cut Line progress, lands | **Done** | `/d`, `today-shell` |
| Customers list + profile + notes + owner add/delete | **Done** | `/d/customers`, `/d/customers/[id]` |
| Nav: Calendar + Customers enabled | **Done** | `nav.ts` |
| Grid math ≥25 cases | **Done** | `calendar-grid.test.ts` (22+) + url/summary/lands |
| Horizontal drag across columns | **Deferred** | [V1-POLISH.md](V1-POLISH.md) — reschedule covers function |
| Barber notes RLS | **Done** | `20250614000000_customer_notes_member.sql` |
| E2E: owner day, barber scoping, booking-lands, customers | **Written, not executed** | `tests/e2e/phase4-calendar.dev.spec.ts` |
| RLS matrix (no new tables) | **Written, not executed** | Phase 3 suites still apply |

---

## Phase 5 handoff

The public mini-site booking sheet (Phase 5) may assume:

- Appointments, customers, and availability RPCs/APIs from Phase 3 are stable.
- Dashboard calendar/today poll every 30s; no Supabase Realtime in MVP.
- Walk-in and online bookings share the same `appointments` rows and snapshot fields.
- Manage/reschedule public flows remain on `/bookings/[token]`; dashboard reschedule uses `moveAppointmentAction`.

---

*Last updated: Phase 4 boundary.*
