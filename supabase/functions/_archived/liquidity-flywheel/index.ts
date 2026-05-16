import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Thresholds for flywheel triggers
const THRESHOLDS = {
  HOT_LIQUIDITY_SCORE: 70,
  RISING_DEMAND_VELOCITY: 5,     // viewings/week jump
  FAST_ABSORPTION_RATE: 15,      // % absorption rate
  SUPPLY_GAP_CRITICAL: 75,
  STORY_PRIORITY_HIGH: 70,
  URGENCY_HOT: 85,
  URGENCY_RISING: 65,
  URGENCY_MODERATE: 45,
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
    const mode = body.mode || "full"; // "full" | "alerts_only" | "supply_only" | "stories_only"

    const nowISO = new Date().toISOString();
    let alertsCreated = 0;
    let supplyTargetsUpdated = 0;
    let storiesGenerated = 0;

    // ============================================================
    // 1. FETCH CURRENT LIQUIDITY STATE
    // ============================================================
    const { data: metrics } = await admin
      .from("market_liquidity_metrics")
      .select("*")
      .order("liquidity_strength_index", { ascending: false });

    if (!metrics || metrics.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No liquidity metrics to process" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================================
    // 2. INVESTOR URGENCY ALERTS
    // ============================================================
    if (mode === "full" || mode === "alerts_only") {
      // Find investors with watchlist items or saved searches in affected districts
      for (const m of metrics) {
        const alertCandidates: Array<{
          alert_type: string;
          urgency: number;
          title: string;
          description: string;
        }> = [];

        // Hot liquidity trigger
        if (m.liquidity_strength_index >= THRESHOLDS.HOT_LIQUIDITY_SCORE) {
          alertCandidates.push({
            alert_type: "hot_liquidity",
            urgency: Math.min(50 + m.liquidity_strength_index / 2, 100),
            title: `Hot Market: ${m.district} ${m.segment_type}`,
            description: `Liquidity index hit ${m.liquidity_strength_index}. Properties in ${m.district} are moving fast with ${m.viewing_count_30d} viewings and ${m.offer_count_30d} offers in 30 days.`,
          });
        }

        // Rising demand trigger
        if (m.viewing_velocity_score >= THRESHOLDS.RISING_DEMAND_VELOCITY * 10) {
          alertCandidates.push({
            alert_type: "rising_demand",
            urgency: Math.min(40 + m.viewing_velocity_score / 2, 100),
            title: `Demand Surge: ${m.district}`,
            description: `Viewing velocity for ${m.segment_type} in ${m.district} is accelerating. ${m.viewing_count_30d} viewings recorded with momentum: ${m.momentum_trend}.`,
          });
        }

        // Fast absorption trigger
        if (m.absorption_rate >= THRESHOLDS.FAST_ABSORPTION_RATE) {
          alertCandidates.push({
            alert_type: "fast_absorption",
            urgency: THRESHOLDS.URGENCY_HOT,
            title: `Rapid Absorption: ${m.district}`,
            description: `${m.segment_type} listings in ${m.district} are being absorbed at ${m.absorption_rate}% rate. ${m.closed_count_30d} deals closed in 30 days.`,
          });
        }

        // Supply squeeze
        if (m.supply_demand_ratio < 2 && m.offer_count_30d > 0) {
          alertCandidates.push({
            alert_type: "supply_squeeze",
            urgency: THRESHOLDS.URGENCY_RISING,
            title: `Supply Squeeze: ${m.district}`,
            description: `Only ${m.active_listings} active ${m.segment_type} listings vs ${m.offer_count_30d} offers. Supply-demand ratio: ${m.supply_demand_ratio.toFixed(1)}.`,
          });
        }

        if (alertCandidates.length === 0) continue;

        // Find investors interested in this district (via watchlist or saved properties)
        const { data: watchlistUsers } = await admin
          .from("investor_watchlist")
          .select("user_id")
          .limit(100);

        // Also get users who have inquired in this district
        const { data: inquiryUsers } = await admin
          .from("property_inquiries")
          .select("user_id, properties!inner(city)")
          .eq("properties.city", m.district)
          .limit(100);

        const investorIds = new Set<string>();
        for (const w of watchlistUsers || []) {
          if (w.user_id) investorIds.add(w.user_id);
        }
        for (const i of inquiryUsers || []) {
          if (i.user_id) investorIds.add(i.user_id);
        }

        if (investorIds.size === 0) continue;

        // Deduplicate: don't re-alert within 24h for same type+district
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        for (const investorId of investorIds) {
          for (const candidate of alertCandidates) {
            // Check for recent duplicate
            const { data: existing } = await admin
              .from("investor_liquidity_alerts")
              .select("id")
              .eq("investor_id", investorId)
              .eq("alert_type", candidate.alert_type)
              .eq("district", m.district)
              .gte("triggered_at", oneDayAgo)
              .limit(1);

            if (existing && existing.length > 0) continue;

            const { error } = await admin.from("investor_liquidity_alerts").insert({
              investor_id: investorId,
              district: m.district,
              segment_type: m.segment_type,
              alert_type: candidate.alert_type,
              urgency_score: Math.round(candidate.urgency),
              title: candidate.title,
              description: candidate.description,
              supporting_metrics: {
                liquidity_index: m.liquidity_strength_index,
                viewing_velocity: m.viewing_velocity_score,
                absorption_rate: m.absorption_rate,
                momentum: m.momentum_trend,
                supply_demand_ratio: m.supply_demand_ratio,
              },
            });

            if (!error) alertsCreated++;
          }

          // Batch limit per cycle
          if (alertsCreated > 200) break;
        }
        if (alertsCreated > 200) break;
      }
    }

    // ============================================================
    // 3. SUPPLY ACQUISITION TARGETS
    // ============================================================
    if (mode === "full" || mode === "supply_only") {
      for (const m of metrics) {
        // Calculate supply gap score
        const demandPressure = Math.min(
          (m.offer_count_30d / Math.max(m.active_listings, 1)) * 50 +
          (m.viewing_count_30d / Math.max(m.active_listings, 1)) * 20,
          100
        );

        const supplyGap = Math.round(
          demandPressure * 0.5 +
          Math.min(m.liquidity_strength_index, 100) * 0.3 +
          Math.min(m.absorption_rate * 2, 100) * 0.2
        );

        // Determine recommended action
        let action: string;
        let priority: string;

        if (supplyGap >= THRESHOLDS.SUPPLY_GAP_CRITICAL) {
          action = m.active_listings < 5 ? "developer_pitch" : "agent_outreach";
          priority = "critical";
        } else if (supplyGap >= 50) {
          action = m.momentum_trend === "accelerating" ? "influencer_campaign" : "agent_outreach";
          priority = "high";
        } else if (supplyGap >= 30) {
          action = "vendor_activation";
          priority = "medium";
        } else {
          action = "monitor";
          priority = "low";
        }

        // Get investor interest count for this district
        const { count: interestCount } = await admin
          .from("property_inquiries")
          .select("id", { count: "exact", head: true })
          .eq("properties.city", m.district)
          .limit(0);

        const { error } = await admin.from("supply_acquisition_targets").upsert(
          {
            district: m.district,
            segment_type: m.segment_type,
            liquidity_strength_index: m.liquidity_strength_index,
            supply_gap_score: supplyGap,
            demand_velocity: m.viewing_velocity_score,
            active_listings: m.active_listings,
            avg_days_to_close: m.avg_days_to_close || 0,
            investor_interest_count: interestCount || 0,
            recommended_action: action,
            action_priority: priority,
            last_computed_at: nowISO,
            updated_at: nowISO,
          },
          { onConflict: "district,segment_type" }
        );

        if (!error) supplyTargetsUpdated++;
      }
    }

    // ============================================================
    // 4. MARKET STORY SIGNALS
    // ============================================================
    if (mode === "full" || mode === "stories_only") {
      for (const m of metrics) {
        const stories: Array<{
          story_type: string;
          headline: string;
          narrative: string;
          priority: number;
        }> = [];

        // Hotspot rise
        if (m.momentum_trend === "accelerating" && m.liquidity_strength_index >= 60) {
          stories.push({
            story_type: "hotspot_rise",
            headline: `${m.district} Emerges as ${m.segment_type} Hotspot`,
            narrative: `With a liquidity index of ${m.liquidity_strength_index} and ${m.momentum_trend} momentum, ${m.district} is showing strong investor activity. ${m.viewing_count_30d} viewings and ${m.offer_count_30d} offers recorded in the last 30 days.`,
            priority: Math.min(60 + m.liquidity_strength_index / 3, 100),
          });
        }

        // Investor rush
        if (m.offer_count_30d >= 5 && m.supply_demand_ratio < 3) {
          stories.push({
            story_type: "investor_rush",
            headline: `Investor Competition Intensifies in ${m.district}`,
            narrative: `${m.offer_count_30d} offers competing for ${m.active_listings} active ${m.segment_type} listings. Supply-demand ratio at ${m.supply_demand_ratio.toFixed(1)} signals strong buyer competition.`,
            priority: 75,
          });
        }

        // Absorption spike
        if (m.absorption_rate >= 10) {
          stories.push({
            story_type: "absorption_spike",
            headline: `${m.district} ${m.segment_type} Market Moving Fast`,
            narrative: `Absorption rate of ${m.absorption_rate}% indicates rapid market clearance. ${m.closed_count_30d} deals closed with average close probability of ${m.deal_close_probability}%.`,
            priority: 70,
          });
        }

        // Deal velocity surge
        if (m.closed_count_30d >= 3 && m.momentum_trend !== "cooling") {
          stories.push({
            story_type: "deal_velocity_surge",
            headline: `Deal Velocity Surging in ${m.district}`,
            narrative: `${m.closed_count_30d} ${m.segment_type} deals closed in 30 days. Market momentum is ${m.momentum_trend} with viewing velocity score of ${m.viewing_velocity_score}.`,
            priority: 65,
          });
        }

        for (const story of stories) {
          // Deduplicate: same story_type + district within 48h
          const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
          const { data: existing } = await admin
            .from("market_story_signals")
            .select("id")
            .eq("story_type", story.story_type)
            .eq("district", m.district)
            .gte("created_at", twoDaysAgo)
            .limit(1);

          if (existing && existing.length > 0) continue;

          const { error } = await admin.from("market_story_signals").insert({
            story_type: story.story_type,
            district: m.district,
            segment_type: m.segment_type,
            headline: story.headline,
            narrative: story.narrative,
            supporting_metrics: {
              liquidity_index: m.liquidity_strength_index,
              momentum: m.momentum_trend,
              absorption_rate: m.absorption_rate,
              viewing_count: m.viewing_count_30d,
              offer_count: m.offer_count_30d,
              closed_count: m.closed_count_30d,
              supply_demand_ratio: m.supply_demand_ratio,
            },
            content_priority_score: Math.round(story.priority),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });

          if (!error) storiesGenerated++;
        }
      }
    }

    // ============================================================
    // 5. EMIT FLYWHEEL COMPLETION SIGNAL
    // ============================================================
    if (alertsCreated > 0 || storiesGenerated > 0) {
      await admin.from("ai_event_signals").insert({
        event_type: "flywheel_cycle_completed",
        entity_type: "liquidity_flywheel",
        priority_level: alertsCreated > 50 ? "high" : "medium",
        payload: {
          alerts_created: alertsCreated,
          supply_targets_updated: supplyTargetsUpdated,
          stories_generated: storiesGenerated,
          mode,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: alertsCreated,
        supply_targets_updated: supplyTargetsUpdated,
        stories_generated: storiesGenerated,
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
