

# Fix: Page Still Jumps When Opening Filter Popup

## Root Cause

The `useScrollLock` hook sets `overflow: hidden` on `document.documentElement` (the `<html>` element), but the **body** element has `overflow-y: auto !important;` in `src/index.css` (line 83). Because of the `!important` flag, the body continues to scroll regardless of what the hook does -- causing the visible page jump.

Additionally, the hook only targets `<html>`, not `<body>`, and does not prevent the scroll position from visually resetting.

## Solution

### 1. Fix `useScrollLock.ts` -- use position-fixed technique

Instead of just setting `overflow: hidden` (which gets overridden), the hook will:
- Save the current scroll position
- Set `body` to `position: fixed; top: -scrollY; left: 0; right: 0` -- this freezes the page visually in place
- On unlock, remove those styles and restore `window.scrollTo()` to the saved position

This is the industry-standard approach (used by libraries like `body-scroll-lock`) and is immune to `!important` overflow rules.

### 2. Remove conflicting CSS in `src/index.css`

- **Line 83**: Change `overflow-y: auto !important` to `overflow-y: auto` (remove `!important`) so scroll locking can work
- **Lines 106-123**: Remove `body.scroll-locked` iOS rules (no longer needed with position-fixed approach)
- **Lines 126-135**: Remove `html.modal-open, body.modal-open, body.scroll-locked` rules (redundant, and `touch-action: none` causes interaction issues)
- **Lines 158-164**: Remove `.popup-interaction-active` rule (unused)

### 3. No changes needed to `AstraSearchPanel.tsx`

The existing `useScrollLock(showAdvancedFilters)` call on line 170 is correct. The fix is entirely in the hook and CSS.

## Files to Change

| File | Change |
|------|--------|
| `src/hooks/useScrollLock.ts` | Rewrite to use position-fixed body technique for bulletproof scroll prevention |
| `src/index.css` | Remove `!important` from `overflow-y: auto`, remove obsolete scroll-lock CSS rules |

## Updated `useScrollLock` implementation

```ts
import { useEffect, useRef } from 'react';

export const useScrollLock = (lock: boolean) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (lock) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [lock]);
};
```

This approach physically pins the body in place so no scroll jump is possible, regardless of any CSS `!important` rules.

