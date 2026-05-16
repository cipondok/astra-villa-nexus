import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, Eye, Layers, Shield, BarChart3, Landmark, Crown, Cpu, Network } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: Global Leadership ── */
const expansionPhases = [
  { phase: 'Phase 1 — Southeast Asia Dominance', timeline: 'Year 1-2', markets: 'Indonesia (8 cities), Malaysia, Thailand, Vietnam, Philippines', targets: ['2,000+ listings per major market', '$3M+ ARR from SEA region', 'Top 2 brand recall in each market'], status: 'Active' },
  { phase: 'Phase 2 — Middle East & South Asia', timeline: 'Year 2-3', markets: 'UAE, Saudi Arabia, India (top 5 metros), Qatar', targets: ['Institutional-grade deal flow in each market', '$5M+ ARR from MENA+SA region', 'Developer mega-project partnerships in each country'], status: 'Planning' },
  { phase: 'Phase 3 — Europe & Americas', timeline: 'Year 3-5', markets: 'UK, Germany, Spain, Portugal, US (top 10 metros), Mexico', targets: ['Cross-border investment corridor dominance', '$10M+ ARR from Western markets', 'Global liquidity index recognized by institutional investors'], status: 'Vision' },
];

const authorityLevers = [
  { lever: 'Global Property Liquidity Index', desc: 'Quarterly publication tracking transaction velocity, pricing momentum & capital flow across 30+ cities worldwide', impact: 95 },
  { lever: 'International Innovation Forums', desc: 'Annual flagship conference + quarterly virtual roundtables with institutional investors & developers', impact: 88 },
  { lever: 'Multinational Brokerage Network', desc: 'Preferred platform agreements with top 50 global brokerage firms for cross-border deal flow', impact: 92 },
  { lever: 'Executive Thought Leadership', desc: 'CEO/founder positioned as keynote speaker at MIPIM, PropTech Connect, and regional investment summits', impact: 82 },
  { lever: 'Cross-Border Discovery Engine', desc: 'Seamless multi-currency, multi-language investment discovery routing across all active markets', impact: 90 },
];

const competitiveBarriers = [
  { barrier: 'Behavioral Data Moat', desc: '10M+ buyer interaction signals creating unmatched predictive intelligence', strength: 95 },
  { barrier: 'Network-Effect Liquidity', desc: 'Every new listing/buyer increases platform value for all participants exponentially', strength: 90 },
  { barrier: 'Ecosystem Integration Depth', desc: 'Financing, legal, PM services create multi-touchpoint switching costs', strength: 85 },
  { barrier: 'Institutional Trust Infrastructure', desc: 'Audited data, standardized reporting, and regulatory compliance across jurisdictions', strength: 80 },
];

/* ── Section 2: Valuation Narrative ── */
const narrativePillars = [
  { pillar: 'Infrastructure-Level Positioning', tagline: 'The Bloomberg Terminal for Global Real Estate', points: [
    'Platform processes $500M+ in annual transaction discovery volume',
    'Intelligence layer reduces capital allocation friction by 40%',
    'Cross-border routing enables institutional investors to access 30+ markets from single terminal',
    'Data-driven monetization scales with transaction volume — zero marginal cost intelligence',
  ]},
  { pillar: 'Financial Growth Architecture', tagline: 'Compounding Revenue with Expanding Margins', points: [
    'Revenue CAGR >100% over trailing 3 years with improving unit economics',
    'MRR contribution exceeding 45% — subscription + data products create predictable base',
    'Gross margin trajectory: 65% → 75%+ as automation reduces service delivery costs',
    'Net Revenue Retention >130% — existing customers expand usage across markets and products',
  ]},
  { pillar: 'Governance & Credibility', tagline: 'Institutional-Grade Transparency', points: [
    'Big 4 audited financials with SOC 2 compliance',
    'Board includes 3+ independent directors with public company experience',
    'Quarterly investor reporting with <10 day turnaround',
    'Dual-class structure with 15-year sunset maintaining founder alignment',
  ]},
];

const valuationMultiples = [
  { metric: 'Revenue Multiple', current: '15-20x ARR', target: '25-35x ARR', driver: 'Demonstrate NRR >130% + predictable international expansion' },
  { metric: 'Rule of 40', current: '45+', target: '55+', driver: 'Revenue growth rate + EBITDA margin exceeding 55 combined' },
  { metric: 'LTV:CAC', current: '5:1', target: '8:1+', driver: 'Reduce CAC through network effects; increase LTV via ecosystem products' },
  { metric: 'GRR (Gross Revenue Retention)', current: '>85%', target: '>90%', driver: 'Platform stickiness through data dependency and workflow integration' },
];

/* ── Section 3: Autonomous Grid ── */
const intelligenceLayers = [
  { layer: 'Global Demand Signal Aggregation', components: [
    { name: 'Cross-Market Buyer Intent Scoring', desc: 'Real-time behavioral signals from 30+ markets unified into global demand heatmap' },
    { name: 'Institutional Capital Flow Tracking', desc: 'Monitor fund allocation patterns and deployment velocity across regions' },
    { name: 'Search & Discovery Pattern Analysis', desc: 'NLP-driven analysis of search queries to predict emerging demand categories' },
  ]},
  { layer: 'Supply Density Optimization', components: [
    { name: 'Automated Supply Gap Detection', desc: 'Identify districts with high demand but low listing density — trigger vendor alerts' },
    { name: 'Inventory Quality Scoring', desc: 'Continuous assessment of listing completeness, pricing competitiveness, and freshness' },
    { name: 'Developer Pipeline Forecasting', desc: 'Predict upcoming project launches and pre-position demand activation campaigns' },
  ]},
  { layer: 'Predictive Transaction Engine', components: [
    { name: 'Deal Probability Scoring', desc: 'ML model predicting closure probability based on 50+ signals per transaction' },
    { name: 'Dynamic Pricing Intelligence', desc: 'Real-time fair market value estimation with confidence intervals for every listing' },
    { name: 'Negotiation Outcome Prediction', desc: 'Forecast likely settlement price and optimal offer strategy for buyers' },
  ]},
];

const autonomousSystems = [
  { system: 'Campaign Activation Engine', desc: 'Auto-trigger urgency promotions when liquidity signals cross thresholds in specific districts', metric: 'Revenue uplift per auto-campaign: >$5K avg' },
  { system: 'Adaptive Lead Routing', desc: 'ML-optimized buyer-to-listing matching across all global markets with real-time rebalancing', metric: 'Viewing conversion rate improvement: >25%' },
  { system: 'Monetization Recommendation Loop', desc: 'Suggest optimal premium tier, pricing, and promotion timing to each vendor automatically', metric: 'Premium upgrade rate increase: >40%' },
  { system: 'Cross-Border Opportunity Matching', desc: 'Route international investors to highest-probability deals based on portfolio DNA analysis', metric: 'Cross-border deal conversion: >8%' },
];

const governanceFramework = [
  { control: 'Executive Command Dashboard', desc: 'Real-time visibility into all autonomous decisions with one-click override capability' },
  { control: 'AI Decision Audit Trail', desc: 'Complete logging of every automated action with reasoning transparency and outcome tracking' },
  { control: 'Confidence Threshold Gates', desc: 'Autonomous actions only execute above 90% confidence; below routes to human review' },
  { control: 'Ethical Deployment Charter', desc: 'Published principles governing AI use: no manipulation, transparent scoring, fair opportunity distribution' },
];

/* ── Multi-Year Monitoring ── */
const monitoringChecklist = [
  { category: 'Global Market Position', items: ['Active presence in 15+ international markets', 'Global listings exceeding 50,000 active properties', 'Cross-border inquiry routing active across 10+ corridors', 'Brand authority: top 3 recognition in PropTech category globally', 'Multinational brokerage partnerships: 50+ firms'] },
  { category: 'Public Market Readiness', items: ['Revenue CAGR >80% over trailing 3 years', 'Rule of 40 score consistently >50', 'MRR contribution >45% of total revenue', 'Big 4 audit completed for 2+ consecutive years', 'Investor relations infrastructure fully operational'] },
  { category: 'Intelligence Infrastructure', items: ['Autonomous systems contributing >30% of total revenue', 'Deal probability model accuracy >75%', 'Campaign auto-activation generating >$50K/month', 'Cross-border matching conversion >8%', 'AI decision audit trail 100% complete'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'International expansion burns cash faster than revenue scales', signal: 'New market CAC >5x domestic; time-to-revenue >12 months', fix: 'Gate expansion with strict unit economics benchmarks; require $50K MRR within 9 months per market' },
  { risk: 'Valuation narrative disconnects from operational reality', signal: 'Investor skepticism in due diligence; multiple compression', fix: 'Anchor narrative in audited metrics; publish transparent quarterly performance reports' },
  { risk: 'Autonomous systems create unintended market distortions', signal: 'Pricing recommendations cluster artificially; vendor complaints about fairness', fix: 'Enforce confidence thresholds + mandatory human review for high-impact decisions' },
  { risk: 'Regulatory fragmentation across jurisdictions', signal: 'Compliance costs escalating; market entry delays', fix: 'Hire regional compliance leads; establish jurisdictional holding structure (Singapore/Luxembourg)' },
  { risk: 'Key market concentration despite global presence', signal: 'Indonesia >60% of revenue after 3+ years of international expansion', fix: 'Set explicit revenue diversification targets: no single country >40% by Year 4' },
];

export default function GlobalLeadershipValuationLiquidityGridBlueprint() {
  const [activeTab, setActiveTab] = useState('leadership');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">Global Market Leadership + Public Valuation + Autonomous Liquidity Grid</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Global dominance positioning, institutional valuation narrative & self-optimizing intelligence infrastructure</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🌍 Global</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="leadership">🌍 Global Leadership</TabsTrigger>
          <TabsTrigger value="valuation">📈 Valuation</TabsTrigger>
          <TabsTrigger value="grid">🤖 Autonomous Grid</TabsTrigger>
          <TabsTrigger value="monitor">📋 Multi-Year</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── Global Leadership ── */}
        <TabsContent value="leadership" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Global Expansion Phases</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {expansionPhases.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div><span className="font-semibold text-sm">{p.phase}</span><p className="text-xs text-muted-foreground">{p.markets}</p></div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{p.timeline}</Badge>
                        <Badge variant={p.status === 'Active' ? 'default' : p.status === 'Planning' ? 'secondary' : 'outline'} className="text-[10px]">{p.status}</Badge>
                      </div>
                    </div>
                    <div className="grid gap-1">{p.targets.map((t, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{t}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Authority & Thought Leadership Levers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {authorityLevers.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">{d.lever}</span><Badge variant="outline" className="text-xs">Impact: {d.impact}%</Badge></div>
                    <p className="text-xs text-muted-foreground">{d.desc}</p>
                    <Progress value={d.impact} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Competitive Barrier Reinforcement</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {competitiveBarriers.map((b, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">{b.barrier}</span><Badge variant="outline" className="text-xs">Strength: {b.strength}%</Badge></div>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                    <Progress value={b.strength} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Valuation Narrative ── */}
        <TabsContent value="valuation" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Crown className="h-4 w-4 text-primary" /> Valuation Narrative Pillars</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {narrativePillars.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div><span className="font-semibold text-sm">{p.pillar}</span><p className="text-xs text-primary italic">{p.tagline}</p></div>
                    <div className="grid gap-1">{p.points.map((pt, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{pt}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Valuation Multiple Targets</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left p-2">Metric</th><th className="text-left p-2">Current</th><th className="text-left p-2">Target</th><th className="text-left p-2">Driver</th>
                    </tr></thead>
                    <tbody>
                      {valuationMultiples.map((v, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="p-2 font-medium">{v.metric}</td>
                          <td className="p-2"><Badge variant="outline" className="text-xs">{v.current}</Badge></td>
                          <td className="p-2"><Badge variant="default" className="text-xs">{v.target}</Badge></td>
                          <td className="p-2 text-xs text-muted-foreground">{v.driver}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Autonomous Grid ── */}
        <TabsContent value="grid" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Core Intelligence Layers</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {intelligenceLayers.map((l, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-3">
                    <span className="font-semibold text-sm">{l.layer}</span>
                    <div className="grid gap-2 md:grid-cols-3">
                      {l.components.map((c, j) => (
                        <div key={j} className="p-2 rounded border bg-background/50 space-y-0.5">
                          <span className="text-xs font-medium">{c.name}</span>
                          <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /> Autonomous Orchestration Systems</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {autonomousSystems.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <span className="text-sm font-semibold">{s.system}</span>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                    <p className="text-xs text-primary">{s.metric}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Human Oversight & Governance</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {governanceFramework.map((g, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div><span className="text-sm font-medium">{g.control}</span><p className="text-xs text-muted-foreground">{g.desc}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Multi-Year Monitoring ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {monitoringChecklist.map((c, i) => (
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
