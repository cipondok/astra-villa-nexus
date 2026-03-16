

## AI Command Center — Comprehensive Update Plan

### Problems Identified

1. **Data loading fragility**: The `useAICommandCenter` hook fires 40+ parallel Supabase queries in a single `Promise.all`. If any query fails or times out, the entire data fetch fails, leaving the page stuck on the skeleton loader. There is no error boundary or partial-data fallback.

2. **ResponsiveContainer console warnings**: The overview's "AI Job Queue" pie chart uses `<ResponsiveContainer width={100} height={100}>` with fixed pixel values, which defeats the purpose and generates repeated console warnings.

3. **Layout density issues**: At the user's 1136px viewport, the 3-column overview layout (2-col main + 1-col sidebar) can feel cramped. The left sidebar nav (w-52) plus the right sidebar panel compress the center content.

4. **Missing error/empty state handling**: When data queries return empty or error, many panels show a generic `EmptyState` but the overall page doesn't communicate what went wrong. The loading state shows indefinite skeleton pulses with no timeout or retry.

5. **Visual polish gaps**: Chart tooltips, card spacing, and the sidebar status section could be refined for a more cohesive, modern look.

---

### Plan

#### 1. Make data fetching resilient with `Promise.allSettled`

**File**: `src/hooks/useAICommandCenter.ts`

- Replace the single `Promise.all` (line 165) with `Promise.allSettled` so individual query failures don't break the entire page.
- For each settled result, extract data if fulfilled or use a sensible default (0, empty array) if rejected.
- This ensures the page always renders with whatever data is available, showing "No data" only for the specific failed sections.

#### 2. Add error state and retry UI to the component

**File**: `src/components/admin/AICommandCenter.tsx`

- Add an `isError` check from `useAICommandCenter` alongside `isLoading`.
- Display a dedicated error state card with a "Retry" button instead of an infinite skeleton loader.
- Add a timeout-based fallback: if loading takes more than 15 seconds, show a partial-load message.

#### 3. Fix the ResponsiveContainer warning

**File**: `src/components/admin/AICommandCenter.tsx` (line ~799)

- Replace `<ResponsiveContainer width={100} height={100}>` with a plain `<div>` wrapper using fixed dimensions, since `ResponsiveContainer` is not needed for fixed-size charts.
- Apply the same fix to any other fixed-dimension `ResponsiveContainer` instances (e.g., the SEO rating pie at line ~1007 using `width={140} height={140}`).

#### 4. Improve the overview layout for mid-width screens

**File**: `src/components/admin/AICommandCenter.tsx`

- Change the overview grid from `lg:grid-cols-3` to `xl:grid-cols-3` so on the user's 1136px viewport it renders as a cleaner 2-column layout instead of a squeezed 3-column.
- Adjust KPI cards grid from `xl:grid-cols-5` to `lg:grid-cols-5` to ensure they don't wrap awkwardly.

#### 5. Visual refresh for consistency

**File**: `src/components/admin/AICommandCenter.tsx`

- Update the `Panel` component's header to add a subtle bottom border separator for better section delineation.
- Add a subtle gradient header bar to the main "AI Command Center" title section.
- Ensure all empty states use consistent sizing and messaging.
- Add a "Last updated X ago" timestamp badge next to the Live badge in the header.

#### 6. Improve sidebar status section

**File**: `src/components/admin/AICommandCenter.tsx`

- Add real-time data freshness indicator showing when data was last fetched (using `dataUpdatedAt` from React Query).
- Show a connection quality indicator based on the edge function latency from the health data.

---

### Technical Details

**`useAICommandCenter.ts` — Promise.allSettled pattern:**
```typescript
const results = await Promise.allSettled([
  supabase.from('properties').select(...),
  supabase.from('ai_jobs').select(...),
  // ... all existing queries
]);

// Extract helper
const extract = (idx: number, fallback: any = null) => {
  const r = results[idx];
  return r.status === 'fulfilled' ? r.value : { data: fallback, count: 0, error: r.reason };
};
```

**ResponsiveContainer fix:**
```tsx
// Before (causes warning)
<ResponsiveContainer width={100} height={100}>
  <PieChart>...</PieChart>
</ResponsiveContainer>

// After (clean)
<PieChart width={100} height={100}>
  <Pie ...>...</Pie>
</PieChart>
```

### Files to modify
- `src/hooks/useAICommandCenter.ts` — resilient data fetching
- `src/components/admin/AICommandCenter.tsx` — error states, layout fixes, visual refresh, console warning fixes

