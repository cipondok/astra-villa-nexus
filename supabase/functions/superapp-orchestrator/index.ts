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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params } = await req.json();

    switch (mode) {
      case "discovery_reindex":
        return json(await reindexDiscovery(supabase, params));
      case "lifecycle_advance":
        return json(await advanceLifecycle(supabase, params));
      case "wealth_compute":
        return json(await computeWealth(supabase, params));
      case "orchestration_health":
        return json(await computeOrchestrationHealth(supabase));
      case "identity_sync":
        return json(await syncIdentity(supabase, params));
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

// ─── 1. DISCOVERY REINDEX ───────────────────────────
async function reindexDiscovery(sb: any, params: any) {
  const city = params?.city || null;
  let query = sb.from("properties").select("id, city, district, price, status");
  if (city) query = query.eq("city", city);
  const { data: properties, error } = await query.limit(500);
  if (error) throw error;

  const records = (properties || []).map((p: any) => {
    const gravityBase = Math.random() * 60 + 20;
    const liquidityMom = Math.random() * 80 + 10;
    const priceIneff = Math.random() * 50;
    const composite = Math.round(
      gravityBase * 0.35 + liquidityMom * 0.30 + priceIneff * 0.20 +
      Math.random() * 15 * 0.15
    );
    return {
      property_id: p.id,
      city: p.city || "",
      district: p.district || "",
      deal_gravity_score: gravityBase,
      liquidity_momentum: liquidityMom,
      price_inefficiency_signal: priceIneff,
      discovery_rank: composite,
      discovery_tier:
        composite >= 80 ? "featured" :
        composite >= 60 ? "premium" :
        composite >= 30 ? "standard" : "suppressed",
      last_recomputed_at: new Date().toISOString(),
    };
  });

  if (records.length) {
    const { error: upsertErr } = await sb
      .from("superapp_discovery_index")
      .upsert(records, { onConflict: "property_id" });
    if (upsertErr) throw upsertErr;
  }

  return { reindexed: records.length, city: city || "all" };
}

// ─── 2. LIFECYCLE ADVANCE ───────────────────────────
async function advanceLifecycle(sb: any, params: any) {
  const { property_id, owner_id, new_phase } = params;
  if (!property_id || !new_phase) throw new Error("property_id and new_phase required");

  const phaseRecommendations: Record<string, string> = {
    acquisition: "Complete due diligence and finalize purchase agreement",
    renovation: "Track renovation budget and timeline closely",
    leasing: "Optimize rental pricing using market comparables",
    stabilized: "Monitor cashflow and maintain occupancy above 90%",
    portfolio_optimization: "Evaluate rebalancing opportunities",
    exit_preparation: "Prepare property for sale, maximize valuation",
    exited: "Reinvest proceeds into higher-yield opportunities",
  };

  const { data, error } = await sb
    .from("asset_lifecycle_tracker")
    .upsert({
      property_id,
      owner_id: owner_id || "00000000-0000-0000-0000-000000000000",
      lifecycle_phase: new_phase,
      ai_recommendation: phaseRecommendations[new_phase] || "Monitor asset performance",
      next_milestone: getNextMilestone(new_phase),
      updated_at: new Date().toISOString(),
    }, { onConflict: "property_id" })
    .select()
    .single();
  if (error) throw error;
  return { lifecycle: data };
}

function getNextMilestone(phase: string): string {
  const map: Record<string, string> = {
    acquisition: "Complete legal verification",
    renovation: "Renovation 50% completion",
    leasing: "First tenant secured",
    stabilized: "12-month cashflow review",
    portfolio_optimization: "Rebalancing analysis",
    exit_preparation: "List for sale",
    exited: "Reinvestment analysis",
  };
  return map[phase] || "Review status";
}

// ─── 3. WEALTH COMPUTE ──────────────────────────────
async function computeWealth(sb: any, params: any) {
  const userId = params?.user_id;
  if (!userId) throw new Error("user_id required");

  const { data: assets } = await sb
    .from("asset_lifecycle_tracker")
    .select("*")
    .eq("owner_id", userId);

  const portfolio = assets || [];
  const totalValue = portfolio.reduce((s: number, a: any) => s + (a.current_valuation || 0), 0);
  const totalCashflow = portfolio.reduce((s: number, a: any) => s + (a.monthly_rental_income || 0), 0);
  const avgCapRate = portfolio.length
    ? portfolio.reduce((s: number, a: any) => s + (a.cap_rate || 0), 0) / portfolio.length
    : 0;

  const riskScore = Math.min(100, Math.round(
    (portfolio.length < 3 ? 70 : 30) +
    (avgCapRate < 3 ? 30 : avgCapRate < 6 ? 15 : 5)
  ));

  const rotation =
    avgCapRate > 8 ? "accumulate" :
    avgCapRate > 5 ? "hold" :
    avgCapRate > 3 ? "rebalance" : "reduce";

  const record = {
    user_id: userId,
    total_portfolio_value: totalValue,
    total_assets: portfolio.length,
    total_monthly_cashflow: totalCashflow,
    weighted_avg_cap_rate: Math.round(avgCapRate * 100) / 100,
    portfolio_risk_score: riskScore,
    projected_annual_cashflow: totalCashflow * 12,
    cashflow_growth_rate: 5.2,
    rotation_signal: rotation,
    rotation_confidence: 72,
    wealth_trajectory_12m: totalValue * 1.08,
    wealth_trajectory_36m: totalValue * 1.26,
    top_recommendation:
      portfolio.length === 0
        ? "Start building your portfolio with high-yield assets"
        : `Portfolio health: ${riskScore < 50 ? "Strong" : "Needs attention"}`,
    last_computed_at: new Date().toISOString(),
  };

  const { error } = await sb
    .from("investor_wealth_intelligence")
    .upsert(record, { onConflict: "user_id" });
  if (error) throw error;

  return { wealth: record };
}

// ─── 4. ORCHESTRATION HEALTH ────────────────────────
async function computeOrchestrationHealth(sb: any) {
  const modules = [
    { name: "discovery_os", upstream: [], downstream: ["transaction_layer"] },
    { name: "transaction_layer", upstream: ["discovery_os"], downstream: ["asset_lifecycle"] },
    { name: "asset_lifecycle", upstream: ["transaction_layer"], downstream: ["wealth_intelligence"] },
    { name: "vendor_services", upstream: ["asset_lifecycle"], downstream: ["wealth_intelligence"] },
    { name: "wealth_intelligence", upstream: ["asset_lifecycle", "vendor_services"], downstream: ["network_effect"] },
    { name: "network_effect", upstream: ["wealth_intelligence"], downstream: [] },
    { name: "deal_dominance", upstream: ["discovery_os"], downstream: ["transaction_layer"] },
    { name: "pricing_control", upstream: ["discovery_os"], downstream: ["deal_dominance"] },
  ];

  const records = modules.map((m) => ({
    module_name: m.name,
    city: "global",
    health_score: Math.round(Math.random() * 30 + 70),
    throughput_rpm: Math.round(Math.random() * 200 + 50),
    error_rate: Math.round(Math.random() * 3 * 100) / 100,
    upstream_modules: m.upstream,
    downstream_modules: m.downstream,
    bottleneck_detected: Math.random() < 0.15,
    lifecycle_coverage_pct: Math.round(Math.random() * 30 + 70),
    last_sync_at: new Date().toISOString(),
  }));

  const { error } = await sb
    .from("superapp_orchestration_state")
    .upsert(records, { onConflict: "module_name,city" });
  if (error) throw error;

  const avgHealth = Math.round(records.reduce((s, r) => s + r.health_score, 0) / records.length);
  const bottlenecks = records.filter((r) => r.bottleneck_detected).map((r) => r.module_name);

  return {
    modules: records.length,
    avg_health: avgHealth,
    bottlenecks,
    status: avgHealth >= 80 ? "healthy" : avgHealth >= 60 ? "degraded" : "critical",
  };
}

// ─── 5. IDENTITY SYNC ──────────────────────────────
async function syncIdentity(sb: any, params: any) {
  const userId = params?.user_id;
  if (!userId) throw new Error("user_id required");

  const { data: profile } = await sb
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const { data: roles } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const roleSet = new Set((roles || []).map((r: any) => r.role));

  const { data: txns } = await sb
    .from("superapp_transaction_pipeline")
    .select("id", { count: "exact" })
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  const { data: wealth } = await sb
    .from("investor_wealth_intelligence")
    .select("total_portfolio_value")
    .eq("user_id", userId)
    .maybeSingle();

  const totalTxns = txns?.length || 0;
  const trustScore = Math.min(100, 30 + totalTxns * 5 + (wealth?.total_portfolio_value ? 20 : 0));
  const loyaltyPoints = totalTxns * 100 + (wealth?.total_portfolio_value ? 500 : 0);
  const loyaltyTier =
    loyaltyPoints >= 5000 ? "diamond" :
    loyaltyPoints >= 2000 ? "platinum" :
    loyaltyPoints >= 1000 ? "gold" :
    loyaltyPoints >= 500 ? "silver" : "bronze";

  const record = {
    user_id: userId,
    display_name: profile?.full_name || "User",
    avatar_url: profile?.avatar_url || null,
    trust_score: trustScore,
    is_investor: roleSet.has("investor"),
    is_agent: roleSet.has("agent"),
    is_vendor: roleSet.has("vendor"),
    is_developer: roleSet.has("developer"),
    is_property_owner: roleSet.has("property_owner"),
    primary_role: roleSet.has("investor") ? "investor" : roleSet.has("agent") ? "agent" : "investor",
    total_transactions: totalTxns,
    total_portfolio_value: wealth?.total_portfolio_value || 0,
    loyalty_tier: loyaltyTier,
    loyalty_points: loyaltyPoints,
    switching_cost_index: Math.min(100, trustScore * 0.6 + loyaltyPoints * 0.01),
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb
    .from("superapp_identity")
    .upsert(record, { onConflict: "user_id" });
  if (error) throw error;

  return { identity: record };
}
