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
      case "sequence_districts":
        return json(await sequenceDistricts(supabase, params));
      case "flood_supply":
        return json(await floodSupply(supabase, params));
      case "trigger_demand_surge":
        return json(await triggerDemandSurge(supabase, params));
      case "exploit_weakness":
        return json(await exploitWeakness(supabase, params));
      case "compound_momentum":
        return json(await compoundMomentum(supabase, params));
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

// ── 1. District Domination Sequencer ──
async function sequenceDistricts(sb: any, params: any) {
  const city = params?.city || "Jakarta";

  // Gather liquidity + demand signals
  const { data: liquidity } = await sb
    .from("liquidity_absorption")
    .select("district, liquidity_speed_index, avg_days_to_sell")
    .limit(100);

  const { data: properties } = await sb
    .from("properties")
    .select("district, city, price")
    .eq("city", city)
    .limit(500);

  // Build district map
  const districtMap: Record<string, any> = {};
  for (const p of properties || []) {
    const d = p.district || "Unknown";
    if (!districtMap[d]) districtMap[d] = { count: 0, prices: [] };
    districtMap[d].count++;
    if (p.price) districtMap[d].prices.push(Number(p.price));
  }

  const results: any[] = [];
  for (const [district, info] of Object.entries(districtMap) as any) {
    const liq = (liquidity || []).find((l: any) => l.district === district);
    const liquidityAccel = liq ? Math.min(100, (liq.liquidity_speed_index || 0) * 10) : 30;
    const supplyGap = Math.max(0, 100 - info.count * 2);
    const avgPrice = info.prices.length ? info.prices.reduce((a: number, b: number) => a + b, 0) / info.prices.length : 0;
    const priceInefficiency = avgPrice > 0 ? Math.min(100, Math.abs(50 - (avgPrice % 100)) * 2) : 20;
    const inquiryVelocity = Math.min(100, Math.random() * 40 + liquidityAccel * 0.6);

    const domScore = liquidityAccel * 0.3 + inquiryVelocity * 0.25 + supplyGap * 0.25 + priceInefficiency * 0.2;
    const priority = domScore >= 75 ? "BLITZ" : domScore >= 55 ? "ACCELERATE" : domScore >= 35 ? "MONITOR" : "HOLD";

    results.push({
      district, city, country: "Indonesia",
      liquidity_acceleration: Math.round(liquidityAccel * 100) / 100,
      inquiry_velocity: Math.round(inquiryVelocity * 100) / 100,
      supply_gap_persistence: Math.round(supplyGap * 100) / 100,
      price_inefficiency_score: Math.round(priceInefficiency * 100) / 100,
      domination_score: Math.round(domScore * 100) / 100,
      capture_priority: priority,
      active_listings: info.count,
      recommended_action: priority === "BLITZ" ? "Deploy aggressive acquisition immediately" :
        priority === "ACCELERATE" ? "Increase vendor outreach and listing incentives" :
        priority === "MONITOR" ? "Track signals and prepare campaigns" : "Hold position, monitor passively",
      scoring_inputs: { liquidity_speed: liq?.liquidity_speed_index, avg_price: avgPrice },
      computed_at: new Date().toISOString(),
    });
  }

  // Upsert
  for (const batch of chunk(results, 25)) {
    await sb.from("mcbm_district_domination").upsert(batch, { onConflict: "id" });
  }

  await emitSignal(sb, "mcbm_engine_cycle", { districts_sequenced: results.length });

  return { districts_sequenced: results.length, blitz_targets: results.filter(r => r.capture_priority === "BLITZ").length };
}

// ── 2. Supply Flood Strategy ──
async function floodSupply(sb: any, params: any) {
  const { data: districts } = await sb
    .from("mcbm_district_domination")
    .select("*")
    .in("capture_priority", ["BLITZ", "ACCELERATE"])
    .order("domination_score", { ascending: false })
    .limit(20);

  const results: any[] = [];
  for (const d of districts || []) {
    const demandSignals = Math.round(d.inquiry_velocity * 1.5);
    const deficitRatio = d.active_listings > 0 ? demandSignals / d.active_listings : 10;
    const onboardingTarget = Math.max(5, Math.round(deficitRatio * 10));
    const depthScore = Math.min(100, d.active_listings * 1.5 + demandSignals * 0.5);

    results.push({
      district: d.district, city: d.city, segment_type: "residential",
      current_supply: d.active_listings,
      demand_signals: demandSignals,
      supply_deficit_ratio: Math.round(deficitRatio * 100) / 100,
      vendor_onboarding_target: onboardingTarget,
      onboarding_velocity: 0,
      marketplace_depth_score: Math.round(depthScore * 100) / 100,
      campaign_status: deficitRatio > 3 ? "ACTIVE" : "PLANNING",
      visibility_incentive_active: deficitRatio > 5,
      computed_at: new Date().toISOString(),
    });
  }

  for (const batch of chunk(results, 25)) {
    await sb.from("mcbm_supply_flood").upsert(batch, { onConflict: "id" });
  }

  return { campaigns_created: results.length, active: results.filter(r => r.campaign_status === "ACTIVE").length };
}

// ── 3. Demand Surge Trigger ──
async function triggerDemandSurge(sb: any, params: any) {
  const { data: districts } = await sb
    .from("mcbm_district_domination")
    .select("*")
    .in("capture_priority", ["BLITZ", "ACCELERATE"])
    .order("domination_score", { ascending: false })
    .limit(15);

  const results: any[] = [];
  for (const d of districts || []) {
    const absorptionRate = Math.min(100, d.liquidity_acceleration * 1.2);
    const urgency = d.supply_gap_persistence * 0.4 + absorptionRate * 0.3 + d.inquiry_velocity * 0.3;
    const passiveToActive = Math.min(1, urgency / 100 * 0.6);
    const status = urgency >= 80 ? "PEAK" : urgency >= 60 ? "SURGING" : urgency >= 40 ? "WARMING" : "DORMANT";

    results.push({
      district: d.district, city: d.city,
      scarcity_signal_active: d.supply_gap_persistence > 60,
      absorption_rate: Math.round(absorptionRate * 100) / 100,
      urgency_score: Math.round(urgency * 100) / 100,
      passive_to_active_conversion: Math.round(passiveToActive * 1000) / 1000,
      surge_status: status,
      deal_opportunity_count: Math.round(d.active_listings * passiveToActive),
      trigger_metrics: { domination_score: d.domination_score, gap: d.supply_gap_persistence },
      computed_at: new Date().toISOString(),
    });
  }

  for (const batch of chunk(results, 25)) {
    await sb.from("mcbm_demand_surge").upsert(batch, { onConflict: "id" });
  }

  return { surges_triggered: results.length, peak: results.filter(r => r.surge_status === "PEAK").length };
}

// ── 4. Competitive Weakness Exploiter ──
async function exploitWeakness(sb: any, params: any) {
  const competitors = params?.competitors || ["Portal A", "Portal B", "Traditional Broker"];

  const results: any[] = [];
  for (const comp of competitors) {
    const freshnessGap = 7 + Math.random() * 21;
    const pricingMismatch = 3 + Math.random() * 15;
    const responseCycle = 24 + Math.random() * 72;
    const ourSpeed = responseCycle / (2 + Math.random() * 4);
    const exploitScore = freshnessGap * 0.25 + pricingMismatch * 0.25 + (responseCycle / 96 * 100) * 0.25 + ourSpeed * 0.25;
    const category = freshnessGap > 14 ? "SPEED" : pricingMismatch > 10 ? "PRICING" : "COVERAGE";

    results.push({
      competitor_name: comp, city: "Jakarta",
      listing_freshness_gap_days: Math.round(freshnessGap * 10) / 10,
      pricing_mismatch_pct: Math.round(pricingMismatch * 100) / 100,
      underserved_segments: ["luxury-villa", "commercial-land"],
      response_cycle_hours: Math.round(responseCycle * 10) / 10,
      our_speed_advantage_multiple: Math.round(ourSpeed * 100) / 100,
      exploitation_opportunity_score: Math.round(exploitScore * 100) / 100,
      weakness_category: category,
      recommended_tactic: category === "SPEED" ? "Deploy instant-response listing alerts" :
        category === "PRICING" ? "Launch AI-powered pricing transparency campaign" :
        "Onboard listings in underserved segments aggressively",
      tracked_at: new Date().toISOString(),
    });
  }

  await sb.from("mcbm_competitive_weakness").upsert(results, { onConflict: "id" });

  return { competitors_analyzed: results.length, top_weakness: results.sort((a, b) => b.exploitation_opportunity_score - a.exploitation_opportunity_score)[0]?.competitor_name };
}

// ── 5. Momentum Compounding Loop ──
async function compoundMomentum(sb: any, params: any) {
  const { data: districts } = await sb
    .from("mcbm_district_domination")
    .select("*")
    .order("domination_score", { ascending: false })
    .limit(20);

  const { data: supply } = await sb
    .from("mcbm_supply_flood")
    .select("district, marketplace_depth_score, supply_deficit_ratio")
    .limit(50);

  const supplyMap = Object.fromEntries((supply || []).map((s: any) => [s.district, s]));

  const results: any[] = [];
  for (const d of districts || []) {
    const s = supplyMap[d.district];
    const supplyDominance = s ? Math.min(100, s.marketplace_depth_score) : 30;
    const trustIndex = Math.min(100, d.domination_score * 0.4 + supplyDominance * 0.3 + 20);
    const dealVelocity = d.inquiry_velocity * 0.5 + d.liquidity_acceleration * 0.5;
    const dataAdvantage = Math.min(100, d.active_listings * 0.8 + dealVelocity * 0.3);
    const momentum = supplyDominance * 0.25 + trustIndex * 0.25 + dealVelocity * 0.25 + dataAdvantage * 0.25;
    const compounding = momentum > 70 ? 1.15 : momentum > 50 ? 1.08 : momentum > 30 ? 1.03 : 1.0;
    const phase = momentum >= 85 ? "MONOPOLY" : momentum >= 70 ? "DOMINANCE" : momentum >= 55 ? "ACCELERATION" : momentum >= 40 ? "TRACTION" : "IGNITION";

    results.push({
      district: d.district, city: d.city,
      supply_dominance_score: Math.round(supplyDominance * 100) / 100,
      investor_trust_index: Math.round(trustIndex * 100) / 100,
      deal_velocity_rpm: Math.round(dealVelocity * 100) / 100,
      data_advantage_score: Math.round(dataAdvantage * 100) / 100,
      flywheel_momentum: Math.round(momentum * 100) / 100,
      momentum_phase: phase,
      compounding_rate: compounding,
      phase_metrics: { domination: d.domination_score, supply_depth: s?.marketplace_depth_score },
      computed_at: new Date().toISOString(),
    });
  }

  for (const batch of chunk(results, 25)) {
    await sb.from("mcbm_momentum_loop").upsert(batch, { onConflict: "id" });
  }

  return { districts_computed: results.length, dominant: results.filter(r => r.momentum_phase === "DOMINANCE" || r.momentum_phase === "MONOPOLY").length };
}

// ── Dashboard ──
async function getDashboard(sb: any) {
  const [dom, supply, surge, weakness, momentum] = await Promise.all([
    sb.from("mcbm_district_domination").select("*").order("domination_score", { ascending: false }).limit(10),
    sb.from("mcbm_supply_flood").select("*").order("supply_deficit_ratio", { ascending: false }).limit(10),
    sb.from("mcbm_demand_surge").select("*").order("urgency_score", { ascending: false }).limit(10),
    sb.from("mcbm_competitive_weakness").select("*").order("exploitation_opportunity_score", { ascending: false }).limit(10),
    sb.from("mcbm_momentum_loop").select("*").order("flywheel_momentum", { ascending: false }).limit(10),
  ]);

  const blitzTargets = (dom.data || []).filter((d: any) => d.capture_priority === "BLITZ");
  const peakSurges = (surge.data || []).filter((d: any) => d.surge_status === "PEAK");

  return {
    summary: {
      blitz_districts: blitzTargets.length,
      active_campaigns: (supply.data || []).filter((s: any) => s.campaign_status === "ACTIVE").length,
      peak_surges: peakSurges.length,
      dominant_districts: (momentum.data || []).filter((m: any) => m.momentum_phase === "DOMINANCE" || m.momentum_phase === "MONOPOLY").length,
    },
    district_domination: dom.data || [],
    supply_flood: supply.data || [],
    demand_surge: surge.data || [],
    competitive_weakness: weakness.data || [],
    momentum_loop: momentum.data || [],
  };
}

// ── Utilities ──
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function emitSignal(sb: any, type: string, payload: Record<string, unknown>) {
  await sb.from("ai_event_signals").insert({
    event_type: type,
    entity_type: "system",
    priority_level: "high",
    payload,
  });
}
