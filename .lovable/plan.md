

# Property Display Card Update -- Sizing, Elements, and Light/Dark Mode Colors

## Overview

Update all 4 property card components displayed on the main page to have consistent, well-sized elements with proper color combinations for both light and dark modes.

## Components to Update

1. **PropertiesForSaleSection** -- already mostly fixed, minor tweaks needed
2. **PropertiesForRentSection** -- has major light mode issues (same problems Sale had before)
3. **CompactPropertyCard** -- used by PropertySlideSection, has light mode broken overlays
4. **ASTRAVillaPropertyCard** -- used by SimilarProperties, needs sizing improvements

---

## File 1: `src/components/property/PropertiesForRentSection.tsx`

This file has all the same light-mode problems that were just fixed in the Sale section. Apply identical fixes:

### Changes:
- **Line 107**: Section header icon -- replace `text-primary-foreground` with `text-white` (icon on gradient bg is fine)
- **Line 121**: Card container -- replace complex `border-border/30 dark:border-border/15 bg-card/60 dark:bg-card/5` with clean `border-border bg-card`. Remove `before:` pseudo-element gradient overlay
- **Line 137**: "RENT" badge -- replace `bg-gradient-to-r from-chart-4 to-primary text-primary-foreground` with `bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md`. Add `Key` icon. Change text to "Disewa"
- **Line 141**: Property type badge -- replace `bg-background/20 text-primary-foreground border-background/30` with `bg-black/40 backdrop-blur-md text-white`
- **Line 149**: Image count badge -- replace `bg-background/15 text-primary-foreground border-background/25` with `bg-black/40 backdrop-blur-md text-white`
- **Line 164**: Hover eye icon -- replace `bg-card/80 ring-primary/50 text-primary` with `bg-primary/90 backdrop-blur-sm text-white shadow-lg`
- **Line 173**: Price container -- simplify from gradient to `bg-primary/5 border border-primary/15`
- **Line 174**: Price text -- change from gradient clip-text to solid `text-primary font-black`
- **Line 178**: /bln label -- simplify to `text-muted-foreground font-bold`
- **Line 187**: Location -- remove gradient background, use plain `text-muted-foreground`
- **Line 193-213**: Specs -- remove colorful gradient containers (accent, chart-4, gold-primary), use clean `text-muted-foreground` with `text-foreground/80` values
- **Line 182**: Title -- increase from `text-[11px]` to `text-xs`
- **Line 189**: Location text -- increase from `text-[10px]` to `text-[11px]`
- **Line 197/204/211**: Spec values -- increase from `text-[10px]` to `text-[11px]`

---

## File 2: `src/components/property/CompactPropertyCard.tsx`

This card has several light-mode-broken overlay elements:

### Changes:
- **Line 199**: Card container -- replace `border-gold-primary/15 bg-card/60` with `border-border bg-card`. Remove `before:` pseudo-element
- **Line 216**: Similarity badge -- replace `bg-gold-primary/80 text-background` with `bg-black/60 backdrop-blur-md text-white`
- **Line 221**: Listing type badge -- replace `bg-gold-primary text-background` with gradient style: sale = `from-emerald-500 to-green-600 text-white`, rent = `from-sky-500 to-blue-600 text-white`
- **Line 225**: Property type badge -- replace `bg-background/20 text-primary-foreground border-primary-foreground/30` with `bg-black/40 backdrop-blur-md text-white border-white/20`
- **Lines 237, 249, 258, 267**: Action buttons on image -- replace `bg-background/80 text-muted-foreground` with `bg-black/30 backdrop-blur-md text-white border border-white/20`
- **Lines 279-287**: Price badge -- replace `bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background` with `bg-black/60 backdrop-blur-md text-white border border-white/20`
- **Line 281**: Price text size -- keep `text-sm sm:text-base md:text-lg`, use `text-white font-black`
- **Line 301**: Title on image -- replace `text-primary-foreground` with `text-white`
- **Lines 308-332**: Spec badges on image -- replace `bg-gold-primary/30 text-primary-foreground` with `bg-black/30 backdrop-blur-md text-white border border-white/20`
- **Line 337-338**: Location on image -- replace `text-primary-foreground/80` with `text-white/90`
- **Line 360**: Posted by container -- replace `bg-gold-primary/5 border-gold-primary/10` with `bg-muted/50 border-border/50`
- **Line 368**: Avatar fallback -- replace `from-gold-primary to-gold-primary/60 text-background` with `bg-primary/10 text-primary`
- **Lines 394-396**: Star rating -- replace `fill-gold-primary text-gold-primary` with `fill-chart-3 text-chart-3`
- **Line 430**: View button -- replace `from-gold-primary to-gold-primary/80 text-background shadow-gold-primary/20` with `bg-primary text-primary-foreground shadow-primary/20`

---

## File 3: `src/components/property/ASTRAVillaPropertyCard.tsx`

Mostly good, needs sizing improvements:

### Changes:
- **Line 136**: Listing badge text -- increase from `text-[9px]` to `text-[10px]`
- **Line 144**: Property type badge text -- increase from `text-[9px]` to `text-[10px]`
- **Line 167**: Image count text -- increase from `text-[9px]` to `text-[10px]`
- **Line 191**: Price text -- increase from `text-base` to `text-sm sm:text-base`
- **Line 195**: Price suffix -- increase from `text-[11px]` to `text-xs`
- **Line 200-203**: Monthly estimate -- increase from `text-[9px]` to `text-[10px]`
- **Line 210**: Title -- increase from `text-[11px]` to `text-xs`
- **Line 217**: Location text -- increase from `text-[10px]` to `text-[11px]`
- **Lines 225, 232, 239, 245**: Spec values -- increase from `text-[10px]` to `text-[11px]`
- **Line 226, 233**: Spec labels (KT, KM) -- increase from `text-[8px]` to `text-[9px]`

---

## File 4: `src/components/property/PropertiesForSaleSection.tsx`

Already updated, just one minor fix:

### Changes:
- **Line 115**: Section header icon -- the `text-primary-foreground` on gradient bg is fine since it's on a dark gradient, but for consistency ensure it uses `text-white`

---

## Summary of Design Principles Applied

| Element | Style |
|---------|-------|
| Image overlay badges | `bg-black/40 backdrop-blur-md text-white` |
| Sale badge | `bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md` |
| Rent badge | `bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md` |
| Heart/action buttons on image | `bg-black/30 backdrop-blur-md text-white border-white/20` |
| Hover eye | `bg-primary/90 backdrop-blur-sm text-white shadow-lg` |
| Card container | `border-border bg-card` (clean, no pseudo-elements) |
| Price text | Solid `text-primary font-black` (no gradient clip-text) |
| Price container | `bg-primary/5 border-primary/15` |
| Specs | Clean `text-muted-foreground` icons + `text-foreground/80` values |
| Min font sizes | Title: `text-xs`, Location: `text-[11px]`, Specs: `text-[11px]`, Labels: `text-[9px]` |

