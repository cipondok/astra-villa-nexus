

## P2 #9: Limit Activity Feed Animations to First Render

**Problem**: Every time the activity feed refetches (every 60s), all 8 `motion.div` rows re-animate with staggered delays, causing periodic visual jank.

**Solution**: Track whether this is the initial mount and only apply entrance animations on first render. Subsequent data updates render without animation.

### Changes

**`src/components/admin/AdminOverview.tsx`**
1. Add a `useRef(true)` flag (`isFirstRender`) that starts `true` and flips to `false` after initial data loads
2. Conditionally apply `motion.div` props — on first render use `initial`/`animate`/`transition`, on subsequent renders use a plain `div` or `motion.div` with `initial={false}`
3. Use `useEffect` watching `recentActivity` to flip the flag after first successful load

```tsx
// Before:
<motion.div
  key={activity.id}
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: idx * 0.05 }}
  ...

// After:
<motion.div
  key={activity.id}
  initial={isFirstRender.current ? { opacity: 0, x: -10 } : false}
  animate={{ opacity: 1, x: 0 }}
  transition={isFirstRender.current ? { delay: idx * 0.05 } : { duration: 0 }}
  ...
```

One file changed, minimal diff. No new dependencies.

