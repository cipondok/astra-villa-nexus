import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { action } = await req.json();

    switch (action) {
      case "check_price_drops":
        return await checkPriceDrops(supabase);
      case "check_new_listings":
        return await checkNewListings(supabase);
      case "check_investment_opportunities":
        return await checkInvestmentOpportunities(supabase);
      case "check_saved_searches":
        return await checkSavedSearches(supabase);
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkPriceDrops(supabase: any) {
  // Find recent price drops (last 24h)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: priceChanges, error } = await supabase
    .from("property_price_history")
    .select("*, properties(id, title, location, images)")
    .lt("change_percentage", 0)
    .gte("changed_at", since)
    .order("change_percentage", { ascending: true })
    .limit(50);

  if (error) throw error;

  // Get users who saved these properties
  const propertyIds = (priceChanges || []).map((p: any) => p.property_id);
  if (propertyIds.length === 0) {
    return jsonResponse({ notifications_created: 0 });
  }

  const { data: savedProps } = await supabase
    .from("saved_properties")
    .select("user_id, property_id")
    .in("property_id", propertyIds);

  let created = 0;
  for (const saved of savedProps || []) {
    const priceChange = priceChanges.find((p: any) => p.property_id === saved.property_id);
    if (!priceChange) continue;

    // Check user preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("price_changes")
      .eq("user_id", saved.user_id)
      .maybeSingle();

    if (prefs && prefs.price_changes === false) continue;

    const property = priceChange.properties;
    const dropPct = Math.abs(priceChange.change_percentage);

    await supabase.from("in_app_notifications").insert({
      user_id: saved.user_id,
      type: "price_drop",
      title: `📉 Price dropped ${dropPct}%!`,
      message: `${property?.title || "A saved property"} in ${property?.location || "your area"} dropped from ${formatPrice(priceChange.old_price)} to ${formatPrice(priceChange.new_price)}`,
      property_id: saved.property_id,
      metadata: {
        old_price: priceChange.old_price,
        new_price: priceChange.new_price,
        change_percentage: priceChange.change_percentage,
      },
    });
    created++;
  }

  return jsonResponse({ notifications_created: created });
}

async function checkNewListings(supabase: any) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: newProps, error } = await supabase
    .from("properties")
    .select("id, title, location, city, state, property_type, price, listing_type")
    .gte("created_at", since)
    .eq("status", "active")
    .limit(100);

  if (error) throw error;
  if (!newProps?.length) return jsonResponse({ notifications_created: 0 });

  // Get all active saved search alerts
  const { data: alerts } = await supabase
    .from("saved_search_alerts")
    .select("*")
    .eq("is_active", true);

  let created = 0;
  for (const alert of alerts || []) {
    const criteria = alert.search_criteria || {};
    const matches = newProps.filter((p: any) => matchesCriteria(p, criteria));

    if (matches.length === 0) continue;

    // Check preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("new_listings")
      .eq("user_id", alert.user_id)
      .maybeSingle();

    if (prefs && prefs.new_listings === false) continue;

    await supabase.from("in_app_notifications").insert({
      user_id: alert.user_id,
      type: "saved_search",
      title: `🔍 ${matches.length} new match${matches.length > 1 ? "es" : ""} for "${alert.name}"`,
      message: matches.slice(0, 3).map((m: any) => m.title).join(", ") +
        (matches.length > 3 ? ` and ${matches.length - 3} more` : ""),
      property_id: matches[0].id,
      metadata: { match_count: matches.length, alert_id: alert.id },
    });

    // Update match count
    await supabase
      .from("saved_search_alerts")
      .update({
        match_count: alert.match_count + matches.length,
        last_triggered_at: new Date().toISOString(),
      })
      .eq("id", alert.id);

    created++;
  }

  return jsonResponse({ notifications_created: created });
}

async function checkInvestmentOpportunities(supabase: any) {
  // Find undervalued properties or high-ROI opportunities
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, title, location, price, property_type, area_sqm, listing_type")
    .eq("status", "active")
    .eq("listing_type", "sale")
    .not("price", "is", null)
    .not("area_sqm", "is", null)
    .gt("area_sqm", 0)
    .limit(200);

  if (error) throw error;
  if (!properties?.length) return jsonResponse({ notifications_created: 0 });

  // Calculate price per sqm and find outliers (below average for their area)
  const byLocation: Record<string, any[]> = {};
  for (const p of properties) {
    const loc = p.location || p.city || "unknown";
    (byLocation[loc] = byLocation[loc] || []).push(p);
  }

  const opportunities: any[] = [];
  for (const [loc, props] of Object.entries(byLocation)) {
    if (props.length < 3) continue;
    const avgPricePerSqm = props.reduce((s: number, p: any) => s + p.price / p.area_sqm, 0) / props.length;
    for (const p of props) {
      const pricePerSqm = p.price / p.area_sqm;
      if (pricePerSqm < avgPricePerSqm * 0.75) {
        opportunities.push({ ...p, discount: Math.round((1 - pricePerSqm / avgPricePerSqm) * 100) });
      }
    }
  }

  if (opportunities.length === 0) return jsonResponse({ notifications_created: 0 });

  // Notify users with investment interest (users who have saved properties as "sale")
  const { data: investors } = await supabase
    .from("notification_preferences")
    .select("user_id")
    .eq("booking_updates", true);

  let created = 0;
  for (const inv of investors || []) {
    const opp = opportunities[0]; // Top opportunity
    await supabase.from("in_app_notifications").insert({
      user_id: inv.user_id,
      type: "investment_opportunity",
      title: `✨ Investment opportunity: ${opp.discount}% below market`,
      message: `${opp.title} in ${opp.location} is priced ${opp.discount}% below the area average at ${formatPrice(opp.price)}`,
      property_id: opp.id,
      metadata: { discount_percentage: opp.discount, price_per_sqm: Math.round(opp.price / opp.area_sqm) },
    });
    created++;
  }

  return jsonResponse({ notifications_created: created });
}

async function checkSavedSearches(supabase: any) {
  // Alias for check_new_listings - processes saved search alerts
  return await checkNewListings(supabase);
}

function matchesCriteria(property: any, criteria: any): boolean {
  if (criteria.location && property.location) {
    if (!property.location.toLowerCase().includes(criteria.location.toLowerCase())) return false;
  }
  if (criteria.city && property.city) {
    if (!property.city.toLowerCase().includes(criteria.city.toLowerCase())) return false;
  }
  if (criteria.property_type && property.property_type) {
    if (property.property_type !== criteria.property_type) return false;
  }
  if (criteria.listing_type && property.listing_type) {
    if (property.listing_type !== criteria.listing_type) return false;
  }
  if (criteria.min_price && property.price < criteria.min_price) return false;
  if (criteria.max_price && property.price > criteria.max_price) return false;
  return true;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}M`;
  return `Rp ${price.toLocaleString()}`;
}

function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const corsHeaders2 = corsHeaders; // Keep reference for closure
