

## Plan: Enhanced Property SEO Checker

### What Exists Now
The current `PropertySEOChecker.tsx` has: dashboard stats, batch analyze, auto-optimize, property list with scores, and a detail view with sub-scores and checklist. The `useSeoIntelligence.ts` hook already has functions for: `useAnalyzeProperty`, `useAnalyzeBatch`, `useAutoOptimize`, `useApplySeo`, `useContentOptimize`, `useCompetitorAnalysis`, `useSerpPreview`, and `useSeoTrendKeywords`.

### What to Build

Enhance `PropertySEOChecker.tsx` with these features:

**1. Auto-Check on Click** -- When clicking a property row, auto-trigger `analyzeProperty.mutate(propertyId)` if not recently analyzed (>1hr old). Show a small "Analyzing..." spinner during the check.

**2. Manual Property Selector** -- Add a searchable dropdown/combobox at the top that lets admin pick any property from the database (not just already-analyzed ones) and trigger analysis on it. Uses `supabase.from('properties').select('id, title, location')` with search filter.

**3. AI Improvement Indicator** -- In the detail view, add an "AI Recommendations" card that calls `useContentOptimize` and displays:
  - Optimized title vs current title (side-by-side diff)
  - Optimized description suggestion
  - Focus keywords and secondary keywords
  - Readability tips as actionable items
  - One-click "Apply AI Suggestions" button

**4. Enhanced Title & Description Checker** -- Show character count with ideal range indicators (Title: 50-60 chars, Description: 120-160 chars). Color-coded length bar (green=ideal, yellow=close, red=too short/long).

**5. Manual Keywords Manager** -- Editable keyword input where admin can:
  - Add/remove custom keywords (tag-style input)
  - Save custom keywords to `custom_keywords` field via Supabase update
  - See which are "strong" vs "weak" based on trend data

**6. Trending & Strong Keyword Checker** -- New tab "Keywords" that uses `useSeoTrendKeywords` to show:
  - Trending keywords table with search volume, trend direction, competition level
  - Filter by category and language
  - "Apply to Property" button that adds a trending keyword to the selected property's keyword list
  - Keyword strength indicator (high volume + low competition = strong)

### Files to Change

1. **`src/components/admin/PropertySEOChecker.tsx`** -- Major rewrite to add all 6 features above. Add new tabs: "Keywords" for trending data. Expand detail view with AI recommendations, character counters, and manual keyword manager.

### Technical Details

- Property selector: query `properties` table with `.ilike('title', '%search%')` for search
- Auto-check: compare `last_analyzed_at` timestamp, auto-trigger if stale
- Manual keywords: direct Supabase update to `property_seo_analysis.custom_keywords`
- Trending keywords: already supported by `useSeoTrendKeywords` hook
- Content optimize: already supported by `useContentOptimize` hook
- No new database tables or edge functions needed -- all hooks exist

