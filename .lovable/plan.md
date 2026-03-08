

## Property SEO Checker - Full Diagnostic & Fix Plan

### Issues Found

**1. Edge function missing handlers for 4 actions**
The `handleSeoGeneration` function only handles `analyze-property`, `analyze-batch`, and `auto-optimize`. These actions fall through to `not_implemented`:
- `content-optimize` (AI Optimize button in detail view)
- `apply-seo` (Apply SEO button)
- `generate-serp-preview` (SERP preview feature)
- `competitor-analysis` (Competitor analysis feature)

**2. Auto-Optimize finds nothing because all scores are ≥ 58**
The `computeSeoDraft` function generates base scores starting at 45+ with boosts, resulting in minimum scores of 58. The default threshold is 50, so no properties are ever "weak" enough to optimize. The algorithm is too generous.

**3. Analyze Batch "unanalyzed" filter is fragile**
It fetches only `limit * 8` most recently updated properties (160 for limit=20), then checks overlap with analyzed. If those happen to be analyzed already, returns 0. With 207k properties and 430+ analyzed, this is an edge case but the user may have hit it after repeated batches.

**4. `computeSeoDraft` produces uniform/fake-looking scores**
The SEO engine is purely template-based (string manipulation), not actually analyzing content quality, keyword density, or competitiveness. All properties get similar scores (58-100) regardless of actual SEO quality.

### Plan

#### A. Implement missing edge function actions (ai-engine)
Add these handlers inside `handleSeoGeneration`:

- **`content-optimize`**: Fetch property, use Lovable AI gateway to generate optimized title, description, meta tags, and keyword suggestions. Return `ContentOptimization` structure.
- **`apply-seo`**: Read SEO analysis for the property, update the actual `properties` table with `seo_title`, `seo_description` (or the property's `title`/`description` columns) from the analysis.
- **`generate-serp-preview`**: Build current vs optimized SERP preview from the property data and its SEO analysis.
- **`competitor-analysis`**: Query similar properties in the same location/type, compare SEO scores, generate insights.

#### B. Fix Auto-Optimize threshold & scoring
- Lower the base scores in `computeSeoDraft` to produce more realistic ranges (e.g., 20-90 instead of 58-100)
- Score penalties for: missing description (<50 chars), no city/state, generic title, no keywords in title
- Raise default auto-optimize threshold to 60

#### C. Fix Analyze Batch unanalyzed filter
- Instead of fetching random candidates then filtering, use a LEFT JOIN approach:
  - Query properties that do NOT have a matching `property_seo_analysis` row
  - Use a subquery: `SELECT id FROM properties WHERE id NOT IN (SELECT property_id FROM property_seo_analysis) LIMIT {limit}`
  - This guarantees finding unanalyzed properties

#### D. Improve content-optimize with real AI
- Use Lovable AI gateway (`google/gemini-3-flash-preview`) to generate genuinely optimized SEO content
- Prompt with property details to get targeted title, description, keywords, and readability tips

### Files to modify
- `supabase/functions/ai-engine/index.ts` — Add 4 missing action handlers, fix scoring, fix batch query
- No client-side changes needed (hooks already call correct actions)

### Technical Details
- Edge function uses service role key (bypasses RLS) - confirmed working
- `property_seo_analysis` has 430 rows, `properties` has 207k rows
- RLS is properly configured (public SELECT, authenticated INSERT/UPDATE)
- All existing hooks (`useApplySeo`, `useContentOptimize`, etc.) are correctly wired

