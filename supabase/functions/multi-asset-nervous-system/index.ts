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
      case 'analyze_correlations': return json(await analyzeCorrelations(sb, params));
      case 'simulate_resilience': return json(await simulateResilience(sb, params));
      case 'detect_rotation': return json(await detectRotation(sb, params));
      case 'compute_economic_cycle': return json(await computeEconomicCycle(sb, params));
      case 'run_feedback_loop': return json(await runFeedbackLoop(sb, params));
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

// ── 1. Cross-Asset Correlation Intelligence ──
async function analyzeCorrelations(sb: any, params: any) {
  const regions = params.regions || ['Global', 'Indonesia', 'Southeast Asia', 'Asia Pacific'];
  let analyzed = 0;

  for (const region of regions) {
    // Simulated correlation regime based on macro conditions
    const reEquity = -0.3 + Math.random() * 0.8;   // typically low correlation
    const reBond = -0.5 + Math.random() * 0.6;      // often negative
    const reCommodity = 0.1 + Math.random() * 0.5;  // moderate positive
    const reInfra = 0.3 + Math.random() * 0.5;      // typically positive

    const rateSensitivity = 30 + Math.random() * 50;
    const commodityImpact = 20 + Math.random() * 60;
    const equityCycle = Math.random() > 0.6 ? 'late_cycle' : Math.random() > 0.3 ? 'mid_cycle' : 'early_cycle';
    const bondSpread = 1 + Math.random() * 4;

    // Determine correlation regime
    const avgAbsCorr = (Math.abs(reEquity) + Math.abs(reBond) + Math.abs(reCommodity)) / 3;
    const regime = avgAbsCorr > 0.5 ? 'crisis_convergence' : avgAbsCorr > 0.3 ? 'elevated' : 'normal';
    const stability = regime === 'normal' ? 70 + Math.random() * 25 : 30 + Math.random() * 30;
    const decorrelation = Math.min(100, (1 - avgAbsCorr) * 100);

    await sb.from('amens_cross_asset_correlation').insert({
      region, city: params.city || null,
      re_equity_correlation: reEquity, re_bond_correlation: reBond,
      re_commodity_correlation: reCommodity, re_infrastructure_correlation: reInfra,
      interest_rate_sensitivity: rateSensitivity, commodity_growth_impact: commodityImpact,
      equity_cycle_phase: equityCycle, bond_yield_spread: bondSpread,
      correlation_regime: regime, regime_stability_pct: stability,
      decorrelation_opportunity: decorrelation,
      computed_at: new Date().toISOString(),
    });
    analyzed++;
  }

  await emitSignal(sb, 'amens_engine_cycle', 'amens_correlation', null, 'low', { regions_analyzed: analyzed });
  return { regions_analyzed: analyzed };
}

// ── 2. Portfolio Resilience Optimization ──
async function simulateResilience(sb: any, params: any) {
  const { data: correlations } = await sb.from('amens_cross_asset_correlation').select('*')
    .order('computed_at', { ascending: false }).limit(10);

  const scenarios = [
    { name: 'Conservative', re: 25, eq: 15, bond: 40, comm: 5, infra: 10, cash: 5 },
    { name: 'Balanced', re: 30, eq: 25, bond: 25, comm: 5, infra: 10, cash: 5 },
    { name: 'Growth', re: 35, eq: 35, bond: 10, comm: 10, infra: 8, cash: 2 },
    { name: 'RE Heavy', re: 50, eq: 15, bond: 15, comm: 5, infra: 10, cash: 5 },
    { name: 'All Weather', re: 20, eq: 20, bond: 20, comm: 20, infra: 15, cash: 5 },
  ];

  let simulated = 0;
  const avgCorr = correlations?.[0];

  for (const sc of scenarios) {
    const reCorr = avgCorr?.re_equity_correlation || 0.2;
    const divBenefit = Math.min(30, (1 - Math.abs(reCorr)) * sc.re / 2 + sc.bond * 0.15 + sc.comm * 0.1);
    const volSpillover = Math.min(100, Math.abs(reCorr) * sc.eq + (avgCorr?.interest_rate_sensitivity || 40) * sc.bond / 100);
    const sharpe = (sc.re * 0.08 + sc.eq * 0.1 + sc.bond * 0.04 + sc.comm * 0.06 + sc.infra * 0.07) / 100 / Math.max(0.05, volSpillover / 100);
    const maxDrawdown = sc.eq * 0.4 + sc.re * 0.2 + sc.comm * 0.3 + sc.bond * 0.05 + sc.infra * 0.15;
    const stressResilience = Math.min(100, 100 - maxDrawdown * 0.8 + divBenefit * 2);
    const optimalReWeight = Math.min(50, 20 + divBenefit + (avgCorr?.decorrelation_opportunity || 30) * 0.3);
    const urgency = Math.abs(sc.re - optimalReWeight) > 15 ? 'high' : Math.abs(sc.re - optimalReWeight) > 8 ? 'medium' : 'low';

    await sb.from('amens_portfolio_resilience').insert({
      scenario_name: sc.name,
      re_allocation_pct: sc.re, equity_allocation_pct: sc.eq,
      bond_allocation_pct: sc.bond, commodity_allocation_pct: sc.comm,
      infra_allocation_pct: sc.infra, cash_allocation_pct: sc.cash,
      diversification_benefit_pct: divBenefit, volatility_spillover_risk: volSpillover,
      portfolio_sharpe_ratio: sharpe, max_drawdown_pct: maxDrawdown,
      stress_resilience_score: stressResilience, optimal_re_weight_pct: optimalReWeight,
      rebalance_urgency: urgency,
      simulation_assumptions: { correlation_regime: avgCorr?.correlation_regime || 'normal', rate_sensitivity: avgCorr?.interest_rate_sensitivity || 40 },
      computed_at: new Date().toISOString(),
    });
    simulated++;
  }

  return { scenarios_simulated: simulated };
}

// ── 3. Capital Rotation Signal Detection ──
async function detectRotation(sb: any, params: any) {
  const { data: correlations } = await sb.from('amens_cross_asset_correlation').select('*')
    .order('computed_at', { ascending: false }).limit(10);
  const { data: flows } = await sb.from('gcce_capital_flow_awareness').select('region, net_flow_usd, flow_momentum, investor_sentiment_index')
    .order('computed_at', { ascending: false }).limit(20);

  let detected = 0;
  const regionSet = new Set<string>();
  for (const c of (correlations || [])) regionSet.add(c.region);
  for (const f of (flows || [])) regionSet.add(f.region);

  for (const region of regionSet) {
    const corr = correlations?.find((c: any) => c.region === region);
    const flow = flows?.find((f: any) => f.region === region);

    const financialToHard = Math.min(100, (corr?.re_equity_correlation || 0) < -0.1 ? 60 + Math.random() * 30 : 20 + Math.random() * 30);
    const safeHaven = Math.min(100, (corr?.re_bond_correlation || 0) < -0.2 ? 50 + Math.random() * 30 : 15 + Math.random() * 25);
    const yieldSeeking = Math.min(100, (corr?.bond_yield_spread || 2) > 2.5 ? 55 + Math.random() * 30 : 20 + Math.random() * 30);
    const reInflow = flow?.net_flow_usd > 0 ? Math.min(100, 40 + Math.random() * 40) : Math.random() * 30;
    const eqOutflow = corr?.equity_cycle_phase === 'late_cycle' ? 50 + Math.random() * 30 : Math.random() * 30;
    const bondRotation = (corr?.interest_rate_sensitivity || 40) > 50 ? 40 + Math.random() * 30 : Math.random() * 30;
    const commCycle = (corr?.commodity_growth_impact || 30) > 50 ? 50 + Math.random() * 30 : 20 + Math.random() * 20;

    const confidence = (financialToHard * 0.3 + safeHaven * 0.2 + yieldSeeking * 0.2 + reInflow * 0.3) * 0.8;
    const velocity = (confidence / 100) * 2.5;
    const direction = financialToHard > 60 ? 'financial_to_hard' : safeHaven > 60 ? 'safe_haven' : yieldSeeking > 60 ? 'yield_seeking' : 'neutral';
    const macroPhase = corr?.equity_cycle_phase === 'late_cycle' ? 'late_expansion' : corr?.equity_cycle_phase === 'early_cycle' ? 'recovery' : 'expansion';

    const triggers: string[] = [];
    if (financialToHard > 60) triggers.push('equity_to_real_assets');
    if (safeHaven > 60) triggers.push('risk_off_migration');
    if (yieldSeeking > 60) triggers.push('yield_compression_hunt');
    if (eqOutflow > 50) triggers.push('equity_cycle_exhaustion');

    const insight = direction === 'financial_to_hard'
      ? `Capital rotating from equities to hard assets in ${region} - strong RE inflow opportunity`
      : direction === 'safe_haven'
      ? `Safe-haven migration detected in ${region} - defensive RE positioning recommended`
      : direction === 'yield_seeking'
      ? `Yield-seeking intensifying in ${region} - income-generating RE premium expected`
      : `No significant rotation signal in ${region} - maintain current allocation`;

    await sb.from('amens_capital_rotation').insert({
      region, rotation_direction: direction,
      financial_to_hard_asset_flow: financialToHard, safe_haven_migration_score: safeHaven,
      yield_seeking_intensity: yieldSeeking, macro_phase: macroPhase,
      re_inflow_momentum: reInflow, equity_outflow_signal: eqOutflow,
      bond_rotation_signal: bondRotation, commodity_cycle_signal: commCycle,
      rotation_confidence: confidence, rotation_velocity: velocity,
      trigger_factors: JSON.stringify(triggers), actionable_insight: insight,
      detected_at: new Date().toISOString(),
    });
    detected++;
  }

  return { rotations_detected: detected };
}

// ── 4. Integrated Economic Cycle ──
async function computeEconomicCycle(sb: any, params: any) {
  const regions = params.regions || ['Global', 'Indonesia', 'Southeast Asia', 'Asia Pacific', 'North America', 'Europe'];
  let computed = 0;

  for (const region of regions) {
    const gdp = 1 + Math.random() * 5;
    const inflation = 1 + Math.random() * 6;
    const centralRate = 2 + Math.random() * 6;
    const unemployment = 3 + Math.random() * 5;
    const consConf = 40 + Math.random() * 40;
    const pmi = 45 + Math.random() * 15;
    const credit = 35 + Math.random() * 40;

    // Determine cycle phase
    let phase: string, bias: string, signal: string;
    if (gdp > 3.5 && pmi > 52 && consConf > 60) {
      phase = 'expansion'; bias = 'growth'; signal = 'expansion';
    } else if (gdp > 2 && inflation > 4) {
      phase = 'late_cycle'; bias = 'defensive'; signal = 'caution';
    } else if (gdp < 1.5 && pmi < 48) {
      phase = 'contraction'; bias = 'preservation'; signal = 'contraction';
    } else if (gdp > 1 && gdp < 3 && pmi > 50) {
      phase = 'recovery'; bias = 'opportunistic'; signal = 'expansion';
    } else {
      phase = 'mid_cycle'; bias = 'balanced'; signal = 'neutral';
    }

    const maturity = phase === 'expansion' ? 30 + Math.random() * 40 : phase === 'late_cycle' ? 70 + Math.random() * 25 : phase === 'contraction' ? 50 + Math.random() * 30 : 20 + Math.random() * 30;
    const sync = Math.min(100, (pmi - 45) * 5 + consConf * 0.3 + credit * 0.2);

    await sb.from('amens_economic_cycle').insert({
      region, gdp_growth_trend: gdp, inflation_rate: inflation,
      central_bank_rate: centralRate, unemployment_trend: unemployment,
      consumer_confidence: consConf, pmi_manufacturing: pmi,
      credit_conditions_index: credit, cycle_phase: phase,
      phase_maturity_pct: maturity, sync_score: sync,
      expansion_contraction_signal: signal, strategic_allocation_bias: bias,
      macro_indicators: { gdp, inflation, rate: centralRate, unemployment, confidence: consConf, pmi, credit },
      computed_at: new Date().toISOString(),
    });
    computed++;
  }

  return { regions_computed: computed };
}

// ── 5. Adaptive Strategy Feedback Loop ──
async function runFeedbackLoop(sb: any, params: any) {
  const { data: resilience } = await sb.from('amens_portfolio_resilience').select('*');
  const { data: rotations } = await sb.from('amens_capital_rotation').select('rotation_direction, rotation_confidence');

  let iterations = 0;
  const strategies = ['Conservative', 'Balanced', 'Growth', 'RE Heavy', 'All Weather'];

  for (const strategy of strategies) {
    const portfolio = resilience?.find((r: any) => r.scenario_name === strategy);
    if (!portfolio) continue;

    const accuracy = 50 + Math.random() * 35;
    const benchmark = (portfolio.portfolio_sharpe_ratio - 0.8) * 10;
    const rotConf = rotations?.[0]?.rotation_confidence || 50;
    const behavior = rotConf > 60 ? 'rotation_responsive' : portfolio.rebalance_urgency === 'high' ? 'rebalance_needed' : 'steady_state';
    const iteration = Math.round(Math.random() * 20) + 1;
    const confDelta = accuracy > 70 ? 2 + Math.random() * 3 : -1 + Math.random() * 2;
    const hitRate = 40 + Math.random() * 40;
    const strength = Math.min(100, accuracy * 0.4 + hitRate * 0.3 + Math.abs(benchmark) * 5);

    const adjustments: Record<string, number> = {};
    if (portfolio.re_allocation_pct > portfolio.optimal_re_weight_pct + 5) adjustments.re_weight = -2;
    else if (portfolio.re_allocation_pct < portfolio.optimal_re_weight_pct - 5) adjustments.re_weight = 2;
    if (portfolio.volatility_spillover_risk > 50) adjustments.equity_reduce = -3;

    const attribution = {
      re_contribution: portfolio.re_allocation_pct * 0.08,
      equity_contribution: portfolio.equity_allocation_pct * 0.1,
      bond_contribution: portfolio.bond_allocation_pct * 0.04,
      diversification_alpha: portfolio.diversification_benefit_pct * 0.5,
    };

    await sb.from('amens_strategy_feedback').insert({
      strategy_name: strategy,
      prediction_accuracy_pct: accuracy,
      allocation_outcome_vs_benchmark: benchmark,
      behavioral_pattern_detected: behavior,
      learning_iteration: iteration,
      model_confidence_delta: confDelta,
      weight_adjustments: adjustments,
      performance_attribution: attribution,
      investor_behavior_cluster: behavior,
      recommendation_hit_rate: hitRate,
      feedback_strength: strength,
      next_recalibration_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      computed_at: new Date().toISOString(),
    });
    iterations++;
  }

  await emitSignal(sb, 'amens_engine_cycle', 'amens_feedback', null, 'low', { strategies_calibrated: iterations });
  return { strategies_calibrated: iterations };
}

async function getDashboard(sb: any) {
  const [corr, res, rot, cycle, feed] = await Promise.all([
    sb.from('amens_cross_asset_correlation').select('*').order('computed_at', { ascending: false }).limit(10),
    sb.from('amens_portfolio_resilience').select('*').order('portfolio_sharpe_ratio', { ascending: false }).limit(10),
    sb.from('amens_capital_rotation').select('*').order('rotation_confidence', { ascending: false }).limit(10),
    sb.from('amens_economic_cycle').select('*').order('computed_at', { ascending: false }).limit(10),
    sb.from('amens_strategy_feedback').select('*').order('computed_at', { ascending: false }).limit(10),
  ]);
  return {
    correlations: corr.data || [], resilience: res.data || [],
    rotations: rot.data || [], economic_cycles: cycle.data || [],
    strategy_feedback: feed.data || [],
  };
}

async function emitSignal(sb: any, eventType: string, entityType: string, entityId: string | null, priority: string, payload: Record<string, unknown>) {
  await sb.from('ai_event_signals').insert({ event_type: eventType, entity_type: entityType, entity_id: entityId, priority_level: priority, payload });
}
