import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Users, Calendar, FileCheck, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, Phone, MessageSquare, ChevronRight,
  BarChart3, Shield, Award, Zap, Eye, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

const FADE_UP = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* ── Deal Closing Checklist ── */
const CLOSING_CHECKLIST = [
  { phase: 'Lead Qualification', color: 'hsl(var(--chart-1))', items: [
    'Verify buyer financial readiness (proof of funds / KPR pre-approval)',
    'Score lead intent using engagement signals (views, saves, inquiries)',
    'Match buyer criteria against high-liquidity listings',
    'Confirm pricing realism — reject listings >15% above FMV',
    'Assign lead to responsive agent within 15 minutes',
  ]},
  { phase: 'Viewing Acceleration', color: 'hsl(var(--chart-2))', items: [
    'Schedule viewing within 48 hours of inquiry',
    'Send digital confirmation + property brief via WhatsApp',
    'Agent prepares comparable market data for on-site discussion',
    'Collect post-viewing feedback rating within 2 hours',
    'Trigger follow-up sequence for interested but undecided buyers',
  ]},
  { phase: 'Offer & Negotiation', color: 'hsl(var(--chart-3))', items: [
    'Present AI-generated optimal offer range to buyer',
    'Equip agent with 3 comparable recent transactions',
    'Submit digital offer with 72-hour validity window',
    'Facilitate counter-offer round with real-time messaging',
    'Secure written acceptance from both parties',
  ]},
  { phase: 'Closing Coordination', color: 'hsl(var(--chart-4))', items: [
    'Initiate escrow deposit collection (5-10% of transaction value)',
    'Assign legal coordinator for document verification',
    'Schedule notary appointment within 14 business days',
    'Track all required documents via digital checklist',
    'Confirm fund transfer and issue closing certificate',
  ]},
  { phase: 'Post-Close Trust Building', color: 'hsl(var(--chart-5))', items: [
    'Request buyer testimonial within 7 days of closing',
    'Publish anonymized case study with time-to-close metrics',
    'Trigger vendor service recommendations (renovation, furnishing)',
    'Add buyer to investor nurture sequence for repeat transactions',
  ]},
];

/* ── KPI Benchmarks ── */
const KPI_BENCHMARKS = [
  { metric: 'Lead Response Time', target: '< 15 min', current: '—', icon: Clock, tier: 'critical' },
  { metric: 'Viewing Scheduling Rate', target: '> 70%', current: '—', icon: Calendar, tier: 'high' },
  { metric: 'Viewing → Offer Conversion', target: '> 25%', current: '—', icon: ArrowUpRight, tier: 'critical' },
  { metric: 'Offer → Close Conversion', target: '> 40%', current: '—', icon: CheckCircle2, tier: 'critical' },
  { metric: 'Average Days to Close', target: '< 45 days', current: '—', icon: TrendingUp, tier: 'high' },
  { metric: 'Deal Probability Accuracy', target: '> 75%', current: '—', icon: Target, tier: 'medium' },
  { metric: 'Agent NPS Score', target: '> 60', current: '—', icon: Award, tier: 'medium' },
  { metric: 'Post-Close Testimonial Rate', target: '> 50%', current: '—', icon: MessageSquare, tier: 'medium' },
];

/* ── Escalation Protocol ── */
const ESCALATION_TIERS = [
  { trigger: 'No agent response in 30 min', action: 'Auto-reassign lead to next available agent', severity: 'warning', owner: 'System' },
  { trigger: 'No viewing scheduled in 72 hours', action: 'Escalate to team lead with buyer context summary', severity: 'warning', owner: 'Team Lead' },
  { trigger: 'Offer stalled > 5 days', action: 'Founder review — call buyer directly with incentive options', severity: 'critical', owner: 'Founder' },
  { trigger: 'Legal docs incomplete at Day 30', action: 'Assign backup legal coordinator + daily status calls', severity: 'critical', owner: 'Ops Manager' },
  { trigger: 'Escrow not received in 7 days', action: 'Risk flag — pause deal progression, contact both parties', severity: 'critical', owner: 'Finance' },
  { trigger: 'Buyer goes silent > 10 days', action: 'Win-back sequence — exclusive deal alert + personal outreach', severity: 'warning', owner: 'Agent' },
];

/* ── Milestone Tracker ── */
const MILESTONES = [
  { count: 10, label: 'Proof of Concept', signal: 'Validate deal workflow end-to-end works', reward: 'Internal celebration + process review' },
  { count: 25, label: 'Early Traction', signal: 'Referral momentum starts, agents gain confidence', reward: 'First agent performance bonuses' },
  { count: 50, label: 'Credibility Threshold', signal: 'External PR-ready, investor confidence milestone', reward: 'Launch public case study series' },
];

export default function First50DealsPlaybookPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const totalItems = useMemo(() => CLOSING_CHECKLIST.reduce((s, p) => s + p.items.length, 0), []);
  const completedItems = useMemo(() => Object.values(checkedItems).filter(Boolean).length, [checkedItems]);
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const toggle = (key: string) => setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">First 50 Deals Playbook</h1>
              <p className="text-sm text-muted-foreground">Tactical execution system for closing your first 50 property transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1 h-2.5" />
            <span className="text-sm font-semibold text-foreground tabular-nums">{completedItems}/{totalItems}</span>
          </div>
        </motion.div>

        {/* Milestone Cards */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MILESTONES.map((m) => (
            <Card key={m.count} className={`border ${completedItems >= m.count ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={completedItems >= m.count ? 'default' : 'secondary'}>{m.count} Deals</Badge>
                  <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-sm text-foreground">{m.signal}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Award className="h-3 w-3" />{m.reward}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="checklist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="kpis">KPI Benchmarks</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
          </TabsList>

          {/* ── Checklist Tab ── */}
          <TabsContent value="checklist" className="space-y-5">
            {CLOSING_CHECKLIST.map((phase, pi) => (
              <motion.div key={phase.phase} variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: pi * 0.08 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: phase.color }} />
                      {phase.phase}
                      <Badge variant="outline" className="ml-auto text-xs tabular-nums">
                        {phase.items.filter((_, i) => checkedItems[`${pi}-${i}`]).length}/{phase.items.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {phase.items.map((item, ii) => {
                      const key = `${pi}-${ii}`;
                      return (
                        <label key={key} className="flex items-start gap-3 cursor-pointer group">
                          <Checkbox checked={!!checkedItems[key]} onCheckedChange={() => toggle(key)} className="mt-0.5" />
                          <span className={`text-sm leading-relaxed transition-colors ${checkedItems[key] ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary'}`}>
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── Pipeline Tracking Tab ── */}
          <TabsContent value="pipeline" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Daily Pipeline Tracking Logic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { stage: 'New Leads', metric: 'Count of inquiries received today', target: '≥ 8/day', icon: Users },
                  { stage: 'Qualified', metric: 'Leads with verified funds + matched listing', target: '≥ 5/day', icon: Shield },
                  { stage: 'Viewing Scheduled', metric: 'Confirmed viewings booked', target: '≥ 3/day', icon: Calendar },
                  { stage: 'Offer Submitted', metric: 'Digital offers sent to sellers', target: '≥ 1/day', icon: FileCheck },
                  { stage: 'In Negotiation', metric: 'Active counter-offer exchanges', target: 'Track count', icon: MessageSquare },
                  { stage: 'Closing', metric: 'Deals in legal/payment coordination', target: 'Track progress %', icon: CheckCircle2 },
                  { stage: 'Closed', metric: 'Completed transactions', target: '≥ 4/week', icon: Award },
                ].map((row, i) => (
                  <motion.div key={row.stage} variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <row.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{row.stage}</p>
                      <p className="text-xs text-muted-foreground">{row.metric}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{row.target}</Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4 text-primary" />Daily Review Ritual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { time: '08:00', task: 'Review overnight inquiries — assign agents immediately' },
                    { time: '10:00', task: 'Check viewing confirmations — fill empty slots' },
                    { time: '13:00', task: 'Monitor active negotiations — intervene on stalls' },
                    { time: '16:00', task: 'Track closing pipeline — resolve documentation gaps' },
                    { time: '18:00', task: 'End-of-day scorecard — log deals advanced today' },
                    { time: '20:00', task: 'Plan tomorrow — identify top 3 deals to push' },
                  ].map((r) => (
                    <div key={r.time} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                      <span className="text-xs font-mono font-bold text-primary tabular-nums">{r.time}</span>
                      <span className="text-sm text-foreground">{r.task}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── KPI Benchmarks Tab ── */}
          <TabsContent value="kpis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KPI_BENCHMARKS.map((kpi, i) => (
                <motion.div key={kpi.metric} variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: i * 0.06 }}>
                  <Card className="h-full">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`p-2 rounded-lg shrink-0 ${kpi.tier === 'critical' ? 'bg-destructive/10' : kpi.tier === 'high' ? 'bg-primary/10' : 'bg-muted'}`}>
                        <kpi.icon className={`h-4 w-4 ${kpi.tier === 'critical' ? 'text-destructive' : kpi.tier === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium text-foreground">{kpi.metric}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-foreground tabular-nums">{kpi.target}</span>
                          <Badge variant={kpi.tier === 'critical' ? 'destructive' : 'secondary'} className="text-[10px]">{kpi.tier}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Funnel Benchmark</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { stage: 'Inquiries → Qualified', rate: '60%', volume: '100 → 60' },
                    { stage: 'Qualified → Viewing', rate: '70%', volume: '60 → 42' },
                    { stage: 'Viewing → Offer', rate: '25%', volume: '42 → 10-11' },
                    { stage: 'Offer → Closed', rate: '40%', volume: '10-11 → 4' },
                  ].map((f, i) => (
                    <div key={f.stage} className="flex items-center gap-3">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-foreground flex-1">{f.stage}</span>
                      <span className="text-sm font-bold text-primary tabular-nums">{f.rate}</span>
                      <span className="text-xs text-muted-foreground tabular-nums w-24 text-right">{f.volume}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    ≈ 4 closed deals per 100 raw inquiries → need ~1,250 inquiries for 50 deals
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Escalation Protocol Tab ── */}
          <TabsContent value="escalation" className="space-y-4">
            {ESCALATION_TIERS.map((esc, i) => (
              <motion.div key={esc.trigger} variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <Card className={`border-l-4 ${esc.severity === 'critical' ? 'border-l-destructive' : 'border-l-yellow-500'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${esc.severity === 'critical' ? 'text-destructive' : 'text-yellow-500'}`} />
                          <p className="text-sm font-semibold text-foreground">{esc.trigger}</p>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Zap className="h-3 w-3" />{esc.action}
                        </p>
                      </div>
                      <Badge variant={esc.severity === 'critical' ? 'destructive' : 'outline'} className="shrink-0">{esc.owner}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="bg-muted/30">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Protocol rule:</strong> Any deal stalled beyond its tier threshold must be reviewed within 4 hours.
                  Founder personally intervenes on any deal stalled in offer/negotiation stage beyond 5 days — no exceptions in the first 50 deals.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
