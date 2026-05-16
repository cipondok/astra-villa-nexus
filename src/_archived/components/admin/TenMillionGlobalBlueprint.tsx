
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Globe, DollarSign, TrendingUp, Building2, Shield, Target,
  BarChart3, Users, Landmark, AlertTriangle, CheckCircle2,
  ArrowUpRight, Zap, Crown, Network, Layers
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// ── Section 1: $10M Global Revenue Scale Engine ──────────────────────────────
const revenueStreams = [
  {
    name: 'Enterprise Vendor Subscriptions',
    share: 30,
    revenue: '$3.0M/mo',
    tactics: [
      'Global brokerage franchise licensing ($5K–$50K/mo tiers)',
      'Regional exclusive zone partnerships',
      'White-label analytics for large agencies',
      'Automated upsell triggers based on listing performance'
    ]
  },
  {
    name: 'Institutional Data Intelligence',
    share: 25,
    revenue: '$2.5M/mo',
    tactics: [
      'Sovereign wealth fund analytics dashboards ($25K–$100K/mo)',
      'Cross-border capital flow intelligence reports',
      'Predictive market cycle subscription products',
      'Custom institutional research & API access'
    ]
  },
  {
    name: 'Transaction Facilitation',
    share: 25,
    revenue: '$2.5M/mo',
    tactics: [
      'Success-fee model on platform-facilitated deals (0.3–0.8%)',
      'Syndicated investment coordination fees',
      'Cross-border escrow & settlement services',
      'Mega-project developer marketing packages ($50K–$500K)'
    ]
  },
  {
    name: 'Premium Marketplace Services',
    share: 20,
    revenue: '$2.0M/mo',
    tactics: [
      'Global featured listing campaigns (dynamic pricing)',
      'Investor priority access subscriptions',
      'AI deal-matching premium tier',
      'Cross-market property comparison tools'
    ]
  }
];

const milestones = [
  { quarter: 'Q1', target: '$4M/mo', focus: 'Consolidate 5+ markets, enterprise tier launch', progress: 40 },
  { quarter: 'Q2', target: '$6M/mo', focus: 'Institutional data products live, 3 SWF partnerships', progress: 60 },
  { quarter: 'Q3', target: '$8M/mo', focus: 'Transaction facilitation at scale, cross-border flow', progress: 80 },
  { quarter: 'Q4', target: '$10M/mo', focus: 'Full global engine, margin optimization, IPO prep', progress: 100 }
];

// ── Section 2: Worldwide Category Leadership ─────────────────────────────────
const leadershipPillars = [
  {
    title: 'Global Liquidity Network Supremacy',
    icon: Network,
    strategies: [
      'Dominant listings density in 20+ tier-1 international cities',
      'Exclusive developer consortium inventory agreements',
      'Cross-border investor opportunity routing (auto-match by DNA)',
      'Real-time global liquidity index publishing'
    ],
    kpis: ['35%+ market share in active markets', '500K+ cross-border inquiries/quarter']
  },
  {
    title: 'Thought Leadership & Authority',
    icon: Crown,
    strategies: [
      'Quarterly "Global Property Intelligence Report" (institutional grade)',
      'Annual "Astra World Property Summit" (1,000+ institutional attendees)',
      'Strategic media partnerships (Bloomberg, Reuters, CNBC)',
      'Academic research collaboration with top business schools'
    ],
    kpis: ['#1 brand recall in PropTech category', '10M+ annual report downloads']
  },
  {
    title: 'Competitive Moat Reinforcement',
    icon: Shield,
    strategies: [
      'Ecosystem switching costs via integrated financing & services',
      'Proprietary behavioral intelligence (10B+ data points)',
      'User habit formation through superior AI-driven discovery',
      'Patent portfolio for predictive pricing algorithms'
    ],
    kpis: ['<5% annual vendor churn', '85%+ platform dependency score']
  }
];

// ── Section 3: Institutional Capital Dominance ───────────────────────────────
const institutionalTiers = [
  {
    tier: 'Sovereign & Pension',
    targets: 'GIC, Temasek, ADIA, CalPERS, CPPIB',
    engagement: 'Strategic data partnership → pilot co-investment → platform equity',
    volume: '$500M–$2B annual flow',
    status: 'Pipeline'
  },
  {
    tier: 'Global REITs & Asset Managers',
    targets: 'Blackstone, Brookfield, Prologis, CapitaLand',
    engagement: 'Analytics subscription → deal pipeline access → co-branded launches',
    volume: '$200M–$800M annual flow',
    status: 'Active'
  },
  {
    tier: 'Family Offices & HNW Networks',
    targets: 'Regional family offices, private wealth managers',
    engagement: 'Curated deal feed → priority access → syndication participation',
    volume: '$50M–$300M annual flow',
    status: 'Scaling'
  },
  {
    tier: 'Development Finance',
    targets: 'IFC, ADB, DBS, Standard Chartered',
    engagement: 'Market data licensing → project financing integration → joint ventures',
    volume: '$100M–$500M annual flow',
    status: 'Emerging'
  }
];

const capitalKPIs = [
  { label: 'Institutional Capital Facilitated', target: '$5B+/year', current: 65 },
  { label: 'Enterprise Analytics Revenue', target: '$30M ARR', current: 50 },
  { label: 'Partnership Renewal Rate', target: '92%+', current: 78 },
  { label: 'Cross-Border Deal Volume', target: '2,000+/quarter', current: 45 }
];

// ── Section 4: Operational Monitoring ────────────────────────────────────────
const opsChecklist = [
  { item: 'Global revenue run-rate tracking (daily)', done: true },
  { item: 'Regional P&L dashboard review (weekly)', done: true },
  { item: 'Institutional pipeline velocity monitoring', done: false },
  { item: 'Cross-border regulatory compliance audit', done: false },
  { item: 'Enterprise churn early-warning system', done: true },
  { item: 'Market-by-market unit economics review', done: false },
  { item: 'Global vendor NPS quarterly survey', done: true },
  { item: 'Competitive intelligence briefing (bi-weekly)', done: false },
  { item: 'Technology infrastructure load testing', done: true },
  { item: 'Currency hedging & FX risk review', done: false },
  { item: 'Data security & privacy compliance (GDPR/PDPA)', done: true },
  { item: 'Board reporting & investor relations cadence', done: false }
];

// ── Section 5: Risk Mitigation ───────────────────────────────────────────────
const risks = [
  {
    risk: 'Geopolitical & Regulatory Fragmentation',
    severity: 'Critical',
    impact: 'Market access restrictions, compliance costs, operational delays',
    mitigation: 'Jurisdictional holding structure, local legal partnerships, proactive regulator engagement'
  },
  {
    risk: 'Currency & Macroeconomic Volatility',
    severity: 'High',
    impact: 'Revenue erosion from FX swings, regional recession impact',
    mitigation: 'Natural hedging via multi-currency revenue, FX treasury strategy, geographic diversification'
  },
  {
    risk: 'Enterprise Customer Concentration',
    severity: 'High',
    impact: 'Revenue cliff if top 3 clients churn simultaneously',
    mitigation: 'Cap single-client revenue at 8%, diversify across tiers, multi-year contracts'
  },
  {
    risk: 'Technology Infrastructure Scalability',
    severity: 'Medium',
    impact: 'Latency/downtime during global traffic peaks',
    mitigation: 'Multi-region cloud deployment, CDN optimization, chaos engineering program'
  },
  {
    risk: 'Competitive Platform Emergence',
    severity: 'Medium',
    impact: 'Market share erosion in key cities',
    mitigation: 'Accelerate data moat, exclusive partnerships, aggressive talent acquisition'
  }
];

const severityColor = (s: string) => {
  if (s === 'Critical') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s === 'High') return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
  return 'bg-primary/10 text-primary border-primary/20';
};

const TenMillionGlobalBlueprint = () => {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeIn}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-chart-1/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    $10M Monthly Global Scale Blueprint
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Worldwide category leadership • Institutional capital dominance • Global infrastructure positioning
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                $120M ARR Target
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue" className="text-xs">💰 Revenue Engine</TabsTrigger>
          <TabsTrigger value="leadership" className="text-xs">👑 Category Lead</TabsTrigger>
          <TabsTrigger value="capital" className="text-xs">🏛️ Capital Command</TabsTrigger>
          <TabsTrigger value="ops" className="text-xs">📊 Ops Monitor</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">⚠️ Risk Matrix</TabsTrigger>
        </TabsList>

        {/* ── Revenue Engine ──────────────────────────────────────────────── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          {/* Revenue streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueStreams.map((stream, i) => (
              <motion.div key={stream.name} {...fadeIn} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
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

          {/* Milestones */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Quarterly Revenue Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {milestones.map((m) => (
                  <div key={m.quarter} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{m.quarter}</span>
                      <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-[10px]">{m.target}</Badge>
                    </div>
                    <Progress value={m.progress} className="h-1 mb-1.5" />
                    <p className="text-[10px] text-muted-foreground">{m.focus}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Category Leadership ─────────────────────────────────────────── */}
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

        {/* ── Capital Command ─────────────────────────────────────────────── */}
        <TabsContent value="capital" className="space-y-4 mt-4">
          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutionalTiers.map((tier, i) => (
              <motion.div key={tier.tier} {...fadeIn} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-primary" />
                        {tier.tier}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px]">{tier.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Targets</p>
                      <p className="text-xs text-foreground">{tier.targets}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Engagement Path</p>
                      <p className="text-xs text-muted-foreground">{tier.engagement}</p>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                      <DollarSign className="h-3 w-3 text-chart-1" />
                      <span className="text-xs font-semibold text-chart-1">{tier.volume}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Capital KPIs */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Capital Dominance KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {capitalKPIs.map((kpi) => (
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

        {/* ── Ops Monitor ─────────────────────────────────────────────────── */}
        <TabsContent value="ops" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Global Hyper-Scale Operational Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {opsChecklist.map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border ${item.done ? 'bg-chart-1/5 border-chart-1/20' : 'bg-muted/20 border-border/30'}`}>
                    <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${item.done ? 'text-chart-1' : 'text-muted-foreground/40'}`} />
                    <span className={`text-xs ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{opsChecklist.filter(c => c.done).length}/{opsChecklist.length}</strong> operational systems active — {Math.round(opsChecklist.filter(c => c.done).length / opsChecklist.length * 100)}% readiness
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Risk Matrix ─────────────────────────────────────────────────── */}
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
                    <Badge className={`text-[10px] border ${severityColor(r.severity)}`}>{r.severity}</Badge>
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
      </Tabs>
    </div>
  );
};

export default TenMillionGlobalBlueprint;
