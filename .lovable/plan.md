

## Plan: AI Smart Recommendation System — Curated Collections, ROI Prediction & Engagement Ranking

### What Already Exists

The codebase has substantial AI recommendation infrastructure:
- `smart-recommendation-engine` edge function — scores properties against user profiles (location, price, type, features, discovery)
- `ai-property-recommendations` edge function — uses Lovable AI (Gemini) for natural-language explanations
- `user_behavior_signals` table — tracks clicks, views, dwell time, comparisons
- `user_preference_profiles` + `learned_preferences` + `recommendation_history` tables
- `useAIRecommendations` + `useSmartRecommendations` hooks
- Properties table already has `roi_percentage`, `rental_yield_percentage`, `views_count`, `legal_status`, `wna_eligible`

### What We Will Build

Four new pieces on top of this foundation:

---

### 1. Database: `property_engagement_scores` table + scoring function

New migration adding:

```sql
CREATE TABLE property_engagement_scores (
  property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  views_total INTEGER DEFAULT 0,
  saves_total INTEGER DEFAULT 0,
  inquiries_total INTEGER DEFAULT 0,
  clicks_total INTEGER DEFAULT 0,
  avg_dwell_seconds NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,    -- composite 0-100
  investment_score NUMERIC DEFAULT 0,    -- composite 0-100
  livability_score NUMERIC DEFAULT 0,    -- composite 0-100
  luxury_score NUMERIC DEFAULT 0,        -- composite 0-100
  predicted_roi NUMERIC DEFAULT 0,       -- AI-predicted %
  roi_confidence NUMERIC DEFAULT 0,      -- 0-1
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Scoring formulas (implemented in the edge function, not as DB functions):

**Engagement Score** (0-100):
```
engagement = 0.30 * normalize(views) 
           + 0.25 * normalize(saves) 
           + 0.25 * normalize(inquiries) 
           + 0.10 * normalize(clicks) 
           + 0.10 * normalize(avg_dwell)
```

**Investment Score** (0-100):
```
investment = 0.30 * normalize(roi_percentage) 
           + 0.25 * normalize(rental_yield_percentage)
           + 0.15 * (has legal_status SHM/HGB ? 1 : 0.5)
           + 0.15 * normalize(price_per_sqm_value)
           + 0.15 * (wna_eligible ? 1 : 0.7)
```

**Livability Score** (0-100):
```
livability = 0.25 * (has_pool + garden + parking) / 3
           + 0.20 * normalize(building_area_sqm)
           + 0.20 * normalize(bedrooms, 3-5 optimal)
           + 0.20 * (furnishing == 'furnished' ? 1 : 0.5)
           + 0.15 * (view_type premium ? 1 : 0.6)
```

**Luxury Score** (0-100):
```
luxury = 0.25 * (price > 5B IDR ? 1 : price/5B)
       + 0.20 * (has_pool + has_3d_tour + has_vr) / 3
       + 0.20 * normalize(land_area_sqm, min 500)
       + 0.15 * (view_type ocean/mountain ? 1 : 0.5)
       + 0.20 * normalize(image_count, quality proxy)
```

---

### 2. Edge Function: `ai-smart-collections`

A new Supabase Edge Function that:

1. **`recalculate_scores`** action — Iterates all active properties, aggregates behavior signals + favorites counts, computes engagement/investment/livability/luxury scores, upserts into `property_engagement_scores`.

2. **`get_collection`** action — Returns curated property lists:
   - `best_investment` — Top N by `investment_score`, enhanced with AI-predicted ROI
   - `best_for_living` — Top N by `livability_score`
   - `luxury_collection` — Top N by `luxury_score` where price > threshold
   - `trending` — Top N by `engagement_score`
   - `personalized` — Combines user behavior profile with collection scores (uses existing `user_behavior_signals`)

3. **`predict_roi`** action — For a single property, calls Lovable AI (Gemini) with property data + market context to predict 12-month ROI. Stores result in `property_engagement_scores.predicted_roi`.

Rate limit handling (429/402) will be surfaced to the client.

---

### 3. React Hook: `useSmartCollections`

New hook `src/hooks/useSmartCollections.ts`:

```typescript
export function useSmartCollections() {
  // Returns { bestInvestment, bestForLiving, luxuryCollection, trending }
  // Each is a query calling ai-smart-collections with the appropriate collection type
  // Personalized variant merges user signals when authenticated
}

export function usePropertyROIPrediction(propertyId: string) {
  // Calls predict_roi action, returns { predictedRoi, confidence, trend }
}

export function useEngagementRanking(propertyIds: string[]) {
  // Returns properties sorted by engagement_score
}
```

---

### 4. UI Component: `SmartCollectionsShowcase`

New component `src/components/home/SmartCollectionsShowcase.tsx` — a tabbed section for the homepage showing curated collections:

```text
┌──────────────────────────────────────────────────┐
│  🏆 Smart Collections                            │
│  [Best Investment] [Best Living] [Luxury] [Hot]  │
├──────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│  │Card │ │Card │ │Card │ │Card │  →             │
│  │ROI% │ │Score│ │Score│ │Views│               │
│  └─────┘ └─────┘ └─────┘ └─────┘               │
│                                                  │
│  "AI predicts 8.2% ROI for Bali villas this Q"  │
└──────────────────────────────────────────────────┘
```

Each card shows:
- Property image + basic info
- Collection-specific badge (ROI %, Livability score, Luxury tier, engagement count)
- AI-generated one-liner explanation

This gets added to `Index.tsx` as a lazy-loaded section between existing sections.

---

### Files to Create
1. `supabase/functions/ai-smart-collections/index.ts` — Edge function for scoring + collections + ROI prediction
2. `src/hooks/useSmartCollections.ts` — React hooks for collections and ROI
3. `src/components/home/SmartCollectionsShowcase.tsx` — Tabbed UI component

### Files to Modify
1. `src/pages/Index.tsx` — Add `SmartCollectionsShowcase` as lazy-loaded section
2. `supabase/config.toml` — Register new edge function with `verify_jwt = false`

### Database Migration
- Create `property_engagement_scores` table with RLS (public read, service-role write)

### Technical Details

**Algorithm pipeline:**
1. User browses → `user_behavior_signals` records clicks/views/dwell time (already working)
2. Periodic or on-demand `recalculate_scores` aggregates signals into `property_engagement_scores`
3. `get_collection` reads pre-computed scores, sorts, returns top N with optional user personalization blend
4. `predict_roi` sends property + comparable sales context to Gemini, returns structured ROI prediction via tool calling

**Performance for 100K+ listings:**
- Scores are pre-computed and stored, not calculated per-request
- Collection queries are simple `ORDER BY score DESC LIMIT N` on indexed columns
- Personalization is a lightweight re-ranking of the top 50 candidates, not a full scan
- Indexes on all score columns in the migration

**Existing integration points:**
- Reuses `user_behavior_signals` for click/save/view tracking (no new tracking needed)
- Reuses `favorites` table for save counts
- Reuses `properties` table columns (`roi_percentage`, `rental_yield_percentage`, `has_pool`, etc.)
- Reuses Lovable AI Gateway for ROI prediction (LOVABLE_API_KEY already configured)

