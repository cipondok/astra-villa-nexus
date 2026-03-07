

## Plan: Add Completed vs Uncompleted Progress Overview

### Problem
The current UI shows completed and remaining provinces in the Smart Selection panel, but there's no prominent, always-visible progress summary showing completed vs uncompleted status with details.

### Changes

**File: `src/components/admin/SamplePropertyGenerator.tsx`**

1. **Add a new "Progress Overview" card** between the header and the Auto-Run card that is always visible (not hidden inside the Smart Selection accordion). It will contain:

   - A visual progress bar showing `completed / total` provinces
   - Two collapsible sections:
     - **Completed provinces** (green): Each entry shows province name, property count, completion timestamp, cities and areas covered
     - **Uncompleted provinces** (amber/orange): Each entry shows province name with a "pending" indicator
   - Summary stats row: total completed, total remaining, total properties generated

2. **Progress bar**: Use the existing `<Progress>` component with `multiColor` to show the ratio visually at a glance.

3. **Data sources**: Combine `allCompletedProvinces`, `actualRemainingProvinces`, `persistedDoneRecords`, and `provincePropertyCounts` — all already computed in the component.

This is a UI-only addition with no backend changes. The new card provides at-a-glance visibility without needing to expand the Smart Selection panel.

