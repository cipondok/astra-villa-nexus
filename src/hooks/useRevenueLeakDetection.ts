export interface RevenueLeak {
  id: string;
  category: 'deals' | 'listings' | 'subscriptions' | 'vendors' | 'payments';
  signal: string;
  weight: number;
  detectionLogic: string;
  estimatedLoss: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface MonetizationOpportunity {
  id: string;
  opportunity: string;
  category: string;
  currentState: string;
  potentialRevenue: string;
  actionRequired: string;
  priority: 'immediate' | 'short_term' | 'medium_term';
}

export interface CorrectiveAction {
  leakType: string;
  action: string;
  expectedRecovery: string;
  implementationEffort: 'low' | 'medium' | 'high';
  timeToImpact: string;
}

export interface FinancialKPI {
  label: string;
  benchmark: string;
  alertThreshold: string;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: 'critical' | 'high' | 'medium';
  notification: string;
  autoAction: string;
}

export interface DeploymentPhase {
  phase: number;
  title: string;
  duration: string;
  initiatives: string[];
  successMetric: string;
}

const LEAKS: RevenueLeak[] = [
  { id: 'l1', category: 'deals', signal: 'High-Value Deal Stall >14 Days', weight: 25, detectionLogic: 'Flag deals >Rp 5B inactive in negotiation stage for 14+ days — calculate daily commission decay rate', estimatedLoss: 'Rp 25-50M per stalled deal in delayed commission', severity: 'critical' },
  { id: 'l2', category: 'deals', signal: 'Agent Non-Response on Active Deals', weight: 15, detectionLogic: 'Detect deals where agent has not responded to buyer/seller communication in 72+ hours during active negotiation', estimatedLoss: 'Rp 15M avg per abandoned deal from disengagement', severity: 'high' },
  { id: 'l3', category: 'deals', signal: 'Below-Market Commission Acceptance', weight: 12, detectionLogic: 'Identify closed deals where negotiated commission rate fell below 1.5% platform minimum threshold', estimatedLoss: 'Rp 5-12M per deal in commission undercut', severity: 'medium' },
  { id: 'l4', category: 'listings', signal: 'Premium Slot Under-Pricing', weight: 18, detectionLogic: 'Compare premium slot price vs district demand index — flag slots priced >20% below optimal dynamic pricing model', estimatedLoss: 'Rp 2-5M/month per under-priced slot', severity: 'high' },
  { id: 'l5', category: 'listings', signal: 'High-Demand Listings Without Premium Upsell', weight: 14, detectionLogic: 'Identify listings with >50 views/week and >10 inquiries that are NOT on premium slots — missed upsell revenue', estimatedLoss: 'Rp 1.5-3M/month per un-monetized high-demand listing', severity: 'medium' },
  { id: 'l6', category: 'subscriptions', signal: 'Pre-Churn Engagement Drop', weight: 20, detectionLogic: 'Detect subscribers with >60% engagement decline over 14 days — predict churn probability using login frequency, alert views, and portfolio checks', estimatedLoss: 'Rp 500K-2M per churned subscriber (LTV loss)', severity: 'critical' },
  { id: 'l7', category: 'subscriptions', signal: 'Failed Payment Retry Gap', weight: 10, detectionLogic: 'Identify subscription renewals that failed payment but have no retry attempt within 48 hours — passive churn from billing failure', estimatedLoss: 'Rp 300K-1M per unrecovered subscription', severity: 'high' },
  { id: 'l8', category: 'subscriptions', signal: 'Downgrade Without Intervention', weight: 8, detectionLogic: 'Flag subscribers who downgraded plan tier without receiving any retention outreach or counter-offer communication', estimatedLoss: 'Rp 200K-800K/month per preventable downgrade', severity: 'medium' },
  { id: 'l9', category: 'vendors', signal: 'Commission Under-Collection', weight: 15, detectionLogic: 'Compare vendor job completions vs commission payments received — flag vendors with >2 completed jobs and zero commission settlement', estimatedLoss: 'Rp 500K-2M per un-collected vendor commission', severity: 'high' },
  { id: 'l10', category: 'vendors', signal: 'Vendor Bypass Detection', weight: 10, detectionLogic: 'Detect patterns where vendor-client communication moves off-platform after initial connection — potential commission bypass', estimatedLoss: 'Rp 1-3M per bypassed transaction', severity: 'medium' },
  { id: 'l11', category: 'payments', signal: 'Settlement Processing Delay', weight: 12, detectionLogic: 'Flag escrow releases or commission payments delayed >5 business days beyond deal completion confirmation', estimatedLoss: 'Cash flow impact + Rp 100-500K opportunity cost per delayed settlement', severity: 'medium' },
  { id: 'l12', category: 'payments', signal: 'Refund Rate Anomaly', weight: 8, detectionLogic: 'Detect if premium slot or subscription refund rate exceeds 8% monthly threshold — indicates product-market fit issue', estimatedLoss: 'Rp 3-8M/month in reversed revenue', severity: 'high' },
];

const OPPORTUNITIES: MonetizationOpportunity[] = [
  { id: 'o1', opportunity: 'Dynamic Premium Slot Pricing', category: 'Listing Revenue', currentState: 'Flat pricing regardless of demand', potentialRevenue: '+Rp 15-30M/month from demand-based pricing uplift', actionRequired: 'Implement district demand index multiplier on slot pricing engine', priority: 'immediate' },
  { id: 'o2', opportunity: 'Automated Upsell on High-Inquiry Listings', category: 'Listing Revenue', currentState: 'Manual upsell only — most opportunities missed', potentialRevenue: '+Rp 8-15M/month from automated conversion', actionRequired: 'Deploy trigger: if listing >30 views/week → auto-suggest premium upgrade', priority: 'immediate' },
  { id: 'o3', opportunity: 'Win-Back Campaign for Churned Subscribers', category: 'Subscription Revenue', currentState: 'No systematic re-engagement after churn', potentialRevenue: '+Rp 5-10M/month from 20% win-back rate', actionRequired: 'Launch 3-stage email/WhatsApp sequence with special re-activation offers', priority: 'short_term' },
  { id: 'o4', opportunity: 'Vendor Success Fee on Closed Deals', category: 'Vendor Revenue', currentState: 'Flat subscription only — no performance upside', potentialRevenue: '+Rp 3-8M/month from deal-linked vendor commissions', actionRequired: 'Introduce 5% vendor success fee on renovation/legal jobs linked to closed transactions', priority: 'short_term' },
  { id: 'o5', opportunity: 'Investor Data API Monetization', category: 'Data Revenue', currentState: 'Market intelligence consumed internally only', potentialRevenue: '+Rp 20-50M/month from institutional API subscriptions', actionRequired: 'Package district liquidity and pricing data as tiered API access for fund managers', priority: 'medium_term' },
  { id: 'o6', opportunity: 'Financing Referral Commission', category: 'Partnership Revenue', currentState: 'Bank partnerships inactive or under-utilized', potentialRevenue: '+Rp 10-25M/month from mortgage referral commissions', actionRequired: 'Activate automated lead routing to partner banks with commission tracking', priority: 'short_term' },
];

const ACTIONS: CorrectiveAction[] = [
  { leakType: 'Stalled High-Value Deals', action: 'Deploy 48-hour auto-escalation to senior agent + founder notification for deals >Rp 5B', expectedRecovery: 'Rp 30-60M/month from accelerated closings', implementationEffort: 'low', timeToImpact: '1 week' },
  { leakType: 'Premium Slot Under-Pricing', action: 'Activate dynamic pricing engine with district demand multiplier (1.0x-2.5x base)', expectedRecovery: 'Rp 15-30M/month from optimized slot pricing', implementationEffort: 'medium', timeToImpact: '2-3 weeks' },
  { leakType: 'Subscription Pre-Churn', action: 'Trigger proactive retention outreach when engagement drops >40% over 7 days', expectedRecovery: 'Rp 8-15M/month from prevented churn', implementationEffort: 'medium', timeToImpact: '2 weeks' },
  { leakType: 'Failed Payment Recovery', action: 'Implement smart retry: attempt 3x over 7 days with escalating urgency messaging', expectedRecovery: 'Rp 3-6M/month from recovered billing failures', implementationEffort: 'low', timeToImpact: '1 week' },
  { leakType: 'Vendor Commission Under-Collection', action: 'Auto-generate invoice after job completion + 7-day payment reminder sequence', expectedRecovery: 'Rp 5-10M/month from collected commissions', implementationEffort: 'low', timeToImpact: '1 week' },
  { leakType: 'High-Demand Upsell Miss', action: 'Deploy real-time notification to sellers when listing exceeds view/inquiry threshold', expectedRecovery: 'Rp 8-15M/month from premium conversions', implementationEffort: 'low', timeToImpact: '3-5 days' },
  { leakType: 'Agent Non-Response', action: 'Activate 24h SLA enforcement with auto-reassignment to backup agent on breach', expectedRecovery: 'Rp 10-20M/month from rescued deal pipeline', implementationEffort: 'medium', timeToImpact: '2 weeks' },
  { leakType: 'Settlement Delay', action: 'Automate escrow release trigger on deal completion verification + admin approval flow', expectedRecovery: 'Cash flow improvement + Rp 2-5M/month opportunity cost recovery', implementationEffort: 'high', timeToImpact: '3-4 weeks' },
];

const FINANCIAL_KPIS: FinancialKPI[] = [
  { label: 'Deal Pipeline Velocity', benchmark: '≤28 days avg close', alertThreshold: '>35 days triggers warning', status: 'warning', description: 'Average time from first inquiry to deal completion' },
  { label: 'Commission Collection Rate', benchmark: '≥98%', alertThreshold: '<95% triggers critical', status: 'healthy', description: 'Percentage of earned commissions successfully collected' },
  { label: 'Premium Slot Fill Rate', benchmark: '≥75%', alertThreshold: '<60% triggers warning', status: 'warning', description: 'Percentage of available premium listing slots currently sold' },
  { label: 'Subscription Retention Rate', benchmark: '≥85% monthly', alertThreshold: '<80% triggers critical', status: 'healthy', description: 'Percentage of subscribers retained month-over-month' },
  { label: 'Revenue Per Transaction', benchmark: '≥Rp 35M avg', alertThreshold: '<Rp 25M triggers warning', status: 'healthy', description: 'Average total platform revenue per closed deal' },
  { label: 'Payment Processing Success', benchmark: '≥99%', alertThreshold: '<97% triggers critical', status: 'healthy', description: 'Percentage of payment attempts successfully processed' },
  { label: 'Vendor Commission Yield', benchmark: '≥Rp 800K/vendor/month', alertThreshold: '<Rp 500K triggers warning', status: 'warning', description: 'Average commission revenue generated per active vendor' },
  { label: 'Refund Rate', benchmark: '≤3%', alertThreshold: '>5% triggers warning, >8% critical', status: 'healthy', description: 'Percentage of revenue reversed through refunds' },
  { label: 'Revenue Concentration Risk', benchmark: '≤30% from single source', alertThreshold: '>40% triggers warning', status: 'warning', description: 'Maximum percentage of total revenue from any single stream' },
  { label: 'Monthly Revenue Growth', benchmark: '≥15% MoM', alertThreshold: '<5% triggers warning', status: 'healthy', description: 'Month-over-month total revenue growth rate' },
];

const ALERT_RULES: AlertRule[] = [
  { name: 'Critical Deal Stall', condition: 'Deal >Rp 5B inactive >14 days in negotiation', severity: 'critical', notification: 'Push + SMS to founder + assigned agent manager', autoAction: 'Reassign to Elite agent + schedule emergency review call' },
  { name: 'Commission Under-Collection', condition: '3+ vendor jobs completed without payment settlement', severity: 'high', notification: 'Admin dashboard alert + email to finance team', autoAction: 'Generate automated invoice batch + payment reminder sequence' },
  { name: 'Churn Risk Detected', condition: 'Subscriber engagement score drops >60% in 14 days', severity: 'high', notification: 'CRM alert to account manager', autoAction: 'Trigger retention campaign + exclusive offer unlock' },
  { name: 'Premium Pricing Anomaly', condition: 'Slot price >25% below dynamic pricing model suggestion', severity: 'medium', notification: 'Admin dashboard notification', autoAction: 'Queue pricing adjustment recommendation for admin review' },
  { name: 'Payment Failure Spike', condition: 'Payment failure rate >5% in 24-hour window', severity: 'critical', notification: 'Immediate SMS + email to CTO and finance lead', autoAction: 'Activate backup payment processor + log all failure details' },
  { name: 'Revenue Growth Stall', condition: 'MoM revenue growth <5% for 2 consecutive months', severity: 'high', notification: 'Weekly executive report flag', autoAction: 'Trigger monetization experiment acceleration review' },
];

const DEPLOYMENT: DeploymentPhase[] = [
  { phase: 1, title: 'Signal Detection Foundation', duration: 'Weeks 1–3', initiatives: ['Implement deal stall detection with 14-day threshold alerting', 'Deploy subscription engagement decline monitoring', 'Build premium slot pricing vs demand index comparison engine', 'Set up vendor commission reconciliation tracking'], successMetric: 'All 12 leak signals actively monitored with automated detection' },
  { phase: 2, title: 'Alert & Dashboard Layer', duration: 'Weeks 4–6', initiatives: ['Launch admin revenue protection dashboard with severity scoring', 'Activate real-time alert notification system (push + email + SMS)', 'Deploy financial KPI monitoring with threshold-based warnings', 'Build revenue recovery forecast calculator'], successMetric: 'Dashboard live + alerts delivering to admin within 5 minutes of detection' },
  { phase: 3, title: 'Automated Corrective Actions', duration: 'Weeks 7–9', initiatives: ['Deploy auto-escalation for stalled high-value deals', 'Activate smart payment retry with multi-channel dunning', 'Launch automated premium upsell triggers for high-demand listings', 'Implement vendor invoice auto-generation on job completion'], successMetric: 'Automated actions recovering ≥Rp 30M/month in previously leaked revenue' },
  { phase: 4, title: 'Optimization & Expansion', duration: 'Weeks 10–12', initiatives: ['Analyze leak detection accuracy and reduce false positive rate', 'Optimize dynamic pricing algorithm based on conversion data', 'Expand monitoring to new revenue streams (data API, financing referrals)', 'Build predictive revenue risk forecasting model'], successMetric: 'Total revenue protection value ≥Rp 80M/month + <10% false positive rate' },
];

export function useRevenueLeakDetection() {
  const totalLeakWeight = LEAKS.reduce((s, l) => s + l.weight, 0);
  const severityCounts = {
    critical: LEAKS.filter(l => l.severity === 'critical').length,
    high: LEAKS.filter(l => l.severity === 'high').length,
    medium: LEAKS.filter(l => l.severity === 'medium').length,
    low: LEAKS.filter(l => l.severity === 'low').length,
  };

  return {
    leaks: LEAKS,
    opportunities: OPPORTUNITIES,
    correctiveActions: ACTIONS,
    financialKPIs: FINANCIAL_KPIS,
    alertRules: ALERT_RULES,
    deployment: DEPLOYMENT,
    totalLeakWeight,
    severityCounts,
    categories: ['deals', 'listings', 'subscriptions', 'vendors', 'payments'] as const,
  };
}
