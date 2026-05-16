export interface MatchingSignal {
  id: string;
  category: 'investor_profile' | 'behavior' | 'market' | 'urgency';
  signal: string;
  weight: number;
  description: string;
  dataSource: string;
}

export interface SegmentRule {
  segment: string;
  criteria: string;
  dealFrequency: string;
  channels: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedSize: string;
}

export interface AutomationStep {
  step: number;
  trigger: string;
  action: string;
  timing: string;
  channel: string;
  fallback: string;
}

export interface EngagementKPI {
  metric: string;
  description: string;
  target: string;
  current: string;
  weight: number;
}

export interface RolloutPhase {
  phase: number;
  title: string;
  duration: string;
  scope: string;
  deliverables: string[];
  successCriteria: string;
}

const MATCHING_SIGNALS: MatchingSignal[] = [
  { id: 's1', category: 'investor_profile', signal: 'Capital Range Match', weight: 20, description: 'Property price falls within investor stated budget range (±15% tolerance)', dataSource: 'investor_preferences.budget_min / budget_max' },
  { id: 's2', category: 'investor_profile', signal: 'Risk Appetite Alignment', weight: 12, description: 'Property risk tier matches investor risk tolerance (conservative/moderate/aggressive)', dataSource: 'investor_dna.risk_profile vs property opportunity_score risk_level' },
  { id: 's3', category: 'investor_profile', signal: 'Property Type Preference', weight: 15, description: 'Listing type matches investor preferred categories (villa/apartment/land/commercial)', dataSource: 'investor_preferences.preferred_types[]' },
  { id: 's4', category: 'investor_profile', signal: 'District Focus Match', weight: 13, description: 'Property location within investor target districts or expanding radius', dataSource: 'investor_preferences.target_districts[] + search history geo-clusters' },
  { id: 's5', category: 'behavior', signal: 'Historical Alert Engagement', weight: 10, description: 'Investor open/click rate on similar deal alerts in past 90 days', dataSource: 'notification_interactions aggregate by property_type + district' },
  { id: 's6', category: 'behavior', signal: 'Viewing-to-Offer Conversion', weight: 8, description: 'Historical probability investor converts from viewing to offer on similar properties', dataSource: 'deal_pipeline conversion funnel per investor_id' },
  { id: 's7', category: 'market', signal: 'Liquidity Score Threshold', weight: 10, description: 'Property liquidity score exceeds investor minimum threshold for engagement', dataSource: 'property.liquidity_score vs investor_preferences.min_liquidity' },
  { id: 's8', category: 'urgency', signal: 'Urgency Signal Strength', weight: 7, description: 'Time-sensitivity indicators — price drops, competing offers, expiring incentives', dataSource: 'demand_urgency_score + price_change_events + offer_count' },
  { id: 's9', category: 'behavior', signal: 'Portfolio Gap Detection', weight: 5, description: 'Property fills identified gap in investor current portfolio allocation strategy', dataSource: 'portfolio_holdings vs investor_dna.target_allocation divergence' },
];

const SEGMENT_RULES: SegmentRule[] = [
  { segment: 'Elite Active Investors', criteria: 'Capital ≥Rp 5B, ≥3 transactions in 12mo, engagement score ≥80', dealFrequency: 'Real-time (immediate push)', channels: ['push', 'sms', 'email', 'in_app'], priority: 'critical', estimatedSize: '~50 investors' },
  { segment: 'Growth Seekers', criteria: 'Capital Rp 1-5B, ≥1 transaction, actively browsing weekly', dealFrequency: 'Daily curated digest + urgent alerts', channels: ['push', 'email', 'in_app'], priority: 'high', estimatedSize: '~150 investors' },
  { segment: 'Passive Watchers', criteria: 'Has watchlist items, browses monthly, no transaction yet', dealFrequency: 'Weekly opportunity roundup', channels: ['email', 'in_app'], priority: 'medium', estimatedSize: '~200 investors' },
  { segment: 'Dormant Re-engagement', criteria: 'No login >30 days, previously active, has saved properties', dealFrequency: 'Bi-weekly high-value trigger only', channels: ['email', 'sms'], priority: 'low', estimatedSize: '~100 investors' },
];

const AUTOMATION_SEQUENCE: AutomationStep[] = [
  { step: 1, trigger: 'New high-score listing published (opportunity ≥70)', action: 'Run matching algorithm against all active investor segments', timing: 'Within 30 seconds of listing activation', channel: 'System', fallback: 'Queue for next batch cycle (5min max delay)' },
  { step: 2, trigger: 'Match score ≥75 for Elite segment investor', action: 'Send real-time personalized deal alert with AI summary', timing: 'Immediate push + in-app notification', channel: 'Push + In-App', fallback: 'SMS fallback if push delivery fails after 2min' },
  { step: 3, trigger: 'Match score ≥60 for Growth segment', action: 'Add to daily curated deal digest with priority ranking', timing: 'Next scheduled digest (9AM or 6PM local)', channel: 'Email + In-App', fallback: 'Push notification if email undeliverable' },
  { step: 4, trigger: 'Alert opened but no action within 4 hours', action: 'Send follow-up with additional ROI analysis and comparable deals', timing: '4 hours after initial open', channel: 'Same channel as open', fallback: 'Skip if investor has >3 unopened follow-ups' },
  { step: 5, trigger: 'Investor clicks deal details but no inquiry/viewing', action: 'Send viewing scheduling prompt with available time slots', timing: '24 hours after detail view', channel: 'Push + Email', fallback: 'Agent manual outreach assignment' },
  { step: 6, trigger: 'No engagement after 48 hours on high-priority deal', action: 'Escalate to assigned relationship manager for personal follow-up', timing: '48 hours post-initial alert', channel: 'Admin Dashboard Alert', fallback: 'Auto-archive and update engagement score' },
  { step: 7, trigger: 'Deal participation confirmed (inquiry/viewing/offer)', action: 'Update engagement score, log conversion, trigger deal pipeline automation', timing: 'Real-time on action', channel: 'System', fallback: 'Manual logging by agent within 1 hour' },
];

const ENGAGEMENT_KPIS: EngagementKPI[] = [
  { metric: 'Alert Delivery Rate', description: 'Percentage of deal alerts successfully delivered to target investors', target: '≥98%', current: '94%', weight: 10 },
  { metric: 'Alert Open Rate', description: 'Percentage of delivered alerts opened by investors', target: '≥45%', current: '32%', weight: 15 },
  { metric: 'Alert-to-Inquiry Rate', description: 'Percentage of opened alerts that result in property inquiry', target: '≥12%', current: '7%', weight: 20 },
  { metric: 'Alert-to-Viewing Rate', description: 'Percentage of inquiries that convert to scheduled viewings', target: '≥35%', current: '22%', weight: 15 },
  { metric: 'Match Algorithm Precision', description: 'Percentage of distributed deals rated "relevant" by investors', target: '≥80%', current: '65%', weight: 20 },
  { metric: 'Avg Time to First Engagement', description: 'Average time from alert delivery to first investor interaction', target: '≤2 hours', current: '6 hours', weight: 10 },
  { metric: 'Investor Fatigue Score', description: 'Alert suppression rate due to over-notification (lower is better)', target: '≤5%', current: '12%', weight: 10 },
];

const ROLLOUT_PHASES: RolloutPhase[] = [
  { phase: 1, title: 'Foundation & Matching Engine', duration: 'Weeks 1-3', scope: 'Build core matching algorithm and investor segmentation logic', deliverables: ['9-signal weighted matching algorithm deployed', 'Investor segmentation engine with 4 dynamic tiers', 'Match score computation pipeline (≤30s latency)', 'Admin dashboard for manual match override and monitoring'], successCriteria: 'Algorithm producing match scores for 100% of active listings × investor pairs' },
  { phase: 2, title: 'Automated Distribution Pipeline', duration: 'Weeks 4-6', scope: 'Deploy notification sequencing and multi-channel delivery', deliverables: ['7-step automation sequence active for all segments', 'Multi-channel delivery (push, email, SMS, in-app)', 'Follow-up escalation logic with fatigue protection', 'Engagement event tracking and score updates'], successCriteria: 'Alert delivery rate ≥95%, open rate ≥35% within first 2 weeks' },
  { phase: 3, title: 'Intelligence & Optimization', duration: 'Weeks 7-10', scope: 'Add learning loops to improve match precision and timing', deliverables: ['A/B testing framework for alert messaging and timing', 'Engagement-weighted algorithm recalibration (weekly)', 'Portfolio gap detection integration for personalized recommendations', 'Investor preference auto-learning from behavioral signals'], successCriteria: 'Match precision ≥75%, alert-to-inquiry rate ≥10%' },
  { phase: 4, title: 'Scale & Autonomous Operation', duration: 'Weeks 11-14', scope: 'Full autonomous operation with minimal manual intervention', deliverables: ['Self-tuning matching weights based on conversion outcomes', 'Predictive deal timing — alert investors before listing goes live', 'Cross-portfolio opportunity detection (syndication signals)', 'Full KPI dashboard with anomaly detection alerts'], successCriteria: 'System operating autonomously with ≥80% match precision and ≤5% fatigue rate' },
];

export function useInvestorDealFlowAutomation() {
  const totalWeight = MATCHING_SIGNALS.reduce((s, m) => s + m.weight, 0);
  return {
    matchingSignals: MATCHING_SIGNALS,
    totalSignalWeight: totalWeight,
    signalsByCategory: (c: MatchingSignal['category']) => MATCHING_SIGNALS.filter(s => s.category === c),
    segmentRules: SEGMENT_RULES,
    automationSequence: AUTOMATION_SEQUENCE,
    engagementKPIs: ENGAGEMENT_KPIS,
    rolloutPhases: ROLLOUT_PHASES,
    categories: ['investor_profile', 'behavior', 'market', 'urgency'] as const,
    categoryLabels: { investor_profile: 'Investor Profile', behavior: 'Behavioral', market: 'Market Signal', urgency: 'Urgency' } as Record<string, string>,
  };
}
