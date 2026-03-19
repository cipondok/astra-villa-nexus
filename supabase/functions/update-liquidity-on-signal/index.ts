import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SIGNAL_WEIGHTS: Record<string, number> = {
  viewing_scheduled: 0.05,
  viewing_completed: 0.10,
  viewing_updated: 0.05,
  offer_created: 0.25,
  escrow_initiated: 0.35,
  escrow_completed: 0.35,
  deal_closed: 0.30,
};

function liquidityGrade(score: number): string {
  if (score >= 85) return "A+";
  if (score >= 70) return "A";
  if (score >= 55) return "B";
  if (score >= 40) return "C";
  if (score >= 25) return "D";
  return "F";
}

function momentumTrend(current: number, previous: number): string {
  const delta = current - previous;
  if (delta > 10) return "accelerating";
  if (delta > 3) return "rising";
  if (delta > -3) return "stable";
  if (delta > -10) return "declining";
  return "cooling";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size || 50;

    // 1. Claim unprocessed signals
    const { data: signals, error: fetchErr } = await admin
      .from("liquidity_signal_queue")
      .select("*")
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(batchSize);

    if (fetchErr) throw fetchErr;
    if (!signals || signals.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No pending signals" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const signalIds = signals.map((s: any) => s.id);

    // Mark as processed immediately to prevent double-processing
    await admin
      .from("liquidity_signal_queue")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .in("id", signalIds);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const nowISO = now.toISOString();

    // 2. Group signals by property and district
    const affectedProperties = new Set<string>();
    const affectedDistricts = new Map<string, string>(); // district -> segment

    for (const sig of signals) {
      if (sig.property_id) affectedProperties.add(sig.property_id);
      if (sig.district && sig.segment_type) {
        affectedDistricts.set(`${sig.district}::${sig.segment_type}`, sig.segment_type);
      }
    }

    let propUpdated = 0;
    let districtUpdated = 0;

    // 3. Incrementally update each affected property
    for (const propertyId of affectedProperties) {
      const [propRes, viewRes, offerRes, escrowRes] = await Promise.all([
        admin.from("properties").select("id, city, property_type, status, created_at").eq("id", propertyId).single(),
        admin.from("property_viewings").select("id, status, created_at").eq("property_id", propertyId).gte("created_at", thirtyDaysAgo),
        admin.from("property_offers").select("id, status, deal_stage, created_at").eq("property_id", propertyId).gte("created_at", thirtyDaysAgo),
        admin.from("escrow_transactions").select("id, status, created_at").eq("property_id", propertyId).gte("created_at", thirtyDaysAgo),
      ]);

      const prop = propRes.data;
      if (!prop) continue;

      const viewings = viewRes.data || [];
      const offers = offerRes.data || [];
      const escrows = escrowRes.data || [];

      const daysOnMarket = Math.max(
        1,
        Math.floor((now.getTime() - new Date(prop.created_at).getTime()) / (1000 * 60 * 60 * 24))
      );

      const viewVelocity = Math.min((viewings.length / daysOnMarket) * 30 * 10, 100);
      const offerMomentum = Math.min(offers.length * 25, 100);
      const inquiryIntensity = Math.min((viewings.length + offers.length) * 8, 100);
      const priceComp = escrows.length > 0 ? 80 : offers.length > 0 ? 50 : 20;

      const propLiquidity = Math.round(
        viewVelocity * 0.10 +
        offerMomentum * 0.25 +
        (escrows.length > 0 ? 80 : 0) * 0.35 +
        priceComp * 0.30
      );

      const lastSignal = [...viewings, ...offers, ...escrows]
        .map((s: any) => s.created_at)
        .sort()
        .pop();

      const { error } = await admin.from("property_liquidity_scores").upsert(
        {
          property_id: propertyId,
          viewing_velocity: Math.round(viewVelocity),
          offer_momentum: Math.round(offerMomentum),
          inquiry_intensity: Math.round(inquiryIntensity),
          price_competitiveness: priceComp,
          days_on_market: daysOnMarket,
          liquidity_score: propLiquidity,
          liquidity_grade: liquidityGrade(propLiquidity),
          last_signal_at: lastSignal || null,
          last_recalculated_at: nowISO,
        },
        { onConflict: "property_id" }
      );

      if (!error) propUpdated++;
    }

    // 4. Lightweight district delta recalculation
    for (const [key] of affectedDistricts) {
      const [district, segment] = key.split("::");

      // Get all properties in this district+segment
      const { data: districtProps } = await admin
        .from("properties")
        .select("id")
        .eq("city", district)
        .eq("property_type", segment)
        .in("status", ["active", "sold", "rented", "under_contract"])
        .limit(500);

      if (!districtProps || districtProps.length === 0) continue;

      const pids = districtProps.map((p: any) => p.id);
      const activeListings = pids.length;

      const [vRes, oRes, eRes] = await Promise.all([
        admin.from("property_viewings").select("id", { count: "exact" }).in("property_id", pids.slice(0, 200)).gte("created_at", thirtyDaysAgo),
        admin.from("property_offers").select("id, deal_stage, status", { count: "exact" }).in("property_id", pids.slice(0, 200)).gte("created_at", thirtyDaysAgo),
        admin.from("escrow_transactions").select("id", { count: "exact" }).in("property_id", pids.slice(0, 200)).gte("created_at", thirtyDaysAgo),
      ]);

      const viewCount = vRes.count || 0;
      const offerCount = oRes.count || 0;
      const escrowCount = eRes.count || 0;
      const closedCount = (oRes.data || []).filter((o: any) => o.deal_stage === "closed").length;

      const viewingScore = Math.min(viewCount / Math.max(activeListings, 1) * 10, 100);
      const offerScore = Math.min(activeListings > 0 ? (offerCount / activeListings) * 100 : 0, 100);
      const escrowScore = Math.min(escrowCount > 0 ? (escrowCount / Math.max(offerCount, 1)) * 100 : 0, 100);
      const closedScore = Math.min(offerCount > 0 ? (closedCount / offerCount) * 100 : 0, 100);

      const liquidityIndex = Math.round(
        viewingScore * 0.10 +
        offerScore * 0.25 +
        escrowScore * 0.35 +
        closedScore * 0.30
      );

      const absorptionRate = activeListings > 0 ? (closedCount / activeListings) * 100 : 0;
      const supplyDemandRatio = offerCount > 0 ? activeListings / offerCount : activeListings;

      // Get previous for momentum
      const { data: prev } = await admin
        .from("market_liquidity_metrics")
        .select("liquidity_strength_index")
        .eq("district", district)
        .eq("segment_type", segment)
        .maybeSingle();

      const prevIndex = prev?.liquidity_strength_index || 0;

      const { error } = await admin.from("market_liquidity_metrics").upsert(
        {
          district,
          segment_type: segment,
          viewing_velocity_score: Math.round(viewingScore),
          offer_conversion_score: Math.round(offerScore),
          viewing_count_30d: viewCount,
          offer_count_30d: offerCount,
          escrow_count_30d: escrowCount,
          closed_count_30d: closedCount,
          active_listings: activeListings,
          absorption_rate: Math.round(absorptionRate * 100) / 100,
          supply_demand_ratio: Math.round(supplyDemandRatio * 100) / 100,
          deal_close_probability: Math.round(closedScore),
          liquidity_strength_index: liquidityIndex,
          momentum_trend: momentumTrend(liquidityIndex, prevIndex),
          last_recalculated_at: nowISO,
          updated_at: nowISO,
        },
        { onConflict: "district,segment_type" }
      );

      if (!error) districtUpdated++;
    }

    // 5. Emit AI signal if high-impact signals processed
    const highImpactSignals = signals.filter(
      (s: any) => ["deal_closed", "escrow_initiated"].includes(s.signal_type)
    );

    if (highImpactSignals.length > 0) {
      await admin.from("ai_event_signals").insert({
        event_type: "liquidity_recalculated",
        entity_type: "market_liquidity_metrics",
        entity_id: null,
        priority_level: "medium",
        payload: {
          properties_updated: propUpdated,
          districts_updated: districtUpdated,
          high_impact_signals: highImpactSignals.length,
          trigger: "incremental",
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        signals_processed: signals.length,
        properties_updated: propUpdated,
        districts_updated: districtUpdated,
        computed_at: nowISO,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
