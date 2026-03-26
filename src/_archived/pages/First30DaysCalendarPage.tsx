import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirst30DaysCalendar } from '@/hooks/useFirst30DaysCalendar';
import {
  Calendar, Target, AlertTriangle, TrendingUp, CheckCircle2,
  Rocket, Users, ShoppingCart, BarChart3, Shield,
} from 'lucide-react';

const priorityStyle: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-primary/15 text-primary border-primary/30',
  medium: 'bg-muted text-muted-foreground border-border',
};

const categoryIcon: Record<string, React.ReactNode> = {
  Supply: <ShoppingCart className="w-3 h-3" />,
  Demand: <Users className="w-3 h-3" />,
  Conversion: <Target className="w-3 h-3" />,
  Revenue: <BarChart3 className="w-3 h-3" />,
  Growth: <TrendingUp className="w-3 h-3" />,
  Tech: <Rocket className="w-3 h-3" />,
  Review: <CheckCircle2 className="w-3 h-3" />,
};

const weekTheme = ['Supply Activation', 'Demand Generation', 'Conversion Momentum', 'Revenue Validation'];

export default function First30DaysCalendarPage() {
  const { tasks, toggle, weekProgress, overallProgress, milestones, risks } = useFirst30DaysCalendar();
  const [activeWeek, setActiveWeek] = useState(1);

  const weekTasks = tasks.filter(t => t.week === activeWeek);
  const days = [...new Set(weekTasks.map(t => t.day))].sort((a, b) => a - b);
  const wp = weekProgress(activeWeek);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              First 30 Days Launch Calendar
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Daily execution plan for marketplace ignition</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{overallProgress.done}<span className="text-sm text-muted-foreground font-normal"> / {overallProgress.total}</span></p>
              <p className="text-[10px] text-muted-foreground">tasks completed</p>
            </div>
            <div className="w-28">
              <Progress value={overallProgress.pct} className="h-2.5" />
              <p className="text-[10px] text-muted-foreground text-center mt-0.5">{overallProgress.pct}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Week Progress Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(w => {
            const p = weekProgress(w);
            const isActive = w === activeWeek;
            return (
              <Card
                key={w}
                className={`border cursor-pointer transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/20'}`}
                onClick={() => setActiveWeek(w)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Week {w}</span>
                    <span className="text-xs font-bold text-foreground">{p.pct}%</span>
                  </div>
                  <p className="text-xs font-medium text-foreground">{weekTheme[w - 1]}</p>
                  <Progress value={p.pct} className="h-1.5 mt-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{p.done}/{p.total} tasks</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="calendar" className="text-xs">Daily Calendar</TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs">Weekly KPI Milestones</TabsTrigger>
            <TabsTrigger value="risks" className="text-xs">Risk Mitigation</TabsTrigger>
          </TabsList>

          {/* ── Daily Calendar ── */}
          <TabsContent value="calendar" className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">Week {activeWeek}: {weekTheme[activeWeek - 1]}</Badge>
              <span className="text-xs text-muted-foreground">Days {days[0]}–{days[days.length - 1]}</span>
            </div>

            {days.map(day => {
              const dayTasks = weekTasks.filter(t => t.day === day);
              const allDone = dayTasks.every(t => t.completed);
              return (
                <Card key={day} className={`border ${allDone ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                  <CardHeader className="pb-1 pt-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Day {day}</span>
                      {allDone && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 space-y-0.5">
                    {dayTasks.map((task, i) => (
                      <motion.div
                        key={`${task.day}-${task.title}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-muted/20 rounded px-1 transition-colors"
                        onClick={() => toggle(task.day, task.title)}
                      >
                        <Checkbox checked={task.completed} className="shrink-0" />
                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                          {categoryIcon[task.category] || <Circle className="w-3 h-3" />}
                        </div>
                        <span className={`text-xs flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </span>
                        <Badge variant="outline" className={`text-[9px] shrink-0 ${priorityStyle[task.priority]}`}>
                          {task.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ── KPI Milestones ── */}
          <TabsContent value="milestones" className="space-y-3">
            {milestones.map((m) => (
              <Card key={m.week} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Week {m.week}: {m.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">Days {(m.week - 1) * 7 + 1}–{m.week * 7}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.theme}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {m.kpis.map((kpi) => (
                      <div key={kpi.label} className="rounded-lg border border-border p-3 bg-muted/10">
                        <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{kpi.target}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── Risk Mitigation ── */}
          <TabsContent value="risks" className="space-y-3">
            {[1, 2, 3, 4].map(w => {
              const weekRisks = risks.filter(r => r.week === w);
              if (!weekRisks.length) return null;
              return (
                <Card key={w} className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-destructive" />
                      Week {w} Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {weekRisks.map((r, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2 min-w-[220px]">
                          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${r.severity === 'high' ? 'text-destructive' : 'text-muted-foreground'}`} />
                          <span className="text-xs font-medium text-foreground">{r.risk}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex-1">{r.mitigation}</span>
                        <Badge variant="outline" className={`text-[9px] w-fit ${r.severity === 'high' ? 'border-destructive/30 text-destructive' : 'border-border text-muted-foreground'}`}>
                          {r.severity}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Circle({ className }: { className?: string }) {
  return <div className={`rounded-full bg-muted-foreground/30 ${className}`} style={{ width: 12, height: 12 }} />;
}
