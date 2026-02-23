

# Fix: Page Dancing When Opening Popovers & Header Dropdown

## Problem

Two things cause the page to "dance" (shift horizontally):

1. **Popover filters (Property Type, Location, Color, etc.)** -- When a Radix Popover opens, Radix's internal scroll-lock (`react-remove-scroll`) hides the scrollbar and adds `padding-right` to the body to compensate. However, a CSS rule on line 110 of `index.css` forces `padding-right: 0 !important` on `body[data-scroll-locked]`, which nullifies the compensation and causes the content to shift.

2. **Header user icon dropdown** -- Same mechanism. The Radix DropdownMenu triggers the same scroll-lock behavior and hits the same CSS override.

The comment in the CSS says *"We already reserve gutter via scrollbar-gutter"* -- but `scrollbar-gutter: stable` was removed in the previous fix. So the compensation is broken.

## Solution

### 1. Re-add `scrollbar-gutter: stable` to `html` in `src/index.css`

This reserves space for the scrollbar at all times, so when Radix hides the scrollbar, there is no layout shift. The `padding-right: 0 !important` rule then correctly prevents double-compensation.

This was removed previously because it was thought to conflict with the `useScrollLock` hook, but it only conflicts when the hook also adds `paddingRight` -- which it already does. The solution is to NOT add `paddingRight` in the hook when `scrollbar-gutter: stable` is present.

### 2. Remove `paddingRight` compensation from `useScrollLock.ts`

Since `scrollbar-gutter: stable` handles the scrollbar space, the hook should not add its own `paddingRight`. This eliminates the double-compensation that caused the original issue.

### 3. Remove the `requestAnimationFrame` scroll hacks in `AstraSearchPanel.tsx`

The Popover trigger buttons have `requestAnimationFrame(() => window.scrollTo(0, currentScroll))` hacks to fight the jumping. With the root cause fixed, these are no longer needed and can cause their own subtle jumps.

## Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Re-add `scrollbar-gutter: stable` on `html` (before body rule, around line 76) |
| `src/hooks/useScrollLock.ts` | Remove `paddingRight` lines (lines 9, 15, 22, 32) since scrollbar-gutter handles it |
| `src/components/AstraSearchPanel.tsx` | Remove `requestAnimationFrame(() => window.scrollTo(...))` hacks from Popover trigger onClick handlers (~lines 2860, 2943) |

