

# Add Skeleton Loading States for Property Card Text Content

## Overview

Extend the existing blur-up image loading to include text content (title, price, location, specs). While the image is loading (`isImageLoaded === false`), show skeleton shimmer placeholders for all text areas too, then reveal everything together for a cohesive loading experience.

## Approach

Reuse the existing `isImageLoaded` state as the trigger. When `false`, render skeleton placeholders instead of actual text content. When the image finishes loading, both image and text appear simultaneously.

## Changes

### 1. `src/components/property/ASTRAVillaPropertyCard.tsx`

In the content section (lines 193-257), conditionally render skeletons when `!isImageLoaded`:

- **Price box** (line 195-215): Replace with a shimmer block (`h-8 w-full rounded-lg bg-muted animate-pulse`)
- **Title** (line 218-220): Replace with a shimmer line (`h-3 w-3/4 rounded bg-muted animate-pulse`)
- **Location** (line 223-226): Replace with a shimmer line (`h-3 w-1/2 rounded bg-muted animate-pulse`)
- **Specs row** (line 229-256): Replace with small shimmer blocks

When `isImageLoaded` is true, render the normal content as-is (no changes to existing markup).

### 2. `src/components/PropertyCard.tsx`

In the CardContent section (lines 181-265), conditionally render skeletons when `!isImageLoaded`:

- **Title** (line 182-184): Shimmer line
- **Location** (line 216-219): Shimmer line
- **Price** (line 221-228): Shimmer block
- **Specs** (line 230-243): Small shimmer blocks
- **Buttons** (line 245-264): Shimmer button placeholders

### Implementation Pattern

```tsx
{/* Content Section */}
<div className="p-2 sm:p-3 space-y-2">
  {!isImageLoaded ? (
    <>
      <div className="h-8 w-full rounded-lg bg-muted animate-pulse" />
      <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
      <div className="flex gap-1.5 pt-2 border-t border-border/30">
        <div className="h-3.5 w-10 rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-10 rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-14 rounded bg-muted animate-pulse" />
      </div>
    </>
  ) : (
    // existing content JSX unchanged
  )}
</div>
```

### Files Modified

| File | Change |
|------|--------|
| `src/components/property/ASTRAVillaPropertyCard.tsx` | Wrap content section in `isImageLoaded` conditional with skeleton fallback |
| `src/components/PropertyCard.tsx` | Wrap CardContent children in `isImageLoaded` conditional with skeleton fallback |

No new files or dependencies needed.

