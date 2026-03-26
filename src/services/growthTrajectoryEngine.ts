/**
 * Growth Trajectory Engine
 * Tracks startup momentum using measurable platform indicators.
 */

export type GrowthStage = 'early_traction' | 'acceleration' | 'expansion' | 'dominance';

export interface GrowthMetrics {
  monthlyActiveListings: number;
  qualifiedInquiries: number;
  dealConversionVelocityDays: number;
  avgEngagementMinutes: number;
  revenuePerListing: number;
  geographicExpansionIndex: number; // 0-100
}

export interface GrowthTrajectory {
  score: number; // 0-100
  stage: GrowthStage;
  stageLabel: string;
  momentum: 'accelerating' | 'steady' | 'slowing' | 'stalled';
  metrics: GrowthMetrics;
  projections: { metric: string; current: string; target30d: string }[];
  recommendations: string[];
}

function classifyStage(score: number): { stage: GrowthStage; label: string } {
  if (score >= 75) return { stage: 'dominance', label: 'Market Dominance' };
  if (score >= 50) return { stage: 'expansion', label: 'Active Expansion' };
  if (score >= 25) return { stage: 'acceleration', label: 'Acceleration' };
  return { stage: 'early_traction', label: 'Early Traction' };
}

function classifyMomentum(score: number, prevScore?: number): GrowthTrajectory['momentum'] {
  if (!prevScore) return score > 30 ? 'steady' : 'stalled';
  const delta = score - prevScore;
  if (delta > 5) return 'accelerating';
  if (delta > -2) return 'steady';
  if (delta > -10) return 'slowing';
  return 'stalled';
}

/**
 * Weighted growth score:
 *   Listings (20%) + Inquiries (20%) + Deal Velocity (20%)
 *   + Engagement (15%) + Revenue/Listing (15%) + Geo Expansion (10%)
 */
export function computeGrowthScore(m: GrowthMetrics): number {
  const listingScore = Math.min((m.monthlyActiveListings / 100) * 100, 100);
  const inquiryScore = Math.min((m.qualifiedInquiries / 50) * 100, 100);
  const velocityScore = m.dealConversionVelocityDays > 0
    ? Math.min((30 / m.dealConversionVelocityDays) * 50, 100)
    : 0;
  const engagementScore = Math.min((m.avgEngagementMinutes / 5) * 100, 100);
  const revenueScore = Math.min((m.revenuePerListing / 10000) * 100, 100);
  const geoScore = m.geographicExpansionIndex;

  return Math.round(
    listingScore * 0.20 +
    inquiryScore * 0.20 +
    velocityScore * 0.20 +
    engagementScore * 0.15 +
    revenueScore * 0.15 +
    geoScore * 0.10
  );
}

export function computeGrowthTrajectory(
  m: GrowthMetrics,
  prevScore?: number
): GrowthTrajectory {
  const score = computeGrowthScore(m);
  const { stage, label } = classifyStage(score);
  const momentum = classifyMomentum(score, prevScore);

  const projections = [
    { metric: 'Active Listings', current: String(m.monthlyActiveListings), target30d: String(Math.ceil(m.monthlyActiveListings * 1.15)) },
    { metric: 'Inquiries', current: String(m.qualifiedInquiries), target30d: String(Math.ceil(m.qualifiedInquiries * 1.2)) },
    { metric: 'Deal Velocity', current: `${m.dealConversionVelocityDays}d`, target30d: `${Math.max(Math.floor(m.dealConversionVelocityDays * 0.85), 1)}d` },
    { metric: 'Geo Index', current: `${m.geographicExpansionIndex}%`, target30d: `${Math.min(m.geographicExpansionIndex + 5, 100)}%` },
  ];

  const recommendations: string[] = [];
  if (m.monthlyActiveListings < 20) recommendations.push('Priority: Accelerate property onboarding — target 20+ active listings.');
  if (m.qualifiedInquiries < 10) recommendations.push('Drive investor acquisition campaigns — below 10 qualified inquiries.');
  if (m.dealConversionVelocityDays > 21) recommendations.push('Deal velocity slow — streamline escrow and document workflows.');
  if (m.avgEngagementMinutes < 2) recommendations.push('Improve property presentation — engagement below 2 minutes.');
  if (m.geographicExpansionIndex < 15) recommendations.push('Geographic concentration risk — explore secondary markets.');
  if (momentum === 'stalled') recommendations.push('CRITICAL: Growth stalled — reassess acquisition channels and product-market fit.');
  if (recommendations.length === 0) recommendations.push('Strong growth trajectory — maintain execution velocity.');

  return { score, stage, stageLabel: label, momentum, metrics: m, projections, recommendations };
}

// ── Global Expansion Readiness ──

export interface RegionReadiness {
  region: string;
  readinessScore: number;
  investorDensity: 'high' | 'medium' | 'low';
  regulatoryStatus: 'clear' | 'complex' | 'restricted';
  partnerNetworkReady: boolean;
  priority: 'primary' | 'secondary' | 'future';
  phase: string;
}

export interface ExpansionStrategy {
  overallReadiness: number;
  currentPhase: string;
  regions: RegionReadiness[];
  capitalInflowForecast: string;
  recommendations: string[];
}

export function computeExpansionStrategy(
  totalProperties: number,
  totalValuations: number,
  scalingReadiness: number
): ExpansionStrategy {
  const regions: RegionReadiness[] = [
    { region: 'Bali, Indonesia', readinessScore: 85, investorDensity: 'high', regulatoryStatus: 'clear', partnerNetworkReady: true, priority: 'primary', phase: 'Phase 1: City Dominance' },
    { region: 'Jakarta, Indonesia', readinessScore: 60, investorDensity: 'high', regulatoryStatus: 'clear', partnerNetworkReady: false, priority: 'primary', phase: 'Phase 1: City Dominance' },
    { region: 'Singapore', readinessScore: 40, investorDensity: 'high', regulatoryStatus: 'complex', partnerNetworkReady: false, priority: 'secondary', phase: 'Phase 2: Regional Network' },
    { region: 'Bangkok, Thailand', readinessScore: 30, investorDensity: 'medium', regulatoryStatus: 'clear', partnerNetworkReady: false, priority: 'secondary', phase: 'Phase 2: Regional Network' },
    { region: 'Dubai, UAE', readinessScore: 20, investorDensity: 'high', regulatoryStatus: 'complex', partnerNetworkReady: false, priority: 'future', phase: 'Phase 3: Cross-Border' },
    { region: 'London, UK', readinessScore: 10, investorDensity: 'high', regulatoryStatus: 'complex', partnerNetworkReady: false, priority: 'future', phase: 'Phase 4: Global Network' },
  ];

  const overallReadiness = Math.round(
    (scalingReadiness * 0.4) +
    (Math.min(totalProperties / 50, 1) * 30) +
    (Math.min(totalValuations / 20, 1) * 30)
  );

  let currentPhase = 'Phase 1: City Dominance';
  if (overallReadiness >= 70) currentPhase = 'Phase 3: Cross-Border Marketplace';
  else if (overallReadiness >= 45) currentPhase = 'Phase 2: Regional Network';

  const capitalInflowForecast = overallReadiness >= 50
    ? '$1M-5M within 12 months'
    : overallReadiness >= 25
    ? '$250K-1M within 18 months'
    : 'Pre-revenue — focus on product-market fit';

  const recommendations: string[] = [];
  if (overallReadiness < 30) recommendations.push('Consolidate primary market before expanding.');
  if (totalProperties < 50) recommendations.push('Scale property inventory to 50+ before regional expansion.');
  if (scalingReadiness < 50) recommendations.push('Infrastructure scaling readiness below 50% — resolve before multi-region.');
  if (overallReadiness >= 40) recommendations.push('Begin partnership outreach in secondary markets.');
  if (recommendations.length === 0) recommendations.push('Expansion readiness strong — execute regional network strategy.');

  return { overallReadiness, currentPhase, regions, capitalInflowForecast, recommendations };
}
