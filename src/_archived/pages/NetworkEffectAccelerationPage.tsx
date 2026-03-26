import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, Zap, TrendingUp, Users, ArrowRight, Target,
  CheckCircle2, Flag, Clock, Shield, BarChart3, Layers,
  ArrowUpRight, ChevronRight, Orbit, Repeat, Flame, Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNetworkEffectAcceleration, type FeedbackLoop } from '@/hooks/useNetworkEffectAcceleration';
import { cn } from '@/lib/utils';

const LOOP_COLORS = [
  { bg: 'bg-chart-1/10', border: 'border-chart-1/30', text: 'text-chart-1' },
  { bg: 'bg-chart-2/10', border: 'border-chart-2/30', text: 'text-chart-2' },
  { bg: 'bg-chart-3/10', border: 'border-chart-3/30', text: 'text-chart-3' },
  { bg: 'bg-chart-4/10', border: 'border-chart-4/30', text: 'text-chart-4' },
];

const STATUS_MAP: Record<FeedbackLoop['status'], { label: string; color: string; icon: typeof Flame }> = {
  dormant: { label: 'Dormant', color: 'bg-muted text-muted-foreground', icon: Clock },
  igniting: { label: 'Igniting', color: 'bg-chart-4/20 text-chart-4', icon: Flame },
  accelerating: { label: 'Accelerating', color: 'bg-chart-1/20 text-chart-1', icon: Zap },
  compounding: { label: 'Compounding', color: 'bg-chart-2/20 text-chart-2', icon: Orbit },
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'bg-chart-2/20 text-chart-2', medium: 'bg-chart-4/20 text-chart-4', low: 'bg-muted text-muted-foreground',
};

function scoreColor(s: number) {
  return s >= 70 ? 'text-chart-2' : s >= 40 ? 'text-chart-4' : 'text-destructive';
}

export default function NetworkEffectAccelerationPage() {
  const { data, isLoading, refetch } = useNetworkEffectAcceleration();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Orbit className="w-6 h-6 text-primary" />
              Network Effect Acceleration
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Multi-sided flywheel intelligence — compounding adoption loops across 5 marketplace sides</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Network Health</p>
              <p className={cn('text-3xl font-bold', scoreColor(data.networkHealthScore))}>{data.networkHealthScore}%</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </motion.div>

        {/* Active Sides Strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.activeSides.map((s, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{s.side}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-bold text-foreground">{s.count.toLocaleString()}</p>
                  <Badge className={cn('text-[10px]', s.growth > 0 ? 'bg-chart-2/20 text-chart-2' : 'bg-muted text-muted-foreground')}>
                    {s.growth > 0 ? '+' : ''}{s.growth}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="loops" className="space-y-5">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="loops">Feedback Loops</TabsTrigger>
            <TabsTrigger value="kpis">Multiplier KPIs</TabsTrigger>
            <TabsTrigger value="tactics">Acceleration Tactics</TabsTrigger>
            <TabsTrigger value="roadmap">Reinforcement Roadmap</TabsTrigger>
          </TabsList>

          {/* ═══ FEEDBACK LOOPS ═══ */}
          <TabsContent value="loops" className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {data.loops.map((loop, li) => {
                const c = LOOP_COLORS[li];
                const st = STATUS_MAP[loop.status];
                const StIcon = st.icon;
                const velPct = Math.min(100, Math.round((loop.currentVelocity / loop.targetVelocity) * 100));
                return (
                  <motion.div key={loop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: li * 0.08 }}>
                    <Card className={cn('border', c.border)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <div className={cn('p-1.5 rounded-md', c.bg)}>
                              <Repeat className={cn('w-4 h-4', c.text)} />
                            </div>
                            {loop.name}
                          </CardTitle>
                          <Badge className={cn('text-[10px] flex items-center gap-1', st.color)}>
                            <StIcon className="w-3 h-3" /> {st.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{loop.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Sides */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {loop.sides.map((s, si) => (
                            <span key={si} className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px]">{s}</Badge>
                              {si < loop.sides.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                            </span>
                          ))}
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-[10px]">{loop.sides[0]}</Badge>
                        </div>

                        {/* Velocity */}
                        <div className="p-2.5 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">Loop Velocity</span>
                            <span className="text-xs font-bold text-foreground">{loop.currentVelocity} / {loop.targetVelocity}</span>
                          </div>
                          <Progress value={velPct} className="h-2" />
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground">{velPct}% of target</span>
                            <span className="text-[10px] font-medium text-primary">Multiplier: {loop.multiplier.toFixed(2)}x</span>
                          </div>
                        </div>

                        {/* Signals */}
                        <div className="grid grid-cols-3 gap-2">
                          {loop.signals.map((sig, si) => (
                            <div key={si} className="p-2 rounded bg-muted/20 text-center">
                              <p className="text-sm font-bold text-foreground">{sig.value.toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground">{sig.label}</p>
                              <TrendingUp className={cn('w-3 h-3 mx-auto mt-0.5',
                                sig.trend === 'up' ? 'text-chart-2' : sig.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                              )} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══ MULTIPLIER KPIs ═══ */}
          <TabsContent value="kpis">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Growth Multiplier KPI Framework
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.multiplierKPIs.map((kpi, i) => {
                  const pct = Math.min(100, Math.round((kpi.value / kpi.target) * 100));
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{kpi.label}</p>
                          <p className="text-xs text-muted-foreground">{kpi.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className={cn('text-xl font-bold', scoreColor(pct))}>{kpi.value}{kpi.unit === '%' ? '%' : kpi.unit === 'x' ? 'x' : ` ${kpi.unit}`}</p>
                          <p className="text-[10px] text-muted-foreground">Target: {kpi.target}{kpi.unit === '%' ? '%' : kpi.unit === 'x' ? 'x' : ` ${kpi.unit}`}</p>
                        </div>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ACCELERATION TACTICS ═══ */}
          <TabsContent value="tactics">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Adoption Acceleration Tactics — Impact × Effort Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.tactics
                  .sort((a, b) => (a.impact === 'high' ? -3 : a.impact === 'medium' ? -1 : 0) + (a.effort === 'low' ? -2 : a.effort === 'medium' ? -1 : 0) - ((b.impact === 'high' ? -3 : b.impact === 'medium' ? -1 : 0) + (b.effort === 'low' ? -2 : b.effort === 'medium' ? -1 : 0)))
                  .map((t, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{t.tactic}</span>
                          <Badge className={cn('text-[10px]', IMPACT_COLORS[t.impact])}>Impact: {t.impact}</Badge>
                          <Badge variant="outline" className="text-[10px]">Effort: {t.effort}</Badge>
                          <Badge variant="outline" className="text-[10px]">Loop: {t.loop}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] text-muted-foreground">Track</p>
                        <p className="text-xs font-medium text-primary">{t.metric}</p>
                      </div>
                    </motion.div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ REINFORCEMENT ROADMAP ═══ */}
          <TabsContent value="roadmap" className="space-y-4">
            {data.roadmap.map((p, pi) => (
              <motion.div key={pi} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
                <Card className={cn('border',
                  p.status === 'active' ? 'border-primary/30 bg-primary/5' :
                  p.status === 'completed' ? 'border-chart-2/20 bg-chart-2/5' : 'border-muted')}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          p.status === 'completed' ? 'bg-chart-2/20 text-chart-2' :
                          p.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                          {pi + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{p.phase}</p>
                          <p className="text-xs text-muted-foreground">{p.timeline} — {p.objective}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-chart-2" /> :
                         p.status === 'active' ? <Zap className="w-4 h-4 text-primary" /> :
                         <Flag className="w-4 h-4 text-muted-foreground" />}
                        <Badge variant="outline" className="text-[10px]">{p.gate}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {p.tactics.map((t, ti) => (
                        <div key={ti} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                          <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                          <span className="text-xs text-foreground">{t}</span>
                        </div>
                      ))}
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
