export type LeadFlowStage = 'OPTIMAL' | 'EFFICIENT' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';

export interface LeadFlowHealthResult {
  lead_flow_stage: LeadFlowStage;
  bottleneck_issue: string;
  optimization_action: string;
  health_score: number;
}

/**
 * Evaluates lead distribution effectiveness from volume, response time, and conversion.
 *
 * Health Score = (volume_score * 0.25) + (response_score * 0.40) + (conversion_score * 0.35)
 *
 * 81–100 → OPTIMAL
 * 61–80  → EFFICIENT
 * 41–60  → NEEDS_IMPROVEMENT
 * 0–40   → CRITICAL
 */
export function evaluateLeadFlowHealth(
  leads: number,
  response_time_minutes: number,
  conversion_rate: number
): LeadFlowHealthResult {
  // Volume score: 100 at 500+ leads, linear below
  const volumeScore = Math.min(100, Math.round((leads / 500) * 100));

  // Response score: 100 at <= 5 min, 0 at >= 120 min
  const responseScore = Math.max(0, Math.min(100, Math.round(((120 - response_time_minutes) / 115) * 100)));

  // Conversion score: 100 at 10%+, linear below
  const conversionScore = Math.min(100, Math.round((conversion_rate / 10) * 100));

  const health = Math.round(volumeScore * 0.25 + responseScore * 0.40 + conversionScore * 0.35);

  if (health >= 81) {
    return {
      lead_flow_stage: 'OPTIMAL',
      health_score: health,
      bottleneck_issue: 'Tidak ada bottleneck signifikan. Semua metrik operasional berada di level optimal.',
      optimization_action: 'Fokus pada scaling — tingkatkan volume leads melalui ekspansi channel akuisisi sambil pertahankan kualitas respons.',
    };
  }

  if (health >= 61) {
    const bottleneck = responseScore < conversionScore
      ? 'Waktu respons agen masih bisa dioptimalkan — leads berpotensi dingin sebelum ditanggapi.'
      : 'Conversion rate belum maksimal — leads yang masuk belum terkonversi secara optimal menjadi transaksi.';
    const action = responseScore < conversionScore
      ? 'Implementasikan auto-reply WhatsApp dan notifikasi push real-time untuk memangkas waktu respons di bawah 10 menit.'
      : 'Terapkan lead nurturing otomatis dengan follow-up terjadwal dan konten properti yang dipersonalisasi.';
    return { lead_flow_stage: 'EFFICIENT', health_score: health, bottleneck_issue: bottleneck, optimization_action: action };
  }

  if (health >= 41) {
    const weakest = Math.min(volumeScore, responseScore, conversionScore);
    let bottleneck: string, action: string;
    if (weakest === volumeScore) {
      bottleneck = 'Volume leads terlalu rendah — pipeline akuisisi tidak menghasilkan cukup prospek untuk operasional yang sehat.';
      action = 'Tingkatkan investasi di SEO properti, iklan berbayar tertarget, dan program referral agen untuk mendongkrak volume leads.';
    } else if (weakest === responseScore) {
      bottleneck = 'Waktu respons terlalu lambat — banyak leads kehilangan minat sebelum dihubungi oleh agen.';
      action = 'Aktifkan sistem auto-assignment dengan SLA ketat dan eskalasi otomatis jika agen tidak merespons dalam 15 menit.';
    } else {
      bottleneck = 'Conversion rate sangat rendah — leads masuk tapi tidak berhasil dikonversi menjadi deal.';
      action = 'Audit kualitas leads dan terapkan AI lead scoring untuk memfilter prospek berkualitas tinggi sebelum distribusi ke agen.';
    }
    return { lead_flow_stage: 'NEEDS_IMPROVEMENT', health_score: health, bottleneck_issue: bottleneck, optimization_action: action };
  }

  return {
    lead_flow_stage: 'CRITICAL',
    health_score: health,
    bottleneck_issue: 'Sistem distribusi leads dalam kondisi kritis — volume rendah, respons lambat, dan konversi minimal secara bersamaan.',
    optimization_action: 'Lakukan audit menyeluruh: validasi channel akuisisi, reset SLA agen dengan enforcement otomatis, dan aktifkan AI-powered lead qualification untuk memastikan hanya leads siap-transaksi yang didistribusikan.',
  };
}
