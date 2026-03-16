
# Modern Redesign: `/properties` Page

## Current State
The page is functional but uses a dense, utilitarian layout with small text, cramped cards, and a basic filter bar. It lacks the premium "Luxury Intelligence" brand feel used elsewhere in ASTRAVILLA.

## Plan

### 1. Hero Search Section
Replace the flat search bar with a modern hero-style header:
- Large heading with Playfair Display font: "Discover Properties"
- Frosted glass search bar with larger input (h-11), rounded-2xl
- Listing type tabs as pill-shaped toggle buttons with smooth transitions
- Result count displayed prominently below

### 2. Filter Panel Redesign
- Replace collapsible filter with a sticky sidebar on desktop (lg+), slide-up sheet on mobile
- Filter sections with clean labels, proper spacing, and rounded select inputs
- Active filter pills styled with `bg-primary/10 border-primary/20` and smooth remove animations
- Price range slider with real-time formatted values displayed above

### 3. Property Cards Modernization
**Grid cards:**
- Increase image height to `h-36 sm:h-44` with `img-hover-zoom` on hover
- `card-hover-lift` animation (existing CSS token)
- Rounded-xl with subtle border, `will-change-transform`
- Gradient overlay on image bottom for listing badge readability
- Larger title (`text-sm font-semibold`), price (`text-base font-bold`)
- Spec chips (bed/bath/area) as mini rounded badges instead of plain text
- Heart button with filled state animation

**List cards:**
- Horizontal layout with larger image (w-48), more spacious padding
- Two-line description preview

### 4. Results Toolbar
- Sticky toolbar below header with result count (bold number), sort dropdown with icons, view toggle
- Smooth fade-in animation on results load

### 5. Skeleton & Empty States
- Modern skeleton with shimmer animation (not plain pulse)
- Empty state with illustration-style icon, suggested actions, and trending properties link

### 6. Layout & Responsive
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with `gap-4 sm:gap-5`
- Proper container padding following MobileFirstLayout patterns
- Staggered card entrance animations (existing framer-motion pattern)

### Technical Approach
- Single file edit: `src/pages/Properties.tsx` (all UI is self-contained here)
- Reuse existing CSS tokens: `card-hover-lift`, `img-hover-zoom`, `glass-card`
- Reuse existing components: Badge, Button, Select, Slider, Card
- Keep all existing filter/sort/search logic unchanged
- Maintain Supabase query and `useMemo` filtering as-is
