import { PortfolioData, PortfolioProperty } from './usePortfolioManager';
import { detectExitTiming, type ExitTimingResult } from './useExitTiming';

// ─────────────────────────────────────────────
// 1. Portfolio Value Trend
// ─────────────────────────────────────────────
export type ValueTrend = 'ACCELERATING' | 'GROWING' | 'FLAT' | 'DECLINING';

export interface PortfolioValueTrendResult {
  current_value: number;
  projected_value_5y: number;
  absolute_growth: number;
  growth_percent: number;
  trend: ValueTrend;
  trend_emoji: string;
  annualized_rate: number;
}

export function computePortfolioValueTrend(p: PortfolioData): PortfolioValueTrendResult {
  const current = p.portfolio_value || 0;
  const projected = p.projected_value_5y || 0;
  const growth = projected - current;
  const pct = current > 0 ? (growth / current) * 100 : 0;
  const annualized = current > 0 ? (Math.pow(projected / current, 1 / 5) - 1) * 100 : 0;

  let trend: ValueTrend;
  let emoji: string;
  if (pct >= 40) { trend = 'ACCELERATING'; emoji = '🚀'; }
  else if (pct >= 15) { trend = 'GROWING'; emoji = '📈'; }
  else if (pct >= 0) { trend = 'FLAT'; emoji = '➡️'; }
  else { trend = 'DECLINING'; emoji = '📉'; }

  return {
    current_value: current,
    projected_value_5y: projected,
    absolute_growth: growth,
    growth_percent: Math.round(pct * 10) / 10,
    trend,
    trend_emoji: emoji,
    annualized_rate: Math.round(annualized * 10) / 10,
  };
}

// ─────────────────────────────────────────────
// 2. Average Rental Yield Signal
// ─────────────────────────────────────────────
export type YieldSignal = 'STRONG_YIELD' | 'STABLE_YIELD' | 'WEAK_YIELD';

export interface RentalYieldSignalResult {
  avg_yield: number;
  signal: YieldSignal;
  signal_label: string;
  signal_emoji: string;
  top_yielder: { title: string; yield_pct: number } | null;
  weakest_yielder: { title: string; yield_pct: number } | null;
}

export function computeRentalYieldSignal(properties: PortfolioProperty[]): RentalYieldSignalResult {
  if (properties.length === 0) {
    return { avg_yield: 0, signal: 'WEAK_YIELD', signal_label: 'Weak Yield', signal_emoji: '⚠️', top_yielder: null, weakest_yielder: null };
  }

  const yields = properties.map(p => ({ title: p.title, yield_pct: p.rental_yield || 0 }));
  const avg = yields.reduce((s, y) => s + y.yield_pct, 0) / yields.length;
  const sorted = [...yields].sort((a, b) => b.yield_pct - a.yield_pct);

  let signal: YieldSignal;
  let label: string;
  let emoji: string;
  if (avg >= 7) { signal = 'STRONG_YIELD'; label = 'Strong Yield'; emoji = '💰'; }
  else if (avg >= 4) { signal = 'STABLE_YIELD'; label = 'Stable Yield'; emoji = '✅'; }
  else { signal = 'WEAK_YIELD'; label = 'Weak Yield'; emoji = '⚠️'; }

  return {
    avg_yield: Math.round(avg * 10) / 10,
    signal,
    signal_label: label,
    signal_emoji: emoji,
    top_yielder: sorted[0] || null,
    weakest_yielder: sorted[sorted.length - 1] || null,
  };
}

// ─────────────────────────────────────────────
// 3. Capital Growth Momentum
// ─────────────────────────────────────────────
export type GrowthMomentum = 'SURGING' | 'STRONG' | 'MODERATE' | 'STALLING';

export interface CapitalGrowthMomentumResult {
  avg_growth_rate: number;
  avg_investment_score: number;
  momentum: GrowthMomentum;
  momentum_label: string;
  momentum_emoji: string;
  composite_score: number;
}

export function computeCapitalGrowthMomentum(properties: PortfolioProperty[]): CapitalGrowthMomentumResult {
  if (properties.length === 0) {
    return { avg_growth_rate: 0, avg_investment_score: 0, momentum: 'STALLING', momentum_label: 'Stalling', momentum_emoji: '🔻', composite_score: 0 };
  }

  const avgGrowth = properties.reduce((s, p) => s + (p.annual_growth_rate || 0), 0) / properties.length;
  const avgScore = properties.reduce((s, p) => s + (p.investment_score || 0), 0) / properties.length;

  // Composite: growth_norm * 0.55 + score * 0.45
  const growthNorm = Math.max(0, Math.min(100, Math.round((avgGrowth / 15) * 100)));
  const composite = Math.round(growthNorm * 0.55 + avgScore * 0.45);

  let momentum: GrowthMomentum;
  let label: string;
  let emoji: string;
  if (composite >= 75) { momentum = 'SURGING'; label = 'Surging'; emoji = '🔥'; }
  else if (composite >= 55) { momentum = 'STRONG'; label = 'Strong'; emoji = '💪'; }
  else if (composite >= 35) { momentum = 'MODERATE'; label = 'Moderate'; emoji = '📊'; }
  else { momentum = 'STALLING'; label = 'Stalling'; emoji = '🔻'; }

  return {
    avg_growth_rate: Math.round(avgGrowth * 10) / 10,
    avg_investment_score: Math.round(avgScore),
    momentum,
    momentum_label: label,
    momentum_emoji: emoji,
    composite_score: composite,
  };
}

// ─────────────────────────────────────────────
// 4. Smart Sell / Hold Advisory
// ─────────────────────────────────────────────
export interface SellHoldAdvisory {
  property_title: string;
  property_id: string;
  exit_timing: ExitTimingResult;
  roi_5y: number;
}

export function computeSellHoldAdvisory(properties: PortfolioProperty[]): SellHoldAdvisory[] {
  if (properties.length === 0) return [];

  return properties.map(prop => {
    const capitalGain = prop.roi_5y || 0;
    // Infer cycle from demand heat + growth
    const heatScore = prop.demand_heat_score || 0;
    const growthRate = prop.annual_growth_rate || 0;
    let cycle: string;
    if (heatScore >= 70 && growthRate < 3) cycle = 'peak';
    else if (heatScore >= 50) cycle = 'expansion';
    else if (growthRate >= 5) cycle = 'recovery';
    else cycle = 'correction';

    // Liquidity from investment score proxy
    const liquidity = Math.min(100, (prop.investment_score || 50) * 1.2);

    return {
      property_title: prop.title,
      property_id: prop.id,
      exit_timing: detectExitTiming(capitalGain, cycle, liquidity),
      roi_5y: prop.roi_5y,
    };
  }).sort((a, b) => b.exit_timing.composite_score - a.exit_timing.composite_score);
}

// ─────────────────────────────────────────────
// 5. Next Investment Opportunity Hint
// ─────────────────────────────────────────────
export interface NextOpportunityHint {
  suggested_zone: string;
  reason: string;
  gap_cities: string[];
  portfolio_cities: string[];
}

export function computeNextOpportunityHint(
  p: PortfolioData,
  hotspots: Array<{ city: string; score?: number; demand_heat_score?: number; growth_rate?: number }>
): NextOpportunityHint {
  const portfolioCities = new Set((p.unique_cities || []).map(c => c.toLowerCase()));
  
  // Find hotspot cities NOT in portfolio
  const unexplored = hotspots
    .filter(h => !portfolioCities.has((h.city || '').toLowerCase()))
    .sort((a, b) => (b.score || b.demand_heat_score || 0) - (a.score || a.demand_heat_score || 0));

  if (unexplored.length === 0) {
    return {
      suggested_zone: 'Diversified',
      reason: 'Portfolio already covers top-performing markets. Consider exploring emerging sub-districts or alternative property types within existing cities.',
      gap_cities: [],
      portfolio_cities: Array.from(portfolioCities),
    };
  }

  const top = unexplored[0];
  const growthStr = top.growth_rate != null ? ` with ${top.growth_rate > 0 ? '+' : ''}${top.growth_rate.toFixed(1)}% growth` : '';

  return {
    suggested_zone: top.city,
    reason: `${top.city} ranks high in demand (score: ${top.score || top.demand_heat_score || '—'})${growthStr} but is absent from your portfolio. Expanding here improves geographic diversification and captures emerging market upside.`,
    gap_cities: unexplored.slice(0, 3).map(h => h.city),
    portfolio_cities: Array.from(portfolioCities),
  };
}
