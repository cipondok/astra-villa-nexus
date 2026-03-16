# ASTRAVILLA Admin Dashboard Audit v2
**Date:** 2026-03-16 | **Status:** Active | **Previous:** admin-dashboard-audit.md

---

## Executive Summary

The admin dashboard has significantly improved since v1 audit. Query consolidation (7→1 batch), Recharts traffic chart, sparkline KPIs, tiered card elevation, accessibility ARIA roles, and SectionErrorBoundary are all shipped. This audit identifies **14 remaining findings** across performance, UX, code quality, and resilience.

---

## Architecture (Current State)

```
ModernEnhancedAdminDashboard
  └─ SidebarProvider + AdminSidebar (icon rail + flyout)
  └─ AdminHeader (breadcrumb, Cmd+K, ping, notifications, theme, avatar)
  └─ AdminDashboardContent (512 lines, lazy-loaded sections)
       └─ AdminOverview (822 lines, overview grid)
            ├─ Left (3/12): Platform Stats + sparklines, Pending, Quick Nav
            ├─ Center (6/12): Recharts Traffic, Activity Feed, Summary Cards
            └─ Right (3/12): 3 zones (Health, AI Intelligence, Operations)
```

### Resolved from v1
- ✅ HealthBar color logic fixed (P0 #1)
- ✅ Right sidebar zoned into 3 collapsible groups (P0 #2)
- ✅ Zone headers added (P1 #4)
- ✅ MetricRow font upgraded (P1 #5)
- ✅ Activity refresh label fixed (P1 #6)
- ✅ Recharts traffic chart (P2 #8)
- ✅ First-render-only activity animations (P2 #9)
- ✅ 7-day sparklines on KPIs (P2 #10)
- ✅ Tiered elevation for AI cards (P2 #11)
- ✅ Cmd+K command palette (P3 #12)
- ✅ Real-time ping indicator (P3 #13)
- ✅ Reduced-motion toggle (P3 #14)
- ✅ "Last refreshed" timestamps per section (P3 #15)
- ✅ Accessibility: ARIA roles, progressbar, focus-visible rings
- ✅ Batched AI queries via useAICommandCenterData

---

## New Findings

### P0 — Critical

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **AdminOverview 822 lines** — still a monolith with 5 inline sub-components (MetricRow, ActionRow, SummaryCard, HealthBar, ServiceRow, Sparkline) | `AdminOverview.tsx:678-820` | Hard to maintain/test; blocks tree-shaking |
| 2 | **Spark trends query fires 35 sequential DB calls** — `Promise.all` wraps 5 groups × 7 days = 35 `.select()` round trips | `AdminOverview.tsx:90-142` | Significant latency on cold load; potential Supabase rate limiting |

### P1 — High

| # | Issue | Location | Recommendation |
|---|-------|----------|----------------|
| 3 | **AdminDashboardContent.tsx 512 lines of switch/case** — massive mapping file with 100+ lazy imports | `AdminDashboardContent.tsx` | Extract section registry to a config map; reduces cognitive load |
| 4 | **Tier 3 AI cards still use independent hooks** — BuyerListingMatchCard, NationalForecastCard, MarketCyclePredictionCard, CapitalFlowCard, PortfolioStrategyCard, DealTimingSignalCard are NOT batched | `AdminOverview.tsx:622-628` | Extend useAICommandCenterData to include these 6 RPCs |
| 5 | **`any` type on activity feed** — `recentActivity.map((activity: any, idx)` bypasses TypeScript safety | `AdminOverview.tsx:483` | Define `ActivityLogEntry` type |
| 6 | **No loading skeleton for right sidebar zones** — when AI data loads, cards pop in abruptly | `AdminOverview.tsx:522-671` | Add skeleton placeholders per zone |

### P2 — Medium

| # | Issue | Location | Recommendation |
|---|-------|----------|----------------|
| 7 | **Flyout panel max-height hardcoded `300px`** — on short viewports some sections get cut off | `AdminSidebar.tsx:228` | Use `calc(100vh - offset)` or dynamic measurement |
| 8 | **Duplicate `<main>` tags** — `ModernEnhancedAdminDashboard:68` wraps content in `<main>`, `AdminOverview:319` also uses `<main role="main">` | Both files | Remove inner `<main>` from AdminOverview; use `<section>` instead |
| 9 | **SummaryCard color prop is stringly-typed** — `color: 'green' | 'blue' | 'purple' | 'orange'` maps to chart tokens inline | `AdminOverview.tsx:749-768` | Use semantic token names directly |
| 10 | **No error boundary on individual AI intelligence cards** — if one card throws, entire right column fails | `AdminOverview.tsx:594-628` | Wrap each card in SectionErrorBoundary |
| 11 | **Breadcrumb category is not clickable** — shows category name but doesn't navigate to first section in that category | `AdminBreadcrumb.tsx:39-43` | Make category span a button that opens the flyout or navigates |

### P3 — Enhancement

| # | Issue | Recommendation |
|---|-------|----------------|
| 12 | **No keyboard shortcut hints in Quick Nav grid** — 6 buttons with no hotkey discoverability | Add number keys 1-6 as shortcuts with visual hints |
| 13 | **Activity feed has no "View All" link** — users must know to navigate via sidebar | Add footer link to activity logs section |
| 14 | **Notification badge `text-[9px]`** — accessibility borderline for the count number | Bump to `text-[10px]` minimum |

---

## Performance Profile

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| AI batch queries | 7 RPCs in 1 Promise.allSettled | — | ✅ Optimal |
| Sparkline trend queries | 35 sequential calls | 1 batched RPC | ⚠️ P0 #2 |
| Right sidebar cards | ~18 rendered | — | ✅ Zoned |
| Tier 3 card queries | 6 independent hooks | Batch into existing hook | ⚠️ P1 #4 |
| Traffic chart | Recharts BarChart | — | ✅ Done |
| Activity animations | First-render only | — | ✅ Done |
| Platform stats refetch | 60s interval | — | ✅ Reasonable |

---

## Accessibility Scorecard

| Dimension | Status | Notes |
|-----------|--------|-------|
| Semantic nav structure | ✅ | `<nav>`, `role="menubar"`, `role="menuitem"` |
| Focus-visible rings | ✅ | Applied to sidebar + flyout buttons |
| ARIA progressbar | ✅ | HealthBar component |
| Live region | ✅ | Online status `aria-live="polite"` |
| Duplicate `<main>` | ⚠️ | P2 #8 — two nested `<main>` elements |
| Reduced motion | ✅ | Toggle in header |
| Color contrast | ✅ | All semantic tokens |
| Minimum text size | ⚠️ | `text-[9px]` used for notification badge count |

---

## Code Quality

| Metric | Current | Recommendation |
|--------|---------|----------------|
| AdminOverview.tsx | 822 lines | Extract sub-components to files (target <400 lines) |
| AdminDashboardContent.tsx | 512 lines | Registry pattern → <100 lines |
| `any` usage | 1 instance | Eliminate |
| Error boundaries | 3 section-level | Add per-card in right sidebar |
| TypeScript strictness | Good | Fix `any` in activity feed |

---

## Implementation Priorities (Next Sprint)

1. **Extract AdminOverview sub-components** to separate files (P0 #1)
2. **Batch sparkline queries** into a single RPC or reduce to 5 calls (P0 #2)
3. **Extend AI batch hook** to cover Tier 3 cards (P1 #4)
4. **Fix duplicate `<main>`** (P2 #8)
5. **Add per-card error boundaries** in right sidebar (P2 #10)
6. **Type the activity feed** (P1 #5)
