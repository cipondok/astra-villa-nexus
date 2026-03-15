export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskType = 'MINIMAL EXPOSURE' | 'MARKET TIMING RISK' | 'LIQUIDITY TRAP RISK' | 'CAPITAL EROSION RISK';

export interface InvestmentRiskInput {
  demand_level: string;
  liquidity_level: string;
  cycle_stage: string;
}

export interface InvestmentRiskResult {
  risk_level: RiskLevel;
  risk_type: RiskType;
  alert_message: string;
  risk_score: number;
}

/**
 * Detects investment risk signals from demand, liquidity, and market cycle.
 * Risk Score = (100 - demand) * 0.35 + (100 - liquidity) * 0.35 + cycle_penalty * 0.30
 */
export function detectInvestmentRisk(input: InvestmentRiskInput): InvestmentRiskResult {
  const demandMap: Record<string, number> = { very_high: 95, high: 80, moderate: 55, low: 25 };
  const liquidityMap: Record<string, number> = { very_high: 95, high: 80, moderate: 55, low: 25 };
  const cyclePenalty: Record<string, number> = { recovery: 40, expansion: 15, peak: 55, correction: 90 };

  const dk = input.demand_level.toLowerCase().replace(/\s+/g, '_');
  const lk = input.liquidity_level.toLowerCase().replace(/\s+/g, '_');
  const ck = input.cycle_stage.toLowerCase().replace(/\s+/g, '_');

  const demandScore = demandMap[dk] ?? 50;
  const liquidityScore = liquidityMap[lk] ?? 50;
  const cycleScore = cyclePenalty[ck] ?? 40;

  const riskScore = Math.round((100 - demandScore) * 0.35 + (100 - liquidityScore) * 0.35 + cycleScore * 0.30);

  if (riskScore <= 25) {
    return {
      risk_level: 'LOW',
      risk_type: 'MINIMAL EXPOSURE',
      risk_score: riskScore,
      alert_message: 'Risiko minimal — permintaan kuat, likuiditas tinggi, dan siklus pasar mendukung. Aset dalam posisi aman untuk ditahan jangka panjang.',
    };
  }

  if (riskScore <= 45) {
    return {
      risk_level: 'MODERATE',
      risk_type: 'MARKET TIMING RISK',
      risk_score: riskScore,
      alert_message: 'Risiko moderat — perhatikan timing pasar. Beberapa indikator menunjukkan potensi perlambatan. Siapkan exit strategy sebagai contingency dalam 6-12 bulan.',
    };
  }

  if (riskScore <= 65) {
    return {
      risk_level: 'HIGH',
      risk_type: 'LIQUIDITY TRAP RISK',
      risk_score: riskScore,
      alert_message: 'Risiko tinggi — likuiditas terbatas dan permintaan melemah. Aset berpotensi sulit dijual tanpa diskon signifikan. Evaluasi strategi pricing atau realokasi aset segera.',
    };
  }

  return {
    risk_level: 'CRITICAL',
    risk_type: 'CAPITAL EROSION RISK',
    risk_score: riskScore,
    alert_message: 'PERINGATAN KRITIS — siklus koreksi dengan permintaan dan likuiditas rendah. Risiko penurunan nilai aset sangat tinggi. Pertimbangkan exit segera atau hedging melalui diversifikasi portfolio.',
  };
}
