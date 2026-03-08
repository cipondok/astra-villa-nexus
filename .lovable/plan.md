

## Problem

When a location filter (state/city/area) is selected in the SEO Checker, clicking "Auto-Optimize" and "Analyze Batch" ignores the filter completely. Both the frontend hooks and the edge function handler operate globally.

**Root cause chain:**
1. `useAutoOptimize` hook only accepts `{ threshold, limit }` -- no location params
2. The button passes `autoOptimize.mutate({ threshold: 50, limit: 10 })` -- no location
3. Edge function `auto-optimize` handler queries `property_seo_analysis` globally
4. Same issue for `useAnalyzeBatch` and its edge function handler

## Plan

### 1. Update `useAutoOptimize` hook to accept location filters
- Add optional `state`, `city`, `area` params to the mutation function
- Pass them through to the edge function payload

### 2. Update `useAnalyzeBatch` hook similarly
- Add optional location params to mutation function
- Pass through to edge function payload

### 3. Update PropertySEOChecker button calls
- Pass `locationFilters` (state/city/area) when calling `autoOptimize.mutate()` and `analyzeBatch.mutate()`

### 4. Update edge function `auto-optimize` handler
- Accept optional `state`, `city`, `area` in payload
- When location is provided, first query `properties` table filtered by location to get IDs
- Then filter `property_seo_analysis.property_id` to only those location-matching IDs before applying the threshold filter

### 5. Update edge function `analyze-batch` handler
- Accept optional `state`, `city`, `area` in payload
- When location is provided, filter candidate properties by location columns before selecting unanalyzed ones

### Files to modify
- `src/hooks/useSeoIntelligence.ts` -- Add location params to `useAutoOptimize` and `useAnalyzeBatch`
- `src/components/admin/PropertySEOChecker.tsx` -- Pass location filters to mutate calls
- `supabase/functions/ai-engine/index.ts` -- Add location filtering to `auto-optimize` and `analyze-batch` handlers

