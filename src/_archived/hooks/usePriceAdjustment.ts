export type DemandLevel = "very_hot" | "hot" | "warm" | "cool";
export type CycleStage = "RECOVERY" | "EXPANSION" | "PEAK" | "CORRECTION";

export interface PriceAdjustmentInput {
  price: number;            // current listing price IDR
  demand: DemandLevel;
  deal_score: number;       // 0-100 deal probability
  cycle: CycleStage;
}

export type AdjustmentSignal =
  | "RAISE PRICE"
  | "HOLD PRICE"
  | "SLIGHT DISCOUNT"
  | "AGGRESSIVE REPRICE";

export interface PriceAdjustmentResult {
  price_adjustment_signal: AdjustmentSignal;
  suggested_price_range: string;
  pricing_strategy_note: string;
  composite_score: number;
}

const DEMAND_SCORE: Record<DemandLevel, number> = {
  very_hot: 100, hot: 75, warm: 45, cool: 15,
};

const CYCLE_BIAS: Record<CycleStage, number> = {
  PEAK: 90, EXPANSION: 70, RECOVERY: 40, CORRECTION: 10,
};

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

/**
 * Suggests optimal listing price adjustment.
 *
 * Composite = demand * 0.35 + deal_score * 0.35 + cycle_bias * 0.30
 *
 * 76-100 → RAISE PRICE (+3-8%)
 * 51-75  → HOLD PRICE
 * 31-50  → SLIGHT DISCOUNT (-3-7%)
 * 0-30   → AGGRESSIVE REPRICE (-8-15%)
 */
export function suggestPriceAdjustment(input: PriceAdjustmentInput): PriceAdjustmentResult {
  const { price, demand, deal_score, cycle } = input;

  const d = DEMAND_SCORE[demand] ?? 45;
  const ds = Math.max(0, Math.min(100, deal_score));
  const cb = CYCLE_BIAS[cycle] ?? 40;

  const composite = Math.round(d * 0.35 + ds * 0.35 + cb * 0.30);

  let price_adjustment_signal: AdjustmentSignal;
  let lo: number;
  let hi: number;
  let pricing_strategy_note: string;

  if (composite >= 76) {
    price_adjustment_signal = "RAISE PRICE";
    lo = Math.round(price * 1.03);
    hi = Math.round(price * 1.08);
    pricing_strategy_note =
      "Demand kuat dan siklus pasar mendukung kenaikan harga. Naikkan listing price secara bertahap (3-8%) untuk memaksimalkan margin tanpa mengurangi minat pembeli.";
  } else if (composite >= 51) {
    price_adjustment_signal = "HOLD PRICE";
    lo = Math.round(price * 0.98);
    hi = Math.round(price * 1.02);
    pricing_strategy_note =
      "Harga saat ini sudah kompetitif dengan kondisi pasar. Pertahankan price point dan fokus pada optimasi listing (foto, deskripsi, highlight ROI) untuk meningkatkan konversi.";
  } else if (composite >= 31) {
    price_adjustment_signal = "SLIGHT DISCOUNT";
    lo = Math.round(price * 0.93);
    hi = Math.round(price * 0.97);
    pricing_strategy_note =
      "Deal probability rendah dan demand melemah. Lakukan penyesuaian harga moderat (3-7% diskon) disertai urgency trigger seperti 'harga spesial 14 hari' untuk akselerasi closing.";
  } else {
    price_adjustment_signal = "AGGRESSIVE REPRICE";
    lo = Math.round(price * 0.85);
    hi = Math.round(price * 0.92);
    pricing_strategy_note =
      "Pasar dalam tekanan dan listing berisiko stagnan. Reprice agresif (8-15%) diperlukan untuk menarik buyer pool baru. Pertimbangkan bundling insentif (free notaris, cashback DP).";
  }

  return {
    price_adjustment_signal,
    suggested_price_range: `${fmt(lo)} – ${fmt(hi)}`,
    pricing_strategy_note,
    composite_score: composite,
  };
}
