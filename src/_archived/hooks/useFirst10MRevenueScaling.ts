/**
 * First $10M Revenue Scaling Master Execution Plan
 * Structured roadmap from early traction to $10M cumulative revenue.
 */

export interface RevenueMilestonePhase {
  id: string;
  phase: string;
  label: string;
  timeline: string;
  cumulative_target: string;
  quarterly_revenue: string;
  description: string;
  pillars: { name: string; actions: string[] }[];
  kpis: { metric: string; target: string }[];
}

export interface MonetizationStream {
  name: string;
  priority: number;
  current_contribution_pct: number;
  target_contribution_pct: number;
  arpu: string;
  scaling_lever: string;
  timeline: string;
}

export interface ReinvestmentAllocation {
  category: string;
  pct: number;
  rationale: string;
  expected_roi: string;
}

export interface QuarterlyBenchmark {
  quarter: string;
  cumulative_revenue: string;
  mrr_target: string;
  deals_per_month: number;
  active_subscribers: number;
  cities_live: number;
  key_milestone: string;
}

export const REVENUE_PHASES: RevenueMilestonePhase[] = [
  {
    id: 'ignition',
    phase: 'Phase 1',
    label: 'Revenue Ignition',
    timeline: 'Month 1–6',
    cumulative_target: '$0 → $250K',
    quarterly_revenue: '$80K–$170K',
    description: 'Establish product-market fit and validate all three revenue streams in the anchor city.',
    pillars: [
      {
        name: 'Transaction Volume',
        actions: [
          'Onboard 200+ verified listings in 3 priority districts',
          'Achieve 8–12 deals/month by Month 4',
          'Reduce average days-on-market from 60 → 42 days',
          'Deploy agent incentive program for high-value closings',
        ],
      },
      {
        name: 'Monetization Activation',
        actions: [
          'Launch Investor Pro subscription at Rp 499K/month',
          'Activate 30 premium listing slots at Rp 1.5M–5M/slot',
          'Introduce vendor commission (8% platform fee)',
          'Test bundle pricing: listing + analytics package',
        ],
      },
      {
        name: 'Efficiency Foundation',
        actions: [
          'Establish baseline CAC < Rp 200K per investor lead',
          'Automate deal pipeline stage notifications',
          'Build referral program targeting 15% organic acquisition',
        ],
      },
    ],
    kpis: [
      { metric: 'Monthly Deals', target: '8–12' },
      { metric: 'MRR', target: '$12K–$28K' },
      { metric: 'Active Subscribers', target: '50–120' },
      { metric: 'Commission Rate', target: '1.5–2%' },
      { metric: 'Listing Inventory', target: '200+' },
    ],
  },
  {
    id: 'acceleration',
    phase: 'Phase 2',
    label: 'Revenue Acceleration',
    timeline: 'Month 7–12',
    cumulative_target: '$250K → $1.2M',
    quarterly_revenue: '$180K–$350K',
    description: 'Scale proven playbooks, expand to 2–3 cities, and deepen monetization layers.',
    pillars: [
      {
        name: 'Transaction Scale',
        actions: [
          'Grow to 25–35 deals/month across 2–3 cities',
          'Expand listing inventory to 800+ properties',
          'Launch clustered viewing automation (3x conversion lift)',
          'Introduce tiered commission: 1.5% standard, 2.5% premium service',
        ],
      },
      {
        name: 'Monetization Depth',
        actions: [
          'Launch Institutional Terminal at Rp 5M/month',
          'Scale premium slots to 100+ active across cities',
          'Introduce vendor subscription tiers (Growth/Pro)',
          'Deploy analytics add-on upsell at Rp 199K/month',
        ],
      },
      {
        name: 'Efficiency Optimization',
        actions: [
          'Reduce blended CAC to < Rp 120K',
          'Increase referral contribution to 25% of new users',
          'Automate 60% of operational workflows',
          'Achieve LTV:CAC ratio > 8x',
        ],
      },
    ],
    kpis: [
      { metric: 'Monthly Deals', target: '25–35' },
      { metric: 'MRR', target: '$50K–$90K' },
      { metric: 'Active Subscribers', target: '300–500' },
      { metric: 'Cities Live', target: '2–3' },
      { metric: 'Listing Inventory', target: '800+' },
    ],
  },
  {
    id: 'expansion',
    phase: 'Phase 3',
    label: 'Market Expansion',
    timeline: 'Month 13–24',
    cumulative_target: '$1.2M → $4.5M',
    quarterly_revenue: '$400K–$900K',
    description: 'Replicate liquidity playbook across 6–8 cities, launch data products, and achieve operational leverage.',
    pillars: [
      {
        name: 'Geographic Scale',
        actions: [
          'Expand to 6–8 cities using proven ignition playbook',
          'Achieve 60–80 deals/month platform-wide',
          'Build regional agent networks with performance tiers',
          'Launch city-specific marketing campaigns at scale',
        ],
      },
      {
        name: 'Product Monetization',
        actions: [
          'Launch Market Intelligence API for institutional clients',
          'Introduce portfolio analytics premium tier at Rp 15M/month',
          'Scale vendor marketplace to 200+ active providers',
          'Deploy dynamic pricing for premium slots (demand-based)',
        ],
      },
      {
        name: 'Operational Leverage',
        actions: [
          'Achieve 80% workflow automation coverage',
          'Reduce operational cost ratio from 45% → 28%',
          'Build self-serve onboarding for agents and vendors',
          'Implement AI-powered lead scoring and routing',
        ],
      },
    ],
    kpis: [
      { metric: 'Monthly Deals', target: '60–80' },
      { metric: 'MRR', target: '$120K–$250K' },
      { metric: 'Active Subscribers', target: '1,200–2,000' },
      { metric: 'Cities Live', target: '6–8' },
      { metric: 'Platform Take Rate', target: '1.8–2.2%' },
    ],
  },
  {
    id: 'dominance',
    phase: 'Phase 4',
    label: 'Revenue Dominance',
    timeline: 'Month 25–36',
    cumulative_target: '$4.5M → $10M+',
    quarterly_revenue: '$800K–$1.8M',
    description: 'Achieve market leadership position with diversified revenue streams and institutional-grade products.',
    pillars: [
      {
        name: 'Market Leadership',
        actions: [
          'Expand to 12–14 cities covering 70% of Indonesia transaction volume',
          'Achieve 120–160 deals/month at scale',
          'Establish brand as #1 property intelligence platform',
          'Launch cross-border investment corridor (Singapore-Jakarta)',
        ],
      },
      {
        name: 'Revenue Diversification',
        actions: [
          'Institutional data licensing generating $30K+/month',
          'Syndication facilitation fees (0.5% of capital deployed)',
          'White-label analytics for developer partners',
          'Financial services referral commissions (mortgage, insurance)',
        ],
      },
      {
        name: 'Profit Maximization',
        actions: [
          'Achieve 35%+ gross margin on blended revenue',
          'Reduce CAC to < Rp 80K through network effects',
          'Implement dynamic pricing across all product lines',
          'Prepare financial model for Series-A at $25–40M valuation',
        ],
      },
    ],
    kpis: [
      { metric: 'Monthly Deals', target: '120–160' },
      { metric: 'MRR', target: '$300K–$600K' },
      { metric: 'Active Subscribers', target: '4,000–6,000' },
      { metric: 'Cities Live', target: '12–14' },
      { metric: 'Gross Margin', target: '35%+' },
    ],
  },
];

export const MONETIZATION_STREAMS: MonetizationStream[] = [
  { name: 'Transaction Commission', priority: 1, current_contribution_pct: 55, target_contribution_pct: 40, arpu: 'Rp 37.5M/deal', scaling_lever: 'Deal volume × commission rate optimization', timeline: 'Active now' },
  { name: 'Investor Subscriptions', priority: 2, current_contribution_pct: 15, target_contribution_pct: 25, arpu: 'Rp 499K–5M/month', scaling_lever: 'Subscriber count × tier upsell', timeline: 'Month 1+' },
  { name: 'Premium Listings', priority: 3, current_contribution_pct: 12, target_contribution_pct: 15, arpu: 'Rp 1.5M–15M/slot', scaling_lever: 'Listing inventory × slot conversion rate', timeline: 'Month 2+' },
  { name: 'Vendor Commissions', priority: 4, current_contribution_pct: 10, target_contribution_pct: 10, arpu: 'Rp 490K/booking', scaling_lever: 'Vendor GMV × platform fee rate', timeline: 'Month 3+' },
  { name: 'Data & API Products', priority: 5, current_contribution_pct: 3, target_contribution_pct: 7, arpu: 'Rp 15M–50M/month', scaling_lever: 'Institutional client count × data depth', timeline: 'Month 12+' },
  { name: 'Financial Referrals', priority: 6, current_contribution_pct: 5, target_contribution_pct: 3, arpu: 'Rp 5M–15M/referral', scaling_lever: 'Mortgage/insurance conversion volume', timeline: 'Month 8+' },
];

export const QUARTERLY_BENCHMARKS: QuarterlyBenchmark[] = [
  { quarter: 'Q1', cumulative_revenue: '$60K', mrr_target: '$15K', deals_per_month: 8, active_subscribers: 50, cities_live: 1, key_milestone: 'First 25 deals closed' },
  { quarter: 'Q2', cumulative_revenue: '$250K', mrr_target: '$35K', deals_per_month: 15, active_subscribers: 120, cities_live: 1, key_milestone: 'Subscription revenue validated' },
  { quarter: 'Q3', cumulative_revenue: '$550K', mrr_target: '$65K', deals_per_month: 28, active_subscribers: 280, cities_live: 2, key_milestone: 'Second city launched' },
  { quarter: 'Q4', cumulative_revenue: '$1.0M', mrr_target: '$95K', deals_per_month: 35, active_subscribers: 450, cities_live: 3, key_milestone: 'First $1M milestone' },
  { quarter: 'Q5', cumulative_revenue: '$1.7M', mrr_target: '$140K', deals_per_month: 48, active_subscribers: 700, cities_live: 4, key_milestone: 'Institutional product launch' },
  { quarter: 'Q6', cumulative_revenue: '$2.8M', mrr_target: '$200K', deals_per_month: 60, active_subscribers: 1000, cities_live: 5, key_milestone: 'Operational profitability' },
  { quarter: 'Q7', cumulative_revenue: '$4.2M', mrr_target: '$280K', deals_per_month: 80, active_subscribers: 1500, cities_live: 7, key_milestone: 'Data API revenue live' },
  { quarter: 'Q8', cumulative_revenue: '$5.8M', mrr_target: '$380K', deals_per_month: 100, active_subscribers: 2200, cities_live: 9, key_milestone: 'Series-A readiness' },
  { quarter: 'Q9', cumulative_revenue: '$7.2M', mrr_target: '$450K', deals_per_month: 120, active_subscribers: 3200, cities_live: 11, key_milestone: 'Market leader position' },
  { quarter: 'Q10', cumulative_revenue: '$8.8M', mrr_target: '$520K', deals_per_month: 140, active_subscribers: 4500, cities_live: 12, key_milestone: 'Cross-border corridor' },
  { quarter: 'Q11', cumulative_revenue: '$9.5M', mrr_target: '$580K', deals_per_month: 150, active_subscribers: 5200, cities_live: 13, key_milestone: 'Revenue diversification' },
  { quarter: 'Q12', cumulative_revenue: '$10M+', mrr_target: '$600K+', deals_per_month: 160, active_subscribers: 6000, cities_live: 14, key_milestone: '$10M ACHIEVED 🏆' },
];

export const REINVESTMENT_STRATEGY: ReinvestmentAllocation[] = [
  { category: 'Demand Acquisition', pct: 35, rationale: 'Fuel investor and buyer pipeline growth in new and existing cities', expected_roi: '8–12x within 6 months' },
  { category: 'Product & Engineering', pct: 25, rationale: 'Build monetization features, automation, and data products', expected_roi: '15–20x through subscription and API revenue' },
  { category: 'City Expansion', pct: 20, rationale: 'Fund supply activation and market ignition in new cities', expected_roi: '5–8x within 12 months per city' },
  { category: 'Agent & Vendor Network', pct: 12, rationale: 'Recruit, train, and incentivize supply-side partners', expected_roi: '6–10x through increased deal volume' },
  { category: 'Brand & Content', pct: 8, rationale: 'Build market authority through case studies, PR, and thought leadership', expected_roi: '3–5x through organic acquisition uplift' },
];

export function useFirst10MRevenueScaling() {
  return {
    phases: REVENUE_PHASES,
    streams: MONETIZATION_STREAMS,
    benchmarks: QUARTERLY_BENCHMARKS,
    reinvestment: REINVESTMENT_STRATEGY,
  };
}
