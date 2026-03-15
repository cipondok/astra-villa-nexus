export type ROIGrade = "A" | "B" | "C" | "D";
export type Momentum = "SURGING" | "ACCELERATING" | "STEADY" | "DECLINING";

export interface AutoInvestInput {
  opportunity: number;   // 0-100
  roi: ROIGrade;
  momentum: Momentum;
}

export type InvestmentSignal =
  | "AUTO-BUY RECOMMENDED"
  | "STRONG CONSIDERATION"
  | "WATCHLIST — MONITOR"
  | "DO NOT ENGAGE";

export type ConfidenceLevel = "HIGH" | "MODERATE" | "LOW";

export interface AutoInvestResult {
  auto_investment_signal: InvestmentSignal;
  confidence_level: ConfidenceLevel;
  strategic_note: string;
  composite_score: number;
}

const ROI_SCORE: Record<ROIGrade, number> = { A: 100, B: 70, C: 40, D: 10 };
const MOMENTUM_SCORE: Record<Momentum, number> = { SURGING: 100, ACCELERATING: 70, STEADY: 40, DECLINING: 10 };

/**
 * Composite = opportunity * 0.40 + roi * 0.30 + momentum * 0.30
 *
 * 76-100 → AUTO-BUY RECOMMENDED
 * 51-75  → STRONG CONSIDERATION
 * 31-50  → WATCHLIST — MONITOR
 * 0-30   → DO NOT ENGAGE
 */
export function recommendAutoInvestment(input: AutoInvestInput): AutoInvestResult {
  const opp = Math.max(0, Math.min(100, input.opportunity));
  const r = ROI_SCORE[input.roi] ?? 40;
  const m = MOMENTUM_SCORE[input.momentum] ?? 40;

  const composite = Math.round(opp * 0.40 + r * 0.30 + m * 0.30);

  if (composite >= 76) {
    return {
      auto_investment_signal: "AUTO-BUY RECOMMENDED",
      confidence_level: "HIGH",
      strategic_note: "Sinyal investasi sangat kuat — opportunity score tinggi, ROI grade premium, dan momentum pasar mendukung. Eksekusi akuisisi segera untuk mengamankan posisi sebelum harga naik lebih lanjut.",
      composite_score: composite,
    };
  }
  if (composite >= 51) {
    return {
      auto_investment_signal: "STRONG CONSIDERATION",
      confidence_level: "MODERATE",
      strategic_note: "Profil investasi solid dengan potensi return menarik. Lakukan due diligence detail — validasi harga terhadap FMV, periksa legalitas, dan pastikan exit strategy sebelum commit.",
      composite_score: composite,
    };
  }
  if (composite >= 31) {
    return {
      auto_investment_signal: "WATCHLIST — MONITOR",
      confidence_level: "LOW",
      strategic_note: "Aset memiliki potensi tapi timing belum optimal. Masukkan ke watchlist dan pantau perubahan momentum pasar atau penurunan harga sebagai trigger re-evaluation.",
      composite_score: composite,
    };
  }
  return {
    auto_investment_signal: "DO NOT ENGAGE",
    confidence_level: "LOW",
    strategic_note: "Risiko terlalu tinggi relatif terhadap potensi return. Hindari alokasi kapital ke aset ini — fokuskan resources pada opportunity dengan skor lebih tinggi.",
    composite_score: composite,
  };
}
