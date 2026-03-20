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
      case "monitor_competitors": return json(await monitorCompetitors(supabase, params));
      case "plan_counter_moves": return json(await planCounterMoves(supabase, params));
      case "reinforce_moat": return json(await reinforceMoat(supabase, params));
      case "control_narrative": return json(await controlNarrative(supabase, params));
      case "simulate_dominance": return json(await simulateDominance(supabase, params));
      case "dashboard": return json(await getDashboard(supabase));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// ── 1. Competitor Signal Monitoring ──
async function monitorCompetitors(sb: any, params: any) {
  const competitors = params?.competitors || ["Rumah123", "OLX Property", "99.co"];
  const city = params?.city || "Jakarta";

  const { data: ourListings } = await sb
    .from("properties").select("district", { count: "exact" }).eq("city", city).limit(1);
  const ourCount = ourListings?.length || 100;

  const signals: any[] = [];
  const signalTypes = ["SUPPLY_SURGE", "MARKETING_SPIKE", "PRICE_UNDERCUT", "AGENT_MIGRATION"];

  for (const comp of competitors) {
    for (const st of signalTypes) {
      const strength = Math.random() * 100;
      if (strength < 25) continue; // skip weak signals

      const listingDelta = st === "SUPPLY_SURGE" ? 5 + Math.random() * 30 : Math.random() * 10;
      const marketingIntensity = st === "MARKETING_SPIKE" ? 40 + Math.random() * 60 : Math.random() * 30;
      const priceUndercut = st === "PRICE_UNDERCUT" ? 2 + Math.random() * 15 : 0;
      const agentChurn = st === "AGENT_MIGRATION" ? 5 + Math.random() * 25 : Math.random() * 5;

      const composite = strength * 0.3 + listingDelta * 0.2 + marketingIntensity * 0.15 + priceUndercut * 2 + agentChurn * 0.8;
      const compositeNorm = Math.min(100, composite);
      const threat = compositeNorm >= 80 ? "CRITICAL" : compositeNorm >= 60 ? "HIGH" : compositeNorm >= 40 ? "MEDIUM" : "LOW";

      signals.push({
        competitor_name: comp, city, signal_type: st,
        signal_strength: r2(strength), listing_delta_pct: r2(listingDelta),
        marketing_intensity: r2(marketingIntensity), price_undercut_pct: r2(priceUndercut),
        agent_churn_risk: r2(agentChurn), threat_level: threat,
        threat_composite_score: r2(compositeNorm),
        raw_evidence: { our_listing_count: ourCount, scan_time: new Date().toISOString() },
        detected_at: new Date().toISOString(),
      });
    }
  }

  for (const batch of chunk(signals, 25)) {
    await sb.from("amda_competitor_signals").insert(batch);
  }

  await emitSignal(sb, "amda_engine_cycle", { signals_detected: signals.length, critical: signals.filter(s => s.threat_level === "CRITICAL").length });
  return { signals_detected: signals.length, critical: signals.filter(s => s.threat_level === "CRITICAL").length };
}

// ── 2. Strategic Counter-Move Planner ──
async function planCounterMoves(sb: any, params: any) {
  const { data: threats } = await sb
    .from("amda_competitor_signals")
    .select("*")
    .in("threat_level", ["CRITICAL", "HIGH"])
    .order("threat_composite_score", { ascending: false })
    .limit(20);

  const moveMap: Record<string, string> = {
    SUPPLY_SURGE: "VISIBILITY_SURGE",
    MARKETING_SPIKE: "ENGAGEMENT_BOOST",
    PRICE_UNDERCUT: "LIQUIDITY_PROTECT",
    AGENT_MIGRATION: "RETENTION_LOCK",
    NEW_ENTRANT: "INCENTIVE_DEPLOY",
  };

  const moves: any[] = [];
  for (const t of threats || []) {
    const moveType = moveMap[t.signal_type] || "INCENTIVE_DEPLOY";
    const urgency = t.threat_level === "CRITICAL" ? "IMMEDIATE" : "HIGH";
    const impact = Math.min(100, t.threat_composite_score * 0.9);
    const cost = impact * 0.6 + Math.random() * 20;
    const roi = cost > 0 ? (impact / cost) * 100 : 0;

    moves.push({
      threat_signal_id: t.id, district: t.district, city: t.city,
      move_type: moveType, urgency,
      estimated_impact_score: r2(impact), resource_cost_index: r2(cost),
      roi_projection: r2(roi), execution_status: "PLANNED",
      move_details: {
        threat: t.competitor_name, signal: t.signal_type,
        action: moveType === "VISIBILITY_SURGE" ? "Boost top 20 listings in district for 48h" :
          moveType === "ENGAGEMENT_BOOST" ? "Launch targeted investor re-engagement campaign" :
          moveType === "LIQUIDITY_PROTECT" ? "Deploy price-match intelligence alerts" :
          moveType === "RETENTION_LOCK" ? "Activate agent loyalty rewards program" :
          "Deploy early-mover incentive package",
      },
    });
  }

  for (const batch of chunk(moves, 25)) {
    await sb.from("amda_counter_moves").insert(batch);
  }

  return { moves_planned: moves.length, immediate: moves.filter(m => m.urgency === "IMMEDIATE").length };
}

// ── 3. Moat Reinforcement ──
async function reinforceMoat(sb: any, params: any) {
  const dimensions = [
    { dim: "DATA_ASSET", base: 65 },
    { dim: "AI_ACCURACY", base: 70 },
    { dim: "ECOSYSTEM_DEPTH", base: 50 },
    { dim: "NETWORK_DENSITY", base: 55 },
    { dim: "BRAND_TRUST", base: 60 },
  ];

  // Pull real data signals
  const { data: dataAdv } = await sb
    .from("newf_data_advantage")
    .select("moat_width_score")
    .order("moat_width_score", { ascending: false })
    .limit(1);

  const { data: gravity } = await sb
    .from("newf_liquidity_gravity")
    .select("gravity_pull")
    .order("gravity_pull", { ascending: false })
    .limit(1);

  const dataBoost = dataAdv?.[0]?.moat_width_score || 0;
  const gravityBoost = gravity?.[0]?.gravity_pull || 0;

  const results: any[] = [];
  for (const { dim, base } of dimensions) {
    const boost = dim === "DATA_ASSET" ? dataBoost * 0.3 : dim === "NETWORK_DENSITY" ? gravityBoost * 0.2 : Math.random() * 15;
    const current = Math.min(100, base + boost);
    const target = Math.min(100, current + 15);
    const gap = target - current;
    const velocity = gap > 0 ? current / (gap * 2) : 10;
    const competitorClosest = Math.max(10, current - 15 - Math.random() * 20);
    const indispensability = Math.min(100, current * 0.6 + (current - competitorClosest) * 0.8);
    const status = current >= 85 ? "IMPREGNABLE" : current >= 65 ? "FORTIFIED" : current >= 45 ? "BUILDING" : "VULNERABLE";

    results.push({
      moat_dimension: dim, city: "Jakarta",
      current_strength: r2(current), target_strength: r2(target),
      gap_score: r2(gap), reinforcement_velocity: r2(velocity),
      competitor_closest_pct: r2(competitorClosest),
      indispensability_index: r2(indispensability),
      fortress_status: status,
      reinforcement_actions: {
        priority: gap > 10 ? "HIGH" : "MEDIUM",
        action: dim === "DATA_ASSET" ? "Ingest 3 new proprietary data sources" :
          dim === "AI_ACCURACY" ? "Deploy shadow model A/B testing" :
          dim === "ECOSYSTEM_DEPTH" ? "Onboard 2 new financial partners" :
          dim === "NETWORK_DENSITY" ? "Launch agent referral multiplier" :
          "Publish 5 market authority reports",
      },
      computed_at: new Date().toISOString(),
    });
  }

  await sb.from("amda_moat_reinforcement").upsert(results, { onConflict: "id" });
  return { dimensions_reinforced: results.length, impregnable: results.filter(r => r.fortress_status === "IMPREGNABLE").length };
}

// ── 4. Narrative Control ──
async function controlNarrative(sb: any, params: any) {
  const themes = [
    { theme: "AI Intelligence Authority", base: 70 },
    { theme: "Market Data Transparency Leader", base: 65 },
    { theme: "Investor Trust Platform", base: 60 },
    { theme: "Legacy Portal Displacement", base: 55 },
    { theme: "PropTech Category Creator", base: 50 },
  ];

  const results: any[] = [];
  for (const { theme, base } of themes) {
    const authority = Math.min(100, base + Math.random() * 20);
    const legacyFraming = Math.min(100, authority * 0.7 + 15);
    const leadership = Math.min(100, authority * 0.5 + legacyFraming * 0.3 + 10);
    const sov = Math.min(100, base * 0.6 + Math.random() * 25);
    const sentiment = Math.min(100, authority * 0.4 + sov * 0.3);
    const velocity = (authority + sov) / 200 * 10;
    const status = leadership >= 80 ? "DOMINANT" : leadership >= 60 ? "LEADING" : leadership >= 40 ? "CONTESTING" : "LOSING";

    results.push({
      narrative_theme: theme, city: "Jakarta",
      authority_perception_score: r2(authority),
      competitor_legacy_framing: r2(legacyFraming),
      category_leadership_index: r2(leadership),
      share_of_voice_pct: r2(sov),
      sentiment_advantage: r2(sentiment),
      narrative_velocity: r2(velocity),
      control_status: status,
      content_strategy: {
        next_action: status === "DOMINANT" ? "Maintain authority content cadence" :
          status === "LEADING" ? "Amplify case studies and data reports" :
          "Launch aggressive thought leadership campaign",
      },
      computed_at: new Date().toISOString(),
    });
  }

  await sb.from("amda_narrative_control").upsert(results, { onConflict: "id" });
  return { narratives_controlled: results.length, dominant: results.filter(r => r.control_status === "DOMINANT").length };
}

// ── 5. Dominance Simulator ──
async function simulateDominance(sb: any, params: any) {
  const scenarios = [
    { name: "Aggressive Expansion", defense: 20, expansion: 80 },
    { name: "Balanced Growth", defense: 50, expansion: 50 },
    { name: "Defensive Fortress", defense: 80, expansion: 20 },
    { name: "Selective Strike", defense: 40, expansion: 60 },
  ];

  const { data: moat } = await sb
    .from("amda_moat_reinforcement")
    .select("current_strength")
    .limit(5);
  const avgMoat = moat?.length ? moat.reduce((a: number, m: any) => a + (m.current_strength || 0), 0) / moat.length : 50;

  const { data: threats } = await sb
    .from("amda_competitor_signals")
    .select("threat_composite_score")
    .eq("threat_level", "CRITICAL")
    .limit(10);
  const threatPressure = threats?.length ? threats.reduce((a: number, t: any) => a + (t.threat_composite_score || 0), 0) / Math.max(1, threats.length) : 30;

  const results: any[] = [];
  for (const s of scenarios) {
    const baseShare = 25 + avgMoat * 0.3 - threatPressure * 0.15;
    const expansionBoost = s.expansion * 0.2;
    const defensePenalty = s.defense < 30 ? threatPressure * 0.1 : 0;
    const projectedShare = Math.min(85, Math.max(5, baseShare + expansionBoost - defensePenalty));
    const sustainability = s.defense * 0.4 + avgMoat * 0.3 + (100 - threatPressure) * 0.3;
    const displacement = Math.max(1, 100 - sustainability);
    const optimalStrategy = sustainability >= 75 ? "AGGRESSIVE_EXPAND" :
      sustainability >= 55 ? "BALANCED" : sustainability >= 35 ? "DEFENSIVE_HOLD" : "STRATEGIC_RETREAT";

    results.push({
      scenario_name: s.name, city: "Jakarta", time_horizon_months: 12,
      projected_market_share_pct: r2(projectedShare),
      defense_allocation_pct: s.defense, expansion_allocation_pct: s.expansion,
      sustainability_score: r2(sustainability),
      risk_of_displacement: r2(displacement),
      optimal_strategy: optimalStrategy,
      simulation_inputs: { avg_moat: avgMoat, threat_pressure: threatPressure },
      simulation_results: { base_share: r2(baseShare), expansion_boost: r2(expansionBoost) },
      simulated_at: new Date().toISOString(),
    });
  }

  await sb.from("amda_dominance_simulator").upsert(results, { onConflict: "id" });
  return { scenarios_simulated: results.length, best_share: Math.max(...results.map(r => r.projected_market_share_pct)) };
}

// ── Dashboard ──
async function getDashboard(sb: any) {
  const [signals, moves, moat, narrative, sim] = await Promise.all([
    sb.from("amda_competitor_signals").select("*").order("threat_composite_score", { ascending: false }).limit(15),
    sb.from("amda_counter_moves").select("*").order("planned_at", { ascending: false }).limit(10),
    sb.from("amda_moat_reinforcement").select("*").order("current_strength", { ascending: false }).limit(10),
    sb.from("amda_narrative_control").select("*").order("category_leadership_index", { ascending: false }).limit(10),
    sb.from("amda_dominance_simulator").select("*").order("projected_market_share_pct", { ascending: false }).limit(10),
  ]);

  return {
    summary: {
      critical_threats: (signals.data || []).filter((s: any) => s.threat_level === "CRITICAL").length,
      immediate_moves: (moves.data || []).filter((m: any) => m.urgency === "IMMEDIATE").length,
      impregnable_moats: (moat.data || []).filter((m: any) => m.fortress_status === "IMPREGNABLE").length,
      dominant_narratives: (narrative.data || []).filter((n: any) => n.control_status === "DOMINANT").length,
      best_projected_share: Math.max(...(sim.data || []).map((s: any) => s.projected_market_share_pct || 0), 0),
    },
    competitor_signals: signals.data || [],
    counter_moves: moves.data || [],
    moat_reinforcement: moat.data || [],
    narrative_control: narrative.data || [],
    dominance_simulator: sim.data || [],
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
