

# Fix Page Jump on Menu Item Click

## Root Cause

The nav bar has **two different heights** based on scroll position (`pastHero`):
- Before hero: `h-10 md:h-11 lg:h-12`  
- After hero: `h-12 md:h-13 lg:h-14`

When clicking a menu item:
1. `navigate()` triggers route change → page renders new content
2. Scroll resets to top → `pastHero` flips to `false` → nav shrinks by 2-4px
3. The height transition (500ms) causes visible content jump
4. Menu close animation compounds the shift

## Fix

**1. Use a consistent nav height** — remove the `pastHero` height toggle. Use a single fixed height (`h-12 md:h-13 lg:h-14`) so the nav never resizes during navigation.

**2. Smooth menu close** — instead of abruptly removing the mobile menu on route change, add exit animation before unmounting.

**3. Scroll before navigate** — in mobile menu item clicks, scroll to top instantly before navigating to prevent the `pastHero` state flip from causing a visible shift.

## Changes — `src/components/Navigation.tsx`

- **Lines 136, 141**: Remove the conditional `pastHero` height classes. Use fixed `h-12 md:h-13 lg:h-14` for both the nav and inner container.
- **Lines 394-465 (mobile menu onClick handlers)**: Add `window.scrollTo(0, 0)` before `navigate()` calls to prevent scroll-triggered height changes.
- Keep `pastHero` for background styling (transparency) but stop using it for height.

