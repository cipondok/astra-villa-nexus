

# Consolidate Investment into a Single Page

## Overview

Currently, investment content is split across 3 separate pages:
- `/foreign-investment` -- General foreign investment guide (public) + dashboard (logged in)
- `/investor/wna` -- WNA (Foreign Investor) sub-page with 10 tabs
- `/investor/wni` -- WNI (Indonesian Overseas) sub-page with 5 tabs

The plan is to merge everything into one unified `/foreign-investment` page with all WNA, WNI, and common investment functions accessible via tabs/sections -- no sub-pages needed.

## Architecture

The single page will have a top-level section selector (WNA / WNI / Common) and within each section, the relevant tabs from the existing sub-pages.

**Structure:**

```text
/foreign-investment
+-- Hero + Auth Section
+-- Section Selector: [All Investment | WNA (Foreign) | WNI (Overseas Indonesian)]
|
+-- "All Investment" section:
|   Overview, Steps, Eligibility, AI Chat, FAQ, Ownership, Documents, Rules, Contact
|   (existing ForeignInvestment.tsx content)
|
+-- "WNA" section:
|   Countries, Property Types, Facilities, Process, Regulations,
|   Citizenship, Family Benefits, Eligibility, Timeline, FAQ
|   (existing WNAPage.tsx tab content)
|
+-- "WNI" section:
|   Eligible Countries, Check Eligibility, Requirements, Credit Check, Payment Methods
|   (existing WNIPage.tsx tab content)
|
+-- Dashboard section (when logged in):
|   Orders, Inquiries, Ideas, Chat
|   (existing UserInvestmentDashboard content)
```

## Changes

### 1. Rewrite `src/pages/ForeignInvestment.tsx`

Restructure the page to include:
- A top-level segment/toggle: **All Investment**, **WNA (Foreign Investor)**, **WNI (Overseas Indonesian)**
- When "WNA" is selected, render the WNA tabs (Countries, Property Types, Facilities, Process, Regulations, Citizenship, Family Benefits, Eligibility, Timeline, FAQ) using the existing WNA components
- When "WNI" is selected, render the WNI tabs (Countries, Eligibility, Requirements, Credit Check, Payment) using the existing WNI components
- When "All Investment" is selected, show the current overview content (investment opportunities, steps, eligibility checker, AI chat, FAQ, ownership types, documents, restrictions, contact)
- For logged-in users, add a "My Dashboard" tab/section that includes the UserInvestmentDashboard content inline (instead of replacing the entire page)
- Keep the hero section, auth section, benefits, VIP section, and CTA from WNA/WNI pages combined into the unified layout

### 2. Update `src/App.tsx`

- Keep `/foreign-investment` route pointing to the updated page
- Remove `/investor/wna` and `/investor/wni` routes (or redirect them to `/foreign-investment`)

### 3. Update Navigation references

- In `src/components/Navigation.tsx`: The "Foreign Investment" menu item already points to `/foreign-investment` -- keep as-is, remove "Investment" dropdown since there's only one destination now (make it a direct link)
- In `src/components/home/InvestorPathSelector.tsx`: Update WNI/WNA paths to point to `/foreign-investment` with appropriate query params or hash anchors (e.g., `/foreign-investment?section=wna`)

### 4. Clean up (optional, can be done later)

- `src/pages/investor/WNAPage.tsx` and `src/pages/investor/WNIPage.tsx` can be removed or kept as redirects

## Technical Details

### Top-level section selector implementation

Use a state variable `activeSection` with values `'all' | 'wna' | 'wni' | 'dashboard'`. Render as styled buttons/pills at the top of the page. Read initial section from URL search params (`?section=wna`) so deep-links from the home page InvestorPathSelector still work.

### Component reuse

All existing WNA components (`WelcomingCountriesList`, `WNAPropertyTypes`, `WNAInvestmentFacilities`, etc.) and WNI components (`EligibleCountriesSelector`, `KPRRequirementsChecklist`, etc.) will be imported directly -- no duplication of code.

### Files to modify

| File | Change |
|------|--------|
| `src/pages/ForeignInvestment.tsx` | Major rewrite: add WNA/WNI sections with their tabs inline |
| `src/App.tsx` | Remove or redirect `/investor/wna` and `/investor/wni` routes |
| `src/components/Navigation.tsx` | Simplify Investment dropdown to direct link |
| `src/components/home/InvestorPathSelector.tsx` | Update WNI/WNA card paths to `/foreign-investment?section=wna` etc. |

