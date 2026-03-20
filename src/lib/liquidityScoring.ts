/**
 * ASTRA Villa — Property Liquidity Scoring Engine
 *
 * Calculates a 0–100 liquidity score predicting how quickly a property
 * will transact based on 8 weighted behavioral and market signals.
 *
 * ── Formula ──
 * Raw Score = Σ (normalised_variable × weight)
 * Decay     = max(0.4, 1 − 0.012 × days_inactive)
 * Final     = clamp(Raw × Decay, 0, 100)
 *
 * ── Weights ──
 * Views/Day          : 0.12
 * Inquiry Conv Rate  : 0.15
 * Viewing Frequency  : 0.14
 * Price Competitiveness: 0.16
 * Days on Market     : 0.10
 * District Demand    : 0.13
 * Absorption Rate    : 0.10
 * Negotiation Success: 0.10
 */

export interface LiquidityInput {
  views_per_day: number;          // avg daily views
  inquiry_conversion_rate: number; // 0–100 (% of viewers who inquire)
  viewing_bookings_per_week: number;
  price_vs_market_pct: number;    // e.g. -5 = 5% below market, +10 = 10% above
  days_on_market: number;
  district_demand_index: number;  // 0–100
  absorption_rate_pct: number;    // 0–100 (district-level monthly absorption)
  negotiation_success_rate: number; // 0–100 (% of offers that reach closing)
  days_since_last_engagement?: number; // for decay
}

export interface LiquidityOutput {
  score: number;
  estimated_days_to_sell: { min: number; max: number };
  visibility_boost: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deal_alert_priority: 'STANDARD' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  tier: 'ILLIQUID' | 'LOW' | 'MODERATE' | 'LIQUID' | 'HIGHLY_LIQUID';
  breakdown: { variable: string; raw: number; normalised: number; weight: number; contribution: number }[];
}

// ── Normalisation helpers ──

/** Linear clamp 0–100 */
const norm = (v: number, min: number, max: number) =>
  Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));

/** Inverse normalisation — lower is better */
const normInv = (v: number, min: number, max: number) =>
  Math.max(0, Math.min(100, ((max - v) / (max - min)) * 100));

/** Price competitiveness: best at -5% (below market), worst at +20% above */
const normPrice = (pct: number) => {
  // -10% or below = 100, +20% or above = 0
  if (pct <= -10) return 100;
  if (pct >= 20) return 0;
  return Math.round(((20 - pct) / 30) * 100);
};

const WEIGHTS = [
  { key: 'views_per_day',             label: 'Views/Day',            weight: 0.12 },
  { key: 'inquiry_conversion_rate',   label: 'Inquiry Conv Rate',    weight: 0.15 },
  { key: 'viewing_bookings_per_week', label: 'Viewing Frequency',    weight: 0.14 },
  { key: 'price_vs_market_pct',       label: 'Price Competitiveness', weight: 0.16 },
  { key: 'days_on_market',            label: 'Days on Market',       weight: 0.10 },
  { key: 'district_demand_index',     label: 'District Demand',      weight: 0.13 },
  { key: 'absorption_rate_pct',       label: 'Absorption Rate',      weight: 0.10 },
  { key: 'negotiation_success_rate',  label: 'Negotiation Success',  weight: 0.10 },
] as const;

export function calculateLiquidityScore(input: LiquidityInput): LiquidityOutput {
  const normalisedValues: Record<string, number> = {
    views_per_day:             norm(input.views_per_day, 0, 50),
    inquiry_conversion_rate:   norm(input.inquiry_conversion_rate, 0, 30),
    viewing_bookings_per_week: norm(input.viewing_bookings_per_week, 0, 10),
    price_vs_market_pct:       normPrice(input.price_vs_market_pct),
    days_on_market:            normInv(input.days_on_market, 0, 180),
    district_demand_index:     norm(input.district_demand_index, 0, 100),
    absorption_rate_pct:       norm(input.absorption_rate_pct, 0, 100),
    negotiation_success_rate:  norm(input.negotiation_success_rate, 0, 100),
  };

  const rawInputs: Record<string, number> = {
    views_per_day: input.views_per_day,
    inquiry_conversion_rate: input.inquiry_conversion_rate,
    viewing_bookings_per_week: input.viewing_bookings_per_week,
    price_vs_market_pct: input.price_vs_market_pct,
    days_on_market: input.days_on_market,
    district_demand_index: input.district_demand_index,
    absorption_rate_pct: input.absorption_rate_pct,
    negotiation_success_rate: input.negotiation_success_rate,
  };

  const breakdown = WEIGHTS.map(w => {
    const normalised = normalisedValues[w.key];
    return {
      variable: w.label,
      raw: rawInputs[w.key],
      normalised: Math.round(normalised * 10) / 10,
      weight: w.weight,
      contribution: Math.round(normalised * w.weight * 10) / 10,
    };
  });

  const rawScore = breakdown.reduce((s, b) => s + b.contribution, 0);

  // Decay factor for inactivity
  const daysInactive = input.days_since_last_engagement ?? 0;
  const decay = Math.max(0.4, 1 - 0.012 * daysInactive);

  const score = Math.round(Math.max(0, Math.min(100, rawScore * decay)));

  // Estimated time-to-sell mapping
  const estimated_days_to_sell = estimateDaysToSell(score);

  // Visibility boost recommendation
  const visibility_boost: LiquidityOutput['visibility_boost'] =
    score >= 75 ? 'NONE' :
    score >= 55 ? 'LOW' :
    score >= 40 ? 'MEDIUM' :
    score >= 20 ? 'HIGH' : 'URGENT';

  // Deal alert priority
  const deal_alert_priority: LiquidityOutput['deal_alert_priority'] =
    score >= 80 ? 'CRITICAL' :
    score >= 60 ? 'HIGH' :
    score >= 40 ? 'ELEVATED' : 'STANDARD';

  const tier: LiquidityOutput['tier'] =
    score >= 80 ? 'HIGHLY_LIQUID' :
    score >= 60 ? 'LIQUID' :
    score >= 40 ? 'MODERATE' :
    score >= 20 ? 'LOW' : 'ILLIQUID';

  return { score, estimated_days_to_sell, visibility_boost, deal_alert_priority, tier, breakdown };
}

function estimateDaysToSell(score: number): { min: number; max: number } {
  if (score >= 80) return { min: 7, max: 21 };
  if (score >= 65) return { min: 21, max: 45 };
  if (score >= 50) return { min: 45, max: 75 };
  if (score >= 35) return { min: 75, max: 120 };
  if (score >= 20) return { min: 120, max: 180 };
  return { min: 180, max: 365 };
}

export { WEIGHTS as LIQUIDITY_WEIGHTS };
