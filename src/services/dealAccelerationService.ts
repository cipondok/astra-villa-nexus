/**
 * AI Deal Flow Acceleration Service
 * Increases transaction velocity through intelligent signal detection.
 */

export interface DealMomentum {
  totalActiveDeals: number;
  avgDaysToClose: number;
  conversionRate: number;
  urgencyIndex: number; // 0-100
  buyerIntentScore: number; // 0-100
  accelerationRecommendations: string[];
}

export interface DealSignal {
  type: 'intent' | 'urgency' | 'negotiation' | 'follow_up' | 'closing';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Buyer Intent Score:
 * Views (15%) + Saves (20%) + Inquiries (25%) + Viewings (25%) + Return Visits (15%)
 */
export function computeBuyerIntentScore(
  propertyViews: number,
  saves: number,
  inquiries: number,
  viewingRequests: number,
  returnVisits: number
): number {
  const viewScore = Math.min(propertyViews / 20, 1) * 100;
  const saveScore = Math.min(saves / 5, 1) * 100;
  const inquiryScore = Math.min(inquiries / 3, 1) * 100;
  const viewingScore = Math.min(viewingRequests / 2, 1) * 100;
  const returnScore = Math.min(returnVisits / 5, 1) * 100;

  return Math.round(
    viewScore * 0.15 +
    saveScore * 0.20 +
    inquiryScore * 0.25 +
    viewingScore * 0.25 +
    returnScore * 0.15
  );
}

/**
 * Deal Urgency Index:
 * Days on market (30%) + Competitor interest (25%) + Price movement (25%) + Seller motivation (20%)
 */
export function computeUrgencyIndex(
  daysOnMarket: number,
  competitorInquiries: number,
  priceReductionPct: number,
  sellerMotivationScore: number
): number {
  const domUrgency = daysOnMarket > 90 ? 30 : daysOnMarket > 60 ? 60 : daysOnMarket > 30 ? 80 : 100;
  const competitorPressure = Math.min(competitorInquiries * 20, 100);
  const priceSignal = Math.min(priceReductionPct * 10, 100);
  const sellerScore = sellerMotivationScore;

  return Math.round(
    domUrgency * 0.30 +
    competitorPressure * 0.25 +
    priceSignal * 0.25 +
    sellerScore * 0.20
  );
}

/**
 * Generate deal acceleration signals from platform-level data.
 */
export function generateDealMomentum(
  totalProperties: number,
  totalValuations: number,
  avgSeoScore: number
): DealMomentum {
  // Estimate deal metrics from available platform data
  const estimatedDeals = Math.max(Math.floor(totalValuations * 0.3), 0);
  const conversionRate = totalProperties > 0
    ? Math.round((estimatedDeals / totalProperties) * 100)
    : 0;
  const avgDaysToClose = estimatedDeals > 0
    ? Math.max(Math.round(45 / Math.max(estimatedDeals * 0.2, 1)), 5)
    : 60;

  const buyerIntentScore = Math.min(
    Math.round(totalProperties * 3 + totalValuations * 5 + avgSeoScore * 0.5),
    100
  );

  const urgencyIndex = Math.min(
    Math.round(conversionRate * 0.4 + buyerIntentScore * 0.3 + (avgSeoScore > 0 ? 30 : 0)),
    100
  );

  const recs: string[] = [];
  if (conversionRate < 15) recs.push('Conversion below 15% — implement automated follow-up sequences.');
  if (avgDaysToClose > 30) recs.push('Deal velocity slow — activate negotiation AI assistant for active deals.');
  if (buyerIntentScore < 40) recs.push('Low buyer intent — improve property presentation and 3D viewer engagement.');
  if (urgencyIndex < 30) recs.push('Low urgency signals — create time-limited offers or featured listings.');
  if (totalProperties < 10) recs.push('Insufficient inventory — prioritize property onboarding for deal flow.');
  if (conversionRate >= 20 && buyerIntentScore >= 60) recs.push('Strong deal flow — focus on premium upselling and referral activation.');
  if (recs.length === 0) recs.push('Deal pipeline healthy — maintain agent engagement and listing quality.');

  return {
    totalActiveDeals: estimatedDeals,
    avgDaysToClose,
    conversionRate,
    urgencyIndex,
    buyerIntentScore,
    accelerationRecommendations: recs,
  };
}

/**
 * Generate contextual deal signals for agent/investor UI.
 */
export function generateDealSignals(momentum: DealMomentum): DealSignal[] {
  const signals: DealSignal[] = [];

  if (momentum.buyerIntentScore >= 70)
    signals.push({ type: 'intent', message: 'High buyer intent detected — prioritize personal outreach.', priority: 'high' });
  if (momentum.urgencyIndex >= 60)
    signals.push({ type: 'urgency', message: 'Market urgency elevated — accelerate closing timelines.', priority: 'high' });
  if (momentum.conversionRate < 10)
    signals.push({ type: 'follow_up', message: 'Low conversion — activate automated follow-up sequences.', priority: 'medium' });
  if (momentum.avgDaysToClose > 30)
    signals.push({ type: 'negotiation', message: 'Deals aging — deploy negotiation AI for stale inquiries.', priority: 'medium' });
  if (momentum.totalActiveDeals > 5 && momentum.conversionRate > 15)
    signals.push({ type: 'closing', message: 'Active pipeline strong — focus on escrow conversion.', priority: 'high' });

  if (signals.length === 0)
    signals.push({ type: 'follow_up', message: 'Pipeline stable — maintain regular engagement cadence.', priority: 'low' });

  return signals;
}
