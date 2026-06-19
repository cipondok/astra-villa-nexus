# ASTRA Villa REOS — Light Mode & Mobile Overhaul Plan

A 5-phase rollout. Each phase ships independently and is reviewable in the preview before the next starts. Pull-to-refresh lands in Phase 3 alongside mobile navigation.

---

## Phase 1 — Luxury Light Token System (foundation)

Goal: replace the current sky-blue light layer with the Bloomberg/Apple/Private-Banking palette so every page inherits the new look from one place.

Tokens applied in `src/index.css` under `html:not(.dark)` and the `.reos` light scope:

```text
--background       #F7F5F0   (warm ivory)
--card             #FFFFFF
--card-2           #FCFCFC
--primary (gold)   #D4AF37
--accent  (gold-2) #FFD700
--foreground       #111827
--muted-foreground #6B7280
--border           #E5E7EB
--success          #22C55E
--danger           #EF4444
--shadow-luxe      0 1px 2px rgba(17,24,39,.04), 0 8px 24px -12px rgba(17,24,39,.10)
--shadow-card      0 1px 0 rgba(17,24,39,.04), 0 12px 32px -16px rgba(212,175,55,.18)
```

Cleanup in same file:
- Remove sky-blue overrides (`#0EA5E9`, `#0369A1`, `rgba(14,165,233,*)`) added in the previous round
- Keep the existing light-mode neutralization layer (text-white / bg-black / gray utilities → tokens) but re-point it to the new tokens
- Add `--gold-soft` `rgba(212,175,55,0.10)` and `--gold-line` `rgba(212,175,55,0.28)` for hairlines, chips, focus rings
- Promo gradient: `linear-gradient(135deg,#FFFFFF 0%, #FCFCFC 50%, #F7F5F0 100%)` with a 1px gold hairline border

Typography stays on existing Inter/Playfair/Geist tokens — no font swap, only weight/tracking polish in the new card surfaces.

Dark mode (`astra-black-gold`) is untouched.

---

## Phase 2 — Unified Card / Surface / Header System

One visual language across Home, Properties, Buy/Sell/Rent, Projects, Investment, Finance, Legal, Management, Vendors, AI Center, Dashboard, Profile, Settings.

- `.reos-card` → `bg-card border border-border rounded-2xl shadow-[var(--shadow-card)]`
- `.reos-card-quiet` → `bg-[var(--card-2)] border border-border/60 rounded-2xl`
- `.reos-divider` → 1px `--border`, with a 1px `--gold-line` variant for "investor-grade" sections
- `.reos-chip`, `.reos-stat`, `.reos-kpi` standardized (Bloomberg-style mono numerals via existing Geist Mono token)
- Header (`ReosShell` + `GlobalHeader`):
  - Sticky, `backdrop-blur-xl bg-card/80 border-b border-border`
  - Soft shadow `--shadow-luxe`
  - Fixed height: desktop 64px, mobile 56px
  - Body `scroll-padding-top` + main `pt-[var(--header-h)]` to fix overlap

No per-page styling allowed — pages stop hardcoding card classes and use the shared primitives.

---

## Phase 3 — Mobile Navigation + Pull-to-Refresh

Mobile = viewport < 768px.

Bottom Tab Bar (fixed, 56px, safe-area inset):
- Home · Properties · Investment · AI · Profile
- Active tab uses `--primary` gold underline + filled icon
- Hides on keyboard open

Slide-out Drawer (hamburger, right side):
- Properties, Finance, Legal, Management, Vendor, Settings, Support
- Glassmorphism, gold hairline section dividers

Pull-to-refresh:
- New `usePullToRefresh` hook + `<PullToRefresh>` wrapper
- Mounted on the main scroll container of: Home, Properties, Investment, AI, Profile (mobile only)
- Threshold 70px, gold spinner, haptic tick on trigger
- Calls each page's existing query invalidation (React Query `refetchQueries`) — no business logic change

Header on mobile: Logo left · Search icon · Notification · Hamburger.

---

## Phase 4 — Responsive Layout Pass

Audit + fix breakpoints 320 / 375 / 390 / 414 / 768 / 820 / 1024 / 1280 / 1440 / 1920.

- Property/listing grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Hero heights: mobile 380px · tablet 500px · desktop 640px; AI search bar pinned above the fold
- Tables → mobile card view via shared `<ResponsiveTable>` (cards <md, table ≥md) OR horizontal-scroll container with edge-fade
- Charts: wrap Recharts in `<ResponsiveContainer>`, mobile legend → bottom, tick font 10px
- Maps: full-width, `touch-action: pan-x pan-y`, larger zoom controls
- Forms: 44px tap targets, stacked labels on mobile, autofill-friendly inputs
- Sweep for `overflow-x`, fixed widths, `whitespace-nowrap` on long strings

Per-page sweep (one PR-style commit per page, reviewable):
Home → Properties → Buy/Sell/Rent → Projects → Investment → Finance → Legal → Management → Vendors → AI Center → Dashboard → Profile → Settings.

---

## Phase 5 — Performance + PWA Polish

- Lazy-load below-the-fold sections via existing `lazyComponents` util
- Image: `loading="lazy"`, `decoding="async"`, `sizes` attr, AVIF/WebP via existing pipeline; preload only the LCP hero
- Virtualize long lists (`@tanstack/react-virtual`) on Properties, Vendors, AI feed
- Memoize heavy cards; split route bundles already handled by Vite — verify no eager imports leak
- PWA: improve install prompt copy, splash, theme-color updated to `#F7F5F0` light / `#0B0B0B` dark
- Lighthouse target mobile: LCP < 2.5s, CLS < 0.05, INP < 200ms

---

## Technical Notes

- All color values land as CSS variables; no hex literals in components
- `ReosShell` and `GlobalHeader` consolidated to one header component to kill the dual-footer / dual-header class of bugs
- Pull-to-refresh uses pointer events (works in Safari iOS, Chrome Android, Samsung Internet); disabled when `scrollTop > 0` or reduced-motion is set
- Dark mode tokens, business logic, data fetching, RLS, edge functions: **untouched**
- Each phase ends with a browser preview check at 375px and 1440px

---

## Deliverable Order

1. Phase 1 — tokens (1 file: `src/index.css`)
2. Phase 2 — shared surface primitives + header consolidation
3. Phase 3 — bottom nav + drawer + pull-to-refresh
4. Phase 4 — per-page responsive sweep
5. Phase 5 — perf + PWA polish

Reply "approve" or call out phases to drop/reorder, and I'll start Phase 1.
