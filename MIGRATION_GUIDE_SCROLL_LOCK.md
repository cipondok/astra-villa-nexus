# 🔥 Scroll Lock Migration Guide - Zero Layout Shift Solution

## Problem Solved
When opening Popovers/Modals, the scrollbar disappears (~15px), causing the entire page to shift horizontally. This creates a jarring UX ("jump effect") that makes the app feel buggy.

## Solution Overview
1. **Portal-ized Popovers**: Render outside main flow at `<body>` level
2. **Scroll Lock with Padding Compensation**: Reserve space for removed scrollbar
3. **Auto-lock Hook**: Automatically manages lock/unlock based on state

---

## 📦 Files Created/Modified

### ✅ New Files
- `src/hooks/useScrollLock.ts` - Core scroll lock utility with debug logging
- `MIGRATION_GUIDE_SCROLL_LOCK.md` - This file

### ✅ Modified Files
- `src/components/iPhoneSearchPanel.tsx`:
  - Added `import * as PopoverPrimitive from "@radix-ui/react-popover"`
  - Added `import { useAutoScrollLock } from "@/hooks/useScrollLock"`
  - Added `useAutoScrollLock(showFilters || isMenuOpen)` hook call
  - Wrapped Location Popover's `<PopoverContent>` in `<PopoverPrimitive.Portal>`
  - Added `onCloseAutoFocus={(e) => e.preventDefault()}` to prevent focus jumps

---

## 🚀 Step-by-Step Migration

### Step 1: Install Dependencies (Already Done ✅)
All required packages are already installed:
- `@radix-ui/react-popover` (for Portal support)
- React 18+ (for useEffect, useCallback)

### Step 2: Test the Fix
1. Open the app in browser
2. Open DevTools Console (you'll see debug logs like `[useScrollLock] 🔒 Scroll locked`)
3. Click **Location** button → Popover opens
4. **Expected**: No page jump, scrollbar space reserved
5. Close popover → Scrollbar returns smoothly

### Step 3: Apply to Other Popovers (Optional)
If you have other Popovers/Dialogs (e.g., Facilities, Advanced Filters), apply the same pattern:

```tsx
// Before (causes layout shift):
<Popover onOpenChange={setIsOpen}>
  <PopoverTrigger>...</PopoverTrigger>
  <PopoverContent>...</PopoverContent>
</Popover>

// After (no layout shift):
<Popover onOpenChange={setIsOpen}>
  <PopoverTrigger>...</PopoverTrigger>
  <PopoverPrimitive.Portal>
    <PopoverContent 
      onCloseAutoFocus={(e) => e.preventDefault()}
      style={{ paddingRight: 'var(--removed-body-scroll-bar-size, 0px)' }}
    >
      ...
    </PopoverContent>
  </PopoverPrimitive.Portal>
</Popover>

// Add to component:
useAutoScrollLock(isOpen);
```

---

## 🧪 Test Cases

### Test Case 1: **Open Location Popover on Mobile While Scrolled**
**Steps**:
1. Open app on mobile (or use DevTools mobile view)
2. Scroll down ~300px
3. Click "Location" button

**Expected**:
- ✅ Popover opens smoothly
- ✅ Page content stays in exact same position (no jump)
- ✅ Console shows: `[useScrollLock] 🔒 Scroll locked. Padding added: 0px` (mobile has no scrollbar)
- ✅ No horizontal scroll appears

**Fail Criteria**:
- ❌ Page jumps left/right
- ❌ Popover position shifts
- ❌ Horizontal scrollbar appears

---

### Test Case 2: **Open/Close Location 10x Rapidly on Desktop**
**Steps**:
1. Open app on desktop (viewport > 768px)
2. Rapidly click Location button 10 times (open → close → open...)

**Expected**:
- ✅ No cumulative layout shift (CLS = 0)
- ✅ Scrollbar appears/disappears smoothly
- ✅ Console logs alternate: `🔒 Scroll locked` → `🔓 Scroll unlocked`
- ✅ Final state: scrollbar visible, body padding = 0

**Fail Criteria**:
- ❌ Page shifts 15px left/right on each toggle
- ❌ Scrollbar gets "stuck" (doesn't return)
- ❌ Console errors about paddingRight

---

### Test Case 3: **Open Location → Open Advanced Filters (Nested Overlays)**
**Steps**:
1. Click "Location" button (Popover opens)
2. Click "Advanced Filters" button (Modal opens on top)
3. Close modal
4. Close popover

**Expected**:
- ✅ Both overlays stack correctly (z-index: modal > popover)
- ✅ Scroll stays locked while ANY overlay is open
- ✅ Scroll unlocks only when BOTH are closed
- ✅ Console shows: `Scrollbar width: 15px` once, then `🔒 locked` → `🔓 unlocked` once

**Fail Criteria**:
- ❌ Scrollbar returns prematurely (when modal opens but popover still open)
- ❌ Page jumps when switching between overlays
- ❌ Double padding (30px) applied

---

## 🐛 Debugging Tips

### Console Log Reference
| Log Message | Meaning | Action |
|-------------|---------|--------|
| `[useScrollLock] Scrollbar width calculated: 15px` | Normal desktop | ✅ Expected |
| `[useScrollLock] 🔒 Scroll locked. Padding added: 15px` | Lock engaged | ✅ Check body has `padding-right: 15px` |
| `[useScrollLock] 🔓 Scroll unlocked. Styles restored.` | Unlock successful | ✅ Check body padding removed |
| `[useScrollLock] Already locked, skipping` | Multiple locks attempted | ⚠️ Investigate: Are you tracking ALL overlay states? |
| `[useScrollLock] Not locked, skipping unlock` | Unlock called when not locked | ⚠️ Harmless but check state management |

### DevTools Inspection
1. Open popover
2. Inspect `<body>` element
3. **Expected styles**:
   ```css
   body {
     overflow: hidden;
     padding-right: 15px; /* or 0px on mobile */
   }
   ```
4. Close popover
5. **Expected**: Styles removed

### Performance Check (CLS - Cumulative Layout Shift)
1. Open Chrome DevTools → Performance tab
2. Click "Record"
3. Open/close popover 5x
4. Stop recording
5. Check "Experience" section → CLS should be **< 0.1** (green)

---

## 🎯 Success Criteria Checklist

- [ ] **Desktop**: Open location popover 10x → CLS < 0.1
- [ ] **Mobile**: Open location popover while scrolled → No horizontal scroll
- [ ] **Dark Mode**: Glass popup styling preserved
- [ ] **Animations**: fade-in/zoom-in animations work smoothly
- [ ] **Console**: No errors; scrollbar width logged
- [ ] **Nested Overlays**: Location popover + Advanced filters both work
- [ ] **Focus**: No focus jump when closing (prevented by `onCloseAutoFocus`)
- [ ] **Performance**: No heavy computations (passive event listeners)

---

## 🔮 Future Enhancements

### Optional: Global Modal Manager
If you add more modals, consider a global context:

```tsx
// src/contexts/OverlayContext.tsx
const OverlayContext = createContext({ overlays: [] });

export function OverlayProvider({ children }) {
  const [overlays, setOverlays] = useState([]);
  const hasOpenOverlay = overlays.length > 0;

  useAutoScrollLock(hasOpenOverlay);

  return (
    <OverlayContext.Provider value={{ overlays, setOverlays }}>
      {children}
    </OverlayContext.Provider>
  );
}

// Usage:
const { registerOverlay, unregisterOverlay } = useOverlays();
```

### Optional: Measure CLS Programmatically
Add to `useScrollLock.ts`:

```ts
const measureCLS = () => {
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: any) => {
      if (entry.hadRecentInput) return; // Ignore user-caused shifts
      console.log('[CLS] Layout shift detected:', entry.value);
    });
  }).observe({ type: 'layout-shift', buffered: true });
};
```

---

## 📚 References
- [Radix UI Portal Documentation](https://www.radix-ui.com/primitives/docs/utilities/portal)
- [Web.dev: Cumulative Layout Shift](https://web.dev/cls/)
- [React useCallback Optimization](https://react.dev/reference/react/useCallback)

---

## 🆘 Troubleshooting

### "Page still jumps on mobile"
- **Cause**: Mobile browsers have 0px scrollbar but viewport might resize
- **Fix**: Add `touch-action: none` to body when locked:
  ```ts
  document.body.style.touchAction = 'none';
  ```

### "Popover appears behind other content"
- **Cause**: Portal renders at body level but z-index might be lower
- **Fix**: Increase z-index in PopoverContent:
  ```tsx
  <PopoverContent className="z-[99999]">
  ```

### "Scroll doesn't unlock after closing"
- **Cause**: State not properly tracked or component unmounted before unlock
- **Fix**: Add cleanup in useEffect dependency:
  ```ts
  useEffect(() => {
    return () => unlockScroll(); // Always cleanup
  }, []);
  ```

---

**Last Updated**: 2025-11-02  
**Author**: AI Assistant  
**Version**: 1.0.0
