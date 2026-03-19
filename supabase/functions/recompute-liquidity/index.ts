import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Signal weights for liquidity computation
const SIGNAL_WEIGHTS = {
  viewing: 0.10,
  offer: 0.25,
  escrow: 0.35,
  closed: 0.30,
};

// Grade thresholds
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
    const mode = body.mode || "full"; // "full" | "property" | "district"
    const targetPropertyId = body.property_id;
    const targetDistrict = body.district;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const nowISO = now.toISOString();

    // ============================================================
    // 1. DISTRICT-LEVEL METRICS
    // ============================================================
    if (mode === "full" || mode === "district") {
      // Get active properties grouped by city + property_type
      const { data: properties } = await admin
        .from("properties")
        .select("id, city, property_type, status, created_at")
        .in("status", ["active", "sold", "rented", "under_contract"]);

      if (!properties || properties.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No properties to compute", metrics_updated: 0 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Group properties by district+segment
      const segments = new Map<string, { district: string; segment: string; propertyIds: string[] }>();
      for (const p of properties) {
        const district = p.city || "Unknown";
        const segment = p.property_type || "villa";
        const key = `${district}::${segment}`;
        if (!segments.has(key)) {
          segments.set(key, { district, segment, propertyIds: [] });
        }
        segments.get(key)!.propertyIds.push(p.id);
      }

      // Fetch 30-day signals in bulk
      const allPropertyIds = properties.map((p: any) => p.id);

      const [viewingsRes, offersRes, escrowRes] = await Promise.all([
        admin
          .from("property_viewings")
          .select("property_id, status, scheduled_at, completed_at, created_at")
          .in("property_id", allPropertyIds.slice(0, 500))
          .gte("created_at", thirtyDaysAgo),
        admin
          .from("property_offers")
          .select("property_id, status, deal_stage, created_at, deal_closed_at, accepted_at")
          .in("property_id", allPropertyIds.slice(0, 500))
          .gte("created_at", thirtyDaysAgo),
        admin
          .from("escrow_transactions")
          .select("property_id, status, created_at")
          .in("property_id", allPropertyIds.slice(0, 500))
          .gte("created_at", thirtyDaysAgo),
      ]);

      const viewings = viewingsRes.data || [];
      const offers = offersRes.data || [];
      const escrows = escrowRes.data || [];

      // Index signals by property
      const viewingsByProp = new Map<string, any[]>();
      for (const v of viewings) {
        if (!viewingsByProp.has(v.property_id)) viewingsByProp.set(v.property_id, []);
        viewingsByProp.get(v.property_id)!.push(v);
      }

      const offersByProp = new Map<string, any[]>();
      for (const o of offers) {
        if (!offersByProp.has(o.property_id)) offersByProp.set(o.property_id, []);
        offersByProp.get(o.property_id)!.push(o);
      }

      const escrowsByProp = new Map<string, any[]>();
      for (const e of escrows) {
        if (!escrowsByProp.has(e.property_id)) escrowsByProp.set(e.property_id, []);
        escrowsByProp.get(e.property_id)!.push(e);
      }

      let metricsUpdated = 0;

      for (const [_key, seg] of segments) {
        if (targetDistrict && seg.district !== targetDistrict) continue;

        let totalViewings = 0;
        let totalOffers = 0;
        let totalEscrows = 0;
        let totalClosed = 0;
        let daysToOfferSum = 0;
        let daysToOfferCount = 0;
        let daysToCloseSum = 0;
        let daysToCloseCount = 0;
        const activeListings = seg.propertyIds.length;

        for (const pid of seg.propertyIds) {
          const pv = viewingsByProp.get(pid) || [];
          const po = offersByProp.get(pid) || [];
          const pe = escrowsByProp.get(pid) || [];

          totalViewings += pv.length;
          totalOffers += po.length;
          totalEscrows += pe.length;

          for (const o of po) {
            if (o.deal_stage === "closed" || o.status === "completed") {
              totalClosed++;
              if (o.deal_closed_at && o.created_at) {
                const days = (new Date(o.deal_closed_at).getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24);
                daysToCloseSum += days;
                daysToCloseCount++;
              }
            }
            if (o.created_at) {
              // First offer days calculation (from property creation to first offer)
              const prop = properties.find((p: any) => p.id === pid);
              if (prop) {
                const days = (new Date(o.created_at).getTime() - new Date(prop.created_at).getTime()) / (1000 * 60 * 60 * 24);
                if (days > 0) {
                  daysToOfferSum += days;
                  daysToOfferCount++;
                }
              }
            }
          }
        }

        // Compute composite scores (0-100 scale)
        const maxViewingsNorm = Math.min(totalViewings / Math.max(activeListings, 1) * 10, 100);
        const offerConvRate = activeListings > 0 ? (totalOffers / activeListings) * 100 : 0;
        const closeProb = totalOffers > 0 ? (totalClosed / totalOffers) * 100 : 0;
        const absorptionRate = activeListings > 0 ? (totalClosed / activeListings) * 100 : 0;
        const supplyDemandRatio = totalOffers > 0 ? activeListings / totalOffers : activeListings;

        // Weighted Liquidity Strength Index
        const viewingScore = Math.min(maxViewingsNorm, 100);
        const offerScore = Math.min(offerConvRate, 100);
        const escrowScore = Math.min(totalEscrows > 0 ? (totalEscrows / Math.max(totalOffers, 1)) * 100 : 0, 100);
        const closedScore = Math.min(closeProb, 100);

        const liquidityIndex = Math.round(
          viewingScore * SIGNAL_WEIGHTS.viewing +
          offerScore * SIGNAL_WEIGHTS.offer +
          escrowScore * SIGNAL_WEIGHTS.escrow +
          closedScore * SIGNAL_WEIGHTS.closed
        );

        // Get previous value for momentum
        const { data: prev } = await admin
          .from("market_liquidity_metrics")
          .select("liquidity_strength_index")
          .eq("district", seg.district)
          .eq("segment_type", seg.segment)
          .maybeSingle();

        const prevIndex = prev?.liquidity_strength_index || 0;

        const { error: upsertErr } = await admin
          .from("market_liquidity_metrics")
          .upsert(
            {
              district: seg.district,
              segment_type: seg.segment,
              viewing_velocity_score: Math.round(viewingScore),
              offer_conversion_score: Math.round(offerScore),
              avg_days_to_offer: daysToOfferCount > 0 ? Math.round(daysToOfferSum / daysToOfferCount) : 0,
              avg_days_to_close: daysToCloseCount > 0 ? Math.round(daysToCloseSum / daysToCloseCount) : 0,
              deal_close_probability: Math.round(closeProb),
              viewing_count_30d: totalViewings,
              offer_count_30d: totalOffers,
              escrow_count_30d: totalEscrows,
              closed_count_30d: totalClosed,
              active_listings: activeListings,
              absorption_rate: Math.round(absorptionRate * 100) / 100,
              supply_demand_ratio: Math.round(supplyDemandRatio * 100) / 100,
              liquidity_strength_index: liquidityIndex,
              momentum_trend: momentumTrend(liquidityIndex, prevIndex),
              last_recalculated_at: nowISO,
              updated_at: nowISO,
            },
            { onConflict: "district,segment_type" }
          );

        if (!upsertErr) metricsUpdated++;
      }

      // ============================================================
      // 2. PER-PROPERTY LIQUIDITY SCORES
      // ============================================================
      let propScoresUpdated = 0;
      const activeProps = properties.filter((p: any) => p.status === "active");

      for (const prop of activeProps.slice(0, 200)) {
        const pv = viewingsByProp.get(prop.id) || [];
        const po = offersByProp.get(prop.id) || [];
        const pe = escrowsByProp.get(prop.id) || [];

        const daysOnMarket = Math.max(
          1,
          Math.floor((now.getTime() - new Date(prop.created_at).getTime()) / (1000 * 60 * 60 * 24))
        );

        const viewVelocity = Math.min((pv.length / daysOnMarket) * 30 * 10, 100);
        const offerMomentum = Math.min(po.length * 25, 100);
        const inquiryIntensity = Math.min((pv.length + po.length) * 8, 100);
        const priceComp = pe.length > 0 ? 80 : po.length > 0 ? 50 : 20;

        const propLiquidity = Math.round(
          viewVelocity * SIGNAL_WEIGHTS.viewing +
          offerMomentum * SIGNAL_WEIGHTS.offer +
          (pe.length > 0 ? 80 : 0) * SIGNAL_WEIGHTS.escrow +
          priceComp * SIGNAL_WEIGHTS.closed
        );

        const lastSignal = [...pv, ...po, ...pe]
          .map((s: any) => s.created_at)
          .sort()
          .pop();

        await admin.from("property_liquidity_scores").upsert(
          {
            property_id: prop.id,
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
        propScoresUpdated++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          district_metrics_updated: metricsUpdated,
          property_scores_updated: propScoresUpdated,
          computed_at: nowISO,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single property mode
    if (mode === "property" && targetPropertyId) {
      // Lightweight single-property recalculation could be added here
      return new Response(
        JSON.stringify({ success: true, message: "Single property mode - use full recompute for now" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid mode. Use: full, district, or property" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
