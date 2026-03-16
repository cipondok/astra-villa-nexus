import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WorkerResult {
  worker: string;
  status: "success" | "error";
  rows_affected: number;
  duration_ms: number;
  error?: string;
}

const WORKER_RPC_MAP: Record<string, { rpc: string; params?: Record<string, unknown> }> = {
  opportunity_scoring: { rpc: "recalc_opportunity_scores", params: { p_batch_size: 500 } },
  deal_alerts: { rpc: "scan_deal_alerts", params: { p_threshold: 75 } },
  market_clusters: { rpc: "aggregate_market_clusters" },
  demand_heat_sync: { rpc: "sync_demand_heat_scores", params: { p_batch_size: 500 } },
  portfolio_snapshots: { rpc: "compute_portfolio_snapshots" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const requestedWorkers: string[] = body.workers ?? Object.keys(WORKER_RPC_MAP);
    const batchSize: number = body.batch_size ?? 500;

    const results: WorkerResult[] = [];

    for (const workerName of requestedWorkers) {
      const config = WORKER_RPC_MAP[workerName];
      if (!config) {
        results.push({ worker: workerName, status: "error", rows_affected: 0, duration_ms: 0, error: "Unknown worker" });
        continue;
      }

      // Log start
      const { data: runRow } = await supabase
        .from("intelligence_worker_runs")
        .insert({ worker_name: workerName, status: "running" })
        .select("id")
        .single();

      const start = Date.now();
      try {
        const params = config.params ? { ...config.params } : {};
        if (params.p_batch_size !== undefined) params.p_batch_size = batchSize;

        const { data, error } = await supabase.rpc(config.rpc, params);
        const durationMs = Date.now() - start;
        const rowsAffected = typeof data === "number" ? data : 0;

        if (error) throw error;

        // Log success
        if (runRow?.id) {
          await supabase
            .from("intelligence_worker_runs")
            .update({ status: "success", rows_affected: rowsAffected, duration_ms: durationMs, completed_at: new Date().toISOString() })
            .eq("id", runRow.id);
        }

        results.push({ worker: workerName, status: "success", rows_affected: rowsAffected, duration_ms: durationMs });
      } catch (err) {
        const durationMs = Date.now() - start;
        const errorMsg = err instanceof Error ? err.message : String(err);

        if (runRow?.id) {
          await supabase
            .from("intelligence_worker_runs")
            .update({ status: "error", duration_ms: durationMs, error_message: errorMsg, completed_at: new Date().toISOString() })
            .eq("id", runRow.id);
        }

        results.push({ worker: workerName, status: "error", rows_affected: 0, duration_ms: durationMs, error: errorMsg });
      }
    }

    return new Response(
      JSON.stringify({
        success: results.every((r) => r.status === "success"),
        workers_executed: results.length,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
