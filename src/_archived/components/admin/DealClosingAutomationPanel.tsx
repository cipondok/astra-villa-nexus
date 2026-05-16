import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStalledDeals, DEAL_STAGES, STAGE_LABELS, type DealStage } from '@/hooks/useDealWorkflow';
import {
  ArrowRight, AlertTriangle, CheckCircle2, Clock, FileText,
  Shield, DollarSign, Users, Eye, Gavel, Home, Zap, BarChart3,
} from 'lucide-react';

const STAGE_META: Record<DealStage, { icon: typeof Clock; color: string; bg: string; prob: number }> = {
  inquiry: { icon: Users, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-900/30', prob: 10 },
  viewing_scheduled: { icon: Eye, color: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-900/30', prob: 25 },
  offer_submitted: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', prob: 45 },
  negotiation: { icon: Gavel, color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30', prob: 60 },
  payment_initiated: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', prob: 80 },
  legal_verification: { icon: Shield, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', prob: 92 },
  closed: { icon: Home, color: 'text-primary', bg: 'bg-primary/10', prob: 100 },
};

const AUTOMATION_EVENTS = [
  { stage: 'inquiry', events: ['Capture lead source', 'Assign agent', 'Send welcome notification'] },
  { stage: 'viewing_scheduled', events: ['Calendar invite to buyer & agent', 'Reminder 24h before', 'Prepare property fact sheet'] },
  { stage: 'offer_submitted', events: ['Notify seller/admin', 'Start 24h response timer', 'Check financing pre-qualification'] },
  { stage: 'negotiation', events: ['AI counter-offer suggestion', 'Track negotiation rounds', 'Financing eligibility prompt'] },
  { stage: 'payment_initiated', events: ['Create escrow record', 'Verify payment proof', 'Generate receipt'] },
  { stage: 'legal_verification', events: ['Assign notary vendor', 'Document checklist tracking', 'Suggest inspection vendor'] },
  { stage: 'closed', events: ['Finalize AJB', 'Calculate commissions (2.5% platform, 70% agent)', 'Trigger post-deal services'] },
];

/* ─── State Machine Tab ────────────────────────────────────────────────────── */
const StateMachineTab = () => (
  <div className="space-y-2">
    {DEAL_STAGES.map((stage, i) => {
      const meta = STAGE_META[stage];
      const Icon = meta.icon;
      return (
        <div key={stage}>
          <div className={`flex items-center gap-3 rounded-xl border p-3 ${meta.bg}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm`}>
              <Icon className={`h-4 w-4 ${meta.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{STAGE_LABELS[stage]}</p>
                <Badge variant="outline" className="text-[9px] h-4">{meta.prob}%</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Responsible: <span className="font-medium capitalize">
                  {['inquiry', 'viewing_scheduled', 'offer_submitted', 'negotiation'].includes(stage) ? 'Agent' : 'Admin'}
                </span>
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-mono">Stage {i + 1}/7</div>
          </div>
          {i < DEAL_STAGES.length - 1 && (
            <div className="flex justify-center py-0.5">
              <ArrowRight className="h-3 w-3 text-muted-foreground/40 rotate-90" />
            </div>
          )}
        </div>
      );
    })}
  </div>
);

/* ─── Event Triggers Tab ───────────────────────────────────────────────────── */
const EventTriggersTab = () => (
  <div className="space-y-3">
    {AUTOMATION_EVENTS.map((ae) => {
      const stage = ae.stage as DealStage;
      const meta = STAGE_META[stage];
      const Icon = meta.icon;
      return (
        <Card key={ae.stage}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${meta.color}`} />
              <p className="text-sm font-semibold">{STAGE_LABELS[stage]}</p>
            </div>
            <ul className="space-y-1.5 pl-6">
              {ae.events.map(e => (
                <li key={e} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 shrink-0 text-amber-500" />
                  {e}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

/* ─── Stall Detection Tab ──────────────────────────────────────────────────── */
const StallDetectionTab = () => {
  const { data, isLoading } = useStalledDeals(48);

  if (isLoading) return <div className="py-8 text-center text-sm text-muted-foreground">Checking for stalled deals…</div>;

  const deals = data?.deals ?? [];

  return (
    <div className="space-y-4">
      <Card className={deals.length > 0 ? 'border-amber-200 dark:border-amber-800' : ''}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${deals.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <p className="text-sm font-semibold">
              {deals.length > 0 ? `${deals.length} Stalled Deals Detected` : 'No Stalled Deals'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Deals with no progress for 48+ hours</p>
        </CardContent>
      </Card>

      {deals.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_80px_80px] gap-2 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Deal ID</span><span>Stage</span><span>Stall (h)</span><span>Owner</span>
          </div>
          <div className="divide-y max-h-[300px] overflow-y-auto">
            {deals.map(d => (
              <div key={d.deal_id} className="grid grid-cols-[1fr_100px_80px_80px] gap-2 items-center px-4 py-2.5 text-sm">
                <span className="font-mono text-xs truncate">{d.deal_id.slice(0, 8)}…</span>
                <Badge variant="outline" className="text-[10px]">{STAGE_LABELS[d.current_stage as DealStage] ?? d.current_stage}</Badge>
                <span className="text-xs font-semibold text-amber-600">{d.stall_hours}h</span>
                <span className="text-xs capitalize">{d.responsible}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Deployment Tab ───────────────────────────────────────────────────────── */
const DeploymentTab = () => (
  <div className="space-y-4">
    {[
      { phase: 'Phase 1 — State Machine', weeks: 'Week 1–2', items: ['Deploy deal-state-engine function', '7-stage transition validation', 'Stage history logging'], status: 'live' },
      { phase: 'Phase 2 — Automation', weeks: 'Week 3–4', items: ['Auto-task generation per stage', 'Stall detection cron (every 2h)', 'Notification triggers'], status: 'live' },
      { phase: 'Phase 3 — Intelligence', weeks: 'Week 5–6', items: ['AI negotiation suggestions', 'Deal probability forecasting', 'Vendor coordination tasks'], status: 'building' },
      { phase: 'Phase 4 — Full Orchestration', weeks: 'Week 7–8', items: ['End-to-end automation pipeline', 'Commission auto-calculation', 'Post-deal service triggers'], status: 'planned' },
    ].map(p => (
      <Card key={p.phase}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">{p.phase}</p>
              <p className="text-xs text-muted-foreground">{p.weeks}</p>
            </div>
            <Badge variant={p.status === 'live' ? 'default' : p.status === 'building' ? 'secondary' : 'outline'}>{p.status}</Badge>
          </div>
          <ul className="space-y-1.5">
            {p.items.map(item => (
              <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-primary/60" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    ))}
  </div>
);

/* ─── Main Panel ───────────────────────────────────────────────────────────── */
const DealClosingAutomationPanel = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold tracking-tight">Deal Closing Automation</h2>
      <p className="text-sm text-muted-foreground">7-stage state machine with automated tasks, stall detection & orchestration</p>
    </div>

    <div className="grid gap-3 sm:grid-cols-4">
      {[
        { label: 'Stages', value: '7', icon: BarChart3 },
        { label: 'Auto-Tasks', value: '12', icon: Zap },
        { label: 'Doc Checks', value: '5 types', icon: FileText },
        { label: 'Stall Alert', value: '48h', icon: Clock },
      ].map(s => (
        <Card key={s.label}>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><s.icon className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Tabs defaultValue="machine" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="machine">State Machine</TabsTrigger>
        <TabsTrigger value="events">Event Triggers</TabsTrigger>
        <TabsTrigger value="stalls">Stall Detection</TabsTrigger>
        <TabsTrigger value="deploy">Deployment</TabsTrigger>
      </TabsList>

      <TabsContent value="machine"><StateMachineTab /></TabsContent>
      <TabsContent value="events"><EventTriggersTab /></TabsContent>
      <TabsContent value="stalls"><StallDetectionTab /></TabsContent>
      <TabsContent value="deploy"><DeploymentTab /></TabsContent>
    </Tabs>
  </div>
);

export default DealClosingAutomationPanel;
