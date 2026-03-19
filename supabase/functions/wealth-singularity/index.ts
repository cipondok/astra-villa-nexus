import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params } = await req.json();
    let result: Record<string, unknown>;

    switch (mode) {
      case "map_wealth": result = await mapWealth(sb, params); break;
      case "optimize_flows": result = await optimizeFlows(sb, params); break;
      case "simulate_generational": result = await simulateGenerational(sb, params); break;
      case "assess_risk_entropy": result = await assessRiskEntropy(sb, params); break;
      case "compute_gravity_field": result = await computeGravityField(sb, params); break;
      case "dashboard": result = await buildDashboard(sb); break;
      default: throw new Error(`Unknown mode: ${mode}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── 1️⃣ PLANETARY WEALTH MAPPING ────────────────────────────
async function mapWealth(sb: any, p: any) {
  const { geography, geography_type, asset_class, total_value_usd, leverage_ratio } = p;

  const totalVal = total_value_usd || 0;
  const leverage = leverage_ratio || 1.0;

  // Productivity score: based on velocity and leverage efficiency
  const velocity = 0.5 + Math.random() * 1.5; // simulated
  const productivity = Math.min(100, velocity * 30 + (leverage > 1.5 ? -10 : 10) + 20);

  // Liquidity score
  const liquidity = asset_class === "real_estate" ? 30 + Math.random() * 20
    : asset_class === "equities" ? 70 + Math.random() * 20
    : asset_class === "digital_assets" ? 50 + Math.random() * 30
    : 40 + Math.random() * 30;

  // Trapped capital detection
  const trappedPct = liquidity < 40 ? 15 + (40 - liquidity) * 0.5 : liquidity < 60 ? 5 : 1;
  const trappedUsd = totalVal * trappedPct / 100;

  // Under-leveraged detection
  const underLeveraged = leverage < 0.5 && productivity < 40;

  // Inefficiency index: high trapped capital + low productivity + low velocity
  const inefficiency = Math.min(100, trappedPct * 2 + (100 - productivity) * 0.3 + (1 / velocity) * 10);

  // Growth potential: inverse of current productivity (room to grow)
  const growthPotential = Math.min(100, (100 - productivity) * 0.6 + (underLeveraged ? 20 : 0) + (velocity < 0.8 ? 15 : 0));

  const { data, error } = await sb.from("gwsm_wealth_map").insert({
    geography, geography_type: geography_type || "country",
    asset_class: asset_class || "real_estate",
    total_value_usd: totalVal,
    productivity_score: Math.round(productivity),
    liquidity_score: Math.round(liquidity),
    trapped_capital_usd: Math.round(trappedUsd),
    trapped_capital_pct: Math.round(trappedPct * 100) / 100,
    under_leveraged: underLeveraged,
    leverage_ratio: leverage,
    velocity_of_capital: Math.round(velocity * 1000) / 1000,
    inefficiency_index: Math.round(inefficiency),
    growth_potential_score: Math.round(growthPotential),
    data_confidence: Math.min(90, 40 + (totalVal > 0 ? 20 : 0) + (leverage !== 1.0 ? 10 : 0)),
  }).select().single();

  if (error) throw error;
  return { wealth_map: data, inefficiency_index: Math.round(inefficiency), trapped_capital_pct: trappedPct };
}

// ─── 2️⃣ CAPITAL FLOW OPTIMIZATION ──────────────────────────
async function optimizeFlows(sb: any, p: any) {
  const { source, target, asset_class, amount_usd, time_horizon } = p;

  const amount = amount_usd || 0;
  const horizon = time_horizon || 5;

  // Get wealth map data for source and target
  const [srcMap, tgtMap] = await Promise.all([
    sb.from("gwsm_wealth_map").select("*").eq("geography", source).order("computed_at", { ascending: false }).limit(1),
    sb.from("gwsm_wealth_map").select("*").eq("geography", target).order("computed_at", { ascending: false }).limit(1),
  ]);

  const src = srcMap.data?.[0];
  const tgt = tgtMap.data?.[0];

  // Productivity gain: difference in growth potential
  const srcProd = src?.productivity_score || 50;
  const tgtProd = tgt?.growth_potential_score || 50;
  const productivityGain = tgtProd - srcProd;

  // Bubble risk: high inflow into already-high-productivity region = bubble
  const bubbleRisk = Math.min(100, Math.max(0,
    (tgt?.productivity_score || 50) * 0.3 +
    (100 - (tgt?.liquidity_score || 50)) * 0.2 +
    (amount > 1_000_000_000 ? 20 : amount > 100_000_000 ? 10 : 0)
  ));

  // Long-term asset productivity
  const ltProd = Math.min(100,
    (tgt?.growth_potential_score || 50) * 0.4 +
    (tgt?.liquidity_score || 50) * 0.2 +
    (100 - bubbleRisk) * 0.2 +
    (horizon > 10 ? 10 : 0)
  );

  // Optimization delta: how much better is this flow vs. status quo
  const optDelta = productivityGain * 0.5 + (100 - bubbleRisk) * 0.2 - (src?.trapped_capital_pct || 0) * 0.1;

  // Friction cost
  const regFriction = (src?.inefficiency_index || 30) * 0.3 + (tgt?.inefficiency_index || 30) * 0.3;
  const frictionCost = Math.min(15, regFriction * 0.1 + (asset_class === "real_estate" ? 3 : 1));

  // Recommendation
  let rec = "Monitor — neutral flow dynamics";
  if (optDelta > 20 && bubbleRisk < 40) rec = "STRONG DEPLOY — high productivity gain, low bubble risk";
  else if (optDelta > 10) rec = "DEPLOY — positive optimization delta";
  else if (optDelta < -10) rec = "REDIRECT — negative optimization, seek alternatives";
  else if (bubbleRisk > 60) rec = "CAUTION — elevated bubble risk at target";

  const confidence = Math.min(95, 30 + (src ? 15 : 0) + (tgt ? 15 : 0) + (amount > 0 ? 10 : 0) + Math.abs(optDelta) * 0.5);

  const { data, error } = await sb.from("gwsm_capital_flows").insert({
    source_geography: source,
    target_geography: target,
    asset_class: asset_class || "real_estate",
    flow_type: optDelta > 10 ? "recommended" : "predicted_optimal",
    flow_amount_usd: amount,
    flow_velocity: (tgt?.velocity_of_capital || 1) * (1 + optDelta / 100),
    productivity_gain_pct: Math.round(productivityGain * 100) / 100,
    bubble_risk_contribution: Math.round(bubbleRisk),
    long_term_asset_productivity: Math.round(ltProd),
    optimization_delta_pct: Math.round(optDelta * 100) / 100,
    friction_cost_pct: Math.round(frictionCost * 100) / 100,
    regulatory_friction: Math.round(regFriction),
    time_horizon_years: horizon,
    confidence: Math.round(confidence),
    recommendation: rec,
    signal_sources: [
      src ? "source_wealth_map" : null,
      tgt ? "target_wealth_map" : null,
    ].filter(Boolean),
  }).select().single();

  if (error) throw error;
  return { flow: data, optimization_delta: optDelta, bubble_risk: bubbleRisk, recommendation: rec };
}

// ─── 3️⃣ GENERATIONAL COMPOUNDING ───────────────────────────
async function simulateGenerational(sb: any, p: any) {
  const { entity_type, entity_name, initial_capital, scenario, allocation } = p;

  const capital = initial_capital || 1_000_000_000;
  const scen = scenario || "base";

  // Scenario-based return assumptions (real, after inflation)
  const scenarioReturns: Record<string, { r10: number; r25: number; r50: number; inflation: number }> = {
    pessimistic: { r10: 3, r25: 2.5, r50: 2, inflation: 4 },
    conservative: { r10: 5, r25: 4.5, r50: 4, inflation: 3 },
    base: { r10: 7, r25: 6, r50: 5.5, inflation: 2.5 },
    optimistic: { r10: 10, r25: 8, r50: 7, inflation: 2 },
    transformative: { r10: 14, r25: 11, r50: 9, inflation: 2 },
  };

  const sr = scenarioReturns[scen] || scenarioReturns.base;

  const forecast10 = capital * Math.pow(1 + sr.r10 / 100, 10);
  const forecast25 = capital * Math.pow(1 + sr.r25 / 100, 25);
  const forecast50 = capital * Math.pow(1 + sr.r50 / 100, 50);
  const forecast100 = capital * Math.pow(1 + (sr.r50 * 0.9) / 100, 100);

  const realReturn = sr.r10 - sr.inflation;

  // Compounding efficiency: how much of theoretical compound is captured
  const transferLoss = entity_type === "sovereign_fund" ? 1 : entity_type === "family_office" ? 8 : entity_type === "institution" ? 3 : 5;
  const compEfficiency = Math.max(30, 100 - transferLoss * 3 - (scen === "pessimistic" ? 15 : 0));

  // Wealth preservation probability
  const wealthPres = scen === "pessimistic" ? 60 : scen === "conservative" ? 75 : scen === "base" ? 85 : 90;

  // Dynasty longevity
  const dynasty = entity_type === "sovereign_fund" ? 95 : entity_type === "family_office" ? 45 : entity_type === "institution" ? 80 : 60;

  const { data, error } = await sb.from("gwsm_generational_forecasts").insert({
    entity_type, entity_name,
    initial_capital_usd: capital,
    forecast_10y_usd: Math.round(forecast10),
    forecast_25y_usd: Math.round(forecast25),
    forecast_50y_usd: Math.round(forecast50),
    forecast_100y_usd: Math.round(forecast100),
    cagr_10y: sr.r10, cagr_25y: sr.r25, cagr_50y: sr.r50,
    real_return_after_inflation: realReturn,
    allocation_strategy: allocation || { real_estate: 40, equities: 25, fixed_income: 15, alternatives: 15, cash: 5 },
    compounding_efficiency: Math.round(compEfficiency),
    wealth_preservation_probability: wealthPres,
    intergenerational_transfer_loss_pct: transferLoss,
    dynasty_longevity_score: dynasty,
    scenario: scen,
    key_assumptions: { returns: sr, model: "compound_v1" },
    risk_factors: [
      sr.r10 > 10 ? "High return assumption risk" : null,
      transferLoss > 5 ? "Significant intergenerational transfer loss" : null,
      scen === "transformative" ? "Assumes paradigm shift in asset productivity" : null,
    ].filter(Boolean),
  }).select().single();

  if (error) throw error;
  return {
    forecast: data,
    wealth_multiplier_50y: Math.round(forecast50 / capital * 100) / 100,
    dynasty_score: dynasty,
  };
}

// ─── 4️⃣ RISK ENTROPY STABILIZATION ─────────────────────────
async function assessRiskEntropy(sb: any, p: any) {
  const { scope, geography, leverage_risk, liquidity_stress, correlation_spike } = p;

  const levRisk = leverage_risk || 30;
  const liqStress = liquidity_stress || 20;
  const corrSpike = correlation_spike || false;

  // Pull existing gravity and flow data for context
  const [flows, gravity] = await Promise.all([
    sb.from("gwsm_capital_flows").select("bubble_risk_contribution").order("computed_at", { ascending: false }).limit(20),
    sb.from("gwsm_gravity_field").select("gravity_score, field_trend").order("computed_at", { ascending: false }).limit(10),
  ]);

  const avgBubbleRisk = (flows.data || []).reduce((s: number, f: any) => s + (f.bubble_risk_contribution || 0), 0) / (flows.data?.length || 1);
  const collapsingFields = (gravity.data || []).filter((g: any) => g.field_trend === "collapsing").length;

  // Entropy index: composite measure of disorder in the financial system
  const entropy = Math.min(100, Math.round(
    levRisk * 0.25 + liqStress * 0.25 + avgBubbleRisk * 0.2 +
    (corrSpike ? 20 : 0) + collapsingFields * 5
  ));

  // Systemic instability
  const instability = Math.min(100, entropy * 0.7 + (corrSpike ? 15 : 0) + collapsingFields * 3);

  // Crisis probabilities (logistic curve from entropy)
  const crisis6m = Math.min(95, 2 + Math.pow(entropy / 100, 2) * 50);
  const crisis12m = Math.min(95, crisis6m * 1.4);
  const crisis24m = Math.min(95, crisis12m * 1.3);

  // Contagion risk
  const contagion = Math.min(100, corrSpike ? entropy * 0.8 : entropy * 0.4);

  // Dampening capacity: inverse of leverage and stress
  const dampening = Math.max(0, 100 - levRisk * 0.4 - liqStress * 0.3 - (corrSpike ? 15 : 0));

  // Safe haven demand
  const safeHaven = Math.min(100, entropy * 0.6 + (corrSpike ? 20 : 0));

  // Rebalancing urgency
  let urgency = "low";
  if (instability >= 75) urgency = "critical";
  else if (instability >= 55) urgency = "high";
  else if (instability >= 35) urgency = "moderate";
  else if (instability < 20) urgency = "none";

  // Recommended actions
  const actions = [];
  if (levRisk > 50) actions.push({ action: "Reduce system leverage", priority: "high", target_reduction_pct: levRisk - 30 });
  if (liqStress > 40) actions.push({ action: "Increase liquidity reserves", priority: "high", target_reserve_pct: 20 });
  if (corrSpike) actions.push({ action: "Decorrelate portfolio immediately", priority: "critical" });
  if (avgBubbleRisk > 40) actions.push({ action: "Reduce exposure to bubble-risk regions", priority: "medium" });
  if (collapsingFields > 2) actions.push({ action: "Exit collapsing gravity fields", priority: "critical" });

  // Early warning signals
  const warnings = [];
  if (entropy > 60) warnings.push("Entropy exceeding stability threshold");
  if (crisis6m > 30) warnings.push(`${Math.round(crisis6m)}% crisis probability within 6 months`);
  if (contagion > 50) warnings.push("High contagion risk — cross-market propagation likely");

  const { data, error } = await sb.from("gwsm_risk_entropy").insert({
    scope: scope || "global", geography,
    entropy_index: entropy,
    systemic_instability_score: Math.round(instability),
    crisis_probability_6m: Math.round(crisis6m * 10) / 10,
    crisis_probability_12m: Math.round(crisis12m * 10) / 10,
    crisis_probability_24m: Math.round(crisis24m * 10) / 10,
    contagion_risk: Math.round(contagion),
    rebalancing_urgency: urgency,
    dampening_capacity: Math.round(dampening),
    leverage_system_risk: levRisk,
    liquidity_stress_index: liqStress,
    correlation_spike_detected: corrSpike,
    safe_haven_demand_index: Math.round(safeHaven),
    recommended_actions: actions,
    early_warning_signals: warnings,
  }).select().single();

  if (error) throw error;
  return { risk_entropy: data, entropy_index: entropy, urgency, crisis_probability_6m: crisis6m };
}

// ─── 5️⃣ WEALTH GRAVITY FIELD ───────────────────────────────
async function computeGravityField(sb: any, p: any) {
  const { target, target_type, capital_mass_usd } = p;

  const capMass = capital_mass_usd || 0;

  // Pull wealth map and flow data
  const [wealthMap, inflows, outflows] = await Promise.all([
    sb.from("gwsm_wealth_map").select("*").eq("geography", target).order("computed_at", { ascending: false }).limit(5),
    sb.from("gwsm_capital_flows").select("flow_amount_usd, productivity_gain_pct").eq("target_geography", target).order("computed_at", { ascending: false }).limit(10),
    sb.from("gwsm_capital_flows").select("flow_amount_usd").eq("source_geography", target).order("computed_at", { ascending: false }).limit(10),
  ]);

  const totalWealth = (wealthMap.data || []).reduce((s: number, w: any) => s + (w.total_value_usd || 0), 0);
  const totalInflow = (inflows.data || []).reduce((s: number, f: any) => s + (f.flow_amount_usd || 0), 0);
  const totalOutflow = (outflows.data || []).reduce((s: number, f: any) => s + (f.flow_amount_usd || 0), 0);
  const avgProdGain = (inflows.data || []).reduce((s: number, f: any) => s + (f.productivity_gain_pct || 0), 0) / (inflows.data?.length || 1);

  const effectiveMass = capMass || totalWealth;

  // Gravity score: G = log10(mass) * 5 + inflow_momentum * 0.3 - outflow_pressure * 0.2 + productivity_premium
  const inMomentum = totalInflow > 0 ? Math.log10(totalInflow) * 3 : 0;
  const outPressure = totalOutflow > 0 ? Math.log10(totalOutflow) * 2 : 0;
  const netAttraction = inMomentum - outPressure;

  const gravityScore = Math.min(100, Math.max(0, Math.round(
    (effectiveMass > 0 ? Math.log10(effectiveMass) * 5 : 10) +
    netAttraction * 2 + avgProdGain * 0.5
  )));

  // Magnetic field strength
  const magnetic = Math.min(100, gravityScore * 0.7 + (netAttraction > 0 ? 20 : 0));

  // Orbital capital (capital circling but not committed)
  const orbitalCap = effectiveMass * 0.15 * (1 + netAttraction / 20);

  // Escape velocity (how much negative force needed to reverse gravity)
  const escapeVel = gravityScore * 0.8 + magnetic * 0.2;

  // Field trend
  let trend = "stable";
  if (netAttraction > 5) trend = "surging";
  else if (netAttraction > 2) trend = "strengthening";
  else if (netAttraction < -5) trend = "collapsing";
  else if (netAttraction < -2) trend = "weakening";

  // Attractors and detractors
  const attractors = [];
  if (avgProdGain > 5) attractors.push("High productivity gain for incoming capital");
  if (totalInflow > totalOutflow * 2) attractors.push("Strong net inflow momentum");
  if (gravityScore > 70) attractors.push("Self-reinforcing capital mass");

  const detractors = [];
  if (totalOutflow > totalInflow) detractors.push("Net capital outflow");
  if (avgProdGain < 0) detractors.push("Negative productivity for incoming capital");

  const { data, error } = await sb.from("gwsm_gravity_field").insert({
    target, target_type: target_type || "geography",
    gravity_score: gravityScore,
    capital_mass_usd: effectiveMass,
    inflow_momentum: Math.round(inMomentum * 100) / 100,
    outflow_pressure: Math.round(outPressure * 100) / 100,
    net_attraction: Math.round(netAttraction * 100) / 100,
    magnetic_field_strength: Math.round(magnetic),
    orbital_capital_usd: Math.round(orbitalCap),
    escape_velocity_threshold: Math.round(escapeVel * 100) / 100,
    field_trend: trend,
    attractors, detractors,
  }).select().single();

  if (error) throw error;
  return { gravity_field: data, gravity_score: gravityScore, trend, net_attraction: netAttraction };
}

// ─── DASHBOARD ────────────────────────────────────────────────
async function buildDashboard(sb: any) {
  const [wealth, flows, forecasts, entropy, gravity] = await Promise.all([
    sb.from("gwsm_wealth_map").select("*").order("total_value_usd", { ascending: false }).limit(50),
    sb.from("gwsm_capital_flows").select("*").order("computed_at", { ascending: false }).limit(30),
    sb.from("gwsm_generational_forecasts").select("*").order("computed_at", { ascending: false }).limit(20),
    sb.from("gwsm_risk_entropy").select("*").order("computed_at", { ascending: false }).limit(10),
    sb.from("gwsm_gravity_field").select("*").order("gravity_score", { ascending: false }).limit(20),
  ]);

  const totalMappedWealth = (wealth.data || []).reduce((s: number, w: any) => s + (w.total_value_usd || 0), 0);
  const totalTrapped = (wealth.data || []).reduce((s: number, w: any) => s + (w.trapped_capital_usd || 0), 0);
  const avgEntropy = (entropy.data || []).reduce((s: number, e: any) => s + (e.entropy_index || 0), 0) / (entropy.data?.length || 1);
  const criticalEntropy = (entropy.data || []).filter((e: any) => e.rebalancing_urgency === "critical");
  const topGravity = (gravity.data || []).slice(0, 5);

  return {
    summary: {
      total_mapped_wealth_usd: totalMappedWealth,
      total_trapped_capital_usd: totalTrapped,
      trapped_capital_pct: totalMappedWealth > 0 ? Math.round(totalTrapped / totalMappedWealth * 10000) / 100 : 0,
      asset_classes_tracked: new Set((wealth.data || []).map((w: any) => w.asset_class)).size,
      geographies_mapped: new Set((wealth.data || []).map((w: any) => w.geography)).size,
      avg_entropy_index: Math.round(avgEntropy),
      critical_alerts: criticalEntropy.length,
      generational_forecasts: (forecasts.data || []).length,
      top_gravity_fields: topGravity.map((g: any) => ({ target: g.target, score: g.gravity_score, trend: g.field_trend })),
    },
    wealth_map: wealth.data || [],
    capital_flows: flows.data || [],
    generational_forecasts: forecasts.data || [],
    risk_entropy: entropy.data || [],
    gravity_fields: gravity.data || [],
  };
}
