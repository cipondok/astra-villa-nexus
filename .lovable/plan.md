

# VR Tour Showcase — Ultra Compact Layout

## Problem
Too much vertical space consumed by separate sections (pills, property info card, VR tour, info box) stacked with generous padding and gaps.

## Solution
Merge the feature pills and property info into a single compact header strip above the VR tour. Collapse the "How to use" info into a collapsible/tooltip instead of a full card. Reduce all spacing.

## Changes

### File: `src/pages/VRTourShowcase.tsx`

**1. Merge feature pills + property info into one compact bar (lines 133-170)**

Replace the `space-y-4 sm:space-y-6` main with `space-y-2 sm:space-y-3`. Combine the feature pills row and property info card into a single flex container:

```text
[🔄 360°] [🛋️ AI] [📏] [🌙]     Luxury Villa Seminyak · Seminyak, Bali     Rp 8.5B · 4BR 4BA 450m²
```

- Single row with `flex items-center justify-between flex-wrap gap-2`
- Left: feature pills (as-is)
- Right: property title, city, price, specs all inline with `·` separators
- Remove the separate `bg-secondary/50` card wrapper — just inline text
- Padding reduced to `p-2`

**2. Collapse "How to use" section (lines 179-194)**

Replace the full info card with a small `[? How to use]` pill button that opens a popover/collapsible on click. This saves ~100px of vertical space by default.

**3. Reduce main container spacing**

- `py-4 sm:py-6` → `py-2 sm:py-3`
- `space-y-4 sm:space-y-6` → `space-y-2 sm:space-y-3`

### Files Modified
- `src/pages/VRTourShowcase.tsx`

