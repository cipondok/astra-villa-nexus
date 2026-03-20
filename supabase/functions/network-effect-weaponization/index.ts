import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      case "compute_gravity":
        return json(await computeGravity(supabase, params));
      case "compound_data":
        return json(await compoundData(supabase, params));
      case "measure_lockin":
        return json(await measureLockin(supabase, params));
      case "spin_reputation":
        return json(await spinReputation(supabase, params));
      case "expand_ecosystem":
        return json(await expandEcosystem(supabase, params));
      case "dashboard":
        return json(await getDashboard(supabase));
      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── 1. Liquidity Gravity Engine ──
async function computeGravity(sb: any, params: any) {
  const city = params?.city || "Jakarta";

  const { data: properties } = await sb
    .from("properties")
    .select("district, status")
    .eq("city", city)
    .limit(500);

  const { data: liquidity } = await sb
    .from("liquidity_absorption")
    .select("district, liquidity_speed_index, avg_days_to_sell")
    .limit(100);

  const districtMap: Record<string, { total: number; active: number }> = {};
  for (const p of properties || []) {
    const d = p.district || "Unknown";
    if (!districtMap[d]) districtMap[d] = { total: 0, active: 0 };
    districtMap[d].total++;
    if (p.status === "available") districtMap[d].active++;
  }

  const liqMap = Object.fromEntries((liquidity || []).map((l: any) => [l.district, l]));

  const results: any[] = [];
  for (const [district, info] of Object.entries(districtMap)) {
    const liq = liqMap[district];
    const dealActivity = Math.min(100, info.total * 2 + (liq?.liquidity_speed_index || 0) * 15);
    const discoveryAccuracy = Math.min(100, dealActivity * 0.6 + 25);
    const retention = Math.min(100, discoveryAccuracy * 0.7 + 20);
    const listingQuality = Math.min(100, retention * 0.5 + info.active * 1.5);
    const gravityPull = dealActivity * 0.3 + discoveryAccuracy * 0.25 + retention * 0.25 + listingQuality * 0.2;
    const loopVelocity = (gravityPull / 100) * (1 + dealActivity / 200);
    const phase = gravityPull >= 85 ? "INESCAPABLE" : gravityPull >= 65 ? "STRONG" : gravityPull >= 40 ? "FORMING" : "NASCENT";

    results.push({
      district, city, deal_activity_index: r2(dealActivity),
      discovery_accuracy_score: r2(discoveryAccuracy), retention_rate: r2(retention),
      listing_quality_index: r2(listingQuality), gravity_pull: r2(gravityPull),
      gravity_phase: phase, feedback_loop_velocity: r2(loopVelocity),
      loop_metrics: { listings: info.total, active: info.active, lsi: liq?.liquidity_speed_index },
      computed_at: new Date().toISOString(),
    });
  }

  for (const batch of chunk(results, 25)) {
    await sb.from("newf_liquidity_gravity").upsert(batch, { onConflict: "id" });
  }

  await emitSignal(sb, "newf_engine_cycle", { gravity_computed: results.length });
  return { districts_computed: results.length, inescapable: results.filter(r => r.gravity_phase === "INESCAPABLE").length };
}

// ── 2. Data Advantage Compounding ──
async function compoundData(sb: any, params: any) {
  const domains = ["pricing", "demand_heat", "investor_matching", "liquidity_scoring", "geo_intelligence"];

  const { count: behavioralCount } = await sb
    .from("behavioral_events")
    .select("*", { count: "exact", head: true });

  const results: any[] = [];
  for (const domain of domains) {
    const signals = Math.round((behavioralCount || 10000) / domains.length);
    const insights = Math.round(signals * 0.02);
    const accuracy = Math.min(98, 60 + Math.log10(signals + 1) * 8);
    const delta = Math.max(0, accuracy - 60) * 0.1;
    const moat = Math.min(100, accuracy * 0.5 + insights * 0.01 + delta * 10);
    const gap = Math.min(100, moat * 0.8);
    const compounding = 1 + (moat / 1000);
    const tier = moat >= 80 ? "FORTRESS" : moat >= 60 ? "MOAT" : moat >= 35 ? "EDGE" : "PARITY";

    results.push({
      domain, city: "Jakarta",
      behavioral_signals_ingested: signals, proprietary_insights_generated: insights,
      pricing_accuracy_pct: r2(accuracy), pricing_accuracy_delta: r2(delta),
      moat_width_score: r2(moat), unique_dataset_count: Math.round(insights * 0.3),
      competitor_data_gap_pct: r2(gap), compounding_rate: r2(compounding),
      advantage_tier: tier, computed_at: new Date().toISOString(),
    });
  }

  await sb.from("newf_data_advantage").upsert(results, { onConflict: "id" });
  return { domains_computed: results.length, fortress_count: results.filter(r => r.advantage_tier === "FORTRESS").length };
}

// ── 3. Participant Lock-In ──
async function measureLockin(sb: any, params: any) {
  const types = ["AGENT", "VENDOR", "INVESTOR", "DEVELOPER"];

  const results: any[] = [];
  for (const pt of types) {
    const visibility = 40 + Math.random() * 50;
    const portfolioDepth = pt === "INVESTOR" ? 60 + Math.random() * 35 : 20 + Math.random() * 40;
    const workflows = Math.round(3 + Math.random() * 12);
    const friction = visibility * 0.2 + portfolioDepth * 0.3 + workflows * 3;
    const frictionNorm = Math.min(100, friction);
    const churn = Math.max(1, 100 - frictionNorm) / 100;
    const tier = frictionNorm >= 85 ? "DIAMOND" : frictionNorm >= 70 ? "PLATINUM" :
      frictionNorm >= 55 ? "GOLD" : frictionNorm >= 35 ? "SILVER" : "BASIC";

    results.push({
      participant_type: pt, city: "Jakarta",
      performance_visibility_score: r2(visibility),
      portfolio_dependency_depth: r2(portfolioDepth),
      workflow_integration_count: workflows,
      switching_friction_index: r2(frictionNorm),
      reward_tier: tier,
      active_participants: Math.round(50 + Math.random() * 500),
      avg_tenure_months: r2(3 + Math.random() * 24),
      churn_probability: r2(churn),
      computed_at: new Date().toISOString(),
    });
  }

  await sb.from("newf_participant_lockin").upsert(results, { onConflict: "id" });
  return { participants_measured: results.length, diamond_count: results.filter(r => r.reward_tier === "DIAMOND").length };
}

// ── 4. Reputation Flywheel ──
async function spinReputation(sb: any, params: any) {
  const { data: gravity } = await sb
    .from("newf_liquidity_gravity")
    .select("district, city, gravity_pull, deal_activity_index, retention_rate")
    .order("gravity_pull", { ascending: false })
    .limit(20);

  const results: any[] = [];
  for (const g of gravity || []) {
    const topPerformers = Math.round(g.deal_activity_index * 0.15);
    const trustScore = Math.min(100, g.retention_rate * 0.6 + g.gravity_pull * 0.3);
    const reliability = Math.min(100, trustScore * 0.7 + g.deal_activity_index * 0.2);
    const amplification = 1 + (trustScore / 200);
    const successRate = Math.min(100, 40 + g.gravity_pull * 0.5);
    const reviewVel = g.deal_activity_index * 0.3;
    const momentum = trustScore * 0.3 + reliability * 0.25 + successRate * 0.25 + reviewVel * 0.2;
    const phase = momentum >= 80 ? "DOMINANT" : momentum >= 60 ? "COMPOUNDING" : momentum >= 40 ? "GROWING" : "SEEDING";

    results.push({
      district: g.district, city: g.city,
      top_performer_count: topPerformers, trust_ecosystem_score: r2(trustScore),
      marketplace_reliability_index: r2(reliability), amplification_multiplier: r2(amplification),
      deal_success_rate: r2(successRate), review_velocity: r2(reviewVel),
      reputation_momentum: r2(momentum), flywheel_phase: phase,
      phase_metrics: { gravity_pull: g.gravity_pull },
      computed_at: new Date().toISOString(),
    });
  }

  for (const batch of chunk(results, 25)) {
    await sb.from("newf_reputation_flywheel").upsert(batch, { onConflict: "id" });
  }

  return { districts_computed: results.length, dominant: results.filter(r => r.flywheel_phase === "DOMINANT").length };
}

// ── 5. Ecosystem Expansion Hooks ──
async function expandEcosystem(sb: any, params: any) {
  const hooks = [
    { type: "FINANCIAL_PARTNER", name: "KPR Bank Integration", depth: 72 },
    { type: "INTEGRATION", name: "Mapbox Geospatial", depth: 88 },
    { type: "DEVELOPER_API", name: "Property Data API", depth: 45 },
    { type: "DATA_FEED", name: "Market Intelligence Feed", depth: 65 },
    { type: "FINANCIAL_PARTNER", name: "Insurance Partner", depth: 35 },
    { type: "INTEGRATION", name: "Legal Document Automation", depth: 55 },
  ];

  const results: any[] = [];
  for (const h of hooks) {
    const apiVolume = Math.round(h.depth * 50 + Math.random() * 2000);
    const revenue = h.depth * 100 + Math.random() * 5000;
    const adoption = Math.min(100, h.depth * 0.8 + 10);
    const dependency = Math.min(100, h.depth * 0.6 + adoption * 0.3);
    const status = h.depth >= 80 ? "CRITICAL" : h.depth >= 60 ? "STRATEGIC" : h.depth >= 40 ? "ACTIVE" : h.depth >= 20 ? "PILOT" : "PROSPECT";

    results.push({
      hook_type: h.type, partner_name: h.name, city: "Jakarta",
      integration_depth_score: r2(h.depth), api_call_volume: apiVolume,
      revenue_contribution: r2(revenue), user_adoption_pct: r2(adoption),
      partner_dependency_index: r2(dependency), expansion_status: status,
      computed_at: new Date().toISOString(),
    });
  }

  await sb.from("newf_ecosystem_hooks").upsert(results, { onConflict: "id" });
  return { hooks_computed: results.length, critical: results.filter(r => r.expansion_status === "CRITICAL").length };
}

// ── Dashboard ──
async function getDashboard(sb: any) {
  const [grav, data, lockin, rep, eco] = await Promise.all([
    sb.from("newf_liquidity_gravity").select("*").order("gravity_pull", { ascending: false }).limit(10),
    sb.from("newf_data_advantage").select("*").order("moat_width_score", { ascending: false }).limit(10),
    sb.from("newf_participant_lockin").select("*").order("switching_friction_index", { ascending: false }).limit(10),
    sb.from("newf_reputation_flywheel").select("*").order("reputation_momentum", { ascending: false }).limit(10),
    sb.from("newf_ecosystem_hooks").select("*").order("integration_depth_score", { ascending: false }).limit(10),
  ]);

  return {
    summary: {
      inescapable_districts: (grav.data || []).filter((g: any) => g.gravity_phase === "INESCAPABLE").length,
      fortress_domains: (data.data || []).filter((d: any) => d.advantage_tier === "FORTRESS").length,
      diamond_participants: (lockin.data || []).filter((l: any) => l.reward_tier === "DIAMOND").length,
      dominant_reputations: (rep.data || []).filter((r: any) => r.flywheel_phase === "DOMINANT").length,
      critical_hooks: (eco.data || []).filter((e: any) => e.expansion_status === "CRITICAL").length,
    },
    liquidity_gravity: grav.data || [],
    data_advantage: data.data || [],
    participant_lockin: lockin.data || [],
    reputation_flywheel: rep.data || [],
    ecosystem_hooks: eco.data || [],
  };
}

// ── Utilities ──
function r2(n: number) { return Math.round(n * 100) / 100; }
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
async function emitSignal(sb: any, type: string, payload: Record<string, unknown>) {
  await sb.from("ai_event_signals").insert({
    event_type: type, entity_type: "system", priority_level: "high", payload,
  });
}
