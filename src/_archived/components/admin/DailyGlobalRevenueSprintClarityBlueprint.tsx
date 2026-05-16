import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, Eye, Sun, Clock, Moon, Rocket, Brain, Shield, BarChart3, Focus } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: Daily Global Revenue ── */
const dailyBlocks = [
  { block: 'Morning Revenue Scan', time: '07:00–09:00', icon: Sun, actions: [
    { action: 'Review overnight deal closures and revenue booked across all active markets', priority: 'P0' },
    { action: 'Check new serious inquiries: flag top 10 highest-intent leads for immediate routing', priority: 'P0' },
    { action: 'Identify hot listings with >5 inquiries in 48h — ensure agent response <2h', priority: 'P0' },
    { action: 'Scan stalled negotiations (>72h no movement) — trigger escalation protocol', priority: 'P1' },
    { action: 'Review premium upgrade pipeline: vendors approaching renewal or upsell thresholds', priority: 'P1' },
  ]},
  { block: 'Midday Acceleration Push', time: '12:00–14:00', icon: Clock, actions: [
    { action: 'Coordinate urgent viewing confirmations for today and tomorrow across top 3 cities', priority: 'P0' },
    { action: 'Push follow-ups with buyers who viewed properties in last 48h but haven\'t submitted offers', priority: 'P0' },
    { action: 'Activate 24h visibility boosts for listings with strong inquiry-to-viewing ratios', priority: 'P1' },
    { action: 'Check cross-city routing: redirect unmatched buyers to adjacent market opportunities', priority: 'P1' },
    { action: 'Monitor campaign ROI: pause underperforming ads, double-down on converting channels', priority: 'P1' },
  ]},
  { block: 'Evening Closure Discipline', time: '18:00–20:00', icon: Moon, actions: [
    { action: 'Track total offers submitted today vs daily micro-target (minimum 5/day)', priority: 'P0' },
    { action: 'Confirm deals finalized: update revenue dashboard and commission tracking', priority: 'P0' },
    { action: 'Prepare next-day priority action list: top 5 deals to close, top 5 leads to convert', priority: 'P0' },
    { action: 'Review daily revenue vs micro-target: identify gap and assign corrective actions', priority: 'P1' },
    { action: 'Send daily performance summary to leadership team (2 min read max)', priority: 'P1' },
  ]},
];

const revenueMetrics = [
  { metric: 'Daily Revenue vs Micro-Target', target: '$35K+/day', frequency: 'Daily' },
  { metric: 'Offers Submitted', target: '5+/day', frequency: 'Daily' },
  { metric: 'Deals Closed', target: '5+/week per city', frequency: 'Weekly' },
  { metric: 'Agent Response Time', target: '<2 hours', frequency: 'Real-time' },
  { metric: 'Stalled Negotiations', target: '<5 at any time', frequency: 'Daily' },
  { metric: 'Premium Conversion Rate', target: '>15%', frequency: 'Weekly' },
];

/* ── Section 2: International Sprint ── */
const sprintPhases = [
  { phase: 'Pre-Sprint — Supply Seeding', duration: 'Day 1–14', tasks: [
    'Identify and sign 3-5 anchor agencies in target city with 50+ listings each',
    'Cluster initial 200+ listings in 2 high-demand districts for density perception',
    'Ensure balanced inventory: luxury (20%), mid-market (50%), affordable (30%)',
    'Localize platform content: language, currency, legal terminology, cultural nuances',
    'Recruit 1 local market coordinator with agency network connections',
  ], gate: 'Gate: 200+ listings live before marketing spend begins' },
  { phase: 'Sprint Week 1 — Demand Ignition', duration: 'Day 15–21', tasks: [
    'Launch geo-targeted digital campaigns: $5-10K budget focused on serious buyer personas',
    'Activate local PR: 3+ media placements positioning platform as "new market intelligence"',
    'Host virtual "market opportunity briefing" webinar targeting 200+ local investors',
    'Begin daily viewing coordination with anchor agencies — target 10+ viewings/day',
    'Publish first "Local Market Pulse" report with actionable investment insights',
  ], gate: 'Gate: 50+ serious inquiries generated in first week' },
  { phase: 'Sprint Week 2-3 — Deal Acceleration', duration: 'Day 22–35', tasks: [
    'Push second-viewing conversions with urgency messaging and competition signals',
    'Accelerate negotiation feedback: 24h SLA for seller responses',
    'Activate premium listing upsells for vendors seeing strong inquiry activity',
    'Run flash "launch week" promotion with time-bound visibility boosts',
    'Coordinate dense viewing clusters: 5+ viewings per district per day',
  ], gate: 'Gate: First deal closed within 30 days of market entry' },
  { phase: 'Sprint Week 4 — Revenue Validation', duration: 'Day 36–45', tasks: [
    'Measure revenue generated: target $10K+ in first 45 days',
    'Assess unit economics: CAC, inquiry-to-deal ratio, agent retention signals',
    'Decide: scale investment, maintain seeding pace, or pause and reassess',
    'Document playbook variations that worked for this specific market',
    'Set 90-day targets for listings (500+), deals (15+), and revenue ($30K+)',
  ], gate: 'Gate: Positive unit economics trajectory before scaling investment' },
];

const sprintMetrics = [
  { metric: 'Time to First Deal', target: '<30 days', benchmark: 'Best: 18 days (Jakarta model)' },
  { metric: 'Listings in First 14 Days', target: '200+', benchmark: 'Density threshold for credibility' },
  { metric: 'Inquiry Surge (Week 1)', target: '50+', benchmark: 'Validates demand channel fit' },
  { metric: 'Sprint Revenue (45 days)', target: '$10K+', benchmark: 'Minimum viable market signal' },
  { metric: 'CAC vs Domestic Benchmark', target: '<3x domestic', benchmark: 'Sustainable expansion indicator' },
];

/* ── Section 3: Founder Clarity ── */
const dailyRhythm = [
  { time: '06:30', action: 'Morning clarity ritual: 10 min reflection on #1 strategic priority for today', category: 'Mindset' },
  { time: '07:00', action: 'Revenue scan: 15 min dashboard review — identify top 3 actions for today', category: 'Execution' },
  { time: '09:00–12:00', action: 'Deep work block: highest-leverage strategic task (no meetings, no Slack)', category: 'Focus' },
  { time: '12:00–13:00', action: 'Midday acceleration: deal pipeline push + team check-ins (max 30 min)', category: 'Execution' },
  { time: '14:00–17:00', action: 'External engagement: investor calls, partner meetings, strategic discussions', category: 'Growth' },
  { time: '18:00', action: 'Evening discipline: revenue check, next-day prep, delegate remaining tasks', category: 'Execution' },
  { time: '19:00', action: 'Strategic reflection: 10 min — what worked, what to stop, what to double-down', category: 'Mindset' },
];

const decisionFilters = [
  { filter: 'Revenue Impact Gate', question: 'Will this action directly increase revenue within 30 days?', action: 'If NO → delegate or defer. If YES → prioritize.' },
  { filter: 'Liquidity Impact Gate', question: 'Does this improve supply density or buyer engagement in a key market?', action: 'If NO → deprioritize. If YES → allocate resources.' },
  { filter: 'Scalability Gate', question: 'Will this create a repeatable process or one-time result?', action: 'If ONE-TIME → minimize time. If REPEATABLE → invest deeply.' },
  { filter: 'Energy ROI Gate', question: 'Is this the highest-leverage use of my energy right now?', action: 'If NO → delegate immediately. If YES → deep focus.' },
];

const weeklyReflection = [
  { day: 'Monday', focus: 'Set 3 weekly strategic objectives — revenue, expansion, partnerships' },
  { day: 'Wednesday', focus: 'Mid-week execution check — course-correct if behind on deal pipeline' },
  { day: 'Friday', focus: 'Weekly review: wins, failures, learnings — prepare next week priorities' },
  { day: 'Monthly', focus: 'Growth narrative assessment: are we telling the right story to investors/team?' },
  { day: 'Quarterly', focus: 'Expansion alignment: are resources allocated to highest-ROI markets?' },
];

const fatigueIndicators = [
  { signal: 'Decision velocity drops below 3 strategic decisions/day', intervention: 'Clear calendar for 2 days; delegate all operational tasks; return to deep work rhythm' },
  { signal: 'Revenue dashboard review skipped for 2+ consecutive days', intervention: 'Re-establish morning scan ritual; assign backup revenue monitor to team' },
  { signal: 'Multiple markets receiving equal attention (no prioritization)', intervention: 'Force-rank markets by revenue potential; allocate 60% focus to top 2 markets' },
  { signal: 'Founder handling operational escalations directly', intervention: 'Review delegation framework; hire/promote operational lead for day-to-day execution' },
  { signal: 'Weekly strategic objectives completion rate <50%', intervention: 'Reduce objective count to 2; increase time blocks for strategic work; pause new initiatives' },
];

/* ── Monitoring Checklist ── */
const checklist = [
  { category: 'Daily Execution', items: ['Morning revenue scan completed', 'Top 10 hot leads routed to agents', 'Stalled negotiations escalated (<72h rule)', 'Offers submitted vs daily target tracked', 'Next-day priority list prepared'] },
  { category: 'Weekly Growth', items: ['Deal closure count vs weekly target', 'Premium conversion rate reviewed', 'Cross-city routing performance checked', 'Campaign ROI assessed and adjusted', 'Team performance summary shared'] },
  { category: 'Sprint Execution', items: ['Active sprint milestones on track', 'Supply seeding targets met per market', 'First-deal timeline within benchmark', 'Sprint revenue vs validation target', 'Playbook documentation updated'] },
  { category: 'Founder Clarity', items: ['Decision filter applied to all new requests', 'Deep work blocks protected (3h+/day)', 'Weekly reflection completed', 'Delegation health assessed', 'Energy and focus level self-rated'] },
];

export default function DailyGlobalRevenueSprintClarityBlueprint() {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">Daily Global Revenue + International Deal Sprint + Founder Clarity</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Operational revenue command, expansion sprint execution & leadership clarity system</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">⚡ Daily Ops</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="daily">⚡ Daily Command</TabsTrigger>
          <TabsTrigger value="sprint">🚀 Deal Sprint</TabsTrigger>
          <TabsTrigger value="clarity">🧠 Founder Clarity</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Fatigue Risks</TabsTrigger>
        </TabsList>

        {/* ── Daily Command ── */}
        <TabsContent value="daily" className="space-y-4 mt-4">
          {dailyBlocks.map((b, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><b.icon className="h-4 w-4 text-primary" /> {b.block}</CardTitle>
                    <Badge variant="outline" className="text-xs">{b.time}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {b.actions.map((a, j) => (
                    <div key={j} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                      <div className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />{a.action}</div>
                      <Badge variant={a.priority === 'P0' ? 'destructive' : 'secondary'} className="text-[10px] shrink-0">{a.priority}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Daily Revenue Metrics</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Metric</th><th className="text-left p-2">Target</th><th className="text-left p-2">Frequency</th></tr></thead>
                    <tbody>{revenueMetrics.map((m, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2 font-medium">{m.metric}</td>
                        <td className="p-2"><Badge variant="outline" className="text-xs">{m.target}</Badge></td>
                        <td className="p-2 text-xs text-muted-foreground">{m.frequency}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Deal Sprint ── */}
        <TabsContent value="sprint" className="space-y-4 mt-4">
          {sprintPhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.phase}</CardTitle>
                    <Badge variant="outline" className="text-xs">{p.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">{p.tasks.map((t, j) => <div key={j} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />{t}</div>)}</div>
                  <div className="p-2 rounded bg-muted/30 border"><span className="text-xs font-semibold text-primary">{p.gate}</span></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div {...anim(5)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Sprint Benchmarks</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Metric</th><th className="text-left p-2">Target</th><th className="text-left p-2">Benchmark</th></tr></thead>
                    <tbody>{sprintMetrics.map((m, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2 font-medium">{m.metric}</td>
                        <td className="p-2"><Badge variant="outline" className="text-xs">{m.target}</Badge></td>
                        <td className="p-2 text-xs text-muted-foreground">{m.benchmark}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Founder Clarity ── */}
        <TabsContent value="clarity" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Daily Rhythm Protocol</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {dailyRhythm.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs w-14 justify-center font-mono">{r.time}</Badge>
                      <span className="text-sm">{r.action}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{r.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Decision Priority Filters</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {decisionFilters.map((f, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <span className="text-sm font-semibold">{f.filter}</span>
                    <p className="text-xs text-muted-foreground italic">"{f.question}"</p>
                    <p className="text-xs text-primary">{f.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Strategic Reflection Cadence</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {weeklyReflection.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                    <div className="flex items-center gap-3"><Badge variant="outline" className="text-xs w-20 justify-center">{w.day}</Badge><span className="text-sm">{w.focus}</span></div>
                  </div>
                ))}
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

        {/* ── Fatigue Risks ── */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {fatigueIndicators.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.signal}</span></div>
                  <div className="text-xs"><strong>Intervention:</strong> {r.intervention}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
