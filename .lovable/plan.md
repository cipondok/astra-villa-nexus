

# Admin Alerts System Upgrade

## Current State
The `AdminAlertSystem.tsx` is a single 1032-line component with:
- A flat list of all alerts in a ScrollArea (h-80)
- No category filtering/tabs
- No bulk actions (clear all, move to trash)
- Card-based alert rows that are somewhat bulky
- No actual counts by category shown

## Plan

### 1. Add Category Tabs
Add tabs above the alert list to filter by alert type:
- **All** (total count badge)
- **Verification** (kyc_verification, company_verification)
- **Property** (property_listing)
- **Profile** (profile_update)
- **System** (error, warning, system_error, success)
- **Other** (everything else)

Each tab shows its count. Use the existing `AdminTabs` component pattern.

### 2. Bulk Actions Bar
Add a toolbar between tabs and the list:
- **"Clear All Read"** — deletes all `is_read: true` alerts (moves to trash concept)
- **"Mark All as Read"** — marks all filtered alerts as read
- Show counts: "Showing X of Y alerts"

### 3. Slim Table View
Replace the current card-style rows with a compact table-like layout:
- Single row per alert: `Icon | Title (truncated) | Type badge | Priority badge | Time ago | Actions`
- Smaller padding (`py-1.5 px-2`), `text-xs` sizing
- Unread rows get subtle left border accent
- Smooth scroll with CSS `scroll-behavior: smooth` on the ScrollArea

### 4. Actual Counts Display
- Today's Activity cards already show counts — keep those
- Add per-category counts in tab badges
- Show total alert count and unread count in the header

### 5. Smooth Scrolling & Animation
- Add `scroll-smooth` class to ScrollArea
- Use framer-motion `AnimatePresence` + `motion.div` for alert row enter/exit animations

### Files to Edit
- `src/components/admin/AdminAlertSystem.tsx` — full refactor of the UI rendering section (lines 593-1018), add state for category filter, bulk mutation functions, slim row layout

