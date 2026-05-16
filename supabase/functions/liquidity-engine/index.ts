import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CITIES = ["Jakarta", "Bali", "Surabaya", "Bandung", "Yogyakarta", "Medan", "Makassar", "Semarang"];
const PROPERTY_TYPES = ["villa", "apartment", "house", "land", "commercial"];

const CITY_PROFILES: Record<string, { tourism: number; demand: number; volatility: number; foreignPct: number }> = {
  Jakarta: { tourism: 0.3, demand: 0.9, volatility: 0.4, foreignPct: 0.15 },
  Bali: { tourism: 0.95, demand: 0.85, volatility: 0.6, foreignPct: 0.45 },
  Surabaya: { tourism: 0.2, demand: 0.7, volatility: 0.3, foreignPct: 0.08 },
  Bandung: { tourism: 0.5, demand: 0.65, volatility: 0.35, foreignPct: 0.1 },
  Yogyakarta: { tourism: 0.7, demand: 0.55, volatility: 0.4, foreignPct: 0.12 },
  Medan: { tourism: 0.25, demand: 0.5, volatility: 0.35, foreignPct: 0.06 },
  Makassar: { tourism: 0.3, demand: 0.45, volatility: 0.3, foreignPct: 0.05 },
  Semarang: { tourism: 0.2, demand: 0.5, volatility: 0.3, foreignPct: 0.04 },
};

const TYPE_PROFILES: Record<string, { domBase: number; rentalYield: number; flipViability: number }> = {
  villa: { domBase: 120, rentalYield: 0.08, flipViability: 0.6 },
  apartment: { domBase: 75, rentalYield: 0.06, flipViability: 0.7 },
  house: { domBase: 90, rentalYield: 0.05, flipViability: 0.5 },
  land: { domBase: 180, rentalYield: 0, flipViability: 0.8 },
  commercial: { domBase: 150, rentalYield: 0.09, flipViability: 0.4 },
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// Pipeline 1: Absorption Velocity
async function absorptionVelocity() {
  const rows = [];
  for (const city of CITIES) {
    const cp = CITY_PROFILES[city];
    for (const pt of PROPERTY_TYPES) {
      const tp = TYPE_PROFILES[pt];
      const demandFactor = cp.demand * (1 + cp.tourism * 0.3);
      const avgDom = Math.round(tp.domBase * (1 - demandFactor * 0.4) + rand(-10, 10));
      const liquiditySpeedIndex = Math.min(100, Math.round((1 - avgDom / 250) * 100));
      const viewToInquiry = +(rand(0.02, 0.15) * demandFactor).toFixed(3);
      const exitDifficulty = +(1 - liquiditySpeedIndex / 100).toFixed(3);
      const seasonal = {
        Q1: +(rand(0.7, 1.1)).toFixed(2),
        Q2: +(rand(0.9, 1.3)).toFixed(2),
        Q3: +(rand(0.6, 1.0)).toFixed(2),
        Q4: +(rand(0.8, 1.2)).toFixed(2),
      };
      const phases = ["expansion", "peak", "contraction", "trough", "neutral"];
      const demandCyclePhase = phases[Math.floor(demandFactor * 4) % 5];
      const transactionVelocity = +(demandFactor * rand(0.5, 1.5)).toFixed(2);
      const absorptionRating = liquiditySpeedIndex >= 70 ? "high" : liquiditySpeedIndex >= 40 ? "moderate" : "low";

      rows.push({
        city, property_type: pt, avg_dom: avgDom, liquidity_speed_index: liquiditySpeedIndex,
        absorption_rating: absorptionRating, exit_difficulty: exitDifficulty,
        view_to_inquiry_ratio: viewToInquiry, seasonal_factor: seasonal,
        transaction_velocity: transactionVelocity, demand_cycle_phase: demandCyclePhase,
      });
    }
  }
  const { error } = await supabase.from("liquidity_absorption").upsert(rows, { onConflict: "city,property_type" });
  if (error) throw error;
  return { count: rows.length };
}

// Pipeline 2: Demand Elasticity
async function demandElasticity() {
  const rows = [];
  for (const city of CITIES) {
    const cp = CITY_PROFILES[city];
    for (const pt of PROPERTY_TYPES) {
      const elasticity = +(rand(-2.5, -0.3) * (1 + cp.volatility)).toFixed(3);
      const priceReductionRisk = +(cp.volatility * rand(0.3, 0.9)).toFixed(3);
      const supplyPressure = +(rand(0.2, 0.8) * (1 - cp.demand * 0.3)).toFixed(3);
      const competitionIntensity = +(cp.demand * rand(0.4, 1.0)).toFixed(3);
      const mortgageImpact = +(rand(0.1, 0.6)).toFixed(3);
      const foreignParticipation = +(cp.foreignPct * rand(0.5, 1.5)).toFixed(3);
      const strategies = ["aggressive_discount", "market_rate", "premium_hold", "staged_reduction"];
      const strategyIdx = priceReductionRisk > 0.5 ? 0 : priceReductionRisk > 0.3 ? 3 : competitionIntensity > 0.6 ? 1 : 2;
      rows.push({
        city, property_type: pt, elasticity_coefficient: elasticity,
        price_reduction_risk: priceReductionRisk, supply_pressure: supplyPressure,
        competition_intensity: competitionIntensity, mortgage_affordability_impact: mortgageImpact,
        foreign_investor_participation: foreignParticipation, optimal_pricing_strategy: strategies[strategyIdx],
      });
    }
  }
  const { error } = await supabase.from("liquidity_demand_elasticity").upsert(rows, { onConflict: "city,property_type" });
  if (error) throw error;
  return { count: rows.length };
}

// Pipeline 3: Rental Stability
async function rentalStability() {
  const rows = [];
  for (const city of CITIES) {
    const cp = CITY_PROFILES[city];
    for (const pt of PROPERTY_TYPES) {
      const tp = TYPE_PROFILES[pt];
      if (pt === "land") {
        rows.push({
          city, property_type: pt, occupancy_stability: 0, cashflow_reliability_index: 0,
          vacancy_risk: 1, tenant_turnover_prob: 0, short_term_viability: 0,
          long_term_viability: 0, rental_income_continuity: 0,
        });
        continue;
      }
      const occupancy = +(rand(0.5, 0.95) * cp.demand).toFixed(3);
      const cashflow = +(occupancy * (1 - cp.volatility * 0.3) * 100).toFixed(1);
      const vacancy = +(1 - occupancy).toFixed(3);
      const turnover = +(rand(0.1, 0.5) * (1 - cp.demand * 0.3)).toFixed(3);
      const stv = +(cp.tourism * rand(0.5, 1.0) * 100).toFixed(1);
      const ltv = +((1 - cp.tourism * 0.3) * cp.demand * 100).toFixed(1);
      const continuity = +(cashflow * (1 - turnover * 0.5)).toFixed(1);
      rows.push({
        city, property_type: pt, occupancy_stability: occupancy,
        cashflow_reliability_index: cashflow, vacancy_risk: vacancy,
        tenant_turnover_prob: turnover, short_term_viability: stv,
        long_term_viability: ltv, rental_income_continuity: continuity,
      });
    }
  }
  const { error } = await supabase.from("liquidity_rental_stability").upsert(rows, { onConflict: "city,property_type" });
  if (error) throw error;
  return { count: rows.length };
}

// Pipeline 4: Crisis Resilience
async function crisisResilience() {
  const scenarios = ["recession", "rate_spike", "policy_tightening", "natural_disaster", "tourism_collapse"];
  const rows = [];
  for (const city of CITIES) {
    const cp = CITY_PROFILES[city];
    for (const pt of PROPERTY_TYPES) {
      for (const scenario of scenarios) {
        let vulnerabilityWeight = 0.5;
        if (scenario === "tourism_collapse") vulnerabilityWeight = cp.tourism;
        else if (scenario === "recession") vulnerabilityWeight = 1 - cp.demand * 0.5;
        else if (scenario === "rate_spike") vulnerabilityWeight = rand(0.3, 0.7);
        else if (scenario === "policy_tightening") vulnerabilityWeight = cp.foreignPct * 2;
        else if (scenario === "natural_disaster") vulnerabilityWeight = rand(0.2, 0.6);

        const stressScore = +(100 * (1 - vulnerabilityWeight * rand(0.5, 1.0))).toFixed(1);
        const forcedSaleRisk = +(vulnerabilityWeight * rand(0.3, 0.9)).toFixed(3);
        const protectionRank = Math.round(stressScore / 10);
        const recoveryMonths = Math.round(12 + vulnerabilityWeight * rand(6, 36));
        const priceDrop = +(vulnerabilityWeight * rand(5, 35)).toFixed(1);

        rows.push({
          city, property_type: pt, scenario, stress_liquidity_score: stressScore,
          forced_sale_risk: forcedSaleRisk, capital_protection_rank: protectionRank,
          recovery_time_months: recoveryMonths, price_drop_estimate: priceDrop,
        });
      }
    }
  }
  // Chunk upserts
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { error } = await supabase.from("liquidity_crisis_resilience").upsert(chunk, { onConflict: "city,property_type,scenario" });
    if (error) throw error;
  }
  return { count: rows.length };
}

// Pipeline 5: Exit Timing
async function exitTiming() {
  const rows = [];
  for (const city of CITIES) {
    const cp = CITY_PROFILES[city];
    for (const pt of PROPERTY_TYPES) {
      const tp = TYPE_PROFILES[pt];
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      const bestQ = quarters[Math.floor(cp.demand * 3.9) % 4];
      const peakMonth = Math.round(rand(3, 10));
      const optimalHold = pt === "land" ? Math.round(rand(48, 84)) : Math.round(rand(24, 60));
      const flipProfit = +(tp.flipViability * cp.demand * rand(5, 20)).toFixed(1);
      const holdProfit = +(cp.demand * rand(15, 45) * (1 + tp.rentalYield)).toFixed(1);
      const exitDiff = 1 - cp.demand * 0.6;
      const liqAdjROI = +(holdProfit * (1 - exitDiff * 0.3)).toFixed(1);

      const exitScenarios = [
        { strategy: "flip_12mo", roi: flipProfit, risk: +(exitDiff * rand(0.5, 1.0)).toFixed(2) },
        { strategy: "hold_3yr", roi: +(holdProfit * 0.6).toFixed(1), risk: +(exitDiff * rand(0.3, 0.7)).toFixed(2) },
        { strategy: "hold_5yr", roi: holdProfit, risk: +(exitDiff * rand(0.2, 0.5)).toFixed(2) },
      ];

      rows.push({
        city, property_type: pt, best_sell_window: bestQ,
        peak_liquidity_month: peakMonth, optimal_hold_months: optimalHold,
        flip_profitability: flipProfit, hold_profitability: holdProfit,
        liquidity_adjusted_roi: liqAdjROI, exit_scenarios: exitScenarios,
      });
    }
  }
  const { error } = await supabase.from("liquidity_exit_timing").upsert(rows, { onConflict: "city,property_type" });
  if (error) throw error;
  return { count: rows.length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pipeline = "full_forecast" } = await req.json().catch(() => ({}));
    const results: Record<string, unknown> = {};

    const pipelines: Record<string, () => Promise<unknown>> = {
      absorption_velocity: absorptionVelocity,
      demand_elasticity: demandElasticity,
      rental_stability: rentalStability,
      crisis_resilience: crisisResilience,
      exit_timing: exitTiming,
    };

    if (pipeline === "full_forecast") {
      for (const [name, fn] of Object.entries(pipelines)) {
        results[name] = await fn();
      }
    } else if (pipelines[pipeline]) {
      results[pipeline] = await pipelines[pipeline]();
    } else {
      return new Response(JSON.stringify({ error: `Unknown pipeline: ${pipeline}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, pipeline, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
