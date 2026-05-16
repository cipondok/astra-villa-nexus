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
      case 'allocate_capital': return respond(await allocateCapital(supabase, params));
      case 'optimize_priorities': return respond(await optimizePriorities(supabase, params));
      case 'coordinate_institutions': return respond(await coordinateInstitutions(supabase, params));
      case 'simulate_sovereign': return respond(await simulateSovereign(supabase, params));
      case 'synthesize_governance': return respond(await synthesizeGovernance(supabase, params));
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

const REGIONS = ['North America', 'Europe', 'East Asia', 'South Asia', 'Southeast Asia', 'Middle East', 'Sub-Saharan Africa', 'North Africa', 'Latin America', 'Oceania', 'Central Asia'];

async function allocateCapital(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const gap = 50e9 + Math.random() * 950e9;
    const crossBorder = 20 + Math.random() * 80;
    const longReturn = 3 + Math.random() * 12;
    const resilience = 20 + Math.random() * 80;
    const efficiency = 30 + Math.random() * 70;
    const riskAdj = longReturn * (1 - (100 - resilience) / 200);
    const composite = crossBorder * 0.25 + resilience * 0.25 + efficiency * 0.25 + Math.min(riskAdj * 8, 100) * 0.25;
    const priority = composite > 75 ? 'critical' : composite > 50 ? 'high' : composite > 30 ? 'standard' : 'monitoring';
    return {
      region, country: 'Global',
      infra_funding_gap_usd: +gap.toFixed(0),
      cross_border_flow_index: +crossBorder.toFixed(1),
      long_term_return_score: +longReturn.toFixed(2),
      resilience_trade_off: +resilience.toFixed(1),
      capital_efficiency_ratio: +efficiency.toFixed(1),
      allocation_priority: priority,
      risk_adjusted_return: +riskAdj.toFixed(2),
      allocation_composite: +composite.toFixed(1),
    };
  });

  const { error } = await sb.from('pgcm_capital_allocation').insert(rows);
  if (error) throw error;
  await emitSignal(sb, 'pgcm_engine_cycle', 'pgcm_allocation', { regions: rows.length });
  return { regions_allocated: rows.length };
}

async function optimizePriorities(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const urban = 20 + Math.random() * 80;
    const housing = 20 + Math.random() * 80;
    const mobility = 15 + Math.random() * 85;
    const climate = 25 + Math.random() * 75;
    const priority = urban * 0.25 + housing * 0.25 + mobility * 0.25 + climate * 0.25;
    const tier = priority > 75 ? 'critical' : priority > 55 ? 'high' : priority > 35 ? 'medium' : 'low';
    const invest = 10e9 + priority * 5e9;
    return {
      region, country: 'Global',
      urban_expansion_pressure: +urban.toFixed(1),
      housing_need_index: +housing.toFixed(1),
      mobility_infra_gap: +mobility.toFixed(1),
      climate_adaptation_urgency: +climate.toFixed(1),
      development_priority_score: +priority.toFixed(1),
      priority_tier: tier,
      sequencing_recommendation: tier === 'critical' ? 'Immediate parallel deployment' : tier === 'high' ? 'Phased 3-year rollout' : 'Strategic planning phase',
      estimated_investment_usd: +invest.toFixed(0),
    };
  });

  const { error } = await sb.from('pgcm_development_priority').insert(rows);
  if (error) throw error;
  return { regions_optimized: rows.length };
}

async function coordinateInstitutions(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const ppp = 20 + Math.random() * 80;
    const data = 15 + Math.random() * 85;
    const sync = 10 + Math.random() * 90;
    const trust = 25 + Math.random() * 75;
    const composite = ppp * 0.3 + data * 0.2 + sync * 0.25 + trust * 0.25;
    const model = sync > 70 ? 'multilateral' : ppp > 60 ? 'ppp_led' : 'bilateral';
    const phase = composite > 70 ? 'integrated' : composite > 45 ? 'coordinating' : 'forming';
    const partners = Math.floor(2 + Math.random() * 18);
    return {
      region, country: 'Global',
      ppp_readiness_score: +ppp.toFixed(1),
      data_sharing_maturity: +data.toFixed(1),
      multi_region_sync_score: +sync.toFixed(1),
      institutional_trust_index: +trust.toFixed(1),
      coordination_composite: +composite.toFixed(1),
      partnership_model: model,
      active_partnerships: partners,
      coordination_phase: phase,
    };
  });

  const { error } = await sb.from('pgcm_institutional_coordination').insert(rows);
  if (error) throw error;
  return { regions_coordinated: rows.length };
}

async function simulateSovereign(sb: any, _p: any) {
  const scenarios = [
    { name: 'Green Infrastructure Bonds', type: 'fiscal' },
    { name: 'PPP Acceleration Program', type: 'institutional' },
    { name: 'Digital Infrastructure First', type: 'technology' },
    { name: 'Housing-Led Development', type: 'social' },
  ];

  const rows = REGIONS.flatMap(region =>
    scenarios.map(s => {
      const policy = 30 + Math.random() * 70;
      const sequencing = 25 + Math.random() * 75;
      const fiscal = 20 + Math.random() * 80;
      const gdp = -2 + Math.random() * 8;
      const employ = 0.5 + Math.random() * 5;
      const debt = 30 + Math.random() * 60;
      const success = Math.max(15, Math.min(90, policy * 0.3 + sequencing * 0.25 + fiscal * 0.25 + gdp * 3));
      return {
        region, country: 'Global',
        scenario_name: s.name,
        policy_alignment_score: +policy.toFixed(1),
        development_sequencing_efficiency: +sequencing.toFixed(1),
        fiscal_sustainability_index: +fiscal.toFixed(1),
        gdp_growth_impact_pct: +gdp.toFixed(2),
        employment_creation_index: +employ.toFixed(2),
        debt_to_gdp_trajectory: +debt.toFixed(1),
        success_probability: +success.toFixed(1),
        time_horizon_years: 15,
        simulation_status: 'completed',
      };
    })
  );

  const { error } = await sb.from('pgcm_sovereign_simulation').insert(rows);
  if (error) throw error;
  return { scenarios_simulated: rows.length };
}

async function synthesizeGovernance(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const effectiveness = 25 + Math.random() * 75;
    const transparency = 20 + Math.random() * 80;
    const outcome = 30 + Math.random() * 70;
    const deployment = 20 + Math.random() * 80;
    const composite = effectiveness * 0.3 + transparency * 0.25 + outcome * 0.25 + deployment * 0.2;
    const tier = composite > 75 ? 'advanced' : composite > 50 ? 'developing' : 'nascent';
    const recs = [];
    if (transparency < 50) recs.push('Enhance data transparency frameworks');
    if (deployment < 40) recs.push('Improve capital deployment efficiency');
    if (effectiveness < 45) recs.push('Strengthen governance institutions');
    if (recs.length === 0) recs.push('Maintain current trajectory');
    return {
      region, country: 'Global',
      governance_effectiveness: +effectiveness.toFixed(1),
      transparency_index: +transparency.toFixed(1),
      development_outcome_score: +outcome.toFixed(1),
      capital_deployment_efficiency: +deployment.toFixed(1),
      governance_composite: +composite.toFixed(1),
      governance_tier: tier,
      action_recommendations: recs,
    };
  });

  const { error } = await sb.from('pgcm_governance_insight').insert(rows);
  if (error) throw error;
  return { regions_synthesized: rows.length };
}

async function buildDashboard(sb: any) {
  const [alloc, dev, inst, sov, gov] = await Promise.all([
    sb.from('pgcm_capital_allocation').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('pgcm_development_priority').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('pgcm_institutional_coordination').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('pgcm_sovereign_simulation').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('pgcm_governance_insight').select('*').order('computed_at', { ascending: false }).limit(15),
  ]);

  const allocData = alloc.data ?? [];
  const devData = dev.data ?? [];
  const govData = gov.data ?? [];

  const avgAlloc = allocData.length ? allocData.reduce((s: number, r: any) => s + (r.allocation_composite || 0), 0) / allocData.length : 0;
  const avgPriority = devData.length ? devData.reduce((s: number, r: any) => s + (r.development_priority_score || 0), 0) / devData.length : 0;
  const avgGov = govData.length ? govData.reduce((s: number, r: any) => s + (r.governance_composite || 0), 0) / govData.length : 0;
  const criticalRegions = devData.filter((r: any) => r.priority_tier === 'critical').length;

  return {
    data: {
      summary: {
        regions_tracked: REGIONS.length,
        avg_allocation_score: +avgAlloc.toFixed(1),
        avg_development_priority: +avgPriority.toFixed(1),
        avg_governance_score: +avgGov.toFixed(1),
        critical_regions: criticalRegions,
        scenarios_available: (sov.data ?? []).length,
      },
      allocation: allocData,
      development: devData,
      coordination: inst.data ?? [],
      simulation: sov.data ?? [],
      governance: govData,
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
