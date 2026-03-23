import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Helpers ──

async function safeCount(table: string, filters?: (q: any) => any) {
  try {
    let q = sb.from(table).select("id", { count: "exact", head: true });
    if (filters) q = filters(q);
    const { count } = await q;
    return count || 0;
  } catch { return 0; }
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(v * 10) / 10));
}

// ── Market Cycle Detection (Task Group D) ──

function detectMarketCyclePhase(
  pricingMomentum: number,
  liquidityChange: number,
  inventoryAccumulation: number,
  sentimentOscillation: number,
): { phase: string; confidence: number } {
  const composite =
    pricingMomentum * 0.30 +
    liquidityChange * 0.25 +
    (100 - inventoryAccumulation) * 0.25 +
    sentimentOscillation * 0.20;

  if (composite >= 70) return { phase: "expansion", confidence: clamp(composite) };
  if (composite >= 50) return { phase: "peak", confidence: clamp(composite) };
  if (composite >= 30) return { phase: "cooling", confidence: clamp(100 - composite) };
  return { phase: "recovery", confidence: clamp(100 - composite) };
}

// ── Urban Growth Score (Task Group B) ──

function computeUrbanGrowthScore(
  newListings30d: number,
  totalListings: number,
  dealVelocity: number,
  intentDensity: number,
): number {
  const listingGrowthRate = totalListings > 0 ? (newListings30d / totalListings) * 100 : 0;
  const score =
    Math.min(listingGrowthRate * 3, 30) +
    Math.min(dealVelocity * 2, 30) +
    Math.min(intentDensity * 0.5, 25) +
    (newListings30d > 10 ? 15 : newListings30d > 5 ? 10 : 5);
  return clamp(score);
}

// ── Global Liquidity Balance (Task Group E) ──

function computeGlobalLiquidityBalance(
  absorptionRate: number,
  capitalConcentration: number,
  inventoryRisk: number,
  affordabilityStress: number,
): { balance: number; status: string } {
  const balance = clamp(
    absorptionRate * 0.30 +
    (100 - capitalConcentration) * 0.25 +
    (100 - inventoryRisk) * 0.25 +
    (100 - affordabilityStress) * 0.20
  );
  let status = "balanced";
  if (balance > 75) status = "overheating";
  else if (balance > 60) status = "healthy";
  else if (balance < 30) status = "stagnating";
  else if (balance < 45) status = "cooling";
  return { balance, status };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const d30 = new Date(Date.now() - 30 * 86400000).toISOString();

    // Gather city-level signals from existing tables
    const [
      listingsRes,
      liqRes,
      priceRes,
      capRes,
      allocRes,
      intentRes,
    ] = await Promise.all([
      sb.from("properties").select("city, status, created_at").eq("status", "available").limit(2000),
      sb.from("liquidity_metrics_daily").select("city, liquidity_velocity_score, absorption_rate, demand_pressure_index, market_classification").order("created_at", { ascending: false }).limit(100),
      sb.from("property_price_signals").select("city, investor_bid_pressure_score, price_volatility_index, demand_adjusted_price, listing_price").order("created_at", { ascending: false }).limit(100),
      sb.from("capital_flow_signals").select("city, capital_inflow_score, avg_ticket_size, capital_volume").order("created_at", { ascending: false }).limit(50),
      sb.from("capital_allocation_signals").select("city, segment, capital_efficiency_score, allocation_priority_score, recommended_capital_direction").order("created_at", { ascending: false }).limit(50),
      sb.from("investor_intent_scores").select("property_id, intent_score, intent_level").order("intent_score", { ascending: false }).limit(200),
    ]);

    // Aggregate by city
    const cities = new Map<string, any>();

    const ensureCity = (city: string) => {
      if (!cities.has(city)) {
        cities.set(city, {
          city,
          region: "Southeast Asia",
          country: "Indonesia",
          totalListings: 0,
          newListings30d: 0,
          liquidityVelocity: 0,
          absorptionRate: 0,
          demandPressure: 0,
          bidPressure: 0,
          priceVolatility: 0,
          capitalInflow: 0,
          intentDensity: 0,
          efficiency: 0,
        });
      }
      return cities.get(city)!;
    };

    // Count listings per city
    for (const p of listingsRes.data || []) {
      if (!p.city) continue;
      const c = ensureCity(p.city);
      c.totalListings++;
      if (p.created_at >= d30) c.newListings30d++;
    }

    // Liquidity
    for (const l of liqRes.data || []) {
      if (!l.city) continue;
      const c = ensureCity(l.city);
      c.liquidityVelocity = Math.max(c.liquidityVelocity, l.liquidity_velocity_score || 0);
      c.absorptionRate = Math.max(c.absorptionRate, (l.absorption_rate || 0) * 100);
      c.demandPressure = Math.max(c.demandPressure, l.demand_pressure_index || 0);
    }

    // Pricing
    for (const p of priceRes.data || []) {
      if (!p.city) continue;
      const c = ensureCity(p.city);
      c.bidPressure = Math.max(c.bidPressure, p.investor_bid_pressure_score || 0);
      c.priceVolatility = Math.max(c.priceVolatility, p.price_volatility_index || 0);
    }

    // Capital
    for (const cap of capRes.data || []) {
      if (!cap.city) continue;
      const c = ensureCity(cap.city);
      c.capitalInflow = Math.max(c.capitalInflow, cap.capital_inflow_score || 0);
    }

    // Allocation
    for (const a of allocRes.data || []) {
      if (!a.city) continue;
      const c = ensureCity(a.city);
      c.efficiency = Math.max(c.efficiency, a.capital_efficiency_score || 0);
    }

    // Compute and upsert signals for each city
    const signals: any[] = [];
    const flowEdges: any[] = [];

    for (const [cityName, d] of cities) {
      const urbanGrowth = computeUrbanGrowthScore(d.newListings30d, d.totalListings, d.liquidityVelocity / 10, d.demandPressure);
      const cycle = detectMarketCyclePhase(d.bidPressure, d.liquidityVelocity - 50, 100 - d.absorptionRate, d.demandPressure);
      const infraScore = clamp(d.newListings30d * 3 + d.capitalInflow * 0.3);
      const mobilityIndex = clamp(d.demandPressure * 0.6 + d.capitalInflow * 0.4);
      const supplyPressure = clamp(d.totalListings > 20 ? 60 + d.totalListings * 0.2 : d.totalListings * 3);
      const affordability = clamp(d.priceVolatility * 2 + (100 - d.absorptionRate) * 0.3);
      const rentalYield = clamp(d.liquidityVelocity * 0.4 + d.efficiency * 0.3 + d.absorptionRate * 0.3);

      const signal = {
        country: d.country,
        region: d.region,
        city: cityName,
        urban_growth_score: urbanGrowth,
        infrastructure_development_score: infraScore,
        population_mobility_index: mobilityIndex,
        capital_inflow_intensity: d.capitalInflow,
        housing_supply_pressure: supplyPressure,
        affordability_stress_index: affordability,
        rental_yield_trend: rentalYield,
        liquidity_velocity_score: d.liquidityVelocity,
        market_cycle_phase: cycle.phase,
        confidence_level: cycle.confidence,
        signal_timestamp: new Date().toISOString(),
      };
      signals.push(signal);
    }

    // Batch insert signals (chunks of 30)
    let inserted = 0;
    for (let i = 0; i < signals.length; i += 30) {
      const chunk = signals.slice(i, i + 30);
      const { error } = await sb.from("global_property_signals").insert(chunk);
      if (!error) inserted += chunk.length;
    }

    // Capital flow network edges (city pairs)
    const cityArr = Array.from(cities.keys());
    for (let i = 0; i < Math.min(cityArr.length, 10); i++) {
      for (let j = i + 1; j < Math.min(cityArr.length, 10); j++) {
        const a = cities.get(cityArr[i])!;
        const b = cities.get(cityArr[j])!;
        const movementProb = clamp(Math.abs(a.capitalInflow - b.capitalInflow) * 0.8 + Math.abs(a.demandPressure - b.demandPressure) * 0.2);
        if (movementProb > 15) {
          flowEdges.push({
            source_city: a.capitalInflow > b.capitalInflow ? cityArr[j] : cityArr[i],
            target_city: a.capitalInflow > b.capitalInflow ? cityArr[i] : cityArr[j],
            capital_movement_probability: movementProb,
            investment_migration_score: clamp((a.efficiency + b.efficiency) / 2),
            portfolio_diversification_flow: clamp(Math.abs(a.liquidityVelocity - b.liquidityVelocity)),
          });
        }
      }
    }

    if (flowEdges.length > 0) {
      await sb.from("capital_flow_network").insert(flowEdges);
    }

    // Compute global liquidity balance per region
    const regionMap = new Map<string, { absorption: number[]; concentration: number[]; inventory: number[]; afford: number[] }>();
    for (const s of signals) {
      if (!regionMap.has(s.region)) regionMap.set(s.region, { absorption: [], concentration: [], inventory: [], afford: [] });
      const r = regionMap.get(s.region)!;
      r.absorption.push(s.liquidity_velocity_score);
      r.concentration.push(s.capital_inflow_intensity);
      r.inventory.push(s.housing_supply_pressure);
      r.afford.push(s.affordability_stress_index);
    }

    const balanceRecords: any[] = [];
    for (const [region, data] of regionMap) {
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 50;
      const { balance, status } = computeGlobalLiquidityBalance(
        avg(data.absorption), avg(data.concentration), avg(data.inventory), avg(data.afford)
      );
      balanceRecords.push({
        region,
        balance_index: balance,
        cross_country_absorption: clamp(avg(data.absorption)),
        capital_concentration_risk: clamp(avg(data.concentration)),
        inventory_risk_score: clamp(avg(data.inventory)),
        affordability_stress: clamp(avg(data.afford)),
        systemic_status: status,
      });
    }

    if (balanceRecords.length > 0) {
      await sb.from("global_liquidity_balance").insert(balanceRecords);
    }

    return json({
      success: true,
      cities_processed: inserted,
      flow_edges_created: flowEdges.length,
      balance_regions: balanceRecords.length,
      summary: {
        fastest_growing: signals.sort((a, b) => b.urban_growth_score - a.urban_growth_score)[0]?.city || "N/A",
        highest_capital: signals.sort((a, b) => b.capital_inflow_intensity - a.capital_inflow_intensity)[0]?.city || "N/A",
        cycle_distribution: signals.reduce((acc: any, s) => { acc[s.market_cycle_phase] = (acc[s.market_cycle_phase] || 0) + 1; return acc; }, {}),
      },
    });
  } catch (err) {
    console.error("compute-planetary-signals error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
