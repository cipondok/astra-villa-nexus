export interface PipelineInput {
  review_count: number;
  visits: number;
  offers: number;
  closed: number;
}

export type PipelineHealth =
  | "EXCELLENT FLOW"
  | "HEALTHY PIPELINE"
  | "SLUGGISH PIPELINE"
  | "CRITICAL PIPELINE";

export type BottleneckStage =
  | "REVIEW → VISIT"
  | "VISIT → OFFER"
  | "OFFER → CLOSING"
  | "TOP OF FUNNEL"
  | "NO BOTTLENECK";

export interface PipelineResult {
  pipeline_health: PipelineHealth;
  bottleneck_stage: BottleneckStage;
  acceleration_strategy: string;
  priority_action: string;
  composite_score: number;
  conversion_rates: { review_to_visit: number; visit_to_offer: number; offer_to_close: number };
}

const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);

/**
 * Analyzes investor deal pipeline health and identifies bottlenecks.
 *
 * Conversion benchmarks (Indonesian real estate):
 *   Review → Visit: 40-60%
 *   Visit → Offer:  30-50%
 *   Offer → Close:  25-40%
 *
 * Composite = volume_score * 0.25 + flow_score * 0.45 + close_rate * 0.30
 */
export function analyzePipeline(input: PipelineInput): PipelineResult {
  const { review_count, visits, offers, closed } = input;

  const r2v = pct(visits, review_count);
  const v2o = pct(offers, visits);
  const o2c = pct(closed, offers);

  // --- Volume score (log-scaled, max at ~20 reviews) ---
  const volumeScore = Math.min(100, Math.round(Math.log2(Math.max(1, review_count) + 1) * 22));

  // --- Flow score (avg conversion health) ---
  const r2vHealth = Math.min(100, Math.round(r2v * 2));        // 50% → 100
  const v2oHealth = Math.min(100, Math.round(v2o * 2.5));      // 40% → 100
  const o2cHealth = Math.min(100, Math.round(o2c * 3));        // 33% → 100
  const flowScore = Math.round((r2vHealth + v2oHealth + o2cHealth) / 3);

  // --- Close rate score ---
  const totalCloseRate = pct(closed, review_count);
  const closeScore = Math.min(100, totalCloseRate * 5);         // 20% end-to-end → 100

  const composite = Math.round(volumeScore * 0.25 + flowScore * 0.45 + closeScore * 0.30);

  // --- Health classification ---
  let pipeline_health: PipelineHealth;
  if (composite >= 75) pipeline_health = "EXCELLENT FLOW";
  else if (composite >= 50) pipeline_health = "HEALTHY PIPELINE";
  else if (composite >= 30) pipeline_health = "SLUGGISH PIPELINE";
  else pipeline_health = "CRITICAL PIPELINE";

  // --- Bottleneck detection ---
  let bottleneck_stage: BottleneckStage;
  let acceleration_strategy: string;
  let priority_action: string;

  if (review_count === 0) {
    bottleneck_stage = "TOP OF FUNNEL";
    acceleration_strategy = "Perluas jangkauan akuisisi investor — aktifkan kampanye digital, referral program, dan partnership dengan agen properti untuk mengisi pipeline.";
    priority_action = "Luncurkan kampanye lead generation dengan target minimal 10 deal review dalam 2 minggu ke depan.";
  } else if (r2v < 40 && r2v <= v2o && r2v <= o2c) {
    bottleneck_stage = "REVIEW → VISIT";
    acceleration_strategy = "Konversi review ke site visit rendah. Tingkatkan kualitas presentasi deal — gunakan virtual tour, market data snapshot, dan follow-up dalam 24 jam setelah review.";
    priority_action = "Hubungi semua investor yang sedang review dalam 48 jam — tawarkan exclusive site visit dengan insentif early-bird.";
  } else if (v2o < 30 && v2o <= o2c) {
    bottleneck_stage = "VISIT → OFFER";
    acceleration_strategy = "Investor visit tapi tidak submit offer. Diagnosa: apakah pricing tidak kompetitif, lokasi kurang meyakinkan, atau proses offer terlalu rumit? Sederhanakan submission dan berikan comparative market analysis.";
    priority_action = "Kirim personalized deal summary + ROI projection ke semua investor post-visit yang belum submit offer.";
  } else if (o2c < 25) {
    bottleneck_stage = "OFFER → CLOSING";
    acceleration_strategy = "Offer masuk tapi closing gagal. Evaluasi: negosiasi harga, kendala pembiayaan, atau proses legal lambat. Percepat due diligence dan tawarkan financing facilitation.";
    priority_action = "Review semua offer pending — identifikasi deal yang bisa di-close minggu ini dengan concession kecil atau financing assist.";
  } else {
    bottleneck_stage = "NO BOTTLENECK";
    acceleration_strategy = "Pipeline berjalan sehat di semua stage. Fokus pada scaling volume — tambah deal flow masuk sambil pertahankan conversion rate.";
    priority_action = "Scale up: tambah 20% deal review baru sambil maintain quality filtering untuk menjaga conversion rate.";
  }

  return {
    pipeline_health,
    bottleneck_stage,
    acceleration_strategy,
    priority_action,
    composite_score: composite,
    conversion_rates: { review_to_visit: r2v, visit_to_offer: v2o, offer_to_close: o2c },
  };
}
