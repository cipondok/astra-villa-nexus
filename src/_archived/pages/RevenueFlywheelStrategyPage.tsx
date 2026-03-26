import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRevenueFlywheelStrategy } from '@/hooks/useRevenueFlywheelStrategy';
import {
  RefreshCw, ArrowRight, Target, TrendingUp, Zap, Shield,
  DollarSign, BarChart3, Layers, Rocket, CheckCircle2,
} from 'lucide-react';

const pillarMeta: Record<string, { icon: React.ReactNode; accent: string }> = {
  transaction: { icon: <Zap className="w-3.5 h-3.5" />, accent: 'text-primary' },
  monetization: { icon: <DollarSign className="w-3.5 h-3.5" />, accent: 'text-primary' },
  value: { icon: <Target className="w-3.5 h-3.5" />, accent: 'text-primary' },
  reinvestment: { icon: <RefreshCw className="w-3.5 h-3.5" />, accent: 'text-primary' },
};

const effortBadge: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400',
  medium: 'bg-amber-500/15 text-amber-400',
  high: 'bg-red-500/15 text-red-400',
};

export default function RevenueFlywheelStrategyPage() {
  const { flywheelLoops, drivers, driversByPillar, compoundingKPIs, monetizationPriorities, scalingPhases, pillarLabels, pillars } = useRevenueFlywheelStrategy();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Revenue Flywheel Compounding Growth
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Self-reinforcing revenue system for accelerating marketplace monetization</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <Tabs defaultValue="flywheel" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
            <TabsTrigger value="flywheel" className="text-xs">Flywheel System</TabsTrigger>
            <TabsTrigger value="drivers" className="text-xs">Growth Drivers</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">Compounding KPIs</TabsTrigger>
            <TabsTrigger value="priorities" className="text-xs">Monetization Priority</TabsTrigger>
            <TabsTrigger value="scaling" className="text-xs">Scaling Phases</TabsTrigger>
          </TabsList>

          {/* Flywheel System Diagram */}
          <TabsContent value="flywheel" className="space-y-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Revenue Flywheel — 7-Stage Compounding Loop</span>
                </div>
                <div className="space-y-0">
                  {flywheelLoops.map((loop, i) => (
                    <motion.div key={loop.step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <div className="flex items-stretch gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{loop.step}</span>
                          </div>
                          {i < flywheelLoops.length - 1 && (
                            <div className="w-0.5 flex-1 bg-primary/20 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <span className="text-xs font-bold text-foreground">{loop.stage}</span>
                          <p className="text-[11px] text-foreground mt-0.5">{loop.action}</p>
                          <div className="rounded border border-border bg-muted/10 p-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">Output: </span>
                            <span className="text-[10px] text-foreground">{loop.output}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <ArrowRight className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-primary font-medium">Feeds → {loop.feedsInto}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary">Cycle Repeats — Each revolution produces more output than the previous</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Growth Drivers */}
          <TabsContent value="drivers" className="space-y-4">
            {pillars.map(pillar => (
              <div key={pillar} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={pillarMeta[pillar].accent}>{pillarMeta[pillar].icon}</span>
                  <span className="text-xs font-semibold text-foreground">{pillarLabels[pillar]}</span>
                  <Badge variant="outline" className="text-[9px]">{driversByPillar(pillar).length} levers</Badge>
                </div>
                {driversByPillar(pillar).map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-border bg-card">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-foreground">{d.lever}</span>
                          <Badge variant="outline" className="text-[9px]">{d.target}</Badge>
                        </div>
                        <p className="text-[10px] text-foreground mb-2">{d.mechanism}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="rounded border border-border bg-primary/5 p-2">
                            <span className="text-[10px] text-muted-foreground block">Compounding Effect</span>
                            <span className="text-[10px] text-primary font-medium">{d.compoundingEffect}</span>
                          </div>
                          <div className="rounded border border-border bg-muted/10 p-2">
                            <span className="text-[10px] text-muted-foreground block">KPI</span>
                            <span className="text-[10px] text-foreground">{d.kpi}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ))}
          </TabsContent>

          {/* Compounding KPIs */}
          <TabsContent value="kpis" className="space-y-3">
            {compoundingKPIs.map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{kpi.metric}</span>
                      </div>
                      <Badge className="text-[9px] bg-primary/15 text-primary">{kpi.compoundRate}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[
                        { label: 'M1', value: kpi.month1 },
                        { label: 'M3', value: kpi.month3 },
                        { label: 'M6', value: kpi.month6 },
                        { label: 'M12', value: kpi.month12 },
                      ].map(period => (
                        <div key={period.label} className="rounded border border-border bg-muted/10 p-2 text-center">
                          <span className="text-[10px] text-muted-foreground block">{period.label}</span>
                          <span className="text-[11px] font-bold text-foreground">{period.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <span className="text-[10px] text-muted-foreground">Driver: </span>
                      <span className="text-[10px] text-foreground">{kpi.driver}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Monetization Priority */}
          <TabsContent value="priorities" className="space-y-3">
            {monetizationPriorities.map((mp, i) => (
              <motion.div key={mp.rank} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">#{mp.rank}</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">{mp.stream}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`text-[9px] ${effortBadge[mp.effort]}`}>Effort: {mp.effort}</Badge>
                        <Badge variant="outline" className="text-[9px]">{mp.timeToImpact}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="rounded border border-border bg-muted/10 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Current</span>
                        <span className="text-[11px] font-medium text-foreground">{mp.currentRevenue}</span>
                      </div>
                      <div className="rounded border border-border bg-primary/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Target (M6)</span>
                        <span className="text-[11px] font-bold text-primary">{mp.targetRevenue}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-foreground mb-2">{mp.action}</p>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <RefreshCw className="w-3 h-3 text-primary" />
                        <span className="text-[10px] text-muted-foreground font-medium">Flywheel Link</span>
                      </div>
                      <span className="text-[10px] text-primary">{mp.flywheelLink}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Scaling Phases */}
          <TabsContent value="scaling" className="space-y-3">
            {scalingPhases.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{phase.phase}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{phase.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px]">{phase.duration}</Badge>
                          <Badge className="text-[9px] bg-primary/15 text-primary">{phase.revenueTarget}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-primary/5 p-2.5 mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Focus</span>
                      <p className="text-[11px] text-foreground mt-0.5">{phase.focus}</p>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.initiatives.map((init, ii) => (
                        <div key={ii} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{init}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Exit Criteria</span>
                      </div>
                      <p className="text-[11px] text-foreground">{phase.exitCriteria}</p>
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
