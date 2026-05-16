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
      const today = new Date().toISOString().slice(0, 10);

      // Daily KPIs
      const { data: kpis } = await supabase
        .from("founder_daily_kpis")
        .select("metric_name, metric_value")
        .eq("record_date", today);

      const kpiMap: Record<string, number> = {};
      (kpis || []).forEach((k: any) => { kpiMap[k.metric_name] = Number(k.metric_value); });

      // Deal velocity (latest snapshot)
      const { data: dealVelocity } = await supabase
        .from("founder_deal_velocity_snapshot")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(1);

      // Capital flow (latest)
      const { data: capitalFlow } = await supabase
        .from("founder_capital_flow_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1);

      // Supply metrics (latest)
      const { data: supply } = await supabase
        .from("founder_supply_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1);

      // Growth snapshot (latest)
      const { data: growth } = await supabase
        .from("founder_growth_snapshot")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(1);

      // Active alerts
      const { data: alerts } = await supabase
        .from("founder_alerts")
        .select("*")
        .eq("resolved_flag", false)
        .order("generated_at", { ascending: false })
        .limit(10);

      // Trends
      const { data: trends } = await supabase
        .from("founder_trend_metrics")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(20);

      return new Response(JSON.stringify({
        daily_kpis: kpiMap,
        deal_velocity: dealVelocity?.[0] || null,
        capital_flow: capitalFlow?.[0] || null,
        supply: supply?.[0] || null,
        growth: growth?.[0] || null,
        alerts: alerts || [],
        trends: trends || [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (mode === "aggregate") {
      const today = new Date().toISOString().slice(0, 10);

      // Count signups today
      const { count: signups } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today);

      // Count new listings today
      const { count: newListings } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today);

      // Count escrow transactions today
      const { count: escrowToday } = await supabase
        .from("escrow_transactions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today);

      // Active listings total
      const { count: activeListings } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");

      // Deal pipeline events today
      const { count: dealsToday } = await supabase
        .from("deal_pipeline_events")
        .select("event_id", { count: "exact", head: true })
        .gte("created_at", today);

      const metrics = [
        { metric_name: "daily_new_user_signups", metric_value: signups || 0 },
        { metric_name: "daily_new_listings_live", metric_value: newListings || 0 },
        { metric_name: "total_active_listings", metric_value: activeListings || 0 },
        { metric_name: "escrow_transactions_today", metric_value: escrowToday || 0 },
        { metric_name: "new_deals_today", metric_value: dealsToday || 0 },
      ];

      for (const m of metrics) {
        await supabase.from("founder_daily_kpis").upsert(
          { record_date: today, ...m },
          { onConflict: "record_date,metric_name" }
        );
      }

      return new Response(JSON.stringify({ aggregated: metrics.length, date: today }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "resolve_alert") {
      const { alert_id } = await req.json().catch(() => ({}));
      if (alert_id) {
        await supabase.from("founder_alerts").update({ resolved_flag: true }).eq("alert_id", alert_id);
      }
      return new Response(JSON.stringify({ resolved: true }), {
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
