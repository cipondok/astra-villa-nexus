

# Investor DNA Personalization Engine — Implementation Plan

## Overview

Build a behavioral intelligence system that learns each investor's strategy, risk profile, and preferences from their actions, then personalizes all recommendations, rankings, alerts, and Copilot responses accordingly.

## Architecture

```text
┌─────────────────────────────────────────────────┐
│              Behavioral Signals                  │
│  views, saves, searches, filters, alert response │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│         DNA Computation Engine                   │
│  (core-engine mode: compute_investor_dna)        │
│  Converts signals → 11 DNA dimensions            │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│            investor_dna table                    │
│  risk_tolerance, horizon, luxury_bias, etc.      │
└──────┬───────────┬──────────────┬───────────────┘
       ▼           ▼              ▼
  Personalized  Copilot      Predictive
  Rankings      Prompt       Journey
               Injection    (churn, upgrade)
```

## Implementation Steps

### 1. Database Migration — `investor_dna` + `investor_dna_signals`

**Table: `investor_dna`** — One row per user, auto-updated from behavior.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid PK | FK auth.users |
| risk_tolerance_score | smallint 0-100 | Derived from price variance + property types viewed |
| investment_horizon_years | numeric | Inferred from ROI forecast views (1Y vs 5Y clicks) |
| preferred_property_types | text[] | Top 3 types by view+save frequency |
| preferred_cities | text[] | Top 5 cities by engagement |
| budget_range_min/max | bigint | P10/P90 of viewed property prices |
| rental_income_pref_weight | numeric 0-1 | Yield vs growth signal ratio |
| capital_growth_pref_weight | numeric 0-1 | Complement of rental weight |
| flip_strategy_affinity | numeric 0-100 | Engagement with flip/deal content |
| luxury_bias_score | numeric 0-100 | Price tier distribution of views |
| diversification_score | numeric 0-100 | City/type spread in portfolio |
| probability_next_purchase | numeric 0-1 | Activity acceleration signal |
| churn_risk_score | numeric 0-100 | Days since last activity decay |
| expected_budget_upgrade | numeric 0-1 | Budget drift direction |
| geo_expansion_likelihood | numeric 0-1 | New city exploration rate |
| investor_persona | text | conservative/balanced/aggressive/luxury/flipper |
| last_computed_at | timestamptz | Freshness |
| version | int | DNA model version |

**Table: `investor_dna_signals`** — Raw signal log for DNA recomputation.

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid |
| signal_type | text (view, save, search, filter, alert_response, comparison, map_explore) |
| signal_data | jsonb |
| created_at | timestamptz |

RLS: users read own DNA, admins read all. Signals insert-only for owner.

### 2. DNA Computation Engine — New `compute_investor_dna` mode in `core-engine`

Algorithm per dimension:

- **risk_tolerance**: Std dev of viewed property prices normalized 0-100. High variance = aggressive.
- **preferred_property_types/cities**: Top N by weighted score (view=1, save=3, inquiry=5).
- **budget_range**: P10/P90 of price distribution from views+saves (last 90d).
- **rental_income_pref_weight**: ratio of `rental yield` page views + yield-sorted searches vs growth-sorted.
- **flip_strategy_affinity**: Engagement with deal_finder, undervalued properties, short-hold ROI.
- **luxury_bias**: % of viewed properties in top 20% price tier for their city.
- **diversification_score**: Shannon entropy of city+type distribution in saves/portfolio.
- **investor_persona**: Rule-based classification from the above scores.

Predictive dimensions:
- **probability_next_purchase**: Logistic function of activity acceleration (7d vs 30d ratio).
- **churn_risk**: Exponential decay from `last_active_at`, scaled 0-100.
- **expected_budget_upgrade**: Slope of budget drift over last 60d of views.
- **geo_expansion_likelihood**: New cities explored / total cities ratio (30d).

### 3. Personalized Scoring — Modify `core-engine` investment ranking

Add DNA match calculation:

```
dna_match_score = (
  city_affinity     * 0.25 +
  type_affinity     * 0.20 +
  budget_fit        * 0.25 +
  risk_alignment    * 0.15 +
  yield_growth_fit  * 0.15
)

final_score = global_investment_score * 0.6 + dna_match_score * 0.4
```

- **city_affinity**: 1.0 if property city in preferred_cities, decaying by rank.
- **type_affinity**: 1.0 if type matches top preferred type.
- **budget_fit**: Gaussian fit within budget_range_min/max.
- **risk_alignment**: Distance between property risk_level and investor risk_tolerance.
- **yield_growth_fit**: Dot product of property yield/growth profile with investor weights.

### 4. Copilot Prompt Injection — Modify `investor-copilot`

Fetch `investor_dna` for authenticated user and inject into system prompt:

```
INVESTOR DNA PROFILE:
- Persona: {persona} | Risk: {risk_tolerance}/100
- Preferred: {cities}, {types}
- Budget: Rp {min} – Rp {max}
- Strategy: {rental_weight*100}% yield / {growth_weight*100}% growth
- Flip Affinity: {flip}/100 | Luxury Bias: {luxury}/100

ADAPT YOUR RESPONSE:
- Conservative → emphasize stability, yield, low-risk metrics
- Aggressive → highlight undervalued deals, flip potential, growth
- Luxury → focus on prestige, long-term appreciation, premium locations
```

### 5. Frontend — Investor DNA Dashboard Component

New `InvestorDNAPanel.tsx` component showing:
- Radar chart of DNA dimensions (risk, yield pref, growth pref, luxury, diversification, flip)
- Persona badge with description
- Predictive journey indicators (purchase probability, churn risk)
- "How we personalize for you" explainer

Integrate into Investor Dashboard page.

### 6. Background Job — Auto-recompute DNA

Add `compute_investor_dna` job type to `job-worker`. Trigger:
- On high-signal events (save, inquiry) via debounced flag in `user_ai_cache`
- Daily batch for all active investors
- DNA version bumps force full recompute

### 7. Signal Collection Enhancement

Update `useBehaviorTracking` hook to also insert into `investor_dna_signals` for enriched signal types:
- `filter_change` with filter values
- `comparison_usage` when compare tool used
- `alert_response` timing
- `map_explore` with lat/lng clusters

### Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/migrations/xxx_investor_dna.sql` | Create `investor_dna` + `investor_dna_signals` tables with RLS |
| `supabase/functions/core-engine/index.ts` | Add `compute_investor_dna` mode + modify scoring to use DNA |
| `supabase/functions/investor-copilot/index.ts` | Inject DNA context into system prompt |
| `src/hooks/useInvestorDNA.ts` | New hook to fetch/display DNA data |
| `src/components/investor/InvestorDNAPanel.tsx` | New radar chart dashboard component |
| `src/pages/InvestorDashboard.tsx` | Integrate DNA panel |
| `src/hooks/useBehaviorTracking.ts` | Add signal enrichment for DNA |
| `supabase/functions/job-worker/index.ts` | Add `compute_investor_dna` job handler |

