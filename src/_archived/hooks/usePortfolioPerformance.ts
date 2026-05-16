export type AssetPerformanceLevel = 'OUTPERFORMING' | 'STRONG' | 'STABLE' | 'UNDERPERFORMING';
export type StrategySignal = 'HOLD & GROW' | 'OPTIMIZE YIELD' | 'CONSIDER SELLING' | 'URGENT REVIEW';

export interface PortfolioPerformanceInput {
  purchase_price: number;
  current_price: number;
  monthly_rent: number;
  growth_score: number;
  demand_level: string;
  liquidity_score: number;
}

export interface PortfolioPerformanceResult {
  capital_gain_percent: string;
  rental_yield_percent: string;
  asset_performance_level: AssetPerformanceLevel;
  strategy_signal: StrategySignal;
  performance_summary: string;
  composite_score: number;
}

/**
 * Analyzes owned property portfolio performance from financial + market signals.
 *
 * Capital Gain = (current - purchase) / purchase * 100
 * Rental Yield = (monthly_rent * 12) / current_price * 100
 * Composite = capital_gain_norm * 0.30 + yield_norm * 0.25 + growth * 0.20 + demand * 0.15 + liquidity * 0.10
 */
export function analyzePortfolioPerformance(input: PortfolioPerformanceInput): PortfolioPerformanceResult {
  const { purchase_price, current_price, monthly_rent, growth_score, demand_level, liquidity_score } = input;

  const pp = Math.max(1, purchase_price);
  const cp = Math.max(1, current_price);

  const capitalGain = ((cp - pp) / pp) * 100;
  const rentalYield = (monthly_rent * 12) / cp * 100;

  // Normalize capital gain: 20%+ = 100, 0% = 50, -20% = 0
  const cgNorm = Math.max(0, Math.min(100, Math.round(50 + capitalGain * 2.5)));

  // Normalize yield: 10%+ = 100, linear
  const yieldNorm = Math.min(100, Math.round(rentalYield * 10));

  const demandMap: Record<string, number> = { very_high: 100, high: 80, moderate: 55, low: 30 };
  const demandScore = demandMap[demand_level.toLowerCase().replace(/\s+/g, '_')] ?? 50;

  const g = Math.max(0, Math.min(100, growth_score));
  const l = Math.max(0, Math.min(100, liquidity_score));

  const composite = Math.round(cgNorm * 0.30 + yieldNorm * 0.25 + g * 0.20 + demandScore * 0.15 + l * 0.10);

  const cgStr = `${capitalGain >= 0 ? '+' : ''}${capitalGain.toFixed(1)}%`;
  const yieldStr = `${rentalYield.toFixed(1)}%`;

  if (composite >= 75) {
    return {
      capital_gain_percent: cgStr,
      rental_yield_percent: yieldStr,
      asset_performance_level: 'OUTPERFORMING',
      strategy_signal: 'HOLD & GROW',
      composite_score: composite,
      performance_summary: `Aset berkinerja sangat baik dengan capital gain ${cgStr} dan yield sewa ${yieldStr}. Permintaan ${demand_level} dan pertumbuhan lokasi kuat mendukung strategi hold jangka panjang. Potensi apresiasi masih terbuka.`,
    };
  }

  if (composite >= 55) {
    return {
      capital_gain_percent: cgStr,
      rental_yield_percent: yieldStr,
      asset_performance_level: 'STRONG',
      strategy_signal: 'OPTIMIZE YIELD',
      composite_score: composite,
      performance_summary: `Aset menunjukkan performa solid dengan gain ${cgStr} dan yield ${yieldStr}. Pertimbangkan optimasi harga sewa atau renovasi ringan untuk memaksimalkan return. Pasar masih mendukung pertumbuhan.`,
    };
  }

  if (composite >= 40) {
    return {
      capital_gain_percent: cgStr,
      rental_yield_percent: yieldStr,
      asset_performance_level: 'STABLE',
      strategy_signal: 'CONSIDER SELLING',
      composite_score: composite,
      performance_summary: `Aset dalam kondisi stabil namun pertumbuhan terbatas. Capital gain ${cgStr} dan yield ${yieldStr} berada di level moderat. Evaluasi apakah realokasi ke lokasi lebih prospektif memberikan return lebih baik.`,
    };
  }

  return {
    capital_gain_percent: cgStr,
    rental_yield_percent: yieldStr,
    asset_performance_level: 'UNDERPERFORMING',
    strategy_signal: 'URGENT REVIEW',
    composite_score: composite,
    performance_summary: `Aset menunjukkan kinerja di bawah ekspektasi dengan gain ${cgStr} dan yield ${yieldStr}. Likuiditas dan permintaan rendah menambah risiko. Segera evaluasi strategi: optimasi harga, renovasi, atau exit untuk realokasi modal.`,
  };
}
