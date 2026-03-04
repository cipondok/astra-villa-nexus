

# Plan: Add `auto_tune_ai_weights` Mode to Core Engine

## Overview
Extend the `core-engine` edge function with a new `auto_tune_ai_weights` mode that analyzes the last 30 days of behavioral data, calculates conversion correlations per scoring factor, and adjusts weights in a new `ai_model_weights` table — all within strict guardrails (±3 max change, total=100, minimum 5 per factor).

## Database Changes (2 new tables, 1 migration)

### Table: `ai_model_weights`
Stores the current and historical weight configuration for the 6 scoring factors used by `ai-match-engine-v2`.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| factor | text NOT NULL | `location`, `price`, `feature`, `investment`, `popularity`, `collaborative` |
| weight | integer NOT NULL | Current weight (default sum = 100) |
| updated_at | timestamptz | Last tuning timestamp |
| updated_by | text | `'auto_tune'` or `'manual'` |

Seed with current hardcoded weights: location=25, price=20, feature=20, investment=20, popularity=15, collaborative=10.

### Table: `ai_recommendation_events`
Tracks recommendation outcomes — when a recommended property receives a conversion signal (save, inquiry, contact, share).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| property_id | uuid FK → properties | |
| event_type | text | `impression`, `click`, `save`, `inquiry`, `contact` |
| match_factors | jsonb | Snapshot of which factors matched at recommendation time (e.g. `{location: true, price: 0.9, ...}`) |
| ai_match_score | integer | Score at time of recommendation |
| created_at | timestamptz | |

## Core Engine Extension

Add `'auto_tune_ai_weights'` to the `validModes` array. The handler will:

1. **Query `ai_recommendation_events`** from the last 30 days, grouping by `event_type`.
2. **Calculate conversion correlations** — for each of the 6 factors, compute the correlation between the factor being present/strong and conversion events (save/inquiry/contact) vs. non-converting impressions.
3. **Read current weights** from `ai_model_weights`.
4. **Compute adjustments** using correlation strength:
   - Factors with above-average conversion correlation get a positive adjustment (up to +3).
   - Factors with below-average get a negative adjustment (down to -3).
   - Clamp: no factor below 5.
   - Normalize: total must equal 100.
5. **Write new weights** back to `ai_model_weights`.
6. **Return** `{ old_weights, new_weights, adjustments, model_health }`.

`model_health` will include: event count, data sufficiency rating, confidence level, and last tuned timestamp.

## Populating `ai_recommendation_events`

Add a lightweight insert into `ai_recommendation_events` from the `ai-match-engine-v2` function. When recommendations are served, log `impression` events with `match_factors` snapshot. Conversion events (`save`, `inquiry`) will be logged via a small addition to the existing `useBehaviorTracking` hook or via a DB trigger on `saved_properties` / `activity_logs`.

## Files to Change

| File | Change |
|---|---|
| Migration SQL | Create `ai_model_weights` and `ai_recommendation_events` tables, seed default weights |
| `supabase/functions/core-engine/index.ts` | Add `auto_tune_ai_weights` to validModes, implement handler (~80 lines) |
| `supabase/functions/ai-match-engine-v2/index.ts` | Log impression events with factor snapshots to `ai_recommendation_events` |
| `src/hooks/useBehaviorTracking.ts` | Log conversion events (save/inquiry) to `ai_recommendation_events` |

## Guardrail Logic (pseudocode)

```text
for each factor:
  correlation = (conversions_with_factor / total_with_factor) 
              - (conversions_without / total_without)

avg_correlation = mean(all correlations)

for each factor:
  raw_adj = round((correlation - avg) * scale_factor)
  adj = clamp(raw_adj, -3, +3)

// Apply adjustments
new_weights = old_weights + adjustments

// Enforce minimum 5
for each factor where new_weight < 5:
  deficit = 5 - new_weight
  new_weight = 5
  redistribute deficit from highest factors

// Normalize to 100
diff = 100 - sum(new_weights)
distribute diff across factors proportionally
```

