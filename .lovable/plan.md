

# Add Property Comparison Feature

## Overview

The comparison infrastructure (context, button, panel, comparison page) already exists but is not wired up. This plan connects all the pieces and enhances the comparison page with a proper side-by-side specs table.

## Changes

### 1. Add comparison button to `CompactPropertyCard`

**File:** `src/components/property/CompactPropertyCard.tsx`

- Import `PropertyComparisonButton` and add it to the top-right action buttons (next to the heart/share buttons)
- Pass the converted `BaseProperty` to it

### 2. Render `PropertyComparisonPanel` in the app layout

**File:** `src/App.tsx`

- Import and render `PropertyComparisonPanel` inside the `PropertyComparisonProvider` so the floating "Compare" button with badge appears globally when properties are selected

### 3. Add route for `/property-comparison`

**File:** `src/App.tsx`

- Add lazy import for `PropertyComparison` page
- Add `<Route path="/property-comparison" element={<PropertyComparison />} />`

### 4. Upgrade the comparison page with a specs table

**File:** `src/pages/PropertyComparison.tsx`

Replace the current card-grid layout with a horizontal comparison table:

- **Header row**: Property images and titles side-by-side (2-4 columns)
- **Table rows** for each spec:
  - Price
  - Location (city/state)
  - Property Type
  - Listing Type
  - Bedrooms
  - Bathrooms
  - Area (m2)
  - Price per m2
  - 3D Tour availability
- Use the existing `Table` component from `@/components/ui/table`
- Highlight best values (lowest price, largest area) with colored badges
- Keep the existing summary section at the bottom
- Add a "Remove" button on each property column header
- Responsive: on mobile, the table scrolls horizontally

## Technical Details

### Table structure

```text
| Spec          | Property 1      | Property 2      | Property 3      |
|---------------|-----------------|-----------------|-----------------|
| [Image]       | [img]           | [img]           | [img]           |
| Title         | Villa Bali...   | Rumah Jakarta.. | Apt Surabaya... |
| Price         | IDR 2.5B *low*  | IDR 3.1B        | IDR 4.0B *high* |
| Location      | Bali            | Jakarta         | Surabaya        |
| Type          | Villa           | House           | Apartment       |
| Bedrooms      | 4               | 3               | 2               |
| Bathrooms     | 3               | 2               | 1               |
| Area          | 250 m2 *large*  | 180 m2          | 85 m2 *small*   |
| Price/m2      | IDR 10M         | IDR 17.2M       | IDR 47M         |
| 3D Tour       | Yes             | No              | Yes             |
```

### Files summary

| File | Action |
|------|--------|
| `src/components/property/CompactPropertyCard.tsx` | Add comparison button to card actions |
| `src/App.tsx` | Add route + render PropertyComparisonPanel |
| `src/pages/PropertyComparison.tsx` | Rewrite with side-by-side Table layout |

No new files or dependencies needed. All components and UI primitives already exist.
