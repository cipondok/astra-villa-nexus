

# Update PropertyDetailModal and PropertyDetail Page -- Consistent Color Tokens

## Overview

Replace all `gold-primary` references and fix light-mode-broken color combinations in both the PropertyDetailModal and the PropertyDetail page to match the updated card design system.

## Key Problems

1. **`gold-primary` token used extensively** -- borders, backgrounds, icons, text, and buttons all use `gold-primary` which should be replaced with semantic `primary` tokens
2. **`primary-foreground/5` backgrounds** -- used for sticky headers and card backgrounds, invisible in light mode (white on white)
3. **`text-background` on buttons** -- breaks in light mode; should use `text-primary-foreground`
4. **Star ratings** use `fill-gold-primary text-gold-primary` -- should be `fill-chart-3 text-chart-3`
5. **Image navigation buttons** use `bg-background/60` -- should use `bg-black/40 backdrop-blur-md text-white` for overlay consistency

---

## File 1: `src/components/property/PropertyDetailModal.tsx`

### Changes:

- **Line 124**: Modal container -- replace `shadow-gold-primary/10 border-gold-primary/15` with `shadow-lg border-border`
- **Line 128**: Header border -- replace `border-gold-primary/15` with `border-border`
- **Lines 181, 187**: Image nav buttons -- replace `bg-background/60 text-foreground` with `bg-black/40 backdrop-blur-md text-white`
- **Line 193**: Image counter -- replace `bg-background/60 text-foreground` with `bg-black/40 backdrop-blur-md text-white`
- **Line 216**: Thumbnail active border -- replace `border-gold-primary` with `border-primary`
- **Line 230**: Price text -- replace `text-gold-primary` with `text-primary`
- **Lines 246, 253, 260, 267**: Stats containers -- replace `bg-gold-primary/5 border-gold-primary/10` with `bg-primary/5 border-primary/10` and icon color `text-gold-primary` to `text-primary`
- **Lines 277, 287**: Description/Features containers -- replace `bg-gold-primary/5 border-gold-primary/10` with `bg-muted/30 border-border`
- **Line 293**: Feature items -- replace `bg-card/50 border-border/30` with `bg-muted/30 border-border/50`
- **Line 306**: Contact sidebar -- replace `border-gold-primary/15` with `border-border`
- **Line 309**: Contact button -- replace `bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background shadow-gold-primary/20` with `bg-primary text-primary-foreground shadow-primary/20`
- **Line 338**: Agent card -- replace `border-gold-primary/15` with `border-border`
- **Line 341**: Agent avatar bg -- replace `bg-gold-primary/10` with `bg-primary/10`, icon `text-gold-primary` to `text-primary`
- **Lines 357, 375**: Section borders -- replace `border-gold-primary/15` with `border-border`
- **Line 362, 380**: Placeholder cards -- replace `bg-card/50 border-border/30` with `bg-muted/30 border-border/50`

---

## File 2: `src/pages/PropertyDetail.tsx`

### Changes (grouped by area):

**Loading state (line 382):**
- Replace `bg-gold-primary/10` and `text-gold-primary` with `bg-primary/10` and `text-primary`

**Agent header (lines 485-548):**
- Line 485: Replace `bg-primary-foreground/5` with `bg-muted/30`; replace `border-gold-primary/15` with `border-border`
- Line 491: Avatar container -- replace `from-gold-primary/20` with `from-primary/20`
- Line 517: Position badge -- replace `from-gold-primary/15 to-accent/15 text-gold-primary` with `bg-primary/10 text-primary`
- Line 521: Star -- replace `fill-gold-primary text-gold-primary` with `fill-chart-3 text-chart-3`
- Line 531: Chat button -- replace `bg-chart-1 text-background` with `bg-primary text-primary-foreground`

**Sticky header (line 552):**
- Replace `bg-primary-foreground/5` with `bg-background/90`; replace `border-gold-primary/15` with `border-border`

**Property header card (line 818):**
- Replace `border-gold-primary/15 bg-primary-foreground/5` with `border-border bg-card`

**Location box (line 826):**
- Replace `bg-primary-foreground/5 border-gold-primary/10` with `bg-muted/30 border-border/50`
- Line 827-828: MapPin icon container -- replace `bg-gold-primary/10 text-gold-primary` with `bg-primary/10 text-primary`
- Line 854: Navigation icon -- replace `text-gold-primary` with `text-primary`

**Listing badge (line 865):**
- Replace `bg-gold-primary text-background` with proper gradient: sale = `bg-gradient-to-r from-emerald-500 to-green-600 text-white`, rent = `bg-gradient-to-r from-sky-500 to-blue-600 text-white`

**Price display (lines 881-889):**
- Replace `bg-gold-primary/5 border-gold-primary/15` with `bg-primary/5 border-primary/15`
- Replace `text-gold-primary` with `text-primary`

**Stats grid (lines 894-931):**
- Replace all `bg-gold-primary/5 border-gold-primary/10` and `text-gold-primary` with `bg-primary/5 border-primary/10` and `text-primary`
- Replace `bg-accent/5 border-accent/10 text-accent` with `bg-primary/5 border-primary/10 text-primary` for consistency

**Quick actions border (line 934):**
- Replace `border-gold-primary/10` with `border-border`

**Tabs card (line 966):**
- Replace `border-gold-primary/15 bg-primary-foreground/5` with `border-border bg-card`
- Line 969: TabsList -- replace `bg-primary-foreground/5 border-gold-primary/10` with `bg-muted/30 border-border`
- Lines 970-972: Tab triggers -- replace `data-[state=active]:bg-gold-primary data-[state=active]:text-background` with `data-[state=active]:bg-primary data-[state=active]:text-primary-foreground`

**Virtual tour card (line 1037):**
- Replace `border-gold-primary/15 bg-primary-foreground/5` with `border-border bg-card`
- Line 1038: Header bg -- replace `bg-gold-primary/5` with `bg-muted/30`
- Line 1040-1041: Icon -- replace `bg-gold-primary/10 text-gold-primary` with `bg-primary/10 text-primary`

**Contact sidebar card (line 1073):**
- Replace `border-gold-primary/15 bg-primary-foreground/5` with `border-border bg-card`
- Line 1074: Header bg -- replace `bg-gold-primary/5` with `bg-muted/30`
- Line 1076-1077: Icon -- replace `bg-gold-primary/10 text-gold-primary` with `bg-primary/10 text-primary`
- Line 1087: Avatar gradient -- replace `from-gold-primary/15` with `from-primary/15`
- Line 1096: Position text -- replace `text-gold-primary` with `text-primary`
- Line 1098: Star -- replace `fill-gold-primary text-gold-primary` with `fill-chart-3 text-chart-3`
- Line 1106: Company box -- replace `bg-primary-foreground/5 border-gold-primary/10` with `bg-muted/30 border-border/50`
- Line 1108: Company initial -- replace `bg-gold-primary/10 text-gold-primary` with `bg-primary/10 text-primary`
- Line 1119: WhatsApp button -- replace `bg-chart-1 text-background` with `bg-primary text-primary-foreground`
- Lines 1195-1203: Agent stats -- replace `bg-gold-primary/5 text-gold-primary` with `bg-primary/5 text-primary`; replace `bg-accent/5 text-accent` with `bg-primary/5 text-primary`

---

## Summary of Token Replacements

| Old Token | New Token |
|-----------|-----------|
| `gold-primary` (borders, bg, text) | `primary` |
| `bg-primary-foreground/5` (backgrounds) | `bg-muted/30` or `bg-card` or `bg-background/90` |
| `text-background` (on buttons) | `text-primary-foreground` |
| `fill-gold-primary text-gold-primary` (stars) | `fill-chart-3 text-chart-3` |
| `bg-background/60` (image overlays) | `bg-black/40 backdrop-blur-md text-white` |
| `bg-gold-primary text-background` (listing badge) | Emerald/Blue gradient + `text-white` |
| `data-[state=active]:bg-gold-primary` | `data-[state=active]:bg-primary` |

### Files to Modify

| File | Scope |
|------|-------|
| `src/components/property/PropertyDetailModal.tsx` | Replace gold-primary tokens, fix overlay colors |
| `src/pages/PropertyDetail.tsx` | Replace gold-primary tokens, fix primary-foreground backgrounds, standardize listing badges |

