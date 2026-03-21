import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSixMonthSurvivalPlan, type PhaseId } from '@/hooks/useSixMonthSurvivalPlan';
import {
  Flame, BarChart3, TrendingUp, Shield, Target, CheckCircle2,
  AlertTriangle, Calendar, ChevronRight, Milestone, ArrowRight,
} from 'lucide-react';

const phaseIcons: Record<PhaseId, React.ReactNode> = {
  ignition: <Flame className="w-4 h-4" />,
  conversion: <BarChart3 className="w-4 h-4" />,
  stabilization: <TrendingUp className="w-4 h-4" />,
};

const statusBadge: Record<string, string> = {
  on_track: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  at_risk: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const likelihoodColor: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400', medium: 'bg-amber-500/15 text-amber-400', low: 'bg-emerald-500/15 text-emerald-400',
};

export default function SixMonthSurvivalPlanPage() {
  const { monthlyKPIs, weeklyChecklists, risks, milestones, phases } = useSixMonthSurvivalPlan();
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<PhaseId | 'all'>('all');
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (key: string) => {
    setCheckedTasks(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredWeeks = weeklyChecklists.filter(w =>
    selectedPhaseFilter === 'all' || w.phase === selectedPhaseFilter
  );

  const totalTasks = filteredWeeks.reduce((s, w) => s + w.tasks.length, 0);
  const completedTasks = filteredWeeks.reduce((s, w) =>
    s + w.tasks.filter((_, ti) => checkedTasks.has(`${w.week}-${ti}`)).length, 0
  );
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            6-Month Survival & Growth Execution Plan
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Disciplined path from ignition to scaling readiness</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Phase Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {phases.map(p => (
            <Card key={p.id} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={p.color}>{phaseIcons[p.id]}</span>
                  <span className="text-sm font-semibold text-foreground">{p.label}</span>
                </div>
                <Badge variant="outline" className="text-[10px]">{p.months}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="kpis" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="kpis" className="text-xs">Monthly KPIs</TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs">Weekly Checklist</TabsTrigger>
            <TabsTrigger value="risks" className="text-xs">Risk Framework</TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs">Milestones</TabsTrigger>
          </TabsList>

          {/* Monthly KPIs */}
          <TabsContent value="kpis" className="space-y-3">
            <div className="flex gap-1.5 flex-wrap">
              {[1,2,3,4,5,6].map(m => (
                <Badge key={m} variant={selectedMonth === m ? 'default' : 'outline'}
                  className="cursor-pointer text-xs" onClick={() => setSelectedMonth(m)}>
                  Month {m}
                </Badge>
              ))}
            </div>
            {monthlyKPIs.filter(k => k.month === selectedMonth).map(mk => {
              const phase = phases.find(p => p.id === mk.phase)!;
              return (
                <Card key={mk.month} className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className={phase.color}>{phaseIcons[mk.phase]}</span>
                      Month {mk.month}: {mk.label}
                      <Badge className={`text-[10px] ml-auto ${phase.bg} ${phase.color} border-0`}>{phase.label}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mk.kpis.map((kpi, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/10 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-foreground">{kpi.metric}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">{kpi.target}</span>
                          <Badge className={`text-[9px] border ${statusBadge[kpi.status]}`}>
                            {kpi.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Weekly Checklist */}
          <TabsContent value="checklist" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant={selectedPhaseFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer text-xs" onClick={() => setSelectedPhaseFilter('all')}>All</Badge>
                {phases.map(p => (
                  <Badge key={p.id} variant={selectedPhaseFilter === p.id ? 'default' : 'outline'}
                    className="cursor-pointer text-xs" onClick={() => setSelectedPhaseFilter(p.id)}>
                    {p.label}
                  </Badge>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <Progress value={overallPct} className="h-1.5" />

            {filteredWeeks.map(wk => {
              const phase = phases.find(p => p.id === wk.phase)!;
              const weekCompleted = wk.tasks.filter((_, ti) => checkedTasks.has(`${wk.week}-${ti}`)).length;
              return (
                <motion.div key={wk.week} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">Week {wk.week}</span>
                          <span className="text-[10px] text-muted-foreground">— {wk.focus}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px]">M{wk.month}</Badge>
                          <Badge className={`text-[9px] border-0 ${phase.bg} ${phase.color}`}>{phase.label}</Badge>
                          <span className="text-[10px] text-muted-foreground">{weekCompleted}/{wk.tasks.length}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {wk.tasks.map((task, ti) => {
                          const key = `${wk.week}-${ti}`;
                          const done = checkedTasks.has(key);
                          return (
                            <div key={ti} className={`flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${done ? 'bg-primary/5' : 'hover:bg-muted/20'}`}
                              onClick={() => toggleTask(key)}>
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${done ? 'text-primary' : 'text-muted-foreground/40'}`} />
                              <span className={`text-[11px] ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Risk Framework */}
          <TabsContent value="risks" className="space-y-3">
            {risks.map((risk, i) => {
              const phase = phases.find(p => p.id === risk.phase)!;
              return (
                <motion.div key={risk.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-foreground">{risk.risk}</span>
                        </div>
                        <Badge className={`text-[9px] border-0 ${phase.bg} ${phase.color}`}>{phase.label}</Badge>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <Badge className={`text-[9px] ${likelihoodColor[risk.likelihood]}`}>
                          Likelihood: {risk.likelihood}
                        </Badge>
                        <Badge className={`text-[9px] ${likelihoodColor[risk.impact]}`}>
                          Impact: {risk.impact}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Shield className="w-3 h-3 text-primary" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Mitigation</span>
                          </div>
                          <p className="text-[11px] text-foreground">{risk.mitigation}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <ArrowRight className="w-3 h-3 text-primary" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Contingency</span>
                          </div>
                          <p className="text-[11px] text-foreground">{risk.contingency}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Traction Milestones */}
          <TabsContent value="milestones" className="space-y-3">
            {phases.map(phase => {
              const phaseMilestones = milestones.filter(m => m.phase === phase.id);
              return (
                <div key={phase.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={phase.color}>{phaseIcons[phase.id]}</span>
                    <span className="text-sm font-semibold text-foreground">{phase.label}</span>
                    <Badge variant="outline" className="text-[10px]">{phase.months}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {phaseMilestones.map((ms, i) => (
                      <motion.div key={ms.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <Card className="border-border bg-card h-full">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <Milestone className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-semibold text-foreground">{ms.milestone}</span>
                              </div>
                              <Badge variant="outline" className="text-[9px]">M{ms.month}</Badge>
                            </div>
                            <p className="text-[11px] text-primary font-medium mb-1.5">{ms.target}</p>
                            <div className="rounded-lg border border-border bg-muted/10 p-2">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <ChevronRight className="w-3 h-3 text-primary" />
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Validation Signal</span>
                              </div>
                              <p className="text-[11px] text-foreground">{ms.validationSignal}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
