import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useDealSprintExecution } from '@/hooks/useDealSprintExecution';
import {
  Zap, Target, Eye, MessageSquare, Trophy, BarChart3,
  AlertTriangle, ShieldAlert, Clock, ArrowRight, CheckCircle2,
  TrendingUp, Milestone,
} from 'lucide-react';

const phaseIcons = [Target, Eye, MessageSquare, Trophy];

const severityStyle: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  medium: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function DealSprintExecutionPage() {
  const { tasks, toggle, phases, phaseProgress, overallProgress, dealKPIs, escalationRules, trustMilestones } = useDealSprintExecution();
  const [activePhase, setActivePhase] = useState(1);

  const phaseTasks = tasks.filter(t => t.phase === activePhase);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                First 90 Deals Closing Sprint
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">30-day execution system for rapid deal volume traction</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sprint Progress</p>
                <p className="text-lg font-bold text-primary">{overallProgress}%</p>
              </div>
              <Progress value={overallProgress} className="w-24 h-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Phase Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {phases.map((p, i) => {
            const Icon = phaseIcons[i];
            const prog = phaseProgress(p.id);
            return (
              <Card
                key={p.id}
                className={`border cursor-pointer transition-all ${p.id === activePhase ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/20'}`}
                onClick={() => setActivePhase(p.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-bold text-foreground">Phase {p.id}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground mb-0.5">{p.title}</p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">{p.target}</span>
                    <Badge variant="outline" className="text-[9px]">{p.days}</Badge>
                  </div>
                  <Progress value={prog} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{prog}% complete</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="checklist" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="checklist" className="text-xs">Sprint Checklist</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">Deal KPIs</TabsTrigger>
            <TabsTrigger value="escalation" className="text-xs">Escalation Protocol</TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs">Trust Milestones</TabsTrigger>
          </TabsList>

          {/* ── Checklist ── */}
          <TabsContent value="checklist" className="space-y-2">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {React.createElement(phaseIcons[activePhase - 1], { className: 'w-4 h-4 text-primary' })}
                  Phase {activePhase}: {phases[activePhase - 1].title}
                  <Badge variant="outline" className="text-[10px] ml-auto">{phases[activePhase - 1].days}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {phaseTasks.map((task, i) => (
                  <motion.div key={task.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${task.done ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/10'}`}
                  >
                    <Checkbox checked={task.done} onCheckedChange={() => toggle(task.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-[9px]">{task.day}</Badge>
                      </div>
                      <p className={`text-xs ${task.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.task}</p>
                    </div>
                    {task.done && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Deal KPIs ── */}
          <TabsContent value="kpis">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Daily Deal Tracking KPI Template
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {['KPI', 'Daily Target', 'Weekly Target', 'Sprint Target', 'Formula'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dealKPIs.map((kpi, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-foreground">{kpi.label}</td>
                          <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{kpi.daily}</Badge></td>
                          <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{kpi.weekly}</Badge></td>
                          <td className="px-4 py-2.5"><Badge className="text-[10px] bg-primary/15 text-primary">{kpi.sprint}</Badge></td>
                          <td className="px-4 py-2.5 text-muted-foreground">{kpi.formula}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Escalation Protocol ── */}
          <TabsContent value="escalation" className="space-y-3">
            {(['critical', 'high', 'medium'] as const).map(sev => {
              const items = escalationRules.filter(r => r.severity === sev);
              if (!items.length) return null;
              return (
                <Card key={sev} className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {sev === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-400" /> : sev === 'high' ? <ShieldAlert className="w-4 h-4 text-amber-400" /> : <Clock className="w-4 h-4 text-blue-400" />}
                      {sev === 'critical' ? 'Critical' : sev === 'high' ? 'High Priority' : 'Medium Priority'} Escalations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.map((rule, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="rounded-lg border border-border bg-muted/10 p-3"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge className={`text-[9px] border ${severityStyle[rule.severity]}`}>{rule.severity.toUpperCase()}</Badge>
                          <span className="text-[11px] font-medium text-foreground">{rule.trigger}</span>
                        </div>
                        <p className="text-xs text-foreground mb-2">{rule.response}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-[9px]">{rule.owner}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> SLA: {rule.sla}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ── Trust Milestones ── */}
          <TabsContent value="milestones" className="space-y-3">
            {trustMilestones.map((m, i) => (
              <motion.div key={m.deals} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{m.deals}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{m.label}</p>
                        <p className="text-[11px] text-muted-foreground">{m.signal}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] ml-auto">{m.deals} deals</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Action</span>
                        </div>
                        <p className="text-[11px] text-foreground">{m.action}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Milestone className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Unlocks</span>
                        </div>
                        <p className="text-[11px] text-foreground">{m.unlocks}</p>
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
