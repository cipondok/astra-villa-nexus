

## Issue: Hero Branding Text Overlaps Search Panel on Mobile

**What I found:** On mobile (375x812), the "ASTRA" and "VILLA PROPERTY" branding text positioned at the top (`pt-[8%]`) collides with the search panel overlay. The search panel uses `max-h-[85vh]` and is positioned from the bottom, but on small screens it extends far enough upward to overlap the branding.

**Screenshot evidence:** The "ASTRA" text sits directly behind "Find Your Dream Property" and the search filters, making both unreadable.

## Solution

Two options to fix this:

**Option A (Recommended): Hide branding on mobile, show only on larger screens**
- The search panel already contains its own "AI-POWERED SEARCH" and "PREMIUM REAL ESTATE" badges, so the floating branding is redundant on mobile.
- Add `hidden sm:flex` to the branding container so it only appears on screens >= 640px.

**Option B: Push branding higher and make it smaller on mobile**
- Reduce mobile padding to `pt-[2%]` and shrink text sizes further.
- Risk: still may overlap on very small screens or when search panel is expanded.

### Technical Change (Option A)

**File: `src/pages/Index.tsx`, line 586**

Change:
```
flex items-start justify-center pt-[8%] sm:pt-[6%]
```
To:
```
hidden sm:flex items-start justify-center sm:pt-[6%]
```

This cleanly avoids the overlap by not rendering the decorative branding on mobile, where the search panel already provides context. On tablet and desktop, the branding remains visible at the top of the slider with proper spacing.

