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

// ── Capital Efficiency Formula ──
// Weights: liquidity 30%, demand 25%, ROI 25%, risk -20% (inverted)
function computeCapitalEfficiency(
  liquidity: number,
  demand: number,
  roi: number,
  riskVolatility: number,
): number {
  const riskInverted = Math.max(100 - riskVolatility, 0);
  return Math.round(
    liquidity * 0.30 +
    demand * 0.25 +
    roi * 0.25 +
    riskInverted * 0.20
  );
}

// ── Allocation Priority ──
// Efficiency 40%, intent density 25%, price momentum 20%, capital flow 15%
function computeAllocationPriority(
  efficiency: number,
  intentDensity: number,
  priceMomentum: number,
  capitalFlow: number,
): number {
  return Math.round(
    efficiency * 0.40 +
    intentDensity * 0.25 +
    priceMomentum * 0.20 +
    capitalFlow * 0.15
  );
}

function classifyDirection(efficiency: number, demand: number, riskVol: number): string {
  if (efficiency > 65 && demand > 50) return "increase";
  if (riskVol > 60 || (efficiency < 35 && demand < 30)) return "reduce";
  return "hold";
}

function classifyConfidence(efficiency: number, intentDensity: number): string {
  const avg = (efficiency + intentDensity) / 2;
  if (avg > 70) return "high";
  if (avg > 40) return "moderate";
  return "low";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Gather all intelligence sources in parallel
    const [liqRes, demandRes, priceRes, intentRes, capFlowRes, propRes] = await Promise.all([
      sb.from("liquidity_metrics_daily").select("city, liquidity_velocity_score, demand_pressure_index").order("created_at", { ascending: false }).limit(30),
      sb.from("market_demand_signals").select("city, demand_velocity_score, total_views, total_inquiries").order("created_at", { ascending: false }).limit(30),
      sb.from("property_price_signals").select("city, investor_bid_pressure_score, price_volatility_index").order("created_at", { ascending: false }).limit(50),
      sb.from("investor_intent_scores").select("property_id, intent_score, intent_level").limit(200),
      sb.from("capital_flow_signals").select("city, capital_inflow_score").order("created_at", { ascending: false }).limit(20),
      sb.from("properties").select("id, city, property_type, price").eq("status", "available").limit(500),
    ]);

    // Build city-level maps
    const cities = new Set<string>();
    const liqMap = new Map<string, { velocity: number; pressure: number }>();
    for (const l of (liqRes.data || [])) {
      if (l.city && !liqMap.has(l.city)) {
        liqMap.set(l.city, { velocity: l.liquidity_velocity_score || 0, pressure: l.demand_pressure_index || 0 });
        cities.add(l.city);
      }
    }

    const demandMap = new Map<string, number>();
    for (const d of (demandRes.data || [])) {
      if (d.city && !demandMap.has(d.city)) {
        demandMap.set(d.city, d.demand_velocity_score || 0);
        cities.add(d.city);
      }
    }

    const priceMap = new Map<string, { bid: number; vol: number }>();
    for (const p of (priceRes.data || [])) {
      if (p.city && !priceMap.has(p.city)) {
        priceMap.set(p.city, { bid: p.investor_bid_pressure_score || 0, vol: p.price_volatility_index || 0 });
        cities.add(p.city);
      }
    }

    const capFlowMap = new Map<string, number>();
    for (const c of (capFlowRes.data || [])) {
      if (c.city && !capFlowMap.has(c.city)) capFlowMap.set(c.city, c.capital_inflow_score || 0);
    }

    // Intent density per city (via properties)
    const propCityMap = new Map<string, string[]>();
    for (const p of (propRes.data || [])) {
      if (p.city) {
        const arr = propCityMap.get(p.city) || [];
        arr.push(p.id);
        propCityMap.set(p.city, arr);
        cities.add(p.city);
      }
    }

    const intentByProp = new Map<string, number>();
    for (const i of (intentRes.data || [])) {
      intentByProp.set(i.property_id, Math.max(intentByProp.get(i.property_id) || 0, i.intent_score || 0));
    }

    // Compute per-city allocation signals
    const allocSignals: any[] = [];

    for (const city of cities) {
      const liq = liqMap.get(city) || { velocity: 0, pressure: 0 };
      const demand = demandMap.get(city) || 0;
      const price = priceMap.get(city) || { bid: 0, vol: 0 };
      const capFlow = capFlowMap.get(city) || 0;

      // Intent density = avg intent of city properties
      const cityProps = propCityMap.get(city) || [];
      let intentSum = 0;
      let intentCount = 0;
      for (const pid of cityProps) {
        if (intentByProp.has(pid)) { intentSum += intentByProp.get(pid)!; intentCount++; }
      }
      const intentDensity = intentCount > 0 ? Math.min(Math.round(intentSum / intentCount), 100) : 0;

      // ROI estimate from demand + liquidity composite
      const historicalRoi = Math.round((liq.velocity * 0.4 + demand * 0.3 + price.bid * 0.3) * 0.8);

      const efficiency = computeCapitalEfficiency(liq.velocity, demand, historicalRoi, price.vol);
      const priority = computeAllocationPriority(efficiency, intentDensity, price.bid, capFlow);
      const direction = classifyDirection(efficiency, demand, price.vol);
      const confidence = classifyConfidence(efficiency, intentDensity);

      allocSignals.push({
        city,
        region: "Indonesia",
        segment: "mixed",
        liquidity_velocity_score: liq.velocity,
        demand_pressure_index: liq.pressure || demand,
        price_momentum_score: price.bid,
        investor_intent_density: intentDensity,
        historical_roi_estimate: historicalRoi,
        risk_volatility_score: price.vol,
        capital_efficiency_score: efficiency,
        allocation_priority_score: priority,
        recommended_capital_direction: direction,
        confidence_level: confidence,
      });
    }

    // Bulk insert
    let inserted = 0;
    for (let i = 0; i < allocSignals.length; i += 50) {
      const { error } = await sb.from("capital_allocation_signals").insert(allocSignals.slice(i, i + 50));
      if (!error) inserted += Math.min(50, allocSignals.length - i);
    }

    // Generate investor portfolio signals for active investors with intent data
    const investorIntents = new Map<string, { scores: number[]; properties: string[] }>();
    // We'd need user-property mapping; for now generate from intent scores
    // This will be enhanced when behavioral_events user_id linkage matures

    const sorted = [...allocSignals].sort((a, b) => b.allocation_priority_score - a.allocation_priority_score);
    const topCity = sorted[0];

    return new Response(JSON.stringify({
      signals_computed: inserted,
      top_allocation: topCity ? {
        city: topCity.city,
        efficiency: topCity.capital_efficiency_score,
        priority: topCity.allocation_priority_score,
        direction: topCity.recommended_capital_direction,
        confidence: topCity.confidence_level,
      } : null,
      increase_zones: sorted.filter(s => s.recommended_capital_direction === "increase").map(s => s.city),
      reduce_zones: sorted.filter(s => s.recommended_capital_direction === "reduce").map(s => s.city),
      computed_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("compute-capital-allocation error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
