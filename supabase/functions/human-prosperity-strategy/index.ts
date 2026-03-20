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
  { region: 'Oceania', country: 'AU' },
  { region: 'Central-Asia', country: 'KZ' },
];

const r = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

async function analyzeProsperityDrivers(sb: ReturnType<typeof serviceClient>) {
  const rows = REGIONS.map(rg => {
    const edu = r(30, 95);
    const prod = r(-1, 6);
    const infra = r(20, 95);
    const afford = r(2, 15);
    const innov = r(10, 90);
    const research = r(0.5, 4);
    const digital = r(20, 95);
    const talent = r(25, 90);
    const composite = edu * 0.2 + infra * 0.15 + innov * 0.2 + digital * 0.15 + talent * 0.15 + (100 - afford * 5) * 0.05 + prod * 10 * 0.1;
    const momentum = prod > 3 ? 'accelerating' : prod > 1 ? 'growing' : prod > 0 ? 'stable' : 'declining';
    return {
      region: rg.region, country: rg.country,
      education_index: edu, productivity_growth_pct: prod,
      infrastructure_quality_score: infra, housing_affordability_ratio: afford,
      innovation_ecosystem_score: innov, research_intensity_pct: research,
      digital_readiness_score: digital, talent_retention_index: talent,
      composite_prosperity_driver: Math.min(100, Math.max(0, Math.round(composite * 100) / 100)),
      driver_momentum: momentum,
    };
  });
  const { error } = await sb.from('lhps_prosperity_drivers').insert(rows);
  if (error) throw error;
  return { regions_analyzed: rows.length, momentums: Object.fromEntries(rows.map(r => [r.region, r.driver_momentum])) };
}

async function optimizeCapitalProductivity(sb: ReturnType<typeof serviceClient>) {
  const rows = REGIONS.map((rg, i) => {
    const infraRoi = r(3, 25);
    const techEff = r(1, 15);
    const laborProd = r(60, 150);
    const capDeep = r(0, 8);
    const tfp = r(-1, 5);
    const rank = i + 1;
    const delta = Math.floor(r(-5, 5));
    const multiplier = r(0.8, 2.5);
    const trend = tfp > 2 ? 'accelerating' : tfp > 0.5 ? 'growing' : tfp > -0.5 ? 'stable' : 'declining';
    const proj5y = laborProd * (1 + tfp / 100) ** 5;
    const optScore = (infraRoi * 2 * 0.25 + techEff * 3 * 0.25 + tfp * 10 * 0.25 + multiplier * 20 * 0.25);
    return {
      region: rg.region, infrastructure_roi_pct: infraRoi,
      tech_efficiency_gain_pct: techEff, labor_productivity_index: laborProd,
      capital_deepening_rate: capDeep, total_factor_productivity: tfp,
      regional_competitiveness_rank: rank, competitiveness_delta: delta,
      investment_multiplier: multiplier, marginal_productivity_trend: trend,
      projected_productivity_5y: Math.round(proj5y * 100) / 100,
      optimization_score: Math.min(100, Math.max(0, Math.round(optScore * 100) / 100)),
    };
  });
  const { error } = await sb.from('lhps_capital_productivity').insert(rows);
  if (error) throw error;
  return { regions_optimized: rows.length };
}

async function measureSocialOpportunity(sb: ReturnType<typeof serviceClient>) {
  const rows = REGIONS.map(rg => {
    const empRes = r(30, 90);
    const unemp = r(2, 20);
    const lfp = r(45, 80);
    const mobility = r(20, 80);
    const quintile = r(3, 15);
    const imbalance = r(10, 80);
    const safety = r(15, 90);
    const youth = r(20, 85);
    const gender = r(0.4, 1.0);
    const access = (empRes * 0.2 + mobility * 0.2 + (100 - imbalance) * 0.15 + safety * 0.15 + youth * 0.15 + gender * 100 * 0.15);
    const risk = access < 35 ? 'high' : access < 55 ? 'moderate' : 'low';
    return {
      region: rg.region, employment_resilience_score: empRes,
      unemployment_rate_pct: unemp, labor_force_participation_pct: lfp,
      wealth_mobility_index: mobility, income_quintile_ratio: quintile,
      regional_dev_imbalance_score: imbalance, social_safety_net_coverage_pct: safety,
      opportunity_access_score: Math.min(100, Math.max(0, Math.round(access * 100) / 100)),
      youth_opportunity_index: youth, gender_parity_index: Math.round(gender * 100) / 100,
      stability_risk_level: risk,
    };
  });
  const { error } = await sb.from('lhps_social_opportunity').insert(rows);
  if (error) throw error;
  return { regions_measured: rows.length };
}

async function simulateGrowthScenarios(sb: ReturnType<typeof serviceClient>) {
  const policies = ['baseline', 'growth_focused', 'sustainability_first', 'innovation_led'];
  const investments = ['conservative', 'moderate', 'aggressive'];
  const sustPriorities = ['minimal', 'balanced', 'maximum'];
  const rows: Record<string, unknown>[] = [];

  for (const rg of REGIONS.slice(0, 6)) {
    for (let i = 0; i < 3; i++) {
      const policy = policies[Math.floor(r(0, policies.length))];
      const invest = investments[Math.floor(r(0, investments.length))];
      const sust = sustPriorities[Math.floor(r(0, sustPriorities.length))];
      const horizon = [20, 30, 50][i];
      const gdpGrowth = r(0.5, 8);
      const emp = r(85, 98);
      const afford = r(3, 12);
      const innovProj = r(30, 90);
      const resilience = r(30, 90);
      const sustScore = sust === 'maximum' ? r(60, 95) : sust === 'balanced' ? r(40, 70) : r(15, 45);
      const prosperity = (gdpGrowth * 5 * 0.2 + emp * 0.2 + (100 - afford * 5) * 0.15 + innovProj * 0.15 + resilience * 0.15 + sustScore * 0.15);
      const classification = prosperity > 70 ? 'thriving' : prosperity > 50 ? 'growing' : prosperity > 35 ? 'stagnant' : 'declining';
      rows.push({
        scenario_name: `${rg.region}-${policy}-${horizon}y`, region: rg.region,
        time_horizon_years: horizon, policy_pathway: policy,
        investment_pathway: invest, sustainability_priority: sust,
        projected_gdp_growth_pct: gdpGrowth, projected_employment_pct: emp,
        projected_housing_affordability: afford, projected_innovation_score: innovProj,
        resilience_trade_off_score: resilience, sustainability_trade_off_score: sustScore,
        prosperity_outcome_score: Math.min(100, Math.max(0, Math.round(prosperity * 100) / 100)),
        scenario_classification: classification,
      });
    }
  }
  const { error } = await sb.from('lhps_growth_scenarios').insert(rows);
  if (error) throw error;
  return { scenarios_generated: rows.length };
}

async function synthesizeProsperityInsights(sb: ReturnType<typeof serviceClient>) {
  const { data: drivers } = await sb.from('lhps_prosperity_drivers')
    .select('region,composite_prosperity_driver,driver_momentum')
    .order('computed_at', { ascending: false }).limit(REGIONS.length);
  const { data: social } = await sb.from('lhps_social_opportunity')
    .select('region,opportunity_access_score,stability_risk_level')
    .order('computed_at', { ascending: false }).limit(REGIONS.length);
  const { data: productivity } = await sb.from('lhps_capital_productivity')
    .select('region,optimization_score,marginal_productivity_trend')
    .order('computed_at', { ascending: false }).limit(REGIONS.length);

  const dMap = Object.fromEntries((drivers ?? []).map(d => [d.region, d]));
  const sMap = Object.fromEntries((social ?? []).map(s => [s.region, s]));
  const pMap = Object.fromEntries((productivity ?? []).map(p => [p.region, p]));

  const rows = REGIONS.map(rg => {
    const d = dMap[rg.region]; const s = sMap[rg.region]; const p = pMap[rg.region];
    const prosIdx = ((d?.composite_prosperity_driver ?? 40) * 0.35 + (s?.opportunity_access_score ?? 40) * 0.35 + (p?.optimization_score ?? 40) * 0.3);
    const capAlign = ((p?.optimization_score ?? 40) * 0.5 + (d?.composite_prosperity_driver ?? 40) * 0.5);
    const socOutcome = (s?.opportunity_access_score ?? 40);
    const growthDrivers: string[] = [];
    const riskFactors: string[] = [];
    if (d?.driver_momentum === 'accelerating') growthDrivers.push('accelerating_drivers');
    if (p?.marginal_productivity_trend === 'accelerating') growthDrivers.push('productivity_surge');
    if (d?.composite_prosperity_driver && d.composite_prosperity_driver > 60) growthDrivers.push('strong_fundamentals');
    if (s?.stability_risk_level === 'high') riskFactors.push('social_instability');
    if (p?.optimization_score && p.optimization_score < 40) riskFactors.push('low_capital_productivity');
    const confidence = Math.min(100, prosIdx * 0.5 + capAlign * 0.25 + socOutcome * 0.25);
    const alignment = capAlign > 60 && socOutcome > 55 ? 'strong' : capAlign > 40 ? 'partial' : 'misaligned';
    const outlook = prosIdx > 70 ? 'prosperous' : prosIdx > 50 ? 'stable' : prosIdx > 35 ? 'uncertain' : 'at_risk';
    return {
      region: rg.region, prosperity_index: Math.round(prosIdx * 100) / 100,
      capital_alignment_score: Math.round(capAlign * 100) / 100,
      societal_outcome_score: Math.round(socOutcome * 100) / 100,
      key_growth_drivers: growthDrivers, key_risk_factors: riskFactors,
      strategic_action_plan: `${outlook} outlook with ${alignment} investment-societal alignment`,
      confidence_score: Math.round(confidence * 100) / 100,
      investment_societal_alignment: alignment, outlook_classification: outlook,
      forecast_horizon_years: Math.floor(r(10, 30)),
    };
  });
  const { error } = await sb.from('lhps_prosperity_insight').insert(rows);
  if (error) throw error;
  return { insights_generated: rows.length };
}

async function dashboard(sb: ReturnType<typeof serviceClient>) {
  const [drivers, productivity, social, scenarios, insights] = await Promise.all([
    sb.from('lhps_prosperity_drivers').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('lhps_capital_productivity').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('lhps_social_opportunity').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('lhps_growth_scenarios').select('*').order('computed_at', { ascending: false }).limit(24),
    sb.from('lhps_prosperity_insight').select('*').order('computed_at', { ascending: false }).limit(20),
  ]);
  const dData = drivers.data ?? [];
  const avgProsperity = dData.length ? dData.reduce((a, d) => a + (d.composite_prosperity_driver ?? 0), 0) / dData.length : 0;

  return {
    data: {
      summary: {
        regions_tracked: REGIONS.length,
        avg_prosperity_driver: Math.round(avgProsperity * 100) / 100,
        scenarios_run: (scenarios.data ?? []).length,
        prosperous_regions: (insights.data ?? []).filter((i: any) => i.outlook_classification === 'prosperous').length,
      },
      drivers: dData,
      productivity: productivity.data ?? [],
      social: social.data ?? [],
      scenarios: scenarios.data ?? [],
      insights: insights.data ?? [],
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
      case 'analyze_drivers': result = await analyzeProsperityDrivers(sb); break;
      case 'optimize_productivity': result = await optimizeCapitalProductivity(sb); break;
      case 'measure_social': result = await measureSocialOpportunity(sb); break;
      case 'simulate_growth': result = await simulateGrowthScenarios(sb); break;
      case 'synthesize_insights': result = await synthesizeProsperityInsights(sb); break;
      case 'dashboard': result = await dashboard(sb); break;
      default: throw new Error(`Unknown mode: ${mode}`);
    }

    if (mode !== 'dashboard') {
      await sb.from('ai_event_signals').insert({
        event_type: 'lhps_engine_cycle', entity_type: 'lhps',
        priority_level: 'low', payload: { mode, result },
      });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
