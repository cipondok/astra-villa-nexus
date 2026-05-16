import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode } = await req.json();

    if (mode === "dashboard") {
      // Funnel analytics
      const { data: events } = await supabase
        .from("supply_growth_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      const stages = ["lead_contacted", "listing_started", "media_uploaded", "verification_pending", "listing_live", "first_inquiry", "escrow_started", "sold_or_rented"];
      const funnelCounts: Record<string, number> = {};
      const channelCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};

      for (const s of stages) funnelCounts[s] = 0;
      for (const e of events || []) {
        funnelCounts[e.funnel_stage] = (funnelCounts[e.funnel_stage] || 0) + 1;
        if (e.source_channel) channelCounts[e.source_channel] = (channelCounts[e.source_channel] || 0) + 1;
        if (e.city) cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
      }

      // Quality signals
      const { data: quality } = await supabase
        .from("listing_quality_signals")
        .select("*")
        .order("evaluated_at", { ascending: false })
        .limit(100);

      const avgQuality = quality && quality.length > 0
        ? quality.reduce((s: number, q: any) => s + (q.quality_score || 0), 0) / quality.length
        : 0;

      // Zone metrics
      const { data: zones } = await supabase
        .from("supply_zone_metrics")
        .select("*")
        .order("supply_gap_score", { ascending: false })
        .limit(50);

      // Pending nudges
      const { data: actions } = await supabase
        .from("supply_growth_actions")
        .select("*")
        .eq("action_status", "pending")
        .order("scheduled_at", { ascending: false })
        .limit(50);

      // Seller conversion
      const { data: conversions } = await supabase
        .from("seller_conversion_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({
        data: {
          summary: {
            total_events: (events || []).length,
            live_listings: funnelCounts["listing_live"] || 0,
            escrows_started: funnelCounts["escrow_started"] || 0,
            deals_closed: funnelCounts["sold_or_rented"] || 0,
            avg_listing_quality: Math.round(avgQuality * 10) / 10,
            pending_nudges: (actions || []).length,
            zones_tracked: (zones || []).length,
          },
          funnel: funnelCounts,
          by_channel: channelCounts,
          by_city: cityCounts,
          quality_signals: quality || [],
          zones: zones || [],
          pending_actions: actions || [],
          conversions: conversions || [],
        }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (mode === "score_agents") {
      // Aggregate agent performance from events
      const { data: events } = await supabase
        .from("supply_growth_events")
        .select("agent_user_id, funnel_stage")
        .not("agent_user_id", "is", null);

      const agentStats: Record<string, any> = {};
      for (const e of events || []) {
        if (!e.agent_user_id) continue;
        if (!agentStats[e.agent_user_id]) {
          agentStats[e.agent_user_id] = { total: 0, live: 0, escrow: 0, closed: 0 };
        }
        agentStats[e.agent_user_id].total++;
        if (e.funnel_stage === "listing_live") agentStats[e.agent_user_id].live++;
        if (e.funnel_stage === "escrow_started") agentStats[e.agent_user_id].escrow++;
        if (e.funnel_stage === "sold_or_rented") agentStats[e.agent_user_id].closed++;
      }

      const scores = Object.entries(agentStats).map(([id, s]: [string, any]) => {
        const completionRate = s.total > 0 ? (s.live / s.total) * 100 : 0;
        const closingRate = s.live > 0 ? (s.closed / s.live) * 100 : 0;
        const score = Math.min(100, Math.round(completionRate * 0.4 + closingRate * 0.4 + Math.min(s.total, 20) * 1));
        return { agent_user_id: id, score, listings_live: s.live, deals_closed: s.closed, total_events: s.total };
      }).sort((a, b) => b.score - a.score);

      return new Response(JSON.stringify({ data: scores }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "generate_nudges") {
      // Find agents with incomplete listings and generate nudges
      const { data: events } = await supabase
        .from("supply_growth_events")
        .select("agent_user_id, funnel_stage, property_id")
        .not("agent_user_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(200);

      const agentLatest: Record<string, string> = {};
      for (const e of events || []) {
        if (e.agent_user_id && !agentLatest[e.agent_user_id]) {
          agentLatest[e.agent_user_id] = e.funnel_stage;
        }
      }

      const nudges: any[] = [];
      for (const [agentId, stage] of Object.entries(agentLatest)) {
        if (stage === "listing_started") {
          nudges.push({
            agent_user_id: agentId,
            action_type: "upload_media_prompt",
            trigger_reason: "Listing started but no media uploaded",
            action_status: "pending",
          });
        }
      }

      if (nudges.length > 0) {
        await supabase.from("supply_growth_actions").insert(nudges);
      }

      return new Response(JSON.stringify({ data: { nudges_created: nudges.length } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown mode" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
