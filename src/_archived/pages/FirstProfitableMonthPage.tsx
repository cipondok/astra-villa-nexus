import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirstProfitableMonth } from '@/hooks/useFirstProfitableMonth';
import {
  TrendingUp, DollarSign, Scissors, Rocket, ArrowRight, Target,
  CheckCircle2, AlertTriangle, Clock, Zap, BarChart3, Shield,
} from 'lucide-react';

const catMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  deals: { label: 'High-Margin Deals', icon: <Target className="w-3.5 h-3.5" />, color: 'text-primary' },
  monetization: { label: 'Monetization', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'text-primary' },
  cost: { label: 'Cost Efficiency', icon: <Scissors className="w-3.5 h-3.5" />, color: 'text-primary' },
  momentum: { label: 'Momentum', icon: <Rocket className="w-3.5 h-3.5" />, color: 'text-primary' },
};

const effortBadge: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400',
  medium: 'bg-amber-500/15 text-amber-400',
  high: 'bg-red-500/15 text-red-400',
};

const prioBadge: Record<string, string> = {
  immediate: 'bg-red-500/15 text-red-400',
  short_term: 'bg-amber-500/15 text-amber-400',
  medium_term: 'bg-blue-500/15 text-blue-400',
};

const statusBadge: Record<string, string> = {
  not_ready: 'bg-red-500/15 text-red-400 border-red-500/30',
  approaching: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ready: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function FirstProfitableMonthPage() {
  const { levers, leversByCategory, weeklyKPIs, costOptimizations, scalingIndicators, milestonePhases, categories } = useFirstProfitableMonth();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            First Profitable Month Execution
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tactical framework to cross break-even and achieve net positive P&L</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <Tabs defaultValue="roadmap" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="roadmap" className="text-xs">Milestone Roadmap</TabsTrigger>
            <TabsTrigger value="levers" className="text-xs">Profit Levers</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">Weekly KPIs</TabsTrigger>
            <TabsTrigger value="costs" className="text-xs">Cost Optimization</TabsTrigger>
            <TabsTrigger value="scaling" className="text-xs">Scaling Readiness</TabsTrigger>
          </TabsList>

          {/* Milestone Roadmap */}
          <TabsContent value="roadmap" className="space-y-3">
            {milestonePhases.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{phase.phase}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{phase.title}</p>
                        <Badge variant="outline" className="text-[9px]">{phase.duration}</Badge>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-primary/5 p-2.5 mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Objective</span>
                      <p className="text-[11px] text-foreground mt-0.5">{phase.objective}</p>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.tactics.map((t, ti) => (
                        <div key={ti} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{t}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Exit Criteria</span>
                      </div>
                      <p className="text-[11px] text-foreground">{phase.exitCriteria}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Profit Levers */}
          <TabsContent value="levers" className="space-y-4">
            {categories.map(cat => (
              <div key={cat} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={catMeta[cat].color}>{catMeta[cat].icon}</span>
                  <span className="text-xs font-semibold text-foreground">{catMeta[cat].label}</span>
                  <Badge variant="outline" className="text-[9px]">{leversByCategory(cat).length} actions</Badge>
                </div>
                {leversByCategory(cat).map((lever, i) => (
                  <motion.div key={lever.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-border bg-card">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-medium text-foreground">{lever.action}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge className={`text-[9px] ${effortBadge[lever.effort]}`}>{lever.effort}</Badge>
                            <Badge variant="outline" className="text-[9px]">{lever.timeline}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="rounded border border-border bg-primary/5 p-2">
                            <span className="text-[10px] text-muted-foreground block">Impact</span>
                            <span className="text-[11px] text-primary font-medium">{lever.impact}</span>
                          </div>
                          <div className="rounded border border-border bg-muted/10 p-2">
                            <span className="text-[10px] text-muted-foreground block">KPI Target</span>
                            <span className="text-[11px] text-foreground">{lever.kpi}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ))}
          </TabsContent>

          {/* Weekly KPIs */}
          <TabsContent value="weekly" className="space-y-3">
            {weeklyKPIs.map((week, i) => (
              <motion.div key={week.week} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">W{week.week}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{week.label}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="rounded-lg border border-border bg-emerald-500/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Revenue Target</span>
                        <span className="text-xs font-bold text-emerald-400">{week.revenueTarget}</span>
                      </div>
                      <div className="rounded-lg border border-border bg-red-500/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Cost Ceiling</span>
                        <span className="text-xs font-bold text-red-400">{week.costCeiling}</span>
                      </div>
                      <div className="rounded-lg border border-border bg-primary/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Profit Target</span>
                        <span className="text-xs font-bold text-primary">{week.profitTarget}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-2">
                      {week.keyActions.map((a, ai) => (
                        <div key={ai} className="flex items-start gap-1.5">
                          <Zap className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{a}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <span className="text-[10px] text-muted-foreground">Milestone: </span>
                      <span className="text-[11px] text-foreground">{week.milestone}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Cost Optimization */}
          <TabsContent value="costs" className="space-y-3">
            {costOptimizations.map((cost, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{cost.area}</span>
                      </div>
                      <Badge className={`text-[9px] ${prioBadge[cost.priority]}`}>{cost.priority.replace('_', ' ')}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="rounded border border-border bg-red-500/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Current</span>
                        <span className="text-[11px] font-medium text-red-400">{cost.currentSpend}</span>
                      </div>
                      <div className="rounded border border-border bg-emerald-500/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Optimized</span>
                        <span className="text-[11px] font-medium text-emerald-400">{cost.optimizedSpend}</span>
                      </div>
                      <div className="rounded border border-border bg-primary/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Savings</span>
                        <span className="text-[11px] font-bold text-primary">{cost.savingsEstimate}</span>
                      </div>
                    </div>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <span className="text-[10px] text-muted-foreground block mb-0.5">Action</span>
                      <span className="text-[11px] text-foreground">{cost.action}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Scaling Readiness */}
          <TabsContent value="scaling" className="space-y-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Post Break-Even Scaling Indicators</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">These signals must be green before committing to aggressive growth spending after achieving profitability.</p>
                <div className="space-y-3">
                  {scalingIndicators.map((ind, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="rounded-lg border border-border bg-muted/5 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-foreground">{ind.signal}</span>
                          <Badge className={`text-[9px] border ${statusBadge[ind.status]}`}>{ind.status.replace('_', ' ')}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="rounded border border-border bg-muted/10 p-2">
                            <span className="text-[10px] text-muted-foreground block">Threshold</span>
                            <span className="text-[11px] text-primary font-medium">{ind.threshold}</span>
                          </div>
                          <div className="rounded border border-border bg-muted/10 p-2">
                            <span className="text-[10px] text-muted-foreground block">Significance</span>
                            <span className="text-[11px] text-foreground">{ind.meaning}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
