

## State SEO Overview — Assessment & Refactoring Plan

### Current State

After reviewing all 1511 lines of `PropertySEOChecker.tsx`, the component **already implements** every feature you listed:

- Checkboxes per province row (line 872-881)
- "Select All Weak" button filtering `poor` + `needs-work` (line 778-783)
- Summary cards: Global Avg, Good, Needs Work, Poor, Unanalyzed (lines 797-839)
- Province rows with: Rank, Name, Total/Analyzed counts, Avg SEO score, Keyword score, Top keywords, Status icon, Progress bar (lines 855-964)
- Color-coded score bars: green ≥70, yellow ≥40, red <40 (line 859)
- Threshold selector (50/60/70/80) (lines 755-764)
- Confirmation AlertDialog before running fixes (lines 974-1014)
- Proper `Set<string>` typing for `selectedStates` (line 333)
- Immutable state updates via `new Set()` (line 875-877)

No console errors were detected. The JSX compiles correctly.

### What needs improvement

The component is a 1511-line monolith. The "states" tab alone spans ~275 lines inline. The main issues are **maintainability** and a **scalability concern** in the data hook (`useStateSeoStats` uses `.in('id', ...)` with up to 500 IDs — line 196).

### Plan

#### 1. Extract `StateSeoOverviewTab` into its own file
Move lines 742-1015 into `src/components/admin/seo/StateSeoOverviewTab.tsx`. Props: `stateSeoOverview`, `stateOverviewLoading`, `selectedStates`, `setSelectedStates`, `autoFixThreshold`, `setAutoFixThreshold`, `showAutoFixConfirm`, `setShowAutoFixConfirm`, `autoOptimize`, `filterState`, `setFilterState`, `setActiveTab`.

#### 2. Extract summary cards into `SeoStateSummaryCards`
Move the IIFE block (lines 798-839) into `src/components/admin/seo/SeoStateSummaryCards.tsx`.

#### 3. Fix `.in()` overflow in `useStateSeoStats`
Line 196: `.in('id', Array.from(seoPropertyIds).slice(0, 500))` risks URL overflow. Replace with chunked 50-ID batches (same pattern used in the edge function fix).

#### 4. Extract province row into `ProvinceRow` component
Lines 855-963 render each province. Extract to a memoized `ProvinceRow` component to improve re-render performance when selecting/deselecting checkboxes.

### Files to create/modify
- **Create** `src/components/admin/seo/StateSeoOverviewTab.tsx`
- **Create** `src/components/admin/seo/SeoStateSummaryCards.tsx`
- **Create** `src/components/admin/seo/ProvinceRow.tsx`
- **Modify** `src/components/admin/PropertySEOChecker.tsx` — replace inline tab content with imported component, fix chunked query in `useStateSeoStats`

