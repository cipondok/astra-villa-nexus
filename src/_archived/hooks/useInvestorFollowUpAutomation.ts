export interface AutomationTrigger {
  id: string;
  event: string;
  description: string;
  delay: string;
  actions: string[];
  category: 'viewing' | 'alert' | 'portfolio' | 'inactivity';
}

export interface MessageSequence {
  id: string;
  name: string;
  trigger: string;
  steps: { day: number; channel: string; message: string; goal: string }[];
}

export interface EngagementKPI {
  label: string;
  benchmark: string;
  description: string;
  status: 'excellent' | 'good' | 'caution' | 'critical';
}

export interface RolloutPhase {
  phase: number;
  title: string;
  duration: string;
  deliverables: string[];
  successCriteria: string;
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  next?: string[];
}

const TRIGGERS: AutomationTrigger[] = [
  {
    id: 't1', event: 'Viewing Completed', category: 'viewing',
    description: 'Investor completes a property viewing session',
    delay: '2 hours post-viewing',
    actions: ['Send viewing summary with ROI projections', 'Recommend 3 similar high-liquidity properties', 'Schedule follow-up call if property >Rp 3B'],
  },
  {
    id: 't2', event: 'Second Viewing Booked', category: 'viewing',
    description: 'Investor books a return viewing for same property',
    delay: 'Immediately',
    actions: ['Notify agent of high-intent signal', 'Prepare offer range guidance document', 'Send comparable transaction data'],
  },
  {
    id: 't3', event: 'Deal Alert Clicked', category: 'alert',
    description: 'Investor interacts with a high-liquidity deal notification',
    delay: '30 minutes',
    actions: ['Send detailed property intelligence brief', 'Show urgency score and demand signals', 'Offer priority viewing slot'],
  },
  {
    id: 't4', event: 'Deal Alert Ignored (3x)', category: 'alert',
    description: 'Investor ignores 3 consecutive deal alerts',
    delay: '24 hours after 3rd ignore',
    actions: ['Recalibrate investor DNA preferences', 'Switch to weekly digest format', 'Offer preference survey'],
  },
  {
    id: 't5', event: 'Portfolio Value Milestone', category: 'portfolio',
    description: 'Investor portfolio crosses Rp 5B, 10B, or 25B threshold',
    delay: 'Same day',
    actions: ['Send congratulatory message with portfolio report', 'Recommend diversification opportunities', 'Offer premium subscription upgrade'],
  },
  {
    id: 't6', event: 'Portfolio Yield Alert', category: 'portfolio',
    description: 'A portfolio property yield drops below 5% threshold',
    delay: '1 hour',
    actions: ['Send yield optimization suggestions', 'Recommend rental pricing adjustments', 'Offer property swap analysis'],
  },
  {
    id: 't7', event: 'Inactive 7 Days', category: 'inactivity',
    description: 'No login or interaction for 7 consecutive days',
    delay: 'Day 7',
    actions: ['Send "You missed X new deals" re-engagement email', 'Highlight portfolio value changes', 'Offer exclusive deal preview'],
  },
  {
    id: 't8', event: 'Inactive 21 Days', category: 'inactivity',
    description: 'No activity for 21 days — churn risk detected',
    delay: 'Day 21',
    actions: ['Founder personal outreach email', 'Offer 1-month premium trial', 'Request feedback survey'],
  },
];

const SEQUENCES: MessageSequence[] = [
  {
    id: 's1', name: 'Post-Viewing Nurture', trigger: 'Viewing Completed',
    steps: [
      { day: 0, channel: 'WhatsApp', message: 'Thanks for viewing [Property]. Here\'s your viewing summary with ROI projections → [Link]', goal: 'Immediate engagement' },
      { day: 1, channel: 'Email', message: '3 similar properties in [District] matching your investment profile — all with strong liquidity signals', goal: 'Cross-sell discovery' },
      { day: 3, channel: 'Push', message: '[Property] has received X new inquiries since your viewing. Demand is accelerating.', goal: 'Create urgency' },
      { day: 5, channel: 'WhatsApp', message: 'Ready to make an offer? I\'ve prepared an optimal offer range based on our AI valuation → [Link]', goal: 'Convert to offer' },
      { day: 10, channel: 'Email', message: 'Market update: [District] prices have moved X% this month. Your viewed properties analysis → [Link]', goal: 'Re-engage with data' },
    ],
  },
  {
    id: 's2', name: 'High-Intent Accelerator', trigger: 'Second Viewing Booked',
    steps: [
      { day: 0, channel: 'WhatsApp', message: 'Your second viewing is confirmed. I\'ve prepared a detailed investment brief including financing options → [Link]', goal: 'Prepare for decision' },
      { day: 1, channel: 'Email', message: 'Comparable transactions in [District]: X deals closed at avg Rp [Y]B in the last 30 days', goal: 'Build confidence with data' },
      { day: 2, channel: 'WhatsApp', message: 'After your viewing, shall I prepare a formal offer? Our AI suggests an optimal range of Rp [X]-[Y]', goal: 'Push to offer stage' },
    ],
  },
  {
    id: 's3', name: 'Re-Engagement Recovery', trigger: 'Inactive 7 Days',
    steps: [
      { day: 7, channel: 'Email', message: 'You missed X new high-liquidity deals this week! Here are your top 3 matches → [Link]', goal: 'Re-activate interest' },
      { day: 10, channel: 'Push', message: 'A property in your watchlist just dropped X% below AI FMV — potential opportunity alert', goal: 'Create FOMO' },
      { day: 14, channel: 'WhatsApp', message: 'Your portfolio has changed: [Property A] +X%, [Property B] -Y%. Full report → [Link]', goal: 'Portfolio-driven re-engagement' },
      { day: 21, channel: 'Email', message: 'Personal note from our founder: We\'d love your feedback on how to serve you better → [Survey]', goal: 'Churn prevention' },
    ],
  },
  {
    id: 's4', name: 'Upgrade Conversion Funnel', trigger: 'Portfolio Value Milestone',
    steps: [
      { day: 0, channel: 'Email', message: 'Congratulations! Your portfolio just crossed Rp [X]B. Here\'s your exclusive performance report → [Link]', goal: 'Celebrate milestone' },
      { day: 2, channel: 'WhatsApp', message: 'At your portfolio level, Pro investors save avg Rp [X]M/year through better deal access. Upgrade? → [Link]', goal: 'Upsell premium' },
      { day: 5, channel: 'Email', message: 'Pro feature spotlight: AI-powered diversification analysis shows your portfolio has [X]% concentration risk', goal: 'Demonstrate value' },
      { day: 7, channel: 'Push', message: 'Limited: 48-hour Pro upgrade offer — first month free with full portfolio analytics', goal: 'Time-limited conversion' },
    ],
  },
];

const ENGAGEMENT_KPIS: EngagementKPI[] = [
  { label: 'Follow-Up Open Rate', benchmark: '≥45%', description: 'Percentage of automated messages opened by recipients', status: 'good' },
  { label: 'Click-Through Rate', benchmark: '≥12%', description: 'Percentage of opened messages resulting in link clicks', status: 'good' },
  { label: 'Viewing-to-Offer Conversion', benchmark: '≥25%', description: 'Investors who submit offers after automated post-viewing nurture', status: 'caution' },
  { label: 'Re-Engagement Recovery Rate', benchmark: '≥30%', description: 'Inactive investors who return within 14 days of re-engagement sequence', status: 'good' },
  { label: 'Upgrade Conversion Rate', benchmark: '≥15%', description: 'Free users who upgrade after milestone-triggered upsell sequence', status: 'caution' },
  { label: 'Unsubscribe Rate', benchmark: '≤2%', description: 'Recipients who opt out of automated communications', status: 'excellent' },
  { label: 'Avg Response Time', benchmark: '≤4 hours', description: 'Time between automated trigger and investor response/action', status: 'good' },
  { label: 'Engagement Score Lift', benchmark: '+15pts/month', description: 'Average engagement score improvement for nurtured investors', status: 'good' },
  { label: 'Deal Participation Rate', benchmark: '≥20%', description: 'Nurtured investors who participate in at least one deal per quarter', status: 'caution' },
  { label: 'Sequence Completion Rate', benchmark: '≥60%', description: 'Investors who receive all steps in a sequence without opting out', status: 'good' },
];

const ROLLOUT_PHASES: RolloutPhase[] = [
  {
    phase: 1, title: 'Foundation & Post-Viewing Automation', duration: 'Weeks 1-2',
    deliverables: ['Deploy post-viewing follow-up trigger', 'Build WhatsApp + email template library', 'Integrate engagement scoring engine', 'Set up admin override dashboard'],
    successCriteria: '50+ automated follow-ups sent with ≥40% open rate',
  },
  {
    phase: 2, title: 'Alert & Inactivity Sequences', duration: 'Weeks 3-4',
    deliverables: ['Deploy deal alert interaction tracking', 'Launch re-engagement recovery sequence', 'Implement preference recalibration on 3x ignore', 'Add inactivity detection triggers (7/21-day)'],
    successCriteria: '≥25% re-engagement recovery rate from inactive users',
  },
  {
    phase: 3, title: 'Portfolio & Upgrade Funnels', duration: 'Weeks 5-6',
    deliverables: ['Deploy portfolio milestone detection', 'Launch upgrade conversion sequences', 'Integrate yield alert automation', 'Add A/B testing for message variants'],
    successCriteria: '≥10% upgrade conversion from milestone-triggered sequences',
  },
  {
    phase: 4, title: 'Optimization & Scale', duration: 'Weeks 7-8',
    deliverables: ['Analyze sequence performance data', 'Optimize message timing and content', 'Scale to full investor base', 'Deploy predictive engagement scoring'],
    successCriteria: 'All engagement KPIs at ≥"good" threshold with <2% unsubscribe',
  },
];

const WORKFLOW_NODES: WorkflowNode[] = [
  { id: 'n1', label: 'Investor Action Detected', type: 'trigger', next: ['n2'] },
  { id: 'n2', label: 'Classify Event Type', type: 'condition', next: ['n3', 'n4', 'n5', 'n6'] },
  { id: 'n3', label: 'Viewing / Alert', type: 'condition', next: ['n7'] },
  { id: 'n4', label: 'Portfolio Milestone', type: 'condition', next: ['n8'] },
  { id: 'n5', label: 'Inactivity Signal', type: 'condition', next: ['n9'] },
  { id: 'n6', label: 'Engagement Drop', type: 'condition', next: ['n10'] },
  { id: 'n7', label: 'Queue Nurture Sequence', type: 'action', next: ['n11'] },
  { id: 'n8', label: 'Queue Upgrade Funnel', type: 'action', next: ['n11'] },
  { id: 'n9', label: 'Queue Re-Engagement', type: 'action', next: ['n11'] },
  { id: 'n10', label: 'Flag for Manual Review', type: 'action', next: ['n11'] },
  { id: 'n11', label: 'Apply Cadence Delay', type: 'delay', next: ['n12'] },
  { id: 'n12', label: 'Send Message', type: 'action', next: ['n13'] },
  { id: 'n13', label: 'Update Engagement Score', type: 'action', next: ['n14'] },
  { id: 'n14', label: 'Check Response', type: 'condition', next: ['n15', 'n16'] },
  { id: 'n15', label: 'Response → Advance', type: 'action' },
  { id: 'n16', label: 'No Response → Next Step', type: 'delay' },
];

export function useInvestorFollowUpAutomation() {
  return {
    triggers: TRIGGERS,
    sequences: SEQUENCES,
    engagementKPIs: ENGAGEMENT_KPIS,
    rolloutPhases: ROLLOUT_PHASES,
    workflowNodes: WORKFLOW_NODES,
    triggerCategories: ['viewing', 'alert', 'portfolio', 'inactivity'] as const,
  };
}
