export type EconomicMomentum = "BOOMING" | "GROWING" | "STABLE" | "CONTRACTING";

export interface PropertyIndexInput {
  index: number;              // current index level 0-100
  economy: EconomicMomentum;
  demand: number;             // housing demand index 0-100
}

export type ForecastDirection = "STRONG UPTREND" | "MODERATE GROWTH" | "FLAT / SIDEWAYS" | "DOWNTREND RISK";
export type ForecastStrength = "HIGH CONVICTION" | "MODERATE CONVICTION" | "LOW CONVICTION";

export interface PropertyIndexResult {
  index_forecast_direction: ForecastDirection;
  forecast_strength: ForecastStrength;
  macro_signal_summary: string;
  composite_score: number;
}

const ECONOMY_SCORE: Record<EconomicMomentum, number> = {
  BOOMING: 100, GROWING: 70, STABLE: 40, CONTRACTING: 10,
};

/**
 * Composite = index * 0.30 + economy * 0.35 + demand * 0.35
 *
 * 76-100 → STRONG UPTREND (HIGH CONVICTION)
 * 51-75  → MODERATE GROWTH (MODERATE CONVICTION)
 * 31-50  → FLAT / SIDEWAYS (LOW CONVICTION)
 * 0-30   → DOWNTREND RISK (MODERATE CONVICTION)
 */
export function forecastPropertyIndex(input: PropertyIndexInput): PropertyIndexResult {
  const idx = Math.max(0, Math.min(100, input.index));
  const eco = ECONOMY_SCORE[input.economy] ?? 40;
  const dem = Math.max(0, Math.min(100, input.demand));

  const composite = Math.round(idx * 0.30 + eco * 0.35 + dem * 0.35);

  if (composite >= 76) {
    return {
      index_forecast_direction: "STRONG UPTREND",
      forecast_strength: "HIGH CONVICTION",
      macro_signal_summary:
        "Indeks properti nasional diprediksi naik signifikan — ekonomi ekspansif dan demand perumahan tinggi mendorong apresiasi harga secara luas. Momentum ideal untuk akuisisi sebelum puncak siklus.",
      composite_score: composite,
    };
  }
  if (composite >= 51) {
    return {
      index_forecast_direction: "MODERATE GROWTH",
      forecast_strength: "MODERATE CONVICTION",
      macro_signal_summary:
        "Indeks properti bergerak naik moderat — fundamental ekonomi cukup solid dan demand stabil. Pertumbuhan harga akan terjadi selektif di kota-kota dengan infrastruktur aktif.",
      composite_score: composite,
    };
  }
  if (composite >= 31) {
    return {
      index_forecast_direction: "FLAT / SIDEWAYS",
      forecast_strength: "LOW CONVICTION",
      macro_signal_summary:
        "Indeks properti cenderung stagnan — sinyal ekonomi mixed dan demand belum cukup kuat untuk mendorong kenaikan. Pasar dalam fase wait-and-see, fokus pada aset defensif.",
      composite_score: composite,
    };
  }
  return {
    index_forecast_direction: "DOWNTREND RISK",
    forecast_strength: "MODERATE CONVICTION",
    macro_signal_summary:
      "Risiko penurunan indeks properti tinggi — tekanan ekonomi dan demand lemah memberi sinyal koreksi. Tahan cash, hindari leverage, dan pantau stabilisasi makro sebelum re-entry.",
    composite_score: composite,
  };
}
