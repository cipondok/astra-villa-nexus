
# Plan: Add `auto_tune_ai_weights` Mode to Core Engine

## Status: ✅ IMPLEMENTED

All components have been built and deployed.

## What was done

### 1. Database (Migration)
- Created `ai_model_weights` table with 6 factors seeded (location=25, price=22, feature=15, investment=13, popularity=15, collaborative=10, sum=100)
- Created `ai_recommendation_events` table with indexes on created_at, event_type, user_id
- RLS enabled on both tables

### 2. Core Engine (`auto_tune_ai_weights` mode)
- Queries last 30 days of `ai_recommendation_events`
- Calculates conversion correlations per factor (save/inquiry/contact vs impressions)
- Applies guardrails: ±3 max change, minimum 5 per factor, normalize to 100
- Only writes weights when data sufficiency ≥ moderate (100+ events)
- Returns `{ old_weights, new_weights, adjustments, model_health }`

### 3. Event Logging
- `ai-match-engine-v2`: Logs impression events (top 20 results) with match_factors snapshots
- `useBehaviorTracking`: Logs save/inquiry conversion events to `ai_recommendation_events`
