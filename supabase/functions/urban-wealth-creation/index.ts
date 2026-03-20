import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode, params = {} } = await req.json();

    switch (mode) {
      case 'map_opportunities': return json(await mapOpportunities(sb, params));
      case 'compute_sequencing': return json(await computeSequencing(sb, params));
      case 'measure_wealth_impact': return json(await measureWealthImpact(sb, params));
      case 'assess_risk': return json(await assessRisk(sb, params));
      case 'compute_prosperity_loop': return json(await computeProsperityLoop(sb, params));
      case 'dashboard': return json(await getDashboard(sb));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ── 1. Urban Opportunity Mapping ──
async function mapOpportunities(sb: any, params: any) {
  // Gather district-level liquidity and property data
  const { data: liquidity } = await sb.from('market_liquidity_metrics').select('*').limit(200);
  const { data: properties } = await sb.from('properties').select('city, district, price, property_type, status')
    .eq('status', 'active').limit(500);

  // Aggregate by district
  const districtMap = new Map<string, any>();
  for (const p of (properties || [])) {
    const key = `${p.city}|${p.district || 'Central'}`;
    if (!districtMap.has(key)) {
      districtMap.set(key, { city: p.city, district: p.district || 'Central', count: 0, totalPrice: 0 });
    }
    const d = districtMap.get(key)!;
    d.count++;
    d.totalPrice += Number(p.price) || 0;
  }

  // Merge liquidity data
  const liqMap = new Map<string, any>();
  for (const l of (liquidity || [])) {
    liqMap.set(`${l.district}`, l);
  }

  let mapped = 0;
  for (const [, d] of districtMap) {
    const liq = liqMap.get(d.district);
    const infraTrigger = 40 + Math.random() * 35; // simulated infra pipeline
    const commercialDensity = Math.min(100, d.count * 2.5);
    const popGrowth = 1.2 + Math.random() * 3.5;
    const landAvail = Math.max(10, 80 - d.count * 1.5);
    const transitProx = 30 + Math.random() * 50;
    const zoningFlex = 40 + Math.random() * 40;
    const devPotential = liq
      ? Math.min(100, liq.liquidity_strength_index * 0.3 + infraTrigger * 0.25 + landAvail * 0.2 + commercialDensity * 0.25)
      : Math.min(100, infraTrigger * 0.35 + landAvail * 0.3 + commercialDensity * 0.35);

    const composite = devPotential * 0.3 + infraTrigger * 0.25 + commercialDensity * 0.2 + transitProx * 0.15 + zoningFlex * 0.1;
    const tier = composite >= 75 ? 'prime' : composite >= 55 ? 'high_potential' : composite >= 35 ? 'emerging' : 'frontier';
    const appreciation = composite * 0.15 + popGrowth * 2;

    const triggers: string[] = [];
    if (infraTrigger > 60) triggers.push('infrastructure_investment');
    if (commercialDensity > 50) triggers.push('commercial_cluster');
    if (popGrowth > 3) triggers.push('population_growth');
    if (landAvail > 50) triggers.push('land_availability');

    await sb.from('auwcp_opportunity_mapping').insert({
      city: d.city, district: d.district, region: 'Indonesia',
      development_potential_score: devPotential,
      infrastructure_trigger_score: infraTrigger,
      commercial_cluster_density: commercialDensity,
      population_growth_rate: popGrowth,
      land_availability_index: landAvail,
      transit_proximity_score: transitProx,
      zoning_flexibility_score: zoningFlex,
      composite_opportunity_score: composite,
      opportunity_tier: tier,
      appreciation_forecast_pct: appreciation,
      key_triggers: JSON.stringify(triggers),
      computed_at: new Date().toISOString(),
    });
    mapped++;
  }

  await emitSignal(sb, 'auwcp_engine_cycle', 'auwcp_mapping', null, 'low', { districts_mapped: mapped });
  return { districts_mapped: mapped };
}

// ── 2. Coordinated Investment Sequencing ──
async function computeSequencing(sb: any, params: any) {
  const { data: opportunities } = await sb.from('auwcp_opportunity_mapping').select('*')
    .order('composite_opportunity_score', { ascending: false }).limit(100);

  let sequenced = 0;
  const phaseNames = ['foundation', 'infrastructure', 'residential_core', 'commercial_expansion', 'ecosystem_maturity'];

  for (const opp of (opportunities || [])) {
    const score = opp.composite_opportunity_score;
    const phase = score >= 80 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1;
    const resReady = Math.min(100, score * 0.8 + opp.land_availability_index * 0.2);
    const comReady = Math.min(100, opp.commercial_cluster_density * 0.6 + opp.infrastructure_trigger_score * 0.4);
    const vendorReady = Math.min(100, opp.commercial_cluster_density * 0.5 + score * 0.5);
    const infraReady = opp.infrastructure_trigger_score;
    const mixedUse = (resReady + comReady) / 2;
    const confidence = Math.min(100, score * 0.5 + infraReady * 0.3 + vendorReady * 0.2);
    const estMonths = Math.max(6, Math.round(60 - score * 0.5));
    const actions = [];
    if (infraReady < 50) actions.push('Prioritize infrastructure investment');
    if (vendorReady < 50) actions.push('Activate vendor recruitment');
    if (resReady > comReady + 20) actions.push('Balance with commercial development');

    await sb.from('auwcp_investment_sequencing').insert({
      city: opp.city, district: opp.district, region: opp.region,
      current_phase: phase, total_phases: 5,
      phase_name: phaseNames[phase - 1],
      residential_readiness: resReady,
      commercial_readiness: comReady,
      vendor_supply_readiness: vendorReady,
      infrastructure_readiness: infraReady,
      mixed_use_balance_score: mixedUse,
      sequencing_confidence: confidence,
      estimated_phase_months: estMonths,
      next_milestone: actions[0] || 'Continue current phase',
      sequencing_actions: JSON.stringify(actions),
      updated_at: new Date().toISOString(),
    });
    sequenced++;
  }

  return { districts_sequenced: sequenced };
}

// ── 3. Wealth Distribution Impact ──
async function measureWealthImpact(sb: any, params: any) {
  const { data: sequencing } = await sb.from('auwcp_investment_sequencing').select('*');

  let measured = 0;
  for (const s of (sequencing || [])) {
    const phaseFactor = s.current_phase / s.total_phases;
    const jobs30d = Math.round(phaseFactor * 150 + s.vendor_supply_readiness * 2);
    const jobsCumulative = Math.round(jobs30d * (3 + s.current_phase * 2));
    const serviceGrowth = phaseFactor * 12 + s.commercial_readiness * 0.1;
    const appreciationAvg = s.residential_readiness * 0.08 + s.infrastructure_readiness * 0.05;
    const appreciationMedian = appreciationAvg * 0.85;
    const gini = Math.max(0.15, 0.5 - phaseFactor * 0.15 - s.mixed_use_balance_score * 0.002);
    const smallBiz = phaseFactor * 8 + s.commercial_readiness * 0.06;
    const householdImpact = phaseFactor * 5 + serviceGrowth * 0.3;
    const communityScore = Math.min(100, s.mixed_use_balance_score * 0.5 + householdImpact * 3);
    const inclusionIndex = Math.min(100, (1 - gini) * 50 + communityScore * 0.5);
    const tier = inclusionIndex >= 75 ? 'transformative' : inclusionIndex >= 55 ? 'significant' : inclusionIndex >= 35 ? 'moderate' : 'baseline';

    await sb.from('auwcp_wealth_impact').insert({
      city: s.city, district: s.district, region: s.region,
      jobs_created_30d: jobs30d,
      jobs_created_cumulative: jobsCumulative,
      local_service_growth_pct: serviceGrowth,
      property_appreciation_avg_pct: appreciationAvg,
      property_appreciation_median_pct: appreciationMedian,
      gini_dispersion_index: gini,
      small_business_formation_rate: smallBiz,
      household_income_impact_pct: householdImpact,
      community_investment_score: communityScore,
      prosperity_inclusion_index: inclusionIndex,
      impact_tier: tier,
      measured_at: new Date().toISOString(),
    });
    measured++;
  }

  return { districts_measured: measured };
}

// ── 4. Development Risk Mitigation ──
async function assessRisk(sb: any, params: any) {
  const { data: opportunities } = await sb.from('auwcp_opportunity_mapping').select('*');
  const { data: sequencing } = await sb.from('auwcp_investment_sequencing').select('city, district, current_phase, infrastructure_readiness, residential_readiness');

  const seqMap = new Map<string, any>();
  for (const s of (sequencing || [])) {
    seqMap.set(`${s.city}|${s.district}`, s);
  }

  let assessed = 0;
  for (const opp of (opportunities || [])) {
    const seq = seqMap.get(`${opp.city}|${opp.district}`);
    const specHeat = Math.min(100, Math.max(0,
      (opp.appreciation_forecast_pct > 15 ? 40 : opp.appreciation_forecast_pct > 10 ? 20 : 5) +
      (opp.commercial_cluster_density > 70 ? 30 : 10) +
      (opp.land_availability_index < 20 ? 25 : 0)
    ));
    const infraBottleneck = seq
      ? Math.max(0, 100 - seq.infrastructure_readiness)
      : Math.max(0, 100 - opp.infrastructure_trigger_score);
    const capitalConc = Math.min(100, specHeat * 0.5 + (100 - opp.land_availability_index) * 0.3);
    const oversupply = Math.min(100, opp.commercial_cluster_density > 80 ? 60 : opp.commercial_cluster_density * 0.4);
    const demandSustain = Math.min(100, opp.population_growth_rate * 15 + opp.transit_proximity_score * 0.3);
    const compositeRisk = specHeat * 0.3 + infraBottleneck * 0.25 + capitalConc * 0.2 + oversupply * 0.15 + (100 - demandSustain) * 0.1;
    const riskTier = compositeRisk >= 70 ? 'critical' : compositeRisk >= 50 ? 'elevated' : compositeRisk >= 30 ? 'moderate' : 'low';

    const warnings: string[] = [];
    if (specHeat > 60) warnings.push('speculative_overheating');
    if (infraBottleneck > 60) warnings.push('infrastructure_gap');
    if (capitalConc > 60) warnings.push('capital_concentration');
    if (oversupply > 50) warnings.push('oversupply_risk');

    const mitigations: string[] = [];
    if (specHeat > 60) mitigations.push('Implement cooling measures and phased releases');
    if (infraBottleneck > 60) mitigations.push('Accelerate infrastructure investment');
    if (capitalConc > 60) mitigations.push('Diversify capital sources');

    await sb.from('auwcp_risk_mitigation').insert({
      city: opp.city, district: opp.district, region: opp.region,
      speculative_heat_score: specHeat,
      infrastructure_bottleneck_risk: infraBottleneck,
      capital_concentration_risk: capitalConc,
      oversupply_probability: oversupply,
      demand_sustainability_score: demandSustain,
      composite_risk_score: compositeRisk,
      risk_tier: riskTier,
      early_warning_signals: JSON.stringify(warnings),
      mitigation_actions: JSON.stringify(mitigations),
      stress_test_result: compositeRisk < 40 ? 'passed' : compositeRisk < 65 ? 'conditional' : 'failed',
      forecast_horizon_months: 12,
      computed_at: new Date().toISOString(),
    });
    assessed++;
  }

  return { districts_assessed: assessed };
}

// ── 5. Prosperity Feedback Loop ──
async function computeProsperityLoop(sb: any, params: any) {
  const { data: impact } = await sb.from('auwcp_wealth_impact').select('*');
  const { data: risk } = await sb.from('auwcp_risk_mitigation').select('city, district, composite_risk_score, demand_sustainability_score');

  const riskMap = new Map<string, any>();
  for (const r of (risk || [])) {
    riskMap.set(`${r.city}|${r.district}`, r);
  }

  let computed = 0;
  for (const w of (impact || [])) {
    const r = riskMap.get(`${w.city}|${w.district}`);
    const riskScore = r?.composite_risk_score || 50;
    const demandSustain = r?.demand_sustainability_score || 50;

    const policyAlign = Math.min(100, w.prosperity_inclusion_index * 0.4 + (100 - riskScore) * 0.3 + w.community_investment_score * 0.3);
    const sustainDensity = Math.min(100, demandSustain * 0.4 + w.local_service_growth_pct * 3 + (100 - riskScore) * 0.2);
    const liqHealth = Math.min(100, (100 - riskScore) * 0.5 + w.property_appreciation_avg_pct * 5 + demandSustain * 0.2);
    const reinvestVelocity = w.prosperity_inclusion_index / 100 * 2.5 + w.small_business_formation_rate * 0.1;
    const greenDev = 15 + Math.random() * 30; // simulated green development pct
    const commSatisfaction = Math.min(100, w.community_investment_score * 0.6 + w.household_income_impact_pct * 2);
    const viability = policyAlign * 0.25 + sustainDensity * 0.2 + liqHealth * 0.2 + commSatisfaction * 0.2 + greenDev * 0.15;
    const momentum = viability >= 75 ? 'accelerating' : viability >= 55 ? 'growing' : viability >= 35 ? 'stable' : 'stalling';
    const feedbackStrength = Math.min(100, viability * 0.6 + reinvestVelocity * 15);
    const projected12m = Math.min(100, viability + feedbackStrength * 0.1);

    const recommendations: string[] = [];
    if (policyAlign < 50) recommendations.push('Improve policy alignment through mixed-use zoning');
    if (greenDev < 25) recommendations.push('Increase green development incentives');
    if (commSatisfaction < 50) recommendations.push('Invest in community amenities');
    if (liqHealth < 50) recommendations.push('Stimulate healthy liquidity cycles');

    await sb.from('auwcp_prosperity_feedback').insert({
      city: w.city, district: w.district, region: w.region,
      policy_alignment_score: policyAlign,
      sustainable_density_index: sustainDensity,
      liquidity_cycle_health: liqHealth,
      reinvestment_velocity: reinvestVelocity,
      green_development_pct: greenDev,
      community_satisfaction_proxy: commSatisfaction,
      long_term_viability_score: viability,
      prosperity_momentum: momentum,
      feedback_loop_strength: feedbackStrength,
      projected_prosperity_12m: projected12m,
      policy_recommendations: JSON.stringify(recommendations),
      computed_at: new Date().toISOString(),
    });
    computed++;
  }

  await emitSignal(sb, 'auwcp_engine_cycle', 'auwcp_prosperity', null, 'low', { districts_computed: computed });
  return { districts_computed: computed };
}

// ── Dashboard ──
async function getDashboard(sb: any) {
  const [opp, seq, wealth, risk, prosperity] = await Promise.all([
    sb.from('auwcp_opportunity_mapping').select('*').order('composite_opportunity_score', { ascending: false }).limit(20),
    sb.from('auwcp_investment_sequencing').select('*').order('sequencing_confidence', { ascending: false }).limit(20),
    sb.from('auwcp_wealth_impact').select('*').order('prosperity_inclusion_index', { ascending: false }).limit(20),
    sb.from('auwcp_risk_mitigation').select('*').order('composite_risk_score', { ascending: false }).limit(20),
    sb.from('auwcp_prosperity_feedback').select('*').order('long_term_viability_score', { ascending: false }).limit(20),
  ]);

  return {
    opportunity_mapping: opp.data || [],
    investment_sequencing: seq.data || [],
    wealth_impact: wealth.data || [],
    risk_mitigation: risk.data || [],
    prosperity_feedback: prosperity.data || [],
  };
}

async function emitSignal(sb: any, eventType: string, entityType: string, entityId: string | null, priority: string, payload: Record<string, unknown>) {
  await sb.from('ai_event_signals').insert({
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    priority_level: priority,
    payload,
  });
}
