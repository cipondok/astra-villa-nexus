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

// ── Strategy Classification ──

interface CitySignals {
  city: string;
  supply: number;
  demand: number;
  liquidity: number;
  capitalFlow: number;
  pricingMomentum: number;
  investorSentiment: number;
}

function computeStrategyPriority(s: CitySignals): number {
  return Math.round(
    s.supply * 0.15 +
    s.demand * 0.25 +
    s.liquidity * 0.20 +
    s.capitalFlow * 0.15 +
    s.pricingMomentum * 0.15 +
    s.investorSentiment * 0.10
  );
}

function classifyStrategy(s: CitySignals): { strategy: string; confidence: string } {
  // High demand + low supply → acquire
  if (s.demand > 60 && s.supply < 40) {
    return { strategy: "supply_acquisition_campaign", confidence: s.demand > 80 ? "high" : "moderate" };
  }
  // High liquidity + rising pricing → premium push
  if (s.liquidity > 60 && s.pricingMomentum > 50) {
    return { strategy: "premium_listing_promotion", confidence: s.liquidity > 75 ? "high" : "moderate" };
  }
  // Rising capital + strong sentiment → investor targeting
  if (s.capitalFlow > 60 && s.investorSentiment > 55) {
    return { strategy: "investor_targeted_campaign", confidence: s.capitalFlow > 75 ? "high" : "moderate" };
  }
  // Oversupply + weak demand → throttle
  if (s.supply > 70 && s.demand < 35) {
    return { strategy: "inventory_throttling_pricing_optimization", confidence: "high" };
  }
  // Low liquidity → activation needed
  if (s.liquidity < 30) {
    return { strategy: "liquidity_activation_campaign", confidence: "moderate" };
  }
  // Balanced → maintain and monitor
  return { strategy: "maintain_and_monitor", confidence: "low" };
}

// ── Expansion Readiness ──

function computeExpansionReadiness(
  searchVolume: number,
  supplyVelocity: number,
  dealProbability: number,
  capitalInflow: number,
): number {
  return Math.min(Math.round(
    searchVolume * 0.25 +
    supplyVelocity * 0.25 +
    dealProbability * 0.30 +
    capitalInflow * 0.20
  ), 100);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 1) Gather supply signals per city
    const { data: propCounts } = await sb
      .from("properties")
      .select("city")
      .eq("status", "available")
      .limit(500);

    const citySupply = new Map<string, number>();
    (propCounts || []).forEach((p: any) => {
      if (p.city) citySupply.set(p.city, (citySupply.get(p.city) || 0) + 1);
    });

    const cities = [...citySupply.keys()];
    if (cities.length === 0) {
      return new Response(JSON.stringify({ message: "No cities to analyze", signals: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Gather demand, liquidity, capital, pricing signals in parallel
    const [demandRes, liqRes, capRes, priceRes, intentRes] = await Promise.all([
      sb.from("market_demand_signals").select("city, demand_velocity_score, total_views, total_inquiries").in("city", cities.slice(0, 30)),
      sb.from("liquidity_metrics_daily").select("city, liquidity_velocity_score, absorption_rate").in("city", cities.slice(0, 30)).order("created_at", { ascending: false }).limit(30),
      sb.from("capital_flow_signals").select("city, capital_inflow_score").in("city", cities.slice(0, 30)).order("created_at", { ascending: false }).limit(30),
      sb.from("property_price_signals").select("city, investor_bid_pressure_score, price_volatility_index").in("city", cities.slice(0, 30)).order("created_at", { ascending: false }).limit(50),
      sb.from("investor_intent_scores").select("property_id, intent_level").eq("intent_level", "hot").limit(100),
    ]);

    // Build per-city lookup maps
    const demandMap = new Map<string, number>();
    (demandRes.data || []).forEach((d: any) => {
      if (!demandMap.has(d.city)) demandMap.set(d.city, d.demand_velocity_score || 0);
    });

    const liqMap = new Map<string, number>();
    (liqRes.data || []).forEach((l: any) => {
      if (!liqMap.has(l.city)) liqMap.set(l.city, l.liquidity_velocity_score || 0);
    });

    const capMap = new Map<string, number>();
    (capRes.data || []).forEach((c: any) => {
      if (!capMap.has(c.city)) capMap.set(c.city, c.capital_inflow_score || 0);
    });

    const priceMap = new Map<string, { bidPressure: number; volatility: number }>();
    (priceRes.data || []).forEach((p: any) => {
      if (!priceMap.has(p.city)) {
        priceMap.set(p.city, {
          bidPressure: p.investor_bid_pressure_score || 0,
          volatility: p.price_volatility_index || 0,
        });
      }
    });

    // Total listings for normalization
    const maxSupply = Math.max(...citySupply.values(), 1);

    // 3) Generate strategy signals per city
    const strategySignals: any[] = [];
    const inventorySignals: any[] = [];
    const executionLogs: any[] = [];

    for (const city of cities) {
      const supply = citySupply.get(city) || 0;
      const supplyNorm = Math.round((supply / maxSupply) * 100);
      const demand = demandMap.get(city) || 0;
      const liquidity = liqMap.get(city) || 0;
      const capitalFlow = capMap.get(city) || 0;
      const pricing = priceMap.get(city);
      const pricingMomentum = pricing ? pricing.bidPressure : 0;
      const investorSentiment = Math.min(demand * 0.5 + capitalFlow * 0.3 + pricingMomentum * 0.2, 100);

      const signals: CitySignals = {
        city,
        supply: supplyNorm,
        demand,
        liquidity,
        capitalFlow,
        pricingMomentum,
        investorSentiment: Math.round(investorSentiment),
      };

      const priority = computeStrategyPriority(signals);
      const { strategy, confidence } = classifyStrategy(signals);

      strategySignals.push({
        city,
        region: "Indonesia",
        segment: "mixed",
        supply_score: supplyNorm,
        demand_score: demand,
        liquidity_score: liquidity,
        capital_flow_score: capitalFlow,
        pricing_momentum_score: pricingMomentum,
        investor_sentiment_score: Math.round(investorSentiment),
        strategy_priority_index: priority,
        recommended_strategy: strategy,
        confidence_level: confidence,
      });

      // Inventory allocation signals
      const isOversupplied = supplyNorm > 70 && demand < 35;
      inventorySignals.push({
        city,
        segment: "mixed",
        oversupply_flag: isOversupplied,
        boost_multiplier: isOversupplied ? 0.7 : (demand > 60 ? 1.3 : 1.0),
        ranking_adjustment: isOversupplied ? -10 : (demand > 60 ? 15 : 0),
        rebalance_action: isOversupplied ? "reduce_visibility" : (demand > 60 ? "boost_exposure" : "maintain"),
      });

      // Auto-create execution log for high-priority strategies
      if (priority > 65 && strategy !== "maintain_and_monitor") {
        executionLogs.push({
          strategy_type: strategy,
          region: "Indonesia",
          city,
          execution_mode: "advisory",
          action_payload_json: { signals, priority, confidence },
          expected_impact_score: priority,
          status: "pending",
        });
      }
    }

    // 4) Bulk insert all signals
    const results = { strategies: 0, inventory: 0, executions: 0 };

    for (let i = 0; i < strategySignals.length; i += 50) {
      const { error } = await sb.from("marketplace_strategy_signals").insert(strategySignals.slice(i, i + 50));
      if (!error) results.strategies += Math.min(50, strategySignals.length - i);
    }

    for (let i = 0; i < inventorySignals.length; i += 50) {
      const { error } = await sb.from("inventory_allocation_signals").insert(inventorySignals.slice(i, i + 50));
      if (!error) results.inventory += Math.min(50, inventorySignals.length - i);
    }

    if (executionLogs.length > 0) {
      const { error } = await sb.from("strategy_execution_log").insert(executionLogs);
      if (!error) results.executions = executionLogs.length;
    }

    // 5) Build summary
    const topOpportunity = strategySignals.sort((a: any, b: any) => b.strategy_priority_index - a.strategy_priority_index)[0];

    return new Response(JSON.stringify({
      ...results,
      top_opportunity: topOpportunity ? {
        city: topOpportunity.city,
        strategy: topOpportunity.recommended_strategy,
        priority: topOpportunity.strategy_priority_index,
        confidence: topOpportunity.confidence_level,
      } : null,
      oversupplied_cities: inventorySignals.filter((s: any) => s.oversupply_flag).map((s: any) => s.city),
      computed_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("detect-growth-opportunities error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
