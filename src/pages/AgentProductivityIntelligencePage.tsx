import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAgentProductivityIntelligence } from '@/hooks/useAgentProductivityIntelligence';
import {
  Zap, Target, Users, Trophy, AlertTriangle, ArrowRight,
  CheckCircle2, Gift, BarChart3, Shield, ChevronRight, Gauge,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  excellent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  good: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  caution: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400',
  high: 'bg-amber-500/15 text-amber-400',
  medium: 'bg-blue-500/15 text-blue-400',
  low: 'bg-emerald-500/15 text-emerald-400',
};

export default function AgentProductivityIntelligencePage() {
  const { signals, tiers, coachingAlerts, incentiveTriggers, leadAllocation, kpis, roadmap } = useAgentProductivityIntelligence();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Agent Productivity Intelligence
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Performance optimization engine for sales efficiency</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <Tabs defaultValue="scoring" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="scoring" className="text-xs">Scoring Model</TabsTrigger>
            <TabsTrigger value="tiers" className="text-xs">Agent Tiers</TabsTrigger>
            <TabsTrigger value="coaching" className="text-xs">Coaching</TabsTrigger>
            <TabsTrigger value="incentives" className="text-xs">Incentives</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">KPIs</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-xs">Roadmap</TabsTrigger>
          </TabsList>

          {/* Scoring Model */}
          <TabsContent value="scoring">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-primary" />
                  Agent Productivity Score — Weighted Model
                </CardTitle>
                <p className="text-xs text-muted-foreground">Composite score (0–100) calculated from 5 core signals</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {signals.map((sig, i) => (
                  <motion.div key={sig.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-border bg-muted/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{sig.signal}</span>
                      <Badge className="text-xs bg-primary/15 text-primary">{sig.weight}%</Badge>
                    </div>
                    <Progress value={sig.weight} className="h-1.5 mb-3" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="rounded border border-border bg-background/50 p-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-0.5">Benchmark</span>
                        <span className="text-[11px] text-foreground font-medium">{sig.benchmark}</span>
                      </div>
                      <div className="rounded border border-border bg-background/50 p-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-0.5">Measurement</span>
                        <span className="text-[11px] text-foreground">{sig.measurement}</span>
                      </div>
                      <div className="rounded border border-border bg-background/50 p-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-0.5">Impact</span>
                        <span className="text-[11px] text-foreground">{sig.impact}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Tiers + Lead Allocation */}
          <TabsContent value="tiers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tiers.map((t, i) => (
                <motion.div key={t.tier} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-border bg-card h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className={`w-4 h-4 ${t.color}`} />
                        <span className="text-sm font-bold text-foreground">{t.tier}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto">{t.range}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-3">{t.description}</p>
                      <div className="space-y-1">
                        {t.privileges.map((p, pi) => (
                          <div key={pi} className="flex items-start gap-1.5">
                            <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${t.color}`} />
                            <span className="text-[11px] text-foreground">{p}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Lead Allocation Rules by Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {['Agent Tier', 'Lead Priority', 'Max Concurrent', 'Reassign After'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leadAllocation.map((la, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-foreground">{la.agentTier}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{la.leadPriority}</td>
                          <td className="px-4 py-2.5 text-foreground">{la.maxConcurrent}</td>
                          <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{la.reassignAfter}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coaching Alerts */}
          <TabsContent value="coaching" className="space-y-3">
            {coachingAlerts.map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-semibold text-foreground">{alert.trigger}</span>
                      </div>
                      <Badge className={`text-[9px] ${priorityColors[alert.priority]}`}>{alert.priority}</Badge>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Condition</span>
                      <p className="text-[11px] text-foreground mt-0.5">{alert.condition}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Target className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recommendation</span>
                        </div>
                        <p className="text-[11px] text-foreground">{alert.recommendation}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Auto Action</span>
                        </div>
                        <p className="text-[11px] text-foreground">{alert.automatedAction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Incentives */}
          <TabsContent value="incentives" className="space-y-3">
            {incentiveTriggers.map((inc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{inc.event}</span>
                      <Badge variant="outline" className="text-[9px] ml-auto">{inc.frequency}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-0.5">Threshold</span>
                        <p className="text-[11px] text-foreground">{inc.threshold}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-primary/5 p-2.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-0.5">Reward</span>
                        <p className="text-[11px] text-primary font-medium">{inc.reward}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* KPIs */}
          <TabsContent value="kpis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kpis.map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-foreground">{kpi.label}</span>
                        </div>
                        <Badge className={`text-[9px] border ${statusColors[kpi.status]}`}>{kpi.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded border border-border bg-muted/10 p-2">
                          <span className="text-[10px] text-muted-foreground block">Benchmark</span>
                          <span className="text-[11px] text-foreground font-medium">{kpi.benchmark}</span>
                        </div>
                        <div className="rounded border border-border bg-primary/5 p-2">
                          <span className="text-[10px] text-muted-foreground block">Elite</span>
                          <span className="text-[11px] text-primary font-medium">{kpi.elite}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Roadmap */}
          <TabsContent value="roadmap" className="space-y-3">
            {roadmap.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{phase.phase}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{phase.title}</p>
                        <Badge variant="outline" className="text-[9px]">{phase.duration}</Badge>
                      </div>
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
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Success Metric</span>
                      </div>
                      <p className="text-[11px] text-foreground">{phase.successMetric}</p>
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
