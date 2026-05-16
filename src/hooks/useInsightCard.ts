export interface InsightCardInput {
  investment_score: number;
  demand_level: string;
  liquidity_level: string;
  deal_probability: number;
}

export interface InsightCardResult {
  insight_headline: string;
  confidence_signal: string;
  recommended_action: string;
  composite_score: number;
}

/**
 * Generates a compact insight card combining multiple AI signals.
 * Composite = investment_score * 0.35 + demand * 0.25 + liquidity * 0.20 + deal_probability * 0.20
 */
export function generateInsightCard(input: InsightCardInput): InsightCardResult {
  const { investment_score, demand_level, liquidity_level, deal_probability } = input;

  const demandMap: Record<string, number> = { very_high: 100, high: 80, moderate: 55, low: 30 };
  const liquidityMap: Record<string, number> = { very_high: 100, high: 80, moderate: 55, low: 30 };

  const demandScore = demandMap[demand_level.toLowerCase().replace(/\s+/g, '_')] ?? 50;
  const liquidityScore = liquidityMap[liquidity_level.toLowerCase().replace(/\s+/g, '_')] ?? 50;

  const composite = Math.round(
    investment_score * 0.35 + demandScore * 0.25 + liquidityScore * 0.20 + deal_probability * 0.20
  );

  if (composite >= 80) {
    return {
      composite_score: composite,
      insight_headline: '🔥 Peluang Investasi Premium — Semua Sinyal Positif',
      confidence_signal: 'Confidence: SANGAT TINGGI — data pasar mendukung aksi cepat',
      recommended_action: 'Segera ajukan penawaran atau jadwalkan survei lokasi dalam 48 jam sebelum kompetitor bergerak.',
    };
  }

  if (composite >= 60) {
    return {
      composite_score: composite,
      insight_headline: '💎 Prospek Kuat — Potensi Return Menjanjikan',
      confidence_signal: 'Confidence: TINGGI — mayoritas indikator menunjukkan tren positif',
      recommended_action: 'Lakukan analisis komparasi harga dengan 2-3 properti sejenis sebelum mengambil keputusan.',
    };
  }

  if (composite >= 40) {
    return {
      composite_score: composite,
      insight_headline: '📊 Pasar Stabil — Perlu Evaluasi Lebih Dalam',
      confidence_signal: 'Confidence: MODERAT — beberapa sinyal campuran, perlu validasi tambahan',
      recommended_action: 'Pantau perkembangan harga 2-4 minggu ke depan dan evaluasi ulang sebelum commit.',
    };
  }

  return {
    composite_score: composite,
    insight_headline: '⚠️ Sinyal Lemah — Pertimbangkan Alternatif Lain',
    confidence_signal: 'Confidence: RENDAH — indikator pasar belum mendukung investasi di titik ini',
    recommended_action: 'Alihkan fokus ke lokasi atau tipe properti dengan demand dan likuiditas lebih tinggi.',
  };
}
