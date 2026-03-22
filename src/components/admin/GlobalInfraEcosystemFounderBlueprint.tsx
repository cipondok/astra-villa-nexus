import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Globe, Layers, Brain, Shield, TrendingUp, Network, Building, Wallet, Target, CheckCircle, AlertTriangle, Zap, Users, BarChart3 } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07 } });

/* ── Section 1: Global Economic Infrastructure ── */
const infraLayers = [
  { name: 'Transaction Discovery Infrastructure', desc: 'Cross-border property opportunity visibility backbone', maturity: 35, icon: Globe },
  { name: 'Demand-Supply Signal Distribution', desc: 'Transparent, real-time liquidity signal broadcasting across markets', maturity: 28, icon: Network },
  { name: 'Digital Property Standardization', desc: 'Unified data schemas for global property intelligence interoperability', maturity: 20, icon: Layers },
  { name: 'Capital Allocation Efficiency Engine', desc: 'AI-guided capital routing reducing search friction by 60%+', maturity: 25, icon: Wallet },
];

const infraPathways = [
  { phase: 'Phase 1 — Regional Backbone', horizon: '0-18 months', actions: ['Achieve dominant liquidity share in 3+ cities', 'Standardize property data schemas across markets', 'Launch institutional data feed pilot'], kpis: ['Cross-border discovery share >15%', 'Data standardization coverage >70%'] },
  { phase: 'Phase 2 — Continental Coordination', horizon: '18-36 months', actions: ['Enable multi-currency transaction intelligence', 'Integrate with 5+ national property registries', 'Publish open liquidity benchmarks adopted by 100+ institutions'], kpis: ['Institutional dependency index >40%', 'Transaction velocity improvement >3x'] },
  { phase: 'Phase 3 — Global Infrastructure Layer', horizon: '36-60 months', actions: ['Become default discovery layer for cross-border RE capital', 'Shape interoperability standards via industry consortia', 'Operate as neutral coordination infrastructure'], kpis: ['Global liquidity signal adoption >50%', 'Platform-routed capital >$10B annually'] },
];

const efficiencyNarrative = [
  { metric: 'Search Friction Reduction', current: '~45 days avg discovery', target: '<7 days via AI matching', icon: Target },
  { metric: 'Transaction Velocity', current: '90-180 day cycles', target: '30-60 day intelligent cycles', icon: Zap },
  { metric: 'Capital Allocation Accuracy', current: '~35% investor satisfaction', target: '>80% data-driven confidence', icon: BarChart3 },
];

/* ── Section 2: Ecosystem Expansion ── */
const ecosystemDomains = [
  { domain: 'Financing & Mortgage Discovery', priority: 'High', revenue: '$2-5M ARR potential', phase: 'Build', desc: 'Loan eligibility tools, broker matching, pre-approval acceleration' },
  { domain: 'Property Management Intelligence', priority: 'Medium', revenue: '$1-3M ARR potential', phase: 'Plan', desc: 'Rental optimization, maintenance prediction, tenant analytics' },
  { domain: 'Investment Portfolio Analytics', priority: 'High', revenue: '$3-8M ARR potential', phase: 'Build', desc: 'Multi-asset tracking, scenario simulation, exit timing intelligence' },
  { domain: 'Development Pipeline Visibility', priority: 'Medium', revenue: '$1-4M ARR potential', phase: 'Plan', desc: 'Pre-launch project intelligence, supply forecasting, developer dashboards' },
  { domain: 'Legal & Compliance Tools', priority: 'Low', revenue: '$500K-2M ARR potential', phase: 'Research', desc: 'Cross-border ownership rules, tax optimization, document automation' },
  { domain: 'Insurance & Risk Products', priority: 'Low', revenue: '$1-3M ARR potential', phase: 'Research', desc: 'Property insurance matching, climate risk scoring, warranty management' },
];

const networkEffects = [
  { lever: 'Cross-Service User Journeys', desc: 'Discovery → Financing → Management lifecycle lock-in', impact: 95 },
  { lever: 'Bundled Value Propositions', desc: 'Premium + Analytics + Financing packages increasing LTV 3-5x', impact: 88 },
  { lever: 'Vendor Ecosystem Lock-in', desc: 'Agents dependent on intelligence + leads + tools stack', impact: 82 },
  { lever: 'API & Data Integration Layer', desc: 'Third-party services built on platform data infrastructure', impact: 75 },
];

/* ── Section 3: Founder Strategic Command ── */
const decisionFramework = [
  { gate: 'Revenue Leverage', weight: 30, question: 'Does this move increase recurring revenue by >20% within 12 months?' },
  { gate: 'Liquidity Density', weight: 25, question: 'Does this strengthen supply-demand matching in core or expansion markets?' },
  { gate: 'Operational Feasibility', weight: 25, question: 'Can the team execute this without compromising current growth trajectory?' },
  { gate: 'Strategic Optionality', weight: 20, question: 'Does this create future pathways for ecosystem expansion or capital attraction?' },
];

const leadershipPillars = [
  { pillar: 'Clarity Under Pressure', practices: ['Morning strategic intention setting', 'Weekly "one decision that matters most" discipline', 'Monthly narrative consistency audit'], risk: 'Decision paralysis from information overload' },
  { pillar: 'Delegation Architecture', practices: ['Define "founder-only" vs "team-empowered" decision zones', 'Build executive trust through outcome accountability', 'Create async decision documentation culture'], risk: 'Bottleneck creation at founder level' },
  { pillar: 'Narrative Consistency', practices: ['Align investor, partner, and team messaging quarterly', 'Maintain single "north star" metric visibility', 'Publish internal strategic update memos'], risk: 'Conflicting signals eroding stakeholder confidence' },
];

const monitoringChecklist = [
  { category: 'Infrastructure Positioning', items: ['Cross-border discovery market share trending up', 'Institutional data feed adoption growing', 'Open benchmark publication on schedule', 'Industry consortium engagement active'] },
  { category: 'Ecosystem Health', items: ['Adjacent service revenue contribution >10%', 'Cross-service user engagement depth increasing', 'API partner ecosystem expanding', 'Bundled LTV exceeding standalone by 2x+'] },
  { category: 'Founder Effectiveness', items: ['Strategic initiative success rate >70%', 'Decision-to-execution cycle <14 days', 'Team alignment score >80%', 'Energy and focus sustainability maintained'] },
  { category: 'Risk Radar', items: ['No single market >40% revenue concentration', 'Ecosystem expansion not diluting core liquidity', 'Regulatory landscape monitored quarterly', 'Competitive moat indicators stable or growing'] },
];

const riskMatrix = [
  { risk: 'Infrastructure Overreach', severity: 'High', signal: 'Building coordination layers before achieving market density', mitigation: 'Gate infrastructure investment behind liquidity milestones' },
  { risk: 'Ecosystem Dilution', severity: 'High', signal: 'Adjacent services consuming resources without revenue traction', mitigation: 'Enforce 90-day revenue validation gates per new domain' },
  { risk: 'Founder Cognitive Overload', severity: 'Medium', signal: 'Decision quality declining, strategic drift emerging', mitigation: 'Implement "3 priorities only" quarterly discipline' },
  { risk: 'Regulatory Fragmentation', severity: 'Medium', signal: 'Cross-border operations hitting compliance complexity walls', mitigation: 'Invest in jurisdiction-specific legal automation early' },
  { risk: 'Competitive Category Erosion', severity: 'Medium', signal: 'Incumbents replicating intelligence positioning', mitigation: 'Accelerate proprietary data moat and switching cost depth' },
];

export default function GlobalInfraEcosystemFounderBlueprint() {
  const [activeTab, setActiveTab] = useState('infra');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">Global Economic Infrastructure + Ecosystem Expansion + Founder Strategic Command</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Civilization-scale positioning, ecosystem network effects, and disciplined leadership execution</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-primary/40">🌍 Global Infrastructure</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="infra">🌐 Infrastructure</TabsTrigger>
          <TabsTrigger value="ecosystem">🧬 Ecosystem</TabsTrigger>
          <TabsTrigger value="founder">🧠 Founder Command</TabsTrigger>
          <TabsTrigger value="monitor">📋 Monitoring</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Matrix</TabsTrigger>
        </TabsList>

        {/* ── Infrastructure Tab ── */}
        <TabsContent value="infra" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Infrastructure Layer Maturity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {infraLayers.map((l, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <l.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{l.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{l.maturity}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{l.desc}</p>
                    <Progress value={l.maturity} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Economic Efficiency Impact</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {efficiencyNarrative.map((e, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                      <div className="flex items-center gap-2"><e.icon className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">{e.metric}</span></div>
                      <div className="text-xs text-muted-foreground">Current: {e.current}</div>
                      <div className="text-xs font-medium text-primary">Target: {e.target}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Infrastructure Positioning Roadmap</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {infraPathways.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{p.phase}</span>
                      <Badge variant="secondary" className="text-xs">{p.horizon}</Badge>
                    </div>
                    <div className="grid gap-1">
                      {p.actions.map((a, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{a}</div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {p.kpis.map((k, j) => <Badge key={j} variant="outline" className="text-[10px]">{k}</Badge>)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Ecosystem Tab ── */}
        <TabsContent value="ecosystem" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4 text-primary" /> Adjacent Service Expansion Domains</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {ecosystemDomains.map((d, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{d.domain}</span>
                        <div className="flex gap-1">
                          <Badge variant={d.priority === 'High' ? 'default' : d.priority === 'Medium' ? 'secondary' : 'outline'} className="text-[10px]">{d.priority}</Badge>
                          <Badge variant="outline" className="text-[10px]">{d.phase}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{d.desc}</p>
                      <div className="text-xs font-medium text-primary">{d.revenue}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Network className="h-4 w-4 text-primary" /> Network Effect Scaling Levers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {networkEffects.map((n, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{n.lever}</span>
                      <Badge variant="outline" className="text-xs">Impact: {n.impact}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                    <Progress value={n.impact} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Founder Command Tab ── */}
        <TabsContent value="founder" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Strategic Decision Gate Framework</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {decisionFramework.map((g, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{g.gate}</span>
                        <Badge variant="secondary" className="text-xs">Weight: {g.weight}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground italic">"{g.question}"</p>
                      <Progress value={g.weight * 2.5} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Leadership Effectiveness Pillars</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {leadershipPillars.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <span className="font-semibold text-sm">{p.pillar}</span>
                    <div className="grid gap-1">
                      {p.practices.map((pr, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{pr}</div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-1"><AlertTriangle className="h-3 w-3 text-destructive" /><span className="text-[10px] text-destructive">Risk: {p.risk}</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Monitoring Tab ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {monitoringChecklist.map((c, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {c.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Risk Matrix Tab ── */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {riskMatrix.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className={r.severity === 'High' ? 'border-destructive/30' : ''}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${r.severity === 'High' ? 'text-destructive' : 'text-yellow-500'}`} />
                      <span className="font-semibold text-sm">{r.risk}</span>
                    </div>
                    <Badge variant={r.severity === 'High' ? 'destructive' : 'secondary'} className="text-xs">{r.severity}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground"><strong>Signal:</strong> {r.signal}</div>
                  <div className="text-xs"><strong>Mitigation:</strong> {r.mitigation}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
