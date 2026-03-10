

# Fix Page Jumping Globally Across All Pages

## Root Causes Found

Two remaining issues are causing the page jump on desktop across multiple pages:

1. **`scroll-behavior: smooth` in `mobile-first-responsive.css`** (line 16) - This was removed from `index.css` but still exists in another CSS file, re-enabling smooth scroll which causes visible jumps during focus management and popover positioning.

2. **Radix UI scroll-lock (`react-remove-scroll`)** - Dialog, Sheet, and Select components all use Radix's built-in scroll locking which adds `padding-right` and hides scrollbar. The CSS override in `index.css` targets `body[data-scroll-locked]` but needs to be more comprehensive to catch all edge cases.

3. **`useScrollLock` hook still uses `position: fixed`** - Even though calls were removed from two components, the hook itself still applies `position: fixed` to body which causes layout reflow. The hook should be made into a no-op to prevent any future usage from causing jumps.

## Plan

### 1. Remove `scroll-behavior: smooth` from `mobile-first-responsive.css`
- Line 16: Change `scroll-behavior: smooth` to `scroll-behavior: auto`
- This is the same fix already applied to `index.css` but missed in this second CSS file

### 2. Make `useScrollLock` a safe no-op
- Replace the hook body to do nothing (no `position: fixed`, no overflow changes)
- This prevents any current or future callers from causing layout shifts
- Keep the export so imports don't break

### 3. Strengthen the global CSS override for Radix scroll-lock
- Expand the `body[data-scroll-locked]` rule to also cover inline styles that Radix sets directly
- Add `position: static !important` and `top: auto !important` to prevent any fixed-position tricks from Radix's internal scroll lock

### 4. Update test file to match new no-op behavior
- Update `useScrollLock.test.ts` expectations since the hook will no longer modify styles

