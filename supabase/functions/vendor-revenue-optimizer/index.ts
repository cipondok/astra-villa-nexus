import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VendorRevenueInput {
  avg_response_minutes: number;
  acceptance_rate: number;
  rating: number;
  total_reviews: number;
  total_deals_closed: number;
  total_leads_received: number;
  is_premium: boolean;
  tarif_min: number;
  tarif_max: number;
  category_demand_index: number;
  district_demand_index: number;
}

function computeRevenuePotential(v: VendorRevenueInput) {
  // Response speed score (0-100): <15min = 100, >120min = 0
  const speedScore = Math.max(0, Math.min(100, 100 - (v.avg_response_minutes / 120) * 100));

  // Acceptance reliability (0-100)
  const acceptScore = v.acceptance_rate * 100;

  // Reputation score
  const repScore = Math.min(100, (v.rating / 5) * 70 + Math.min(30, v.total_reviews / 3));

  // Conversion efficiency
  const convRate = v.total_leads_received > 0
    ? v.total_deals_closed / v.total_leads_received
    : 0;
  const convScore = Math.min(100, convRate * 200);

  // Demand alignment
  const demandScore = (v.category_demand_index + v.district_demand_index) / 2;

  // Premium multiplier
  const premiumMult = v.is_premium ? 1.15 : 1.0;

  // Weighted composite
  const raw =
    speedScore * 0.2 +
    acceptScore * 0.15 +
    repScore * 0.25 +
    convScore * 0.2 +
    demandScore * 0.2;

  const revenuePotentialScore = Math.round(Math.min(100, raw * premiumMult));

  // Price adjustment recommendation
  let priceAdjustment: string;
  if (convRate > 0.15 && demandScore > 70) {
    priceAdjustment = "increase_10pct";
  } else if (convRate < 0.05 && v.rating < 3.5) {
    priceAdjustment = "decrease_15pct";
  } else if (convRate > 0.08) {
    priceAdjustment = "increase_5pct";
  } else {
    priceAdjustment = "hold";
  }

  // Lead priority tier
  const leadPriority =
    revenuePotentialScore >= 80 ? "platinum" :
    revenuePotentialScore >= 60 ? "gold" :
    revenuePotentialScore >= 40 ? "silver" : "standard";

  // Upsell opportunities
  const upsells: string[] = [];
  if (!v.is_premium && revenuePotentialScore > 60) upsells.push("premium_subscription");
  if (convRate > 0.1 && demandScore > 50) upsells.push("featured_listing");
  if (speedScore > 80 && v.total_deals_closed > 10) upsells.push("priority_badge");
  if (v.category_demand_index < 40) upsells.push("category_expansion");

  // Category expansion suggestions
  const expansions: string[] = [];
  if (v.district_demand_index > 70 && v.total_deals_closed > 5) {
    expansions.push("expand_adjacent_districts");
  }
  if (repScore > 70 && convRate > 0.08) {
    expansions.push("add_premium_services");
  }

  return {
    revenue_potential_score: revenuePotentialScore,
    speed_score: Math.round(speedScore),
    acceptance_score: Math.round(acceptScore),
    reputation_score: Math.round(repScore),
    conversion_score: Math.round(convScore),
    demand_alignment_score: Math.round(demandScore),
    recommended_price_adjustment: priceAdjustment,
    lead_priority_tier: leadPriority,
    upsell_opportunities: upsells,
    category_expansion_suggestions: expansions,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { vendor_id, mode = "score" } = await req.json();

    if (mode === "batch") {
      // Score all active vendors
      const { data: vendors, error: vErr } = await sb
        .from("vendor_business_profiles")
        .select("id, vendor_id, rating, total_reviews, total_deals_closed, total_leads_received, avg_response_minutes, deal_conversion_rate, is_active, is_verified, tarif_harian_min, tarif_harian_max, business_type, business_city")
        .eq("is_active", true)
        .limit(500);

      if (vErr) throw vErr;

      let scored = 0;
      for (const v of vendors ?? []) {
        const input: VendorRevenueInput = {
          avg_response_minutes: v.avg_response_minutes ?? 60,
          acceptance_rate: v.deal_conversion_rate ?? 0.05,
          rating: v.rating ?? 3.0,
          total_reviews: v.total_reviews ?? 0,
          total_deals_closed: v.total_deals_closed ?? 0,
          total_leads_received: v.total_leads_received ?? 0,
          is_premium: false,
          tarif_min: v.tarif_harian_min ?? 0,
          tarif_max: v.tarif_harian_max ?? 0,
          category_demand_index: 50,
          district_demand_index: 50,
        };

        const result = computeRevenuePotential(input);

        await sb
          .from("vendor_revenue_metrics")
          .upsert({
            vendor_id: v.id,
            revenue_potential_score: result.revenue_potential_score,
            vendor_roi_score: result.conversion_score,
            premium_upgrade_propensity: result.upsell_opportunities.length > 1 ? 0.8 : 0.3,
            scoring_inputs: result as any,
            last_computed_at: new Date().toISOString(),
          }, { onConflict: "vendor_id" });

        scored++;
      }

      return new Response(JSON.stringify({ scored, mode: "batch" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single vendor scoring
    if (!vendor_id) {
      return new Response(JSON.stringify({ error: "vendor_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: v, error: vErr } = await sb
      .from("vendor_business_profiles")
      .select("*")
      .eq("id", vendor_id)
      .maybeSingle();

    if (vErr) throw vErr;
    if (!v) {
      return new Response(JSON.stringify({ error: "vendor not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input: VendorRevenueInput = {
      avg_response_minutes: v.avg_response_minutes ?? 60,
      acceptance_rate: v.deal_conversion_rate ?? 0.05,
      rating: v.rating ?? 3.0,
      total_reviews: v.total_reviews ?? 0,
      total_deals_closed: v.total_deals_closed ?? 0,
      total_leads_received: v.total_leads_received ?? 0,
      is_premium: false,
      tarif_min: v.tarif_harian_min ?? 0,
      tarif_max: v.tarif_harian_max ?? 0,
      category_demand_index: 50,
      district_demand_index: 50,
    };

    const result = computeRevenuePotential(input);

    return new Response(JSON.stringify({ vendor_id, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
