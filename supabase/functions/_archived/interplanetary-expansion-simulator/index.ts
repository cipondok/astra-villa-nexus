import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

// ── Frontier zones for simulation ──
const FRONTIER_ZONES = [
  { zone: 'Lunar-Artemis', region: 'Cislunar' },
  { zone: 'Mars-Valles', region: 'Mars' },
  { zone: 'Mars-Olympus', region: 'Mars' },
  { zone: 'Orbital-LEO-1', region: 'Earth-Orbit' },
  { zone: 'Orbital-GEO-2', region: 'Earth-Orbit' },
  { zone: 'Ceres-Prime', region: 'Asteroid-Belt' },
  { zone: 'Titan-Harbor', region: 'Outer-System' },
  { zone: 'Europa-Station', region: 'Outer-System' },
];

const r = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

// ── Mode handlers ──

async function simulateSettlement(sb: ReturnType<typeof serviceClient>) {
  const rows = FRONTIER_ZONES.map(fz => {
    const pop = r(100, 50000);
    const infraReady = r(5, 95);
    const transport = r(0.1, 8);
    const energy = r(0.01, 50);
    const clusters = Math.floor(r(0, 20));
    const diversity = r(10, 90);
    const maturity = (infraReady * 0.3 + diversity * 0.25 + Math.min(pop / 500, 100) * 0.25 + transport * 10 * 0.2);
    const phase = maturity < 20 ? 'pioneering' : maturity < 40 ? 'outpost' : maturity < 60 ? 'colony' : maturity < 80 ? 'city-state' : 'metropolis';
    return {
      frontier_zone: fz.zone, region: fz.region,
      population_wave_index: r(1, 10), migration_momentum: r(-20, 80),
      infrastructure_phase: infraReady < 30 ? 'pre-deployment' : infraReady < 60 ? 'foundation' : infraReady < 80 ? 'expansion' : 'operational',
      infrastructure_readiness_pct: infraReady, transport_node_density: transport,
      energy_capacity_gw: energy, economic_cluster_count: clusters,
      cluster_diversity_score: diversity, settlement_maturity_score: Math.min(100, maturity),
      projected_population_5y: pop * (1 + r(0.1, 0.8)),
      growth_phase: phase,
    };
  });
  const { error } = await sb.from('iees_frontier_settlement').insert(rows);
  if (error) throw error;
  return { zones_simulated: rows.length, phases: [...new Set(rows.map(r => r.growth_phase))] };
}

async function optimizeLogistics(sb: ReturnType<typeof serviceClient>) {
  const rows = FRONTIER_ZONES.map(fz => {
    const resilience = r(10, 90);
    const costIdx = r(50, 500);
    const routes = Math.floor(r(1, 15));
    const efficiency = r(20, 95);
    const capRisk = r(1e6, 5e9);
    const compress = r(-5, 15);
    const selfSuff = r(5, 80);
    const deps = Math.floor(r(0, 10));
    const tier = resilience > 70 ? 'robust' : resilience > 40 ? 'developing' : 'nascent';
    return {
      frontier_zone: fz.zone, supply_chain_resilience_score: resilience,
      logistics_cost_index: costIdx, trade_route_count: routes,
      trade_route_efficiency: efficiency, capital_at_risk_usd: capRisk,
      risk_adjusted_return_pct: r(-5, 25), cost_compression_rate: compress,
      resource_self_sufficiency_pct: selfSuff, critical_dependency_count: deps,
      logistics_tier: tier,
    };
  });
  const { error } = await sb.from('iees_resource_logistics').insert(rows);
  if (error) throw error;
  return { zones_optimized: rows.length };
}

async function forecastEcosystem(sb: ReturnType<typeof serviceClient>) {
  const stages = ['extractive', 'manufacturing', 'service', 'knowledge', 'innovation'];
  const finStages = ['barter', 'commodity-money', 'credit-system', 'digital-finance', 'autonomous-finance'];
  const rows = FRONTIER_ZONES.map(fz => {
    const demand = Math.floor(r(50, 100000));
    const supply = Math.floor(demand * r(0.3, 0.9));
    const gap = ((demand - supply) / Math.max(demand, 1)) * 100;
    const svcCount = Math.floor(r(2, 500));
    const stageIdx = Math.floor(r(0, 5));
    const finIdx = Math.floor(r(0, 5));
    const gdp = r(1e5, 1e11);
    const complexity = r(5, 90);
    const labor = r(10, 85);
    const maturity = (complexity * 0.3 + labor * 0.3 + (stageIdx / 4) * 100 * 0.2 + (finIdx / 4) * 100 * 0.2);
    return {
      frontier_zone: fz.zone, housing_demand_units: demand,
      housing_supply_units: supply, housing_gap_pct: Math.round(gap * 100) / 100,
      service_industry_count: svcCount, industrial_base_stage: stages[stageIdx],
      financial_system_maturity: finStages[finIdx], gdp_equivalent_usd: gdp,
      economic_complexity_index: complexity, labor_market_depth_score: labor,
      ecosystem_maturity_score: Math.min(100, maturity),
      years_to_self_sustaining: r(5, 100),
    };
  });
  const { error } = await sb.from('iees_ecosystem_formation').insert(rows);
  if (error) throw error;
  return { zones_forecast: rows.length };
}

async function runScenarios(sb: ReturnType<typeof serviceClient>) {
  const govModels = ['corporate_charter', 'democratic_council', 'technocratic', 'federated'];
  const fundStructs = ['venture_backed', 'sovereign_fund', 'public_private', 'crypto_dao'];
  const sustainability = ['minimal', 'moderate', 'strict', 'regenerative'];
  const rows: Record<string, unknown>[] = [];

  for (const fz of FRONTIER_ZONES.slice(0, 4)) {
    for (let i = 0; i < 3; i++) {
      const gov = govModels[Math.floor(r(0, 4))];
      const fund = fundStructs[Math.floor(r(0, 4))];
      const sust = sustainability[Math.floor(r(0, 4))];
      const tech = Math.random() > 0.5;
      const horizon = Math.floor(r(10, 100));
      const pop = r(1000, 5e6);
      const gdp = pop * r(5000, 80000);
      const infra = gdp * r(0.05, 0.3);
      const roi = r(-10, 35);
      const risk = r(20, 90);
      const success = Math.max(5, Math.min(95, 100 - risk * 0.5 + (tech ? 15 : 0) + roi * 0.3));
      const outcome = success > 70 ? 'thriving' : success > 45 ? 'sustainable' : success > 25 ? 'struggling' : 'failed';
      rows.push({
        scenario_name: `${fz.zone}-${gov}-${i + 1}`, frontier_zone: fz.zone,
        governance_model: gov, funding_structure: fund,
        sustainability_constraint: sust, tech_breakthrough_assumed: tech,
        time_horizon_years: horizon, projected_population: pop,
        projected_gdp_usd: gdp, infrastructure_investment_usd: infra,
        roi_estimate_pct: roi, risk_score: risk,
        success_probability_pct: Math.round(success * 100) / 100,
        scenario_outcome: outcome,
      });
    }
  }
  const { error } = await sb.from('iees_scenario_simulation').insert(rows);
  if (error) throw error;
  return { scenarios_generated: rows.length };
}

async function generateDecisionSupport(sb: ReturnType<typeof serviceClient>) {
  // Pull latest settlement + logistics data
  const { data: settlements } = await sb.from('iees_frontier_settlement')
    .select('frontier_zone,settlement_maturity_score,growth_phase')
    .order('computed_at', { ascending: false }).limit(FRONTIER_ZONES.length);
  const { data: logistics } = await sb.from('iees_resource_logistics')
    .select('frontier_zone,supply_chain_resilience_score,risk_adjusted_return_pct')
    .order('computed_at', { ascending: false }).limit(FRONTIER_ZONES.length);
  const { data: ecosystems } = await sb.from('iees_ecosystem_formation')
    .select('frontier_zone,ecosystem_maturity_score,years_to_self_sustaining')
    .order('computed_at', { ascending: false }).limit(FRONTIER_ZONES.length);

  const sMap = Object.fromEntries((settlements ?? []).map(s => [s.frontier_zone, s]));
  const lMap = Object.fromEntries((logistics ?? []).map(l => [l.frontier_zone, l]));
  const eMap = Object.fromEntries((ecosystems ?? []).map(e => [e.frontier_zone, e]));

  const rows = FRONTIER_ZONES.map(fz => {
    const s = sMap[fz.zone]; const l = lMap[fz.zone]; const e = eMap[fz.zone];
    const opp = ((s?.settlement_maturity_score ?? 30) * 0.3 + (l?.risk_adjusted_return_pct ?? 5) * 2 * 0.3 + (e?.ecosystem_maturity_score ?? 20) * 0.4);
    const risk = (100 - (l?.supply_chain_resilience_score ?? 50)) * 0.5 + (e?.years_to_self_sustaining ?? 50) * 0.5;
    const oppClamped = Math.min(100, Math.max(0, opp));
    const riskClamped = Math.min(100, Math.max(0, risk));
    const confidence = Math.min(100, oppClamped * 0.4 + (100 - riskClamped) * 0.3 + (s?.settlement_maturity_score ?? 20) * 0.3);
    const readiness = oppClamped > 70 ? 'investable' : oppClamped > 45 ? 'emerging' : oppClamped > 25 ? 'exploratory' : 'speculative';
    const urgency = oppClamped > 70 && riskClamped < 40 ? 'immediate' : oppClamped > 50 ? 'near_term' : 'monitor';
    const drivers: string[] = [];
    if (s?.settlement_maturity_score && s.settlement_maturity_score > 50) drivers.push('mature_settlement');
    if (l?.supply_chain_resilience_score && l.supply_chain_resilience_score > 60) drivers.push('resilient_logistics');
    if (e?.ecosystem_maturity_score && e.ecosystem_maturity_score > 50) drivers.push('developed_economy');
    return {
      frontier_zone: fz.zone, opportunity_score: Math.round(oppClamped * 100) / 100,
      risk_overlay_score: Math.round(riskClamped * 100) / 100,
      investment_readiness: readiness, recommended_allocation_pct: r(0.5, 15),
      time_to_breakeven_years: r(5, 50), confidence_score: Math.round(confidence * 100) / 100,
      key_drivers: drivers, strategic_recommendation: `${readiness} frontier with ${urgency} timeline`,
      urgency_rating: urgency, signal_count: Math.floor(r(1, 20)),
    };
  });
  const { error } = await sb.from('iees_decision_support').insert(rows);
  if (error) throw error;
  return { decisions_generated: rows.length };
}

async function dashboard(sb: ReturnType<typeof serviceClient>) {
  const [settlements, logistics, ecosystems, scenarios, decisions] = await Promise.all([
    sb.from('iees_frontier_settlement').select('*').order('computed_at', { ascending: false }).limit(16),
    sb.from('iees_resource_logistics').select('*').order('computed_at', { ascending: false }).limit(16),
    sb.from('iees_ecosystem_formation').select('*').order('computed_at', { ascending: false }).limit(16),
    sb.from('iees_scenario_simulation').select('*').order('computed_at', { ascending: false }).limit(24),
    sb.from('iees_decision_support').select('*').order('computed_at', { ascending: false }).limit(16),
  ]);

  const settleData = settlements.data ?? [];
  const avgMaturity = settleData.length ? settleData.reduce((a, s) => a + (s.settlement_maturity_score ?? 0), 0) / settleData.length : 0;

  return {
    data: {
      summary: {
        frontier_zones: FRONTIER_ZONES.length,
        avg_settlement_maturity: Math.round(avgMaturity * 100) / 100,
        scenarios_run: (scenarios.data ?? []).length,
        investable_zones: (decisions.data ?? []).filter((d: any) => d.investment_readiness === 'investable').length,
      },
      settlements: settleData,
      logistics: logistics.data ?? [],
      ecosystems: ecosystems.data ?? [],
      scenarios: scenarios.data ?? [],
      decisions: decisions.data ?? [],
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { mode, params } = await req.json();
    const sb = serviceClient();
    let result: unknown;

    switch (mode) {
      case 'simulate_settlement': result = await simulateSettlement(sb); break;
      case 'optimize_logistics': result = await optimizeLogistics(sb); break;
      case 'forecast_ecosystem': result = await forecastEcosystem(sb); break;
      case 'run_scenarios': result = await runScenarios(sb); break;
      case 'generate_decisions': result = await generateDecisionSupport(sb); break;
      case 'dashboard': result = await dashboard(sb); break;
      default: throw new Error(`Unknown mode: ${mode}`);
    }

    // Emit engine cycle signal
    if (mode !== 'dashboard') {
      await sb.from('ai_event_signals').insert({
        event_type: 'iees_engine_cycle', entity_type: 'iees',
        priority_level: 'low', payload: { mode, result },
      });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
