import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode, params } = await req.json();

    switch (mode) {
      case 'analyze_drivers': return respond(await analyzeDrivers(supabase, params));
      case 'simulate_growth': return respond(await simulateGrowth(supabase, params));
      case 'measure_continuity': return respond(await measureContinuity(supabase, params));
      case 'assess_resilience': return respond(await assessResilience(supabase, params));
      case 'synthesize_decisions': return respond(await synthesizeDecisions(supabase, params));
      case 'dashboard': return respond(await buildDashboard(supabase));
      default: return respond({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
});

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

const REGIONS = ['North America', 'Europe', 'East Asia', 'South Asia', 'Southeast Asia', 'Middle East', 'Sub-Saharan Africa', 'Latin America', 'Oceania', 'Central Asia', 'North Africa'];

async function analyzeDrivers(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const demo = 20 + Math.random() * 80;
    const tech = 1 + Math.random() * 5;
    const urban = 25 + Math.random() * 75;
    const infra = 20 + Math.random() * 80;
    const human = 25 + Math.random() * 75;
    const innov = 15 + Math.random() * 85;
    const composite = demo * 0.2 + Math.min(tech * 20, 100) * 0.2 + urban * 0.15 + infra * 0.15 + human * 0.15 + innov * 0.15;
    const era = composite > 75 ? 'advanced' : composite > 55 ? 'accelerating' : composite > 35 ? 'emerging' : 'foundational';
    return {
      region, country: 'Global',
      demographic_momentum: +demo.toFixed(1),
      tech_productivity_multiplier: +tech.toFixed(2),
      urbanization_value_cycle: +urban.toFixed(1),
      infra_investment_maturity: +infra.toFixed(1),
      human_capital_depth: +human.toFixed(1),
      innovation_density: +innov.toFixed(1),
      structural_driver_composite: +composite.toFixed(1),
      driver_era: era,
    };
  });

  const { error } = await sb.from('ihwi_structural_drivers').insert(rows);
  if (error) throw error;
  await emitSignal(sb, 'ihwi_engine_cycle', 'ihwi_drivers', { regions: rows.length });
  return { regions_analyzed: rows.length };
}

async function simulateGrowth(sb: any, _p: any) {
  const scenarios = [
    { name: 'Infrastructure-Led Compounding', strategy: 'infrastructure', horizon: 30 },
    { name: 'Tech-Productivity Acceleration', strategy: 'technology', horizon: 25 },
    { name: 'Balanced Diversification', strategy: 'balanced', horizon: 30 },
    { name: 'Demographic Dividend Capture', strategy: 'demographic', horizon: 40 },
  ];

  const rows = REGIONS.flatMap(region =>
    scenarios.map(s => {
      const compound = 3 + Math.random() * 9;
      const convergence = 20 + Math.random() * 80;
      const risk = 10 + Math.random() * 60;
      const recovery = 30 + Math.random() * 70;
      const multiple = Math.pow(1 + compound / 100, s.horizon);
      const confidence = 5 + (100 - risk) * 0.3;
      return {
        region, country: 'Global',
        scenario_name: s.name,
        compounding_rate_pct: +compound.toFixed(2),
        opportunity_convergence: +convergence.toFixed(1),
        cyclical_risk_score: +risk.toFixed(1),
        recovery_velocity: +recovery.toFixed(1),
        allocation_strategy: s.strategy,
        projected_wealth_multiple: +multiple.toFixed(2),
        time_horizon_years: s.horizon,
        confidence_band_pct: +confidence.toFixed(1),
        simulation_status: 'completed',
      };
    })
  );

  const { error } = await sb.from('ihwi_capital_growth').insert(rows);
  if (error) throw error;
  return { scenarios_simulated: rows.length };
}

async function measureContinuity(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const eduRoi = 1 + Math.random() * 8;
    const humanCap = 25 + Math.random() * 75;
    const inherit = 20 + Math.random() * 80;
    const transition = 15 + Math.random() * 85;
    const inclusion = 20 + Math.random() * 80;
    const mobility = 15 + Math.random() * 85;
    const composite = humanCap * 0.2 + inherit * 0.15 + transition * 0.15 + inclusion * 0.2 + mobility * 0.15 + Math.min(eduRoi * 12, 100) * 0.15;
    const tier = composite > 70 ? 'sustaining' : composite > 45 ? 'building' : 'foundational';
    return {
      region, country: 'Global',
      education_investment_roi: +eduRoi.toFixed(2),
      human_capital_score: +humanCap.toFixed(1),
      inheritance_efficiency: +inherit.toFixed(1),
      asset_transition_readiness: +transition.toFixed(1),
      financial_inclusion_expansion: +inclusion.toFixed(1),
      wealth_mobility_index: +mobility.toFixed(1),
      continuity_composite: +composite.toFixed(1),
      generational_tier: tier,
    };
  });

  const { error } = await sb.from('ihwi_generational_continuity').insert(rows);
  if (error) throw error;
  return { regions_measured: rows.length };
}

async function assessResilience(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const climate = 20 + Math.random() * 80;
    const resource = 25 + Math.random() * 75;
    const buffer = 15 + Math.random() * 85;
    const esg = 10 + Math.random() * 90;
    const sustRoi = 1 + Math.random() * 7;
    const composite = climate * 0.25 + resource * 0.2 + buffer * 0.25 + esg * 0.15 + Math.min(sustRoi * 14, 100) * 0.15;
    const tier = composite > 70 ? 'resilient' : composite > 45 ? 'transitioning' : 'vulnerable';
    const outlook = buffer > 65 ? 'stable' : buffer > 35 ? 'moderate' : 'elevated';
    return {
      region, country: 'Global',
      climate_adaptation_score: +climate.toFixed(1),
      resource_efficiency_index: +resource.toFixed(1),
      systemic_risk_buffer: +buffer.toFixed(1),
      esg_integration_depth: +esg.toFixed(1),
      sustainability_roi: +sustRoi.toFixed(2),
      resilience_composite: +composite.toFixed(1),
      alignment_tier: tier,
      risk_outlook: outlook,
    };
  });

  const { error } = await sb.from('ihwi_resilience_alignment').insert(rows);
  if (error) throw error;
  return { regions_assessed: rows.length };
}

async function synthesizeDecisions(sb: any, _p: any) {
  const [drivers, continuity, resilience] = await Promise.all([
    sb.from('ihwi_structural_drivers').select('*').order('computed_at', { ascending: false }).limit(11),
    sb.from('ihwi_generational_continuity').select('*').order('computed_at', { ascending: false }).limit(11),
    sb.from('ihwi_resilience_alignment').select('*').order('computed_at', { ascending: false }).limit(11),
  ]);

  const driverMap: Record<string, any> = {};
  (drivers.data ?? []).forEach((r: any) => { driverMap[r.region] = r; });
  const contMap: Record<string, any> = {};
  (continuity.data ?? []).forEach((r: any) => { contMap[r.region] = r; });
  const resMap: Record<string, any> = {};
  (resilience.data ?? []).forEach((r: any) => { resMap[r.region] = r; });

  const rows = REGIONS.map(region => {
    const d = driverMap[region]?.structural_driver_composite || 50;
    const c = contMap[region]?.continuity_composite || 50;
    const r = resMap[region]?.resilience_composite || 50;
    const trajectory = d * 0.4 + c * 0.3 + r * 0.3;
    const balance = 100 - Math.abs(d - r);
    const institutional = (d + c) / 2;
    const confidence = Math.min(95, trajectory * 0.5 + balance * 0.3 + Math.random() * 20);
    const composite = trajectory * 0.4 + balance * 0.25 + institutional * 0.2 + confidence * 0.15;
    const era = composite > 75 ? 'thriving' : composite > 55 ? 'advancing' : composite > 35 ? 'foundational' : 'nascent';
    const recs: string[] = [];
    if (d < 50) recs.push('Accelerate structural driver investments');
    if (c < 45) recs.push('Strengthen intergenerational transfer mechanisms');
    if (r < 50) recs.push('Deepen resilience and ESG integration');
    if (recs.length === 0) recs.push('Maintain balanced growth trajectory');
    return {
      region, country: 'Global',
      wealth_trajectory_score: +trajectory.toFixed(1),
      growth_balance_index: +balance.toFixed(1),
      institutional_readiness: +institutional.toFixed(1),
      horizon_confidence: +confidence.toFixed(1),
      decision_composite: +composite.toFixed(1),
      prosperity_era: era,
      strategic_recommendations: recs,
    };
  });

  const { error } = await sb.from('ihwi_decision_intelligence').insert(rows);
  if (error) throw error;
  return { regions_synthesized: rows.length };
}

async function buildDashboard(sb: any) {
  const [drivers, growth, cont, res, dec] = await Promise.all([
    sb.from('ihwi_structural_drivers').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('ihwi_capital_growth').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('ihwi_generational_continuity').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('ihwi_resilience_alignment').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('ihwi_decision_intelligence').select('*').order('computed_at', { ascending: false }).limit(15),
  ]);

  const dd = drivers.data ?? [];
  const rd = res.data ?? [];
  const dcd = dec.data ?? [];

  const avgDriver = dd.length ? dd.reduce((s: number, r: any) => s + (r.structural_driver_composite || 0), 0) / dd.length : 0;
  const avgResilience = rd.length ? rd.reduce((s: number, r: any) => s + (r.resilience_composite || 0), 0) / rd.length : 0;
  const avgDecision = dcd.length ? dcd.reduce((s: number, r: any) => s + (r.decision_composite || 0), 0) / dcd.length : 0;

  return {
    data: {
      summary: {
        regions_tracked: REGIONS.length,
        avg_structural_driver: +avgDriver.toFixed(1),
        avg_resilience_score: +avgResilience.toFixed(1),
        avg_decision_composite: +avgDecision.toFixed(1),
        growth_scenarios: (growth.data ?? []).length,
      },
      drivers: dd,
      growth: growth.data ?? [],
      continuity: cont.data ?? [],
      resilience: rd,
      decisions: dcd,
    },
  };
}

async function emitSignal(sb: any, eventType: string, entityType: string, payload: Record<string, unknown>) {
  await sb.from('ai_event_signals').insert({
    event_type: eventType,
    entity_type: entityType,
    entity_id: null,
    priority_level: 'medium',
    payload,
  });
}
