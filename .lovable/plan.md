

## Issues Identified

1. **Location filter not affecting data tables**: The `filteredAnalyses` (line 429) only filters by `searchQuery` text — it ignores `filterState`, `filterCity`, `filterArea`. The `usePropertySeoAnalyses` hook fetches from `property_seo_analysis` table without any location join/filter.

2. **No pagination — "25 per page" but no next/prev**: Data is sliced to 25 with `.slice(0, 25)` but there's no pagination control. All data beyond 25 is hidden with no way to navigate.

3. **Location filter doesn't show selected SEO status summary**: When a state/city is selected, there's no summary card showing the SEO status for that filtered location.

4. **Analytics section needs improvement**: Score distribution and stats overview don't reflect filtered location context.

## Plan

### 1. Make location filters actually filter the data tables
- Modify `usePropertySeoAnalyses` hook to accept optional `state`, `city`, `area` parameters
- Join with `properties` table to filter by location: use a subquery or RPC to get property IDs matching location, then filter SEO analyses by those IDs
- Pass `filterState`, `filterCity`, `filterArea` from the component into all three hooks (all, weak, top)

### 2. Add filtered location SEO status card
- When a state/city/area is selected, show a summary card below the filter displaying:
  - Total properties in that location
  - Analyzed vs unanalyzed count
  - Average SEO score with color badge
  - Top keywords for that location
  - Score distribution bar for that specific location

### 3. Add proper pagination (25 per page)
- Add `currentPage` state variable
- Use `SearchPagination` component (already exists in the project)
- Calculate total count from the query (use Supabase `.count()` or fetch total separately)
- Pass `range()` to the Supabase query: `.range((page-1)*25, page*25-1)`
- Apply pagination to All Properties, Weak, and Top tabs independently

### 4. Improve analytics section
- Make the stats overview cards respond to location filters (show stats for selected location only)
- Add a mini analytics card when location is filtered showing:
  - Score trend indicator (up/down vs overall average)
  - Keyword coverage percentage for that location
  - Count breakdown (excellent/good/needs-work/poor) for filtered results
- Improve score distribution bar to show filtered vs overall comparison

### Files to modify:
- `src/hooks/useSeoIntelligence.ts` — Add location filter params to `usePropertySeoAnalyses`, add count query
- `src/components/admin/PropertySEOChecker.tsx` — Wire filters to data hooks, add pagination, add filtered status card, improve analytics display

