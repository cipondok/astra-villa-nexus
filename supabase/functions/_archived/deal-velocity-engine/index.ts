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
      // Pipeline stage distribution
      const { data: events } = await supabase
        .from("deal_pipeline_events")
        .select("pipeline_stage, deal_id, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      const stageCounts: Record<string, number> = {};
      const uniqueDeals = new Set<string>();
      (events || []).forEach((e: any) => {
        stageCounts[e.pipeline_stage] = (stageCounts[e.pipeline_stage] || 0) + 1;
        uniqueDeals.add(e.deal_id);
      });

      // Followup actions
      const { data: followups } = await supabase
        .from("deal_followup_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      // Agent metrics
      const { data: agentMetrics } = await supabase
        .from("agent_deal_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(20);

      // Escrow acceleration
      const { data: escrowAccel } = await supabase
        .from("deal_escrow_acceleration_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(50);

      // Negotiation insights
      const { data: negotiations } = await supabase
        .from("deal_negotiation_insights")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(20);

      const completedDeals = stageCounts["completed"] || 0;
      const totalDeals = uniqueDeals.size || 1;
      const avgConversion = Math.round((completedDeals / totalDeals) * 100);

      return new Response(JSON.stringify({
        total_active_deals: totalDeals,
        stage_distribution: stageCounts,
        conversion_rate: avgConversion,
        stalled_count: (stageCounts["negotiation_active"] || 0) + (stageCounts["price_agreed"] || 0),
        followups: followups || [],
        agent_metrics: agentMetrics || [],
        escrow_acceleration: escrowAccel || [],
        negotiations: negotiations || [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (mode === "score_deal") {
      // Simple conversion scoring based on pipeline events
      const { data: deals } = await supabase
        .from("deal_pipeline_events")
        .select("deal_id, pipeline_stage")
        .order("created_at", { ascending: false })
        .limit(200);

      const dealLatest: Record<string, string> = {};
      (deals || []).forEach((d: any) => {
        if (!dealLatest[d.deal_id]) dealLatest[d.deal_id] = d.pipeline_stage;
      });

      const stageScores: Record<string, number> = {
        inquiry_received: 10, viewing_scheduled: 25,
        negotiation_active: 45, price_agreed: 70,
        escrow_initiated: 85, legal_verification: 90,
        completed: 100, dropped: 0,
      };

      const scored = Object.entries(dealLatest).map(([deal_id, stage]) => ({
        deal_id,
        stage,
        conversion_score: stageScores[stage] || 0,
        completion_probability: Math.min(100, (stageScores[stage] || 0) * 1.1),
      }));

      return new Response(JSON.stringify({ scored_deals: scored }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "generate_followups") {
      // Find deals needing follow-up
      const { data: events } = await supabase
        .from("deal_pipeline_events")
        .select("deal_id, pipeline_stage, stage_timestamp")
        .order("stage_timestamp", { ascending: false })
        .limit(300);

      const dealLatest: Record<string, any> = {};
      (events || []).forEach((e: any) => {
        if (!dealLatest[e.deal_id]) dealLatest[e.deal_id] = e;
      });

      const now = Date.now();
      const actions: any[] = [];
      for (const [dealId, evt] of Object.entries(dealLatest) as any[]) {
        const hoursStale = (now - new Date(evt.stage_timestamp).getTime()) / 3600000;
        if (evt.pipeline_stage === "inquiry_received" && hoursStale > 24) {
          actions.push({ deal_id: dealId, action_type: "reminder_message", trigger_reason: "Inquiry inactive >24h" });
        } else if (evt.pipeline_stage === "negotiation_active" && hoursStale > 48) {
          actions.push({ deal_id: dealId, action_type: "urgency_prompt", trigger_reason: "Negotiation stalled >48h" });
        } else if (evt.pipeline_stage === "price_agreed" && hoursStale > 12) {
          actions.push({ deal_id: dealId, action_type: "escrow_fast_track", trigger_reason: "Price agreed, escrow pending >12h" });
        }
      }

      if (actions.length > 0) {
        await supabase.from("deal_followup_actions").insert(
          actions.map((a) => ({ ...a, action_status: "pending", scheduled_at: new Date().toISOString() }))
        );
      }

      return new Response(JSON.stringify({ generated: actions.length, actions }), {
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
