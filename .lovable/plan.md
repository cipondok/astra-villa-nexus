
# Add Blur-Up Lazy Loading for Property Card Images

## Overview

Add a blur-up placeholder effect to property card images across both `PropertyCard.tsx` and `ASTRAVillaPropertyCard.tsx`. When images load on slow connections, users will see a pulsing blurred placeholder that transitions smoothly to the full image once loaded.

## Approach

Rather than introducing a new component (the project already has `LazyImage` and `OptimizedImage`), we will add inline blur-up state directly to the two property card components. This keeps changes minimal and avoids refactoring the existing image rendering logic.

## Changes

### 1. `src/components/PropertyCard.tsx`

- Add `isImageLoaded` state (boolean, default `false`)
- Wrap the existing `<img>` in a container with a blurred placeholder background
- Add `onLoad` handler to transition from blur to sharp
- The placeholder will be a `bg-muted animate-pulse` div with a CSS blur filter
- On load, the image fades in with `opacity-0 -> opacity-100` transition

### 2. `src/components/property/ASTRAVillaPropertyCard.tsx`

- Same pattern: add `isImageLoaded` state
- The image container already has `bg-muted` and `aspect-[4/3]` -- add the blur placeholder overlay and fade-in transition on the `<img>` element
- Add `onLoad` handler alongside the existing `onError` handler

## Technical Details

Both components will use the same pattern:

```tsx
// New state
const [isImageLoaded, setIsImageLoaded] = useState(false);

// In the image container:
{/* Blur placeholder */}
{!isImageLoaded && (
  <div className="absolute inset-0 bg-muted animate-pulse" />
)}

{/* Image with fade-in */}
<img
  src={...}
  alt={...}
  loading="lazy"
  onLoad={() => setIsImageLoaded(true)}
  onError={...}
  className={cn(
    "w-full h-full object-cover transition-opacity duration-500",
    isImageLoaded ? "opacity-100" : "opacity-0",
    // existing hover classes
  )}
/>
```

### Files Modified

| File | Change |
|------|--------|
| `src/components/PropertyCard.tsx` | Add `isImageLoaded` state, blur placeholder div, fade-in transition on img |
| `src/components/property/ASTRAVillaPropertyCard.tsx` | Add `isImageLoaded` state, blur placeholder div, fade-in transition on img |

No new files or dependencies needed.
