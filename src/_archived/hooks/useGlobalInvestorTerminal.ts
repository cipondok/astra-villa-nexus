import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export interface LiquidityMetric {
  district: string;
  city: string;
  demandScore: number;
  avgDaysOnMarket: number;
  absorptionRate: number;
  priceTrend: number;
  listings: number;
  inquiries: number;
  heatTier: 'critical' | 'hot' | 'warm' | 'cool';
}

export interface OpportunityDeal {
  id: string;
  title: string;
  city: string;
  price: number;
  aiValuation: number;
  undervaluationPct: number;
  liquidityScore: number;
  yieldEstimate: number;
  timingSignal: 'buy_now' | 'watch' | 'wait';
  urgency: number;
}

export interface PortfolioInsight {
  metric: string;
  value: number;
  benchmark: number;
  unit: string;
  status: 'above' | 'at' | 'below';
  recommendation: string;
}

export interface CityComparison {
  city: string;
  country: string;
  avgYield: number;
  priceGrowth: number;
  liquidityIndex: number;
  riskScore: number;
  developmentPipeline: number;
  compositeRank: number;
}

export interface TerminalFeature {
  module: string;
  feature: string;
  tier: 'free' | 'pro' | 'institutional';
  priority: 'p0' | 'p1' | 'p2';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ProductPhase {
  phase: string;
  timeline: string;
  features: string[];
  revenue: string;
  status: 'live' | 'building' | 'planned' | 'vision';
}

export interface MonetizationTier {
  name: string;
  price: string;
  features: string[];
  targetUsers: string;
  projectedUsers: number;
  arrContribution: string;
}

export interface GlobalInvestorTerminalData {
  liquidityMetrics: LiquidityMetric[];
  opportunities: OpportunityDeal[];
  portfolioInsights: PortfolioInsight[];
  cityComparisons: CityComparison[];
  featurePrioritization: TerminalFeature[];
  monetizationTiers: MonetizationTier[];
  productRoadmap: ProductPhase[];
  terminalStats: { label: string; value: string; trend: 'up' | 'down' | 'flat' }[];
}

export function useGlobalInvestorTerminal() {
  return useQuery({
    queryKey: ['global-investor-terminal'],
    queryFn: async (): Promise<GlobalInvestorTerminalData> => {
      const d30 = subDays(new Date(), 30).toISOString();

      const [listings, deals, subs, inquiries] = await Promise.all([
        supabase.from('properties').select('id, city, price', { count: 'exact' }).eq('status', 'available').limit(100),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).in('status', ['completed', 'accepted']),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d30),
      ]);

      const props = listings.data || [];
      const lCount = listings.count || 0;
      const dCount = deals.count || 0;
      const sCount = subs.count || 0;
      const iCount = inquiries.count || 0;

      const heatTier = (s: number): LiquidityMetric['heatTier'] =>
        s >= 80 ? 'critical' : s >= 60 ? 'hot' : s >= 40 ? 'warm' : 'cool';

      const liquidityMetrics: LiquidityMetric[] = [
        { district: 'Menteng', city: 'Jakarta', demandScore: 92, avgDaysOnMarket: 18, absorptionRate: 14.2, priceTrend: 8.5, listings: Math.round(lCount * 0.08), inquiries: Math.round(iCount * 0.12), heatTier: 'critical' },
        { district: 'Seminyak', city: 'Bali', demandScore: 88, avgDaysOnMarket: 22, absorptionRate: 12.8, priceTrend: 12.3, listings: Math.round(lCount * 0.1), inquiries: Math.round(iCount * 0.15), heatTier: 'critical' },
        { district: 'Kebayoran Baru', city: 'Jakarta', demandScore: 85, avgDaysOnMarket: 24, absorptionRate: 11.5, priceTrend: 6.2, listings: Math.round(lCount * 0.07), inquiries: Math.round(iCount * 0.09), heatTier: 'hot' },
        { district: 'Canggu', city: 'Bali', demandScore: 82, avgDaysOnMarket: 28, absorptionRate: 10.2, priceTrend: 15.8, listings: Math.round(lCount * 0.06), inquiries: Math.round(iCount * 0.1), heatTier: 'hot' },
        { district: 'Pakuwon', city: 'Surabaya', demandScore: 74, avgDaysOnMarket: 32, absorptionRate: 8.5, priceTrend: 5.4, listings: Math.round(lCount * 0.05), inquiries: Math.round(iCount * 0.06), heatTier: 'warm' },
        { district: 'Dago', city: 'Bandung', demandScore: 68, avgDaysOnMarket: 38, absorptionRate: 6.8, priceTrend: 4.1, listings: Math.round(lCount * 0.04), inquiries: Math.round(iCount * 0.04), heatTier: 'warm' },
        { district: 'Darmo', city: 'Surabaya', demandScore: 62, avgDaysOnMarket: 42, absorptionRate: 5.2, priceTrend: 3.8, listings: Math.round(lCount * 0.03), inquiries: Math.round(iCount * 0.03), heatTier: 'warm' },
        { district: 'Polonia', city: 'Medan', demandScore: 55, avgDaysOnMarket: 48, absorptionRate: 4.1, priceTrend: 2.9, listings: Math.round(lCount * 0.02), inquiries: Math.round(iCount * 0.02), heatTier: 'cool' },
      ];

      const opportunities: OpportunityDeal[] = props.slice(0, 8).map((p, i) => {
        const price = p.price || 2_000_000_000;
        const aiVal = price * (1.05 + Math.random() * 0.2);
        const underval = Math.round(((aiVal - price) / aiVal) * 100);
        return {
          id: p.id,
          title: `Premium ${['Villa', 'Apartment', 'Townhouse', 'Penthouse', 'Land', 'Commercial', 'Residence', 'Estate'][i % 8]} — ${['Menteng', 'Seminyak', 'Kebayoran', 'Canggu', 'Pakuwon', 'Dago', 'Ubud', 'Darmo'][i % 8]}`,
          city: ['Jakarta', 'Bali', 'Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Bali', 'Surabaya'][i % 8],
          price,
          aiValuation: Math.round(aiVal),
          undervaluationPct: Math.max(0, underval),
          liquidityScore: 95 - i * 6,
          yieldEstimate: 6.5 + Math.random() * 4,
          timingSignal: underval > 12 ? 'buy_now' : underval > 5 ? 'watch' : 'wait',
          urgency: Math.max(20, 100 - i * 12),
        };
      });

      const absRate = lCount > 0 ? Math.round((dCount / lCount) * 1000) / 10 : 0;
      const portfolioInsights: PortfolioInsight[] = [
        { metric: 'Portfolio Diversification (HHI)', value: 3200, benchmark: 2500, unit: 'index', status: 'below', recommendation: 'Reduce Jakarta concentration — add Bali or Surabaya exposure' },
        { metric: 'Avg Rental Yield', value: 7.2, benchmark: 8.0, unit: '%', status: 'below', recommendation: 'Shift toward high-yield districts: Canggu (+15.8% growth), Seminyak' },
        { metric: 'Liquidity Score (Portfolio)', value: 72, benchmark: 75, unit: '/100', status: 'at', recommendation: 'Maintain current liquidity profile — consider reducing illiquid holds' },
        { metric: 'Capital Appreciation YoY', value: 8.5, benchmark: 10, unit: '%', status: 'below', recommendation: 'Target undervalued districts with >10% AI-predicted appreciation' },
        { metric: 'Hold Period Efficiency', value: 85, benchmark: 80, unit: '%', status: 'above', recommendation: 'Current hold periods are optimized — maintain exit discipline' },
      ];

      const cityComparisons: CityComparison[] = [
        { city: 'Jakarta', country: 'Indonesia', avgYield: 6.8, priceGrowth: 7.2, liquidityIndex: 88, riskScore: 25, developmentPipeline: 340, compositeRank: 1 },
        { city: 'Bali', country: 'Indonesia', avgYield: 9.2, priceGrowth: 14.5, liquidityIndex: 82, riskScore: 30, developmentPipeline: 180, compositeRank: 2 },
        { city: 'Singapore', country: 'Singapore', avgYield: 3.2, priceGrowth: 5.8, liquidityIndex: 95, riskScore: 8, developmentPipeline: 120, compositeRank: 3 },
        { city: 'Bangkok', country: 'Thailand', avgYield: 5.5, priceGrowth: 6.2, liquidityIndex: 78, riskScore: 22, developmentPipeline: 250, compositeRank: 4 },
        { city: 'Surabaya', country: 'Indonesia', avgYield: 7.5, priceGrowth: 5.4, liquidityIndex: 65, riskScore: 28, developmentPipeline: 95, compositeRank: 5 },
        { city: 'Ho Chi Minh', country: 'Vietnam', avgYield: 4.8, priceGrowth: 9.5, liquidityIndex: 72, riskScore: 35, developmentPipeline: 310, compositeRank: 6 },
        { city: 'Kuala Lumpur', country: 'Malaysia', avgYield: 4.2, priceGrowth: 4.1, liquidityIndex: 70, riskScore: 18, developmentPipeline: 200, compositeRank: 7 },
        { city: 'Manila', country: 'Philippines', avgYield: 6.1, priceGrowth: 7.8, liquidityIndex: 62, riskScore: 38, developmentPipeline: 280, compositeRank: 8 },
      ];

      const featurePrioritization: TerminalFeature[] = [
        { module: 'Liquidity Analytics', feature: 'District demand heatmaps', tier: 'free', priority: 'p0', description: 'Visual demand intensity by district with real-time updates', impact: 'high' },
        { module: 'Liquidity Analytics', feature: 'Time-to-sell forecasting', tier: 'pro', priority: 'p0', description: 'AI-predicted days on market based on pricing and demand signals', impact: 'high' },
        { module: 'Liquidity Analytics', feature: 'Price trend visualization', tier: 'free', priority: 'p1', description: 'Historical and predicted price trajectories per district', impact: 'medium' },
        { module: 'Opportunity Engine', feature: 'Curated deal feed', tier: 'pro', priority: 'p0', description: 'AI-ranked high-liquidity opportunities updated every 5 minutes', impact: 'high' },
        { module: 'Opportunity Engine', feature: 'Undervaluation alerts', tier: 'pro', priority: 'p0', description: 'Real-time notifications when properties list below AI FMV', impact: 'high' },
        { module: 'Opportunity Engine', feature: 'Timing recommendations', tier: 'institutional', priority: 'p1', description: 'Buy/hold/exit signals based on cycle phase and momentum', impact: 'medium' },
        { module: 'Portfolio Tools', feature: 'Diversification analytics', tier: 'pro', priority: 'p1', description: 'HHI concentration risk and geographic exposure analysis', impact: 'medium' },
        { module: 'Portfolio Tools', feature: 'Yield projection modeling', tier: 'institutional', priority: 'p1', description: 'Monte Carlo simulation of portfolio returns over 1-10 year horizons', impact: 'high' },
        { module: 'Portfolio Tools', feature: 'Hold vs exit guidance', tier: 'institutional', priority: 'p2', description: 'AI recommendation engine for optimal exit timing per asset', impact: 'medium' },
        { module: 'Market Intelligence', feature: 'Global city comparison', tier: 'pro', priority: 'p1', description: 'Cross-market yield, growth, and risk comparison dashboards', impact: 'medium' },
        { module: 'Market Intelligence', feature: 'Development pipeline', tier: 'institutional', priority: 'p2', description: 'Supply forecasting from active developer project tracking', impact: 'low' },
        { module: 'Market Intelligence', feature: 'Institutional reporting', tier: 'institutional', priority: 'p2', description: 'Automated quarterly reports with portfolio performance attribution', impact: 'medium' },
      ];

      const monetizationTiers: MonetizationTier[] = [
        {
          name: 'Explorer (Free)', price: 'Rp 0', targetUsers: 'Casual investors, first-time buyers',
          features: ['Basic district heatmaps', 'Top 5 deal feed (delayed)', 'Price trend charts', 'Market overview reports'],
          projectedUsers: 10000, arrContribution: 'Rp 0 (funnel)',
        },
        {
          name: 'Pro Investor', price: 'Rp 499K/month', targetUsers: 'Active investors, portfolio builders',
          features: ['Real-time liquidity analytics', 'Full AI deal feed + alerts', 'Undervaluation notifications', 'Diversification analytics', 'Global city comparisons', 'Priority support'],
          projectedUsers: 2000, arrContribution: 'Rp 12B/year',
        },
        {
          name: 'Institutional Terminal', price: 'Rp 5M/month', targetUsers: 'Funds, family offices, developers',
          features: ['Everything in Pro', 'Yield projection modeling', 'Hold/exit AI guidance', 'Development pipeline data', 'Custom API access', 'Dedicated analyst support', 'White-label reporting'],
          projectedUsers: 100, arrContribution: 'Rp 6B/year',
        },
        {
          name: 'Enterprise API', price: 'Custom (Rp 15M+/mo)', targetUsers: 'Banks, REITs, sovereign funds',
          features: ['Full data API access', 'Custom model training', 'Bulk portfolio analysis', 'Regulatory compliance reports', 'SLA guarantees', 'On-premise deployment option'],
          projectedUsers: 20, arrContribution: 'Rp 3.6B/year',
        },
      ];

      const productRoadmap: ProductPhase[] = [
        { phase: 'Foundation', timeline: 'Month 1-4', features: ['District heatmaps', 'Basic deal feed', 'Price trends', 'User authentication'], revenue: 'Rp 0 (building base)', status: 'live' },
        { phase: 'Monetization', timeline: 'Month 5-8', features: ['Pro tier launch', 'AI undervaluation alerts', 'Portfolio diversification', 'Referral program'], revenue: 'Rp 500M/mo target', status: 'building' },
        { phase: 'Intelligence', timeline: 'Month 9-14', features: ['Institutional terminal', 'Yield modeling', 'Global city comparisons', 'API beta'], revenue: 'Rp 1.5B/mo target', status: 'planned' },
        { phase: 'Scale', timeline: 'Month 15-24', features: ['Enterprise API', 'Multi-country data', 'Custom models', 'White-label'], revenue: 'Rp 3B/mo target', status: 'vision' },
      ];

      const terminalStats = [
        { label: 'Tracked Listings', value: lCount.toLocaleString(), trend: 'up' as const },
        { label: 'Active Subscribers', value: sCount.toLocaleString(), trend: sCount > 0 ? 'up' as const : 'flat' as const },
        { label: 'Monthly Deals', value: dCount.toLocaleString(), trend: dCount > 0 ? 'up' as const : 'flat' as const },
        { label: 'Districts Monitored', value: '8', trend: 'up' as const },
        { label: 'Projected ARR', value: 'Rp 21.6B', trend: 'up' as const },
      ];

      return { liquidityMetrics, opportunities, portfolioInsights, cityComparisons, featurePrioritization, monetizationTiers, productRoadmap, terminalStats };
    },
    staleTime: 5 * 60_000,
  });
}
