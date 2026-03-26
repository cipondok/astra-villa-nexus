export interface ProfitLever {
  id: string;
  category: 'deals' | 'monetization' | 'cost' | 'momentum';
  action: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  kpi: string;
}

export interface WeeklyProfitKPI {
  week: number;
  label: string;
  revenueTarget: string;
  costCeiling: string;
  profitTarget: string;
  keyActions: string[];
  milestone: string;
}

export interface CostOptimization {
  area: string;
  currentSpend: string;
  optimizedSpend: string;
  savingsEstimate: string;
  action: string;
  priority: 'immediate' | 'short_term' | 'medium_term';
}

export interface ScalingIndicator {
  signal: string;
  threshold: string;
  meaning: string;
  status: 'not_ready' | 'approaching' | 'ready';
}

export interface MilestonePhase {
  phase: number;
  title: string;
  duration: string;
  objective: string;
  tactics: string[];
  exitCriteria: string;
}

const LEVERS: ProfitLever[] = [
  { id: 'dl1', category: 'deals', action: 'Focus pipeline on properties >Rp 5B with 2-3% commission rate', impact: 'Rp 100-150M commission per closed deal vs Rp 20-40M on standard', effort: 'medium', timeline: 'Week 1', kpi: '≥3 high-value deals in active negotiation' },
  { id: 'dl2', category: 'deals', action: 'Assign Elite-tier agents exclusively to top 5 highest-value pipeline deals', impact: 'Increase close probability from 15% to 35% on premium deals', effort: 'low', timeline: 'Week 1', kpi: 'Elite agent assignment rate on >Rp 5B deals = 100%' },
  { id: 'dl3', category: 'deals', action: 'Compress negotiation cycle to ≤21 days with daily founder check-ins', impact: 'Accelerate revenue realization by 7-14 days per deal', effort: 'medium', timeline: 'Ongoing', kpi: 'Average days from offer to close ≤21' },
  { id: 'dl4', category: 'deals', action: 'Deploy urgency messaging on deals stalled >7 days with market data triggers', impact: 'Reactivate 30-40% of stalled negotiations', effort: 'low', timeline: 'Week 2', kpi: 'Stalled deal reactivation rate ≥30%' },
  { id: 'mn1', category: 'monetization', action: 'Launch premium listing visibility slots at Rp 1.5-5M/month per slot', impact: '+Rp 15-50M/month from 10-15 premium slot sales', effort: 'medium', timeline: 'Week 1-2', kpi: 'Premium slot fill rate ≥60%' },
  { id: 'mn2', category: 'monetization', action: 'Activate Investor Pro subscription at Rp 499K/month with 14-day free trial', impact: '+Rp 10-25M/month from 20-50 paid subscribers', effort: 'medium', timeline: 'Week 2-3', kpi: 'Trial-to-paid conversion ≥20%' },
  { id: 'mn3', category: 'monetization', action: 'Introduce vendor success fee of 8% on platform-matched service jobs', impact: '+Rp 5-12M/month from vendor transaction commissions', effort: 'high', timeline: 'Week 3-4', kpi: 'Vendor commission collection rate ≥90%' },
  { id: 'mn4', category: 'monetization', action: 'Upsell featured search placement to agents at Rp 750K/month', impact: '+Rp 7-15M/month from agent visibility upgrades', effort: 'low', timeline: 'Week 2', kpi: '≥10 agents on featured placement' },
  { id: 'co1', category: 'cost', action: 'Cut paid ad spend on channels with CAC >Rp 300K and reallocate to organic', impact: 'Reduce marketing burn by 30-40% while maintaining lead volume', effort: 'low', timeline: 'Week 1', kpi: 'Blended CAC ≤Rp 150K' },
  { id: 'co2', category: 'cost', action: 'Automate listing verification to reduce manual review staff hours by 60%', impact: 'Save Rp 3-5M/month in operational labor costs', effort: 'medium', timeline: 'Week 2-3', kpi: 'Manual review hours reduced from 40h to 16h/week' },
  { id: 'co3', category: 'cost', action: 'Consolidate SaaS tooling — eliminate redundant analytics and CRM subscriptions', impact: 'Save Rp 2-4M/month in software costs', effort: 'low', timeline: 'Week 1', kpi: 'Monthly SaaS spend ≤Rp 8M' },
  { id: 'co4', category: 'cost', action: 'Negotiate 90-day payment terms with infrastructure vendors', impact: 'Improve cash flow runway by 15-20 days', effort: 'medium', timeline: 'Week 3', kpi: 'Average payables cycle extended to 60+ days' },
  { id: 'mm1', category: 'momentum', action: 'Publish internal profitability countdown dashboard visible to entire team', impact: 'Align team focus and create urgency around break-even target', effort: 'low', timeline: 'Week 1', kpi: 'Daily team visibility on profit gap metric' },
  { id: 'mm2', category: 'momentum', action: 'Reinvest first Rp 20M profit into high-ROI referral acquisition campaign', impact: 'Generate 2.5x return through referral multiplier effect', effort: 'medium', timeline: 'Post break-even', kpi: 'Referral-driven revenue ≥Rp 50M within 30 days' },
  { id: 'mm3', category: 'momentum', action: 'Launch "Profit Milestone Bonus" for agents who close deals in target month', impact: 'Increase agent motivation and deal velocity by 20-30%', effort: 'low', timeline: 'Week 1', kpi: 'Agent deal velocity increase ≥20%' },
  { id: 'mm4', category: 'momentum', action: 'Activate investor referral reward — 1 month Pro free for each referred investor', impact: 'Reduce investor CAC to near-zero on referral channel', effort: 'low', timeline: 'Week 2', kpi: 'Referral-sourced investors ≥15% of new signups' },
];

const WEEKLY_KPIS: WeeklyProfitKPI[] = [
  { week: 1, label: 'Revenue Foundation', revenueTarget: 'Rp 80-120M', costCeiling: 'Rp 95M', profitTarget: 'Rp -15M to +25M', keyActions: ['Activate premium slots', 'Assign elite agents to top deals', 'Cut low-ROI ad spend', 'Launch profitability countdown'], milestone: 'Revenue machinery activated, cost baseline established' },
  { week: 2, label: 'Monetization Activation', revenueTarget: 'Rp 120-160M', costCeiling: 'Rp 90M', profitTarget: 'Rp +30M to +70M', keyActions: ['Launch investor subscription trial', 'Deploy agent featured placement', 'Automate listing verification', 'Push stalled deal urgency messaging'], milestone: 'Multiple revenue streams generating, costs declining' },
  { week: 3, label: 'Conversion Acceleration', revenueTarget: 'Rp 150-200M', costCeiling: 'Rp 85M', profitTarget: 'Rp +65M to +115M', keyActions: ['Activate vendor success fees', 'Compress negotiation cycles', 'Negotiate vendor payment terms', 'Optimize subscription conversion'], milestone: 'Deal pipeline accelerating, unit economics improving' },
  { week: 4, label: 'Profit Confirmation', revenueTarget: 'Rp 180-250M', costCeiling: 'Rp 80M', profitTarget: 'Rp +100M to +170M', keyActions: ['Close remaining pipeline deals', 'Confirm monthly P&L positive', 'Plan profit reinvestment allocation', 'Activate referral growth campaign'], milestone: 'First profitable month confirmed and documented' },
];

const COST_OPTIMIZATIONS: CostOptimization[] = [
  { area: 'Paid Digital Advertising', currentSpend: 'Rp 35-50M/month', optimizedSpend: 'Rp 15-25M/month', savingsEstimate: 'Rp 20-25M/month', action: 'Eliminate channels with CAC >Rp 300K — focus budget on Google Search and retargeting only', priority: 'immediate' },
  { area: 'SaaS & Tool Subscriptions', currentSpend: 'Rp 12-15M/month', optimizedSpend: 'Rp 6-8M/month', savingsEstimate: 'Rp 6-7M/month', action: 'Audit all subscriptions — consolidate to Supabase + essential analytics only', priority: 'immediate' },
  { area: 'Manual Operations Labor', currentSpend: 'Rp 15-20M/month', optimizedSpend: 'Rp 8-12M/month', savingsEstimate: 'Rp 7-8M/month', action: 'Automate listing verification, lead routing, and report generation workflows', priority: 'short_term' },
  { area: 'Content Production', currentSpend: 'Rp 8-12M/month', optimizedSpend: 'Rp 3-5M/month', savingsEstimate: 'Rp 5-7M/month', action: 'Shift to AI-assisted content generation for SEO articles and property descriptions', priority: 'short_term' },
  { area: 'Office & Infrastructure', currentSpend: 'Rp 10-15M/month', optimizedSpend: 'Rp 7-10M/month', savingsEstimate: 'Rp 3-5M/month', action: 'Negotiate co-working arrangement or downsize to essential space only', priority: 'medium_term' },
  { area: 'Event & Partnership Costs', currentSpend: 'Rp 5-8M/month', optimizedSpend: 'Rp 2-3M/month', savingsEstimate: 'Rp 3-5M/month', action: 'Pause all events until profitable — shift to digital webinars and partnerships', priority: 'immediate' },
];

const SCALING_INDICATORS: ScalingIndicator[] = [
  { signal: 'Monthly Net Profit Margin', threshold: '≥15% for 2 consecutive months', meaning: 'Sustainable profitability confirmed — safe to increase growth investment', status: 'not_ready' },
  { signal: 'Revenue per Employee', threshold: '≥Rp 50M/month per team member', meaning: 'Operational efficiency sufficient to support team expansion', status: 'approaching' },
  { signal: 'CAC Payback Period', threshold: '≤3 months across all channels', meaning: 'Unit economics support aggressive acquisition spend increase', status: 'not_ready' },
  { signal: 'Monthly Recurring Revenue', threshold: '≥Rp 80M from subscriptions alone', meaning: 'Subscription base provides predictable revenue floor for planning', status: 'not_ready' },
  { signal: 'Deal Pipeline Coverage', threshold: '≥3x monthly revenue target in active pipeline', meaning: 'Pipeline depth ensures revenue continuity even with conversion variance', status: 'approaching' },
  { signal: 'Organic Traffic Share', threshold: '≥40% of total leads from organic channels', meaning: 'Reduced dependency on paid acquisition — sustainable growth foundation', status: 'not_ready' },
  { signal: 'Customer Retention Rate', threshold: '≥85% monthly for investors, ≥90% for vendors', meaning: 'Retention levels support confident expansion into new segments', status: 'approaching' },
  { signal: 'Cash Reserve Runway', threshold: '≥6 months of operating expenses in reserve', meaning: 'Financial cushion allows strategic risk-taking in new markets', status: 'not_ready' },
];

const MILESTONE_PHASES: MilestonePhase[] = [
  { phase: 1, title: 'Revenue Ignition Sprint', duration: 'Days 1-10', objective: 'Activate all revenue streams and establish daily revenue tracking discipline', tactics: ['Launch premium listing slots and secure first 5 paying sellers', 'Assign top agents to 3 highest-value pipeline deals with daily check-ins', 'Activate investor subscription trial funnel with targeted outreach', 'Deploy agent featured placement offers to top 15 agents', 'Publish real-time revenue tracker visible to entire team'], exitCriteria: 'Daily revenue run rate ≥Rp 5M and 3+ revenue streams active' },
  { phase: 2, title: 'Cost Compression Blitz', duration: 'Days 8-18', objective: 'Reduce monthly burn rate by 30%+ through systematic cost elimination', tactics: ['Audit and cancel all non-essential SaaS subscriptions', 'Eliminate paid ad channels with CAC >Rp 300K', 'Automate listing verification to reduce manual labor by 60%', 'Pause all event and sponsorship spending', 'Negotiate extended payment terms with vendors'], exitCriteria: 'Monthly cost run rate reduced from Rp 95M to ≤Rp 80M' },
  { phase: 3, title: 'Conversion Maximization', duration: 'Days 15-25', objective: 'Maximize revenue extraction from existing pipeline and user base', tactics: ['Push urgency messaging on all deals stalled >7 days', 'Compress negotiation cycles with daily founder involvement', 'Convert free trial subscribers to paid with exclusive data incentives', 'Activate vendor success fees on all platform-matched jobs', 'Deploy referral incentives to accelerate organic acquisition'], exitCriteria: 'Deal close rate ≥25% and subscription conversion ≥20%' },
  { phase: 4, title: 'Profit Confirmation & Reinvestment', duration: 'Days 22-30', objective: 'Confirm net positive P&L and plan strategic profit reinvestment', tactics: ['Reconcile all revenue and costs for final month-end P&L', 'Document profitability playbook for replication in following months', 'Allocate first Rp 20M profit to high-ROI referral campaign', 'Launch agent profit milestone bonuses for top closers', 'Prepare scaling readiness assessment based on indicators'], exitCriteria: 'Net profit ≥Rp 50M confirmed and reinvestment plan activated' },
];

export function useFirstProfitableMonth() {
  const leversByCategory = (cat: ProfitLever['category']) => LEVERS.filter(l => l.category === cat);
  const totalSavings = COST_OPTIMIZATIONS.reduce((s, c) => {
    const match = c.savingsEstimate.match(/(\d+)/);
    return s + (match ? parseInt(match[1]) : 0);
  }, 0);

  return {
    levers: LEVERS,
    leversByCategory,
    weeklyKPIs: WEEKLY_KPIS,
    costOptimizations: COST_OPTIMIZATIONS,
    scalingIndicators: SCALING_INDICATORS,
    milestonePhases: MILESTONE_PHASES,
    totalSavings,
    categories: ['deals', 'monetization', 'cost', 'momentum'] as const,
  };
}
