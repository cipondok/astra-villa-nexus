

# AI Real Estate Risk Hedging Engine

## Architecture

Following the established pattern: 1 edge function, 5 DB tables, 1 React Query hook, 1 dashboard page.

## Database Schema (Migration)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `hedging_macro_risk` | Macro risk signals per city | `city`, `interest_rate_risk`, `inflation_momentum`, `currency_volatility`, `construction_cost_trend`, `capital_flow_shift`, `policy_tightening_risk`, `macro_risk_pressure_index`, `cycle_phase`, `capital_flight_probability` |
| `hedging_portfolio_exposure` | Portfolio concentration risk | `city`, `property_type`, `price_tier`, `allocation_pct`, `overexposure_flag`, `geo_concentration_risk`, `strategy_imbalance_score`, `vulnerability_score` |
| `hedging_strategies` | AI-generated hedging recommendations | `city`, `strategy_type` (diversify/rotate/delay/buffer/reduce), `action_description`, `risk_reduction_pct`, `capital_preservation_prob`, `risk_adjusted_return_improvement`, `priority_rank` |
| `hedging_downside_protection` | Stress drawdown forecasts | `city`, `property_type`, `max_drawdown_pct`, `time_to_recovery_months`, `income_decline_prob`, `forced_liquidation_risk`, `downside_resilience_index`, `recovery_horizon_score` |
| `hedging_safe_havens` | Defensive city/region rankings | `city`, `defensive_score`, `rental_stability`, `policy_protection_score`, `infra_backed_growth`, `capital_protection_score`, `safe_haven_rank`, `recommended_allocation_pct` |

All tables: `id uuid PK`, `created_at timestamptz`, RLS enabled with public read.

## Edge Function: `hedging-engine`

File: `supabase/functions/hedging-engine/index.ts`

Pipelines (via `pipeline` body param):
- **`macro_risk`** — Generates macro risk pressure index, cycle phase detection, policy tightening signals per city
- **`portfolio_exposure`** — Maps overexposure warnings, geographic concentration, strategy imbalance across city×type×tier
- **`hedging_strategies`** — Recommends diversification, rotation, timing, buffer, and reduction actions with simulated outcomes
- **`downside_protection`** — Estimates max drawdowns, recovery horizons, forced liquidation risk per segment
- **`safe_havens`** — Ranks cities by defensive characteristics and outputs allocation guidance
- **`full_hedge`** — Runs all 5 pipelines sequentially

## Frontend Hook: `src/hooks/useHedgingEngine.ts`

- `useHedgingScan()` — mutation invoking edge function
- `useHedgingMacroRisk()` — query from `hedging_macro_risk`
- `useHedgingExposure()` — query from `hedging_portfolio_exposure`
- `useHedgingStrategies()` — query from `hedging_strategies`
- `useHedgingDownside()` — query from `hedging_downside_protection`
- `useHedgingSafeHavens()` — query from `hedging_safe_havens`

## Frontend Page: `src/pages/HedgingEnginePage.tsx`

Route: `/hedging-engine`

Dashboard with 5 tabs:
1. **Macro Risk** — Pressure index gauges + cycle phase badges + bar chart of risk components by city
2. **Portfolio Exposure** — Vulnerability heatmap table + overexposure warning badges
3. **Hedging Strategies** — Strategy cards with risk reduction % + capital preservation probability meters
4. **Downside Protection** — Max drawdown area chart + recovery horizon timeline + resilience index bars
5. **Safe Havens** — Ranked city table with defensive scores + radar chart comparing top safe-haven cities

"Full Risk Hedge Analysis" button triggers `full_hedge` pipeline.

## Routing & Config

Add lazy import + route in `App.tsx`. Add `[functions.hedging-engine] verify_jwt = false` to `config.toml`.

## Files to Create/Edit

| Action | File |
|--------|------|
| Create | `supabase/migrations/..._hedging_engine.sql` |
| Create | `supabase/functions/hedging-engine/index.ts` |
| Create | `src/hooks/useHedgingEngine.ts` |
| Create | `src/pages/HedgingEnginePage.tsx` |
| Edit | `src/App.tsx` (add route) |
| Edit | `supabase/config.toml` (add function) |

