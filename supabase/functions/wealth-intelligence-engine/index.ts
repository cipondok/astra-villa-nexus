import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { mode, params } = await req.json();

    switch (mode) {
      case "track_wealth_flows":
        return handleWealthFlows(sb, params);
      case "compute_wealth_index":
        return handleWealthIndex(sb, params);
      case "build_concentration_heatmap":
        return handleConcentrationHeatmap(sb);
      case "forecast_intergenerational":
        return handleIntergenerational(sb);
      case "scan_wealth_risks":
        return handleRiskRadar(sb);
      case "dashboard":
        return handleDashboard(sb);
      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

// ── 1. Global Wealth Flow Observatory ──
async function handleWealthFlows(sb: any, params: any) {
  const { data: capitalFlows } = await sb
    .from("capital_flow_predictions")
    .select("*")
    .order("gravity_score", { ascending: false })
    .limit(30);

  const flows = [];
  for (const cf of capitalFlows ?? []) {
    const flowTypes = [
      { type: "institutional_reallocation", weight: cf.institutional_confidence ?? 0 },
      { type: "cross_border_capital", weight: cf.cross_border_migration ?? 0 },
      { type: "sovereign_fund_entry", weight: cf.institutional_confidence > 70 ? cf.institutional_confidence * 0.8 : 0 },
    ];

    for (const ft of flowTypes) {
      if (ft.weight < 20) continue;
      flows.push({
        flow_type: ft.type,
        destination_country: cf.country || "Indonesia",
        destination_city: cf.city,
        flow_volume_usd: Math.round(ft.weight * 1_000_000),
        flow_velocity: Math.round(ft.weight * 1.5 * 100) / 100,
        confidence_score: Math.min(1, cf.gravity_score / 100),
        signal_sources: { gravity_score: cf.gravity_score, tier: cf.gravity_tier },
        trend_direction:
          ft.weight > 70 ? "accelerating" : ft.weight > 40 ? "stable" : "decelerating",
      });
    }
  }

  for (const f of flows) {
    await sb.from("wealth_flow_observatory").insert(f);
  }

  return json({ data: { flows_tracked: flows.length, flows } });
}

// ── 2. Property Wealth Creation Index ──
async function handleWealthIndex(sb: any, params: any) {
  const { data: expansions } = await sb
    .from("city_expansion_probability")
    .select("*")
    .order("expansion_probability", { ascending: false })
    .limit(30);

  const { data: yieldData } = await sb
    .from("yield_gradient_map")
    .select("*")
    .limit(50);

  const yieldMap = new Map(
    (yieldData ?? []).map((y: any) => [y.city?.toLowerCase(), y])
  );

  const records = [];
  for (const exp of expansions ?? []) {
    const yld = yieldMap.get(exp.city?.toLowerCase()) as any;

    const capitalAppreciation = exp.price_appreciation_slope ?? 0;
    const rentalYieldStability = yld?.rental_yield_pct
      ? Math.min(100, yld.rental_yield_pct * 10)
      : 40;
    const liquidityROI = yld?.risk_adjusted_return
      ? Math.min(100, Math.max(0, yld.risk_adjusted_return * 5 + 50))
      : exp.liquidity_momentum ?? 30;
    const timeToExit = exp.liquidity_momentum > 70 ? 6 : exp.liquidity_momentum > 40 ? 12 : 24;
    const absorption = exp.absorption_acceleration ?? 0;
    const priceMomentum = exp.price_appreciation_slope ?? 0;

    // WCI = 0.25*CA + 0.20*RYS + 0.20*LROI + 0.15*ABS + 0.10*PM + 0.10*(100-TTE_norm)
    const tteNorm = Math.min(100, (timeToExit / 36) * 100);
    const wci = Math.min(
      100,
      Math.round(
        capitalAppreciation * 0.25 +
          rentalYieldStability * 0.2 +
          liquidityROI * 0.2 +
          absorption * 0.15 +
          priceMomentum * 0.1 +
          (100 - tteNorm) * 0.1
      )
    );

    const tier =
      wci >= 85 ? "sovereign_grade"
        : wci >= 70 ? "institutional_grade"
        : wci >= 55 ? "premium"
        : wci >= 35 ? "standard"
        : "speculative";

    records.push({
      city: exp.city,
      district: exp.district || null,
      country: exp.country || "Indonesia",
      capital_appreciation_rate: capitalAppreciation,
      rental_yield_stability: rentalYieldStability,
      liquidity_adjusted_roi: liquidityROI,
      time_to_exit_months: timeToExit,
      absorption_rate: absorption,
      price_momentum: priceMomentum,
      wealth_creation_score: wci,
      wealth_tier: tier,
      yoy_change_pct: capitalAppreciation * 0.6,
      computed_at: new Date().toISOString(),
    });
  }

  for (const r of records) {
    await sb.from("wealth_creation_index").upsert(r, { onConflict: "city,district" });
  }

  return json({ data: { cities_scored: records.length, records } });
}

// ── 3. Wealth Concentration Heatmap ──
async function handleConcentrationHeatmap(sb: any) {
  const { data: wciData } = await sb
    .from("wealth_creation_index")
    .select("*")
    .order("wealth_creation_score", { ascending: false })
    .limit(30);

  const { data: properties } = await sb
    .from("properties")
    .select("city, price")
    .limit(1000);

  // Aggregate property value by city
  const cityValues = new Map<string, { total: number; count: number }>();
  for (const p of properties ?? []) {
    const key = (p.city || "unknown").toLowerCase();
    const cur = cityValues.get(key) || { total: 0, count: 0 };
    cur.total += p.price || 0;
    cur.count++;
    cityValues.set(key, cur);
  }

  const heatmapRecords = [];
  for (const wci of wciData ?? []) {
    const cityStats = cityValues.get(wci.city?.toLowerCase()) || { total: 0, count: 0 };
    const totalValueUsd = cityStats.total / 15500; // IDR to USD approx
    const density = cityStats.count; // simplified

    const luxuryDemand = Math.min(100, wci.wealth_creation_score * 1.1);
    const velocity = wci.capital_appreciation_rate * 2;

    const tier =
      totalValueUsd > 50_000_000 ? "ultra_concentrated"
        : totalValueUsd > 10_000_000 ? "high_concentration"
        : totalValueUsd > 2_000_000 ? "moderate"
        : totalValueUsd > 500_000 ? "emerging"
        : "nascent";

    heatmapRecords.push({
      city: wci.city,
      district: wci.district,
      country: wci.country || "Indonesia",
      total_asset_value_usd: Math.round(totalValueUsd),
      luxury_demand_index: luxuryDemand,
      asset_density_per_sqkm: density,
      wealth_accumulation_velocity: velocity,
      concentration_tier: tier,
      emerging_cluster: wci.wealth_tier === "premium" && velocity > 50,
      cluster_signals: {
        wealth_score: wci.wealth_creation_score,
        appreciation_rate: wci.capital_appreciation_rate,
        listings: cityStats.count,
      },
      computed_at: new Date().toISOString(),
    });
  }

  for (const r of heatmapRecords) {
    await sb.from("wealth_concentration_heatmap").upsert(r, { onConflict: "city,district" });
  }

  return json({ data: { zones_mapped: heatmapRecords.length, heatmap: heatmapRecords } });
}

// ── 4. Intergenerational Asset Growth Predictor ──
async function handleIntergenerational(sb: any) {
  const { data: wciData } = await sb
    .from("wealth_creation_index")
    .select("*")
    .gte("wealth_creation_score", 30)
    .order("wealth_creation_score", { ascending: false })
    .limit(25);

  const records = [];
  for (const wci of wciData ?? []) {
    const baseGrowth = wci.capital_appreciation_rate / 100; // annual rate
    const cg5 = Math.round(((1 + baseGrowth) ** 5 - 1) * 100 * 100) / 100;
    const cg10 = Math.round(((1 + baseGrowth) ** 10 - 1) * 100 * 100) / 100;
    const cg25 = Math.round(((1 + baseGrowth) ** 25 - 1) * 100 * 100) / 100;

    const resilience = Math.min(100,
      wci.rental_yield_stability * 0.3 +
        wci.liquidity_adjusted_roi * 0.3 +
        wci.absorption_rate * 0.2 +
        (100 - Math.min(100, wci.time_to_exit_months * 4)) * 0.2
    );

    const macroPreservation = Math.min(100,
      wci.wealth_creation_score * 0.5 + resilience * 0.5
    );

    const inflationHedge = Math.min(100,
      wci.capital_appreciation_rate > 8 ? 85 : wci.capital_appreciation_rate * 10
    );

    const multiplier10y = Math.round((1 + baseGrowth) ** 10 * 100) / 100;

    const genScore = Math.min(100, Math.round(
      resilience * 0.3 + macroPreservation * 0.25 +
        inflationHedge * 0.2 + Math.min(100, cg10) * 0.25
    ));

    const preservationTier =
      genScore >= 85 ? "dynastic"
        : genScore >= 70 ? "multi_generational"
        : genScore >= 55 ? "generational"
        : genScore >= 35 ? "medium_term"
        : "short_term";

    records.push({
      city: wci.city,
      district: wci.district,
      country: wci.country || "Indonesia",
      compound_growth_5y: cg5,
      compound_growth_10y: cg10,
      compound_growth_25y: cg25,
      district_resilience_score: Math.round(resilience),
      macro_preservation_index: Math.round(macroPreservation),
      inflation_hedge_effectiveness: Math.round(inflationHedge),
      projected_value_multiplier_10y: multiplier10y,
      generational_wealth_score: genScore,
      wealth_preservation_tier: preservationTier,
      model_confidence: Math.min(1, wci.wealth_creation_score / 80),
      computed_at: new Date().toISOString(),
    });
  }

  for (const r of records) {
    await sb.from("intergenerational_asset_predictor").upsert(r, { onConflict: "city,district" });
  }

  return json({ data: { cities_forecasted: records.length, forecasts: records } });
}

// ── 5. Wealth Risk Radar ──
async function handleRiskRadar(sb: any) {
  const { data: wciData } = await sb
    .from("wealth_creation_index")
    .select("*")
    .order("wealth_creation_score", { ascending: false })
    .limit(30);

  const { data: heatmapData } = await sb
    .from("wealth_concentration_heatmap")
    .select("*")
    .limit(30);

  const concMap = new Map(
    (heatmapData ?? []).map((h: any) => [h.city?.toLowerCase(), h])
  );

  const risks = [];
  for (const wci of wciData ?? []) {
    const conc = concMap.get(wci.city?.toLowerCase()) as any;

    // Bubble detection: high appreciation + low yield stability
    if (wci.capital_appreciation_rate > 15 && wci.rental_yield_stability < 40) {
      const severity = Math.min(100,
        wci.capital_appreciation_rate * 2 + (50 - wci.rental_yield_stability)
      );
      risks.push({
        city: wci.city,
        district: wci.district,
        country: wci.country || "Indonesia",
        risk_type: "asset_bubble",
        risk_severity: Math.round(severity),
        risk_probability: Math.min(1, severity / 120),
        potential_impact_pct: -Math.round(severity * 0.3),
        risk_indicators: {
          appreciation_rate: wci.capital_appreciation_rate,
          yield_stability: wci.rental_yield_stability,
          price_momentum: wci.price_momentum,
        },
        mitigation_strategy:
          "Diversify into rental-stable assets. Reduce speculative positions. Increase cash reserves.",
        alert_status: severity >= 80 ? "critical" : severity >= 60 ? "elevated" : "monitoring",
      });
    }

    // Liquidity contraction
    if (wci.liquidity_adjusted_roi < 20 && wci.time_to_exit_months > 18) {
      const severity = Math.min(100, (100 - wci.liquidity_adjusted_roi) * 0.6 + wci.time_to_exit_months * 2);
      risks.push({
        city: wci.city,
        district: wci.district,
        country: wci.country || "Indonesia",
        risk_type: "liquidity_contraction",
        risk_severity: Math.round(severity),
        risk_probability: Math.min(1, severity / 100),
        potential_impact_pct: -Math.round(severity * 0.2),
        risk_indicators: {
          liquidity_roi: wci.liquidity_adjusted_roi,
          time_to_exit: wci.time_to_exit_months,
          absorption: wci.absorption_rate,
        },
        mitigation_strategy:
          "Shift to high-liquidity districts. Consider price reduction for faster exit. Engage buyer networks.",
        alert_status: severity >= 80 ? "critical" : severity >= 60 ? "elevated" : "monitoring",
      });
    }

    // Oversupply wave: high density + low absorption
    if (conc && conc.asset_density_per_sqkm > 50 && wci.absorption_rate < 30) {
      const severity = Math.min(100, conc.asset_density_per_sqkm + (50 - wci.absorption_rate));
      risks.push({
        city: wci.city,
        district: wci.district,
        country: wci.country || "Indonesia",
        risk_type: "oversupply_wave",
        risk_severity: Math.round(severity),
        risk_probability: 0.6,
        potential_impact_pct: -Math.round(severity * 0.15),
        risk_indicators: {
          asset_density: conc.asset_density_per_sqkm,
          absorption_rate: wci.absorption_rate,
          concentration_tier: conc.concentration_tier,
        },
        mitigation_strategy:
          "Pause new development. Focus on absorption campaigns. Differentiate through premium amenities.",
        alert_status: severity >= 70 ? "elevated" : "monitoring",
      });
    }
  }

  for (const r of risks) {
    await sb.from("wealth_risk_radar").insert(r);
  }

  // Emit engine cycle
  await sb.from("ai_event_signals").insert({
    event_type: "wealth_intelligence_engine_cycle",
    entity_type: "system",
    priority_level: risks.some((r: any) => r.alert_status === "critical") ? "critical" : "normal",
    payload: {
      risks_detected: risks.length,
      critical_risks: risks.filter((r: any) => r.alert_status === "critical").length,
      risk_types: [...new Set(risks.map((r: any) => r.risk_type))],
    },
  });

  return json({ data: { risks_detected: risks.length, risks } });
}

// ── Dashboard ──
async function handleDashboard(sb: any) {
  const [flowsRes, wciRes, heatRes, intergenRes, riskRes] = await Promise.all([
    sb.from("wealth_flow_observatory").select("*").order("detected_at", { ascending: false }).limit(30),
    sb.from("wealth_creation_index").select("*").order("wealth_creation_score", { ascending: false }).limit(20),
    sb.from("wealth_concentration_heatmap").select("*").order("total_asset_value_usd", { ascending: false }).limit(20),
    sb.from("intergenerational_asset_predictor").select("*").order("generational_wealth_score", { ascending: false }).limit(15),
    sb.from("wealth_risk_radar").select("*").order("risk_severity", { ascending: false }).limit(20),
  ]);

  const wciList = wciRes.data ?? [];
  const risks = riskRes.data ?? [];
  const sovereignGrade = wciList.filter((w: any) => w.wealth_tier === "sovereign_grade");
  const criticalRisks = risks.filter((r: any) => r.alert_status === "critical");

  return json({
    data: {
      summary: {
        total_wealth_flows: (flowsRes.data ?? []).length,
        cities_indexed: wciList.length,
        sovereign_grade_cities: sovereignGrade.length,
        avg_wealth_score: wciList.length > 0
          ? Math.round(wciList.reduce((s: number, w: any) => s + w.wealth_creation_score, 0) / wciList.length)
          : 0,
        total_asset_value_usd: (heatRes.data ?? []).reduce((s: number, h: any) => s + (h.total_asset_value_usd || 0), 0),
        critical_risks: criticalRisks.length,
        dynastic_cities: (intergenRes.data ?? []).filter((i: any) => i.wealth_preservation_tier === "dynastic").length,
        top_wealth_city: wciList[0]?.city ?? "N/A",
      },
      wealth_flows: flowsRes.data ?? [],
      wealth_index: wciList,
      concentration_heatmap: heatRes.data ?? [],
      intergenerational_forecasts: intergenRes.data ?? [],
      risk_radar: risks,
    },
  });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
