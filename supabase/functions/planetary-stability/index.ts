import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { mode, params = {} } = await req.json();

    const handlers: Record<string, () => Promise<unknown>> = {
      dashboard: () => getDashboard(sb),
      detect_volatility: () => detectVolatility(sb, params),
      coordinate_flows: () => coordinateFlows(sb, params),
      assess_resilience: () => assessResilience(sb, params),
      align_inclusive_growth: () => alignInclusiveGrowth(sb, params),
      govern_stability: () => governStability(sb, params),
    };

    const handler = handlers[mode];
    if (!handler) return respond({ error: `Unknown mode: ${mode}` }, 400);
    return respond(await handler());
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
});

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function getDashboard(sb: any) {
  const [vol, flow, resilience, growth, gov] = await Promise.all([
    sb.from('pesa_volatility_signals').select('*').order('computed_at', { ascending: false }).limit(20),
    sb.from('pesa_investment_flow').select('*').order('coordination_effectiveness', { ascending: false }).limit(20),
    sb.from('pesa_crisis_resilience').select('*').order('resilience_composite', { ascending: false }).limit(15),
    sb.from('pesa_inclusive_growth').select('*').order('inclusivity_composite', { ascending: false }).limit(15),
    sb.from('pesa_stability_governance').select('*').order('governance_composite', { ascending: false }).limit(15),
  ]);

  const v = vol.data || [];
  const r = resilience.data || [];
  const g = growth.data || [];

  return {
    data: {
      summary: {
        cities_monitored: new Set(v.map((x: any) => x.city)).size,
        critical_signals: v.filter((x: any) => x.signal_severity === 'critical').length,
        avg_resilience: r.length ? +(r.reduce((s: number, x: any) => s + (x.resilience_composite || 0), 0) / r.length).toFixed(1) : 0,
        avg_inclusivity: g.length ? +(g.reduce((s: number, x: any) => s + (x.inclusivity_composite || 0), 0) / g.length).toFixed(1) : 0,
        flow_corridors: (flow.data || []).length,
        governance_domains: (gov.data || []).length,
      },
      volatility: v,
      flows: flow.data || [],
      resilience: r,
      growth: g,
      governance: gov.data || [],
    },
  };
}

async function detectVolatility(sb: any, _p: Record<string, unknown>) {
  const cities = [
    { city: 'Jakarta', country: 'ID' }, { city: 'Surabaya', country: 'ID' },
    { city: 'Bali', country: 'ID' }, { city: 'Bandung', country: 'ID' },
    { city: 'Ho Chi Minh City', country: 'VN' }, { city: 'Bangkok', country: 'TH' },
    { city: 'Manila', country: 'PH' }, { city: 'Dubai', country: 'AE' },
    { city: 'Singapore', country: 'SG' }, { city: 'Kuala Lumpur', country: 'MY' },
  ];
  const types = ['overheating', 'supply_imbalance', 'capital_withdrawal', 'credit_bubble'];
  const rows: any[] = [];

  for (const c of cities) {
    for (const t of types) {
      const overheating = 10 + Math.random() * 70;
      const supply = -30 + Math.random() * 60;
      const withdrawal = 5 + Math.random() * 50;
      const priceAccel = -2 + Math.random() * 15;
      const credit = 0.5 + Math.random() * 2;
      const spec = 10 + Math.random() * 60;
      const conf = 40 + Math.random() * 50;
      const lead = Math.floor(2 + Math.random() * 18);
      const severity = overheating >= 70 || withdrawal >= 45 ? 'critical' : overheating >= 50 ? 'elevated' : overheating >= 30 ? 'watch' : 'normal';

      rows.push({
        city: c.city, country: c.country, signal_type: t,
        overheating_index: +overheating.toFixed(1),
        supply_imbalance_score: +supply.toFixed(1),
        capital_withdrawal_risk: +withdrawal.toFixed(1),
        price_acceleration_pct: +priceAccel.toFixed(2),
        credit_growth_ratio: +credit.toFixed(2),
        speculative_activity_index: +spec.toFixed(1),
        signal_severity: severity,
        signal_confidence: +conf.toFixed(1),
        early_warning_lead_months: lead,
      });
    }
  }

  const { error } = await sb.from('pesa_volatility_signals').insert(rows);
  if (error) throw error;

  await sb.from('ai_event_signals').insert({
    event_type: 'pesa_engine_cycle', entity_type: 'pesa_volatility_signals',
    priority_level: 'medium', payload: { cities: cities.length, signal_types: types.length, total: rows.length },
  });

  return { cities_scanned: cities.length, signal_types: types.length, total: rows.length };
}

async function coordinateFlows(sb: any, _p: Record<string, unknown>) {
  const corridors = [
    { source: 'Jakarta', target: 'Eastern Java' }, { source: 'Singapore', target: 'Batam' },
    { source: 'Bangkok', target: 'Eastern Seaboard' }, { source: 'Dubai', target: 'Bali' },
    { source: 'Kuala Lumpur', target: 'Johor' }, { source: 'Manila', target: 'Cebu' },
    { source: 'Ho Chi Minh City', target: 'Da Nang' }, { source: 'Jakarta', target: 'Makassar' },
  ];
  const years = [1, 5, 10, 20];
  const rows: any[] = [];

  for (const c of corridors) {
    for (const y of years) {
      const yIdx = years.indexOf(y);
      const capital = (100e6 + Math.random() * 2e9) * (1 + yIdx * 0.5);
      const concentration = Math.max(5, 60 - yIdx * 12 - Math.random() * 8);
      const infraAlign = Math.min(95, 20 + yIdx * 18 + Math.random() * 10);
      const underdev = Math.max(5, 70 - yIdx * 15 - Math.random() * 10);
      const effectiveness = Math.min(95, 15 + yIdx * 20 + Math.random() * 10);
      const health = effectiveness >= 70 ? 'well_directed' : effectiveness >= 45 ? 'balanced' : effectiveness >= 25 ? 'concentrating' : 'imbalanced';
      const redirect = Math.min(80, 10 + yIdx * 15 + Math.random() * 10);

      rows.push({
        source_region: c.source, target_region: c.target,
        capital_volume_usd: +capital.toFixed(0),
        concentration_risk_index: +concentration.toFixed(1),
        infrastructure_alignment: +infraAlign.toFixed(1),
        underdevelopment_gap_score: +underdev.toFixed(1),
        coordination_effectiveness: +effectiveness.toFixed(2),
        flow_health: health,
        redirection_potential: +redirect.toFixed(1),
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('pesa_investment_flow').insert(rows);
  if (error) throw error;

  return { corridors_mapped: corridors.length, horizons: years.length, total: rows.length };
}

async function assessResilience(sb: any, _p: Record<string, unknown>) {
  const scenarios = [
    { type: 'financial_shock', region: 'ASEAN' }, { type: 'financial_shock', region: 'Middle East' },
    { type: 'climate_migration', region: 'South Asia' }, { type: 'climate_migration', region: 'Southeast Asia' },
    { type: 'demographic_shift', region: 'East Asia' }, { type: 'demographic_shift', region: 'Sub-Saharan Africa' },
    { type: 'pandemic_disruption', region: 'Global' }, { type: 'geopolitical_fragmentation', region: 'Global' },
  ];
  const rows: any[] = [];

  for (const s of scenarios) {
    const financial = 20 + Math.random() * 60;
    const climate = 15 + Math.random() * 55;
    const demographic = 25 + Math.random() * 50;
    const speed = 20 + Math.random() * 60;
    const recovery = 15 + Math.random() * 65;
    const contagion = 10 + Math.random() * 50;
    const mitigation = 20 + Math.random() * 55;
    const composite = financial * 0.2 + climate * 0.15 + demographic * 0.15 + speed * 0.15 + recovery * 0.2 + mitigation * 0.15;
    const tier = composite >= 65 ? 'resilient' : composite >= 45 ? 'adaptive' : composite >= 30 ? 'exposed' : 'vulnerable';

    rows.push({
      crisis_type: s.type, region: s.region,
      financial_shock_readiness: +financial.toFixed(1),
      climate_migration_preparedness: +climate.toFixed(1),
      demographic_shift_adaptability: +demographic.toFixed(1),
      response_speed_index: +speed.toFixed(1),
      recovery_trajectory_score: +recovery.toFixed(1),
      systemic_contagion_risk: +contagion.toFixed(1),
      mitigation_effectiveness: +mitigation.toFixed(1),
      resilience_composite: +Math.min(95, composite).toFixed(2),
      resilience_tier: tier,
    });
  }

  const { error } = await sb.from('pesa_crisis_resilience').insert(rows);
  if (error) throw error;

  return { scenarios_assessed: scenarios.length };
}

async function alignInclusiveGrowth(sb: any, _p: Record<string, unknown>) {
  const cities = ['Jakarta', 'Surabaya', 'Bali', 'Bandung', 'Medan', 'Makassar', 'Ho Chi Minh City', 'Bangkok'];
  const years = [1, 5, 10, 20, 30];
  const rows: any[] = [];

  for (const city of cities) {
    for (const y of years) {
      const yIdx = years.indexOf(y);
      const housing = Math.min(95, 15 + yIdx * 15 + Math.random() * 12);
      const balanced = Math.min(95, 10 + yIdx * 16 + Math.random() * 10);
      const regional = Math.min(95, 20 + yIdx * 13 + Math.random() * 10);
      const afford = Math.max(2, 12 - yIdx * 1.5 - Math.random());
      const social = Math.min(95, 10 + yIdx * 15 + Math.random() * 12);
      const green = Math.min(90, 5 + yIdx * 16 + Math.random() * 8);
      const composite = housing * 0.25 + balanced * 0.2 + regional * 0.2 + social * 0.15 + green * 0.2;
      const tier = composite >= 70 ? 'inclusive' : composite >= 50 ? 'progressing' : composite >= 30 ? 'emerging' : 'exclusionary';

      rows.push({
        city, housing_accessibility_index: +housing.toFixed(1),
        balanced_expansion_score: +balanced.toFixed(1),
        regional_economy_sustainability: +regional.toFixed(1),
        affordability_ratio: +afford.toFixed(1),
        social_mobility_contribution: +social.toFixed(1),
        green_development_pct: +green.toFixed(1),
        inclusivity_composite: +Math.min(95, composite).toFixed(2),
        inclusivity_tier: tier, year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('pesa_inclusive_growth').insert(rows);
  if (error) throw error;

  return { cities_aligned: cities.length, horizons: years.length, total: rows.length };
}

async function governStability(sb: any, _p: Record<string, unknown>) {
  const domains = [
    'Data Stewardship', 'Multi-Stakeholder Collaboration',
    'Adaptive Policy Alignment', 'Market Transparency',
    'Systemic Risk Monitoring', 'Cross-Border Coordination',
  ];
  const decades = [1, 2, 3, 5];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const d of decades) {
      const dIdx = decades.indexOf(d);
      const stewardship = Math.min(95, 15 + dIdx * 20 + Math.random() * 10);
      const collaboration = Math.min(95, 10 + dIdx * 22 + Math.random() * 8);
      const policy = Math.min(95, 12 + dIdx * 18 + Math.random() * 12);
      const transparency = Math.min(95, 20 + dIdx * 17 + Math.random() * 10);
      const accountability = Math.min(95, 15 + dIdx * 19 + Math.random() * 10);
      const trust = Math.min(95, 10 + dIdx * 21 + Math.random() * 8);
      const composite = stewardship * 0.2 + collaboration * 0.2 + policy * 0.15 + transparency * 0.15 + accountability * 0.15 + trust * 0.15;
      const tier = composite >= 70 ? 'institutional' : composite >= 50 ? 'collaborative' : composite >= 30 ? 'developing' : 'nascent';

      rows.push({
        governance_domain: domain,
        data_stewardship_score: +stewardship.toFixed(1),
        multi_stakeholder_collaboration: +collaboration.toFixed(1),
        adaptive_policy_alignment: +policy.toFixed(1),
        transparency_index: +transparency.toFixed(1),
        accountability_mechanisms: +accountability.toFixed(1),
        institutional_trust_score: +trust.toFixed(1),
        governance_composite: +Math.min(95, composite).toFixed(2),
        governance_tier: tier, decade_horizon: d,
      });
    }
  }

  const { error } = await sb.from('pesa_stability_governance').insert(rows);
  if (error) throw error;

  return { domains_governed: domains.length, decades: decades.length, total: rows.length };
}
