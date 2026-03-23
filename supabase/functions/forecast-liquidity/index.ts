import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

function linearTrend(values: number[]): { slope: number; next: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, next: values[0] || 0 };
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((a, v, i) => a + i * v, 0);
  const sumX2 = values.reduce((a, _, i) => a + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, next: intercept + slope * n };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const d30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const forecastDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    // Get historical metrics (last 30 days per city)
    const { data: history } = await sb
      .from("liquidity_metrics_daily")
      .select("city, property_type, price_band, date, liquidity_velocity_score, absorption_rate, avg_days_to_close, demand_pressure_index")
      .gte("date", d30)
      .order("date", { ascending: true })
      .limit(5000);

    if (!history?.length) {
      return new Response(JSON.stringify({ forecasts: 0, message: "No historical data" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by city
    const cityHistory: Record<string, any[]> = {};
    for (const h of history) {
      const key = h.city;
      if (!cityHistory[key]) cityHistory[key] = [];
      cityHistory[key].push(h);
    }

    const forecasts: any[] = [];
    for (const [city, records] of Object.entries(cityHistory)) {
      const velocities = records.map((r: any) => r.liquidity_velocity_score || 0);
      const absorptions = records.map((r: any) => r.absorption_rate || 0);
      const closeDays = records.filter((r: any) => r.avg_days_to_close != null).map((r: any) => r.avg_days_to_close);
      const pressures = records.map((r: any) => r.demand_pressure_index || 0);

      const velTrend = linearTrend(velocities);
      const absTrend = linearTrend(absorptions);
      const closeTrend = linearTrend(closeDays.length > 0 ? closeDays : [90]);
      const pressureTrend = linearTrend(pressures);

      const surgeProbability = Math.min(100, Math.max(0,
        (velTrend.slope > 0 ? 30 : 0) +
        (pressureTrend.slope > 0.5 ? 30 : pressureTrend.slope > 0 ? 15 : 0) +
        (absTrend.next > 0.3 ? 25 : absTrend.next > 0.15 ? 10 : 0) +
        (velocities.length >= 7 ? 15 : 5)
      ));

      const oversupplyRisk = Math.min(100, Math.max(0,
        (absTrend.next < 0.1 ? 40 : absTrend.next < 0.15 ? 20 : 0) +
        (velTrend.slope < -1 ? 30 : velTrend.slope < 0 ? 15 : 0) +
        (pressureTrend.slope < 0 ? 20 : 0)
      ));

      const trend = velTrend.slope > 0.5 ? "up" : velTrend.slope < -0.5 ? "down" : "flat";

      forecasts.push({
        city,
        property_type: null,
        price_band: null,
        forecast_date: forecastDate,
        predicted_absorption_rate: Math.max(0, Math.round(absTrend.next * 1000) / 1000),
        predicted_avg_days_to_close: Math.max(1, Math.round(closeTrend.next)),
        predicted_velocity_score: Math.max(0, Math.min(100, Math.round(velTrend.next * 10) / 10)),
        surge_probability: Math.round(surgeProbability),
        oversupply_risk: Math.round(oversupplyRisk),
        forecast_trend: trend,
        confidence_score: Math.min(95, 40 + records.length * 3),
        model_version: "v1_linear_trend",
      });
    }

    // Upsert forecasts
    let upserted = 0;
    for (let i = 0; i < forecasts.length; i += 30) {
      const chunk = forecasts.slice(i, i + 30);
      const { error } = await sb.from("liquidity_forecasts")
        .upsert(chunk, { onConflict: "city,property_type,price_band,forecast_date" });
      if (error) console.error("Forecast upsert error:", error);
      else upserted += chunk.length;
    }

    return new Response(JSON.stringify({ forecasts: upserted, cities: Object.keys(cityHistory).length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("forecast-liquidity error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});