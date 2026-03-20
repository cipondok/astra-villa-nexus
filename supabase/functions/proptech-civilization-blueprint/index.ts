import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { mode, params = {} } = await req.json();

    const handlers: Record<string, () => Promise<unknown>> = {
      dashboard: () => getDashboard(sb),
      simulate_urban_transformation: () => simulateUrbanTransformation(sb, params),
      evolve_liquidity: () => evolveLiquidity(sb, params),
      model_infrastructure_intelligence: () => modelInfrastructureIntelligence(sb, params),
      assess_housing_stability: () => assessHousingStability(sb, params),
      project_platform_relevance: () => projectPlatformRelevance(sb, params),
    };

    const handler = handlers[mode];
    if (!handler) return respond({ error: `Unknown mode: ${mode}` }, 400);
    return respond(await handler());
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
});

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function getDashboard(sb: any) {
  const [urban, liquidity, infra, stability, relevance] = await Promise.all([
    sb.from('hycb_urban_transformation').select('*').order('horizon_year_end').limit(30),
    sb.from('hycb_liquidity_evolution').select('*').order('year_horizon').limit(25),
    sb.from('hycb_infrastructure_intelligence').select('*').order('infrastructure_composite', { ascending: false }).limit(20),
    sb.from('hycb_housing_stability').select('*').order('stability_composite', { ascending: false }).limit(20),
    sb.from('hycb_platform_relevance').select('*').order('relevance_composite', { ascending: false }).limit(20),
  ]);

  const u = urban.data || [];
  const l = liquidity.data || [];
  const s = stability.data || [];

  return {
    data: {
      summary: {
        cities_modeled: new Set(u.map((r: any) => r.city)).size,
        autonomous_cities: u.filter((r: any) => r.transformation_phase === 'autonomous_ecosystem').length,
        avg_liquidity_depth: l.length ? +(l.reduce((a: number, r: any) => a + (r.liquidity_depth_score || 0), 0) / l.length).toFixed(1) : 0,
        avg_stability: s.length ? +(s.reduce((a: number, r: any) => a + (r.stability_composite || 0), 0) / s.length).toFixed(1) : 0,
        infra_domains: (infra.data || []).length,
        adaptation_domains: (relevance.data || []).length,
      },
      urban: u,
      liquidity: l,
      infrastructure: infra.data || [],
      stability: s,
      relevance: relevance.data || [],
    },
  };
}

async function simulateUrbanTransformation(sb: any, _p: Record<string, unknown>) {
  const cities = [
    { city: 'Jakarta', country: 'ID', pop: 35 }, { city: 'Surabaya', country: 'ID', pop: 12 },
    { city: 'Bali', country: 'ID', pop: 4.5 }, { city: 'Bandung', country: 'ID', pop: 9 },
    { city: 'Ho Chi Minh City', country: 'VN', pop: 15 }, { city: 'Bangkok', country: 'TH', pop: 18 },
    { city: 'Manila', country: 'PH', pop: 28 }, { city: 'Kuala Lumpur', country: 'MY', pop: 10 },
    { city: 'Singapore', country: 'SG', pop: 6 }, { city: 'Dubai', country: 'AE', pop: 5 },
  ];

  const horizons = [
    { label: 'near', start: 0, end: 20 },
    { label: 'mid', start: 20, end: 50 },
    { label: 'far', start: 50, end: 100 },
  ];
  const rows: any[] = [];

  for (const c of cities) {
    for (const h of horizons) {
      const hIdx = horizons.indexOf(h);
      const digital = Math.min(98, 20 + hIdx * 30 + Math.random() * 15);
      const intelligent = Math.min(95, 5 + hIdx * 35 + Math.random() * 12);
      const autonomous = Math.min(95, hIdx * 40 + Math.random() * 15);
      const popGrowth = c.pop * Math.pow(1.02, h.end);
      const climate = Math.min(95, 15 + hIdx * 25 + Math.random() * 15);
      const phase = hIdx === 2 ? 'autonomous_ecosystem' : hIdx === 1 ? 'intelligent_coordination' : 'digitization';
      const conf = 85 - hIdx * 20 + Math.random() * 10;

      rows.push({
        city: c.city, country: c.country,
        time_horizon: h.label, horizon_year_start: h.start, horizon_year_end: h.end,
        digital_infrastructure_pct: +digital.toFixed(1),
        intelligent_coordination_score: +intelligent.toFixed(1),
        autonomous_optimization_score: +autonomous.toFixed(1),
        population_projection_m: +popGrowth.toFixed(2),
        urban_density_trajectory: hIdx >= 2 ? 'optimized' : hIdx >= 1 ? 'stabilizing' : 'expanding',
        climate_adaptation_readiness: +climate.toFixed(1),
        transformation_phase: phase,
        transformation_confidence: +Math.max(30, conf).toFixed(1),
      });
    }
  }

  const { error } = await sb.from('hycb_urban_transformation').insert(rows);
  if (error) throw error;

  await sb.from('ai_event_signals').insert({
    event_type: 'hycb_engine_cycle', entity_type: 'hycb_urban_transformation',
    priority_level: 'medium', payload: { cities: cities.length, horizons: 3, total: rows.length },
  });

  return { cities_simulated: cities.length, horizons: 3, total: rows.length };
}

async function evolveLiquidity(sb: any, _p: Record<string, unknown>) {
  const clusters = ['ASEAN Core', 'Greater China', 'South Asia', 'Middle East', 'Sub-Saharan Africa', 'Latin America', 'Europe', 'North America'];
  const eras = [
    { label: 'current', year: 0 }, { label: 'digital_native', year: 20 },
    { label: 'tokenized', year: 40 }, { label: 'frictionless', year: 60 },
    { label: 'autonomous', year: 80 }, { label: 'post_scarcity', year: 100 },
  ];
  const rows: any[] = [];

  for (const cluster of clusters) {
    for (const era of eras) {
      const eIdx = eras.indexOf(era);
      const transparency = Math.min(98, 15 + eIdx * 15 + Math.random() * 8);
      const friction = Math.max(2, 95 - eIdx * 16 - Math.random() * 8);
      const dynamicPricing = Math.min(98, 5 + eIdx * 17 + Math.random() * 8);
      const tokenization = Math.min(95, eIdx * 18 + Math.random() * 8);
      const settlement = Math.max(0.5, 720 - eIdx * 140 - Math.random() * 20);
      const depth = Math.min(98, 10 + eIdx * 16 + Math.random() * 8);
      const institutional = Math.min(90, 5 + eIdx * 14 + Math.random() * 8);
      const retail = Math.min(95, 8 + eIdx * 16 + Math.random() * 8);
      const tier = depth >= 80 ? 'frictionless' : depth >= 60 ? 'liquid' : depth >= 40 ? 'emerging_liquid' : depth >= 20 ? 'semi_transparent' : 'opaque';

      rows.push({
        market_cluster: cluster, era: era.label,
        transparency_index: +transparency.toFixed(1), cross_border_friction: +friction.toFixed(1),
        dynamic_pricing_adoption: +dynamicPricing.toFixed(1), tokenization_penetration: +tokenization.toFixed(1),
        settlement_speed_hours: +settlement.toFixed(1), liquidity_depth_score: +depth.toFixed(1),
        institutional_participation_pct: +institutional.toFixed(1), retail_access_score: +retail.toFixed(1),
        liquidity_evolution_tier: tier, year_horizon: era.year,
      });
    }
  }

  const { error } = await sb.from('hycb_liquidity_evolution').insert(rows);
  if (error) throw error;

  return { clusters_evolved: clusters.length, eras: eras.length, total: rows.length };
}

async function modelInfrastructureIntelligence(sb: any, _p: Record<string, unknown>) {
  const domains = [
    'Urban Planning Decision Systems', 'Climate-Resilient Development',
    'Smart Mobility Coordination', 'Energy Grid Optimization',
    'Water & Waste Intelligence', 'Public Safety Analytics',
  ];
  const years = [10, 25, 50, 75, 100];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const y of years) {
      const yIdx = years.indexOf(y);
      const planning = Math.min(95, 10 + yIdx * 18 + Math.random() * 10);
      const climate = Math.min(95, 8 + yIdx * 17 + Math.random() * 12);
      const mobility = Math.min(95, 5 + yIdx * 19 + Math.random() * 8);
      const energy = Math.min(95, 7 + yIdx * 16 + Math.random() * 12);
      const coverage = Math.min(98, 12 + yIdx * 18 + Math.random() * 8);
      const influence = Math.min(95, 8 + yIdx * 17 + Math.random() * 10);
      const composite = planning * 0.25 + climate * 0.2 + mobility * 0.2 + energy * 0.15 + influence * 0.2;
      const tier = composite >= 75 ? 'autonomous' : composite >= 55 ? 'embedded' : composite >= 35 ? 'integrated' : 'advisory';

      rows.push({
        intelligence_domain: domain,
        urban_planning_integration: +planning.toFixed(1),
        climate_resilience_contribution: +climate.toFixed(1),
        mobility_grid_coordination: +mobility.toFixed(1),
        energy_optimization_score: +energy.toFixed(1),
        data_coverage_pct: +coverage.toFixed(1),
        decision_influence_index: +influence.toFixed(1),
        infrastructure_composite: +Math.min(95, composite).toFixed(2),
        integration_tier: tier,
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('hycb_infrastructure_intelligence').insert(rows);
  if (error) throw error;

  return { domains_modeled: domains.length, horizons: years.length, total: rows.length };
}

async function assessHousingStability(sb: any, _p: Record<string, unknown>) {
  const cities = ['Jakarta', 'Surabaya', 'Bali', 'Bangkok', 'Ho Chi Minh City', 'Manila', 'Dubai', 'Singapore'];
  const years = [10, 25, 50, 75, 100];
  const rows: any[] = [];

  for (const city of cities) {
    for (const y of years) {
      const yIdx = years.indexOf(y);
      const dampening = Math.min(95, 10 + yIdx * 17 + Math.random() * 10);
      const supply = Math.min(95, 12 + yIdx * 16 + Math.random() * 10);
      const afford = Math.min(95, 8 + yIdx * 15 + Math.random() * 12);
      const spec = Math.max(5, 80 - yIdx * 15 - Math.random() * 8);
      const vol = Math.min(95, 10 + yIdx * 16 + Math.random() * 10);
      const inst = Math.min(80, 5 + yIdx * 14 + Math.random() * 8);
      const platf = Math.min(60, 3 + yIdx * 10 + Math.random() * 5);
      const composite = dampening * 0.2 + supply * 0.2 + afford * 0.25 + vol * 0.15 + (100 - spec) * 0.2;
      const tier = composite >= 75 ? 'deeply_stable' : composite >= 55 ? 'stable' : composite >= 35 ? 'improving' : 'volatile';

      rows.push({
        city, boom_bust_dampening: +dampening.toFixed(1), supply_equilibrium_score: +supply.toFixed(1),
        affordability_sustainability: +afford.toFixed(1), speculative_pressure_index: +spec.toFixed(1),
        price_volatility_reduction: +vol.toFixed(1), institutional_stabilizer_pct: +inst.toFixed(1),
        platform_stabilization_contribution: +platf.toFixed(1),
        stability_composite: +Math.min(95, composite).toFixed(2), stability_tier: tier, year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('hycb_housing_stability').insert(rows);
  if (error) throw error;

  return { cities_assessed: cities.length, horizons: years.length, total: rows.length };
}

async function projectPlatformRelevance(sb: any, _p: Record<string, unknown>) {
  const domains = [
    'Intelligence Platform', 'Transaction Infrastructure', 'Capital Coordination',
    'Urban Planning OS', 'Climate Resilience', 'Social Housing',
  ];
  const generations = [
    { label: 'Gen Alpha', year: 20 }, { label: 'Gen Beta', year: 40 },
    { label: 'Gen Gamma', year: 60 }, { label: 'Gen Delta', year: 80 },
    { label: 'Gen Epsilon', year: 100 },
  ];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const gen of generations) {
      const gIdx = generations.indexOf(gen);
      const tech = Math.min(95, 20 + gIdx * 15 + Math.random() * 12);
      const reg = Math.min(95, 15 + gIdx * 16 + Math.random() * 10);
      const demo = Math.min(95, 18 + gIdx * 14 + Math.random() * 10);
      const cultural = Math.min(95, 12 + gIdx * 17 + Math.random() * 10);
      const cycles = 1 + gIdx * 2 + Math.floor(Math.random() * 2);
      const moat = Math.min(95, 15 + gIdx * 16 + Math.random() * 8);
      const indis = Math.min(95, 10 + gIdx * 17 + Math.random() * 10);
      const composite = tech * 0.2 + reg * 0.15 + demo * 0.15 + cultural * 0.15 + moat * 0.15 + indis * 0.2;
      const tier = composite >= 75 ? 'civilizational' : composite >= 55 ? 'institutional' : composite >= 35 ? 'industry_standard' : 'current';

      rows.push({
        adaptation_domain: domain, technology_paradigm_readiness: +tech.toFixed(1),
        regulatory_adaptability: +reg.toFixed(1), demographic_responsiveness: +demo.toFixed(1),
        cultural_evolution_alignment: +cultural.toFixed(1), capability_reinvention_cycles: cycles,
        competitive_moat_durability: +moat.toFixed(1), ecosystem_indispensability: +indis.toFixed(1),
        relevance_composite: +Math.min(95, composite).toFixed(2), relevance_tier: tier,
        generation_label: gen.label, year_horizon: gen.year,
      });
    }
  }

  const { error } = await sb.from('hycb_platform_relevance').insert(rows);
  if (error) throw error;

  return { domains_projected: domains.length, generations: generations.length, total: rows.length };
}
