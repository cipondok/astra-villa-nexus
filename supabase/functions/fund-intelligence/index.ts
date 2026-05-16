import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── Market cycle phases ──
const CYCLE_PHASES = ['recovery', 'expansion', 'hyper_supply', 'recession'] as const;

// ── City-level macro profiles ──
const CITY_PROFILES: Record<string, {
  base_yield: number; growth_rate: number; volatility: number;
  cycle_phase: string; fx_strength: number; demand_heat: number;
  risk_tier: string; entry_barrier: number;
}> = {
  'Jakarta': { base_yield: 5.2, growth_rate: 7.5, volatility: 0.18, cycle_phase: 'expansion', fx_strength: 0.65, demand_heat: 82, risk_tier: 'medium', entry_barrier: 0.7 },
  'Bali': { base_yield: 7.8, growth_rate: 12.0, volatility: 0.25, cycle_phase: 'expansion', fx_strength: 0.65, demand_heat: 95, risk_tier: 'medium', entry_barrier: 0.5 },
  'Surabaya': { base_yield: 6.0, growth_rate: 5.5, volatility: 0.12, cycle_phase: 'recovery', fx_strength: 0.65, demand_heat: 60, risk_tier: 'low', entry_barrier: 0.4 },
  'Bandung': { base_yield: 5.5, growth_rate: 6.0, volatility: 0.14, cycle_phase: 'recovery', fx_strength: 0.65, demand_heat: 55, risk_tier: 'low', entry_barrier: 0.35 },
  'Yogyakarta': { base_yield: 6.5, growth_rate: 8.0, volatility: 0.15, cycle_phase: 'expansion', fx_strength: 0.65, demand_heat: 70, risk_tier: 'low', entry_barrier: 0.3 },
  'Makassar': { base_yield: 7.0, growth_rate: 9.0, volatility: 0.20, cycle_phase: 'recovery', fx_strength: 0.65, demand_heat: 50, risk_tier: 'medium', entry_barrier: 0.3 },
  'Medan': { base_yield: 5.8, growth_rate: 4.5, volatility: 0.16, cycle_phase: 'recession', fx_strength: 0.65, demand_heat: 40, risk_tier: 'high', entry_barrier: 0.3 },
  'Semarang': { base_yield: 6.2, growth_rate: 5.0, volatility: 0.11, cycle_phase: 'recovery', fx_strength: 0.65, demand_heat: 48, risk_tier: 'low', entry_barrier: 0.3 },
  'Dubai': { base_yield: 6.5, growth_rate: 10.0, volatility: 0.30, cycle_phase: 'hyper_supply', fx_strength: 0.95, demand_heat: 88, risk_tier: 'medium', entry_barrier: 0.8 },
  'Singapore': { base_yield: 3.2, growth_rate: 4.0, volatility: 0.08, cycle_phase: 'expansion', fx_strength: 0.90, demand_heat: 75, risk_tier: 'low', entry_barrier: 0.95 },
  'Bangkok': { base_yield: 5.0, growth_rate: 6.5, volatility: 0.18, cycle_phase: 'expansion', fx_strength: 0.55, demand_heat: 72, risk_tier: 'medium', entry_barrier: 0.4 },
  'Kuala Lumpur': { base_yield: 4.8, growth_rate: 5.0, volatility: 0.14, cycle_phase: 'recovery', fx_strength: 0.60, demand_heat: 58, risk_tier: 'low', entry_barrier: 0.45 },
};

// ══════════════════════════════════════════════════
// 1. GLOBAL CAPITAL ALLOCATION BRAIN
// ══════════════════════════════════════════════════
async function capitalAllocationBrain(supabase: any, userId: string, body: any) {
  const budget = body.budget || 1_000_000;
  const riskPreference = body.risk_preference || 'balanced'; // conservative, balanced, aggressive

  const riskWeights: Record<string, { yield_w: number; growth_w: number; stability_w: number }> = {
    conservative: { yield_w: 0.5, growth_w: 0.2, stability_w: 0.3 },
    balanced: { yield_w: 0.35, growth_w: 0.35, stability_w: 0.3 },
    aggressive: { yield_w: 0.2, growth_w: 0.55, stability_w: 0.25 },
  };

  const weights = riskWeights[riskPreference] || riskWeights.balanced;
  const cities = Object.entries(CITY_PROFILES);

  // Score each city
  const scored = cities.map(([city, p]) => {
    const stabilityScore = (1 - p.volatility) * 100;
    const composite = (p.base_yield * weights.yield_w) + (p.growth_rate * weights.growth_w) + (stabilityScore * weights.stability_w * 0.1);
    const cycleBonus = p.cycle_phase === 'recovery' ? 1.15 : p.cycle_phase === 'expansion' ? 1.05 : p.cycle_phase === 'hyper_supply' ? 0.85 : 0.7;
    return { city, profile: p, score: composite * cycleBonus * (0.5 + p.fx_strength * 0.5) };
  }).sort((a, b) => b.score - a.score);

  // Top 6 cities get allocation proportional to score
  const topCities = scored.slice(0, 6);
  const totalScore = topCities.reduce((s, c) => s + c.score, 0);

  const allocationMatrix = topCities.map(c => ({
    city: c.city,
    allocation_pct: Math.round((c.score / totalScore) * 1000) / 10,
    allocation_amount: Math.round((c.score / totalScore) * budget),
    risk_tier: c.profile.risk_tier,
    cycle_phase: c.profile.cycle_phase,
    expected_yield: c.profile.base_yield,
    expected_growth: c.profile.growth_rate,
    demand_heat: c.profile.demand_heat,
  }));

  const portfolioVolatility = topCities.reduce((s, c) => s + c.profile.volatility * (c.score / totalScore), 0);
  const expectedReturn = topCities.reduce((s, c) => s + (c.profile.base_yield + c.profile.growth_rate) * (c.score / totalScore), 0);

  // 10-year compound projection
  let wealthGrowth10y = budget;
  for (let y = 0; y < 10; y++) {
    wealthGrowth10y *= (1 + expectedReturn / 100);
  }

  const result = {
    allocation_matrix: allocationMatrix,
    portfolio_volatility: Math.round(portfolioVolatility * 1000) / 10,
    expected_annual_return: Math.round(expectedReturn * 100) / 100,
    wealth_growth_10y: Math.round(wealthGrowth10y),
    cycle_phase: topCities[0]?.profile.cycle_phase || 'expansion',
    confidence_score: Math.min(95, Math.round(60 + (totalScore / cities.length) * 5)),
    macro_signals: {
      interest_rate_trend: 'stable',
      inflation_outlook: 'moderate',
      currency_forecast: 'neutral',
      global_sentiment: riskPreference === 'aggressive' ? 'risk-on' : 'cautious',
    },
    risk_preference: riskPreference,
    budget,
  };

  // Persist
  await supabase.from('fund_capital_allocations').insert({
    user_id: userId,
    allocation_type: 'recommended',
    target_regions: allocationMatrix.map((a: any) => a.city),
    target_property_types: ['apartment', 'villa', 'house'],
    target_risk_tiers: [...new Set(allocationMatrix.map((a: any) => a.risk_tier))],
    allocation_matrix: result.allocation_matrix,
    portfolio_volatility: result.portfolio_volatility,
    expected_annual_return: result.expected_annual_return,
    wealth_growth_10y: result.wealth_growth_10y,
    macro_signals: result.macro_signals,
    cycle_phase: result.cycle_phase,
    confidence_score: result.confidence_score,
  });

  return result;
}

// ══════════════════════════════════════════════════
// 2. PORTFOLIO REBALANCING INTELLIGENCE
// ══════════════════════════════════════════════════
async function portfolioRebalancing(supabase: any, userId: string) {
  // Fetch user's saved/wishlisted properties as portfolio proxy
  const { data: favorites } = await supabase
    .from('wishlists')
    .select('property_id, properties(id, title, city, price, investment_score, demand_heat_score)')
    .eq('user_id', userId)
    .limit(50);

  const properties = (favorites || [])
    .filter((f: any) => f.properties)
    .map((f: any) => f.properties);

  if (properties.length === 0) {
    return { signals: [], message: 'No portfolio properties found. Add properties to your watchlist first.' };
  }

  const totalValue = properties.reduce((s: number, p: any) => s + (p.price || 0), 0);
  const signals: any[] = [];

  // City concentration check
  const cityGroups: Record<string, any[]> = {};
  properties.forEach((p: any) => {
    const city = p.city || 'Unknown';
    if (!cityGroups[city]) cityGroups[city] = [];
    cityGroups[city].push(p);
  });

  for (const [city, props] of Object.entries(cityGroups)) {
    const cityValue = props.reduce((s: number, p: any) => s + (p.price || 0), 0);
    const pct = totalValue > 0 ? (cityValue / totalValue) * 100 : 0;
    if (pct > 40) {
      signals.push({
        signal_type: 'concentration_risk',
        severity: pct > 60 ? 'critical' : 'high',
        affected_city: city,
        current_allocation_pct: Math.round(pct * 10) / 10,
        recommended_allocation_pct: 30,
        action: 'reduce',
        reasoning: `${city} represents ${Math.round(pct)}% of portfolio — diversification recommended below 40%`,
        expected_impact_pct: Math.round((pct - 30) * 0.3 * 10) / 10,
      });
    }
  }

  // Underperformer detection
  const avgScore = properties.reduce((s: number, p: any) => s + (p.investment_score || 50), 0) / properties.length;
  properties.forEach((p: any) => {
    if ((p.investment_score || 50) < avgScore * 0.7) {
      signals.push({
        signal_type: 'underperformer',
        severity: 'medium',
        affected_property_id: p.id,
        affected_city: p.city,
        action: 'exit',
        reasoning: `"${p.title}" scores ${p.investment_score}/100 vs portfolio avg ${Math.round(avgScore)}. Consider exit.`,
        expected_impact_pct: Math.round((avgScore - (p.investment_score || 50)) * 0.15 * 10) / 10,
      });
    }
  });

  // New opportunity signals from high-heat cities not in portfolio
  const portfolioCities = new Set(Object.keys(cityGroups));
  for (const [city, profile] of Object.entries(CITY_PROFILES)) {
    if (!portfolioCities.has(city) && profile.demand_heat > 70 && profile.cycle_phase !== 'recession') {
      signals.push({
        signal_type: 'new_opportunity',
        severity: 'low',
        affected_city: city,
        action: 'enter',
        reasoning: `${city} shows ${profile.demand_heat}/100 demand heat in ${profile.cycle_phase} phase with ${profile.base_yield}% yield`,
        expected_impact_pct: Math.round(profile.growth_rate * 0.4 * 10) / 10,
      });
    }
  }

  // Persist signals
  if (signals.length > 0) {
    await supabase.from('fund_rebalancing_signals').insert(
      signals.map(s => ({ ...s, user_id: userId }))
    );
  }

  return {
    total_portfolio_value: totalValue,
    property_count: properties.length,
    city_distribution: Object.fromEntries(Object.entries(cityGroups).map(([c, p]) => [c, p.length])),
    signals,
    rebalancing_urgency: signals.some(s => s.severity === 'critical') ? 'critical' : signals.some(s => s.severity === 'high') ? 'high' : 'normal',
    generated_at: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════
// 3. ENTRY TIMING ENGINE
// ══════════════════════════════════════════════════
async function entryTimingEngine(supabase: any, body: any) {
  const targetCity = body.city || 'all';

  // Fetch recent price trends
  const { data: trends } = await supabase
    .from('location_price_trends')
    .select('*')
    .order('period_end', { ascending: false })
    .limit(100);

  const entrySignals: any[] = [];
  const citiesToAnalyze = targetCity === 'all' ? Object.keys(CITY_PROFILES) : [targetCity];

  for (const city of citiesToAnalyze) {
    const profile = CITY_PROFILES[city];
    if (!profile) continue;

    const cityTrends = (trends || []).filter((t: any) =>
      t.city?.toLowerCase() === city.toLowerCase() || t.location?.toLowerCase()?.includes(city.toLowerCase())
    );

    // Price momentum calculation
    const priceMomentum = cityTrends.length > 1
      ? ((cityTrends[0]?.avg_price || 0) - (cityTrends[cityTrends.length - 1]?.avg_price || 0)) / (cityTrends[cityTrends.length - 1]?.avg_price || 1) * 100
      : profile.growth_rate;

    // Determine signal type
    let signalType = 'acquisition_window';
    let timingConfidence = 50;

    if (profile.cycle_phase === 'recovery' && priceMomentum > 0) {
      signalType = 'correction_entry';
      timingConfidence = 80;
    } else if (profile.cycle_phase === 'expansion' && profile.demand_heat > 80) {
      signalType = 'pre_launch_arb';
      timingConfidence = 65;
    } else if (profile.cycle_phase === 'recession') {
      signalType = 'distress_sale';
      timingConfidence = 75;
    }

    const upsideMultiplier = 1 + (profile.growth_rate / 100) * (profile.cycle_phase === 'recovery' ? 2 : 1);
    const liquidityRisk = profile.cycle_phase === 'recession' ? 0.6 : profile.cycle_phase === 'hyper_supply' ? 0.4 : 0.15;

    const volumeTrend = profile.demand_heat > 70 ? 'increasing' :
      profile.demand_heat > 40 ? 'stable' : 'decreasing';

    const macroAlignment = (profile.fx_strength * 30) + ((1 - profile.volatility) * 40) + (profile.demand_heat / 100 * 30);

    entrySignals.push({
      city,
      property_type: 'mixed',
      signal_type: signalType,
      timing_confidence: timingConfidence,
      upside_multiplier: Math.round(upsideMultiplier * 100) / 100,
      liquidity_risk: Math.round(liquidityRisk * 100) / 100,
      price_momentum: Math.round(priceMomentum * 100) / 100,
      volume_trend: volumeTrend,
      macro_alignment_score: Math.round(macroAlignment),
      window_opens_at: new Date().toISOString(),
      window_closes_at: new Date(Date.now() + 90 * 86400000).toISOString(),
      metadata: { cycle_phase: profile.cycle_phase, demand_heat: profile.demand_heat, base_yield: profile.base_yield },
    });
  }

  // Sort by confidence
  entrySignals.sort((a, b) => b.timing_confidence - a.timing_confidence);

  // Persist top signals
  if (entrySignals.length > 0) {
    await supabase.from('fund_entry_signals').insert(entrySignals.slice(0, 10));
  }

  return {
    entry_signals: entrySignals,
    top_opportunity: entrySignals[0] || null,
    markets_scanned: citiesToAnalyze.length,
    generated_at: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════
// 4. EXIT STRATEGY OPTIMIZATION
// ══════════════════════════════════════════════════
async function exitStrategyOptimizer(supabase: any, userId: string, body: any) {
  const propertyId = body.property_id;

  // Fetch property data
  let property: any = null;
  if (propertyId) {
    const { data } = await supabase.from('properties').select('*').eq('id', propertyId).maybeSingle();
    property = data;
  }

  const price = property?.price || body.purchase_price || 1_000_000_000;
  const city = property?.city || body.city || 'Jakarta';
  const profile = CITY_PROFILES[city] || CITY_PROFILES['Jakarta'];
  const holdingYears = body.holding_years || 3;

  // Generate exit scenarios
  const scenarios = [
    {
      name: 'Sell Now',
      strategy_type: 'sell_now',
      holding_period: 0,
      exit_price: price,
      profit: 0,
      profit_pct: 0,
      tax_impact: price * 0.025,
      net_profit: -(price * 0.025),
      reasoning: 'Immediate exit with transaction costs only.',
    },
    {
      name: 'Short-term Flip (1yr)',
      strategy_type: 'flip',
      holding_period: 1,
      exit_price: Math.round(price * (1 + profile.growth_rate / 100)),
      profit: Math.round(price * profile.growth_rate / 100),
      profit_pct: profile.growth_rate,
      tax_impact: Math.round(price * profile.growth_rate / 100 * 0.025),
      net_profit: Math.round(price * profile.growth_rate / 100 * 0.975),
      reasoning: `1-year appreciation at ${profile.growth_rate}% growth rate.`,
    },
    {
      name: `Medium Hold (${holdingYears}yr)`,
      strategy_type: 'hold_long',
      holding_period: holdingYears,
      exit_price: Math.round(price * Math.pow(1 + profile.growth_rate / 100, holdingYears)),
      profit: Math.round(price * (Math.pow(1 + profile.growth_rate / 100, holdingYears) - 1)),
      profit_pct: Math.round((Math.pow(1 + profile.growth_rate / 100, holdingYears) - 1) * 10000) / 100,
      tax_impact: Math.round(price * (Math.pow(1 + profile.growth_rate / 100, holdingYears) - 1) * 0.025),
      net_profit: Math.round(price * (Math.pow(1 + profile.growth_rate / 100, holdingYears) - 1) * 0.975),
      reasoning: `${holdingYears}-year hold with compounded appreciation + rental income.`,
    },
    {
      name: 'Refinance & Hold',
      strategy_type: 'refinance',
      holding_period: 5,
      exit_price: Math.round(price * Math.pow(1 + profile.growth_rate / 100, 5)),
      profit: Math.round(price * (Math.pow(1 + profile.growth_rate / 100, 5) - 1)),
      profit_pct: Math.round((Math.pow(1 + profile.growth_rate / 100, 5) - 1) * 10000) / 100,
      tax_impact: 0,
      net_profit: Math.round(price * 0.6 * 0.7), // LTV refinance cash-out
      reasoning: 'Extract equity via refinance while maintaining appreciation upside.',
    },
  ];

  // Calculate peak probability
  const peakProbability = profile.cycle_phase === 'hyper_supply' ? 75 : profile.cycle_phase === 'expansion' ? 45 : 20;

  // Best strategy determination
  const bestScenario = scenarios.reduce((best, s) => s.net_profit > best.net_profit ? s : best, scenarios[0]);

  const result = {
    property_id: propertyId,
    city,
    purchase_price: price,
    scenarios,
    recommended_strategy: bestScenario.strategy_type,
    peak_probability: peakProbability,
    tax_efficiency_score: Math.round((1 - 0.025) * 100),
    optimal_exit_window: profile.cycle_phase === 'expansion' ? '6-18 months' : profile.cycle_phase === 'recovery' ? '24-36 months' : 'Consider immediate',
    reasoning: bestScenario.reasoning,
  };

  // Persist strategies
  for (const s of scenarios) {
    await supabase.from('fund_exit_strategies').insert({
      user_id: userId,
      property_id: propertyId,
      strategy_type: s.strategy_type,
      optimal_exit_window: result.optimal_exit_window,
      expected_profit: s.net_profit,
      tax_efficiency_score: result.tax_efficiency_score,
      peak_probability: peakProbability,
      scenarios: scenarios,
      recommended: s.strategy_type === bestScenario.strategy_type,
      reasoning: s.reasoning,
    });
  }

  return result;
}

// ══════════════════════════════════════════════════
// 5. WEALTH SIMULATION ENGINE
// ══════════════════════════════════════════════════
async function wealthSimulator(supabase: any, userId: string, body: any) {
  const persona = body.persona || 'balanced';
  const initialCapital = body.initial_capital || 500_000_000;
  const monthlyContribution = body.monthly_contribution || 5_000_000;
  const years = Math.min(body.projection_years || 10, 30);

  const personaProfiles: Record<string, { return_rate: number; volatility: number; yield_pct: number }> = {
    conservative: { return_rate: 0.06, volatility: 0.08, yield_pct: 0.055 },
    balanced: { return_rate: 0.10, volatility: 0.15, yield_pct: 0.065 },
    aggressive: { return_rate: 0.16, volatility: 0.25, yield_pct: 0.04 },
  };

  const profile = personaProfiles[persona] || personaProfiles.balanced;

  // Monte Carlo - 200 simulations
  const simCount = 200;
  const monthlyReturn = profile.return_rate / 12;
  const monthlyVol = profile.volatility / Math.sqrt(12);
  const totalMonths = years * 12;

  const allTrajectories: number[][] = [];
  const finalValues: number[] = [];

  for (let sim = 0; sim < simCount; sim++) {
    let value = initialCapital;
    const trajectory: number[] = [value];
    for (let m = 1; m <= totalMonths; m++) {
      // Box-Muller for normal random
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const monthReturn = monthlyReturn + monthlyVol * z;
      value = value * (1 + monthReturn) + monthlyContribution;
      if (m % 12 === 0) trajectory.push(Math.round(value));
    }
    allTrajectories.push(trajectory);
    finalValues.push(value);
  }

  // Percentile trajectories
  finalValues.sort((a, b) => a - b);
  const p10 = finalValues[Math.floor(simCount * 0.1)];
  const p50 = finalValues[Math.floor(simCount * 0.5)];
  const p90 = finalValues[Math.floor(simCount * 0.9)];

  // Build yearly net worth trajectory (median path)
  const medianTrajectory = allTrajectories[Math.floor(simCount * 0.5)];
  const netWorthTrajectory = medianTrajectory.map((v, i) => ({
    year: i,
    net_worth: Math.round(v),
    annual_cashflow: Math.round(v * profile.yield_pct),
    cumulative_invested: Math.round(initialCapital + monthlyContribution * 12 * i),
  }));

  // Cashflow curve
  const cashflowCurve = netWorthTrajectory.map(y => ({
    year: y.year,
    rental_income: y.annual_cashflow,
    expenses: Math.round(y.annual_cashflow * 0.25),
    net_cashflow: Math.round(y.annual_cashflow * 0.75),
  }));

  // Risk heatmap
  const maxDrawdown = Math.min(...finalValues.map(v => (v - initialCapital) / initialCapital)) * 100;
  const sharpeRatio = (profile.return_rate - 0.04) / profile.volatility;

  const result = {
    persona,
    initial_capital: initialCapital,
    monthly_contribution: monthlyContribution,
    projection_years: years,
    net_worth_trajectory: netWorthTrajectory,
    cashflow_curve: cashflowCurve,
    risk_heatmap: {
      volatility: Math.round(profile.volatility * 100),
      max_drawdown: Math.round(maxDrawdown * 10) / 10,
      concentration_risk: persona === 'aggressive' ? 'high' : persona === 'conservative' ? 'low' : 'medium',
      liquidity_risk: persona === 'aggressive' ? 'medium' : 'low',
    },
    compounding_efficiency: Math.round((p50 / (initialCapital + monthlyContribution * 12 * years) - 1) * 10000) / 100,
    final_net_worth: {
      pessimistic: Math.round(p10),
      expected: Math.round(p50),
      optimistic: Math.round(p90),
    },
    total_return_pct: Math.round((p50 / initialCapital - 1) * 10000) / 100,
    sharpe_ratio: Math.round(sharpeRatio * 100) / 100,
    max_drawdown_pct: Math.round(Math.abs(maxDrawdown) * 10) / 10,
    generated_at: new Date().toISOString(),
  };

  // Persist
  await supabase.from('fund_wealth_simulations').insert({
    user_id: userId,
    persona,
    initial_capital: initialCapital,
    monthly_contribution: monthlyContribution,
    projection_years: years,
    net_worth_trajectory: result.net_worth_trajectory,
    cashflow_curve: result.cashflow_curve,
    risk_heatmap: result.risk_heatmap,
    compounding_efficiency: result.compounding_efficiency,
    final_net_worth: result.final_net_worth.expected,
    total_return_pct: result.total_return_pct,
    sharpe_ratio: result.sharpe_ratio,
    max_drawdown_pct: result.max_drawdown_pct,
  });

  return result;
}

// ══════════════════════════════════════════════════
// 6. DEAL EXECUTION READINESS
// ══════════════════════════════════════════════════
async function dealReadiness(supabase: any, userId: string, body: any) {
  const propertyId = body.property_id;

  let property: any = null;
  if (propertyId) {
    const { data } = await supabase.from('properties').select('*').eq('id', propertyId).maybeSingle();
    property = data;
  }

  const price = property?.price || body.price || 1_000_000_000;
  const city = property?.city || body.city || 'Jakarta';
  const profile = CITY_PROFILES[city] || CITY_PROFILES['Jakarta'];

  const dueDiligence = {
    title_check: { status: 'pending', score: 0, notes: 'Certificate verification required (SHM/SHGB)' },
    legal_compliance: { status: 'pending', score: 0, notes: 'IMB/PBG permit verification needed' },
    structural_assessment: { status: 'pending', score: 0, notes: 'Building inspection recommended' },
    environmental: { status: 'pending', score: 0, notes: 'AMDAL compliance check pending' },
    market_validation: { status: 'complete', score: 85, notes: `${city} market validated: ${profile.demand_heat}/100 demand heat` },
    financial_viability: { status: 'complete', score: 78, notes: `Expected yield: ${profile.base_yield}%, growth: ${profile.growth_rate}%` },
  };

  const financingStructure = {
    recommended_ltv: 0.7,
    down_payment: Math.round(price * 0.3),
    loan_amount: Math.round(price * 0.7),
    estimated_rate: 8.5,
    monthly_payment: Math.round((price * 0.7 * (8.5 / 1200)) / (1 - Math.pow(1 + 8.5 / 1200, -240))),
    term_years: 20,
    dscr: Math.round((price * profile.base_yield / 100 / 12) / ((price * 0.7 * (8.5 / 1200)) / (1 - Math.pow(1 + 8.5 / 1200, -240))) * 100) / 100,
    banks: ['BCA', 'Bank Mandiri', 'BTN', 'BRI'],
  };

  const liquidityAssessment = {
    days_to_sell_estimate: profile.demand_heat > 70 ? 45 : profile.demand_heat > 40 ? 90 : 180,
    market_depth: profile.demand_heat > 70 ? 'deep' : profile.demand_heat > 40 ? 'moderate' : 'thin',
    exit_friction: profile.entry_barrier > 0.6 ? 'low' : 'medium',
    currency_risk: city.includes('Dubai') || city.includes('Singapore') ? 'low' : 'moderate',
  };

  const completedChecks = Object.values(dueDiligence).filter((d: any) => d.status === 'complete').length;
  const totalChecks = Object.keys(dueDiligence).length;
  const readinessScore = Math.round((completedChecks / totalChecks) * 100);

  const result = {
    property_id: propertyId,
    city,
    price,
    readiness_score: readinessScore,
    due_diligence_summary: dueDiligence,
    financing_structure: financingStructure,
    legal_readiness_score: completedChecks > 4 ? 80 : 30,
    liquidity_assessment: liquidityAssessment,
    execution_packet: {
      status: readinessScore > 70 ? 'ready' : 'incomplete',
      missing_items: Object.entries(dueDiligence).filter(([_, v]: any) => v.status === 'pending').map(([k]) => k),
      estimated_completion_days: (totalChecks - completedChecks) * 7,
    },
    generated_at: new Date().toISOString(),
  };

  await supabase.from('fund_deal_readiness').insert({
    user_id: userId,
    property_id: propertyId,
    readiness_score: readinessScore,
    due_diligence_summary: dueDiligence,
    financing_structure: financingStructure,
    legal_readiness_score: result.legal_readiness_score,
    liquidity_assessment: liquidityAssessment,
    execution_packet: result.execution_packet,
    status: readinessScore > 70 ? 'ready' : 'draft',
  });

  return result;
}

// ══════════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader || `Bearer ${serviceKey}` } },
    });

    // Extract user
    let userId: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch { /* anonymous access for some pipelines */ }
    }

    const body = await req.json();
    const pipeline = body.pipeline;

    let result: any;

    switch (pipeline) {
      case 'capital_allocation':
        if (!userId) throw new Error('Authentication required');
        result = await capitalAllocationBrain(supabase, userId, body);
        break;

      case 'portfolio_rebalancing':
        if (!userId) throw new Error('Authentication required');
        result = await portfolioRebalancing(supabase, userId);
        break;

      case 'entry_timing':
        result = await entryTimingEngine(supabase, body);
        break;

      case 'exit_strategy':
        if (!userId) throw new Error('Authentication required');
        result = await exitStrategyOptimizer(supabase, userId, body);
        break;

      case 'wealth_simulation':
        if (!userId) throw new Error('Authentication required');
        result = await wealthSimulator(supabase, userId, body);
        break;

      case 'deal_readiness':
        if (!userId) throw new Error('Authentication required');
        result = await dealReadiness(supabase, userId, body);
        break;

      case 'full_fund_analysis':
        if (!userId) throw new Error('Authentication required');
        const [allocation, rebalancing, timing, wealth] = await Promise.all([
          capitalAllocationBrain(supabase, userId, body),
          portfolioRebalancing(supabase, userId),
          entryTimingEngine(supabase, body),
          wealthSimulator(supabase, userId, body),
        ]);
        result = { allocation, rebalancing, timing, wealth, generated_at: new Date().toISOString() };
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
    console.error('fund-intelligence error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
