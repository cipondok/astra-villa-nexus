

# Advanced Investor Intelligence Layer — Implementation Plan

## Overview

This plan covers 5 major systems: enhanced deal analysis, personalized investor feed, advanced map intelligence, portfolio risk engine, and investment timeline forecasting. The architecture follows existing patterns (job queue batching, edge function routing, TanStack Query caching).

---

## 1. Deal Analysis Engine Enhancement

### Database Changes
Add new columns to `property_deal_analysis`:

```text
deal_confidence       SMALLINT (0-100)   — composite confidence score
liquidity_probability SMALLINT (0-100)   — how likely to sell quickly
flip_potential_score   SMALLINT (0-100)   — short-term resale potential
rental_stability_score SMALLINT (0-100)   — long-term rental income stability
listing_age_days       INTEGER            — days on market
macro_growth_factor    NUMERIC            — city-level macro multiplier
```

### Edge Function Update
Add new mode `deal_analysis_v2` to `core-engine` that calculates:
- **Price vs city median**: Compare `price_per_sqm` against city average from `location_price_trends`
- **Listing age factor**: Penalize stale listings (>90 days), reward fresh (<14 days)
- **Liquidity probability**: Based on DOM distribution, demand_heat_score, and listing_type
- **Flip potential**: Weighted formula: undervaluation (40%) + demand (30%) + listing freshness (30%)
- **Rental stability**: Based on rental yield variance in the city + property type consistency
- **Macro growth**: Pull from `location_market_insights` growth signals

### Job Queue Integration
New job type `deal_analysis_v2_batch` in `job-worker` — processes properties in chunks of 30, writing results to `property_deal_analysis` with the new columns.

### Hook Update
Extend `useDealAnalysis.ts` interface to include the 4 new score fields.

---

## 2. Smart Investor Feed Personalization

### Database Changes
New table `investor_feed_preferences`:

```text
investor_feed_preferences
├── id UUID PK
├── user_id UUID FK → auth.users (UNIQUE)
├── strategy_type TEXT (aggressive_growth | passive_income | short_term_flip | luxury_preservation)
├── weight_rental_yield NUMERIC DEFAULT 25
├── weight_appreciation NUMERIC DEFAULT 25
├── weight_deal_score NUMERIC DEFAULT 25
├── weight_liquidity NUMERIC DEFAULT 25
├── preferred_cities TEXT[]
├── budget_min NUMERIC
├── budget_max NUMERIC
├── risk_tolerance TEXT (low | medium | high)
├── created_at / updated_at TIMESTAMPTZ
```

### Strategy Presets
Four built-in presets that auto-set weights:
- **Aggressive Growth**: appreciation 40, deal_score 30, liquidity 20, yield 10
- **Passive Income**: yield 45, stability 30, deal_score 15, appreciation 10
- **Short-term Flipper**: deal_score 40, liquidity 35, appreciation 15, yield 10
- **Luxury Preservation**: stability 35, appreciation 30, yield 20, deal_score 15

### Feed Personalization Logic
- `useInvestorFeed` hook reads user preferences and applies dynamic ORDER BY using weighted composite
- Falls back to default weights for unauthenticated users
- New `useInvestorFeedPreferences` hook for CRUD on preferences

### UI Changes
- Add strategy selector panel at top of `/investor-feed`
- Save/load strategy profiles
- Visual weight sliders for advanced users

---

## 3. Advanced Map Investment Intelligence

### New Map Layers (added to existing `InteractivePropertyMap.tsx`)

**Deal Score Clusters**: Color clusters by average deal_score instead of count:
- Green (>=70) — hot deals concentration
- Gold (>=40) — moderate opportunities  
- Gray (<40) — fair/overpriced zone

**Growth Hotspot Polygons**: Render city-level polygons from `investment_hotspots` table with fill color by hotspot_score. Uses Mapbox `fill-extrusion` layer for 3D effect at high zoom.

**Liquidity Intensity Glow**: New heatmap sub-mode using `liquidity_probability` from enhanced deal analysis. Bright cyan glow = high liquidity zones.

### Implementation Approach
- Add `HeatmapMode` values: `'liquidity'` and `'growth_hotspot'`
- GeoJSON feature properties extended with `deal_score`, `liquidity_probability`
- Growth polygons loaded separately from `investment_hotspots` via a lightweight query
- All layers GPU-accelerated (no DOM markers for these overlays)
- Mobile: auto-disable 3D extrusions, reduce polygon detail

### Map Property Hook Update
Extend `useMapProperties` to optionally JOIN `property_deal_analysis` for deal_score and liquidity data.

---

## 4. Portfolio Risk Engine

### New Component: `PortfolioRiskPanel.tsx`
Located in `src/components/investor/`, rendered inside portfolio builder results.

### Metrics Calculated Client-Side
From portfolio builder results (no new DB tables needed):

- **Diversification Score** (0-100): Already exists in `useInvestorStrategy`. Enhance with property_type entropy + city spread + price tier distribution.
- **Geographic Exposure**: Percentage concentration in top city. Flag if >60% in one location.
- **Rental Income Stability Index**: Variance of rental yields across portfolio. Low variance = high stability.
- **Portfolio Volatility Forecast**: Based on location_growth_score variance + macro factors. Displayed as a gauge chart.

### Visualization
- Radar chart (Recharts) with 5 axes: Diversification, Geographic Spread, Income Stability, Growth Potential, Liquidity
- Traffic-light risk indicators per metric
- Hedging suggestions (e.g., "Add Bali properties to reduce Jakarta concentration")

---

## 5. Investment Timeline Forecast

### New Component: `InvestmentTimelineForecast.tsx`
In `src/components/investor/`, added as a tab in portfolio dashboard.

### Forecast Panels
All computed from existing data (ROI forecasts + portfolio builder results):

- **Net Worth Trajectory**: Area chart showing cumulative property value + rental income - expenses over 1-10 years
- **Rental Income Timeline**: Stacked bar chart of monthly income per property with vacancy adjustment
- **Refinancing Opportunities**: Flag properties where equity > 50% of current value after N years, suggest cash-out refinance amounts
- **Optimal Exit Timing**: Line chart showing capital gains tax impact at different exit years, highlighting the sweet spot (typically year 5-7 in Indonesian market)

### Data Sources
- Pulls from `property_roi_forecast` for per-property projections
- Uses portfolio builder's 10-year projection data
- KPR data from `FinancingSimulation` component
- No new edge function needed — client-side computation from cached data

---

## File Changes Summary

```text
DATABASE (migrations):
  ├── ALTER property_deal_analysis ADD 4 new score columns
  └── CREATE investor_feed_preferences table + RLS + indexes

EDGE FUNCTIONS:
  ├── core-engine: Add deal_analysis_v2 mode
  └── job-worker: Add deal_analysis_v2_batch job type handler

FRONTEND (new files):
  ├── src/hooks/useInvestorFeedPreferences.ts
  ├── src/components/investor/PortfolioRiskPanel.tsx
  ├── src/components/investor/InvestmentTimelineForecast.tsx
  └── src/components/investor/FeedStrategySelector.tsx

FRONTEND (modified):
  ├── src/hooks/useDealAnalysis.ts — extend interface
  ├── src/hooks/useInvestorFeed.ts — add personalized ranking
  ├── src/hooks/useMapProperties.ts — JOIN deal analysis data
  ├── src/pages/InvestorFeedPage.tsx — add strategy selector
  ├── src/components/search/InteractivePropertyMap.tsx — new layers
  └── src/components/investor/PortfolioBuilderPanel.tsx — add risk + timeline tabs
```

## Implementation Order

1. Database migration (new columns + new table)
2. Deal Analysis V2 engine in core-engine
3. Investor feed preferences hook + strategy selector UI
4. Map intelligence layers (deal clusters, liquidity glow, growth polygons)
5. Portfolio risk panel with radar chart
6. Investment timeline forecast component

