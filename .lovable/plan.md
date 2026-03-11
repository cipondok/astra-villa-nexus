

# AI Real Estate Liquidity Forecast Engine

## Architecture

Following the established pattern (edge function + DB tables + hook + page), this engine adds a `liquidity-engine` edge function with 5 pipelines, 5 database tables, a React Query hook, and a dashboard page.

## Database Schema (Migration)

5 new tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `liquidity_absorption` | Market absorption velocity per city/type | `city`, `property_type`, `avg_dom`, `liquidity_speed_index`, `absorption_rating`, `exit_difficulty`, `view_to_inquiry_ratio`, `seasonal_factor` |
| `liquidity_demand_elasticity` | Price sensitivity & demand coefficients | `city`, `property_type`, `elasticity_coefficient`, `price_reduction_risk`, `supply_pressure`, `competition_intensity`, `optimal_pricing_strategy` |
| `liquidity_rental_stability` | Rental cashflow reliability | `city`, `property_type`, `occupancy_stability`, `cashflow_reliability_index`, `vacancy_risk`, `tenant_turnover_prob`, `short_term_viability`, `long_term_viability` |
| `liquidity_crisis_resilience` | Stress-test scores under adverse scenarios | `city`, `property_type`, `scenario` (recession/rate_spike/policy/disaster/tourism_collapse), `stress_liquidity_score`, `forced_sale_risk`, `capital_protection_rank` |
| `liquidity_exit_timing` | Exit window optimization | `city`, `property_type`, `best_sell_window`, `peak_liquidity_month`, `optimal_hold_months`, `flip_profitability`, `hold_profitability`, `liquidity_adjusted_roi` |

All tables: `id uuid PK`, `created_at timestamptz`, RLS enabled with public read.

## Edge Function: `liquidity-engine`

File: `supabase/functions/liquidity-engine/index.ts`

Pipelines (selected via `pipeline` body param):
- **`absorption_velocity`** — Generates city×type absorption metrics using simulated DOM distributions, seasonal curves, and view-to-inquiry ratios. Outputs liquidity speed index (0-100) and exit difficulty probability.
- **`demand_elasticity`** — Computes price elasticity coefficients per market segment using supply/competition factors and mortgage affordability impact. Outputs optimal pricing strategy recommendation.
- **`rental_stability`** — Forecasts occupancy stability, vacancy risk, and cashflow reliability using city tourism/demand profiles. Compares short-term vs long-term rental viability.
- **`crisis_resilience`** — Runs 5 stress scenarios (recession, rate spike, policy tightening, natural disaster, tourism collapse) with city-specific vulnerability weights. Outputs forced-sale risk and capital protection ranking.
- **`exit_timing`** — Simulates multiple exit scenarios (flip at 12mo, hold 3yr, hold 5yr) with liquidity-adjusted ROI. Identifies peak liquidity months and optimal sell windows.
- **`full_forecast`** — Runs all 5 pipelines sequentially and merges results.

Each pipeline upserts results into the corresponding table.

## Frontend Hook: `src/hooks/useLiquidityEngine.ts`

- `useLiquidityScan()` — mutation invoking the edge function
- `useLiquidityAbsorption()` — query from `liquidity_absorption`
- `useLiquidityElasticity()` — query from `liquidity_demand_elasticity`
- `useLiquidityRental()` — query from `liquidity_rental_stability`
- `useLiquidityCrisis()` — query from `liquidity_crisis_resilience`
- `useLiquidityExit()` — query from `liquidity_exit_timing`

## Frontend Page: `src/pages/LiquidityEnginePage.tsx`

Route: `/liquidity-engine`

Dashboard with 5 tabs:
1. **Overview** — Summary cards (avg liquidity index, exit difficulty, cashflow reliability) + bar chart of absorption by city
2. **Demand Elasticity** — Elasticity coefficients table + pricing strategy badges
3. **Rental Stability** — Occupancy/vacancy radar chart + short vs long-term comparison
4. **Crisis Stress Test** — Scenario cards with stress scores + forced-sale risk meters
5. **Exit Timing** — Exit scenario comparison table + liquidity-adjusted ROI area chart

"Full Liquidity Forecast" button triggers `full_forecast` pipeline.

## Routing

Add lazy import and route in `App.tsx`:
```
const LiquidityEnginePage = lazy(() => import('@/pages/LiquidityEnginePage'));
<Route path="/liquidity-engine" element={<LiquidityEnginePage />} />
```

## Config

Add to `supabase/config.toml`:
```toml
[functions.liquidity-engine]
  verify_jwt = false
```

## Files to Create/Edit

| Action | File |
|--------|------|
| Create | `supabase/migrations/..._liquidity_engine.sql` |
| Create | `supabase/functions/liquidity-engine/index.ts` |
| Create | `src/hooks/useLiquidityEngine.ts` |
| Create | `src/pages/LiquidityEnginePage.tsx` |
| Edit | `src/App.tsx` (add route) |
| Edit | `supabase/config.toml` (add function) |

