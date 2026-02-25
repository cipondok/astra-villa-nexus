

## Fix: Remaining `fetchPriority` Console Warning

### Problem

The only remaining console warning is React 18's `fetchPriority` prop error. React 18 doesn't recognize camelCase `fetchPriority` on native DOM elements — it expects lowercase `fetchpriority`. This was noted previously but not fully resolved. The warning originates from `Index.tsx` line 602.

### Fix

Use a ref-based approach to set `fetchpriority` as a native DOM attribute, bypassing React's prop validation. This avoids the warning while keeping the performance benefit.

#### Files to Change

**1. `src/pages/Index.tsx` (~line 602)**
- Remove `fetchPriority={isPriority ? 'high' : undefined}` from JSX
- Use a `ref` callback to set the attribute directly: `ref={(el) => { if (el && isPriority) el.setAttribute('fetchpriority', 'high'); }}`

**2. `src/components/AnimatedLogo.tsx` (~line 30)**
- Same pattern: remove `fetchPriority="high"` from the `<img>`, use ref callback to set `fetchpriority` attribute directly.

**3. `src/components/ui/OptimizedImage.tsx` (~line 98)**
- Remove `fetchPriority` from the `<img>` JSX props
- Use ref callback: `ref={(el) => { if (el) { const fp = fetchPriority || (priority ? 'high' : undefined); if (fp) el.setAttribute('fetchpriority', fp); } }}`
- Keep the `fetchPriority` component prop interface unchanged (it's not a DOM prop, just a component prop).

**4. `src/components/property/EnhancedImageGallery.tsx` (~line 143)**
- Same ref-based pattern for the `fetchPriority` on the gallery image.

### Why ref-based?
This is the standard workaround for React 18. React 19 adds native `fetchPriority` support, but upgrading React is out of scope. The ref approach sets the attribute after mount, which still works for the browser's fetch prioritization since images start loading after the element is in the DOM.

