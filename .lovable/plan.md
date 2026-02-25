

## Staggered Per-Card Fade-In Animations

Since the scroll-triggered animations and gold-themed loading indicators are already complete, the next logical enhancement is **staggered per-card animations** — where each property card in a grid fades in sequentially with a slight delay, creating a cascading reveal effect.

### What changes

1. **`src/components/ui/ScrollReveal.tsx`** — Add a new `staggerIndex` prop that applies an additional delay based on card position (e.g., `staggerIndex * 100ms`). This keeps the API simple and backward-compatible.

2. **`src/components/PropertyListingsSection.tsx`** — Wrap each `CompactPropertyCard` in the grid with `<ScrollReveal direction="up" delay={index * 100}>` so cards cascade in one by one.

3. **`src/components/property/AutoScrollCarousel.tsx`** — Add per-item fade-in with staggered delays for carousel cards when they first enter the viewport.

4. **`src/pages/Index.tsx`** — For any grid sections on the homepage that render multiple cards, apply the same staggered pattern with `ScrollReveal` wrapping each card.

### Technical details

- Each card gets `delay={index * 100}` (100ms stagger between cards)
- Direction stays `"up"` with `distance={20}` for subtle lift
- `freezeOnceVisible` remains true so animations only play once
- No new dependencies — uses existing `ScrollReveal` and `IntersectionObserver` infrastructure
- Respects `prefers-reduced-motion` automatically via existing CSS/disabled logic

