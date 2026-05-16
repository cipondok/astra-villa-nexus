import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { mode, city, property_type } = body;

    if (mode === "dashboard") {
      // Fetch properties with intelligence scores
      let query = supabase
        .from("properties")
        .select("id, title, city, district, property_type, price, building_size, land_size, status, created_at, demand_heat_score, opportunity_score, investment_score, ai_rental_yield, views_count")
        .order("created_at", { ascending: false })
        .limit(500);

      if (city) query = query.ilike("city", `%${city}%`);
      if (property_type) query = query.ilike("property_type", `%${property_type}%`);

      const { data: properties, error } = await query;
      if (error) throw error;

      const props = properties || [];
      const now = new Date();
      const d30 = new Date(now.getTime() - 30 * 86400000);
      const d90 = new Date(now.getTime() - 90 * 86400000);

      // --- Inquiry trend (simulated from views + demand scores) ---
      const months: Record<string, { inquiries: number; saves: number; listings: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months[key] = { inquiries: 0, saves: 0, listings: 0 };
      }

      for (const p of props) {
        const created = new Date(p.created_at);
        const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
        if (months[key]) {
          months[key].listings += 1;
          months[key].inquiries += Math.round((p.views_count || 0) * 0.12);
          months[key].saves += Math.round((p.demand_heat_score || 0) * 0.8);
        }
      }

      const inquiry_trend = Object.entries(months).map(([month, v]) => ({
        month,
        inquiries: v.inquiries,
        saves: v.saves,
        new_listings: v.listings,
      }));

      // --- Area demand heat ---
      const cityMap: Record<string, { scores: number[]; count: number; prices: number[] }> = {};
      for (const p of props) {
        const c = (p.city || "Unknown").trim();
        if (!cityMap[c]) cityMap[c] = { scores: [], count: 0, prices: [] };
        cityMap[c].scores.push(p.demand_heat_score || 0);
        cityMap[c].count += 1;
        cityMap[c].prices.push(p.price || 0);
      }

      const area_demand_heat = Object.entries(cityMap)
        .map(([area, v]) => {
          const avgHeat = v.scores.reduce((a, b) => a + b, 0) / v.scores.length;
          const avgPrice = v.prices.reduce((a, b) => a + b, 0) / v.prices.length;
          const signal =
            avgHeat >= 75 ? "HIGH_LAUNCH_READINESS" :
            avgHeat >= 50 ? "MODERATE_DEMAND" :
            "LOW_DEMAND_RISK";
          return { area, avg_heat: Math.round(avgHeat), listing_count: v.count, avg_price: Math.round(avgPrice), signal };
        })
        .sort((a, b) => b.avg_heat - a.avg_heat)
        .slice(0, 12);

      // --- Absorption speed estimate ---
      const totalDemand = props.reduce((s, p) => s + (p.demand_heat_score || 0), 0);
      const avgDemand = props.length ? totalDemand / props.length : 0;
      const absorption_speed = {
        avg_days_to_absorb: Math.max(14, Math.round(180 - avgDemand * 1.8)),
        speed_rating: avgDemand >= 70 ? "FAST" : avgDemand >= 45 ? "MODERATE" : "SLOW",
        units_absorbed_30d: props.filter(p => (p.demand_heat_score || 0) > 60 && new Date(p.created_at) > d30).length,
      };

      // --- Budget distribution ---
      const budgetRanges = [
        { label: "< 500jt", min: 0, max: 500e6 },
        { label: "500jt - 1M", min: 500e6, max: 1e9 },
        { label: "1M - 2M", min: 1e9, max: 2e9 },
        { label: "2M - 5M", min: 2e9, max: 5e9 },
        { label: "> 5M", min: 5e9, max: Infinity },
      ];
      const investor_budget_distribution = budgetRanges.map(r => ({
        range: r.label,
        count: props.filter(p => (p.price || 0) >= r.min && (p.price || 0) < r.max).length,
        avg_demand: Math.round(
          props.filter(p => (p.price || 0) >= r.min && (p.price || 0) < r.max)
            .reduce((s, p) => s + (p.demand_heat_score || 0), 0) /
          Math.max(1, props.filter(p => (p.price || 0) >= r.min && (p.price || 0) < r.max).length)
        ),
      }));

      // --- Optimal pricing band ---
      const highDemandProps = props.filter(p => (p.demand_heat_score || 0) >= 65);
      const hdPrices = highDemandProps.map(p => p.price || 0).sort((a, b) => a - b);
      const optimal_pricing = {
        min: hdPrices.length ? hdPrices[Math.floor(hdPrices.length * 0.25)] : 0,
        max: hdPrices.length ? hdPrices[Math.floor(hdPrices.length * 0.75)] : 0,
        sweet_spot: hdPrices.length ? hdPrices[Math.floor(hdPrices.length * 0.5)] : 0,
        sample_size: hdPrices.length,
      };

      // --- Competing projects comparison ---
      const typeMap: Record<string, { count: number; avgScore: number; avgPrice: number }> = {};
      for (const p of props) {
        const t = p.property_type || "unknown";
        if (!typeMap[t]) typeMap[t] = { count: 0, avgScore: 0, avgPrice: 0 };
        typeMap[t].count += 1;
        typeMap[t].avgScore += (p.opportunity_score || 0);
        typeMap[t].avgPrice += (p.price || 0);
      }
      const competing_projects = Object.entries(typeMap).map(([type, v]) => ({
        property_type: type,
        total_listings: v.count,
        avg_opportunity_score: Math.round(v.avgScore / v.count),
        avg_price: Math.round(v.avgPrice / v.count),
      })).sort((a, b) => b.total_listings - a.total_listings).slice(0, 6);

      // --- Forecast signals ---
      const forecast_signals = area_demand_heat.slice(0, 5).map(a => ({
        area: a.area,
        signal: a.signal,
        message:
          a.signal === "HIGH_LAUNCH_READINESS"
            ? `${a.area}: Zona siap launch — demand tinggi (${a.avg_heat}/100)`
            : a.signal === "MODERATE_DEMAND"
            ? `${a.area}: Demand moderat — push marketing disarankan`
            : `${a.area}: Risiko demand rendah — tunda launch`,
        heat: a.avg_heat,
      }));

      // --- Lead pipeline (simulated) ---
      const totalViews = props.reduce((s, p) => s + (p.views_count || 0), 0);
      const lead_pipeline = {
        total_views: totalViews,
        estimated_inquiries: Math.round(totalViews * 0.08),
        estimated_qualified_leads: Math.round(totalViews * 0.025),
        estimated_conversions: Math.round(totalViews * 0.005),
        conversion_rate: totalViews > 0 ? Number((0.5).toFixed(2)) : 0,
      };

      return new Response(
        JSON.stringify({
          data: {
            inquiry_trend,
            area_demand_heat,
            absorption_speed,
            investor_budget_distribution,
            optimal_pricing,
            competing_projects,
            forecast_signals,
            lead_pipeline,
            total_properties_analyzed: props.length,
            generated_at: now.toISOString(),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
