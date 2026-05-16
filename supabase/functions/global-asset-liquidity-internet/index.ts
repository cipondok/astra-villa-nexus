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

    const { mode, params = {} } = await req.json();

    switch (mode) {
      case 'scan_discovery_graph': return json(await scanDiscoveryGraph(supabase, params));
      case 'compute_routing': return json(await computeRouting(supabase, params));
      case 'compute_valuation': return json(await computeValuation(supabase, params));
      case 'measure_friction': return json(await measureFriction(supabase, params));
      case 'compute_network_effects': return json(await computeNetworkEffects(supabase, params));
      case 'dashboard': return json(await getDashboard(supabase));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function scanDiscoveryGraph(sb: any, params: any) {
  const { data: properties } = await sb.from('properties').select('id, title, city, district, property_type')
    .limit(params.limit || 100);

  let upserted = 0;
  for (const p of (properties || [])) {
    const { data: txCount } = await sb.from('transactions').select('id', { count: 'exact', head: true })
      .eq('property_id', p.id);
    const { data: inquiryCount } = await sb.from('inquiries').select('id', { count: 'exact', head: true })
      .eq('property_id', p.id);

    const txDepth = txCount?.length || 0;
    const inquiries = inquiryCount?.length || 0;
    const signalDensity = Math.min(100, txDepth * 15 + inquiries * 5);
    const discoveryVelocity = Math.min(100, inquiries * 3);
    const centrality = Math.min(1, (txDepth * 0.3 + inquiries * 0.05 + (p.district ? 0.2 : 0)));

    await sb.from('gali_asset_discovery_graph').upsert({
      asset_id: p.id,
      asset_type: p.property_type || 'property',
      region: 'Indonesia',
      city: p.city || 'Unknown',
      district: p.district,
      transaction_history_depth: txDepth,
      signal_density_score: signalDensity,
      discovery_velocity: discoveryVelocity,
      graph_centrality_score: centrality,
      last_signal_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    upserted++;
  }

  await emitSignal(sb, 'gali_engine_cycle', 'gali_discovery', null, 'low', { assets_scanned: upserted });
  return { assets_scanned: upserted };
}

async function computeRouting(sb: any, params: any) {
  const { data: assets } = await sb.from('gali_asset_discovery_graph').select('*')
    .order('signal_density_score', { ascending: false }).limit(params.limit || 200);

  let routed = 0;
  for (const a of (assets || [])) {
    const exitProb = Math.min(100, a.signal_density_score * 0.4 + a.discovery_velocity * 0.3 + a.graph_centrality_score * 100 * 0.3);
    const intentAlignment = Math.min(100, a.discovery_velocity * 0.5 + a.signal_density_score * 0.5);
    const geoWeight = a.graph_centrality_score;
    const priority = exitProb >= 75 ? 'critical' : exitProb >= 50 ? 'high' : exitProb >= 25 ? 'standard' : 'low';
    const estDays = Math.max(7, Math.round(180 - exitProb * 1.5));

    await sb.from('gali_liquidity_routing').upsert({
      asset_id: a.asset_id,
      region: a.region,
      city: a.city,
      exit_probability_score: exitProb,
      investor_intent_alignment: intentAlignment,
      geographic_rebalance_weight: geoWeight,
      routing_priority: priority,
      estimated_days_to_exit: estDays,
      routing_confidence: Math.min(100, exitProb * 0.7 + intentAlignment * 0.3),
      last_routed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    routed++;
  }

  return { assets_routed: routed };
}

async function computeValuation(sb: any, params: any) {
  const { data: assets } = await sb.from('gali_asset_discovery_graph').select('*')
    .order('graph_centrality_score', { ascending: false }).limit(params.limit || 200);

  let computed = 0;
  for (const a of (assets || [])) {
    const comparable = Math.min(100, a.transaction_history_depth * 10 + 20);
    const liquidityVelocity = a.discovery_velocity;
    const macroGrowth = 55 + Math.random() * 20; // simulated macro
    const assetPerf = a.signal_density_score * 0.8;
    const uvi = comparable * 0.3 + liquidityVelocity * 0.25 + macroGrowth * 0.25 + assetPerf * 0.2;
    const tier = uvi >= 80 ? 'premium' : uvi >= 60 ? 'institutional' : uvi >= 40 ? 'standard' : 'emerging';

    await sb.from('gali_valuation_intelligence').insert({
      asset_id: a.asset_id,
      region: a.region,
      city: a.city,
      comparable_score: comparable,
      liquidity_velocity_score: liquidityVelocity,
      macro_growth_score: macroGrowth,
      asset_performance_score: assetPerf,
      universal_valuation_index: uvi,
      confidence_level: Math.min(100, comparable * 0.5 + a.transaction_history_depth * 5),
      valuation_tier: tier,
      price_efficiency_ratio: 0.85 + Math.random() * 0.3,
      computed_at: new Date().toISOString(),
    });
    computed++;
  }

  return { valuations_computed: computed };
}

async function measureFriction(sb: any, params: any) {
  const { data: routing } = await sb.from('gali_liquidity_routing').select('region, city')
    .order('exit_probability_score', { ascending: false });

  const cityMap = new Map<string, number>();
  for (const r of (routing || [])) {
    const key = `${r.region}|${r.city}`;
    cityMap.set(key, (cityMap.get(key) || 0) + 1);
  }

  let measured = 0;
  for (const [key, count] of cityMap) {
    const [region, city] = key.split('|');
    const ddHours = Math.max(8, 120 - count * 2);
    const vendorSync = Math.max(2, 48 - count);
    const negoDays = Math.max(3, 30 - count * 0.5);
    const totalFriction = Math.max(5, 100 - count * 1.5);
    const reductionPct = Math.min(95, count * 1.5);
    const automationPct = Math.min(90, 20 + count * 1.2);
    const bottleneck = ddHours > vendorSync * 2 ? 'due_diligence' : negoDays > 15 ? 'negotiation' : 'vendor_sync';

    await sb.from('gali_friction_compression').upsert({
      region, city,
      due_diligence_avg_hours: ddHours,
      vendor_sync_latency_hours: vendorSync,
      negotiation_cycle_days: negoDays,
      total_friction_score: totalFriction,
      friction_reduction_pct: reductionPct,
      automation_coverage_pct: automationPct,
      bottleneck_stage: bottleneck,
      bottleneck_action: `Optimize ${bottleneck.replace('_', ' ')}`,
      transactions_measured: count,
      measured_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    measured++;
  }

  return { cities_measured: measured };
}

async function computeNetworkEffects(sb: any, params: any) {
  const { data: friction } = await sb.from('gali_friction_compression').select('*');
  const { data: valuations } = await sb.from('gali_valuation_intelligence').select('city, universal_valuation_index, confidence_level');

  const cityValMap = new Map<string, { totalUvi: number; totalConf: number; count: number }>();
  for (const v of (valuations || [])) {
    const entry = cityValMap.get(v.city) || { totalUvi: 0, totalConf: 0, count: 0 };
    entry.totalUvi += v.universal_valuation_index;
    entry.totalConf += v.confidence_level;
    entry.count++;
    cityValMap.set(v.city, entry);
  }

  let computed = 0;
  for (const f of (friction || [])) {
    const valData = cityValMap.get(f.city) || { totalUvi: 0, totalConf: 0, count: 0 };
    const avgAccuracy = valData.count > 0 ? valData.totalConf / valData.count : 30;
    const trustIndex = Math.min(100, avgAccuracy * 0.5 + f.automation_coverage_pct * 0.3 + f.friction_reduction_pct * 0.2);
    const authorityScore = Math.min(100, trustIndex * 0.4 + f.transactions_measured * 0.5 + f.friction_reduction_pct * 0.1);
    const multiplier = 1 + (authorityScore / 100) * 2 + (trustIndex / 100);
    const transparencyIdx = Math.min(100, f.automation_coverage_pct * 0.6 + avgAccuracy * 0.4);
    const liquidityConc = Math.min(100, f.transactions_measured * 0.8);
    const compVelocity = multiplier * (authorityScore / 100);
    const stage = authorityScore >= 85 ? 'dominant' : authorityScore >= 65 ? 'accelerating' : authorityScore >= 40 ? 'growing' : 'nascent';
    const projected = Math.min(100, authorityScore + compVelocity * 3);
    const rpm = multiplier * f.transactions_measured * 0.1;

    await sb.from('gali_network_expansion').upsert({
      region: f.region,
      city: f.city,
      total_transactions_30d: f.transactions_measured,
      valuation_accuracy_pct: avgAccuracy,
      investor_trust_index: trustIndex,
      platform_authority_score: authorityScore,
      network_effect_multiplier: multiplier,
      transparency_index: transparencyIdx,
      liquidity_concentration_pct: liquidityConc,
      compounding_velocity: compVelocity,
      growth_stage: stage,
      projected_authority_90d: projected,
      flywheel_rpm: rpm,
      computed_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    computed++;
  }

  await emitSignal(sb, 'gali_engine_cycle', 'gali_network', null, 'low', { cities_computed: computed });
  return { cities_computed: computed };
}

async function getDashboard(sb: any) {
  const [discovery, routing, valuation, friction, network] = await Promise.all([
    sb.from('gali_asset_discovery_graph').select('*').order('graph_centrality_score', { ascending: false }).limit(20),
    sb.from('gali_liquidity_routing').select('*').order('exit_probability_score', { ascending: false }).limit(20),
    sb.from('gali_valuation_intelligence').select('*').order('universal_valuation_index', { ascending: false }).limit(20),
    sb.from('gali_friction_compression').select('*').order('total_friction_score', { ascending: true }).limit(20),
    sb.from('gali_network_expansion').select('*').order('platform_authority_score', { ascending: false }).limit(20),
  ]);

  return {
    discovery_graph: discovery.data || [],
    liquidity_routing: routing.data || [],
    valuation_intelligence: valuation.data || [],
    friction_compression: friction.data || [],
    network_expansion: network.data || [],
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
