
# Fix: Filter Popup Disturbing Page Style, Scrolling & Resizing

## Problem
When the Advanced Filters popup opens, the page experiences layout shifts and style disturbances. This is caused by **duplicate scroll-locking mechanisms** fighting each other:

1. **`useScrollLock` hook** -- sets `overflow: hidden` + `paddingRight` on both `<html>` and `<body>`
2. **`filter-popup-open` CSS class** -- also sets `overflow: hidden !important` + `touch-action: none !important` on `<body>`
3. **`--scroll-position` CSS variable** -- set but never consumed, adding unnecessary overhead

The `touch-action: none !important` on the body is especially problematic -- it disables all touch interactions site-wide, and the `paddingRight` scrollbar compensation can cause visible layout shifts.

## Solution

### 1. Remove duplicate scroll-lock effect in `AstraSearchPanel.tsx` (lines 172-183)
- Delete the `useEffect` that adds `filter-popup-open` class and sets `--scroll-position`
- The `useScrollLock(showAdvancedFilters)` hook on line 170 already handles scroll prevention correctly

### 2. Simplify `useScrollLock` hook in `src/hooks/useScrollLock.ts`
- Remove `paddingRight` compensation (this causes the layout shift/resize)
- Keep only `overflow: hidden` on `document.documentElement` (not both html and body)
- Remove the `scroll-locked` body class (unused)

### 3. Clean up CSS in `src/index.css` (lines 148-153)
- Remove or simplify the `.filter-popup-open` rule since it will no longer be applied

### 4. Remove `touch-none` class from the filter panel div in `AstraSearchPanel.tsx` (line 3538)
- Replace with `touch-auto` so the panel's internal content remains scrollable/interactive

## Files to Change

| File | Change |
|------|--------|
| `src/components/AstraSearchPanel.tsx` | Remove duplicate scroll-lock useEffect (lines 172-183); change `touch-none` to `touch-auto` on filter panel |
| `src/hooks/useScrollLock.ts` | Remove `paddingRight` compensation and simplify to just `overflow: hidden` on `documentElement` |
| `src/index.css` | Remove `.filter-popup-open` CSS rule (no longer used) |
