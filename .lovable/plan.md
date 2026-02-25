

## Bug: Mobile Layout Breaking — Overly Aggressive CSS Overrides

### Root Cause

The file `src/styles/mobile-optimizations.css` contains several wildcard-style CSS rules with `!important` that break layouts on mobile. The `useIsMobile` hook adds the class `mobile-app-layout` to `document.body`, which activates all these rules. The most destructive ones:

**1. All flex elements forced to column (lines 199-203):**
```css
.mobile-app-layout .flex,
.mobile-app-layout .flex-wrap {
  flex-direction: column !important;
  gap: 1rem !important;
}
```
Tailwind's `flex` utility class is used on hundreds of elements — nav bars, button groups, card rows, dropdown menus, icon+label pairs. This rule forces them ALL to stack vertically, breaking horizontal layouts everywhere.

**2. All elements capped at max-width: 100% (lines 230-234):**
```css
.mobile-app-layout *,
body.mobile-device * {
  max-width: 100%;
  box-sizing: border-box;
}
```
The wildcard `*` with `max-width: 100%` breaks absolutely/fixed positioned elements, tooltips, popovers, and any element that intentionally overflows its parent.

**3. All containers forced to column (lines 85-96):**
```css
.mobile-app-layout .container,
.mobile-app-layout .container-flex,
body.mobile-device .container {
  flex-direction: column !important;
  gap: 1rem !important;
}
```

**4. Context menus disabled globally (lines 288-291):**
```css
body.mobile-device * {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}
```
This prevents long-press context menus and text selection on every element.

### Fix Plan

#### File: `src/styles/mobile-optimizations.css`

**Remove the destructive wildcard flex override** (lines 199-203). This is the primary cause of broken layouts. Elements that need column direction on mobile should use Tailwind's `flex-col` or responsive `md:flex-row` patterns directly in components.

**Remove the wildcard `max-width: 100%` on `*`** (lines 230-234). Replace with a scoped rule that only targets images and media.

**Remove the forced `flex-direction: column` from `.container`** (line 94). Containers should control their own layout. Keep the width/padding overrides.

**Scope the tap-highlight and callout disable** (lines 288-291) to interactive elements only, not `*`.

**Remove the unscoped `.flex` and `.flex-wrap` direction override** entirely — it's fundamentally incompatible with Tailwind's utility-first approach.

#### Specific changes:

| Lines | Current | Change |
|-------|---------|--------|
| 94 | `flex-direction: column !important;` | Remove this line |
| 95 | `gap: 1rem !important;` | Remove this line |
| 199-203 | `.mobile-app-layout .flex, .flex-wrap` forced column | **Delete entire rule** |
| 230-234 | `*` with `max-width: 100%` | Scope to `img, video, canvas, svg` only |
| 288-291 | `body.mobile-device *` tap/callout disable | Scope to `button, a, [role="button"]` |

### Impact

This will stop the CSS from fighting with Tailwind's responsive utilities. Components already use responsive classes like `flex-col md:flex-row` where needed — the global override was redundantly (and incorrectly) overriding those patterns and breaking elements that should remain horizontal on mobile (navigation bars, badge rows, icon+text pairs, dropdowns).

