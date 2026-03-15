export type ExitSignal = 'STRONG SELL WINDOW' | 'PROFIT BOOKING OPPORTUNITY' | 'HOLD FOR FURTHER GROWTH' | 'LONG TERM ASSET HOLD';
export type ExitVariant = 'sell_now' | 'take_profit' | 'hold' | 'long_hold';

export interface ExitTimingResult {
  signal: ExitSignal;
  variant: ExitVariant;
  emoji: string;
  composite_score: number;
}

/**
 * Detects optimal exit timing from capital gain, cycle stage, and liquidity.
 * Composite = gain_norm * 0.40 + cycle_sell_pressure * 0.35 + liquidity * 0.25
 *
 * 76–100 → STRONG SELL WINDOW
 * 56–75  → PROFIT BOOKING OPPORTUNITY
 * 36–55  → HOLD FOR FURTHER GROWTH
 * 0–35   → LONG TERM ASSET HOLD
 */
export function detectExitTiming(capital_gain: number, cycle_stage: string, liquidity_score: number): ExitTimingResult {
  // Gain normalized: 30%+ = 100, 0% = 0, negative clamps to 0
  const gainNorm = Math.max(0, Math.min(100, Math.round((capital_gain / 30) * 100)));

  // Cycle sell pressure: peak = high pressure to sell, correction = moderate (sell before worse), expansion/recovery = low
  const cycleMap: Record<string, number> = { peak: 95, correction: 60, expansion: 30, recovery: 15 };
  const cyclePressure = cycleMap[cycle_stage.toLowerCase().replace(/\s+/g, '_')] ?? 40;

  const liq = Math.max(0, Math.min(100, liquidity_score));

  const composite = Math.round(gainNorm * 0.40 + cyclePressure * 0.35 + liq * 0.25);

  if (composite >= 76) return { signal: 'STRONG SELL WINDOW', variant: 'sell_now', emoji: '🔔', composite_score: composite };
  if (composite >= 56) return { signal: 'PROFIT BOOKING OPPORTUNITY', variant: 'take_profit', emoji: '💰', composite_score: composite };
  if (composite >= 36) return { signal: 'HOLD FOR FURTHER GROWTH', variant: 'hold', emoji: '📈', composite_score: composite };
  return { signal: 'LONG TERM ASSET HOLD', variant: 'long_hold', emoji: '🏠', composite_score: composite };
}
