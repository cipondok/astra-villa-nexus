import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Matching weights ──────────────────────────────────────────────────────────
const W = {
  budget: 0.20,
  location: 0.18,
  propertyType: 0.10,
  rentalYield: 0.12,
  riskAlign: 0.10,
  liquidity: 0.10,
  dealScore: 0.08,
  diversification: 0.07,
  appreciation: 0.05,
};

function clamp01(v: number): number { return Math.max(0, Math.min(1, v)); }

function budgetMatch(price: number, min: number, max: number): number {
  if (price >= min && price <= max) return 1;
  if (price < min) return clamp01(price / min);
  return clamp01(max / price);
}

function locationMatch(city: string | null, preferred: string[]): number {
  if (!city || !preferred?.length) return 0.5;
  return preferred.some(c => c.toLowerCase() === city.toLowerCase()) ? 1 : 0.2;
}

function typeMatch(ptype: string, preferred: string[]): number {
  if (!preferred?.length) return 0.5;
  return preferred.some(t => t.toLowerCase() === ptype.toLowerCase()) ? 1 : 0.3;
}

function riskAlignment(propRisk: string | null, tolerance: number): number {
  const riskMap: Record<string, number> = { low: 0.2, medium: 0.5, high: 0.8 };
  const propLevel = riskMap[propRisk?.toLowerCase() || 'medium'] ?? 0.5;
  return 1 - Math.abs(propLevel - tolerance);
}

function strategyTag(persona: string | null, yieldPct: number | null, roi: number | null): string {
  if (persona === 'flipper') return 'Flip Opportunity';
  if (persona === 'luxury') return 'Luxury Lifestyle';
  if ((yieldPct ?? 0) > 8) return 'Yield Hunter';
  if ((roi ?? 0) > 15) return 'Growth Play';
  return 'Balanced Hold';
}

function exitTimingMonths(horizon: number | null, liquidityScore: number): number {
  const base = (horizon ?? 5) * 12;
  if (liquidityScore > 80) return Math.round(base * 0.7);
  if (liquidityScore > 50) return Math.round(base * 0.9);
  return base;
}

function suggestedOfferRange(price: number, negotiation: number): { low: number; high: number } {
  const discount = clamp01(negotiation / 100) * 0.12;
  return {
    low: Math.round(price * (1 - discount - 0.03)),
    high: Math.round(price * (1 - discount * 0.3)),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.user_id || body.userId;
    const topN = body.top_n ?? 5;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "user_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch investor DNA
    const { data: dna } = await supabase
      .from("investor_dna")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // 2. Fetch investor preferences as fallback
    const { data: prefs } = await supabase
      .from("investor_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // 3. Fetch investor profile
    const { data: profile } = await supabase
      .from("investor_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Merge into unified investor signal
    const investor = {
      budgetMin: dna?.budget_range_min ?? prefs?.budget_min ?? profile?.investment_budget_min ?? 0,
      budgetMax: dna?.budget_range_max ?? prefs?.budget_max ?? profile?.investment_budget_max ?? 50_000_000_000,
      preferredCities: dna?.preferred_cities ?? prefs?.preferred_cities ?? profile?.preferred_locations ?? [],
      preferredTypes: dna?.preferred_property_types ?? prefs?.preferred_property_types ?? profile?.preferred_property_types ?? [],
      riskTolerance: (dna?.risk_tolerance_score ?? 0.5),
      rentalPref: (dna?.rental_income_pref_weight ?? 0.5),
      capitalGrowthPref: (dna?.capital_growth_pref_weight ?? 0.5),
      horizon: dna?.investment_horizon_years ?? 5,
      diversificationScore: dna?.diversification_score ?? 0.5,
      persona: dna?.investor_persona ?? null,
    };

    // 4. Fetch active properties with scores
    const { data: properties, error: propErr } = await supabase
      .from("properties")
      .select("id, title, city, property_type, price, rental_yield, rental_yield_percentage, roi_percentage, deal_score, investment_score, investment_risk_level, days_on_market, demand_heat_score, status, listing_type, thumbnail_url, location")
      .in("status", ["active", "available"])
      .not("price", "is", null)
      .limit(500);

    if (propErr) throw propErr;
    if (!properties?.length) {
      return new Response(
        JSON.stringify({ matches: [], count: 0, investor_signal: investor }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Fetch liquidity scores
    const propIds = properties.map(p => p.id);
    const { data: liquidityScores } = await supabase
      .from("property_liquidity_scores")
      .select("property_id, liquidity_score")
      .in("property_id", propIds.slice(0, 50));

    const liqMap = new Map((liquidityScores || []).map(l => [l.property_id, l.liquidity_score]));

    // 6. Score each property
    const scored = properties.map(p => {
      const price = p.price ?? 0;
      const liqScore = liqMap.get(p.id) ?? 50;
      const yieldPct = p.rental_yield_percentage ?? p.rental_yield ?? 0;
      const roi = p.roi_percentage ?? 0;
      const dealS = p.deal_score ?? 50;
      const negotiationFlex = Math.max(0, 100 - (p.demand_heat_score ?? 50));

      const signals = {
        budget: budgetMatch(price, investor.budgetMin, investor.budgetMax),
        location: locationMatch(p.city, investor.preferredCities),
        propertyType: typeMatch(p.property_type, investor.preferredTypes),
        rentalYield: clamp01(yieldPct / 15) * investor.rentalPref + clamp01(roi / 30) * investor.capitalGrowthPref,
        riskAlign: riskAlignment(p.investment_risk_level, investor.riskTolerance),
        liquidity: clamp01(liqScore / 100),
        dealScore: clamp01(dealS / 100),
        diversification: investor.diversificationScore > 0.7 ? 0.8 : 0.5,
        appreciation: clamp01((roi || 0) / 25),
      };

      const confidence = Math.round(
        (signals.budget * W.budget +
          signals.location * W.location +
          signals.propertyType * W.propertyType +
          signals.rentalYield * W.rentalYield +
          signals.riskAlign * W.riskAlign +
          signals.liquidity * W.liquidity +
          signals.dealScore * W.dealScore +
          signals.diversification * W.diversification +
          signals.appreciation * W.appreciation) * 100
      );

      const offer = suggestedOfferRange(price, negotiationFlex);

      return {
        property_id: p.id,
        title: p.title,
        city: p.city,
        property_type: p.property_type,
        price,
        thumbnail_url: p.thumbnail_url,
        location: p.location,
        listing_type: p.listing_type,
        match_confidence: confidence,
        signals,
        rental_yield_pct: yieldPct,
        roi_pct: roi,
        liquidity_score: liqScore,
        deal_score: dealS,
        strategy_tag: strategyTag(investor.persona, yieldPct, roi),
        suggested_offer: offer,
        exit_timing_months: exitTimingMonths(investor.horizon, liqScore),
        demand_heat: p.demand_heat_score ?? 0,
      };
    });

    // 7. Sort by confidence and take top N
    scored.sort((a, b) => b.match_confidence - a.match_confidence);
    const matches = scored.slice(0, topN);

    return new Response(
      JSON.stringify({
        matches,
        count: matches.length,
        total_evaluated: properties.length,
        investor_signal: investor,
        weights: W,
        computed_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
