import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WorkerResult {
  worker: string;
  status: "success" | "error";
  items_processed: number;
  duration_ms: number;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const workers: string[] = body.workers ?? [
      "opportunity_scoring",
      "price_prediction",
      "heat_clusters",
      "risk_levels",
      "heat_sync",
      "deal_alerts",
    ];
    const batchSize: number = body.batch_size ?? 200;

    const results: WorkerResult[] = [];

    for (const worker of workers) {
      const runStart = Date.now();
      let runId: string | null = null;

      // Log run start
      const { data: runRow } = await supabase
        .from("autopilot_worker_runs")
        .insert({ worker_name: worker, status: "running" })
        .select("id")
        .single();
      runId = runRow?.id ?? null;

      try {
        let result: { items: number; ms: number } = { items: 0, ms: 0 };

        switch (worker) {
          case "opportunity_scoring": {
            const { data, error } = await supabase.rpc(
              "batch_refresh_opportunity_scores",
              { p_limit: batchSize }
            );
            if (error) throw error;
            result = {
              items: data?.updated ?? 0,
              ms: data?.duration_ms ?? Date.now() - runStart,
            };
            break;
          }

          case "price_prediction": {
            const { data, error } = await supabase.rpc(
              "compute_price_predictions",
              { p_limit: batchSize }
            );
            if (error) throw error;
            result = {
              items: data?.properties_predicted ?? 0,
              ms: data?.duration_ms ?? Date.now() - runStart,
            };
            break;
          }

          case "heat_clusters": {
            const { data, error } = await supabase.rpc(
              "compute_market_heat_clusters",
              { p_min_properties: 3 }
            );
            if (error) throw error;
            result = {
              items: data?.clusters_computed ?? 0,
              ms: data?.duration_ms ?? Date.now() - runStart,
            };
            break;
          }

          case "risk_levels": {
            const { data, error } = await supabase.rpc("compute_risk_levels", {
              p_limit: batchSize,
            });
            if (error) throw error;
            result = {
              items: data?.properties_updated ?? 0,
              ms: data?.duration_ms ?? Date.now() - runStart,
            };
            break;
          }

          case "heat_sync": {
            const { data, error } = await supabase.rpc(
              "sync_heat_scores_to_properties"
            );
            if (error) throw error;
            result = {
              items: data?.properties_updated ?? 0,
              ms: data?.duration_ms ?? Date.now() - runStart,
            };
            break;
          }

          case "deal_alerts": {
            const { data, error } = await supabase.rpc(
              "generate_deal_alerts",
              { p_limit: batchSize }
            );
            if (error) throw error;
            result = {
              items: data?.alerts_generated ?? 0,
              ms: data?.duration_ms ?? Date.now() - runStart,
            };
            break;
          }

          default:
            throw new Error(`Unknown worker: ${worker}`);
        }

        // Log success
        if (runId) {
          await supabase
            .from("autopilot_worker_runs")
            .update({
              status: "completed",
              items_processed: result.items,
              duration_ms: result.ms,
              completed_at: new Date().toISOString(),
            })
            .eq("id", runId);
        }

        results.push({
          worker,
          status: "success",
          items_processed: result.items,
          duration_ms: result.ms,
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";

        if (runId) {
          await supabase
            .from("autopilot_worker_runs")
            .update({
              status: "failed",
              error_message: errorMsg,
              completed_at: new Date().toISOString(),
              duration_ms: Date.now() - runStart,
            })
            .eq("id", runId);
        }

        results.push({
          worker,
          status: "error",
          items_processed: 0,
          duration_ms: Date.now() - runStart,
          error: errorMsg,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        workers_executed: results.length,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Autopilot worker error:", errorMsg);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
