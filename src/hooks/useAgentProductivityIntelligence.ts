export interface ProductivitySignal {
  id: string;
  signal: string;
  weight: number;
  benchmark: string;
  measurement: string;
  impact: string;
}

export interface ProductivityTier {
  tier: string;
  range: string;
  color: string;
  description: string;
  privileges: string[];
}

export interface CoachingAlert {
  trigger: string;
  condition: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  automatedAction: string;
}

export interface IncentiveTrigger {
  event: string;
  threshold: string;
  reward: string;
  frequency: string;
}

export interface LeadAllocationRule {
  agentTier: string;
  leadPriority: string;
  maxConcurrent: number;
  reassignAfter: string;
}

export interface PerformanceKPI {
  label: string;
  benchmark: string;
  elite: string;
  unit: string;
  status: 'excellent' | 'good' | 'caution' | 'critical';
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  initiatives: string[];
  successMetric: string;
}

const SIGNALS: ProductivitySignal[] = [
  { id: 's1', signal: 'Lead Response Time', weight: 25, benchmark: '<2 hours', measurement: 'Avg minutes from inquiry to first agent response', impact: '+30% conversion when response <30min vs >2h' },
  { id: 's2', signal: 'Viewing Scheduling Rate', weight: 20, benchmark: '≥45% of inquiries', measurement: 'Percentage of inquiries converted to scheduled viewings', impact: '+22% deal pipeline density per 10% improvement' },
  { id: 's3', signal: 'Negotiation Cycle Duration', weight: 15, benchmark: '≤14 days avg', measurement: 'Days from first offer to deal acceptance or rejection', impact: '-18% deal abandonment per 5-day reduction' },
  { id: 's4', signal: 'Deals Closed / Month', weight: 25, benchmark: '≥4 deals/month', measurement: 'Verified completed transactions per calendar month', impact: 'Primary revenue contribution metric' },
  { id: 's5', signal: 'Customer Satisfaction', weight: 15, benchmark: '≥4.5/5.0 rating', measurement: 'Post-transaction survey average score', impact: '+35% referral generation from 4.5+ rated agents' },
];

const TIERS: ProductivityTier[] = [
  { tier: 'Elite', range: '85–100', color: 'text-emerald-400', description: 'Top performers with exceptional conversion and response metrics', privileges: ['Priority lead allocation for high-value deals', 'Featured agent badge on listings', 'Reduced commission split (higher agent share)', 'Access to exclusive developer listings'] },
  { tier: 'High Performer', range: '70–84', color: 'text-blue-400', description: 'Consistent above-average agents meeting all core benchmarks', privileges: ['Standard priority lead allocation', 'Performance bonus eligibility', 'Quarterly recognition rewards', 'Advanced analytics dashboard access'] },
  { tier: 'Standard', range: '50–69', color: 'text-amber-400', description: 'Meeting minimum benchmarks with improvement opportunities', privileges: ['Regular lead allocation rotation', 'Coaching program enrollment', 'Basic analytics access', 'Monthly performance reviews'] },
  { tier: 'Development', range: '0–49', color: 'text-red-400', description: 'Below benchmark — requires immediate coaching intervention', privileges: ['Reduced lead allocation volume', 'Mandatory training program participation', 'Weekly performance check-ins', 'Probationary monitoring period'] },
];

const COACHING_ALERTS: CoachingAlert[] = [
  { trigger: 'Response SLA Breach', condition: 'Avg response time >4 hours for 3+ consecutive days', recommendation: 'Review notification settings — enable push alerts; consider inquiry load reduction', priority: 'critical', automatedAction: 'Redistribute new leads to faster-responding agents temporarily' },
  { trigger: 'Viewing Conversion Drop', condition: 'Viewing rate drops >15% from 30-day average', recommendation: 'Audit listing presentation quality; review inquiry follow-up scripts', priority: 'high', automatedAction: 'Send agent refresher training module link + schedule manager call' },
  { trigger: 'Deal Stall Pattern', condition: '3+ deals inactive >7 days in negotiation stage', recommendation: 'Apply structured negotiation acceleration framework; consider price adjustment guidance', priority: 'high', automatedAction: 'Trigger stall resolution checklist notification to agent' },
  { trigger: 'Satisfaction Decline', condition: 'CSAT drops below 4.0 for 2 consecutive months', recommendation: 'Conduct client communication audit; assign mentorship with Elite agent', priority: 'medium', automatedAction: 'Flag for quality review and pair with top-performer shadow program' },
  { trigger: 'Low Activity Period', condition: '<2 viewings scheduled in past 7 days', recommendation: 'Proactive outreach to dormant leads; review pipeline health', priority: 'medium', automatedAction: 'Auto-send curated lead list with suggested follow-up actions' },
  { trigger: 'Conversion Excellence', condition: 'Close rate >60% for 30-day period', recommendation: 'Nominate for Elite tier promotion; increase lead allocation', priority: 'low', automatedAction: 'Send congratulations + unlock priority deal queue access' },
];

const INCENTIVE_TRIGGERS: IncentiveTrigger[] = [
  { event: 'Monthly Deal Target Exceeded', threshold: '≥6 deals in calendar month', reward: 'Bonus commission +0.5% on all deals that month', frequency: 'Monthly reset' },
  { event: 'Perfect Response SLA Week', threshold: '100% responses <2h for 7 days', reward: 'Priority lead allocation for following week', frequency: 'Weekly evaluation' },
  { event: 'Client Satisfaction Streak', threshold: '5 consecutive 5-star reviews', reward: 'Featured Agent badge + Rp 2M performance bonus', frequency: 'Rolling evaluation' },
  { event: 'High-Value Deal Closure', threshold: 'Deal value >Rp 10B closed', reward: 'Premium commission tier unlock for 30 days', frequency: 'Per transaction' },
  { event: 'Referral Generation', threshold: '3+ referral leads converted in month', reward: 'Referral champion badge + Rp 1.5M bonus', frequency: 'Monthly evaluation' },
  { event: 'Fastest Close Record', threshold: 'Deal closed in <14 days from first viewing', reward: 'Speed bonus Rp 1M + leaderboard highlight', frequency: 'Per transaction' },
];

const LEAD_ALLOCATION: LeadAllocationRule[] = [
  { agentTier: 'Elite', leadPriority: 'High-value investor leads (>Rp 5B)', maxConcurrent: 12, reassignAfter: '4 hours no response' },
  { agentTier: 'High Performer', leadPriority: 'Standard qualified leads', maxConcurrent: 8, reassignAfter: '3 hours no response' },
  { agentTier: 'Standard', leadPriority: 'General inquiry leads', maxConcurrent: 5, reassignAfter: '2 hours no response' },
  { agentTier: 'Development', leadPriority: 'Training-appropriate leads only', maxConcurrent: 3, reassignAfter: '1 hour no response' },
];

const KPIS: PerformanceKPI[] = [
  { label: 'Avg Response Time', benchmark: '<2 hours', elite: '<30 min', unit: 'minutes', status: 'good' },
  { label: 'Inquiry-to-Viewing Rate', benchmark: '≥45%', elite: '≥65%', unit: '%', status: 'caution' },
  { label: 'Viewing-to-Offer Rate', benchmark: '≥25%', elite: '≥40%', unit: '%', status: 'good' },
  { label: 'Offer-to-Close Rate', benchmark: '≥50%', elite: '≥70%', unit: '%', status: 'good' },
  { label: 'Deals Closed / Month', benchmark: '≥4', elite: '≥8', unit: 'deals', status: 'caution' },
  { label: 'Avg Negotiation Duration', benchmark: '≤14 days', elite: '≤8 days', unit: 'days', status: 'good' },
  { label: 'Customer Satisfaction', benchmark: '≥4.5/5.0', elite: '≥4.8/5.0', unit: 'rating', status: 'excellent' },
  { label: 'Revenue per Agent', benchmark: '≥Rp 40M/month', elite: '≥Rp 80M/month', unit: 'IDR', status: 'caution' },
  { label: 'Lead Utilization Rate', benchmark: '≥70%', elite: '≥90%', unit: '%', status: 'good' },
  { label: 'Referral Generation Rate', benchmark: '≥10%', elite: '≥25%', unit: '% of clients', status: 'good' },
];

const ROADMAP: RoadmapPhase[] = [
  { phase: 1, title: 'Measurement Foundation', duration: 'Weeks 1–3', initiatives: ['Deploy response time tracking across all inquiry channels', 'Implement viewing scheduling rate monitoring', 'Launch post-transaction CSAT survey automation', 'Build agent productivity score calculation engine'], successMetric: 'All 5 productivity signals tracked for 100% of active agents' },
  { phase: 2, title: 'Coaching & Alerts', duration: 'Weeks 4–6', initiatives: ['Activate automated coaching recommendation alerts', 'Deploy SLA breach detection and notification system', 'Launch agent performance dashboard with real-time metrics', 'Implement tier classification with privilege differentiation'], successMetric: 'Coaching alerts active + 80% of agents accessing dashboard weekly' },
  { phase: 3, title: 'Incentive & Allocation', duration: 'Weeks 7–9', initiatives: ['Launch incentive trigger automation for top performers', 'Deploy intelligent lead allocation based on agent tier', 'Activate leaderboard with weekly and monthly rankings', 'Implement reassignment logic for unresponsive agents'], successMetric: 'Lead allocation tier-based + incentive payouts processing automatically' },
  { phase: 4, title: 'Optimization & Scaling', duration: 'Weeks 10–12', initiatives: ['A/B test coaching intervention effectiveness', 'Analyze incentive ROI and adjust reward thresholds', 'Expand scoring model with behavioral signals', 'Prepare multi-city agent productivity benchmarking'], successMetric: 'Measurable +15% avg productivity score improvement across agent base' },
];

export function useAgentProductivityIntelligence() {
  return {
    signals: SIGNALS,
    tiers: TIERS,
    coachingAlerts: COACHING_ALERTS,
    incentiveTriggers: INCENTIVE_TRIGGERS,
    leadAllocation: LEAD_ALLOCATION,
    kpis: KPIS,
    roadmap: ROADMAP,
  };
}
