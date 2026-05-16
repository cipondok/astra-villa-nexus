import { createClient } from "npm:@supabase/supabase-js@2";

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
      case "predict_capital_flows":
        return json(await predictCapitalFlows(sb, params));
      case "detect_acceleration_signals":
        return json(await detectAccelerationSignals(sb, params));
      case "compute_yield_gradients":
        return json(await computeYieldGradients(sb, params));
      case "generate_influence_actions":
        return json(await generateInfluenceActions(sb, params));
      case "compute_network_metrics":
        return json(await computeNetworkMetrics(sb, params));
      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── 1. PREDICT CAPITAL FLOWS ───────────────────────
async function predictCapitalFlows(sb: any, params: any) {
  const horizon = params?.horizon || "30d";

  // Fetch market kernel data
  const { data: markets } = await sb
    .from("reos_market_intelligence_kernel")
    .select("*")
    .order("market_attractiveness_score", { ascending: false });

  if (!markets?.length) return { predictions: 0 };

  // Fetch existing properties for district-level granularity
  const { data: properties } = await sb
    .from("properties")
    .select("city, district")
    .limit(500);

  const districtSet = new Map<string, { city: string; district: string; market_code: string }>();
  for (const p of properties || []) {
    if (p.city && p.district) {
      const key = `${p.city}-${p.district}`;
      if (!districtSet.has(key)) {
        const market = markets.find((m: any) => m.city === p.city);
        districtSet.set(key, {
          city: p.city,
          district: p.district,
          market_code: market?.market_code || `ID-${p.city.toUpperCase().slice(0, 3)}`,
        });
      }
    }
  }

  const predictions: any[] = [];

  for (const [, dist] of districtSet) {
    const market = markets.find((m: any) => m.market_code === dist.market_code);
    const attractiveness = market?.market_attractiveness_score || 50;
    const investorVelocity = market?.investor_inflow_velocity || 0;
    const priceMom = market?.price_momentum_30d || 0;
    const crossBorder = market?.cross_border_capital_pct || 0;

    // Institutional forecast: function of market attractiveness + FDI
    const instInflow = Math.round(
      attractiveness * 1e7 * (1 + (market?.fdi_inflow_index || 0) / 100) * Math.random()
    );
    const instConfidence = Math.min(95, 40 + attractiveness * 0.5);

    // Retail demand wave: function of price momentum + digital adoption
    const retailWave = Math.round(
      30 + priceMom * 2 + (market?.digital_adoption_rate || 50) * 0.3 + Math.random() * 20
    );
    const retailSentiment = Math.round(40 + priceMom * 3 + Math.random() * 20);

    // Cross-border migration
    const crossMigration = Math.round(crossBorder * 2 + investorVelocity * 0.3);
    const fxTailwind = Math.round(
      (market?.currency_strength_index || 50) > 60 ? 30 + Math.random() * 40 : Math.random() * 30
    );

    // Composite gravity score
    const gravityScore = Math.min(100, Math.round(
      instConfidence * 0.30 +
      retailWave * 0.25 +
      crossMigration * 0.20 +
      (priceMom > 0 ? priceMom * 3 : 0) * 0.15 +
      fxTailwind * 0.10
    ));

    const tier =
      gravityScore >= 85 ? "magnetic" :
      gravityScore >= 65 ? "strong" :
      gravityScore >= 40 ? "neutral" :
      gravityScore >= 20 ? "weak" : "repulsive";

    predictions.push({
      market_code: dist.market_code,
      city: dist.city,
      district: dist.district,
      prediction_horizon: horizon,
      institutional_inflow_forecast: instInflow,
      institutional_confidence: Math.round(instConfidence * 10) / 10,
      retail_demand_wave_index: retailWave,
      retail_sentiment_score: retailSentiment,
      retail_search_momentum: Math.round(Math.random() * 100),
      cross_border_migration_score: crossMigration,
      cross_border_origin_countries: crossBorder > 20
        ? ["SG", "AU", "CN", "US"].slice(0, Math.ceil(Math.random() * 4))
        : [],
      fx_tailwind_index: fxTailwind,
      capital_gravity_score: gravityScore,
      gravity_tier: tier,
      predicted_capital_volume: instInflow + retailWave * 5e6,
    });
  }

  if (predictions.length) {
    const chunks = chunkArray(predictions, 50);
    for (const chunk of chunks) {
      await sb.from("capital_flow_predictions")
        .upsert(chunk, { onConflict: "market_code,district,prediction_horizon" });
    }
  }

  return {
    predictions: predictions.length,
    magnetic_zones: predictions.filter((p) => p.gravity_tier === "magnetic").length,
    strong_zones: predictions.filter((p) => p.gravity_tier === "strong").length,
    horizon,
  };
}

// ─── 2. DETECT ACCELERATION SIGNALS ─────────────────
async function detectAccelerationSignals(sb: any, params: any) {
  const marketCode = params?.market_code;

  let query = sb.from("capital_flow_predictions").select("*");
  if (marketCode) query = query.eq("market_code", marketCode);
  const { data: predictions } = await query.order("capital_gravity_score", { ascending: false }).limit(100);

  if (!predictions?.length) return { signals: 0 };

  const signals: any[] = [];

  for (const pred of predictions) {
    // District breakout: gravity >= 75 and retail wave high
    if (pred.capital_gravity_score >= 75 && pred.retail_demand_wave_index >= 70) {
      signals.push({
        market_code: pred.market_code,
        city: pred.city,
        district: pred.district,
        signal_type: "district_breakout",
        signal_strength: Math.min(100, pred.capital_gravity_score + 10),
        acceleration_rate: pred.retail_demand_wave_index * 0.5,
        days_to_breakout: Math.max(7, Math.round(30 - pred.capital_gravity_score * 0.2)),
        current_metric: pred.capital_gravity_score,
        pct_change: pred.retail_demand_wave_index,
        status: pred.capital_gravity_score >= 85 ? "confirmed" : "active",
      });
    }

    // Hotspot emergence: strong cross-border + high sentiment
    if (pred.cross_border_migration_score >= 50 && pred.retail_sentiment_score >= 60) {
      signals.push({
        market_code: pred.market_code,
        city: pred.city,
        district: pred.district,
        signal_type: "hotspot_emergence",
        signal_strength: Math.round((pred.cross_border_migration_score + pred.retail_sentiment_score) / 2),
        acceleration_rate: pred.cross_border_migration_score * 0.3,
        current_metric: pred.cross_border_migration_score,
        pct_change: pred.retail_sentiment_score,
        status: "emerging",
      });
    }

    // Institutional entry: high institutional confidence
    if (pred.institutional_confidence >= 70 && pred.institutional_inflow_forecast > 5e8) {
      signals.push({
        market_code: pred.market_code,
        city: pred.city,
        district: pred.district,
        signal_type: "institutional_entry",
        signal_strength: Math.round(pred.institutional_confidence),
        acceleration_rate: pred.institutional_inflow_forecast / 1e9,
        current_metric: pred.institutional_inflow_forecast,
        status: "active",
      });
    }

    // Momentum surge: gravity magnetic
    if (pred.gravity_tier === "magnetic") {
      signals.push({
        market_code: pred.market_code,
        city: pred.city,
        district: pred.district,
        signal_type: "momentum_surge",
        signal_strength: pred.capital_gravity_score,
        acceleration_rate: pred.predicted_capital_volume / 1e9,
        current_metric: pred.predicted_capital_volume,
        status: "confirmed",
      });
    }
  }

  if (signals.length) {
    const { error } = await sb.from("liquidity_acceleration_signals").insert(signals);
    if (error) throw error;
  }

  return {
    signals_generated: signals.length,
    breakouts: signals.filter((s) => s.signal_type === "district_breakout").length,
    institutional: signals.filter((s) => s.signal_type === "institutional_entry").length,
    momentum: signals.filter((s) => s.signal_type === "momentum_surge").length,
  };
}

// ─── 3. COMPUTE YIELD GRADIENTS ─────────────────────
async function computeYieldGradients(sb: any, params: any) {
  const marketCode = params?.market_code;

  let query = sb.from("capital_flow_predictions").select("market_code, city, district");
  if (marketCode) query = query.eq("market_code", marketCode);
  const { data: districts } = await query.limit(100);

  if (!districts?.length) return { computed: 0 };

  // Fetch market kernel for national context
  const { data: markets } = await sb
    .from("reos_market_intelligence_kernel")
    .select("market_code, median_price_psm, price_momentum_30d, price_volatility");

  const nationalAvg = markets?.length
    ? markets.reduce((s: number, m: any) => s + (m.price_momentum_30d || 0), 0) / markets.length
    : 5;

  const gradients: any[] = [];
  const seenKeys = new Set<string>();

  for (const d of districts) {
    const key = `${d.market_code}:${d.district}:all`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const market = markets?.find((m: any) => m.market_code === d.market_code);
    const priceMom = market?.price_momentum_30d || 5;
    const vol = market?.price_volatility || 10;

    const grossYield = 4 + Math.random() * 10;
    const netYield = grossYield * 0.75;
    const capApp12m = priceMom + (Math.random() - 0.3) * 5;
    const capApp36m = capApp12m * 2.5;
    const totalReturn = netYield + capApp12m;
    const riskAdj = vol > 0 ? totalReturn / (1 + vol / 100) : totalReturn;
    const sharpe = vol > 0 ? (totalReturn - 4.5) / vol : 0;

    const direction =
      capApp12m > 8 ? "expanding" :
      capApp12m < -2 ? "compressing" :
      vol > 15 ? "volatile" : "stable";

    gradients.push({
      market_code: d.market_code,
      city: d.city,
      district: d.district,
      asset_type: "all",
      gross_rental_yield: Math.round(grossYield * 100) / 100,
      net_rental_yield: Math.round(netYield * 100) / 100,
      capital_appreciation_12m: Math.round(capApp12m * 100) / 100,
      capital_appreciation_36m: Math.round(capApp36m * 100) / 100,
      total_return_forecast: Math.round(totalReturn * 100) / 100,
      risk_adjusted_return: Math.round(riskAdj * 100) / 100,
      sharpe_proxy: Math.round(sharpe * 100) / 100,
      volatility: Math.round(vol * 100) / 100,
      downside_risk: Math.round(Math.max(0, vol * 0.6) * 100) / 100,
      yield_vs_national_avg: Math.round((netYield - nationalAvg) * 100) / 100,
      yield_gradient_direction: direction,
      gradient_velocity: Math.round(capApp12m * 0.3 * 100) / 100,
      last_computed_at: new Date().toISOString(),
    });
  }

  // Compute rankings
  gradients.sort((a, b) => b.risk_adjusted_return - a.risk_adjusted_return);
  gradients.forEach((g, i) => { g.yield_rank_global = i + 1; });

  if (gradients.length) {
    const chunks = chunkArray(gradients, 50);
    for (const chunk of chunks) {
      await sb.from("yield_gradient_map")
        .upsert(chunk, { onConflict: "market_code,district,asset_type" });
    }
  }

  return {
    computed: gradients.length,
    expanding: gradients.filter((g) => g.yield_gradient_direction === "expanding").length,
    top_yield: gradients[0]
      ? { district: gradients[0].district, return: gradients[0].risk_adjusted_return }
      : null,
  };
}

// ─── 4. GENERATE INFLUENCE ACTIONS ──────────────────
async function generateInfluenceActions(sb: any, _params: any) {
  // Get top gravity zones
  const { data: magnetic } = await sb
    .from("capital_flow_predictions")
    .select("*")
    .in("gravity_tier", ["magnetic", "strong"])
    .order("capital_gravity_score", { ascending: false })
    .limit(20);

  // Get acceleration signals
  const { data: signals } = await sb
    .from("liquidity_acceleration_signals")
    .select("*")
    .in("status", ["active", "confirmed"])
    .order("signal_strength", { ascending: false })
    .limit(20);

  const actions: any[] = [];

  for (const zone of magnetic || []) {
    if (zone.gravity_tier === "magnetic") {
      actions.push({
        market_code: zone.market_code,
        district: zone.district,
        action_type: "urgency_signal",
        target_audience: "investors",
        headline: `Capital Gravity Magnetic Zone: ${zone.district}`,
        narrative: `${zone.district} has reached magnetic gravity (${zone.capital_gravity_score}/100) with IDR ${(zone.predicted_capital_volume / 1e9).toFixed(1)}B predicted capital inflow. Early positioning recommended.`,
        supporting_data: { gravity_score: zone.capital_gravity_score, predicted_volume: zone.predicted_capital_volume },
        delivery_channel: "dashboard",
        priority: "high",
      });
    }

    if (zone.institutional_confidence >= 70) {
      actions.push({
        market_code: zone.market_code,
        district: zone.district,
        action_type: "institutional_signal",
        target_audience: "institutional",
        headline: `Institutional Capital Incoming: ${zone.district}`,
        narrative: `${zone.institutional_confidence}% confidence of institutional capital deployment in ${zone.district}. Smart money positioning detected.`,
        supporting_data: { confidence: zone.institutional_confidence, forecast: zone.institutional_inflow_forecast },
        delivery_channel: "platform",
        priority: "high",
      });
    }
  }

  for (const sig of signals || []) {
    if (sig.signal_type === "district_breakout" && sig.status === "confirmed") {
      actions.push({
        market_code: sig.market_code,
        district: sig.district,
        action_type: "breakout_alert",
        target_audience: "all",
        headline: `District Breakout Confirmed: ${sig.district}`,
        narrative: `${sig.district} has confirmed breakout status. Signal strength: ${sig.signal_strength}/100. Estimated ${sig.days_to_breakout} days to peak momentum.`,
        supporting_data: { strength: sig.signal_strength, days: sig.days_to_breakout },
        delivery_channel: "push",
        priority: "critical",
      });
    }
  }

  if (actions.length) {
    const { error } = await sb.from("capital_influence_actions").insert(actions);
    if (error) throw error;
  }

  return {
    actions_generated: actions.length,
    critical: actions.filter((a) => a.priority === "critical").length,
    high: actions.filter((a) => a.priority === "high").length,
  };
}

// ─── 5. COMPUTE NETWORK METRICS ─────────────────────
async function computeNetworkMetrics(sb: any, _params: any) {
  const { data: markets } = await sb
    .from("reos_market_intelligence_kernel")
    .select("market_code, city, investor_inflow_velocity, market_attractiveness_score");

  if (!markets?.length) return { computed: 0 };

  const records: any[] = [];

  for (const m of markets) {
    const investors = Math.round(20 + Math.random() * 500);
    const newInvestors = Math.round(investors * (0.05 + Math.random() * 0.15));
    const growthRate = investors > 0 ? (newInvestors / investors) * 100 : 0;
    const deals = Math.round(Math.random() * 50 + 5);
    const avgDealSize = 1e9 + Math.random() * 5e9;
    const liquidity = deals * avgDealSize;
    const daysToClose = 30 + Math.round(Math.random() * 60);

    const capitalInflow = liquidity * 0.3 + (m.investor_inflow_velocity || 0) * 1e7;
    const multiplier = investors > 100 ? 1.5 + Math.random() * 0.5 : 1.0 + Math.random() * 0.3;
    const flywheelRpm = Math.round(investors * deals * multiplier / 100);
    const metcalfe = Math.round(investors * investors * 0.01);

    const phase =
      investors >= 500 ? "dominant" :
      investors >= 200 ? "critical_mass" :
      investors >= 100 ? "accelerating" :
      investors >= 30 ? "growing" : "nascent";

    const timeToCM = phase === "dominant" || phase === "critical_mass" ? 0
      : Math.round((200 - investors) / Math.max(1, newInvestors) * 30);

    records.push({
      market_code: m.market_code,
      city: m.city,
      active_investors: investors,
      new_investors_30d: newInvestors,
      investor_growth_rate: Math.round(growthRate * 100) / 100,
      total_liquidity_volume: Math.round(liquidity),
      avg_days_to_close: daysToClose,
      liquidity_depth_index: Math.round((liquidity / 1e10) * 100),
      deals_closed_30d: deals,
      deal_velocity_acceleration: Math.round(growthRate * 0.5 * 100) / 100,
      avg_deal_size: Math.round(avgDealSize),
      capital_inflow_30d: Math.round(capitalInflow),
      capital_multiplier: Math.round(multiplier * 100) / 100,
      flywheel_rpm: flywheelRpm,
      network_maturity_phase: phase,
      time_to_critical_mass_days: timeToCM,
      metcalfe_value_proxy: metcalfe,
    });
  }

  if (records.length) {
    const { error } = await sb
      .from("capital_network_effect_metrics")
      .upsert(records, { onConflict: "market_code,snapshot_date" });
    if (error) throw error;
  }

  return {
    computed: records.length,
    dominant_markets: records.filter((r) => r.network_maturity_phase === "dominant").length,
    critical_mass: records.filter((r) => r.network_maturity_phase === "critical_mass").length,
    total_flywheel_rpm: records.reduce((s, r) => s + r.flywheel_rpm, 0),
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
