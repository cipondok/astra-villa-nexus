import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, user_id, portfolio_id, params } = await req.json();

    switch (mode) {
      case "valuate": return json(await valuatePortfolio(supabase, portfolio_id));
      case "forecast": return json(await forecastWealth(supabase, portfolio_id, params));
      case "risk_analysis": return json(await analyzeRisk(supabase, portfolio_id));
      case "recommend": return json(await generateRecommendations(supabase, portfolio_id));
      case "dashboard_stats": return json(await adminDashboardStats(supabase));
      case "ensure_portfolio": return json(await ensurePortfolio(supabase, user_id));
      default: return json({ error: "Unknown mode" }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function ensurePortfolio(sb: any, userId: string) {
  const { data: existing } = await sb
    .from("investor_portfolios")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await sb
    .from("investor_portfolios")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

async function valuatePortfolio(sb: any, portfolioId: string) {
  const { data: assets } = await sb
    .from("portfolio_assets")
    .select("*, properties(price, investment_score, city)")
    .eq("portfolio_id", portfolioId)
    .eq("asset_status", "active");

  if (!assets?.length) return { valued: 0 };

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalRentalIncome = 0;

  for (const asset of assets) {
    const currentPrice = asset.properties?.price || asset.acquisition_price;
    const ownershipFraction = (asset.ownership_percentage || 100) / 100;
    const estimatedValue = currentPrice * ownershipFraction;

    totalInvested += asset.acquisition_price * ownershipFraction;
    totalCurrentValue += estimatedValue;
    totalRentalIncome += asset.rental_income_accumulated || 0;

    const roi = asset.acquisition_price > 0
      ? ((estimatedValue - asset.acquisition_price * ownershipFraction + (asset.rental_income_accumulated || 0)) / (asset.acquisition_price * ownershipFraction)) * 100
      : 0;

    await sb.from("portfolio_assets").update({
      current_estimated_value: estimatedValue,
      asset_roi: Math.round(roi * 100) / 100,
      updated_at: new Date().toISOString(),
    }).eq("id", asset.id);
  }

  const unrealized = totalCurrentValue - totalInvested;
  const weightedRoi = totalInvested > 0 ? ((totalCurrentValue - totalInvested + totalRentalIncome) / totalInvested) * 100 : 0;

  await sb.from("investor_portfolios").update({
    total_invested_amount: totalInvested,
    current_estimated_value: totalCurrentValue,
    unrealized_gain_loss: unrealized,
    last_evaluated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", portfolioId);

  // Snapshot
  await sb.from("portfolio_value_history").insert({
    portfolio_id: portfolioId,
    total_value: totalCurrentValue,
    total_invested: totalInvested,
    unrealized_gain: unrealized,
    weighted_roi: Math.round(weightedRoi * 100) / 100,
    asset_count: assets.length,
  });

  return { valued: assets.length, total_value: totalCurrentValue, unrealized, weighted_roi: weightedRoi };
}

async function forecastWealth(sb: any, portfolioId: string, params: any) {
  const horizons = params?.horizons || [12, 36, 60];
  const { data: portfolio } = await sb
    .from("investor_portfolios")
    .select("current_estimated_value, total_invested_amount")
    .eq("id", portfolioId)
    .single();

  if (!portfolio) return { forecasts: [] };

  const currentValue = portfolio.current_estimated_value || 0;
  const annualGrowthRate = 0.08; // 8% baseline
  const annualYield = 0.05; // 5% rental yield

  const forecasts = [];
  for (const months of horizons) {
    const years = months / 12;
    const projectedValue = currentValue * Math.pow(1 + annualGrowthRate, years);
    const projectedCashflow = currentValue * annualYield * years;
    const confidence = Math.max(50, 95 - months * 0.5);

    forecasts.push({
      portfolio_id: portfolioId,
      forecast_horizon_months: months,
      projected_portfolio_value: Math.round(projectedValue),
      projected_cashflow: Math.round(projectedCashflow),
      confidence_score: Math.round(confidence),
    });
  }

  // Clear old and insert new
  await sb.from("wealth_forecasts").delete().eq("portfolio_id", portfolioId);
  await sb.from("wealth_forecasts").insert(forecasts);

  return { forecasts };
}

async function analyzeRisk(sb: any, portfolioId: string) {
  const { data: assets } = await sb
    .from("portfolio_assets")
    .select("*, properties(city, property_type, investment_score)")
    .eq("portfolio_id", portfolioId)
    .eq("asset_status", "active");

  if (!assets?.length) return { risk_score: 0 };

  const cities: Record<string, number> = {};
  const types: Record<string, number> = {};
  let lowScoreCount = 0;

  for (const a of assets) {
    const city = a.properties?.city || "unknown";
    const type = a.properties?.property_type || "unknown";
    cities[city] = (cities[city] || 0) + 1;
    types[type] = (types[type] || 0) + 1;
    if ((a.properties?.investment_score || 0) < 40) lowScoreCount++;
  }

  const maxCityConc = Math.max(...Object.values(cities)) / assets.length;
  const highRiskPct = lowScoreCount / assets.length;
  const liquidityExposure = assets.filter(a => (a.properties?.investment_score || 0) > 60).length / assets.length;

  const riskScore = Math.round(
    (maxCityConc * 30 + highRiskPct * 40 + (1 - liquidityExposure) * 30)
  );

  const alerts = [];
  if (maxCityConc > 0.6) alerts.push("High city concentration — consider diversifying");
  if (highRiskPct > 0.3) alerts.push("Significant low-score asset exposure");
  if (liquidityExposure < 0.4) alerts.push("Low liquidity allocation detected");

  const riskData = {
    portfolio_id: portfolioId,
    city_concentration_ratio: Math.round(maxCityConc * 100),
    property_type_allocation: types,
    liquidity_exposure: Math.round(liquidityExposure * 100),
    high_risk_asset_pct: Math.round(highRiskPct * 100),
    alerts,
  };

  await sb.from("portfolio_risk_metrics").insert(riskData);
  await sb.from("investor_portfolios").update({
    diversification_score: Math.round((1 - maxCityConc) * 100),
    risk_exposure_score: riskScore,
  }).eq("id", portfolioId);

  return { risk_score: riskScore, alerts, city_concentration: maxCityConc };
}

async function generateRecommendations(sb: any, portfolioId: string) {
  const { data: portfolio } = await sb
    .from("investor_portfolios")
    .select("*, portfolio_assets(*, properties(city, price, investment_score, property_type))")
    .eq("id", portfolioId)
    .single();

  if (!portfolio) return { recommendations: [] };

  const recs = [];
  const assets = portfolio.portfolio_assets || [];

  // Check for rebalance needs
  if (portfolio.risk_exposure_score > 60) {
    recs.push({
      portfolio_id: portfolioId,
      suggested_action: "rebalance",
      reasoning_text: "Portfolio risk exposure is elevated. Consider diversifying across cities and asset types to reduce concentration risk.",
      expected_impact_score: 75,
    });
  }

  // Check for exit candidates
  for (const a of assets) {
    if (a.asset_roi < -5 && a.properties?.investment_score < 35) {
      recs.push({
        portfolio_id: portfolioId,
        suggested_action: "exit",
        target_property_id: a.property_id,
        reasoning_text: `Asset in ${a.properties?.city || 'unknown'} showing negative ROI (${a.asset_roi}%) with low investment score. Consider exiting to redeploy capital.`,
        expected_impact_score: 60,
      });
    }
  }

  // Suggest holds for strong performers
  for (const a of assets) {
    if (a.asset_roi > 15 && (a.properties?.investment_score || 0) > 70) {
      recs.push({
        portfolio_id: portfolioId,
        suggested_action: "hold",
        target_property_id: a.property_id,
        reasoning_text: `Strong performer in ${a.properties?.city || 'unknown'} with ${a.asset_roi}% ROI. Hold and accumulate rental yield.`,
        expected_impact_score: 85,
      });
    }
  }

  // Default buy suggestion if portfolio small
  if (assets.length < 3) {
    recs.push({
      portfolio_id: portfolioId,
      suggested_action: "buy",
      reasoning_text: "Portfolio has fewer than 3 assets. Consider acquiring additional properties to improve diversification and reduce single-asset risk.",
      expected_impact_score: 70,
    });
  }

  if (recs.length > 0) {
    await sb.from("portfolio_recommendations").delete().eq("portfolio_id", portfolioId);
    await sb.from("portfolio_recommendations").insert(recs);
  }

  return { recommendations: recs };
}

async function adminDashboardStats(sb: any) {
  const { data: portfolios } = await sb
    .from("investor_portfolios")
    .select("current_estimated_value, total_invested_amount, unrealized_gain_loss, risk_exposure_score, diversification_score, user_id");

  if (!portfolios?.length) return { total_aum: 0, investor_count: 0 };

  const totalAum = portfolios.reduce((s: number, p: any) => s + (p.current_estimated_value || 0), 0);
  const totalInvested = portfolios.reduce((s: number, p: any) => s + (p.total_invested_amount || 0), 0);
  const avgRoi = totalInvested > 0 ? ((totalAum - totalInvested) / totalInvested) * 100 : 0;
  const avgRisk = portfolios.reduce((s: number, p: any) => s + (p.risk_exposure_score || 0), 0) / portfolios.length;
  const avgDiversification = portfolios.reduce((s: number, p: any) => s + (p.diversification_score || 0), 0) / portfolios.length;

  // Top cities from assets
  const { data: cityData } = await sb
    .from("portfolio_assets")
    .select("properties(city), current_estimated_value")
    .eq("asset_status", "active");

  const cityValues: Record<string, number> = {};
  for (const a of (cityData || [])) {
    const city = a.properties?.city || "Unknown";
    cityValues[city] = (cityValues[city] || 0) + (a.current_estimated_value || 0);
  }

  const topCities = Object.entries(cityValues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city, value]) => ({ city, value }));

  return {
    total_aum: totalAum,
    total_invested: totalInvested,
    investor_count: portfolios.length,
    avg_roi: Math.round(avgRoi * 100) / 100,
    avg_risk_score: Math.round(avgRisk),
    avg_diversification: Math.round(avgDiversification),
    top_cities: topCities,
  };
}
