import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "status";

    // ── Refresh FX Rates ──
    if (action === "refresh_fx") {
      return handleRefreshFX(supabase);
    }

    // ── Compute Global Opportunity Scores ──
    if (action === "compute_scores") {
      const regionId = body.region_id;
      if (!regionId) return json({ error: "region_id required" }, 400);
      const { data, error } = await supabase.rpc("compute_global_opportunity", { p_region_id: regionId });
      if (error) return json({ error: error.message }, 500);
      return json({ data });
    }

    // ── Compute Priority Index (routing algorithm) ──
    if (action === "compute_routing") {
      return handleComputeRouting(supabase, body.region_id);
    }

    // ── Get Global Dashboard Data ──
    if (action === "dashboard") {
      return handleDashboard(supabase);
    }

    // ── Update Region Config ──
    if (action === "update_region") {
      const { region_id, updates } = body;
      if (!region_id || !updates) return json({ error: "region_id and updates required" }, 400);
      const { error } = await supabase
        .from("global_regions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("region_id", region_id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    // ── Change Expansion Phase ──
    if (action === "change_phase") {
      const { region_id, new_phase, notes, performed_by } = body;
      if (!region_id || !new_phase) return json({ error: "region_id and new_phase required" }, 400);

      const { data: region } = await supabase
        .from("global_regions")
        .select("expansion_phase")
        .eq("region_id", region_id)
        .single();

      await supabase.from("global_expansion_log").insert({
        region_id,
        event_type: "phase_change",
        from_phase: region?.expansion_phase,
        to_phase: new_phase,
        notes,
        performed_by,
      });

      const updatePayload: any = { expansion_phase: new_phase, updated_at: new Date().toISOString() };
      if (new_phase === "live") {
        updatePayload.is_active = true;
        updatePayload.launched_at = new Date().toISOString();
      }
      if (new_phase === "paused") updatePayload.is_active = false;

      await supabase.from("global_regions").update(updatePayload).eq("region_id", region_id);
      return json({ success: true, from: region?.expansion_phase, to: new_phase });
    }

    // ── Status ──
    const { data: regions } = await supabase
      .from("global_regions")
      .select("region_id, region_name, country_code, is_active, expansion_phase, compute_tier")
      .order("is_primary", { ascending: false });
    return json({ regions });

  } catch (err) {
    console.error("Global engine error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

// ── FX Rate Refresh ──
async function handleRefreshFX(supabase: any) {
  const currencies = ["IDR", "THB", "AED", "MYR", "VND", "PHP", "SGD"];

  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${currencies.join(",")}`);
    if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
    const data = await res.json();

    const snapshots = Object.entries(data.rates as Record<string, number>).map(([currency, rate]) => ({
      base_currency: "USD",
      target_currency: currency,
      rate,
      inverse_rate: 1 / rate,
      source: "frankfurter",
      snapshot_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("fx_rate_snapshots").insert(snapshots);
    if (error) throw error;

    return json({ success: true, rates: data.rates, snapshot_at: new Date().toISOString() });
  } catch (e) {
    console.error("FX refresh failed:", e);
    return json({ error: e instanceof Error ? e.message : "FX refresh failed" }, 500);
  }
}

// ── Compute Routing Algorithm ──
// Determines compute priority for each city based on market signals
async function handleComputeRouting(supabase: any, regionId?: string) {
  let regQuery = supabase.from("global_regions").select("*").eq("is_active", true);
  if (regionId) regQuery = regQuery.eq("region_id", regionId);
  const { data: regions } = await regQuery;

  if (!regions?.length) return json({ message: "No active regions" });

  let totalUpdated = 0;

  for (const region of regions) {
    if (!region.is_primary) continue; // Only compute for regions with data

    // Get city-level signals
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

    // Listing velocity: new listings per day (last 7 days)
    const { data: newListings } = await supabase
      .from("properties")
      .select("city")
      .gte("created_at", sevenDaysAgo)
      .eq("status", "available")
      .not("city", "is", null);

    const listingVelocity: Record<string, number> = {};
    (newListings || []).forEach((p: any) => {
      listingVelocity[p.city] = (listingVelocity[p.city] || 0) + 1;
    });

    // Investor activity: views + saves last 24h
    const { data: activity } = await supabase
      .from("ai_behavior_tracking")
      .select("property_id, properties:property_id(city)")
      .gte("created_at", oneDayAgo)
      .not("property_id", "is", null)
      .limit(500);

    const activityByCity: Record<string, number> = {};
    (activity || []).forEach((a: any) => {
      const city = a.properties?.city;
      if (city) activityByCity[city] = (activityByCity[city] || 0) + 1;
    });

    // Search heat from hotspots
    const { data: hotspots } = await supabase
      .from("investment_hotspots")
      .select("city, hotspot_score, growth_score");

    const heatByCity: Record<string, number> = {};
    (hotspots || []).forEach((h: any) => {
      heatByCity[h.city] = h.hotspot_score || 0;
    });

    // All cities
    const allCities = new Set([
      ...Object.keys(listingVelocity),
      ...Object.keys(activityByCity),
      ...Object.keys(heatByCity),
    ]);

    for (const city of allCities) {
      const lv = (listingVelocity[city] || 0) / 7; // per day
      const ia = activityByCity[city] || 0;
      const sh = heatByCity[city] || 0;

      // Compute priority: weighted combination
      const priority = Math.min(100, Math.round(
        (Math.min(lv * 5, 30)) +       // listing velocity: max 30
        (Math.min(ia * 2, 30)) +        // investor activity: max 30
        (sh * 0.4)                       // search heat: max 40
      ));

      // Determine recommended tier
      const tier = priority >= 70 ? "realtime" : priority >= 40 ? "hourly" : "daily";

      await supabase.from("compute_priority_index").upsert({
        region_id: region.region_id,
        city,
        listing_velocity: Math.round(lv * 100) / 100,
        investor_activity: ia,
        price_volatility: 0, // TODO: compute from price history
        search_heat: sh,
        compute_priority: priority,
        recommended_tier: tier,
        last_computed_at: new Date().toISOString(),
      }, { onConflict: "region_id,city" });

      totalUpdated++;
    }
  }

  return json({ success: true, cities_updated: totalUpdated });
}

// ── Dashboard Data ──
async function handleDashboard(supabase: any) {
  const [regRes, fxRes, oppRes, prioRes, logRes] = await Promise.all([
    supabase.from("global_regions").select("*").order("is_primary", { ascending: false }),
    supabase.from("fx_rate_snapshots").select("*").order("snapshot_at", { ascending: false }).limit(20),
    supabase.from("global_opportunity_scores").select("*").order("global_opportunity_score", { ascending: false }).limit(30),
    supabase.from("compute_priority_index").select("*").order("compute_priority", { ascending: false }).limit(20),
    supabase.from("global_expansion_log").select("*").order("created_at", { ascending: false }).limit(15),
  ]);

  return json({
    regions: regRes.data || [],
    fx_rates: fxRes.data || [],
    opportunities: oppRes.data || [],
    compute_priorities: prioRes.data || [],
    expansion_log: logRes.data || [],
  });
}
