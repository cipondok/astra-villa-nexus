import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Demand Premium Factor ──
// Combines behavioral demand, intent density, and liquidity velocity
function computeDemandPremium(
  viewVelocity: number,    // views per day (0-100+)
  saveRate: number,         // saves / views (0-1)
  inquiryIntensity: number, // inquiries per listing (0-50+)
  intentDensity: number,    // hot intents count (0-20+)
  liquidityScore: number,   // 0-100
): number {
  const viewFactor = Math.min(viewVelocity / 50, 1) * 0.25;
  const saveFactor = Math.min(saveRate / 0.1, 1) * 0.20;
  const inquiryFactor = Math.min(inquiryIntensity / 10, 1) * 0.25;
  const intentFactor = Math.min(intentDensity / 5, 1) * 0.15;
  const liqFactor = Math.min(liquidityScore / 80, 1) * 0.15;

  const raw = viewFactor + saveFactor + inquiryFactor + intentFactor + liqFactor;
  // Premium ranges from -5% to +15%
  return Math.round((raw * 0.20 - 0.05) * 1000) / 1000;
}

// ── Bid Pressure Score ──
function computeBidPressure(
  hotIntents: number,
  avgBudgetAlignment: number, // 0-1 how close avg budget is to listing price
): number {
  return Math.min(Math.round(hotIntents * avgBudgetAlignment * 10), 100);
}

// ── Volatility Classification ──
function classifyVolatility(volatilityIndex: number): string {
  if (volatilityIndex < 3) return "stable_market";
  if (volatilityIndex < 8) return "emerging_demand";
  if (volatilityIndex < 15) return "speculative_zone";
  return "cooling_segment";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
    const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();

    // 1) Get active properties in batches
    const { data: properties } = await sb
      .from("properties")
      .select("id, title, city, property_type, price, created_at")
      .eq("status", "available")
      .limit(200);

    if (!properties?.length) {
      return new Response(JSON.stringify({ message: "No active listings", signals: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const propertyIds = properties.map((p: any) => p.id);
    const cities = [...new Set(properties.map((p: any) => p.city).filter(Boolean))];

    // 2) Fetch behavioral + intent data in parallel
    const [behavioralRes, intentRes, liquidityRes, priceHistoryRes] = await Promise.all([
      sb.from("behavioral_events")
        .select("property_id, event_type")
        .in("property_id", propertyIds.slice(0, 50))
        .gte("created_at", d7),
      sb.from("investor_intent_scores")
        .select("property_id, intent_score, intent_level")
        .in("property_id", propertyIds.slice(0, 50)),
      sb.from("liquidity_metrics_daily")
        .select("city, liquidity_velocity_score")
        .in("city", cities.slice(0, 20))
        .order("created_at", { ascending: false })
        .limit(20),
      sb.from("property_price_signals")
        .select("property_id, listing_price, created_at")
        .in("property_id", propertyIds.slice(0, 50))
        .gte("created_at", d30)
        .order("created_at", { ascending: false }),
    ]);

    const events = behavioralRes.data || [];
    const intents = intentRes.data || [];
    const liquidityMap = new Map<string, number>();
    (liquidityRes.data || []).forEach((l: any) => {
      if (!liquidityMap.has(l.city)) liquidityMap.set(l.city, l.liquidity_velocity_score || 0);
    });

    // Aggregate behavioral per property
    const behaviorAgg = new Map<string, { views: number; saves: number; inquiries: number }>();
    for (const e of events) {
      if (!e.property_id) continue;
      const agg = behaviorAgg.get(e.property_id) || { views: 0, saves: 0, inquiries: 0 };
      if (e.event_type === "view" || e.event_type === "property_view") agg.views++;
      if (e.event_type === "save" || e.event_type === "property_save") agg.saves++;
      if (e.event_type === "inquiry" || e.event_type === "inquiry_submit") agg.inquiries++;
      behaviorAgg.set(e.property_id, agg);
    }

    // Intent map
    const intentMap = new Map<string, { score: number; level: string }>();
    const hotIntentsByProperty = new Map<string, number>();
    for (const i of intents) {
      intentMap.set(i.property_id, { score: i.intent_score, level: i.intent_level });
      if (i.intent_level === "hot") {
        hotIntentsByProperty.set(i.property_id, (hotIntentsByProperty.get(i.property_id) || 0) + 1);
      }
    }

    // Price history for volatility
    const priceHistory = new Map<string, number[]>();
    for (const ph of (priceHistoryRes.data || [])) {
      const arr = priceHistory.get(ph.property_id) || [];
      arr.push(ph.listing_price);
      priceHistory.set(ph.property_id, arr);
    }

    // 3) Compute signals per property
    const signals: any[] = [];
    const bidSignals: any[] = [];

    for (const prop of properties) {
      const behavior = behaviorAgg.get(prop.id) || { views: 0, saves: 0, inquiries: 0 };
      const intent = intentMap.get(prop.id);
      const hotCount = hotIntentsByProperty.get(prop.id) || 0;
      const liqScore = liquidityMap.get(prop.city) || 0;
      const price = prop.price || 0;

      if (price <= 0) continue;

      const viewVelocity = behavior.views / 7; // per day
      const saveRate = behavior.views > 0 ? behavior.saves / behavior.views : 0;
      const inquiryIntensity = behavior.inquiries;

      const demandPremium = computeDemandPremium(
        viewVelocity * 10, saveRate, inquiryIntensity, hotCount, liqScore
      );

      const demandAdjustedPrice = Math.round(price * (1 + demandPremium));
      const liqAdjustment = liqScore > 60 ? 0.02 : liqScore < 30 ? -0.03 : 0;
      const liquidityAdjustedPrice = Math.round(price * (1 + liqAdjustment));

      const bidPressure = computeBidPressure(hotCount, intent ? Math.min(intent.score / 100, 1) : 0);

      // Volatility from price history
      const prices = priceHistory.get(prop.id) || [];
      let volatility = 0;
      if (prices.length > 1) {
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
        volatility = Math.round(Math.sqrt(variance) / mean * 100 * 100) / 100;
      }

      const confidence = Math.min(
        30 + (behavior.views > 0 ? 20 : 0) + (intent ? 20 : 0) + (liqScore > 0 ? 15 : 0) + (prices.length > 1 ? 15 : 0),
        100
      );

      signals.push({
        property_id: prop.id,
        city: prop.city,
        property_type: prop.property_type,
        listing_price: price,
        estimated_market_price: demandAdjustedPrice,
        demand_adjusted_price: demandAdjustedPrice,
        liquidity_adjusted_price: liquidityAdjustedPrice,
        investor_bid_pressure_score: bidPressure,
        price_volatility_index: volatility,
        confidence_score: confidence,
        signal_source: "ai_model",
      });

      if (bidPressure > 0) {
        bidSignals.push({
          property_id: prop.id,
          simulated_bid_price: demandAdjustedPrice,
          investor_segment: hotCount > 3 ? "high_intent" : hotCount > 0 ? "moderate_intent" : "passive",
          bid_confidence: Math.min(bidPressure, 100),
        });
      }
    }

    // 4) Bulk insert price signals (chunks of 50)
    let insertedSignals = 0;
    for (let i = 0; i < signals.length; i += 50) {
      const chunk = signals.slice(i, i + 50);
      const { error } = await sb.from("property_price_signals").insert(chunk);
      if (!error) insertedSignals += chunk.length;
    }

    // Insert bid signals
    if (bidSignals.length > 0) {
      for (let i = 0; i < bidSignals.length; i += 50) {
        await sb.from("property_bid_signals").insert(bidSignals.slice(i, i + 50));
      }
    }

    // 5) Compute capital flow signals per city
    const capitalFlows: any[] = [];
    for (const city of cities) {
      if (!city) continue;
      const cityProps = properties.filter((p: any) => p.city === city);
      const cityEvents = events.filter((e: any) => {
        const prop = properties.find((p: any) => p.id === e.property_id);
        return prop?.city === city;
      });

      const totalInquiries = cityEvents.filter((e: any) =>
        e.event_type === "inquiry" || e.event_type === "inquiry_submit"
      ).length;

      const avgPrice = cityProps.reduce((s: number, p: any) => s + (p.price || 0), 0) / (cityProps.length || 1);

      capitalFlows.push({
        city,
        segment: cityProps[0]?.property_type || "mixed",
        capital_inflow_score: Math.min(totalInquiries * 10 + (liquidityMap.get(city) || 0), 100),
        avg_ticket_size: Math.round(avgPrice),
        investor_growth_rate: 0,
        capital_volume: Math.round(avgPrice * cityProps.length),
      });
    }

    if (capitalFlows.length > 0) {
      await sb.from("capital_flow_signals").insert(capitalFlows);
    }

    return new Response(JSON.stringify({
      signals_computed: insertedSignals,
      bid_signals: bidSignals.length,
      capital_flows: capitalFlows.length,
      volatility_summary: {
        stable: signals.filter(s => classifyVolatility(s.price_volatility_index) === "stable_market").length,
        emerging: signals.filter(s => classifyVolatility(s.price_volatility_index) === "emerging_demand").length,
        speculative: signals.filter(s => classifyVolatility(s.price_volatility_index) === "speculative_zone").length,
        cooling: signals.filter(s => classifyVolatility(s.price_volatility_index) === "cooling_segment").length,
      },
      computed_at: now.toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("compute-pricing-signals error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
