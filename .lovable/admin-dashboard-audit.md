# ASTRAVILLA Admin Dashboard & AI Intelligence Panel Audit
**Date:** 2026-03-16 | **Status:** Active

---

## Executive Summary

Audited the admin dashboard across 8 dimensions. The dashboard has **strong data coverage** with 18+ AI intelligence cards but suffers from critical **right sidebar overload** (18 cards in a 25% column), an **inverted health bar color logic bug**, and **missing zoning** between marketplace health, AI intelligence, and operational controls.

---

## Architecture Overview

```
ModernEnhancedAdminDashboard
  └─ SidebarProvider + AdminSidebar (collapsible tree nav)
  └─ AdminHeader
  └─ AdminDashboardContent
       └─ AdminOverview (689 lines, overview section)
            ├─ Left (3/12): Platform Stats, Pending Actions, Quick Nav
            ├─ Center (6/12): Traffic Chart, Activity Feed, Summary Cards
            └─ Right (3/12): System Health + 18 AI Intelligence Cards ⚠️
```

---

## Audit Findings

### P0 — Critical

| # | Issue | Location | Fix Applied |
|---|-------|----------|-------------|
| 1 | **HealthBar color logic inverted** — `val < 50 → bg-chart-1 (green)`, `val >= 80 → bg-destructive` — health bars show GREEN for low values | `AdminOverview.tsx:645-649` | Fixed: low=destructive, mid=chart-3, high=chart-1 |
| 2 | **Right sidebar 18+ cards stacked** — creates 4000px+ scroll depth in a narrow 25% column | `AdminOverview.tsx:416-559` | Grouped into 3 collapsible zones with headers |
| 3 | **Summary card `text-[10px]` labels** — borderline readability at small column width | `AdminOverview.tsx:633` | Acceptable in admin context (monitored) |

### P1 — High Priority (Fixed)

| # | Issue | Fix Applied |
|---|-------|-------------|
| 4 | **No visual zoning** between System Health, AI Intelligence, and Operational panels | Added zone headers: "🔒 System Health", "🧠 AI Intelligence", "⚙️ Operations" |
| 5 | **MetricRow value `text-sm`** — too small for KPI emphasis in command center context | Upgraded to `text-sm font-black tabular-nums` |
| 6 | **Live Activity auto-refresh label says "10s"** but actual interval is 60s | Fixed label to match actual refetchInterval |

### P2 — Medium Priority (Remaining)

| # | Issue | Recommendation |
|---|-------|----------------|
| 7 | **AdminDashboardStats uses hardcoded data** — "2,847 users", "1,284 properties" | Replace with live DB counts (already available in AdminOverview) |
| 8 | **Traffic chart uses raw `div` bars** — no hover tooltip detail | Add Recharts `<BarChart>` for proper tooltips and animation |
| 9 | **Activity feed motion.div animations** — 8 items × staggered delays = potential jank | Limit animation to first render only |
| 10 | **No sparkline trends on KPI metrics** — flat number display | Add 7-day inline sparkline per metric |
| 11 | **AI intelligence cards all same elevation** — no visual priority | Add `shadow-sm` to top 3 cards, `border-primary/20` to active signals |

### P3 — Enhancement

| # | Recommendation |
|---|----------------|
| 12 | Add `Cmd+K` admin command palette for section jump |
| 13 | Add real-time WebSocket ping indicator next to "Online" badge |
| 14 | Implement admin-level `prefers-reduced-motion` toggle |
| 15 | Add "Last refreshed X seconds ago" timestamp per data section |

---

## Right Sidebar Zoning (Before vs After)

### Before (18 cards flat)
```
System Health
AI Health Summary
Lead Intelligence
Market Intelligence
Agent Performance
Deal Pipeline
Geo Expansion
AI Batch Control
AI Scheduling
Job Queue Health
AI Job Observability
Market Anomaly
Listing Performance
Pricing Intelligence
Deal Closing Timeline
Investment Attractiveness
Buyer-Listing Match
Pricing Automation
Market Cycle Prediction
Deal Timing Signals
National Forecast
Portfolio Strategy
Capital Flow
Marketplace Optimization
AI Systems Status
Quick Actions
```

### After (3 collapsible zones)
```
▼ System Health
  System Status, Health Bars, AI Systems Status

▼ AI Intelligence
  AI Health Summary, Lead Intel, Market Intel, Agent Perf
  Deal Pipeline, Geo Expansion, Market Anomaly
  Investment Attractiveness, Buyer Match, National Forecast
  Market Cycle, Capital Flow, Portfolio Strategy, Deal Timing

▼ Operations
  AI Batch Control, AI Scheduling, Job Queue, Observability
  Listing Performance, Pricing Intelligence, Deal Closing
  Pricing Automation, Marketplace Optimization
  Quick Actions
```

---

## Theme & Accessibility Compliance

### Issues Found
- `text-[10px]` used 6 times — acceptable for admin dashboard labels
- No `text-[9px]` or `text-[8px]` instances ✅
- All colors use semantic tokens (chart-1, chart-2, chart-3, primary, destructive) ✅
- Glassmorphic cards use `backdrop-blur-xl` — may impact mid-range laptop performance
- `animate-pulse` on status indicator — continuous animation acceptable for live status

### Dark Mode
- `bg-gradient-to-br from-background via-background to-muted/20` — subtle, correct ✅
- Glass cards `bg-card/60` — may need opacity boost to `bg-card/70` for readability in bright environments

---

## Performance Risks

1. **18 AI intelligence cards** each with independent `useQuery` hooks — N+1 query pattern
   - **Recommendation:** Consolidate into a single `useAICommandCenterData()` hook
2. **`refetchInterval: 60000`** on 4 separate queries — acceptable but creates periodic CPU spike
3. **Motion.div on every activity row** — 8 staggered animations per refresh cycle
   - **Recommendation:** Use `AnimatePresence` with `key` to only animate new items

---

## Implementation Priorities (Next Sprint)

1. **Consolidate AI card queries** into batched hook (P2 #7 performance)
2. **Replace traffic div-bars** with Recharts BarChart (P2 #8)
3. **Add sparkline trends** to MetricRow KPIs (P2 #10)
4. **Elevation hierarchy** for AI signal cards (P2 #11)
