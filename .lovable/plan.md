

## AI Property Match Engine — Plan

### Current State Assessment

The codebase has extensive AI recommendation infrastructure, but critical pieces are disconnected:

1. **`smart-recommendation-engine` edge function is missing** — `useSmartRecommendations.ts` calls it, but the function directory exists with no working implementation. This breaks the entire `RecommendationEngine` component.
2. **Homepage `AIRecommendedProperties` uses generic `ai-assistant` chat** to extract property IDs from free-text — unreliable and ignores all behavior data.
3. **Behavior tracking exists** (`useUserBehaviorAnalytics`, `useBehaviorTracking`) but signals are never fed back into homepage recommendations.
4. **Match scores exist** in the scoring logic but are never shown to users on the homepage cards.
5. **No "pattern detection" UI** — the system learns preferences silently but never tells users what it learned.

### Implementation Plan

**1. Create `smart-recommendation-engine` edge function**

Build the missing function that `useSmartRecommendations` already calls. It will:
- Accept actions: `get_recommendations`, `get_user_profile`, `get_match_report`, `record_signal`, `update_preferences`, `provide_feedback`
- Read from `user_behavior_signals`, `user_preference_profiles`, `user_interactions`, `learned_preferences`
- Score properties using weighted factors (location 25%, price 25%, type 20%, bedrooms 15%, features 15%) — reuse the proven scoring from `ai-property-recommendations`
- Build implicit user profiles from behavior (viewed price ranges, dwell time by type, location clusters, feature affinities)
- Use Lovable AI Gateway (Gemini) to generate natural-language match explanations
- Return match scores, user profile, and metadata

**2. Rewire `AIRecommendedProperties` to use the real engine**

Replace the generic `ai-assistant` call with `smart-recommendation-engine`:
- Call `get_recommendations` action with user ID
- Show match percentage badge on each card (e.g., "92% Match")
- Add "AI Pick" vs "Discovery" distinction on cards
- Fall back to trending properties if user is not logged in or engine fails

**3. Add Behavior Pattern Banner component**

Create `src/components/ai/BehaviorPatternBanner.tsx`:
- Query `get_user_profile` from the engine
- Display detected patterns: "You prefer 2-floor villas with pool in Bali under Rp 5M"
- Show top 3 learned preferences as chips
- "Update preferences" link to PreferencesEditor
- Only show for logged-in users with sufficient browsing history (>5 interactions)

**4. Add match score to homepage property cards**

Update `PropertyCard` inside `AIRecommendedProperties`:
- Accept and display `matchScore` (0-100%) as a small badge
- Show primary match reason as subtitle text (e.g., "Matches your Bali preference")
- Color-code: green (80%+), amber (60-79%), blue (discovery match)

**5. Wire real-time preference learning on PropertyDetail**

The tracking already exists in `PropertyDetail.tsx` via `useUserBehaviorAnalytics`. Add:
- After recording a signal via `record_signal`, invalidate the `smart-recommendations` query cache so homepage updates on next visit
- Track additional granular signals: floor count, pool presence, specific amenities from `property_features`

### Files

| Action | File |
|--------|------|
| Create | `supabase/functions/smart-recommendation-engine/index.ts` |
| Create | `src/components/ai/BehaviorPatternBanner.tsx` |
| Modify | `src/components/property/AIRecommendedProperties.tsx` |
| Modify | `src/pages/Index.tsx` (add BehaviorPatternBanner) |
| Modify | `supabase/config.toml` (register function) |

### Technical Details

**Scoring algorithm in edge function:**
```text
preferenceScore = weighted sum of:
  - location match (25%) — exact city > same province > new area
  - price fit (25%) — within learned budget > below > above
  - type match (20%) — matches most-viewed property types
  - bedroom match (15%) — meets minimum from profile
  - feature match (15%) — has must-have features (pool, garden, etc.)

discoveryScore = base 50 + popularity bonus + new-location bonus + value bonus + premium-feature bonus

Final: 80% preference matches + 20% discovery matches, interleaved at positions 3, 7, etc.
```

**Implicit profile building:**
```text
user_interactions (last 30 days) → extract:
  - viewedPrices → budget range (10th-90th percentile)
  - viewedTypes → preferred property types (top 3)
  - viewedCities → location clusters (top 5)
  - dwellTime by type → style preferences
  - saved/inquired features → must-have features
```

