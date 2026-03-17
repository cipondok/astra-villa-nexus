import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const mode = body.mode || "explore";

    // ── EXPLORE: get properties within viewport bounds ──
    if (mode === "explore") {
      const { bounds, filters } = body;
      if (!bounds) {
        return new Response(JSON.stringify({ error: "bounds required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let query = supabase
        .from("properties")
        .select(
          "id, title, city, district, state, price, property_type, bedrooms, area_sqm, latitude, longitude, image_url, developer, opportunity_score, demand_score, listing_type"
        )
        .gte("latitude", bounds.south)
        .lte("latitude", bounds.north)
        .gte("longitude", bounds.west)
        .lte("longitude", bounds.east)
        .eq("status", "active")
        .limit(500);

      // Apply filters
      if (filters?.property_type) query = query.eq("property_type", filters.property_type);
      if (filters?.min_price) query = query.gte("price", filters.min_price);
      if (filters?.max_price) query = query.lte("price", filters.max_price);
      if (filters?.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
      if (filters?.min_score) query = query.gte("opportunity_score", filters.min_score);

      const { data: properties, error } = await query;
      if (error) throw error;

      // Compute heatmap data points
      const heatPoints = (properties || []).map((p: any) => ({
        lat: p.latitude,
        lng: p.longitude,
        weight: (p.opportunity_score || 50) / 100,
        demand: (p.demand_score || 50) / 100,
        price: p.price || 0,
      }));

      // Compute zone summaries grouped by city
      const zoneMap: Record<string, any> = {};
      for (const p of properties || []) {
        const key = p.city || "Unknown";
        if (!zoneMap[key]) {
          zoneMap[key] = {
            city: key,
            count: 0,
            total_score: 0,
            total_demand: 0,
            total_price: 0,
            avg_lat: 0,
            avg_lng: 0,
          };
        }
        const z = zoneMap[key];
        z.count++;
        z.total_score += p.opportunity_score || 50;
        z.total_demand += p.demand_score || 50;
        z.total_price += p.price || 0;
        z.avg_lat += p.latitude || 0;
        z.avg_lng += p.longitude || 0;
      }

      const zones = Object.values(zoneMap).map((z: any) => ({
        city: z.city,
        count: z.count,
        avg_score: Math.round(z.total_score / z.count),
        avg_demand: Math.round(z.total_demand / z.count),
        avg_price: Math.round(z.total_price / z.count),
        lat: z.avg_lat / z.count,
        lng: z.avg_lng / z.count,
        classification:
          z.total_score / z.count >= 80
            ? "hot_investment"
            : z.total_score / z.count >= 60
            ? "growing"
            : "stable",
      }));

      return new Response(
        JSON.stringify({
          properties: properties || [],
          heat_points: heatPoints,
          zones,
          total: (properties || []).length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ZONE_STATS: get detailed stats for a specific city/zone ──
    if (mode === "zone_stats") {
      const { city } = body;
      if (!city) {
        return new Response(JSON.stringify({ error: "city required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: props, error } = await supabase
        .from("properties")
        .select("price, property_type, bedrooms, opportunity_score, demand_score, area_sqm, listing_type")
        .eq("city", city)
        .eq("status", "active")
        .limit(1000);

      if (error) throw error;

      const total = props?.length || 0;
      const avgPrice = total ? Math.round(props!.reduce((s: number, p: any) => s + (p.price || 0), 0) / total) : 0;
      const avgScore = total ? Math.round(props!.reduce((s: number, p: any) => s + (p.opportunity_score || 0), 0) / total) : 0;
      const avgDemand = total ? Math.round(props!.reduce((s: number, p: any) => s + (p.demand_score || 0), 0) / total) : 0;
      const eliteCount = props?.filter((p: any) => (p.opportunity_score || 0) >= 85).length || 0;

      // Type distribution
      const typeDist: Record<string, number> = {};
      for (const p of props || []) {
        const t = p.property_type || "Other";
        typeDist[t] = (typeDist[t] || 0) + 1;
      }

      return new Response(
        JSON.stringify({
          city,
          total_properties: total,
          avg_price: avgPrice,
          avg_opportunity_score: avgScore,
          avg_demand_score: avgDemand,
          elite_opportunities: eliteCount,
          type_distribution: typeDist,
          classification: avgScore >= 80 ? "hot_investment" : avgScore >= 60 ? "growing" : "stable",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── COMPARE_ZONES: compare two cities side-by-side ──
    if (mode === "compare_zones") {
      const { cities } = body;
      if (!cities || !Array.isArray(cities) || cities.length < 2) {
        return new Response(JSON.stringify({ error: "cities array (2+) required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = [];
      for (const city of cities.slice(0, 4)) {
        const { data: props } = await supabase
          .from("properties")
          .select("price, opportunity_score, demand_score, property_type, bedrooms, area_sqm")
          .eq("city", city)
          .eq("status", "active")
          .limit(500);

        const total = props?.length || 0;
        const avgPrice = total ? Math.round(props!.reduce((s: number, p: any) => s + (p.price || 0), 0) / total) : 0;
        const avgScore = total ? Math.round(props!.reduce((s: number, p: any) => s + (p.opportunity_score || 0), 0) / total) : 0;
        const avgDemand = total ? Math.round(props!.reduce((s: number, p: any) => s + (p.demand_score || 0), 0) / total) : 0;
        const eliteCount = props?.filter((p: any) => (p.opportunity_score || 0) >= 85).length || 0;

        results.push({
          city,
          total_properties: total,
          avg_price: avgPrice,
          avg_opportunity_score: avgScore,
          avg_demand_score: avgDemand,
          elite_count: eliteCount,
          elite_ratio: total ? Math.round((eliteCount / total) * 100) : 0,
        });
      }

      return new Response(JSON.stringify({ comparisons: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("investment-map-explorer error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
