

## Plan: Add Scroll-Down Arrow Button at Bottom of Hero Slider

### What We're Adding
A subtle animated bouncing chevron/arrow at the bottom of the hero slider that, when clicked, smoothly scrolls the user to the content section below.

### Technical Details

**File: `src/pages/Index.tsx`**

1. **Add an `id` to the first section after the hero slider** so we have a scroll target (need to check what comes after the slider).

2. **Add a scroll-down button** inside the hero slider `<div>` (the one ending around line 684), positioned at the bottom center above the slide indicators. It will:
   - Use `ChevronDown` from lucide-react
   - Have a bouncing animation (`animate-bounce`)
   - Be absolutely positioned at `bottom-20 sm:bottom-24` (above the search panel)
   - Use `z-30` to stay visible
   - On click, call `document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' })`
   - Semi-transparent white styling with gold accent on hover
   - Fade-in with delay so it appears after the branding text animations

3. **Position**: Place it between the slide indicators (line 670) and the closing `</div>` at line 684, but since the search panel covers the bottom, we'll place the arrow **below the entire hero section** (after the `HomeIntroSlider` closing tag) as a floating element anchored to the bottom of the viewport-height hero.

Actually, given the search panel already occupies the bottom of the slider, the best approach is to place the scroll arrow **just below the hero/search section** as a standalone element, or embed it within the search panel area. Let me reconsider — placing a small bouncing arrow at the very bottom edge of the full hero section (below the search panel) would be cleanest.

### Implementation

**In `src/pages/Index.tsx`:**

- After the hero slider section closes (~line 684 area, after the search panel), add a scroll-down arrow button:

```tsx
{/* Scroll Down Indicator */}
<button
  onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}
  className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-white/60 hover:text-gold-primary transition-colors duration-300 pointer-events-auto animate-fade-in"
  style={{ animationDelay: '1.2s', opacity: 0, animationFillMode: 'forwards' }}
  aria-label="Scroll to content"
>
  <span className="text-[9px] uppercase tracking-[0.3em] font-medium">Explore</span>
  <ChevronDown className="h-5 w-5 animate-bounce" />
</button>
```

- Add `id="featured-section"` to the first major content section below the hero.

- Import `ChevronDown` from `lucide-react` (check if already imported).

### Visual Result
- A small "Explore" label with a bouncing down-arrow at the very bottom of the hero
- Fades in after 1.2s (after branding animations finish)
- Smooth scroll on click
- Gold highlight on hover matching the premium theme

