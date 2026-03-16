# ASTRAVILLA Mobile Design System Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

The platform has **two parallel mobile CSS systems** (`mobile-optimizations.css` at 513 lines and `mobile-first-responsive.css` at 743 lines) that **duplicate** touch targets, typography scales, grid systems, and button sizing — creating maintenance risk and specificity conflicts. The `.touch-target` class is defined in both files with different padding values. Despite this duplication, the foundational tokens are solid: 44px minimum touch targets, safe-area inset support, and iOS zoom prevention. The primary gap is that **actual components rarely use these mobile utilities**, relying instead on Tailwind responsive prefixes (`sm:`, `md:`) with inconsistent mobile-first values.

---

## 1. Mobile Typography Scale

### Current State
Two competing type scales exist:

| File | Class | Mobile | Tablet | Desktop |
|------|-------|--------|--------|---------|
| `mobile-optimizations.css` | `.text-mobile-xs` | 12px | — | — |
| `mobile-optimizations.css` | `.text-mobile-sm` | 14px | — | — |
| `mobile-first-responsive.css` | `.text-mobile-h1` | 28px | 36px | 48px |
| `mobile-first-responsive.css` | `.text-mobile-h2` | 24px | 30px | 36px |
| `mobile-first-responsive.css` | `.text-mobile-h3` | 20px | 24px | 30px |

**Actual component usage:** Components use Tailwind (`text-sm sm:text-base`, `text-lg sm:text-xl`) — neither mobile utility system is adopted.

### Recommended Canonical Scale

| Role | Mobile | Desktop | Tailwind Pattern |
|------|--------|---------|-----------------|
| Hero H1 | `text-2xl` (24px) | `md:text-5xl` (48px) | Already in use ✅ |
| Section H2 | `text-xl` (20px) | `md:text-3xl` (30px) | Standardize |
| Card Title | `text-sm` (14px) | `sm:text-base` (16px) | Already in use ✅ |
| Price | `text-lg` (18px) | `sm:text-xl` (20px) | Already in use ✅ |
| Metadata | `text-xs` (12px) | `sm:text-sm` (14px) | Already in use ✅ |
| Micro Label | `text-[10px]` (10px) | Same | Per platform constraint ✅ |

**Action:** The Tailwind responsive pattern is the actual system — the CSS utility classes are unused overhead.

---

## 2. Mobile Spacing Rhythm

### Current Issues
- Container padding: `0.5rem` in one file, `1rem` in the other
- Card grid gap: `0.75rem` (optimizations) vs `1rem` (responsive) 
- Section vertical spacing: Uniformly `mb-6` per platform constraint

### Recommended Tokens

| Context | Value | Tailwind |
|---------|-------|----------|
| Screen edge padding | 16px | `px-4` |
| Card grid gap | 16px mobile, 20px desktop | `gap-4 sm:gap-5` |
| Section vertical spacing | 24px | `mb-6` (per constraint) |
| Card internal padding | 12px mobile, 16px desktop | `p-3 sm:p-4` ✅ |
| Inline element gap | 6px | `gap-1.5` |

---

## 3. Tap Target Compliance

### Current Button Sizes

| Size | Height | Meets 44px? |
|------|--------|-------------|
| `default` | `h-10` (40px) | ❌ 4px short |
| `sm` | `h-8` (32px) | ❌ 12px short |
| `lg` | `h-12` (48px) | ✅ |
| `icon` | `h-10 w-10` (40px) | ❌ 4px short |
| `icon-sm` | `h-8 w-8` (32px) | ❌ 12px short |

### P0 Fix
The default button height should be `h-11` (44px) on mobile. The `sm` size is acceptable for desktop-only contexts but needs a mobile override.

---

## 4. Mobile Navigation

### Current Architecture
- Fixed header: `h-12 md:h-13 lg:h-14` ✅
- Bottom nav: 72px height (per mobile experience memory) ✅
- Sticky conversion bars: 72px clearance ✅
- No floating quick-action button on homepage

### Recommendation
- Current bottom nav + sticky header system is solid
- Add `pb-[72px]` to main content containers to prevent bottom nav overlap
- Consider floating AI chat trigger as the single FAB (already exists via `ResponsiveAIChatWidget`)

---

## 5. Card Stacking & Grid

### Current
- PropertyCard uses `aspect-[4/3]` image ratio ✅
- Grid: 1 column mobile, 2 tablet, 3-4 desktop ✅
- No card height normalization — varying content causes ragged grids

### Recommendation
- Keep `aspect-[4/3]` — optimal for property imagery
- Normalize card height by constraining optional sections (VR button, agent row, rating) to detail modal
- Mobile: single column with full-width cards reduces cognitive load

---

## 6. Duplicate CSS System Issue (P0)

**Finding:** Two 500+ line CSS files define overlapping mobile systems that actual components don't use. This is ~1200 lines of dead/conflicting CSS.

### Consolidation Plan
1. Audit which `.text-mobile-*`, `.btn-mobile`, `.card-mobile`, `.touch-target` classes are actually referenced in components
2. Keep only classes with >0 usage
3. Migrate remaining rules to Tailwind utilities or component-level styles
4. Target: reduce combined 1256 lines → ~200 lines of genuinely unique utilities (safe-area, viewport height, scroll containment)

---

## Implementation Priorities

### Sprint 1 — Applied
- ✅ Upgraded default button to `h-11` (44px) for mobile tap target compliance
- ✅ Upgraded icon button to `h-11 w-11` for tap target compliance
- ✅ Documented mobile CSS duplication for future consolidation

### Sprint 2 — Recommended
- Audit and remove unused mobile utility classes from both CSS files
- Standardize section heading scale to `text-xl md:text-3xl`
- Add `pb-[72px]` to homepage content container for bottom nav clearance

### Sprint 3 — Recommended
- Consolidate `mobile-optimizations.css` + `mobile-first-responsive.css` into single `mobile-system.css` (~200 lines)
- Normalize PropertyCard height by moving optional sections to detail modal
- Implement `prefers-reduced-motion` for all card hover animations on mobile
