import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// ── Helpers ──

const INVASION_CANDIDATES = [
  { city: "Bandung", country: "Indonesia", region: "Java", pop: 2.5, urban: 78, mktSize: 850 },
  { city: "Makassar", country: "Indonesia", region: "Sulawesi", pop: 1.5, urban: 72, mktSize: 420 },
  { city: "Medan", country: "Indonesia", region: "Sumatra", pop: 2.3, urban: 70, mktSize: 680 },
  { city: "Semarang", country: "Indonesia", region: "Java", pop: 1.8, urban: 75, mktSize: 520 },
  { city: "Yogyakarta", country: "Indonesia", region: "Java", pop: 0.9, urban: 68, mktSize: 380 },
  { city: "Malang", country: "Indonesia", region: "Java", pop: 0.9, urban: 65, mktSize: 310 },
  { city: "Balikpapan", country: "Indonesia", region: "Kalimantan", pop: 0.7, urban: 82, mktSize: 290 },
  { city: "Manado", country: "Indonesia", region: "Sulawesi", pop: 0.5, urban: 60, mktSize: 180 },
  { city: "Kuala Lumpur", country: "Malaysia", region: "SEA", pop: 8.0, urban: 92, mktSize: 4200 },
  { city: "Bangkok", country: "Thailand", region: "SEA", pop: 10.5, urban: 90, mktSize: 5800 },
  { city: "Ho Chi Minh City", country: "Vietnam", region: "SEA", pop: 9.0, urban: 85, mktSize: 3200 },
  { city: "Manila", country: "Philippines", region: "SEA", pop: 13.5, urban: 88, mktSize: 2800 },
];

// ── Mode Handlers ──

async function sequenceInvasion(client: ReturnType<typeof sb>, params: Record<string, unknown>) {
  const limit = Number(params.limit) || 10;
  const strategy = (params.strategy as string) || "DENSITY_FIRST";

  const ranked = INVASION_CANDIDATES.map((c) => {
    const liquiditySignal = 30 + Math.random() * 70;
    const digitalWeakness = 20 + Math.random() * 80;
    const compDensity = Math.random() * 60;
    const score =
      liquiditySignal * 0.3 +
      digitalWeakness * 0.25 +
      (100 - compDensity) * 0.2 +
      c.urban * 0.15 +
      Math.min(c.pop * 5, 50) * 0.1;

    return {
      city: c.city,
      country: c.country,
      region: c.region,
      invasion_phase: score > 75 ? "MOBILIZE" : score > 55 ? "RECON" : "WATCH",
      entry_strategy: strategy,
      liquidity_signal_score: Math.round(liquiditySignal * 100) / 100,
      digital_infra_weakness: Math.round(digitalWeakness * 100) / 100,
      competitor_density: Math.round(compDensity * 100) / 100,
      population_millions: c.pop,
      urbanization_rate: c.urban,
      sequence_rank: 0,
      timing_window: score > 75 ? "IMMEDIATE" : score > 60 ? "NEXT_QUARTER" : score > 45 ? "H2" : "MONITOR",
      dominance_compounding_factor: 1 + (score / 200),
      estimated_capture_months: Math.round(36 - score * 0.3),
      market_size_usd_m: c.mktSize,
      _score: score,
    };
  })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map((c, i) => ({ ...c, sequence_rank: i + 1, _score: undefined }));

  const { error } = await client.from("gpws_market_invasion").upsert(
    ranked.map((r) => ({ ...r })),
    { onConflict: "id" }
  );
  if (error) throw error;

  await client.from("ai_event_signals").insert({
    event_type: "gpws_engine_cycle",
    entity_type: "gpws",
    entity_id: "invasion",
    priority_level: "normal",
    payload: { mode: "sequence_invasion", markets_sequenced: ranked.length },
  });

  return { markets_sequenced: ranked.length, top_target: ranked[0]?.city, strategy };
}

async function formBeachhead(client: ReturnType<typeof sb>, params: Record<string, unknown>) {
  const city = (params.city as string) || "Bandung";
  const country = (params.country as string) || "Indonesia";

  const premiumListings = 10 + Math.floor(Math.random() * 40);
  const anchorAgents = 3 + Math.floor(Math.random() * 12);
  const anchorDevs = 1 + Math.floor(Math.random() * 5);
  const demandPerception = 20 + Math.random() * 60;
  const networkIgnition = 15 + Math.random() * 70;
  const brandAwareness = 5 + Math.random() * 30;
  const strength = (premiumListings * 0.2 + anchorAgents * 2 + anchorDevs * 5 + demandPerception * 0.3 + networkIgnition * 0.3);

  const record = {
    city, country,
    beachhead_phase: strength > 60 ? "ESTABLISHED" : strength > 35 ? "GROWING" : "SEEDING",
    premium_listings_seeded: premiumListings,
    anchor_agents_recruited: anchorAgents,
    anchor_developers_recruited: anchorDevs,
    investor_demand_perception: Math.round(demandPerception * 100) / 100,
    network_effect_ignition_score: Math.round(networkIgnition * 100) / 100,
    local_brand_awareness_pct: Math.round(brandAwareness * 100) / 100,
    content_pieces_published: 5 + Math.floor(Math.random() * 20),
    strategic_partnerships: Math.floor(Math.random() * 5),
    time_to_critical_mass_weeks: Math.round(24 - strength * 0.3),
    beachhead_strength_score: Math.round(strength * 100) / 100,
  };

  const { error } = await client.from("gpws_beachhead").insert(record);
  if (error) throw error;

  return { city, beachhead_strength: record.beachhead_strength_score, phase: record.beachhead_phase };
}

async function mapBattlefield(client: ReturnType<typeof sb>, params: Record<string, unknown>) {
  const city = (params.city as string) || "Jakarta";
  const competitors = [
    { name: "Rumah123", type: "PORTAL", strength: 70, share: 25, digital: 65, listings: 50000 },
    { name: "OLX Properti", type: "PORTAL", strength: 55, share: 15, digital: 50, listings: 30000 },
    { name: "Ray White ID", type: "BROKER_NETWORK", strength: 60, share: 10, digital: 40, listings: 8000 },
    { name: "Lamudi", type: "PORTAL", strength: 45, share: 8, digital: 55, listings: 15000 },
    { name: "Pinhome", type: "FINTECH", strength: 50, share: 5, digital: 70, listings: 5000 },
    { name: "Local Devs", type: "DEVELOPER_PLATFORM", strength: 35, share: 12, digital: 25, listings: 2000 },
  ];

  const records = competitors.map((c) => {
    const vulnerability = 100 - c.strength + (100 - c.digital) * 0.3;
    const ourAdv = vulnerability * 0.5 + (100 - c.digital) * 0.3 + Math.random() * 20;
    return {
      city, country: "Indonesia", competitor_name: c.name,
      competitor_type: c.type,
      competitor_strength_score: c.strength,
      market_share_pct: c.share,
      digital_maturity_score: c.digital,
      listing_volume: c.listings,
      investor_base_size: Math.floor(c.listings * 0.1),
      vulnerability_score: Math.round(vulnerability * 100) / 100,
      our_advantage_score: Math.round(ourAdv * 100) / 100,
      displacement_strategy: vulnerability > 50 ? "AGGRESSIVE_DISPLACEMENT" : "FLANKING_NICHE",
      displacement_timeline_months: Math.round(24 - vulnerability * 0.15),
    };
  });

  const { error } = await client.from("gpws_battlefield").insert(records);
  if (error) throw error;

  return { city, competitors_mapped: records.length, weakest: records.sort((a, b) => b.vulnerability_score - a.vulnerability_score)[0]?.competitor_name };
}

async function buildDataSupremacy(client: ReturnType<typeof sb>) {
  const domains = [
    { domain: "pricing_intelligence", type: "PRICING_INTEL", points: 2500000, gap: 65, accuracy: 87 },
    { domain: "investor_behavior", type: "BEHAVIORAL", points: 1800000, gap: 80, accuracy: 72 },
    { domain: "market_prediction", type: "PREDICTIVE", points: 500000, gap: 90, accuracy: 68 },
    { domain: "transaction_history", type: "TRANSACTION", points: 350000, gap: 55, accuracy: 95 },
    { domain: "geospatial_heat", type: "GEOSPATIAL", points: 4000000, gap: 70, accuracy: 82 },
    { domain: "sentiment_signals", type: "SENTIMENT", points: 900000, gap: 85, accuracy: 61 },
  ];

  const records = domains.map((d) => {
    const moatDepth = d.gap * 0.4 + d.accuracy * 0.3 + Math.min(d.points / 100000, 30) * 0.3;
    const replicationDiff = moatDepth * 0.8 + d.gap * 0.2;
    return {
      domain: d.domain,
      data_asset_type: d.type,
      proprietary_data_points: d.points,
      competitor_data_gap_pct: d.gap,
      moat_depth_score: Math.round(moatDepth * 100) / 100,
      prediction_accuracy_pct: d.accuracy,
      data_freshness_hours: 1 + Math.random() * 24,
      monetization_potential_usd: Math.round(d.points * 0.01),
      compounding_rate: 1.02 + Math.random() * 0.08,
      replication_difficulty: Math.round(replicationDiff * 100) / 100,
      strategic_value_tier: moatDepth > 65 ? "CRITICAL" : moatDepth > 50 ? "HIGH" : "MEDIUM",
    };
  });

  const { error } = await client.from("gpws_data_supremacy").insert(records);
  if (error) throw error;

  const critical = records.filter((r) => r.strategic_value_tier === "CRITICAL").length;
  return { domains_analyzed: records.length, critical_assets: critical, total_data_points: domains.reduce((s, d) => s + d.points, 0) };
}

async function computeMomentum(client: ReturnType<typeof sb>) {
  const cities = ["Jakarta", "Bali", "Surabaya", "Bandung", "Yogyakarta", "Makassar", "Medan"];
  const records = cities.map((city) => {
    const listings = 100 + Math.floor(Math.random() * 5000);
    const investors = Math.floor(listings * (0.05 + Math.random() * 0.15));
    const deals = Math.floor(investors * (0.1 + Math.random() * 0.3));
    const dataPoints = listings * 50 + investors * 200 + deals * 1000;
    const intelAdv = 20 + Math.random() * 80;
    const rpm = (listings * 0.1 + investors * 0.5 + deals * 2 + intelAdv * 0.3);
    const viral = 0.5 + Math.random() * 1.5;
    const gapRate = Math.random() * 15;

    let phase: string;
    if (rpm > 400) phase = "UNSTOPPABLE";
    else if (rpm > 250) phase = "DOMINANT";
    else if (rpm > 150) phase = "COMPOUNDING";
    else if (rpm > 80) phase = "ACCELERATING";
    else phase = "IGNITION";

    return {
      city, country: "Indonesia",
      listings_count: listings,
      investor_count: investors,
      deal_velocity_monthly: deals,
      data_points_generated: dataPoints,
      intelligence_advantage_score: Math.round(intelAdv * 100) / 100,
      flywheel_rpm: Math.round(rpm * 100) / 100,
      momentum_phase: phase,
      network_density: Math.round((investors / Math.max(listings, 1)) * 100) / 100,
      viral_coefficient: Math.round(viral * 100) / 100,
      competitor_gap_widening_rate: Math.round(gapRate * 100) / 100,
      time_to_dominance_months: phase === "UNSTOPPABLE" ? 0 : Math.round(24 - rpm * 0.04),
    };
  });

  const { error } = await client.from("gpws_expansion_momentum").insert(records);
  if (error) throw error;

  const dominant = records.filter((r) => ["DOMINANT", "UNSTOPPABLE"].includes(r.momentum_phase)).length;
  return { cities_computed: records.length, dominant, avg_rpm: Math.round(records.reduce((s, r) => s + r.flywheel_rpm, 0) / records.length) };
}

async function dashboard(client: ReturnType<typeof sb>) {
  const [invasion, beachhead, battlefield, data, momentum] = await Promise.all([
    client.from("gpws_market_invasion").select("*").order("sequence_rank").limit(15),
    client.from("gpws_beachhead").select("*").order("beachhead_strength_score", { ascending: false }).limit(10),
    client.from("gpws_battlefield").select("*").order("vulnerability_score", { ascending: false }).limit(20),
    client.from("gpws_data_supremacy").select("*").order("moat_depth_score", { ascending: false }).limit(10),
    client.from("gpws_expansion_momentum").select("*").order("flywheel_rpm", { ascending: false }).limit(10),
  ]);

  const invasionData = invasion.data ?? [];
  const momentumData = momentum.data ?? [];
  const dataAssets = data.data ?? [];

  return {
    data: {
      summary: {
        markets_in_pipeline: invasionData.length,
        immediate_targets: invasionData.filter((i: any) => i.timing_window === "IMMEDIATE").length,
        beachheads_active: (beachhead.data ?? []).length,
        competitors_mapped: (battlefield.data ?? []).length,
        data_moat_assets: dataAssets.length,
        dominant_cities: momentumData.filter((m: any) => ["DOMINANT", "UNSTOPPABLE"].includes(m.momentum_phase)).length,
        avg_flywheel_rpm: momentumData.length ? Math.round(momentumData.reduce((s: number, m: any) => s + (m.flywheel_rpm || 0), 0) / momentumData.length) : 0,
        total_data_points: dataAssets.reduce((s: number, d: any) => s + (d.proprietary_data_points || 0), 0),
      },
      invasion_sequence: invasionData,
      beachheads: beachhead.data ?? [],
      battlefield: battlefield.data ?? [],
      data_supremacy: dataAssets,
      momentum: momentumData,
    },
  };
}

// ── Main Handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, params = {} } = await req.json();
    const client = sb();

    switch (mode) {
      case "dashboard": return json(await dashboard(client));
      case "sequence_invasion": return json(await sequenceInvasion(client, params));
      case "form_beachhead": return json(await formBeachhead(client, params));
      case "map_battlefield": return json(await mapBattlefield(client, params));
      case "build_data_supremacy": return json(await buildDataSupremacy(client));
      case "compute_momentum": return json(await computeMomentum(client));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
