import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EquityMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  description: string;
  pctOfTarget: number;
}

export interface ExitScenario {
  pathway: string;
  timeline: string;
  valuationRange: string;
  founderProceeds: string;
  controlRetained: string;
  probability: number;
  pros: string[];
  cons: string[];
  triggers: string[];
}

export interface GovernancePhase {
  phase: string;
  timeline: string;
  boardComposition: string;
  founderControl: number;
  votingPower: number;
  actions: string[];
  status: 'active' | 'upcoming' | 'future';
}

export interface ResilienceItem {
  category: string;
  allocation: number;
  strategy: string;
  vehicles: string[];
  taxEfficiency: string;
}

export interface WealthRoadmapMilestone {
  stage: string;
  timeline: string;
  equityValue: string;
  liquidWealth: string;
  action: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface FounderExitWealthData {
  equityMetrics: EquityMetric[];
  exitScenarios: ExitScenario[];
  governancePhases: GovernancePhase[];
  resilienceAllocation: ResilienceItem[];
  wealthRoadmap: WealthRoadmapMilestone[];
  currentValuation: number;
  founderOwnership: number;
  netWorthEstimate: string;
}

export function useFounderExitWealth() {
  return useQuery({
    queryKey: ['founder-exit-wealth'],
    queryFn: async (): Promise<FounderExitWealthData> => {
      const [listings, deals, subs, revenue] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).in('status', ['completed', 'accepted']),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('commissions').select('amount').eq('status', 'paid'),
      ]);

      const l = listings.count || 0;
      const d = deals.count || 0;
      const s = subs.count || 0;
      const totalRev = (revenue.data || []).reduce((sum, r) => sum + (r.amount || 0), 0);
      const arrEstimate = s * 3_500_000 * 12;
      const revenueMultiple = 15;
      const impliedVal = Math.max(arrEstimate * revenueMultiple, 25_000_000_000);
      const founderOwn = 78;
      const founderEquity = impliedVal * (founderOwn / 100);

      const equityMetrics: EquityMetric[] = [
        { label: 'Implied Platform Valuation', value: `Rp ${(impliedVal / 1e9).toFixed(1)}B`, trend: 'up', description: 'Based on ARR × 15x revenue multiple', pctOfTarget: Math.min(100, Math.round((impliedVal / 500e9) * 100)) },
        { label: 'Founder Equity Value', value: `Rp ${(founderEquity / 1e9).toFixed(1)}B`, trend: 'up', description: `${founderOwn}% ownership stake at current valuation`, pctOfTarget: Math.min(100, Math.round((founderEquity / 390e9) * 100)) },
        { label: 'Annual Recurring Revenue', value: `Rp ${(arrEstimate / 1e6).toFixed(0)}M`, trend: s > 10 ? 'up' : 'flat', description: `${s} active subscribers × Rp 3.5M avg ARPU`, pctOfTarget: Math.min(100, Math.round((arrEstimate / 12e9) * 100)) },
        { label: 'Transaction Revenue (Cumulative)', value: `Rp ${(totalRev / 1e6).toFixed(0)}M`, trend: totalRev > 0 ? 'up' : 'flat', description: 'Total commission revenue collected to date', pctOfTarget: Math.min(100, Math.round((totalRev / 5e9) * 100)) },
        { label: 'Listing Network Density', value: `${l} listings`, trend: l > 100 ? 'up' : 'flat', description: 'Active verified property inventory — key liquidity signal', pctOfTarget: Math.min(100, Math.round((l / 1000) * 100)) },
        { label: 'Deal Velocity', value: `${d} deals`, trend: d > 20 ? 'up' : 'flat', description: 'Completed transactions — proves marketplace liquidity', pctOfTarget: Math.min(100, Math.round((d / 200) * 100)) },
      ];

      const exitScenarios: ExitScenario[] = [
        {
          pathway: 'Strategic Acquisition',
          timeline: 'Year 3-5',
          valuationRange: '$50M - $150M',
          founderProceeds: '$39M - $117M',
          controlRetained: 'Advisory role (2-3 year earn-out)',
          probability: 35,
          pros: ['Fastest liquidity path', 'Synergy premium 20-40%', 'Operational support from acquirer', 'De-risk personal exposure'],
          cons: ['Loss of operational control', 'Earn-out conditions limit flexibility', 'Integration risk', 'Vision may be diluted'],
          triggers: ['ARR > $5M', 'Market leadership in 3+ cities', 'Inbound acquisition interest', 'Strategic fit with regional giant'],
        },
        {
          pathway: 'IPO / Public Listing',
          timeline: 'Year 5-7',
          valuationRange: '$200M - $500M',
          founderProceeds: '$156M - $390M (pre-dilution)',
          controlRetained: 'Dual-class voting (10x super-voting)',
          probability: 25,
          pros: ['Maximum valuation potential', 'Maintains founder control via dual-class', 'Public currency for M&A', 'Prestige and brand authority'],
          cons: ['Longest timeline', 'Regulatory compliance burden', 'Quarterly pressure', 'Significant pre-IPO investment required'],
          triggers: ['ARR > $30M', 'Profitable or clear path', '10+ city presence', 'Institutional investor demand'],
        },
        {
          pathway: 'Secondary Sale (Partial Exit)',
          timeline: 'Year 2-4',
          valuationRange: '$25M - $80M',
          founderProceeds: '$5M - $15M (10-20% stake)',
          controlRetained: 'Full operational + majority ownership',
          probability: 55,
          pros: ['Personal liquidity without losing control', 'De-risks founder financially', 'Validates valuation for future rounds', 'Attracts quality institutional investors'],
          cons: ['Smaller absolute proceeds', 'May signal lack of confidence if poorly communicated', 'Dilutes ownership slightly'],
          triggers: ['Post Series-A/B', 'Strong growth metrics', 'Investor interest in secondary', 'Personal financial planning need'],
        },
        {
          pathway: 'Management Buyout + Dividends',
          timeline: 'Year 6-10',
          valuationRange: '$100M - $300M',
          founderProceeds: '$10M-$30M/yr dividends',
          controlRetained: 'Full control as majority owner',
          probability: 15,
          pros: ['Perpetual income stream', 'Complete control retained', 'No exit pressure', 'Legacy wealth vehicle'],
          cons: ['Requires sustained profitability', 'Capital locked in single asset', 'No diversification', 'Slower personal wealth growth'],
          triggers: ['Net margins > 25%', 'Stable recurring revenue', 'No desire for external capital', 'Personal preference for control'],
        },
      ];

      const governancePhases: GovernancePhase[] = [
        {
          phase: 'Founding Control',
          timeline: 'Year 0-2',
          boardComposition: '3 seats: 2 Founder + 1 Independent',
          founderControl: 100,
          votingPower: 100,
          actions: ['Maintain sole decision authority', 'Select aligned independent director', 'Establish voting agreements', 'Create founder protection provisions'],
          status: 'active',
        },
        {
          phase: 'Investor Integration',
          timeline: 'Year 2-4 (Post Series-A/B)',
          boardComposition: '5 seats: 2 Founder + 2 Investor + 1 Independent',
          founderControl: 78,
          votingPower: 85,
          actions: ['Implement dual-class share structure', 'Negotiate protective provisions carefully', 'Secure board appointment rights', 'Establish information rights boundaries'],
          status: 'upcoming',
        },
        {
          phase: 'Pre-IPO Governance',
          timeline: 'Year 4-6',
          boardComposition: '7 seats: 2 Founder + 2 Investor + 3 Independent',
          founderControl: 65,
          votingPower: 75,
          actions: ['Strengthen independent director quality', 'Implement audit and compensation committees', 'Prepare SOX compliance framework', 'Establish succession planning process'],
          status: 'future',
        },
        {
          phase: 'Public Company Stewardship',
          timeline: 'Year 6+',
          boardComposition: '9 seats: 1 Founder CEO + 1 Founder Chair + 7 Independent',
          founderControl: 30,
          votingPower: 60,
          actions: ['Maintain dual-class super-voting rights', 'Chair key strategy committees', 'Build institutional investor relationships', 'Transition to visionary leadership role'],
          status: 'future',
        },
      ];

      const resilienceAllocation: ResilienceItem[] = [
        { category: 'Liquid Cash & Equivalents', allocation: 15, strategy: 'Emergency reserves — 24 months personal runway', vehicles: ['High-yield savings', 'Money market funds', 'Short-term government bonds'], taxEfficiency: 'Standard income tax on interest' },
        { category: 'Public Market Equities', allocation: 25, strategy: 'Diversified global index exposure for long-term growth', vehicles: ['Global equity ETFs', 'Tech sector allocation', 'Emerging market exposure'], taxEfficiency: 'Capital gains deferral via buy-and-hold' },
        { category: 'Real Estate Portfolio', allocation: 20, strategy: 'Income-generating properties in high-growth corridors', vehicles: ['Direct property ownership', 'REITs', 'Development JVs'], taxEfficiency: 'Depreciation shields + 1031 exchanges' },
        { category: 'Alternative Investments', allocation: 15, strategy: 'Venture, PE, and hedge fund diversification', vehicles: ['Angel investments', 'PE fund commitments', 'Structured products'], taxEfficiency: 'Carried interest + long-term capital gains' },
        { category: 'ASTRA Equity (Retained)', allocation: 20, strategy: 'Core wealth driver — managed dilution path', vehicles: ['Primary stake', 'Vested ESOP', 'Convertible instruments'], taxEfficiency: 'QSBS exclusion potential + staged realization' },
        { category: 'Legacy & Protection', allocation: 5, strategy: 'Insurance, trusts, and generational transfer vehicles', vehicles: ['Irrevocable trusts', 'Key-person insurance', 'Family limited partnerships'], taxEfficiency: 'Estate tax minimization via trust structures' },
      ];

      const wealthRoadmap: WealthRoadmapMilestone[] = [
        { stage: 'Foundation', timeline: 'Year 0-1', equityValue: '$500K-$2M', liquidWealth: '$50K-$200K', action: 'Minimize burn, maximize equity value creation', status: d > 0 ? 'active' : 'active' },
        { stage: 'First Liquidity', timeline: 'Year 1-2', equityValue: '$2M-$10M', liquidWealth: '$200K-$500K', action: 'Close Series-A, consider small secondary sale', status: 'upcoming' },
        { stage: 'Wealth Diversification', timeline: 'Year 2-4', equityValue: '$10M-$50M', liquidWealth: '$2M-$8M', action: 'Execute 10-15% secondary sale, begin diversification', status: 'upcoming' },
        { stage: 'Financial Independence', timeline: 'Year 4-6', equityValue: '$50M-$200M', liquidWealth: '$10M-$30M', action: 'Pre-IPO positioning, establish trust structures', status: 'upcoming' },
        { stage: 'Generational Wealth', timeline: 'Year 6-10', equityValue: '$200M-$500M', liquidWealth: '$50M-$150M', action: 'IPO/exit execution, legacy wealth architecture', status: 'upcoming' },
      ];

      return {
        equityMetrics,
        exitScenarios,
        governancePhases,
        resilienceAllocation,
        wealthRoadmap,
        currentValuation: impliedVal,
        founderOwnership: founderOwn,
        netWorthEstimate: `Rp ${(founderEquity / 1e9).toFixed(1)}B`,
      };
    },
    staleTime: 5 * 60_000,
  });
}
