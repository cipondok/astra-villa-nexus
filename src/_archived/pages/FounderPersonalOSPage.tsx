import { motion } from 'framer-motion';
import {
  RefreshCw, Clock, Target, Shield, Compass, Zap,
  ArrowRight, CheckCircle2, Flag, Brain, Sun, Moon,
  Coffee, Dumbbell, Users, TrendingUp, Crown, Flame,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFounderPersonalOS } from '@/hooks/useFounderPersonalOS';
import { cn } from '@/lib/utils';

const CATEGORY_STYLE: Record<string, { bg: string; text: string; icon: typeof Zap }> = {
  'deep-work': { bg: 'bg-primary/10', text: 'text-primary', icon: Brain },
  'operations': { bg: 'bg-chart-4/10', text: 'text-chart-4', icon: Clock },
  'strategy': { bg: 'bg-chart-1/10', text: 'text-chart-1', icon: Compass },
  'recovery': { bg: 'bg-chart-2/10', text: 'text-chart-2', icon: Sun },
  'growth': { bg: 'bg-chart-3/10', text: 'text-chart-3', icon: TrendingUp },
};

const QUADRANT_STYLE: Record<string, string> = {
  'do-first': 'bg-destructive/15 text-destructive border-destructive/25',
  'schedule': 'bg-primary/15 text-primary border-primary/25',
  'delegate': 'bg-chart-4/15 text-chart-4 border-chart-4/25',
  'eliminate': 'bg-muted text-muted-foreground border-muted',
};

const HEALTH_STYLE: Record<string, string> = {
  healthy: 'bg-chart-2/20 text-chart-2',
  caution: 'bg-chart-4/20 text-chart-4',
  'burnout-risk': 'bg-destructive/20 text-destructive',
};

const STATUS_STYLE: Record<string, string> = {
  active: 'border-primary/30 bg-primary/5',
  upcoming: 'border-chart-4/20',
  future: 'border-muted',
};

const METRIC_DOT: Record<string, string> = {
  green: 'bg-chart-2',
  yellow: 'bg-chart-4',
  red: 'bg-destructive',
};

export default function FounderPersonalOSPage() {
  const data = useFounderPersonalOS();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Compass className="w-6 h-6 text-primary" />
              Founder Personal Operating System
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Sustainable high-performance framework — focus discipline, execution rhythm & long-term resilience</p>
          </div>
        </motion.div>

        {/* OS Health Metrics */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.osMetrics.map((m, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <div className={cn('w-2.5 h-2.5 rounded-full', METRIC_DOT[m.status])} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="routine" className="space-y-5">
          <TabsList className="bg-muted/50 flex-wrap h-auto">
            <TabsTrigger value="routine">Daily Routine</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Rhythm</TabsTrigger>
            <TabsTrigger value="priority">Priority Matrix</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="leadership">Leadership Roadmap</TabsTrigger>
          </TabsList>

          {/* ═══ DAILY ROUTINE ═══ */}
          <TabsContent value="routine">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Founder Daily Routine Template — Optimized for Peak Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {data.dailyRoutine.map((b, i) => {
                  const cat = CATEGORY_STYLE[b.category];
                  const CatIcon = cat.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-12 text-center shrink-0">
                        <p className="text-sm font-bold text-foreground">{b.time}</p>
                      </div>
                      <div className={cn('p-1.5 rounded-md shrink-0', cat.bg)}>
                        <CatIcon className={cn('w-4 h-4', cat.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-foreground">{b.activity}</span>
                          <Badge className={cn('text-[10px]', cat.bg, cat.text)}>{b.category}</Badge>
                          <Badge variant="outline" className="text-[10px]">{b.duration}min</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{b.description}</p>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0',
                        b.energy === 'peak' ? 'border-destructive/30 text-destructive' :
                        b.energy === 'sustained' ? 'border-primary/30 text-primary' : 'border-chart-2/30 text-chart-2'
                      )}>{b.energy}</Badge>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ WEEKLY RHYTHM ═══ */}
          <TabsContent value="weekly" className="space-y-4">
            {data.weeklyRhythm.map((d, di) => (
              <motion.div key={di} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.06 }}>
                <Card className="border-border/50">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-foreground">{d.day}</p>
                      <Badge className="bg-primary/10 text-primary text-[10px]">{d.theme}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {d.blocks.map((b, bi) => {
                        const cat = CATEGORY_STYLE[b.type] || CATEGORY_STYLE['deep-work'];
                        const CatIcon = cat.icon;
                        return (
                          <div key={bi} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
                            <div className={cn('p-1 rounded', cat.bg)}>
                              <CatIcon className={cn('w-3.5 h-3.5', cat.text)} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{b.task}</p>
                              <p className="text-[10px] text-muted-foreground">{b.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ═══ PRIORITY MATRIX ═══ */}
          <TabsContent value="priority">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Strategic Priority Decision Matrix — Revenue Impact × Effort
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['do-first', 'schedule', 'delegate', 'eliminate'].map(quadrant => {
                  const items = data.priorityMatrix.filter(p => p.quadrant === quadrant);
                  if (items.length === 0) return null;
                  return (
                    <div key={quadrant}>
                      <Badge className={cn('text-[10px] mb-2', QUADRANT_STYLE[quadrant])}>
                        {quadrant.replace('-', ' ').toUpperCase()}
                      </Badge>
                      {items.sort((a, b) => b.compositeScore - a.compositeScore).map((p, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className={cn('p-3 rounded-lg border mb-1.5', QUADRANT_STYLE[quadrant])}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{p.action}</span>
                              <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                            </div>
                            <span className="text-lg font-bold text-foreground">{p.compositeScore}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-1 rounded bg-background/50">
                              <p className="text-xs font-bold text-foreground">{p.revenueImpact}%</p>
                              <p className="text-[9px] text-muted-foreground">Revenue Impact</p>
                            </div>
                            <div className="text-center p-1 rounded bg-background/50">
                              <p className="text-xs font-bold text-foreground">{p.effort}%</p>
                              <p className="text-[9px] text-muted-foreground">Effort</p>
                            </div>
                            <div className="text-center p-1 rounded bg-background/50">
                              <p className="text-xs font-bold text-foreground">{p.urgency}%</p>
                              <p className="text-[9px] text-muted-foreground">Urgency</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ SUSTAINABILITY ═══ */}
          <TabsContent value="sustainability">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Performance Sustainability Guidelines — Burnout Prevention System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.sustainabilityRules.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-3.5 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-foreground">{r.principle}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{r.frequency}</Badge>
                        <Badge className={cn('text-[10px]', HEALTH_STYLE[r.status])}>{r.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{r.description}</p>
                    <div className="flex items-center gap-2 p-2 rounded bg-primary/5">
                      <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs font-medium text-primary">{r.indicator}</span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ LEADERSHIP ROADMAP ═══ */}
          <TabsContent value="leadership" className="space-y-4">
            {data.leadershipRoadmap.map((p, pi) => (
              <motion.div key={pi} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
                <Card className={cn('border', STATUS_STYLE[p.status])}>
                  <CardContent className="py-5 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          p.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                          {pi + 1}
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">{p.phase}</p>
                          <p className="text-xs text-muted-foreground">{p.timeline}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">{p.focus}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs font-semibold text-primary mb-1.5">Key Skills</p>
                        {p.skills.map((s, si) => (
                          <div key={si} className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-3 h-3 text-primary shrink-0" />
                            <span className="text-[11px] text-foreground">{s}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/20">
                        <p className="text-xs font-semibold text-chart-2 mb-1.5">Milestones</p>
                        {p.milestones.map((m, mi) => (
                          <div key={mi} className="flex items-center gap-1.5 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-chart-2 shrink-0" />
                            <span className="text-[11px] text-foreground">{m}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-lg bg-chart-4/5 border border-chart-4/20">
                        <p className="text-xs font-semibold text-chart-4 mb-1.5">Core Mindset</p>
                        <p className="text-[11px] text-foreground italic">&ldquo;{p.mindset}&rdquo;</p>
                      </div>
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
