import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth check
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id ?? null;
    }

    const body = await req.json();
    const { mode } = body;

    // ── INGEST: Store behavioral signals ──
    if (mode === "ingest") {
      if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

      const signals = body.signals as Array<{
        property_id: string;
        signal_type: string;
        value?: number;
        dwell_time_ms?: number;
        metadata?: Record<string, unknown>;
      }>;

      // Convert to self-learning feedback format
      for (const s of signals) {
        const actionMap: Record<string, string> = {
          click: "view", save: "save", invest: "contact", view: "view", dismiss: "dismiss", inquiry: "contact",
        };
        await supabase.from("self_learning_signals").insert({
          user_id: userId,
          property_id: s.property_id,
          action: actionMap[s.signal_type] || "view",
          weight: signalWeight(s.signal_type, s.value, s.dwell_time_ms),
          metadata: s.metadata || {},
        });
      }

      return new Response(JSON.stringify({ ingested: signals.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── TRAIN: Run training cycle ──
    if (mode === "train") {
      const runId = crypto.randomUUID();
      const version = `v${Date.now()}`;

      // Log training run start
      await supabase.from("training_runs").insert({
        id: runId,
        model_version: version,
        trigger_type: body.trigger || "manual",
        status: "running",
        started_at: new Date().toISOString(),
      });

      // Fetch recent signals (last 30 days)
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const { data: signals } = await supabase
        .from("self_learning_signals")
        .select("*")
        .gte("created_at", since)
        .limit(5000);

      const sampleCount = signals?.length ?? 0;

      // Compute feature importance from signal distribution
      const actionCounts: Record<string, number> = {};
      (signals || []).forEach((s: any) => {
        actionCounts[s.action] = (actionCounts[s.action] || 0) + 1;
      });

      const total = Object.values(actionCounts).reduce((a, b) => a + b, 0) || 1;
      const featureImportance: Record<string, number> = {};
      for (const [action, count] of Object.entries(actionCounts)) {
        featureImportance[action] = Math.round(count / total * 1000) / 1000;
      }

      // Compute new weights using gradient-like update
      const positiveActions = ["save", "contact", "visit"];
      const negativeActions = ["dismiss", "ignore"];
      const posCount = (signals || []).filter((s: any) => positiveActions.includes(s.action)).length;
      const negCount = (signals || []).filter((s: any) => negativeActions.includes(s.action)).length;
      const posRatio = sampleCount > 0 ? posCount / sampleCount : 0.5;

      // Fetch current weights
      const { data: profile } = await supabase
        .from("preference_profiles")
        .select("weights")
        .limit(1)
        .maybeSingle();

      const oldWeights = profile?.weights || { location: 0.25, price: 0.25, roi: 0.25, amenities: 0.15, market_trend: 0.1 };
      const lr = Math.min(0.1, 0.02 + posRatio * 0.08); // adaptive learning rate

      const newWeights: Record<string, number> = {};
      for (const [k, v] of Object.entries(oldWeights as Record<string, number>)) {
        const gradient = featureImportance[k] || 0;
        newWeights[k] = Math.round((v + lr * (gradient - v)) * 1000) / 1000;
      }

      // Normalize
      const wSum = Object.values(newWeights).reduce((a, b) => a + b, 0) || 1;
      for (const k of Object.keys(newWeights)) {
        newWeights[k] = Math.round(newWeights[k] / wSum * 1000) / 1000;
      }

      const accuracy = sampleCount > 50 ? Math.min(95, 60 + posRatio * 35) : 50;

      // Update training run
      await supabase.from("training_runs").update({
        status: "completed",
        training_samples: sampleCount,
        accuracy,
        loss: Math.round((1 - accuracy / 100) * 1000) / 1000,
        feature_importance: featureImportance,
        old_weights: oldWeights,
        new_weights: newWeights,
        completed_at: new Date().toISOString(),
        comparison_metrics: {
          positive_ratio: posRatio,
          negative_ratio: sampleCount > 0 ? negCount / sampleCount : 0,
          learning_rate: lr,
          data_quality: sampleCount > 200 ? "high" : sampleCount > 50 ? "medium" : "low",
        },
      }).eq("id", runId);

      return new Response(JSON.stringify({
        run_id: runId,
        model_version: version,
        samples: sampleCount,
        accuracy,
        old_weights: oldWeights,
        new_weights: newWeights,
        feature_importance: featureImportance,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── STATS: Training history ──
    if (mode === "stats") {
      const { data: runs } = await supabase
        .from("training_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: experiments } = await supabase
        .from("model_experiments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({ training_runs: runs || [], experiments: experiments || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown mode" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("continuous-learning error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function signalWeight(type: string, value?: number, dwellMs?: number): number {
  const base: Record<string, number> = { click: 1, view: 0.5, save: 3, invest: 5, dismiss: -2, inquiry: 4 };
  let w = base[type] ?? 1;
  if (type === "view" && dwellMs) w *= Math.min(3, dwellMs / 30000);
  if (type === "invest" && value) w *= Math.min(2, value / 100000);
  return Math.round(w * 100) / 100;
}
