/**
 * Global Capital Network Intelligence Service
 * Identifies capital flow opportunities and coordinates investor engagement across regions.
 */

export type CapitalReadiness = 'dormant' | 'warming' | 'active' | 'surging';
export type TimingVerdict = 'wait' | 'prepare' | 'execute' | 'accelerate';

// ── Capital Flow Intelligence ──

export interface RegionalCapitalSignal {
  region: string;
  country: string;
  liquidityDensity: number; // 0-100
  capitalReadiness: CapitalReadiness;
  investorDensityScore: number; // 0-100
  crossBorderFlowIndex: number; // 0-100
  institutionalInterest: number; // 0-100
  opportunityClusters: number;
  priority: 'primary' | 'secondary' | 'emerging';
}

export interface CapitalNetworkSnapshot {
  globalLiquidityIndex: number; // 0-100
  totalActivatedCapital: string;
  topRegions: RegionalCapitalSignal[];
  partnershipPriorities: string[];
  recommendations: string[];
}

/**
 * Regional Liquidity Density:
 * Investor Count (25%) + Transaction Volume (25%) + Capital Inflow (20%)
 * + Cross-Border Activity (15%) + Institutional Presence (15%)
 */
export function computeRegionalCapitalSignals(
  totalProperties: number,
  totalValuations: number
): CapitalNetworkSnapshot {
  const platformScale = Math.min((totalProperties + totalValuations) / 50, 1);

  const regions: RegionalCapitalSignal[] = [
    { region: 'Bali', country: 'Indonesia', liquidityDensity: Math.round(65 * platformScale + 15), capitalReadiness: 'active' as CapitalReadiness, investorDensityScore: Math.round(70 * platformScale + 10), crossBorderFlowIndex: Math.round(55 * platformScale + 15), institutionalInterest: Math.round(30 * platformScale + 5), opportunityClusters: Math.max(Math.round(totalProperties * 0.4), 1), priority: 'primary' as const },
    { region: 'Jakarta', country: 'Indonesia', liquidityDensity: Math.round(50 * platformScale + 10), capitalReadiness: 'warming' as CapitalReadiness, investorDensityScore: Math.round(60 * platformScale + 5), crossBorderFlowIndex: Math.round(30 * platformScale + 5), institutionalInterest: Math.round(40 * platformScale + 5), opportunityClusters: Math.max(Math.round(totalProperties * 0.2), 1), priority: 'primary' as const },
    { region: 'Singapore', country: 'Singapore', liquidityDensity: Math.round(35 * platformScale + 5), capitalReadiness: 'warming' as CapitalReadiness, investorDensityScore: Math.round(80 * platformScale), crossBorderFlowIndex: Math.round(70 * platformScale), institutionalInterest: Math.round(65 * platformScale), opportunityClusters: Math.max(Math.round(totalProperties * 0.05), 0), priority: 'secondary' as const },
    { region: 'Dubai', country: 'UAE', liquidityDensity: Math.round(20 * platformScale + 3), capitalReadiness: 'dormant' as CapitalReadiness, investorDensityScore: Math.round(75 * platformScale), crossBorderFlowIndex: Math.round(60 * platformScale), institutionalInterest: Math.round(50 * platformScale), opportunityClusters: 0, priority: 'emerging' as const },
    { region: 'Bangkok', country: 'Thailand', liquidityDensity: Math.round(25 * platformScale + 5), capitalReadiness: 'dormant' as CapitalReadiness, investorDensityScore: Math.round(40 * platformScale + 5), crossBorderFlowIndex: Math.round(35 * platformScale), institutionalInterest: Math.round(20 * platformScale), opportunityClusters: 0, priority: 'emerging' as const },
  ].map(r => ({
    ...r,
    capitalReadiness: r.liquidityDensity >= 60 ? 'surging' as const : r.liquidityDensity >= 40 ? 'active' as const : r.liquidityDensity >= 20 ? 'warming' as const : 'dormant' as const,
  }));

  const globalLiquidityIndex = Math.round(regions.reduce((s, r) => s + r.liquidityDensity, 0) / regions.length);
  const totalActivatedCapital = globalLiquidityIndex >= 50 ? '$2M-10M pipeline' : globalLiquidityIndex >= 25 ? '$500K-2M pipeline' : 'Pre-pipeline';

  const partnershipPriorities: string[] = [];
  if (regions[0].liquidityDensity > 40) partnershipPriorities.push('Strengthen Bali luxury developer partnerships.');
  if (regions[2].investorDensityScore > 30) partnershipPriorities.push('Establish Singapore HNW investor channel.');
  partnershipPriorities.push('Build cross-border legal and escrow partnerships.');
  if (regions[3].institutionalInterest > 20) partnershipPriorities.push('Explore Dubai family office introductions.');

  const recommendations: string[] = [];
  if (globalLiquidityIndex < 30) recommendations.push('Capital network nascent — focus on primary market depth.');
  if (globalLiquidityIndex >= 30 && globalLiquidityIndex < 50) recommendations.push('Liquidity building — activate investor re-engagement sequences.');
  if (globalLiquidityIndex >= 50) recommendations.push('Strong liquidity — pursue institutional partnership deals.');
  const surgingRegions = regions.filter(r => r.capitalReadiness === 'surging');
  if (surgingRegions.length > 0) recommendations.push(`Capital surging in ${surgingRegions.map(r => r.region).join(', ')} — prioritize deal conversion.`);

  return { globalLiquidityIndex, totalActivatedCapital, topRegions: regions, partnershipPriorities, recommendations };
}

// ── Market Timing Engine ──

export interface TimingSignal {
  dimension: string;
  score: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  insight: string;
}

export interface MarketTimingAssessment {
  overallReadiness: number; // 0-100
  verdict: TimingVerdict;
  signals: TimingSignal[];
  windowsOpen: { action: string; urgency: 'now' | 'soon' | 'later'; rationale: string }[];
  recommendations: string[];
}

/**
 * Timing Readiness:
 * Market Cycle (25%) + Platform Momentum (25%) + Investor Sentiment (20%)
 * + Supply-Demand Balance (15%) + Macro Stability (15%)
 */
export function computeMarketTiming(
  totalProperties: number,
  totalValuations: number,
  healthScore: number,
  jobFailureRate: number
): MarketTimingAssessment {
  const marketCycleScore = Math.min(Math.round(totalProperties * 2 + totalValuations * 3), 100);
  const platformMomentum = Math.min(healthScore, 100);
  const investorSentiment = Math.min(Math.round(totalValuations * 5), 100);
  const supplyDemandBalance = totalProperties > 0 ? Math.min(Math.round((totalValuations / totalProperties) * 50), 100) : 20;
  const macroStability = Math.max(100 - Math.round(jobFailureRate * 200), 30);

  const overallReadiness = Math.round(
    marketCycleScore * 0.25 +
    platformMomentum * 0.25 +
    investorSentiment * 0.20 +
    supplyDemandBalance * 0.15 +
    macroStability * 0.15
  );

  let verdict: TimingVerdict = 'wait';
  if (overallReadiness >= 75) verdict = 'accelerate';
  else if (overallReadiness >= 55) verdict = 'execute';
  else if (overallReadiness >= 35) verdict = 'prepare';

  const signals: TimingSignal[] = [
    { dimension: 'Market Cycle', score: marketCycleScore, trend: marketCycleScore >= 50 ? 'improving' : 'stable', insight: marketCycleScore >= 50 ? 'Listing activity signals expansion phase' : 'Market building — early cycle positioning' },
    { dimension: 'Platform Momentum', score: platformMomentum, trend: platformMomentum >= 65 ? 'improving' : platformMomentum >= 40 ? 'stable' : 'declining', insight: platformMomentum >= 65 ? 'Platform health strong — execute with confidence' : 'Stabilize platform before major launches' },
    { dimension: 'Investor Sentiment', score: investorSentiment, trend: investorSentiment >= 40 ? 'improving' : 'stable', insight: investorSentiment >= 40 ? 'Investor engagement rising — capitalize on momentum' : 'Sentiment nascent — build proof points' },
    { dimension: 'Supply-Demand', score: supplyDemandBalance, trend: supplyDemandBalance >= 50 ? 'improving' : 'stable', insight: supplyDemandBalance >= 50 ? 'Healthy inquiry-to-listing ratio' : 'Demand generation needed' },
    { dimension: 'Macro Stability', score: macroStability, trend: macroStability >= 70 ? 'stable' : 'declining', insight: macroStability >= 70 ? 'System reliability supports aggressive execution' : 'Reduce error rates before scaling' },
  ];

  const windowsOpen: MarketTimingAssessment['windowsOpen'] = [];
  if (overallReadiness >= 55) windowsOpen.push({ action: 'New Market Entry', urgency: 'soon', rationale: 'Timing conditions favorable for secondary market launch' });
  if (platformMomentum >= 65) windowsOpen.push({ action: 'Feature Launch', urgency: 'now', rationale: 'Platform stable — deploy queued features' });
  if (investorSentiment >= 50) windowsOpen.push({ action: 'Investor Campaign', urgency: 'now', rationale: 'Sentiment momentum — scale acquisition spend' });
  if (overallReadiness >= 70) windowsOpen.push({ action: 'Capital Raise', urgency: 'soon', rationale: 'Metrics support fundraising conversations' });
  if (windowsOpen.length === 0) windowsOpen.push({ action: 'Foundation Building', urgency: 'later', rationale: 'Strengthen fundamentals before major moves' });

  const recommendations: string[] = [];
  if (verdict === 'wait') recommendations.push('Timing premature — focus on product-market fit and listing density.');
  if (verdict === 'prepare') recommendations.push('Begin preparations for next growth phase — build partnerships and refine positioning.');
  if (verdict === 'execute') recommendations.push('Execution window open — proceed with planned expansion and campaigns.');
  if (verdict === 'accelerate') recommendations.push('Optimal timing detected — maximize investment in growth and market capture.');

  return { overallReadiness, verdict, signals, windowsOpen, recommendations };
}

// ── Category Leadership Phases ──

export interface LeadershipPhase {
  phase: string;
  title: string;
  description: string;
  progress: number; // 0-100
  milestones: string[];
}

export function computeLeadershipPhases(growthScore: number): LeadershipPhase[] {
  return [
    { phase: 'Phase 1', title: 'Niche Authority', description: 'Luxury segment expertise in primary market', progress: Math.min(growthScore * 4, 100), milestones: ['50+ luxury listings', 'Immersive viewer differentiation', 'First 10 investor conversions'] },
    { phase: 'Phase 2', title: 'Regional Recognition', description: 'Premium market presence across SEA', progress: Math.min(Math.max((growthScore - 25) * 4, 0), 100), milestones: ['3+ active markets', 'Developer partnership network', '100+ qualified investors'] },
    { phase: 'Phase 3', title: 'Global Credibility', description: 'International investor brand trust', progress: Math.min(Math.max((growthScore - 50) * 4, 0), 100), milestones: ['Cross-border transactions', 'Institutional fund integration', 'Industry media recognition'] },
    { phase: 'Phase 4', title: 'Ecosystem Leadership', description: 'Infrastructure platform for luxury proptech', progress: Math.min(Math.max((growthScore - 75) * 4, 0), 100), milestones: ['Partner API platform', 'Digital asset readiness', 'Global multi-region deployment'] },
  ];
}
