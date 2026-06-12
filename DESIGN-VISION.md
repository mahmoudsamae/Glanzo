# Glanzo Design Vision

Living design system for Glanzo. Tokens live in `src/styles/globals.css`; motion contracts in `src/lib/motion.ts`.

---

## §15 Cinema layer

**Principles**

1. **Depth via CSS 3D only** — `perspective`, `translateZ` layers, pointer-tilt. No Three.js/WebGL (every ms of LCP on the booking path is money).
2. **Scroll is the timeline** — sections perform on scroll. Prefer CSS scroll-driven animations (`animation-timeline: view()`); IntersectionObserver fallback (~1.5 kB inline in `MinisiteCinema`) for Safari.
3. **Hot paths ≤400ms** — decorative motion on the **public** mini-site; the dashboard gets precision motion, not theater.
4. **`prefers-reduced-motion`** — everything degrades to opacity-only; page stays fully usable.

### Part A — Mini-site cinema (sales weapon)

| Element | Behavior |
|---------|----------|
| Hero cover | Ken Burns 20s scale 1→1.08 **after** `ms-cinema-ready` (post-LCP) |
| Hero scrim | Layered gradient |
| Shop name | Fraunces per-word rise+fade (~600ms, once) |
| Logo chip | Soft drop shadow |
| Parallax | Cover at ~0.85× scroll (`animation-timeline: view()` where supported) |
| Pointer tilt | Hero plane ≤3° toward cursor (desktop only; `MinisiteCinema`) |
| BOOK CTA | Accent + 6s sheen sweep + `pressScale` |
| Sections | Rise 24px + fade on enter; children stagger 60ms (`--anim-cascade`) |
| PriceBoard | Row hover lift; leader brightens; header double-hairline ornament |
| Team cards | ≤6° 3D tilt; CTA slides up on hover |
| Gallery | CSS columns masonry; hover scale 1.03 + brighten |
| Book bar | Glass blur 16px; slides up after hero scrolls past; idle CTA pulse 8s until first tap |
| Booking sheet | Step slide; slot chips 30ms stagger; “Gebucht.” cut-line + brass shimmer ≤800ms once |

**Budget:** CSS + ≤3 kB script (`minisite-cinema.client.tsx` + `cinema-math.ts`). Mini-site route-specific JS ≤70 kB.

### Part B — Social links

`content.links` jsonb: `instagram`, `facebook`, `tiktok`, `whatsapp`, `google_maps`, `website` — validated in `minisite-links.ts`. Editor `/d/minisite` Links section. Icon row in hero + location. JSON-LD `sameAs`. Booking network-error fallback: WhatsApp → Instagram → plain message.

### Part C — Dashboard elevation (precision)

| Surface | Motion |
|---------|--------|
| Today | Revenue count-up + 1.02 settle; date line + cut-line draw on paint |
| Calendar | Block hover lift + brass border; drag ghost exceptions in V1-POLISH |
| Nav | `d/template.tsx` fade+rise 8px (180ms) on route change |
| Sheets | Enter with enter-ease; faster exit |
| Empty states | Double-hairline ornament + cut-line draw (shared `EmptyState`) |

**Budget:** every `/d` route ≤150 kB First Load JS.

### Guardrails

- Motion tokens: `lib/motion.ts` + `globals.css` only (`--anim-*`, named keyframes).
- No inline magic durations in components.
- `pnpm test:static` hex/motion import checks must stay green.

---

*§15 added: Cinema layer work order (Parts A–D).*
