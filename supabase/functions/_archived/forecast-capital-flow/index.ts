import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Linear Trend Projection ──
function linearTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += values[i]; sumXY += i * values[i]; sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Fetch historical allocation signals (last 30 days, grouped by city)
    const { data: allocHistory } = await sb
      .from("capital_allocation_signals")
      .select("city, capital_efficiency_score, demand_pressure_index, liquidity_velocity_score, price_momentum_score, risk_volatility_score, created_at")
      .order("created_at", { ascending: true })
      .limit(300);

    if (!allocHistory?.length) {
      return new Response(JSON.stringify({ message: "No allocation history for forecasting", forecasts: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by city
    const cityHistory = new Map<string, any[]>();
    for (const row of allocHistory) {
      if (!row.city) continue;
      const arr = cityHistory.get(row.city) || [];
      arr.push(row);
      cityHistory.set(row.city, arr);
    }

    const forecasts: any[] = [];

    for (const [city, history] of cityHistory) {
      const efficiencies = history.map((h: any) => h.capital_efficiency_score || 0);
      const demands = history.map((h: any) => h.demand_pressure_index || 0);
      const liquidities = history.map((h: any) => h.liquidity_velocity_score || 0);
      const momenta = history.map((h: any) => h.price_momentum_score || 0);
      const risks = history.map((h: any) => h.risk_volatility_score || 0);

      const effTrend = linearTrend(efficiencies);
      const demTrend = linearTrend(demands);
      const liqTrend = linearTrend(liquidities);
      const momTrend = linearTrend(momenta);

      const latestEff = efficiencies[efficiencies.length - 1] || 0;
      const latestRisk = risks[risks.length - 1] || 0;

      // Predicted inflow = projected efficiency + demand momentum
      const predictedInflow = Math.min(Math.max(
        Math.round(latestEff + effTrend * 10 + demTrend * 5), 0
      ), 100);

      // Hotspot probability
      const hotspotProb = Math.min(Math.max(
        Math.round((effTrend > 0 ? 40 : 10) + (demTrend > 0 ? 30 : 0) + (momTrend > 0 ? 20 : 0) + (liqTrend > 0 ? 10 : 0)),
        0
      ), 100);

      // Saturation risk
      const saturationRisk = Math.min(Math.max(
        Math.round(latestRisk * 0.5 + (effTrend < 0 ? 30 : 0) + (demTrend < -2 ? 20 : 0)),
        0
      ), 100);

      // Rotation signal
      let rotation = "stable";
      if (effTrend > 3 && demTrend > 2) rotation = "capital_inflow_accelerating";
      else if (effTrend < -3) rotation = "capital_rotation_out";
      else if (momTrend > 3 && effTrend > 0) rotation = "premium_segment_shift";

      // Forecast trend
      let trend = "stable";
      if (effTrend > 2) trend = "rising";
      else if (effTrend < -2) trend = "declining";

      forecasts.push({
        city,
        segment: "mixed",
        predicted_inflow_score: predictedInflow,
        hotspot_probability: hotspotProb,
        saturation_risk: saturationRisk,
        rotation_signal: rotation,
        forecast_horizon_days: 30,
        forecast_trend: trend,
      });
    }

    // Insert forecasts
    let inserted = 0;
    for (let i = 0; i < forecasts.length; i += 50) {
      const { error } = await sb.from("capital_flow_forecasts").insert(forecasts.slice(i, i + 50));
      if (!error) inserted += Math.min(50, forecasts.length - i);
    }

    const sorted = [...forecasts].sort((a, b) => b.predicted_inflow_score - a.predicted_inflow_score);

    return new Response(JSON.stringify({
      forecasts_generated: inserted,
      top_inflow_city: sorted[0]?.city || null,
      hotspot_alerts: sorted.filter(f => f.hotspot_probability > 60).map(f => ({ city: f.city, probability: f.hotspot_probability })),
      saturation_warnings: sorted.filter(f => f.saturation_risk > 50).map(f => ({ city: f.city, risk: f.saturation_risk })),
      rotation_signals: sorted.filter(f => f.rotation_signal !== "stable").map(f => ({ city: f.city, signal: f.rotation_signal })),
      computed_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("forecast-capital-flow error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
