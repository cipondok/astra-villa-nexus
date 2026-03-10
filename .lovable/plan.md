

# Fix System Settings Tab Bar — Two-Row Layout with Overflow

## Problem
The SystemSettings component has 16 tabs in a single horizontal scrolling line, making it hard to find tabs. User wants max 6 tabs per row with remaining tabs accessible.

## Solution
Split the 16 tabs into two rows:
- **Row 1** (6 tabs): General, SEO Hub, Website Design, Hero Slider, Branding, Social Media
- **Row 2** (10 tabs): Collapsed by default behind a "More" toggle button. Shows: Welcome Screen, Security, Notifications, Files, Discounts, Property Filters, Centralized Filters, ASTRA Tokens, System Monitor, Backup

Use a `ChevronDown`/`ChevronUp` toggle to expand/collapse the second row. When the active tab is in the second row, auto-expand it.

## File to Change
**`src/components/admin/SystemSettings.tsx`** (lines 82-100):
- Replace the single `TabsList` with two rows
- Row 1: First 6 tabs, always visible, plus a toggle button
- Row 2: Remaining 10 tabs, shown/hidden via local state
- Auto-expand row 2 when `activeTab` matches one of its tabs
- Use `flex-wrap` with `max-w` constraints per row, or two separate flex containers stacked vertically

