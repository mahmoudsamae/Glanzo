# Glanzo Deployment Notes

## Vercel (production)

Required environment variables (Project → Settings → Environment Variables):

| Variable | Example | Notes |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Same project as keys below |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` | anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` | server only |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `glanzo.app` | tenant subdomains: `{slug}.glanzo.app` |
| `CRON_SECRET` | random 32+ chars | **Must be ≥16 characters** or build treats it as unset |
| `EMAIL_FROM` | `Glanzo <termine@glanzo.app>` | after Resend domain verify |
| `RESEND_API_KEY` | `re_…` | optional until live email |

**Using the default Vercel URL (`*.vercel.app`) without a custom domain:** set `NEXT_PUBLIC_ROOT_DOMAIN` to your production hostname exactly (e.g. `glanzo.vercel.app`). Mini-sites are served at `https://glanzo.vercel.app/s/{shop-slug}` — wildcard subdomains are not available on `*.vercel.app`.

**Custom domain (recommended for launch):** point `glanzo.app` and `*.glanzo.app` (wildcard) to Vercel, then set `NEXT_PUBLIC_ROOT_DOMAIN=glanzo.app`. Mini-sites become `https://{slug}.glanzo.app`.

**Build failure `CRON_SECRET String must contain at least 16`:** remove the variable or set a longer secret (placeholder values like `dev` fail validation).

Local dev keeps `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` in `.env.local` only — do not use that on Vercel production.

---

## Notification worker (Phase 6)

The outbox table **is** the queue. A single HTTP worker drains it — no Redis, BullMQ, or Supabase Realtime.

### Endpoint

`POST /api/jobs/dispatch-notifications`

Header: `x-cron-secret: <CRON_SECRET>` (constant-time compare; missing/wrong → **401**).

Env (server-only):

- `CRON_SECRET` — long random string (≥16 chars)
- `RESEND_API_KEY` — omit locally to use `.dev-emails/` log adapter
- `EMAIL_FROM` — e.g. `Glanzo <termine@glanzo.app>`
- `SUPABASE_SERVICE_ROLE_KEY` — required for `claim_outbox_batch`

### Scheduling

**Default (free tier):** use an external pinger (e.g. [cron-job.org](https://cron-job.org)) every **minute**:

```http
POST https://your-app.vercel.app/api/jobs/dispatch-notifications
x-cron-secret: <CRON_SECRET>
```

**Vercel Cron (Pro):** when on a plan that supports minute-level schedules, set `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/jobs/dispatch-notifications",
      "schedule": "* * * * *"
    }
  ]
}
```

Ship `vercel.json` with `"crons": []` on free tier — external pinger is the default path.

### Local dev

```bash
pnpm dev
# separate terminal, after booking via /d/dev/booking:
pnpm jobs:dispatch
```

Rendered emails land in `.dev-emails/` when `RESEND_API_KEY` is unset.

### [HUMAN] Resend domain verification

Before production sends:

1. Add domain `glanzo.app` in Resend dashboard
2. Publish SPF + DKIM DNS records Resend provides
3. Set `EMAIL_FROM` to a verified address on that domain
4. Smoke-test one real send after deploy (not covered by CI)

---

*Last updated: Phase 6 boundary.*
