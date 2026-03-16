# ASTRAVILLA UX Heuristic Audit Report
**Date:** 2026-03-16 | **Status:** Active | **Framework:** Nielsen's 10 Usability Heuristics

---

## Executive Summary

The platform demonstrates **strong infrastructure** (error boundaries, lazy loading, toast feedback, filter reset mechanisms) but has critical gaps in **accessibility** (only 3 property components use `aria-label`), **recognition vs recall** (icon-only buttons without labels on property cards), and **consistency** (mixed Indonesian/English labels). The Heart/Save button on PropertyCard lacks `aria-label` and provides no visual feedback on click — users get no confirmation their save action worked.

---

## H1: Visibility of System Status

| # | Finding | Severity | Location |
|---|---------|----------|----------|
| 1 | **Heart/Save button has no feedback** — clicking stops propagation but provides no toast, no fill change, no animation | P0 | `PropertyCard.tsx:191-195` |
| 2 | **Search loading dialog exists** (`SearchLoadingDialog`) — good infrastructure | ✅ | Index.tsx:62 |
| 3 | **Pull-to-refresh indicator** properly shows pulling/refreshing states | ✅ | Index.tsx:4-5 |
| 4 | **Network status indicator** shows online/offline state | ✅ | Index.tsx:42 |
| 5 | **Skeleton loading states** use shimmer animation for progressive reveal | ✅ | Multiple components |
| 6 | **No loading indicator on property card image** — broken images silently fall back to placeholder.svg | P2 | PropertyCard.tsx:186 |

**Recommendation for #1:** The Heart button currently does nothing functionally — it stops event propagation but doesn't toggle state, call an API, or show feedback. This is the highest-priority UX fix.

---

## H2: Match Between System and Real World

| # | Finding | Severity |
|---|---------|----------|
| 7 | **Mixed language labels** — "Dijual"/"Disewa" (Indonesian) on cards but "New Project", "Virtual Tour", "VR Mode" (English) on same card | P1 |
| 8 | **"Disewa" vs "/bln"** — rent label says "Disewa" but price suffix shows "/bln" (per bulan); consistent but abbreviation may confuse non-Indonesian users | P2 |
| 9 | **Property specs use icons only** (Bed, Bath, Square) — no labels, relies on icon recognition | P1 |
| 10 | **"AR Preview" button shown but disabled** with `cursor-not-allowed opacity-60` — confuses users about feature availability | P1 |

---

## H3: User Control and Freedom

| # | Finding | Severity |
|---|---------|----------|
| 11 | **Filter reset available** — "Clear All" buttons with active count badges exist across all filter panels | ✅ |
| 12 | **ActiveFilterPills** component lets users remove individual filters | ✅ |
| 13 | **Modal exit** — PropertyDetailModal has onClose handler | ✅ |
| 14 | **No undo for save/favorite** — Heart button has no toggle behavior or undo mechanism | P1 |
| 15 | **Scroll position** — `useScrollRestore` with instant behavior prevents disorientation | ✅ |

---

## H4: Consistency and Standards

| # | Finding | Severity |
|---|---------|----------|
| 16 | **Badge border-radius inconsistent** — listing type badge uses `rounded-md`, development status uses `rounded`, VR badge uses `rounded-md` | P2 |
| 17 | **3 different badge padding schemes** — `px-2.5 py-1`, `px-2 py-0.5`, `px-1.5 py-0.5` on same card | P2 |
| 18 | **Card hover behavior standardized** via `.card-hover-lift` | ✅ |
| 19 | **Price typography upgraded** to `font-black drop-shadow-sm` per platform constraints | ✅ |
| 20 | **Multiple search panels** coexist — `AstraSearchPanel`, `SmartSearchPanel`, `AdvancedSearchPanel`, `StickySearchPanel`, `StickyHeaderSearch` — 5 search implementations | P1 |

---

## H5: Error Prevention

| # | Finding | Severity |
|---|---------|----------|
| 21 | **SearchErrorBoundary** catches and recovers from search panel crashes | ✅ |
| 22 | **SectionErrorBoundary** wraps major homepage sections | ✅ |
| 23 | **Image fallback** to placeholder.svg on error | ✅ |
| 24 | **Form validation toast messages** use `variant: "destructive"` consistently | ✅ |
| 25 | **No confirmation on destructive actions** in map area management (delete area has no confirm dialog) | P1 |

---

## H6: Recognition Rather Than Recall

| # | Finding | Severity |
|---|---------|----------|
| 26 | **Heart button has no `aria-label`** — screen readers cannot identify its purpose | P0 |
| 27 | **Share button** relies on `SharePropertyButton` component (check if it has aria-label) | P1 |
| 28 | **Property spec icons** (Bed, Bath, Square) have no text labels on mobile — users must recall icon meanings | P1 |
| 29 | **Quick filter chips** (QuickFiltersChipBar) include both emoji icons AND text labels | ✅ |
| 30 | **Search suggestions** provided by AI + recent + saved searches | ✅ |

---

## H7: Flexibility and Efficiency of Use

| # | Finding | Severity |
|---|---------|----------|
| 31 | **Keyboard shortcuts** via `useKeyboardShortcuts` + `CommandPalette` | ✅ |
| 32 | **Image search** available via `ImageSearchButton` | ✅ |
| 33 | **View mode toggle** (grid/list/map) via `PropertyViewModeToggle` | ✅ |
| 34 | **Quick filter chips** for common filter presets | ✅ |

---

## H8: Aesthetic and Minimalist Design

| # | Finding | Severity |
|---|---------|----------|
| 35 | **Homepage has 22+ sections** (reduced from 25) — still causes scroll fatigue | P1 |
| 36 | **PropertyCard can stack 3 `border-t` dividers** (specs + agent + rating) — visual noise | P2 |
| 37 | **Enterprise card glow** (`shadow-[0_0_15px_-3px_...]`) feels gaming rather than luxury | P2 |
| 38 | **Disabled AR button** adds visual clutter for non-functional feature | P1 |

---

## H9: Help Users Recognize, Diagnose, and Recover from Errors

| # | Finding | Severity |
|---|---------|----------|
| 39 | **Toast messages** use clear title + description pattern | ✅ |
| 40 | **Retry mechanism** exists for search (`useRetrySearch`) with visual indicator | ✅ |
| 41 | **Error logging** centralized via `logSearchError` utility | ✅ |

---

## H10: Help and Documentation

| # | Finding | Severity |
|---|---------|----------|
| 42 | **AI chat assistant** available via `ResponsiveAIChatWidget` | ✅ |
| 43 | **QuickFiltersChipBar** includes helper text explaining chip functionality | ✅ |

---

## Priority Implementation Roadmap

### Sprint 1 — P0 Critical (Applied)
- ✅ Add `aria-label` to Heart/Save button on PropertyCard
- ✅ Add `aria-label` to Share button wrapper  
- ✅ Remove disabled AR Preview button (non-functional feature)

### Sprint 2 — P1 Recommended
- Standardize badge `rounded-md` and padding `px-2 py-0.5` across all card badges
- Add text labels to property spec icons on mobile (e.g., "3 Bed" instead of icon + "3")
- Resolve mixed language: either fully localize card labels or use English consistently
- Continue homepage section consolidation (22 → 12 sections per flow audit)

### Sprint 3 — P2 Cleanup
- Unify enterprise card glow to use `card-hover-lift` shadow system instead of custom glow
- Remove third border-t divider in PropertyCard (consolidate agent + rating row)
- Add subtle loading skeleton to card images before load
