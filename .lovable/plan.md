

## Bug: Page Jumping When Interacting with Dropdowns

### Root Cause

There's a conflict between two scroll-compensation strategies in `src/index.css`:

1. **Line 66**: `scrollbar-gutter: stable` on `html` — this CSS property permanently reserves space for the scrollbar so it never causes layout shift when it appears/disappears. This is the correct modern approach.

2. **Lines 116-120**: `body[data-scroll-locked]` override — this rule forces `overflow: auto !important` and `padding-right: 0 !important` on the body when Radix opens any overlay (Select, Dialog, Popover). The comment says it exists *because* `scrollbar-gutter` already handles compensation. But setting `overflow: auto !important` **defeats Radix's scroll lock entirely**, meaning the page remains scrollable behind open dropdowns/modals, and the fighting between Radix trying to lock and CSS forcing unlock causes the visible flicker/jump.

Additionally, the custom `useScrollLock` hook (used in `AstraSearchPanel` and `ProvincePropertiesModal`) directly manipulates `document.body.style.overflow` and `paddingRight`, which conflicts with both `scrollbar-gutter` and Radix's built-in `react-remove-scroll`.

### Fix Plan

#### 1. Fix the `body[data-scroll-locked]` CSS rule
**File:** `src/index.css` (lines 114-120)

Replace the current override with one that works *with* `scrollbar-gutter: stable` instead of fighting Radix:

```css
/* Radix (react-remove-scroll) adds padding-right to compensate for scrollbar.
   Since we use scrollbar-gutter: stable, we only need to suppress the extra padding. */
body[data-scroll-locked] {
  padding-right: 0 !important;
  margin-right: 0 !important;
  /* DO NOT override overflow — let Radix lock scroll properly */
}
```

The key change: **remove `overflow: auto !important`**. This single line is what breaks scroll locking and causes the jump. The `padding-right: 0` stays because `scrollbar-gutter: stable` already reserves the space.

#### 2. Simplify `useScrollLock` hook
**File:** `src/hooks/useScrollLock.ts`

Since `scrollbar-gutter: stable` handles width compensation, and Radix handles scroll locking for its own components, this hook only needs to set `overflow: hidden` without padding tricks:

```ts
export const useScrollLock = (lock: boolean) => {
  useEffect(() => {
    if (lock) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [lock]);
};
```

Remove the `paddingRight` manipulation — `scrollbar-gutter: stable` already prevents layout shift.

### Summary

| Change | Why |
|--------|-----|
| Remove `overflow: auto !important` from `body[data-scroll-locked]` | Lets Radix properly lock scroll behind dropdowns/modals |
| Keep `padding-right: 0 !important` | Prevents double compensation since `scrollbar-gutter` handles it |
| Remove `paddingRight` from `useScrollLock` | Redundant with `scrollbar-gutter: stable` |

