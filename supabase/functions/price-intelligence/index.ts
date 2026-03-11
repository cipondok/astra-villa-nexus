import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── City Intelligence Profiles ──
const CITY_INTEL: Record<string, {
  base_ppsqm: number; growth_rate: number; volatility: number;
  cycle_phase: string; demand_heat: number; population_growth: number;
  infra_score: number; tourism_factor: number; bubble_risk: number;
  districts: { name: string; premium: number; transport: number; lifestyle: number; commercial: number; tourism: number }[];
}> = {
  'Jakarta': {
    base_ppsqm: 35_000_000, growth_rate: 7.5, volatility: 0.18, cycle_phase: 'expansion',
    demand_heat: 82, population_growth: 1.2, infra_score: 75, tourism_factor: 0.3, bubble_risk: 35,
    districts: [
      { name: 'SCBD', premium: 1.8, transport: 90, lifestyle: 95, commercial: 98, tourism: 40 },
      { name: 'Menteng', premium: 2.2, transport: 80, lifestyle: 90, commercial: 70, tourism: 45 },
      { name: 'Kemang', premium: 1.5, transport: 65, lifestyle: 85, commercial: 60, tourism: 55 },
      { name: 'PIK', premium: 1.3, transport: 55, lifestyle: 80, commercial: 50, tourism: 60 },
      { name: 'Kelapa Gading', premium: 1.1, transport: 70, lifestyle: 75, commercial: 65, tourism: 30 },
      { name: 'TB Simatupang', premium: 1.2, transport: 75, lifestyle: 60, commercial: 85, tourism: 20 },
    ],
  },
  'Bali': {
    base_ppsqm: 25_000_000, growth_rate: 12.0, volatility: 0.25, cycle_phase: 'expansion',
    demand_heat: 95, population_growth: 2.5, infra_score: 55, tourism_factor: 0.95, bubble_risk: 45,
    districts: [
      { name: 'Seminyak', premium: 2.0, transport: 50, lifestyle: 95, commercial: 70, tourism: 98 },
      { name: 'Canggu', premium: 1.8, transport: 45, lifestyle: 90, commercial: 55, tourism: 95 },
      { name: 'Ubud', premium: 1.3, transport: 35, lifestyle: 85, commercial: 40, tourism: 92 },
      { name: 'Uluwatu', premium: 1.6, transport: 40, lifestyle: 80, commercial: 30, tourism: 90 },
      { name: 'Sanur', premium: 1.1, transport: 55, lifestyle: 70, commercial: 50, tourism: 75 },
      { name: 'Tabanan', premium: 0.7, transport: 30, lifestyle: 50, commercial: 20, tourism: 45 },
    ],
  },
  'Surabaya': {
    base_ppsqm: 18_000_000, growth_rate: 5.5, volatility: 0.12, cycle_phase: 'recovery',
    demand_heat: 60, population_growth: 0.8, infra_score: 65, tourism_factor: 0.15, bubble_risk: 15,
    districts: [
      { name: 'Pakuwon', premium: 1.6, transport: 70, lifestyle: 80, commercial: 75, tourism: 20 },
      { name: 'Citraland', premium: 1.4, transport: 60, lifestyle: 75, commercial: 65, tourism: 15 },
      { name: 'Darmo', premium: 1.3, transport: 75, lifestyle: 70, commercial: 60, tourism: 25 },
      { name: 'Gubeng', premium: 1.1, transport: 80, lifestyle: 65, commercial: 55, tourism: 20 },
    ],
  },
  'Bandung': {
    base_ppsqm: 12_000_000, growth_rate: 6.0, volatility: 0.14, cycle_phase: 'recovery',
    demand_heat: 55, population_growth: 1.0, infra_score: 60, tourism_factor: 0.4, bubble_risk: 12,
    districts: [
      { name: 'Dago', premium: 1.7, transport: 60, lifestyle: 85, commercial: 50, tourism: 70 },
      { name: 'Setiabudhi', premium: 1.4, transport: 55, lifestyle: 75, commercial: 45, tourism: 55 },
      { name: 'Pasteur', premium: 1.2, transport: 70, lifestyle: 65, commercial: 60, tourism: 30 },
    ],
  },
  'Yogyakarta': {
    base_ppsqm: 8_000_000, growth_rate: 8.0, volatility: 0.15, cycle_phase: 'expansion',
    demand_heat: 70, population_growth: 1.5, infra_score: 50, tourism_factor: 0.6, bubble_risk: 18,
    districts: [
      { name: 'Prawirotaman', premium: 1.5, transport: 55, lifestyle: 80, commercial: 45, tourism: 85 },
      { name: 'Sleman', premium: 1.2, transport: 60, lifestyle: 70, commercial: 55, tourism: 40 },
      { name: 'Kotagede', premium: 1.0, transport: 50, lifestyle: 60, commercial: 40, tourism: 65 },
    ],
  },
  'Dubai': {
    base_ppsqm: 45_000_000, growth_rate: 10.0, volatility: 0.30, cycle_phase: 'peak',
    demand_heat: 88, population_growth: 3.0, infra_score: 95, tourism_factor: 0.85, bubble_risk: 55,
    districts: [
      { name: 'Downtown', premium: 2.5, transport: 95, lifestyle: 98, commercial: 95, tourism: 95 },
      { name: 'Marina', premium: 2.0, transport: 90, lifestyle: 92, commercial: 80, tourism: 90 },
      { name: 'JBR', premium: 1.8, transport: 85, lifestyle: 90, commercial: 70, tourism: 92 },
      { name: 'Business Bay', premium: 1.6, transport: 88, lifestyle: 75, commercial: 90, tourism: 60 },
    ],
  },
  'Singapore': {
    base_ppsqm: 80_000_000, growth_rate: 4.0, volatility: 0.08, cycle_phase: 'expansion',
    demand_heat: 75, population_growth: 0.5, infra_score: 98, tourism_factor: 0.5, bubble_risk: 30,
    districts: [
      { name: 'Orchard', premium: 2.8, transport: 98, lifestyle: 98, commercial: 90, tourism: 85 },
      { name: 'Marina Bay', premium: 3.0, transport: 95, lifestyle: 95, commercial: 98, tourism: 90 },
      { name: 'Sentosa', premium: 2.2, transport: 70, lifestyle: 90, commercial: 40, tourism: 95 },
    ],
  },
  'Bangkok': {
    base_ppsqm: 15_000_000, growth_rate: 6.5, volatility: 0.18, cycle_phase: 'expansion',
    demand_heat: 72, population_growth: 0.3, infra_score: 70, tourism_factor: 0.8, bubble_risk: 25,
    districts: [
      { name: 'Sukhumvit', premium: 1.8, transport: 90, lifestyle: 90, commercial: 85, tourism: 80 },
      { name: 'Silom', premium: 1.6, transport: 85, lifestyle: 80, commercial: 90, tourism: 70 },
      { name: 'Thonglor', premium: 2.0, transport: 80, lifestyle: 95, commercial: 70, tourism: 65 },
    ],
  },
};

// ══════════════════════════════════════════════════
// 1. MACRO PRICE TREND ENGINE
// ══════════════════════════════════════════════════
async function macroPriceTrends(supabase: any, body: any) {
  const targetCity = body.city || 'all';
  const cities = targetCity === 'all' ? Object.keys(CITY_INTEL) : [targetCity];
  const currentQuarter = `2026-Q1`;

  const trends = cities.map(city => {
    const c = CITY_INTEL[city];
    if (!c) return null;

    // Generate quarterly trend data (last 8 quarters)
    const quarters: any[] = [];
    let ppsqm = c.base_ppsqm * 0.75; // start 2 years ago
    for (let q = 0; q < 8; q++) {
      const yearOffset = Math.floor(q / 4);
      const quarterNum = (q % 4) + 1;
      const period = `${2024 + yearOffset}-Q${quarterNum}`;
      const seasonality = quarterNum === 4 ? 1.02 : quarterNum === 1 ? 0.98 : 1.0;
      const qGrowth = (c.growth_rate / 4 / 100) * seasonality;
      ppsqm *= (1 + qGrowth + (Math.random() - 0.5) * c.volatility * 0.1);
      const velocity = q > 0 ? ((ppsqm - quarters[q-1]?.avg_price_per_sqm) / quarters[q-1]?.avg_price_per_sqm * 100) : 0;

      quarters.push({
        city,
        period,
        avg_price_per_sqm: Math.round(ppsqm),
        median_price: Math.round(ppsqm * 65),
        price_change_pct: Math.round(velocity * 100) / 100,
        transaction_volume: Math.round(200 + c.demand_heat * 5 + Math.random() * 100),
        appreciation_velocity: Math.round(velocity * 100) / 100,
        bubble_risk_score: c.bubble_risk + Math.round((Math.random() - 0.3) * 10),
        growth_trajectory: velocity > 3 ? 'accelerating' : velocity > 0 ? 'stable' : velocity > -2 ? 'decelerating' : 'declining',
        infrastructure_impact_score: c.infra_score,
        population_growth_pct: c.population_growth,
        urban_expansion_index: Math.round(50 + c.demand_heat * 0.4),
      });
    }

    return {
      city,
      current_ppsqm: Math.round(ppsqm),
      ytd_growth: Math.round(c.growth_rate * 100) / 100,
      bubble_risk: c.bubble_risk,
      cycle_phase: c.cycle_phase,
      trajectory: quarters[quarters.length - 1]?.growth_trajectory,
      quarterly_data: quarters,
    };
  }).filter(Boolean);

  // Persist latest quarter
  for (const t of trends) {
    const latest = t!.quarterly_data[t!.quarterly_data.length - 1];
    await supabase.from('price_trend_index').upsert({
      ...latest,
      country_code: 'ID',
    }, { onConflict: 'id' });
  }

  return {
    trends,
    cities_analyzed: trends.length,
    period: currentQuarter,
    generated_at: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════
// 2. MICRO LOCATION VALUE PREDICTOR
// ══════════════════════════════════════════════════
async function microLocationPredictor(supabase: any, body: any) {
  const targetCity = body.city || 'Bali';
  const cityData = CITY_INTEL[targetCity];
  if (!cityData) throw new Error(`City not found: ${targetCity}`);

  const valuations = cityData.districts.map(d => {
    const currentPPSQM = Math.round(cityData.base_ppsqm * d.premium);

    // Composite growth drivers
    const transportBoost = d.transport / 100 * 2.0;
    const lifestyleBoost = d.lifestyle / 100 * 1.5;
    const commercialBoost = d.commercial / 100 * 1.8;
    const tourismBoost = d.tourism / 100 * cityData.tourism_factor * 3.0;

    const compositeGrowth = cityData.growth_rate + transportBoost + lifestyleBoost + commercialBoost + tourismBoost;
    const adjustedGrowth1y = compositeGrowth * 0.6;
    const adjustedGrowth3y = compositeGrowth * 0.85;
    const adjustedGrowth5y = compositeGrowth * 1.0;

    const predicted1y = Math.round(currentPPSQM * (1 + adjustedGrowth1y / 100));
    const predicted3y = Math.round(currentPPSQM * Math.pow(1 + adjustedGrowth3y / 100, 3));
    const predicted5y = Math.round(currentPPSQM * Math.pow(1 + adjustedGrowth5y / 100, 5));

    const liquidityScore = Math.round(d.transport * 0.3 + d.commercial * 0.3 + cityData.demand_heat * 0.4);
    const desirability = Math.round(
      d.lifestyle * 0.25 + d.transport * 0.2 + d.commercial * 0.2 +
      d.tourism * cityData.tourism_factor * 0.15 + (compositeGrowth / 20) * 20
    );

    return {
      city: targetCity,
      district: d.name,
      current_price_per_sqm: currentPPSQM,
      predicted_price_per_sqm_1y: predicted1y,
      predicted_price_per_sqm_3y: predicted3y,
      predicted_price_per_sqm_5y: predicted5y,
      appreciation_pct_1y: Math.round(adjustedGrowth1y * 100) / 100,
      appreciation_pct_3y: Math.round((Math.pow(1 + adjustedGrowth3y / 100, 3) - 1) * 10000) / 100,
      appreciation_pct_5y: Math.round((Math.pow(1 + adjustedGrowth5y / 100, 5) - 1) * 10000) / 100,
      demand_heat_score: cityData.demand_heat + Math.round(d.premium * 5 - 5),
      transport_proximity_score: d.transport,
      lifestyle_infra_score: d.lifestyle,
      commercial_emergence_score: d.commercial,
      tourism_value_spike: Math.round(d.tourism * cityData.tourism_factor),
      liquidity_forecast: liquidityScore,
      investment_desirability: Math.min(100, desirability),
    };
  });

  // Persist
  await supabase.from('micro_location_valuations').insert(valuations);

  return {
    city: targetCity,
    valuations: valuations.sort((a, b) => b.investment_desirability - a.investment_desirability),
    top_district: valuations.sort((a, b) => b.investment_desirability - a.investment_desirability)[0],
    generated_at: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════
// 3. EARLY GROWTH ZONE DETECTION
// ══════════════════════════════════════════════════
async function growthZoneDetection(supabase: any, body: any) {
  const targetCity = body.city || 'all';
  const cities = targetCity === 'all' ? Object.keys(CITY_INTEL) : [targetCity];
  const zones: any[] = [];

  for (const city of cities) {
    const c = CITY_INTEL[city];
    if (!c) continue;

    for (const d of c.districts) {
      // Identify undervalued emerging zones
      const cityAvgPremium = c.districts.reduce((s, dd) => s + dd.premium, 0) / c.districts.length;
      const undervaluation = ((cityAvgPremium - d.premium) / cityAvgPremium) * 100;

      if (undervaluation < -5) continue; // already premium, skip

      let zoneType = 'emerging_undervalued';
      if (undervaluation > 20 && d.commercial > 40) zoneType = 'gentrification';
      else if (d.premium > 1.5) zoneType = 'future_premium';
      else if (undervaluation > 30) zoneType = 'land_banking';

      const growthDrivers = (d.transport + d.lifestyle + d.commercial + d.tourism * c.tourism_factor) / 4;
      const growthConfidence = Math.min(95, Math.round(30 + undervaluation * 0.5 + growthDrivers * 0.4));

      const currentPrice = Math.round(c.base_ppsqm * d.premium);
      const projectedGrowth = c.growth_rate * (1 + undervaluation / 100 * 0.5);
      const projected3y = Math.round(currentPrice * Math.pow(1 + projectedGrowth / 100, 3));

      let entryTiming = 'neutral';
      if (c.cycle_phase === 'recovery' && undervaluation > 15) entryTiming = 'strong_buy';
      else if (undervaluation > 10) entryTiming = 'buy';
      else if (c.cycle_phase === 'peak') entryTiming = 'wait';

      const gentrificationSignals = [];
      if (d.lifestyle > 60) gentrificationSignals.push('Lifestyle amenities growing');
      if (d.commercial > 50) gentrificationSignals.push('Commercial activity increasing');
      if (d.transport > 60) gentrificationSignals.push('Transport connectivity improving');
      if (d.tourism > 50 && c.tourism_factor > 0.5) gentrificationSignals.push('Tourism demand rising');

      zones.push({
        city,
        district: d.name,
        zone_type: zoneType,
        growth_confidence: growthConfidence,
        current_avg_price: currentPrice,
        projected_price_3y: projected3y,
        projected_appreciation_pct: Math.round((projected3y / currentPrice - 1) * 10000) / 100,
        entry_timing: entryTiming,
        capital_appreciation_horizon: undervaluation > 20 ? '2-3 years' : '3-5 years',
        gentrification_signals: gentrificationSignals,
        developer_activity_score: Math.round(40 + d.commercial * 0.4 + Math.random() * 20),
        infrastructure_pipeline: d.transport > 70 ? ['MRT extension', 'Highway interchange'] : d.transport > 50 ? ['Bus rapid transit'] : [],
        undervaluation_pct: Math.round(undervaluation * 100) / 100,
      });
    }
  }

  // Sort by confidence and persist top zones
  zones.sort((a, b) => b.growth_confidence - a.growth_confidence);
  if (zones.length > 0) {
    await supabase.from('growth_zone_signals').insert(zones.slice(0, 20));
  }

  return {
    growth_zones: zones,
    total_zones_detected: zones.length,
    top_zone: zones[0] || null,
    cities_scanned: cities.length,
    generated_at: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════
// 4. MARKET CYCLE CLASSIFICATION
// ══════════════════════════════════════════════════
async function marketCycleClassifier(supabase: any, body: any) {
  const targetCity = body.city || 'all';
  const cities = targetCity === 'all' ? Object.keys(CITY_INTEL) : [targetCity];

  const classifications = cities.map(city => {
    const c = CITY_INTEL[city];
    if (!c) return null;

    const phase = c.cycle_phase;
    const phaseConfidence = 65 + Math.round(Math.random() * 25);

    // Transition probabilities based on current phase
    const transitions: Record<string, Record<string, number>> = {
      recovery: { to_expansion: 0.55, to_peak: 0.05, to_correction: 0.05, stay: 0.35 },
      expansion: { to_peak: 0.30, to_correction: 0.05, to_recovery: 0.02, stay: 0.63 },
      peak: { to_correction: 0.45, to_expansion: 0.10, to_recovery: 0.05, stay: 0.40 },
      correction: { to_recovery: 0.50, to_expansion: 0.05, to_peak: 0.02, stay: 0.43 },
    };

    const strategies: Record<string, string> = {
      recovery: 'Accumulate — buy undervalued assets before cycle upswing',
      expansion: 'Hold & selectively buy — ride momentum but avoid overpaying',
      peak: 'Take profits — sell non-core assets, avoid new acquisitions',
      correction: 'Prepare — build cash reserves, identify distressed opportunities',
    };

    const riskAdjustedROI: Record<string, number> = {
      recovery: c.growth_rate * 1.3,
      expansion: c.growth_rate * 1.0,
      peak: c.growth_rate * 0.5,
      correction: c.growth_rate * 0.3,
    };

    const cyclePosition: Record<string, number> = {
      recovery: 15 + Math.round(Math.random() * 20),
      expansion: 35 + Math.round(Math.random() * 25),
      peak: 70 + Math.round(Math.random() * 20),
      correction: 85 + Math.round(Math.random() * 10),
    };

    const priceMomentum = phase === 'expansion' ? c.growth_rate :
      phase === 'peak' ? c.growth_rate * 0.3 :
      phase === 'correction' ? -c.growth_rate * 0.5 : c.growth_rate * 0.5;

    return {
      city,
      country_code: 'ID',
      current_phase: phase,
      phase_confidence: phaseConfidence,
      phase_duration_months: Math.round(8 + Math.random() * 16),
      transition_probability: transitions[phase] || transitions.expansion,
      recommended_strategy: strategies[phase] || strategies.expansion,
      risk_adjusted_roi: Math.round((riskAdjustedROI[phase] || c.growth_rate) * 100) / 100,
      cycle_position_pct: cyclePosition[phase] || 50,
      leading_indicators: {
        interest_rate_trend: phase === 'peak' ? 'rising' : 'stable',
        credit_growth: phase === 'expansion' ? 'accelerating' : 'moderate',
        inventory_months: phase === 'correction' ? 12 : phase === 'peak' ? 8 : 5,
        foreign_investment_flow: c.demand_heat > 70 ? 'positive' : 'neutral',
      },
      price_momentum: Math.round(priceMomentum * 100) / 100,
      volume_momentum: Math.round((c.demand_heat / 100 - 0.5) * 20 * 100) / 100,
      sentiment_score: Math.round(30 + c.demand_heat * 0.6),
    };
  }).filter(Boolean);

  // Persist
  for (const cls of classifications) {
    await supabase.from('market_cycle_classifications').insert(cls);
  }

  return {
    classifications,
    cities_analyzed: classifications.length,
    global_sentiment: Math.round(classifications.reduce((s, c: any) => s + c.sentiment_score, 0) / classifications.length),
    generated_at: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════
// 5. PRICE SHOCK MONITOR
// ══════════════════════════════════════════════════
async function priceShockMonitor(supabase: any) {
  // Simulate real-time monitoring of macro shock events
  const shockScenarios = [
    {
      alert_type: 'interest_rate',
      severity: 'medium',
      affected_cities: ['Jakarta', 'Surabaya', 'Bandung'],
      affected_countries: ['ID'],
      shock_description: 'Bank Indonesia signals potential 25bps rate hold — mortgage demand stabilizing',
      price_impact_pct: -1.5,
      direction: 'neutral',
      confidence: 72,
      recommendations: [
        { action: 'hold', detail: 'Maintain current positions — no immediate price pressure' },
        { action: 'monitor', detail: 'Watch Q2 inflation data for next rate decision signal' },
      ],
    },
    {
      alert_type: 'foreign_investment',
      severity: 'low',
      affected_cities: ['Bali', 'Jakarta'],
      affected_countries: ['ID'],
      shock_description: 'Foreign investor inflows up 18% YoY in Bali luxury segment — price support strengthening',
      price_impact_pct: 3.5,
      direction: 'surge',
      confidence: 68,
      recommendations: [
        { action: 'buy', detail: 'Bali luxury villas likely to see continued upward pressure' },
        { action: 'monitor', detail: 'Track regulatory changes on foreign ownership rules' },
      ],
    },
    {
      alert_type: 'currency',
      severity: 'medium',
      affected_cities: ['Jakarta', 'Surabaya', 'Bandung', 'Bali'],
      affected_countries: ['ID'],
      shock_description: 'IDR weakening 3% against USD — foreign buyer purchasing power increasing',
      price_impact_pct: 2.0,
      direction: 'surge',
      confidence: 78,
      recommendations: [
        { action: 'buy', detail: 'Foreign-currency-denominated properties offer FX arbitrage' },
        { action: 'hedge', detail: 'Consider FX-hedged positions for IDR-denominated assets' },
      ],
    },
    {
      alert_type: 'policy_change',
      severity: 'high',
      affected_cities: ['Dubai'],
      affected_countries: ['AE'],
      shock_description: 'Dubai announces new golden visa property threshold reduction — demand surge expected',
      price_impact_pct: 8.0,
      direction: 'surge',
      confidence: 85,
      recommendations: [
        { action: 'buy', detail: 'Entry-level luxury properties near new threshold will see immediate demand' },
        { action: 'hold', detail: 'Existing Dubai portfolio should benefit from policy tailwind' },
      ],
    },
    {
      alert_type: 'natural_disaster',
      severity: 'low',
      affected_cities: ['Bali'],
      affected_countries: ['ID'],
      shock_description: 'Minor seismic activity in eastern Bali — no structural damage, tourism temporarily impacted',
      price_impact_pct: -0.5,
      direction: 'neutral',
      confidence: 55,
      recommendations: [
        { action: 'hold', detail: 'Short-term noise — fundamentals unchanged' },
        { action: 'monitor', detail: 'Insurance coverage review recommended for eastern Bali properties' },
      ],
    },
  ];

  // Persist active alerts
  const activeAlerts = shockScenarios.map(s => ({
    ...s,
    is_active: true,
    source: 'ASTRA Price Intelligence AI',
  }));

  await supabase.from('price_shock_alerts').insert(activeAlerts);

  // Also fetch existing alerts
  const { data: existingAlerts } = await supabase
    .from('price_shock_alerts')
    .select('*')
    .eq('is_active', true)
    .order('triggered_at', { ascending: false })
    .limit(20);

  return {
    active_alerts: existingAlerts || activeAlerts,
    critical_count: (existingAlerts || activeAlerts).filter((a: any) => a.severity === 'critical').length,
    high_count: (existingAlerts || activeAlerts).filter((a: any) => a.severity === 'high').length,
    net_market_direction: 'slightly_positive',
    generated_at: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════
// FULL INTELLIGENCE SWEEP
// ══════════════════════════════════════════════════
async function fullIntelligenceSweep(supabase: any, body: any) {
  const [macro, micro, zones, cycles, shocks] = await Promise.all([
    macroPriceTrends(supabase, body),
    microLocationPredictor(supabase, { city: body.city || 'Bali' }),
    growthZoneDetection(supabase, body),
    marketCycleClassifier(supabase, body),
    priceShockMonitor(supabase),
  ]);

  return {
    macro_trends: macro,
    micro_valuations: micro,
    growth_zones: zones,
    market_cycles: cycles,
    price_shocks: shocks,
    intelligence_summary: {
      cities_analyzed: macro.cities_analyzed,
      zones_detected: zones.total_zones_detected,
      active_alerts: shocks.active_alerts.length,
      global_sentiment: cycles.global_sentiment,
      top_growth_zone: zones.top_zone?.district || 'N/A',
      market_direction: shocks.net_market_direction,
    },
    generated_at: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const body = await req.json();
    const pipeline = body.pipeline;

    let result: any;

    switch (pipeline) {
      case 'macro_trends':
        result = await macroPriceTrends(supabase, body);
        break;
      case 'micro_valuations':
        result = await microLocationPredictor(supabase, body);
        break;
      case 'growth_zones':
        result = await growthZoneDetection(supabase, body);
        break;
      case 'market_cycles':
        result = await marketCycleClassifier(supabase, body);
        break;
      case 'price_shocks':
        result = await priceShockMonitor(supabase);
        break;
      case 'full_sweep':
        result = await fullIntelligenceSweep(supabase, body);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown pipeline: ${pipeline}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('price-intelligence error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
