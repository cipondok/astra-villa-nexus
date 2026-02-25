

## Plan: Add Interactive Hover Effects & Animations to ASTRA Villa Property Branding

### What We're Adding
Enhanced hover interactions and continuous animations on the hero branding text (visible on sm+ screens) to create a more premium, interactive feel.

### Technical Details

**File: `src/pages/Index.tsx` (lines 586-654)**

The branding container currently has `pointer-events-none`. We need to change it to allow hover interactions on the text elements while keeping the rest non-interactive.

#### Changes:

1. **Container (line 586)**: Keep `pointer-events-none` on the outer div but add `pointer-events-auto` on the inner content div (line 587) so hover works on the text elements.

2. **"ASTRA" text (lines 609-619)**: Add hover effects:
   - `transition-all duration-500 cursor-default`
   - On hover: scale up slightly, increase glow intensity, shimmer the gradient
   - Add a CSS shimmer animation using `background-size: 200%` and `background-position` shift on hover
   - Add `hover:scale-105` with `transform` transition
   - Add `hover:drop-shadow` with stronger gold glow

3. **"Villa Property" text (lines 620-628)**: Add hover effects:
   - `transition-all duration-500 cursor-default`
   - On hover: subtle letter-spacing expansion, slight gold tint
   - `hover:tracking-[0.35em]` and `hover:text-gold-primary/90`

4. **"Premium Real Estate" badge (lines 589-602)**: Add hover:
   - `transition-all duration-300 cursor-default hover:scale-105`
   - Brighter border and background on hover

5. **"Luxury Living Redefined" tagline (lines 642-653)**: Add hover:
   - `transition-all duration-300 cursor-default`
   - Brighter opacity on hover

6. **Decorative separator (lines 632-639)**: Add a continuous subtle pulse animation to the center diamond dot.

**File: `tailwind.config.ts`** — Add a new `text-shimmer` keyframe animation:
```
"text-shimmer": {
  "0%": { backgroundPosition: "200% center" },
  "100%": { backgroundPosition: "-200% center" }
}
```
And animation: `"text-shimmer": "text-shimmer 4s linear infinite"`

### Implementation Summary

- Make branding elements hoverable by adding `pointer-events-auto` to the inner div
- Add `transition-all duration-500` and scale/glow hover effects to "ASTRA"
- Add continuous shimmer animation to "ASTRA" gradient text using `background-size: 200%` and the new `text-shimmer` keyframe
- Add letter-spacing hover expansion on "Villa Property"
- Add scale hover on the badge
- Add pulse animation on the separator diamond
- All changes scoped to 2 files: `Index.tsx` and `tailwind.config.ts`

