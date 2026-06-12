# Glanzo — Product Vision

> **Product name:** Glanzo (pre-deploy rebrand).  
> **ICP (GTM):** Independent barbershops first — same wedge, sharper brand.  
> **Market expansion (V1+):** Friseure, Beauty-Studios, and other appointment-based service businesses; templates and tokens already support feminine + masculine shop identities without a visual rebrand.

## What Glanzo is

Multi-tenant SaaS for **Barbershops, Friseure & Beauty-Studios**: owner dashboard (Heute, calendar, staff, services), public mini-site with online booking, and platform admin for support.

## What stays out of V1

- Consumer marketplace / discovery
- POS / payments in-product
- Multi-location chains (single shop per tenant in V1)

## Design & motion

Warm-dark + brass design system (`DESIGN-VISION.md`). Classic / Midnight / Bold mini-site templates. Cinema-layer motion on public surfaces; precision motion in the dashboard.

## Domains

- Production root: `glanzo.app`
- Tenant mini-sites: `{slug}.glanzo.app`
- Local dev: set `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` in `.env.local`
