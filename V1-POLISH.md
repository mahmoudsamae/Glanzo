# V1 Polish — deferred from Phase 4

Items that are polish, not function. Phase 4 ships without these.

- **Horizontal drag across barber columns (desktop)** — reschedule via appointment detail sheet covers cross-barber moves; column drag is a faster UX polish item.

## Deferred from Phase 5

- **Per-tenant sitemaps** — V1 ships root `sitemap.xml` only; shop slugs are discovered via marketing/onboarding, not crawl index.
- **Lighthouse CI gate on `/s/*`** — run manually on hosted test shop before launch (see [PHASE-5-ACCEPTANCE.md](PHASE-5-ACCEPTANCE.md)).

## Deferred from Phase 7

- **True session impersonation** — V1 ships read-only support “Heute” tab (`platform_get_shop_today` + audit). Full dashboard impersonation as the shop owner is polish, not MVP.
- **Dead-outbox retry button** — dead rows are a support signal in overview/shop list; manual investigation in V1. No admin “retry” action until worker ops are hardened.

## Deferred from Cinema layer (§15)

- **ConfirmSheet hold-to-confirm fill** — destructive actions stay instant-tap in V1; 200ms hold fill is polish.
- **Gallery lightbox** — tap does nothing in V1; editorial masonry only.
- **Calendar drag ghost 2° tilt** — hover lift only in V1; full drag ghost styling deferred.
