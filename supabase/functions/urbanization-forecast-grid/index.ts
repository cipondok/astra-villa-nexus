import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { mode, params = {} } = await req.json();

    switch (mode) {
      case 'scan_expansion': return json(await scanExpansion(sb, params));
      case 'predict_lifecycle': return json(await predictLifecycle(sb, params));
      case 'project_infrastructure': return json(await projectInfrastructure(sb, params));
      case 'compute_sequencing': return json(await computeSequencing(sb, params));
      case 'optimize_sustainability': return json(await optimizeSustainability(sb, params));
      case 'dashboard': return json(await getDashboard(sb));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// ── 1. Urban Expansion Signal Engine ──
async function scanExpansion(sb: any, params: any) {
  const { data: properties } = await sb.from('properties').select('city, district, property_type, price, status')
    .eq('status', 'active').limit(500);
  const { data: liquidity } = await sb.from('market_liquidity_metrics').select('district, liquidity_strength_index, absorption_rate, active_listings').limit(200);

  const liqMap = new Map<string, any>();
  for (const l of (liquidity || [])) liqMap.set(l.district, l);

  const districtAgg = new Map<string, { city: string; district: string; count: number; totalPrice: number }>();
  for (const p of (properties || [])) {
    const key = `${p.city}|${p.district || 'Central'}`;
    const a = districtAgg.get(key) || { city: p.city, district: p.district || 'Central', count: 0, totalPrice: 0 };
    a.count++; a.totalPrice += Number(p.price) || 0;
    districtAgg.set(key, a);
  }

  let scanned = 0;
  for (const [, d] of districtAgg) {
    const liq = liqMap.get(d.district);
    const popInflow = 30 + Math.random() * 50;
    const transportInvest = 20 + Math.random() * 60;
    const commercialCluster = Math.min(100, d.count * 2);
    const landUseVelocity = Math.min(100, d.count * 1.5 + (liq?.absorption_rate || 0) * 5);
    const permitMomentum = 25 + Math.random() * 50;
    const greenFieldConv = Math.random() * 8;
    const composite = popInflow * 0.25 + transportInvest * 0.2 + commercialCluster * 0.2 + landUseVelocity * 0.15 + permitMomentum * 0.1 + greenFieldConv * 5 * 0.1;
    const tier = composite >= 70 ? 'rapid' : composite >= 50 ? 'accelerating' : composite >= 30 ? 'emerging' : 'dormant';
    const vector = composite > 60 ? 'expanding' : composite > 40 ? 'stable' : 'contracting';
    const drivers: string[] = [];
    if (popInflow > 60) drivers.push('population_inflow');
    if (transportInvest > 50) drivers.push('transport_investment');
    if (commercialCluster > 50) drivers.push('commercial_clustering');
    if (permitMomentum > 50) drivers.push('building_permits');

    await sb.from('pufg_expansion_signals').insert({
      city: d.city, district: d.district,
      population_inflow_score: popInflow, transport_investment_score: transportInvest,
      commercial_cluster_score: commercialCluster, land_use_velocity: landUseVelocity,
      building_permit_momentum: permitMomentum, green_field_conversion_rate: greenFieldConv,
      composite_expansion_signal: composite, expansion_tier: tier, expansion_vector: vector,
      signal_drivers: JSON.stringify(drivers), computed_at: new Date().toISOString(),
    });
    scanned++;
  }

  await emitSignal(sb, 'pufg_engine_cycle', 'pufg_expansion', null, 'low', { districts_scanned: scanned });
  return { districts_scanned: scanned };
}

// ── 2. District Lifecycle Prediction ──
async function predictLifecycle(sb: any, params: any) {
  const { data: signals } = await sb.from('pufg_expansion_signals').select('*').order('composite_expansion_signal', { ascending: false });

  let predicted = 0;
  for (const s of (signals || [])) {
    const composite = s.composite_expansion_signal;
    const density = Math.min(100, s.commercial_cluster_score * 0.5 + s.land_use_velocity * 0.5);
    const commSat = Math.min(100, s.commercial_cluster_score * 1.2);
    const resSat = Math.min(100, density * 0.8 + s.building_permit_momentum * 0.3);
    const infraComplete = s.transport_investment_score * 0.8;

    let phase: string, maturity: number, velocity: number;
    if (density < 25 && composite > 40) { phase = 'early_growth'; maturity = composite * 0.4; velocity = composite * 0.03; }
    else if (density < 50 && composite > 30) { phase = 'acceleration'; maturity = 30 + composite * 0.3; velocity = composite * 0.025; }
    else if (density < 75) { phase = 'maturity'; maturity = 50 + density * 0.4; velocity = composite * 0.01; }
    else if (commSat > 80 && resSat > 80) { phase = 'saturation'; maturity = 80 + Math.random() * 15; velocity = -0.5; }
    else { phase = 'regeneration'; maturity = 20 + Math.random() * 30; velocity = composite * 0.015; }

    const remaining = phase === 'saturation' ? null : Math.round((100 - maturity) / Math.max(0.5, velocity));
    const regenPotential = phase === 'saturation' ? Math.min(100, (100 - infraComplete) * 0.5 + s.population_inflow_score * 0.5) : 0;
    const confidence = Math.min(100, composite * 0.4 + density * 0.3 + infraComplete * 0.3);

    const triggers: string[] = [];
    if (commSat > 70) triggers.push('commercial_saturation_near');
    if (resSat > 70) triggers.push('residential_saturation_near');
    if (s.population_inflow_score > 70) triggers.push('population_surge');
    if (infraComplete > 70) triggers.push('infrastructure_maturation');

    await sb.from('pufg_district_lifecycle').insert({
      city: s.city, district: s.district,
      lifecycle_phase: phase, phase_maturity_pct: maturity, phase_velocity: velocity,
      estimated_phase_remaining_months: remaining,
      density_index: density, commercial_saturation: commSat, residential_saturation: resSat,
      infrastructure_completeness: infraComplete, regeneration_potential: regenPotential,
      lifecycle_confidence: confidence, transition_triggers: JSON.stringify(triggers),
      computed_at: new Date().toISOString(),
    });
    predicted++;
  }

  return { districts_predicted: predicted };
}

// ── 3. Infrastructure Impact Projection ──
async function projectInfrastructure(sb: any, params: any) {
  const { data: signals } = await sb.from('pufg_expansion_signals').select('*');

  const projectTypes = ['transit', 'highway', 'airport', 'port', 'industrial_zone', 'mixed_use_hub'];
  let projected = 0;

  for (const s of (signals || [])) {
    if (s.transport_investment_score < 30) continue;

    const pType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
    const investAmount = (500000 + Math.random() * 50000000);
    const uplift = s.transport_investment_score * 0.15 + s.population_inflow_score * 0.05;
    const radius = pType === 'transit' ? 2 + Math.random() * 3 : pType === 'highway' ? 5 + Math.random() * 10 : 3 + Math.random() * 5;
    const todEffect = pType === 'transit' ? 60 + Math.random() * 30 : pType === 'mixed_use_hub' ? 50 + Math.random() * 30 : 20 + Math.random() * 30;
    const logisticsExp = pType === 'port' || pType === 'industrial_zone' ? 60 + Math.random() * 30 : 10 + Math.random() * 20;
    const industrialEffect = pType === 'industrial_zone' ? 70 + Math.random() * 25 : 10 + Math.random() * 20;
    const completion = 10 + Math.random() * 80;
    const affected = Math.round(s.commercial_cluster_score * 5 + Math.random() * 200);
    const compositeImpact = uplift * 2 + todEffect * 0.3 + logisticsExp * 0.1 + industrialEffect * 0.1;
    const impactTier = compositeImpact >= 30 ? 'transformative' : compositeImpact >= 20 ? 'significant' : compositeImpact >= 10 ? 'moderate' : 'marginal';

    await sb.from('pufg_infrastructure_impact').insert({
      city: s.city, district: s.district,
      project_name: `${s.district} ${pType.replace('_', ' ')} project`,
      project_type: pType, investment_amount_usd: investAmount,
      value_uplift_pct: uplift, impact_radius_km: radius,
      tod_effect_score: todEffect, logistics_expansion_score: logisticsExp,
      industrial_zone_effect: industrialEffect, completion_pct: completion,
      affected_properties_count: affected, composite_impact_score: compositeImpact,
      impact_tier: impactTier, computed_at: new Date().toISOString(),
    });
    projected++;
  }

  return { projects_projected: projected };
}

// ── 4. Spatial Investment Sequencing ──
async function computeSequencing(sb: any, params: any) {
  const { data: lifecycle } = await sb.from('pufg_district_lifecycle').select('*');
  const { data: infra } = await sb.from('pufg_infrastructure_impact').select('city, district, composite_impact_score, value_uplift_pct');

  const infraMap = new Map<string, { impact: number; uplift: number }>();
  for (const i of (infra || [])) {
    const key = `${i.city}|${i.district}`;
    const existing = infraMap.get(key) || { impact: 0, uplift: 0 };
    existing.impact = Math.max(existing.impact, i.composite_impact_score);
    existing.uplift = Math.max(existing.uplift, i.value_uplift_pct);
    infraMap.set(key, existing);
  }

  let sequenced = 0;
  for (const lc of (lifecycle || [])) {
    const inf = infraMap.get(`${lc.city}|${lc.district}`) || { impact: 0, uplift: 0 };
    const wave = lc.lifecycle_phase === 'early_growth' ? 1 : lc.lifecycle_phase === 'acceleration' ? 2 : lc.lifecycle_phase === 'maturity' ? 3 : 4;
    const resReady = Math.min(100, (100 - lc.residential_saturation) * 0.6 + lc.infrastructure_completeness * 0.4);
    const comReady = Math.min(100, (100 - lc.commercial_saturation) * 0.5 + inf.impact * 0.5);
    const svcReady = Math.min(100, lc.density_index * 0.4 + lc.infrastructure_completeness * 0.3 + inf.impact * 0.3);
    const timing = Math.min(100, lc.lifecycle_confidence * 0.4 + inf.impact * 0.3 + (100 - lc.phase_maturity_pct) * 0.3);
    const urbanReady = (resReady + comReady + svcReady + timing) / 4;
    const priority = urbanReady * 0.5 + inf.impact * 0.3 + lc.lifecycle_confidence * 0.2;
    const roiPremium = inf.uplift + (lc.lifecycle_phase === 'early_growth' ? 8 : lc.lifecycle_phase === 'acceleration' ? 5 : 2);
    const confidence = Math.min(100, lc.lifecycle_confidence * 0.6 + timing * 0.4);

    const mix: Record<string, number> = {};
    if (lc.lifecycle_phase === 'early_growth') { mix.residential = 60; mix.commercial = 20; mix.services = 20; }
    else if (lc.lifecycle_phase === 'acceleration') { mix.residential = 40; mix.commercial = 35; mix.services = 25; }
    else { mix.residential = 30; mix.commercial = 40; mix.services = 30; }

    const sequence = [
      { step: 1, action: 'Infrastructure assessment', timing: 'immediate' },
      { step: 2, action: 'Anchor investment deployment', timing: `month_${wave * 3}` },
      { step: 3, action: 'Ecosystem build-out', timing: `month_${wave * 6}` },
    ];

    await sb.from('pufg_spatial_sequencing').insert({
      city: lc.city, district: lc.district,
      development_wave: wave, wave_priority_score: priority,
      residential_readiness: resReady, commercial_readiness: comReady,
      service_ecosystem_readiness: svcReady, capital_timing_alignment: timing,
      urban_readiness_index: urbanReady, recommended_asset_mix: mix,
      deployment_sequence: JSON.stringify(sequence),
      estimated_roi_premium_pct: roiPremium, sequencing_confidence: confidence,
      computed_at: new Date().toISOString(),
    });
    sequenced++;
  }

  return { districts_sequenced: sequenced };
}

// ── 5. Sustainable Growth Optimization ──
async function optimizeSustainability(sb: any, params: any) {
  const { data: lifecycle } = await sb.from('pufg_district_lifecycle').select('*');
  const { data: sequencing } = await sb.from('pufg_spatial_sequencing').select('city, district, urban_readiness_index');

  const seqMap = new Map<string, number>();
  for (const s of (sequencing || [])) seqMap.set(`${s.city}|${s.district}`, s.urban_readiness_index);

  let optimized = 0;
  for (const lc of (lifecycle || [])) {
    const urbanReady = seqMap.get(`${lc.city}|${lc.district}`) || 50;
    const densityStress = Math.min(100, lc.density_index * 0.6 + lc.residential_saturation * 0.2 + lc.commercial_saturation * 0.2);
    const congestion = Math.min(100, densityStress * 0.5 + (100 - lc.infrastructure_completeness) * 0.3 + lc.density_index * 0.2);
    const envPressure = Math.min(100, densityStress * 0.4 + congestion * 0.3 + (100 - urbanReady) * 0.3);
    const greenRatio = Math.max(0.02, 0.35 - lc.density_index * 0.003);
    const svcCapacity = Math.min(100, lc.infrastructure_completeness * 0.5 + (100 - densityStress) * 0.5);
    const balancedGrowth = Math.min(100, (100 - densityStress) * 0.25 + (100 - congestion) * 0.25 + (100 - envPressure) * 0.2 + greenRatio * 200 * 0.15 + svcCapacity * 0.15);
    const tier = balancedGrowth >= 70 ? 'sustainable' : balancedGrowth >= 50 ? 'adequate' : balancedGrowth >= 30 ? 'stressed' : 'critical';
    const recommendation = balancedGrowth >= 70 ? 'continue' : balancedGrowth >= 50 ? 'optimize' : balancedGrowth >= 30 ? 'intervene' : 'halt_expansion';
    const carrying = Math.min(100, densityStress * 0.8 + envPressure * 0.2);
    const projected12m = Math.min(100, densityStress + (lc.phase_velocity || 0) * 12 * 0.5);

    const warnings: string[] = [];
    if (densityStress > 70) warnings.push('density_overload');
    if (congestion > 70) warnings.push('congestion_critical');
    if (envPressure > 60) warnings.push('environmental_strain');
    if (greenRatio < 0.1) warnings.push('green_space_deficit');

    const actions: string[] = [];
    if (congestion > 60) actions.push('Invest in transit infrastructure');
    if (envPressure > 50) actions.push('Mandate green building standards');
    if (densityStress > 60) actions.push('Redirect growth to adjacent districts');
    if (greenRatio < 0.15) actions.push('Preserve and create green corridors');

    await sb.from('pufg_sustainable_growth').insert({
      city: lc.city, district: lc.district,
      density_stress_index: densityStress, congestion_risk_score: congestion,
      environmental_pressure: envPressure, green_space_ratio: greenRatio,
      service_capacity_utilization: svcCapacity, balanced_growth_score: balancedGrowth,
      sustainability_tier: tier, expansion_recommendation: recommendation,
      risk_warnings: JSON.stringify(warnings), optimization_actions: JSON.stringify(actions),
      carrying_capacity_pct: carrying, projected_stress_12m: projected12m,
      computed_at: new Date().toISOString(),
    });
    optimized++;
  }

  await emitSignal(sb, 'pufg_engine_cycle', 'pufg_sustainability', null, 'low', { districts_optimized: optimized });
  return { districts_optimized: optimized };
}

async function getDashboard(sb: any) {
  const [exp, life, infra, seq, sust] = await Promise.all([
    sb.from('pufg_expansion_signals').select('*').order('composite_expansion_signal', { ascending: false }).limit(20),
    sb.from('pufg_district_lifecycle').select('*').order('lifecycle_confidence', { ascending: false }).limit(20),
    sb.from('pufg_infrastructure_impact').select('*').order('composite_impact_score', { ascending: false }).limit(20),
    sb.from('pufg_spatial_sequencing').select('*').order('wave_priority_score', { ascending: false }).limit(20),
    sb.from('pufg_sustainable_growth').select('*').order('balanced_growth_score', { ascending: false }).limit(20),
  ]);
  return {
    expansion_signals: exp.data || [], district_lifecycle: life.data || [],
    infrastructure_impact: infra.data || [], spatial_sequencing: seq.data || [],
    sustainable_growth: sust.data || [],
  };
}

async function emitSignal(sb: any, eventType: string, entityType: string, entityId: string | null, priority: string, payload: Record<string, unknown>) {
  await sb.from('ai_event_signals').insert({ event_type: eventType, entity_type: entityType, entity_id: entityId, priority_level: priority, payload });
}
