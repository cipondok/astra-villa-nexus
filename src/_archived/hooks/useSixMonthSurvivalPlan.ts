export type PhaseId = 'ignition' | 'conversion' | 'stabilization';

export interface MonthlyKPI {
  month: number;
  phase: PhaseId;
  label: string;
  kpis: { metric: string; target: string; status: 'on_track' | 'at_risk' | 'critical' }[];
}

export interface WeeklyChecklist {
  week: number;
  month: number;
  phase: PhaseId;
  focus: string;
  tasks: string[];
}

export interface RiskItem {
  id: string;
  risk: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
  contingency: string;
  phase: PhaseId;
}

export interface TractionMilestone {
  id: string;
  milestone: string;
  target: string;
  phase: PhaseId;
  month: number;
  validationSignal: string;
}

const MONTHLY_KPIS: MonthlyKPI[] = [
  { month: 1, phase: 'ignition', label: 'Supply Activation', kpis: [
    { metric: 'Verified Listings', target: '≥50 active', status: 'on_track' },
    { metric: 'Agent Partners Recruited', target: '≥10 active agents', status: 'on_track' },
    { metric: 'Vendor Partners Onboarded', target: '≥5 service vendors', status: 'at_risk' },
    { metric: 'Investor Leads Generated', target: '≥100 qualified leads', status: 'on_track' },
    { metric: 'First Transactions Closed', target: '≥3 verified deals', status: 'critical' },
  ]},
  { month: 2, phase: 'ignition', label: 'Demand Validation', kpis: [
    { metric: 'Active Listings', target: '≥120 verified', status: 'on_track' },
    { metric: 'Monthly Unique Visitors', target: '≥2,000 sessions', status: 'on_track' },
    { metric: 'Inquiry Volume', target: '≥80 inquiries/month', status: 'at_risk' },
    { metric: 'Viewing Conversion', target: '≥30% inquiry-to-viewing', status: 'at_risk' },
    { metric: 'Deals Closed (Cumulative)', target: '≥10 total', status: 'on_track' },
  ]},
  { month: 3, phase: 'conversion', label: 'Pipeline Efficiency', kpis: [
    { metric: 'Viewing-to-Offer Rate', target: '≥25%', status: 'on_track' },
    { metric: 'Agent Response SLA', target: '<2 hours 90%+ compliance', status: 'on_track' },
    { metric: 'Time-to-Close Average', target: '≤35 days', status: 'at_risk' },
    { metric: 'Active Referral Users', target: '≥20 referrers', status: 'on_track' },
    { metric: 'Monthly Revenue', target: '≥Rp 80M', status: 'at_risk' },
  ]},
  { month: 4, phase: 'conversion', label: 'Traction Acceleration', kpis: [
    { metric: 'Monthly Deals Closed', target: '≥12/month', status: 'on_track' },
    { metric: 'Commission Revenue', target: '≥Rp 150M/month', status: 'at_risk' },
    { metric: 'Case Studies Published', target: '≥5 success stories', status: 'on_track' },
    { metric: 'Referral-Driven Leads', target: '≥15% of total leads', status: 'on_track' },
    { metric: 'NPS Score', target: '≥40', status: 'on_track' },
  ]},
  { month: 5, phase: 'stabilization', label: 'Revenue Diversification', kpis: [
    { metric: 'Subscription Revenue', target: '≥Rp 30M/month', status: 'on_track' },
    { metric: 'Premium Listing Revenue', target: '≥Rp 25M/month', status: 'at_risk' },
    { metric: 'Investor Retention Rate', target: '≥70% 30-day active', status: 'on_track' },
    { metric: 'Vendor Service Bookings', target: '≥30 bookings/month', status: 'on_track' },
    { metric: 'Total Monthly Revenue', target: '≥Rp 250M', status: 'at_risk' },
  ]},
  { month: 6, phase: 'stabilization', label: 'Scaling Readiness', kpis: [
    { metric: 'Monthly Revenue Run Rate', target: '≥Rp 350M', status: 'on_track' },
    { metric: 'Active Investor Users', target: '≥300', status: 'on_track' },
    { metric: 'Listing Coverage Districts', target: '≥3 districts', status: 'at_risk' },
    { metric: 'Repeat Transaction Rate', target: '≥15%', status: 'on_track' },
    { metric: 'Expansion Readiness Score', target: '≥70/100', status: 'on_track' },
  ]},
];

const WEEKLY_CHECKLISTS: WeeklyChecklist[] = [
  { week: 1, month: 1, phase: 'ignition', focus: 'Foundation Setup', tasks: ['Finalize listing intake workflow and verification SOP', 'Begin agent outreach — target 15 prospects', 'Set up investor acquisition ad campaigns', 'Configure deal pipeline tracking dashboard', 'Prepare vendor partnership pitch materials'] },
  { week: 2, month: 1, phase: 'ignition', focus: 'First Inventory Wave', tasks: ['Onboard first 15 verified listings', 'Complete 5 agent partner agreements', 'Launch first investor-targeted digital campaign', 'Schedule initial property viewing events', 'Begin vendor outreach for legal and renovation services'] },
  { week: 3, month: 1, phase: 'ignition', focus: 'Demand Activation', tasks: ['Amplify investor ad spend on top-performing channels', 'Coordinate first clustered viewing sessions', 'Follow up on all inquiry leads within 2-hour SLA', 'Publish 3 property highlight posts on social media', 'Review and optimize listing presentation quality'] },
  { week: 4, month: 1, phase: 'ignition', focus: 'First Closings Push', tasks: ['Accelerate negotiation on 5 most advanced deals', 'Close first 3 verified transactions', 'Collect testimonials from early buyers/sellers', 'Onboard 2 additional vendor partners', 'Conduct Month 1 performance review'] },
  { week: 5, month: 2, phase: 'ignition', focus: 'Supply Scaling', tasks: ['Increase listing target to 30 new this month', 'Recruit 5 additional agents from referrals', 'Launch secondary ad campaign for buyer segments', 'Test premium listing visibility upsell with 3 sellers', 'Strengthen agent response SLA monitoring'] },
  { week: 6, month: 2, phase: 'ignition', focus: 'Viewing Volume', tasks: ['Schedule 20+ viewings this week', 'Deploy post-viewing intent capture survey', 'Begin tracking viewing-to-offer conversion rate', 'Publish first market insight newsletter', 'Activate investor deal alert notification system'] },
  { week: 7, month: 2, phase: 'ignition', focus: 'Pipeline Depth', tasks: ['Ensure 25+ active negotiations in pipeline', 'Identify and escalate 3 stalled deals', 'Publish 2 transaction success case studies', 'Test referral incentive program with early users', 'Review vendor service quality ratings'] },
  { week: 8, month: 2, phase: 'ignition', focus: 'Momentum Validation', tasks: ['Target cumulative 10 deals closed', 'Analyze CAC by acquisition channel', 'Optimize ad creative based on performance data', 'Conduct Month 2 strategic review', 'Prepare Phase 2 conversion optimization roadmap'] },
  { week: 9, month: 3, phase: 'conversion', focus: 'Conversion Workflow', tasks: ['Implement structured negotiation support scripts', 'Deploy automated viewing booking confirmation', 'Launch A/B test on listing page trust signals', 'Activate referral reward program for all users', 'Set up weekly conversion funnel review ritual'] },
  { week: 10, month: 3, phase: 'conversion', focus: 'Agent Performance', tasks: ['Review agent SLA compliance — target 90%+', 'Provide top agents with premium deal assignments', 'Publish 2 new case studies with ROI metrics', 'Optimize inquiry response automation workflow', 'Track referral program early participation rates'] },
  { week: 11, month: 3, phase: 'conversion', focus: 'Deal Acceleration', tasks: ['Reduce average time-to-close tracking to 35 days', 'Deploy urgency messaging on high-demand listings', 'Coordinate weekend viewing marathon event', 'Test investor subscription pre-launch interest', 'Review and adjust pricing recommendation engine'] },
  { week: 12, month: 3, phase: 'conversion', focus: 'Revenue Foundation', tasks: ['Target Rp 80M+ monthly revenue', 'Analyze commission margins by deal size', 'Launch first premium listing pricing tier', 'Conduct Month 3 performance and revenue review', 'Prepare subscription monetization pilot plan'] },
  { week: 13, month: 4, phase: 'conversion', focus: 'Scale Preparation', tasks: ['Target 12 deals closed this month', 'Expand referral program with tiered rewards', 'Publish monthly market intelligence report', 'Test vendor commission revenue model', 'Strengthen investor engagement dashboard features'] },
  { week: 14, month: 4, phase: 'conversion', focus: 'Content Authority', tasks: ['Publish 5th transaction success case study', 'Launch investor education webinar series', 'Deploy social proof elements on listing pages', 'Optimize referral landing page conversion rate', 'Review NPS survey results — target 40+'] },
  { week: 15, month: 4, phase: 'conversion', focus: 'Monetization Testing', tasks: ['Launch investor subscription beta with 20 users', 'Test 3 premium listing price points', 'Activate vendor upsell recommendations', 'Track subscription activation and engagement', 'Analyze revenue per user segment'] },
  { week: 16, month: 4, phase: 'conversion', focus: 'Phase 2 Close', tasks: ['Target Rp 150M+ monthly commission revenue', 'Conduct comprehensive Month 4 review', 'Document top 3 conversion bottlenecks', 'Prepare Phase 3 stabilization execution plan', 'Set subscription and premium revenue targets for M5-6'] },
  { week: 17, month: 5, phase: 'stabilization', focus: 'Revenue Diversification', tasks: ['Scale subscription offering to 50+ investors', 'Optimize premium listing pricing based on M4 data', 'Launch vendor subscription packages', 'Activate investor portfolio analytics features', 'Set up automated subscription renewal workflows'] },
  { week: 18, month: 5, phase: 'stabilization', focus: 'Engagement Depth', tasks: ['Deploy investor follow-up automation sequences', 'Launch loyalty reward program for repeat users', 'Publish quarterly market performance report', 'Test multi-district listing expansion feasibility', 'Review vendor service booking conversion rates'] },
  { week: 19, month: 5, phase: 'stabilization', focus: 'Retention Systems', tasks: ['Implement churn prediction monitoring', 'Deploy win-back campaigns for inactive investors', 'Optimize deal alert personalization accuracy', 'Strengthen agent performance incentive structure', 'Track 30-day investor retention rate — target 70%+'] },
  { week: 20, month: 5, phase: 'stabilization', focus: 'Expansion Preparation', tasks: ['Analyze district-level demand concentration data', 'Identify top 2 expansion district candidates', 'Target Rp 250M+ total monthly revenue', 'Conduct Month 5 revenue and retention review', 'Draft multi-district launch playbook'] },
  { week: 21, month: 6, phase: 'stabilization', focus: 'Revenue Acceleration', tasks: ['Push subscription revenue to Rp 40M+ target', 'Optimize premium slot pricing for maximum yield', 'Launch institutional investor outreach pilot', 'Deploy vendor performance leaderboard', 'Activate cross-selling between investor and vendor services'] },
  { week: 22, month: 6, phase: 'stabilization', focus: 'Operational Excellence', tasks: ['Achieve 95%+ agent SLA compliance rate', 'Reduce operational bottlenecks in deal documentation', 'Publish 10th transaction success case study', 'Finalize expansion district readiness assessments', 'Test automated KPI anomaly detection alerts'] },
  { week: 23, month: 6, phase: 'stabilization', focus: 'Scaling Readiness', tasks: ['Complete expansion readiness score calculation', 'Finalize multi-district team recruitment plan', 'Validate unit economics — LTV/CAC target ≥5x', 'Prepare investor pitch deck with 6-month traction', 'Target Rp 350M+ monthly revenue run rate'] },
  { week: 24, month: 6, phase: 'stabilization', focus: 'Phase 3 Graduation', tasks: ['Conduct comprehensive 6-month strategic review', 'Document all operational SOPs and playbooks', 'Confirm 300+ active investor user milestone', 'Finalize Year 1 scaling execution roadmap', 'Celebrate survival — prepare for acceleration phase'] },
];

const RISKS: RiskItem[] = [
  { id: 'r1', risk: 'Insufficient listing supply density', likelihood: 'high', impact: 'high', mitigation: 'Aggressive agent recruitment with exclusivity incentives and developer partnership outreach', contingency: 'Deploy manual listing sourcing team and offer listing fee waivers for 90 days', phase: 'ignition' },
  { id: 'r2', risk: 'Low investor demand acquisition', likelihood: 'medium', impact: 'high', mitigation: 'Multi-channel digital campaigns with ROI-driven messaging and webinar education series', contingency: 'Pivot to direct outreach via WhatsApp and real estate investment communities', phase: 'ignition' },
  { id: 'r3', risk: 'Poor viewing-to-offer conversion', likelihood: 'high', impact: 'high', mitigation: 'Structured negotiation scripts, agent training, and urgency-driven communication workflows', contingency: 'Assign founder-led closing support for high-value deals and implement price adjustment guidance', phase: 'conversion' },
  { id: 'r4', risk: 'Agent response SLA non-compliance', likelihood: 'medium', impact: 'medium', mitigation: 'Automated SLA monitoring with escalation alerts and performance-based visibility rewards', contingency: 'Replace underperforming agents and deploy platform-managed inquiry response team', phase: 'conversion' },
  { id: 'r5', risk: 'Subscription monetization rejection', likelihood: 'medium', impact: 'medium', mitigation: 'Gradual value demonstration with free trial periods and ROI analytics dashboards', contingency: 'Pivot to transaction-only revenue model with enhanced commission tiers', phase: 'stabilization' },
  { id: 'r6', risk: 'Cash flow runway pressure', likelihood: 'high', impact: 'high', mitigation: 'Maintain 6-month runway buffer and focus on revenue-generating activities weekly', contingency: 'Reduce non-essential spending, defer expansion, and accelerate premium listing sales', phase: 'stabilization' },
  { id: 'r7', risk: 'Competitor market entry', likelihood: 'medium', impact: 'medium', mitigation: 'Build trust moat through verified transactions, case studies, and agent loyalty programs', contingency: 'Accelerate exclusive listing agreements and deploy aggressive retention incentives', phase: 'ignition' },
  { id: 'r8', risk: 'Vendor service quality inconsistency', likelihood: 'medium', impact: 'medium', mitigation: 'Implement quality scoring system with SLA monitoring and review-based ranking', contingency: 'Remove low-performing vendors and recruit replacements from verified referral networks', phase: 'conversion' },
];

const MILESTONES: TractionMilestone[] = [
  { id: 'm1', milestone: 'First Verified Transaction', target: '1 deal closed', phase: 'ignition', month: 1, validationSignal: 'Platform can facilitate end-to-end property deal closure' },
  { id: 'm2', milestone: '10 Cumulative Deals', target: '10 verified closings', phase: 'ignition', month: 2, validationSignal: 'Repeatable transaction workflow validated with multiple agents' },
  { id: 'm3', milestone: '50 Active Listings', target: '50+ verified listings live', phase: 'ignition', month: 1, validationSignal: 'Supply density sufficient to attract serious buyer interest' },
  { id: 'm4', milestone: 'First Commission Revenue', target: 'Rp 50M+ earned', phase: 'ignition', month: 2, validationSignal: 'Revenue model generates meaningful income from transactions' },
  { id: 'm5', milestone: '25% Viewing-to-Offer Rate', target: '≥25% conversion', phase: 'conversion', month: 3, validationSignal: 'Conversion funnel efficiency reaches viable marketplace standard' },
  { id: 'm6', milestone: 'Referral Program Activation', target: '20+ active referrers', phase: 'conversion', month: 3, validationSignal: 'Organic growth loop generating leads without paid acquisition' },
  { id: 'm7', milestone: 'Rp 150M Monthly Revenue', target: '≥Rp 150M/month', phase: 'conversion', month: 4, validationSignal: 'Revenue trajectory supports operational sustainability path' },
  { id: 'm8', milestone: '5 Published Case Studies', target: '5 success stories', phase: 'conversion', month: 4, validationSignal: 'Social proof library sufficient to drive trust-based conversion' },
  { id: 'm9', milestone: 'First Subscription Revenue', target: 'Rp 30M+ subscription MRR', phase: 'stabilization', month: 5, validationSignal: 'Recurring revenue stream validated beyond transaction commissions' },
  { id: 'm10', milestone: '300 Active Investors', target: '300+ engaged users', phase: 'stabilization', month: 6, validationSignal: 'Demand network reaches critical mass for multi-district expansion' },
  { id: 'm11', milestone: 'Rp 350M Revenue Run Rate', target: '≥Rp 350M/month', phase: 'stabilization', month: 6, validationSignal: 'Revenue velocity supports fundraising and scaling investment' },
  { id: 'm12', milestone: 'Expansion Readiness ≥70', target: '70/100 readiness score', phase: 'stabilization', month: 6, validationSignal: 'Operational maturity sufficient to replicate in new districts' },
];

export function useSixMonthSurvivalPlan() {
  return {
    monthlyKPIs: MONTHLY_KPIS,
    weeklyChecklists: WEEKLY_CHECKLISTS,
    risks: RISKS,
    milestones: MILESTONES,
    phases: [
      { id: 'ignition' as PhaseId, label: 'Market Ignition', months: 'Month 1–2', color: 'text-orange-400', bg: 'bg-orange-500/15' },
      { id: 'conversion' as PhaseId, label: 'Conversion Optimization', months: 'Month 3–4', color: 'text-blue-400', bg: 'bg-blue-500/15' },
      { id: 'stabilization' as PhaseId, label: 'Revenue Stabilization', months: 'Month 5–6', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    ],
  };
}
