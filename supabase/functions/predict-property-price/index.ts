import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PropertyData {
  id: string;
  title: string;
  price: number;
  city: string | null;
  district: string | null;
  property_type: string | null;
  listing_type: string | null;
  land_area: number | null;
  building_area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  opportunity_score: number | null;
  demand_score: number | null;
  forecast_score: number | null;
  liquidity_score: number | null;
  investment_score: number | null;
}

interface ComparableProperty {
  id: string;
  title: string;
  price: number;
  building_area: number | null;
  land_area: number | null;
  city: string | null;
  price_per_sqm: number;
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
    const { property_id, forecast_months = 12 } = body;

    if (!property_id) {
      return new Response(
        JSON.stringify({ error: "property_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch target property
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("id, title, price, city, district, property_type, listing_type, land_area, building_area, bedrooms, bathrooms, opportunity_score, demand_score, forecast_score, liquidity_score, investment_score")
      .eq("id", property_id)
      .single();

    if (propError || !property) {
      return new Response(
        JSON.stringify({ error: "Property not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prop = property as PropertyData;
    const area = prop.building_area || prop.land_area || 1;
    const pricePsm = prop.price / area;

    // Fetch comparable properties (same city, similar type)
    const { data: comparables } = await supabase
      .from("properties")
      .select("id, title, price, building_area, land_area, city, property_type")
      .eq("city", prop.city)
      .neq("id", property_id)
      .gt("price", 0)
      .limit(50);

    const comps: ComparableProperty[] = (comparables || [])
      .map((c: any) => {
        const cArea = c.building_area || c.land_area || 1;
        return { ...c, price_per_sqm: c.price / cArea };
      })
      .sort((a: ComparableProperty, b: ComparableProperty) =>
        Math.abs(a.price_per_sqm - pricePsm) - Math.abs(b.price_per_sqm - pricePsm)
      )
      .slice(0, 10);

    const compPrices = comps.map(c => c.price_per_sqm);
    const avgPsm = compPrices.length > 0
      ? compPrices.reduce((s, v) => s + v, 0) / compPrices.length
      : pricePsm;

    const medianPsm = compPrices.length > 0
      ? compPrices.sort((a, b) => a - b)[Math.floor(compPrices.length / 2)]
      : pricePsm;

    // Fair Market Value calculation
    const blendedPsm = avgPsm * 0.6 + medianPsm * 0.4;
    const demandMultiplier = 1 + ((prop.demand_score || 50) - 50) * 0.003;
    const investmentMultiplier = 1 + ((prop.investment_score || 50) - 50) * 0.002;
    const estimatedFMV = Math.round(blendedPsm * area * demandMultiplier * investmentMultiplier);

    // Suggested listing price range
    const quickSalePrice = Math.round(estimatedFMV * 0.92);
    const optimalPrice = Math.round(estimatedFMV * 1.0);
    const premiumPrice = Math.round(estimatedFMV * 1.12);

    // Price position
    const deviationPct = ((prop.price - estimatedFMV) / estimatedFMV) * 100;
    const pricePosition = deviationPct < -15 ? "deeply_undervalued"
      : deviationPct < -5 ? "undervalued"
      : deviationPct <= 8 ? "fair"
      : deviationPct <= 20 ? "overpriced"
      : "bubble_risk";

    // Future value projections
    const opportunityMomentum = ((prop.opportunity_score || 50) - 50) * 0.004;
    const demandSignal = ((prop.demand_score || 50) - 50) * 0.003;
    const forecastSignal = ((prop.forecast_score || 50) - 50) * 0.0025;
    const baseGrowthRate = 0.04 + opportunityMomentum + demandSignal + forecastSignal;
    const clampedGrowth = Math.max(-0.08, Math.min(0.15, baseGrowthRate));

    const projections = [];
    for (let m = 3; m <= Math.max(36, forecast_months); m += 3) {
      const factor = Math.pow(1 + clampedGrowth, m / 12);
      projections.push({
        months: m,
        projected_value: Math.round(estimatedFMV * factor),
        appreciation_pct: Math.round((factor - 1) * 10000) / 100,
      });
    }

    // Price elasticity sensitivity (how price changes affect sell speed)
    const liquidityBase = prop.liquidity_score || 50;
    const elasticity = {
      price_minus_10: Math.min(95, Math.round(liquidityBase * 1.35)),
      price_minus_5: Math.min(90, Math.round(liquidityBase * 1.15)),
      current_price: liquidityBase,
      price_plus_5: Math.max(10, Math.round(liquidityBase * 0.82)),
      price_plus_10: Math.max(5, Math.round(liquidityBase * 0.65)),
      sensitivity_rating: liquidityBase > 70 ? "high" : liquidityBase > 40 ? "moderate" : "low",
    };

    // Negotiation flexibility score
    const daysOnMarket = 30; // could be computed from listing date
    const competitionFactor = comps.length / 10;
    const negotiationBase = Math.min(100, Math.max(0,
      50
      + (deviationPct > 10 ? 20 : deviationPct > 0 ? 10 : -5)
      + (liquidityBase < 40 ? 15 : liquidityBase > 70 ? -10 : 0)
      + competitionFactor * 5
    ));
    const negotiationFlexibility = {
      score: Math.round(negotiationBase),
      suggested_discount_pct: deviationPct > 10 ? Math.round(deviationPct * 0.5) : 0,
      buyer_power: negotiationBase > 60 ? "strong" : negotiationBase > 35 ? "moderate" : "weak",
      recommended_offer_range: {
        low: Math.round(estimatedFMV * 0.93),
        high: Math.round(estimatedFMV * 1.02),
      },
    };

    // Confidence calculation
    const compCountFactor = Math.min(1, comps.length / 8);
    const scoreCoverage = [prop.opportunity_score, prop.demand_score, prop.forecast_score]
      .filter(s => s !== null && s !== undefined).length / 3;
    const confidence = Math.round((compCountFactor * 0.5 + scoreCoverage * 0.3 + 0.2) * 100);

    // Trend direction
    const trendDirection = clampedGrowth >= 0.06 ? "strong_growth"
      : clampedGrowth >= 0.03 ? "moderate_growth"
      : clampedGrowth >= -0.01 ? "stable"
      : "decline_risk";

    const result = {
      property_id: prop.id,
      title: prop.title,
      city: prop.city,
      property_type: prop.property_type,
      area_sqm: area,

      // Current valuation
      listed_price: prop.price,
      estimated_fmv: estimatedFMV,
      avg_price_per_sqm: Math.round(blendedPsm),
      deviation_pct: Math.round(deviationPct * 100) / 100,
      price_position: pricePosition,

      // Suggested listing range
      suggested_price_range: {
        quick_sale: quickSalePrice,
        optimal: optimalPrice,
        premium: premiumPrice,
      },

      // Future value projections
      annual_growth_rate_pct: Math.round(clampedGrowth * 10000) / 100,
      trend_direction: trendDirection,
      projections,

      // Elasticity
      price_elasticity: elasticity,

      // Negotiation
      negotiation_flexibility: negotiationFlexibility,

      // Confidence & meta
      confidence_score: confidence,
      comparables_used: comps.length,
      top_comparables: comps.slice(0, 5).map(c => ({
        id: c.id,
        title: c.title,
        price: c.price,
        price_per_sqm: Math.round(c.price_per_sqm),
        city: c.city,
      })),

      demand_multiplier: Math.round(demandMultiplier * 1000) / 1000,
      investment_multiplier: Math.round(investmentMultiplier * 1000) / 1000,
      generated_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ data: result }),
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
