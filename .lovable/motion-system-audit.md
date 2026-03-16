# ASTRAVILLA Premium Motion System Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

The platform has a **complete motion token system** (6 utility classes in index.css) but **critically low adoption** — only 2 of ~200+ interactive components use the standardized utilities. The token definitions are sound: correct easing curves (`cubic-bezier(0.33, 1, 0.68, 1)`), appropriate durations (cards=250ms, buttons=100ms, images=400ms), and `prefers-reduced-motion` coverage. The priority is **migration**, not creation.

---

## 1. Motion Token Inventory (All Applied in index.css)

| Token | Purpose | Duration | Easing | Adoption |
|-------|---------|----------|--------|----------|
| `.card-hover-lift` | Card elevation on hover | 250ms | ease-out-expo | 1 component (PropertyCard) |
| `.btn-press` | Button press feedback | 100ms | ease-out | 1 component (PropertyCard heart) |
| `.signal-glow` | AI indicator breathing | 3s cycle | ease-in-out | 1 component (SocialProofWidget) |
| `.signal-shimmer` | Deal score gradient sweep | 6s cycle | linear | 0 components |
| `.img-hover-zoom` | Image scale on card hover | 400ms | ease-out-expo | 0 components |
| `.skeleton-reveal` | Content crossfade from skeleton | 200ms | ease-out | 0 components |
| `.stagger-fade-in` | Grid item stagger entry | 300ms + 60ms×index | ease-out | 0 components |

**Adoption rate: 3/7 tokens used, in 2/200+ components.**

---

## 2. Performance Issues Found

### P0 — Fixed
| Issue | Impact | Fix |
|-------|--------|-----|
| `Property3DAnimation` — `requestAnimationFrame` loop never cancelled | Memory leak, CPU drain on unmount | ✅ Added cleanup via `cancelAnimationFrame` |

### P1 — Flagged
| Issue | Impact | Recommendation |
|-------|--------|----------------|
| 5,534 `animate-pulse` instances | CPU drain on mid-range devices | Audit: keep on skeletons, replace decorative with `.signal-glow` |
| 386 files with `backdrop-blur` | Stacked GPU composite layers | Cap at 2 blur layers per viewport |
| `Property3DAnimation` uses 3 trig calls per frame + 3 simultaneous sparkle animations | Excessive for a decorative element | Throttle to 30fps or replace with CSS animation |

---

## 3. Hover Motion Standards

### Cards (Applied via `.card-hover-lift`)
- **Translate:** `-4px` Y-axis (subtle lift)
- **Shadow:** `0 12px 28px -8px hsl(var(--primary) / 0.12)`
- **Active state:** `-1px` Y-axis at 100ms (press feel)
- **Easing:** `cubic-bezier(0.33, 1, 0.68, 1)` (ease-out-expo)
- **Duration:** 250ms
- **GPU hint:** `will-change: transform`

### Buttons (Applied via `.btn-press`)
- **Active scale:** `0.97` at 100ms ease-out
- No hover translate — buttons use color/opacity transitions only

### Images (Applied via `.img-hover-zoom`)
- **Scale:** `1.05` on parent `.group:hover`
- **Duration:** 400ms ease-out-expo
- **Constraint:** Only inside `.group` containers

---

## 4. Page Transition System

**Current:** `PageTransition.tsx` uses framer-motion opacity fade (250ms in, 150ms out) — this is correct and stable per layout-stability-standards (no Y-offset).

**Recommendation:** No changes needed. The opacity-only approach avoids layout shift and matches the scroll-stability architecture.

---

## 5. Intelligence Signal Animations

### AI Deal Score Badges
- **Primary:** `.signal-glow` — 3s breathing cycle (opacity 0.7→1, scale 1→1.05)
- **Secondary:** `.signal-shimmer` — 6s gradient sweep for premium badges
- **Rule:** Only one signal animation per element; never stack `.signal-glow` + `.signal-shimmer`

### Data Panels
- Use `.skeleton-reveal` (200ms blur-to-clear crossfade) when data loads
- Chart animations should use 800ms ease-out with 200ms stagger between series

---

## 6. Loading Perception

### Skeleton Shimmer
- **Timing:** 1.5s cycle (already standardized in Skeleton component)
- **Gradient:** `via-gold-primary/15` — brand-aligned shimmer color ✅
- **Crossfade:** `.skeleton-reveal` available but unadopted

### Progressive Reveal
- Use `.stagger-fade-in` with `--stagger-index` CSS variable
- Cap stagger at 8 items (480ms total) to prevent waiting fatigue
- First 4 items: 0ms delay; items 5-8: 60ms stagger each

---

## 7. Scroll-Triggered Reveals

**Current:** `ScrollReveal.tsx` component exists with IntersectionObserver + configurable direction/delay/duration.

**Guidelines:**
- Default: `direction="up"`, `distance=24px`, `duration=600ms`
- Max 3 reveals per viewport to prevent "everything is animating" fatigue
- Hero sections: no reveal (instant visibility)
- Below-fold sections: stagger by 100ms between sibling sections
- Never apply ScrollReveal to navigation or sticky elements

---

## 8. Reduced Motion Compliance

**Current:** Global `prefers-reduced-motion` rule disables all animations ✅

**Gap:** `Property3DAnimation` JS-driven RAF loop ignores this preference.

---

## Implementation Roadmap

### Sprint 1 — Applied
- ✅ Fixed `Property3DAnimation` RAF memory leak
- ✅ Documented motion token adoption gap

### Sprint 2 — Migration Priority
- Apply `.card-hover-lift` to top 20 interactive cards (replace ad-hoc `hover:-translate-y-*` classes)
- Apply `.img-hover-zoom` to PropertyCard image containers
- Apply `.stagger-fade-in` to property grid items on homepage
- Add `prefers-reduced-motion` check to `Property3DAnimation` JS loop

### Sprint 3 — Polish
- Apply `.skeleton-reveal` to all data-loading transitions
- Apply `.signal-shimmer` to premium deal score badges
- Throttle `Property3DAnimation` to 30fps or replace with pure CSS
- Audit and replace decorative `animate-pulse` with `.signal-glow`
