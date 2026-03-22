import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Target, CheckCircle, AlertTriangle, TrendingUp, Zap, Sun, Clock, Moon, Brain, BarChart3, Rocket, Users, Home, Handshake } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: First 1,000 Deals ── */
const dealMilestones = [
  { phase: 'Phase 1 — First 100 Deals', range: 'Deal 1–100', duration: '0–6 months', focus: 'Prove the model', tactics: [
    { tactic: 'Anchor Agent Onboarding', detail: 'Sign 20 high-volume agents with 10+ ready listings each — target 200+ quality listings in 2 priority districts' },
    { tactic: 'Dense Viewing Clusters', detail: 'Schedule 5+ viewings per district per day — proximity reduces buyer effort and increases conversion 2-3x' },
    { tactic: 'First-Viewing Follow-Up SLA', detail: 'Contact every buyer within 4h of first viewing with property summary, comparable insights, and second viewing invitation' },
    { tactic: 'Offer Submission Coaching', detail: 'Provide agents with structured offer scripts: realistic counter-offer ranges, win-win framing, decision timeline suggestions' },
    { tactic: 'Weekly Deal Target', detail: 'Minimum 4 deals/week — track daily offer submissions as leading indicator (target 2+ offers/day)' },
  ], kpis: ['4+ deals/week', '<21 day avg cycle', '>15% viewing-to-offer rate'] },
  { phase: 'Phase 2 — Deals 100–500', range: 'Deal 100–500', duration: '6–14 months', focus: 'Scale the machine', tactics: [
    { tactic: 'Multi-District Expansion', detail: 'Expand from 2 to 8 active districts — replicate density playbook in each new zone before marketing spend' },
    { tactic: 'Agent Performance Leaderboard', detail: 'Rank agents by deal closure velocity — top 10% get premium lead routing and visibility rewards' },
    { tactic: 'Buyer Pipeline Segmentation', detail: 'Score buyers by intent signals (viewing count, inquiry frequency, financing readiness) — prioritize high-probability leads' },
    { tactic: 'Negotiation Stall Intervention', detail: 'Auto-detect negotiations idle >48h — trigger escalation: agent coaching call + buyer re-engagement message' },
    { tactic: 'Weekly Deal Target', detail: '8-10 deals/week — introduce second-city pilot when primary city exceeds 6 deals/week consistently' },
  ], kpis: ['8-10 deals/week', '<18 day avg cycle', '>20% viewing-to-offer rate'] },
  { phase: 'Phase 3 — Deals 500–1,000', range: 'Deal 500–1,000', duration: '14–24 months', focus: 'Systematize at scale', tactics: [
    { tactic: 'Multi-City Deal Engine', detail: 'Active deal pipelines in 3+ cities with standardized agent onboarding, buyer routing, and closing playbooks' },
    { tactic: 'Automated Pipeline Management', detail: 'Deal stage tracking with automated nudges: viewing reminder → offer prompt → negotiation update → closing coordination' },
    { tactic: 'Premium Conversion Acceleration', detail: 'Listings with 5+ inquiries auto-suggested for premium boost — vendors see ROI data from similar upgrades' },
    { tactic: 'Institutional Deal Clustering', detail: 'Package 5-10 investment-grade properties for bulk investor acquisition — higher ticket, faster revenue per deal' },
    { tactic: 'Weekly Deal Target', detail: '15-20 deals/week across all markets — track per-city contribution and identify underperforming zones' },
  ], kpis: ['15-20 deals/week', '<15 day avg cycle', '>25% viewing-to-offer rate'] },
];

const dealKPIs = [
  { kpi: 'Cumulative Deals Closed', target: '1,000', tracking: 'Daily counter with milestone celebrations at 100, 250, 500, 750' },
  { kpi: 'Deals Per Week', target: '15-20 at scale', tracking: 'Rolling 4-week average with trend direction' },
  { kpi: 'Viewing-to-Offer Ratio', target: '>25%', tracking: 'Per district and per agent tracking' },
  { kpi: 'Average Deal Cycle', target: '<15 days', tracking: 'From first inquiry to signed agreement' },
  { kpi: 'Agent Deal Contribution', target: 'Top 20% = 60% of deals', tracking: 'Pareto analysis monthly' },
  { kpi: 'Stalled Negotiation Rate', target: '<10% of pipeline', tracking: 'Deals idle >48h as percentage of active negotiations' },
];

/* ── Section 2: Daily Liquidity Command ── */
const dailyBlocks = [
  { block: 'Morning Liquidity Scan', time: '07:00–09:00', icon: Sun, actions: [
    { action: 'Review overnight inquiry spikes — flag districts with >30% increase for immediate agent activation', priority: 'P0' },
    { action: 'Identify top 10 listings with strongest engagement signals (views, saves, inquiries) — ensure agent responsiveness', priority: 'P0' },
    { action: 'Detect supply gaps: high-demand districts with <15 active listings — trigger vendor outreach campaign', priority: 'P0' },
    { action: 'Check agent response SLA compliance — escalate any agents with >4h average response time', priority: 'P1' },
    { action: 'Review new listings added overnight — verify quality and completeness before buyer exposure', priority: 'P1' },
  ]},
  { block: 'Midday Momentum Push', time: '12:00–14:00', icon: Clock, actions: [
    { action: 'Accelerate viewing confirmations — call/message buyers with pending viewing requests to lock schedules', priority: 'P0' },
    { action: 'Trigger 24h visibility boosts for listings with high inquiry-to-viewing conversion potential', priority: 'P0' },
    { action: 'Support agent negotiation follow-ups — provide pricing comparables and urgency context for active deals', priority: 'P1' },
    { action: 'Check cross-district buyer routing — redirect unmatched buyers to similar properties in adjacent zones', priority: 'P1' },
    { action: 'Monitor campaign performance — pause underperforming ads, increase budget on high-converting channels', priority: 'P1' },
  ]},
  { block: 'Evening Performance Alignment', time: '18:00–20:00', icon: Moon, actions: [
    { action: 'Track total offers submitted today vs daily target (minimum 2/day) — identify conversion blockers', priority: 'P0' },
    { action: 'Review deals closed and revenue booked — update cumulative progress toward 1,000 deal milestone', priority: 'P0' },
    { action: 'Analyze daily liquidity movement: net new listings vs listings closed/expired — maintain positive balance', priority: 'P0' },
    { action: 'Prepare next-day priority list: top 5 hot leads, top 5 stalled deals, top 3 supply gap zones', priority: 'P1' },
    { action: 'Send daily performance digest to team — 2 min read: wins, blockers, tomorrow\'s focus', priority: 'P1' },
  ]},
];

const liquidityKPIs = [
  { kpi: 'Inquiry Velocity', target: '50+ serious/day', frequency: 'Daily' },
  { kpi: 'Listing Engagement Depth', target: '>3 actions/listing/week', frequency: 'Weekly' },
  { kpi: 'Active Pipeline Health', target: '>30 deals in negotiation', frequency: 'Daily' },
  { kpi: 'Net Listing Balance', target: 'Positive (new > closed)', frequency: 'Daily' },
  { kpi: 'Supply Gap Districts', target: '<2 critical zones', frequency: 'Daily' },
  { kpi: 'Agent Response SLA', target: '<2h average', frequency: 'Real-time' },
];

/* ── Section 3: Founder Growth Rhythm ── */
const dailyRhythm = [
  { time: '06:30', action: '10-min clarity ritual: identify #1 deal-impacting action for today', category: 'Focus' },
  { time: '07:00', action: '15-min liquidity scan: review dashboard, flag top 3 actions', category: 'Execution' },
  { time: '09:00–12:00', action: 'Deep work: highest-leverage growth task (partnerships, supply deals, investor calls)', category: 'Growth' },
  { time: '12:00–13:00', action: 'Midday push: deal pipeline acceleration + team check-ins (max 30 min)', category: 'Execution' },
  { time: '14:00–17:00', action: 'External engagement: agent meetings, developer pitches, strategic discussions', category: 'Growth' },
  { time: '18:00', action: 'Evening discipline: revenue check, next-day prep, delegate remaining tasks', category: 'Execution' },
  { time: '19:00', action: '10-min reflection: what moved deals forward today, what to stop, what to double-down', category: 'Focus' },
];

const weeklyRhythm = [
  { day: 'Monday', focus: 'Supply Expansion', actions: 'Onboard new agents, secure fresh listings, identify inventory gaps in priority districts' },
  { day: 'Tuesday', focus: 'Demand Growth', actions: 'Review marketing campaigns, follow up serious prospects, track inquiry quality and source' },
  { day: 'Wednesday', focus: 'Conversion Optimization', actions: 'Review viewing pipeline, intervene in stalled negotiations, test urgency messaging' },
  { day: 'Thursday', focus: 'Revenue Activation', actions: 'Upsell premium listings, promote urgent deal campaigns, monitor monetization metrics' },
  { day: 'Friday', focus: 'Performance Review', actions: 'Analyze weekly traction, review wins and failures, set next week tactical priorities' },
];

const focusFilters = [
  { filter: 'Deal Impact Gate', question: 'Will this action directly lead to a deal closing within 14 days?', rule: 'If NO → delegate or defer' },
  { filter: 'Revenue Gate', question: 'Does this generate revenue within 30 days?', rule: 'If NO → deprioritize unless strategic' },
  { filter: 'Scalability Gate', question: 'Will this create a repeatable process or one-time result?', rule: 'If ONE-TIME → minimize time invested' },
  { filter: 'Energy ROI Gate', question: 'Is this the highest-leverage use of my energy right now?', rule: 'If NO → delegate immediately' },
];

/* ── Monitoring Checklist ── */
const checklist = [
  { category: 'Deal Velocity', items: ['Deals closed this week vs target', 'Offer submissions trend (daily)', 'Viewing-to-offer ratio by district', 'Stalled negotiations count (<48h rule)', 'Average deal cycle duration trend'] },
  { category: 'Liquidity Health', items: ['Net listing balance (new vs closed)', 'Inquiry velocity trend (7-day rolling)', 'Supply gap districts identified and actioned', 'Agent response SLA compliance >85%', 'Top performing listings visibility maintained'] },
  { category: 'Founder Execution', items: ['Daily liquidity scan completed', 'Deep work blocks protected (3h+)', 'Weekly rhythm followed (5-day framework)', 'Decision filter applied to all new requests', 'Team daily digest sent consistently'] },
  { category: 'Growth Trajectory', items: ['Cumulative deal count on track to 1,000', 'New districts activated per month', 'Agent network growth rate', 'Premium conversion revenue trend', 'Multi-city expansion readiness assessed'] },
];

/* ── Risk Indicators ── */
const riskIndicators = [
  { risk: 'Deal velocity plateau: weekly deal count stagnating for 3+ consecutive weeks', intervention: 'Diagnose bottleneck: supply gap → agent outreach blitz; conversion gap → viewing quality audit; closing gap → negotiation coaching sprint' },
  { risk: 'Listing quality decay: increasing percentage of listings with incomplete data or poor photos', intervention: 'Enforce listing quality checklist at upload; offer free professional photography for top 20 listings; reject sub-standard submissions' },
  { risk: 'Agent concentration risk: >50% of deals coming from <5 agents', intervention: 'Accelerate new agent onboarding; create mid-tier agent coaching program; diversify lead routing to promising newer agents' },
  { risk: 'Founder operational trap: spending >60% of time on day-to-day operations vs strategic growth', intervention: 'Hire operations lead to handle daily liquidity management; enforce 3h daily deep work block for strategic initiatives only' },
  { risk: 'Buyer pipeline thinning: serious inquiry volume declining without corresponding deal increase', intervention: 'Audit marketing channel ROI; refresh demand campaigns; test new buyer acquisition channels; check for competitive displacement' },
];

export default function First1000DealsLiquidityFounderBlueprint() {
  const [activeTab, setActiveTab] = useState('deals');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Target className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">First 1,000 Deals + Daily Liquidity Command + Founder Growth Rhythm</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Transaction volume acceleration, marketplace liquidity control & founder execution discipline</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🎯 1,000 Deals</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="deals">🏠 1,000 Deals</TabsTrigger>
          <TabsTrigger value="liquidity">⚡ Liquidity Cmd</TabsTrigger>
          <TabsTrigger value="rhythm">🧠 Founder Rhythm</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        {/* ── 1,000 Deals ── */}
        <TabsContent value="deals" className="space-y-4 mt-4">
          {dealMilestones.map((m, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{m.phase}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{m.range}</Badge>
                      <Badge variant="secondary" className="text-xs">{m.duration}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Focus: {m.focus}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    {m.tactics.map((t, j) => (
                      <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                        <span className="text-sm font-medium">{t.tactic}</span>
                        <p className="text-xs text-muted-foreground">{t.detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.kpis.map((k, j) => <Badge key={j} variant="outline" className="text-xs">{k}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Deal Milestone KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Tracking</th></tr></thead><tbody>{dealKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.tracking}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Liquidity Command ── */}
        <TabsContent value="liquidity" className="space-y-4 mt-4">
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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Liquidity KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Frequency</th></tr></thead><tbody>{liquidityKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.frequency}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Founder Rhythm ── */}
        <TabsContent value="rhythm" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Daily Execution Rhythm</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {dailyRhythm.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                    <div className="flex items-center gap-3"><Badge variant="outline" className="text-xs w-14 justify-center font-mono">{r.time}</Badge><span className="text-sm">{r.action}</span></div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{r.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" /> Weekly Strategic Rhythm</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {weeklyRhythm.map((w, i) => (
                  <div key={i} className="p-2 rounded border bg-muted/20 space-y-1">
                    <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs w-24 justify-center">{w.day}</Badge><span className="text-sm font-medium">{w.focus}</span></div>
                    <p className="text-xs text-muted-foreground ml-[6.5rem]">{w.actions}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Decision Priority Filters</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {focusFilters.map((f, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <span className="text-sm font-semibold">{f.filter}</span>
                    <p className="text-xs text-muted-foreground italic">"{f.question}"</p>
                    <p className="text-xs text-primary">{f.rule}</p>
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

        {/* ── Risks ── */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {riskIndicators.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.risk}</span></div>
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
