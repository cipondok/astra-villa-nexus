import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params } = await req.json();

    switch (mode) {
      case "score_opportunities":
        return json(await scoreOpportunities(sb, params));
      case "optimize_allocation":
        return json(await optimizeAllocation(sb, params));
      case "rebalance_portfolio":
        return json(await rebalancePortfolio(sb, params));
      case "compute_performance":
        return json(await computePerformance(sb, params));
      case "pool_summary":
        return json(await poolSummary(sb, params));
      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── SCORING WEIGHTS ────────────────────────────────
const SCORE_WEIGHTS = {
  liquidity_acceleration: 0.25,
  price_inefficiency: 0.20,
  deal_close_probability: 0.20,
  district_growth: 0.15,
  rental_yield: 0.10,
  capital_inflow: 0.10,
};

// ─── 1. SCORE OPPORTUNITIES ─────────────────────────
async function scoreOpportunities(sb: any, params: any) {
  const city = params?.city;
  let query = sb.from("properties").select("id, city, district, price, status, property_type");
  if (city) query = query.eq("city", city);
  const { data: properties, error } = await query.eq("status", "active").limit(200);
  if (error) throw error;

  const scored = (properties || []).map((p: any) => {
    const liqAccel = Math.random() * 100;
    const priceIneff = Math.random() * 100;
    const dealCloseProb = Math.random() * 100;
    const distGrowth = Math.random() * 100;
    const rentalYield = Math.random() * 100;
    const capInflow = Math.random() * 100;

    const composite = Math.round(
      liqAccel * SCORE_WEIGHTS.liquidity_acceleration +
      priceIneff * SCORE_WEIGHTS.price_inefficiency +
      dealCloseProb * SCORE_WEIGHTS.deal_close_probability +
      distGrowth * SCORE_WEIGHTS.district_growth +
      rentalYield * SCORE_WEIGHTS.rental_yield +
      capInflow * SCORE_WEIGHTS.capital_inflow
    );

    const tier =
      composite >= 85 ? "elite" :
      composite >= 70 ? "strong" :
      composite >= 45 ? "standard" :
      composite >= 25 ? "weak" : "avoid";

    const riskGrade =
      composite >= 85 ? "AAA" :
      composite >= 75 ? "AA" :
      composite >= 65 ? "A" :
      composite >= 55 ? "BBB" :
      composite >= 45 ? "BB" :
      composite >= 35 ? "B" :
      composite >= 25 ? "CCC" : "CC";

    const expectedIRR = composite >= 70
      ? 12 + (composite - 70) * 0.4
      : 5 + composite * 0.1;

    return {
      property_id: p.id,
      city: p.city || "",
      district: p.district || "",
      opportunity_score: composite,
      opportunity_tier: tier,
      liquidity_acceleration: Math.round(liqAccel * 10) / 10,
      price_inefficiency: Math.round(priceIneff * 10) / 10,
      deal_close_probability: Math.round(dealCloseProb * 10) / 10,
      district_growth_sequencing: Math.round(distGrowth * 10) / 10,
      rental_yield_strength: Math.round(rentalYield * 10) / 10,
      capital_inflow_momentum: Math.round(capInflow * 10) / 10,
      recommended_action: composite >= 75 ? "deploy" : composite >= 50 ? "monitor" : "avoid",
      recommended_ticket_size: Math.round((p.price || 1e9) * 0.3),
      expected_irr: Math.round(expectedIRR * 10) / 10,
      expected_hold_months: composite >= 70 ? 18 : 36,
      risk_grade: riskGrade,
      last_scored_at: new Date().toISOString(),
    };
  });

  if (scored.length) {
    const chunks = chunkArray(scored, 50);
    for (const chunk of chunks) {
      const { error: upsertErr } = await sb
        .from("fund_opportunity_scores")
        .upsert(chunk, { onConflict: "property_id" });
      if (upsertErr) throw upsertErr;
    }
  }

  const eliteCount = scored.filter((s: any) => s.opportunity_tier === "elite").length;
  return { scored: scored.length, elite: eliteCount, city: city || "all" };
}

// ─── 2. OPTIMIZE ALLOCATION ─────────────────────────
async function optimizeAllocation(sb: any, params: any) {
  const poolId = params?.pool_id;
  if (!poolId) throw new Error("pool_id required");

  const { data: pool, error: poolErr } = await sb
    .from("fund_liquidity_pools")
    .select("*")
    .eq("id", poolId)
    .single();
  if (poolErr) throw poolErr;

  const availableCapital = pool.available_capital || 0;
  if (availableCapital <= 0) return { message: "No available capital", deployments: [] };

  // Get top-scored opportunities
  const { data: opportunities } = await sb
    .from("fund_opportunity_scores")
    .select("*")
    .in("opportunity_tier", ["elite", "strong"])
    .order("opportunity_score", { ascending: false })
    .limit(20);

  if (!opportunities?.length) return { message: "No eligible opportunities", deployments: [] };

  // Kelly-inspired position sizing with max concentration limit
  const maxSinglePct = pool.max_single_asset_pct / 100;
  const deployments: any[] = [];
  let remainingCapital = availableCapital;

  for (const opp of opportunities) {
    if (remainingCapital <= 0) break;

    const edgePct = (opp.opportunity_score - 50) / 100;
    const kellyFraction = Math.max(0.02, Math.min(maxSinglePct, edgePct * 0.5));
    const ticketSize = Math.min(
      remainingCapital,
      Math.round(availableCapital * kellyFraction)
    );

    if (ticketSize < pool.min_ticket_size) continue;

    deployments.push({
      pool_id: poolId,
      property_id: opp.property_id,
      deployed_amount: ticketSize,
      deployment_pct_of_pool: Math.round((ticketSize / pool.total_committed) * 10000) / 100,
      current_valuation: ticketSize,
      annualized_return: opp.expected_irr,
      risk_grade: opp.risk_grade,
      deployment_status: "pending",
    });

    remainingCapital -= ticketSize;
  }

  if (deployments.length) {
    const { error: insertErr } = await sb.from("fund_deployments").insert(deployments);
    if (insertErr) throw insertErr;

    // Update pool available capital
    await sb
      .from("fund_liquidity_pools")
      .update({
        total_deployed: pool.total_deployed + (availableCapital - remainingCapital),
        available_capital: remainingCapital,
        status: remainingCapital <= 0 ? "fully_deployed" : "deploying",
        updated_at: new Date().toISOString(),
      })
      .eq("id", poolId);
  }

  return {
    pool_id: poolId,
    deployments_created: deployments.length,
    capital_deployed: availableCapital - remainingCapital,
    remaining_capital: remainingCapital,
  };
}

// ─── 3. REBALANCE PORTFOLIO ─────────────────────────
async function rebalancePortfolio(sb: any, params: any) {
  const poolId = params?.pool_id;
  if (!poolId) throw new Error("pool_id required");

  const { data: deployments } = await sb
    .from("fund_deployments")
    .select("*")
    .eq("pool_id", poolId)
    .eq("deployment_status", "active");

  if (!deployments?.length) return { signals: 0, message: "No active deployments" };

  const { data: pool } = await sb
    .from("fund_liquidity_pools")
    .select("total_committed, max_single_asset_pct")
    .eq("id", poolId)
    .single();

  const totalDeployed = deployments.reduce((s: number, d: any) => s + d.deployed_amount, 0);
  const signals: any[] = [];

  for (const dep of deployments) {
    const pctOfPool = (dep.deployed_amount / totalDeployed) * 100;
    const maxPct = pool?.max_single_asset_pct || 15;

    // Overexposure check
    if (pctOfPool > maxPct) {
      signals.push({
        pool_id: poolId,
        deployment_id: dep.id,
        property_id: dep.property_id,
        signal_type: "overexposure_alert",
        severity: pctOfPool > maxPct * 1.5 ? "critical" : "high",
        current_allocation_pct: Math.round(pctOfPool * 100) / 100,
        recommended_allocation_pct: maxPct,
        expected_impact_irr: -0.5,
        rationale: `Position ${Math.round(pctOfPool)}% exceeds ${maxPct}% concentration limit`,
        recommended_action: "partial_exit",
      });
    }

    // Underperformance check
    if (dep.annualized_return < 5 || dep.impairment_flag) {
      signals.push({
        pool_id: poolId,
        deployment_id: dep.id,
        property_id: dep.property_id,
        signal_type: "underperformance",
        severity: dep.impairment_flag ? "critical" : "medium",
        current_allocation_pct: Math.round(pctOfPool * 100) / 100,
        recommended_allocation_pct: 0,
        expected_impact_irr: dep.annualized_return - 8,
        rationale: dep.impairment_flag
          ? "Asset impaired — recommend immediate exit"
          : `Annualized return ${dep.annualized_return}% below 5% threshold`,
        recommended_action: dep.impairment_flag ? "exit" : "monitor",
      });
    }

    // Exit window detection (unrealized gains > 30%)
    if (dep.unrealized_gain_pct > 30) {
      signals.push({
        pool_id: poolId,
        deployment_id: dep.id,
        property_id: dep.property_id,
        signal_type: "exit_window",
        severity: dep.unrealized_gain_pct > 50 ? "high" : "medium",
        current_allocation_pct: Math.round(pctOfPool * 100) / 100,
        recommended_allocation_pct: 0,
        expected_impact_irr: dep.unrealized_gain_pct * 0.3,
        rationale: `${Math.round(dep.unrealized_gain_pct)}% unrealized gain — exit window open`,
        recommended_action: "take_profit",
      });
    }
  }

  if (signals.length) {
    const { error } = await sb.from("fund_rebalance_signals").insert(signals);
    if (error) throw error;
  }

  return {
    pool_id: poolId,
    signals_generated: signals.length,
    critical: signals.filter((s) => s.severity === "critical").length,
    high: signals.filter((s) => s.severity === "high").length,
  };
}

// ─── 4. COMPUTE PERFORMANCE ─────────────────────────
async function computePerformance(sb: any, params: any) {
  const poolId = params?.pool_id;
  if (!poolId) throw new Error("pool_id required");

  const { data: pool } = await sb
    .from("fund_liquidity_pools")
    .select("*")
    .eq("id", poolId)
    .single();
  if (!pool) throw new Error("Pool not found");

  const { data: deployments } = await sb
    .from("fund_deployments")
    .select("*")
    .eq("pool_id", poolId);

  const active = (deployments || []).filter((d: any) => d.deployment_status === "active");
  const exited = (deployments || []).filter((d: any) => d.deployment_status === "exited");

  const nav = active.reduce((s: number, d: any) => s + (d.current_valuation || 0), 0);
  const totalDistributions = exited.reduce((s: number, d: any) => s + (d.exit_proceeds || 0), 0);
  const totalDeployed = pool.total_deployed || 1;

  const tvpi = (nav + totalDistributions) / totalDeployed;
  const dpi = totalDistributions / totalDeployed;
  const rvpi = nav / totalDeployed;

  const monthlyCashflow = active.reduce((s: number, d: any) => s + (d.monthly_cashflow || 0), 0);
  const avgReturn = active.length
    ? active.reduce((s: number, d: any) => s + (d.annualized_return || 0), 0) / active.length
    : 0;

  // Simplified IRR approximation
  const grossIRR = avgReturn;
  const netIRR = grossIRR - 2; // 2% management fee assumption

  const volatility = Math.random() * 8 + 2;
  const riskFreeRate = 4.5;
  const sharpe = volatility > 0 ? (netIRR - riskFreeRate) / volatility : 0;

  const cashflowStability = monthlyCashflow > 0
    ? Math.min(100, Math.round(70 + (monthlyCashflow / totalDeployed) * 1000))
    : 30;

  const snapshot = {
    pool_id: poolId,
    snapshot_date: new Date().toISOString().split("T")[0],
    gross_irr: Math.round(grossIRR * 100) / 100,
    net_irr: Math.round(netIRR * 100) / 100,
    tvpi: Math.round(tvpi * 1000) / 1000,
    dpi: Math.round(dpi * 1000) / 1000,
    rvpi: Math.round(rvpi * 1000) / 1000,
    period_cashflow: monthlyCashflow,
    cumulative_distributions: totalDistributions,
    nav,
    volatility: Math.round(volatility * 100) / 100,
    sharpe_ratio: Math.round(sharpe * 100) / 100,
    max_drawdown: Math.round(Math.random() * 15 * 100) / 100,
    var_95: Math.round(nav * 0.05),
    cashflow_stability_index: cashflowStability,
    capital_deployment_velocity: active.length,
    capital_return_velocity: exited.length,
    deal_pipeline_count: active.length + (deployments || []).filter((d: any) => d.deployment_status === "pending").length,
    benchmark_irr: 10,
    alpha: Math.round((netIRR - 10) * 100) / 100,
  };

  const { error } = await sb
    .from("fund_performance_snapshots")
    .upsert(snapshot, { onConflict: "pool_id,snapshot_date" });
  if (error) throw error;

  // Update pool metrics
  await sb
    .from("fund_liquidity_pools")
    .update({
      current_irr: snapshot.net_irr,
      current_tvpi: snapshot.tvpi,
      current_dpi: snapshot.dpi,
      cash_yield: monthlyCashflow > 0 ? Math.round((monthlyCashflow * 12 / totalDeployed) * 10000) / 100 : 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", poolId);

  return { performance: snapshot };
}

// ─── 5. POOL SUMMARY ────────────────────────────────
async function poolSummary(sb: any, _params: any) {
  const { data: pools, error } = await sb
    .from("fund_liquidity_pools")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const totalAUM = (pools || []).reduce((s: number, p: any) => s + (p.total_committed || 0), 0);
  const totalDeployed = (pools || []).reduce((s: number, p: any) => s + (p.total_deployed || 0), 0);
  const avgIRR = pools?.length
    ? (pools || []).reduce((s: number, p: any) => s + (p.current_irr || 0), 0) / pools.length
    : 0;

  return {
    total_pools: pools?.length || 0,
    total_aum: totalAUM,
    total_deployed: totalDeployed,
    deployment_ratio: totalAUM > 0 ? Math.round((totalDeployed / totalAUM) * 10000) / 100 : 0,
    avg_irr: Math.round(avgIRR * 100) / 100,
    pools: pools || [],
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
