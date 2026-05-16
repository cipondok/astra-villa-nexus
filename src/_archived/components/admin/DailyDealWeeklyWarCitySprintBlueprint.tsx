import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Sword, Sun, Clock, Moon, Calendar, TrendingUp, Zap, Target, CheckCircle, AlertTriangle, Phone, Users, DollarSign, BarChart3, MapPin } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: Daily Deal Closing Machine ── */
const dailyBlocks = [
  {
    phase: 'Morning Deal Momentum Scan',
    time: '08:00 – 10:00',
    icon: Sun,
    color: 'text-yellow-500',
    actions: [
      'Review overnight inquiries — flag high-intent leads (budget confirmed, multiple views)',
      'Identify top 5 hot leads requiring same-day follow-up',
      'Check listings with 3+ viewing requests — mark as "high demand"',
      'Scan stalled negotiations (>48h no response) — trigger escalation',
      'Confirm all scheduled viewings for today — send reminders',
    ],
    script: 'Selamat pagi [Agent], ada 3 leads panas hari ini yang perlu di-follow up sebelum jam 12. [Lead 1] sudah viewing 2x dan siap nego. Prioritaskan!',
  },
  {
    phase: 'Midday Conversion Actions',
    time: '10:00 – 14:00',
    icon: Clock,
    color: 'text-primary',
    actions: [
      'Call/WhatsApp buyers who completed viewings yesterday — ask decision timeline',
      'Push agents with open negotiations to get seller counter-offer responses',
      'Coordinate urgent second viewings for hesitant buyers',
      'Send comparable price data to buyers in negotiation stage',
      'Trigger "competing interest" alerts for listings with multiple inquiries',
    ],
    script: 'Pak/Bu [Buyer], properti yang Anda lihat kemarin di [District] sudah ada 2 pembeli lain yang tertarik. Apakah ingin kita diskusikan penawaran hari ini?',
  },
  {
    phase: 'Afternoon Deal Push',
    time: '14:00 – 17:00',
    icon: Target,
    color: 'text-orange-500',
    actions: [
      'Review all pending offer submissions — remove friction blockers',
      'Facilitate pricing alignment calls between buyer and seller agents',
      'Schedule next-day viewing slots for new high-intent inquiries',
      'Push premium listing upgrade suggestions to vendors with slow-moving inventory',
      'Update deal pipeline tracker — move deals forward or flag risks',
    ],
    script: '[Agent], listing di [Address] sudah 14 hari tanpa offer. Recommend: turunkan harga 5% atau upgrade ke Premium untuk boost visibility.',
  },
  {
    phase: 'Evening Closing Push',
    time: '17:00 – 20:00',
    icon: Moon,
    color: 'text-indigo-400',
    actions: [
      'Confirm offer submission status for all active negotiations',
      'Resolve last objections or price alignment friction via quick calls',
      'Schedule tomorrow\'s first-priority deal commitment checkpoints',
      'Send end-of-day summary to top agents on their pipeline status',
      'Log daily metrics: offers submitted, viewings completed, deals progressed',
    ],
    script: 'Daily closing report: [X] offers submitted, [Y] viewings completed, [Z] negotiations advanced. Tomorrow priority: [Top 3 deals to close].',
  },
];

const dailyKPIs = [
  { metric: 'Offers Submitted / Day', target: '≥3', current: 1.2, progress: 40 },
  { metric: 'Viewing-to-Offer Ratio', target: '≥25%', current: 15, progress: 60 },
  { metric: 'Deals Closed / Week', target: '≥5', current: 2, progress: 40 },
  { metric: 'Stalled Deal Intervention Rate', target: '100%', current: 65, progress: 65 },
  { metric: 'Agent Response Speed (avg)', target: '<30 min', current: 45, progress: 55 },
];

/* ── Section 2: Weekly War Plan ── */
const weeklyPlan = [
  {
    day: 'MONDAY',
    theme: '📦 Supply Expansion',
    color: 'border-blue-500/30',
    actions: [
      'Onboard 3-5 new agents with verified listings',
      'Secure 10+ fresh property listings across target districts',
      'Identify inventory gaps — which property types are buyers searching but not finding?',
      'Follow up with existing agents for portfolio expansion',
      'Review listing quality scores — push agents to improve photos/descriptions',
    ],
    kpi: 'Net new listings added',
  },
  {
    day: 'TUESDAY',
    theme: '🎯 Buyer Demand Growth',
    color: 'border-green-500/30',
    actions: [
      'Activate targeted social media ads for high-demand districts',
      'Follow up all serious prospects from previous week',
      'Track inquiry quality — segment by budget clarity and timeline',
      'Send curated property recommendations to registered buyers',
      'Launch "new listings alert" broadcast to active buyer database',
    ],
    kpi: 'Serious buyer inquiries received',
  },
  {
    day: 'WEDNESDAY',
    theme: '🔄 Conversion Optimization',
    color: 'border-yellow-500/30',
    actions: [
      'Review full viewing pipeline — identify bottlenecks',
      'Personally intervene in top 3 stalled negotiations',
      'A/B test urgency messaging variations',
      'Coordinate second viewings for hesitant buyers',
      'Analyze viewing no-show patterns — adjust reminder cadence',
    ],
    kpi: 'Viewing-to-offer conversion rate',
  },
  {
    day: 'THURSDAY',
    theme: '💰 Revenue Activation',
    color: 'border-primary/30',
    actions: [
      'Upsell premium listing packages to top-performing agents',
      'Launch "Deal of the Week" promotional campaign',
      'Monitor monetization metrics — revenue per listing, ARPU',
      'Identify high-demand listings for featured placement',
      'Push time-bound promotional offers to vendors',
    ],
    kpi: 'Premium listing revenue generated',
  },
  {
    day: 'FRIDAY',
    theme: '📊 Performance Review',
    color: 'border-purple-500/30',
    actions: [
      'Analyze weekly liquidity movement — supply vs demand balance',
      'Review weekly wins: deals closed, best-performing agents, top listings',
      'Identify weekly failures: lost deals, slow agents, poor listings',
      'Set next week\'s top 3 tactical priorities',
      'Prepare weekend viewing coordination plan',
    ],
    kpi: 'Weekly revenue vs target achievement',
  },
];

/* ── Section 3: City Revenue Sprint ── */
const sprintPhases = [
  {
    phase: 'Sprint Setup (Day 0-1)',
    actions: [
      'Select 2-3 districts with highest inquiry momentum',
      'Cluster 15-20 best-value listings in selected zones',
      'Align 5-8 top agents for sprint participation',
      'Prepare promotional creative assets and messaging',
      'Set sprint revenue target (e.g., Rp 500M in 7 days)',
    ],
  },
  {
    phase: 'Demand Activation (Day 1-3)',
    actions: [
      'Launch "Best Deals This Week in [District]" social campaign',
      'Broadcast curated shortlists to serious buyer database via WhatsApp',
      'Activate time-bound premium listing upgrades at 50% discount',
      'Run geo-targeted ads within 10km radius of sprint zone',
      'Coordinate influencer or agent live-walkthrough content',
    ],
  },
  {
    phase: 'Conversion Execution (Day 3-5)',
    actions: [
      'Schedule high-density viewing clusters (3-5 properties per tour)',
      'Push rapid negotiation cycles — 24h response SLA for agents',
      'Send competing interest signals to active buyers',
      'Facilitate same-day second viewings for interested buyers',
      'Track daily: inquiries → viewings → offers → deals pipeline',
    ],
  },
  {
    phase: 'Closing & Review (Day 5-7)',
    actions: [
      'Push all pending offers toward acceptance',
      'Final urgency messaging: "sprint ending — last chance pricing"',
      'Calculate sprint ROI: revenue generated vs marketing spend',
      'Identify top-performing listings and agents from sprint',
      'Document learnings for next sprint iteration',
    ],
  },
];

const sprintKPIs = [
  { metric: 'Sprint Revenue Generated', target: 'Rp 500M+' },
  { metric: 'Inquiry Spike %', target: '+150% vs normal week' },
  { metric: 'Viewing Bookings', target: '30+ in sprint window' },
  { metric: 'Offer Submissions', target: '10+ during sprint' },
  { metric: 'Sprint ROI', target: '5x+ on marketing spend' },
];

/* ── Monitoring Checklist ── */
const monitoringItems = [
  { freq: 'Daily', items: ['Offers submitted count', 'Viewing completion rate', 'Agent response speed', 'Stalled deal count', 'New inquiry volume'] },
  { freq: 'Weekly', items: ['Net new listings added', 'Serious buyer ratio trend', 'Revenue vs target progress', 'Premium listing conversion rate', 'Top agent performance rankings'] },
];

/* ── Risk Indicators ── */
const riskIndicators = [
  { risk: 'Morning scan skipped consistently', signal: 'Hot leads go cold within 24h', fix: 'Automate morning priority alert at 08:00 daily' },
  { risk: 'Agent response speed degrading', signal: 'Average response >2 hours', fix: 'Implement response SLA penalties and visibility scoring' },
  { risk: 'Viewing no-show rate rising', signal: 'No-show >30% of booked viewings', fix: 'Add confirmation + 2h reminder + reschedule option' },
  { risk: 'Negotiation stalling >72 hours', signal: 'Deal pipeline stuck at offer stage', fix: 'Trigger founder intervention call within 48h of stall' },
  { risk: 'Sprint fatigue — declining engagement', signal: 'Repeat sprint audience shows lower CTR', fix: 'Rotate districts and vary promotional messaging' },
  { risk: 'Revenue plateau despite inquiry growth', signal: 'Conversion rate declining week-over-week', fix: 'Audit full funnel — identify exact drop-off stage and fix' },
];

export default function DailyDealWeeklyWarCitySprintBlueprint() {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-destructive/20 bg-gradient-to-br from-background to-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Sword className="h-7 w-7 text-destructive" />
                <div>
                  <CardTitle className="text-xl">Daily Deal Closing + Weekly War Plan + City Revenue Sprint</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Battlefield execution blueprint — close deals daily, dominate weekly, sprint for revenue</p>
                </div>
              </div>
              <Badge variant="destructive" className="text-xs">⚔️ War Mode</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="daily">⚔️ Daily Machine</TabsTrigger>
          <TabsTrigger value="weekly">📅 Weekly Plan</TabsTrigger>
          <TabsTrigger value="sprint">🚀 Revenue Sprint</TabsTrigger>
          <TabsTrigger value="monitor">📋 Monitoring</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        {/* ── Daily Machine ── */}
        <TabsContent value="daily" className="space-y-4 mt-4">
          {dailyBlocks.map((block, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <block.icon className={`h-5 w-5 ${block.color}`} />
                      <CardTitle className="text-base">{block.phase}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">{block.time}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-1.5">
                    {block.actions.map((a, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm"><CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />{a}</div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="flex items-center gap-1 mb-1"><Phone className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] font-semibold text-muted-foreground uppercase">Script Template</span></div>
                    <p className="text-xs italic text-muted-foreground">{block.script}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div {...anim(5)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Daily KPI Tracker</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dailyKPIs.map((k, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{k.metric}</span>
                      <Badge variant="outline" className="text-xs">Target: {k.target}</Badge>
                    </div>
                    <Progress value={k.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Weekly War Plan ── */}
        <TabsContent value="weekly" className="space-y-4 mt-4">
          {weeklyPlan.map((day, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className={`border-l-4 ${day.color}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{day.day} — {day.theme}</CardTitle>
                    <Badge variant="secondary" className="text-xs">KPI: {day.kpi}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1.5">
                    {day.actions.map((a, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm"><CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />{a}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Revenue Sprint ── */}
        <TabsContent value="sprint" className="space-y-4 mt-4">
          {sprintPhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{p.phase}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1.5">
                    {p.actions.map((a, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm"><CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />{a}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div {...anim(5)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Sprint KPI Targets</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {sprintKPIs.map((k, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-sm font-medium">{k.metric}</span>
                      <Badge variant="outline" className="text-xs">{k.target}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Monitoring ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {monitoringItems.map((m, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{m.freq} Performance Checklist</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {m.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Risk Signals ── */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {riskIndicators.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-semibold text-sm">{r.risk}</span>
                  </div>
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
