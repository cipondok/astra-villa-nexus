# ASTRAVILLA Visual Quality Audit
**Date:** 2026-03-16 | **Status:** Pre-Launch Active
**Method:** Live interface inspection (desktop 1280×720, mobile 390×844)

---

## Screenshots Reviewed

1. **Homepage hero + search** (desktop) — Hero banner, AI search section, category tabs
2. **Mid-page sections** (desktop) — AI recommendations, property grid, investment opportunities
3. **Bottom sections** (desktop) — Marketplace services grid, footer
4. **Full mobile flow** — Cards, navigation, floating widgets

---

## P0 — Visual Bugs (Launch Blockers)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **"Hover for quick actions" tooltip visible on mobile** — Desktop-only hover pattern leaks to touch devices, overlapping card content | AI Chat Widget (bottom-right) | Confusing on mobile — hover doesn't exist on touch | ✅ **Fixed** — Hidden on mobile via `hidden md:block`, text changed to "Tap for quick actions" |
| 2 | **"No Image Available" placeholder** on 5/5 visible property cards — All listings show generic AV watermark instead of property photos | PropertyCard grid | Massive trust/credibility damage — looks like a broken prototype | Data issue — ensure properties have image URLs; add a more polished fallback with a styled illustration |
| 3 | **Price "0B" display** on first card (Land di Maninjau) — Shows "Rp 0B" or "Rp 4.0B" inconsistently between viewports | PropertyCard price formatter | Price confusion destroys conversion confidence | Audit `formatPrice` for edge cases where price=0 or very small values |

---

## P1 — Spacing & Layout Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 4 | **Excessive vertical whitespace** between "Rekomendasi AI" section and "Find Undervalued Deals" banner — ~120px gap feels disconnected | Homepage mid-section | Medium — breaks scroll storytelling flow |
| 5 | **Marketplace services grid** icon cards all show identical grey styling with small notification dots — 8 identical-looking cards create visual monotony | Homepage marketplace section | Medium — no visual differentiation between service types |
| 6 | **"Penyedia layanan?" banner** at bottom of marketplace section gets clipped by floating AI widget on mobile | Homepage bottom | Low-Medium — CTA partially obscured |
| 7 | **Hero section** has layered backgrounds — the "Experience 360° Virtual Tours" carousel bleeds behind the search section creating visual confusion | Homepage top | Medium — two competing visual narratives in same viewport |

---

## P2 — Typography & Hierarchy

| # | Issue | Location |
|---|-------|----------|
| 8 | **Section heading scale inconsistency** — "MARKETPLACE" is all-caps bold sans-serif while "Properti Dijual" is title-case serif-style; competing heading treatments | Homepage sections |
| 9 | **"12 properti tersedia"** subtitle uses same muted style as card metadata — not scannable enough as a section count indicator | Property grid header |
| 10 | **"Lihat Semua →"** link placement varies — right-aligned on some sections, different sizing/color weight across sections | Multiple sections |

---

## P3 — Color & Contrast

| # | Issue | Location |
|---|-------|----------|
| 11 | **Investment ROI indicators** ("+40%", "+30%") use green text on light card backgrounds — adequate contrast but small text size (`text-xs`) makes them hard to scan | Early Investment Opportunities section |
| 12 | **Search bar icon cluster** (camera, location, AI, grid, filter) — 6 icons packed in a small space without labels, all in the same muted color; low discoverability | Search section |
| 13 | **Badge color confusion** — "Dijual" badges use teal/green while property type badges (Land, Warehouse, Kost) use grey; the green suggests "available" but could also mean "sale" vs "rent" | PropertyCard badges |

---

## P4 — Component Consistency

| # | Issue | Location |
|---|-------|----------|
| 14 | **Card elevation varies** — property cards have subtle borders while the "Early Investment Opportunities" panel has rounded-xl with visible shadow; mixed elevation hierarchy | Homepage |
| 15 | **CTA button styles differ** — "View Insights" uses outline yellow, "Explore Projects →" uses filled gold, "Hunt Deals" uses ghost/text style, "Cari" uses solid blue — 4 different CTA treatments on one page | Homepage |
| 16 | **Notification dots** on all 8 marketplace service categories — if everything has a notification, nothing stands out | Marketplace grid |

---

## P5 — Mobile-Specific Issues

| # | Issue | Location |
|---|-------|----------|
| 17 | **Mobile nav** collapses to minimal icons but search bar has large yellow circle button that dominates the header | Mobile header |
| 18 | **Property card text truncation** — "Land di Maninjau, KABUP..." and "Warehouse di Manggopo..." truncate at unhelpful points on 2-column mobile grid | Mobile property cards |
| 19 | **Floating AI chat widget** overlaps "Scroll to top" button area, creating a crowded bottom-right corner | Mobile bottom-right |

---

## Applied Fixes Summary

| Fix | File | Change |
|-----|------|--------|
| Hidden hover tooltip on mobile | `ResponsiveAIChatWidget.tsx` | Added `hidden md:block` class, changed text |

---

## Recommended Priority Sequence

### Immediate (Pre-Launch)
1. Fix property image fallback to show a polished placeholder (not raw watermark)
2. Fix `formatPrice(0)` edge case to show "Price on Request" instead of "Rp 0B"
3. Standardize CTA button variants — max 2 styles per page (primary filled + secondary outline)
4. Remove notification dots from marketplace grid (or make them data-driven)

### Launch Week
5. Reduce homepage section whitespace gaps to consistent `mb-6` rhythm
6. Standardize section headings to single style (either all-caps or title-case, not both)
7. Add text labels to search bar icon cluster on mobile
8. Improve property card text truncation with `line-clamp-1` instead of character truncation

### Post-Launch Polish
9. Add visual differentiation to marketplace service categories (color-coded icons)
10. Unify card elevation hierarchy (standardize shadow + border treatment)
11. Separate "Scroll to top" from AI chat widget positioning on mobile
12. Add subtle background alternation between homepage sections for scroll rhythm
