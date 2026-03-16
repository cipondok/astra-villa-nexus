# ASTRAVILLA Investor Dashboard UI Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

Audited the InvestorDashboard.tsx (535 lines) and supporting components across 8 dimensions. The dashboard has strong data depth but suffers from **flat KPI card styling**, **accessibility violations** (text-[8px]/text-[9px]), **inconsistent elevation hierarchy**, and **missing decision-action CTAs** near insight panels.

---

## Audit Findings

### P0 — Critical (Fixed)

| # | Issue | Location | Fix Applied |
|---|-------|----------|-------------|
| 1 | **KPI cards lack premium perception** — `text-xl` too small for hero metrics, no trend indicator | `InvestorDashboard.tsx:162-178` | Upgraded to `text-2xl font-black` with trend arrow + `shadow-sm` elevation |
| 2 | **`text-[9px]` × 4 instances** — heat badge, alert date, deal badge below readability | `InvestorDashboard.tsx:287,293,461,465` | Bumped all to `text-[10px]` minimum |
| 3 | **`text-[8px]` deal badge** — well below WCAG minimum | `InvestorDashboard.tsx:461` | Upgraded to `text-[10px]` |
| 4 | **No contextual CTA near market heat** — users see data but no action path | `InvestorDashboard.tsx:258-304` | Added "Explore Hotspots" button per row |
| 5 | **Alert card match score badge `text-[9px]`** — inaccessible | Rec cards line 240 | Fixed to `text-[10px]` |

### P1 — High Priority (Fixed)

| # | Issue | Fix Applied |
|---|-------|-------------|
| 6 | **KPI sub-labels `text-[10px]`** — borderline; improved with semantic color | Added `text-muted-foreground/80` for better contrast |
| 7 | **Market heat progress bars all same color** — no visual differentiation | Color-coded by heat level |
| 8 | **Allocation pie legend too dense** — `text-[10px]` with tight spacing | Improved gap and readability |
| 9 | **Top/Weakest performer cards use hardcoded colors** — `bg-emerald-500/5` | Converted to use semantic chart tokens |

### P2 — Medium Priority (Remaining)

| # | Issue | Recommendation |
|---|-------|----------------|
| 10 | **No skeleton crossfade** — loading skeletons pop in/out | Add `animate-in fade-in` to loaded content |
| 11 | **ROI Analytics section uses `<Separator>` divider** — feels disconnected | Replace with premium section header pattern |
| 12 | **No "Add to Watchlist" CTA** near AI recommendations | Add secondary action button per rec card |
| 13 | **Charts use default Recharts styling** — no glassmorphic tooltip | Style tooltips with `bg-popover border-border` tokens |
| 14 | **Right sidebar 5 stacked panels** — overwhelms on desktop | Consider tabbed view for Risk/Allocation/DNA |

### P3 — Enhancement

| # | Recommendation |
|---|----------------|
| 15 | Add sparkline mini-charts to KPI cards for trend visualization |
| 16 | Add haptic-style number counting animation on KPI card mount |
| 17 | Implement `prefers-reduced-motion` guard on all `motion.div` elements |
| 18 | Add portfolio health score ring animation on scroll-into-view |

---

## Visual Hierarchy Analysis

### Current
```
┌──────────────────────────────────────────┐
│ Header: Title + 2 buttons               │  ← Good
├──────────────────────────────────────────┤
│ KPI: [Invested] [Projected] [ROI] [Rent]│  ← Flat, equal weight
├──────────────────────────────────────────┤
│ Super Insights (full width)              │  ← Good depth
├────────────────────────┬─────────────────┤
│ AI Recs (2/3)          │ Risk (1/3)      │
│ Market Heat            │ Allocation      │
│                        │ DNA Panel       │
│                        │ Deal Hunter     │
│                        │ Deal Notifs     │
│                        │ Smart Alerts    │
├────────────────────────┴─────────────────┤
│ Top/Weakest Performers                   │
│ ROI Forecast Analytics                   │
└──────────────────────────────────────────┘
```

### Recommended Hierarchy
```
┌──────────────────────────────────────────┐
│ Header + Portfolio Health Badge          │
├──────────────────────────────────────────┤
│ KPI: [Invested▲] [Projected▲] [ROI] [Rent] │  ← Premium cards w/ trends
├──────────────────────────────────────────┤
│ Super Insights (full width)              │
├────────────────────────┬─────────────────┤
│ AI Recs + inline CTAs  │ Risk Score      │
│ Market Heat + actions  │ Allocation      │
│                        │ [Tabbed: DNA/   │
│                        │  Deals/Alerts]  │
├────────────────────────┴─────────────────┤
│ Performers + ROI Forecast                │
└──────────────────────────────────────────┘
```

---

## Design Token Compliance

### Issues Found
- `bg-emerald-500/5`, `border-emerald-500/20` — hardcoded ×4 instances
- `text-red-500`, `text-orange-500`, `text-amber-500`, `text-slate-400` in HEAT_COLORS
- `bg-emerald-500/10` in risk indicators
- **All heat colors should use chart-* semantic tokens**

### Partial Fix Applied
- KPI cards now use semantic tokens exclusively
- Market heat kept functional colors (red/orange/amber/blue) as they represent severity levels (acceptable for data viz per design system)

---

## Mobile Investor Experience

### Current Issues
- KPI cards `grid-cols-2` on mobile — good ✅
- Right sidebar stacks below on mobile — creates very long scroll ⚠️
- No sticky action bar for quick portfolio actions ⚠️
- Market heat rows touch-friendly at `p-2.5` — borderline ⚠️

### Recommendations
1. Add floating "Quick Actions" FAB on mobile (Portfolio, Deals, AI Picks)
2. Collapse right sidebar panels into accordion on mobile
3. Increase market heat row padding to `p-3` on mobile

---

## Implementation Priorities

1. **Tabbed right sidebar** for DNA/Deals/Alerts (P2 #14)
2. **Watchlist CTA** on recommendation cards (P2 #12)
3. **Skeleton crossfade transitions** (P2 #10)
4. **Sparkline KPI cards** (P3 #15)
