import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, Eye, DollarSign, Radar, Shield, BarChart3, Users, MapPin, ArrowUpRight } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: War-Room Dashboard ── */
const warRoomModules = [
  { module: 'Global Revenue Command Panel', icon: DollarSign, metrics: [
    { name: 'Daily Revenue Progress', description: 'Real-time revenue vs $35K daily micro-target across all active countries', status: 'Live' },
    { name: 'Monthly Revenue Trajectory', description: 'Cumulative monthly revenue with projection curve and gap-to-target alert', status: 'Live' },
    { name: 'Top 5 Revenue Cities', description: 'Ranked by contribution with week-over-week growth indicators', status: 'Live' },
    { name: 'Premium Upgrade Pipeline', description: 'Vendors approaching upsell thresholds with conversion probability scoring', status: 'Signal' },
    { name: 'Subscription MRR Tracker', description: 'Recurring revenue stability with churn risk flags per tier', status: 'Live' },
  ]},
  { module: 'Liquidity & Deal Velocity Monitor', icon: Zap, metrics: [
    { name: 'Serious Inquiries per Market', description: 'High-intent buyer leads segmented by country and district with 24h trend', status: 'Live' },
    { name: 'Viewing Pipeline Density', description: 'Scheduled viewings by city cluster — identifies coordination bottlenecks', status: 'Live' },
    { name: 'Offer-Stage Deal Alerts', description: 'Active negotiations with stall detection (>48h no movement triggers escalation)', status: 'Alert' },
    { name: 'Deal Closure Velocity', description: 'Average days from inquiry to closed deal per market — trend comparison', status: 'Live' },
    { name: 'Cross-Border Routing Activity', description: 'Buyers redirected between markets with conversion tracking', status: 'Signal' },
  ]},
  { module: 'Strategic Risk & Opportunity Radar', icon: Radar, metrics: [
    { name: 'Demand Spike Detection', description: 'Districts with >50% inquiry growth in 7 days — immediate campaign activation signal', status: 'Alert' },
    { name: 'Supply Shortage Warnings', description: 'High-demand zones with <20 active listings — triggers vendor outreach', status: 'Alert' },
    { name: 'Performance Decline Trends', description: 'Markets showing 2+ consecutive weeks of inquiry or revenue decline', status: 'Alert' },
    { name: 'Expansion Readiness Signals', description: 'New cities crossing vendor interest or organic inquiry thresholds', status: 'Signal' },
    { name: 'Agent Response Degradation', description: 'Markets where average agent response time exceeds 4h SLA', status: 'Alert' },
  ]},
];

const warRoomKPIs = [
  { kpi: 'Founder Decision Response Speed', target: '<15 min for P0 alerts', description: 'Time from alert to strategic action initiation' },
  { kpi: 'Revenue Predictability Score', target: '>85% accuracy', description: 'Monthly revenue forecast vs actual within 15% margin' },
  { kpi: 'Expansion Execution Alignment', target: '>90%', description: 'Strategic initiatives on-track vs planned milestones' },
  { kpi: 'Deal Pipeline Health Index', target: '>70/100', description: 'Composite of velocity, conversion, and stall metrics' },
  { kpi: 'Global Liquidity Balance', target: 'No market >30% imbalanced', description: 'Supply-demand ratio across all active cities' },
];

/* ── Section 2: Cross-Border Deal Engine ── */
const dealEnginePhases = [
  { phase: 'Opportunity Pipeline Creation', icon: Target, tasks: [
    'Curate top 50 investment-grade listings per market with standardized deal summaries',
    'Segment opportunities: yield-focused (>8% net), growth-focused (>15% appreciation), and balanced',
    'Create institutional-grade property intelligence sheets: location analysis, comparable data, risk profile',
    'Maintain rolling pipeline of 200+ cross-border-ready investment opportunities',
    'Tag properties with cross-border appeal factors: title clarity, foreign ownership rules, currency considerations',
  ]},
  { phase: 'Capital Engagement Workflow', icon: Users, tasks: [
    'Build segmented outreach lists: family offices (50+), PE funds (30+), REIT teams (20+), HNW syndicates (100+)',
    'Design 3-tier engagement sequence: Market Intelligence Brief → Curated Shortlist → Exclusive Preview Access',
    'Publish quarterly "Global Property Capital Flow" report establishing thought leadership',
    'Host virtual investment roundtables for institutional prospects — target 30+ attendees per session',
    'Implement exclusive early-access window (48h) for registered institutional investors on premium listings',
  ]},
  { phase: 'Transaction Facilitation', icon: ArrowUpRight, tasks: [
    'Cluster 5-10 investment opportunities per "portfolio package" for bulk acquisition prospects',
    'Provide real-time negotiation analytics: comparable transaction data, pricing momentum, demand signals',
    'Coordinate multi-timezone deal communication with structured SLA (24h response commitment)',
    'Offer post-transaction performance analytics reinforcing platform value for repeat investments',
    'Track institutional investor lifecycle: first inquiry → first deal → repeat participation → referral',
  ]},
];

const dealEngineKPIs = [
  { kpi: 'Institutional Inquiry Frequency', target: '20+/month', benchmark: 'Qualified institutional leads entering pipeline' },
  { kpi: 'Capital Volume Influenced', target: '$50M+/quarter', benchmark: 'Total deal value facilitated through platform' },
  { kpi: 'Repeat Investor Rate', target: '>40%', benchmark: 'Institutional investors making 2+ transactions' },
  { kpi: 'Pipeline-to-Close Ratio', target: '>12%', benchmark: 'Investment opportunities converting to completed deals' },
  { kpi: 'Cross-Border Deal Share', target: '>25% of total', benchmark: 'Percentage of deals involving international capital' },
];

/* ── Section 3: Expansion Radar ── */
const radarLayers = [
  { layer: 'Market Signal Detection', description: 'Passive intelligence gathering from organic platform activity', signals: [
    { signal: 'Rising Inquiry Trends', logic: 'Detect cities with >30% inquiry growth over 30 days from non-local IP addresses', threshold: '30% growth' },
    { signal: 'Vendor Onboarding Requests', logic: 'Track agent/agency registration attempts from uncovered cities', threshold: '5+ requests/month' },
    { signal: 'Pricing Momentum Indicators', logic: 'Monitor comparable property price appreciation in adjacent markets', threshold: '>10% YoY' },
    { signal: 'Search Volume Spikes', logic: 'Platform search queries mentioning new city names or districts', threshold: '>50 unique searches/week' },
    { signal: 'Referral Origin Patterns', logic: 'Track referral traffic originating from new geographic clusters', threshold: '>20 referrals/month' },
  ]},
  { layer: 'Expansion Prioritization', description: 'Algorithmic scoring and sequencing of expansion candidates', signals: [
    { signal: 'Liquidity Readiness Score', logic: 'Composite of transaction velocity, agent density, and developer activity in target market', threshold: '>65/100' },
    { signal: 'Time-to-Revenue Estimate', logic: 'Predicted days to first $5K revenue based on comparable market launch data', threshold: '<60 days' },
    { signal: 'Competitive Landscape Gap', logic: 'Digital marketplace penetration vs traditional agency dominance ratio', threshold: '<30% digital' },
    { signal: 'Regulatory Accessibility', logic: 'Foreign investment rules, property registration digitization, data availability', threshold: 'Green/Yellow/Red' },
    { signal: 'Entry Cost Model', logic: 'Estimated 90-day burn to achieve supply density threshold (200+ listings)', threshold: '<$25K' },
  ]},
  { layer: 'Founder Override & Timing', description: 'Human judgment layer for final expansion decisions', signals: [
    { signal: 'Manual Approval Gate', logic: 'All expansion recommendations require explicit founder go/no-go decision', threshold: 'Required' },
    { signal: 'Delay Mechanism', logic: 'Ability to bookmark opportunities for future re-evaluation with reminder triggers', threshold: '30/60/90 day' },
    { signal: 'Scenario Simulation', logic: 'Model best/base/worst outcomes for each expansion candidate', threshold: '3 scenarios' },
    { signal: 'Resource Allocation Check', logic: 'Verify team bandwidth and capital availability before committing', threshold: 'Capacity >60%' },
    { signal: 'Cannibalization Risk', logic: 'Assess whether new market expansion dilutes focus on existing high-value markets', threshold: '<15% impact' },
  ]},
];

const radarKPIs = [
  { kpi: 'Expansion Success Rate', target: '>70%', description: 'Markets reaching revenue validation within 90 days of launch' },
  { kpi: 'Time to First Deal', target: '<30 days', description: 'Calendar days from market entry to first closed transaction' },
  { kpi: 'Expansion Campaign ROI', target: '>3x within 6 months', description: 'Revenue generated vs total market entry investment' },
  { kpi: 'Signal-to-Launch Accuracy', target: '>60%', description: 'Radar-detected opportunities that convert to successful launches' },
  { kpi: 'Market Retention Rate', target: '>85%', description: 'Launched markets still generating revenue after 12 months' },
];

/* ── Monitoring Checklist ── */
const checklist = [
  { category: 'Revenue & Liquidity', items: ['Daily revenue vs micro-target tracked', 'Top 5 cities contribution reviewed', 'Stalled negotiations escalated (>48h)', 'Premium conversion pipeline assessed', 'Cross-border routing activity checked'] },
  { category: 'Institutional Pipeline', items: ['New institutional inquiries logged', 'Deal summary sheets updated for top listings', 'Quarterly intelligence report progress on track', 'Investor engagement sequence compliance verified', 'Repeat investor participation trend reviewed'] },
  { category: 'Expansion Radar', items: ['New market signals reviewed and scored', 'Top 3 expansion candidates prioritized', 'Resource availability confirmed for active sprints', 'Active expansion sprint milestones on track', 'Cannibalization risk assessment current'] },
  { category: 'Strategic Health', items: ['Founder decision backlog <3 items', 'Team execution alignment >90%', 'No market with >30% supply-demand imbalance', 'Agent response SLA compliance >85%', 'Monthly growth narrative updated'] },
];

/* ── Risk Indicators ── */
const riskIndicators = [
  { risk: 'Over-expansion: launching 3+ new markets simultaneously without validation gates', mitigation: 'Enforce sequential expansion with 30-day validation gate per market; max 2 concurrent sprints' },
  { risk: 'Capital pipeline imbalance: institutional outreach volume exceeding quality opportunity supply', mitigation: 'Maintain 10:1 opportunity-to-investor ratio; pause outreach if pipeline drops below threshold' },
  { risk: 'War-room alert fatigue: >20 alerts/day causing founder to ignore critical signals', mitigation: 'Implement P0/P1/P2 severity tiers; auto-suppress P2 alerts; limit P0 to max 3/day' },
  { risk: 'Cross-border deal friction: regulatory or currency barriers slowing institutional transaction closure', mitigation: 'Pre-map regulatory requirements per market; partner with local legal/financial advisors in top 5 markets' },
  { risk: 'Expansion radar false positives: organic signals from non-viable markets consuming evaluation resources', mitigation: 'Require minimum 3 concurrent signal types before triggering evaluation; add negative signal filters' },
];

export default function GlobalFounderWarRoomDealExpansionBlueprint() {
  const [activeTab, setActiveTab] = useState('warroom');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">Global Founder War-Room + Cross-Border Deal Engine + Expansion Radar</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Real-time command visibility, institutional deal flow & autonomous market expansion intelligence</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🌐 Global Command</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="warroom">🎯 War-Room</TabsTrigger>
          <TabsTrigger value="dealengine">💰 Deal Engine</TabsTrigger>
          <TabsTrigger value="radar">📡 Expansion Radar</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Indicators</TabsTrigger>
        </TabsList>

        {/* ── War-Room ── */}
        <TabsContent value="warroom" className="space-y-4 mt-4">
          {warRoomModules.map((m, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><m.icon className="h-4 w-4 text-primary" /> {m.module}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {m.metrics.map((mt, j) => (
                    <div key={j} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">{mt.name}</span>
                        <p className="text-xs text-muted-foreground">{mt.description}</p>
                      </div>
                      <Badge variant={mt.status === 'Alert' ? 'destructive' : mt.status === 'Signal' ? 'secondary' : 'outline'} className="text-[10px] shrink-0">{mt.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> War-Room KPIs</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead>
                    <tbody>{warRoomKPIs.map((k, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2 font-medium">{k.kpi}</td>
                        <td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td>
                        <td className="p-2 text-xs text-muted-foreground">{k.description}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Deal Engine ── */}
        <TabsContent value="dealengine" className="space-y-4 mt-4">
          {dealEnginePhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.phase}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {p.tasks.map((t, j) => <div key={j} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />{t}</div>)}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Deal Engine KPIs</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Benchmark</th></tr></thead>
                    <tbody>{dealEngineKPIs.map((k, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2 font-medium">{k.kpi}</td>
                        <td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td>
                        <td className="p-2 text-xs text-muted-foreground">{k.benchmark}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Expansion Radar ── */}
        <TabsContent value="radar" className="space-y-4 mt-4">
          {radarLayers.map((l, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2"><Radar className="h-4 w-4 text-primary" /> {l.layer}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{l.description}</p>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {l.signals.map((s, j) => (
                    <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{s.signal}</span>
                        <Badge variant="outline" className="text-[10px]">{s.threshold}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.logic}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Radar KPIs</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead>
                    <tbody>{radarKPIs.map((k, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2 font-medium">{k.kpi}</td>
                        <td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td>
                        <td className="p-2 text-xs text-muted-foreground">{k.description}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Checklists ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {checklist.map((c, i) => (
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
          {riskIndicators.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.risk}</span></div>
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
