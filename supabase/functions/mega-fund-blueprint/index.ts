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
      case "generate_thesis": return respond(await generateThesis(supabase, params));
      case "structure_fund": return respond(await structureFund(supabase, params));
      case "originate_deals": return respond(await originateDeals(supabase, params));
      case "raise_capital": return respond(await raiseCapital(supabase, params));
      case "compute_flywheel": return respond(await computeFlywheel(supabase, params));
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

// ── Module 1: Fund Thesis Engine ──
async function generateThesis(sb: any, _params: any) {
  // Pull platform intelligence signals
  const { data: heatZones } = await sb.from("market_heat_zones").select("city, district, heat_score").order("heat_score", { ascending: false }).limit(10);
  const { data: liquidity } = await sb.from("city_network_density").select("city, network_density_score").order("network_density_score", { ascending: false }).limit(5);

  const topDistricts = heatZones?.map((z: any) => z.district).filter(Boolean).slice(0, 5) || ["Seminyak", "Canggu", "Ubud"];
  const avgHeat = heatZones?.length ? heatZones.reduce((s: number, z: any) => s + (z.heat_score || 0), 0) / heatZones.length : 65;

  const theses = [
    {
      thesis_name: "Bali Growth Corridor Fund I",
      thesis_type: "GROWTH_CORRIDOR",
      target_geography: "Bali, Indonesia",
      target_districts: topDistricts.slice(0, 3),
      data_signals: { avg_heat_score: avgHeat, platform_listings: 2500, transaction_velocity: 45 },
      heat_score_threshold: 70,
      liquidity_score_threshold: 60,
      expected_irr_pct: 22,
      expected_multiple: 2.2,
      hold_period_years: 5,
      conviction_score: 85,
      narrative: "Capitalizing on Bali's accelerating tourism-driven residential demand in verified high-heat corridors with platform-exclusive deal flow",
      competitive_edge: "Proprietary heat scoring + 3x faster close via agent network",
      risk_factors: ["regulatory_change", "tourism_dependency", "currency_risk"],
      status: "BACKTESTED",
    },
    {
      thesis_name: "Indonesia Liquidity Arbitrage Fund",
      thesis_type: "LIQUIDITY_ARBITRAGE",
      target_geography: "Multi-City Indonesia",
      target_districts: ["Jakarta CBD", "Surabaya East", "Bandung Tech"],
      data_signals: { liquidity_gap_pct: 35, pricing_inefficiency: 18, platform_coverage: 85 },
      heat_score_threshold: 55,
      liquidity_score_threshold: 40,
      expected_irr_pct: 18,
      expected_multiple: 1.8,
      hold_period_years: 3,
      conviction_score: 75,
      narrative: "Exploiting pricing inefficiencies in under-served urban districts using ML valuation edge",
      competitive_edge: "ML pricing model with 8% accuracy advantage vs market",
      risk_factors: ["model_drift", "liquidity_shock", "macro_downturn"],
      status: "DRAFT",
    },
    {
      thesis_name: "ASEAN Yield Harvest Vehicle",
      thesis_type: "YIELD_HARVEST",
      target_geography: "ASEAN",
      target_districts: ["Singapore D9", "KL KLCC", "Bangkok Sukhumvit", "Ho Chi Minh D1"],
      data_signals: { avg_yield_pct: 6.5, occupancy_rate: 92, cross_border_demand: "HIGH" },
      heat_score_threshold: 60,
      liquidity_score_threshold: 70,
      expected_irr_pct: 12,
      expected_multiple: 1.5,
      hold_period_years: 7,
      conviction_score: 65,
      narrative: "Diversified ASEAN rental yield portfolio targeting stable income with platform-verified tenant demand data",
      competitive_edge: "Cross-border data intelligence + unified tenant matching",
      risk_factors: ["fx_risk", "regulatory_fragmentation", "political_instability"],
      status: "DRAFT",
    },
    {
      thesis_name: "Urban Regeneration Special Situations",
      thesis_type: "URBAN_REGENERATION",
      target_geography: "Indonesia Tier-2 Cities",
      target_districts: ["Semarang Old Town", "Yogyakarta South", "Makassar Waterfront"],
      data_signals: { infrastructure_investment_index: 78, price_growth_3yr: 45, government_incentive_active: true },
      heat_score_threshold: 45,
      liquidity_score_threshold: 35,
      expected_irr_pct: 28,
      expected_multiple: 2.8,
      hold_period_years: 5,
      conviction_score: 60,
      narrative: "Value creation through early-stage positioning in government-backed urban development zones",
      competitive_edge: "First-mover data in Tier-2 markets with no institutional coverage",
      risk_factors: ["execution_risk", "infrastructure_delay", "demand_uncertainty"],
      status: "DRAFT",
    },
  ];

  await sb.from("mfcb_fund_thesis").insert(theses);
  return { theses_generated: theses.length, top_conviction: theses[0].thesis_name, avg_target_irr: Math.round(theses.reduce((s, t) => s + t.expected_irr_pct, 0) / theses.length * 100) / 100 };
}

// ── Module 2: Fund Structure ──
async function structureFund(sb: any, _params: any) {
  const { data: theses } = await sb.from("mfcb_fund_thesis").select("id, thesis_name, thesis_type").order("conviction_score", { ascending: false }).limit(4);

  const structures = [
    { name: "ASTRA RE Fund I", type: "CLOSED_END", targetAum: 50_000_000, minCommit: 1_000_000, mgmtFee: 2.0, carry: 20, hurdle: 8, term: 7, investPeriod: 3, gpCommit: 5, domicile: "Singapore" },
    { name: "ASTRA Co-Invest Vehicle", type: "CO_INVESTMENT", targetAum: 20_000_000, minCommit: 500_000, mgmtFee: 0.5, carry: 15, hurdle: 6, term: 5, investPeriod: 2, gpCommit: 10, domicile: "Singapore" },
    { name: "ASTRA Opportunity Fund", type: "SPECIAL_OPPORTUNITY", targetAum: 100_000_000, minCommit: 5_000_000, mgmtFee: 1.5, carry: 25, hurdle: 10, term: 5, investPeriod: 2, gpCommit: 3, domicile: "Cayman Islands" },
    { name: "ASTRA ASEAN Thematic", type: "REGIONAL_THEMATIC", targetAum: 200_000_000, minCommit: 10_000_000, mgmtFee: 1.75, carry: 20, hurdle: 8, term: 10, investPeriod: 4, gpCommit: 2, domicile: "Singapore" },
    { name: "ASTRA Evergreen Income", type: "EVERGREEN", targetAum: 75_000_000, minCommit: 250_000, mgmtFee: 1.25, carry: 10, hurdle: 5, term: 99, investPeriod: 99, gpCommit: 5, domicile: "Indonesia" },
  ];

  const rows = structures.map((s, i) => ({
    fund_name: s.name,
    fund_type: s.type,
    thesis_id: theses?.[Math.min(i, (theses?.length || 1) - 1)]?.id || null,
    target_aum_usd: s.targetAum,
    current_aum_usd: 0,
    minimum_commitment_usd: s.minCommit,
    management_fee_pct: s.mgmtFee,
    carry_pct: s.carry,
    hurdle_rate_pct: s.hurdle,
    fund_term_years: s.term,
    investment_period_years: s.investPeriod,
    gp_commitment_pct: s.gpCommit,
    num_lps: 0,
    target_lps: Math.ceil(s.targetAum / s.minCommit / 2),
    domicile: s.domicile,
    status: i === 0 ? "STRUCTURING" : "PLANNING",
  }));

  await sb.from("mfcb_fund_structure").insert(rows);
  const totalTarget = rows.reduce((s, r) => s + r.target_aum_usd, 0);
  return { funds_structured: rows.length, total_target_aum: totalTarget, flagship: structures[0].name };
}

// ── Module 3: Deal Origination ──
async function originateDeals(sb: any, _params: any) {
  const { data: funds } = await sb.from("mfcb_fund_structure").select("id, fund_name").order("created_at", { ascending: false }).limit(5);
  const fundId = funds?.[0]?.id || null;

  // Pull platform deal signals
  const { data: hotDeals } = await sb.from("properties").select("title, city, district, price").order("created_at", { ascending: false }).limit(10);

  const channels = ["PLATFORM_PIPELINE", "AGENT_NETWORK", "AI_DISCOVERY", "OFF_MARKET", "INSTITUTIONAL_REFERRAL", "DISTRESSED_SCREEN"];
  const deals = [];

  for (let i = 0; i < 12; i++) {
    const city = hotDeals?.[i % (hotDeals?.length || 1)]?.city || ["Jakarta", "Bali", "Surabaya", "Bandung"][i % 4];
    const district = hotDeals?.[i % (hotDeals?.length || 1)]?.district || `District ${i + 1}`;
    const channel = channels[i % channels.length];
    const value = 500_000 + Math.random() * 4_500_000;
    const pricingAdv = 5 + Math.random() * 15;
    const closeTime = channel === "PLATFORM_PIPELINE" ? 45 + Math.random() * 30 : 90 + Math.random() * 60;

    deals.push({
      fund_id: fundId,
      deal_name: `${city} ${district} - Asset ${i + 1}`,
      asset_type: ["Residential", "Commercial", "Mixed-Use", "Land"][i % 4],
      city,
      district,
      source_channel: channel,
      deal_value_usd: Math.round(value),
      platform_pricing_advantage_pct: Math.round(pricingAdv * 100) / 100,
      time_to_close_days: Math.round(closeTime),
      competitor_avg_close_days: 150,
      data_confidence_score: 60 + Math.random() * 35,
      proprietary_signals: { heat_score: 55 + Math.random() * 40, liquidity_index: 40 + Math.random() * 50 },
      pipeline_stage: ["SOURCED", "SCREENING", "DUE_DILIGENCE", "TERM_SHEET"][Math.floor(Math.random() * 4)],
      expected_irr_pct: 12 + Math.random() * 18,
    });
  }

  await sb.from("mfcb_deal_origination").insert(deals);
  const platformPct = Math.round(deals.filter(d => ["PLATFORM_PIPELINE", "AI_DISCOVERY"].includes(d.source_channel)).length / deals.length * 100);
  return { deals_originated: deals.length, platform_sourced_pct: platformPct, avg_pricing_advantage: Math.round(deals.reduce((s, d) => s + d.platform_pricing_advantage_pct, 0) / deals.length * 100) / 100 };
}

// ── Module 4: Capital Raising ──
async function raiseCapital(sb: any, _params: any) {
  const { data: funds } = await sb.from("mfcb_fund_structure").select("id, fund_name, target_aum_usd").order("created_at", { ascending: false }).limit(3);

  const segments = [
    { segment: "SOVEREIGN_FUND", alloc: 25_000_000, mandateAlign: 75, decisionMaker: "CIO Office", mandate: { min_fund_size: 50_000_000, geography: "ASEAN", return_target: "8-15% net" } },
    { segment: "PENSION", alloc: 15_000_000, mandateAlign: 70, decisionMaker: "RE Allocation Committee", mandate: { risk_profile: "core-plus", liquidity: "semi-annual", esg_required: true } },
    { segment: "FAMILY_OFFICE", alloc: 5_000_000, mandateAlign: 85, decisionMaker: "Principal", mandate: { return_target: "15%+", co_invest_interest: true, direct_access: true } },
    { segment: "ENDOWMENT", alloc: 10_000_000, mandateAlign: 65, decisionMaker: "Investment Committee", mandate: { time_horizon: "10yr+", impact_overlay: true } },
    { segment: "FUND_OF_FUNDS", alloc: 20_000_000, mandateAlign: 72, decisionMaker: "Portfolio Manager", mandate: { emerging_manager_allocation: true, track_record_min: "1 fund" } },
    { segment: "INSURANCE", alloc: 8_000_000, mandateAlign: 60, decisionMaker: "ALM Team", mandate: { duration_match: true, yield_floor: "6%", regulatory: "Solvency II" } },
    { segment: "HNWI", alloc: 2_000_000, mandateAlign: 90, decisionMaker: "Direct", mandate: { min_ticket: 500_000, co_invest: true, quarterly_reporting: true } },
    { segment: "CORPORATE", alloc: 12_000_000, mandateAlign: 55, decisionMaker: "Treasury / Corp Dev", mandate: { strategic_alignment: true, balance_sheet_treatment: "off" } },
  ];

  const rows = segments.map((s) => ({
    fund_id: funds?.[0]?.id || null,
    lp_segment: s.segment,
    target_allocation_usd: s.alloc,
    committed_usd: 0,
    pipeline_usd: Math.round(s.alloc * s.mandateAlign / 100),
    conversion_probability_pct: 15 + Math.random() * 35,
    mandate_alignment_score: s.mandateAlign,
    engagement_stage: s.mandateAlign > 80 ? "MEETING_SET" : "INTRO_SENT",
    key_decision_maker: s.decisionMaker,
    mandate_requirements: s.mandate,
    objections: ["track_record", "fund_size", "geography_concentration"].slice(0, 1 + Math.floor(Math.random() * 2)),
    next_milestone: s.mandateAlign > 80 ? "Schedule DD presentation" : "Send fund teaser",
  }));

  await sb.from("mfcb_capital_raising").insert(rows);
  const totalPipeline = rows.reduce((s, r) => s + r.pipeline_usd, 0);
  return { lp_segments_targeted: rows.length, total_pipeline_usd: totalPipeline, highest_alignment: segments.reduce((b, s) => s.mandateAlign > b.mandateAlign ? s : b, segments[0]).segment };
}

// ── Module 5: Performance Flywheel ──
async function computeFlywheel(sb: any, _params: any) {
  const { data: funds } = await sb.from("mfcb_fund_structure").select("id").order("created_at", { ascending: false }).limit(1);
  const { data: deals } = await sb.from("mfcb_deal_origination").select("data_confidence_score, expected_irr_pct").limit(20);

  const fundId = funds?.[0]?.id || null;
  const avgDataQuality = deals?.length ? deals.reduce((s: number, d: any) => s + (d.data_confidence_score || 0), 0) / deals.length : 60;
  const avgIrr = deals?.length ? deals.reduce((s: number, d: any) => s + (d.expected_irr_pct || 0), 0) / deals.length : 15;

  const quarters = ["2026-Q1", "2026-Q2", "2026-Q3", "2026-Q4", "2027-Q1", "2027-Q2", "2027-Q3", "2027-Q4"];
  let momentum = 30;
  const rows = [];

  for (const q of quarters) {
    const dataQuality = Math.min(100, avgDataQuality + momentum * 0.2 + Math.random() * 5);
    const dealQuality = Math.min(100, 40 + momentum * 0.3 + Math.random() * 10);
    const irr = avgIrr * (1 + momentum * 0.005);
    const tvpi = 1 + irr / 100 * (quarters.indexOf(q) + 1) * 0.25;
    const dpi = Math.max(0, tvpi - 1) * 0.3;
    const lpSat = Math.min(100, 50 + irr * 1.5 + Math.random() * 10);
    const followOn = Math.min(80, lpSat * 0.6);
    const aumGrowth = followOn * 0.5 + Math.random() * 5;
    const platformInfluence = Math.min(100, 30 + momentum * 0.5 + aumGrowth * 0.3);

    // Flywheel compounding
    const compounding = momentum > 70 ? 1.15 : momentum > 50 ? 1.1 : 1.05;
    momentum = Math.min(100, momentum * compounding + dataQuality * 0.05);

    const stage = momentum >= 85 ? "SELF_SUSTAINING" : momentum >= 70 ? "DOMINANCE" : momentum >= 55 ? "ACCELERATION" : momentum >= 40 ? "TRACTION" : "IGNITION";

    rows.push({
      fund_id: fundId,
      period_quarter: q,
      data_quality_score: Math.round(dataQuality * 100) / 100,
      deal_quality_score: Math.round(dealQuality * 100) / 100,
      portfolio_irr_pct: Math.round(irr * 100) / 100,
      portfolio_tvpi: Math.round(tvpi * 100) / 100,
      portfolio_dpi: Math.round(dpi * 100) / 100,
      lp_satisfaction_score: Math.round(lpSat * 100) / 100,
      follow_on_commitment_pct: Math.round(followOn * 100) / 100,
      aum_growth_pct: Math.round(aumGrowth * 100) / 100,
      platform_influence_score: Math.round(platformInfluence * 100) / 100,
      flywheel_momentum: Math.round(momentum * 100) / 100,
      flywheel_stage: stage,
      compounding_rate: compounding,
    });
  }

  await sb.from("mfcb_performance_flywheel").insert(rows);

  await sb.from("ai_event_signals").insert({
    event_type: "mfcb_engine_cycle",
    entity_type: "mfcb",
    priority_level: "normal",
    payload: { quarters_computed: rows.length, final_momentum: rows[rows.length - 1].flywheel_momentum, stage: rows[rows.length - 1].flywheel_stage },
  });

  return { quarters_computed: rows.length, final_momentum: rows[rows.length - 1].flywheel_momentum, final_stage: rows[rows.length - 1].flywheel_stage };
}

// ── Dashboard ──
async function dashboard(sb: any) {
  const [thesis, structure, deals, raising, flywheel] = await Promise.all([
    sb.from("mfcb_fund_thesis").select("*").order("conviction_score", { ascending: false }).limit(10),
    sb.from("mfcb_fund_structure").select("*").order("created_at", { ascending: false }).limit(10),
    sb.from("mfcb_deal_origination").select("*").order("created_at", { ascending: false }).limit(20),
    sb.from("mfcb_capital_raising").select("*").order("mandate_alignment_score", { ascending: false }).limit(15),
    sb.from("mfcb_performance_flywheel").select("*").order("computed_at", { ascending: false }).limit(8),
  ]);

  const totalTargetAum = structure.data?.reduce((s: number, f: any) => s + (f.target_aum_usd || 0), 0) || 0;
  const totalPipeline = raising.data?.reduce((s: number, r: any) => s + (r.pipeline_usd || 0), 0) || 0;
  const dealCount = deals.data?.length || 0;
  const latestMomentum = flywheel.data?.[0]?.flywheel_momentum || 0;

  return {
    summary: { total_target_aum: totalTargetAum, lp_pipeline_usd: totalPipeline, active_deals: dealCount, flywheel_momentum: latestMomentum },
    fund_theses: thesis.data || [],
    fund_structures: structure.data || [],
    deal_pipeline: deals.data || [],
    capital_raising: raising.data || [],
    performance_flywheel: flywheel.data || [],
  };
}
