import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// ── Phase 1: Liquidity Intelligence Leadership ──

async function planLiquidityLeadership(client: ReturnType<typeof sb>) {
  const milestones = [
    { name: "Launch AI Opportunity Scoring Engine", year: 0, q: 2, cat: "DEAL_INTELLIGENCE", target: 100, unit: "scoring_models" },
    { name: "10K Properties Scored with Liquidity Index", year: 0, q: 4, cat: "DEAL_INTELLIGENCE", target: 10000, unit: "properties" },
    { name: "Dominate Bali Investment Discovery", year: 1, q: 1, cat: "DISCOVERY_DOMINANCE", target: 60, unit: "market_share_pct" },
    { name: "87%+ Pricing Prediction Accuracy", year: 1, q: 2, cat: "DATA_CREDIBILITY", target: 87, unit: "accuracy_pct" },
    { name: "Expand to 15 Indonesian Cities", year: 1, q: 3, cat: "MARKET_COVERAGE", target: 15, unit: "cities" },
    { name: "1M+ Proprietary Data Points", year: 1, q: 4, cat: "DATA_CREDIBILITY", target: 1000000, unit: "data_points" },
    { name: "Investor DNA Matching Live", year: 1, q: 2, cat: "DEAL_INTELLIGENCE", target: 1000, unit: "investor_profiles" },
    { name: "38 Province Coverage Complete", year: 2, q: 2, cat: "MARKET_COVERAGE", target: 38, unit: "provinces" },
    { name: "Cross-Border Intelligence Active (5 countries)", year: 2, q: 3, cat: "DISCOVERY_DOMINANCE", target: 5, unit: "countries" },
    { name: "10M+ Data Points Moat", year: 2, q: 4, cat: "DATA_CREDIBILITY", target: 10000000, unit: "data_points" },
  ];

  const records = milestones.map((m) => {
    const progress = Math.min(100, Math.random() * (m.year === 0 ? 80 : m.year === 1 ? 50 : 20));
    const actual = Math.round(m.target * (progress / 100));
    const compAdv = 30 + Math.random() * 60;
    return {
      milestone_name: m.name,
      target_year: m.year,
      target_quarter: m.q,
      category: m.cat,
      current_progress_pct: Math.round(progress * 100) / 100,
      target_metric_value: m.target,
      actual_metric_value: actual,
      metric_unit: m.unit,
      competitive_advantage_score: Math.round(compAdv * 100) / 100,
      moat_contribution: Math.round(compAdv * 0.7 * 100) / 100,
      status: progress >= 100 ? "ACHIEVED" : progress > 50 ? "IN_PROGRESS" : "PLANNED",
    };
  });

  const { error } = await client.from("dmem_liquidity_leadership").insert(records);
  if (error) throw error;

  return { milestones_planned: records.length, achieved: records.filter((r) => r.status === "ACHIEVED").length, in_progress: records.filter((r) => r.status === "IN_PROGRESS").length };
}

// ── Phase 2: Marketplace Gravity Formation ──

async function computeMarketplaceGravity(client: ReturnType<typeof sb>) {
  const stakeholders = [
    { type: "VENDOR", metric: "Listing dependency on platform", base: 40, switchCost: 3 },
    { type: "AGENT", metric: "Lead generation reliance", base: 55, switchCost: 6 },
    { type: "DEVELOPER", metric: "Project launch channel dependency", base: 35, switchCost: 8 },
    { type: "INVESTOR", metric: "Deal discovery reliance on AI", base: 60, switchCost: 12 },
    { type: "INSTITUTIONAL", metric: "Portfolio intelligence dependency", base: 45, switchCost: 18 },
    { type: "GOVERNMENT", metric: "Market data reference standard", base: 20, switchCost: 24 },
  ];

  const records = stakeholders.map((s) => {
    const dependency = s.base + Math.random() * 40;
    const workflowShare = dependency * 0.8;
    const alternatives = Math.max(1, Math.floor(6 - dependency / 20));
    const gravity = dependency * 0.4 + (100 - alternatives * 15) * 0.3 + s.switchCost * 1.5;
    const retention = 70 + dependency * 0.25;
    const networkMult = 1 + (dependency / 100) * 0.8;

    return {
      stakeholder_type: s.type,
      dependency_metric: s.metric,
      dependency_score: Math.round(dependency * 100) / 100,
      switching_cost_months: s.switchCost + Math.random() * 6,
      platform_share_of_workflow_pct: Math.round(workflowShare * 100) / 100,
      alternative_count: alternatives,
      gravity_pull_strength: Math.round(gravity * 100) / 100,
      transaction_volume_contribution: Math.round((dependency * 500) * 100) / 100,
      compounding_factor: Math.round((1 + dependency / 200) * 100) / 100,
      retention_rate_pct: Math.round(Math.min(99, retention) * 100) / 100,
      network_effect_multiplier: Math.round(networkMult * 100) / 100,
    };
  });

  const { error } = await client.from("dmem_marketplace_gravity").insert(records);
  if (error) throw error;

  return { stakeholders_modeled: records.length, avg_gravity: Math.round(records.reduce((s, r) => s + r.gravity_pull_strength, 0) / records.length), strongest: records.sort((a, b) => b.gravity_pull_strength - a.gravity_pull_strength)[0]?.stakeholder_type };
}

// ── Phase 3: Ecosystem Lock-In ──

async function designEcosystemLockin(client: ReturnType<typeof sb>) {
  const services = [
    { layer: "FINANCING", depth: "EMBEDDED", launchY: 3, matY: 5, rpu: 150 },
    { layer: "LEGAL", depth: "API_CONNECTED", launchY: 3, matY: 5, rpu: 80 },
    { layer: "PROPERTY_MANAGEMENT", depth: "NATIVE", launchY: 4, matY: 6, rpu: 200 },
    { layer: "INSURANCE", depth: "API_CONNECTED", launchY: 4, matY: 6, rpu: 60 },
    { layer: "VALUATION", depth: "NATIVE", launchY: 3, matY: 5, rpu: 120 },
    { layer: "TOKENIZATION", depth: "NATIVE", launchY: 5, matY: 7, rpu: 500 },
    { layer: "TAX_ADVISORY", depth: "API_CONNECTED", launchY: 5, matY: 7, rpu: 90 },
  ];

  const records = services.map((s) => {
    const switchCost = 30 + Math.random() * 60;
    const userDep = 20 + Math.random() * 50;
    const multiService = 15 + Math.random() * 40;
    const lockIn = switchCost * 0.4 + userDep * 0.3 + multiService * 0.3;
    const replYears = 2 + Math.random() * 5;
    const dataMoat = lockIn * 0.5;

    return {
      service_layer: s.layer,
      integration_depth: s.depth,
      switching_cost_score: Math.round(switchCost * 100) / 100,
      user_dependency_pct: Math.round(userDep * 100) / 100,
      revenue_per_user_usd: s.rpu,
      multi_service_adoption_pct: Math.round(multiService * 100) / 100,
      lock_in_strength: Math.round(lockIn * 100) / 100,
      competitor_replication_years: Math.round(replYears * 10) / 10,
      data_moat_contribution: Math.round(dataMoat * 100) / 100,
      ecosystem_completeness_pct: Math.round((multiService + userDep) / 2 * 100) / 100,
      launch_year: s.launchY,
      maturity_year: s.matY,
      status: "PLANNED",
    };
  });

  const { error } = await client.from("dmem_ecosystem_lockin").insert(records);
  if (error) throw error;

  return { services_designed: records.length, avg_lock_in: Math.round(records.reduce((s, r) => s + r.lock_in_strength, 0) / records.length), total_rpu: records.reduce((s, r) => s + r.revenue_per_user_usd, 0) };
}

// ── Phase 4: Capital Flow Control ──

async function modelCapitalFlowControl(client: ReturnType<typeof sb>) {
  const domains = [
    { flow: "INSTITUTIONAL_SOURCING", volume: 50000000, share: 8, advantage: "Proprietary scoring + deal pipeline from 10M+ data points" },
    { flow: "ASSET_MANAGEMENT", volume: 120000000, share: 5, advantage: "AI-driven portfolio optimization with real-time market intelligence" },
    { flow: "CROSS_BORDER_ROUTING", volume: 30000000, share: 12, advantage: "Multi-currency normalization + regulatory compliance across 12 markets" },
    { flow: "FUND_ORIGINATION", volume: 200000000, share: 3, advantage: "Data-driven fund thesis generation with predictive market timing" },
    { flow: "SYNDICATION", volume: 80000000, share: 6, advantage: "Automated LP matching + milestone-based capital deployment" },
    { flow: "SECONDARY_MARKET", volume: 15000000, share: 15, advantage: "Tokenized liquidity with AI-stabilized order book" },
  ];

  const records = domains.map((d) => {
    const intermediation = d.share + Math.random() * 20;
    const intelPremium = 5 + Math.random() * 15;
    const relationships = 5 + Math.floor(Math.random() * 30);
    const countries = 3 + Math.floor(Math.random() * 10);
    const revenue = d.volume * (d.share / 100) * 0.02;
    const dominance = (d.share * 0.3 + intermediation * 0.3 + intelPremium * 0.2 + Math.min(relationships, 30) * 0.2);

    return {
      flow_domain: d.flow,
      capital_volume_usd: d.volume,
      market_share_pct: d.share,
      proprietary_advantage: d.advantage,
      platform_intermediation_pct: Math.round(intermediation * 100) / 100,
      intelligence_premium_pct: Math.round(intelPremium * 100) / 100,
      institutional_relationships: relationships,
      countries_active: countries,
      revenue_from_flow_usd: Math.round(revenue),
      dominance_score: Math.round(dominance * 100) / 100,
    };
  });

  const { error } = await client.from("dmem_capital_flow_control").insert(records);
  if (error) throw error;

  const totalVolume = records.reduce((s, r) => s + r.capital_volume_usd, 0);
  return { domains_modeled: records.length, total_capital_volume: totalVolume, total_revenue: records.reduce((s, r) => s + r.revenue_from_flow_usd, 0) };
}

// ── Phase 5: Global Infrastructure Status ──

async function projectGlobalInfrastructure(client: ReturnType<typeof sb>) {
  const dimensions = [
    { dim: "DEFAULT_OS", reach: "MULTI_CONTINENTAL", cities: 250, apis: 500, govPartners: 15 },
    { dim: "DATA_AUTHORITY", reach: "GLOBAL", cities: 400, apis: 800, govPartners: 25 },
    { dim: "URBAN_ECONOMIC_LAYER", reach: "REGIONAL", cities: 80, apis: 200, govPartners: 8 },
    { dim: "REGULATORY_STANDARD", reach: "REGIONAL", cities: 50, apis: 100, govPartners: 20 },
    { dim: "CAPITAL_BACKBONE", reach: "MULTI_CONTINENTAL", cities: 150, apis: 350, govPartners: 10 },
    { dim: "INTELLIGENCE_MONOPOLY", reach: "GLOBAL", cities: 500, apis: 1200, govPartners: 30 },
  ];

  const records = dimensions.map((d) => {
    const penetration = 5 + Math.random() * 30;
    const dataStandard = 10 + Math.random() * 40;
    const irreversibility = (d.cities * 0.05 + d.apis * 0.02 + d.govPartners * 1.5 + penetration * 0.5);
    const annualGDP = d.cities * 1000000 * (penetration / 100);

    return {
      infrastructure_dimension: d.dim,
      geographic_reach: d.reach,
      market_penetration_pct: Math.round(penetration * 100) / 100,
      cities_embedded: d.cities,
      api_integrations: d.apis,
      government_partnerships: d.govPartners,
      data_standard_adoption_pct: Math.round(dataStandard * 100) / 100,
      irreversibility_score: Math.round(Math.min(100, irreversibility) * 100) / 100,
      annual_platform_gdp_usd: Math.round(annualGDP),
      infrastructure_status: irreversibility > 75 ? "IRREVERSIBLE" : irreversibility > 50 ? "EMBEDDED" : irreversibility > 30 ? "ESTABLISHING" : "EMERGING",
    };
  });

  const { error } = await client.from("dmem_global_infrastructure").insert(records);
  if (error) throw error;

  const irreversible = records.filter((r) => r.infrastructure_status === "IRREVERSIBLE").length;
  return { dimensions_projected: records.length, irreversible, total_cities: records.reduce((s, r) => s + r.cities_embedded, 0), total_platform_gdp: records.reduce((s, r) => s + r.annual_platform_gdp_usd, 0) };
}

// ── Dashboard ──

async function dashboard(client: ReturnType<typeof sb>) {
  const [ll, mg, el, cfc, gi] = await Promise.all([
    client.from("dmem_liquidity_leadership").select("*").order("target_year").order("target_quarter").limit(20),
    client.from("dmem_marketplace_gravity").select("*").order("gravity_pull_strength", { ascending: false }).limit(10),
    client.from("dmem_ecosystem_lockin").select("*").order("lock_in_strength", { ascending: false }).limit(10),
    client.from("dmem_capital_flow_control").select("*").order("dominance_score", { ascending: false }).limit(10),
    client.from("dmem_global_infrastructure").select("*").order("irreversibility_score", { ascending: false }).limit(10),
  ]);

  const llData = ll.data ?? [];
  const mgData = mg.data ?? [];
  const elData = el.data ?? [];
  const cfcData = cfc.data ?? [];
  const giData = gi.data ?? [];

  return {
    data: {
      summary: {
        total_milestones: llData.length,
        achieved_milestones: llData.filter((m: any) => m.status === "ACHIEVED").length,
        avg_marketplace_gravity: mgData.length ? Math.round(mgData.reduce((s: number, m: any) => s + (m.gravity_pull_strength || 0), 0) / mgData.length) : 0,
        ecosystem_services: elData.length,
        avg_lock_in: elData.length ? Math.round(elData.reduce((s: number, e: any) => s + (e.lock_in_strength || 0), 0) / elData.length) : 0,
        capital_domains: cfcData.length,
        total_capital_volume: cfcData.reduce((s: number, c: any) => s + (c.capital_volume_usd || 0), 0),
        irreversible_dimensions: giData.filter((g: any) => g.infrastructure_status === "IRREVERSIBLE").length,
        total_cities_embedded: giData.reduce((s: number, g: any) => s + (g.cities_embedded || 0), 0),
      },
      liquidity_leadership: llData,
      marketplace_gravity: mgData,
      ecosystem_lockin: elData,
      capital_flow_control: cfcData,
      global_infrastructure: giData,
    },
  };
}

// ── Main Handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, params = {} } = await req.json();
    const client = sb();

    switch (mode) {
      case "dashboard": return json(await dashboard(client));
      case "plan_liquidity_leadership": return json(await planLiquidityLeadership(client));
      case "compute_marketplace_gravity": return json(await computeMarketplaceGravity(client));
      case "design_ecosystem_lockin": return json(await designEcosystemLockin(client));
      case "model_capital_flow": return json(await modelCapitalFlowControl(client));
      case "project_global_infrastructure": return json(await projectGlobalInfrastructure(client));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
