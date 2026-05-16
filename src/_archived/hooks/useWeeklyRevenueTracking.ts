export interface WeeklyMetric {
  label: string;
  value: string;
  delta: number;
  benchmark: string;
  status: 'excellent' | 'good' | 'caution' | 'critical';
  interpretation: string;
}

export interface CorrectiveAction {
  priority: 'P0' | 'P1' | 'P2';
  trigger: string;
  action: string;
  owner: string;
  deadline: string;
}

export interface ReviewStep {
  time: string;
  activity: string;
  duration: string;
  output: string;
}

export interface WeeklyDomain {
  id: string;
  title: string;
  icon: string;
  metrics: WeeklyMetric[];
}

function classify(value: number, thresholds: [number, number, number]): WeeklyMetric['status'] {
  if (value >= thresholds[0]) return 'excellent';
  if (value >= thresholds[1]) return 'good';
  if (value >= thresholds[2]) return 'caution';
  return 'critical';
}

export function useWeeklyRevenueTracking() {
  const domains: WeeklyDomain[] = [
    {
      id: 'transactions',
      title: 'Transaction Income',
      icon: 'banknote',
      metrics: [
        { label: 'Deals Closed This Week', value: '3', delta: 50, benchmark: '≥2/week', status: classify(3, [4, 2, 1]), interpretation: 'On track — 3 deals exceeds the 2/week minimum. Sustain agent follow-up velocity.' },
        { label: 'Commission Revenue', value: 'Rp 127M', delta: 22.5, benchmark: '≥Rp 100M/week', status: classify(127, [150, 100, 50]), interpretation: 'Healthy commission income. Push for 1 more high-value deal to hit Rp 150M stretch target.' },
        { label: 'Pipeline Expected Close', value: 'Rp 340M', delta: -8.2, benchmark: '≥Rp 400M', status: classify(340, [400, 300, 150]), interpretation: 'Pipeline slightly soft — accelerate 2-3 stalled negotiations to rebuild closing funnel.' },
        { label: 'Avg Deal Commission', value: 'Rp 42.3M', delta: 5.1, benchmark: '≥Rp 35M', status: classify(42.3, [50, 35, 20]), interpretation: 'Commission per deal is healthy. Focus agent allocation on properties >Rp 3B for maximum yield.' },
      ],
    },
    {
      id: 'subscriptions',
      title: 'Subscription Monetization',
      icon: 'credit-card',
      metrics: [
        { label: 'New Premium Activations', value: '8', delta: 33.3, benchmark: '≥5/week', status: classify(8, [10, 5, 2]), interpretation: 'Strong activation week. Identify which channel drove the most conversions for doubling down.' },
        { label: 'Churn Signals Detected', value: '2', delta: -50, benchmark: '≤3/week', status: classify(5 - 2, [4, 2, 0]), interpretation: 'Low churn risk this week. Proactively reach out to the 2 flagged accounts with retention offers.' },
        { label: 'MRR Growth', value: 'Rp 4.2M', delta: 12.8, benchmark: '≥Rp 3M/week', status: classify(4.2, [5, 3, 1]), interpretation: 'MRR growing steadily. Upsell Pro → Enterprise for 3 high-usage investor accounts.' },
        { label: 'Upsell Conversion Rate', value: '18%', delta: 2.4, benchmark: '≥15%', status: classify(18, [25, 15, 8]), interpretation: 'Upsell rate is above baseline. Test bundled pricing to push toward 25% target.' },
      ],
    },
    {
      id: 'premium-listings',
      title: 'Premium Listing Revenue',
      icon: 'star',
      metrics: [
        { label: 'Visibility Slots Sold', value: '14', delta: 16.7, benchmark: '≥10/week', status: classify(14, [15, 10, 5]), interpretation: 'Near stretch target. Launch a flash promotion for remaining inventory this week.' },
        { label: 'Premium Slot Revenue', value: 'Rp 21M', delta: 10.5, benchmark: '≥Rp 15M/week', status: classify(21, [25, 15, 8]), interpretation: 'Solid premium revenue. Consider introducing tiered pricing (Standard, Featured, Spotlight).' },
        { label: 'ROI per Listing Upgrade', value: '3.2x', delta: 8.1, benchmark: '≥2.5x', status: classify(3.2, [4, 2.5, 1.5]), interpretation: 'Upgrades delivering strong returns. Use this data in seller marketing to increase adoption.' },
        { label: 'Upgrade Adoption Rate', value: '22%', delta: 3.8, benchmark: '≥20%', status: classify(22, [30, 20, 10]), interpretation: 'Above baseline. Target agents with listings >30 days on market for upgrade nudges.' },
      ],
    },
    {
      id: 'growth-efficiency',
      title: 'Growth Efficiency',
      icon: 'trending-up',
      metrics: [
        { label: 'Blended CAC', value: 'Rp 95K', delta: -5.2, benchmark: '≤Rp 120K', status: classify(120 - 95, [30, 15, 0]), interpretation: 'CAC well within target. Maintain current channel mix; reallocate budget from underperforming ads.' },
        { label: 'Campaign ROI', value: '2.8x', delta: 12.0, benchmark: '≥2x', status: classify(2.8, [3, 2, 1]), interpretation: 'Campaigns profitable. Double spend on top 2 campaigns; pause bottom performer.' },
        { label: 'Referral Revenue Share', value: '14%', delta: 2.1, benchmark: '≥10%', status: classify(14, [20, 10, 5]), interpretation: 'Referrals contributing meaningfully. Boost referral reward by 20% for next 2 weeks as experiment.' },
        { label: 'Revenue per Headcount', value: 'Rp 48M', delta: 6.7, benchmark: '≥Rp 40M', status: classify(48, [60, 40, 25]), interpretation: 'Team productivity healthy. Avoid headcount expansion until revenue/head exceeds Rp 60M.' },
      ],
    },
  ];

  const correctiveActions: CorrectiveAction[] = [
    { priority: 'P0', trigger: 'Deals closed < 1/week', action: 'Founder personally intervenes on top 3 pipeline deals — direct buyer/seller outreach', owner: 'Founder', deadline: 'Within 24 hours' },
    { priority: 'P0', trigger: 'Commission revenue < Rp 50M/week', action: 'Emergency agent performance review + reassign top agents to highest-value properties', owner: 'Sales Lead', deadline: 'Same day' },
    { priority: 'P0', trigger: 'Churn signals > 5/week', action: 'Activate retention protocol — personal calls to at-risk accounts + offer extensions', owner: 'CS Lead', deadline: 'Within 48 hours' },
    { priority: 'P1', trigger: 'Pipeline < Rp 200M', action: 'Launch listing blitz campaign — onboard 20 new properties in target price range', owner: 'Supply Team', deadline: '3 business days' },
    { priority: 'P1', trigger: 'Premium slots sold < 5/week', action: 'Offer 48-hour flash discount on visibility slots + agent outreach push', owner: 'Monetization', deadline: '2 business days' },
    { priority: 'P1', trigger: 'Upsell rate < 10%', action: 'Redesign upsell flow — test new pricing anchors and benefit messaging', owner: 'Product', deadline: '1 week' },
    { priority: 'P2', trigger: 'CAC exceeds Rp 150K', action: 'Pause lowest-ROI ad campaigns and shift budget to organic/referral channels', owner: 'Marketing', deadline: '1 week' },
    { priority: 'P2', trigger: 'Referral share < 5%', action: 'Boost referral incentive by 30% and launch agent referral competition', owner: 'Growth', deadline: '1 week' },
  ];

  const reviewRitual: ReviewStep[] = [
    { time: 'Monday 08:00', activity: 'Pull weekly revenue snapshot', duration: '15 min', output: 'Revenue summary email to leadership' },
    { time: 'Monday 08:15', activity: 'Review KPI status vs thresholds', duration: '10 min', output: 'Flag any metrics in caution/critical zone' },
    { time: 'Monday 08:30', activity: 'Identify top corrective actions', duration: '15 min', output: 'Prioritized action list with owners & deadlines' },
    { time: 'Monday 09:00', activity: 'Revenue standup with team leads', duration: '20 min', output: 'Aligned weekly priorities + accountability assignments' },
    { time: 'Wednesday 14:00', activity: 'Mid-week pipeline health check', duration: '10 min', output: 'Updated deal status + intervention decisions' },
    { time: 'Friday 16:00', activity: 'Week-close revenue review', duration: '15 min', output: 'Final weekly scorecard + next week focus areas' },
  ];

  const thresholdGuide = [
    { status: 'excellent' as const, color: 'emerald', label: 'Exceeding Target', guidance: 'Sustain and scale — document what\'s working and increase investment in this area.' },
    { status: 'good' as const, color: 'blue', label: 'On Track', guidance: 'Maintain momentum — no immediate action required but watch for softening trends.' },
    { status: 'caution' as const, color: 'amber', label: 'Below Target', guidance: 'Investigate root cause within 48 hours — prepare corrective action if trend continues.' },
    { status: 'critical' as const, color: 'red', label: 'Urgent Intervention', guidance: 'Immediate founder attention — activate P0 corrective action protocol.' },
  ];

  return { domains, correctiveActions, reviewRitual, thresholdGuide };
}
