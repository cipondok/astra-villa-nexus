import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { deal_id, action } = await req.json();

    if (action === "score") {
      // Fetch deal data
      const { data: deal } = await supabase
        .from("deal_pipeline")
        .select("*")
        .eq("id", deal_id)
        .single();

      if (!deal) {
        return new Response(
          JSON.stringify({ error: "Deal not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Calculate readiness score
      const priceGap = deal.price_gap_percentage ?? 100;
      const stage = deal.stage || "inquiry";
      const stageWeights: Record<string, number> = {
        inquiry: 5,
        viewing_scheduled: 15,
        viewing_completed: 25,
        negotiation: 45,
        offer_submitted: 65,
        offer_accepted: 85,
        escrow_initiated: 95,
      };
      const stageScore = stageWeights[stage] || 0;

      // Price proximity score (closer gap = higher score)
      const priceScore = Math.max(0, 100 - Math.abs(priceGap) * 10);

      // Composite probability
      const probability = Math.round(stageScore * 0.5 + priceScore * 0.3 + (deal.demand_score ?? 50) * 0.2);

      // Classify readiness
      let readinessStatus = "not_ready";
      if (probability >= 75) readinessStatus = "escrow_ready";
      else if (probability >= 45) readinessStatus = "approaching_agreement";

      // Upsert readiness event
      await supabase.from("escrow_readiness_events").insert({
        deal_id,
        investor_user_id: user.id,
        negotiation_stage: stage,
        price_gap_percentage: priceGap,
        agreement_probability_score: probability,
        readiness_status: readinessStatus,
        intent_signals: {
          stage_score: stageScore,
          price_score: priceScore,
          demand_score: deal.demand_score ?? 50,
        },
      });

      // If escrow_ready, schedule nudge actions
      if (readinessStatus === "escrow_ready") {
        // 24h deadline reminder
        const reminderTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("escrow_commitment_actions").insert({
          deal_id,
          user_id: user.id,
          action_type: "deadline_reminder",
          scheduled_time: reminderTime,
        });
      }

      return new Response(
        JSON.stringify({
          readiness_status: readinessStatus,
          probability,
          price_gap: priceGap,
          stage,
          suggested_deposit: Math.max(2000000, Math.round((deal.price || 500000000) * 0.01)),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "nudge_check") {
      // Check pending nudges for this deal
      const { data: pendingActions } = await supabase
        .from("escrow_commitment_actions")
        .select("*")
        .eq("deal_id", deal_id)
        .eq("status", "pending")
        .lte("scheduled_time", new Date().toISOString())
        .order("scheduled_time", { ascending: true });

      return new Response(
        JSON.stringify({ pending_actions: pendingActions || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
