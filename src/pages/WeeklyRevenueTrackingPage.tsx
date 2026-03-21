import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWeeklyRevenueTracking } from '@/hooks/useWeeklyRevenueTracking';
import {
  Banknote, CreditCard, Star, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle2, Clock, ArrowRight, BarChart3,
  CalendarDays, Zap, ShieldAlert, Info,
} from 'lucide-react';

const domainIcons: Record<string, React.ReactNode> = {
  'banknote': <Banknote className="w-4 h-4" />,
  'credit-card': <CreditCard className="w-4 h-4" />,
  'star': <Star className="w-4 h-4" />,
  'trending-up': <TrendingUp className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  excellent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  good: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  caution: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const statusDot: Record<string, string> = {
  excellent: 'bg-emerald-400',
  good: 'bg-blue-400',
  caution: 'bg-amber-400',
  critical: 'bg-red-400',
};

const priorityStyle: Record<string, string> = {
  P0: 'bg-red-500/15 text-red-400 border-red-500/30',
  P1: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  P2: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function WeeklyRevenueTrackingPage() {
  const { domains, correctiveActions, reviewRitual, thresholdGuide } = useWeeklyRevenueTracking();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly Revenue Performance Tracker
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Founder revenue monitoring & corrective action system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
            <TabsTrigger value="thresholds" className="text-xs">KPI Guide</TabsTrigger>
            <TabsTrigger value="ritual" className="text-xs">Review Ritual</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Corrective Actions</TabsTrigger>
          </TabsList>

          {/* ── Dashboard ── */}
          <TabsContent value="dashboard" className="space-y-5">
            {domains.map((domain, di) => (
              <motion.div key={domain.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-primary">{domainIcons[domain.icon]}</span>
                      {domain.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {domain.metrics.map((m, mi) => (
                        <div key={mi} className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
                            <div className={`w-2 h-2 rounded-full ${statusDot[m.status]}`} />
                          </div>
                          <div className="flex items-end justify-between">
                            <span className="text-lg font-bold text-foreground">{m.value}</span>
                            <div className="flex items-center gap-1">
                              {m.delta > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : m.delta < 0 ? <TrendingDown className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3 text-muted-foreground" />}
                              <span className={`text-[11px] font-medium ${m.delta > 0 ? 'text-emerald-400' : m.delta < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                {m.delta > 0 ? '+' : ''}{m.delta}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-[9px]">Target: {m.benchmark}</Badge>
                            <Badge className={`text-[9px] border ${statusColors[m.status]}`}>{m.status}</Badge>
                          </div>
                          <div className="flex items-start gap-1.5 pt-1 border-t border-border">
                            <Info className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{m.interpretation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── KPI Threshold Guide ── */}
          <TabsContent value="thresholds" className="space-y-3">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  KPI Threshold Interpretation Guide
                </CardTitle>
                <p className="text-xs text-muted-foreground">How to read status signals and respond appropriately</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {thresholdGuide.map((t) => (
                  <div key={t.status} className={`rounded-lg border p-4 ${statusColors[t.status]}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-3 h-3 rounded-full ${statusDot[t.status]}`} />
                      <span className="text-sm font-semibold uppercase tracking-wider">{t.label}</span>
                    </div>
                    <p className="text-xs opacity-80">{t.guidance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Per-domain benchmark reference */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Benchmark Reference Table</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {['Domain', 'Metric', 'Target', 'Status'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {domains.flatMap(d => d.metrics.map((m, i) => (
                        <tr key={`${d.id}-${i}`} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2 font-medium text-foreground">{i === 0 ? d.title : ''}</td>
                          <td className="px-4 py-2 text-foreground">{m.label}</td>
                          <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{m.benchmark}</Badge></td>
                          <td className="px-4 py-2"><Badge className={`text-[9px] border ${statusColors[m.status]}`}>{m.status}</Badge></td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Review Ritual ── */}
          <TabsContent value="ritual">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  Weekly Performance Review Ritual
                </CardTitle>
                <p className="text-xs text-muted-foreground">Structured cadence for disciplined revenue monitoring</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {reviewRitual.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/10 p-3"
                  >
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      {i < reviewRitual.length - 1 && <div className="w-px h-4 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-foreground">{step.time}</span>
                        <Badge variant="outline" className="text-[9px]">{step.duration}</Badge>
                      </div>
                      <p className="text-xs text-foreground font-medium">{step.activity}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <ArrowRight className="w-3 h-3 text-primary" />
                        <span className="text-[10px] text-muted-foreground">{step.output}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Corrective Actions ── */}
          <TabsContent value="actions" className="space-y-3">
            {(['P0', 'P1', 'P2'] as const).map(priority => {
              const items = correctiveActions.filter(a => a.priority === priority);
              if (!items.length) return null;
              return (
                <Card key={priority} className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {priority === 'P0' ? <AlertTriangle className="w-4 h-4 text-red-400" /> : priority === 'P1' ? <Zap className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      Priority {priority} — {priority === 'P0' ? 'Immediate Intervention' : priority === 'P1' ? 'Urgent Response' : 'Scheduled Optimization'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.map((action, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="rounded-lg border border-border bg-muted/10 p-3"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge className={`text-[9px] border ${priorityStyle[action.priority]}`}>{action.priority}</Badge>
                          <span className="text-[11px] font-medium text-foreground">{action.trigger}</span>
                        </div>
                        <p className="text-xs text-foreground mb-2">{action.action}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-[9px]">{action.owner}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {action.deadline}
                          </span>
                        </div>
                      </motion.div>
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
