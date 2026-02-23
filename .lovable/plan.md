

# Update "Dijual / Disewa" Price Labels Style on Property Cards

## Overview

Update the sale/rent listing type labels across all property display components with a more polished, modern style -- using gradient backgrounds, icons, and consistent design language.

## Current State

The "Dijual" (For Sale) and "Disewa" (For Rent) badges are styled inconsistently across components:
- **PropertyCard**: flat `bg-chart-1` / `bg-primary` badges
- **ASTRAVillaPropertyCard**: `bg-gold-primary` rounded-full pills
- **DemoPropertyList**: outline badges with emoji prefixes
- **PropertyImporter / PropertyPreview**: similar flat badges

## New Label Style

A unified, premium label design:
- **Sale ("Dijual")**: Green gradient background (`emerald-500` to `green-600`), white text, Tag icon, slight shadow, rounded-md
- **Rent ("Disewa")**: Blue gradient background (`sky-500` to `blue-600`), white text, Key icon, slight shadow, rounded-md
- Slightly larger padding, bold text, subtle `backdrop-blur` and `shadow-md` for depth
- Consistent across all property card types

## Files to Modify

| File | Change |
|------|--------|
| `src/components/property/PropertyCard.tsx` | Update sale/rent badge at lines 184-192 with gradient style + icon |
| `src/components/property/ASTRAVillaPropertyCard.tsx` | Update listing label at lines 134-143 with matching gradient style |
| `src/components/propertyowner/DemoPropertyList.tsx` | Update `getListingTypeText` function and badge styling to use gradient + icon instead of emoji |
| `src/components/property/PropertyImporter.tsx` | Update badge at line 213-215 with new gradient style |
| `src/components/property/PropertyPreview.tsx` | Update badge at line 56-57 with new gradient style |
| `src/components/property/PropertyDetailModal.tsx` | Update forSale/forRent label rendering with matching style |

## Technical Details

### Shared style pattern applied to each component

```tsx
// Sale label
<Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md border-0 flex items-center gap-1">
  <Tag className="h-3 w-3" />
  Dijual
</Badge>

// Rent label
<Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md border-0 flex items-center gap-1">
  <Key className="h-3 w-3" />
  Disewa
</Badge>
```

### Per-file adjustments

- **ASTRAVillaPropertyCard**: Uses `<span>` instead of `<Badge>`, will keep `<span>` but apply the same gradient classes. Size stays compact (`text-[9px]`) to fit the card overlay.
- **DemoPropertyList**: Remove emoji from `getListingTypeText`, use icon-based gradient badges inline.
- **PropertyPreview**: Keep `variant="outline"` removed, apply gradient directly.

