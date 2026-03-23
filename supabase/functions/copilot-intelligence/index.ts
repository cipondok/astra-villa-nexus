import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function countWhere(table: string, filters?: (q: any) => any) {
  let q = sb.from(table).select("id", { count: "exact", head: true });
  if (filters) q = filters(q);
  const { count } = await q;
  return count || 0;
}

async function safeCount(table: string, filters?: (q: any) => any) {
  try { return await countWhere(table, filters); } catch { return 0; }
}

async function getKPIs() {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
  const d90 = new Date(now.getTime() - 90 * 86400000).toISOString();

  const [
    totalProperties, activeListings30d, totalUsers, newUsers7d,
    dealsOpen, dealsClosed30d, escrowActive, staleListings,
    aiSignals7d, copilotActions7d,
  ] = await Promise.all([
    safeCount("properties"),
    safeCount("properties", q => q.gte("created_at", d30).eq("status", "available")),
    safeCount("profiles"),
    safeCount("profiles", q => q.gte("created_at", d7)),
    safeCount("deal_transactions", q => q.in("status", ["negotiation", "pending", "in_progress"])),
    safeCount("deal_transactions", q => q.gte("updated_at", d30).eq("status", "completed")),
    safeCount("escrow_transactions", q => q.eq("status", "active")),
    safeCount("properties", q => q.lt("updated_at", d90).eq("status", "available")),
    safeCount("ai_event_signals", q => q.gte("created_at", d7)),
    safeCount("copilot_actions", q => q.gte("created_at", d7)),
  ]);

  const { data: cityListings } = await sb
    .from("properties").select("city").eq("status", "available").limit(500);
  const cityCounts: Record<string, number> = {};
  (cityListings || []).forEach((p: any) => {
    if (p.city) cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
  });
  const topCitiesByListing = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([city, count]) => ({ city, count }));

  return {
    total_properties: totalProperties,
    active_listings_last_30_days: activeListings30d,
    total_users: totalUsers,
    new_users_last_7_days: newUsers7d,
    deals_open: dealsOpen,
    deals_closed_30_days: dealsClosed30d,
    escrow_active: escrowActive,
    stale_listings_count: staleListings,
    ai_signals_generated_7_days: aiSignals7d,
    copilot_actions_7_days: copilotActions7d,
    top_cities_by_listing: topCitiesByListing,
  };
}

async function getDealFunnel() {
  const [inquiry, negotiation, escrow, closed] = await Promise.all([
    safeCount("deal_transactions", q => q.eq("status", "inquiry")),
    safeCount("deal_transactions", q => q.eq("status", "negotiation")),
    safeCount("escrow_transactions"),
    safeCount("deal_transactions", q => q.eq("status", "completed")),
  ]);
  const total = inquiry + negotiation + escrow + closed;
  return {
    inquiry_count: inquiry, negotiation_count: negotiation,
    escrow_count: escrow, closed_count: closed,
    conversion_rate: total > 0 ? Math.round((closed / total) * 1000) / 10 : 0,
  };
}

function generateRecommendations(kpis: any, funnel: any) {
  const recs: any[] = [];
  const total = kpis.total_properties || 0;
  const stale = kpis.stale_listings_count || 0;
  const newUsers = kpis.new_users_last_7_days || 0;
  const dealsOpen = kpis.deals_open || 0;

  if (total > 0 && stale / total > 0.15) {
    recs.push({ id: "rec-stale", type: "liquidity", title: "Stale inventory requires pricing review",
      description: `${stale} listings (${Math.round(stale/total*100)}%) inactive >90 days. Consider price reduction nudges.`,
      confidence: 88, impact: `Reduce stale by ${Math.round(stale*0.4)}`, timeWindow: "This week",
      priority: stale/total > 0.3 ? "critical" : "high", status: "pending" });
  }
  if (newUsers > 5 && dealsOpen < 2) {
    recs.push({ id: "rec-conversion", type: "growth", title: "User growth not converting to deals",
      description: `${newUsers} new users but only ${dealsOpen} open deals. Activate onboarding nurture.`,
      confidence: 82, impact: "+3-5 deal initiations", timeWindow: "Next 48h",
      priority: "high", status: "pending" });
  }
  if (funnel.negotiation_count > 0 && funnel.escrow_count === 0) {
    recs.push({ id: "rec-escrow", type: "monetization", title: "Negotiations not reaching escrow",
      description: `${funnel.negotiation_count} deals negotiating but 0 in escrow. Deploy escrow confidence panel.`,
      confidence: 91, impact: "Unlock escrow revenue", timeWindow: "Immediate",
      priority: "critical", status: "pending" });
  }
  const topCities = kpis.top_cities_by_listing || [];
  if (topCities.length > 0 && total > 10) {
    const topShare = topCities[0].count / total;
    if (topShare > 0.6) {
      recs.push({ id: "rec-concentration", type: "growth", title: `Supply concentrated in ${topCities[0].city}`,
        description: `${Math.round(topShare*100)}% listings in one city. Diversify to reduce risk.`,
        confidence: 85, impact: "Reduce concentration risk", timeWindow: "This week",
        priority: "medium", status: "pending" });
    }
  }
  if (total < 20) {
    recs.push({ id: "rec-supply", type: "vendor", title: "Supply acquisition sprint needed",
      description: `Only ${total} listings. Target 50+ for liquidity. Launch agent outreach.`,
      confidence: 95, impact: "+30 listings", timeWindow: "Next 7 days",
      priority: "critical", status: "pending" });
  }
  if (kpis.ai_signals_generated_7_days > 0 && kpis.copilot_actions_7_days === 0) {
    recs.push({ id: "rec-action-gap", type: "monetization", title: "AI signals not being actioned",
      description: `${kpis.ai_signals_generated_7_days} signals generated, 0 actions taken. Execute pending recommendations.`,
      confidence: 79, impact: "Activate intelligence loop", timeWindow: "Today",
      priority: "high", status: "pending" });
  }
  return recs;
}

function generateRiskAlerts(kpis: any) {
  const alerts: any[] = [];
  if (kpis.deals_closed_30_days === 0 && kpis.total_properties > 0) {
    alerts.push({ id: "risk-no-deals", category: "revenue_slow", severity: "critical",
      title: "Zero deals closed in 30 days", metric: "Deal completion: 0%", trend: "down", probability: 90 });
  }
  if (kpis.new_users_last_7_days === 0) {
    alerts.push({ id: "risk-no-growth", category: "investor_disengage", severity: "critical",
      title: "No new user signups this week", metric: "Acquisition: 0 in 7d", trend: "down", probability: 85 });
  }
  if (kpis.stale_listings_count > 0) {
    const pct = kpis.total_properties > 0 ? Math.round(kpis.stale_listings_count/kpis.total_properties*100) : 0;
    alerts.push({ id: "risk-stale", category: "supply_imbalance", severity: pct > 30 ? "critical" : "warning",
      title: `${kpis.stale_listings_count} stale listings (${pct}%)`, metric: "Inactive >90 days",
      trend: "up", probability: Math.min(70 + pct, 99) });
  }
  if (kpis.escrow_active === 0 && kpis.deals_open > 0) {
    alerts.push({ id: "risk-escrow-gap", category: "revenue_slow", severity: "warning",
      title: "Open deals but no active escrow", metric: `${kpis.deals_open} deals, 0 escrow`,
      trend: "flat", probability: 65 });
  }
  return alerts;
}

async function executeAction(actionType: string, payload: any, adminId: string) {
  const { data, error } = await sb.from("copilot_actions").insert({
    action_type: actionType, payload_json: payload,
    executed_by_admin_id: adminId, status: "executed",
    executed_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;

  if (actionType === "boost_city" && payload.city) {
    await sb.from("properties").update({ ranking_score: 85 })
      .eq("city", payload.city).eq("status", "available");
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    let adminId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await sb.auth.getUser(token);
      if (user) {
        const { data: au } = await sb.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
        if (au) adminId = user.id;
      }
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (body.action_type) {
        if (!adminId) return json({ error: "Admin access required" }, 403);
        const result = await executeAction(body.action_type, body.payload || {}, adminId);
        return json({ success: true, action: result });
      }
    }

    const [kpis, funnel] = await Promise.all([getKPIs(), getDealFunnel()]);
    const recommendations = generateRecommendations(kpis, funnel);
    const riskAlerts = generateRiskAlerts(kpis);

    // Fetch behavioral + pricing intelligence
    let hotProperties: any[] = [];
    let demandSignals: any[] = [];
    let liquidityMetrics: any[] = [];
    let liquidityForecasts: any[] = [];
    let pricingSignals: any[] = [];
    let capitalFlows: any[] = [];
    try {
      const [hotRes, demandRes, liqRes, forecastRes, priceRes, capRes] = await Promise.all([
        sb.from("investor_intent_scores").select("property_id, intent_score, intent_level").eq("intent_level", "hot").order("intent_score", { ascending: false }).limit(5),
        sb.from("market_demand_signals").select("city, demand_velocity_score, view_to_inquiry_ratio, total_views, total_inquiries").order("demand_velocity_score", { ascending: false }).limit(5),
        sb.from("liquidity_metrics_daily").select("city, liquidity_velocity_score, absorption_rate, market_classification, demand_pressure_index, listings_active, deals_closed").order("liquidity_velocity_score", { ascending: false }).limit(10),
        sb.from("liquidity_forecasts").select("city, predicted_velocity_score, surge_probability, oversupply_risk, forecast_trend").order("surge_probability", { ascending: false }).limit(5),
        sb.from("property_price_signals").select("property_id, city, listing_price, demand_adjusted_price, investor_bid_pressure_score, price_volatility_index, confidence_score").order("investor_bid_pressure_score", { ascending: false }).limit(10),
        sb.from("capital_flow_signals").select("city, segment, capital_inflow_score, avg_ticket_size, capital_volume").order("capital_inflow_score", { ascending: false }).limit(10),
      ]);
      hotProperties = hotRes.data || [];
      demandSignals = demandRes.data || [];
      liquidityMetrics = liqRes.data || [];
      liquidityForecasts = forecastRes.data || [];
      pricingSignals = priceRes.data || [];
      capitalFlows = capRes.data || [];
    } catch { /* tables may be empty */ }

    // Add demand-based recommendations
    for (const ds of demandSignals) {
      if (ds.demand_velocity_score > 50 && ds.view_to_inquiry_ratio < 0.05) {
        recommendations.push({
          id: `rec-demand-${ds.city}`,
          type: "growth",
          title: `Demand spike in ${ds.city} — boost supply`,
          description: `${ds.total_views} views but only ${ds.total_inquiries} inquiries. Improve listing quality or add inventory.`,
          confidence: 83,
          impact: "Capture demand gap",
          timeWindow: "This week",
          priority: "high",
          status: "pending",
        });
      }
    }

    // Liquidity-based recommendations
    for (const lm of liquidityMetrics) {
      if (lm.market_classification === "slow" && lm.listings_active > 5) {
        recommendations.push({
          id: `rec-liq-slow-${lm.city}`,
          type: "liquidity",
          title: `${lm.city} showing slow liquidity (${lm.liquidity_velocity_score}/100)`,
          description: `${lm.listings_active} listings, ${lm.deals_closed} deals. Consider pricing optimization or demand campaigns.`,
          confidence: 80, impact: "Improve velocity", timeWindow: "This week",
          priority: "high", status: "pending",
        });
      }
    }
    for (const fc of liquidityForecasts) {
      if (fc.oversupply_risk > 60) {
        riskAlerts.push({
          id: `risk-oversupply-${fc.city}`,
          category: "supply_imbalance",
          severity: fc.oversupply_risk > 80 ? "critical" : "warning",
          title: `Oversupply risk in ${fc.city} (${fc.oversupply_risk}%)`,
          metric: `Forecast trend: ${fc.forecast_trend}`,
          trend: "up", probability: fc.oversupply_risk,
        });
      }
      if (fc.surge_probability > 70) {
        recommendations.push({
          id: `rec-surge-${fc.city}`,
          type: "growth",
          title: `Liquidity surge likely in ${fc.city} (${fc.surge_probability}%)`,
          description: `Predicted velocity: ${fc.predicted_velocity_score}. Prioritize supply acquisition.`,
          confidence: Math.round(fc.surge_probability * 0.9), impact: "Capture growth wave",
          timeWindow: "Next 30 days", priority: "critical", status: "pending",
        });
      }
    }

    // Pricing signal recommendations
    for (const ps of pricingSignals) {
      if (ps.investor_bid_pressure_score > 60) {
        recommendations.push({
          id: `rec-bid-${ps.city}-${ps.property_id?.slice(0,8)}`,
          type: "monetization",
          title: `High bid pressure in ${ps.city} — recommend +${Math.round((ps.demand_adjusted_price / ps.listing_price - 1) * 100)}% pricing adjustment`,
          description: `Bid pressure ${ps.investor_bid_pressure_score}/100. Demand-adjusted price: Rp ${ps.demand_adjusted_price?.toLocaleString()}.`,
          confidence: ps.confidence_score, impact: "Capture premium value",
          timeWindow: "This week", priority: "high", status: "pending",
        });
      }
      if (ps.price_volatility_index > 10) {
        riskAlerts.push({
          id: `risk-volatility-${ps.city}`,
          category: "price_instability",
          severity: ps.price_volatility_index > 15 ? "critical" : "warning",
          title: `Price volatility spike in ${ps.city} (${ps.price_volatility_index}%)`,
          metric: `Volatility index: ${ps.price_volatility_index}`,
          trend: "up", probability: Math.min(ps.price_volatility_index * 5, 95),
        });
      }
    }

    // Capital flow recommendations
    for (const cf of capitalFlows) {
      if (cf.capital_inflow_score > 70) {
        recommendations.push({
          id: `rec-capital-${cf.city}`,
          type: "growth",
          title: `Strong capital inflow in ${cf.city} (${cf.capital_inflow_score}/100)`,
          description: `Avg ticket: Rp ${cf.avg_ticket_size?.toLocaleString()}. Capital volume: Rp ${cf.capital_volume?.toLocaleString()}.`,
          confidence: 80, impact: "Prioritize supply acquisition",
          timeWindow: "This week", priority: "high", status: "pending",
        });
      }
    }

    return json({
      kpis, funnel, recommendations, risk_alerts: riskAlerts,
      hot_properties: hotProperties,
      demand_signals: demandSignals,
      pricing_intelligence: {
        top_bid_pressure: pricingSignals.slice(0, 5),
        capital_flows: capitalFlows.slice(0, 5),
      },
      liquidity: {
        fastest_cities: liquidityMetrics.filter((m: any) => m.market_classification === "hot").slice(0, 3),
        slowest_cities: [...liquidityMetrics].sort((a: any, b: any) => a.liquidity_velocity_score - b.liquidity_velocity_score).slice(0, 3),
        global_velocity: liquidityMetrics.length > 0
          ? Math.round(liquidityMetrics.reduce((s: number, m: any) => s + (m.liquidity_velocity_score || 0), 0) / liquidityMetrics.length * 10) / 10
          : 0,
        forecasts: liquidityForecasts,
      },
      performance: {
        actions_executed_7d: kpis.copilot_actions_7_days,
        ai_signals_7d: kpis.ai_signals_generated_7_days,
      },
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("copilot-intelligence error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});