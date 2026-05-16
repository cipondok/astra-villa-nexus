/**
 * Deal Pipeline Risk Detection Engine
 *
 * Composite Risk Score (0-100):
 *   stage_inactivity     × 0.25
 *   negotiation_gap      × 0.20
 *   engagement_decline   × 0.20
 *   documentation_delay  × 0.15
 *   cancellation_pattern × 0.10
 *   financing_risk       × 0.10
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DealStage = 'inquiry' | 'viewing' | 'offer' | 'negotiation' | 'payment' | 'legal' | 'closing';
export type InterventionUrgency = 'monitor' | 'nudge' | 'escalate' | 'rescue';

export interface DealRiskInput {
  deal_value: number;
  current_stage: DealStage;
  days_in_current_stage: number;
  total_days_in_pipeline: number;
  viewing_cancellations: number;
  viewings_completed: number;
  ask_price: number;
  latest_offer: number;
  buyer_messages_7d: number;
  buyer_messages_prev_7d: number;
  docs_submitted: number;
  docs_required: number;
  financing_preapproved: boolean;
  financing_applied: boolean;
  is_high_value: boolean; // > Rp 5B
}

export interface DealRiskOutput {
  risk_score: number;
  risk_level: RiskLevel;
  failure_causes: string[];
  interventions: string[];
  intervention_urgency: InterventionUrgency;
  estimated_delay_days: number;
  liquidity_impact: string;
  signal_breakdown: {
    stage_inactivity: number;
    negotiation_gap: number;
    engagement_decline: number;
    documentation_delay: number;
    cancellation_pattern: number;
    financing_risk: number;
  };
}

/* ── Stage SLA (max expected days) ── */
const STAGE_SLA: Record<DealStage, number> = {
  inquiry: 3,
  viewing: 7,
  offer: 5,
  negotiation: 14,
  payment: 7,
  legal: 21,
  closing: 7,
};

/* ── Signal scorers (each 0-100, higher = MORE risk) ── */

export function scoreStageInactivity(stage: DealStage, daysInStage: number): number {
  const sla = STAGE_SLA[stage];
  const ratio = daysInStage / sla;
  if (ratio <= 1) return Math.round(ratio * 20);
  if (ratio <= 2) return Math.round(20 + (ratio - 1) * 40);
  return Math.min(100, Math.round(60 + (ratio - 2) * 30));
}

export function scoreNegotiationGap(askPrice: number, latestOffer: number): number {
  if (askPrice <= 0 || latestOffer <= 0) return 30;
  const gapPct = ((askPrice - latestOffer) / askPrice) * 100;
  if (gapPct <= 3) return 5;
  if (gapPct <= 8) return 25;
  if (gapPct <= 15) return 55;
  if (gapPct <= 25) return 80;
  return 100;
}

export function scoreEngagementDecline(msgs7d: number, msgsPrev7d: number): number {
  if (msgsPrev7d === 0 && msgs7d === 0) return 70;
  if (msgsPrev7d === 0) return 10;
  const changeRate = (msgs7d - msgsPrev7d) / msgsPrev7d;
  if (changeRate >= 0) return Math.max(0, 15 - changeRate * 10);
  return Math.min(100, Math.round(Math.abs(changeRate) * 100));
}

export function scoreDocumentationDelay(submitted: number, required: number): number {
  if (required <= 0) return 0;
  const ratio = submitted / required;
  if (ratio >= 1) return 0;
  if (ratio >= 0.75) return 20;
  if (ratio >= 0.5) return 45;
  if (ratio >= 0.25) return 70;
  return 95;
}

export function scoreCancellationPattern(cancellations: number, completed: number): number {
  const total = cancellations + completed;
  if (total === 0) return 30;
  const rate = cancellations / total;
  return Math.min(100, Math.round(rate * 120));
}

export function scoreFinancingRisk(preapproved: boolean, applied: boolean, stage: DealStage): number {
  const lateStages: DealStage[] = ['payment', 'legal', 'closing'];
  if (preapproved) return 0;
  if (applied && !lateStages.includes(stage)) return 25;
  if (applied && lateStages.includes(stage)) return 55;
  if (!applied && lateStages.includes(stage)) return 95;
  return 40;
}

/* ── Classifier helpers ── */

function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'CRITICAL';
  if (score >= 55) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

function classifyUrgency(level: RiskLevel, isHighValue: boolean): InterventionUrgency {
  if (level === 'CRITICAL') return 'rescue';
  if (level === 'HIGH') return isHighValue ? 'rescue' : 'escalate';
  if (level === 'MEDIUM') return 'nudge';
  return 'monitor';
}

function estimateDelay(score: number, stage: DealStage): number {
  const baseSla = STAGE_SLA[stage];
  if (score < 35) return 0;
  if (score < 55) return Math.round(baseSla * 0.5);
  if (score < 75) return Math.round(baseSla * 1.2);
  return Math.round(baseSla * 2.5);
}

/* ── Main detector ── */

export function detectDealRisk(input: DealRiskInput): DealRiskOutput {
  const stageInactivity = scoreStageInactivity(input.current_stage, input.days_in_current_stage);
  const negotiationGap = scoreNegotiationGap(input.ask_price, input.latest_offer);
  const engagementDecline = scoreEngagementDecline(input.buyer_messages_7d, input.buyer_messages_prev_7d);
  const documentationDelay = scoreDocumentationDelay(input.docs_submitted, input.docs_required);
  const cancellationPattern = scoreCancellationPattern(input.viewing_cancellations, input.viewings_completed);
  const financingRisk = scoreFinancingRisk(input.financing_preapproved, input.financing_applied, input.current_stage);

  const composite = Math.round(
    stageInactivity * 0.25 +
    negotiationGap * 0.20 +
    engagementDecline * 0.20 +
    documentationDelay * 0.15 +
    cancellationPattern * 0.10 +
    financingRisk * 0.10
  );

  const riskLevel = classifyRiskLevel(composite);
  const urgency = classifyUrgency(riskLevel, input.is_high_value);
  const delayDays = estimateDelay(composite, input.current_stage);

  // Failure cause analysis
  const causes: string[] = [];
  const interventions: string[] = [];
  const sorted = [
    { key: 'stage_inactivity', score: stageInactivity },
    { key: 'negotiation_gap', score: negotiationGap },
    { key: 'engagement_decline', score: engagementDecline },
    { key: 'documentation_delay', score: documentationDelay },
    { key: 'cancellation_pattern', score: cancellationPattern },
    { key: 'financing_risk', score: financingRisk },
  ].sort((a, b) => b.score - a.score);

  for (const s of sorted) {
    if (s.score < 40) continue;
    switch (s.key) {
      case 'stage_inactivity':
        causes.push(`Deal stagnan di tahap ${input.current_stage} selama ${input.days_in_current_stage} hari (SLA: ${STAGE_SLA[input.current_stage]}d)`);
        interventions.push('Kirim follow-up WhatsApp ke buyer dan agent — tanyakan blocker dan tawarkan bantuan');
        break;
      case 'negotiation_gap':
        const gapPct = Math.round(((input.ask_price - input.latest_offer) / input.ask_price) * 100);
        causes.push(`Gap negosiasi ${gapPct}% antara asking (${fmt(input.ask_price)}) dan offer (${fmt(input.latest_offer)})`);
        interventions.push('Sajikan data komparasi harga pasar ke kedua pihak — bantu bridge the gap dengan data FMV');
        break;
      case 'engagement_decline':
        causes.push('Penurunan signifikan aktivitas komunikasi buyer dalam 7 hari terakhir');
        interventions.push('Trigger re-engagement: kirim update properti baru, market insight, atau exclusive deal alert');
        break;
      case 'documentation_delay':
        causes.push(`Dokumen belum lengkap: ${input.docs_submitted}/${input.docs_required} submitted`);
        interventions.push('Hubungi buyer untuk klarifikasi dokumen yang missing — tawarkan bantuan koordinasi notaris');
        break;
      case 'cancellation_pattern':
        causes.push(`${input.viewing_cancellations} viewing dibatalkan dari ${input.viewing_cancellations + input.viewings_completed} total jadwal`);
        interventions.push('Offer virtual tour sebagai alternatif — atau reschedule dengan konfirmasi H-1');
        break;
      case 'financing_risk':
        causes.push(input.financing_applied ? 'KPR sudah diajukan tapi belum approved — risiko penolakan' : 'Buyer belum mengajukan pembiayaan di tahap lanjut');
        interventions.push('Koordinasi dengan bank partner untuk fast-track review — atau tawarkan opsi pembiayaan alternatif');
        break;
    }
  }

  if (causes.length === 0) {
    causes.push('Tidak ada sinyal risiko signifikan terdeteksi');
    interventions.push('Lanjutkan monitoring standar — deal berjalan sesuai timeline');
  }

  // Liquidity impact
  let liquidityImpact: string;
  if (composite >= 75) liquidityImpact = 'Dampak tinggi — deal berisiko gagal, properti kembali ke pasar dan menurunkan liquidity score area';
  else if (composite >= 55) liquidityImpact = 'Dampak moderat — delay signifikan yang memperlambat velocity transaksi district';
  else if (composite >= 35) liquidityImpact = 'Dampak rendah — minor delay tapi masih dalam toleransi pipeline normal';
  else liquidityImpact = 'Minimal — deal on track, kontribusi positif ke liquidity momentum';

  return {
    risk_score: composite,
    risk_level: riskLevel,
    failure_causes: causes,
    interventions,
    intervention_urgency: urgency,
    estimated_delay_days: delayDays,
    liquidity_impact: liquidityImpact,
    signal_breakdown: {
      stage_inactivity: stageInactivity,
      negotiation_gap: negotiationGap,
      engagement_decline: engagementDecline,
      documentation_delay: documentationDelay,
      cancellation_pattern: cancellationPattern,
      financing_risk: financingRisk,
    },
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
