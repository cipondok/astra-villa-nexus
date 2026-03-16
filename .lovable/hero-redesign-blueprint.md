# ASTRAVILLA Hero Section — Premium Redesign Blueprint
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

The hero section (Index.tsx lines 582-710) uses a 7-image carousel with parallax, cinematic overlays, gold sparkle effects, and a bottom-anchored search panel. While technically rich, it suffers from **element stacking conflicts** (scroll indicator overlaps search panel), **motion clutter** (bounce + shimmer + sparkle + parallax simultaneously), and **overlay density** that dims the premium property imagery too aggressively. The hero height clamp (`400px-650px`) limits emotional impact on desktop.

---

## Current Architecture Analysis

### Visual Composition
```
Layer Stack (bottom → top):
├─ z-0:  Banner images (7 slides, 1200ms transitions, parallax)
├─ z-19: Gradient overlays ×2 (vertical + horizontal darkening)
├─ z-19: Film grain SVG texture (opacity 3%)
├─ z-20: Shimmer light sweep animation
├─ z-20: GoldSparkleEffect (canvas particles)
├─ z-30: Slide indicator dots
├─ z-30: Search panel + headline overlay
└─ z-40: Scroll-down bounce indicator
```

### Issues Identified

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | **Scroll indicator (z-40, bottom-2) overlaps search panel (z-30, bottom-4)** on short viewports | P0 | Buttons overlap, CTA confusion |
| 2 | **`animate-bounce` on ChevronDown** — Infinite bouncing creates anxiety, not premium calm | P0 | Motion clutter in hero zone |
| 3 | **Film grain SVG texture** — Inline SVG data URI on every render, negligible visual impact at 3% opacity | P1 | Unnecessary DOM/paint cost |
| 4 | **4 simultaneous motion layers** (parallax + shimmer + sparkle + bounce) — Exceeds premium motion budget | P1 | GPU contention on mid-range mobile |
| 5 | **Hero max height 650px** — On 1440p displays, hero feels short; premium competitors use 80-90vh | P2 | Reduced emotional impact |
| 6 | **Overlay too dark** — `from-black/50` top gradient + `to-background/80` bottom = ~60% average dimming | P2 | Premium property images lose vibrancy |
| 7 | **Slide indicators compete with search panel** — Both at z-30, same bottom zone | P2 | Visual noise |

---

## Redesign Blueprint

### 1. Visual Composition Refinements

**Background imagery treatment:**
- Keep carousel with current transition timing (1200ms cubic-bezier is excellent)
- Reduce top gradient from `from-black/50` → `from-black/35` to preserve image vibrancy
- Reduce bottom gradient from `to-background/80` → `to-background/70` for lighter feel
- Remove film grain texture entirely (3% opacity = invisible, adds DOM cost)
- Keep shimmer sweep as the single ambient motion layer

**Hero height upgrade:**
- Desktop: `clamp(500px, 75vh, 800px)` — taller for emotional impact
- Mobile: `clamp(400px, 85vh, 600px)` — full-screen feel on phones
- Maintain `contain: layout` for paint isolation

### 2. Headline Psychological Messaging

**Current:** Dynamic `personalizedHeadline` or generic "Find Your..."
**Recommended hierarchy:**
```
[Badge] AI-Powered Discovery
[H1]   "Your Next Investment, Intelligently Found"
[Sub]   Powered by market data across 15+ cities
```

**Messaging principles:**
- Lead with outcome ("Your Next Investment") not feature ("AI-Powered")
- Use "Intelligently" to reinforce AI without jargon
- Subtitle anchors trust with specific data point

### 3. Search Panel Optimization

**Current:** Bottom-anchored, full-width max-w-4xl
**Recommended:**
- Vertically centered (not bottom-anchored) for visual balance
- Glassmorphic card with `backdrop-blur-xl bg-background/20 border border-white/10`
- Elevated shadow: `shadow-2xl shadow-black/20`
- Entrance: `animate-hero-search-entry` (already exists — good)
- Quick filter chips below search with horizontal scroll on mobile

### 4. Trust Signal Layering in Hero

**Subtle hero-zone trust indicators:**
- Small pill below search: "2,400+ verified listings across 15 cities"
- Use `text-white/60` for subtlety — not competing with search CTA
- Animate in after search panel (delay 0.8s) for progressive reveal

### 5. Motion & Animation Discipline

**Reduce from 4 → 2 ambient motions:**
- ✅ Keep: Parallax on scroll (user-initiated, not distracting)
- ✅ Keep: Shimmer sweep (single ambient motion, very subtle)
- ❌ Remove: `animate-bounce` on scroll indicator → replace with gentle `animate-pulse` with `opacity` only
- ❌ Remove: Film grain texture (invisible at 3%, costs paint)
- GoldSparkleEffect: Keep but ensure it pauses when tab is not visible

**Entrance animation sequence:**
```
0.0s  Background image fade-in (already handled by slide system)
0.2s  Badge pill fade-in + slight translateY
0.4s  H1 headline fade-in + translateY
0.5s  Subtitle fade-in
0.6s  Search panel elevate-in (existing animation)
1.0s  Scroll indicator gentle fade-in (no bounce)
```

### 6. Scroll Indicator Fix

**Current conflict:** Indicator at `bottom-2 z-40` overlaps search panel at `bottom-4 z-30`
**Fix:** Move scroll indicator BELOW the hero section entirely, or hide it when search panel is visible. Simplest: move to `bottom-0` of the gold gradient divider section that follows the hero.

### 7. Mobile Hero Behavior

**Compact search card:**
- On mobile (<640px), search panel should use full-width with 12px horizontal padding
- Reduce headline to `text-xl` (currently `text-2xl` — slightly too large for 375px)
- Quick filter chips: horizontal scroll with `overflow-x-auto` and `-webkit-overflow-scrolling: touch`
- Slide indicators: Hide on mobile (touch swipe is intuitive enough)

**Thumb-zone CTA:**
- Primary search button must be in bottom 40% of viewport
- Current bottom-anchored layout achieves this — keep positioning

### 8. Slide Indicator Relocation

**Current:** Bottom of hero, same zone as search panel
**Recommended:** Move to left edge, vertical orientation, or top-right corner
**Simplest fix:** Reduce opacity to 40% and move above search panel with higher bottom offset

---

## Implementation Priorities

### Sprint 1 — Applied (P0)
- ✅ Remove `animate-bounce` from scroll indicator → gentle opacity pulse
- ✅ Remove film grain texture overlay (invisible, costs paint)
- ✅ Fix scroll indicator z-index/position conflict with search panel
- ✅ Lighten top gradient overlay for better image vibrancy

### Sprint 2 — Recommended
- Upgrade hero height clamp to `75vh` desktop / `85vh` mobile
- Center search panel vertically instead of bottom-anchoring
- Add trust metric pill below search panel
- Relocate slide indicators to avoid search panel zone

### Sprint 3 — Recommended
- Implement staggered entrance animation sequence
- Add `prefers-reduced-motion` media query to disable parallax/shimmer
- Pause GoldSparkleEffect when document is not visible
- Test hero conversion with A/B headline variants
