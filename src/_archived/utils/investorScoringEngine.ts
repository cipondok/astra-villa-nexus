/**
 * Investor Intelligence Scoring Engine
 * 
 * Zero-latency client-side computation for:
 * - Capital Readiness Score (0–100)
 * - Deal Conversion Probability (0–1)
 * - Investment Style Classification
 * - Liquidity Matching Index (0–100)
 * - Recommended Deal Priority Queue
 */

import type { InvestorDNA } from '@/hooks/useInvestorDNA';

// ─── Types ───────────────────────────────────────────────────────────────

export type InvestmentStyle =
  | 'yield_hunter'
  | 'flip_opportunist'
  | 'luxury_lifestyle'
  | 'institutional_allocator'
  | 'unclassified';

export interface BehavioralSignals {
  searchCount: number;
  savedCount: number;
  viewingBookings: number;
  inquiryCount: number;
  pastTransactions: number;
  avgSessionDurationSec: number;
  daysSinceLastActivity: number;
  compareUsage: number;
  mapExploreCount: number;
  alertResponseRate: number; // 0–1
}

export interface ScoringWeights {
  search: number;
  saves: number;
  viewings: number;
  budget: number;
  location: number;
  riskProfile: number;
  transactions: number;
  rentalPref: number;
}

export interface InvestorScoreResult {
  capitalReadiness: number;
  conversionProbability: number;
  style: InvestmentStyle;
  styleConfidence: number;
  liquidityIndex: number;
  signals: SignalBreakdown[];
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface SignalBreakdown {
  factor: string;
  raw: number;
  weighted: number;
  maxPossible: number;
}

// ─── Default Weights ─────────────────────────────────────────────────────

export const DEFAULT_WEIGHTS: ScoringWeights = {
  search: 0.10,
  saves: 0.15,
  viewings: 0.20,
  budget: 0.15,
  location: 0.10,
  riskProfile: 0.10,
  transactions: 0.15,
  rentalPref: 0.05,
};

// ─── Normalization helpers ───────────────────────────────────────────────

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

/** Diminishing returns curve — fast early gain, plateaus */
const dimReturn = (val: number, halfPoint: number): number => {
  if (val <= 0) return 0;
  return clamp((val / (val + halfPoint)) * 100);
};

// ─── Capital Readiness Score ─────────────────────────────────────────────

export function computeCapitalReadiness(
  behavior: BehavioralSignals,
  dna: InvestorDNA | null,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): { score: number; signals: SignalBreakdown[] } {
  const signals: SignalBreakdown[] = [];

  // 1. Search frequency → engagement depth
  const searchNorm = dimReturn(behavior.searchCount, 20);
  signals.push({ factor: 'Search Frequency', raw: behavior.searchCount, weighted: searchNorm * weights.search, maxPossible: 100 * weights.search });

  // 2. Saved listings → intent signal
  const savesNorm = dimReturn(behavior.savedCount, 10);
  signals.push({ factor: 'Saved Listings', raw: behavior.savedCount, weighted: savesNorm * weights.saves, maxPossible: 100 * weights.saves });

  // 3. Viewing bookings → high-intent action
  const viewingNorm = dimReturn(behavior.viewingBookings, 3);
  signals.push({ factor: 'Viewing Bookings', raw: behavior.viewingBookings, weighted: viewingNorm * weights.viewings, maxPossible: 100 * weights.viewings });

  // 4. Budget clarity → capital confidence
  const budgetScore = dna
    ? (dna.budget_range_max > 0 && dna.budget_range_min > 0 ? 85 : 40)
    : 20;
  signals.push({ factor: 'Budget Clarity', raw: budgetScore, weighted: budgetScore * weights.budget, maxPossible: 100 * weights.budget });

  // 5. Location preference depth
  const locationScore = dna
    ? dimReturn((dna.preferred_cities?.length ?? 0), 3)
    : 15;
  signals.push({ factor: 'Location Focus', raw: dna?.preferred_cities?.length ?? 0, weighted: locationScore * weights.location, maxPossible: 100 * weights.location });

  // 6. Risk profile completeness
  const riskScore = dna
    ? clamp((dna.risk_tolerance_score ?? 0))
    : 10;
  signals.push({ factor: 'Risk Profile', raw: riskScore, weighted: riskScore * weights.riskProfile, maxPossible: 100 * weights.riskProfile });

  // 7. Past transaction velocity
  const txNorm = dimReturn(behavior.pastTransactions, 2);
  signals.push({ factor: 'Transaction History', raw: behavior.pastTransactions, weighted: txNorm * weights.transactions, maxPossible: 100 * weights.transactions });

  // 8. Rental yield preference
  const rentalScore = dna
    ? clamp((dna.rental_income_pref_weight ?? 0) * 100)
    : 30;
  signals.push({ factor: 'Rental Preference', raw: rentalScore, weighted: rentalScore * weights.rentalPref, maxPossible: 100 * weights.rentalPref });

  const totalScore = clamp(signals.reduce((sum, s) => sum + s.weighted, 0));

  // Recency decay — reduce if inactive
  const decayFactor = behavior.daysSinceLastActivity > 30
    ? Math.max(0.5, 1 - (behavior.daysSinceLastActivity - 30) * 0.01)
    : 1;

  return { score: clamp(totalScore * decayFactor), signals };
}

// ─── Deal Conversion Probability ─────────────────────────────────────────

export function computeConversionProbability(
  capitalReadiness: number,
  behavior: BehavioralSignals,
  dna: InvestorDNA | null,
): number {
  // Logistic-like function from composite signals
  const intentSignal = (
    (behavior.viewingBookings > 0 ? 0.25 : 0) +
    (behavior.inquiryCount > 0 ? 0.20 : 0) +
    (behavior.pastTransactions > 0 ? 0.15 : 0) +
    (behavior.alertResponseRate * 0.10) +
    (capitalReadiness / 100 * 0.30)
  );

  // DNA boost
  const dnaBoost = dna
    ? (dna.probability_next_purchase ?? 0) * 0.15
    : 0;

  // Recency penalty
  const recencyPenalty = behavior.daysSinceLastActivity > 14 ? 0.1 : 0;

  return clamp((intentSignal + dnaBoost - recencyPenalty) * 100) / 100;
}

// ─── Investment Style Classification ─────────────────────────────────────

export function classifyInvestmentStyle(
  dna: InvestorDNA | null,
  behavior: BehavioralSignals,
): { style: InvestmentStyle; confidence: number } {
  if (!dna) return { style: 'unclassified', confidence: 0 };

  const scores: Record<InvestmentStyle, number> = {
    yield_hunter: 0,
    flip_opportunist: 0,
    luxury_lifestyle: 0,
    institutional_allocator: 0,
    unclassified: 0,
  };

  // Yield Hunter: high rental pref, conservative, long horizon
  scores.yield_hunter =
    (dna.rental_income_pref_weight ?? 0) * 35 +
    (dna.investment_horizon_years ?? 0 > 5 ? 20 : 5) +
    (dna.investor_persona === 'conservative' ? 25 : 0) +
    (dna.diversification_score ?? 0) * 0.2;

  // Flip Opportunist: high flip affinity, short horizon, aggressive
  scores.flip_opportunist =
    (dna.flip_strategy_affinity ?? 0) * 40 +
    (dna.investment_horizon_years ?? 0 < 3 ? 20 : 0) +
    (dna.investor_persona === 'flipper' ? 25 : dna.investor_persona === 'aggressive' ? 15 : 0);

  // Luxury Lifestyle: high luxury bias, high budget
  scores.luxury_lifestyle =
    (dna.luxury_bias_score ?? 0) * 35 +
    (dna.investor_persona === 'luxury' ? 30 : 0) +
    ((dna.budget_range_max ?? 0) > 5_000_000_000 ? 20 : (dna.budget_range_max ?? 0) > 2_000_000_000 ? 10 : 0);

  // Institutional: high budget, diversification, multiple cities
  scores.institutional_allocator =
    ((dna.budget_range_max ?? 0) > 10_000_000_000 ? 30 : (dna.budget_range_max ?? 0) > 5_000_000_000 ? 15 : 0) +
    (dna.diversification_score ?? 0) * 0.3 +
    ((dna.preferred_cities?.length ?? 0) > 3 ? 20 : (dna.preferred_cities?.length ?? 0) > 1 ? 10 : 0) +
    (behavior.compareUsage > 5 ? 10 : 0);

  // Find winner
  const entries = Object.entries(scores).filter(([k]) => k !== 'unclassified') as [InvestmentStyle, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const top = entries[0];
  const runner = entries[1];

  if (top[1] < 15) return { style: 'unclassified', confidence: 0 };

  const confidence = clamp(top[1] - runner[1] + 40); // Spread = confidence
  return { style: top[0], confidence };
}

// ─── Liquidity Matching Index ────────────────────────────────────────────

export function computeLiquidityIndex(
  capitalReadiness: number,
  behavior: BehavioralSignals,
  dna: InvestorDNA | null,
): number {
  // How well this investor matches the available marketplace liquidity
  const engagementDepth = dimReturn(
    behavior.searchCount + behavior.savedCount * 2 + behavior.viewingBookings * 5,
    30,
  );

  const budgetBreadth = dna
    ? clamp(((dna.budget_range_max ?? 0) - (dna.budget_range_min ?? 0)) / 1_000_000_000 * 50)
    : 20;

  const geoDiversity = dna
    ? dimReturn((dna.preferred_cities?.length ?? 0), 4) * 0.5
    : 10;

  return clamp(
    capitalReadiness * 0.4 +
    engagementDepth * 0.3 +
    budgetBreadth * 0.2 +
    geoDiversity * 0.1
  );
}

// ─── Tier Classification ─────────────────────────────────────────────────

export function classifyTier(capitalReadiness: number): 'platinum' | 'gold' | 'silver' | 'bronze' {
  if (capitalReadiness >= 80) return 'platinum';
  if (capitalReadiness >= 60) return 'gold';
  if (capitalReadiness >= 35) return 'silver';
  return 'bronze';
}

// ─── Master Scorer ───────────────────────────────────────────────────────

export function computeInvestorScore(
  behavior: BehavioralSignals,
  dna: InvestorDNA | null,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): InvestorScoreResult {
  const { score: capitalReadiness, signals } = computeCapitalReadiness(behavior, dna, weights);
  const conversionProbability = computeConversionProbability(capitalReadiness, behavior, dna);
  const { style, confidence: styleConfidence } = classifyInvestmentStyle(dna, behavior);
  const liquidityIndex = computeLiquidityIndex(capitalReadiness, behavior, dna);
  const tier = classifyTier(capitalReadiness);

  return {
    capitalReadiness: Math.round(capitalReadiness * 10) / 10,
    conversionProbability: Math.round(conversionProbability * 1000) / 1000,
    style,
    styleConfidence: Math.round(styleConfidence * 10) / 10,
    liquidityIndex: Math.round(liquidityIndex * 10) / 10,
    signals,
    tier,
  };
}

// ─── Style display helpers ───────────────────────────────────────────────

export const STYLE_LABELS: Record<InvestmentStyle, string> = {
  yield_hunter: 'Yield Hunter',
  flip_opportunist: 'Flip Opportunist',
  luxury_lifestyle: 'Luxury Lifestyle Buyer',
  institutional_allocator: 'Institutional Allocator',
  unclassified: 'Unclassified',
};

export const STYLE_COLORS: Record<InvestmentStyle, string> = {
  yield_hunter: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  flip_opportunist: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  luxury_lifestyle: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
  institutional_allocator: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  unclassified: 'text-muted-foreground bg-muted/50 border-border',
};

export const TIER_COLORS: Record<string, string> = {
  platinum: 'text-slate-100 bg-gradient-to-r from-slate-600 to-slate-400',
  gold: 'text-amber-900 bg-gradient-to-r from-amber-400 to-yellow-300',
  silver: 'text-slate-700 bg-gradient-to-r from-slate-300 to-slate-200',
  bronze: 'text-orange-900 bg-gradient-to-r from-orange-400 to-orange-300',
};
