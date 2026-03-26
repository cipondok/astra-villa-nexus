

# Fix Dual/Legacy Style Conflicts in ASTRA Villa

## Problem Diagnosis

The platform displays inconsistent "old style" and "new style" due to **5 root causes**:

### 1. Duplicate `@tailwind` Directives (Critical)
- `src/index.css` has `@tailwind base/components/utilities` at lines 11-13
- `src/styles/mobile-first-responsive.css` **also** has `@tailwind base/components/utilities` at lines 1-3
- This file is `@import`ed at the top of `index.css`, causing Tailwind's base styles to be injected **twice**, with unpredictable cascade ordering

### 2. ThemeSettingsContext Injects Legacy Samsung/Titanium Variables
- `ThemeSettingsContext.tsx` (lines 67-72) dynamically sets `--samsung-blue-primary`, `--samsung-blue-light`, `--samsung-blue-dark`, `--titanium-light/medium/dark/white` CSS variables on every render
- These are **old brand tokens** that conflict with the current Sky Blue + Gold theme defined in `index.css`

### 3. DesignSystemProvider Overrides CSS Variables
- `DesignSystemProvider.tsx` sets font, spacing, radius, shadow, and animation CSS variables from a Zustand store with **persisted state**
- If a user visited the site during an older design iteration, stale values persist in localStorage (`design-system-config`), overriding current theme

### 4. Competing `@layer base` Blocks
- `index.css` line 215: `@layer base { :root { ... } }` — the main theme
- `mobile-first-responsive.css` line 10: `@layer base { html { ... } body { ... } }` — sets conflicting `line-height: 1.6` vs `index.css`'s `line-height: 1.5`, and `font-size: 1rem` vs `14px`

### 5. Inline Hardcoded Colors in Components
- 518 matches of inline `style={{ background/color: '#...' }}` across 40 files
- Components like `ServiceForm.tsx` use `bg-samsung-gradient`, `bg-samsung-blue` — legacy class names
- `VendorSmartSummary.tsx`, `VendorPerformanceDashboard.tsx`, `EnhancedVendorDashboard.tsx` use `samsung-gradient` class

---

## Implementation Plan

### Step 1: Remove Duplicate @tailwind from mobile-first-responsive.css
Remove lines 1-3 (`@tailwind base/components/utilities`) from `src/styles/mobile-first-responsive.css`. The file is already imported into `index.css` which has its own `@tailwind` directives.

### Step 2: Remove Legacy Samsung/Titanium Variable Injection
In `src/contexts/ThemeSettingsContext.tsx`, remove the 6 lines (67-72) that set `--samsung-blue-*` and `--titanium-*` CSS variables. These are already defined statically in `index.css` `:root` and `.dark` blocks with the correct current values.

### Step 3: Clear Stale DesignSystem localStorage
In `src/components/DesignSystemProvider.tsx`, add a version check that clears the persisted `design-system-config` if it was saved under an older schema version, ensuring users always get the current defaults.

### Step 4: Resolve Conflicting @layer base Rules
In `src/styles/mobile-first-responsive.css`, remove the `@layer base` block (lines 10-44) that conflicts with `index.css` base styles. Keep only `@layer utilities` and `@layer components` rules in that file.

### Step 5: Replace Legacy samsung-gradient References in Components
Update 4 files that use `samsung-gradient` or `bg-samsung-blue` classes to use the current theme tokens instead (e.g., `bg-primary` gradient equivalent).

### Step 6: Audit and Fix Critical Inline Styles
Replace the most impactful hardcoded inline color styles in page components with theme-aware CSS variable references, prioritizing user-facing pages.

---

## Expected Outcome
- Single consistent theme application (no flash of old styles)
- No duplicate Tailwind injection
- No stale design tokens from localStorage
- Clean cascade: one `@layer base` source of truth in `index.css`
- Estimated CSS reduction: ~50 lines of duplicate/conflicting rules removed

