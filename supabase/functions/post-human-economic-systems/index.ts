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
      case 'map_productivity': return respond(await mapProductivity(supabase, params));
      case 'analyze_distribution': return respond(await analyzeDistribution(supabase, params));
      case 'forecast_augmentation': return respond(await forecastAugmentation(supabase, params));
      case 'model_identity': return respond(await modelIdentity(supabase, params));
      case 'simulate_policy': return respond(await simulatePolicy(supabase, params));
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

const REGIONS = ['North America', 'Europe', 'East Asia', 'South Asia', 'Southeast Asia', 'Middle East', 'Africa', 'Latin America', 'Oceania'];
const SECTORS = ['manufacturing', 'services', 'knowledge', 'creative', 'care', 'governance'];

async function mapProductivity(sb: any, _p: any) {
  const rows = REGIONS.flatMap(region =>
    SECTORS.map(sector => {
      const aiCap = 30 + Math.random() * 70;
      const autoPct = 10 + Math.random() * 80;
      const laborShift = -30 + Math.random() * 60;
      const newValue = 20 + Math.random() * 80;
      const hmRatio = 0.1 + Math.random() * 4;
      const multiplier = 1 + (aiCap / 100) * (autoPct / 100) * 5;
      const era = aiCap > 75 ? 'post_labor' : aiCap > 50 ? 'augmented' : aiCap > 25 ? 'transitional' : 'traditional';
      return {
        region, sector, country: 'Global',
        ai_production_capacity_index: +aiCap.toFixed(1),
        automation_penetration_pct: +autoPct.toFixed(1),
        labor_participation_shift: +laborShift.toFixed(1),
        new_value_generation_score: +newValue.toFixed(1),
        human_machine_ratio: +hmRatio.toFixed(2),
        productivity_multiplier: +multiplier.toFixed(2),
        productivity_era: era,
      };
    })
  );

  const { error } = await sb.from('phes_autonomous_productivity').insert(rows);
  if (error) throw error;

  await emitSignal(sb, 'phes_engine_cycle', 'phes_productivity', { regions: REGIONS.length, sectors: SECTORS.length });
  return { regions_mapped: REGIONS.length, sectors_mapped: SECTORS.length, records: rows.length };
}

async function analyzeDistribution(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const essential = 30 + Math.random() * 70;
    const innovation = 20 + Math.random() * 80;
    const entrepreneurship = 25 + Math.random() * 75;
    const pubPriv = 20 + Math.random() * 80;
    const ubi = 10 + Math.random() * 90;
    const equity = essential * 0.3 + innovation * 0.2 + entrepreneurship * 0.2 + pubPriv * 0.15 + ubi * 0.15;
    const model = ubi > 70 ? 'universal_basic' : innovation > 60 ? 'innovation_driven' : 'hybrid';
    const phase = equity > 75 ? 'optimized' : equity > 50 ? 'reforming' : 'foundational';
    return {
      region, country: 'Global',
      essential_access_score: +essential.toFixed(1),
      innovation_incentive_index: +innovation.toFixed(1),
      entrepreneurship_vitality: +entrepreneurship.toFixed(1),
      public_private_coordination: +pubPriv.toFixed(1),
      ubi_feasibility_score: +ubi.toFixed(1),
      distribution_equity_index: +equity.toFixed(1),
      incentive_model: model,
      distribution_phase: phase,
    };
  });

  const { error } = await sb.from('phes_resource_distribution').insert(rows);
  if (error) throw error;
  return { regions_analyzed: rows.length };
}

async function forecastAugmentation(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const cognitive = 20 + Math.random() * 80;
    const llRoi = 0.5 + Math.random() * 10;
    const collab = 20 + Math.random() * 80;
    const obsolescence = 5 + Math.random() * 40;
    const reskilling = 10 + Math.random() * 90;
    const composite = cognitive * 0.25 + collab * 0.25 + reskilling * 0.2 + (100 - obsolescence) * 0.15 + Math.min(llRoi * 10, 100) * 0.15;
    const tier = composite > 75 ? 'advanced' : composite > 50 ? 'developing' : 'nascent';
    const eduPhase = cognitive > 70 ? 'cognitive_creative' : cognitive > 40 ? 'hybrid' : 'traditional';
    return {
      region, country: 'Global',
      cognitive_creative_readiness: +cognitive.toFixed(1),
      lifelong_learning_roi: +llRoi.toFixed(2),
      human_ai_collaboration_score: +collab.toFixed(1),
      skill_obsolescence_rate: +obsolescence.toFixed(1),
      reskilling_velocity: +reskilling.toFixed(1),
      augmentation_tier: tier,
      education_evolution_phase: eduPhase,
      capability_composite: +composite.toFixed(1),
    };
  });

  const { error } = await sb.from('phes_capability_augmentation').insert(rows);
  if (error) throw error;
  return { regions_forecast: rows.length };
}

async function modelIdentity(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const digital = 20 + Math.random() * 80;
    const decentral = 10 + Math.random() * 90;
    const ownership = 15 + Math.random() * 85;
    const contribution = 20 + Math.random() * 80;
    const portability = 10 + Math.random() * 90;
    const composite = digital * 0.25 + decentral * 0.2 + ownership * 0.2 + contribution * 0.2 + portability * 0.15;
    const model = decentral > 70 ? 'decentralized' : digital > 60 ? 'digital_native' : 'centralized';
    const era = composite > 75 ? 'sovereign' : composite > 50 ? 'emerging' : 'legacy';
    return {
      region, country: 'Global',
      digital_participation_score: +digital.toFixed(1),
      decentralized_exchange_maturity: +decentral.toFixed(1),
      ownership_model_innovation: +ownership.toFixed(1),
      contribution_recognition_score: +contribution.toFixed(1),
      identity_portability_index: +portability.toFixed(1),
      participation_model: model,
      identity_era: era,
      participation_composite: +composite.toFixed(1),
    };
  });

  const { error } = await sb.from('phes_economic_identity').insert(rows);
  if (error) throw error;
  return { regions_modeled: rows.length };
}

async function simulatePolicy(sb: any, _p: any) {
  const scenarios = [
    { name: 'Automation Tax + UBI', type: 'fiscal', autoRate: 8 },
    { name: 'Innovation Subsidy Expansion', type: 'innovation', autoRate: 5 },
    { name: 'Reskilling Mandate', type: 'labor', autoRate: 6 },
    { name: 'Decentralized Governance Pilot', type: 'governance', autoRate: 4 },
  ];

  const rows = REGIONS.flatMap(region =>
    scenarios.map(s => {
      const fiscal = 30 + Math.random() * 70;
      const social = 30 + Math.random() * 70;
      const innov = 20 + Math.random() * 80;
      const gdp = -5 + Math.random() * 15;
      const employ = -10 + Math.random() * 20;
      const ineq = -30 + Math.random() * 30;
      const success = Math.max(10, Math.min(95, fiscal * 0.3 + social * 0.3 + innov * 0.2 + gdp * 2 + Math.random() * 10));
      return {
        region, country: 'Global',
        scenario_name: s.name,
        policy_type: s.type,
        automation_growth_rate: s.autoRate,
        fiscal_response_effectiveness: +fiscal.toFixed(1),
        social_resilience_score: +social.toFixed(1),
        innovation_acceleration: +innov.toFixed(1),
        gdp_impact_pct: +gdp.toFixed(2),
        employment_impact_pct: +employ.toFixed(2),
        inequality_impact: +ineq.toFixed(1),
        success_probability: +success.toFixed(1),
        time_horizon_years: 20,
        simulation_status: 'completed',
      };
    })
  );

  const { error } = await sb.from('phes_policy_simulation').insert(rows);
  if (error) throw error;
  return { scenarios_simulated: rows.length };
}

async function buildDashboard(sb: any) {
  const [prod, dist, cap, ident, policy] = await Promise.all([
    sb.from('phes_autonomous_productivity').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('phes_resource_distribution').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('phes_capability_augmentation').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('phes_economic_identity').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('phes_policy_simulation').select('*').order('computed_at', { ascending: false }).limit(20),
  ]);

  const prodData = prod.data ?? [];
  const distData = dist.data ?? [];
  const capData = cap.data ?? [];

  const avgAiCap = prodData.length ? prodData.reduce((s: number, r: any) => s + (r.ai_production_capacity_index || 0), 0) / prodData.length : 0;
  const avgEquity = distData.length ? distData.reduce((s: number, r: any) => s + (r.distribution_equity_index || 0), 0) / distData.length : 0;
  const avgCapability = capData.length ? capData.reduce((s: number, r: any) => s + (r.capability_composite || 0), 0) / capData.length : 0;

  return {
    data: {
      summary: {
        regions_tracked: REGIONS.length,
        avg_ai_capacity: +avgAiCap.toFixed(1),
        avg_distribution_equity: +avgEquity.toFixed(1),
        avg_capability_composite: +avgCapability.toFixed(1),
        policy_scenarios: (policy.data ?? []).length,
        sectors_analyzed: SECTORS.length,
      },
      productivity: prodData,
      distribution: distData,
      augmentation: capData,
      identity: ident.data ?? [],
      policy: policy.data ?? [],
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
