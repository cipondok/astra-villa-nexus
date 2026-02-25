

## Fix: PropertyListingPage Jumping on Selection + ChatButton Runtime Error

### Problem 1: Page "jumps" when selecting filters on /dijual and /disewa

**Cause**: Every property card in the grid uses `motion.div` with `initial={{ opacity: 0, y: 20 }}`. When a filter Select changes state and the component re-renders, ALL cards replay their entrance animation (fading in and sliding up 20px), causing a visible jump/flash. Additionally, the filter panel uses `AnimatePresence` with `height: 0` to `height: "auto"` which can cause layout shifts.

**Fix in `src/pages/PropertyListingPage.tsx`**:
- Remove `initial` and `animate` from the property card `motion.div` (line 406-409), or change to a simple `div`. The entrance animation on every re-render is the jumping behavior.
- On the collapsible filter `motion.div` (lines 280-284), add `overflow-hidden` and use `layout` instead of height animation to prevent content jumps.

### Problem 2: ChatButton runtime error — `TypeError: undefined is not an object (evaluating 'event.defaultPrevented')`

**Cause**: The `handleMouseUp` handler (line 151) calls `onClick()` without any event argument. The `ContextMenuTrigger` from Radix wraps the button and intercepts pointer events. When `handleMouseUp` fires, Radix's internal `handleEvent` function receives `undefined` instead of an event object and crashes trying to read `event.defaultPrevented`.

**Fix in `src/components/ai/ChatButton.tsx`**:
- Change `handleMouseUp` to accept the mouse event and pass it through, and guard the `onClick` call:
  ```typescript
  const handleMouseUp = (e: React.MouseEvent) => {
    // ... existing cleanup logic ...
    if (!isLongPress) {
      onClick();
    }
  };
  ```
  The key issue is that `onMouseUp` on `motion.button` (line 205) doesn't forward the event. The fix is to ensure the handler signature accepts the event so React's synthetic event system doesn't pass `undefined` to Radix's delegation layer. Also add a null-guard in the handler.

### Specific Changes

#### File: `src/pages/PropertyListingPage.tsx`

| Location | Change |
|----------|--------|
| Line 406-409 | Replace `motion.div` with `initial/animate` with a plain `div` (or use `layout` only). This stops the 20px jump on every filter change re-render. |
| Lines 280-284 | Clean up the filter panel animation — use `overflow-hidden` on parent and smoother transition to prevent content reflow. |

#### File: `src/components/ai/ChatButton.tsx`

| Location | Change |
|----------|--------|
| Line 151 | Add event parameter: `const handleMouseUp = (e: React.MouseEvent) => {` |
| Line 164 | Guard onClick: wrap in `try/catch` or check event validity before calling |
| Line 205 | Ensure `onMouseUp` properly receives event: `onMouseUp={(e) => handleMouseUp(e)}` (explicit) |

### Technical Detail

The ChatButton error stack trace shows:
```
handleEvent (chunk-OD433RWB.js) → Radix ContextMenu event handler
  ← handleMouseUp (ChatButton.tsx:116)
```
Radix's `ContextMenuTrigger` adds a pointer event listener that expects a valid DOM event. The `motion.button`'s `onMouseUp` calls `handleMouseUp` which internally calls `onClick()`. The `onClick` triggers Radix's internal `handleEvent` which reads `event.defaultPrevented` — but `event` is undefined because the synthetic event was already consumed. The fix is to stop the event from propagating into Radix's handler after we handle our click intent.

