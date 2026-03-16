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
    .insert({ worker_name: "market_heat", status: "running" })
    .select("id")
    .single();

  try {
    // Step 1: Aggregate clusters
    const { data: clusterCount, error: e1 } = await supabase.rpc("aggregate_market_clusters");
    if (e1) throw e1;

    // Step 2: Sync heat scores back to properties
    const { data: syncCount, error: e2 } = await supabase.rpc("sync_demand_heat_scores", { p_batch_size: 1000 });
    if (e2) throw e2;

    const durationMs = Date.now() - start;
    const totalRows = (typeof clusterCount === "number" ? clusterCount : 0) + (typeof syncCount === "number" ? syncCount : 0);

    if (run?.id) {
      await supabase
        .from("intelligence_worker_runs")
        .update({ status: "success", rows_affected: totalRows, duration_ms: durationMs, completed_at: new Date().toISOString() })
        .eq("id", run.id);
    }

    return new Response(
      JSON.stringify({ success: true, worker: "market_heat", clusters_updated: clusterCount, properties_synced: syncCount, duration_ms: durationMs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const durationMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    if (run?.id) {
      await supabase
        .from("intelligence_worker_runs")
        .update({ status: "error", duration_ms: durationMs, error_message: msg, completed_at: new Date().toISOString() })
        .eq("id", run.id);
    }
    return new Response(
      JSON.stringify({ success: false, error: msg, duration_ms: durationMs }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
