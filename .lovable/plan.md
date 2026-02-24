

# Plan: Audit and Optimize Supabase Queries & Real-Time Subscriptions

## Findings Summary

After auditing the codebase, I identified several categories of performance issues across ~26 files with real-time subscriptions and ~284 files with Supabase queries.

---

## Issue 1: Duplicate Real-Time Channels on the Same Tables

**Problem:** Multiple hooks subscribe to the same tables independently, creating redundant WebSocket connections. Each open channel consumes a Supabase Realtime slot (default limit: 100 concurrent).

Duplicated subscriptions found:

| Table | Channel 1 | Channel 2 |
|-------|-----------|-----------|
| `profiles` INSERT | `useRealTimeAlerts` (`profiles-realtime`) | `useAdminAlerts` (`profiles-changes`) |
| `profiles` INSERT | `usePlatformStats` (`stats-profiles`) | (same table, 3rd listener) |
| `properties` INSERT | `useRealTimeAlerts` (`properties-realtime`) | `useAdminAlerts` (`properties-changes`) |
| `properties` * | `usePlatformStats` (`stats-properties`) | `ProjectMapVisualization` (`project-map-properties`) |
| `vendor_services` INSERT | `useRealTimeAlerts` (`vendor-services-realtime`) | `useAdminAlerts` (`vendor-services-changes`) |
| `user_login_alerts` INSERT | `useRealTimeAlerts` (`security-realtime`) | `useAdminAlerts` (`login-alerts-changes`) |

**Fix:** Consolidate `useAdminAlerts` into `useRealTimeAlerts` — they both listen to the exact same tables and create alerts. Remove `useAdminAlerts` entirely and ensure `useRealTimeAlerts` handles all alert creation. This eliminates ~4 duplicate channels.

**Files changed:**
- Delete or gut `src/hooks/useAdminAlerts.ts`
- Update any imports of `useAdminAlerts` to use `useRealTimeAlerts` instead

---

## Issue 2: `usePlatformStats` — Cascading Refetches

**Problem:** `usePlatformStats` subscribes to 4 tables (`profiles`, `vendor_business_profiles`, `properties`, `activity_logs`) and calls `fetchStats()` on every single change. `fetchStats` fires **19 parallel queries** plus 1 sequential query (vendor_reviews for avg rating). Any INSERT to `activity_logs` (which happens frequently) triggers all 20 queries.

**Fix:**
1. **Debounce** the real-time callback — batch rapid changes into a single refetch (500ms debounce)
2. **Consolidate 4 channels into 1** — a single channel can listen to multiple tables
3. **Replace the sequential avg rating query** with a `count + head` approach or move it into the parallel batch
4. **Use `select('id', { count: 'exact', head: true })` instead of `select('*', { count: 'exact', head: true })`** — while `head: true` prevents data transfer, specifying `'id'` is more semantically clear and future-proof

**Files changed:**
- `src/hooks/usePlatformStats.ts`

---

## Issue 3: Excessive `select('*')` Queries

**Problem:** ~284 files use `.select('*')` fetching all columns when only a subset is needed. Key offenders:

- `PropertyDetail.tsx`: Fetches `select('*')` for related properties (lines 291, 306) when only `id, title, price, images, location, property_type` are displayed
- `LiveMonitoringDashboard.tsx`: `select('*')` on `activity_logs` but only uses 5 fields
- `useOrders.ts`: `select('status')` is correct for stats, but main query uses `select('*')`
- `CSPerformanceMonitor.tsx`: `select('*')` on 4 tables with no limits

**Fix:** Replace `select('*')` with explicit column lists in the highest-traffic queries:

| File | Current | Optimized |
|------|---------|-----------|
| `PropertyDetail.tsx` (related) | `select('*')` | `select('id, title, price, images, location, property_type, listing_type, bedrooms, bathrooms, land_size')` |
| `LiveMonitoringDashboard.tsx` | `select('*')` on activity_logs | `select('id, activity_type, user_id, activity_description, created_at, metadata')` |
| `queryClient.ts` prefetch | `select('*')` on properties | `select('id, title, price, images, location, property_type, status')` |
| `CSPerformanceMonitor.tsx` | 4x `select('*')` with no limit | Add `.limit()` and select specific columns |

**Files changed:**
- `src/pages/PropertyDetail.tsx`
- `src/components/admin/LiveMonitoringDashboard.tsx`
- `src/lib/queryClient.ts`
- `src/components/admin/cs-tools/CSPerformanceMonitor.tsx`

---

## Issue 4: Missing Query Limits

**Problem:** Several queries fetch unbounded result sets which can return up to 1000 rows (Supabase default):

- `CSPerformanceMonitor.tsx`: `select('*')` on `customer_complaints`, `inquiries`, `live_chat_sessions` — no limit
- `usePlatformStats.ts`: The `vendor_reviews` rating query fetches ALL reviews to compute avg in JS
- `usePropertyAlerts.ts`: Limited to 20, which is fine

**Fix:**
- Add `.limit()` to unbounded queries
- For avg rating computation, use a database function or `.select('rating')` with a reasonable limit, or better yet create an RPC function

**Files changed:**
- `src/components/admin/cs-tools/CSPerformanceMonitor.tsx`
- `src/hooks/usePlatformStats.ts`

---

## Issue 5: SharedSearch.tsx Creates New Channels Without Reusing

**Problem:** In `SharedSearch.tsx`, functions like `handleSaveFilter`, `handleRemoveFilter`, `handleSortChange`, `handleViewChange`, and `toggleFilter` each create `supabase.channel(`collab-${shareId}`)` to send broadcasts. These create new channel instances each invocation instead of reusing the existing `channelRef.current`.

**Fix:** Replace all `supabase.channel(...)` broadcast calls with `channelRef.current?.send(...)`.

**Files changed:**
- `src/pages/SharedSearch.tsx`

---

## Issue 6: `ProjectMapVisualization` — 3 Separate Channels for Same Component

**Problem:** Creates 3 channels (`project-map-bookings`, `project-map-reviews`, `project-map-properties`) that all call `refetch()`. These can be consolidated into a single channel with multiple `.on()` listeners.

**Fix:** Merge into one channel with 3 `.on()` handlers.

**Files changed:**
- `src/components/admin/ProjectMapVisualization.tsx`

---

## Issue 7: `useOptimizedQuery` — Stale Default Config

**Problem:** `useOptimizedQuery` sets `refetchOnMount: false` which means navigating to a page won't show fresh data even if the cache is stale. Combined with `refetchOnWindowFocus: false`, users can see very outdated data.

**Fix:** Change to `refetchOnMount: 'always'` only when `staleTime` has elapsed (this is actually the default TanStack Query behavior, which is `true`). Keep `refetchOnWindowFocus: false` since the app has real-time subscriptions.

**Files changed:**
- `src/hooks/useOptimizedQuery.ts`

---

## Implementation Order

1. Consolidate duplicate real-time channels (Issues 1, 6)
2. Debounce and optimize `usePlatformStats` (Issues 2, 4)
3. Fix SharedSearch channel reuse (Issue 5)
4. Optimize high-traffic `select('*')` queries (Issue 3)
5. Add missing query limits (Issue 4)
6. Fix `useOptimizedQuery` defaults (Issue 7)

Total files to modify: ~8 files. One file to delete/deprecate (`useAdminAlerts.ts`).

