import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Bot, Brain, Target, MessageSquare, FileCheck, TrendingUp,
  ArrowRight, CheckCircle, Clock, ShieldCheck, AlertTriangle,
  Users, Zap, Eye, BarChart3, Handshake, RefreshCw
} from 'lucide-react';

/* ─── Agent Definitions ────────────────────────────────────────────── */

const agents = [
  {
    id: 'lead-intel',
    name: 'Lead Intelligence Agent',
    icon: Brain,
    color: 'hsl(var(--chart-1))',
    status: 'active',
    confidence: 87,
    description: 'Analyzes investor behavior signals to detect high-conversion users and prioritize outreach.',
    capabilities: [
      'Behavior signal analysis (search, save, view patterns)',
      'Conversion probability scoring (0–100)',
      'Outreach priority queue ranking',
      'Capital readiness detection',
    ],
    decisions: [
      { trigger: 'Score > 80 + 3+ saves in 48h', action: 'Auto-queue for priority outreach', approval: 'auto' },
      { trigger: 'Score > 60 + active search', action: 'Add to nurture sequence', approval: 'auto' },
      { trigger: 'Score > 90 + budget match', action: 'Assign to senior agent', approval: 'human' },
    ],
    metrics: { processed: '3,200/mo', qualified: '840', conversionLift: '+34%' },
  },
  {
    id: 'deal-match',
    name: 'Deal Matching Agent',
    icon: Target,
    color: 'hsl(var(--chart-2))',
    status: 'active',
    confidence: 82,
    description: 'Recommends optimal listings based on investor DNA profiles and simulates ROI scenarios.',
    capabilities: [
      'Investor DNA profile matching',
      'ROI simulation across scenarios',
      'Feedback-loop recommendation tuning',
      'Cross-city allocation suggestions',
    ],
    decisions: [
      { trigger: 'Match score > 85%', action: 'Push curated deal alert', approval: 'auto' },
      { trigger: 'Portfolio gap detected', action: 'Suggest diversification deal', approval: 'auto' },
      { trigger: 'Institutional-grade match', action: 'Route to relationship manager', approval: 'human' },
    ],
    metrics: { matched: '1,420/mo', accepted: '38%', avgROI: '12.4%' },
  },
  {
    id: 'negotiation',
    name: 'Negotiation Support Agent',
    icon: Handshake,
    color: 'hsl(var(--chart-3))',
    status: 'beta',
    confidence: 74,
    description: 'Suggests pricing ranges, predicts seller flexibility, and generates urgency messaging.',
    capabilities: [
      'Price negotiation range calculation',
      'Seller flexibility prediction',
      'Urgency messaging script generation',
      'Counter-offer strategy suggestions',
    ],
    decisions: [
      { trigger: 'Listing > 60 DOM', action: 'Suggest aggressive offer (-8–12%)', approval: 'auto' },
      { trigger: 'Multiple interested buyers', action: 'Generate urgency script', approval: 'auto' },
      { trigger: 'Offer > Rp 5B', action: 'Require founder review', approval: 'human' },
    ],
    metrics: { negotiations: '210/mo', avgDiscount: '6.8%', closureRate: '72%' },
  },
  {
    id: 'tx-orchestrator',
    name: 'Transaction Orchestration Agent',
    icon: FileCheck,
    color: 'hsl(var(--chart-4))',
    status: 'active',
    confidence: 91,
    description: 'Coordinates legal, vendor, and financing steps with milestone tracking and reminders.',
    capabilities: [
      'Multi-party step coordination',
      'Document completion monitoring',
      'Milestone reminder automation',
      'Stall detection and escalation',
    ],
    decisions: [
      { trigger: 'Document overdue > 48h', action: 'Send escalation reminder', approval: 'auto' },
      { trigger: 'All docs verified', action: 'Advance to payment stage', approval: 'auto' },
      { trigger: 'Deal stalled > 7 days', action: 'Alert founder with options', approval: 'human' },
    ],
    metrics: { active: '48 deals', avgClose: '41 days', onTime: '89%' },
  },
  {
    id: 'post-deal',
    name: 'Post-Deal Engagement Agent',
    icon: TrendingUp,
    color: 'hsl(var(--chart-5))',
    status: 'planned',
    confidence: 68,
    description: 'Suggests resale timing, renovation value upgrades, and reinvestment opportunities.',
    capabilities: [
      'Exit timing intelligence alerts',
      'Renovation ROI recommendations',
      'Reinvestment deal suggestions',
      'Portfolio performance reporting',
    ],
    decisions: [
      { trigger: 'Asset appreciation > 15%', action: 'Suggest exit analysis', approval: 'auto' },
      { trigger: 'Rental yield declining', action: 'Recommend renovation', approval: 'auto' },
      { trigger: 'Reinvestment > Rp 3B', action: 'Require advisor approval', approval: 'human' },
    ],
    metrics: { owners: '1,840', reinvestRate: '47%', avgHold: '18mo' },
  },
];

const dealStateMachine = [
  { state: 'Lead Captured', agent: 'lead-intel', auto: true },
  { state: 'Qualified', agent: 'lead-intel', auto: true },
  { state: 'Deal Matched', agent: 'deal-match', auto: true },
  { state: 'Viewing Scheduled', agent: 'tx-orchestrator', auto: true },
  { state: 'Offer Submitted', agent: 'negotiation', auto: false },
  { state: 'Negotiation', agent: 'negotiation', auto: false },
  { state: 'Payment Initiated', agent: 'tx-orchestrator', auto: false },
  { state: 'Legal Verification', agent: 'tx-orchestrator', auto: false },
  { state: 'Closed', agent: 'tx-orchestrator', auto: false },
  { state: 'Post-Deal Active', agent: 'post-deal', auto: true },
];

const deploymentPhases = [
  { phase: 'Phase 1 — Intelligence Foundation', timeline: 'Week 1–4', items: ['Lead scoring engine', 'Deal matching algorithm', 'Behavior signal pipeline'], status: 'done' },
  { phase: 'Phase 2 — Orchestration Layer', timeline: 'Week 5–8', items: ['Transaction state machine', 'Document tracking', 'Milestone automation'], status: 'active' },
  { phase: 'Phase 3 — Negotiation AI', timeline: 'Week 9–12', items: ['Price range calculator', 'Seller flexibility model', 'Urgency messaging'], status: 'planned' },
  { phase: 'Phase 4 — Post-Deal & Loop', timeline: 'Week 13–16', items: ['Exit timing engine', 'Renovation ROI model', 'Reinvestment funnel'], status: 'planned' },
];

const statusBadge = (s: string) => {
  if (s === 'active') return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Active</Badge>;
  if (s === 'beta') return <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">Beta</Badge>;
  if (s === 'done') return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Done</Badge>;
  return <Badge className="bg-muted text-muted-foreground">Planned</Badge>;
};

/* ─── Component ────────────────────────────────────────────────────── */

export default function AIDealClosingAgentSystem() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">AI Deal-Closing Agent System</h2>
            <p className="text-muted-foreground text-sm">Semi-autonomous agents orchestrating lead-to-close deal execution</p>
          </div>
        </div>
      </div>

      {/* Agent overview strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {agents.map((a) => {
          const Icon = a.icon;
          return (
            <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExpandedAgent(expandedAgent === a.id ? null : a.id)}>
              <CardContent className="pt-4 pb-3 text-center space-y-2">
                <Icon className="h-5 w-5 mx-auto" style={{ color: a.color }} />
                <p className="text-xs font-semibold leading-tight">{a.name.replace(' Agent', '')}</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-bold">{a.confidence}%</span>
                </div>
                {statusBadge(a.status)}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="state-machine">Deal States</TabsTrigger>
          <TabsTrigger value="hitl">Human Override</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Agent Details ─────────────────────────────────── */}
        <TabsContent value="agents" className="space-y-4">
          {agents.map((a) => {
            const Icon = a.icon;
            const expanded = expandedAgent === a.id;
            return (
              <Card
                key={a.id}
                className="cursor-pointer transition-shadow hover:shadow-md border-l-4"
                style={{ borderLeftColor: a.color }}
                onClick={() => setExpandedAgent(expanded ? null : a.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" style={{ color: a.color }} />
                      <div>
                        <CardTitle className="text-sm">{a.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{a.confidence}% confidence</span>
                      {statusBadge(a.status)}
                    </div>
                  </div>
                </CardHeader>

                {expanded && (
                  <CardContent className="space-y-4 text-sm">
                    {/* Capabilities */}
                    <div>
                      <p className="font-medium mb-2">Capabilities</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {a.capabilities.map((c) => (
                          <li key={c} className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-primary shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Decision logic */}
                    <div>
                      <p className="font-medium mb-2">Decision Tree</p>
                      <div className="space-y-2">
                        {a.decisions.map((d, i) => (
                          <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40">
                            <div className="shrink-0 mt-0.5">
                              {d.approval === 'auto'
                                ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                                : <ShieldCheck className="h-4 w-4 text-amber-500" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">If: {d.trigger}</p>
                              <p className="font-medium text-xs mt-0.5">{d.action}</p>
                            </div>
                            <Badge variant={d.approval === 'auto' ? 'secondary' : 'outline'} className="text-xs shrink-0">
                              {d.approval === 'auto' ? 'Auto' : 'Human'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(a.metrics).map(([k, v]) => (
                        <div key={k} className="text-center p-2.5 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="font-semibold">{v}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* ── TAB 2: Deal State Machine ────────────────────────────── */}
        <TabsContent value="state-machine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Deal Lifecycle State Machine
              </CardTitle>
              <p className="text-xs text-muted-foreground">10-state progression from lead capture to post-deal engagement</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {dealStateMachine.map((s, i) => {
                  const agent = agents.find((a) => a.id === s.agent);
                  const Icon = agent?.icon || Bot;
                  return (
                    <div key={s.state} className="flex gap-4 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s.auto ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'}`}>
                          {i + 1}
                        </div>
                        {i < dealStateMachine.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                      </div>
                      <div className="flex-1 flex items-center justify-between pb-1">
                        <div>
                          <h4 className="font-semibold text-sm">{s.state}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Icon className="h-3 w-3" style={{ color: agent?.color }} />
                            <span className="text-xs text-muted-foreground">{agent?.name}</span>
                          </div>
                        </div>
                        <Badge variant={s.auto ? 'secondary' : 'outline'} className="text-xs">
                          {s.auto ? 'Autonomous' : 'Human Checkpoint'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Deals', value: '48', icon: BarChart3 },
              { label: 'Avg Close Time', value: '41 days', icon: Clock },
              { label: 'Auto-advanced', value: '67%', icon: Zap },
              { label: 'Human Interventions', value: '33%', icon: ShieldCheck },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.label}>
                  <CardContent className="pt-5 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="text-lg font-bold">{m.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB 3: Human-in-the-Loop ─────────────────────────────── */}
        <TabsContent value="hitl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Human-in-the-Loop Controls
              </CardTitle>
              <p className="text-xs text-muted-foreground">Override, approval, and confidence-gating policies</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { rule: 'Deal value > Rp 5B', policy: 'Require founder approval before offer submission', severity: 'critical' },
                { rule: 'AI confidence < 70%', policy: 'Flag for human review before auto-advance', severity: 'warning' },
                { rule: 'Institutional investor match', policy: 'Route to relationship manager, no auto-outreach', severity: 'critical' },
                { rule: 'Negotiation counter > 3 rounds', policy: 'Escalate to senior agent with context summary', severity: 'warning' },
                { rule: 'Document verification failed', policy: 'Halt deal progression, alert legal team', severity: 'critical' },
                { rule: 'Stalled > 7 days', policy: 'Generate options report for founder decision', severity: 'info' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="shrink-0 mt-0.5">
                    {r.severity === 'critical'
                      ? <AlertTriangle className="h-4 w-4 text-destructive" />
                      : r.severity === 'warning'
                        ? <Eye className="h-4 w-4 text-amber-500" />
                        : <CheckCircle className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.rule}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.policy}</p>
                  </div>
                  <Badge variant={r.severity === 'critical' ? 'destructive' : 'outline'} className="text-xs shrink-0 capitalize">
                    {r.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Confidence thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Agent Confidence Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agents.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.id} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: a.color }} />
                    <span className="text-sm w-48 shrink-0">{a.name.replace(' Agent', '')}</span>
                    <Progress value={a.confidence} className="flex-1 h-2" />
                    <span className="text-sm font-semibold w-12 text-right">{a.confidence}%</span>
                    <Badge variant={a.confidence >= 80 ? 'secondary' : 'outline'} className="text-xs w-16 justify-center">
                      {a.confidence >= 80 ? 'Auto OK' : 'Review'}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: Deployment Strategy ───────────────────────────── */}
        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deploymentPhases.map((p) => (
              <Card key={p.phase} className={p.status === 'active' ? 'border-primary/40' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{p.phase}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{p.timeline}</Badge>
                      {statusBadge(p.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tech stack summary */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-sm mb-3">Technical Architecture</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  { layer: 'Intelligence', tech: 'Edge Functions + AI scoring hooks' },
                  { layer: 'State Machine', tech: 'deal_stage_rules table + advance-deal-stage' },
                  { layer: 'Memory', tech: 'investor_dna_signals + ai_behavior_tracking' },
                  { layer: 'Notifications', tech: 'ai_event_signals + real-time broadcast' },
                ].map((t) => (
                  <div key={t.layer} className="p-3 rounded-lg bg-background">
                    <p className="font-medium text-xs">{t.layer}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.tech}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
