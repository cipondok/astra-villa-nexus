export interface EmpirePillar {
  id: string;
  title: string;
  description: string;
  capabilities: { name: string; maturity: number; priority: 'critical' | 'high' | 'medium' }[];
  kpis: { metric: string; current: string; target: string; status: 'on-track' | 'at-risk' | 'ahead' }[];
}

export interface EvolutionPhase {
  phase: number;
  name: string;
  timeline: string;
  theme: string;
  objectives: string[];
  investments: string[];
  unlocks: string[];
  status: 'active' | 'upcoming' | 'future';
}

export interface LeadershipKPI {
  domain: string;
  metrics: { label: string; value: string; trend: 'up' | 'down' | 'stable'; benchmark: string }[];
}

export interface EmpireData {
  pillars: EmpirePillar[];
  evolutionRoadmap: EvolutionPhase[];
  leadershipKPIs: LeadershipKPI[];
  positioningNarrative: { headline: string; thesis: string; moats: string[]; differentiators: string[] };
}

export function useGlobalProptechEmpire(): EmpireData {
  const pillars: EmpirePillar[] = [
    {
      id: 'liquidity',
      title: 'Global Liquidity Intelligence Leadership',
      description: 'Position ASTRA as the definitive source of real-time transaction intelligence, predictive pricing, and cross-market demand visibility for global real estate capital.',
      capabilities: [
        { name: 'Predictive transaction analytics', maturity: 45, priority: 'critical' },
        { name: 'Cross-market demand visibility', maturity: 30, priority: 'critical' },
        { name: 'Accelerated deal execution infra', maturity: 55, priority: 'critical' },
        { name: 'District-level liquidity scoring', maturity: 60, priority: 'high' },
        { name: 'Institutional-grade data feeds', maturity: 20, priority: 'high' },
        { name: 'AI cycle-phase detection', maturity: 35, priority: 'medium' },
      ],
      kpis: [
        { metric: 'Liquidity Index Accuracy', current: '72%', target: '95%', status: 'on-track' },
        { metric: 'Prediction Lead Time', current: '14 days', target: '90 days', status: 'at-risk' },
        { metric: 'Data Coverage (Cities)', current: '3', target: '50', status: 'at-risk' },
        { metric: 'Institutional Data Clients', current: '0', target: '25', status: 'at-risk' },
      ],
    },
    {
      id: 'multiproduct',
      title: 'Multi-Product Platform Expansion',
      description: 'Evolve from a single marketplace into a diversified product ecosystem spanning transactions, intelligence subscriptions, enterprise analytics, and capital coordination.',
      capabilities: [
        { name: 'Marketplace transaction coordination', maturity: 65, priority: 'critical' },
        { name: 'Data intelligence subscriptions', maturity: 25, priority: 'critical' },
        { name: 'Enterprise analytics solutions', maturity: 15, priority: 'high' },
        { name: 'Vendor SaaS ecosystem', maturity: 40, priority: 'high' },
        { name: 'Investor terminal platform', maturity: 35, priority: 'high' },
        { name: 'Capital coordination APIs', maturity: 10, priority: 'medium' },
      ],
      kpis: [
        { metric: 'Revenue Streams Active', current: '2', target: '6', status: 'on-track' },
        { metric: 'Subscription ARR', current: 'Rp 120M', target: 'Rp 5B', status: 'at-risk' },
        { metric: 'Enterprise Contracts', current: '0', target: '15', status: 'at-risk' },
        { metric: 'API Monthly Calls', current: '0', target: '1M', status: 'at-risk' },
      ],
    },
    {
      id: 'ecosystem',
      title: 'Ecosystem Network Consolidation',
      description: 'Build an integrated network of strategic partnerships across property, finance, and technology sectors that creates compounding switching costs and ecosystem lock-in.',
      capabilities: [
        { name: 'Strategic partnership network', maturity: 30, priority: 'critical' },
        { name: 'Integrated service offerings', maturity: 40, priority: 'high' },
        { name: 'Performance transparency narratives', maturity: 50, priority: 'high' },
        { name: 'Financial institution integrations', maturity: 15, priority: 'high' },
        { name: 'Developer pipeline partnerships', maturity: 25, priority: 'medium' },
        { name: 'Cross-border referral networks', maturity: 10, priority: 'medium' },
      ],
      kpis: [
        { metric: 'Active Partnerships', current: '8', target: '120', status: 'on-track' },
        { metric: 'Network Density Score', current: '18', target: '85', status: 'at-risk' },
        { metric: 'Switching Cost Index', current: '2.1x', target: '8x', status: 'on-track' },
        { metric: 'Partner Revenue Share', current: '5%', target: '30%', status: 'at-risk' },
      ],
    },
    {
      id: 'innovation',
      title: 'Scalable Innovation Culture',
      description: 'Embed a continuous experimentation mindset, data-informed decision processes, and structured capability development that accelerates competitive advantage over time.',
      capabilities: [
        { name: 'Continuous experimentation framework', maturity: 35, priority: 'high' },
        { name: 'Data-informed decision processes', maturity: 50, priority: 'critical' },
        { name: 'Capability development roadmaps', maturity: 40, priority: 'high' },
        { name: 'AI/ML model iteration pipeline', maturity: 30, priority: 'high' },
        { name: 'Talent density optimization', maturity: 20, priority: 'medium' },
        { name: 'Innovation lab infrastructure', maturity: 10, priority: 'medium' },
      ],
      kpis: [
        { metric: 'Experiment Velocity', current: '3/mo', target: '20/mo', status: 'on-track' },
        { metric: 'Model Accuracy Improvement', current: '2%/mo', target: '5%/mo', status: 'ahead' },
        { metric: 'Feature Ship Cycle', current: '14 days', target: '3 days', status: 'at-risk' },
        { metric: 'Engineering Leverage Ratio', current: '1.2x', target: '5x', status: 'on-track' },
      ],
    },
  ];

  const evolutionRoadmap: EvolutionPhase[] = [
    {
      phase: 1,
      name: 'Foundation Dominance',
      timeline: 'Year 0–1',
      theme: 'Win the first city. Prove the model. Build the data moat.',
      objectives: [
        'Achieve liquidity leadership in Jakarta premium segment',
        'Close first 1,000 verified transactions',
        'Launch marketplace + investor subscription revenue streams',
        'Build proprietary transaction dataset with 10K+ data points',
      ],
      investments: ['Core product engineering', 'Agent network recruitment', 'Demand generation campaigns', 'Data pipeline infrastructure'],
      unlocks: ['Product-market fit signal', 'First institutional investor interest', 'Series-A readiness metrics'],
      status: 'active',
    },
    {
      phase: 2,
      name: 'Regional Network Flywheel',
      timeline: 'Year 1–3',
      theme: 'Scale to 10 cities. Activate network effects. Diversify revenue.',
      objectives: [
        'Expand to 10 Indonesian cities with positive unit economics',
        'Launch enterprise data intelligence subscriptions',
        'Build vendor SaaS ecosystem with 500+ active providers',
        'Achieve Rp 50B+ ARR across all revenue streams',
      ],
      investments: ['City expansion playbook execution', 'Enterprise sales team', 'Vendor platform development', 'AI model scaling infrastructure'],
      unlocks: ['Series-B fundraise at $100M+ valuation', 'Cross-city network effects activation', 'Institutional data product revenue'],
      status: 'upcoming',
    },
    {
      phase: 3,
      name: 'Intelligence Platform Transition',
      timeline: 'Year 3–5',
      theme: 'Transform from marketplace to intelligence infrastructure. Enter APAC.',
      objectives: [
        'Launch cross-border investment intelligence terminal',
        'Expand to 5 APAC countries (Singapore, Malaysia, Thailand, Vietnam, Philippines)',
        'Build institutional capital coordination layer',
        'Achieve $30M+ ARR with 40%+ gross margins',
      ],
      investments: ['International regulatory compliance', 'Institutional sales infrastructure', 'Multi-currency intelligence systems', 'Global data partnerships'],
      unlocks: ['Pre-IPO governance readiness', 'Category-defining market position', 'Global institutional client base'],
      status: 'future',
    },
    {
      phase: 4,
      name: 'Global Infrastructure Dominance',
      timeline: 'Year 5–10',
      theme: 'Become the Bloomberg of real estate. IPO. Shape the industry.',
      objectives: [
        'Operate in 30+ countries with unified intelligence layer',
        'IPO or strategic liquidity event at $1B+ valuation',
        'Launch capital markets products (syndication, tokenization)',
        'Establish industry-standard data protocols and benchmarks',
      ],
      investments: ['Global data infrastructure', 'Capital markets licensing', 'Industry standards leadership', 'Acquisition strategy execution'],
      unlocks: ['Generational wealth creation', 'Industry transformation legacy', 'Self-sustaining competitive moat'],
      status: 'future',
    },
  ];

  const leadershipKPIs: LeadershipKPI[] = [
    {
      domain: 'Market Position',
      metrics: [
        { label: 'Liquidity Market Share', value: '12%', trend: 'up', benchmark: '40% (dominance)' },
        { label: 'Brand Authority Index', value: '34/100', trend: 'up', benchmark: '75/100' },
        { label: 'Data Coverage Breadth', value: '3 cities', trend: 'stable', benchmark: '50 cities' },
        { label: 'Competitor Intelligence Gap', value: '1.4x', trend: 'up', benchmark: '5x' },
      ],
    },
    {
      domain: 'Revenue & Economics',
      metrics: [
        { label: 'Total ARR', value: 'Rp 1.2B', trend: 'up', benchmark: 'Rp 50B' },
        { label: 'Revenue Diversification (HHI)', value: '0.72', trend: 'down', benchmark: '< 0.25' },
        { label: 'LTV / CAC Ratio', value: '4.2x', trend: 'up', benchmark: '> 10x' },
        { label: 'Gross Margin', value: '58%', trend: 'up', benchmark: '> 70%' },
      ],
    },
    {
      domain: 'Network Strength',
      metrics: [
        { label: 'Active Participant Density', value: '2,400', trend: 'up', benchmark: '100K+' },
        { label: 'Cross-Side Engagement', value: '28%', trend: 'up', benchmark: '> 60%' },
        { label: 'Referral Contribution', value: '15%', trend: 'up', benchmark: '> 35%' },
        { label: 'Ecosystem Stickiness', value: '2.1x', trend: 'stable', benchmark: '> 8x' },
      ],
    },
    {
      domain: 'Innovation Velocity',
      metrics: [
        { label: 'AI Model Accuracy', value: '78%', trend: 'up', benchmark: '> 95%' },
        { label: 'Feature Ship Cadence', value: '3/mo', trend: 'up', benchmark: '20/mo' },
        { label: 'Data Compounding Rate', value: '12%/mo', trend: 'up', benchmark: '25%/mo' },
        { label: 'Proprietary Data Points', value: '45K', trend: 'up', benchmark: '10M+' },
      ],
    },
  ];

  const positioningNarrative = {
    headline: 'The Intelligence Infrastructure for Global Real Estate Capital',
    thesis: 'ASTRA Villa is building the world\'s most comprehensive real-time transaction intelligence layer for real estate — enabling investors, institutions, and market participants to discover, evaluate, and execute property deals with unprecedented speed, accuracy, and confidence. We are not a listing portal. We are the operating system through which global real estate capital flows.',
    moats: [
      'Proprietary transaction dataset compounding at 12%+ monthly — every deal makes predictions more accurate',
      'Multi-sided network effects across buyers, sellers, agents, vendors, and investors create exponential switching costs',
      'AI-driven liquidity intelligence with 78%+ accuracy gives participants an unfair information advantage',
      'Integrated service ecosystem (financing, legal, renovation) captures full transaction lifecycle value',
      'First-mover advantage in Southeast Asian institutional-grade property intelligence infrastructure',
    ],
    differentiators: [
      'Real-time liquidity scoring vs static listing databases',
      'Predictive pricing intelligence vs historical comparables',
      'Full-lifecycle transaction coordination vs fragmented point solutions',
      'Institutional-grade analytics vs consumer-oriented search tools',
      'Data-driven deal execution vs relationship-dependent brokerage',
    ],
  };

  return { pillars, evolutionRoadmap, leadershipKPIs, positioningNarrative };
}
