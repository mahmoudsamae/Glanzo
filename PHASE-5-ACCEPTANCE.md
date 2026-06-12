# Phase 5 Acceptance Report

Verification execution deferred for DB/e2e/Lighthouse — see [DEFERRED-VERIFICATION.md](DEFERRED-VERIFICATION.md).

**Local gates (2026-06-12):** `pnpm typecheck` green · `pnpm test:unit` **226 tests / 31 files** green · `pnpm test:static` green (after `pnpm build`) · `pnpm lint` green (pre-existing warnings only) · `pnpm build` green.

---

## Route budgets (production build)

| Route | Metric | Value | Budget |
|-------|--------|-------|--------|
| `/s/[shopSlug]` | Route-specific JS (no `?book=1`) | **55 kB** | ≤ 70 kB |
| `/s/[shopSlug]` | First Load JS total | 158 kB | — |
| `/d/minisite` | First Load JS | **104 kB** | ≤ 150 kB |
| Shared baseline | First Load JS shared | 103 kB | — |

Booking island (`?book=1`) and editor preview/uploads load via **runtime `import()`** — not counted in default First Load above.

---

## Lighthouse (mobile mini-site)

| Metric | Result |
|--------|--------|
| Performance | **Not executed locally** — `npx lighthouse` blocked (npm TLS); no seeded public shop on local `:3000` for a representative `/s/{slug}` URL |
| LCP | **Not executed** (same) |

Re-run before launch: `pnpm build && pnpm start`, then Lighthouse mobile against a hosted test shop mini-site with cover image and full content.

---

## Phase-level acceptance

| Criterion | Status | Evidence |
|-----------|--------|----------|
| **Step 1** — `minisite` table, `shop-media` bucket, `get_shop_public_data` RPC, anon `shops` read revoked, `ShopPublicData` Zod | **Done** | `20250615010000_phase5_minisite.sql`, `public-shop.ts`, commit `d43e420` |
| **Step 2** — `unstable_cache` + `revalidateShopPublic(shopId)` wired to shop mutations | **Done** | `revalidate-shop-public.ts`, services/settings/staff/create-shop, commit `8f6a5d5` |
| **Step 3** — Shared sections, classic/midnight/bold themes, accent system, `/s/[shopSlug]` | **Done** | `features/minisite/`, commit `50e7a75` |
| **Step 4** — Booking sheet island (`?book=1`), URL steps, idempotency, German errors, `.ics` | **Done** | `booking-sheet.client.tsx`, `BookingSheetGate`, commit `9f7be12` + `4fcddac` |
| **Step 5** — Owner editor `/d/minisite`, two-pane/tabbed, live preview (real shell), save = live + audit + revalidate | **Done** | `minisite-editor.client.tsx`, `minisite.service.ts`, commit `108a138` |
| **Step 5** — Uploads: client webp resize ≤1920px, gallery ≤8, reorder | **Done** | `compress-image.client.ts`, `upload-media.client.ts` |
| **Step 5** — Nav Minisite (owner, store icon) | **Done** | `nav.ts`, `nav-icons.ts` |
| **Step 6** — `/bookings/[token]` Midnight restyle, Fraunces status, ledger; flows unchanged | **Done** | `manage-booking.client.tsx`, `bookings/[token]/layout.tsx`, commit `4fcddac` |
| **Step 6** — `generateMetadata` per shop, OG = cover | **Done** | `s/[shopSlug]/page.tsx` |
| **Step 6** — JSON-LD `HairSalon` + `openingHoursSpecification` | **Done** | `lib/minisite/json-ld.ts` |
| **Step 6** — Root `robots.ts` / `sitemap.ts` only | **Done** | `app/robots.ts`, `app/sitemap.ts` |
| Anon public door: only `get_shop_public_data` RPC | **Done** | `shops.loader` → RPC; security matrix extended |
| ISR tag `shop-public:{shopId}` | **Done** | `cache-tags.ts`, `get-public-shop.ts` |
| RLS matrix Phase 5 (`minisite`) | **Written, not executed** | `tests/security/matrix-phase5.ts` |
| Editor e2e | **Written, not executed** | Deferred — no dedicated spec yet |
| Booking e2e (device-confirmed by operator) | **Executed manually** | Operator confirmed booking flow on device; automated e2e still deferred |
| Lighthouse mobile on built mini-site | **Not executed** | See table above |

---

## Phase 6 handoff

**Outbox rows already exist and are lifecycle-correct** from Phase 3 booking RPCs:

- `book_appointment` → `notification_outbox` rows: `booking_confirmed` + `reminder_24h` (when reminder time is in the future)
- `cancel_booking_by_token` → pending `reminder_24h` row cancelled; `booking_cancelled` enqueued
- `reschedule_booking_by_token` → reminder rescheduled / re-inserted

Phase 6 builds **only** the worker, Resend adapter, and email templates — **no new outbox schema or booking-side writes**.

---

*Last updated: Phase 5 boundary.*
