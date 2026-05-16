import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WEIGHTS: Record<string, number> = {
  property_view: 1,
  property_save: 3,
  property_share: 2,
  inquiry_start: 5,
  inquiry_submit: 10,
  negotiation_open: 15,
  negotiation_message: 8,
  escrow_info_view: 8,
  pricing_simulation_run: 4,
  deal_intent_signal: 12,
  agent_profile_view: 2,
  wallet_view: 3,
};

function getIntentLevel(score: number): string {
  if (score >= 30) return "hot";
  if (score >= 15) return "high";
  if (score >= 5) return "medium";
  return "low";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const d30 = new Date(Date.now() - 30 * 86400000).toISOString();

    // Fetch recent events with user_id and property_id
    const { data: events, error } = await sb
      .from("behavioral_events")
      .select("user_id, property_id, event_type, created_at")
      .not("user_id", "is", null)
      .not("property_id", "is", null)
      .gte("created_at", d30)
      .limit(10000);

    if (error) throw error;
    if (!events?.length) {
      return new Response(JSON.stringify({ computed: 0, message: "No events to score" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate scores per user+property
    const scoreMap = new Map<string, { user_id: string; property_id: string; score: number; breakdown: Record<string, number>; lastSignal: string }>();

    for (const evt of events) {
      const key = `${evt.user_id}::${evt.property_id}`;
      const weight = WEIGHTS[evt.event_type] || 0;
      if (weight === 0) continue;

      if (!scoreMap.has(key)) {
        scoreMap.set(key, {
          user_id: evt.user_id,
          property_id: evt.property_id,
          score: 0,
          breakdown: {},
          lastSignal: evt.created_at,
        });
      }
      const entry = scoreMap.get(key)!;
      entry.score += weight;
      entry.breakdown[evt.event_type] = (entry.breakdown[evt.event_type] || 0) + 1;
      if (evt.created_at > entry.lastSignal) entry.lastSignal = evt.created_at;
    }

    // Upsert in chunks
    const rows = Array.from(scoreMap.values()).map(e => ({
      user_id: e.user_id,
      property_id: e.property_id,
      intent_score: e.score,
      intent_level: getIntentLevel(e.score),
      signal_breakdown: e.breakdown,
      last_signal_at: e.lastSignal,
      computed_at: new Date().toISOString(),
    }));

    let upserted = 0;
    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { error: upsertErr } = await sb
        .from("investor_intent_scores")
        .upsert(chunk, { onConflict: "user_id,property_id" });
      if (upsertErr) console.error("Upsert chunk error:", upsertErr);
      else upserted += chunk.length;
    }

    // Compute demand signals per city
    const cityStats = new Map<string, { views: number; saves: number; inquiries: number }>();
    for (const evt of events) {
      // Get city from metadata or event
      const city = (evt as any).city || "unknown";
      if (!cityStats.has(city)) cityStats.set(city, { views: 0, saves: 0, inquiries: 0 });
      const s = cityStats.get(city)!;
      if (evt.event_type === "property_view") s.views++;
      if (evt.event_type === "property_save") s.saves++;
      if (evt.event_type === "inquiry_submit" || evt.event_type === "inquiry_start") s.inquiries++;
    }

    // We need city from behavioral_events - re-query with city
    const { data: cityEvents } = await sb
      .from("behavioral_events")
      .select("city, event_type")
      .not("city", "is", null)
      .gte("created_at", d30)
      .limit(10000);

    const demandMap = new Map<string, { views: number; saves: number; inquiries: number }>();
    for (const evt of (cityEvents || [])) {
      if (!evt.city) continue;
      if (!demandMap.has(evt.city)) demandMap.set(evt.city, { views: 0, saves: 0, inquiries: 0 });
      const s = demandMap.get(evt.city)!;
      if (evt.event_type === "property_view") s.views++;
      if (evt.event_type === "property_save") s.saves++;
      if (["inquiry_submit", "inquiry_start"].includes(evt.event_type)) s.inquiries++;
    }

    const now = new Date();
    const periodStart = new Date(now.getTime() - 30 * 86400000).toISOString();
    const demandRows = Array.from(demandMap.entries()).map(([city, s]) => ({
      city,
      total_views: s.views,
      total_saves: s.saves,
      total_inquiries: s.inquiries,
      demand_velocity_score: s.views + s.saves * 3 + s.inquiries * 5,
      view_to_inquiry_ratio: s.views > 0 ? Math.round(s.inquiries / s.views * 100) / 100 : 0,
      investor_engagement_index: s.saves + s.inquiries * 2,
      period_start: periodStart,
      period_end: now.toISOString(),
      computed_at: now.toISOString(),
    }));

    if (demandRows.length > 0) {
      await sb.from("market_demand_signals")
        .upsert(demandRows, { onConflict: "city,property_type,price_band,period_start" });
    }

    return new Response(JSON.stringify({
      intent_scores_computed: upserted,
      demand_cities_computed: demandRows.length,
      total_events_processed: events.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("compute-intent-scores error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});