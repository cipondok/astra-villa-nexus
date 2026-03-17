import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PropertyAnalytics {
  id: string;
  title: string;
  city: string | null;
  property_type: string | null;
  purchase_price: number;
  current_value: number;
  capital_gain: number;
  capital_gain_pct: number;
  monthly_rent_estimate: number;
  annual_rental_income: number;
  rental_yield_pct: number;
  appreciation_forecast: number;
  opportunity_score: number;
  opportunity_trend: "rising" | "stable" | "declining";
  risk_class: "conservative" | "moderate" | "aggressive" | "speculative";
  risk_score: number;
  roi_5y_pct: number;
  is_owned: boolean;
  thumbnail_url: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, user_id, property_id, sell_price } = await req.json();

    // ── Sell Simulation ──
    if (mode === "simulate_sell") {
      const { data: prop } = await supabase
        .from("properties")
        .select("id, title, price, city, property_type")
        .eq("id", property_id)
        .single();
      if (!prop) throw new Error("Property not found");

      const purchase = prop.price || 0;
      const sell = sell_price || purchase;
      const grossProfit = sell - purchase;
      const taxRate = 0.025; // PPh final 2.5%
      const notaryFee = sell * 0.01;
      const agentFee = sell * 0.025;
      const totalCost = sell * taxRate + notaryFee + agentFee;
      const netProfit = grossProfit - totalCost;
      const netROI = purchase > 0 ? (netProfit / purchase) * 100 : 0;

      return new Response(
        JSON.stringify({
          property: prop,
          sell_price: sell,
          gross_profit: grossProfit,
          tax_pph: sell * taxRate,
          notary_fee: notaryFee,
          agent_commission: agentFee,
          total_costs: totalCost,
          net_profit: netProfit,
          net_roi_pct: Math.round(netROI * 100) / 100,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Main Dashboard ──
    if (!user_id) throw new Error("user_id required");

    // Get user's watchlisted + owned properties
    const { data: watchlist } = await supabase
      .from("investor_watchlist")
      .select("property_id, is_owned, purchase_price, monthly_rental_income")
      .eq("user_id", user_id);

    const propIds = (watchlist || []).map((w: any) => w.property_id);
    if (propIds.length === 0) {
      return new Response(
        JSON.stringify({ properties: [], overview: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: properties } = await supabase
      .from("properties")
      .select(
        "id, title, price, city, state, property_type, listing_type, thumbnail_url, bedrooms, bathrooms, area_sqm, demand_heat_score, investment_score, annual_growth_rate, risk_factor"
      )
      .in("id", propIds);

    // Get ROI forecasts if available
    const { data: forecasts } = await supabase
      .from("property_roi_forecast")
      .select("property_id, expected_roi, rental_yield, price_growth_forecast, market_risk")
      .in("property_id", propIds);

    const forecastMap = new Map((forecasts || []).map((f: any) => [f.property_id, f]));
    const watchMap = new Map((watchlist || []).map((w: any) => [w.property_id, w]));

    // Market average for comparison
    const { data: marketAvg } = await supabase
      .from("properties")
      .select("annual_growth_rate, investment_score")
      .not("annual_growth_rate", "is", null)
      .limit(500);

    const mktAvgGrowth = marketAvg && marketAvg.length > 0
      ? marketAvg.reduce((s: number, p: any) => s + (p.annual_growth_rate || 0), 0) / marketAvg.length
      : 6;
    const mktAvgScore = marketAvg && marketAvg.length > 0
      ? marketAvg.reduce((s: number, p: any) => s + (p.investment_score || 0), 0) / marketAvg.length
      : 60;

    const analytics: PropertyAnalytics[] = (properties || []).map((p: any) => {
      const w = watchMap.get(p.id) || {};
      const f = forecastMap.get(p.id);
      const isOwned = w.is_owned || false;
      const purchasePrice = w.purchase_price || p.price || 0;
      const currentValue = p.price || 0;
      const monthlyRent = w.monthly_rental_income || (currentValue * 0.005); // default 0.5%/month
      const annualRent = monthlyRent * 12;
      const rentalYield = currentValue > 0 ? (annualRent / currentValue) * 100 : 0;
      const capitalGain = currentValue - purchasePrice;
      const capitalGainPct = purchasePrice > 0 ? (capitalGain / purchasePrice) * 100 : 0;
      const growthRate = p.annual_growth_rate || (f?.price_growth_forecast || 5);
      const projectedValue5y = currentValue * Math.pow(1 + growthRate / 100, 5);
      const roi5y = purchasePrice > 0
        ? ((projectedValue5y + annualRent * 5 - purchasePrice) / purchasePrice) * 100
        : 0;
      const score = p.investment_score || 50;
      const riskFactor = p.risk_factor || 50;

      let opportunityTrend: "rising" | "stable" | "declining" = "stable";
      if (growthRate > 8 && score > 70) opportunityTrend = "rising";
      else if (growthRate < 3 || score < 40) opportunityTrend = "declining";

      let riskClass: "conservative" | "moderate" | "aggressive" | "speculative" = "moderate";
      if (riskFactor <= 25) riskClass = "conservative";
      else if (riskFactor <= 50) riskClass = "moderate";
      else if (riskFactor <= 75) riskClass = "aggressive";
      else riskClass = "speculative";

      return {
        id: p.id,
        title: p.title,
        city: p.city,
        property_type: p.property_type,
        purchase_price: purchasePrice,
        current_value: currentValue,
        capital_gain: capitalGain,
        capital_gain_pct: Math.round(capitalGainPct * 10) / 10,
        monthly_rent_estimate: monthlyRent,
        annual_rental_income: annualRent,
        rental_yield_pct: Math.round(rentalYield * 10) / 10,
        appreciation_forecast: Math.round(growthRate * 10) / 10,
        opportunity_score: score,
        opportunity_trend: opportunityTrend,
        risk_class: riskClass,
        risk_score: riskFactor,
        roi_5y_pct: Math.round(roi5y * 10) / 10,
        is_owned: isOwned,
        thumbnail_url: p.thumbnail_url,
      };
    });

    // Portfolio overview
    const totalValue = analytics.reduce((s, a) => s + a.current_value, 0);
    const totalInvested = analytics.reduce((s, a) => s + a.purchase_price, 0);
    const unrealizedGL = totalValue - totalInvested;
    const unrealizedPct = totalInvested > 0 ? (unrealizedGL / totalInvested) * 100 : 0;
    const avgROI = analytics.length > 0
      ? analytics.reduce((s, a) => s + a.roi_5y_pct, 0) / analytics.length
      : 0;
    const avgYield = analytics.length > 0
      ? analytics.reduce((s, a) => s + a.rental_yield_pct, 0) / analytics.length
      : 0;
    const projectedAnnualROI = totalInvested > 0
      ? ((totalValue * Math.pow(1 + (avgROI / 100 / 5), 1) - totalInvested + analytics.reduce((s, a) => s + a.annual_rental_income, 0)) / totalInvested) * 100
      : 0;

    // Allocation data
    const cityAlloc = new Map<string, number>();
    const typeAlloc = new Map<string, number>();
    const riskDist = new Map<string, number>();
    analytics.forEach((a) => {
      const city = a.city || "Unknown";
      cityAlloc.set(city, (cityAlloc.get(city) || 0) + a.current_value);
      const type = a.property_type || "other";
      typeAlloc.set(type, (typeAlloc.get(type) || 0) + a.current_value);
      riskDist.set(a.risk_class, (riskDist.get(a.risk_class) || 0) + 1);
    });

    // Growth timeline (simulated monthly for 24 months)
    const growthTimeline = [];
    const monthlyGrowthRate = avgROI > 0 ? Math.pow(1 + avgROI / 500, 1) : 1.005;
    let runningValue = totalValue;
    for (let m = 0; m <= 24; m++) {
      growthTimeline.push({
        month: m,
        portfolio_value: Math.round(runningValue),
        market_benchmark: Math.round(totalValue * Math.pow(1 + mktAvgGrowth / 1200, m)),
      });
      runningValue *= monthlyGrowthRate;
    }

    return new Response(
      JSON.stringify({
        overview: {
          total_portfolio_value: totalValue,
          total_invested_capital: totalInvested,
          unrealized_gain_loss: unrealizedGL,
          unrealized_pct: Math.round(unrealizedPct * 10) / 10,
          projected_annual_roi: Math.round(projectedAnnualROI * 10) / 10,
          avg_rental_yield: Math.round(avgYield * 10) / 10,
          avg_5y_roi: Math.round(avgROI * 10) / 10,
          total_properties: analytics.length,
          owned_properties: analytics.filter((a) => a.is_owned).length,
          market_avg_growth: Math.round(mktAvgGrowth * 10) / 10,
          market_avg_score: Math.round(mktAvgScore),
        },
        properties: analytics.sort((a, b) => b.roi_5y_pct - a.roi_5y_pct),
        allocations: {
          by_city: Array.from(cityAlloc.entries()).map(([name, value]) => ({ name, value })),
          by_type: Array.from(typeAlloc.entries()).map(([name, value]) => ({ name, value })),
          risk_distribution: Array.from(riskDist.entries()).map(([name, count]) => ({ name, count })),
        },
        growth_timeline: growthTimeline,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
