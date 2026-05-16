import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params } = await req.json();
    let result: Record<string, unknown>;

    switch (mode) {
      case "simulate_urban_growth": result = await simulateUrbanGrowth(sb, params); break;
      case "forecast_value_trajectory": result = await forecastValueTrajectory(sb, params); break;
      case "compute_capital_attraction": result = await computeCapitalAttraction(sb, params); break;
      case "run_crisis_simulation": result = await runCrisisSimulation(sb, params); break;
      case "generate_expansion_recs": result = await generateExpansionRecs(sb, params); break;
      case "dashboard": result = await buildDashboard(sb, params); break;
      default: throw new Error(`Unknown mode: ${mode}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── 1️⃣ URBAN GROWTH PHYSICS ENGINE ──────────────────────────
async function simulateUrbanGrowth(sb: any, p: any) {
  const { city, country, district, horizon_years, population, infrastructure_usd, employment_clusters } = p;

  const horizon = horizon_years || 10;
  const pop = population || 1000000;
  const infraUsd = infrastructure_usd || 0;

  // Infrastructure multiplier: every $1B infrastructure → 1.02x population growth
  const infraMultiplier = 1 + Math.min((infraUsd / 1_000_000_000) * 0.02, 0.15);

  // Base population CAGR from employment cluster density
  const empClusters = employment_clusters || 0;
  const baseCagr = 1.2 + (empClusters * 0.15); // 1.2% base + 0.15% per cluster

  const popCagr = baseCagr * infraMultiplier;
  const popForecast = Math.round(pop * Math.pow(1 + popCagr / 100, horizon));

  // Commercial density evolution
  const currentDensity = p.commercial_density || 2.5;
  const densityGrowth = popCagr * 0.6; // commercial follows 60% of pop growth
  const densityForecast = currentDensity * Math.pow(1 + densityGrowth / 100, horizon);

  // Urbanization velocity (0-100)
  const urbanVelocity = Math.min(100,
    (popCagr * 10) + (infraMultiplier * 20) + (empClusters * 5)
  );

  // Growth phase classification
  let phase = "emerging";
  if (popCagr > 4) phase = "accelerating";
  else if (popCagr > 2.5) phase = "emerging";
  else if (popCagr > 1.5) phase = "mature";
  else if (popCagr > 0.5) phase = "saturated";
  else phase = popCagr > 0 ? "nascent" : "declining";

  const confidence = Math.min(95, 50 + (empClusters * 3) + (infraUsd > 0 ? 15 : 0) + (pop > 500000 ? 10 : 0));

  const { data, error } = await sb.from("gues_urban_growth").insert({
    city, country: country || "ID", district,
    simulation_horizon_years: horizon,
    population_current: pop,
    population_forecast: popForecast,
    population_cagr_pct: Math.round(popCagr * 1000) / 1000,
    infrastructure_investment_usd: infraUsd,
    infrastructure_multiplier: Math.round(infraMultiplier * 1000) / 1000,
    employment_cluster_count: empClusters,
    commercial_density_sqm_per_capita: currentDensity,
    commercial_density_forecast: Math.round(densityForecast * 100) / 100,
    urbanization_velocity: Math.round(urbanVelocity * 100) / 100,
    growth_phase: phase,
    confidence_score: confidence,
    simulation_data: {
      base_cagr: baseCagr,
      infra_effect: infraMultiplier,
      density_growth_pct: densityGrowth,
    },
  }).select().single();

  if (error) throw error;
  return { simulation: data, phase, pop_forecast: popForecast, cagr: popCagr };
}

// ─── 2️⃣ PROPERTY VALUE TRAJECTORY PREDICTOR ──────────────────
async function forecastValueTrajectory(sb: any, p: any) {
  const { city, country, district, property_type, current_median_price, rental_yield, price_to_income } = p;

  const price = current_median_price || 100000;
  const rYield = rental_yield || 5.0;
  const pti = price_to_income || 10;

  // Get urban growth data for city if available
  const { data: growth } = await sb.from("gues_urban_growth")
    .select("population_cagr_pct, growth_phase, urbanization_velocity")
    .eq("city", city).order("computed_at", { ascending: false }).limit(1).single();

  const popCagr = growth?.population_cagr_pct || 1.5;

  // Appreciation model: base = pop_growth * 1.5 + yield_compression + gentrification_premium
  const baseAppreciation = popCagr * 1.5;
  const yieldCompression = rYield > 6 ? 1.5 : rYield > 4 ? 0.5 : -0.5;
  const affordabilityAdj = pti > 20 ? -1.5 : pti > 15 ? -0.5 : pti < 8 ? 1.0 : 0;

  const cagr5 = Math.max(-2, baseAppreciation + yieldCompression + affordabilityAdj);
  const cagr10 = cagr5 * 0.85; // mean reversion
  const cagr20 = cagr5 * 0.7;

  const price5 = Math.round(price * Math.pow(1 + cagr5 / 100, 5));
  const price10 = Math.round(price * Math.pow(1 + cagr10 / 100, 10));
  const price20 = Math.round(price * Math.pow(1 + cagr20 / 100, 20));

  // Gentrification detection
  let genStage = "pre";
  let genProb = 20;
  if (popCagr > 3 && pti < 12) { genStage = "early"; genProb = 65; }
  else if (popCagr > 2 && rYield > 5) { genStage = "mid"; genProb = 50; }
  else if (pti > 15 && rYield < 4) { genStage = "advanced"; genProb = 75; }
  else if (pti > 25) { genStage = "post"; genProb = 30; }

  // Luxury demand index (0-100)
  const luxuryDemand = Math.min(100, (pti > 12 ? 30 : 10) + (popCagr * 10) + (rYield < 4 ? 20 : 0));

  // Rental yield stabilization floor
  const yieldFloor = Math.max(2.0, rYield * 0.6);
  const yieldStabilized = Math.max(yieldFloor, rYield - (cagr5 * 0.3));

  // Trajectory curve
  let curve = "linear";
  if (cagr5 > 5) curve = "exponential";
  else if (genStage === "mid") curve = "s_curve";
  else if (cagr5 < 0) curve = "decline";
  else if (Math.abs(cagr5) < 1) curve = "plateau";

  const confidence = Math.min(90, 40 + (growth ? 20 : 0) + (pti > 0 ? 10 : 0) + (rYield > 0 ? 10 : 0));

  const { data, error } = await sb.from("gues_value_trajectories").insert({
    city, country: country || "ID", district,
    property_type: property_type || "residential",
    current_median_price_usd: price,
    forecast_5y_price_usd: price5,
    forecast_10y_price_usd: price10,
    forecast_20y_price_usd: price20,
    appreciation_cagr_5y: Math.round(cagr5 * 1000) / 1000,
    appreciation_cagr_10y: Math.round(cagr10 * 1000) / 1000,
    appreciation_cagr_20y: Math.round(cagr20 * 1000) / 1000,
    gentrification_stage: genStage,
    gentrification_probability: genProb,
    luxury_demand_index: Math.round(luxuryDemand),
    rental_yield_current: rYield,
    rental_yield_stabilized: Math.round(yieldStabilized * 1000) / 1000,
    rental_yield_floor: yieldFloor,
    price_to_income_ratio: pti,
    trajectory_curve: curve,
    confidence_score: confidence,
  }).select().single();

  if (error) throw error;
  return { trajectory: data, price_forecast: { y5: price5, y10: price10, y20: price20 } };
}

// ─── 3️⃣ CAPITAL ATTRACTION INDEX ─────────────────────────────
async function computeCapitalAttraction(sb: any, p: any) {
  const { city, country, investment_friendliness, regulatory_friction, dev_velocity, macro_stability,
    tax_competitiveness, foreign_ownership, permit_days, fdi_inflow } = p;

  const invFriend = investment_friendliness || 50;
  const regFriction = regulatory_friction || 50;
  const devVel = dev_velocity || 50;
  const macroStab = macro_stability || 50;
  const taxComp = tax_competitiveness || 50;
  const foreignOwn = foreign_ownership || 50;

  // Composite: weighted average with friction as negative
  // Score = 25% InvFriend + 20% DevVelocity + 20% MacroStab + 15% TaxComp + 10% ForeignOwn - 10% RegFriction
  const composite = Math.round(
    invFriend * 0.25 + devVel * 0.20 + macroStab * 0.20 +
    taxComp * 0.15 + foreignOwn * 0.10 - regFriction * 0.10
  );

  // FDI trend
  const fdi = fdi_inflow || 0;
  let fdiTrend = "stable";
  if (fdi > 5_000_000_000) fdiTrend = "surging";
  else if (fdi > 1_000_000_000) fdiTrend = "growing";
  else if (fdi < 100_000_000) fdiTrend = "declining";

  // Institutional interest based on composite
  const instInterest = Math.min(100, composite * 1.2);

  // Tier classification
  let tier = "emerging";
  if (composite >= 80) tier = "premium";
  else if (composite >= 65) tier = "established";
  else if (composite >= 50) tier = "growth";
  else if (composite >= 35) tier = "emerging";
  else tier = "frontier";

  const { data, error } = await sb.from("gues_capital_attraction").insert({
    city, country: country || "ID",
    composite_score: composite,
    investment_friendliness: invFriend,
    regulatory_friction: regFriction,
    development_velocity: devVel,
    macro_stability: macroStab,
    tax_competitiveness: taxComp,
    foreign_ownership_ease: foreignOwn,
    permit_speed_days: permit_days,
    fdi_inflow_usd: fdi,
    fdi_trend: fdiTrend,
    institutional_interest_score: Math.round(instInterest),
    tier,
    signal_drivers: {
      top_strength: invFriend >= devVel ? "investment_climate" : "development_speed",
      top_weakness: regFriction > 60 ? "regulatory_burden" : macroStab < 40 ? "macro_risk" : "none",
    },
  }).select().single();

  if (error) throw error;
  return { capital_attraction: data, tier, composite_score: composite };
}

// ─── 4️⃣ CRISIS RESILIENCE SIMULATOR ──────────────────────────
async function runCrisisSimulation(sb: any, p: any) {
  const { city, country, scenario_type, scenario_name, severity } = p;

  const sev = severity || 50;

  // Scenario impact models
  const impacts: Record<string, any> = {
    market_crash: {
      price: -(sev * 0.4), recovery: Math.round(12 + sev * 0.36),
      liquidity: -(sev * 0.5), volume: -(sev * 0.6), yield: -(sev * 0.15),
      devDefault: sev * 0.3, mortgage: sev * 0.25,
    },
    rate_shock: {
      price: -(sev * 0.2), recovery: Math.round(6 + sev * 0.24),
      liquidity: -(sev * 0.3), volume: -(sev * 0.35), yield: sev * 0.1,
      devDefault: sev * 0.15, mortgage: sev * 0.45,
    },
    oversupply: {
      price: -(sev * 0.25), recovery: Math.round(18 + sev * 0.42),
      liquidity: -(sev * 0.2), volume: -(sev * 0.15), yield: -(sev * 0.3),
      devDefault: sev * 0.4, mortgage: sev * 0.1,
    },
    liquidity_freeze: {
      price: -(sev * 0.15), recovery: Math.round(8 + sev * 0.2),
      liquidity: -(sev * 0.8), volume: -(sev * 0.7), yield: -(sev * 0.05),
      devDefault: sev * 0.2, mortgage: sev * 0.15,
    },
    pandemic: {
      price: -(sev * 0.12), recovery: Math.round(10 + sev * 0.18),
      liquidity: -(sev * 0.4), volume: -(sev * 0.5), yield: -(sev * 0.2),
      devDefault: sev * 0.25, mortgage: sev * 0.2,
    },
    currency_crisis: {
      price: -(sev * 0.3), recovery: Math.round(15 + sev * 0.3),
      liquidity: -(sev * 0.35), volume: -(sev * 0.4), yield: sev * 0.15,
      devDefault: sev * 0.35, mortgage: sev * 0.35,
    },
    political_instability: {
      price: -(sev * 0.18), recovery: Math.round(12 + sev * 0.36),
      liquidity: -(sev * 0.45), volume: -(sev * 0.5), yield: -(sev * 0.1),
      devDefault: sev * 0.2, mortgage: sev * 0.15,
    },
  };

  const impact = impacts[scenario_type] || impacts.market_crash;

  // Resilience score: inverse of average impact severity
  const avgImpact = Math.abs(impact.price) + Math.abs(impact.liquidity) + Math.abs(impact.volume);
  const resilience = Math.max(0, Math.min(100, 100 - avgImpact / 3));

  // Vulnerability factors
  const vulns = [];
  if (Math.abs(impact.price) > 15) vulns.push("Severe price correction risk");
  if (Math.abs(impact.liquidity) > 40) vulns.push("Liquidity evaporation threat");
  if (impact.devDefault > 25) vulns.push("Developer solvency stress");
  if (impact.mortgage > 30) vulns.push("Mortgage market strain");

  // Mitigation strategies
  const mitigations = [];
  if (Math.abs(impact.price) > 10) mitigations.push("Diversify across uncorrelated markets");
  if (Math.abs(impact.liquidity) > 30) mitigations.push("Maintain 20% cash reserves");
  if (impact.devDefault > 20) mitigations.push("Prefer completed assets over off-plan");
  if (impact.mortgage > 25) mitigations.push("Reduce leverage, lock fixed rates");

  const { data, error } = await sb.from("gues_crisis_simulations").insert({
    city, country: country || "ID",
    scenario_type, scenario_name: scenario_name || `${scenario_type} stress test`,
    severity_level: sev,
    price_impact_pct: Math.round(impact.price * 100) / 100,
    recovery_months: impact.recovery,
    liquidity_impact_pct: Math.round(impact.liquidity * 100) / 100,
    transaction_volume_impact_pct: Math.round(impact.volume * 100) / 100,
    rental_yield_impact_pct: Math.round(impact.yield * 100) / 100,
    developer_default_probability: Math.round(impact.devDefault * 100) / 100,
    mortgage_stress_pct: Math.round(impact.mortgage * 100) / 100,
    resilience_score: Math.round(resilience * 100) / 100,
    vulnerability_factors: vulns,
    mitigation_strategies: mitigations,
    simulation_parameters: { severity_input: sev, model: "parametric_v1" },
  }).select().single();

  if (error) throw error;
  return { simulation: data, resilience_score: resilience, recovery_months: impact.recovery };
}

// ─── 5️⃣ EXPANSION RECOMMENDATIONS ───────────────────────────
async function generateExpansionRecs(sb: any, p: any) {
  const { city, country } = p;

  // Gather signals from existing modules
  const [growth, capital, trajectories, crises] = await Promise.all([
    sb.from("gues_urban_growth").select("*").eq("city", city).order("computed_at", { ascending: false }).limit(1),
    sb.from("gues_capital_attraction").select("*").eq("city", city).order("computed_at", { ascending: false }).limit(1),
    sb.from("gues_value_trajectories").select("*").eq("city", city).order("computed_at", { ascending: false }).limit(3),
    sb.from("gues_crisis_simulations").select("resilience_score").eq("city", city).order("computed_at", { ascending: false }).limit(3),
  ]);

  const g = growth.data?.[0];
  const c = capital.data?.[0];
  const t = trajectories.data?.[0];
  const avgResilience = crises.data?.length
    ? crises.data.reduce((s: number, cr: any) => s + (cr.resilience_score || 50), 0) / crises.data.length
    : 50;

  // Opportunity score composite
  const growthSignal = g ? (g.urbanization_velocity || 0) * 0.3 : 15;
  const capitalSignal = c ? (c.composite_score || 0) * 0.25 : 12.5;
  const valueSignal = t ? Math.max(0, (t.appreciation_cagr_5y || 0) * 8) : 10;
  const resilienceSignal = avgResilience * 0.15;

  const oppScore = Math.min(100, Math.round(growthSignal + capitalSignal + valueSignal + resilienceSignal));

  // Classification
  let recType = "monitor";
  let timing = "watch";
  if (oppScore >= 80) { recType = "hotspot"; timing = "immediate"; }
  else if (oppScore >= 65) { recType = "early_entry"; timing = "6_months"; }
  else if (oppScore >= 50) { recType = "monitor"; timing = "12_months"; }
  else if (oppScore < 30) { recType = "avoid"; timing = "not_ready"; }

  // Estimated IRR
  const estimatedIrr = t
    ? (t.appreciation_cagr_5y || 0) + (t.rental_yield_current || 0)
    : oppScore * 0.15;

  const catalysts = [];
  if (g?.growth_phase === "accelerating") catalysts.push("Accelerating population growth");
  if (c?.tier === "premium" || c?.tier === "established") catalysts.push("Strong capital environment");
  if (t?.gentrification_stage === "early") catalysts.push("Early gentrification cycle");
  if (avgResilience > 70) catalysts.push("High crisis resilience");

  const risks = [];
  if (g?.growth_phase === "saturated") risks.push("Market saturation risk");
  if (c?.regulatory_friction > 60) risks.push("High regulatory friction");
  if (t?.price_to_income_ratio > 20) risks.push("Affordability ceiling");
  if (avgResilience < 40) risks.push("Low crisis resilience");

  const thesis = `${city} presents a ${recType === 'hotspot' ? 'compelling' : recType === 'early_entry' ? 'promising' : 'developing'} opportunity with ${oppScore}/100 composite score. ${catalysts.length > 0 ? 'Key catalysts: ' + catalysts.join(', ') + '.' : ''} ${risks.length > 0 ? 'Watch: ' + risks.join(', ') + '.' : ''}`;

  const { data, error } = await sb.from("gues_expansion_recommendations").insert({
    city, country: country || "ID",
    recommendation_type: recType,
    opportunity_score: oppScore,
    timing_signal: timing,
    estimated_irr_pct: Math.round(estimatedIrr * 100) / 100,
    estimated_multiple: Math.round((1 + estimatedIrr / 100) ** 5 * 100) / 100,
    key_risks: risks,
    key_catalysts: catalysts,
    thesis,
    is_active: true,
    valid_until: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
  }).select().single();

  if (error) throw error;
  return { recommendation: data, opportunity_score: oppScore, timing: timing };
}

// ─── DASHBOARD ────────────────────────────────────────────────
async function buildDashboard(sb: any, p: any) {
  const city = p?.city;
  const cityFilter = (q: any) => city ? q.eq("city", city) : q;

  const [growth, trajectories, capital, crises, recs] = await Promise.all([
    cityFilter(sb.from("gues_urban_growth").select("*").order("computed_at", { ascending: false })).limit(50),
    cityFilter(sb.from("gues_value_trajectories").select("*").order("computed_at", { ascending: false })).limit(50),
    cityFilter(sb.from("gues_capital_attraction").select("*").order("composite_score", { ascending: false })).limit(30),
    cityFilter(sb.from("gues_crisis_simulations").select("*").order("computed_at", { ascending: false })).limit(30),
    sb.from("gues_expansion_recommendations").select("*").eq("is_active", true).order("opportunity_score", { ascending: false }).limit(20),
  ]);

  const hotspots = (recs.data || []).filter((r: any) => r.recommendation_type === "hotspot");
  const avgCapital = (capital.data || []).reduce((s: number, c: any) => s + (c.composite_score || 0), 0) / (capital.data?.length || 1);
  const avgResilience = (crises.data || []).reduce((s: number, c: any) => s + (c.resilience_score || 0), 0) / (crises.data?.length || 1);

  return {
    summary: {
      cities_analyzed: new Set((growth.data || []).map((g: any) => g.city)).size,
      total_simulations: (growth.data || []).length + (crises.data || []).length,
      hotspot_cities: hotspots.length,
      avg_capital_attraction: Math.round(avgCapital),
      avg_crisis_resilience: Math.round(avgResilience),
      active_recommendations: (recs.data || []).length,
    },
    urban_growth: growth.data || [],
    value_trajectories: trajectories.data || [],
    capital_attraction: capital.data || [],
    crisis_simulations: crises.data || [],
    expansion_recommendations: recs.data || [],
  };
}
