

# AI Autonomous Deal Hunter Engine — Implementation Plan

## Current State Analysis

The platform already has significant deal infrastructure:
- `investor_alerts` mode in core-engine (scans 5 signals: price_drop, high_rental_yield, high_deal_score, market_growth, high_investment_score)
- `deal_analysis_v2` mode (batch scoring with confidence, liquidity, flip potential)
- `deal_detector` mode (single property undervaluation check)
- `deal_finder` mode via deal-engine (filtered deal discovery)
- `property_deal_analysis` table with deal_score, undervaluation_percent, deal_tag
- `autonomous_agent_scans` table for scan logging
- Investor DNA system for personalization

**What's missing**: lifecycle predictions, urgency scoring, deal surfacing into homepage/feeds, DNA-routed alerts, deal tier classification, and the autonomous scanner as a unified pipeline.

## Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                  Scheduled Trigger (pg_cron)              │
│   deal_hunter_scan: every 3 hours                        │
└────────────────────────┬─────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│           core-engine: deal_hunter_scan                   │
│                                                          │
│  1. Scan all active properties                           │
│  2. Compute deal_opportunity_signal_score                │
│  3. Smart undervaluation detection (FMV + momentum)      │
│  4. Predict deal lifecycle (sell probability, urgency)   │
│  5. Classify deal tier (public / VIP / institutional)    │
│  6. Upsert into deal_hunter_opportunities table          │
│  7. Route alerts to matching investor DNA profiles       │
│  8. Surface top deals for homepage injection             │
└──────────────────────────┬───────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────┐
│            deal_hunter_opportunities table                │
│                                                          │
│  deal_opportunity_signal_score, deal_strength_index,     │
│  undervaluation_percent, deal_classification,            │
│  urgency_score, sell_probability_30d,                    │
│  optimal_entry_window, deal_tier, surfaced_at            │
└──────┬───────────┬──────────────┬────────────────────────┘
       ▼           ▼              ▼
  Homepage      Investor       DNA-Matched
  Hero Feed     Feed Inject    Alert Routing
```

## Implementation Steps

### 1. Database: `deal_hunter_opportunities` table

New table storing the autonomous scanner's output:

| Column | Type | Purpose |
|--------|------|---------|
| property_id | uuid PK | FK to properties |
| deal_opportunity_signal_score | smallint 0-100 | Composite signal score |
| deal_strength_index | smallint 0-100 | Undervaluation + momentum + absorption |
| undervaluation_percent | numeric | FMV gap |
| estimated_fair_value | bigint | Computed FMV |
| deal_classification | text | hot_deal / silent_opportunity / long_term_value / speculative |
| urgency_score | smallint 0-100 | Time-sensitivity indicator |
| sell_probability_30d | numeric 0-1 | Predicted probability |
| price_velocity | numeric | Expected price change rate |
| optimal_entry_window_days | int | Days before opportunity closes |
| deal_tier | text | public / vip / institutional |
| signals | text[] | Array of detected signals |
| signal_metadata | jsonb | Signal details |
| surfaced_at | timestamptz | When deal was first surfaced |
| expires_at | timestamptz | Estimated deal expiry |
| scan_version | int | Scanner version for invalidation |

RLS: public read for authenticated, service_role write.

### 2. Core Engine: `deal_hunter_scan` mode

New mode in core-engine that runs the full autonomous pipeline:

**Signal Detection** (expanded from current investor_alerts):
- New listings (< 3 days old)
- Price reductions (from property_price_history)
- DOM anomalies (listed > 60 days = distressed signal)
- High rental yield zones (>= 6%)
- Emerging growth corridors (annual_growth_rate >= 5%)
- Undervaluation vs city median (>= 10%)
- Developer early inventory (is_pre_launch flag)

**Deal Opportunity Signal Score**:
```
deal_opportunity_signal_score = (
  undervaluation_signal * 30 +
  price_drop_signal * 20 +
  yield_signal * 15 +
  demand_heat_signal * 15 +
  growth_signal * 10 +
  dom_anomaly_signal * 10
)
```

**Undervaluation Detection** (enhanced FMV):
```
estimated_fair_value = weighted_avg(
  comparable_median_psm * area * 0.6,
  city_growth_adjusted_value * 0.25,
  price_history_momentum * 0.15
)
undervaluation_percent = (FMV - listing_price) / FMV * 100
deal_strength_index = undervaluation_pct * 0.5 + demand_heat * 0.3 + growth_rate * 0.2
```

**Deal Classification**:
- `hot_deal`: deal_strength >= 70 AND demand_heat >= 60
- `silent_opportunity`: undervaluation >= 15% AND demand_heat < 40
- `long_term_value`: growth_rate >= 8% AND investment_score >= 70
- `speculative`: high volatility OR pre-launch with low completion

**Lifecycle Predictions**:
```
sell_probability_30d = sigmoid(
  -0.05 * days_on_market +
  0.03 * demand_heat_score +
  0.02 * (100 - price_vs_median_pct) +
  recent_views_boost
)
urgency_score = min(100, sell_prob * 60 + price_drop_recency * 20 + scarcity * 20)
optimal_entry_window = max(1, 30 - urgency_score * 0.3)
```

**Deal Tier Classification**:
- `public`: All deals with signal_score >= 40
- `vip`: signal_score >= 65 OR pre_launch with discount >= 15%
- `institutional`: price >= 10B IDR AND undervaluation >= 20%

### 3. DNA-Matched Alert Routing

After computing opportunities, match against `investor_dna` profiles:
- City match: property city in investor's preferred_cities
- Type match: property type in investor's preferred_property_types
- Budget fit: price within budget_range_min/max
- Strategy fit: flip deals → flipper persona, yield deals → conservative persona

Create `in_app_notifications` with `type = 'deal_hunter_[classification]'` for matched investors.

### 4. Homepage Deal Surfacing

New hook `useDealHunterFeed` that fetches top-scored opportunities from `deal_hunter_opportunities` for:
- Homepage hero injection (top 5 by urgency_score, tier = public)
- SmartAIFeed integration (blend deal_hunter results into AI ranking)

New component `DealHunterHero` showing countdown-style urgency indicators.

### 5. Frontend: Deal Hunter Dashboard

New component `DealHunterPanel.tsx` on the Investor Dashboard showing:
- Active hot deals with urgency countdown
- Deal classification breakdown (cards per category)
- Sell probability gauge per opportunity
- "Optimal entry window" indicator

### 6. Scheduled Job

Add `deal_hunter_scan` to scheduler's cron (every 3 hours) via job-worker integration.

### Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/migrations/xxx_deal_hunter.sql` | Create `deal_hunter_opportunities` table |
| `supabase/functions/core-engine/index.ts` | Add `deal_hunter_scan` mode (~150 lines) |
| `src/hooks/useDealHunter.ts` | Hook to fetch/display deal hunter opportunities |
| `src/components/investor/DealHunterPanel.tsx` | Dashboard panel with urgency indicators |
| `src/components/home/DealHunterHero.tsx` | Homepage hero deal injection component |
| `src/pages/InvestorDashboard.tsx` | Integrate DealHunterPanel |
| `src/components/home/SmartAIFeed.tsx` | Blend deal hunter results into feed |
| `supabase/functions/job-worker/index.ts` | Add `deal_hunter_scan` job type |

