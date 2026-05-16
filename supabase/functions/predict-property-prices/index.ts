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

  const body = await req.json().catch(() => ({}));
  const limit = body.limit ?? 200;

  const { data: run } = await supabase
    .from("intelligence_worker_runs")
    .insert({ worker_name: "price_prediction", status: "running" })
    .select("id")
    .single();

  try {
    const { data, error } = await supabase.rpc("compute_price_predictions", { p_limit: limit });
    if (error) throw error;

    const durationMs = Date.now() - start;
    const rowsAffected = typeof data === "number" ? data : 0;

    if (run?.id) {
      await supabase
        .from("intelligence_worker_runs")
        .update({ status: "success", rows_affected: rowsAffected, duration_ms: durationMs, completed_at: new Date().toISOString() })
        .eq("id", run.id);
    }

    return new Response(
      JSON.stringify({ success: true, worker: "price_prediction", rows_affected: rowsAffected, duration_ms: durationMs }),
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
