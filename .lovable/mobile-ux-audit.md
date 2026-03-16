# ASTRAVILLA Mobile UX Audit & Conversion Optimization Plan
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

Audited mobile touch surfaces, conversion flows, card density, and accessibility across the ASTRAVILLA property marketplace. Identified 12 issues across 4 severity tiers and implemented P0 fixes.

---

## Audit Findings

### P0 — Critical (Fixed)

| # | Issue | Location | Fix Applied |
|---|-------|----------|-------------|
| 1 | **No WhatsApp CTA on mobile property detail** — primary conversion action missing | `MobilePropertyDetail.tsx` | Added WhatsApp + Call Agent split CTA bar |
| 2 | **Bottom CTA overlapping navigation** — `bottom-[80px]` misaligned with 64px nav + safe-area | `MobilePropertyDetail.tsx` | Changed to `bottom-[72px]`, removed redundant safe-area padding |
| 3 | **WhatsApp button below 36px min tap target** — `h-8` (32px) on mobile | `PropertyGridView.tsx` | Increased to `h-9` (36px) on mobile with `min-h-[36px]` |
| 4 | **AI Ask button too small for thumb zone** — no min-size constraint | `MobilePropertyDetail.tsx` | Added `min-w-[44px] min-h-[44px]` per WCAG 2.5.5 |

### P1 — High Priority (Remaining)

| # | Issue | Recommendation |
|---|-------|----------------|
| 5 | **MobileHomeFeed lacks sticky conversion CTA** — users must tap into detail to contact | Add floating "Contact" FAB or sticky bottom bar on feed cards |
| 6 | **No quick-filter chip row on mobile search** — users must open full filter drawer | Add horizontal scrollable chip row (Sale/Rent, Price ranges, Bedrooms) above results |
| 7 | **PropertyDetail.tsx (desktop) has no mobile CTA optimization** — 1568-line component serves both viewports | Add responsive sticky bottom CTA bar that appears only on mobile (`md:hidden`) |
| 8 | **Image carousel swipe affordance missing** — no pagination dots or swipe hint on MobilePropertyDetail hero | Add dot indicators and subtle swipe hint animation |

### P2 — Medium Priority

| # | Issue | Recommendation |
|---|-------|----------------|
| 9 | **Card spacing rhythm inconsistent** — `gap-4 sm:gap-5` creates tight mobile feel | Standardize to `gap-4` on mobile with `py-1` breathing room between sections |
| 10 | **Description text `text-xs` too small for extended reading** — MobilePropertyDetail | Increase to `text-sm leading-relaxed` for description blocks |
| 11 | **No skeleton loading on MobilePropertyDetail investment card** — jumps in when loaded | Add skeleton placeholder matching investment card dimensions |
| 12 | **CollapsibleSearchPanelMobile transition on scroll** — `transition-all` on container may cause jank on mid-range devices | Scope transition to `transition-[box-shadow,border-color]` only |

### P3 — Low Priority / Enhancement

| # | Recommendation |
|---|----------------|
| 13 | Add `prefers-reduced-motion` media query to disable `hover:scale-105` image transforms |
| 14 | Implement scroll position memory for search results (save `scrollY` in sessionStorage) |
| 15 | Add haptic feedback hint via `navigator.vibrate(10)` on card tap for supported devices |

---

## Thumb-Zone Analysis

```
┌─────────────────────────┐
│    HARD TO REACH        │ ← Status bar, back button (OK: display-only)
│                         │
│    COMFORTABLE          │ ← Scrollable content, cards
│                         │
│    NATURAL THUMB ZONE   │ ← Bottom CTA bar ✅ (fixed)
│ [AI] [WhatsApp] [Call]  │   Bottom nav ✅
└─────────────────────────┘
```

**Current compliance:** Primary conversion CTAs now in natural thumb zone ✅

---

## Mobile Conversion Funnel Optimization

### Current Flow (Before)
1. Browse feed → Tap card → View detail → Scroll to bottom → Single "Contact Agent" button
- **Drop-off risk:** 2 conversion actions competing, no WhatsApp

### Optimized Flow (After)
1. Browse feed → Tap card → **Sticky bottom bar immediately visible** → WhatsApp / Call / AI
- **Improvement:** 3 clear conversion paths, WhatsApp as primary green CTA

---

## Design Token Compliance

All changes use semantic tokens:
- `bg-accent` / `text-accent-foreground` for WhatsApp CTA
- `bg-primary` / `text-primary-foreground` for Call CTA  
- `bg-muted` / `border-border` for secondary actions
- No hardcoded colors in components

---

## Implementation Priorities (Next Sprint)

1. **Quick filter chips** on mobile search (P1 #6)
2. **Mobile-responsive CTA bar** on desktop PropertyDetail (P1 #7)
3. **Image carousel dots** on MobilePropertyDetail (P1 #8)
4. **Skeleton loading** for investment intelligence card (P2 #11)
