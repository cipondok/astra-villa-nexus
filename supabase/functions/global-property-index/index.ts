import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params } = await req.json();

    switch (mode) {
      case "compute_constituents": return handleConstituents(sb, params);
      case "compute_index_values": return handleIndexValues(sb, params);
      case "rebalance": return handleRebalance(sb, params);
      case "dashboard": return handleDashboard(sb);
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

// ── Compute Constituents ──
async function handleConstituents(sb: any, params: any) {
  const indexCode = params?.index_code ?? "ASTRA-GPI";

  const { data: indexDef } = await sb
    .from("gpi_index_definitions")
    .select("*")
    .eq("index_code", indexCode)
    .single();

  if (!indexDef) return json({ error: `Index ${indexCode} not found` }, 404);

  // Gather intelligence data
  const { data: wciData } = await sb
    .from("wealth_creation_index")
    .select("*")
    .order("wealth_creation_score", { ascending: false })
    .limit(50);

  const { data: expansionData } = await sb
    .from("city_expansion_probability")
    .select("*")
    .limit(50);

  const expansionMap = new Map(
    (expansionData ?? []).map((e: any) => [`${e.city}-${e.district || ""}`.toLowerCase(), e])
  );

  // Apply filters
  let cities = wciData ?? [];
  if (indexDef.city_filter) {
    cities = cities.filter((c: any) => c.city?.toLowerCase() === indexDef.city_filter.toLowerCase());
  }
  if (indexDef.index_tier === "luxury") {
    cities = cities.filter((c: any) => c.wealth_tier === "sovereign_grade" || c.wealth_tier === "institutional_grade");
  }
  if (indexDef.index_tier === "rental_yield") {
    cities = cities.filter((c: any) => c.rental_yield_stability > 40);
  }

  const wL = indexDef.w_liquidity;
  const wT = indexDef.w_transaction_velocity;
  const wC = indexDef.w_capital_inflow;
  const wP = indexDef.w_price_appreciation;

  const constituents = [];
  let totalScore = 0;

  for (const city of cities) {
    const key = `${city.city}-${city.district || ""}`.toLowerCase();
    const exp = expansionMap.get(key) as any;

    const liqScore = city.liquidity_adjusted_roi ?? 0;
    const txVelocity = exp?.absorption_acceleration ?? city.absorption_rate ?? 0;
    const capitalInflow = exp?.investor_entry_velocity ?? 0;
    const priceSlope = city.capital_appreciation_rate ?? 0;

    const composite = Math.round(
      liqScore * wL + txVelocity * wT + capitalInflow * wC + priceSlope * wP
    );

    totalScore += composite;

    constituents.push({
      index_id: indexDef.id,
      city: city.city,
      district: city.district || null,
      country: city.country || "Indonesia",
      liquidity_score: liqScore,
      transaction_velocity_score: txVelocity,
      capital_inflow_score: capitalInflow,
      price_appreciation_score: priceSlope,
      composite_score: composite,
      market_value_usd: city.liquidity_adjusted_roi * 100_000,
      listing_count: Math.round(city.absorption_rate * 10),
      is_active: true,
    });
  }

  // Compute weights
  for (const c of constituents) {
    c.weight_in_index = totalScore > 0
      ? Math.round((c.composite_score / totalScore) * 100000) / 100000
      : 1 / constituents.length;
  }

  // Upsert
  for (const c of constituents) {
    await sb.from("gpi_index_constituents").upsert(c, { onConflict: "index_id,city,district" });
  }

  return json({
    data: {
      index: indexDef.index_code,
      constituents_count: constituents.length,
      total_composite: totalScore,
      constituents,
    },
  });
}

// ── Compute Index Values ──
async function handleIndexValues(sb: any, params: any) {
  const { data: indexes } = await sb
    .from("gpi_index_definitions")
    .select("*")
    .eq("is_active", true);

  const today = new Date().toISOString().slice(0, 10);
  const results = [];

  for (const idx of indexes ?? []) {
    const { data: constituents } = await sb
      .from("gpi_index_constituents")
      .select("*")
      .eq("index_id", idx.id)
      .eq("is_active", true);

    if (!constituents || constituents.length === 0) continue;

    // Weighted composite
    let weightedSum = 0;
    let totalMarketValue = 0;
    for (const c of constituents) {
      weightedSum += c.composite_score * c.weight_in_index;
      totalMarketValue += c.market_value_usd || 0;
    }

    // Get previous value
    const { data: prevValues } = await sb
      .from("gpi_index_values")
      .select("index_value, value_date")
      .eq("index_id", idx.id)
      .order("value_date", { ascending: false })
      .limit(30);

    const prevValue = prevValues?.[0]?.index_value ?? idx.base_value;
    const prev7 = prevValues?.[6]?.index_value ?? prevValue;
    const prev30 = prevValues?.[29]?.index_value ?? prevValue;

    // Index value: base * (1 + normalized score change)
    const scoreNormalized = weightedSum / 100;
    const dailyDrift = (scoreNormalized - 0.5) * 0.02; // ±1% daily max
    const newValue = Math.round(prevValue * (1 + dailyDrift) * 10000) / 10000;

    const dailyChange = prevValue > 0 ? ((newValue - prevValue) / prevValue) * 100 : 0;
    const weeklyChange = prev7 > 0 ? ((newValue - prev7) / prev7) * 100 : 0;
    const monthlyChange = prev30 > 0 ? ((newValue - prev30) / prev30) * 100 : 0;

    // Volatility (stddev of daily changes)
    const dailyReturns = [];
    for (let i = 0; i < (prevValues?.length ?? 0) - 1; i++) {
      const r = (prevValues[i].index_value - prevValues[i + 1].index_value) / prevValues[i + 1].index_value;
      dailyReturns.push(r);
    }
    const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length : 0;
    const variance = dailyReturns.length > 1
      ? dailyReturns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / (dailyReturns.length - 1)
      : 0;
    const vol30d = Math.round(Math.sqrt(variance) * 100 * 10000) / 10000;

    // Sharpe (annualized)
    const annualizedReturn = avgReturn * 252;
    const annualizedVol = Math.sqrt(variance) * Math.sqrt(252);
    const sharpe = annualizedVol > 0
      ? Math.round((annualizedReturn / annualizedVol) * 10000) / 10000
      : 0;

    // Max drawdown
    let peak = idx.base_value;
    let maxDD = 0;
    for (const pv of [...(prevValues ?? [])].reverse()) {
      if (pv.index_value > peak) peak = pv.index_value;
      const dd = (peak - pv.index_value) / peak;
      if (dd > maxDD) maxDD = dd;
    }

    const record = {
      index_id: idx.id,
      value_date: today,
      index_value: newValue,
      daily_change_pct: Math.round(dailyChange * 10000) / 10000,
      weekly_change_pct: Math.round(weeklyChange * 10000) / 10000,
      monthly_change_pct: Math.round(monthlyChange * 10000) / 10000,
      ytd_change_pct: Math.round(((newValue - idx.base_value) / idx.base_value) * 100 * 10000) / 10000,
      volatility_30d: vol30d,
      sharpe_ratio: sharpe,
      max_drawdown_pct: Math.round(maxDD * 100 * 10000) / 10000,
      constituents_count: constituents.length,
      total_market_value_usd: totalMarketValue,
    };

    await sb.from("gpi_index_values").upsert(record, { onConflict: "index_id,value_date" });
    results.push({ index: idx.index_code, ...record });
  }

  // Emit engine event
  await sb.from("ai_event_signals").insert({
    event_type: "gpi_index_computed",
    entity_type: "system",
    priority_level: "normal",
    payload: {
      indexes_computed: results.length,
      date: today,
      flagship_value: results.find((r: any) => r.index === "ASTRA-GPI")?.index_value,
    },
  });

  return json({ data: { indexes_computed: results.length, date: today, results } });
}

// ── Rebalance Engine ──
async function handleRebalance(sb: any, params: any) {
  const indexCode = params?.index_code ?? "ASTRA-GPI";
  const triggerType = params?.trigger_type ?? "scheduled";

  const { data: indexDef } = await sb
    .from("gpi_index_definitions")
    .select("*")
    .eq("index_code", indexCode)
    .single();

  if (!indexDef) return json({ error: `Index ${indexCode} not found` }, 404);

  // Get current constituents
  const { data: currentConstituents } = await sb
    .from("gpi_index_constituents")
    .select("*")
    .eq("index_id", indexDef.id)
    .eq("is_active", true);

  // Get latest index value
  const { data: latestValue } = await sb
    .from("gpi_index_values")
    .select("index_value")
    .eq("index_id", indexDef.id)
    .order("value_date", { ascending: false })
    .limit(1);

  const preValue = latestValue?.[0]?.index_value ?? indexDef.base_value;

  // Recompute constituents
  const result = await handleConstituents(sb, { index_code: indexCode });
  const recomputedData = await result.json();

  // Market shock absorption: dampen large weight shifts
  const dampener = triggerType === "market_shock" ? 0.5 : 1.0;
  const safeguardApplied = dampener < 1.0;

  // Calculate weight changes
  const oldWeights = new Map(
    (currentConstituents ?? []).map((c: any) => [`${c.city}-${c.district || ""}`, c.weight_in_index])
  );

  const weightChanges: Record<string, { old: number; new: number; delta: number }> = {};
  for (const c of recomputedData?.data?.constituents ?? []) {
    const key = `${c.city}-${c.district || ""}`;
    const oldW = oldWeights.get(key) ?? 0;
    const newW = c.weight_in_index * dampener + oldW * (1 - dampener);
    if (Math.abs(newW - oldW) > 0.001) {
      weightChanges[key] = {
        old: Math.round(oldW * 100000) / 100000,
        new: Math.round(newW * 100000) / 100000,
        delta: Math.round((newW - oldW) * 100000) / 100000,
      };
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const rebalanceRecord = {
    index_id: indexDef.id,
    rebalance_date: today,
    trigger_type: triggerType,
    constituents_added: Math.max(0, (recomputedData?.data?.constituents_count ?? 0) - (currentConstituents?.length ?? 0)),
    constituents_removed: Math.max(0, (currentConstituents?.length ?? 0) - (recomputedData?.data?.constituents_count ?? 0)),
    weight_changes: weightChanges,
    pre_rebalance_value: preValue,
    post_rebalance_value: preValue, // value unchanged until next computation
    stability_safeguard_applied: safeguardApplied,
    shock_absorption_dampener: dampener,
  };

  await sb.from("gpi_rebalance_events").insert(rebalanceRecord);

  return json({
    data: {
      index: indexCode,
      rebalance_date: today,
      trigger_type: triggerType,
      weight_changes_count: Object.keys(weightChanges).length,
      safeguard_applied: safeguardApplied,
      rebalanceRecord,
    },
  });
}

// ── Dashboard ──
async function handleDashboard(sb: any) {
  const [defsRes, valsRes, constRes, rebalRes, instRes] = await Promise.all([
    sb.from("gpi_index_definitions").select("*").eq("is_active", true).order("index_tier"),
    sb.from("gpi_index_values").select("*").order("value_date", { ascending: false }).limit(100),
    sb.from("gpi_index_constituents").select("*").eq("is_active", true).order("composite_score", { ascending: false }).limit(50),
    sb.from("gpi_rebalance_events").select("*").order("rebalance_date", { ascending: false }).limit(10),
    sb.from("gpi_institutional_access").select("*").eq("is_active", true).limit(20),
  ]);

  const defs = defsRes.data ?? [];
  const vals = valsRes.data ?? [];

  // Latest value per index
  const latestByIndex: Record<string, any> = {};
  for (const v of vals) {
    if (!latestByIndex[v.index_id]) latestByIndex[v.index_id] = v;
  }

  const indexSummaries = defs.map((d: any) => {
    const latest = latestByIndex[d.id];
    return {
      index_code: d.index_code,
      index_name: d.index_name,
      tier: d.index_tier,
      current_value: latest?.index_value ?? d.base_value,
      daily_change: latest?.daily_change_pct ?? 0,
      ytd_change: latest?.ytd_change_pct ?? 0,
      volatility: latest?.volatility_30d ?? 0,
      sharpe: latest?.sharpe_ratio ?? 0,
      constituents: latest?.constituents_count ?? 0,
    };
  });

  const flagship = indexSummaries.find((s: any) => s.index_code === "ASTRA-GPI");

  return json({
    data: {
      summary: {
        total_indexes: defs.length,
        flagship_value: flagship?.current_value ?? 1000,
        flagship_ytd: flagship?.ytd_change ?? 0,
        total_constituents: (constRes.data ?? []).length,
        total_market_value_usd: (constRes.data ?? []).reduce((s: number, c: any) => s + (c.market_value_usd || 0), 0),
        institutional_subscribers: (instRes.data ?? []).length,
        last_rebalance: (rebalRes.data ?? [])[0]?.rebalance_date ?? "N/A",
      },
      indexes: indexSummaries,
      index_definitions: defs,
      latest_values: vals.slice(0, 30),
      top_constituents: (constRes.data ?? []).slice(0, 20),
      recent_rebalances: rebalRes.data ?? [],
      institutional_access: instRes.data ?? [],
    },
  });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
