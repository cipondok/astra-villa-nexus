import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, AlertTriangle, TrendingUp, Target, Eye, Layers, Shield, BarChart3, Landmark, Crown, Cpu, Handshake, Building, Brain } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: IPO Roadmap ── */
const ipoPhases = [
  { phase: 'Phase 1 — Pre-IPO Foundation', timeline: 'T-24 to T-18 months', items: [
    { task: 'Appoint Big 4 auditor and complete 2 years of audited financials', status: 'Critical' },
    { task: 'Recruit 2-3 independent board directors with public company experience', status: 'Critical' },
    { task: 'Implement SOC 2 Type II compliance and data governance framework', status: 'High' },
    { task: 'Establish IR function with dedicated investor relations officer', status: 'High' },
    { task: 'Finalize dual-class share structure (Class B: 10x voting, 15-year sunset)', status: 'Critical' },
  ]},
  { phase: 'Phase 2 — Market Positioning', timeline: 'T-18 to T-12 months', items: [
    { task: 'Articulate "Global Liquidity Infrastructure" positioning narrative', status: 'Critical' },
    { task: 'Publish 4+ quarters of consistent revenue growth (>80% YoY)', status: 'Critical' },
    { task: 'Demonstrate Rule of 40 score >50 for 3+ consecutive quarters', status: 'High' },
    { task: 'Secure 3-5 marquee institutional case studies for roadshow', status: 'High' },
    { task: 'Complete confidential SEC/SGX filing preparation', status: 'Medium' },
  ]},
  { phase: 'Phase 3 — Investor Education', timeline: 'T-12 to T-6 months', items: [
    { task: 'Non-deal roadshow: 50+ institutional investor meetings across 4 continents', status: 'Critical' },
    { task: 'Publish S-1/Prospectus with compelling growth narrative and risk disclosures', status: 'Critical' },
    { task: 'Engage 3 tier-1 investment banks as underwriters (lead + co-leads)', status: 'Critical' },
    { task: 'Analyst day: deep-dive presentation on TAM, unit economics, and moats', status: 'High' },
    { task: 'Media coordination: timed PR for maximum market awareness', status: 'Medium' },
  ]},
  { phase: 'Phase 4 — Execution & Listing', timeline: 'T-6 to T-0', items: [
    { task: 'Price discovery: institutional book-building across global investor base', status: 'Critical' },
    { task: 'Target 18% float with <8% tradable in first 90 days for price stability', status: 'Critical' },
    { task: 'Staggered lockups: Founders 18-24mo, VCs 6-12mo, Management 12mo', status: 'High' },
    { task: 'Day-1 trading support: designated market makers + stabilization protocol', status: 'High' },
    { task: 'Post-IPO: first quarterly earnings call within 45 days', status: 'Critical' },
  ]},
];

const listingOptions = [
  { exchange: 'NYSE / NASDAQ', pros: 'Deepest liquidity, highest valuation multiples, global visibility', cons: 'Highest compliance cost, SOX requirements', fit: 'Best for >$5B valuation target' },
  { exchange: 'SGX (Singapore)', pros: 'Asia-Pacific gateway, favorable PropTech perception, lower compliance', cons: 'Lower liquidity depth, smaller investor base', fit: 'Best for $1-5B with Asia focus' },
  { exchange: 'LSE (London)', pros: 'Strong institutional base, good for cross-border platforms', cons: 'Post-Brexit complexity, moderate liquidity', fit: 'Best for EMEA-focused expansion' },
  { exchange: 'Dual Listing', pros: 'Maximum investor access, currency diversification', cons: 'Double compliance cost, operational complexity', fit: 'Best at >$10B valuation scale' },
];

/* ── Section 2: Alliances ── */
const allianceDomains = [
  { domain: 'Multinational Brokerage Networks', targets: 'CBRE, JLL, Cushman & Wakefield, Savills, Knight Frank', value: [
    'Cross-border deal flow routing through platform intelligence',
    'Co-branded market intelligence publications',
    'Exclusive listing syndication for institutional-grade properties',
  ], revenue: '$2-5M ARR potential', priority: 'P0' },
  { domain: 'Global Developer Partnerships', targets: 'Top 20 multinational developers per expansion region', value: [
    'Pre-launch demand forecasting and buyer pipeline generation',
    'Digital showcase campaigns with guaranteed lead volumes',
    'Data-driven pricing optimization for project launches',
  ], revenue: '$3-8M ARR potential', priority: 'P0' },
  { domain: 'Financial Institutions & Mortgage', targets: 'HSBC, Standard Chartered, DBS, regional mortgage banks', value: [
    'Integrated mortgage pre-qualification in transaction flow',
    'Lead referral commissions at scale across markets',
    'Co-developed property investment financial products',
  ], revenue: '$1-3M ARR potential', priority: 'P1' },
  { domain: 'Data & Analytics Partners', targets: 'CoreLogic, MSCI Real Estate, PropTech data providers', value: [
    'Data enrichment partnerships improving prediction accuracy',
    'Co-branded institutional analytics products',
    'API integration creating ecosystem lock-in',
  ], revenue: '$1-2M ARR potential', priority: 'P1' },
];

const allianceGovernance = [
  { mechanism: 'Standardized Partnership Framework', desc: '90-day onboarding with tiered engagement (Pilot → Strategic → Enterprise)', metric: 'Onboarding completion rate >80%' },
  { mechanism: 'Joint Performance Dashboards', desc: 'Shared KPIs tracking deal flow, revenue contribution, and satisfaction', metric: 'Quarterly review cadence 100%' },
  { mechanism: 'Revenue-Sharing Models', desc: 'Transparent commission splits for co-generated deals and referrals', metric: 'Alliance revenue contribution >20% of total' },
  { mechanism: 'Strategic Advisory Council', desc: 'Quarterly alliance summit with top 10 partners for ecosystem strategy alignment', metric: 'Partner NPS >70' },
];

/* ── Section 3: Self-Evolving Intelligence ── */
const intelligenceSystems = [
  { system: 'Global Demand Trend Engine', layers: [
    { name: 'Cross-Market Behavioral Aggregation', desc: 'Unified buyer intent signals from 30+ markets into real-time demand heatmap with trend prediction' },
    { name: 'Capital Flow Modeling', desc: 'Track institutional fund deployment patterns to predict emerging market opportunities 6-12 months ahead' },
    { name: 'Macro-Economic Signal Integration', desc: 'Interest rate, GDP, urbanization, and demographic data feeds into market timing models' },
  ]},
  { system: 'Autonomous Monetization Engine', layers: [
    { name: 'Dynamic Pricing Optimizer', desc: 'ML-driven premium listing pricing that adapts hourly based on demand density and conversion data' },
    { name: 'Campaign Auto-Activation', desc: 'Trigger urgency promotions automatically when district liquidity crosses predefined thresholds' },
    { name: 'Vendor Upsell Recommender', desc: 'Personalized upgrade suggestions based on listing performance, competitor activity, and demand signals' },
  ]},
  { system: 'Self-Learning Prediction Core', layers: [
    { name: 'Model Drift Detection', desc: 'Continuous monitoring of prediction accuracy; automatic retraining when MAE exceeds threshold' },
    { name: 'Shadow Model Testing', desc: 'New models run in parallel with production — promoted only when outperforming for 30+ days' },
    { name: 'Reinforcement Learning Loop', desc: 'Transaction outcomes feed back into scoring weights every 6 hours via learning-engine worker' },
  ]},
];

const ethicsFramework = [
  { principle: 'Transparency', desc: 'Every AI-driven recommendation includes explainable reasoning accessible to users and auditors' },
  { principle: 'Fairness', desc: 'Opportunity distribution algorithms prevent systematic bias toward specific vendors or regions' },
  { principle: 'Accountability', desc: 'Complete audit trail for all autonomous decisions with human-override capability at every level' },
  { principle: 'Privacy', desc: 'Behavioral data anonymized and aggregated; individual tracking requires explicit user consent' },
];

/* ── Multi-Year Monitoring ── */
const monitoring = [
  { category: 'IPO Readiness', items: ['Big 4 audit completed for 3+ years', 'Board composition: 3+ independent directors seated', 'SOC 2 Type II certification active', 'Rule of 40 score >50 for 4+ quarters', 'IR function operational with quarterly investor reporting'] },
  { category: 'Alliance Ecosystem', items: ['50+ active global partnerships', 'Alliance revenue contribution >20% of total', 'Cross-border deal routing active in 10+ corridors', 'Partner NPS >70 across strategic alliances', 'Joint intelligence publications: 4+ per year'] },
  { category: 'Intelligence Platform', items: ['Prediction accuracy >75% across core models', 'Autonomous monetization contributing >30% of revenue', 'Model retraining cycle <24 hours on drift detection', 'Shadow model pipeline: 3+ candidates in testing', 'Ethics audit completed annually with published results'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'IPO window closes due to market conditions', signal: 'Tech/PropTech IPO multiples compress >30%; investor sentiment shifts', fix: 'Maintain IPO readiness while building private secondary liquidity option; extend runway to wait for favorable window' },
  { risk: 'Alliance partnerships remain revenue-neutral', signal: 'High partnership count but <10% revenue contribution after 18 months', fix: 'Shift from brand partnerships to revenue-committed JVs; implement 90-day performance gates' },
  { risk: 'Self-learning models create feedback loops', signal: 'Prediction accuracy improves but recommendations become homogeneous', fix: 'Introduce exploration/exploitation balance; mandate diversity constraints in recommendation algorithms' },
  { risk: 'Regulatory divergence blocks cross-border intelligence', signal: 'Data residency laws prevent unified global demand aggregation', fix: 'Implement federated learning architecture; process data locally, aggregate insights centrally' },
  { risk: 'Post-IPO short-seller or activist pressure', signal: 'Negative research reports targeting growth sustainability', fix: 'Pre-build defense playbook: transparent metrics, strong IR communications, staggered lockup protection' },
];

export default function GlobalIPOAllianceIntelligenceBlueprint() {
  const [activeTab, setActiveTab] = useState('ipo');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Landmark className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">Global IPO Roadmap + Worldwide Alliance Command + Self-Evolving Intelligence</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">IPO execution pathway, global ecosystem partnerships & adaptive economic intelligence platform</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🏛️ IPO</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="ipo">🏛️ IPO Roadmap</TabsTrigger>
          <TabsTrigger value="alliances">🤝 Alliances</TabsTrigger>
          <TabsTrigger value="intelligence">🧠 Intelligence</TabsTrigger>
          <TabsTrigger value="monitor">📋 Multi-Year</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── IPO Roadmap ── */}
        <TabsContent value="ipo" className="space-y-4 mt-4">
          {ipoPhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.phase}</CardTitle>
                    <Badge variant="outline" className="text-xs">{p.timeline}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {p.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                      <div className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />{item.task}</div>
                      <Badge variant={item.status === 'Critical' ? 'destructive' : item.status === 'High' ? 'default' : 'secondary'} className="text-[10px] shrink-0">{item.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div {...anim(5)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4 text-primary" /> Listing Exchange Options</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left p-2">Exchange</th><th className="text-left p-2">Pros</th><th className="text-left p-2">Cons</th><th className="text-left p-2">Best Fit</th>
                    </tr></thead>
                    <tbody>
                      {listingOptions.map((o, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="p-2 font-medium">{o.exchange}</td>
                          <td className="p-2 text-xs text-muted-foreground">{o.pros}</td>
                          <td className="p-2 text-xs text-muted-foreground">{o.cons}</td>
                          <td className="p-2"><Badge variant="outline" className="text-[10px]">{o.fit}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Alliances ── */}
        <TabsContent value="alliances" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Handshake className="h-4 w-4 text-primary" /> Strategic Alliance Domains</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {allianceDomains.map((a, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div><span className="font-semibold text-sm">{a.domain}</span><p className="text-xs text-muted-foreground">{a.targets}</p></div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{a.revenue}</Badge>
                        <Badge variant={a.priority === 'P0' ? 'destructive' : 'secondary'} className="text-[10px]">{a.priority}</Badge>
                      </div>
                    </div>
                    <div className="grid gap-1">{a.value.map((v, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{v}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Alliance Governance</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {allianceGovernance.map((g, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <span className="text-sm font-semibold">{g.mechanism}</span>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                    <p className="text-xs text-primary">{g.metric}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Intelligence ── */}
        <TabsContent value="intelligence" className="space-y-4 mt-4">
          {intelligenceSystems.map((s, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> {s.system}</CardTitle></CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-3">
                  {s.layers.map((l, j) => (
                    <div key={j} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                      <span className="text-xs font-semibold">{l.name}</span>
                      <p className="text-[11px] text-muted-foreground">{l.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Ethical Intelligence Principles</CardTitle></CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                {ethicsFramework.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <span className="text-sm font-semibold">{e.principle}</span>
                    <p className="text-xs text-muted-foreground">{e.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Multi-Year Monitoring ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {monitoring.map((c, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent><div className="grid gap-2">{c.items.map((item, j) => <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>)}</div></CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Risks ── */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {risks.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.risk}</span></div>
                  <div className="text-xs text-muted-foreground"><strong>Signal:</strong> {r.signal}</div>
                  <div className="text-xs"><strong>Fix:</strong> {r.fix}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
