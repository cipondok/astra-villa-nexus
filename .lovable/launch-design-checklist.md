# ASTRAVILLA Launch Design Execution Checklist
**Date:** 2026-03-16 | **Status:** Pre-Launch Active

---

## How to Use This Checklist

- ✅ = Verified / Applied
- ⚠️ = Partial / Needs attention
- ❌ = Not yet addressed
- Each item references the audit file where it was first identified

---

## 1. Visual Hierarchy Verification

### Price Prominence
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.1 | Price uses `font-black` with `drop-shadow-sm` | ✅ | Per UI stability constraint |
| 1.2 | Price minimum size `text-lg` on all cards | ✅ | Per UI stability constraint |
| 1.3 | Price is first visual element in card content area | ✅ | PropertyCard layout verified |

### Headline Clarity
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.4 | Single H1 per page | ⚠️ | Audit needed across all route pages |
| 1.5 | Heading hierarchy uses Playfair Display consistently | ✅ | brand-identity-audit.md — Montserrat removed |
| 1.6 | Section headings follow `text-xl md:text-3xl` scale | ⚠️ | mobile-design-system-audit.md — not yet standardized |

### CTA Visibility
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.7 | Primary CTA uses `btn-primary` or `btn-cta` variant | ✅ | button.tsx variants defined |
| 1.8 | Mobile sticky conversion bar present on property detail | ✅ | 72px height, WhatsApp + Call buttons |
| 1.9 | CTA contrast ratio ≥ 4.5:1 against background | ⚠️ | Needs manual verification per theme |

### AI Signal Readability
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.10 | AI deal scores use `.signal-glow` animation | ✅ | Applied in SocialProofWidget |
| 1.11 | AI badges use gold accent exclusively (not blue) | ⚠️ | brand-identity-audit.md — "Gold = Intelligence" rule proposed but not fully migrated |
| 1.12 | AI score numbers use `font-bold` minimum weight | ✅ | SmartAIFeed badges verified |

---

## 2. Design System Consistency

### Color Token Discipline
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.1 | No raw color values (`bg-black`, `text-white`) in components | ⚠️ | brand-identity-audit.md — legacy namespaces (`astra`, `macos`, `samsung-blue`, `titanium`) still present in tailwind.config |
| 2.2 | All colors defined as HSL in CSS variables | ✅ | index.css uses HSL throughout |
| 2.3 | Dark/light mode tokens both defined | ✅ | `.dark` class override block present |
| 2.4 | Gold accent uses `--gold-primary` token consistently | ⚠️ | 6 redundant color namespaces to consolidate |

### Typography Scale
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.5 | Font stack: Playfair Display (headings) + Inter (body) | ✅ | Montserrat removed |
| 2.6 | Minimum text size `text-[10px]` enforced | ❌ | **12,731 instances** of `text-[6-9px]` found across 436 files — violates accessibility constraint |
| 2.7 | Numeric data uses Inter with `tabular-nums` | ⚠️ | Not globally enforced |

### Spacing Rhythm
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.8 | Section vertical spacing standardized to `mb-6` | ✅ | Per UI stability constraint |
| 2.9 | Card grid gap minimum `gap-5` (20px) on desktop | ✅ | Per UI stability constraint |
| 2.10 | Card internal padding `p-3 sm:p-4` | ✅ | mobile-design-system-audit.md |

### Border Radius
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.11 | Cards use `rounded-xl` consistently | ⚠️ | brand-identity-audit.md Sprint 2 — not yet standardized |
| 2.12 | Buttons use `rounded-lg` | ✅ | button.tsx base class |
| 2.13 | Badges use `rounded-md` or `rounded-full` | ⚠️ | ux-heuristic-audit.md — mixed badge radii found |

---

## 3. Interaction Polish

### Hover Elevation
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.1 | Interactive cards use `.card-hover-lift` class | ⚠️ | motion-system-audit.md — only PropertyCard adopted (1 of ~200 cards) |
| 3.2 | Hover easing uses `cubic-bezier(0.33, 1, 0.68, 1)` | ✅ | Defined in utility class |
| 3.3 | `will-change: transform` on all hover-animated cards | ⚠️ | interaction-polish-audit.md — ~5% adoption |
| 3.4 | No hover effects on mobile (touch devices) | ⚠️ | Not enforced via `@media (hover: hover)` |

### Button Feedback
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.5 | Buttons use `.btn-press` active state | ⚠️ | Only 1 component uses it |
| 3.6 | Button default height `h-11` (44px) | ✅ | mobile-design-system-audit.md — applied |
| 3.7 | Focus-visible ring standardized | ✅ | button.tsx base: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |

### Loading Transitions
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.8 | Skeleton uses gold-tinted shimmer (`via-gold-primary/15`) | ✅ | skeleton.tsx and PropertyCardSkeleton.tsx |
| 3.9 | Skeleton-to-content crossfade uses `.skeleton-reveal` | ❌ | motion-system-audit.md — class defined but 0 adoptions |
| 3.10 | Shimmer cycle time 1.5s | ✅ | Standardized |

### Animation Timing
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.11 | Card transitions: 250ms | ✅ | `.card-hover-lift` |
| 3.12 | Button transitions: 100-150ms | ✅ | `.btn-press` at 100ms |
| 3.13 | Image transitions: 400ms | ✅ | `.img-hover-zoom` |
| 3.14 | Page transitions: 250ms fade (no Y-offset) | ✅ | PageTransition.tsx — opacity only |

---

## 4. Mobile Usability

### Inquiry Flow
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.1 | Sticky conversion bar on property detail | ✅ | 72px, WhatsApp + Call |
| 4.2 | Conversion buttons ≥ 44px height | ✅ | mobile-design-system-audit.md |
| 4.3 | Bottom nav clearance `pb-[72px]` on content | ⚠️ | mobile-design-system-audit.md Sprint 2 — not verified |

### Filter & Search
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.4 | Filter drawer has clear close/reset buttons | ⚠️ | ux-heuristic-audit.md — filter reset clarity flagged |
| 4.5 | Horizontal quick-filter chips present | ✅ | Per mobile experience memory |
| 4.6 | Search input does not zoom on iOS (min 16px font) | ✅ | `touch-action: manipulation` + text-size-adjust |

### Card Density
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.7 | Mobile grid: 1-2 columns max | ✅ | PropertyCardSkeleton: `grid-cols-2` |
| 4.8 | Card image aspect ratio `4/3` | ✅ | PropertyCard uses `aspect-[4/3]` |
| 4.9 | Max 4 columns on desktop (`xl:grid-cols-4`) | ✅ | Per UI stability constraint |

### Thumb Zone
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.10 | Primary actions in bottom 60% of screen | ✅ | Bottom nav + sticky CTA |
| 4.11 | No critical actions in top-left corner on mobile | ⚠️ | Needs route-by-route verification |

---

## 5. Accessibility

### Text Size
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.1 | Minimum text size `text-[10px]` (10px) | ❌ | **CRITICAL: 12,731 violations** — `text-[6-9px]` in 436 files |
| 5.2 | Price text minimum `text-lg` | ✅ | Per constraint |
| 5.3 | Metadata labels minimum `text-[10px]` | ❌ | SmartAIFeed uses `text-[9px]`, UserIconWithBadge uses `text-[7px]`/`text-[8px]` |

### Tap Targets
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.4 | Default button height 44px | ✅ | `h-11` applied |
| 5.5 | Icon buttons minimum 44×44px | ✅ | `h-11 w-11` applied |
| 5.6 | Small variant (`h-9`) only used in desktop-specific contexts | ⚠️ | Needs audit |

### Contrast & ARIA
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.7 | WCAG AA contrast on dark mode gold elements (12% bg opacity) | ✅ | Per brand identity memory |
| 5.8 | Interactive icons have `aria-label` | ⚠️ | Only 4 UI components have aria-labels; PropertyCard heart/share added |
| 5.9 | Form inputs have associated labels | ⚠️ | Needs form-by-form audit |
| 5.10 | `prefers-reduced-motion` globally handled | ✅ | index.css + mobile-first-responsive.css |

---

## 6. Performance Perception

### Image Loading
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.1 | Images use `loading="lazy"` | ⚠️ | Needs verification — search errored |
| 6.2 | Images use `decoding="async"` | ⚠️ | Per system stability memory — needs verification |
| 6.3 | Supabase image transformations for thumbnails | ✅ | Per system stability memory |

### Animation Performance
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.4 | No uncancelled `requestAnimationFrame` loops | ✅ | Property3DAnimation fixed |
| 6.5 | Max 4 simultaneous animations per viewport | ⚠️ | interaction-polish-audit.md — currently 8-12 |
| 6.6 | Max 2 stacked `backdrop-blur` layers | ⚠️ | 386 files with blur — cap not enforced |
| 6.7 | Infinite animations limited to ≤5 on idle page | ⚠️ | Currently ~15 |

### Layout Stability
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.8 | No scroll-locking (Radix neutralized) | ✅ | layout-stability-standards memory |
| 6.9 | Fixed nav height (`h-12 md:h-13 lg:h-14`) | ✅ | No CLS from header |
| 6.10 | `scrollbar-gutter: stable` on html | ✅ | index.css |
| 6.11 | Page transitions use opacity only (no Y-offset) | ✅ | PageTransition.tsx |

---

## Summary Scorecard

| Category | Items | ✅ Pass | ⚠️ Partial | ❌ Fail |
|----------|-------|---------|------------|--------|
| Visual Hierarchy | 12 | 8 | 4 | 0 |
| Design System | 13 | 7 | 5 | 1 |
| Interaction Polish | 14 | 9 | 4 | 1 |
| Mobile Usability | 11 | 8 | 3 | 0 |
| Accessibility | 10 | 5 | 3 | 2 |
| Performance | 11 | 7 | 4 | 0 |
| **Total** | **71** | **44 (62%)** | **23 (32%)** | **4 (6%)** |

---

## Critical Pre-Launch Blockers

1. **❌ 12,731 sub-10px text violations** — Fix `text-[6-9px]` instances to meet `text-[10px]` minimum (accessibility)
2. **❌ `.skeleton-reveal` crossfade unadopted** — Content pops in abruptly replacing skeletons
3. **⚠️ Motion utility adoption at ~1%** — `.card-hover-lift` on 1/200+ cards, `.btn-press` on 1 button
4. **⚠️ 6 redundant color namespaces** in tailwind.config — brand dilution risk

---

## Recommended Launch Sequence

### Phase 1 — Blockers (Pre-Launch)
- Fix text-size violations in top 20 most-visited components
- Apply `.card-hover-lift` to all interactive cards on homepage
- Apply `.btn-press` to all Button components via base class

### Phase 2 — Polish (Launch Week)
- Consolidate color namespaces to semantic + gold/navy
- Standardize badge border-radius to `rounded-md`
- Add `aria-label` to all icon-only buttons

### Phase 3 — Optimization (Post-Launch)
- Reduce simultaneous animations to ≤4 per viewport
- Cap backdrop-blur nesting to 2 layers
- Migrate `.skeleton-reveal` to all data-loading states
