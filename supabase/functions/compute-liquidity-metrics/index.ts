import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// Velocity formula weights
const W = { inquiry: 0.25, negotiation: 0.25, escrow: 0.30, closure_speed: 0.20 };
const MAX_DAYS_CLOSE = 120; // normalization ceiling

function classify(absorptionRate: number): string {
  if (absorptionRate > 0.35) return "hot";
  if (absorptionRate >= 0.15) return "balanced";
  return "slow";
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const today = new Date().toISOString().slice(0, 10);
    const d30 = new Date(Date.now() - 30 * 86400000).toISOString();

    // Get all cities with active listings
    const { data: cityData } = await sb
      .from("properties")
      .select("city")
      .eq("status", "available")
      .limit(1000);

    const cityCounts: Record<string, number> = {};
    (cityData || []).forEach((p: any) => {
      if (p.city) cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    });

    const cities = Object.keys(cityCounts);
    if (cities.length === 0) {
      return new Response(JSON.stringify({ computed: 0, message: "No active listings" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get deal counts by city (using property join)
    const { data: deals } = await sb
      .from("deal_transactions")
      .select("status, property_id, created_at, updated_at, properties!inner(city)")
      .gte("created_at", d30)
      .limit(2000);

    // Get behavioral event counts by city
    const { data: events } = await sb
      .from("behavioral_events")
      .select("city, event_type")
      .not("city", "is", null)
      .gte("created_at", d30)
      .limit(5000);

    // Get intent score density by city (via property lookup)
    const { data: intentData } = await sb
      .from("investor_intent_scores")
      .select("intent_score, intent_level")
      .gte("computed_at", d30)
      .limit(2000);

    // Aggregate per city
    const cityDeals: Record<string, { inquiry: number; negotiation: number; escrow: number; closed: number; totalDaysClose: number; closedCount: number }> = {};
    for (const d of (deals || [])) {
      const city = (d as any).properties?.city;
      if (!city) continue;
      if (!cityDeals[city]) cityDeals[city] = { inquiry: 0, negotiation: 0, escrow: 0, closed: 0, totalDaysClose: 0, closedCount: 0 };
      const s = cityDeals[city];
      if (d.status === "inquiry") s.inquiry++;
      if (d.status === "negotiation") s.negotiation++;
      if (d.status === "escrow" || d.status === "in_escrow") s.escrow++;
      if (d.status === "completed" || d.status === "closed") {
        s.closed++;
        const days = (new Date(d.updated_at).getTime() - new Date(d.created_at).getTime()) / 86400000;
        s.totalDaysClose += days;
        s.closedCount++;
      }
    }

    // Event aggregation
    const cityEvents: Record<string, { views: number; inquiries: number; saves: number }> = {};
    for (const e of (events || [])) {
      if (!e.city) continue;
      if (!cityEvents[e.city]) cityEvents[e.city] = { views: 0, inquiries: 0, saves: 0 };
      if (e.event_type === "property_view") cityEvents[e.city].views++;
      if (e.event_type === "inquiry_submit" || e.event_type === "inquiry_start") cityEvents[e.city].inquiries++;
      if (e.event_type === "property_save") cityEvents[e.city].saves++;
    }

    // Compute metrics per city
    const rows: any[] = [];
    for (const city of cities) {
      const active = cityCounts[city] || 1;
      const d = cityDeals[city] || { inquiry: 0, negotiation: 0, escrow: 0, closed: 0, totalDaysClose: 0, closedCount: 0 };
      const ev = cityEvents[city] || { views: 0, inquiries: 0, saves: 0 };

      const inquiryRate = active > 0 ? d.inquiry / active : 0;
      const negotiationRate = d.inquiry > 0 ? d.negotiation / d.inquiry : 0;
      const escrowConversion = d.negotiation > 0 ? d.escrow / d.negotiation : 0;
      const avgDaysClose = d.closedCount > 0 ? d.totalDaysClose / d.closedCount : MAX_DAYS_CLOSE;
      const closureSpeed = 1 - Math.min(avgDaysClose / MAX_DAYS_CLOSE, 1);

      const velocity = clamp(
        (W.inquiry * Math.min(inquiryRate, 1) +
         W.negotiation * Math.min(negotiationRate, 1) +
         W.escrow * Math.min(escrowConversion, 1) +
         W.closure_speed * closureSpeed) * 100
      );

      const absorption = active > 0 ? d.closed / active : 0;

      // Demand pressure: behavioral signals weighted
      const demandPressure = clamp(
        (ev.views * 0.3 + ev.saves * 1.5 + ev.inquiries * 3) / Math.max(active, 1) * 10
      );

      rows.push({
        date: today,
        city,
        property_type: null,
        price_band: null,
        listings_active: active,
        inquiries_count: d.inquiry + ev.inquiries,
        negotiations_count: d.negotiation,
        escrow_started: d.escrow,
        deals_closed: d.closed,
        avg_days_to_inquiry: null,
        avg_days_to_escrow: null,
        avg_days_to_close: d.closedCount > 0 ? Math.round(avgDaysClose * 10) / 10 : null,
        liquidity_velocity_score: Math.round(velocity * 10) / 10,
        demand_pressure_index: Math.round(demandPressure * 10) / 10,
        absorption_rate: Math.round(absorption * 1000) / 1000,
        market_classification: classify(absorption),
      });
    }

    // Upsert in chunks
    let upserted = 0;
    for (let i = 0; i < rows.length; i += 30) {
      const chunk = rows.slice(i, i + 30);
      const { error } = await sb.from("liquidity_metrics_daily")
        .upsert(chunk, { onConflict: "date,city,property_type,price_band" });
      if (error) console.error("Upsert error:", error);
      else upserted += chunk.length;
    }

    return new Response(JSON.stringify({
      computed: upserted,
      cities: cities.length,
      date: today,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("compute-liquidity-metrics error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});