

## Plan: Hide Smart Collections When Empty

**Single change** in `src/components/home/SmartCollectionsV2.tsx`:

Add an early return after the data loads. If `collections` is empty or all collections have zero properties, return `null` so the section renders nothing.

```tsx
// After line 39 (const properties = current?.properties || []):
const hasProperties = collections && collections.length > 0 && collections.some(c => c.properties.length > 0);
if (!isLoading && !hasProperties) return null;
```

This ensures the section auto-hides when there's no data, eliminating the empty state message on the homepage.

