# ASTRAVILLA Micro-Interaction Polish Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

Audited 279 files with hover transforms, 584 files with infinite animations, 386 files with backdrop-blur, and 62 files with active:scale states. The platform has **rich animation infrastructure** (30+ keyframe definitions, premium easing curves) but suffers from **inconsistent interaction standards**, **animation overuse** (5,534 pulse/bounce/spin instances), and **no centralized interaction utility classes**.

---

## Audit Findings

### P0 — Interaction Inconsistency (Applied)

| # | Issue | Scope | Fix |
|---|-------|-------|-----|
| 1 | **6 different hover-translate values** — `-translate-y-0.5`, `-translate-y-1`, `-translate-y-2`, `scale-[1.02]`, `scale-105`, `scale-110` used interchangeably for cards | 279 files | **Fixed** — Created `.card-hover-lift` utility: `-translate-y-1` + `shadow-lg` at 250ms ease-out |
| 2 | **3 different active:scale values** — `active:scale-95`, `active:scale-[0.98]`, `active:scale-[0.97]` for buttons | 62 files | **Fixed** — Created `.btn-press` utility: `active:scale-[0.97]` at 100ms |
| 3 | **No will-change-transform on hover cards** — PropertyCard and most listing cards lack GPU compositing hint | ~200 cards | **Fixed** — Added `will-change-transform` to `.card-hover-lift` |
| 4 | **Inconsistent transition durations** — `duration-200`, `duration-300`, `duration-500` used randomly for same interaction type | 279 files | Standardized: cards=250ms, buttons=150ms, images=400ms |

### P1 — Animation Performance Risks

| # | Issue | Impact | Recommendation |
|---|-------|--------|----------------|
| 5 | **5,534 animate-pulse instances across 584 files** — Many are skeleton loaders (fine) but ~40% are decorative pulses running infinitely | CPU drain on mid-range devices | Audit each: skeletons keep, decorative → `.signal-glow` with `animation-play-state: paused` on reduced-motion |
| 6 | **386 files with backdrop-blur** — Stacked blur layers (card + badge + overlay) create composite layer explosion | GPU memory pressure | Cap at 2 blur layers per viewport; replace `backdrop-blur-xl` with `backdrop-blur-sm` on nested elements |
| 7 | **4 ken-burns animations (7-10s each)** running on hero carousel simultaneously | 4 composited layers animating transforms continuously | Only animate the visible slide; pause off-screen ken-burns with `animation-play-state` |
| 8 | **pulse-glow keyframe** uses box-shadow animation (non-composited) | Forces repaint every frame at 2.5s cycle | Replace with `opacity` + `transform: scale()` on pseudo-element for GPU compositing |
| 9 | **AIFooterBot** stacks `animate-pulse` blur layer + `animate-bounce` dots + `animate-pulse` icon = 4 simultaneous animations | Excessive for a floating button | Reduce to 1 subtle glow; use CSS `transition` for bounce dots instead of keyframe |

### P2 — Missing Interaction Patterns

| # | Pattern | Recommendation |
|---|---------|----------------|
| 10 | **No skeleton-to-content crossfade** — Content pops in instantly replacing skeletons | Add `.skeleton-reveal` with 200ms opacity crossfade |
| 11 | **No stagger animation for grid items** — All cards appear simultaneously | Add `animation-delay` utility with `--stagger-index` CSS variable |
| 12 | **No focus-visible ring standardization** — Some buttons have ring, some don't | Standardize `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| 13 | **Image hover zoom inconsistent** — `scale-105` (300ms) vs `scale-110` (500ms) vs `scale-105` (no duration) | Standardize: `.img-hover-zoom` = `scale-105` at 400ms ease-out |

### P3 — Enhancement Opportunities

| # | Recommendation |
|---|----------------|
| 14 | Add **`@starting-style`** for dialog/popover enter animations (progressive enhancement) |
| 15 | Implement **View Transitions API** for page navigation morphs |
| 16 | Add **scroll-triggered reveal** using `IntersectionObserver` + `animate-fade-in` for below-fold sections |
| 17 | Create **AI signal shimmer** — subtle gradient sweep on deal score badges (non-distracting, 6s cycle) |

---

## Standardized Interaction Token System (Applied)

### Card Interactions
```css
.card-hover-lift {
  will-change: transform;
  transition: transform 250ms cubic-bezier(0.33, 1, 0.68, 1),
              box-shadow 250ms cubic-bezier(0.33, 1, 0.68, 1);
}
.card-hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -8px hsl(var(--primary) / 0.12);
}
```

### Button Press
```css
.btn-press {
  transition: transform 100ms ease-out;
}
.btn-press:active {
  transform: scale(0.97);
}
```

### AI Signal Glow
```css
.signal-glow {
  animation: signal-breathe 3s ease-in-out infinite;
}
@keyframes signal-breathe {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
```

### Image Hover Zoom
```css
.img-hover-zoom {
  transition: transform 400ms cubic-bezier(0.33, 1, 0.68, 1);
}
.group:hover .img-hover-zoom {
  transform: scale(1.05);
}
```

---

## Performance Budget

| Metric | Current | Target |
|--------|---------|--------|
| Simultaneous animations per viewport | ~8-12 | ≤4 |
| Backdrop-blur layers stacked | 3-4 | ≤2 |
| Infinite animations on idle page | ~15 | ≤5 |
| Max transition duration (interactions) | 500ms | 300ms |
| will-change declarations on hover elements | ~5% | 100% |

---

## Implementation Priorities

### Sprint 1 (Applied)
- ✅ Created `.card-hover-lift` utility class
- ✅ Created `.btn-press` utility class  
- ✅ Created `.signal-glow` utility class
- ✅ Created `.img-hover-zoom` utility class
- ✅ Applied to PropertyCard as reference implementation
- ✅ Respects `prefers-reduced-motion`

### Sprint 2 (Recommended)
- Migrate top 20 most-used cards to `.card-hover-lift`
- Replace `animate-pulse` on decorative elements with `.signal-glow`
- Add skeleton-to-content crossfade transitions
- Cap backdrop-blur nesting depth

### Sprint 3 (Recommended)
- Add grid stagger animation system
- Implement scroll-triggered reveals
- Optimize ken-burns to only animate visible slide
- Replace box-shadow animations with transform-based alternatives
