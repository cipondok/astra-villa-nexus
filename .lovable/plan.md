

## Problem Diagnosis

The search suggestions dropdown is not appearing on top of other content despite having `position: fixed` and `z-index: 100002`. 

**Root cause**: The parent container at line 2363 uses `backdrop-blur-xl`, which creates a new **containing block** for `position: fixed` descendants. This means the "fixed" dropdown is actually positioned relative to this blurred container instead of the viewport, causing it to render incorrectly (clipped or misplaced).

This same issue affects both the mobile and desktop suggestion dropdowns.

## Solution

Render both suggestion dropdowns (mobile at line 2120 and desktop at line 2537) through `createPortal(... , document.body)` -- the same pattern already used for the Advanced Filters modal at line 3383. This escapes the `backdrop-filter` containing block entirely.

Additionally, change the trigger from "on focus" to "after typing" per the user's preference: only show suggestions when `searchQuery.length >= 1`.

## Changes

### 1. `src/components/AstraSearchPanel.tsx`

**A. Mobile suggestions dropdown (around line 2119-2248)**:
- Wrap the entire `{showSuggestions && hasSuggestions && ( <div ...> ... </div> )}` block in `createPortal(..., document.body)`.
- The `fixed` positioning and `suggestionsTop` style already handle placement correctly once portaled.

**B. Desktop suggestions dropdown (around line 2536-2750)**:
- Wrap the `{showSuggestions && ( <div ...> ... </div> )}` block in `createPortal(..., document.body)`.
- The `fixed` positioning with `suggestionsRect` style already handles placement.

**C. Change trigger from "on focus" to "after typing"**:
- Mobile `onFocus` (line 2058-2065): Remove `setShowSuggestions(true)` from onFocus.
- Desktop `onFocus` (line 2451-2454): Remove `setShowSuggestions(true)` from onFocus.
- In `handleSearchChange` (line 1660-1662): Add `setShowSuggestions(value.length > 0)` so suggestions only show when there is text.
- Keep `updateSuggestionsPosition` call in a `useEffect` watching `showSuggestions` (already exists at line 1837).

**D. Click-outside detection update (line 1806-1826)**:
- The existing `handleClickOutside` logic checks `suggestionsRef.current.contains(target)`. Since the dropdown is now portaled to `document.body`, this check still works because `suggestionsRef` points to the portaled DOM node. Also add a check for the `anchorRef` so clicking inside the input does not close suggestions.

### Summary of changes
- 1 file modified: `src/components/AstraSearchPanel.tsx`
- Both mobile and desktop dropdowns portaled to `document.body`
- Trigger changed: suggestions appear after typing (not on focus)
- No new dependencies needed (`createPortal` is already imported at line 2)

