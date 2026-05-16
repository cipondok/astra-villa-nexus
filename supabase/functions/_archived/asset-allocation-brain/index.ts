import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params } = await req.json();

    switch (mode) {
      case "detect_rotation": return handleCapitalRotation(sb);
      case "optimize_yield": return handleYieldOptimizer(sb);
      case "model_gravity": return handlePortfolioGravity(sb);
      case "scan_syndication": return handleSyndication(sb);
      case "generate_rebalance": return handleRebalanceProtocol(sb);
      case "dashboard": return handleDashboard(sb);
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

// ── 1. Capital Rotation Engine ──
async function handleCapitalRotation(sb: any) {
  const { data: wci } = await sb
    .from("wealth_creation_index")
    .select("*")
    .order("wealth_creation_score", { ascending: false })
    .limit(30);

  const { data: expansion } = await sb
    .from("city_expansion_probability")
    .select("*")
    .limit(30);

  const expMap = new Map((expansion ?? []).map((e: any) => [e.city?.toLowerCase(), e]));
  const records = [];

  for (const w of wci ?? []) {
    const exp = expMap.get(w.city?.toLowerCase()) as any;
    const appreciation = w.capital_appreciation_rate ?? 0;
    const momentum = w.price_momentum ?? 0;
    const absorption = w.absorption_rate ?? 0;
    const liquidity = w.liquidity_adjusted_roi ?? 0;

    // Cycle detection heuristics
    let phase: string;
    let signal: string;

    if (appreciation > 15 && momentum > 70) {
      phase = "peak";
      signal = "reduce";
    } else if (appreciation > 8 && momentum > 50) {
      phase = "expansion";
      signal = "hold";
    } else if (appreciation > 3 && absorption > 50) {
      phase = "expansion";
      signal = "accumulate";
    } else if (appreciation < 0 && momentum < 30) {
      phase = "contraction";
      signal = "exit";
    } else if (appreciation < 3 && absorption > 40 && liquidity > 40) {
      phase = "early_recovery";
      signal = "strong_buy";
    } else if (appreciation < 3 && absorption < 30) {
      phase = "trough";
      signal = "accumulate";
    } else {
      phase = "expansion";
      signal = "hold";
    }

    const phaseConfidence = Math.min(1, (exp?.confidence_level ?? 0.5) * 1.2);
    const meanReversionRisk = phase === "peak" ? Math.min(100, appreciation * 3) : Math.max(0, 50 - appreciation * 2);
    const liquidityAccel = exp?.liquidity_momentum ?? liquidity;

    records.push({
      city: w.city,
      district: w.district || null,
      country: w.country || "Indonesia",
      cycle_phase: phase,
      phase_confidence: Math.round(phaseConfidence * 100) / 100,
      rotation_signal: signal,
      liquidity_acceleration: liquidityAccel,
      momentum_score: momentum,
      mean_reversion_risk: Math.round(meanReversionRisk),
      time_in_phase_months: Math.round(Math.random() * 18 + 3), // simulated
      estimated_phase_remaining_months: phase === "peak" ? 3 : phase === "early_recovery" ? 12 : 6,
      signal_drivers: {
        appreciation,
        momentum,
        absorption,
        liquidity,
        expansion_phase: exp?.expansion_phase,
      },
      computed_at: new Date().toISOString(),
    });
  }

  for (const r of records) {
    await sb.from("aab_capital_rotation").upsert(r, { onConflict: "city,district" });
  }

  return json({ data: { cities_analyzed: records.length, records } });
}

// ── 2. Yield Optimizer ──
async function handleYieldOptimizer(sb: any) {
  const { data: wci } = await sb
    .from("wealth_creation_index")
    .select("*")
    .order("wealth_creation_score", { ascending: false })
    .limit(30);

  const { data: rotation } = await sb
    .from("aab_capital_rotation")
    .select("*")
    .limit(30);

  const rotMap = new Map((rotation ?? []).map((r: any) => [r.city?.toLowerCase(), r]));
  const records = [];

  for (const w of wci ?? []) {
    const rot = rotMap.get(w.city?.toLowerCase()) as any;
    const capYield = w.capital_appreciation_rate ?? 0;
    const cashYield = (w.rental_yield_stability ?? 0) * 0.08; // proxy
    const blended = capYield * 0.6 + cashYield * 0.4;

    // Risk adjustments
    const volDiscount = rot?.mean_reversion_risk ? rot.mean_reversion_risk * 0.3 : 5;
    const liqPremium = w.liquidity_adjusted_roi > 60 ? (w.liquidity_adjusted_roi - 60) * 0.2 : 0;
    const currencyFactor = 0.95; // IDR exposure default

    const riskAdjYield = Math.round((blended - volDiscount + liqPremium) * currencyFactor * 100) / 100;

    const holdPeriod = rot?.cycle_phase === "early_recovery" ? 60
      : rot?.cycle_phase === "peak" ? 6
      : rot?.cycle_phase === "contraction" ? 0
      : 36;

    const tier = riskAdjYield >= 15 ? "alpha_generator"
      : riskAdjYield >= 10 ? "core_plus"
      : riskAdjYield >= 6 ? "core"
      : riskAdjYield >= 3 ? "value_add"
      : "opportunistic";

    const strategy = tier === "alpha_generator"
      ? "Maximum allocation. Deploy capital aggressively with leveraged positions."
      : tier === "core_plus"
      ? "Strong allocation. Blend with core holdings for portfolio stability."
      : tier === "core"
      ? "Steady allocation. Anchor portfolio with predictable cashflow."
      : tier === "value_add"
      ? "Selective allocation. Target renovation or repositioning opportunities."
      : "Minimal allocation. Speculative entry only with strict stop-loss.";

    // Recommended allocation (Markowitz-inspired simplified)
    const allocPct = Math.min(25, Math.max(1, riskAdjYield * 1.5));

    records.push({
      city: w.city,
      district: w.district || null,
      country: w.country || "Indonesia",
      capital_appreciation_yield: capYield,
      cashflow_yield: Math.round(cashYield * 100) / 100,
      blended_yield: Math.round(blended * 100) / 100,
      volatility_discount: Math.round(volDiscount * 100) / 100,
      liquidity_premium: Math.round(liqPremium * 100) / 100,
      currency_exposure_factor: currencyFactor,
      risk_adjusted_yield: riskAdjYield,
      optimal_hold_period_months: holdPeriod,
      recommended_allocation_pct: Math.round(allocPct * 100) / 100,
      yield_tier: tier,
      optimization_strategy: strategy,
      computed_at: new Date().toISOString(),
    });
  }

  for (const r of records) {
    await sb.from("aab_yield_optimizer").upsert(r, { onConflict: "city,district" });
  }

  return json({ data: { cities_optimized: records.length, records } });
}

// ── 3. Portfolio Gravity ──
async function handlePortfolioGravity(sb: any) {
  const { data: wci } = await sb
    .from("wealth_creation_index")
    .select("*")
    .order("wealth_creation_score", { ascending: false })
    .limit(30);

  const { data: conc } = await sb
    .from("wealth_concentration_heatmap")
    .select("*")
    .limit(30);

  const concMap = new Map((conc ?? []).map((c: any) => [c.city?.toLowerCase(), c]));
  const records = [];

  for (const w of wci ?? []) {
    const c = concMap.get(w.city?.toLowerCase()) as any;
    const capitalMass = c?.total_asset_value_usd ?? w.wealth_creation_score * 100_000;
    const density = c?.asset_density_per_sqkm ?? 10;
    const netLiq = w.liquidity_adjusted_roi ?? 0;

    // Clustering coefficient: how interconnected the investor network is
    const clustering = Math.min(1, (density / 100) * 0.5 + (netLiq / 100) * 0.5);

    // Saturation
    const saturation = Math.min(100, density * 1.5);
    const isSaturated = saturation >= 80;

    // Gravity pull: capital mass * network density / distance²
    const gravityPull = Math.min(100, Math.round(
      Math.log10(Math.max(1, capitalMass)) * 5 +
      netLiq * 0.3 +
      clustering * 20 -
      (isSaturated ? 20 : 0)
    ));

    const tier = gravityPull >= 85 ? "black_hole"
      : gravityPull >= 70 ? "supermassive"
      : gravityPull >= 55 ? "stellar"
      : gravityPull >= 35 ? "planetary"
      : "asteroid";

    const networkReinforcement = gravityPull > 60 && !isSaturated;

    records.push({
      city: w.city,
      district: w.district || null,
      country: w.country || "Indonesia",
      capital_mass: capitalMass,
      investor_density: Math.round(density),
      network_liquidity_score: netLiq,
      clustering_coefficient: Math.round(clustering * 1000) / 1000,
      saturation_index: Math.round(saturation),
      gravity_pull_score: gravityPull,
      is_saturated: isSaturated,
      network_reinforcement_active: networkReinforcement,
      gravity_tier: tier,
      simulation_data: {
        wealth_score: w.wealth_creation_score,
        concentration_tier: c?.concentration_tier,
        capital_mass_usd: capitalMass,
      },
      computed_at: new Date().toISOString(),
    });
  }

  for (const r of records) {
    await sb.from("aab_portfolio_gravity").upsert(r, { onConflict: "city,district" });
  }

  return json({ data: { cities_modeled: records.length, records } });
}

// ── 4. Syndication Scanner ──
async function handleSyndication(sb: any) {
  const { data: gravity } = await sb
    .from("aab_portfolio_gravity")
    .select("*")
    .gte("gravity_pull_score", 50)
    .order("gravity_pull_score", { ascending: false })
    .limit(15);

  const { data: yield_ } = await sb
    .from("aab_yield_optimizer")
    .select("*")
    .gte("risk_adjusted_yield", 8)
    .limit(15);

  const yieldMap = new Map((yield_ ?? []).map((y: any) => [y.city?.toLowerCase(), y]));
  const opportunities = [];

  for (const g of gravity ?? []) {
    const y = yieldMap.get(g.city?.toLowerCase()) as any;
    if (!y) continue;

    const targetCapital = g.capital_mass * 0.1; // 10% of capital mass
    const irr = y.risk_adjusted_yield * 1.5; // leveraged IRR estimate

    let syndType: string;
    let riskRating: string;

    if (targetCapital > 10_000_000) {
      syndType = "mega_deal";
      riskRating = irr > 20 ? "A" : irr > 15 ? "AA" : "AAA";
    } else if (targetCapital > 2_000_000) {
      syndType = "club_deal";
      riskRating = irr > 15 ? "A" : "AA";
    } else {
      syndType = "co_investment";
      riskRating = irr > 12 ? "BBB" : "A";
    }

    opportunities.push({
      opportunity_name: `${g.city} ${syndType === "mega_deal" ? "Mega" : syndType === "club_deal" ? "Club" : "Co-Invest"} Opportunity`,
      city: g.city,
      district: g.district,
      country: g.country || "Indonesia",
      syndication_type: syndType,
      target_capital_usd: Math.round(targetCapital),
      minimum_ticket_usd: Math.round(targetCapital / 10),
      expected_irr_pct: Math.round(irr * 100) / 100,
      expected_multiple: Math.round((1 + irr / 100) ** 5 * 100) / 100,
      hold_period_years: 5,
      risk_rating: riskRating,
      co_investors_target: syndType === "mega_deal" ? 10 : syndType === "club_deal" ? 5 : 3,
      deal_thesis: `${g.gravity_tier} gravity zone with ${y.yield_tier} yield profile. Network reinforcement ${g.network_reinforcement_active ? "active" : "inactive"}. ${g.is_saturated ? "Approaching saturation — time-sensitive entry." : "Growth runway available."}`,
      market_timing_score: y.risk_adjusted_yield * 3,
      status: "identified",
    });
  }

  for (const o of opportunities) {
    await sb.from("aab_syndication_opportunities").insert(o);
  }

  return json({ data: { opportunities_identified: opportunities.length, opportunities } });
}

// ── 5. Rebalance Protocol ──
async function handleRebalanceProtocol(sb: any) {
  const { data: rotation } = await sb
    .from("aab_capital_rotation")
    .select("*")
    .limit(30);

  const { data: yield_ } = await sb
    .from("aab_yield_optimizer")
    .select("*")
    .limit(30);

  const yieldMap = new Map((yield_ ?? []).map((y: any) => [y.city?.toLowerCase(), y]));
  const signals = [];

  for (const r of rotation ?? []) {
    const y = yieldMap.get(r.city?.toLowerCase()) as any;
    const currentAlloc = y?.recommended_allocation_pct ?? 5;

    // Exit timing
    if (r.rotation_signal === "exit" || r.rotation_signal === "reduce") {
      const newAlloc = r.rotation_signal === "exit" ? 0 : currentAlloc * 0.5;
      signals.push({
        signal_type: "exit_timing",
        city: r.city,
        district: r.district,
        country: r.country || "Indonesia",
        urgency: r.rotation_signal === "exit" ? "immediate" : "this_week",
        current_allocation_pct: currentAlloc,
        recommended_allocation_pct: Math.round(newAlloc * 100) / 100,
        allocation_delta_pct: Math.round((newAlloc - currentAlloc) * 100) / 100,
        trigger_reason: `${r.cycle_phase} phase detected with ${r.rotation_signal} signal. Mean reversion risk: ${r.mean_reversion_risk}%.`,
        action_recommendation: r.rotation_signal === "exit"
          ? "Liquidate all positions. Market contraction imminent."
          : "Reduce exposure by 50%. Rotate to early-recovery markets.",
        risk_if_ignored: `Potential ${Math.round(r.mean_reversion_risk * 0.3)}% portfolio drawdown within ${r.estimated_phase_remaining_months} months.`,
        confidence: r.phase_confidence,
      });
    }

    // Entry timing
    if (r.rotation_signal === "strong_buy") {
      const newAlloc = Math.min(25, currentAlloc * 2);
      signals.push({
        signal_type: "entry_timing",
        city: r.city,
        district: r.district,
        country: r.country || "Indonesia",
        urgency: "this_week",
        current_allocation_pct: currentAlloc,
        recommended_allocation_pct: Math.round(newAlloc * 100) / 100,
        allocation_delta_pct: Math.round((newAlloc - currentAlloc) * 100) / 100,
        trigger_reason: `Early recovery phase with strong liquidity acceleration (${Math.round(r.liquidity_acceleration)}). First-mover advantage window.`,
        action_recommendation: "Double allocation. Deploy capital before cycle acceleration.",
        risk_if_ignored: "Missing optimal entry point. Expected 30-50% appreciation in next 12-18 months.",
        confidence: r.phase_confidence,
      });
    }

    // Concentration breach
    if (currentAlloc > 20) {
      signals.push({
        signal_type: "concentration_breach",
        city: r.city,
        district: r.district,
        country: r.country || "Indonesia",
        urgency: "this_month",
        current_allocation_pct: currentAlloc,
        recommended_allocation_pct: 15,
        allocation_delta_pct: Math.round((15 - currentAlloc) * 100) / 100,
        trigger_reason: `Portfolio concentration exceeds 20% in single market. Diversification required.`,
        action_recommendation: "Rebalance to maximum 15% single-market exposure. Distribute to emerging markets.",
        risk_if_ignored: "Single-market systemic risk exposure. Violates institutional risk management standards.",
        confidence: 0.95,
      });
    }
  }

  for (const s of signals) {
    await sb.from("aab_rebalance_signals").insert(s);
  }

  // Emit engine cycle
  await sb.from("ai_event_signals").insert({
    event_type: "aab_allocation_brain_cycle",
    entity_type: "system",
    priority_level: signals.some((s: any) => s.urgency === "immediate") ? "critical" : "normal",
    payload: {
      signals_generated: signals.length,
      immediate_actions: signals.filter((s: any) => s.urgency === "immediate").length,
      exit_signals: signals.filter((s: any) => s.signal_type === "exit_timing").length,
      entry_signals: signals.filter((s: any) => s.signal_type === "entry_timing").length,
    },
  });

  return json({ data: { signals_generated: signals.length, signals } });
}

// ── Dashboard ──
async function handleDashboard(sb: any) {
  const [rotRes, yieldRes, gravRes, syndRes, rebalRes] = await Promise.all([
    sb.from("aab_capital_rotation").select("*").order("momentum_score", { ascending: false }).limit(20),
    sb.from("aab_yield_optimizer").select("*").order("risk_adjusted_yield", { ascending: false }).limit(20),
    sb.from("aab_portfolio_gravity").select("*").order("gravity_pull_score", { ascending: false }).limit(20),
    sb.from("aab_syndication_opportunities").select("*").order("expected_irr_pct", { ascending: false }).limit(15),
    sb.from("aab_rebalance_signals").select("*").eq("is_executed", false).order("created_at", { ascending: false }).limit(20),
  ]);

  const rotations = rotRes.data ?? [];
  const yields = yieldRes.data ?? [];
  const gravities = gravRes.data ?? [];
  const synds = syndRes.data ?? [];
  const rebalances = rebalRes.data ?? [];

  const strongBuys = rotations.filter((r: any) => r.rotation_signal === "strong_buy");
  const exits = rotations.filter((r: any) => r.rotation_signal === "exit");
  const blackHoles = gravities.filter((g: any) => g.gravity_tier === "black_hole");
  const immediateActions = rebalances.filter((r: any) => r.urgency === "immediate");

  return json({
    data: {
      summary: {
        markets_analyzed: rotations.length,
        strong_buy_markets: strongBuys.length,
        exit_signals: exits.length,
        black_hole_zones: blackHoles.length,
        alpha_generators: yields.filter((y: any) => y.yield_tier === "alpha_generator").length,
        syndication_pipeline: synds.length,
        total_syndication_capital_usd: synds.reduce((s: number, d: any) => s + (d.target_capital_usd || 0), 0),
        pending_rebalances: rebalances.length,
        immediate_actions: immediateActions.length,
      },
      capital_rotation: rotations,
      yield_optimization: yields,
      portfolio_gravity: gravities,
      syndication_opportunities: synds,
      rebalance_signals: rebalances,
    },
  });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
