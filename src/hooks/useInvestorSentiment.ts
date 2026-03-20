// ── Post-IPO Investor Sentiment Scoring Engine ──

export interface SentimentInputs {
  /** Net analyst upgrades minus downgrades (e.g. +5 means 5 more upgrades) */
  analystUpgrades: number;
  /** Institutional ownership inflow trend 0–100 */
  institutionalInflowTrend: number;
  /** Media tone score 0–100 (higher = more positive) */
  mediaToneScore: number;
  /** Retail momentum score 0–100 */
  retailMomentum: number;
  /** Short interest ratio 0–100 (raw, we invert internally) */
  shortInterestRatio: number;
  /** Options implied volatility trend 0–100 (lower = calmer market) */
  optionsIVTrend: number;
}

export type SentimentRegime = 'BULLISH_MOMENTUM' | 'STABLE_ACCUMULATION' | 'DEFENSIVE';

export interface SentimentResult {
  score: number;
  regime: SentimentRegime;
  label: string;
  strategy: string;
  variant: 'bullish' | 'stable' | 'defensive';
}

/**
 * Calculates the Post-IPO Investor Sentiment Index.
 *
 * Formula:
 *   (analystUpgrades × 0.25)
 * + (institutionalInflowTrend × 0.25)
 * + (mediaToneScore × 0.15)
 * + (retailMomentum × 0.10)
 * + (shortInterestInverse × 0.15)
 * + (optionsIVInverse × 0.10)
 *
 * Returns a score 0–100 and corresponding regime.
 */
export function computeSentimentIndex(inputs: SentimentInputs): SentimentResult {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const analystNorm = clamp(inputs.analystUpgrades * 10 + 50); // center around 50
  const shortInverse = clamp(100 - inputs.shortInterestRatio);
  const ivInverse = clamp(100 - inputs.optionsIVTrend);

  const score = Math.round(
    analystNorm * 0.25 +
    clamp(inputs.institutionalInflowTrend) * 0.25 +
    clamp(inputs.mediaToneScore) * 0.15 +
    clamp(inputs.retailMomentum) * 0.10 +
    shortInverse * 0.15 +
    ivInverse * 0.10
  );

  if (score > 75) {
    return {
      score,
      regime: 'BULLISH_MOMENTUM',
      label: 'Bullish Momentum',
      strategy: 'Consider secondary raise / acquisition timing',
      variant: 'bullish',
    };
  }
  if (score >= 50) {
    return {
      score,
      regime: 'STABLE_ACCUMULATION',
      label: 'Stable Accumulation',
      strategy: 'Focus on execution consistency',
      variant: 'stable',
    };
  }
  return {
    score,
    regime: 'DEFENSIVE',
    label: 'Defensive Regime',
    strategy: 'Narrative reinforcement + insider confidence signals',
    variant: 'defensive',
  };
}

/** Classifies narrative strength from media + analyst signals */
export function classifyNarrativeStrength(
  mediaTone: number,
  analystUpgrades: number,
  retailMomentum: number
): { level: 'STRONG' | 'MODERATE' | 'WEAK'; score: number } {
  const score = Math.round(mediaTone * 0.45 + Math.min(100, analystUpgrades * 10 + 50) * 0.35 + retailMomentum * 0.20);
  if (score >= 70) return { level: 'STRONG', score };
  if (score >= 45) return { level: 'MODERATE', score };
  return { level: 'WEAK', score };
}

/** Detects risk alert flags from sentiment signals */
export function detectRiskAlerts(inputs: SentimentInputs): string[] {
  const alerts: string[] = [];
  if (inputs.shortInterestRatio > 60) alerts.push('Elevated short interest — potential squeeze or attack');
  if (inputs.optionsIVTrend > 70) alerts.push('High implied volatility — market uncertainty');
  if (inputs.mediaToneScore < 30) alerts.push('Negative media sentiment — narrative intervention needed');
  if (inputs.institutionalInflowTrend < 25) alerts.push('Institutional outflow detected — holder confidence risk');
  if (inputs.analystUpgrades < -2) alerts.push('Analyst downgrade wave — credibility defense required');
  return alerts;
}
