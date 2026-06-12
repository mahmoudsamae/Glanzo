# Phase 7 Acceptance Report

Verification execution deferred for hosted DB/security/e2e — see [DEFERRED-VERIFICATION.md](DEFERRED-VERIFICATION.md).

**Local gates (2026-06-11):** `pnpm typecheck` green · `pnpm test:unit` **255 tests / 37 files** green · `pnpm build` green · `pnpm test:static` green (route budgets below).

---

## Phase-level acceptance

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Migration: 8 platform RPCs + status trigger allowlist + owner invite role | **Done** | `20250617010000_phase7_platform_admin.sql` (commit `47f6e63`) |
| `platform_get_shop` excludes customer/appointment PII (SQL comment + shape test) | **Done** | migration COMMENT + `matrix-phase7.ts` shape assertion + `assertNoForbiddenShopDetailKeys` |
| Every platform write carries REASON + audit (`platform_set_shop_status`, `platform_create_shop`) | **Done** | RPC SQL |
| `platform_record_support_view` audits Heute tab (no reason — read-only aggregate) | **Done** | RPC COMMENT + `loadPlatformShopToday` |
| AdminShell — cold cockpit, brass alerts only | **Done** | `admin-shell.tsx`, `admin-overview.tsx` |
| `/admin` overview stats + dead-outbox alert + suspended list | **Done** | overview page |
| `/admin/shops` list — search, status chips, cursor pagination | **Done** | `admin-shops-list.client.tsx` |
| `/admin/shops/[id]` detail — facts, outbox, audit, suspend/reactivate with reason | **Done** | `admin-shop-detail.client.tsx` |
| `/admin/shops/new` counter-signing + WhatsApp share | **Done** | `admin-create-shop.client.tsx` |
| Support Heute tab — counts + histogram only | **Done** | `admin-shop-today.client.tsx` |
| Admin link in dashboard user menu (platform admins only) | **Done** | `rail-nav-chrome`, `bottom-tabs-chrome`, `d/layout` |
| Non-admin `/admin` redirect server-side | **Pre-existing** | `(admin)/layout.tsx` + e2e `auth.dev.spec.ts` |
| Matrix: all platform RPCs FORBIDDEN for owner/barber/anon | **Written** | `matrix-phase7.ts` |
| Owner invite acceptance creates owner membership | **Written** | `tests/rls/platform-owner-invite.test.ts` |
| E2E operator flow | **Written** | `tests/e2e/phase7-admin.dev.spec.ts` |
| No new cross-tenant raw table reads from app | **Done** | `platform.service.ts` uses RPCs only — grep confirms |

---

## Route budgets (admin ≤150 kB First Load JS)

```
/admin First Load JS: 107 kB (budget 150 kB)
/admin/shops First Load JS: 105 kB (budget 150 kB)
/admin/shops/[id] First Load JS: 105 kB (budget 150 kB)
/admin/shops/new First Load JS: 105 kB (budget 150 kB)
```

---

## Unit test counts

```
Test Files  37 passed (37)
     Tests  255 passed (255)
```

Platform-specific: `platform-admin-utils.test.ts` (reason, cursor, wa.me, histogram, forbidden keys).

---

## Platform admin provisioning

`platform_admins` remains **manual insert** after user registers (see README). No multi-admin UI in V1.

---

## Phase 8 handoff

**Next:** execute the full [DEFERRED-VERIFICATION.md](DEFERRED-VERIFICATION.md) ledger top-to-bottom on hosted test — nothing else remains before hardening + deploy.

---

*Last updated: Phase 7 boundary.*
