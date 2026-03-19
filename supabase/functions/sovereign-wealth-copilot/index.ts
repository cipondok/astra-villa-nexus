import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params } = await req.json();
    let result: Record<string, unknown>;

    switch (mode) {
      case "interpret_macro_cycle": result = await interpretMacroCycle(sb, params); break;
      case "generate_strategy": result = await generateStrategy(sb, params); break;
      case "scan_mega_deals": result = await scanMegaDeals(sb, params); break;
      case "assess_political_risk": result = await assessPoliticalRisk(sb, params); break;
      case "generate_deployment": result = await generateDeployment(sb, params); break;
      case "dashboard": result = await buildDashboard(sb); break;
      default: throw new Error(`Unknown mode: ${mode}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── 1️⃣ MACRO CYCLE INTERPRETATION ──────────────────────────
async function interpretMacroCycle(sb: any, p: any) {
  const { region, country, indicator, value, rate_differential, currency_strength } = p;

  const val = value || 0;
  const rateDiff = rate_differential || 0;
  const currStr = currency_strength || 50;

  // Phase detection based on indicator type
  let phase = "transition";
  let trend = "stable";
  let implications: Record<string, string> = {};

  if (indicator === "interest_rate") {
    if (val > 6) { phase = "contraction"; trend = "rising"; }
    else if (val > 4) { phase = "peak"; trend = val > 5 ? "rising" : "stable"; }
    else if (val > 2) { phase = "expansion"; trend = "stable"; }
    else { phase = "trough"; trend = "declining"; }
    implications = {
      property_impact: phase === "trough" ? "Strong buying opportunity" : phase === "peak" ? "Cap rate compression ending" : "Monitor refinancing windows",
      capital_flow: rateDiff > 200 ? "Capital outflow risk from rate differential" : "Stable flow environment",
    };
  } else if (indicator === "currency_regime") {
    if (currStr > 70) { phase = "expansion"; trend = "rising"; }
    else if (currStr > 50) { phase = "peak"; trend = "stable"; }
    else if (currStr > 30) { phase = "contraction"; trend = "declining"; }
    else { phase = "trough"; trend = "declining"; }
    implications = {
      fx_strategy: currStr < 40 ? "Hedge 80%+ of exposure" : currStr > 70 ? "Reduce hedge ratio, benefit from appreciation" : "Standard 50% hedge",
      entry_timing: currStr < 35 ? "FX discount opportunity for foreign capital" : "Fair value entry",
    };
  } else if (indicator === "growth_divergence") {
    const div = val;
    if (div > 3) { phase = "expansion"; trend = "accelerating"; }
    else if (div > 1) { phase = "expansion"; trend = "rising"; }
    else if (div > -1) { phase = "transition"; trend = "stable"; }
    else { phase = "contraction"; trend = "declining"; }
    implications = {
      allocation_shift: div > 2 ? "Overweight this region" : div < -2 ? "Underweight, rotate capital" : "Maintain neutral",
    };
  } else if (indicator === "capital_rotation") {
    phase = val > 0 ? "expansion" : "contraction";
    trend = val > 5 ? "accelerating" : val > 0 ? "rising" : val > -5 ? "declining" : "reversing";
    implications = {
      flow_direction: val > 0 ? "Inbound capital wave — ride momentum" : "Capital exodus — defensive positioning",
    };
  }

  const confidence = Math.min(95, 40 + Math.abs(val) * 3 + (rateDiff ? 10 : 0) + (currStr !== 50 ? 10 : 0));
  const timeInPhase = Math.round(Math.random() * 18 + 3);
  const phaseRemaining = Math.round(Math.random() * 12 + 3);

  const { data, error } = await sb.from("aswc_macro_cycles").insert({
    region, country,
    cycle_indicator: indicator || "interest_rate",
    current_phase: phase,
    phase_confidence: Math.round(confidence),
    indicator_value: val,
    indicator_trend: trend,
    rate_differential_bps: rateDiff,
    currency_strength_index: currStr,
    growth_divergence_pct: indicator === "growth_divergence" ? val : null,
    capital_rotation_direction: trend,
    time_in_phase_months: timeInPhase,
    estimated_phase_remaining_months: phaseRemaining,
    signal_drivers: { indicator, value: val, rate_diff: rateDiff },
    implications_re: implications,
  }).select().single();

  if (error) throw error;
  return { cycle: data, phase, implications };
}

// ─── 2️⃣ SOVEREIGN PORTFOLIO STRATEGY ────────────────────────
async function generateStrategy(sb: any, p: any) {
  const { strategy_name, fund_size_usd, target_return, risk_tolerance, countries } = p;

  const fundSize = fund_size_usd || 1_000_000_000;
  const targetRet = target_return || 8;
  const riskTol = risk_tolerance || "moderate";

  // Fetch macro cycles and political risk for allocation
  const [cycles, risks] = await Promise.all([
    sb.from("aswc_macro_cycles").select("*").order("computed_at", { ascending: false }).limit(20),
    sb.from("aswc_political_risk").select("*").order("computed_at", { ascending: false }).limit(20),
  ]);

  // Risk-based allocation parameters
  const riskParams: Record<string, any> = {
    ultra_conservative: { maxCountry: 15, maxCity: 8, hedge: 0.8, reserve: 20, maxDD: 8 },
    conservative: { maxCountry: 20, maxCity: 12, hedge: 0.65, reserve: 15, maxDD: 12 },
    moderate: { maxCountry: 25, maxCity: 15, hedge: 0.5, reserve: 10, maxDD: 15 },
    growth: { maxCountry: 30, maxCity: 20, hedge: 0.35, reserve: 7, maxDD: 20 },
    aggressive: { maxCountry: 40, maxCity: 25, hedge: 0.2, reserve: 5, maxDD: 25 },
  };
  const rp = riskParams[riskTol] || riskParams.moderate;

  // Generate country allocations from input or defaults
  const countryList = countries || ["Indonesia", "Singapore", "Thailand", "Vietnam", "Japan"];
  const countryWeights: Record<string, number> = {};
  const baseWeight = Math.floor(100 / countryList.length);
  countryList.forEach((c: string, i: number) => {
    countryWeights[c] = i === 0 ? baseWeight + (100 - baseWeight * countryList.length) : baseWeight;
  });

  // Asset class weights by risk tolerance
  const assetWeights: Record<string, number> = {
    core_residential: riskTol === "aggressive" ? 15 : 30,
    core_commercial: riskTol === "ultra_conservative" ? 35 : 20,
    value_add: riskTol === "aggressive" ? 30 : 15,
    opportunistic: riskTol === "ultra_conservative" ? 5 : riskTol === "aggressive" ? 25 : 15,
    development: riskTol === "ultra_conservative" ? 0 : riskTol === "aggressive" ? 15 : 10,
    debt: riskTol === "ultra_conservative" ? 25 : 10,
  };

  // Hedging overlays
  const hedges = [];
  if (rp.hedge > 0.5) hedges.push({ type: "currency_forward", coverage_pct: rp.hedge * 100, rationale: "High FX exposure mitigation" });
  hedges.push({ type: "interest_rate_swap", coverage_pct: 50, rationale: "Fixed-rate lock on leveraged positions" });
  if (riskTol !== "aggressive") hedges.push({ type: "put_options", coverage_pct: 10, rationale: "Tail risk protection" });

  const sharpeTarget = riskTol === "aggressive" ? 0.8 : riskTol === "conservative" ? 1.2 : 1.0;

  const { data, error } = await sb.from("aswc_portfolio_strategies").insert({
    strategy_name: strategy_name || `Sovereign RE Strategy - ${riskTol}`,
    fund_size_usd: fundSize,
    target_return_pct: targetRet,
    risk_tolerance: riskTol,
    country_allocations: countryWeights,
    asset_class_weights: assetWeights,
    hedging_overlays: hedges,
    max_single_country_pct: rp.maxCountry,
    max_single_city_pct: rp.maxCity,
    currency_hedge_ratio: rp.hedge,
    liquidity_reserve_pct: rp.reserve,
    max_drawdown_limit_pct: rp.maxDD,
    sharpe_ratio_target: sharpeTarget,
    is_active: true,
  }).select().single();

  if (error) throw error;
  return { strategy: data, country_allocations: countryWeights, asset_weights: assetWeights };
}

// ─── 3️⃣ MEGA-DEAL SCANNER ──────────────────────────────────
async function scanMegaDeals(sb: any, p: any) {
  const { country, min_value_usd, deal_types } = p;

  // Simulate scanning — in production, this would pull from external feeds
  const dealTemplates = [
    { type: "distressed_portfolio", name: "Distressed Hotel Portfolio", discount: 25, irr: 18, multiple: 2.1, motivation: "Debt restructuring", urgency: "high" },
    { type: "privatization", name: "Government Land Parcel Release", discount: 15, irr: 22, multiple: 2.8, motivation: "Fiscal deficit reduction", urgency: "standard" },
    { type: "infrastructure_land", name: "New Transit Corridor Land Bank", discount: 0, irr: 28, multiple: 3.5, motivation: "Infrastructure-driven appreciation", urgency: "immediate" },
    { type: "development_platform", name: "Mixed-Use Development Platform", discount: 10, irr: 20, multiple: 2.5, motivation: "Developer exit", urgency: "standard" },
    { type: "fund_secondary", name: "Closed-End Fund Secondary", discount: 20, irr: 15, multiple: 1.8, motivation: "LP liquidity need", urgency: "high" },
  ];

  const targetCountry = country || "ID";
  const minVal = min_value_usd || 50_000_000;

  const deals = dealTemplates
    .filter((d) => !deal_types || deal_types.includes(d.type))
    .map((d) => ({
      deal_name: `${d.name} — ${targetCountry}`,
      deal_type: d.type,
      country: targetCountry,
      estimated_value_usd: minVal * (1 + Math.random() * 4),
      discount_to_nav_pct: d.discount,
      estimated_irr_pct: d.irr,
      estimated_multiple: d.multiple,
      seller_motivation: d.motivation,
      urgency: d.urgency,
      competition_level: d.urgency === "immediate" ? "low" : "moderate",
      key_strengths: [`${d.irr}% target IRR`, `${d.discount}% discount to NAV`],
      key_risks: ["Execution complexity", "Market timing risk"],
      co_investment_available: d.type === "development_platform" || d.type === "fund_secondary",
      is_active: true,
    }));

  // Batch insert
  const { data, error } = await sb.from("aswc_mega_deals").insert(deals).select();
  if (error) throw error;

  return { deals_found: data?.length || 0, mega_deals: data };
}

// ─── 4️⃣ POLITICAL RISK ASSESSMENT ──────────────────────────
async function assessPoliticalRisk(sb: any, p: any) {
  const { country, city, policy_stability, ownership_restriction, tax_risk, geopolitical,
    rule_of_law, expropriation, capital_controls, sanctions, next_election } = p;

  const polStab = policy_stability || 50;
  const ownRestrict = ownership_restriction || 50;
  const taxRisk = tax_risk || 50;
  const geoPol = geopolitical || 50;
  const ruleOfLaw = rule_of_law || 50;
  const exprop = expropriation || 10;
  const capCtrl = capital_controls || 30;
  const sanction = sanctions || 10;

  // Composite: weighted (higher = riskier)
  // 20% PolicyStab(inverted) + 15% OwnRestrict + 15% TaxRisk + 15% Geopolitical + 15% RuleOfLaw(inverted) + 10% Expropriation + 5% CapControls + 5% Sanctions
  const composite = Math.round(
    (100 - polStab) * 0.20 + ownRestrict * 0.15 + taxRisk * 0.15 + geoPol * 0.15 +
    (100 - ruleOfLaw) * 0.15 + exprop * 0.10 + capCtrl * 0.05 + sanction * 0.05
  );

  // Risk trend
  let trend = "stable";
  if (composite > 70) trend = "deteriorating";
  else if (composite > 55) trend = "volatile";
  else if (composite < 30) trend = "improving";

  // Election impact
  let electionImpact = "neutral";
  if (next_election) {
    const monthsToElection = Math.round((new Date(next_election).getTime() - Date.now()) / (30 * 86400000));
    if (monthsToElection < 6) electionImpact = "uncertain";
    else if (monthsToElection < 12) electionImpact = "negative"; // pre-election uncertainty
  }

  // Implications
  const implications = composite > 60
    ? "High political risk — reduce exposure, increase hedging, avoid illiquid positions"
    : composite > 40
    ? "Moderate risk — standard due diligence, maintain hedges, diversify within country"
    : "Low political risk — favorable for long-term capital deployment";

  // Hedging recommendations
  const hedges = [];
  if (composite > 50) hedges.push({ type: "political_risk_insurance", priority: "high" });
  if (capCtrl > 40) hedges.push({ type: "offshore_structure", priority: "medium" });
  if (taxRisk > 50) hedges.push({ type: "tax_treaty_optimization", priority: "medium" });
  if (geoPol > 60) hedges.push({ type: "geographic_diversification", priority: "high" });

  const { data, error } = await sb.from("aswc_political_risk").insert({
    country, city,
    composite_risk_score: composite,
    policy_stability: polStab,
    ownership_restriction_score: ownRestrict,
    tax_regime_risk: taxRisk,
    geopolitical_exposure: geoPol,
    rule_of_law_index: ruleOfLaw,
    expropriation_risk: exprop,
    capital_controls_risk: capCtrl,
    sanctions_exposure: sanction,
    election_cycle_impact: electionImpact,
    next_election_date: next_election || null,
    risk_trend: trend,
    investment_implications: implications,
    hedging_recommendations: hedges,
  }).select().single();

  if (error) throw error;
  return { political_risk: data, composite_score: composite, trend, implications };
}

// ─── 5️⃣ DEPLOYMENT SIGNAL GENERATOR ─────────────────────────
async function generateDeployment(sb: any, p: any) {
  const { strategy_id, target_country, target_city } = p;

  // Gather intelligence from all modules
  const [strategy, cycles, risks, deals] = await Promise.all([
    strategy_id
      ? sb.from("aswc_portfolio_strategies").select("*").eq("id", strategy_id).single()
      : sb.from("aswc_portfolio_strategies").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1).single(),
    sb.from("aswc_macro_cycles").select("*").eq("region", target_country || "APAC").order("computed_at", { ascending: false }).limit(5),
    sb.from("aswc_political_risk").select("*").eq("country", target_country || "ID").order("computed_at", { ascending: false }).limit(1),
    sb.from("aswc_mega_deals").select("*").eq("country", target_country || "ID").eq("is_active", true).limit(5),
  ]);

  const strat = strategy.data;
  const latestCycle = cycles.data?.[0];
  const polRisk = risks.data?.[0];
  const activeDeals = deals.data || [];

  // Decision logic
  let signalType = "hold";
  let urgency = "standard";
  let confidence = 50;
  const triggers: string[] = [];

  // Macro cycle signals
  if (latestCycle?.current_phase === "trough") {
    signalType = "deploy";
    urgency = "high";
    confidence += 15;
    triggers.push("Macro cycle at trough — counter-cyclical entry");
  } else if (latestCycle?.current_phase === "expansion" && latestCycle?.indicator_trend === "accelerating") {
    signalType = "increase";
    confidence += 10;
    triggers.push("Accelerating expansion phase — momentum allocation");
  } else if (latestCycle?.current_phase === "peak") {
    signalType = "decrease";
    triggers.push("Cycle peak — reduce exposure, lock gains");
  } else if (latestCycle?.current_phase === "contraction") {
    signalType = "hedge";
    urgency = "high";
    triggers.push("Contraction phase — activate hedging overlays");
  }

  // Political risk overlay
  if (polRisk?.composite_risk_score > 70) {
    if (signalType === "deploy") signalType = "hold";
    urgency = "high";
    confidence -= 20;
    triggers.push("High political risk — deployment paused");
  } else if (polRisk?.composite_risk_score < 30) {
    confidence += 10;
    triggers.push("Low political risk — favorable environment");
  }

  // Mega-deal overlay
  if (activeDeals.some((d: any) => d.urgency === "immediate" && d.estimated_irr_pct > 15)) {
    if (signalType === "hold") signalType = "deploy";
    urgency = "immediate";
    confidence += 10;
    triggers.push("Immediate mega-deal opportunity detected");
  }

  // Emergency exit conditions
  if (polRisk?.composite_risk_score > 85 && latestCycle?.current_phase === "contraction") {
    signalType = "emergency_exit";
    urgency = "immediate";
    confidence = Math.min(95, confidence + 20);
    triggers.push("CRITICAL: Political + macro convergence — emergency exit protocol");
  }

  confidence = Math.min(95, Math.max(10, confidence));

  // Capital amount based on strategy
  const allocationPct = signalType === "deploy" ? 5 : signalType === "increase" ? 3 : signalType === "decrease" ? -3 : signalType === "emergency_exit" ? -100 : 0;
  const capitalAmount = strat ? Math.abs(allocationPct / 100 * strat.fund_size_usd) : 0;

  // Wealth preservation score
  const wealthPres = Math.max(0, Math.min(100,
    100 - (polRisk?.composite_risk_score || 50) * 0.4 -
    (latestCycle?.current_phase === "contraction" ? 20 : 0) +
    (strat?.liquidity_reserve_pct || 10)
  ));

  const { data, error } = await sb.from("aswc_deployment_signals").insert({
    strategy_id: strat?.id || null,
    signal_type: signalType,
    target_country: target_country || "ID",
    target_city: target_city || null,
    allocation_change_pct: allocationPct,
    capital_amount_usd: capitalAmount,
    urgency,
    confidence,
    trigger_reasons: triggers,
    macro_context: {
      cycle_phase: latestCycle?.current_phase,
      cycle_trend: latestCycle?.indicator_trend,
    },
    risk_assessment: {
      political_risk: polRisk?.composite_risk_score,
      risk_trend: polRisk?.risk_trend,
      active_mega_deals: activeDeals.length,
    },
    execution_window_days: urgency === "immediate" ? 7 : urgency === "high" ? 14 : 30,
    wealth_preservation_score: Math.round(wealthPres),
  }).select().single();

  if (error) throw error;
  return { deployment: data, signal: signalType, urgency, confidence, triggers };
}

// ─── DASHBOARD ────────────────────────────────────────────────
async function buildDashboard(sb: any) {
  const [cycles, strategies, deals, risks, signals] = await Promise.all([
    sb.from("aswc_macro_cycles").select("*").order("computed_at", { ascending: false }).limit(30),
    sb.from("aswc_portfolio_strategies").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(10),
    sb.from("aswc_mega_deals").select("*").eq("is_active", true).order("estimated_value_usd", { ascending: false }).limit(20),
    sb.from("aswc_political_risk").select("*").order("computed_at", { ascending: false }).limit(20),
    sb.from("aswc_deployment_signals").select("*").eq("is_executed", false).order("created_at", { ascending: false }).limit(20),
  ]);

  const totalAUM = (strategies.data || []).reduce((s: number, st: any) => s + (st.fund_size_usd || 0), 0);
  const totalDealValue = (deals.data || []).reduce((s: number, d: any) => s + (d.estimated_value_usd || 0), 0);
  const avgPoliticalRisk = (risks.data || []).reduce((s: number, r: any) => s + (r.composite_risk_score || 0), 0) / (risks.data?.length || 1);
  const pendingSignals = (signals.data || []).filter((s: any) => s.urgency === "immediate" || s.urgency === "high");

  return {
    summary: {
      total_aum_usd: totalAUM,
      active_strategies: (strategies.data || []).length,
      active_mega_deals: (deals.data || []).length,
      total_deal_pipeline_usd: totalDealValue,
      countries_monitored: new Set((risks.data || []).map((r: any) => r.country)).size,
      avg_political_risk: Math.round(avgPoliticalRisk),
      pending_urgent_signals: pendingSignals.length,
    },
    macro_cycles: cycles.data || [],
    portfolio_strategies: strategies.data || [],
    mega_deals: deals.data || [],
    political_risk: risks.data || [],
    deployment_signals: signals.data || [],
  };
}
