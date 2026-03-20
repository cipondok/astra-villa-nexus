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
      case "simulate_dilution": return respond(await simulateDilution(supabase, params));
      case "optimize_efficiency": return respond(await optimizeEfficiency(supabase, params));
      case "map_optionality": return respond(await mapOptionality(supabase, params));
      case "preserve_control": return respond(await preserveControl(supabase, params));
      case "project_wealth": return respond(await projectWealth(supabase, params));
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

// ── Module 1: Dilution Pathway Simulation ──
async function simulateDilution(sb: any, params: any) {
  const scenarioName = params?.scenario || "Optimal Control";
  const initialOwnership = params?.initial_ownership || 100;

  const rounds = [
    { stage: "BOOTSTRAP", order: 0, pre: 0, raise: 0, esop: 0, investor: "Founder", liqPref: 0, secondary: 0 },
    { stage: "PRE_SEED", order: 1, pre: 2_000_000, raise: 300_000, esop: 5, investor: "Angel", liqPref: 1.0, secondary: 0 },
    { stage: "SEED", order: 2, pre: 8_000_000, raise: 1_500_000, esop: 5, investor: "Seed VC", liqPref: 1.0, secondary: 50_000 },
    { stage: "SERIES_A", order: 3, pre: 35_000_000, raise: 8_000_000, esop: 5, investor: "Series A VC", liqPref: 1.0, secondary: 200_000 },
    { stage: "SERIES_B", order: 4, pre: 120_000_000, raise: 25_000_000, esop: 3, investor: "Growth VC", liqPref: 1.0, secondary: 1_000_000 },
    { stage: "GROWTH", order: 5, pre: 400_000_000, raise: 60_000_000, esop: 2, investor: "Late Stage", liqPref: 1.0, secondary: 3_000_000 },
    { stage: "PRE_IPO", order: 6, pre: 800_000_000, raise: 100_000_000, esop: 1, investor: "Crossover Fund", liqPref: 1.0, secondary: 5_000_000 },
    { stage: "IPO", order: 7, pre: 1_500_000_000, raise: 200_000_000, esop: 0, investor: "Public Market", liqPref: 0, secondary: 10_000_000 },
  ];

  let ownership = initialOwnership;
  let cumulativeDilution = 0;
  const rows = [];

  for (const r of rounds) {
    const ownershipPre = ownership;
    const postMoney = r.pre + r.raise;
    const roundDilution = r.raise > 0 ? (r.raise / postMoney) * 100 : 0;
    const esopDilution = r.esop;
    const totalDilution = roundDilution + esopDilution;
    ownership = ownershipPre * (1 - totalDilution / 100);
    cumulativeDilution = 100 - ownership;

    // Control score: voting power + board leverage + protective provisions
    const controlScore = Math.max(0, Math.min(100,
      ownership * 0.6 + // ownership weight
      (ownership > 50 ? 30 : ownership > 33 ? 20 : 10) + // voting threshold bonus
      (r.order < 4 ? 15 : 5) // early stage founder leverage
    ));

    rows.push({
      scenario_name: scenarioName,
      round_stage: r.stage,
      round_order: r.order,
      pre_money_valuation_usd: r.pre,
      raise_amount_usd: r.raise,
      post_money_valuation_usd: postMoney,
      dilution_pct: Math.round(totalDilution * 1000) / 1000,
      founder_ownership_pre: Math.round(ownershipPre * 1000) / 1000,
      founder_ownership_post: Math.round(ownership * 1000) / 1000,
      esop_pool_pct: r.esop,
      secondary_liquidity_usd: r.secondary,
      investor_type: r.investor,
      anti_dilution_type: "BROAD_WEIGHTED_AVG",
      liquidation_preference: r.liqPref,
      participating: false,
      cumulative_dilution_pct: Math.round(cumulativeDilution * 1000) / 1000,
      control_score: Math.round(controlScore * 100) / 100,
    });
  }

  await sb.from("fcss_dilution_pathway").insert(rows);

  return {
    scenario: scenarioName,
    rounds_modeled: rows.length,
    final_ownership_pct: Math.round(ownership * 1000) / 1000,
    total_secondary_usd: rows.reduce((s, r) => s + r.secondary_liquidity_usd, 0),
    control_risk: ownership < 50 ? "HIGH" : ownership < 67 ? "MODERATE" : "LOW",
  };
}

// ── Module 2: Capital Efficiency Optimization ──
async function optimizeEfficiency(sb: any, params: any) {
  const scenarioName = params?.scenario || "Balanced Growth";
  const strategies = [
    { type: "AGGRESSIVE", burnMult: 1.8, hiringPct: 40, mktPct: 30, prodPct: 20, geoPct: 10, growthRate: 25 },
    { type: "BALANCED", burnMult: 1.2, hiringPct: 35, mktPct: 20, prodPct: 30, geoPct: 15, growthRate: 15 },
    { type: "DISCIPLINED", burnMult: 0.8, hiringPct: 25, mktPct: 15, prodPct: 40, geoPct: 20, growthRate: 10 },
    { type: "SURVIVAL", burnMult: 0.4, hiringPct: 15, mktPct: 10, prodPct: 50, geoPct: 25, growthRate: 5 },
  ];

  const rows = [];
  for (const s of strategies) {
    let cash = 1_500_000;
    let revenue = 15_000;

    for (let m = 0; m <= 24; m += 6) {
      const burn = 45_000 * s.burnMult * (1 + m * 0.02);
      revenue = revenue * Math.pow(1 + s.growthRate / 100, m > 0 ? 6 : 0);
      const netBurn = burn - revenue;
      cash = Math.max(0, cash - netBurn * (m > 0 ? 6 : 0));
      const runway = netBurn > 0 ? cash / netBurn : 999;
      const burnMultiple = revenue > 0 ? netBurn / revenue : 99;
      const efficiency = Math.max(0, Math.min(100,
        (runway > 18 ? 40 : runway * 2.2) +
        (burnMultiple < 2 ? 30 : 30 - burnMultiple * 5) +
        (s.growthRate > 15 ? 30 : s.growthRate * 2)
      ));

      rows.push({
        scenario_name: `${scenarioName} - ${s.type}`,
        month_offset: m,
        cash_balance_usd: Math.round(cash),
        monthly_burn_usd: Math.round(burn),
        monthly_revenue_usd: Math.round(revenue),
        net_burn_usd: Math.round(netBurn),
        runway_months: Math.round(runway * 10) / 10,
        burn_multiple: Math.round(burnMultiple * 100) / 100,
        hiring_spend_pct: s.hiringPct,
        marketing_spend_pct: s.mktPct,
        product_spend_pct: s.prodPct,
        geo_expansion_spend_pct: s.geoPct,
        capital_efficiency_score: Math.round(efficiency * 100) / 100,
        roi_per_dollar_deployed: Math.round((revenue / burn) * 1000) / 1000,
        growth_rate_pct: s.growthRate,
        strategy_type: s.type,
      });
    }
  }

  await sb.from("fcss_capital_efficiency").insert(rows);

  return {
    strategies_modeled: 4,
    months_projected: 24,
    data_points: rows.length,
    recommendation: "BALANCED strategy offers optimal control/growth tradeoff at current stage",
  };
}

// ── Module 3: Strategic Optionality Map ──
async function mapOptionality(sb: any, _params: any) {
  const options = [
    { name: "Acqui-hire Regional Competitor", type: "ACQUISITION", prob: 35, control: -15, valuation: 20, capital: 5_000_000, time: 18, independence: 70, strategic: 65, risk: 55 },
    { name: "Organic National Scaling", type: "ORGANIC_SCALE", prob: 75, control: 0, valuation: 40, capital: 2_000_000, time: 24, independence: 95, strategic: 80, risk: 30 },
    { name: "Bank Distribution Partnership", type: "STRATEGIC_PARTNERSHIP", prob: 60, control: -5, valuation: 25, capital: 500_000, time: 12, independence: 75, strategic: 70, risk: 25 },
    { name: "White-Label Platform License", type: "PLATFORM_LICENSING", prob: 45, control: 0, valuation: 30, capital: 1_500_000, time: 18, independence: 85, strategic: 75, risk: 35 },
    { name: "Full Ecosystem Ownership", type: "FULL_ECOSYSTEM", prob: 55, control: 5, valuation: 60, capital: 10_000_000, time: 36, independence: 100, strategic: 95, risk: 50 },
    { name: "Strategic Merger with PropTech", type: "MERGER", prob: 20, control: -40, valuation: 80, capital: 0, time: 12, independence: 20, strategic: 60, risk: 70 },
  ];

  const rows = options.map((o) => ({
    option_name: o.name,
    pathway_type: o.type,
    probability_pct: o.prob,
    founder_control_impact: o.control,
    valuation_impact_pct: o.valuation,
    time_to_realization_months: o.time,
    capital_required_usd: o.capital,
    independence_score: o.independence,
    strategic_value_score: o.strategic,
    risk_score: o.risk,
    prerequisite_milestones: ["product_market_fit", "revenue_traction", "team_build"],
    trade_offs: { control_vs_speed: o.control < 0 ? "Speed prioritized" : "Control preserved", capital_intensity: o.capital > 5_000_000 ? "High" : "Moderate" },
    status: o.prob > 60 ? "EVALUATING" : "MAPPED",
  }));

  await sb.from("fcss_strategic_optionality").insert(rows);

  return {
    options_mapped: rows.length,
    highest_value: options.reduce((best, o) => o.valuation > best.valuation ? o : best, options[0]).name,
    best_control: options.reduce((best, o) => o.control > best.control ? o : best, options[0]).name,
  };
}

// ── Module 4: Control Preservation Architecture ──
async function preserveControl(sb: any, _params: any) {
  const mechanisms = [
    { name: "Dual-Class Share Structure (10:1)", type: "DUAL_CLASS", effectiveness: 95, complexity: "HIGH", voting: 85, boardF: 2, boardT: 3, friction: 60, longevity: 15 },
    { name: "Founder Board Majority (Pre-Series B)", type: "BOARD_COMPOSITION", effectiveness: 80, complexity: "MEDIUM", voting: 60, boardF: 2, boardT: 3, friction: 25, longevity: 5 },
    { name: "Super-Voting Rights on Key Decisions", type: "VOTING_RIGHTS", effectiveness: 75, complexity: "MEDIUM", voting: 75, boardF: 1, boardT: 3, friction: 40, longevity: 10 },
    { name: "Protective Provisions Package", type: "PROTECTIVE_PROVISIONS", effectiveness: 70, complexity: "LOW", voting: 51, boardF: 1, boardT: 3, friction: 15, longevity: 8 },
    { name: "Accelerated Founder Vesting (Double Trigger)", type: "VESTING_STRUCTURE", effectiveness: 65, complexity: "LOW", voting: 50, boardF: 1, boardT: 3, friction: 10, longevity: 4 },
    { name: "Revenue-First Capital Sequencing", type: "CAPITAL_SEQUENCING", effectiveness: 85, complexity: "MEDIUM", voting: 100, boardF: 1, boardT: 1, friction: 5, longevity: 20 },
  ];

  const rows = mechanisms.map((m) => ({
    mechanism_name: m.name,
    mechanism_type: m.type,
    effectiveness_score: m.effectiveness,
    implementation_complexity: m.complexity,
    legal_jurisdiction: "Indonesia",
    applicable_stage: m.type === "DUAL_CLASS" ? "PRE_IPO" : "ALL",
    founder_voting_pct: m.voting,
    board_seats_founder: m.boardF,
    board_seats_total: m.boardT,
    protective_provisions: m.type === "PROTECTIVE_PROVISIONS" ? ["anti_dilution", "drag_along_veto", "budget_approval", "key_hire_approval"] : [],
    investor_friction_score: m.friction,
    longevity_years: m.longevity,
    is_active: m.effectiveness > 70,
  }));

  await sb.from("fcss_control_preservation").insert(rows);

  return {
    mechanisms_assessed: rows.length,
    active_mechanisms: rows.filter((r) => r.is_active).length,
    strongest: mechanisms[0].name,
    recommended_stack: ["CAPITAL_SEQUENCING", "PROTECTIVE_PROVISIONS", "BOARD_COMPOSITION"],
  };
}

// ── Module 5: Wealth Projection ──
async function projectWealth(sb: any, params: any) {
  // Pull latest dilution pathway for ownership estimates
  const { data: dilution } = await sb.from("fcss_dilution_pathway")
    .select("round_stage, founder_ownership_post, secondary_liquidity_usd")
    .order("created_at", { ascending: false })
    .limit(8);

  const exitScenarios = [
    { name: "Early Acquisition (Year 3)", exit: "ACQUISITION", year: 3, valuation: 80_000_000, ownershipPct: 62 },
    { name: "Series B Secondary", exit: "SECONDARY", year: 3, valuation: 120_000_000, ownershipPct: 55 },
    { name: "Growth-Stage IPO (Year 5)", exit: "IPO", year: 5, valuation: 500_000_000, ownershipPct: 38 },
    { name: "Late IPO (Year 7)", exit: "IPO", year: 7, valuation: 1_500_000_000, ownershipPct: 28 },
    { name: "Dividend Reinvestment Hold", exit: "DIVIDEND", year: 10, valuation: 800_000_000, ownershipPct: 45 },
    { name: "Long-Term Hold (Year 10)", exit: "HOLD", year: 10, valuation: 3_000_000_000, ownershipPct: 22 },
  ];

  // Override with real dilution data if available
  if (dilution?.length) {
    const lastRound = dilution[0];
    exitScenarios.forEach((s) => {
      if (s.exit === "IPO" && s.year === 5) {
        s.ownershipPct = lastRound.founder_ownership_post || s.ownershipPct;
      }
    });
  }

  const rows = exitScenarios.map((s) => {
    const grossEquity = s.valuation * s.ownershipPct / 100;
    const liqWaterfall = s.exit === "ACQUISITION" ? Math.min(grossEquity * 0.15, s.valuation * 0.1) : 0;
    const netEquity = grossEquity - liqWaterfall;
    const secondaryProceeds = s.exit === "SECONDARY" ? grossEquity * 0.3 : 0;
    const dividends = s.exit === "DIVIDEND" ? s.valuation * 0.04 * s.ownershipPct / 100 * s.year : 0;
    const totalWealth = netEquity + secondaryProceeds + dividends;
    const taxRate = 25;
    const postTax = totalWealth * (1 - taxRate / 100);
    const passiveIncome = postTax * 0.05; // 5% annual yield on liquid wealth
    const freedomScore = Math.min(100, postTax / 1_000_000 * 5); // $20M = 100

    return {
      scenario_name: s.name,
      exit_type: s.exit,
      exit_timing_year: s.year,
      company_valuation_usd: s.valuation,
      founder_ownership_pct: s.ownershipPct,
      gross_equity_value_usd: Math.round(grossEquity),
      liquidation_waterfall_usd: Math.round(liqWaterfall),
      net_equity_value_usd: Math.round(netEquity),
      secondary_proceeds_usd: Math.round(secondaryProceeds),
      dividends_cumulative_usd: Math.round(dividends),
      total_wealth_usd: Math.round(totalWealth),
      tax_liability_pct: taxRate,
      post_tax_wealth_usd: Math.round(postTax),
      annual_passive_income_usd: Math.round(passiveIncome),
      wealth_freedom_score: Math.round(freedomScore * 100) / 100,
    };
  });

  await sb.from("fcss_wealth_projection").insert(rows);

  // Emit engine cycle signal
  await sb.from("ai_event_signals").insert({
    event_type: "fcss_engine_cycle",
    entity_type: "fcss",
    priority_level: "normal",
    payload: {
      scenarios_computed: rows.length,
      max_wealth: Math.max(...rows.map((r) => r.post_tax_wealth_usd)),
      best_scenario: rows.reduce((best, r) => r.post_tax_wealth_usd > best.post_tax_wealth_usd ? r : best, rows[0]).scenario_name,
    },
  });

  return {
    scenarios_projected: rows.length,
    wealth_range: {
      min: Math.min(...rows.map((r) => r.post_tax_wealth_usd)),
      max: Math.max(...rows.map((r) => r.post_tax_wealth_usd)),
    },
    optimal_scenario: rows.reduce((best, r) => r.wealth_freedom_score > best.wealth_freedom_score ? r : best, rows[0]).scenario_name,
  };
}

// ── Dashboard ──
async function dashboard(sb: any) {
  const [dilution, efficiency, optionality, control, wealth] = await Promise.all([
    sb.from("fcss_dilution_pathway").select("*").order("round_order").limit(16),
    sb.from("fcss_capital_efficiency").select("*").order("created_at", { ascending: false }).limit(20),
    sb.from("fcss_strategic_optionality").select("*").order("strategic_value_score", { ascending: false }).limit(10),
    sb.from("fcss_control_preservation").select("*").order("effectiveness_score", { ascending: false }).limit(10),
    sb.from("fcss_wealth_projection").select("*").order("post_tax_wealth_usd", { ascending: false }).limit(10),
  ]);

  const latestOwnership = dilution.data?.length
    ? dilution.data[dilution.data.length - 1]?.founder_ownership_post || 0
    : 0;
  const maxWealth = wealth.data?.length
    ? Math.max(...wealth.data.map((w: any) => w.post_tax_wealth_usd || 0))
    : 0;
  const activeControls = control.data?.filter((c: any) => c.is_active).length || 0;

  return {
    summary: {
      final_ownership_pct: latestOwnership,
      max_projected_wealth_usd: maxWealth,
      active_control_mechanisms: activeControls,
      options_mapped: optionality.data?.length || 0,
    },
    dilution_pathway: dilution.data || [],
    capital_efficiency: efficiency.data || [],
    strategic_options: optionality.data || [],
    control_mechanisms: control.data || [],
    wealth_projections: wealth.data || [],
  };
}
