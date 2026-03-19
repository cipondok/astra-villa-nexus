import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UrbanSignalInput {
  city: string;
  province?: string;
  country?: string;
}

interface ExpansionScoringInput {
  city: string;
  district?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params } = await req.json();

    switch (mode) {
      case "ingest_urban_signals":
        return handleUrbanSignals(supabase, params);
      case "compute_expansion_probability":
        return handleExpansionProbability(supabase, params);
      case "scan_developer_opportunities":
        return handleDeveloperRadar(supabase, params);
      case "sequence_expansion":
        return handleExpansionSequencing(supabase);
      case "dashboard":
        return handleDashboard(supabase);
      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

// ── Urban Growth Signal Ingestion ──
async function handleUrbanSignals(sb: any, params: UrbanSignalInput) {
  const { city, province, country = "Indonesia" } = params ?? {};

  // Fetch marketplace data to derive urban growth signals
  const { data: properties } = await sb
    .from("properties")
    .select("id, city, price, created_at, status")
    .eq("city", city)
    .order("created_at", { ascending: false })
    .limit(500);

  const listings = properties ?? [];
  const recentListings = listings.filter(
    (p: any) =>
      new Date(p.created_at) > new Date(Date.now() - 90 * 86400000)
  );

  // Derive signals from listing velocity
  const listingVelocity = recentListings.length;
  const activeRatio =
    listings.length > 0
      ? listings.filter((p: any) => p.status === "active").length /
        listings.length
      : 0;

  const signals = [];

  // Commercial cluster signal from listing density
  if (listingVelocity > 20) {
    signals.push({
      city,
      province,
      country,
      signal_type: "commercial_cluster",
      signal_strength: Math.min(100, listingVelocity * 2),
      signal_data: {
        listing_velocity_90d: listingVelocity,
        total_listings: listings.length,
      },
      trend_direction:
        listingVelocity > 40
          ? "accelerating"
          : listingVelocity > 10
          ? "stable"
          : "decelerating",
    });
  }

  // Infrastructure investment signal from avg price growth
  if (listings.length > 5) {
    const prices = listings.map((p: any) => p.price).filter(Boolean);
    const avgPrice = prices.reduce((s: number, p: number) => s + p, 0) / prices.length;
    const recentPrices = recentListings
      .map((p: any) => p.price)
      .filter(Boolean);
    const recentAvg =
      recentPrices.length > 0
        ? recentPrices.reduce((s: number, p: number) => s + p, 0) / recentPrices.length
        : avgPrice;

    const priceGrowth =
      avgPrice > 0 ? ((recentAvg - avgPrice) / avgPrice) * 100 : 0;

    signals.push({
      city,
      province,
      country,
      signal_type: "infrastructure_investment",
      signal_strength: Math.min(100, Math.max(0, 50 + priceGrowth * 5)),
      signal_data: {
        avg_price: Math.round(avgPrice),
        recent_avg_price: Math.round(recentAvg),
        price_growth_pct: Math.round(priceGrowth * 100) / 100,
      },
      trend_direction:
        priceGrowth > 5
          ? "accelerating"
          : priceGrowth > 0
          ? "stable"
          : "decelerating",
    });
  }

  // Population migration signal from absorption rate
  if (activeRatio < 0.4 && listings.length > 10) {
    signals.push({
      city,
      province,
      country,
      signal_type: "population_migration",
      signal_strength: Math.min(100, (1 - activeRatio) * 100),
      signal_data: {
        active_ratio: Math.round(activeRatio * 100) / 100,
        absorbed_listings: listings.length - recentListings.length,
      },
      trend_direction: activeRatio < 0.2 ? "accelerating" : "stable",
    });
  }

  // Upsert signals
  for (const signal of signals) {
    await sb.from("city_urban_growth_signals").insert(signal);
  }

  return json({
    data: { city, signals_generated: signals.length, signals },
  });
}

// ── Expansion Probability Index ──
async function handleExpansionProbability(sb: any, params: ExpansionScoringInput) {
  const { city, district } = params ?? {};

  // Gather signals for this city
  const { data: signals } = await sb
    .from("city_urban_growth_signals")
    .select("*")
    .eq("city", city)
    .order("detected_at", { ascending: false })
    .limit(50);

  const { data: supplyData } = await sb
    .from("supply_expansion_targets")
    .select("*")
    .eq("city", city)
    .limit(1);

  const signalList = signals ?? [];
  const supply = supplyData?.[0];

  // Component scores
  const liquidityMomentum = computeSignalAvg(signalList, "commercial_cluster");
  const absorptionAcceleration = computeSignalAvg(signalList, "population_migration");
  const priceSlope = computeSignalAvg(signalList, "infrastructure_investment");
  const investorVelocity = supply
    ? Math.min(100, (supply.current_listings / Math.max(1, supply.target_listings)) * 100)
    : signalList.length * 5;
  const infraScore = computeSignalAvg(signalList, "transit_expansion") || priceSlope * 0.6;
  const popGrowth = computeSignalAvg(signalList, "population_migration") || absorptionAcceleration * 0.8;

  // Composite: weighted formula
  // EP = 0.25*LM + 0.20*AA + 0.20*PAS + 0.15*IEV + 0.10*IS + 0.10*PGS
  const expansionProbability = Math.min(
    100,
    Math.round(
      liquidityMomentum * 0.25 +
        absorptionAcceleration * 0.2 +
        priceSlope * 0.2 +
        investorVelocity * 0.15 +
        infraScore * 0.1 +
        popGrowth * 0.1
    )
  );

  const phase =
    expansionProbability >= 85
      ? "breakout"
      : expansionProbability >= 70
      ? "rapid_growth"
      : expansionProbability >= 55
      ? "momentum_building"
      : expansionProbability >= 40
      ? "early_signal"
      : expansionProbability >= 25
      ? "maturation"
      : "plateau";

  const confidence = Math.min(1, signalList.length / 10);

  const record = {
    city,
    district: district || null,
    liquidity_momentum: liquidityMomentum,
    absorption_acceleration: absorptionAcceleration,
    price_appreciation_slope: priceSlope,
    investor_entry_velocity: investorVelocity,
    infrastructure_score: infraScore,
    population_growth_score: popGrowth,
    expansion_probability: expansionProbability,
    expansion_phase: phase,
    confidence_level: Math.round(confidence * 100) / 100,
    time_horizon_months: 12,
    computed_at: new Date().toISOString(),
  };

  await sb.from("city_expansion_probability").upsert(record, {
    onConflict: "city,district",
  });

  return json({ data: record });
}

// ── Developer Opportunity Radar ──
async function handleDeveloperRadar(sb: any, params: any) {
  const { data: expansionData } = await sb
    .from("city_expansion_probability")
    .select("*")
    .gte("expansion_probability", 40)
    .order("expansion_probability", { ascending: false })
    .limit(20);

  const opportunities = [];

  for (const city of expansionData ?? []) {
    const supplyGap = 100 - city.liquidity_momentum;
    const demandForecast = city.absorption_acceleration * 1.2;

    if (supplyGap > 30) {
      opportunities.push({
        city: city.city,
        district: city.district,
        opportunity_type: "undersupplied_zone",
        opportunity_score: Math.round(
          supplyGap * 0.4 + city.expansion_probability * 0.6
        ),
        supply_deficit_units: Math.round(supplyGap * 10),
        demand_forecast_12m: Math.round(demandForecast * 1000),
        recommended_property_type:
          city.expansion_probability > 70 ? "apartment_complex" : "landed_housing",
        risk_level:
          city.confidence_level > 0.7
            ? "low"
            : city.confidence_level > 0.4
            ? "medium"
            : "high",
        strategy_brief: `${city.city} shows ${city.expansion_phase} phase with ${Math.round(supplyGap)}% supply gap. ${
          city.expansion_probability > 70
            ? "Immediate development recommended."
            : "Monitor and prepare land acquisition."
        }`,
        estimated_roi_pct:
          city.price_appreciation_slope > 60
            ? 25
            : city.price_appreciation_slope > 40
            ? 18
            : 12,
        valid_until: new Date(Date.now() + 90 * 86400000).toISOString(),
      });
    }

    if (city.investor_entry_velocity > 50 && city.price_appreciation_slope < 60) {
      opportunities.push({
        city: city.city,
        district: city.district,
        opportunity_type: "land_banking",
        opportunity_score: Math.round(
          city.investor_entry_velocity * 0.5 +
            (100 - city.price_appreciation_slope) * 0.5
        ),
        demand_forecast_12m: Math.round(demandForecast * 800),
        recommended_property_type: "land_plot",
        risk_level: "medium",
        strategy_brief: `High investor velocity (${Math.round(city.investor_entry_velocity)}) with moderate price appreciation — land banking window before price surge.`,
        estimated_roi_pct: 30,
        valid_until: new Date(Date.now() + 180 * 86400000).toISOString(),
      });
    }
  }

  // Upsert opportunities
  for (const opp of opportunities) {
    await sb.from("city_developer_opportunities").insert(opp);
  }

  return json({
    data: {
      opportunities_found: opportunities.length,
      opportunities,
    },
  });
}

// ── Expansion Sequencing Brain ──
async function handleExpansionSequencing(sb: any) {
  const { data: cities } = await sb
    .from("city_expansion_probability")
    .select("*")
    .order("expansion_probability", { ascending: false })
    .limit(30);

  const { data: supplyTargets } = await sb
    .from("supply_expansion_targets")
    .select("*");

  const supplyMap = new Map(
    (supplyTargets ?? []).map((s: any) => [s.city.toLowerCase(), s])
  );

  const sequences = [];
  let rank = 1;

  for (const city of cities ?? []) {
    const supply = supplyMap.get(city.city.toLowerCase()) as any;

    const capitalInflow = city.investor_entry_velocity * 0.6 + city.liquidity_momentum * 0.4;
    const maturity = supply
      ? Math.min(100, (supply.current_listings / Math.max(1, supply.target_listings)) * 100)
      : city.liquidity_momentum * 0.5;
    const regulatory = 65; // baseline for Indonesia
    const digital = supply ? Math.min(100, supply.current_agents * 10) : 40;
    const vendorDepth = supply
      ? Math.min(100, ((supply.current_agents || 0) / Math.max(1, supply.target_agents)) * 100)
      : 30;

    const composite = Math.round(
      capitalInflow * 0.3 +
        maturity * 0.2 +
        regulatory * 0.15 +
        digital * 0.15 +
        vendorDepth * 0.2
    );

    const timing =
      composite >= 80
        ? "immediate"
        : composite >= 65
        ? "q1_next"
        : composite >= 50
        ? "q2_next"
        : composite >= 35
        ? "h2_next"
        : "monitor";

    sequences.push({
      city: city.city,
      country: city.country || "Indonesia",
      capital_inflow_potential: Math.round(capitalInflow),
      market_maturity: Math.round(maturity),
      regulatory_openness: regulatory,
      digital_readiness: Math.round(digital),
      vendor_ecosystem_depth: Math.round(vendorDepth),
      sequence_rank: rank++,
      composite_score: composite,
      recommended_entry_timing: timing,
      entry_strategy:
        timing === "immediate"
          ? "Demand-led blitz: activate agent network, launch geo-targeted campaigns, seed 50 listings in 30 days."
          : timing === "q1_next"
          ? "Supply-first: recruit 10 anchor agents, build 30-listing base, then activate demand."
          : "Monitor: track signal progression, prepare vendor partnerships for activation trigger.",
      vendor_activation_plan:
        vendorDepth > 60
          ? "Existing ecosystem sufficient — focus on premium vendor onboarding."
          : "Build vendor network: target property inspectors, photographers, legal partners.",
      capital_deployment_strategy:
        capitalInflow > 70
          ? "Aggressive: deploy marketing budget immediately, investor acquisition campaigns."
          : "Conservative: minimal spend, focus on organic listing growth and agent referrals.",
      computed_at: new Date().toISOString(),
    });
  }

  for (const seq of sequences) {
    await sb.from("city_expansion_sequencing").upsert(seq, {
      onConflict: "city,country",
    });
  }

  // Emit engine cycle event
  await sb.from("ai_event_signals").insert({
    event_type: "city_expansion_engine_cycle",
    entity_type: "system",
    priority_level: "normal",
    payload: {
      cities_sequenced: sequences.length,
      immediate_entries: sequences.filter((s: any) => s.recommended_entry_timing === "immediate").length,
      top_city: sequences[0]?.city,
      top_score: sequences[0]?.composite_score,
    },
  });

  return json({
    data: {
      cities_sequenced: sequences.length,
      sequences,
    },
  });
}

// ── Dashboard Aggregate ──
async function handleDashboard(sb: any) {
  const [signalsRes, expansionRes, oppsRes, seqRes] = await Promise.all([
    sb
      .from("city_urban_growth_signals")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(50),
    sb
      .from("city_expansion_probability")
      .select("*")
      .order("expansion_probability", { ascending: false })
      .limit(20),
    sb
      .from("city_developer_opportunities")
      .select("*")
      .order("opportunity_score", { ascending: false })
      .limit(15),
    sb
      .from("city_expansion_sequencing")
      .select("*")
      .order("sequence_rank")
      .limit(20),
  ]);

  const expansions = expansionRes.data ?? [];
  const breakouts = expansions.filter(
    (e: any) => e.expansion_phase === "breakout" || e.expansion_phase === "rapid_growth"
  );

  return json({
    data: {
      summary: {
        total_signals: (signalsRes.data ?? []).length,
        cities_tracked: new Set(expansions.map((e: any) => e.city)).size,
        breakout_cities: breakouts.length,
        developer_opportunities: (oppsRes.data ?? []).length,
        top_expansion_city: expansions[0]?.city ?? "N/A",
        top_expansion_score: expansions[0]?.expansion_probability ?? 0,
        immediate_entries: (seqRes.data ?? []).filter(
          (s: any) => s.recommended_entry_timing === "immediate"
        ).length,
      },
      recent_signals: signalsRes.data ?? [],
      expansion_index: expansions,
      developer_opportunities: oppsRes.data ?? [],
      expansion_sequence: seqRes.data ?? [],
    },
  });
}

// ── Helpers ──
function computeSignalAvg(signals: any[], type: string): number {
  const filtered = signals.filter((s: any) => s.signal_type === type);
  if (filtered.length === 0) return 0;
  return Math.round(
    filtered.reduce((s: number, sig: any) => s + Number(sig.signal_strength), 0) /
      filtered.length
  );
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
