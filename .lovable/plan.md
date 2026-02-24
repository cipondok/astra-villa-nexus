

## Property Recommendation Engine Enhancement

### Current State
The property detail page already has two recommendation sections:
1. **`relatedProperties`** (inline in PropertyDetail.tsx) - Very basic: only filters by `property_type` + `status`
2. **`SimilarProperties` component** - Better: filters by type, listing type, price range (+-30%), and city/state

Neither provides match scoring, feature/amenity matching, or explains why properties are recommended.

### What We'll Build
An enhanced recommendation engine that replaces the basic `relatedProperties` section with a smart, scored recommendation system. It will match on type, location, price range, bedrooms/bathrooms, AND property features (pool, garage, garden, etc.), showing a match percentage for each result.

### Implementation

#### 1. Create a Supabase Edge Function: `property-recommendations`
- Accepts a property ID and returns scored similar properties
- Scoring algorithm:
  - **Property type match**: 25 points
  - **Location match** (city: 20pts, state: 10pts)
  - **Price proximity**: up to 20 points (closer = higher)
  - **Bedroom match**: up to 10 points
  - **Bathroom match**: up to 5 points
  - **Area similarity**: up to 10 points
  - **Feature/amenity overlap**: up to 10 points (pool, garage, garden, security, gym, etc.)
- Returns top N properties sorted by score with match reasons

#### 2. Create `src/components/property/PropertyRecommendations.tsx`
- New component replacing the inline `relatedProperties` section
- Shows each recommended property with:
  - Match percentage badge (e.g., "92% Match")
  - Match reason tags (e.g., "Same area", "Similar price", "Has pool")
  - Property card with image, price, specs
- Animated entrance with framer-motion
- Loading skeleton and empty state

#### 3. Update `src/pages/PropertyDetail.tsx`
- Replace the inline `relatedProperties` section (lines 1250-1330) with the new `PropertyRecommendations` component
- Pass current property data to the component
- Keep the `SimilarProperties` component as a secondary fallback section

### Technical Details

**Edge Function scoring logic (pseudocode):**
```
score = 0
reasons = []

if same property_type: score += 25, reasons.push("Same type")
if same city: score += 20, reasons.push("Same area")
else if same state: score += 10, reasons.push("Same region")

price_diff_pct = abs(price - target_price) / target_price
score += max(0, 20 - price_diff_pct * 100)
if price_diff_pct < 0.15: reasons.push("Similar price")

if same bedrooms: score += 10, reasons.push("Same bedrooms")
if same bathrooms: score += 5

// Feature overlap from property_features JSON
shared_features = intersection(property.features, target.features)
score += min(10, shared_features.length * 2)
for each shared: reasons.push(feature_name)

return { property, score, matchPercentage, reasons }
```

**Files to create:**
- `supabase/functions/property-recommendations/index.ts`
- `src/components/property/PropertyRecommendations.tsx`

**Files to modify:**
- `src/pages/PropertyDetail.tsx` - swap relatedProperties section for new component
- `supabase/config.toml` - add function config with `verify_jwt = false`
