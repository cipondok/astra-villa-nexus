import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Scoring weights
const DEMAND_WEIGHTS = { liquidity_index: 0.35, supply_gap: 0.30, absorption: 0.20, investor_activity: 0.15 };
const PERF_WEIGHTS = { rating: 0.30, conversion: 0.25, response_time: 0.25, reviews: 0.20 };
const MATCH_WEIGHTS = { performance: 0.30, demand_alignment: 0.25, proximity: 0.20, capacity: 0.15, price: 0.10 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "full"; // "full" | "score" | "match" | "route"
    const nowISO = new Date().toISOString();

    let vendorsScored = 0;
    let matchesCreated = 0;
    let leadsRouted = 0;

    // ============================================================
    // 1. VENDOR INTELLIGENCE SCORING
    // ============================================================
    if (mode === "full" || mode === "score") {
      const { data: vendors } = await admin
        .from("vendor_business_profiles")
        .select("id, vendor_id, business_city, business_type, rating, deal_conversion_rate, avg_response_minutes, total_deals_closed, total_leads_received, total_reviews, is_active, is_verified")
        .eq("is_active", true)
        .limit(200);

      if (vendors && vendors.length > 0) {
        // Fetch district liquidity data for demand scoring
        const { data: liquidityMetrics } = await admin
          .from("market_liquidity_metrics")
          .select("district, segment_type, liquidity_strength_index, absorption_rate");

        const { data: supplyTargets } = await admin
          .from("supply_acquisition_targets")
          .select("district, segment_type, supply_gap_score, demand_velocity");

        const liquidityMap = new Map<string, any>();
        for (const m of liquidityMetrics || []) {
          liquidityMap.set(m.district, m);
        }

        const supplyMap = new Map<string, any>();
        for (const t of supplyTargets || []) {
          supplyMap.set(t.district, t);
        }

        for (const vendor of vendors) {
          const city = vendor.business_city || "Unknown";

          // --- Demand Score ---
          const liq = liquidityMap.get(city);
          const sup = supplyMap.get(city);
          const demandScore = Math.round(
            (liq?.liquidity_strength_index || 0) * DEMAND_WEIGHTS.liquidity_index +
            (sup?.supply_gap_score || 0) * DEMAND_WEIGHTS.supply_gap +
            Math.min((liq?.absorption_rate || 0) * 5, 100) * DEMAND_WEIGHTS.absorption +
            Math.min((sup?.demand_velocity || 0) * 2, 100) * DEMAND_WEIGHTS.investor_activity
          );

          // --- Performance Score ---
          const ratingScore = Math.min((vendor.rating || 0) * 20, 100);
          const convScore = Math.min((vendor.deal_conversion_rate || 0) * 100, 100);
          const responseScore = vendor.avg_response_minutes
            ? Math.max(0, 100 - (vendor.avg_response_minutes / 60) * 10)
            : 30;
          const reviewScore = Math.min((vendor.total_reviews || 0) * 5, 100);

          const performanceScore = Math.round(
            ratingScore * PERF_WEIGHTS.rating +
            convScore * PERF_WEIGHTS.conversion +
            responseScore * PERF_WEIGHTS.response_time +
            reviewScore * PERF_WEIGHTS.reviews
          );

          // --- Growth Priority Score (composite) ---
          const growthScore = Math.round(
            demandScore * 0.50 + performanceScore * 0.30 +
            (vendor.is_verified ? 15 : 0) + (vendor.total_deals_closed ? Math.min(vendor.total_deals_closed, 5) : 0)
          );

          const compositeRank = Math.round(
            demandScore * 0.35 + performanceScore * 0.40 + growthScore * 0.25
          );

          const { error } = await admin.from("vendor_intelligence_scores").upsert({
            vendor_id: vendor.id,
            demand_score: Math.min(demandScore, 100),
            performance_score: Math.min(performanceScore, 100),
            growth_priority_score: Math.min(growthScore, 100),
            composite_rank_score: Math.min(compositeRank, 100),
            scoring_breakdown: {
              demand: { liquidity: liq?.liquidity_strength_index || 0, supply_gap: sup?.supply_gap_score || 0, absorption: liq?.absorption_rate || 0 },
              performance: { rating: ratingScore, conversion: convScore, response: responseScore, reviews: reviewScore },
            },
            district_demand_signals: {
              city, liquidity_index: liq?.liquidity_strength_index || 0,
              supply_gap: sup?.supply_gap_score || 0,
            },
            last_computed_at: nowISO,
            updated_at: nowISO,
          }, { onConflict: "vendor_id" });

          if (!error) vendorsScored++;
        }
      }
    }

    // ============================================================
    // 2. VENDOR MATCHING ENGINE
    // ============================================================
    if (mode === "full" || mode === "match") {
      const { requester_id, requester_role, property_id, district, segment_type, service_category } = body;

      if (requester_id && district && service_category) {
        // Find eligible vendors
        const { data: regionVendors } = await admin
          .from("vendor_service_regions")
          .select("vendor_id")
          .eq("district", district)
          .eq("availability_status", "available");

        const vendorProfileIds = (regionVendors || []).map((r: any) => r.vendor_id);

        // Fallback: vendors in same city
        if (vendorProfileIds.length === 0) {
          const { data: cityVendors } = await admin
            .from("vendor_business_profiles")
            .select("id")
            .eq("business_city", district)
            .eq("is_active", true)
            .limit(20);
          vendorProfileIds.push(...(cityVendors || []).map((v: any) => v.id));
        }

        if (vendorProfileIds.length > 0) {
          // Fetch scores and profiles
          const { data: scores } = await admin
            .from("vendor_intelligence_scores")
            .select("*")
            .in("vendor_id", vendorProfileIds.slice(0, 50));

          const { data: profiles } = await admin
            .from("vendor_business_profiles")
            .select("id, business_name, business_type, rating, avg_response_minutes, is_verified")
            .in("id", vendorProfileIds.slice(0, 50));

          const { data: regions } = await admin
            .from("vendor_service_regions")
            .select("vendor_id, current_active_jobs, max_capacity_per_month")
            .in("vendor_id", vendorProfileIds.slice(0, 50));

          const scoreMap = new Map<string, any>();
          for (const s of scores || []) scoreMap.set(s.vendor_id, s);
          const regionMap = new Map<string, any>();
          for (const r of regions || []) regionMap.set(r.vendor_id, r);

          const candidates: Array<{ vendor_id: string; match_score: number; factors: any }> = [];

          for (const profile of profiles || []) {
            const score = scoreMap.get(profile.id);
            const region = regionMap.get(profile.id);

            const perfFactor = (score?.performance_score || 30) * MATCH_WEIGHTS.performance;
            const demandFactor = (score?.demand_score || 20) * MATCH_WEIGHTS.demand_alignment;
            const proximityFactor = region ? 80 : 40; // In-region vs city fallback
            const capacityFactor = region
              ? Math.max(0, 100 - ((region.current_active_jobs || 0) / Math.max(region.max_capacity_per_month, 1)) * 100)
              : 50;
            const priceFactor = 60; // Neutral without actual pricing data

            const matchScore = Math.round(
              perfFactor +
              demandFactor +
              proximityFactor * MATCH_WEIGHTS.proximity +
              capacityFactor * MATCH_WEIGHTS.capacity +
              priceFactor * MATCH_WEIGHTS.price
            );

            candidates.push({
              vendor_id: profile.id,
              match_score: Math.min(matchScore, 100),
              factors: {
                performance: Math.round(perfFactor),
                demand_alignment: Math.round(demandFactor),
                proximity: proximityFactor,
                capacity: Math.round(capacityFactor),
                vendor_name: profile.business_name,
                verified: profile.is_verified,
                rating: profile.rating,
              },
            });
          }

          // Sort and take top 5
          candidates.sort((a, b) => b.match_score - a.match_score);
          const topMatches = candidates.slice(0, 5);

          for (const match of topMatches) {
            const { error } = await admin.from("vendor_match_results").insert({
              requester_id,
              requester_role: requester_role || "investor",
              property_id: property_id || null,
              district,
              segment_type: segment_type || null,
              service_category,
              matched_vendor_id: match.vendor_id,
              match_score: match.match_score,
              match_factors: match.factors,
            });
            if (!error) matchesCreated++;
          }
        }
      }
    }

    // ============================================================
    // 3. DEMAND ROUTING → VENDOR LEADS
    // ============================================================
    if (mode === "full" || mode === "route") {
      const { data: pendingRoutes } = await admin
        .from("vendor_demand_routing")
        .select("*")
        .eq("processed", false)
        .order("created_at", { ascending: true })
        .limit(30);

      for (const route of pendingRoutes || []) {
        // Find vendors in this district with matching service categories
        const { data: regionVendors } = await admin
          .from("vendor_service_regions")
          .select("vendor_id")
          .eq("district", route.district)
          .in("availability_status", ["available", "busy"]);

        const vendorIds = (regionVendors || []).map((r: any) => r.vendor_id);

        if (vendorIds.length === 0) {
          // Fallback: vendors in city
          const { data: cityVendors } = await admin
            .from("vendor_business_profiles")
            .select("id")
            .eq("business_city", route.district)
            .eq("is_active", true)
            .limit(10);
          vendorIds.push(...(cityVendors || []).map((v: any) => v.id));
        }

        // Generate leads for top vendors
        const { data: topVendors } = await admin
          .from("vendor_intelligence_scores")
          .select("vendor_id")
          .in("vendor_id", vendorIds.slice(0, 30))
          .order("composite_rank_score", { ascending: false })
          .limit(5);

        const notifiedIds: string[] = [];

        for (const tv of topVendors || []) {
          // Check for duplicate lead in last 7 days
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const { data: existingLead } = await admin
            .from("vendor_leads_pipeline")
            .select("id")
            .eq("vendor_id", tv.vendor_id)
            .eq("lead_source", "ai_demand_routing")
            .gte("created_at", weekAgo)
            .limit(1);

          if (existingLead && existingLead.length > 0) continue;

          const { error } = await admin.from("vendor_leads_pipeline").insert({
            vendor_id: tv.vendor_id,
            lead_source: "ai_demand_routing",
            lead_type: route.trigger_type,
            priority: route.campaign_action === "onboarding_campaign" ? "high" : "medium",
            status: "new",
            metadata: {
              ...route.supporting_metrics,
              trigger_type: route.trigger_type,
              district: route.district,
              segment: route.segment_type,
              target_categories: route.target_service_categories,
            },
          });

          if (!error) {
            leadsRouted++;
            notifiedIds.push(tv.vendor_id);
          }
        }

        // Mark route as processed
        await admin.from("vendor_demand_routing").update({
          processed: true,
          processed_at: nowISO,
          vendor_ids_notified: notifiedIds,
          leads_generated: notifiedIds.length,
        }).eq("id", route.id);
      }
    }

    // Emit completion signal
    if (vendorsScored > 0 || matchesCreated > 0 || leadsRouted > 0) {
      await admin.from("ai_event_signals").insert({
        event_type: "vendor_engine_cycle",
        entity_type: "vendor_marketplace",
        priority_level: leadsRouted > 10 ? "high" : "medium",
        payload: {
          vendors_scored: vendorsScored,
          matches_created: matchesCreated,
          leads_routed: leadsRouted,
          mode,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        vendors_scored: vendorsScored,
        matches_created: matchesCreated,
        leads_routed: leadsRouted,
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
