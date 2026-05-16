export type CycleStage = 'RECOVERY' | 'EXPANSION' | 'PEAK' | 'CORRECTION';
export type CycleVariant = 'recovery' | 'expansion' | 'peak' | 'correction';

export interface MacroCycleInput {
  demand_index: number;
  price_index: number;
  confidence_level: number;
}

export interface MacroCycleResult {
  cycle_stage: CycleStage;
  cycle_insight: string;
  variant: CycleVariant;
  composite_score: number;
}

/**
 * Detects Indonesia property market cycle phase from 3 macro signals.
 * Composite = demand * 0.40 + price * 0.35 + confidence * 0.25
 *
 * 76–100 → PEAK
 * 56–75  → EXPANSION
 * 36–55  → RECOVERY
 * 0–35   → CORRECTION
 */
export function detectMarketCycle(input: MacroCycleInput): MacroCycleResult {
  const d = Math.max(0, Math.min(100, input.demand_index));
  const p = Math.max(0, Math.min(100, input.price_index));
  const c = Math.max(0, Math.min(100, input.confidence_level));
  const composite = Math.round(d * 0.40 + p * 0.35 + c * 0.25);

  if (composite >= 76) {
    return {
      cycle_stage: 'PEAK',
      variant: 'peak',
      composite_score: composite,
      cycle_insight: 'Pasar properti Indonesia berada di fase puncak. Harga dan permintaan tinggi — waspadai potensi koreksi. Investor disarankan mengambil profit atau menahan posisi dengan exit strategy yang jelas.',
    };
  }

  if (composite >= 56) {
    return {
      cycle_stage: 'EXPANSION',
      variant: 'expansion',
      composite_score: composite,
      cycle_insight: 'Pasar dalam fase ekspansi — permintaan meningkat dan harga bergerak naik. Momentum ideal untuk akuisisi sebelum harga mencapai puncak. Fokus pada lokasi dengan pertumbuhan infrastruktur.',
    };
  }

  if (composite >= 36) {
    return {
      cycle_stage: 'RECOVERY',
      variant: 'recovery',
      composite_score: composite,
      cycle_insight: 'Pasar memasuki fase pemulihan. Harga mulai stabil setelah koreksi, permintaan perlahan bangkit. Peluang value buying terbaik — cari aset undervalued di lokasi strategis.',
    };
  }

  return {
    cycle_stage: 'CORRECTION',
    variant: 'correction',
    composite_score: composite,
    cycle_insight: 'Pasar dalam fase koreksi — permintaan menurun dan tekanan harga ke bawah. Tahan cash, hindari leveraged purchase, dan tunggu sinyal pemulihan sebelum masuk pasar.',
  };
}
