import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase config" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const threshold = Number(body.threshold) || 60;
    const batchLimit = Math.min(Number(body.limit) || 50, 100);
    const mode = body.mode || "auto"; // "auto" = scan + fix, "scan_only", "fix_only"

    const startTime = Date.now();
    const results: Record<string, unknown> = {
      mode,
      threshold,
      batchLimit,
      timestamp: new Date().toISOString(),
    };

    // ── Step 1: Scan unanalyzed properties ──
    if (mode === "auto" || mode === "scan_only") {
      // Use RPC that anti-joins properties ⟂ property_seo_analysis
      // (replaces prior full 10k-row fetch — see Phase 3 perf pass).
      const { data: candidates, error: rpcErr } = await supabase.rpc(
        "get_unanalyzed_property_ids",
        { _limit: batchLimit },
      );

      if (rpcErr) {
        results.scan_error = rpcErr.message;
        results.scanned = 0;
      } else if ((candidates || []).length > 0) {
        const { data: analyzeResult, error: analyzeErr } = await supabase.functions.invoke("ai-engine", {
          body: {
            mode: "seo_generate",
            payload: { action: "analyze-batch", limit: candidates!.length, filter: "unanalyzed" },
          },
        });

        results.scanned = analyzeResult?.analyzed || 0;
        if (analyzeErr) results.scan_error = analyzeErr.message;
      } else {
        results.scanned = 0;
        results.scan_message = "No unanalyzed properties found";
      }
    }

    // ── Step 2: Auto-fix weak listings ──
    if (mode === "auto" || mode === "fix_only") {
      const { data: fixResult, error: fixErr } = await supabase.functions.invoke("ai-engine", {
        body: {
          mode: "seo_generate",
          payload: { action: "auto-optimize", threshold, limit: batchLimit },
        },
      });

      results.optimized = fixResult?.optimized || 0;
      if (fixErr) results.fix_error = fixErr.message;
    }

    // ── Step 3: Log scheduler run ──
    const duration = Date.now() - startTime;
    results.duration_ms = duration;

    try {
      await supabase.from("seo_ai_actions").insert({
        property_id: "00000000-0000-0000-0000-000000000000", // system action
        action_type: "scheduler_run",
        old_score: 0,
        new_score: 0,
        ai_model: "seo-scheduler",
        triggered_by: "cron",
        metadata: results,
      });
    } catch (e) {
      console.warn("Failed to log scheduler run:", e);
    }

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SEO scheduler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Scheduler failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
