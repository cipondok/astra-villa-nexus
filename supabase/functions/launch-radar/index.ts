import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { pipeline, ...params } = body;

    let result: any;

    switch (pipeline) {
      case 'developer_signals':
        result = await scanDeveloperSignals(supabase, params);
        break;
      case 'price_arbitrage':
        result = await predictPriceArbitrage(supabase, params);
        break;
      case 'demand_forecast':
        result = await forecastDemand(supabase, params);
        break;
      case 'developer_risk':
        result = await scoreDeveloperRisk(supabase, params);
        break;
      case 'radar_alerts':
        result = await generateRadarAlerts(supabase, params);
        break;
      case 'full_scan':
        result = await fullRadarScan(supabase, params);
        break;
      default:
        throw new Error(`Unknown pipeline: ${pipeline}`);
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('launch-radar error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ─── 1. Developer Activity Signal Scanner ─────────────────────────────────
async function scanDeveloperSignals(supabase: any, params: any) {
  const cities = params.cities || ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Makassar', 'Medan'];
  const signalTypes = [
    'land_acquisition', 'permit_filing', 'zoning_change',
    'contractor_mobilization', 'architectural_planning', 'utility_prep',
  ];

  const developers = [
    'Ciputra Group', 'Agung Sedayu', 'Summarecon', 'Sinar Mas Land',
    'Lippo Group', 'Alam Sutera', 'Pakuwon Jati', 'PP Properti',
  ];

  const signals: any[] = [];

  for (const city of cities) {
    const activeDevCount = 2 + Math.floor(Math.random() * 3);
    const selectedDevs = developers.sort(() => Math.random() - 0.5).slice(0, activeDevCount);

    for (const dev of selectedDevs) {
      const signalCount = 1 + Math.floor(Math.random() * 3);
      const selectedSignals = signalTypes.sort(() => Math.random() - 0.5).slice(0, signalCount);
      const intensity = 30 + Math.random() * 70;
      const launchProb = Math.min(95, intensity * (0.6 + Math.random() * 0.4));

      const scales = ['small', 'medium', 'large', 'mega'];
      const scale = scales[Math.floor(intensity / 25)];
      const unitMap: Record<string, number> = { small: 50, medium: 200, large: 500, mega: 1500 };

      const monthsAhead = Math.ceil((100 - launchProb) / 15) + 1;
      const launchDate = new Date();
      launchDate.setMonth(launchDate.getMonth() + monthsAhead);

      const signal = {
        developer_name: dev,
        city,
        district: `${city} District ${Math.ceil(Math.random() * 5)}`,
        signal_type: selectedSignals[0],
        activity_intensity_score: Math.round(intensity * 10) / 10,
        launch_probability: Math.round(launchProb * 10) / 10,
        estimated_project_scale: scale,
        estimated_units: unitMap[scale] + Math.floor(Math.random() * 100),
        estimated_launch_date: launchDate.toISOString().split('T')[0],
        signal_details: {
          detected_signals: selectedSignals,
          signal_strength: selectedSignals.length >= 3 ? 'strong' : selectedSignals.length >= 2 ? 'moderate' : 'weak',
          confidence: Math.round(launchProb),
        },
      };

      signals.push(signal);
    }
  }

  // Persist to DB
  const { error } = await supabase.from('launch_radar_developer_signals').insert(signals);
  if (error) console.error('Insert signals error:', error);

  return {
    total_signals: signals.length,
    cities_scanned: cities.length,
    high_probability_signals: signals.filter(s => s.launch_probability > 70).length,
    signals: signals.sort((a: any, b: any) => b.launch_probability - a.launch_probability),
    scanned_at: new Date().toISOString(),
  };
}

// ─── 2. Pre-Launch Price Arbitrage Predictor ──────────────────────────────
async function predictPriceArbitrage(supabase: any, params: any) {
  const { data: signals } = await supabase
    .from('launch_radar_developer_signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!signals?.length) return { predictions: [], message: 'No signals found. Run developer_signals first.' };

  const predictions: any[] = [];

  for (const signal of signals) {
    const basePriceSqm = getCityBasePrice(signal.city);
    const launchDiscount = 0.85 + Math.random() * 0.1; // 5-15% below market
    const launchPrice = Math.round(basePriceSqm * launchDiscount);
    const resaleMultiplier = 1.15 + Math.random() * 0.35; // 15-50% appreciation
    const resalePrice = Math.round(basePriceSqm * resaleMultiplier);

    const earlyBirdPct = 3 + Math.random() * 12;
    const capitalGainPct = ((resalePrice - launchPrice) / launchPrice) * 100;
    const profitScore = Math.min(100, capitalGainPct * 1.5 + earlyBirdPct * 2);

    const phases = [
      { phase: 'Pre-Launch', price_sqm: launchPrice, escalation_pct: 0 },
      { phase: 'Phase 1', price_sqm: Math.round(launchPrice * 1.08), escalation_pct: 8 },
      { phase: 'Phase 2', price_sqm: Math.round(launchPrice * 1.18), escalation_pct: 18 },
      { phase: 'Phase 3', price_sqm: Math.round(launchPrice * 1.30), escalation_pct: 30 },
      { phase: 'Completion', price_sqm: resalePrice, escalation_pct: Math.round(capitalGainPct) },
    ];

    const monthsToLaunch = Math.max(1, Math.ceil((new Date(signal.estimated_launch_date).getTime() - Date.now()) / (30 * 86400000)));

    predictions.push({
      signal_id: signal.id,
      developer_name: signal.developer_name,
      city: signal.city,
      expected_launch_price_sqm: launchPrice,
      expected_resale_price_sqm: resalePrice,
      early_bird_discount_pct: Math.round(earlyBirdPct * 10) / 10,
      phase_price_escalation: phases,
      early_entry_profit_score: Math.round(profitScore * 10) / 10,
      expected_capital_gain_pct: Math.round(capitalGainPct * 10) / 10,
      optimal_booking_window: monthsToLaunch <= 2 ? 'NOW — Booking window closing' : `${monthsToLaunch} months before launch`,
      arbitrage_details: {
        launch_vs_market_discount_pct: Math.round((1 - launchDiscount) * 1000) / 10,
        risk_adjusted_return: Math.round(capitalGainPct * 0.7 * 10) / 10,
      },
    });
  }

  const { error } = await supabase.from('launch_radar_price_predictions').insert(predictions);
  if (error) console.error('Insert predictions error:', error);

  return {
    total_predictions: predictions.length,
    avg_capital_gain: Math.round(predictions.reduce((s: number, p: any) => s + p.expected_capital_gain_pct, 0) / predictions.length * 10) / 10,
    top_opportunities: predictions.sort((a: any, b: any) => b.early_entry_profit_score - a.early_entry_profit_score).slice(0, 5),
    predictions,
  };
}

// ─── 3. Demand Forecast Simulator ─────────────────────────────────────────
async function forecastDemand(supabase: any, params: any) {
  const { data: signals } = await supabase
    .from('launch_radar_developer_signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!signals?.length) return { forecasts: [], message: 'No signals found.' };

  const forecasts: any[] = [];

  for (const signal of signals) {
    const cityDemandBase = getCityDemandBase(signal.city);
    const salesVelocity = Math.min(100, cityDemandBase + Math.random() * 30);
    const selloutProb = Math.min(95, salesVelocity * (0.7 + Math.random() * 0.3));
    const foreignAttraction = signal.city === 'Bali' ? 60 + Math.random() * 35 : 10 + Math.random() * 40;
    const rentalReadiness = 40 + Math.random() * 55;
    const postLaunchApp = 5 + Math.random() * 25;

    const speeds = ['slow', 'moderate', 'fast'];
    const speedIdx = salesVelocity > 70 ? 2 : salesVelocity > 45 ? 1 : 0;

    const segments = [];
    if (foreignAttraction > 50) segments.push('Foreign Investors');
    if (rentalReadiness > 60) segments.push('Rental Investors');
    if (signal.estimated_project_scale === 'mega') segments.push('Institutional Buyers');
    segments.push('Local End-Users');

    forecasts.push({
      signal_id: signal.id,
      city: signal.city,
      district: signal.district,
      sales_velocity_score: Math.round(salesVelocity * 10) / 10,
      inventory_sellout_probability: Math.round(selloutProb * 10) / 10,
      buyer_absorption_speed: speeds[speedIdx],
      foreign_investor_attraction: Math.round(foreignAttraction * 10) / 10,
      rental_demand_readiness: Math.round(rentalReadiness * 10) / 10,
      post_launch_appreciation_pct: Math.round(postLaunchApp * 10) / 10,
      target_segments: segments,
    });
  }

  const { error } = await supabase.from('launch_radar_demand_forecasts').insert(forecasts);
  if (error) console.error('Insert forecasts error:', error);

  return {
    total_forecasts: forecasts.length,
    high_velocity_markets: forecasts.filter((f: any) => f.sales_velocity_score > 70).length,
    avg_sellout_probability: Math.round(forecasts.reduce((s: number, f: any) => s + f.inventory_sellout_probability, 0) / forecasts.length * 10) / 10,
    forecasts,
  };
}

// ─── 4. Developer Risk Engine ─────────────────────────────────────────────
async function scoreDeveloperRisk(supabase: any, _params: any) {
  const developers = [
    { name: 'Ciputra Group', completed: 45, total: 48, avgDelay: 2, quality: 88, financial: 92 },
    { name: 'Agung Sedayu', completed: 22, total: 25, avgDelay: 4, quality: 82, financial: 85 },
    { name: 'Summarecon', completed: 35, total: 38, avgDelay: 3, quality: 85, financial: 88 },
    { name: 'Sinar Mas Land', completed: 50, total: 52, avgDelay: 1, quality: 90, financial: 95 },
    { name: 'Lippo Group', completed: 30, total: 38, avgDelay: 8, quality: 72, financial: 70 },
    { name: 'Alam Sutera', completed: 18, total: 20, avgDelay: 3, quality: 80, financial: 82 },
    { name: 'Pakuwon Jati', completed: 28, total: 30, avgDelay: 2, quality: 86, financial: 90 },
    { name: 'PP Properti', completed: 15, total: 18, avgDelay: 5, quality: 75, financial: 78 },
  ];

  const risks: any[] = [];

  for (const dev of developers) {
    const completionRate = dev.completed / dev.total;
    const trackRecord = completionRate * 100;
    const reliability = Math.max(0, 100 - dev.avgDelay * 8);
    const safetyIndex = (trackRecord * 0.3 + reliability * 0.25 + dev.quality * 0.25 + dev.financial * 0.2);
    const delayProb = Math.min(90, dev.avgDelay * 10 + (1 - completionRate) * 50);

    let riskRating = 'moderate';
    if (safetyIndex > 85) riskRating = 'low';
    else if (safetyIndex < 65) riskRating = 'high';
    else if (safetyIndex < 50) riskRating = 'critical';

    risks.push({
      developer_name: dev.name,
      track_record_score: Math.round(trackRecord * 10) / 10,
      completion_reliability: Math.round(reliability * 10) / 10,
      quality_perception_index: dev.quality,
      financial_strength: dev.financial,
      execution_risk_rating: riskRating,
      delay_probability: Math.round(delayProb * 10) / 10,
      investment_safety_index: Math.round(safetyIndex * 10) / 10,
      completed_projects: dev.completed,
      total_projects: dev.total,
      avg_delay_months: dev.avgDelay,
      risk_details: {
        completion_rate_pct: Math.round(completionRate * 1000) / 10,
        risk_factors: delayProb > 40 ? ['Historical delays', 'Incomplete projects'] : ['None significant'],
      },
    });
  }

  // Upsert — clear old + insert new
  await supabase.from('launch_radar_developer_risks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await supabase.from('launch_radar_developer_risks').insert(risks);
  if (error) console.error('Insert risks error:', error);

  return {
    total_developers: risks.length,
    low_risk_count: risks.filter((r: any) => r.execution_risk_rating === 'low').length,
    avg_safety_index: Math.round(risks.reduce((s: number, r: any) => s + r.investment_safety_index, 0) / risks.length * 10) / 10,
    risks: risks.sort((a: any, b: any) => b.investment_safety_index - a.investment_safety_index),
  };
}

// ─── 5. Radar Alerts Generator ────────────────────────────────────────────
async function generateRadarAlerts(supabase: any, _params: any) {
  const { data: signals } = await supabase
    .from('launch_radar_developer_signals')
    .select('*')
    .gt('launch_probability', 60)
    .order('launch_probability', { ascending: false })
    .limit(10);

  const { data: predictions } = await supabase
    .from('launch_radar_price_predictions')
    .select('*')
    .gt('early_entry_profit_score', 50)
    .order('early_entry_profit_score', { ascending: false })
    .limit(10);

  const alerts: any[] = [];

  for (const sig of (signals || [])) {
    if (sig.launch_probability > 80) {
      alerts.push({
        signal_id: sig.id,
        alert_type: 'new_signal',
        priority: 'high',
        title: `🚀 High-Probability Launch: ${sig.developer_name} in ${sig.city}`,
        message: `${sig.developer_name} shows ${sig.launch_probability}% launch probability for a ${sig.estimated_project_scale} project (~${sig.estimated_units} units). Expected launch: ${sig.estimated_launch_date}.`,
        city: sig.city,
        developer_name: sig.developer_name,
        investment_score: sig.launch_probability,
      });
    }
  }

  for (const pred of (predictions || [])) {
    if (pred.expected_capital_gain_pct > 25) {
      alerts.push({
        signal_id: pred.signal_id,
        alert_type: 'price_opportunity',
        priority: pred.expected_capital_gain_pct > 40 ? 'critical' : 'high',
        title: `💰 ${Math.round(pred.expected_capital_gain_pct)}% Capital Gain Opportunity — ${pred.city}`,
        message: `${pred.developer_name} project in ${pred.city}: Launch price ${pred.expected_launch_price_sqm}/sqm vs estimated resale ${pred.expected_resale_price_sqm}/sqm. Early bird discount: ${pred.early_bird_discount_pct}%. ${pred.optimal_booking_window}.`,
        city: pred.city,
        developer_name: pred.developer_name,
        investment_score: pred.early_entry_profit_score,
      });
    }
  }

  if (alerts.length) {
    const { error } = await supabase.from('launch_radar_alerts').insert(alerts);
    if (error) console.error('Insert alerts error:', error);
  }

  return {
    total_alerts: alerts.length,
    critical: alerts.filter(a => a.priority === 'critical').length,
    high: alerts.filter(a => a.priority === 'high').length,
    alerts,
  };
}

// ─── Full Radar Scan (Orchestrator) ───────────────────────────────────────
async function fullRadarScan(supabase: any, params: any) {
  const signals = await scanDeveloperSignals(supabase, params);
  const [pricing, demand, risk] = await Promise.all([
    predictPriceArbitrage(supabase, params),
    forecastDemand(supabase, params),
    scoreDeveloperRisk(supabase, params),
  ]);
  const alerts = await generateRadarAlerts(supabase, params);

  return {
    signals_summary: { total: signals.total_signals, high_probability: signals.high_probability_signals },
    pricing_summary: { total: pricing.total_predictions, avg_capital_gain: pricing.avg_capital_gain },
    demand_summary: { total: demand.total_forecasts, high_velocity: demand.high_velocity_markets },
    risk_summary: { total: risk.total_developers, low_risk: risk.low_risk_count, avg_safety: risk.avg_safety_index },
    alerts_summary: { total: alerts.total_alerts, critical: alerts.critical },
    scanned_at: new Date().toISOString(),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function getCityBasePrice(city: string): number {
  const prices: Record<string, number> = {
    Jakarta: 35000000, Bali: 28000000, Surabaya: 18000000,
    Bandung: 15000000, Makassar: 12000000, Medan: 13000000,
  };
  return prices[city] || 15000000;
}

function getCityDemandBase(city: string): number {
  const demand: Record<string, number> = {
    Jakarta: 65, Bali: 75, Surabaya: 50,
    Bandung: 45, Makassar: 35, Medan: 40,
  };
  return demand[city] || 40;
}
