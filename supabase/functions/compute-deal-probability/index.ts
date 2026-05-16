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

    // ── 1. Fetch active listings ──────────────────────────────────────────
    const { data: listings } = await supabase
      .from("properties")
      .select("id, city, price, status, created_at")
      .eq("status", "active")
      .limit(500);

    if (!listings?.length) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No active listings" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const propertyIds = listings.map((l: any) => l.id);

    // ── 2. Aggregate signals in parallel ──────────────────────────────────
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Behavioral events per property (views, saves, inquiries)
    const { data: behaviorAgg } = await supabase
      .from("ai_behavior_tracking")
      .select("property_id, event_type")
      .in("property_id", propertyIds)
      .gte("created_at", thirtyDaysAgo);

    // Investor intent scores
    const { data: intentScores } = await supabase
      .from("investor_intent_scores" as any)
      .select("property_id, intent_score")
      .in("property_id", propertyIds);

    // Liquidity metrics by city
    const { data: liquidityMetrics } = await supabase
      .from("liquidity_metrics_daily" as any)
      .select("city, liquidity_velocity_score")
      .order("date", { ascending: false })
      .limit(200);

    // ── 3. Build signal maps ──────────────────────────────────────────────
    const behaviorMap: Record<string, { views: number; saves: number; inquiries: number; negotiations: number }> = {};
    for (const ev of behaviorAgg || []) {
      const pid = ev.property_id;
      if (!pid) continue;
      if (!behaviorMap[pid]) behaviorMap[pid] = { views: 0, saves: 0, inquiries: 0, negotiations: 0 };
      if (ev.event_type === "view") behaviorMap[pid].views++;
      else if (ev.event_type === "save") behaviorMap[pid].saves++;
      else if (ev.event_type === "inquiry") behaviorMap[pid].inquiries++;
      else if (ev.event_type === "negotiation_open") behaviorMap[pid].negotiations++;
    }

    const intentMap: Record<string, number[]> = {};
    for (const i of intentScores || []) {
      if (!i.property_id) continue;
      if (!intentMap[i.property_id]) intentMap[i.property_id] = [];
      intentMap[i.property_id].push(Number(i.intent_score) || 0);
    }

    const liquidityMap: Record<string, number> = {};
    for (const lm of liquidityMetrics || []) {
      if (!liquidityMap[lm.city]) liquidityMap[lm.city] = Number(lm.liquidity_velocity_score) || 50;
    }

    // ── 4. Scoring weights ────────────────────────────────────────────────
    const W = {
      demand: 0.20,
      intent: 0.20,
      inquiry: 0.15,
      negotiation: 0.15,
      pricing: 0.10,
      liquidity: 0.10,
      seller: 0.10,
    };

    const BASELINE_DAYS = 90;

    // ── 5. Compute per listing ────────────────────────────────────────────
    const scores: any[] = [];

    for (const listing of listings) {
      const beh = behaviorMap[listing.id] || { views: 0, saves: 0, inquiries: 0, negotiations: 0 };

      // Demand signal: normalize views+saves (cap at 100)
      const demandRaw = Math.min(beh.views * 1 + beh.saves * 3, 100);
      const demandSignal = demandRaw;

      // Intent density: avg intent scores for this property
      const intents = intentMap[listing.id] || [];
      const intentDensity = intents.length > 0
        ? Math.min(intents.reduce((a, b) => a + b, 0) / intents.length, 100)
        : 0;

      // Inquiry velocity: inquiries in 30d normalized
      const inquiryVelocity = Math.min(beh.inquiries * 10, 100);

      // Negotiation activity
      const negotiationActivity = Math.min(beh.negotiations * 20, 100);

      // Pricing alignment: placeholder — use 60 as neutral (requires price signal comparison)
      const pricingAlignment = 60;

      // Liquidity zone
      const liquidityZone = liquidityMap[listing.city] || 50;

      // Seller flexibility: newer listings get slight boost (proxy for motivation)
      const listingAgeDays = (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const sellerFlex = listingAgeDays < 30 ? 70 : listingAgeDays < 60 ? 55 : listingAgeDays < 90 ? 40 : 25;

      // Composite score
      const rawScore =
        W.demand * demandSignal +
        W.intent * intentDensity +
        W.inquiry * inquiryVelocity +
        W.negotiation * negotiationActivity +
        W.pricing * pricingAlignment +
        W.liquidity * liquidityZone +
        W.seller * sellerFlex;

      const probability = Math.round(Math.min(Math.max(rawScore, 0), 100));
      const predictedDays = Math.round(BASELINE_DAYS * (1 - probability / 100));

      // Confidence: higher when more data points exist
      const dataPoints = (beh.views > 0 ? 1 : 0) + (beh.saves > 0 ? 1 : 0) +
        (beh.inquiries > 0 ? 1 : 0) + (intents.length > 0 ? 1 : 0) +
        (liquidityMap[listing.city] ? 1 : 0);
      const confidence = Math.min(dataPoints * 20, 100);

      scores.push({
        property_id: listing.id,
        city: listing.city,
        listing_price: listing.price,
        demand_signal_score: demandSignal,
        investor_intent_density: intentDensity,
        inquiry_velocity: inquiryVelocity,
        viewing_frequency: beh.views,
        negotiation_activity_level: negotiationActivity,
        pricing_alignment_score: pricingAlignment,
        liquidity_zone_score: liquidityZone,
        seller_flexibility_index: sellerFlex,
        overall_close_probability: probability,
        predicted_days_to_close: predictedDays,
        confidence_level: confidence,
        computed_at: new Date().toISOString(),
      });
    }

    // ── 6. Batch upsert in chunks of 50 ──────────────────────────────────
    let upserted = 0;
    for (let i = 0; i < scores.length; i += 50) {
      const chunk = scores.slice(i, i + 50);
      const { error } = await supabase
        .from("deal_probability_scores")
        .upsert(chunk, { onConflict: "property_id" });
      if (!error) upserted += chunk.length;
    }

    // ── 7. Summary for copilot ────────────────────────────────────────────
    const topClosable = scores
      .sort((a, b) => b.overall_close_probability - a.overall_close_probability)
      .slice(0, 5);

    const avgProbability = scores.length > 0
      ? Math.round(scores.reduce((s, x) => s + x.overall_close_probability, 0) / scores.length)
      : 0;

    const urgentPricing = scores.filter(
      (s) => s.overall_close_probability < 30 && s.demand_signal_score > 50
    ).length;

    return new Response(
      JSON.stringify({
        processed: upserted,
        avg_probability: avgProbability,
        top_closable: topClosable.map((t) => ({
          property_id: t.property_id,
          city: t.city,
          probability: t.overall_close_probability,
          predicted_days: t.predicted_days_to_close,
        })),
        urgent_pricing_action: urgentPricing,
        summary: `Deal Momentum: avg ${avgProbability}% close probability across ${scores.length} listings. ${topClosable.length} high-probability deals identified. ${urgentPricing} listings need pricing action.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
