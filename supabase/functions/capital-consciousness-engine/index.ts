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
      case 'analyze_flows': return json(await analyzeFlows(sb, params));
      case 'map_systemic_risk': return json(await mapSystemicRisk(sb, params));
      case 'forecast_cycles': return json(await forecastCycles(sb, params));
      case 'simulate_scenario': return json(await simulateScenario(sb, params));
      case 'generate_insights': return json(await generateInsights(sb, params));
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

async function analyzeFlows(sb: any, params: any) {
  const { data: liquidity } = await sb.from('market_liquidity_metrics').select('*').limit(200);
  const { data: properties } = await sb.from('properties').select('city, district, price, status')
    .eq('status', 'active').limit(500);

  const cityAgg = new Map<string, { count: number; totalPrice: number; city: string }>();
  for (const p of (properties || [])) {
    const c = p.city || 'Unknown';
    const a = cityAgg.get(c) || { count: 0, totalPrice: 0, city: c };
    a.count++;
    a.totalPrice += Number(p.price) || 0;
    cityAgg.set(c, a);
  }

  let analyzed = 0;
  for (const [, agg] of cityAgg) {
    const inflow = agg.totalPrice * 0.12;
    const outflow = agg.totalPrice * (0.04 + Math.random() * 0.06);
    const net = inflow - outflow;
    const direction = net > 0 ? 'inflow' : net < 0 ? 'outflow' : 'neutral';
    const concentration = Math.min(100, agg.count * 1.5);
    const corridor = Math.min(100, (net > 0 ? net / inflow * 100 : 0) * 0.6 + concentration * 0.4);
    const sentiment = 50 + (net > 0 ? Math.min(30, net / inflow * 50) : Math.max(-30, net / (outflow || 1) * -50));
    const crossBorder = 5 + Math.random() * 25;
    const momentum = net > inflow * 0.1 ? 'accelerating' : net > 0 ? 'stable' : net > -outflow * 0.1 ? 'decelerating' : 'contracting';
    const rotation = concentration > 60 ? 'concentrated' : corridor > 50 ? 'diversifying' : 'rotating';

    await sb.from('gcce_capital_flow_awareness').insert({
      region: 'Indonesia', city: agg.city, sector: 'residential',
      inflow_velocity_usd: inflow, outflow_velocity_usd: outflow,
      net_flow_usd: net, flow_direction: direction,
      sector_rotation_signal: rotation,
      liquidity_concentration_pct: concentration,
      opportunity_corridor_score: corridor,
      investor_sentiment_index: sentiment,
      cross_border_flow_pct: crossBorder,
      flow_momentum: momentum,
      computed_at: new Date().toISOString(),
    });
    analyzed++;
  }

  await emitSignal(sb, 'gcce_engine_cycle', 'gcce_flows', null, 'low', { cities_analyzed: analyzed });
  return { cities_analyzed: analyzed };
}

async function mapSystemicRisk(sb: any, params: any) {
  const { data: flows } = await sb.from('gcce_capital_flow_awareness').select('*')
    .order('computed_at', { ascending: false }).limit(100);

  let mapped = 0;
  for (const f of (flows || [])) {
    const overheat = Math.min(100,
      (f.liquidity_concentration_pct > 70 ? 40 : f.liquidity_concentration_pct * 0.4) +
      (f.flow_momentum === 'accelerating' ? 30 : f.flow_momentum === 'stable' ? 10 : 0) +
      (f.investor_sentiment_index > 75 ? 25 : f.investor_sentiment_index * 0.2)
    );
    const debtStress = Math.min(100, 20 + Math.random() * 30 + (f.flow_direction === 'outflow' ? 25 : 0));
    const withdrawalRate = f.flow_direction === 'outflow' ? Math.abs(f.outflow_velocity_usd) / (Math.abs(f.inflow_velocity_usd) || 1) * 100 : Math.random() * 15;
    const shockProp = Math.min(100, overheat * 0.3 + debtStress * 0.3 + withdrawalRate * 0.2 + f.cross_border_flow_pct * 0.8);
    const priceToIncome = 8 + Math.random() * 12;
    const creditGrowth = -5 + Math.random() * 20;
    const vacancy = 3 + Math.random() * 15;
    const composite = overheat * 0.25 + debtStress * 0.25 + shockProp * 0.2 + (withdrawalRate > 50 ? 20 : withdrawalRate * 0.3) + vacancy * 0.5;
    const regime = composite >= 75 ? 'critical' : composite >= 55 ? 'elevated' : composite >= 35 ? 'cautionary' : 'normal';

    const warnings: string[] = [];
    if (overheat > 60) warnings.push('market_overheating');
    if (debtStress > 60) warnings.push('debt_stress_rising');
    if (withdrawalRate > 40) warnings.push('capital_flight_risk');
    if (priceToIncome > 15) warnings.push('affordability_strain');

    const contagion: string[] = [];
    if (f.cross_border_flow_pct > 20) contagion.push('cross_border_exposure');
    if (f.liquidity_concentration_pct > 60) contagion.push('concentration_contagion');

    await sb.from('gcce_systemic_risk').insert({
      region: f.region, city: f.city,
      overheat_index: overheat, debt_stress_indicator: debtStress,
      capital_withdrawal_rate: withdrawalRate,
      shock_propagation_risk: shockProp,
      price_to_income_ratio: priceToIncome,
      credit_growth_deviation: creditGrowth,
      vacancy_rate_trend: vacancy,
      composite_systemic_risk: composite,
      risk_regime: regime,
      early_warnings: JSON.stringify(warnings),
      contagion_pathways: JSON.stringify(contagion),
      stress_test_scenario: composite > 60 ? 'requires_monitoring' : 'stable',
      computed_at: new Date().toISOString(),
    });
    mapped++;
  }

  return { cities_risk_mapped: mapped };
}

async function forecastCycles(sb: any, params: any) {
  const { data: flows } = await sb.from('gcce_capital_flow_awareness').select('*');
  const { data: risks } = await sb.from('gcce_systemic_risk').select('city, composite_systemic_risk, overheat_index');

  const riskMap = new Map<string, any>();
  for (const r of (risks || [])) riskMap.set(r.city, r);

  let forecasted = 0;
  for (const f of (flows || [])) {
    const r = riskMap.get(f.city);
    const riskScore = r?.composite_systemic_risk || 30;
    const overheat = r?.overheat_index || 20;

    // Determine cycle phase
    let phase: string, maturity: number;
    if (f.flow_momentum === 'accelerating' && overheat < 50) { phase = 'expansion'; maturity = 40 + Math.random() * 30; }
    else if (overheat > 65) { phase = 'peak'; maturity = 70 + Math.random() * 25; }
    else if (f.flow_momentum === 'contracting') { phase = 'contraction'; maturity = 30 + Math.random() * 40; }
    else if (f.flow_momentum === 'decelerating') { phase = 'late_cycle'; maturity = 60 + Math.random() * 30; }
    else { phase = 'recovery'; maturity = 10 + Math.random() * 40; }

    const demoGrowth = 40 + Math.random() * 40;
    const infraPipeline = 30 + Math.random() * 50;
    const urbanMigration = 35 + Math.random() * 45;
    const yieldCompression = phase === 'expansion' ? 0.5 + Math.random() * 2 : phase === 'contraction' ? -1 - Math.random() : Math.random() * 0.5;
    const yieldSpread = 1.5 + Math.random() * 4;
    const windowMonths = phase === 'recovery' ? 24 + Math.round(Math.random() * 36) : phase === 'expansion' ? 12 + Math.round(Math.random() * 24) : Math.round(Math.random() * 12);
    const structural = demoGrowth * 0.3 + infraPipeline * 0.3 + urbanMigration * 0.2 + (100 - riskScore) * 0.2;
    const conviction = Math.min(100, structural * 0.5 + (100 - riskScore) * 0.3 + f.opportunity_corridor_score * 0.2);
    const timing = conviction > 70 && phase === 'recovery' ? 'strong_buy' : conviction > 60 && phase === 'expansion' ? 'buy' : phase === 'peak' ? 'reduce' : phase === 'contraction' ? 'avoid' : 'hold';

    await sb.from('gcce_opportunity_cycles').insert({
      region: f.region, city: f.city,
      cycle_phase: phase, phase_maturity_pct: maturity,
      demographic_growth_score: demoGrowth,
      infrastructure_pipeline_score: infraPipeline,
      urban_migration_intensity: urbanMigration,
      yield_compression_rate: yieldCompression,
      yield_spread_vs_benchmark: yieldSpread,
      opportunity_window_months: windowMonths,
      structural_advantage_score: structural,
      long_term_conviction_index: conviction,
      cycle_timing_signal: timing,
      forecast_horizon_years: 5,
      computed_at: new Date().toISOString(),
    });
    forecasted++;
  }

  return { cities_forecasted: forecasted };
}

async function simulateScenario(sb: any, params: any) {
  const { data: cycles } = await sb.from('gcce_opportunity_cycles').select('*');
  const { data: risks } = await sb.from('gcce_systemic_risk').select('city, composite_systemic_risk');

  const riskMap = new Map<string, number>();
  for (const r of (risks || [])) riskMap.set(r.city, r.composite_systemic_risk);

  const scenarios = ['base_case', 'bull_case', 'bear_case'];
  let simulated = 0;

  for (const c of (cycles || [])) {
    const riskScore = riskMap.get(c.city) || 30;

    for (const scenario of scenarios) {
      const multiplier = scenario === 'bull_case' ? 1.3 : scenario === 'bear_case' ? 0.6 : 1.0;
      const irr = c.long_term_conviction_index * 0.15 * multiplier - riskScore * 0.05;
      const multiple = 1 + irr / 100 * c.forecast_horizon_years;
      const drawdown = scenario === 'bear_case' ? riskScore * 0.6 : riskScore * 0.2;
      const upside = scenario === 'bull_case' ? c.structural_advantage_score * 0.5 : c.structural_advantage_score * 0.2;
      const riskAdjReturn = irr - drawdown * 0.3;
      const exposure = 100 / (cycles?.length || 1);
      const optimal = Math.min(30, c.long_term_conviction_index * 0.25 * multiplier);
      const resilience = Math.min(100, (100 - riskScore) * 0.6 + c.structural_advantage_score * 0.4);
      const probability = scenario === 'base_case' ? 50 : scenario === 'bull_case' ? 25 : 25;

      await sb.from('gcce_scenario_simulation').insert({
        scenario_name: `${c.city} ${scenario.replace('_', ' ')}`,
        scenario_type: scenario,
        region: c.region, city: c.city,
        capital_deployed_usd: 1000000 * optimal,
        projected_irr_pct: irr, projected_multiple: multiple,
        downside_drawdown_pct: drawdown,
        upside_potential_pct: upside,
        risk_adjusted_return: riskAdjReturn,
        regional_exposure_pct: exposure,
        optimal_allocation_pct: optimal,
        stress_resilience_score: resilience,
        scenario_probability_pct: probability,
        assumptions: { cycle_phase: c.cycle_phase, conviction: c.long_term_conviction_index, risk: riskScore },
        simulation_result: { irr, multiple, drawdown, upside, resilience },
        simulated_at: new Date().toISOString(),
      });
      simulated++;
    }
  }

  return { scenarios_simulated: simulated };
}

async function generateInsights(sb: any, params: any) {
  const { data: flows } = await sb.from('gcce_capital_flow_awareness').select('*');
  const { data: risks } = await sb.from('gcce_systemic_risk').select('*');
  const { data: cycles } = await sb.from('gcce_opportunity_cycles').select('*');

  const riskMap = new Map<string, any>();
  for (const r of (risks || [])) riskMap.set(r.city, r);
  const cycleMap = new Map<string, any>();
  for (const c of (cycles || [])) cycleMap.set(c.city, c);

  let generated = 0;
  for (const f of (flows || [])) {
    const r = riskMap.get(f.city);
    const c = cycleMap.get(f.city);
    if (!r || !c) continue;

    const riskOverlay = r.composite_systemic_risk;
    const oppOverlay = c.long_term_conviction_index;
    const confidence = Math.min(100, oppOverlay * 0.4 + (100 - riskOverlay) * 0.3 + f.opportunity_corridor_score * 0.3);

    let recommendation: string, thesis: string, timing: string, urgency: string;
    if (oppOverlay > 70 && riskOverlay < 40) {
      recommendation = 'Strong allocation recommended';
      thesis = `${f.city} shows high structural advantage with manageable risk in ${c.cycle_phase} phase`;
      timing = 'deploy';
      urgency = 'high';
    } else if (oppOverlay > 50 && riskOverlay < 60) {
      recommendation = 'Moderate allocation with hedging';
      thesis = `${f.city} offers balanced risk-reward in ${c.cycle_phase}, deploy with downside protection`;
      timing = 'selective_entry';
      urgency = 'medium';
    } else if (riskOverlay > 65) {
      recommendation = 'Reduce exposure and monitor';
      thesis = `${f.city} faces ${r.risk_regime} risk regime, prioritize capital preservation`;
      timing = 'defer';
      urgency = 'high';
    } else {
      recommendation = 'Monitor for entry signals';
      thesis = `${f.city} in ${c.cycle_phase} phase, await stronger conviction signals`;
      timing = 'monitor';
      urgency = 'low';
    }

    const signals = [
      { type: 'flow', signal: f.flow_momentum, value: f.net_flow_usd },
      { type: 'risk', signal: r.risk_regime, value: riskOverlay },
      { type: 'cycle', signal: c.cycle_phase, value: c.phase_maturity_pct },
      { type: 'timing', signal: c.cycle_timing_signal, value: oppOverlay },
    ];

    const summary = `${f.city}: ${f.flow_momentum} capital flows, ${r.risk_regime} risk, ${c.cycle_phase} cycle at ${Math.round(c.phase_maturity_pct)}% maturity`;

    await sb.from('gcce_decision_support').insert({
      region: f.region, city: f.city,
      macro_signal_summary: summary,
      allocation_recommendation: recommendation,
      confidence_level: confidence,
      key_insight: thesis,
      supporting_signals: JSON.stringify(signals),
      risk_overlay_score: riskOverlay,
      opportunity_overlay_score: oppOverlay,
      timing_recommendation: timing,
      investment_thesis: thesis,
      decision_urgency: urgency,
      target_investor_profile: oppOverlay > 70 ? 'institutional' : 'diversified',
      generated_at: new Date().toISOString(),
    });
    generated++;
  }

  await emitSignal(sb, 'gcce_engine_cycle', 'gcce_insights', null, 'low', { insights_generated: generated });
  return { insights_generated: generated };
}

async function getDashboard(sb: any) {
  const [flows, risk, cycles, scenarios, decisions] = await Promise.all([
    sb.from('gcce_capital_flow_awareness').select('*').order('net_flow_usd', { ascending: false }).limit(20),
    sb.from('gcce_systemic_risk').select('*').order('composite_systemic_risk', { ascending: false }).limit(20),
    sb.from('gcce_opportunity_cycles').select('*').order('long_term_conviction_index', { ascending: false }).limit(20),
    sb.from('gcce_scenario_simulation').select('*').order('risk_adjusted_return', { ascending: false }).limit(30),
    sb.from('gcce_decision_support').select('*').order('confidence_level', { ascending: false }).limit(20),
  ]);

  return {
    capital_flows: flows.data || [],
    systemic_risk: risk.data || [],
    opportunity_cycles: cycles.data || [],
    scenario_simulations: scenarios.data || [],
    decision_support: decisions.data || [],
  };
}

async function emitSignal(sb: any, eventType: string, entityType: string, entityId: string | null, priority: string, payload: Record<string, unknown>) {
  await sb.from('ai_event_signals').insert({ event_type: eventType, entity_type: entityType, entity_id: entityId, priority_level: priority, payload });
}
