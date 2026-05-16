import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params } = await req.json();

    switch (mode) {
      case "expand_market": return respond(await expandMarket(supabase, params));
      case "stack_monetization": return respond(await stackMonetization(supabase, params));
      case "compute_network": return respond(await computeNetwork(supabase, params));
      case "assess_optionality": return respond(await assessOptionality(supabase, params));
      case "simulate_ev": return respond(await simulateEV(supabase, params));
      case "dashboard": return respond(await dashboard(supabase));
      default: return respond({ error: "Unknown mode" }, 400);
    }
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
});

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Module 1: Market Size Expansion ──
async function expandMarket(sb: any, _params: any) {
  const phases = [
    { phase: "LOCAL_MARKETPLACE", label: "Indonesia Marketplace", geo: "Indonesia", tam: 45_000_000_000, sam: 5_000_000_000, som: 500_000_000, timeline: 12 },
    { phase: "NATIONAL_INFRASTRUCTURE", label: "National RE Infrastructure", geo: "Indonesia", tam: 120_000_000_000, sam: 15_000_000_000, som: 2_000_000_000, timeline: 24 },
    { phase: "REGIONAL_INTELLIGENCE", label: "ASEAN Intelligence Layer", geo: "ASEAN", tam: 350_000_000_000, sam: 40_000_000_000, som: 5_000_000_000, timeline: 36 },
    { phase: "GLOBAL_PLATFORM", label: "Global Asset Platform", geo: "Global", tam: 3_200_000_000_000, sam: 200_000_000_000, som: 15_000_000_000, timeline: 60 },
  ];

  const rows = [];
  for (const p of phases) {
    const penetration = Math.round((p.som / p.tam) * 10000) / 100;
    const growth = 15 + Math.random() * 40;
    const confidence = 90 - phases.indexOf(p) * 15 + Math.random() * 10;

    rows.push({
      expansion_phase: p.phase,
      phase_label: p.label,
      tam_usd: p.tam,
      sam_usd: p.sam,
      som_usd: p.som,
      penetration_pct: penetration,
      growth_rate_pct: Math.round(growth * 100) / 100,
      geographic_scope: p.geo,
      key_drivers: ["network_effects", "data_moat", "regulatory_advantage"],
      milestones_achieved: Math.floor(Math.random() * 4),
      milestones_total: 5,
      phase_confidence: Math.round(confidence * 100) / 100,
      estimated_timeline_months: p.timeline,
    });
  }

  await sb.from("gvem_market_expansion").insert(rows);
  return { phases_computed: rows.length, tam_total: 3_200_000_000_000 };
}

// ── Module 2: Monetization Layer Stacking ──
async function stackMonetization(sb: any, _params: any) {
  const layers = [
    { name: "Transaction Commissions", order: 1, type: "TRANSACTION", arr: 2_400_000, margin: 85, multiple: 8 },
    { name: "Vendor Marketplace Fees", order: 2, type: "VENDOR_ECOSYSTEM", arr: 1_800_000, margin: 75, multiple: 12 },
    { name: "Data Intelligence Subscriptions", order: 3, type: "DATA_INTELLIGENCE", arr: 3_200_000, margin: 92, multiple: 22 },
    { name: "Institutional Analytics API", order: 4, type: "INSTITUTIONAL_TOOLS", arr: 5_000_000, margin: 90, multiple: 25 },
    { name: "Financial Services Layer", order: 5, type: "FINANCIAL_SERVICES", arr: 1_200_000, margin: 60, multiple: 15 },
  ];

  const totalArr = layers.reduce((s, l) => s + l.arr, 0);
  const rows = layers.map((l) => {
    const projected = l.arr * (1.5 + Math.random());
    const implied = l.arr * l.multiple;
    return {
      layer_name: l.name,
      layer_order: l.order,
      layer_type: l.type,
      current_arr_usd: l.arr,
      projected_arr_usd: Math.round(projected),
      margin_pct: l.margin,
      contribution_to_valuation_pct: Math.round((l.arr / totalArr) * 10000) / 100,
      multiple_applied: l.multiple,
      implied_value_usd: implied,
      activation_status: l.arr > 2_000_000 ? "SCALING" : "LIVE",
    };
  });

  await sb.from("gvem_monetization_stack").insert(rows);
  const totalEV = rows.reduce((s, r) => s + r.implied_value_usd, 0);
  return { layers_stacked: rows.length, total_arr: totalArr, implied_ev: totalEV };
}

// ── Module 3: Network Effect Multiplier ──
async function computeNetwork(sb: any, _params: any) {
  // Pull real signals from existing systems
  const { data: density } = await sb.from("city_network_density").select("network_density_score, metcalfe_value_proxy").order("network_density_score", { ascending: false }).limit(5);
  const { data: gravity } = await sb.from("newf_liquidity_gravity").select("gravity_pull").order("gravity_pull", { ascending: false }).limit(5);

  const avgDensity = density?.length ? density.reduce((s: number, d: any) => s + (d.network_density_score || 0), 0) / density.length : 50;
  const avgGravity = gravity?.length ? gravity.reduce((s: number, g: any) => s + (g.gravity_pull || 0), 0) / gravity.length : 50;

  const dims = [
    { dim: "USER_GROWTH", magnitude: 45000, velocity: 0.12 },
    { dim: "LIQUIDITY_DEPTH", magnitude: avgDensity * 100, velocity: 0.08 },
    { dim: "DATA_SCALE", magnitude: 2_500_000, velocity: 0.15 },
    { dim: "ECOSYSTEM_DENSITY", magnitude: avgGravity * 80, velocity: 0.1 },
    { dim: "CROSS_BORDER", magnitude: 1200, velocity: 0.05 },
  ];

  const rows = dims.map((d) => {
    const pricing = 40 + d.velocity * 200 + Math.random() * 15;
    const defensibility = 45 + d.magnitude / 50000 * 10 + Math.random() * 10;
    const strategic = (pricing + defensibility) / 2;
    const tipped = d.magnitude > 10000 && d.velocity > 0.08;
    return {
      effect_dimension: d.dim,
      current_magnitude: d.magnitude,
      growth_velocity: d.velocity,
      pricing_power_index: Math.min(100, Math.round(pricing * 100) / 100),
      defensibility_score: Math.min(100, Math.round(defensibility * 100) / 100),
      strategic_value_score: Math.min(100, Math.round(strategic * 100) / 100),
      multiplier_contribution: Math.round((1 + d.velocity * 5) * 100) / 100,
      competitor_gap_pct: Math.round((15 + Math.random() * 30) * 100) / 100,
      tipping_point_reached: tipped,
      metcalfe_proxy: Math.round(d.magnitude * d.magnitude * 0.001),
    };
  });

  await sb.from("gvem_network_multiplier").insert(rows);
  const tipped = rows.filter((r) => r.tipping_point_reached).length;
  return { dimensions_computed: rows.length, tipping_points_reached: tipped };
}

// ── Module 4: Strategic Optionality ──
async function assessOptionality(sb: any, _params: any) {
  const options = [
    { name: "Mortgage & Insurance Distribution", type: "FINANCIAL_SERVICES", prob: 65, value: 50_000_000, time: 18 },
    { name: "ASEAN Cross-Border Investment", type: "CROSS_BORDER", prob: 55, value: 80_000_000, time: 24 },
    { name: "Property Token Exchange", type: "TOKENIZATION", prob: 40, value: 200_000_000, time: 36 },
    { name: "Developer & Agent Platform OS", type: "PLATFORMIZATION", prob: 70, value: 120_000_000, time: 12 },
    { name: "Institutional Data Licensing", type: "DATA_LICENSING", prob: 75, value: 60_000_000, time: 15 },
  ];

  const rows = options.map((o) => ({
    option_name: o.name,
    option_type: o.type,
    probability_pct: o.prob,
    potential_value_usd: o.value,
    expected_value_usd: Math.round(o.value * o.prob / 100),
    time_to_activation_months: o.time,
    readiness_score: Math.round((30 + Math.random() * 50) * 100) / 100,
    prerequisite_layers: ["TRANSACTION", "DATA_INTELLIGENCE"],
    valuation_uplift_pct: Math.round((o.value / 500_000_000) * 10000) / 100,
    risk_factors: ["regulatory", "market_timing", "execution"],
    status: o.prob > 60 ? "EVALUATING" : "IDENTIFIED",
  }));

  await sb.from("gvem_strategic_optionality").insert(rows);
  const totalEV = rows.reduce((s, r) => s + r.expected_value_usd, 0);
  return { options_assessed: rows.length, total_expected_value: totalEV };
}

// ── Module 5: Enterprise Value Simulator ──
async function simulateEV(sb: any, _params: any) {
  // Pull latest monetization stack
  const { data: stack } = await sb.from("gvem_monetization_stack").select("current_arr_usd, multiple_applied").order("created_at", { ascending: false }).limit(10);
  const baseRevenue = stack?.reduce((s: number, l: any) => s + (l.current_arr_usd || 0), 0) || 13_600_000;

  // Pull optionality premium
  const { data: opts } = await sb.from("gvem_strategic_optionality").select("expected_value_usd").order("created_at", { ascending: false }).limit(10);
  const optionalityValue = opts?.reduce((s: number, o: any) => s + (o.expected_value_usd || 0), 0) || 0;

  const scenarios = [
    { name: "Conservative Bear", type: "BEAR", cagr: 25, mktMult: 6, infraMult: 12, infraPct: 15, horizon: 5 },
    { name: "Steady Base", type: "BASE", cagr: 45, mktMult: 8, infraMult: 18, infraPct: 30, horizon: 5 },
    { name: "Strong Bull", type: "BULL", cagr: 75, mktMult: 12, infraMult: 25, infraPct: 45, horizon: 5 },
    { name: "Category Winner", type: "MOONSHOT", cagr: 120, mktMult: 15, infraMult: 35, infraPct: 60, horizon: 5 },
  ];

  const rows = scenarios.map((s) => {
    const projRevenue = Math.round(baseRevenue * Math.pow(1 + s.cagr / 100, s.horizon));
    const blended = s.mktMult * (1 - s.infraPct / 100) + s.infraMult * (s.infraPct / 100);
    const impliedEV = Math.round(projRevenue * blended);
    const networkPremium = Math.round(15 + Math.random() * 20);
    const optPremium = optionalityValue > 0 ? Math.round((optionalityValue / impliedEV) * 10000) / 100 : 5;
    const totalEV = Math.round(impliedEV * (1 + networkPremium / 100 + optPremium / 100));
    const sustainability = 40 + s.infraPct * 0.5 + (100 - s.cagr * 0.3);

    return {
      scenario_name: s.name,
      scenario_type: s.type,
      year_horizon: s.horizon,
      base_revenue_usd: baseRevenue,
      projected_revenue_usd: projRevenue,
      revenue_cagr_pct: s.cagr,
      marketplace_multiple: s.mktMult,
      infrastructure_multiple: s.infraMult,
      blended_multiple: Math.round(blended * 10) / 10,
      infrastructure_revenue_pct: s.infraPct,
      implied_ev_usd: impliedEV,
      network_premium_pct: networkPremium,
      optionality_premium_pct: Math.min(optPremium, 50),
      total_ev_usd: totalEV,
      sustainability_score: Math.min(100, Math.round(sustainability * 100) / 100),
    };
  });

  await sb.from("gvem_ev_simulator").insert(rows);

  // Emit engine cycle signal
  await sb.from("ai_event_signals").insert({
    event_type: "gvem_engine_cycle",
    entity_type: "gvem",
    priority_level: "normal",
    payload: { scenarios_computed: rows.length, max_ev: Math.max(...rows.map((r) => r.total_ev_usd)) },
  });

  return { scenarios_computed: rows.length, ev_range: { min: Math.min(...rows.map((r) => r.total_ev_usd)), max: Math.max(...rows.map((r) => r.total_ev_usd)) } };
}

// ── Dashboard ──
async function dashboard(sb: any) {
  const [expansion, stack, network, optionality, simulator] = await Promise.all([
    sb.from("gvem_market_expansion").select("*").order("computed_at", { ascending: false }).limit(4),
    sb.from("gvem_monetization_stack").select("*").order("layer_order").limit(10),
    sb.from("gvem_network_multiplier").select("*").order("computed_at", { ascending: false }).limit(5),
    sb.from("gvem_strategic_optionality").select("*").order("computed_at", { ascending: false }).limit(10),
    sb.from("gvem_ev_simulator").select("*").order("computed_at", { ascending: false }).limit(4),
  ]);

  const totalArr = stack.data?.reduce((s: number, l: any) => s + (l.current_arr_usd || 0), 0) || 0;
  const maxEV = simulator.data?.length ? Math.max(...simulator.data.map((s: any) => s.total_ev_usd || 0)) : 0;
  const optionalityValue = optionality.data?.reduce((s: number, o: any) => s + (o.expected_value_usd || 0), 0) || 0;
  const tippingPoints = network.data?.filter((n: any) => n.tipping_point_reached).length || 0;

  return {
    summary: { total_arr: totalArr, max_projected_ev: maxEV, optionality_value: optionalityValue, tipping_points: tippingPoints },
    market_expansion: expansion.data || [],
    monetization_stack: stack.data || [],
    network_multipliers: network.data || [],
    strategic_options: optionality.data || [],
    ev_scenarios: simulator.data || [],
  };
}
