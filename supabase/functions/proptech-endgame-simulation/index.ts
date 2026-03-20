import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function sb() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

// ── Phase 1: Global Market Saturation ──

async function simulateSaturation(client: ReturnType<typeof sb>) {
  const markets = [
    { city: "Jakarta", country: "Indonesia", region: "Java", tam: 12000000000 },
    { city: "Bali", country: "Indonesia", region: "Bali-NTB", tam: 4500000000 },
    { city: "Surabaya", country: "Indonesia", region: "Java", tam: 3200000000 },
    { city: "Bandung", country: "Indonesia", region: "Java", tam: 1800000000 },
    { city: "Kuala Lumpur", country: "Malaysia", region: "SEA", tam: 8500000000 },
    { city: "Bangkok", country: "Thailand", region: "SEA", tam: 11000000000 },
    { city: "Ho Chi Minh City", country: "Vietnam", region: "SEA", tam: 6500000000 },
    { city: "Singapore", country: "Singapore", region: "SEA", tam: 15000000000 },
    { city: "Manila", country: "Philippines", region: "SEA", tam: 5000000000 },
    { city: "Sydney", country: "Australia", region: "APAC", tam: 25000000000 },
    { city: "Tokyo", country: "Japan", region: "APAC", tam: 40000000000 },
    { city: "Dubai", country: "UAE", region: "MENA", tam: 18000000000 },
  ];

  const records = markets.map((m) => {
    const isHome = m.country === "Indonesia";
    const baseShare = isHome ? 15 + Math.random() * 40 : 2 + Math.random() * 15;
    const crossBorder = isHome ? 20 + Math.random() * 30 : 5 + Math.random() * 20;
    const captured = m.tam * (baseShare / 100);
    const listingShare = baseShare * (0.8 + Math.random() * 0.4);
    const dealAdv = 10 + Math.random() * 40;
    const phase = baseShare > 40 ? "MONOPOLISTIC" : baseShare > 25 ? "DOMINANT_LIQUIDITY" : baseShare > 10 ? "GROWTH" : "ENTRY";
    const compStatus = baseShare > 35 ? "ACQUISITION_TARGET" : baseShare > 20 ? "NICHE_PLAYER" : "ACTIVE";

    return {
      city: m.city, country: m.country, region: m.region,
      saturation_phase: phase,
      platform_liquidity_share_pct: Math.round(baseShare * 100) / 100,
      cross_border_flow_share_pct: Math.round(crossBorder * 100) / 100,
      competitor_status: compStatus,
      total_addressable_market_usd: m.tam,
      platform_captured_market_usd: Math.round(captured),
      investor_concentration_index: Math.round((baseShare / 100) * 10000) / 100,
      listing_market_share_pct: Math.round(listingShare * 100) / 100,
      deal_velocity_advantage_pct: Math.round(dealAdv * 100) / 100,
      time_to_saturation_months: Math.round(120 - baseShare * 2),
    };
  });

  const { error } = await client.from("gpes_market_saturation").insert(records);
  if (error) throw error;

  return {
    markets_simulated: records.length,
    monopolistic: records.filter((r) => r.saturation_phase === "MONOPOLISTIC").length,
    dominant: records.filter((r) => r.saturation_phase === "DOMINANT_LIQUIDITY").length,
    total_captured_usd: records.reduce((s, r) => s + r.platform_captured_market_usd, 0),
  };
}

// ── Phase 2: Platform Dependency ──

async function simulateDependency(client: ReturnType<typeof sb>) {
  const stakeholders = [
    { type: "INSTITUTIONAL_INVESTOR", driver: "Proprietary deal scoring + predictive analytics pipeline", base: 65, switchUsd: 500000, lock: "Data integration + model calibration investment" },
    { type: "DEVELOPER", driver: "Capital access via institutional investor network + pre-sale intelligence", base: 50, switchUsd: 200000, lock: "Investor relationship network + launch analytics" },
    { type: "SERVICE_VENDOR", driver: "Qualified lead flow + transaction volume dependency", base: 55, switchUsd: 50000, lock: "Revenue concentration + integration costs" },
    { type: "AGENT", driver: "AI-powered deal matching + transaction pipeline automation", base: 60, switchUsd: 30000, lock: "CRM data + client relationship history" },
    { type: "RETAIL_INVESTOR", driver: "Opportunity discovery + portfolio intelligence + DNA matching", base: 45, switchUsd: 5000, lock: "Watchlist history + personalized scoring models" },
    { type: "GOVERNMENT", driver: "Market data reference standard + regulatory compliance layer", base: 30, switchUsd: 2000000, lock: "Policy dependency + urban planning data feeds" },
  ];

  const records = stakeholders.map((s) => {
    const intensity = s.base + Math.random() * 30;
    const altViability = Math.max(5, 100 - intensity);
    const workflowCapture = intensity * (0.6 + Math.random() * 0.3);
    const revenueAtRisk = intensity * 0.8;
    const timeToFull = Math.round(36 - intensity * 0.25);
    const stage = intensity > 80 ? "STRUCTURAL" : intensity > 65 ? "DEPENDENCY" : intensity > 50 ? "HABIT" : intensity > 35 ? "CONVENIENCE" : "AWARENESS";

    return {
      stakeholder_type: s.type,
      dependency_driver: s.driver,
      dependency_intensity: Math.round(intensity * 100) / 100,
      switching_cost_usd: s.switchUsd,
      alternative_viability_score: Math.round(altViability * 100) / 100,
      workflow_capture_pct: Math.round(workflowCapture * 100) / 100,
      revenue_at_risk_if_churn_pct: Math.round(revenueAtRisk * 100) / 100,
      lock_in_mechanism: s.lock,
      dependency_trajectory: intensity > 60 ? "DEEPENING" : "STABLE",
      time_to_full_dependency_months: timeToFull,
      formation_stage: stage,
    };
  });

  const { error } = await client.from("gpes_platform_dependency").insert(records);
  if (error) throw error;

  const structural = records.filter((r) => r.formation_stage === "STRUCTURAL").length;
  return { stakeholders_modeled: records.length, structural_dependencies: structural, avg_intensity: Math.round(records.reduce((s, r) => s + r.dependency_intensity, 0) / records.length) };
}

// ── Phase 3: Terminal Velocity ──

async function simulateTerminalVelocity(client: ReturnType<typeof sb>) {
  const dimensions = [
    { dim: "USER_GROWTH", type: "DIRECT", threshold: 500000, usersAt: 500000, dataAt: 50000000 },
    { dim: "DATA_COMPOUNDING", type: "DATA", threshold: 75, usersAt: 200000, dataAt: 100000000 },
    { dim: "INTELLIGENCE_STANDARD", type: "LEARNING", threshold: 90, usersAt: 100000, dataAt: 50000000 },
    { dim: "LIQUIDITY_DEPTH", type: "INDIRECT", threshold: 60, usersAt: 300000, dataAt: 30000000 },
    { dim: "CROSS_BORDER_FLOW", type: "CROSS_SIDE", threshold: 40, usersAt: 50000, dataAt: 10000000 },
    { dim: "ECOSYSTEM_DENSITY", type: "INDIRECT", threshold: 70, usersAt: 400000, dataAt: 80000000 },
  ];

  const records = dimensions.map((d) => {
    const velocity = 20 + Math.random() * 75;
    const reached = velocity >= d.threshold;
    const accel = reached ? velocity * 0.15 : velocity * 0.05;
    const catchup = 2 + (velocity / 10);
    const dominanceMult = reached ? 1.5 + Math.random() * 1.5 : 1.0 + Math.random() * 0.3;
    const expGrowth = reached ? 1.3 + Math.random() * 0.5 : 1.0 + Math.random() * 0.1;

    return {
      network_dimension: d.dim,
      current_velocity: Math.round(velocity * 100) / 100,
      tipping_point_threshold: d.threshold,
      tipping_point_reached: reached,
      acceleration_rate: Math.round(accel * 100) / 100,
      users_at_tipping_point: d.usersAt,
      data_points_at_tipping_point: d.dataAt,
      competitor_catchup_years: Math.round(catchup * 10) / 10,
      dominance_multiplier: Math.round(dominanceMult * 100) / 100,
      network_effect_type: d.type,
      exponential_growth_factor: Math.round(expGrowth * 100) / 100,
    };
  });

  const { error } = await client.from("gpes_terminal_velocity").insert(records);
  if (error) throw error;

  const tipped = records.filter((r) => r.tipping_point_reached).length;
  return { dimensions_simulated: records.length, tipping_points_reached: tipped, avg_velocity: Math.round(records.reduce((s, r) => s + r.current_velocity, 0) / records.length) };
}

// ── Phase 4: Strategic Optionality ──

async function simulateOptionality(client: ReturnType<typeof sb>) {
  const paths = [
    { path: "FINANCING_INFRA", size: 50000000000, synergy: 85, capital: 10000000, ttm: 18, moat: 4, rev: 50000000 },
    { path: "TOKENIZED_TRADING", size: 15000000000, synergy: 75, capital: 15000000, ttm: 24, moat: 6, rev: 80000000 },
    { path: "URBAN_DEV_INTEL", size: 8000000000, synergy: 90, capital: 5000000, ttm: 12, moat: 5, rev: 30000000 },
    { path: "MACRO_ANALYTICS", size: 3000000000, synergy: 80, capital: 3000000, ttm: 9, moat: 7, rev: 20000000 },
    { path: "INSURANCE_LAYER", size: 20000000000, synergy: 60, capital: 8000000, ttm: 18, moat: 3, rev: 40000000 },
    { path: "CONSTRUCTION_TECH", size: 12000000000, synergy: 55, capital: 20000000, ttm: 30, moat: 4, rev: 60000000 },
    { path: "SMART_CITY_OS", size: 25000000000, synergy: 70, capital: 50000000, ttm: 48, moat: 8, rev: 150000000 },
  ];

  const records = paths.map((p) => {
    const readiness = 20 + Math.random() * 60;
    const optionValue = (p.rev * 5) * (readiness / 100) * (p.synergy / 100);
    const risk = p.capital > 20000000 ? "VERY_HIGH" : p.capital > 10000000 ? "HIGH" : p.capital > 5000000 ? "MEDIUM" : "LOW";
    const timing = readiness > 70 ? "IMMEDIATE" : readiness > 50 ? "POST_IPO" : p.ttm > 36 ? "YEAR_5_PLUS" : "OPPORTUNISTIC";

    return {
      expansion_path: p.path,
      option_value_usd: Math.round(optionValue),
      execution_readiness_pct: Math.round(readiness * 100) / 100,
      market_size_usd: p.size,
      synergy_with_core_pct: p.synergy,
      capital_required_usd: p.capital,
      time_to_market_months: p.ttm,
      competitive_moat_years: p.moat,
      revenue_potential_annual_usd: p.rev,
      risk_level: risk,
      recommended_timing: timing,
      prerequisite_milestones: [
        `Achieve ${Math.round(readiness)}% platform readiness`,
        `Secure ${p.capital > 10000000 ? "institutional" : "seed"} funding for vertical`,
      ],
    };
  });

  const { error } = await client.from("gpes_strategic_optionality").insert(records);
  if (error) throw error;

  const totalOptionValue = records.reduce((s, r) => s + r.option_value_usd, 0);
  return { paths_simulated: records.length, total_option_value_usd: totalOptionValue, immediate_options: records.filter((r) => r.recommended_timing === "IMMEDIATE").length };
}

// ── Phase 5: Endgame State ──

async function defineEndgameState(client: ReturnType<typeof sb>) {
  const roles = [
    { role: "DEAL_DISCOVERY_LAYER", cities: 500, clients: 2000, apis: 5000, throughput: 100000000000 },
    { role: "CAPITAL_ALLOCATION_GRID", cities: 300, clients: 500, apis: 2000, throughput: 50000000000 },
    { role: "ECONOMIC_COORDINATION_SYSTEM", cities: 200, clients: 100, apis: 8000, throughput: 200000000000 },
    { role: "DATA_STANDARD_AUTHORITY", cities: 800, clients: 5000, apis: 15000, throughput: 30000000000 },
    { role: "REGULATORY_INFRASTRUCTURE", cities: 150, clients: 80, apis: 3000, throughput: 10000000000 },
  ];

  const records = roles.map((r) => {
    const penetration = 5 + Math.random() * 25;
    const dataMonopoly = 30 + Math.random() * 60;
    const irreplaceability = (r.cities * 0.03 + r.apis * 0.005 + r.clients * 0.02 + dataMonopoly * 0.5);
    const structuralPower = (irreplaceability * 0.4 + penetration * 0.3 + dataMonopoly * 0.3);
    const probability = Math.min(95, structuralPower * 1.2);
    const timeline = 10 - (probability / 20);

    return {
      endgame_role: r.role,
      positioning_strength: Math.round(structuralPower * 100) / 100,
      global_penetration_pct: Math.round(penetration * 100) / 100,
      annual_platform_throughput_usd: r.throughput,
      cities_controlled: r.cities,
      institutional_clients: r.clients,
      api_consumers: r.apis,
      data_monopoly_score: Math.round(dataMonopoly * 100) / 100,
      irreplaceability_score: Math.round(Math.min(100, irreplaceability) * 100) / 100,
      structural_power_index: Math.round(structuralPower * 100) / 100,
      endgame_probability_pct: Math.round(probability * 100) / 100,
      endgame_timeline_years: Math.round(timeline * 10) / 10,
      risk_factors: [
        "Regulatory fragmentation across jurisdictions",
        "Geopolitical capital flow restrictions",
        "Emergence of blockchain-native competitor",
      ],
    };
  });

  const { error } = await client.from("gpes_endgame_state").insert(records);
  if (error) throw error;

  await client.from("ai_event_signals").insert({
    event_type: "gpes_engine_cycle",
    entity_type: "gpes",
    entity_id: "endgame",
    priority_level: "normal",
    payload: { roles_defined: records.length, avg_power: Math.round(records.reduce((s, r) => s + r.structural_power_index, 0) / records.length) },
  });

  const totalThroughput = records.reduce((s, r) => s + r.annual_platform_throughput_usd, 0);
  return { roles_defined: records.length, total_throughput_usd: totalThroughput, highest_probability: records.sort((a, b) => b.endgame_probability_pct - a.endgame_probability_pct)[0]?.endgame_role };
}

// ── Dashboard ──

async function dashboard(client: ReturnType<typeof sb>) {
  const [sat, dep, tv, opt, eg] = await Promise.all([
    client.from("gpes_market_saturation").select("*").order("platform_liquidity_share_pct", { ascending: false }).limit(15),
    client.from("gpes_platform_dependency").select("*").order("dependency_intensity", { ascending: false }).limit(10),
    client.from("gpes_terminal_velocity").select("*").order("current_velocity", { ascending: false }).limit(10),
    client.from("gpes_strategic_optionality").select("*").order("option_value_usd", { ascending: false }).limit(10),
    client.from("gpes_endgame_state").select("*").order("structural_power_index", { ascending: false }).limit(10),
  ]);

  const satData = sat.data ?? [];
  const depData = dep.data ?? [];
  const tvData = tv.data ?? [];
  const optData = opt.data ?? [];
  const egData = eg.data ?? [];

  return {
    data: {
      summary: {
        markets_tracked: satData.length,
        monopolistic_markets: satData.filter((s: any) => s.saturation_phase === "MONOPOLISTIC").length,
        structural_dependencies: depData.filter((d: any) => d.formation_stage === "STRUCTURAL").length,
        tipping_points_reached: tvData.filter((t: any) => t.tipping_point_reached).length,
        total_option_value: optData.reduce((s: number, o: any) => s + (o.option_value_usd || 0), 0),
        avg_structural_power: egData.length ? Math.round(egData.reduce((s: number, e: any) => s + (e.structural_power_index || 0), 0) / egData.length) : 0,
        total_platform_throughput: egData.reduce((s: number, e: any) => s + (e.annual_platform_throughput_usd || 0), 0),
        most_likely_endgame: egData[0]?.endgame_role || "N/A",
      },
      market_saturation: satData,
      platform_dependency: depData,
      terminal_velocity: tvData,
      strategic_optionality: optData,
      endgame_state: egData,
    },
  };
}

// ── Main ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { mode, params = {} } = await req.json();
    const client = sb();
    switch (mode) {
      case "dashboard": return json(await dashboard(client));
      case "simulate_saturation": return json(await simulateSaturation(client));
      case "simulate_dependency": return json(await simulateDependency(client));
      case "simulate_terminal_velocity": return json(await simulateTerminalVelocity(client));
      case "simulate_optionality": return json(await simulateOptionality(client));
      case "define_endgame": return json(await defineEndgameState(client));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
