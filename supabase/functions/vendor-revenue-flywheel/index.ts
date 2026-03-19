import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Revenue scoring weights
const REV_WEIGHTS = {
  liquidity_demand: 0.25,
  supply_gap: 0.20,
  conversion_rate: 0.20,
  capacity_util: 0.15,
  lead_value: 0.10,
  growth_momentum: 0.10,
};

const UPSELL_THRESHOLDS = {
  HIGH_LEADS: 10,
  HIGH_CONVERSION: 0.3,
  NEAR_CAPACITY: 0.75,
  HIGH_REVIEW_MOMENTUM: 5,
  HOTSPOT_LIQUIDITY: 65,
  PREMIUM_PROPENSITY: 70,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "full"; // "full" | "revenue_score" | "upsell" | "market_share" | "premium_allocate"
    const nowISO = new Date().toISOString();
    const currentMonth = nowISO.substring(0, 7); // YYYY-MM

    let revenueScored = 0;
    let upsellsGenerated = 0;
    let marketShareUpdated = 0;
    let premiumAllocated = 0;

    // ============================================================
    // 1. VENDOR REVENUE INTELLIGENCE SCORING
    // ============================================================
    if (mode === "full" || mode === "revenue_score") {
      const { data: vendors } = await admin
        .from("vendor_business_profiles")
        .select("id, vendor_id, business_city, business_type, rating, deal_conversion_rate, avg_response_minutes, total_deals_closed, total_leads_received, total_reviews, is_active")
        .eq("is_active", true)
        .limit(200);

      if (vendors && vendors.length > 0) {
        // Fetch intelligence + liquidity context
        const [intScores, liquidityRes, supplyRes, regionsRes] = await Promise.all([
          admin.from("vendor_intelligence_scores").select("*"),
          admin.from("market_liquidity_metrics").select("district, liquidity_strength_index, absorption_rate, supply_demand_ratio"),
          admin.from("supply_acquisition_targets").select("district, supply_gap_score, demand_velocity"),
          admin.from("vendor_service_regions").select("vendor_id, district, current_active_jobs, max_capacity_per_month"),
        ]);

        const intMap = new Map<string, any>();
        for (const s of intScores.data || []) intMap.set(s.vendor_id, s);
        const liqMap = new Map<string, any>();
        for (const m of liquidityRes.data || []) liqMap.set(m.district, m);
        const supMap = new Map<string, any>();
        for (const t of supplyRes.data || []) supMap.set(t.district, t);
        const regMap = new Map<string, any[]>();
        for (const r of regionsRes.data || []) {
          if (!regMap.has(r.vendor_id)) regMap.set(r.vendor_id, []);
          regMap.get(r.vendor_id)!.push(r);
        }

        // Fetch lead pipeline stats per vendor (30d)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        for (const vendor of vendors) {
          const city = vendor.business_city || "Unknown";
          const intScore = intMap.get(vendor.id);
          const liq = liqMap.get(city);
          const sup = supMap.get(city);
          const regions = regMap.get(vendor.id) || [];

          // Lead pipeline stats
          const { data: leads } = await admin
            .from("vendor_leads_pipeline")
            .select("status, deal_value")
            .eq("vendor_id", vendor.id)
            .gte("created_at", thirtyDaysAgo);

          const totalLeads = leads?.length || 0;
          const convertedLeads = leads?.filter((l: any) => l.status === "converted") || [];
          const totalLeadValue = leads?.reduce((s: number, l: any) => s + (l.deal_value || 0), 0) || 0;
          const conversionRate = totalLeads > 0 ? convertedLeads.length / totalLeads : 0;
          const avgDealValue = convertedLeads.length > 0
            ? convertedLeads.reduce((s: number, l: any) => s + (l.deal_value || 0), 0) / convertedLeads.length
            : 0;

          // Capacity utilization
          const totalCapacity = regions.reduce((s: number, r: any) => s + (r.max_capacity_per_month || 10), 0) || 10;
          const totalActive = regions.reduce((s: number, r: any) => s + (r.current_active_jobs || 0), 0);
          const capacityUtil = Math.min(totalActive / totalCapacity, 1);

          // --- Revenue Potential Score ---
          const liquidityDemand = Math.min((liq?.liquidity_strength_index || 0), 100);
          const supplyGap = Math.min((sup?.supply_gap_score || 0), 100);
          const convScore = Math.min(conversionRate * 200, 100);
          const capScore = Math.min(capacityUtil * 100, 100);
          const leadValueScore = Math.min(totalLeadValue / 1e8, 100); // Normalize IDR
          const growthMomentum = intScore?.growth_priority_score || 30;

          const revenuePotential = Math.round(
            liquidityDemand * REV_WEIGHTS.liquidity_demand +
            supplyGap * REV_WEIGHTS.supply_gap +
            convScore * REV_WEIGHTS.conversion_rate +
            capScore * REV_WEIGHTS.capacity_util +
            leadValueScore * REV_WEIGHTS.lead_value +
            growthMomentum * REV_WEIGHTS.growth_momentum
          );

          // --- Vendor ROI Score ---
          const roiScore = Math.round(
            Math.min(conversionRate * 150, 40) +
            Math.min((vendor.rating || 0) * 12, 30) +
            Math.min((vendor.total_deals_closed || 0) * 2, 30)
          );

          // --- Premium Upgrade Propensity ---
          const propensity = Math.round(
            (totalLeads >= UPSELL_THRESHOLDS.HIGH_LEADS ? 25 : totalLeads * 2.5) +
            (conversionRate >= UPSELL_THRESHOLDS.HIGH_CONVERSION ? 25 : conversionRate * 80) +
            (capacityUtil >= UPSELL_THRESHOLDS.NEAR_CAPACITY ? 25 : capacityUtil * 33) +
            (liquidityDemand >= UPSELL_THRESHOLDS.HOTSPOT_LIQUIDITY ? 25 : liquidityDemand * 0.38)
          );

          // --- District Growth Capture ---
          const districtCapture = Math.round(
            (sup?.supply_gap_score || 0) * 0.4 +
            liquidityDemand * 0.3 +
            (intScore?.demand_score || 0) * 0.3
          );

          const platformRevenue = convertedLeads.reduce((s: number, l: any) => s + ((l.deal_value || 0) * 0.025), 0);

          const { error } = await admin.from("vendor_revenue_metrics").upsert({
            vendor_id: vendor.id,
            revenue_potential_score: Math.min(revenuePotential, 100),
            vendor_roi_score: Math.min(roiScore, 100),
            premium_upgrade_propensity: Math.min(propensity, 100),
            district_growth_capture_score: Math.min(districtCapture, 100),
            total_platform_revenue: platformRevenue,
            total_leads_value: totalLeadValue,
            lead_to_deal_ratio: Math.round(conversionRate * 100) / 100,
            capacity_utilization_pct: Math.round(capacityUtil * 100) / 100,
            avg_deal_value: avgDealValue,
            scoring_inputs: {
              liquidity_demand: liquidityDemand,
              supply_gap: supplyGap,
              conversion_rate: conversionRate,
              capacity_utilization: capacityUtil,
              total_leads_30d: totalLeads,
              converted_30d: convertedLeads.length,
              city,
            },
            last_computed_at: nowISO,
            updated_at: nowISO,
          }, { onConflict: "vendor_id" });

          if (!error) revenueScored++;
        }
      }
    }

    // ============================================================
    // 2. AI VENDOR UPSELL DETECTION
    // ============================================================
    if (mode === "full" || mode === "upsell") {
      const { data: metrics } = await admin
        .from("vendor_revenue_metrics")
        .select("*")
        .gte("premium_upgrade_propensity", UPSELL_THRESHOLDS.PREMIUM_PROPENSITY)
        .order("premium_upgrade_propensity", { ascending: false })
        .limit(50);

      for (const m of metrics || []) {
        const reasons: Array<{
          type: string;
          reason: string;
          slot: string;
          priority: number;
          est_roi: number;
          est_leads: number;
        }> = [];

        // High lead volume → featured listing
        if ((m.scoring_inputs as any)?.total_leads_30d >= UPSELL_THRESHOLDS.HIGH_LEADS) {
          reasons.push({
            type: "featured_boost",
            reason: `Receiving ${(m.scoring_inputs as any).total_leads_30d} leads/month — premium listing would increase visibility 3x`,
            slot: "featured_listing",
            priority: 80,
            est_roi: 2.5,
            est_leads: Math.round((m.scoring_inputs as any).total_leads_30d * 0.5),
          });
        }

        // Hotspot district → sponsored routing
        if ((m.scoring_inputs as any)?.liquidity_demand >= UPSELL_THRESHOLDS.HOTSPOT_LIQUIDITY) {
          reasons.push({
            type: "sponsored_routing",
            reason: `Operating in high-demand district (liquidity: ${(m.scoring_inputs as any).liquidity_demand}). Priority lead routing would capture more deal flow`,
            slot: "priority_lead_routing",
            priority: 85,
            est_roi: 3.0,
            est_leads: 8,
          });
        }

        // Near capacity → expansion recommendation
        if (m.capacity_utilization_pct >= UPSELL_THRESHOLDS.NEAR_CAPACITY) {
          reasons.push({
            type: "capacity_expansion",
            reason: `At ${Math.round(Number(m.capacity_utilization_pct) * 100)}% capacity. Expanding service regions would unlock additional revenue`,
            slot: "district_spotlight",
            priority: 75,
            est_roi: 2.0,
            est_leads: 5,
          });
        }

        // High conversion → subscription upgrade
        if (m.lead_to_deal_ratio >= UPSELL_THRESHOLDS.HIGH_CONVERSION) {
          reasons.push({
            type: "subscription_upgrade",
            reason: `${Math.round(Number(m.lead_to_deal_ratio) * 100)}% conversion rate demonstrates strong execution. Premium subscription unlocks priority routing + analytics`,
            slot: "category_champion",
            priority: 70,
            est_roi: 2.8,
            est_leads: 10,
          });
        }

        // Deduplicate: no duplicate rec within 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        for (const r of reasons) {
          const { data: existing } = await admin
            .from("vendor_upgrade_recommendations")
            .select("id")
            .eq("vendor_id", m.vendor_id)
            .eq("recommendation_type", r.type)
            .gte("created_at", weekAgo)
            .neq("status", "declined")
            .limit(1);

          if (existing && existing.length > 0) continue;

          const { error } = await admin.from("vendor_upgrade_recommendations").insert({
            vendor_id: m.vendor_id,
            recommendation_type: r.type,
            trigger_reason: r.reason,
            trigger_metrics: m.scoring_inputs,
            recommended_slot_type: r.slot,
            estimated_roi_multiplier: r.est_roi,
            estimated_additional_leads: r.est_leads,
            priority_score: r.priority,
          });

          if (!error) upsellsGenerated++;
        }
      }
    }

    // ============================================================
    // 3. VENDOR MARKET SHARE INTELLIGENCE
    // ============================================================
    if (mode === "full" || mode === "market_share") {
      const { data: allLeads } = await admin
        .from("vendor_leads_pipeline")
        .select("vendor_id, status, deal_value, created_at")
        .gte("created_at", `${currentMonth}-01`)
        .limit(1000);

      // Get vendor-district mapping
      const { data: vendorProfiles } = await admin
        .from("vendor_business_profiles")
        .select("id, business_city, business_type")
        .eq("is_active", true);

      if (allLeads && vendorProfiles) {
        const profileMap = new Map<string, any>();
        for (const p of vendorProfiles) profileMap.set(p.id, p);

        // Group leads by district+service_category
        const districtLeads = new Map<string, { total: number; byVendor: Map<string, any[]> }>();

        for (const lead of allLeads) {
          const profile = profileMap.get(lead.vendor_id);
          if (!profile) continue;
          const key = `${profile.business_city}::${profile.business_type}`;

          if (!districtLeads.has(key)) {
            districtLeads.set(key, { total: 0, byVendor: new Map() });
          }
          const dl = districtLeads.get(key)!;
          dl.total++;
          if (!dl.byVendor.has(lead.vendor_id)) dl.byVendor.set(lead.vendor_id, []);
          dl.byVendor.get(lead.vendor_id)!.push(lead);
        }

        for (const [key, dl] of districtLeads) {
          const [district, serviceCategory] = key.split("::");
          const vendorEntries = Array.from(dl.byVendor.entries());

          // Rank vendors
          vendorEntries.sort((a, b) => b[1].length - a[1].length);

          let rank = 0;
          for (const [vendorId, vendorLeads] of vendorEntries) {
            rank++;
            const converted = vendorLeads.filter((l: any) => l.status === "converted");
            const share = dl.total > 0 ? (vendorLeads.length / dl.total) * 100 : 0;
            const winRate = vendorLeads.length > 0 ? (converted.length / vendorLeads.length) * 100 : 0;

            // Generate narrative for top vendors
            let narrative: string | null = null;
            if (rank <= 3 && share >= 20) {
              narrative = `Top ${rank} ${serviceCategory} vendor capturing ${share.toFixed(0)}% of ${district} leads with ${winRate.toFixed(0)}% win rate`;
            }

            const { error } = await admin.from("vendor_market_share").upsert({
              vendor_id: vendorId,
              district: district || "Unknown",
              service_category: serviceCategory || "general",
              period_month: currentMonth,
              total_district_leads: dl.total,
              vendor_leads_captured: vendorLeads.length,
              market_share_pct: Math.round(share * 100) / 100,
              lead_win_rate: Math.round(winRate * 100) / 100,
              competitor_count: vendorEntries.length - 1,
              rank_in_district: rank,
              insight_narrative: narrative,
            }, { onConflict: "vendor_id,district,service_category,period_month" });

            if (!error) marketShareUpdated++;
          }
        }
      }
    }

    // ============================================================
    // 4. DYNAMIC PREMIUM SLOT ALLOCATION
    // ============================================================
    if (mode === "full" || mode === "premium_allocate") {
      // Find hotspot districts needing premium vendor slots
      const { data: hotDistricts } = await admin
        .from("supply_acquisition_targets")
        .select("district, segment_type, supply_gap_score, liquidity_strength_index")
        .in("action_priority", ["critical", "high"])
        .order("supply_gap_score", { ascending: false })
        .limit(10);

      for (const hd of hotDistricts || []) {
        // Find top vendors in this district without active premium slots
        const { data: topVendors } = await admin
          .from("vendor_intelligence_scores")
          .select("vendor_id, composite_rank_score")
          .order("composite_rank_score", { ascending: false })
          .limit(20);

        for (const tv of (topVendors || []).slice(0, 3)) {
          // Check existing active slot
          const { data: existingSlot } = await admin
            .from("vendor_premium_slots")
            .select("id")
            .eq("vendor_id", tv.vendor_id)
            .eq("district", hd.district)
            .eq("status", "active")
            .limit(1);

          if (existingSlot && existingSlot.length > 0) continue;

          // Create available premium slot offer
          const { error } = await admin.from("vendor_premium_slots").insert({
            vendor_id: tv.vendor_id,
            slot_type: hd.supply_gap_score >= 75 ? "district_spotlight" : "featured_listing",
            district: hd.district,
            segment_type: hd.segment_type,
            status: "available",
            price_monthly: hd.supply_gap_score >= 75 ? 2500000 : 1500000, // IDR pricing
            discount_pct: tv.composite_rank_score >= 80 ? 20 : 0,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

          if (!error) premiumAllocated++;
        }
      }
    }

    // ============================================================
    // 5. EMIT COMPLETION SIGNAL
    // ============================================================
    if (revenueScored > 0 || upsellsGenerated > 0 || premiumAllocated > 0) {
      await admin.from("ai_event_signals").insert({
        event_type: "vendor_revenue_flywheel_cycle",
        entity_type: "vendor_revenue",
        priority_level: upsellsGenerated > 10 ? "high" : "medium",
        payload: {
          revenue_scored: revenueScored,
          upsells_generated: upsellsGenerated,
          market_share_updated: marketShareUpdated,
          premium_allocated: premiumAllocated,
          mode,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        revenue_scored: revenueScored,
        upsells_generated: upsellsGenerated,
        market_share_updated: marketShareUpdated,
        premium_allocated: premiumAllocated,
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
