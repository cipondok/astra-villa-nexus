export type NationalTrend = "GROWTH" | "STRONG BOOM" | "STABLE" | "DECLINE";
export type CycleStage = "RECOVERY" | "EXPANSION" | "PEAK" | "CORRECTION";

export type InvestmentSignal =
  | "STRONG BUYING MOMENTUM"
  | "ACCUMULATION PHASE"
  | "PREMIUM MARKET RISK"
  | "CAUTIOUS INVESTMENT PERIOD";

export interface NationalSignalResult {
  signal: InvestmentSignal;
  emoji: string;
  variant: "momentum" | "accumulation" | "risk" | "caution";
}

const TREND_SCORE: Record<NationalTrend, number> = {
  "STRONG BOOM": 100,
  GROWTH: 70,
  STABLE: 40,
  DECLINE: 10,
};

const CYCLE_SCORE: Record<CycleStage, number> = {
  EXPANSION: 90,
  PEAK: 65,
  RECOVERY: 40,
  CORRECTION: 10,
};

/**
 * Generates a national investment signal from trend + cycle stage.
 * Composite = trend * 0.55 + cycle * 0.45
 *
 * 76–100 → STRONG BUYING MOMENTUM
 * 51–75  → ACCUMULATION PHASE
 * 31–50  → PREMIUM MARKET RISK
 * 0–30   → CAUTIOUS INVESTMENT PERIOD
 */
export function detectNationalSignal(
  trend: NationalTrend,
  cycle_stage: CycleStage
): NationalSignalResult {
  const t = TREND_SCORE[trend] ?? 40;
  const c = CYCLE_SCORE[cycle_stage] ?? 40;
  const composite = Math.round(t * 0.55 + c * 0.45);

  if (composite >= 76)
    return { signal: "STRONG BUYING MOMENTUM", emoji: "🚀", variant: "momentum" };
  if (composite >= 51)
    return { signal: "ACCUMULATION PHASE", emoji: "📦", variant: "accumulation" };
  if (composite >= 31)
    return { signal: "PREMIUM MARKET RISK", emoji: "⚠️", variant: "risk" };
  return { signal: "CAUTIOUS INVESTMENT PERIOD", emoji: "🛡️", variant: "caution" };
}
