export interface RevenueModule {
  id: string;
  category: 'deals' | 'monetization' | 'demand' | 'consistency';
  action: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  kpi: string;
  revenueContribution: string;
}

export interface WeeklyRevenueKPI {
  week: number;
  label: string;
  revenueTarget: string;
  dealsTarget: string;
  subscriptionTarget: string;
  keyActions: string[];
  milestone: string;
}

export interface MonetizationItem {
  stream: string;
  monthlyPotential: string;
  currentStatus: string;
  activationAction: string;
  priority: 'critical' | 'high' | 'medium';
  readiness: number;
}

export interface ScalingValidator {
  signal: string;
  threshold: string;
  meaning: string;
  status: 'not_ready' | 'approaching' | 'ready';
}

export interface MilestonePhase {
  phase: number;
  title: string;
  duration: string;
  revenueTarget: string;
  objective: string;
  tactics: string[];
  exitCriteria: string;
}

const MODULES: RevenueModule[] = [
  // High-Value Deal Concentration
  { id: 'hv1', category: 'deals', action: 'Concentrate pipeline on properties >Rp 8B with 2.5-3% commission rate', impact: 'Rp 200-240M commission per closed deal vs Rp 40-60M on standard', effort: 'medium', timeline: 'Week 1', kpi: '≥5 premium deals in active negotiation', revenueContribution: 'Rp 400-600M/month' },
  { id: 'hv2', category: 'deals', action: 'Assign top 3 agents exclusively to highest-value pipeline with daily stand-ups', impact: 'Increase close probability from 15% to 40% on premium deals', effort: 'low', timeline: 'Week 1', kpi: 'Elite agent utilization on >Rp 8B deals = 100%', revenueContribution: 'Rp 150-300M/month' },
  { id: 'hv3', category: 'deals', action: 'Compress negotiation cycle to ≤14 days with founder-level escalation triggers', impact: 'Accelerate revenue realization by 10-20 days per deal', effort: 'medium', timeline: 'Ongoing', kpi: 'Average days from offer to close ≤14', revenueContribution: 'Velocity multiplier' },
  { id: 'hv4', category: 'deals', action: 'Deploy real-time market data urgency packages to stalled deals >5 days', impact: 'Reactivate 40-50% of stalled premium negotiations', effort: 'low', timeline: 'Week 2', kpi: 'Stalled deal reactivation rate ≥40%', revenueContribution: 'Rp 80-150M recovery' },
  { id: 'hv5', category: 'deals', action: 'Introduce exclusive pre-market access deals for top-tier investors', impact: 'Create urgency and premium positioning — higher close rates', effort: 'medium', timeline: 'Week 2-3', kpi: '≥3 pre-market exclusives per month', revenueContribution: 'Rp 100-200M/month' },

  // Monetization Activation
  { id: 'mt1', category: 'monetization', action: 'Launch tiered premium listing visibility: Standard (Rp 2.5M), Gold (Rp 5M), Platinum (Rp 15M)/month', impact: '+Rp 50-100M/month from 15-25 premium slot sales', effort: 'medium', timeline: 'Week 1-2', kpi: 'Premium slot fill rate ≥65%', revenueContribution: 'Rp 50-100M/month' },
  { id: 'mt2', category: 'monetization', action: 'Activate Investor Intelligence subscription: Pro (Rp 799K), Premium (Rp 2.5M), Institutional (Rp 15M)/month', impact: '+Rp 40-80M/month from 40-80 paid subscribers across tiers', effort: 'high', timeline: 'Week 2-3', kpi: 'Trial-to-paid conversion ≥25%', revenueContribution: 'Rp 40-80M/month' },
  { id: 'mt3', category: 'monetization', action: 'Implement vendor success commission at 10% on platform-matched service jobs', impact: '+Rp 15-30M/month from vendor transaction commissions', effort: 'high', timeline: 'Week 3-4', kpi: 'Vendor commission collection rate ≥92%', revenueContribution: 'Rp 15-30M/month' },
  { id: 'mt4', category: 'monetization', action: 'Launch agent featured search placement and priority lead routing at Rp 1.5M/month', impact: '+Rp 15-30M/month from agent visibility upgrades', effort: 'low', timeline: 'Week 2', kpi: '≥15 agents on featured placement', revenueContribution: 'Rp 15-30M/month' },

  // Demand Generation Discipline
  { id: 'dg1', category: 'demand', action: 'Run performance marketing campaigns with strict Rp 200K CAC ceiling on Google & Meta', impact: 'Generate 150-250 qualified investor leads per month', effort: 'medium', timeline: 'Ongoing', kpi: 'Monthly qualified leads ≥200 at CAC ≤Rp 200K', revenueContribution: 'Pipeline fuel' },
  { id: 'dg2', category: 'demand', action: 'Activate 3-tier referral program: investor refers investor (1mo free), agent refers buyer (Rp 500K bonus)', impact: 'Reduce blended CAC by 35-45% through referral multiplication', effort: 'low', timeline: 'Week 1-2', kpi: 'Referral-sourced leads ≥25% of total', revenueContribution: 'CAC reduction' },
  { id: 'dg3', category: 'demand', action: 'Nurture high-intent investor pipeline with personalized deal alerts and ROI projections', impact: 'Increase deal engagement rate from 12% to 28%', effort: 'medium', timeline: 'Week 2', kpi: 'Deal alert click-through rate ≥30%', revenueContribution: 'Conversion uplift' },
  { id: 'dg4', category: 'demand', action: 'Partner with 5 corporate HR departments for employee housing benefit programs', impact: 'Access 500-1000 pre-qualified buyers with employer subsidies', effort: 'high', timeline: 'Week 3-4', kpi: '≥3 corporate partnerships activated', revenueContribution: 'Rp 50-120M/month' },

  // Revenue Consistency Reinforcement
  { id: 'rc1', category: 'consistency', action: 'Implement weekly deal-close target board with real-time tracking visible to all agents', impact: 'Create accountability culture and consistent closing cadence', effort: 'low', timeline: 'Week 1', kpi: 'Weekly closing target hit rate ≥80%', revenueContribution: 'Discipline multiplier' },
  { id: 'rc2', category: 'consistency', action: 'Analyze conversion bottlenecks weekly — identify and fix top 3 friction points', impact: 'Improve end-to-end conversion rate by 15-25% monthly', effort: 'medium', timeline: 'Ongoing', kpi: 'Conversion rate improvement ≥5% week-over-week', revenueContribution: 'Compound growth' },
  { id: 'rc3', category: 'consistency', action: 'Reinvest 25% of weekly surplus revenue into highest-ROI growth channel', impact: 'Compound revenue growth through disciplined reinvestment', effort: 'low', timeline: 'Post Week 2', kpi: 'Reinvestment ROI ≥3x within 30 days', revenueContribution: 'Growth compounding' },
  { id: 'rc4', category: 'consistency', action: 'Build 90-day revenue pipeline forecast with weekly accuracy calibration', impact: 'Reduce revenue surprise variance to ≤10%', effort: 'medium', timeline: 'Week 2', kpi: 'Forecast accuracy ≥85%', revenueContribution: 'Predictability' },
];

const WEEKLY_KPIS: WeeklyRevenueKPI[] = [
  { week: 1, label: 'Revenue Engine Ignition', revenueTarget: 'Rp 180-250M', dealsTarget: '1-2 premium closings', subscriptionTarget: '10-15 premium slots sold', keyActions: ['Activate premium listing tiers', 'Assign elite agents to top deals', 'Launch referral program', 'Deploy deal-close target board'], milestone: 'Revenue machinery live, premium monetization activated' },
  { week: 2, label: 'Monetization Scaling', revenueTarget: 'Rp 280-380M', dealsTarget: '2-3 premium closings', subscriptionTarget: '25-35 paid subscriptions', keyActions: ['Launch investor subscription tiers', 'Deploy agent featured placement', 'Run urgency messaging on stalled deals', 'Start conversion bottleneck analysis'], milestone: 'Multiple revenue streams generating, subscription traction confirmed' },
  { week: 3, label: 'Pipeline Acceleration', revenueTarget: 'Rp 380-500M', dealsTarget: '3-4 premium closings', subscriptionTarget: '40-55 paid subscriptions', keyActions: ['Activate vendor success fees', 'Launch corporate HR partnerships', 'Compress all active negotiations', 'Optimize deal alert conversion'], milestone: 'Deal velocity accelerating, vendor monetization live' },
  { week: 4, label: '$100K Confirmation Sprint', revenueTarget: 'Rp 500-650M', dealsTarget: '4-5 premium closings', subscriptionTarget: '55-70 paid subscriptions', keyActions: ['Close all pipeline-ready deals', 'Confirm $100K monthly threshold crossed', 'Plan reinvestment allocation', 'Document playbook for replication'], milestone: 'First $100K monthly revenue milestone achieved and validated' },
];

const MONETIZATION_ITEMS: MonetizationItem[] = [
  { stream: 'Premium Listing Visibility (3 tiers)', monthlyPotential: 'Rp 50-100M', currentStatus: 'Product ready', activationAction: 'Deploy tiered pricing page, sales outreach to top 50 listers', priority: 'critical', readiness: 90 },
  { stream: 'Transaction Commissions (2.5-3%)', monthlyPotential: 'Rp 400-600M', currentStatus: 'Active on deals', activationAction: 'Focus pipeline on >Rp 8B properties, compress closing cycle', priority: 'critical', readiness: 85 },
  { stream: 'Investor Intelligence Subscriptions', monthlyPotential: 'Rp 40-80M', currentStatus: 'Beta testing', activationAction: 'Launch 14-day free trial, activate email nurture campaign', priority: 'high', readiness: 70 },
  { stream: 'Agent Featured Placement', monthlyPotential: 'Rp 15-30M', currentStatus: 'Feature built', activationAction: 'Pitch to top 20 active agents with performance data', priority: 'high', readiness: 80 },
  { stream: 'Vendor Success Commissions (10%)', monthlyPotential: 'Rp 15-30M', currentStatus: 'Framework designed', activationAction: 'Activate commission tracking on all vendor-matched jobs', priority: 'medium', readiness: 55 },
  { stream: 'Corporate Housing Partnerships', monthlyPotential: 'Rp 50-120M', currentStatus: 'Prospecting', activationAction: 'Close 3-5 HR department partnerships with exclusive terms', priority: 'medium', readiness: 30 },
];

const SCALING_VALIDATORS: ScalingValidator[] = [
  { signal: 'Monthly Revenue ≥ Rp 1.5B ($100K)', threshold: 'Rp 1.5B/month sustained for 2 consecutive months', meaning: 'Revenue milestone proven repeatable, not one-time spike', status: 'approaching' },
  { signal: 'Deal Pipeline Coverage ≥ 3x', threshold: '≥Rp 4.5B in active pipeline vs Rp 1.5B target', meaning: 'Sufficient deal depth to sustain revenue even with normal close-rate variance', status: 'not_ready' },
  { signal: 'Blended CAC ≤ Rp 180K', threshold: 'All-channel average acquisition cost below Rp 180K', meaning: 'Unit economics support profitable scaling without subsidy dependency', status: 'approaching' },
  { signal: 'Subscription Retention ≥ 75%', threshold: 'Month-2 retention rate on paid subscriptions ≥75%', meaning: 'Recurring revenue is sticky, not trial-driven vanity metric', status: 'not_ready' },
  { signal: 'Agent Close Rate ≥ 18%', threshold: 'Average agent deal conversion from qualified lead ≥18%', meaning: 'Sales execution quality supports higher volume without proportional cost increase', status: 'approaching' },
  { signal: 'Revenue Diversification Index ≥ 0.6', threshold: 'No single stream >50% of total monthly revenue', meaning: 'Revenue resilience — not dependent on single large deal closing', status: 'not_ready' },
  { signal: 'Weekly Revenue Variance ≤ 15%', threshold: 'Standard deviation of weekly revenue below 15% of mean', meaning: 'Revenue predictability sufficient for confident forward planning', status: 'not_ready' },
];

const MILESTONE_PHASES: MilestonePhase[] = [
  {
    phase: 1, title: 'Revenue Foundation Build', duration: 'Week 1-2', revenueTarget: 'Rp 450-630M cumulative',
    objective: 'Activate all revenue streams and establish weekly closing cadence with premium deal concentration.',
    tactics: [
      'Deploy 3-tier premium listing visibility product',
      'Assign top agents exclusively to >Rp 8B pipeline deals',
      'Launch referral program with investor and agent incentives',
      'Activate weekly deal-close target board with real-time tracking',
      'Cut all paid channels with CAC >Rp 250K',
    ],
    exitCriteria: 'Premium slots ≥60% filled, ≥2 premium deals closed, referral program live',
  },
  {
    phase: 2, title: 'Subscription & Commission Activation', duration: 'Week 2-3', revenueTarget: 'Rp 630-880M cumulative',
    objective: 'Layer recurring subscription revenue and vendor commissions onto transaction base.',
    tactics: [
      'Launch Investor Intelligence subscription with 14-day trial',
      'Activate agent featured placement with performance pitch',
      'Begin vendor success commission collection on matched jobs',
      'Deploy urgency messaging on all stalled deals >5 days',
      'Start weekly conversion bottleneck analysis ritual',
    ],
    exitCriteria: '≥25 paid subscriptions, vendor commission tracking live, stalled deal recovery ≥35%',
  },
  {
    phase: 3, title: 'Pipeline & Partnership Scaling', duration: 'Week 3-4', revenueTarget: 'Rp 880-1.2B cumulative',
    objective: 'Scale deal pipeline depth and activate corporate partnership channel for demand diversification.',
    tactics: [
      'Close first corporate HR housing partnership',
      'Compress all active negotiations to ≤14 day target',
      'Launch pre-market exclusive deals for top-tier investors',
      'Optimize investor deal alert conversion through A/B testing',
      'Begin 90-day revenue pipeline forecast model',
    ],
    exitCriteria: '≥1 corporate partnership active, negotiation cycle ≤18 days average, pipeline ≥Rp 3B',
  },
  {
    phase: 4, title: '$100K Monthly Confirmation', duration: 'Week 4+', revenueTarget: '≥Rp 1.5B monthly',
    objective: 'Confirm $100K monthly revenue threshold crossed and document repeatable playbook for scaling.',
    tactics: [
      'Sprint-close all pipeline-ready premium deals',
      'Confirm monthly P&L exceeds Rp 1.5B revenue',
      'Allocate 25% surplus to highest-ROI growth reinvestment',
      'Document revenue playbook for team replication',
      'Validate all scaling readiness indicators',
    ],
    exitCriteria: 'Monthly revenue ≥Rp 1.5B confirmed, playbook documented, scaling indicators ≥4/7 green',
  },
];

const CATEGORIES = ['deals', 'monetization', 'demand', 'consistency'] as const;

export function useFirst100KRevenue() {
  const leversByCategory = (cat: string) => MODULES.filter(m => m.category === cat);

  return {
    modules: MODULES,
    leversByCategory,
    weeklyKPIs: WEEKLY_KPIS,
    monetizationItems: MONETIZATION_ITEMS,
    scalingValidators: SCALING_VALIDATORS,
    milestonePhases: MILESTONE_PHASES,
    categories: CATEGORIES,
  };
}
