/**
 * Market Dominance Expansion Model
 * Scores geographic markets and plans leadership strategy.
 */

export type DominanceLevel = 'emerging' | 'contender' | 'leader' | 'dominant';

export interface MarketDominanceScore {
  city: string;
  country: string;
  dominanceScore: number; // 0-100
  level: DominanceLevel;
  listingDensity: number; // listings per 1000 luxury units
  investorEngagement: number; // 0-100
  competitiveGap: number; // 0-100 (higher = more advantage)
  supplyScore: number;
  demandScore: number;
  phase: string;
}

export interface MarketDominanceStrategy {
  overallDominance: number;
  currentPhase: string;
  markets: MarketDominanceScore[];
  expansionSequence: string[];
  recommendations: string[];
}

/**
 * Dominance Score:
 * Listing Density (25%) + Investor Engagement (25%) + Competitive Gap (20%)
 * + Deal Velocity (15%) + Brand Recognition (15%)
 */
function scoreDominance(
  listingDensity: number,
  investorEngagement: number,
  competitiveGap: number,
  dealVelocity: number,
  brandRecognition: number
): number {
  return Math.round(
    Math.min(listingDensity, 100) * 0.25 +
    Math.min(investorEngagement, 100) * 0.25 +
    Math.min(competitiveGap, 100) * 0.20 +
    Math.min(dealVelocity, 100) * 0.15 +
    Math.min(brandRecognition, 100) * 0.15
  );
}

function classifyLevel(score: number): DominanceLevel {
  if (score >= 75) return 'dominant';
  if (score >= 50) return 'leader';
  if (score >= 25) return 'contender';
  return 'emerging';
}

/**
 * Compute market dominance strategy from platform data.
 */
export function computeMarketDominance(
  totalProperties: number,
  totalInquiries: number,
  avgDealVelocityDays: number
): MarketDominanceStrategy {
  const baseListingDensity = Math.min((totalProperties / 50) * 100, 100);
  const baseEngagement = Math.min((totalInquiries / 30) * 100, 100);
  const baseDealVelocity = avgDealVelocityDays > 0 ? Math.min((30 / avgDealVelocityDays) * 60, 100) : 10;

  const markets: MarketDominanceScore[] = [
    {
      city: 'Bali', country: 'Indonesia',
      dominanceScore: scoreDominance(baseListingDensity * 1.0, baseEngagement * 0.9, 70, baseDealVelocity, 60),
      level: 'emerging', listingDensity: baseListingDensity, investorEngagement: baseEngagement * 0.9,
      competitiveGap: 70, supplyScore: Math.round(baseListingDensity * 0.8), demandScore: Math.round(baseEngagement * 0.9),
      phase: 'Phase 1: Flagship Dominance',
    },
    {
      city: 'Jakarta', country: 'Indonesia',
      dominanceScore: scoreDominance(baseListingDensity * 0.4, baseEngagement * 0.5, 50, baseDealVelocity * 0.6, 30),
      level: 'emerging', listingDensity: baseListingDensity * 0.4, investorEngagement: baseEngagement * 0.5,
      competitiveGap: 50, supplyScore: Math.round(baseListingDensity * 0.3), demandScore: Math.round(baseEngagement * 0.5),
      phase: 'Phase 1: Flagship Dominance',
    },
    {
      city: 'Singapore', country: 'Singapore',
      dominanceScore: scoreDominance(baseListingDensity * 0.1, baseEngagement * 0.3, 25, baseDealVelocity * 0.3, 10),
      level: 'emerging', listingDensity: baseListingDensity * 0.1, investorEngagement: baseEngagement * 0.3,
      competitiveGap: 25, supplyScore: Math.round(baseListingDensity * 0.05), demandScore: Math.round(baseEngagement * 0.3),
      phase: 'Phase 2: Regional Network',
    },
    {
      city: 'Dubai', country: 'UAE',
      dominanceScore: scoreDominance(baseListingDensity * 0.05, baseEngagement * 0.2, 20, baseDealVelocity * 0.2, 5),
      level: 'emerging', listingDensity: baseListingDensity * 0.05, investorEngagement: baseEngagement * 0.2,
      competitiveGap: 20, supplyScore: Math.round(baseListingDensity * 0.02), demandScore: Math.round(baseEngagement * 0.2),
      phase: 'Phase 3: Cross-Border',
    },
    {
      city: 'Phuket', country: 'Thailand',
      dominanceScore: scoreDominance(baseListingDensity * 0.08, baseEngagement * 0.15, 60, baseDealVelocity * 0.3, 8),
      level: 'emerging', listingDensity: baseListingDensity * 0.08, investorEngagement: baseEngagement * 0.15,
      competitiveGap: 60, supplyScore: Math.round(baseListingDensity * 0.05), demandScore: Math.round(baseEngagement * 0.15),
      phase: 'Phase 2: Regional Network',
    },
  ].map(m => ({ ...m, level: classifyLevel(m.dominanceScore) }));

  const overallDominance = Math.round(markets.reduce((s, m) => s + m.dominanceScore, 0) / markets.length);

  let currentPhase = 'Phase 1: Flagship City Dominance';
  if (overallDominance >= 60) currentPhase = 'Phase 3: Cross-Border Marketplace';
  else if (overallDominance >= 35) currentPhase = 'Phase 2: Regional Network Buildout';

  const expansionSequence = [
    'Achieve 60%+ dominance in Bali luxury market',
    'Establish Jakarta as secondary high-volume market',
    'Launch Singapore investor-sourcing node (demand-side only)',
    'Expand to Phuket and Thai resort markets',
    'Enter Dubai luxury segment via partnership network',
    'Scale platform-driven market standardization across SEA',
  ];

  const recommendations: string[] = [];
  const topMarket = markets[0];
  if (topMarket.dominanceScore < 40) recommendations.push(`Priority: Achieve contender status in ${topMarket.city} — increase listing density.`);
  if (topMarket.investorEngagement < 50) recommendations.push('Investor engagement below threshold — activate acquisition campaigns.');
  if (topMarket.competitiveGap > 50 && topMarket.dominanceScore < 50) recommendations.push('Competitive gap favorable — accelerate market capture before competitors close gap.');
  if (overallDominance < 25) recommendations.push('Overall dominance low — consolidate single market before expansion.');
  if (overallDominance >= 40) recommendations.push('Ready for regional expansion — begin Phase 2 partner sourcing.');
  if (recommendations.length === 0) recommendations.push('Market position strong — execute expansion playbook.');

  return { overallDominance, currentPhase, markets, expansionSequence, recommendations };
}
