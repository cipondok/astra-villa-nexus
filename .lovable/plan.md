

## Plan: Natural Language AI Search System

### Context

The project already has most of the infrastructure needed:

- **`ai-property-assistant`** edge function already does NLP extraction via OpenAI — but it uses a hardcoded OpenAI key (not the Lovable AI Gateway), uses `select('*')`, and doesn't integrate with the existing `usePropertySearch` hook or `search_properties_advanced` RPC.
- **`usePropertySearch`** hook already builds structured filters and calls `search_properties_advanced` RPC with full filter support (price range, property type, location, bedrooms, amenities, features, etc.).
- **`SearchSuggestions`** component has a static keyword dictionary but no AI-powered NLP.
- The project uses Supabase + PostgreSQL (not MySQL) and Deno Edge Functions (not Node.js).

The approach: build a new dedicated edge function that uses **Lovable AI Gateway with tool calling** to extract structured filters from natural language, then have the frontend pipe those extracted filters directly into the existing `usePropertySearch.searchProperties()` flow. This avoids duplicating query logic.

---

### 1. New Edge Function: `supabase/functions/ai-nlp-search/index.ts`

Uses Lovable AI Gateway (`google/gemini-3-flash-preview`) with **tool calling** to extract structured search parameters. This is more reliable than asking the model to return JSON in prose.

**Tool definition** sent to the model:
```typescript
{
  name: "extract_property_filters",
  parameters: {
    location: { type: "string" },        // "Bali", "Jakarta", etc.
    state: { type: "string" },
    city: { type: "string" },
    property_type: { type: "string", enum: ["house","apartment","villa","land","commercial"] },
    listing_type: { type: "string", enum: ["sale","rent"] },
    min_price: { type: "number" },        // in IDR
    max_price: { type: "number" },
    bedrooms: { type: "number" },
    bathrooms: { type: "number" },
    min_area: { type: "number" },
    max_area: { type: "number" },
    amenities: { type: "array", items: { type: "string" } },  // pool, garden, parking...
    features: { type: "array", items: { type: "string" } },
    furnishing: { type: "string", enum: ["furnished","semi-furnished","unfurnished"] },
    has_3d: { type: "boolean" },
    has_virtual_tour: { type: "boolean" },
    sort_by: { type: "string", enum: ["newest","price_low","price_high","popular"] },
    investment_intent: { type: "boolean" },   // true if user mentions ROI, investment, yield
    intent_summary: { type: "string" }        // human-readable interpretation
  }
}
```

The system prompt instructs the model to:
- Understand Indonesian property context (IDR currency, "miliar"/"juta" = billion/million)
- Map "under 5 billion" → `max_price: 5000000000`
- Map "Bali" → `location: "Bali"` or `state: "Bali"`
- Map "pool" → `amenities: ["pool"]`
- Map "good ROI" → `investment_intent: true`, `sort_by: "popular"`
- Map "luxury villa" → `property_type: "villa"`, plus infer premium price range

Handles 429/402 rate limit errors from the gateway.

**Input validation** via Zod: query string 1-500 chars.

---

### 2. New Hook: `src/hooks/useNLPSearch.ts`

```typescript
export function useNLPSearch() {
  // State: nlpQuery, extractedFilters, intentSummary, isProcessing
  
  // processNaturalLanguage(query: string):
  //   1. Calls ai-nlp-search edge function
  //   2. Receives structured filters + intent_summary
  //   3. Maps response to SearchFilters format matching usePropertySearch
  //   4. Returns { filters, intentSummary, investmentIntent }
  
  // applyToSearch(searchProperties: Function):
  //   Passes extracted filters directly to usePropertySearch.searchProperties()
}
```

This bridges NLP output → existing search infrastructure. No duplicate query logic.

---

### 3. New Component: `src/components/search/NLPSearchBar.tsx`

A search input with AI indicator that:
- Shows a text input with a sparkle/brain icon indicating AI-powered search
- On submit, calls `useNLPSearch.processNaturalLanguage()`
- Displays extracted filter chips below the input (e.g., "Location: Bali", "Max Price: 5B IDR", "Amenities: Pool")
- Shows the AI's `intent_summary` as a subtitle (e.g., "Looking for luxury villas in Bali under 5 billion with pool and investment potential")
- Has an "Apply Filters & Search" button that feeds filters into `searchProperties()`
- Shows investment-specific badges when `investment_intent` is true
- Animated loading state while AI processes

---

### 4. Integration into `PropertySearch.tsx`

Add `NLPSearchBar` above the existing `StickySearchPanel` as an optional AI search mode. Users can toggle between traditional filters and natural language input. When NLP extracts filters, they populate the existing filter state and trigger the same `searchProperties()` call.

---

### Files to Create
1. `supabase/functions/ai-nlp-search/index.ts` — Edge function with Lovable AI tool calling
2. `src/hooks/useNLPSearch.ts` — Hook bridging NLP output to existing search
3. `src/components/search/NLPSearchBar.tsx` — AI search bar UI component

### Files to Modify
1. `supabase/config.toml` — Register `ai-nlp-search` with `verify_jwt = false`
2. `src/pages/PropertySearch.tsx` — Add NLPSearchBar toggle above existing search

### Technical Details

**Why tool calling over JSON prompting:** The existing `ai-property-assistant` asks the model to return raw JSON, which is fragile (model can wrap in markdown, add commentary). Tool calling guarantees structured output via the API's `tool_choice` parameter.

**Why a new function instead of reusing `ai-property-assistant`:** That function uses OpenAI directly (requires `OPENAI_API_KEY`), uses `select('*')`, and builds its own queries. The new function only extracts filters — the actual DB query runs through the existing `search_properties_advanced` RPC on the client side, which is already optimized with fallbacks.

**Price parsing examples:**
- "under 5 billion" → `max_price: 5000000000`
- "2-3 miliar" → `min_price: 2000000000, max_price: 3000000000`
- "above 500 juta" → `min_price: 500000000`

**Investment intent detection:** When detected, the UI shows ROI badges from `property_engagement_scores` and can sort by `investment_score` from the Smart Collections system built earlier.

