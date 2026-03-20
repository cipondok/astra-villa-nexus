import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { mode, params } = await req.json();

    switch (mode) {
      case "detect_window": return respond(await detectWindow(supabase, params));
      case "score_readiness": return respond(await scoreReadiness(supabase, params));
      case "evaluate_pathways": return respond(await evaluatePathways(supabase, params));
      case "maximize_valuation": return respond(await maximizeValuation(supabase, params));
      case "plan_post_listing": return respond(await planPostListing(supabase, params));
      case "dashboard": return respond(await dashboard(supabase));
      default: return respond({ error: "Unknown mode" }, 400);
    }
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
});

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Module 1: Market Window Detection ──
async function detectWindow(sb: any, _params: any) {
  const windows = [
    {
      window_name: "Q3 2027 Tech IPO Window",
      window_status: "OPENING",
      tech_valuation_cycle: "RECOVERY",
      interest_rate_env: "FALLING",
      global_re_capital_flow: "EXPANDING",
      ipo_success_rate_pct: 72,
      sector_comparable_multiples: 18,
      vix_level: 16.5,
      market_sentiment_score: 68,
      window_confidence: 74,
      optimal_window_months: 8,
      risk_of_closure_pct: 22,
      macro_signals: { fed_pivot: true, re_capital_inflow_trend: "accelerating", asean_gdp_growth: 5.2 },
    },
    {
      window_name: "Q1 2028 PropTech Premium Window",
      window_status: "OPEN",
      tech_valuation_cycle: "EXPANSION",
      interest_rate_env: "TROUGH",
      global_re_capital_flow: "SURGING",
      ipo_success_rate_pct: 85,
      sector_comparable_multiples: 25,
      vix_level: 13.2,
      market_sentiment_score: 82,
      window_confidence: 88,
      optimal_window_months: 12,
      risk_of_closure_pct: 12,
      macro_signals: { rate_cuts_completed: true, re_transaction_volume_yoy: 35, proptech_ipo_pipeline: 8 },
    },
    {
      window_name: "H2 2028 Late-Cycle Window",
      window_status: "PEAK",
      tech_valuation_cycle: "PEAK",
      interest_rate_env: "TROUGH",
      global_re_capital_flow: "SURGING",
      ipo_success_rate_pct: 90,
      sector_comparable_multiples: 30,
      vix_level: 11.8,
      market_sentiment_score: 92,
      window_confidence: 65,
      optimal_window_months: 4,
      risk_of_closure_pct: 45,
      macro_signals: { euphoria_index: "HIGH", smart_money_reducing: true, valuation_stretch: "ELEVATED" },
    },
    {
      window_name: "2029 Correction Risk Scenario",
      window_status: "CLOSING",
      tech_valuation_cycle: "CONTRACTION",
      interest_rate_env: "RISING",
      global_re_capital_flow: "CONTRACTING",
      ipo_success_rate_pct: 35,
      sector_comparable_multiples: 8,
      vix_level: 28,
      market_sentiment_score: 25,
      window_confidence: 20,
      optimal_window_months: 0,
      risk_of_closure_pct: 85,
      macro_signals: { recession_probability: 45, credit_spread_widening: true, ipo_withdrawals: 12 },
    },
  ];

  await sb.from("geiti_market_window").insert(windows);
  const bestWindow = windows.reduce((b, w) => w.window_confidence > b.window_confidence ? w : b, windows[0]);
  return { windows_assessed: windows.length, best_window: bestWindow.window_name, confidence: bestWindow.window_confidence, status: bestWindow.window_status };
}

// ── Module 2: Platform Readiness Scoring ──
async function scoreReadiness(sb: any, _params: any) {
  // Pull real platform metrics
  const { data: monet } = await sb.from("gvem_monetization_stack").select("current_arr_usd").limit(10);
  const { data: density } = await sb.from("city_network_density").select("network_density_score").order("network_density_score", { ascending: false }).limit(5);
  const { data: dilution } = await sb.from("fcss_dilution_pathway").select("founder_ownership_post").order("round_order", { ascending: false }).limit(1);

  const totalArr = monet?.reduce((s: number, m: any) => s + (m.current_arr_usd || 0), 0) || 5_000_000;
  const avgDensity = density?.length ? density.reduce((s: number, d: any) => s + (d.network_density_score || 0), 0) / density.length : 50;

  const revenueGrowth = 65 + Math.random() * 30;
  const predictability = Math.min(100, totalArr / 200_000 + 30);
  const nrr = 115 + Math.random() * 25;
  const networkMaturity = Math.min(100, avgDensity * 1.2);
  const geoDiversity = 35 + Math.random() * 20;
  const opResilience = 55 + Math.random() * 25;
  const teamComplete = 60 + Math.random() * 20;
  const governance = 45 + Math.random() * 30;

  const overall = (predictability * 0.2 + networkMaturity * 0.2 + revenueGrowth * 0.15 + geoDiversity * 0.1 + opResilience * 0.15 + teamComplete * 0.1 + governance * 0.1);
  const tier = overall >= 80 ? "READY" : overall >= 65 ? "BUILDING" : overall >= 45 ? "EARLY" : "NOT_READY";

  const gaps = [];
  if (governance < 60) gaps.push("governance_audit_readiness");
  if (geoDiversity < 50) gaps.push("geographic_expansion");
  if (totalArr < 10_000_000) gaps.push("revenue_scale");
  if (teamComplete < 70) gaps.push("executive_team_gaps");

  const row = {
    assessment_name: "IPO Readiness Assessment - Current",
    revenue_arr_usd: totalArr,
    revenue_growth_pct: Math.round(revenueGrowth * 100) / 100,
    revenue_predictability_score: Math.round(predictability * 100) / 100,
    net_revenue_retention_pct: Math.round(nrr * 100) / 100,
    network_effect_maturity: Math.round(networkMaturity * 100) / 100,
    geographic_diversification_score: Math.round(geoDiversity * 100) / 100,
    cities_active: 8 + Math.floor(Math.random() * 12),
    countries_active: 1 + Math.floor(Math.random() * 3),
    operational_resilience_score: Math.round(opResilience * 100) / 100,
    team_completeness_score: Math.round(teamComplete * 100) / 100,
    governance_readiness_score: Math.round(governance * 100) / 100,
    audit_readiness: governance > 65,
    soc2_compliant: governance > 75,
    overall_readiness_score: Math.round(overall * 100) / 100,
    readiness_tier: tier,
    gaps,
  };

  await sb.from("geiti_platform_readiness").insert(row);
  return { readiness_score: row.overall_readiness_score, tier, arr: totalArr, gaps_count: gaps.length, gaps };
}

// ── Module 3: Liquidity Pathway Strategy ──
async function evaluatePathways(sb: any, _params: any) {
  const { data: readiness } = await sb.from("geiti_platform_readiness").select("overall_readiness_score, revenue_arr_usd").order("assessed_at", { ascending: false }).limit(1);
  const score = readiness?.[0]?.overall_readiness_score || 60;
  const arr = readiness?.[0]?.revenue_arr_usd || 10_000_000;

  const pathways = [
    {
      pathway_name: "Traditional IPO (SGX or NYSE)",
      pathway_type: "TRADITIONAL_IPO",
      suitability_score: score > 75 ? 85 : 55,
      estimated_valuation_usd: arr * 22,
      founder_dilution_pct: 18,
      founder_control_post: 35,
      time_to_execution_months: 18,
      complexity_score: 85,
      regulatory_risk: "HIGH",
      capital_raised_usd: arr * 3,
      liquidity_for_shareholders_usd: arr * 1.5,
      pros: ["Maximum valuation", "Public currency for M&A", "Brand prestige", "Employee liquidity"],
      cons: ["Expensive process ($3-5M+)", "Ongoing compliance", "Public scrutiny", "Quarterly pressure"],
      prerequisites: ["SOC2", "Audit readiness", "Independent board majority", "CFO hire"],
      recommended_timing: "Q1 2028 if ARR >$15M",
    },
    {
      pathway_name: "Direct Listing (SGX)",
      pathway_type: "DIRECT_LISTING",
      suitability_score: score > 70 ? 75 : 45,
      estimated_valuation_usd: arr * 18,
      founder_dilution_pct: 0,
      founder_control_post: 55,
      time_to_execution_months: 12,
      complexity_score: 70,
      regulatory_risk: "MODERATE",
      capital_raised_usd: 0,
      liquidity_for_shareholders_usd: arr * 2,
      pros: ["Zero dilution", "True price discovery", "Lower cost", "No lockup restrictions"],
      cons: ["No new capital raised", "Less analyst coverage", "Volatile first-day", "Limited track record in ASEAN"],
      prerequisites: ["Strong cash position", "Brand recognition", "Market-maker agreements"],
      recommended_timing: "H2 2028 if cash-flow positive",
    },
    {
      pathway_name: "Strategic Partial Sale (30%)",
      pathway_type: "PARTIAL_SALE",
      suitability_score: 72,
      estimated_valuation_usd: arr * 15,
      founder_dilution_pct: 30,
      founder_control_post: 52,
      time_to_execution_months: 6,
      complexity_score: 45,
      regulatory_risk: "LOW",
      capital_raised_usd: arr * 4.5,
      liquidity_for_shareholders_usd: arr * 2,
      pros: ["Immediate liquidity", "Strategic partner value", "Faster execution", "Maintain control"],
      cons: ["Lower multiple", "Strategic alignment risk", "Limited buyer pool", "Potential conflicts"],
      prerequisites: ["Strategic buyer identified", "Clean data room", "Competitive tension"],
      recommended_timing: "Anytime with strong buyer interest",
    },
    {
      pathway_name: "Staged Secondary Program",
      pathway_type: "SECONDARY_PROGRAM",
      suitability_score: 80,
      estimated_valuation_usd: arr * 12,
      founder_dilution_pct: 10,
      founder_control_post: 65,
      time_to_execution_months: 3,
      complexity_score: 30,
      regulatory_risk: "LOW",
      capital_raised_usd: 0,
      liquidity_for_shareholders_usd: arr * 1,
      pros: ["Founder liquidity", "Employee retention", "No company dilution", "Control preserved"],
      cons: ["Lower valuation", "Limited volume", "Information asymmetry", "Buyer qualification"],
      prerequisites: ["409A/FMV valuation", "Transfer restrictions", "ROFR framework"],
      recommended_timing: "Post Series B, pre-IPO",
    },
    {
      pathway_name: "Dual-Track (IPO + Strategic)",
      pathway_type: "DUAL_TRACK",
      suitability_score: score > 65 ? 78 : 50,
      estimated_valuation_usd: arr * 25,
      founder_dilution_pct: 15,
      founder_control_post: 45,
      time_to_execution_months: 15,
      complexity_score: 90,
      regulatory_risk: "HIGH",
      capital_raised_usd: arr * 3.5,
      liquidity_for_shareholders_usd: arr * 2.5,
      pros: ["Maximum optionality", "Competitive tension", "Best price", "Flexibility"],
      cons: ["Highest cost", "Management distraction", "Complexity", "Leak risk"],
      prerequisites: ["Full IPO readiness", "Strategic interest confirmed", "Banker mandate"],
      recommended_timing: "When both paths credible, 12-18 months before target",
    },
  ];

  await sb.from("geiti_liquidity_pathway").insert(pathways);
  const best = pathways.reduce((b, p) => p.suitability_score > b.suitability_score ? p : b, pathways[0]);
  return { pathways_evaluated: pathways.length, recommended: best.pathway_name, suitability: best.suitability_score, estimated_valuation: best.estimated_valuation_usd };
}

// ── Module 4: Valuation Maximization ──
async function maximizeValuation(sb: any, _params: any) {
  const { data: windows } = await sb.from("geiti_market_window").select("window_name, sector_comparable_multiples, market_sentiment_score, window_confidence").order("window_confidence", { ascending: false }).limit(4);
  const { data: monet } = await sb.from("gvem_monetization_stack").select("current_arr_usd").limit(10);
  const baseRevenue = monet?.reduce((s: number, m: any) => s + (m.current_arr_usd || 0), 0) || 13_600_000;

  const scenarios = (windows || []).map((w: any) => {
    const demand = w.market_sentiment_score * 0.8 + Math.random() * 15;
    const scarcity = 40 + w.window_confidence * 0.4 + Math.random() * 10;
    const growthPremium = w.sector_comparable_multiples * (1 + demand / 200);
    const implied = baseRevenue * growthPremium;
    const premiumOverComp = ((growthPremium - w.sector_comparable_multiples) / w.sector_comparable_multiples) * 100;
    const narrative = Math.min(100, 50 + scarcity * 0.3 + demand * 0.2);
    const oversubscription = 1 + demand / 50;

    return {
      scenario_name: `Valuation @ ${w.window_name}`,
      timing_quarter: w.window_name.split(" ")[0] || "Q1 2028",
      investor_demand_score: Math.round(Math.min(100, demand) * 100) / 100,
      scarcity_perception_score: Math.round(Math.min(100, scarcity) * 100) / 100,
      growth_premium_multiple: Math.round(growthPremium * 10) / 10,
      base_revenue_usd: baseRevenue,
      implied_valuation_usd: Math.round(implied),
      comparable_median_multiple: w.sector_comparable_multiples,
      premium_over_comparable_pct: Math.round(premiumOverComp * 100) / 100,
      narrative_strength_score: Math.round(narrative * 100) / 100,
      institutional_demand_oversubscription: Math.round(oversubscription * 10) / 10,
      pricing_strategy: demand > 75 ? "PREMIUM" : demand > 55 ? "MARKET" : "DISCOUNT",
      first_day_pop_target_pct: demand > 70 ? 20 : 15,
      lockup_period_days: 180,
      greenshoe_pct: 15,
    };
  });

  if (scenarios.length === 0) {
    scenarios.push({
      scenario_name: "Base Case Valuation",
      timing_quarter: "Q1 2028",
      investor_demand_score: 65,
      scarcity_perception_score: 55,
      growth_premium_multiple: 18,
      base_revenue_usd: baseRevenue,
      implied_valuation_usd: baseRevenue * 18,
      comparable_median_multiple: 12,
      premium_over_comparable_pct: 50,
      narrative_strength_score: 70,
      institutional_demand_oversubscription: 2.5,
      pricing_strategy: "MARKET",
      first_day_pop_target_pct: 15,
      lockup_period_days: 180,
      greenshoe_pct: 15,
    });
  }

  await sb.from("geiti_valuation_maximization").insert(scenarios);
  const maxVal = Math.max(...scenarios.map((s: any) => s.implied_valuation_usd));
  return { scenarios_modeled: scenarios.length, max_implied_valuation: maxVal, optimal_timing: scenarios.reduce((b: any, s: any) => s.implied_valuation_usd > b.implied_valuation_usd ? s : b, scenarios[0]).timing_quarter };
}

// ── Module 5: Post-Listing Control ──
async function planPostListing(sb: any, _params: any) {
  const mechanisms = [
    { name: "Dual-Class Share Structure (Class B: 10 votes)", type: "DUAL_CLASS_SHARES", effectiveness: 95, voting: 78, boardIndep: 55, irStrategy: "Quarterly earnings + annual investor day", guidance: "CONSERVATIVE", activist: 85, longTerm: 60, shortThreshold: 5, comm: "QUARTERLY", vision: 92 },
    { name: "Staggered Board (3-Year Terms)", type: "STAGGERED_BOARD", effectiveness: 75, voting: 50, boardIndep: 66, irStrategy: "Board composition narrative emphasizing expertise", guidance: "INLINE", activist: 70, longTerm: 50, shortThreshold: 8, comm: "QUARTERLY", vision: 72 },
    { name: "Strategic Share Buyback Program", type: "BUYBACK_PROGRAM", effectiveness: 60, voting: 55, boardIndep: 55, irStrategy: "Signal confidence during weakness", guidance: "CONSERVATIVE", activist: 55, longTerm: 45, shortThreshold: 12, comm: "QUARTERLY", vision: 55 },
    { name: "Founder Voting Agreement (5-Year Lock)", type: "VOTING_AGREEMENT", effectiveness: 80, voting: 65, boardIndep: 50, irStrategy: "Align key investors with long-term thesis", guidance: "NO_GUIDANCE", activist: 75, longTerm: 70, shortThreshold: 6, comm: "QUARTERLY", vision: 85 },
    { name: "180-Day Lockup + Staged Release", type: "LOCKUP_STRATEGY", effectiveness: 55, voting: 50, boardIndep: 55, irStrategy: "Orderly market post-IPO, controlled float", guidance: "CONSERVATIVE", activist: 40, longTerm: 35, shortThreshold: 15, comm: "QUARTERLY", vision: 50 },
    { name: "Earnings Narrative Management", type: "EARNINGS_NARRATIVE", effectiveness: 70, voting: 50, boardIndep: 55, irStrategy: "Beat-and-raise cadence, long-term KPI focus", guidance: "CONSERVATIVE", activist: 60, longTerm: 55, shortThreshold: 10, comm: "QUARTERLY", vision: 75 },
    { name: "Sell-Side Analyst Cultivation", type: "ANALYST_MANAGEMENT", effectiveness: 65, voting: 50, boardIndep: 55, irStrategy: "Selective coverage from category-aligned analysts", guidance: "INLINE", activist: 50, longTerm: 50, shortThreshold: 10, comm: "QUARTERLY", vision: 65 },
  ];

  const rows = mechanisms.map((m) => ({
    mechanism_name: m.name,
    mechanism_type: m.type,
    effectiveness_score: m.effectiveness,
    founder_voting_control_pct: m.voting,
    board_independence_pct: m.boardIndep,
    investor_relations_strategy: m.irStrategy,
    earnings_guidance_approach: m.guidance,
    activist_defense_score: m.activist,
    long_term_holder_pct: m.longTerm,
    short_interest_threshold_pct: m.shortThreshold,
    communication_cadence: m.comm,
    vision_protection_score: m.vision,
    is_active: m.effectiveness > 70,
  }));

  await sb.from("geiti_post_listing_control").insert(rows);

  await sb.from("ai_event_signals").insert({
    event_type: "geiti_engine_cycle",
    entity_type: "geiti",
    priority_level: "normal",
    payload: { mechanisms_planned: rows.length, active: rows.filter((r) => r.is_active).length },
  });

  return { mechanisms_planned: rows.length, active: rows.filter((r) => r.is_active).length, strongest: mechanisms[0].name, recommended_stack: ["DUAL_CLASS_SHARES", "VOTING_AGREEMENT", "EARNINGS_NARRATIVE"] };
}

// ── Dashboard ──
async function dashboard(sb: any) {
  const [windows, readiness, pathways, valuation, control] = await Promise.all([
    sb.from("geiti_market_window").select("*").order("window_confidence", { ascending: false }).limit(5),
    sb.from("geiti_platform_readiness").select("*").order("assessed_at", { ascending: false }).limit(3),
    sb.from("geiti_liquidity_pathway").select("*").order("suitability_score", { ascending: false }).limit(10),
    sb.from("geiti_valuation_maximization").select("*").order("implied_valuation_usd", { ascending: false }).limit(10),
    sb.from("geiti_post_listing_control").select("*").order("effectiveness_score", { ascending: false }).limit(10),
  ]);

  const bestWindow = windows.data?.[0];
  const latestReadiness = readiness.data?.[0];
  const maxValuation = valuation.data?.[0]?.implied_valuation_usd || 0;
  const topPathway = pathways.data?.[0];

  return {
    summary: {
      best_window: bestWindow?.window_name || "TBD",
      window_confidence: bestWindow?.window_confidence || 0,
      readiness_score: latestReadiness?.overall_readiness_score || 0,
      readiness_tier: latestReadiness?.readiness_tier || "NOT_READY",
      max_implied_valuation: maxValuation,
      recommended_pathway: topPathway?.pathway_name || "TBD",
    },
    market_windows: windows.data || [],
    platform_readiness: readiness.data || [],
    liquidity_pathways: pathways.data || [],
    valuation_scenarios: valuation.data || [],
    post_listing_controls: control.data || [],
  };
}
