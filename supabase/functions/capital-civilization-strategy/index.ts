import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  mode: string;
  params?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode, params = {} }: RequestBody = await req.json();

    switch (mode) {
      case 'dashboard': return respond(await getDashboard(supabase));
      case 'simulate_macrocycles': return respond(await simulateMacrocycles(supabase, params));
      case 'map_capital_gravity': return respond(await mapCapitalGravity(supabase, params));
      case 'assess_stability': return respond(await assessStability(supabase, params));
      case 'sync_innovation_waves': return respond(await syncInnovationWaves(supabase, params));
      case 'position_strategy': return respond(await positionStrategy(supabase, params));
      default: return respond({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
});

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getDashboard(sb: any) {
  const [macrocycles, gravity, stability, waves, positioning] = await Promise.all([
    sb.from('fycs_urban_macrocycle').select('*').order('decade_horizon').limit(30),
    sb.from('fycs_capital_gravity').select('*').order('gravity_pull_index', { ascending: false }).limit(20),
    sb.from('fycs_economic_stability').select('*').order('stability_composite_score', { ascending: false }).limit(20),
    sb.from('fycs_innovation_waves').select('*').order('synchronization_score', { ascending: false }).limit(15),
    sb.from('fycs_strategic_positioning').select('*').order('relevance_score', { ascending: false }).limit(15),
  ]);

  const mc = macrocycles.data || [];
  const grav = gravity.data || [];
  const stab = stability.data || [];

  return {
    data: {
      summary: {
        cities_modeled: new Set(mc.map((r: any) => r.city)).size,
        megacity_candidates: mc.filter((r: any) => r.megacity_probability >= 0.7).length,
        avg_gravity_index: grav.length ? +(grav.reduce((s: number, r: any) => s + (r.gravity_pull_index || 0), 0) / grav.length).toFixed(2) : 0,
        avg_stability: stab.length ? +(stab.reduce((s: number, r: any) => s + (r.stability_composite_score || 0), 0) / stab.length).toFixed(2) : 0,
        innovation_waves_tracked: (waves.data || []).length,
        strategic_domains: (positioning.data || []).length,
      },
      macrocycles: mc,
      gravity: grav,
      stability: stab,
      waves: waves.data || [],
      positioning: positioning.data || [],
    },
  };
}

async function simulateMacrocycles(sb: any, params: Record<string, unknown>) {
  const cities = [
    { city: 'Jakarta', country: 'ID', pop: 35, urbanRate: 4.2 },
    { city: 'Surabaya', country: 'ID', pop: 12, urbanRate: 3.8 },
    { city: 'Bandung', country: 'ID', pop: 9, urbanRate: 3.5 },
    { city: 'Bali', country: 'ID', pop: 4.5, urbanRate: 5.1 },
    { city: 'Medan', country: 'ID', pop: 7, urbanRate: 2.9 },
    { city: 'Makassar', country: 'ID', pop: 5, urbanRate: 4.0 },
    { city: 'Ho Chi Minh City', country: 'VN', pop: 15, urbanRate: 4.8 },
    { city: 'Bangkok', country: 'TH', pop: 18, urbanRate: 2.1 },
    { city: 'Manila', country: 'PH', pop: 28, urbanRate: 3.6 },
    { city: 'Kuala Lumpur', country: 'MY', pop: 10, urbanRate: 2.5 },
  ];

  const decades = [1, 2, 3, 4, 5]; // 10y to 50y
  const rows: any[] = [];

  for (const c of cities) {
    for (const d of decades) {
      const projectedPop = c.pop * Math.pow(1 + c.urbanRate / 100, d * 10);
      const megaProb = Math.min(1, projectedPop > 10 ? 0.5 + (projectedPop - 10) * 0.02 : projectedPop / 25);
      const infraWave = d <= 1 ? 'pre_investment' : d <= 2 ? 'early_build' : d <= 3 ? 'acceleration' : d <= 4 ? 'maturation' : 'renewal';
      const infraUsd = c.pop * 1e9 * d * (0.5 + Math.random() * 0.5);
      const migrationNet = c.urbanRate * 1e4 * d * (0.8 + Math.random() * 0.4);
      const climateScore = 30 + Math.random() * 50 + d * 5;
      const smartCity = 10 + d * 15 + Math.random() * 10;
      const phase = megaProb >= 0.85 ? 'megacity_formation' : megaProb >= 0.6 ? 'rapid_expansion' : megaProb >= 0.3 ? 'growth' : 'emergence';

      rows.push({
        city: c.city,
        country: c.country,
        decade_horizon: d,
        megacity_probability: +megaProb.toFixed(3),
        urbanization_rate: +(c.urbanRate + d * 0.2).toFixed(2),
        infrastructure_wave_phase: infraWave,
        infrastructure_investment_usd: +infraUsd.toFixed(0),
        demographic_migration_net: +migrationNet.toFixed(0),
        population_projection_m: +projectedPop.toFixed(2),
        density_trajectory: d >= 4 ? 'stabilizing' : 'expanding',
        climate_resilience_score: +Math.min(95, climateScore).toFixed(1),
        smart_city_readiness: +Math.min(95, smartCity).toFixed(1),
        macrocycle_phase: phase,
        macrocycle_confidence: +(60 + Math.random() * 30).toFixed(1),
      });
    }
  }

  const { error } = await sb.from('fycs_urban_macrocycle').insert(rows);
  if (error) throw error;

  await sb.from('ai_event_signals').insert({
    event_type: 'fycs_engine_cycle',
    entity_type: 'fycs_urban_macrocycle',
    priority_level: 'medium',
    payload: { cities_simulated: cities.length, decades: 5, total_projections: rows.length },
  });

  return { cities_simulated: cities.length, decades_projected: 5, total_rows: rows.length };
}

async function mapCapitalGravity(sb: any, params: Record<string, unknown>) {
  const cities = ['Jakarta', 'Surabaya', 'Bali', 'Ho Chi Minh City', 'Bangkok', 'Manila', 'Kuala Lumpur', 'Singapore'];
  const decades = [1, 2, 3, 4, 5];
  const rows: any[] = [];

  for (const city of cities) {
    for (const d of decades) {
      const liquidity = 20 + d * 12 + Math.random() * 15;
      const instCapital = (1e9 + Math.random() * 5e9) * d;
      const transparency = 30 + d * 10 + Math.random() * 15;
      const techDepth = 15 + d * 14 + Math.random() * 10;
      const gravity = (liquidity * 0.3 + transparency * 0.25 + techDepth * 0.25 + Math.log10(instCapital) * 2);
      const tier = gravity >= 70 ? 'dominant' : gravity >= 50 ? 'major' : gravity >= 30 ? 'growing' : 'emerging';

      rows.push({
        city,
        cluster_type: d >= 4 ? 'established_hub' : d >= 2 ? 'growth_center' : 'emerging',
        liquidity_concentration: +Math.min(95, liquidity).toFixed(1),
        institutional_capital_usd: +instCapital.toFixed(0),
        data_transparency_score: +Math.min(95, transparency).toFixed(1),
        technology_ecosystem_depth: +Math.min(95, techDepth).toFixed(1),
        gravity_pull_index: +Math.min(100, gravity).toFixed(2),
        gravity_tier: tier,
        capital_velocity: +(5 + d * 3 + Math.random() * 8).toFixed(2),
        competing_clusters: Math.max(1, 8 - d),
        decade_horizon: d,
        trajectory: d >= 3 ? 'dominant' : 'accelerating',
      });
    }
  }

  const { error } = await sb.from('fycs_capital_gravity').insert(rows);
  if (error) throw error;

  return { clusters_mapped: cities.length, decades: 5, total_projections: rows.length };
}

async function assessStability(sb: any, params: Record<string, unknown>) {
  const cities = ['Jakarta', 'Surabaya', 'Bali', 'Bandung', 'Ho Chi Minh City', 'Bangkok'];
  const decades = [1, 2, 3, 4, 5];
  const rows: any[] = [];

  for (const city of cities) {
    for (const d of decades) {
      const inefficiency = 10 + d * 12 + Math.random() * 15;
      const supply = 15 + d * 10 + Math.random() * 20;
      const discipline = 20 + d * 11 + Math.random() * 12;
      const priceDisc = 25 + d * 9 + Math.random() * 15;
      const volatility = 10 + d * 8 + Math.random() * 10;
      const composite = (inefficiency * 0.25 + supply * 0.2 + discipline * 0.2 + priceDisc * 0.2 + volatility * 0.15);
      const tier = composite >= 70 ? 'highly_stable' : composite >= 50 ? 'stable' : composite >= 30 ? 'moderate' : 'developing';

      rows.push({
        city,
        market_inefficiency_reduction: +Math.min(95, inefficiency).toFixed(1),
        housing_supply_resilience: +Math.min(95, supply).toFixed(1),
        asset_allocation_discipline: +Math.min(95, discipline).toFixed(1),
        price_discovery_accuracy: +Math.min(95, priceDisc).toFixed(1),
        volatility_dampening: +Math.min(95, volatility).toFixed(1),
        systemic_risk_contribution: +(5 + Math.random() * 15).toFixed(1),
        stability_composite_score: +Math.min(95, composite).toFixed(2),
        stability_tier: tier,
        platform_contribution_pct: +(10 + d * 8 + Math.random() * 10).toFixed(1),
        decade_horizon: d,
      });
    }
  }

  const { error } = await sb.from('fycs_economic_stability').insert(rows);
  if (error) throw error;

  return { cities_assessed: cities.length, decades: 5, total_assessments: rows.length };
}

async function syncInnovationWaves(sb: any, params: Record<string, unknown>) {
  const waves = [
    { name: 'AI-Powered Property Intelligence', type: 'technology' },
    { name: 'Climate Resilience Infrastructure', type: 'climate' },
    { name: 'Smart City Digitization', type: 'urban_tech' },
    { name: 'Blockchain Property Registries', type: 'technology' },
    { name: 'Autonomous Urban Planning', type: 'urban_tech' },
    { name: 'Quantum Computing Valuations', type: 'technology' },
    { name: 'Space-Based Sensing Analytics', type: 'technology' },
    { name: 'Neural Interface Property Tours', type: 'future_tech' },
  ];

  const decades = [1, 2, 3, 4, 5];
  const rows: any[] = [];

  for (const w of waves) {
    for (const d of decades) {
      const adoption = Math.min(95, 5 + d * 18 + Math.random() * 10);
      const phase = adoption >= 80 ? 'mature' : adoption >= 50 ? 'mainstream' : adoption >= 25 ? 'early_majority' : adoption >= 10 ? 'early_adoption' : 'innovation';
      const rePhase = d <= 1 ? 'expansion' : d <= 2 ? 'peak' : d <= 3 ? 'correction' : d <= 4 ? 'recovery' : 'expansion';
      const sync = 30 + Math.random() * 40 + (phase === rePhase ? 20 : 0);
      const positioning = adoption >= 60 ? 'leader' : adoption >= 30 ? 'fast_follower' : 'observer';

      rows.push({
        wave_name: w.name,
        wave_type: w.type,
        current_phase: phase,
        adoption_pct: +adoption.toFixed(1),
        real_estate_cycle_phase: rePhase,
        synchronization_score: +Math.min(95, sync).toFixed(2),
        platform_positioning: positioning,
        opportunity_window_years: Math.max(1, 10 - d * 2),
        disruption_intensity: +(20 + d * 12 + Math.random() * 15).toFixed(1),
        market_impact_multiplier: +(1 + d * 0.4 + Math.random() * 0.5).toFixed(2),
        decade_horizon: d,
      });
    }
  }

  const { error } = await sb.from('fycs_innovation_waves').insert(rows);
  if (error) throw error;

  return { waves_synced: waves.length, decades: 5, total_projections: rows.length };
}

async function positionStrategy(sb: any, params: Record<string, unknown>) {
  const domains = [
    'Intelligence Platform', 'Transaction Infrastructure', 'Capital Coordination',
    'Urban Planning OS', 'Institutional Gateway', 'Data Monetization',
  ];

  const scenarios = ['base_case', 'aggressive_growth', 'conservative'];
  const decades = [1, 2, 3, 4, 5];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const scenario of scenarios) {
      for (const d of decades) {
        const scenarioMult = scenario === 'aggressive_growth' ? 1.3 : scenario === 'conservative' ? 0.7 : 1.0;
        const reinvention = Math.min(95, (20 + d * 14 + Math.random() * 10) * scenarioMult);
        const geoDiversity = Math.min(95, (15 + d * 13 + Math.random() * 12) * scenarioMult);
        const monetization = Math.min(95, (25 + d * 11 + Math.random() * 8) * scenarioMult);
        const relevance = (reinvention * 0.3 + geoDiversity * 0.25 + monetization * 0.25 + (d * 5));
        const moat = Math.min(95, 15 + d * 15 + Math.random() * 10);
        const brand = Math.min(95, 10 + d * 16 + Math.random() * 8);
        const lockIn = Math.min(95, 12 + d * 14 + Math.random() * 10);
        const resilience = (relevance * 0.3 + moat * 0.25 + brand * 0.2 + lockIn * 0.25);
        const tier = resilience >= 70 ? 'dominant' : resilience >= 50 ? 'strong' : resilience >= 30 ? 'competitive' : 'developing';

        rows.push({
          strategy_domain: domain,
          capability_reinvention_score: +reinvention.toFixed(1),
          geographic_diversification_index: +geoDiversity.toFixed(1),
          monetization_adaptability: +monetization.toFixed(1),
          relevance_score: +Math.min(100, relevance).toFixed(2),
          competitive_moat_depth: +moat.toFixed(1),
          brand_permanence_index: +brand.toFixed(1),
          ecosystem_lock_in: +lockIn.toFixed(1),
          strategic_resilience: +Math.min(100, resilience).toFixed(2),
          decade_horizon: d,
          risk_scenario: scenario,
          positioning_tier: tier,
        });
      }
    }
  }

  const { error } = await sb.from('fycs_strategic_positioning').insert(rows);
  if (error) throw error;

  return { domains_positioned: domains.length, scenarios: scenarios.length, decades: 5, total_projections: rows.length };
}
