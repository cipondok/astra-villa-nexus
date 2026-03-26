export interface PipelineStage {
  stage: string;
  count: number;
  value: string;
  trend: 'up' | 'down' | 'stable';
  avgDaysInStage: number;
}

export interface ConversionMetric {
  label: string;
  rate: number;
  target: number;
  trend: 'improving' | 'declining' | 'stable';
  volume: string;
}

export interface RevenueSnapshot {
  metric: string;
  value: string;
  status: 'on_track' | 'at_risk' | 'exceeded';
  detail: string;
}

export interface DealAlert {
  id: string;
  dealName: string;
  value: string;
  issue: string;
  stalledDays: number;
  severity: 'critical' | 'warning' | 'info';
  action: string;
  agent: string;
}

export interface AgentScore {
  name: string;
  followUpsCompleted: number;
  followUpsTotal: number;
  dealsProgressed: number;
  responseTime: string;
  score: number;
}

export interface ReviewRitual {
  time: string;
  activity: string;
  duration: string;
  participants: string;
  output: string;
}

export interface AlertThreshold {
  metric: string;
  green: string;
  yellow: string;
  red: string;
  currentStatus: 'green' | 'yellow' | 'red';
}

export interface PriorityRule {
  priority: number;
  condition: string;
  action: string;
  escalation: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { stage: 'New Inquiries', count: 47, value: 'Rp 185B', trend: 'up', avgDaysInStage: 1.2 },
  { stage: 'Viewing Scheduled', count: 28, value: 'Rp 112B', trend: 'stable', avgDaysInStage: 2.8 },
  { stage: 'Viewing Completed', count: 19, value: 'Rp 78B', trend: 'up', avgDaysInStage: 1.5 },
  { stage: 'Offer Submitted', count: 12, value: 'Rp 52B', trend: 'stable', avgDaysInStage: 3.4 },
  { stage: 'Negotiation Active', count: 8, value: 'Rp 38B', trend: 'down', avgDaysInStage: 6.2 },
  { stage: 'Payment Initiated', count: 4, value: 'Rp 18B', trend: 'up', avgDaysInStage: 2.1 },
  { stage: 'Closing / Legal', count: 3, value: 'Rp 14B', trend: 'stable', avgDaysInStage: 4.8 },
];

const CONVERSION_METRICS: ConversionMetric[] = [
  { label: 'Inquiry → Viewing', rate: 59.6, target: 55, trend: 'improving', volume: '28 of 47 inquiries' },
  { label: 'Viewing → Offer', rate: 63.2, target: 50, trend: 'improving', volume: '12 of 19 viewings' },
  { label: 'Offer → Closing', rate: 58.3, target: 45, trend: 'stable', volume: '7 of 12 offers' },
  { label: 'End-to-End (Inquiry → Close)', rate: 14.9, target: 12, trend: 'improving', volume: '7 of 47 inquiries' },
];

const REVENUE_SNAPSHOTS: RevenueSnapshot[] = [
  { metric: 'Expected Commissions Today', value: 'Rp 420M', status: 'on_track', detail: '2 deals in final closing stage — combined value Rp 14B at 3% commission' },
  { metric: 'Weekly Revenue Pace', value: 'Rp 1.8B / Rp 1.5B target', status: 'exceeded', detail: 'Tracking 120% of weekly target with 2 business days remaining' },
  { metric: 'Premium Upsell Pipeline', value: 'Rp 35M potential', status: 'on_track', detail: '8 listings eligible for Platinum visibility upgrade, 3 agents pitched' },
  { metric: 'At-Risk Revenue', value: 'Rp 280M', status: 'at_risk', detail: '3 deals stalled >5 days — requires immediate escalation to prevent loss' },
];

const DEAL_ALERTS: DealAlert[] = [
  { id: 'da1', dealName: 'Villa Seminyak Ocean View', value: 'Rp 12.5B', issue: 'Buyer unresponsive after counter-offer', stalledDays: 8, severity: 'critical', action: 'Founder direct call — present market urgency data', agent: 'Agent Budi' },
  { id: 'da2', dealName: 'Apartment Sudirman Premium', value: 'Rp 6.8B', issue: 'Price gap >10% between buyer and seller expectations', stalledDays: 6, severity: 'critical', action: 'Deploy comparable sales report + propose split-the-difference strategy', agent: 'Agent Maya' },
  { id: 'da3', dealName: 'Land Canggu 800sqm', value: 'Rp 8.2B', issue: 'Legal verification pending — notary delay', stalledDays: 5, severity: 'warning', action: 'Follow up with notary office — escalate to backup notary if no response by EOD', agent: 'Agent Riko' },
  { id: 'da4', dealName: 'Townhouse BSD Premium', value: 'Rp 4.5B', issue: 'Buyer requested mortgage pre-approval extension', stalledDays: 3, severity: 'warning', action: 'Connect buyer with partner bank fast-track process', agent: 'Agent Sari' },
  { id: 'da5', dealName: 'Penthouse Kelapa Gading', value: 'Rp 15B', issue: 'Viewing completed — no follow-up sent', stalledDays: 2, severity: 'info', action: 'Send personalized ROI analysis within 4 hours', agent: 'Agent Dimas' },
];

const AGENT_SCORES: AgentScore[] = [
  { name: 'Agent Maya', followUpsCompleted: 12, followUpsTotal: 14, dealsProgressed: 3, responseTime: '18 min', score: 94 },
  { name: 'Agent Budi', followUpsCompleted: 9, followUpsTotal: 11, dealsProgressed: 2, responseTime: '32 min', score: 82 },
  { name: 'Agent Dimas', followUpsCompleted: 7, followUpsTotal: 12, dealsProgressed: 2, responseTime: '45 min', score: 71 },
  { name: 'Agent Sari', followUpsCompleted: 10, followUpsTotal: 10, dealsProgressed: 1, responseTime: '22 min', score: 88 },
  { name: 'Agent Riko', followUpsCompleted: 5, followUpsTotal: 9, dealsProgressed: 1, responseTime: '55 min', score: 62 },
];

const REVIEW_RITUALS: ReviewRitual[] = [
  { time: '08:00', activity: 'Morning Pipeline Scan', duration: '10 min', participants: 'Founder + Sales Lead', output: 'Top 5 priority deals identified, stalled deals flagged' },
  { time: '10:00', activity: 'Agent Stand-Up Sync', duration: '15 min', participants: 'All active agents', output: 'Each agent commits to 3 actions, blockers surfaced' },
  { time: '13:00', activity: 'Mid-Day Revenue Pulse', duration: '5 min', participants: 'Founder solo review', output: 'Revenue pace check, escalation decisions made' },
  { time: '16:00', activity: 'Stalled Deal Intervention', duration: '20 min', participants: 'Founder + assigned agents', output: 'Direct outreach on critical stalled deals, strategy adjustments' },
  { time: '18:00', activity: 'End-of-Day Scorecard', duration: '10 min', participants: 'Founder + Sales Lead', output: 'Daily metrics logged, tomorrow prep actions queued' },
];

const ALERT_THRESHOLDS: AlertThreshold[] = [
  { metric: 'Inquiry → Viewing Rate', green: '≥55%', yellow: '40-55%', red: '<40%', currentStatus: 'green' },
  { metric: 'Viewing → Offer Rate', green: '≥50%', yellow: '35-50%', red: '<35%', currentStatus: 'green' },
  { metric: 'Offer → Close Rate', green: '≥45%', yellow: '30-45%', red: '<30%', currentStatus: 'green' },
  { metric: 'Avg Response Time', green: '<30 min', yellow: '30-60 min', red: '>60 min', currentStatus: 'yellow' },
  { metric: 'Deals Stalled >5 Days', green: '0', yellow: '1-2', red: '≥3', currentStatus: 'red' },
  { metric: 'Daily Follow-Up Rate', green: '≥90%', yellow: '70-90%', red: '<70%', currentStatus: 'yellow' },
  { metric: 'Weekly Revenue vs Target', green: '≥100%', yellow: '80-100%', red: '<80%', currentStatus: 'green' },
];

const PRIORITY_RULES: PriorityRule[] = [
  { priority: 1, condition: 'Deal value >Rp 10B AND stalled >3 days', action: 'Founder direct intervention — personal call within 2 hours', escalation: 'If no progress in 24h → offer concession or walk-away assessment' },
  { priority: 2, condition: 'Deal in closing stage AND document pending >2 days', action: 'Escalate to legal team — deploy backup notary/lawyer', escalation: 'If no resolution in 48h → founder calls counterparty directly' },
  { priority: 3, condition: 'Viewing completed AND no follow-up within 4 hours', action: 'Auto-trigger personalized deal summary + ROI analysis email', escalation: 'If no response in 24h → agent calls buyer with urgency framing' },
  { priority: 4, condition: 'Offer rejected AND buyer still engaged (viewed other listings)', action: 'Deploy alternative property recommendation within same session', escalation: 'If no engagement in 48h → add to nurture sequence' },
  { priority: 5, condition: 'Agent response time >60 min on active deal', action: 'Alert sales lead — reassign lead to available agent', escalation: 'If pattern repeats 3x → performance review triggered' },
];

export function useDailyDealConversion() {
  return {
    pipelineStages: PIPELINE_STAGES,
    conversionMetrics: CONVERSION_METRICS,
    revenueSnapshots: REVENUE_SNAPSHOTS,
    dealAlerts: DEAL_ALERTS,
    agentScores: AGENT_SCORES,
    reviewRituals: REVIEW_RITUALS,
    alertThresholds: ALERT_THRESHOLDS,
    priorityRules: PRIORITY_RULES,
    totalPipelineValue: 'Rp 497B',
    totalActiveDeals: 121,
  };
}
