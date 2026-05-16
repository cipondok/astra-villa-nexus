
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Globe, DollarSign, TrendingUp, Building2, Shield, Target,
  BarChart3, Landmark, AlertTriangle, CheckCircle2, ArrowUpRight,
  Zap, Crown, Network, Layers, Orbit, Database, LineChart
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// ── Section 1: $50M Planetary Revenue Infrastructure ─────────────────────────
const revenueStreams = [
  {
    name: 'Enterprise Intelligence Subscriptions',
    share: 28,
    revenue: '$14M/mo',
    tactics: [
      'Institutional-grade analytics for SWFs, REITs & pension funds ($50K–$500K/mo)',
      'Global brokerage franchise licensing across 30+ countries',
      'White-label market intelligence APIs for financial institutions',
      'Predictive capital flow dashboards for asset managers'
    ]
  },
  {
    name: 'Transaction Infrastructure Fees',
    share: 27,
    revenue: '$13.5M/mo',
    tactics: [
      'Success-fee facilitation on $15B+ annual deal volume (0.3–0.5%)',
      'Cross-border settlement & escrow coordination services',
      'Syndicated investment orchestration fees ($100K–$1M per deal)',
      'Mega-project developer campaign packages ($200K–$2M)'
    ]
  },
  {
    name: 'Global Marketplace Premium',
    share: 23,
    revenue: '$11.5M/mo',
    tactics: [
      'Dynamic featured listing campaigns across 50+ metro markets',
      'Investor priority access & AI deal-matching tiers',
      'Premium cross-border property comparison intelligence',
      'Exclusive inventory zone subscriptions for top agents'
    ]
  },
  {
    name: 'Cross-Asset Data Products',
    share: 22,
    revenue: '$11M/mo',
    tactics: [
      'Hospitality & commercial asset intelligence verticals',
      'Infrastructure project pipeline analytics licensing',
      'Urban development forecasting data subscriptions',
      'Multi-asset portfolio optimization intelligence'
    ]
  }
];

const trajectoryScenarios = [
  { scenario: 'Conservative', year1: '$25M/mo', year2: '$38M/mo', year3: '$50M/mo', confidence: 70 },
  { scenario: 'Base Case', year1: '$30M/mo', year2: '$42M/mo', year3: '$55M/mo', confidence: 85 },
  { scenario: 'Accelerated', year1: '$35M/mo', year2: '$50M/mo', year3: '$65M/mo', confidence: 60 }
];

// ── Section 2: Digital Economy Leadership ────────────────────────────────────
const leadershipPillars = [
  {
    title: 'Digital Market Standardization',
    icon: Database,
    strategies: [
      'Publish "Astra Global Property Liquidity Index" — institutional benchmark',
      'Lead consortium for open property data interoperability standards',
      'Establish digital transaction discovery protocol adopted by 20+ markets',
      'Partner with UN-Habitat on urban transparency frameworks'
    ],
    kpis: ['Index cited in 500+ institutional reports/year', 'Protocol adopted by 15+ national regulators']
  },
  {
    title: 'Ecosystem Economic Leadership',
    icon: Network,
    strategies: [
      'Orchestrate $50B+ annual financing through integrated mortgage partners',
      'Enable fractional & syndicated investment discovery (tokenization-ready)',
      'Integrate ownership lifecycle services across 30+ countries',
      'Launch "Astra Capital Markets" for institutional deal syndication'
    ],
    kpis: ['$50B+ financing facilitated annually', '10M+ fractional investment participants']
  },
  {
    title: 'Thought Leadership & Policy Influence',
    icon: Crown,
    strategies: [
      'Annual "Astra World Summit" — 5,000+ institutional attendees, 40+ countries',
      'Strategic advisory relationships with G20 housing policy committees',
      'Quarterly Global Real Estate Intelligence Report (Bloomberg-grade)',
      'Endowed research chairs at 5 top global business schools'
    ],
    kpis: ['#1 PropTech brand recognition globally', '25M+ annual research report readers']
  }
];

// ── Section 3: Cross-Asset Intelligence Expansion ────────────────────────────
const assetVerticals = [
  {
    vertical: 'Hospitality & Tourism Assets',
    phase: 'Phase 1',
    timeline: 'Year 1–2',
    dataPoints: 'Occupancy trends, RevPAR forecasting, tourism flow correlation',
    revenueTarget: '$2M/mo by Y2',
    synergy: 'Overlapping investor base, shared location intelligence'
  },
  {
    vertical: 'Commercial & Industrial',
    phase: 'Phase 2',
    timeline: 'Year 2–3',
    dataPoints: 'Lease velocity, tenant creditworthiness, cap rate intelligence',
    revenueTarget: '$4M/mo by Y3',
    synergy: 'Cross-asset portfolio optimization for institutional clients'
  },
  {
    vertical: 'Infrastructure Projects',
    phase: 'Phase 3',
    timeline: 'Year 3–4',
    dataPoints: 'Public-private pipeline tracking, development feasibility scores',
    revenueTarget: '$3M/mo by Y4',
    synergy: 'Urban development forecasting feeds residential intelligence'
  },
  {
    vertical: 'Land & Urban Development',
    phase: 'Phase 4',
    timeline: 'Year 4–5',
    dataPoints: 'Zoning change predictions, migration-driven demand, satellite intelligence',
    revenueTarget: '$2M/mo by Y5',
    synergy: 'Proprietary urban growth models enhance all verticals'
  }
];

const expansionKPIs = [
  { label: 'Non-Property Revenue Share', target: '35%+ of total', current: 22 },
  { label: 'Cross-Asset Investor Engagement', target: '500K+ users', current: 30 },
  { label: 'Data Partner Integrations', target: '50+ providers', current: 40 },
  { label: 'Multi-Asset Intelligence Products', target: '12+ live', current: 25 }
];

// ── Section 4: Sustainability Risks ──────────────────────────────────────────
const risks = [
  {
    risk: 'Geopolitical Fragmentation & Data Sovereignty',
    severity: 'Critical',
    timeframe: 'Ongoing',
    impact: 'Forced data localization, market access restrictions, compliance fragmentation',
    mitigation: 'Federated data architecture, jurisdictional holding entities, proactive regulatory engagement in 30+ markets'
  },
  {
    risk: 'Systemic Market Correction',
    severity: 'Critical',
    timeframe: 'Cyclical',
    impact: 'Transaction volume collapse, institutional capital withdrawal, revenue cliff',
    mitigation: 'Counter-cyclical intelligence products (distressed asset analytics), geographic diversification, 18-month cash reserve'
  },
  {
    risk: 'Platform Dependency & Antitrust Scrutiny',
    severity: 'High',
    timeframe: 'Year 3–5',
    impact: 'Regulatory intervention, forced interoperability, reputational damage',
    mitigation: 'Open ecosystem philosophy, data portability commitments, proactive self-regulation'
  },
  {
    risk: 'Cross-Asset Expansion Dilution',
    severity: 'High',
    timeframe: 'Year 2–4',
    impact: 'Brand confusion, resource fragmentation, core market share erosion',
    mitigation: 'Sequenced vertical launches, unified intelligence brand, dedicated vertical teams with shared infrastructure'
  },
  {
    risk: 'Technology Paradigm Disruption',
    severity: 'Medium',
    timeframe: 'Year 5+',
    impact: 'New entrants with superior AI/blockchain infrastructure',
    mitigation: 'R&D investment (8% of revenue), strategic acquisitions, open innovation partnerships'
  }
];

// ── Section 5: Founder Priorities ────────────────────────────────────────────
const founderPriorities = [
  { stage: 'Infrastructure CEO', period: '$10M–$20M/mo', priorities: ['Build C-suite operating team', 'Establish board governance cadence', 'Lead institutional relationship development', 'Shape global regulatory strategy'] },
  { stage: 'Category Architect', period: '$20M–$35M/mo', priorities: ['Drive cross-asset expansion decisions', 'Position platform as policy influencer', 'Oversee M&A and partnership strategy', 'Build academic & research advisory network'] },
  { stage: 'Planetary Steward', period: '$35M–$50M+/mo', priorities: ['Champion long-term market transparency mission', 'Ensure ethical AI governance frameworks', 'Cultivate institutional trust at sovereign level', 'Transition to strategic board leadership'] }
];

const severityColor = (s: string) => {
  if (s === 'Critical') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s === 'High') return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
  return 'bg-primary/10 text-primary border-primary/20';
};

const FiftyMillionPlanetaryBlueprint = () => {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeIn}>
        <Card className="border-primary/20 bg-gradient-to-r from-chart-1/5 via-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-chart-1/10 border border-chart-1/20">
                  <Orbit className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    $50M Planetary Market Infrastructure Blueprint
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Digital economy leadership • Cross-asset intelligence • $600M ARR infrastructure
                  </p>
                </div>
              </div>
              <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-xs">
                $600M ARR Target
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue" className="text-xs">🪐 Revenue Infra</TabsTrigger>
          <TabsTrigger value="leadership" className="text-xs">🌐 Economy Lead</TabsTrigger>
          <TabsTrigger value="crossasset" className="text-xs">📊 Cross-Asset</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">⚠️ Sustainability</TabsTrigger>
          <TabsTrigger value="founder" className="text-xs">👤 Founder Focus</TabsTrigger>
        </TabsList>

        {/* ── Revenue Infrastructure ──────────────────────────────────────── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueStreams.map((stream, i) => (
              <motion.div key={stream.name} {...fadeIn} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50 hover:border-chart-1/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-foreground">{stream.name}</CardTitle>
                      <Badge variant="outline" className="text-xs font-mono">{stream.revenue}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={stream.share} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground font-mono">{stream.share}%</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1">
                      {stream.tactics.map((t, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowUpRight className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trajectory Scenarios */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                Multi-Year Revenue Trajectory Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {trajectoryScenarios.map((s) => (
                  <div key={s.scenario} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground">{s.scenario}</span>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">{s.confidence}% conf</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between"><span>Year 1:</span><span className="font-mono text-foreground">{s.year1}</span></div>
                      <div className="flex justify-between"><span>Year 2:</span><span className="font-mono text-foreground">{s.year2}</span></div>
                      <div className="flex justify-between"><span>Year 3:</span><span className="font-mono text-foreground">{s.year3}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Digital Economy Leadership ───────────────────────────────────── */}
        <TabsContent value="leadership" className="space-y-4 mt-4">
          {leadershipPillars.map((pillar, i) => (
            <motion.div key={pillar.title} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <pillar.icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold text-foreground">{pillar.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Strategies</p>
                      <ul className="space-y-1.5">
                        {pillar.strategies.map((s, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3 text-chart-3 mt-0.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target KPIs</p>
                      {pillar.kpis.map((k, j) => (
                        <div key={j} className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/10 mb-1.5">
                          <TrendingUp className="h-3 w-3 text-primary flex-shrink-0" />
                          <span className="text-xs text-foreground">{k}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Cross-Asset Intelligence ─────────────────────────────────────── */}
        <TabsContent value="crossasset" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assetVerticals.map((v, i) => (
              <motion.div key={v.vertical} {...fadeIn} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-foreground">{v.vertical}</CardTitle>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{v.phase}</Badge>
                        <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-[10px]">{v.timeline}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Intelligence Signals</p>
                      <p className="text-xs text-muted-foreground">{v.dataPoints}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Synergy</p>
                      <p className="text-xs text-muted-foreground">{v.synergy}</p>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                      <DollarSign className="h-3 w-3 text-chart-1" />
                      <span className="text-xs font-semibold text-chart-1">{v.revenueTarget}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Expansion KPIs */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Cross-Asset Expansion KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {expansionKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground mb-1">{kpi.target}</p>
                    <Progress value={kpi.current} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sustainability Risks ─────────────────────────────────────────── */}
        <TabsContent value="risks" className="space-y-3 mt-4">
          {risks.map((r, i) => (
            <motion.div key={r.risk} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-chart-3 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{r.risk}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge className={`text-[10px] border ${severityColor(r.severity)}`}>{r.severity}</Badge>
                      <Badge variant="outline" className="text-[10px]">{r.timeframe}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                    <div>
                      <p className="text-[10px] font-semibold text-destructive/80 uppercase mb-0.5">Impact</p>
                      <p className="text-xs text-muted-foreground">{r.impact}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-chart-1/80 uppercase mb-0.5">Mitigation</p>
                      <p className="text-xs text-muted-foreground">{r.mitigation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Founder Focus ────────────────────────────────────────────────── */}
        <TabsContent value="founder" className="space-y-4 mt-4">
          {founderPriorities.map((stage, i) => (
            <motion.div key={stage.stage} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      {stage.stage}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">{stage.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {stage.priorities.map((p, j) => (
                      <li key={j} className="flex items-center gap-2 p-2 rounded-md bg-muted/20 border border-border/20">
                        <CheckCircle2 className="h-3.5 w-3.5 text-chart-1 flex-shrink-0" />
                        <span className="text-xs text-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FiftyMillionPlanetaryBlueprint;
