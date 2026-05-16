export interface FlywheelDriver {
  id: string;
  pillar: 'transaction' | 'monetization' | 'value' | 'reinvestment';
  lever: string;
  mechanism: string;
  compoundingEffect: string;
  kpi: string;
  target: string;
}

export interface CompoundingKPI {
  metric: string;
  month1: string;
  month3: string;
  month6: string;
  month12: string;
  compoundRate: string;
  driver: string;
}

export interface MonetizationPriority {
  rank: number;
  stream: string;
  currentRevenue: string;
  targetRevenue: string;
  effort: 'low' | 'medium' | 'high';
  timeToImpact: string;
  action: string;
  flywheelLink: string;
}

export interface ScalingPhase {
  phase: number;
  title: string;
  duration: string;
  revenueTarget: string;
  focus: string;
  initiatives: string[];
  exitCriteria: string;
}

export interface FlywheelLoop {
  step: number;
  stage: string;
  action: string;
  output: string;
  feedsInto: string;
}

const FLYWHEEL_LOOPS: FlywheelLoop[] = [
  { step: 1, stage: 'Supply Density', action: 'Onboard verified high-quality listings in target districts', output: 'Increased listing inventory attracts buyer traffic', feedsInto: 'Demand Capture' },
  { step: 2, stage: 'Demand Capture', action: 'Investor acquisition campaigns + organic SEO + referral loops', output: 'Growing buyer pool increases inquiry volume per listing', feedsInto: 'Transaction Velocity' },
  { step: 3, stage: 'Transaction Velocity', action: 'Accelerate viewing-to-offer-to-close cycle with AI assistance', output: 'Faster closings generate commission revenue + success stories', feedsInto: 'Trust & Social Proof' },
  { step: 4, stage: 'Trust & Social Proof', action: 'Publish verified transaction data, agent ratings, ROI outcomes', output: 'Credibility attracts premium sellers and serious investors', feedsInto: 'Monetization Activation' },
  { step: 5, stage: 'Monetization Activation', action: 'Upsell premium slots, subscriptions, and vendor commissions', output: 'Multiple revenue streams compound platform income', feedsInto: 'Profit Generation' },
  { step: 6, stage: 'Profit Generation', action: 'Revenue exceeds operational costs — net positive cash flow', output: 'Surplus capital available for strategic reinvestment', feedsInto: 'Reinvestment Amplification' },
  { step: 7, stage: 'Reinvestment Amplification', action: 'Allocate profits to demand acquisition + automation + data intelligence', output: 'Expanded reach and efficiency accelerate the entire cycle', feedsInto: 'Supply Density' },
];

const DRIVERS: FlywheelDriver[] = [
  { id: 'd1', pillar: 'transaction', lever: 'Listing Liquidity Density', mechanism: 'Concentrate verified listings in high-demand districts to create perception of marketplace depth', compoundingEffect: 'Each new listing increases search result density → higher buyer engagement → more inquiries per listing', kpi: 'Active listings per target district', target: '≥50 listings/district by M6' },
  { id: 'd2', pillar: 'transaction', lever: 'Deal Velocity Compression', mechanism: 'AI-assisted negotiation, automated documentation, and agent SLA enforcement reduce time-to-close', compoundingEffect: 'Faster closings free agent capacity → more simultaneous deals → higher monthly commission throughput', kpi: 'Average days from inquiry to close', target: '≤28 days by M6 (from 45d baseline)' },
  { id: 'd3', pillar: 'transaction', lever: 'Conversion Trust Signals', mechanism: 'Display verified transaction counts, agent success rates, and real-time market data to reduce buyer hesitation', compoundingEffect: 'Higher trust → higher offer rates → more closings → more trust signals → self-reinforcing credibility loop', kpi: 'Viewing-to-offer conversion rate', target: '≥25% by M6' },
  { id: 'd4', pillar: 'monetization', lever: 'Premium Listing Visibility', mechanism: 'Sell featured placement slots to sellers wanting accelerated buyer exposure', compoundingEffect: 'Premium revenue funds acquisition → more buyers → premium slots more valuable → price uplift → higher ARPU', kpi: 'Premium slot fill rate × avg price', target: '≥75% fill at Rp 3M avg by M6' },
  { id: 'd5', pillar: 'monetization', lever: 'Investor Intelligence Subscriptions', mechanism: 'Tiered access to market analytics, deal alerts, and portfolio tracking tools', compoundingEffect: 'Subscriber data improves AI models → better insights → higher retention → more subscribers → data flywheel', kpi: 'Paying subscribers × ARPU', target: '≥100 subscribers at Rp 600K avg ARPU' },
  { id: 'd6', pillar: 'monetization', lever: 'Vendor Commission Optimization', mechanism: 'Platform fee on vendor service jobs matched through marketplace', compoundingEffect: 'More transactions → more vendor demand → more vendors join → better matching → higher completion rates → more fees', kpi: 'Vendor commission yield per transaction', target: '≥Rp 2M avg commission per matched job' },
  { id: 'd7', pillar: 'value', lever: 'Portfolio Performance Analytics', mechanism: 'Show investors real-time ROI, rental yield, and capital appreciation on their holdings', compoundingEffect: 'Performance visibility → investor confidence → repeat transactions → higher LTV → referral generation', kpi: 'Monthly active portfolio users', target: '≥200 active portfolio users by M6' },
  { id: 'd8', pillar: 'value', lever: 'Personalized Opportunity Alerts', mechanism: 'AI-curated deal recommendations based on investor profile and behavior patterns', compoundingEffect: 'Relevant alerts → higher open rates → more deal participation → more behavioral data → better personalization', kpi: 'Alert-to-inquiry conversion rate', target: '≥12% click-to-inquiry rate' },
  { id: 'd9', pillar: 'value', lever: 'Referral Growth Engine', mechanism: 'Incentivize existing investors to refer new buyers with subscription credits and priority access', compoundingEffect: 'Each referral has near-zero CAC → referred users have 2x higher conversion → they refer others → exponential growth', kpi: 'Referral-sourced users as % of total', target: '≥20% of new users from referrals by M6' },
  { id: 'd10', pillar: 'reinvestment', lever: 'Demand Acquisition Funding', mechanism: 'Allocate 30% of net profit to highest-ROI acquisition channels', compoundingEffect: 'Profitable acquisition spend → more users → more transactions → more profit → more acquisition budget', kpi: 'Monthly profit reinvested in growth', target: '≥Rp 30M/month reinvested by M6' },
  { id: 'd11', pillar: 'reinvestment', lever: 'Automation Efficiency Gains', mechanism: 'Invest in workflow automation to reduce per-transaction operational cost', compoundingEffect: 'Lower marginal cost → higher margins → more profit at same revenue → faster reinvestment cycle', kpi: 'Operational cost per transaction', target: '≤Rp 500K per transaction by M6' },
  { id: 'd12', pillar: 'reinvestment', lever: 'Network Effect Momentum', mechanism: 'Each new participant increases platform value for all existing participants', compoundingEffect: 'More users → more data → better AI → better experience → more users → exponential value creation', kpi: 'Platform network density score', target: 'Network density ≥0.4 by M12' },
];

const COMPOUNDING_KPIS: CompoundingKPI[] = [
  { metric: 'Monthly Transaction Revenue', month1: 'Rp 80M', month3: 'Rp 180M', month6: 'Rp 400M', month12: 'Rp 1.2B', compoundRate: '~25% MoM', driver: 'Deal velocity + listing density compounding' },
  { metric: 'Monthly Subscription MRR', month1: 'Rp 10M', month3: 'Rp 35M', month6: 'Rp 80M', month12: 'Rp 250M', compoundRate: '~30% MoM', driver: 'Investor acquisition + retention flywheel' },
  { metric: 'Premium Slot Revenue', month1: 'Rp 15M', month3: 'Rp 40M', month6: 'Rp 90M', month12: 'Rp 200M', compoundRate: '~22% MoM', driver: 'Demand-driven slot pricing uplift' },
  { metric: 'Vendor Commission Revenue', month1: 'Rp 5M', month3: 'Rp 18M', month6: 'Rp 50M', month12: 'Rp 150M', compoundRate: '~35% MoM', driver: 'Transaction volume × vendor network expansion' },
  { metric: 'Total Platform Revenue', month1: 'Rp 110M', month3: 'Rp 273M', month6: 'Rp 620M', month12: 'Rp 1.8B', compoundRate: '~26% MoM', driver: 'Multi-stream compounding effect' },
  { metric: 'Net Profit Margin', month1: '5%', month3: '15%', month6: '25%', month12: '35%', compoundRate: 'Expanding', driver: 'Automation + scale economies' },
  { metric: 'Customer LTV', month1: 'Rp 2M', month3: 'Rp 4M', month6: 'Rp 6.5M', month12: 'Rp 12M', compoundRate: '~18% MoM', driver: 'Retention + cross-sell + upsell compounding' },
  { metric: 'CAC Payback Period', month1: '6 months', month3: '4 months', month6: '2.5 months', month12: '1.5 months', compoundRate: 'Decreasing', driver: 'Organic + referral channel growth' },
];

const MONETIZATION_PRIORITIES: MonetizationPriority[] = [
  { rank: 1, stream: 'Transaction Commissions', currentRevenue: 'Rp 50M/mo', targetRevenue: 'Rp 400M/mo', effort: 'medium', timeToImpact: 'Immediate', action: 'Accelerate high-value deal pipeline with elite agent assignment and 21-day close targets', flywheelLink: 'Directly feeds Trust signals and Profit Generation stages' },
  { rank: 2, stream: 'Premium Listing Slots', currentRevenue: 'Rp 15M/mo', targetRevenue: 'Rp 90M/mo', effort: 'low', timeToImpact: '1-2 weeks', action: 'Deploy dynamic pricing engine — slots priced by district demand index (1.0x-2.5x multiplier)', flywheelLink: 'Revenue funds Demand Acquisition → more buyers → slots more valuable' },
  { rank: 3, stream: 'Investor Subscriptions', currentRevenue: 'Rp 10M/mo', targetRevenue: 'Rp 80M/mo', effort: 'medium', timeToImpact: '2-4 weeks', action: 'Launch 3-tier subscription (Basic free / Pro Rp 499K / Institutional Rp 5M) with 14-day trials', flywheelLink: 'Subscriber data improves AI → better alerts → higher retention → data flywheel' },
  { rank: 4, stream: 'Vendor Service Commissions', currentRevenue: 'Rp 5M/mo', targetRevenue: 'Rp 50M/mo', effort: 'medium', timeToImpact: '3-6 weeks', action: 'Activate 8% platform fee on all vendor-matched jobs with automated invoicing', flywheelLink: 'More transactions → more vendor jobs → more commission → reinvestment fuel' },
  { rank: 5, stream: 'Data Intelligence API', currentRevenue: 'Rp 0', targetRevenue: 'Rp 30M/mo', effort: 'high', timeToImpact: '3-6 months', action: 'Package district liquidity, pricing, and demand data as tiered API for fund managers', flywheelLink: 'Institutional adoption deepens data moat → more data → better platform intelligence' },
  { rank: 6, stream: 'Financing Referral Fees', currentRevenue: 'Rp 0', targetRevenue: 'Rp 25M/mo', effort: 'low', timeToImpact: '4-8 weeks', action: 'Activate bank partnership lead routing with 0.5% referral commission on approved mortgages', flywheelLink: 'Financing access → more deals close → more commissions → flywheel acceleration' },
];

const SCALING_PHASES: ScalingPhase[] = [
  { phase: 1, title: 'Flywheel Ignition', duration: 'Months 1-2', revenueTarget: 'Rp 110-150M/month', focus: 'Start the flywheel spinning with concentrated effort on transaction volume and first monetization streams', initiatives: ['Concentrate listings in 3 highest-demand districts for density effect', 'Close 8-12 verified transactions to generate trust signals and case studies', 'Launch premium listing slots with introductory pricing to establish revenue stream', 'Activate investor subscription trial funnel targeting 50 free trial activations', 'Deploy referral program with Rp 200K credit per successful referral'], exitCriteria: 'Flywheel completing full cycles — transactions generating trust → trust attracting premium sellers' },
  { phase: 2, title: 'Momentum Acceleration', duration: 'Months 3-4', revenueTarget: 'Rp 250-350M/month', focus: 'Increase flywheel velocity through multi-stream monetization and conversion optimization', initiatives: ['Expand listing coverage to 8 districts with ≥30 listings each', 'Activate vendor commission stream with automated job matching and invoicing', 'Optimize subscription conversion from trial to paid (target ≥25%)', 'Deploy dynamic premium slot pricing based on district demand index', 'Reinvest 30% of net profit into highest-ROI acquisition channels', 'Compress deal cycle to ≤28 days through AI-assisted negotiation support'], exitCriteria: '4+ revenue streams active with positive unit economics on each' },
  { phase: 3, title: 'Compounding Growth', duration: 'Months 5-8', revenueTarget: 'Rp 500-800M/month', focus: 'Leverage compounding effects — each flywheel cycle produces more output than the previous', initiatives: ['Launch data intelligence API for institutional investors', 'Activate financing referral partnerships with 3+ bank partners', 'Achieve ≥20% of new users from organic referral channel', 'Deploy portfolio analytics to drive investor retention above 85%', 'Implement automated cross-sell between transaction, subscription, and vendor services', 'Build network effect momentum — platform value increasing for all participants'], exitCriteria: 'Revenue growing ≥20% MoM with declining CAC and expanding margins' },
  { phase: 4, title: 'Scale Dominance', duration: 'Months 9-12', revenueTarget: 'Rp 1.2-1.8B/month', focus: 'Flywheel self-sustaining — growth driven by network effects and compounding intelligence', initiatives: ['Expand to 3+ cities with proven playbook replication', 'Achieve net profit margin ≥30% through automation and scale economies', 'Launch institutional tier subscriptions for fund managers and developers', 'Build proprietary data moat that competitors cannot replicate', 'Prepare for Series A fundraise with validated unit economics and growth trajectory'], exitCriteria: 'Self-sustaining flywheel — growth continues with reduced marginal founder effort' },
];

export function useRevenueFlywheelStrategy() {
  const pillarLabels: Record<string, string> = {
    transaction: 'Transaction Volume',
    monetization: 'Monetization Layer',
    value: 'Customer Value',
    reinvestment: 'Profit Reinvestment',
  };

  return {
    flywheelLoops: FLYWHEEL_LOOPS,
    drivers: DRIVERS,
    driversByPillar: (p: FlywheelDriver['pillar']) => DRIVERS.filter(d => d.pillar === p),
    compoundingKPIs: COMPOUNDING_KPIS,
    monetizationPriorities: MONETIZATION_PRIORITIES,
    scalingPhases: SCALING_PHASES,
    pillarLabels,
    pillars: ['transaction', 'monetization', 'value', 'reinvestment'] as const,
  };
}
