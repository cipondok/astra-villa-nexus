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
    const body = await req.json();
    const { pipeline, ...params } = body;

    let result: any;
    switch (pipeline) {
      case 'infrastructure': result = await analyzeInfrastructure(supabase, params); break;
      case 'district_evolution': result = await predictDistrictEvolution(supabase, params); break;
      case 'demographics': result = await forecastDemographics(supabase, params); break;
      case 'policy_signals': result = await analyzePolicySignals(supabase, params); break;
      case 'opportunity_map': result = await generateOpportunityMap(supabase, params); break;
      case 'full_analysis': result = await fullAnalysis(supabase, params); break;
      default: throw new Error(`Unknown pipeline: ${pipeline}`);
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('smart-city-engine error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ─── 1. Infrastructure Expansion Intelligence ────────────────────────────
async function analyzeInfrastructure(supabase: any, params: any) {
  const cities = params.cities || ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Makassar', 'Medan'];

  const projects: Record<string, { type: string; name: string; stage: string }[]> = {
    Jakarta: [
      { type: 'metro', name: 'MRT Phase 3 Extension', stage: 'under_construction' },
      { type: 'highway', name: 'Jakarta Outer Ring Road II', stage: 'approved' },
      { type: 'cbd', name: 'Sudirman Central Business District Expansion', stage: 'under_construction' },
      { type: 'airport', name: 'Soekarno-Hatta Terminal 4', stage: 'planned' },
    ],
    Bali: [
      { type: 'airport', name: 'North Bali International Airport', stage: 'planned' },
      { type: 'highway', name: 'Bali Toll Road Extension', stage: 'under_construction' },
      { type: 'tourism', name: 'Nusa Dua Premium Tourism Zone', stage: 'approved' },
    ],
    Surabaya: [
      { type: 'metro', name: 'Surabaya Mass Rapid Transit', stage: 'approved' },
      { type: 'industrial', name: 'East Java Industrial Corridor', stage: 'under_construction' },
      { type: 'cbd', name: 'Surabaya Western CBD Development', stage: 'planned' },
    ],
    Bandung: [
      { type: 'highway', name: 'Jakarta-Bandung HSR Station Area', stage: 'under_construction' },
      { type: 'cbd', name: 'Bandung Technopolis District', stage: 'planned' },
    ],
    Makassar: [
      { type: 'airport', name: 'Sultan Hasanuddin Airport Expansion', stage: 'approved' },
      { type: 'industrial', name: 'Makassar New Port Industrial Zone', stage: 'under_construction' },
    ],
    Medan: [
      { type: 'highway', name: 'Trans Sumatra Toll Road Section', stage: 'under_construction' },
      { type: 'cbd', name: 'Medan Central Business Hub', stage: 'planned' },
    ],
  };

  const stageWeights: Record<string, number> = { completed: 1.0, under_construction: 0.8, approved: 0.5, planned: 0.25 };
  const typeUplift: Record<string, number> = { metro: 25, highway: 15, airport: 20, cbd: 30, industrial: 12, tourism: 22 };

  const records: any[] = [];

  for (const city of cities) {
    const cityProjects = projects[city] || [];
    for (const proj of cityProjects) {
      const stageW = stageWeights[proj.stage] || 0.25;
      const baseUplift = typeUplift[proj.type] || 15;
      const impact = Math.round((50 + Math.random() * 45) * stageW * 10) / 10;
      const accessibility = Math.round((40 + Math.random() * 55) * 10) / 10;
      const velocity = Math.round((30 + Math.random() * 60) * stageW * 10) / 10;
      const uplift = Math.round((baseUplift * stageW + Math.random() * 10) * 10) / 10;

      const yearsLeft = proj.stage === 'completed' ? 0 : proj.stage === 'under_construction' ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 4);
      const estCompletion = new Date();
      estCompletion.setFullYear(estCompletion.getFullYear() + yearsLeft);

      records.push({
        city,
        district: `${city} Core`,
        infrastructure_type: proj.type,
        project_name: proj.name,
        impact_score: impact,
        accessibility_index: accessibility,
        expansion_velocity: velocity,
        value_uplift_pct: uplift,
        completion_stage: proj.stage,
        estimated_completion: estCompletion.toISOString().split('T')[0],
        details: { stage_weight: stageW, years_to_completion: yearsLeft },
      });
    }
  }

  await supabase.from('smart_city_infrastructure').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await supabase.from('smart_city_infrastructure').insert(records);
  if (error) console.error('Insert infra error:', error);

  return {
    total_projects: records.length,
    cities_covered: cities.length,
    high_impact: records.filter(r => r.impact_score > 70).length,
    avg_uplift: Math.round(records.reduce((s, r) => s + r.value_uplift_pct, 0) / records.length * 10) / 10,
    records: records.sort((a, b) => b.impact_score - a.impact_score),
    analyzed_at: new Date().toISOString(),
  };
}

// ─── 2. Smart District Evolution Predictor ────────────────────────────────
async function predictDistrictEvolution(supabase: any, params: any) {
  const districts = [
    { city: 'Jakarta', district: 'PIK 2', type: 'luxury_corridor', baseSqm: 35000000 },
    { city: 'Jakarta', district: 'Tangerang New City', type: 'cbd_migration', baseSqm: 18000000 },
    { city: 'Jakarta', district: 'BSD City', type: 'tech_hub', baseSqm: 22000000 },
    { city: 'Bali', district: 'Canggu', type: 'lifestyle', baseSqm: 32000000 },
    { city: 'Bali', district: 'Tabanan Coast', type: 'lifestyle', baseSqm: 15000000 },
    { city: 'Bali', district: 'Uluwatu Corridor', type: 'luxury_corridor', baseSqm: 28000000 },
    { city: 'Surabaya', district: 'Citraland CBD', type: 'cbd_migration', baseSqm: 16000000 },
    { city: 'Bandung', district: 'Summarecon Bandung', type: 'education_cluster', baseSqm: 14000000 },
    { city: 'Makassar', district: 'CPI District', type: 'cbd_migration', baseSqm: 10000000 },
    { city: 'Medan', district: 'KIM Industrial Belt', type: 'tech_hub', baseSqm: 8000000 },
  ];

  const typeMultipliers: Record<string, { premium: number; rental: number; lifestyle: number; appreciation: number }> = {
    cbd_migration: { premium: 75, rental: 70, lifestyle: 55, appreciation: 80 },
    lifestyle: { premium: 80, rental: 85, lifestyle: 95, appreciation: 75 },
    tech_hub: { premium: 65, rental: 60, lifestyle: 50, appreciation: 85 },
    education_cluster: { premium: 50, rental: 75, lifestyle: 45, appreciation: 60 },
    luxury_corridor: { premium: 90, rental: 65, lifestyle: 90, appreciation: 70 },
  };

  const records: any[] = [];

  for (const d of districts) {
    const mult = typeMultipliers[d.type] || typeMultipliers.cbd_migration;
    const jitter = () => Math.round((Math.random() * 20 - 10) * 10) / 10;
    const premium = Math.min(98, mult.premium + jitter());
    const rental = Math.min(98, mult.rental + jitter());
    const lifestyle = Math.min(98, mult.lifestyle + jitter());
    const appreciation = Math.min(98, mult.appreciation + jitter());
    const growth3y = 1 + (appreciation / 100) * 0.5 + Math.random() * 0.15;
    const growth5y = 1 + (appreciation / 100) * 0.9 + Math.random() * 0.25;

    records.push({
      city: d.city,
      district: d.district,
      evolution_type: d.type,
      premiumization_probability: premium,
      rental_demand_strength: rental,
      lifestyle_desirability: lifestyle,
      capital_appreciation_index: appreciation,
      current_price_sqm: d.baseSqm,
      projected_price_sqm_3y: Math.round(d.baseSqm * growth3y),
      projected_price_sqm_5y: Math.round(d.baseSqm * growth5y),
      drivers: [d.type.replace(/_/g, ' '), 'Infrastructure proximity', 'Developer activity'],
    });
  }

  await supabase.from('smart_city_districts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await supabase.from('smart_city_districts').insert(records);
  if (error) console.error('Insert districts error:', error);

  return {
    total_districts: records.length,
    top_appreciation: records.sort((a, b) => b.capital_appreciation_index - a.capital_appreciation_index).slice(0, 3).map(r => r.district),
    records,
  };
}

// ─── 3. Population Migration & Demographics ──────────────────────────────
async function forecastDemographics(supabase: any, params: any) {
  const cities = params.cities || ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Makassar', 'Medan'];

  const cityProfiles: Record<string, { inflow: number; expat: number; remote: number; young: number }> = {
    Jakarta: { inflow: 70, expat: 40, remote: 55, young: 80 },
    Bali: { inflow: 85, expat: 90, remote: 95, young: 75 },
    Surabaya: { inflow: 55, expat: 20, remote: 35, young: 60 },
    Bandung: { inflow: 65, expat: 25, remote: 70, young: 75 },
    Makassar: { inflow: 45, expat: 10, remote: 25, young: 50 },
    Medan: { inflow: 40, expat: 15, remote: 20, young: 45 },
  };

  const records: any[] = [];

  for (const city of cities) {
    const p = cityProfiles[city] || { inflow: 40, expat: 15, remote: 30, young: 50 };
    const j = () => Math.round((Math.random() * 15 - 5) * 10) / 10;
    const inflow = Math.min(98, p.inflow + j());
    const expat = Math.min(98, p.expat + j());
    const remote = Math.min(98, p.remote + j());
    const young = Math.min(98, p.young + j());
    const demandGrowth = (inflow * 0.3 + young * 0.3 + remote * 0.2 + expat * 0.2);
    const absorption = Math.min(95, demandGrowth * 0.9 + Math.random() * 10);
    const pricePressure = Math.min(95, demandGrowth * 0.8 + Math.random() * 15);
    const shifts = ['upward', 'stable', 'downward'];
    const incomeShift = inflow > 60 ? shifts[0] : inflow > 40 ? shifts[1] : shifts[2];

    records.push({
      city,
      district: `${city} Metro`,
      population_inflow_score: inflow,
      income_migration_shift: incomeShift,
      remote_work_index: remote,
      expat_settlement_probability: expat,
      young_professional_demand: young,
      housing_demand_growth: Math.round(demandGrowth * 10) / 10,
      absorption_capacity: Math.round(absorption * 10) / 10,
      price_pressure_probability: Math.round(pricePressure * 10) / 10,
      demographic_details: { primary_driver: remote > expat ? 'remote_workers' : 'expat_settlement' },
    });
  }

  await supabase.from('smart_city_demographics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await supabase.from('smart_city_demographics').insert(records);
  if (error) console.error('Insert demographics error:', error);

  return {
    total_cities: records.length,
    highest_inflow: records.sort((a, b) => b.population_inflow_score - a.population_inflow_score)[0]?.city,
    avg_demand_growth: Math.round(records.reduce((s, r) => s + r.housing_demand_growth, 0) / records.length * 10) / 10,
    records,
  };
}

// ─── 4. Policy & Urban Planning Signals ──────────────────────────────────
async function analyzePolicySignals(supabase: any, _params: any) {
  const policies = [
    { city: 'Jakarta', type: 'spatial_planning', name: 'Jakarta Capital City Relocation Impact', growth: 85, friendly: 70, transform: 90 },
    { city: 'Jakarta', type: 'tax_incentive', name: 'Tax Holiday for TOD Developments', growth: 65, friendly: 85, transform: 60 },
    { city: 'Bali', type: 'foreign_ownership', name: 'Golden Visa Property Investment Scheme', growth: 80, friendly: 90, transform: 75 },
    { city: 'Bali', type: 'green_city', name: 'Sustainable Tourism Development Act', growth: 55, friendly: 75, transform: 85 },
    { city: 'Bali', type: 'sez', name: 'Bali Special Economic Zone for Digital Nomads', growth: 90, friendly: 95, transform: 80 },
    { city: 'Surabaya', type: 'spatial_planning', name: 'East Java Metropolitan Area Plan', growth: 70, friendly: 65, transform: 72 },
    { city: 'Bandung', type: 'sez', name: 'Bandung Technology Valley SEZ', growth: 75, friendly: 80, transform: 78 },
    { city: 'Makassar', type: 'spatial_planning', name: 'Makassar New City Masterplan', growth: 60, friendly: 60, transform: 65 },
    { city: 'Medan', type: 'tax_incentive', name: 'North Sumatra Investment Incentive Package', growth: 50, friendly: 70, transform: 55 },
  ];

  const records = policies.map(p => ({
    city: p.city,
    policy_type: p.type,
    policy_name: p.name,
    growth_acceleration_score: p.growth + Math.round((Math.random() * 10 - 5) * 10) / 10,
    investment_friendliness: p.friendly + Math.round((Math.random() * 10 - 5) * 10) / 10,
    urban_transformation_index: p.transform + Math.round((Math.random() * 10 - 5) * 10) / 10,
    effective_date: '2025-01-01',
    impact_summary: `${p.name} is expected to accelerate ${p.city} growth with a ${p.growth}% acceleration score.`,
    policy_details: { policy_type_label: p.type.replace(/_/g, ' ') },
  }));

  await supabase.from('smart_city_policies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await supabase.from('smart_city_policies').insert(records);
  if (error) console.error('Insert policies error:', error);

  return {
    total_policies: records.length,
    most_friendly_city: records.sort((a, b) => b.investment_friendliness - a.investment_friendliness)[0]?.city,
    records,
  };
}

// ─── 5. Opportunity Map Generator ────────────────────────────────────────
async function generateOpportunityMap(supabase: any, _params: any) {
  const { data: infra } = await supabase.from('smart_city_infrastructure').select('*');
  const { data: districts } = await supabase.from('smart_city_districts').select('*');
  const { data: demos } = await supabase.from('smart_city_demographics').select('*');
  const { data: policies } = await supabase.from('smart_city_policies').select('*');

  if (!districts?.length) return { opportunities: [], message: 'Run other pipelines first.' };

  const opportunities: any[] = [];

  for (const dist of districts) {
    const cityInfra = (infra || []).filter((i: any) => i.city === dist.city);
    const cityDemo = (demos || []).find((d: any) => d.city === dist.city);
    const cityPolicies = (policies || []).filter((p: any) => p.city === dist.city);

    const infraScore = cityInfra.length ? cityInfra.reduce((s: number, i: any) => s + i.impact_score, 0) / cityInfra.length : 30;
    const demoScore = cityDemo?.housing_demand_growth || 40;
    const policyScore = cityPolicies.length ? cityPolicies.reduce((s: number, p: any) => s + p.growth_acceleration_score, 0) / cityPolicies.length : 30;

    const growthCorridor = (infraScore * 0.35 + dist.capital_appreciation_index * 0.3 + demoScore * 0.2 + policyScore * 0.15);
    const investPriority = (growthCorridor * 0.5 + dist.premiumization_probability * 0.3 + dist.rental_demand_strength * 0.2);
    const roi5y = ((dist.projected_price_sqm_5y - dist.current_price_sqm) / dist.current_price_sqm) * 100;

    const riskLevel = growthCorridor > 75 ? 'low' : growthCorridor > 55 ? 'moderate' : 'high';
    const timing = growthCorridor > 70 ? 'Enter now — early growth phase' : growthCorridor > 50 ? 'Monitor — approaching entry window' : 'Watch — long-term play';

    const oppTypes = ['residential', 'commercial', 'land_banking', 'mixed_use'];
    const oppType = dist.evolution_type === 'luxury_corridor' ? 'residential' : dist.evolution_type === 'cbd_migration' ? 'commercial' : dist.evolution_type === 'tech_hub' ? 'mixed_use' : oppTypes[Math.floor(Math.random() * oppTypes.length)];

    opportunities.push({
      city: dist.city,
      district: dist.district,
      opportunity_type: oppType,
      growth_corridor_score: Math.round(growthCorridor * 10) / 10,
      investment_priority: Math.round(investPriority * 10) / 10,
      expected_roi_5y: Math.round(roi5y * 10) / 10,
      risk_level: riskLevel,
      entry_timing: timing,
      infrastructure_drivers: cityInfra.slice(0, 3).map((i: any) => i.project_name),
      demographic_drivers: cityDemo ? [`Inflow: ${cityDemo.population_inflow_score}`, `Demand: ${cityDemo.housing_demand_growth}`] : [],
      policy_drivers: cityPolicies.slice(0, 2).map((p: any) => p.policy_name),
    });
  }

  await supabase.from('smart_city_opportunities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await supabase.from('smart_city_opportunities').insert(opportunities);
  if (error) console.error('Insert opportunities error:', error);

  return {
    total_opportunities: opportunities.length,
    top_zones: opportunities.sort((a, b) => b.growth_corridor_score - a.growth_corridor_score).slice(0, 3).map(o => `${o.district}, ${o.city}`),
    opportunities: opportunities.sort((a, b) => b.investment_priority - a.investment_priority),
  };
}

// ─── Full Analysis Orchestrator ──────────────────────────────────────────
async function fullAnalysis(supabase: any, params: any) {
  const infra = await analyzeInfrastructure(supabase, params);
  const [districts, demos, policies] = await Promise.all([
    predictDistrictEvolution(supabase, params),
    forecastDemographics(supabase, params),
    analyzePolicySignals(supabase, params),
  ]);
  const opportunities = await generateOpportunityMap(supabase, params);

  return {
    infrastructure: { total: infra.total_projects, high_impact: infra.high_impact, avg_uplift: infra.avg_uplift },
    districts: { total: districts.total_districts, top: districts.top_appreciation },
    demographics: { total: demos.total_cities, highest_inflow: demos.highest_inflow, avg_demand: demos.avg_demand_growth },
    policies: { total: policies.total_policies, most_friendly: policies.most_friendly_city },
    opportunities: { total: opportunities.total_opportunities, top_zones: opportunities.top_zones },
    analyzed_at: new Date().toISOString(),
  };
}
