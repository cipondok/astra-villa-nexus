export interface RevenueReviewItem {
  metric: string;
  thisWeek: string;
  lastWeek: string;
  target: string;
  trend: 'up' | 'down' | 'stable';
  status: 'on_track' | 'at_risk' | 'exceeded';
  insight: string;
}

export interface LiquiditySignal {
  indicator: string;
  value: string;
  change: string;
  direction: 'positive' | 'negative' | 'neutral';
  interpretation: string;
}

export interface StrategicInitiative {
  id: string;
  initiative: string;
  progress: number;
  impact: 'critical' | 'high' | 'medium';
  status: 'on_track' | 'behind' | 'blocked';
  bottleneck: string | null;
  revenueImpact: string;
  nextAction: string;
}

export interface WeeklyAction {
  id: string;
  priority: number;
  action: string;
  owner: string;
  target: string;
  deadline: string;
  category: 'revenue' | 'growth' | 'operations' | 'team';
}

export interface KPIGuide {
  kpi: string;
  greenZone: string;
  yellowZone: string;
  redZone: string;
  currentValue: string;
  currentStatus: 'green' | 'yellow' | 'red';
  whatItMeans: string;
}

export interface ImprovementTheme {
  phase: string;
  duration: string;
  focus: string;
  actions: string[];
  outcome: string;
}

export interface ChecklistItem {
  id: string;
  section: string;
  item: string;
  timing: string;
}

const REVENUE_REVIEW: RevenueReviewItem[] = [
  { metric: 'Deals Closed', thisWeek: '6', lastWeek: '4', target: '5', trend: 'up', status: 'exceeded', insight: '2 premium deals (>Rp 8B) closed — 50% above target. Agent Maya closed 3 deals solo.' },
  { metric: 'Commission Revenue', thisWeek: 'Rp 580M', lastWeek: 'Rp 380M', target: 'Rp 450M', trend: 'up', status: 'exceeded', insight: 'High-value deal concentration strategy driving 53% increase vs last week.' },
  { metric: 'Pipeline Closing Value', thisWeek: 'Rp 2.8B', lastWeek: 'Rp 2.1B', target: 'Rp 2.5B', trend: 'up', status: 'on_track', insight: '8 deals in negotiation/closing stage — 3 expected to close next week.' },
  { metric: 'Subscription Revenue (MRR)', thisWeek: 'Rp 42M', lastWeek: 'Rp 35M', target: 'Rp 50M', trend: 'up', status: 'at_risk', insight: 'Trial-to-paid conversion at 22% — below 25% target. Nurture sequence needs optimization.' },
  { metric: 'Premium Slot Revenue', thisWeek: 'Rp 28M', lastWeek: 'Rp 22M', target: 'Rp 30M', trend: 'up', status: 'on_track', insight: '14 premium slots filled of 20 capacity. Platinum tier underperforming — pricing review needed.' },
  { metric: 'Vendor Commission Income', thisWeek: 'Rp 12M', lastWeek: 'Rp 8M', target: 'Rp 15M', trend: 'up', status: 'at_risk', insight: 'Collection rate at 88% — 4 vendor invoices overdue. Follow-up required.' },
];

const LIQUIDITY_SIGNALS: LiquiditySignal[] = [
  { indicator: 'New Listings Added', value: '34', change: '+12 vs last week', direction: 'positive', interpretation: 'Supply growth accelerating — agent recruitment driving listing volume. Quality mix: 60% premium, 40% standard.' },
  { indicator: 'Active Investor Sessions', value: '892', change: '+18% WoW', direction: 'positive', interpretation: 'Investor engagement rising. Deal alert click-through rate improved to 32% after personalization update.' },
  { indicator: 'Inquiry Volume', value: '156', change: '+8% WoW', direction: 'positive', interpretation: 'Demand growth steady. Top 3 districts: Seminyak (28%), Sudirman (22%), BSD (15%).' },
  { indicator: 'Viewing Booking Rate', value: '62%', change: '+4pp vs last week', direction: 'positive', interpretation: 'Improved scheduling flow reducing friction. Mobile booking now 55% of total.' },
  { indicator: 'Avg Days on Market', value: '28d', change: '-3d vs last month', direction: 'positive', interpretation: 'Liquidity improving — pricing accuracy and deal velocity both contributing.' },
  { indicator: 'Demand Heat Index', value: '7.4/10', change: '+0.6 vs last week', direction: 'positive', interpretation: 'Market momentum strong. Seasonal demand uplift expected to continue for 4-6 weeks.' },
];

const STRATEGIC_INITIATIVES: StrategicInitiative[] = [
  { id: 'si1', initiative: 'Premium Deal Pipeline Concentration', progress: 78, impact: 'critical', status: 'on_track', bottleneck: null, revenueImpact: 'Rp 400-600M/month', nextAction: 'Assign 2 additional elite agents to >Rp 10B pipeline' },
  { id: 'si2', initiative: 'Investor Subscription Launch', progress: 65, impact: 'critical', status: 'behind', bottleneck: 'Trial-to-paid conversion below target', revenueImpact: 'Rp 40-80M/month', nextAction: 'Deploy optimized onboarding email sequence by Wednesday' },
  { id: 'si3', initiative: 'Corporate HR Partnership Program', progress: 35, impact: 'high', status: 'behind', bottleneck: 'Only 1 of 5 target partnerships activated', revenueImpact: 'Rp 50-120M/month', nextAction: 'Founder personal outreach to 3 HR directors this week' },
  { id: 'si4', initiative: 'Agent Performance Optimization', progress: 72, impact: 'high', status: 'on_track', bottleneck: null, revenueImpact: 'Conversion uplift 15-25%', nextAction: 'Deploy coaching recommendations for bottom 3 agents' },
  { id: 'si5', initiative: 'Vendor Marketplace Commission Scaling', progress: 48, impact: 'medium', status: 'blocked', bottleneck: 'Commission collection automation not yet live', revenueImpact: 'Rp 15-30M/month', nextAction: 'Prioritize automated invoicing feature — ship by Friday' },
  { id: 'si6', initiative: 'Referral Growth Loop Activation', progress: 55, impact: 'high', status: 'on_track', bottleneck: null, revenueImpact: 'CAC reduction 35-45%', nextAction: 'Launch agent referral bonus tier — announce at Monday stand-up' },
];

const WEEKLY_ACTIONS: WeeklyAction[] = [
  { id: 'wa1', priority: 1, action: 'Close 3 pipeline-ready premium deals (>Rp 8B each)', owner: 'Founder + Elite Agents', target: 'Rp 600M+ commission', deadline: 'Friday EOD', category: 'revenue' },
  { id: 'wa2', priority: 2, action: 'Fix subscription trial-to-paid conversion — deploy new onboarding flow', owner: 'Product + Growth', target: 'Conversion ≥25%', deadline: 'Wednesday', category: 'revenue' },
  { id: 'wa3', priority: 3, action: 'Personal outreach to 3 corporate HR directors for housing partnerships', owner: 'Founder', target: '≥1 LOI signed', deadline: 'Thursday', category: 'growth' },
  { id: 'wa4', priority: 4, action: 'Ship automated vendor commission invoicing feature', owner: 'Engineering', target: 'Auto-collection live', deadline: 'Friday', category: 'operations' },
  { id: 'wa5', priority: 5, action: 'Deploy coaching recommendations for bottom 3 agents by performance score', owner: 'Sales Lead', target: 'Response time <30min', deadline: 'Tuesday', category: 'team' },
  { id: 'wa6', priority: 6, action: 'Launch agent referral bonus tier and announce at Monday stand-up', owner: 'Growth + Sales Lead', target: '≥5 referrals this week', deadline: 'Monday', category: 'growth' },
  { id: 'wa7', priority: 7, action: 'Review and follow up on 4 overdue vendor invoices', owner: 'Finance', target: '100% collection', deadline: 'Wednesday', category: 'operations' },
];

const KPI_GUIDES: KPIGuide[] = [
  { kpi: 'Weekly Deals Closed', greenZone: '≥5', yellowZone: '3-4', redZone: '<3', currentValue: '6', currentStatus: 'green', whatItMeans: 'Deal closing cadence is healthy and exceeding target. Maintain agent allocation discipline.' },
  { kpi: 'Weekly Commission Revenue', greenZone: '≥Rp 450M', yellowZone: 'Rp 300-450M', redZone: '<Rp 300M', currentValue: 'Rp 580M', currentStatus: 'green', whatItMeans: 'Revenue momentum strong — high-value deal concentration is working. Watch for pipeline depth.' },
  { kpi: 'Pipeline Coverage Ratio', greenZone: '≥3x target', yellowZone: '2-3x target', redZone: '<2x target', currentValue: '2.8x', currentStatus: 'yellow', whatItMeans: 'Pipeline depth is adequate but needs strengthening. Increase prospecting effort this week.' },
  { kpi: 'Subscription MRR Growth', greenZone: '≥20% MoM', yellowZone: '10-20% MoM', redZone: '<10% MoM', currentValue: '18% MoM', currentStatus: 'yellow', whatItMeans: 'Growing but below aggressive target. Trial conversion is the bottleneck — fix onboarding flow.' },
  { kpi: 'Agent Avg Response Time', greenZone: '<30 min', yellowZone: '30-60 min', redZone: '>60 min', currentValue: '34 min', currentStatus: 'yellow', whatItMeans: 'Slightly above target — 2 agents dragging average. Deploy coaching intervention.' },
  { kpi: 'Investor Engagement Rate', greenZone: '≥30%', yellowZone: '20-30%', redZone: '<20%', currentValue: '32%', currentStatus: 'green', whatItMeans: 'Deal alert personalization driving strong engagement. Maintain and expand segmentation.' },
  { kpi: 'Listing Quality Score', greenZone: '≥8/10', yellowZone: '6-8/10', redZone: '<6/10', currentValue: '7.8/10', currentStatus: 'yellow', whatItMeans: 'Photography quality improving but description completeness needs attention. Deploy AI assist.' },
];

const IMPROVEMENT_ROADMAP: ImprovementTheme[] = [
  { phase: 'Week 1-2', duration: 'Foundation', focus: 'Establish weekly rhythm and baseline metrics', actions: ['Set up automated KPI collection dashboard', 'Define green/yellow/red thresholds for all metrics', 'Run first 2 weekly reviews with full checklist', 'Calibrate time allocation across review sections'], outcome: 'Consistent weekly review habit established with reliable data flow' },
  { phase: 'Week 3-4', duration: 'Optimization', focus: 'Refine review efficiency and action quality', actions: ['Reduce review time from 90min to 60min through better preparation', 'Improve action item specificity and measurability', 'Add team accountability follow-up to each review', 'Start tracking action completion rate (target ≥85%)'], outcome: 'Reviews producing higher-quality decisions in less time' },
  { phase: 'Month 2', duration: 'Acceleration', focus: 'Connect weekly reviews to monthly strategic planning', actions: ['Aggregate weekly data into monthly trend analysis', 'Identify recurring bottlenecks and systemic fixes', 'Introduce 30-day look-ahead planning in reviews', 'Deploy predictive alerts for KPI drift detection'], outcome: 'Weekly execution connected to strategic trajectory with early warning system' },
  { phase: 'Month 3+', duration: 'Delegation', focus: 'Scale review discipline across leadership team', actions: ['Train department leads to run their own weekly reviews', 'Founder review shifts to strategic oversight only', 'Implement cascading OKR alignment check in reviews', 'Establish quarterly deep-dive strategy sessions'], outcome: 'Execution discipline embedded in organizational culture beyond founder dependency' },
];

const REVIEW_CHECKLIST: ChecklistItem[] = [
  { id: 'rc1', section: 'Pre-Review Prep', item: 'Pull automated KPI dashboard snapshot', timing: 'Sunday evening or Monday 7AM' },
  { id: 'rc2', section: 'Pre-Review Prep', item: 'Collect agent deal reports from previous week', timing: 'Sunday evening' },
  { id: 'rc3', section: 'Pre-Review Prep', item: 'Review last week action items completion status', timing: 'Monday 7:30AM' },
  { id: 'rc4', section: 'Revenue Review', item: 'Analyze deals closed vs target and commission revenue', timing: '15 min' },
  { id: 'rc5', section: 'Revenue Review', item: 'Assess subscription and premium slot revenue trends', timing: '10 min' },
  { id: 'rc6', section: 'Revenue Review', item: 'Review pipeline value and expected closings next week', timing: '10 min' },
  { id: 'rc7', section: 'Liquidity Review', item: 'Check new listings added and quality distribution', timing: '5 min' },
  { id: 'rc8', section: 'Liquidity Review', item: 'Evaluate investor engagement and demand heat signals', timing: '10 min' },
  { id: 'rc9', section: 'Strategic Alignment', item: 'Score progress on top 5 strategic initiatives', timing: '15 min' },
  { id: 'rc10', section: 'Strategic Alignment', item: 'Identify and address top 3 bottlenecks', timing: '10 min' },
  { id: 'rc11', section: 'Strategic Alignment', item: 'Decide resource reallocation if needed', timing: '5 min' },
  { id: 'rc12', section: 'Action Planning', item: 'Define top 7 priority actions for next week', timing: '10 min' },
  { id: 'rc13', section: 'Action Planning', item: 'Assign owners, targets, and deadlines to each action', timing: '5 min' },
  { id: 'rc14', section: 'Action Planning', item: 'Communicate priorities to team via Monday stand-up', timing: '10 min' },
];

export function useFounderWeeklyExecution() {
  const checklistSections = [...new Set(REVIEW_CHECKLIST.map(c => c.section))];
  const checklistBySection = (section: string) => REVIEW_CHECKLIST.filter(c => c.section === section);

  return {
    revenueReview: REVENUE_REVIEW,
    liquiditySignals: LIQUIDITY_SIGNALS,
    strategicInitiatives: STRATEGIC_INITIATIVES,
    weeklyActions: WEEKLY_ACTIONS,
    kpiGuides: KPI_GUIDES,
    improvementRoadmap: IMPROVEMENT_ROADMAP,
    reviewChecklist: REVIEW_CHECKLIST,
    checklistSections,
    checklistBySection,
  };
}
