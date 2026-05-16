import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  MessageSquare, Search, FileText, CheckCircle2, Clock,
  Users, TrendingUp, Target, Zap, ArrowRight, Phone,
  BarChart3, AlertTriangle, Calendar, DollarSign, Shield,
  ChevronRight, Activity, Building2, Handshake, Timer,
  Eye, Heart, Send, Scale, Gavel, CreditCard, PartyPopper,
  CircleDot, ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Pipeline Stage Definitions ─── */

interface StageAction {
  action: string;
  timeframe: string;
  owner: string;
  priority: 'critical' | 'high' | 'medium';
  detail: string;
}

interface PipelineStage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: typeof MessageSquare;
  color: string;
  bgColor: string;
  slaTarget: string;
  conversionBenchmark: string;
  actions: StageAction[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'inquiry',
    number: 1,
    title: 'Inquiry Response',
    subtitle: 'Acknowledge & Engage',
    icon: MessageSquare,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    slaTarget: '< 2 hours',
    conversionBenchmark: '→ 65% advance',
    actions: [
      { action: 'Acknowledge investor interest', timeframe: '< 30 min', owner: 'Agent', priority: 'critical', detail: 'Send personalized response via WhatsApp or platform message confirming receipt and expressing genuine interest' },
      { action: 'Share enhanced property insights', timeframe: '< 1 hour', owner: 'Agent', priority: 'high', detail: 'Send AI-generated investment summary: opportunity score, yield estimate, price trend, and comparable transaction data' },
      { action: 'Propose viewing or call schedule', timeframe: '< 2 hours', owner: 'Agent', priority: 'high', detail: 'Offer 2-3 available time slots for property viewing or video call using agent availability system' },
    ],
  },
  {
    id: 'qualification',
    number: 2,
    title: 'Qualification & Strengthening',
    subtitle: 'Understand & Match',
    icon: Search,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    slaTarget: '1–3 days',
    conversionBenchmark: '→ 45% advance',
    actions: [
      { action: 'Understand budget and timeline', timeframe: 'During first call', owner: 'Agent', priority: 'critical', detail: 'Qualify investor on budget range, financing preference (cash/KPR), purchase timeline, and investment objectives (yield vs appreciation)' },
      { action: 'Suggest comparable opportunities', timeframe: '< 24 hours', owner: 'AI + Agent', priority: 'high', detail: 'Use AI Deal Finder to surface 2-3 alternative properties matching budget and criteria to strengthen engagement' },
      { action: 'Explain investment potential signals', timeframe: 'During follow-up', owner: 'Agent', priority: 'medium', detail: 'Present infrastructure growth data, smart city predictions, and market momentum indicators for the target area' },
    ],
  },
  {
    id: 'offer',
    number: 3,
    title: 'Offer Facilitation',
    subtitle: 'Guide & Negotiate',
    icon: Scale,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    slaTarget: '3–7 days',
    conversionBenchmark: '→ 60% advance',
    actions: [
      { action: 'Guide competitive offer range', timeframe: 'Pre-offer', owner: 'AI Pricing Advisor', priority: 'critical', detail: 'Present AI fair market value estimation with confidence range, recent comparable transactions, and suggested offer strategy' },
      { action: 'Highlight urgency factors', timeframe: 'During offer prep', owner: 'Agent', priority: 'high', detail: 'Communicate price trend direction, demand signals (other inquiries count), and time-sensitive developer incentives' },
      { action: 'Coordinate negotiation flow', timeframe: 'Throughout', owner: 'Agent', priority: 'high', detail: 'Manage counter-offer cycles through NegotiationProgressTracker, maintaining momentum with 24-hour response SLA' },
    ],
  },
  {
    id: 'closing',
    number: 4,
    title: 'Closing Support',
    subtitle: 'Secure & Complete',
    icon: CheckCircle2,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    slaTarget: '7–30 days',
    conversionBenchmark: '→ 85% close',
    actions: [
      { action: 'Legal documentation guidance', timeframe: 'Post-acceptance', owner: 'Legal Team', priority: 'critical', detail: 'Guide through AJB/PPJB preparation, SHM verification, notary coordination, and regulatory compliance via Legal Services workflow' },
      { action: 'Financing coordination', timeframe: 'Parallel to legal', owner: 'Agent + Bank', priority: 'high', detail: 'Facilitate KPR application through partner banks, coordinate property appraisal, and track loan approval progress' },
      { action: 'Transaction completion tracking', timeframe: 'Until handover', owner: 'Operations', priority: 'high', detail: 'Monitor payment milestones, document signing schedule, key handover, and post-sale satisfaction follow-up' },
    ],
  },
];

/* ─── Mock Pipeline Metrics ─── */

const PIPELINE_METRICS = {
  totalActiveDeals: 47,
  totalValue: 28500000000,
  avgCycleTime: 23,
  conversionRate: 18.4,
  stageBreakdown: [
    { stage: 'Inquiry', count: 18, value: 8200000000, avgAge: 1 },
    { stage: 'Qualification', count: 14, value: 9800000000, avgAge: 5 },
    { stage: 'Offer', count: 10, value: 7100000000, avgAge: 12 },
    { stage: 'Closing', count: 5, value: 3400000000, avgAge: 21 },
  ],
  weeklyPerformance: {
    newInquiries: 12,
    qualifiedThisWeek: 8,
    offersSubmitted: 4,
    dealsClosed: 2,
    revenue: 1200000000,
  },
};

/* ─── Component ─── */

export default function DealConversionPipelinePage() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [expandedStage, setExpandedStage] = useState<string | null>('inquiry');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Handshake className="h-5 w-5 text-primary" />
                </div>
                Deal Conversion Pipeline
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Structured inquiry-to-close workflow for repeatable revenue
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <MetricChip icon={Activity} label="Active Deals" value={String(PIPELINE_METRICS.totalActiveDeals)} />
              <MetricChip icon={TrendingUp} label="Conversion" value={`${PIPELINE_METRICS.conversionRate}%`} color="text-chart-2" />
              <MetricChip icon={Timer} label="Avg Cycle" value={`${PIPELINE_METRICS.avgCycleTime}d`} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
            <TabsTrigger value="tracking">Tracking System</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* ═══ PIPELINE TAB ═══ */}
          <TabsContent value="pipeline" className="space-y-4">
            {/* Visual funnel summary */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PIPELINE_METRICS.stageBreakdown.map((s, i) => (
                <Card key={i} className="border border-border bg-card">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-black text-foreground">{s.count}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{s.stage}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      Rp {(s.value / 1e9).toFixed(1)}B · {s.avgAge}d avg
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Stage detail cards */}
            {PIPELINE_STAGES.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isExpanded = expandedStage === stage.id;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  {/* Connector arrow between stages */}
                  {idx > 0 && (
                    <div className="flex justify-center -mt-2 mb-2">
                      <ArrowDown className="h-4 w-4 text-muted-foreground/25" />
                    </div>
                  )}

                  <Card className={cn(
                    'border bg-card transition-all cursor-pointer',
                    isExpanded ? `border-${stage.color.replace('text-', '')}/30 shadow-sm` : 'border-border hover:border-border/80'
                  )} onClick={() => setExpandedStage(isExpanded ? null : stage.id)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stage.bgColor)}>
                          <StageIcon className={cn('h-5 w-5', stage.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold">
                              Stage {stage.number}
                            </Badge>
                            <CardTitle className="text-sm">{stage.title}</CardTitle>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{stage.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">
                            <Clock className="h-2.5 w-2.5 mr-1" />
                            SLA: {stage.slaTarget}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px]">
                            {stage.conversionBenchmark}
                          </Badge>
                          <ChevronRight className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            isExpanded && 'rotate-90'
                          )} />
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="space-y-2 mt-2">
                          {stage.actions.map((action, ai) => (
                            <motion.div
                              key={ai}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: ai * 0.06 }}
                              className={cn(
                                'p-3 rounded-lg border',
                                action.priority === 'critical' ? 'bg-destructive/3 border-destructive/10' :
                                action.priority === 'high' ? 'bg-primary/3 border-primary/10' :
                                'bg-muted/15 border-border/30'
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                                  action.priority === 'critical' ? 'bg-destructive' :
                                  action.priority === 'high' ? 'bg-primary' : 'bg-muted-foreground'
                                )} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-semibold text-foreground">{action.action}</p>
                                    <Badge variant="outline" className={cn(
                                      'text-[8px] px-1 py-0 h-3.5',
                                      action.priority === 'critical' ? 'text-destructive border-destructive/30' :
                                      action.priority === 'high' ? 'text-primary border-primary/30' :
                                      'text-muted-foreground border-border'
                                    )}>
                                      {action.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{action.detail}</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-2.5 w-2.5" /> {action.timeframe}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                      <Users className="h-2.5 w-2.5" /> {action.owner}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ TRACKING TAB ═══ */}
          <TabsContent value="tracking" className="space-y-4">
            {/* Pipeline Tags */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CircleDot className="h-4 w-4 text-primary" />
                  Deal Pipeline Stage Tagging
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-[11px] text-muted-foreground mb-3">
                  Every inquiry is tagged with its current pipeline stage for real-time visibility and SLA enforcement.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { tag: 'New Inquiry', color: 'bg-primary/10 text-primary border-primary/20', icon: MessageSquare, count: 18 },
                    { tag: 'Qualified', color: 'bg-chart-2/10 text-chart-2 border-chart-2/20', icon: Search, count: 14 },
                    { tag: 'Offer Sent', color: 'bg-chart-4/10 text-chart-4 border-chart-4/20', icon: Send, count: 10 },
                    { tag: 'Closing', color: 'bg-chart-5/10 text-chart-5 border-chart-5/20', icon: Gavel, count: 5 },
                  ].map((t, i) => {
                    const TagIcon = t.icon;
                    return (
                      <div key={i} className={cn('p-3 rounded-lg border flex items-center gap-2', t.color)}>
                        <TagIcon className="h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold">{t.tag}</p>
                          <p className="text-[10px] opacity-70">{t.count} deals</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Closing Timeline Estimator */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Expected Closing Timeline Estimates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {[
                  { type: 'Cash Purchase', timeline: '14–21 days', stages: 'Offer → Legal → Handover', probability: 'High' },
                  { type: 'KPR / Mortgage', timeline: '30–60 days', stages: 'Offer → Bank Approval → Legal → Handover', probability: 'Medium' },
                  { type: 'Developer Pre-Sale', timeline: '7–14 days', stages: 'Booking → NUP → PPJB Signing', probability: 'High' },
                  { type: 'Complex Negotiation', timeline: '21–45 days', stages: 'Counter-Offer Cycles → Agreement → Legal', probability: 'Variable' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/15 border border-border/30">
                    <Timer className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">{t.type}</p>
                        <Badge variant="outline" className="text-[9px]">{t.timeline}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.stages}</p>
                    </div>
                    <Badge variant="secondary" className={cn(
                      'text-[9px]',
                      t.probability === 'High' ? 'bg-chart-2/10 text-chart-2' :
                      t.probability === 'Medium' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {t.probability}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SLA Enforcement */}
            <Card className="border border-destructive/10 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  SLA Breach Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {[
                    { rule: 'Inquiry not responded within 2 hours', trigger: 'Auto-escalate to team lead', severity: 'Critical' },
                    { rule: 'Qualification stale for 5+ days', trigger: 'Send re-engagement prompt to agent', severity: 'Warning' },
                    { rule: 'Offer with no counter-response for 48h', trigger: 'Notify agent + suggest follow-up script', severity: 'High' },
                    { rule: 'Closing documents pending 7+ days', trigger: 'Alert operations + legal team', severity: 'Warning' },
                  ].map((r, i) => (
                    <div key={i} className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border',
                      r.severity === 'Critical' ? 'bg-destructive/5 border-destructive/15' :
                      r.severity === 'High' ? 'bg-primary/5 border-primary/15' :
                      'bg-muted/15 border-border/30'
                    )}>
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                        r.severity === 'Critical' ? 'bg-destructive' :
                        r.severity === 'High' ? 'bg-primary' : 'bg-muted-foreground'
                      )} />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">{r.rule}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">→ {r.trigger}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        'text-[8px] flex-shrink-0',
                        r.severity === 'Critical' ? 'text-destructive border-destructive/30' :
                        r.severity === 'High' ? 'text-primary border-primary/30' :
                        'text-muted-foreground border-border'
                      )}>
                        {r.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PERFORMANCE TAB ═══ */}
          <TabsContent value="performance" className="space-y-4">
            {/* Weekly KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <KPICard icon={MessageSquare} label="New Inquiries" value={PIPELINE_METRICS.weeklyPerformance.newInquiries} sub="This week" />
              <KPICard icon={Search} label="Qualified" value={PIPELINE_METRICS.weeklyPerformance.qualifiedThisWeek} sub="This week" color="text-chart-2" />
              <KPICard icon={Send} label="Offers Sent" value={PIPELINE_METRICS.weeklyPerformance.offersSubmitted} sub="This week" color="text-chart-4" />
              <KPICard icon={CheckCircle2} label="Deals Closed" value={PIPELINE_METRICS.weeklyPerformance.dealsClosed} sub="This week" color="text-chart-5" />
              <KPICard icon={DollarSign} label="Revenue" value={`Rp ${(PIPELINE_METRICS.weeklyPerformance.revenue / 1e9).toFixed(1)}B`} sub="Closed value" color="text-primary" />
            </div>

            {/* Conversion Funnel */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Stage-to-Stage Conversion Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {[
                  { from: 'Inquiry', to: 'Qualified', rate: 67, benchmark: 65, count: '18 → 12' },
                  { from: 'Qualified', to: 'Offer', rate: 57, benchmark: 45, count: '14 → 8' },
                  { from: 'Offer', to: 'Closing', rate: 50, benchmark: 60, count: '10 → 5' },
                  { from: 'Closing', to: 'Completed', rate: 80, benchmark: 85, count: '5 → 4' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-32 flex-shrink-0">
                      <p className="text-[11px] font-medium text-foreground">{c.from} → {c.to}</p>
                      <p className="text-[9px] text-muted-foreground">{c.count}</p>
                    </div>
                    <div className="flex-1 h-6 bg-muted/20 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.rate}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={cn(
                          'h-full rounded-lg',
                          c.rate >= c.benchmark ? 'bg-chart-2/20' : 'bg-destructive/15'
                        )}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-[10px] font-bold text-foreground">{c.rate}%</span>
                      </div>
                    </div>
                    <div className="w-20 flex-shrink-0 text-right">
                      <Badge variant="outline" className={cn(
                        'text-[8px]',
                        c.rate >= c.benchmark ? 'text-chart-2 border-chart-2/30' : 'text-destructive border-destructive/30'
                      )}>
                        {c.rate >= c.benchmark ? '✓ Above' : '↓ Below'} {c.benchmark}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Review Checklist */}
            <Card className="border border-primary/10 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Weekly Conversion Review Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { item: 'Review all stale inquiries (> 48h without response)', responsible: 'Team Lead' },
                    { item: 'Analyze top drop-off stage and identify root cause', responsible: 'Operations' },
                    { item: 'Check agent response time averages vs SLA targets', responsible: 'Team Lead' },
                    { item: 'Follow up on all offers pending > 72 hours', responsible: 'Agents' },
                    { item: 'Review closing pipeline for documentation blockers', responsible: 'Legal Team' },
                    { item: 'Calculate weekly conversion rate and compare to benchmark', responsible: 'Analytics' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/10 border border-border/20">
                      <div className="w-5 h-5 rounded border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-muted-foreground">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground leading-snug">{c.item}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Owner: {c.responsible}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Impact */}
            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <PartyPopper className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Conversion Optimization Impact</p>
                    <p className="text-[11px] text-muted-foreground">
                      Improving inquiry→qualified conversion by 10% = ~{Math.round(PIPELINE_METRICS.weeklyPerformance.newInquiries * 0.1)} additional qualified leads/week, 
                      projected Rp {((PIPELINE_METRICS.weeklyPerformance.revenue * 0.1) / 1e6).toFixed(0)}M incremental monthly revenue
                    </p>
                  </div>
                  <Badge className="bg-chart-2 text-chart-2-foreground text-xs flex-shrink-0">+10% Goal</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function MetricChip({ icon: Icon, label, value, color = 'text-foreground' }: {
  icon: typeof Activity; label: string; value: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-muted/20 border border-border rounded-lg px-2.5 py-1.5">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn('text-xs font-bold', color)}>{value}</span>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, color = 'text-foreground' }: {
  icon: typeof Users; label: string; value: string | number; sub: string; color?: string;
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-3 w-3 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
        </div>
        <div className={cn('text-xl font-black', color)}>{value}</div>
        <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}
