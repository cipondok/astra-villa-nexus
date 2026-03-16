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

  const start = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: run } = await supabase
    .from("intelligence_worker_runs")
    .insert({ worker_name: "learning_engine", status: "running" })
    .select("id")
    .single();

  try {
    const body = await req.json().catch(() => ({}));
    const collectOutcomes = body.collect_outcomes ?? true;

    // Step 1: Collect learning events from sold properties (price prediction accuracy)
    let eventsCollected = 0;
    if (collectOutcomes) {
      // Find recently sold properties that had AI predictions
      const { data: soldProps } = await supabase
        .from("properties")
        .select("id, price, ai_estimated_price, city")
        .eq("status", "sold")
        .not("ai_estimated_price", "is", null)
        .gt("updated_at", new Date(Date.now() - 7 * 86400000).toISOString())
        .limit(100);

      if (soldProps && soldProps.length > 0) {
        for (const p of soldProps) {
          // Check if we already recorded this
          const { data: existing } = await supabase
            .from("ai_learning_events")
            .select("id")
            .eq("entity_id", p.id)
            .eq("prediction_type", "price_prediction")
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.rpc("record_learning_event", {
              p_entity_type: "property",
              p_entity_id: p.id,
              p_prediction_type: "price_prediction",
              p_predicted: p.ai_estimated_price,
              p_actual: p.price,
              p_metadata: { city: p.city, source: "sold_property" },
            });
            eventsCollected++;
          }
        }
      }
    }

    // Step 2: Execute learning cycle (weight adjustment)
    const { data: cycleResult, error: cycleErr } = await supabase.rpc("execute_learning_cycle");
    if (cycleErr) throw cycleErr;

    // Step 3: Get updated stats
    const { data: stats } = await supabase.rpc("get_learning_stats");

    const durationMs = Date.now() - start;

    if (run?.id) {
      await supabase
        .from("intelligence_worker_runs")
        .update({
          status: "success",
          rows_affected: eventsCollected,
          duration_ms: durationMs,
          completed_at: new Date().toISOString(),
        })
        .eq("id", run.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        worker: "learning_engine",
        events_collected: eventsCollected,
        cycle_result: cycleResult,
        stats,
        duration_ms: durationMs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const durationMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    if (run?.id) {
      await supabase
        .from("intelligence_worker_runs")
        .update({
          status: "error",
          duration_ms: durationMs,
          error_message: msg,
          completed_at: new Date().toISOString(),
        })
        .eq("id", run.id);
    }
    return new Response(
      JSON.stringify({ success: false, error: msg, duration_ms: durationMs }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
