

# AI Portfolio Optimizer

## Architecture
Same proven pattern: 1 edge function, 5 DB tables, 1 hook file, 1 dashboard page.

## Database Tables

| Table | Key Columns |
|-------|-------------|
| `portfolio_optimizer_allocations` | `city`, `property_type`, `current_allocation_pct`, `optimal_allocation_pct`, `adjustment_direction` (increase/decrease/hold), `risk_adjusted_return`, `sharpe_ratio`, `rebalance_priority` |
| `portfolio_optimizer_diversification` | `city`, `property_type`, `correlation_score`, `diversification_benefit`, `concentration_risk`, `recommended_weight`, `sector_exposure` |
| `portfolio_optimizer_rebalancing` | `city`, `property_type`, `action` (buy/sell/hold/rotate), `reason`, `expected_return_improvement`, `risk_reduction_pct`, `urgency` (high/medium/low), `capital_required` |
| `portfolio_optimizer_performance` | `city`, `property_type`, `total_return`, `risk_score`, `alpha`, `beta`, `max_drawdown`, `yield_stability`, `efficiency_score` |
| `portfolio_optimizer_scenarios` | `scenario_name` (aggressive/balanced/conservative/income), `city`, `property_type`, `weight_pct`, `projected_return`, `projected_risk`, `sharpe_ratio` |

All: `id uuid PK`, `created_at timestamptz`, RLS public read.

## Edge Function: `portfolio-optimizer`

Pipelines via `pipeline` body param:
- **`performance`** — Calculates return, alpha, beta, drawdown, efficiency per city×type from properties data
- **`diversification`** — Computes correlation scores, concentration risk, recommended weights
- **`allocations`** — Generates current vs optimal allocation with adjustment directions
- **`rebalancing`** — Produces buy/sell/hold/rotate recommendations with urgency levels
- **`scenarios`** — Builds 4 strategy scenarios (aggressive/balanced/conservative/income) with projected returns
- **`full_optimize`** — Runs all 5 sequentially

## Frontend Hook: `src/hooks/usePortfolioOptimizer.ts`

6 exports: `usePortfolioOptimizerScan()` mutation + 5 queries for each table.

## Frontend Page: `src/pages/PortfolioOptimizerPage.tsx`

Route: `/portfolio-optimizer`

5-tab dashboard:
1. **Performance** — Efficiency score bars + alpha/beta table + max drawdown indicators
2. **Diversification** — Correlation matrix visualization + concentration risk badges
3. **Allocations** — Current vs optimal allocation bar chart + adjustment direction arrows
4. **Rebalancing** — Action cards (Buy/Sell/Hold/Rotate) with urgency badges + capital required
5. **Scenarios** — 4 strategy cards with projected return/risk + Sharpe ratio comparison bar chart

"Run Full Optimization" button triggers `full_optimize`.

Theme-aware colors using `hsl(var(--chart-*))`, `hsl(var(--foreground))`, semantic tokens throughout.

## Files

| Action | File |
|--------|------|
| Create | `supabase/migrations/..._portfolio_optimizer.sql` |
| Create | `supabase/functions/portfolio-optimizer/index.ts` |
| Create | `src/hooks/usePortfolioOptimizer.ts` |
| Create | `src/pages/PortfolioOptimizerPage.tsx` |
| Edit | `src/App.tsx` (lazy import + route) |
| Edit | `supabase/config.toml` (add function) |

