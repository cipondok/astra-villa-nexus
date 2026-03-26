import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useFounderWeeklyExecution } from '@/hooks/useFounderWeeklyExecution';
import {
  CalendarCheck, TrendingUp, TrendingDown, Minus, DollarSign,
  Droplets, Compass, ListChecks, Target, AlertTriangle, ArrowRight,
  CheckCircle2, Clock, BarChart3, Zap, Shield,
} from 'lucide-react';

const trendIcon = (t: string) =>
  t === 'up' || t === 'positive' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> :
  t === 'down' || t === 'negative' ? <TrendingDown className="w-3 h-3 text-red-400" /> :
  <Minus className="w-3 h-3 text-muted-foreground" />;

const statusBadge: Record<string, string> = {
  on_track: 'bg-emerald-500/15 text-emerald-400',
  exceeded: 'bg-primary/15 text-primary',
  at_risk: 'bg-amber-500/15 text-amber-400',
  behind: 'bg-amber-500/15 text-amber-400',
  blocked: 'bg-red-500/15 text-red-400',
};

const impactBadge: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400',
  high: 'bg-amber-500/15 text-amber-400',
  medium: 'bg-blue-500/15 text-blue-400',
};

const catBadge: Record<string, string> = {
  revenue: 'bg-emerald-500/15 text-emerald-400',
  growth: 'bg-primary/15 text-primary',
  operations: 'bg-amber-500/15 text-amber-400',
  team: 'bg-blue-500/15 text-blue-400',
};

const thresholdColor: Record<string, string> = {
  green: 'bg-emerald-500/15 text-emerald-400',
  yellow: 'bg-amber-500/15 text-amber-400',
  red: 'bg-red-500/15 text-red-400',
};

export default function FounderWeeklyExecutionPage() {
  const {
    revenueReview, liquiditySignals, strategicInitiatives, weeklyActions,
    kpiGuides, improvementRoadmap, reviewChecklist, checklistSections, checklistBySection,
  } = useFounderWeeklyExecution();

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const completionPct = reviewChecklist.length > 0
    ? Math.round((checked.size / reviewChecklist.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                Weekly Execution Discipline
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Founder performance control system — structured weekly review & action planning
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-border bg-primary/5 px-3 py-1.5 text-center">
                <span className="text-[10px] text-muted-foreground block">Review Progress</span>
                <span className="text-sm font-bold text-primary">{completionPct}%</span>
              </div>
              <div className="rounded-lg border border-border bg-emerald-500/5 px-3 py-1.5 text-center">
                <span className="text-[10px] text-muted-foreground block">Items Done</span>
                <span className="text-sm font-bold text-emerald-400">{checked.size}/{reviewChecklist.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <Tabs defaultValue="checklist" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full">
            <TabsTrigger value="checklist" className="text-xs">Review Checklist</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
            <TabsTrigger value="liquidity" className="text-xs">Liquidity</TabsTrigger>
            <TabsTrigger value="strategic" className="text-xs">Strategic</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Next Week</TabsTrigger>
            <TabsTrigger value="kpi" className="text-xs">KPI Guide</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-xs">Improvement</TabsTrigger>
          </TabsList>

          {/* Review Checklist */}
          <TabsContent value="checklist" className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Progress value={completionPct} className="flex-1 h-2" />
              <span className="text-xs font-medium text-primary">{completionPct}%</span>
            </div>
            {checklistSections.map(section => (
              <Card key={section} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">{section}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {checklistBySection(section).filter(c => checked.has(c.id)).length}/{checklistBySection(section).length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {checklistBySection(section).map((item) => (
                      <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/5 p-2.5">
                        <Checkbox
                          checked={checked.has(item.id)}
                          onCheckedChange={() => toggle(item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <span className={`text-[11px] font-medium ${checked.has(item.id) ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {item.item}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[9px] text-muted-foreground">{item.timing}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Revenue Momentum */}
          <TabsContent value="revenue" className="space-y-3">
            {revenueReview.map((item, i) => (
              <motion.div key={item.metric} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">{item.metric}</span>
                      <div className="flex items-center gap-1.5">
                        {trendIcon(item.trend)}
                        <Badge className={`text-[9px] ${statusBadge[item.status]}`}>{item.status.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="rounded border border-border bg-primary/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">This Week</span>
                        <span className="text-xs font-bold text-primary">{item.thisWeek}</span>
                      </div>
                      <div className="rounded border border-border bg-muted/10 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Last Week</span>
                        <span className="text-xs font-medium text-foreground">{item.lastWeek}</span>
                      </div>
                      <div className="rounded border border-border bg-emerald-500/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Target</span>
                        <span className="text-xs font-medium text-emerald-400">{item.target}</span>
                      </div>
                    </div>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <span className="text-[10px] text-muted-foreground">Insight: </span>
                      <span className="text-[11px] text-foreground">{item.insight}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Liquidity Growth */}
          <TabsContent value="liquidity" className="space-y-3">
            {liquiditySignals.map((signal, i) => (
              <motion.div key={signal.indicator} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">{signal.indicator}</span>
                      {trendIcon(signal.direction)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="rounded border border-border bg-primary/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Current</span>
                        <span className="text-sm font-bold text-primary">{signal.value}</span>
                      </div>
                      <div className="rounded border border-border bg-emerald-500/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Change</span>
                        <span className="text-xs font-medium text-emerald-400">{signal.change}</span>
                      </div>
                    </div>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <span className="text-[11px] text-foreground">{signal.interpretation}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Strategic Priority Alignment */}
          <TabsContent value="strategic" className="space-y-3">
            {strategicInitiatives.map((init, i) => (
              <motion.div key={init.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">{init.initiative}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`text-[9px] ${impactBadge[init.impact]}`}>{init.impact}</Badge>
                        <Badge className={`text-[9px] ${statusBadge[init.status]}`}>{init.status.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={init.progress} className="flex-1 h-2" />
                      <span className="text-xs font-bold text-primary">{init.progress}%</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                      <div className="rounded border border-border bg-emerald-500/5 p-2">
                        <span className="text-[10px] text-muted-foreground block">Revenue Impact</span>
                        <span className="text-[11px] text-emerald-400 font-medium">{init.revenueImpact}</span>
                      </div>
                      {init.bottleneck && (
                        <div className="rounded border border-border bg-red-500/5 p-2">
                          <span className="text-[10px] text-muted-foreground block">Bottleneck</span>
                          <span className="text-[11px] text-red-400">{init.bottleneck}</span>
                        </div>
                      )}
                    </div>
                    <div className="rounded border border-border bg-primary/5 p-2">
                      <span className="text-[10px] text-muted-foreground block">Next Action</span>
                      <span className="text-[11px] text-primary font-medium">{init.nextAction}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Next Week Actions */}
          <TabsContent value="actions" className="space-y-3">
            {weeklyActions.map((action, i) => (
              <motion.div key={action.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">P{action.priority}</span>
                        </div>
                        <span className="text-[11px] font-medium text-foreground">{action.action}</span>
                      </div>
                      <Badge className={`text-[9px] ${catBadge[action.category]}`}>{action.category}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 ml-8">
                      <div className="rounded border border-border bg-muted/10 p-1.5 text-center">
                        <span className="text-[9px] text-muted-foreground block">Owner</span>
                        <span className="text-[10px] text-foreground font-medium">{action.owner}</span>
                      </div>
                      <div className="rounded border border-border bg-primary/5 p-1.5 text-center">
                        <span className="text-[9px] text-muted-foreground block">Target</span>
                        <span className="text-[10px] text-primary font-medium">{action.target}</span>
                      </div>
                      <div className="rounded border border-border bg-muted/10 p-1.5 text-center">
                        <span className="text-[9px] text-muted-foreground block">Deadline</span>
                        <span className="text-[10px] text-foreground font-medium">{action.deadline}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* KPI Interpretation Guide */}
          <TabsContent value="kpi" className="space-y-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">KPI Interpretation Guide</span>
                </div>
                <div className="space-y-2.5">
                  {kpiGuides.map((kpi, i) => (
                    <motion.div key={kpi.kpi} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <div className="rounded-lg border border-border bg-muted/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground">{kpi.kpi}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Current:</span>
                            <span className="text-xs font-bold text-primary">{kpi.currentValue}</span>
                            <Badge className={`text-[9px] ${thresholdColor[kpi.currentStatus]}`}>{kpi.currentStatus}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mb-2">
                          <div className="rounded bg-emerald-500/5 p-1.5 text-center">
                            <span className="text-[9px] text-emerald-400 font-medium">🟢 {kpi.greenZone}</span>
                          </div>
                          <div className="rounded bg-amber-500/5 p-1.5 text-center">
                            <span className="text-[9px] text-amber-400 font-medium">🟡 {kpi.yellowZone}</span>
                          </div>
                          <div className="rounded bg-red-500/5 p-1.5 text-center">
                            <span className="text-[9px] text-red-400 font-medium">🔴 {kpi.redZone}</span>
                          </div>
                        </div>
                        <div className="rounded border border-border bg-muted/10 p-2">
                          <span className="text-[11px] text-foreground">{kpi.whatItMeans}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Improvement Roadmap */}
          <TabsContent value="roadmap" className="space-y-3">
            {improvementRoadmap.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{phase.duration}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px]">{phase.phase}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-primary/5 p-2.5 mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Focus</span>
                      <p className="text-[11px] text-foreground mt-0.5">{phase.focus}</p>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.actions.map((a, ai) => (
                        <div key={ai} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{a}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-emerald-500/5 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Expected Outcome</span>
                      </div>
                      <p className="text-[11px] text-emerald-400">{phase.outcome}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
