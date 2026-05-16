import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

const REGIONS = [
  { region: 'North-America', country: 'US' },
  { region: 'Western-Europe', country: 'EU' },
  { region: 'East-Asia', country: 'CN' },
  { region: 'Southeast-Asia', country: 'ID' },
  { region: 'South-Asia', country: 'IN' },
  { region: 'Middle-East', country: 'AE' },
  { region: 'Sub-Saharan-Africa', country: 'NG' },
  { region: 'Latin-America', country: 'BR' },
];

const COHORTS = ['boomer', 'gen-x', 'millennial', 'gen-z', 'gen-alpha'];
const SHOCK_TYPES = ['recession', 'pandemic', 'geopolitical', 'climate', 'tech_disruption', 'debt_crisis'];
const INTERVENTION_TYPES = ['policy_rate', 'fiscal_stimulus', 'macro_prudential', 'tax_reform', 'housing_policy', 'ubi_pilot'];

const r = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

// ── Mode handlers ──

async function monitorResilience(sb: ReturnType<typeof serviceClient>) {
  const rows = REGIONS.map(rg => {
    const bubble = r(5, 85);
    const leverage = r(50, 400);
    const leverageAcc = r(-10, 15);
    const depRatio = r(30, 75);
    const depTrend = depRatio > 55 ? 'aging' : depRatio < 40 ? 'youthful' : 'stable';
    const gini = r(25, 65);
    const ineqStress = gini > 50 ? r(60, 95) : gini > 40 ? r(30, 60) : r(5, 30);
    const afford = r(40, 200);
    const realWage = r(-3, 6);
    const debtGdp = r(30, 300);
    // Composite: lower = more resilient (invert for score where high = good)
    const riskRaw = bubble * 0.25 + (leverage / 400) * 100 * 0.2 + ineqStress * 0.2 + (debtGdp / 300) * 100 * 0.15 + (100 - afford / 2) * 0.2;
    const resilience = Math.max(0, Math.min(100, 100 - riskRaw));
    const regime = resilience < 25 ? 'critical' : resilience < 45 ? 'elevated' : resilience < 65 ? 'cautionary' : 'stable';
    return {
      region: rg.region, country: rg.country,
      bubble_formation_index: bubble, systemic_leverage_ratio: leverage,
      leverage_acceleration: leverageAcc, demographic_dependency_ratio: depRatio,
      dependency_trend: depTrend, inequality_gini_index: gini,
      inequality_stress_score: ineqStress, housing_affordability_index: afford,
      real_wage_growth_pct: realWage, debt_to_gdp_pct: debtGdp,
      composite_resilience_score: Math.round(resilience * 100) / 100,
      risk_regime: regime,
    };
  });
  const { error } = await sb.from('cwse_structural_resilience').insert(rows);
  if (error) throw error;
  return { regions_monitored: rows.length, regimes: Object.fromEntries(rows.map(r => [r.region, r.risk_regime])) };
}

async function simulateInterventions(sb: ReturnType<typeof serviceClient>) {
  const rows: Record<string, unknown>[] = [];
  for (const rg of REGIONS.slice(0, 5)) {
    for (let i = 0; i < 3; i++) {
      const iType = INTERVENTION_TYPES[Math.floor(r(0, INTERVENTION_TYPES.length))];
      const magnitude = r(-5, 10);
      const rebalance = r(-15, 15);
      const fiscal = r(20, 90);
      const gdpImpact = magnitude * r(0.2, 0.8);
      const inflImpact = iType === 'policy_rate' ? -magnitude * r(0.3, 0.6) : r(-2, 3);
      const empImpact = gdpImpact * r(0.3, 0.7);
      const housingImpact = iType === 'housing_policy' ? r(-10, 15) : gdpImpact * r(0.2, 0.5);
      const timeToEffect = Math.floor(r(3, 36));
      const effectiveness = Math.max(10, Math.min(95, fiscal * 0.3 + Math.abs(gdpImpact) * 5 * 0.3 + (100 - Math.abs(inflImpact) * 10) * 0.2 + empImpact * 3 * 0.2));
      const sideEffect = r(5, 60);
      const outcome = effectiveness > 70 ? 'stabilizing' : effectiveness > 45 ? 'neutral' : 'destabilizing';
      rows.push({
        scenario_name: `${rg.region}-${iType}-${i + 1}`, region: rg.region,
        intervention_type: iType, policy_lever: `${iType}_lever_${i}`,
        policy_magnitude: magnitude, capital_rebalance_pct: rebalance,
        fiscal_sustainability_score: fiscal, gdp_impact_pct: Math.round(gdpImpact * 100) / 100,
        inflation_impact_pct: Math.round(inflImpact * 100) / 100,
        employment_impact_pct: Math.round(empImpact * 100) / 100,
        housing_market_impact_pct: Math.round(housingImpact * 100) / 100,
        time_to_effect_months: timeToEffect,
        effectiveness_score: Math.round(effectiveness * 100) / 100,
        side_effect_risk: sideEffect, scenario_outcome: outcome,
      });
    }
  }
  const { error } = await sb.from('cwse_intervention_scenarios').insert(rows);
  if (error) throw error;
  return { scenarios_simulated: rows.length };
}

async function forecastGenerationalWealth(sb: ReturnType<typeof serviceClient>) {
  const rows: Record<string, unknown>[] = [];
  for (const rg of REGIONS) {
    for (const cohort of COHORTS) {
      const retDemand = cohort === 'boomer' ? r(70, 95) : cohort === 'gen-x' ? r(40, 70) : r(10, 40);
      const housingPressure = cohort === 'millennial' ? r(60, 90) : cohort === 'gen-z' ? r(50, 85) : r(20, 50);
      const prodGrowth = r(0.5, 4);
      const assetInflation = r(2, 12);
      const gap = assetInflation - prodGrowth;
      const transfer = r(1e4, 5e6);
      const transferEff = r(30, 85);
      const top10 = r(40, 80);
      const mobility = r(15, 75);
      const preserveRisk = gap > 5 ? r(60, 90) : gap > 2 ? r(30, 60) : r(10, 35);
      const genEquity = Math.max(10, Math.min(90, mobility * 0.4 + transferEff * 0.3 + (100 - top10) * 0.3));
      rows.push({
        region: rg.region, generation_cohort: cohort,
        retirement_demand_index: retDemand, housing_demand_pressure: housingPressure,
        productivity_growth_pct: prodGrowth, asset_inflation_pct: assetInflation,
        productivity_asset_gap: Math.round(gap * 100) / 100,
        intergenerational_transfer_usd: transfer, transfer_efficiency_pct: transferEff,
        wealth_concentration_top10_pct: top10, social_mobility_index: mobility,
        preservation_risk_score: preserveRisk, generational_equity_score: Math.round(genEquity * 100) / 100,
        forecast_horizon_years: cohort === 'gen-alpha' ? 50 : cohort === 'gen-z' ? 40 : 30,
      });
    }
  }
  const { error } = await sb.from('cwse_generational_wealth').insert(rows);
  if (error) throw error;
  return { cohorts_forecast: rows.length };
}

async function analyzeShockAbsorption(sb: ReturnType<typeof serviceClient>) {
  const rows: Record<string, unknown>[] = [];
  for (const rg of REGIONS) {
    for (let i = 0; i < 2; i++) {
      const shock = SHOCK_TYPES[Math.floor(r(0, SHOCK_TYPES.length))];
      const earlyWarn = r(15, 90);
      const signals: string[] = [];
      if (earlyWarn > 60) signals.push('yield_curve_inversion');
      if (earlyWarn > 40) signals.push('credit_spread_widening');
      if (earlyWarn > 30) signals.push('volatility_spike');
      signals.push('leading_indicator_decline');
      const buffer = r(10, 80);
      const diversification = r(20, 85);
      const preparedness = r(20, 80);
      const hedge = r(5, 30);
      const drawdown = r(5, 45);
      const recovery = Math.floor(r(6, 60));
      const absorption = (buffer * 0.3 + diversification * 0.3 + preparedness * 0.4);
      const deploy = absorption > 65 ? 'deploy_defensively' : absorption > 40 ? 'hold' : 'reduce_exposure';
      const urgency = earlyWarn > 70 ? 'immediate' : earlyWarn > 45 ? 'near_term' : 'monitor';
      rows.push({
        region: rg.region, shock_type: shock,
        early_warning_score: earlyWarn, warning_signals: signals,
        capital_buffer_adequacy_pct: buffer, diversification_benefit_score: diversification,
        institutional_preparedness: preparedness, recommended_hedge_allocation_pct: hedge,
        estimated_drawdown_pct: drawdown, recovery_time_months: recovery,
        absorption_capacity_score: Math.round(absorption * 100) / 100,
        deployment_adjustment: deploy, urgency: urgency,
      });
    }
  }
  const { error } = await sb.from('cwse_shock_absorption').insert(rows);
  if (error) throw error;
  return { shock_analyses: rows.length };
}

async function synthesizeInsights(sb: ReturnType<typeof serviceClient>) {
  const { data: resilience } = await sb.from('cwse_structural_resilience')
    .select('region,composite_resilience_score,risk_regime,bubble_formation_index')
    .order('computed_at', { ascending: false }).limit(REGIONS.length);
  const { data: shocks } = await sb.from('cwse_shock_absorption')
    .select('region,early_warning_score,absorption_capacity_score,urgency')
    .order('computed_at', { ascending: false }).limit(REGIONS.length * 2);

  const rMap = Object.fromEntries((resilience ?? []).map(r => [r.region, r]));
  const sMap: Record<string, any> = {};
  (shocks ?? []).forEach(s => { if (!sMap[s.region]) sMap[s.region] = s; });

  const rows = REGIONS.map(rg => {
    const res = rMap[rg.region];
    const sh = sMap[rg.region];
    const stability = ((res?.composite_resilience_score ?? 50) * 0.4 + (sh?.absorption_capacity_score ?? 50) * 0.3 + (100 - (sh?.early_warning_score ?? 30)) * 0.3);
    const sync = r(30, 90);
    const riskLevel = stability < 35 ? 'critical' : stability < 50 ? 'elevated' : stability < 70 ? 'moderate' : 'low';
    const drivers: string[] = [];
    const risks: string[] = [];
    if (res?.composite_resilience_score && res.composite_resilience_score > 60) drivers.push('strong_fundamentals');
    if (sh?.absorption_capacity_score && sh.absorption_capacity_score > 60) drivers.push('shock_resilient');
    if (res?.bubble_formation_index && res.bubble_formation_index > 60) risks.push('bubble_risk');
    if (sh?.early_warning_score && sh.early_warning_score > 60) risks.push('imminent_shock');
    const confidence = Math.min(100, stability * 0.5 + sync * 0.3 + 20);
    const era = stability > 70 ? 'golden_era' : stability > 50 ? 'transition' : stability > 35 ? 'turbulence' : 'crisis';
    return {
      region: rg.region, global_stability_index: Math.round(stability * 100) / 100,
      cross_sector_sync_score: sync, coordinated_risk_level: riskLevel,
      key_stability_drivers: drivers, key_risk_factors: risks,
      strategic_recommendation: `${riskLevel} risk regime — ${era} classification`,
      confidence_score: Math.round(confidence * 100) / 100,
      signal_synthesis_count: Math.floor(r(5, 50)), era_classification: era,
      outlook_horizon_years: Math.floor(r(5, 25)),
    };
  });
  const { error } = await sb.from('cwse_civilization_insight').insert(rows);
  if (error) throw error;
  return { insights_generated: rows.length };
}

async function dashboard(sb: ReturnType<typeof serviceClient>) {
  const [res, int, gen, shock, insight] = await Promise.all([
    sb.from('cwse_structural_resilience').select('*').order('computed_at', { ascending: false }).limit(16),
    sb.from('cwse_intervention_scenarios').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('cwse_generational_wealth').select('*').order('computed_at', { ascending: false }).limit(40),
    sb.from('cwse_shock_absorption').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('cwse_civilization_insight').select('*').order('computed_at', { ascending: false }).limit(16),
  ]);
  const resData = res.data ?? [];
  const avgResilience = resData.length ? resData.reduce((a, r) => a + (r.composite_resilience_score ?? 0), 0) / resData.length : 0;
  const criticalCount = resData.filter(r => r.risk_regime === 'critical' || r.risk_regime === 'elevated').length;

  return {
    data: {
      summary: {
        regions_monitored: REGIONS.length,
        avg_resilience: Math.round(avgResilience * 100) / 100,
        critical_regions: criticalCount,
        scenarios_run: (int.data ?? []).length,
        shock_analyses: (shock.data ?? []).length,
      },
      resilience: resData,
      interventions: int.data ?? [],
      generational: gen.data ?? [],
      shocks: shock.data ?? [],
      insights: insight.data ?? [],
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { mode, params } = await req.json();
    const sb = serviceClient();
    let result: unknown;

    switch (mode) {
      case 'monitor_resilience': result = await monitorResilience(sb); break;
      case 'simulate_interventions': result = await simulateInterventions(sb); break;
      case 'forecast_generational': result = await forecastGenerationalWealth(sb); break;
      case 'analyze_shocks': result = await analyzeShockAbsorption(sb); break;
      case 'synthesize_insights': result = await synthesizeInsights(sb); break;
      case 'dashboard': result = await dashboard(sb); break;
      default: throw new Error(`Unknown mode: ${mode}`);
    }

    if (mode !== 'dashboard') {
      await sb.from('ai_event_signals').insert({
        event_type: 'cwse_engine_cycle', entity_type: 'cwse',
        priority_level: 'low', payload: { mode, result },
      });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
