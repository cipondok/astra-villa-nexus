import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProcessedGroup {
  event_type: string;
  count: number;
  workers_dispatched: string[];
  duration_ms: number;
}

// Maps event types → which worker edge functions to call
const EVENT_WORKER_MAP: Record<string, string[]> = {
  property_created: ["compute-opportunity-scores", "scan-deal-opportunities"],
  price_changed: ["compute-opportunity-scores", "scan-deal-opportunities", "predict-property-prices"],
  status_changed: ["aggregate-market-heat"],
  demand_spike: ["aggregate-market-heat", "compute-opportunity-scores"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const start = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const batchLimit = body.limit ?? 100;
    const priorityFilter: string | undefined = body.priority;

    // 1. Claim unprocessed signals
    let query = supabase
      .from("ai_event_signals")
      .select("id, event_type, entity_type, entity_id, priority_level, payload")
      .eq("is_processed", false)
      .order("created_at", { ascending: true })
      .limit(batchLimit);

    if (priorityFilter) {
      query = query.eq("priority_level", priorityFilter);
    }

    const { data: signals, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    if (!signals || signals.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No pending signals", processed: 0, duration_ms: Date.now() - start }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Mark as processed (claim)
    const signalIds = signals.map((s) => s.id);
    await supabase
      .from("ai_event_signals")
      .update({ is_processed: true, processed_at: new Date().toISOString(), processed_by: "process-ai-events" })
      .in("id", signalIds);

    // 3. Group by event_type and determine which workers to dispatch
    const grouped = new Map<string, typeof signals>();
    for (const sig of signals) {
      const list = grouped.get(sig.event_type) ?? [];
      list.push(sig);
      grouped.set(sig.event_type, list);
    }

    // 4. Collect unique workers to dispatch
    const workersToRun = new Set<string>();
    for (const eventType of grouped.keys()) {
      const workers = EVENT_WORKER_MAP[eventType] ?? [];
      workers.forEach((w) => workersToRun.add(w));
    }

    // 5. Dispatch workers in parallel (fire-and-forget via edge function calls)
    const dispatchResults: Array<{ worker: string; status: string; duration_ms: number }> = [];

    const dispatches = Array.from(workersToRun).map(async (workerName) => {
      const wStart = Date.now();
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/${workerName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ batch_size: 100, source: "event_pipeline" }),
        });
        const wDuration = Date.now() - wStart;
        if (!resp.ok) {
          const errText = await resp.text().catch(() => "unknown");
          dispatchResults.push({ worker: workerName, status: `error:${resp.status}`, duration_ms: wDuration });
        } else {
          dispatchResults.push({ worker: workerName, status: "success", duration_ms: wDuration });
        }
      } catch (err) {
        dispatchResults.push({ worker: workerName, status: `error:${err instanceof Error ? err.message : "unknown"}`, duration_ms: Date.now() - wStart });
      }
    });

    await Promise.all(dispatches);

    // 6. Log the run
    await supabase.from("intelligence_worker_runs").insert({
      worker_name: "event_processor",
      status: "success",
      rows_affected: signals.length,
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    });

    // 7. Build response
    const results: ProcessedGroup[] = [];
    for (const [eventType, sigs] of grouped.entries()) {
      results.push({
        event_type: eventType,
        count: sigs.length,
        workers_dispatched: EVENT_WORKER_MAP[eventType] ?? [],
        duration_ms: Date.now() - start,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        signals_processed: signals.length,
        event_groups: results,
        workers_dispatched: dispatchResults,
        duration_ms: Date.now() - start,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    await supabase.from("intelligence_worker_runs").insert({
      worker_name: "event_processor",
      status: "error",
      duration_ms: Date.now() - start,
      error_message: err instanceof Error ? err.message : String(err),
      completed_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
