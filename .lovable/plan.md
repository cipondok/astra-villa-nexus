

# Admin Panel Style Issues Audit & Fix Plan

## Issues Found

### 1. AdminCategoryTabs: `text-[7px]` badge — below minimum readability
**File**: `src/components/admin/AdminCategoryTabs.tsx` line 148
Badge text uses `text-[7px]` which is below even the admin minimum of `text-[8px]`.
**Fix**: Change to `text-[8px]`.

### 2. AdminCategoryTabs: `text-[8px]` count badge in header — lacks contrast
**File**: `src/components/admin/AdminCategoryTabs.tsx` line 180
The section count uses `text-[8px]` with `text-[hsl(var(--panel-text-muted))]` on a muted background, making it nearly invisible.
**Fix**: Bump to `text-[9px]` and use `--panel-text-secondary` for better readability.

### 3. CategoryOverviewDashboard: Grid description `text-[8px]` clipping
**File**: `src/components/admin/CategoryOverviewDashboard.tsx` line 309
Grid card descriptions use `text-[8px]` which is acceptable for admin but combined with `max-w-[120px]` and `line-clamp-2` causes aggressive clipping on shorter viewports.
**Fix**: Increase `max-w` to `[140px]` for better utilization.

### 4. CategoryOverviewDashboard: ListView header `text-[8px]` column labels
**File**: `src/components/admin/CategoryOverviewDashboard.tsx` line 182-184
Column headers ("Module", "Status", "→") use `text-[8px]` — acceptable but the arrow column header "→" is confusing and non-semantic.
**Fix**: Replace "→" with "Action" for clarity.

### 5. AdminCategoryTabs: Sticky `z-40` conflicts with sidebar `z-[9999]`
**File**: `src/components/admin/AdminCategoryTabs.tsx` line 164
The tabs bar is `sticky top-0 z-40`. When the sidebar flyout is open, the tabs can peek through the backdrop overlay (z-[9998]) on some scroll positions since the main content area has its own stacking context.
**Fix**: Lower to `z-30` or ensure it sits below the backdrop.

### 6. AdminHeader: Notification ping animation stacks
**File**: `src/components/admin/AdminHeader.tsx` line 191
The `animate-ping` span on the notification badge creates an ever-expanding ring. When combined with the `absolute` positioned badge, it overflows the button bounds and can overlap adjacent header icons.
**Fix**: Add `overflow-hidden` to the badge container span (line 190).

### 7. AdminBreadcrumb: Category click navigates to first section instead of overview
**File**: `src/components/admin/AdminBreadcrumb.tsx` line 21, 31
When clicking the category name in the breadcrumb, it navigates to `sections?.[0]?.key` (the first sub-section) rather than the category overview. This is inconsistent with the sidebar which navigates to `{category}-overview`.
**Fix**: Change `categoryFirstSection` to use `${category}-overview` pattern.

### 8. Overview 3-column grid: Left column `col-span-3` too narrow on md breakpoint
**File**: `src/components/admin/overview/LeftStatsColumn.tsx` line 36
At `md` breakpoint (768px), `col-span-3` out of 12 = 25% width ≈ 192px. MetricRow labels and sparklines get cramped.
**Fix**: Change to `md:col-span-4` and adjust center to `md:col-span-5` for better balance.

---

## Implementation Summary

| File | Change |
|------|--------|
| `AdminCategoryTabs.tsx` | Fix `text-[7px]` → `text-[8px]`, improve count badge contrast, lower sticky z-index |
| `CategoryOverviewDashboard.tsx` | Widen grid description max-w, clarify "→" column header |
| `AdminHeader.tsx` | Add `overflow-hidden` to notification badge container |
| `AdminBreadcrumb.tsx` | Fix category click to use `{category}-overview` pattern |
| `LeftStatsColumn.tsx` + `CenterActivityColumn.tsx` | Rebalance column spans for md breakpoint |

All changes are CSS/layout-only except the breadcrumb navigation fix. No new components or dependencies needed.

