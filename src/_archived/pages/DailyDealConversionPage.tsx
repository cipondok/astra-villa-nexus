import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDailyDealConversion } from '@/hooks/useDailyDealConversion';
import {
  Target, TrendingUp, TrendingDown, Minus, DollarSign, AlertTriangle,
  Clock, Users, Zap, Shield, ArrowRight, CheckCircle2, BarChart3,
  Activity, Eye,
} from 'lucide-react';

const trendIcon = (t: string) =>
  t === 'up' || t === 'improving' || t === 'exceeded' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> :
  t === 'down' || t === 'declining' ? <TrendingDown className="w-3 h-3 text-red-400" /> :
  <Minus className="w-3 h-3 text-muted-foreground" />;

const severityStyle: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const statusStyle: Record<string, string> = {
  on_track: 'bg-emerald-500/15 text-emerald-400',
  at_risk: 'bg-red-500/15 text-red-400',
  exceeded: 'bg-primary/15 text-primary',
};

const thresholdColor: Record<string, string> = {
  green: 'bg-emerald-500/15 text-emerald-400',
  yellow: 'bg-amber-500/15 text-amber-400',
  red: 'bg-red-500/15 text-red-400',
};

export default function DailyDealConversionPage() {
  const {
    pipelineStages, conversionMetrics, revenueSnapshots, dealAlerts,
    agentScores, reviewRituals, alertThresholds, priorityRules,
    totalPipelineValue, totalActiveDeals,
  } = useDailyDealConversion();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Daily Deal Conversion Tracker
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-border bg-primary/5 px-3 py-1.5 text-center">
                <span className="text-[10px] text-muted-foreground block">Active Deals</span>
                <span className="text-sm font-bold text-primary">{totalActiveDeals}</span>
              </div>
              <div className="rounded-lg border border-border bg-emerald-500/5 px-3 py-1.5 text-center">
                <span className="text-[10px] text-muted-foreground block">Pipeline Value</span>
                <span className="text-sm font-bold text-emerald-400">{totalPipelineValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <Tabs defaultValue="pipeline" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
            <TabsTrigger value="pipeline" className="text-xs">Pipeline</TabsTrigger>
            <TabsTrigger value="conversion" className="text-xs">Conversion</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">Deal Alerts</TabsTrigger>
            <TabsTrigger value="scoreboard" className="text-xs">Scoreboard</TabsTrigger>
            <TabsTrigger value="ritual" className="text-xs">Review Ritual</TabsTrigger>
          </TabsList>

          {/* Pipeline Status */}
          <TabsContent value="pipeline" className="space-y-3">
            {pipelineStages.map((stage, i) => (
              <motion.div key={stage.stage} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {trendIcon(stage.trend)}
                        <Badge variant="outline" className="text-[9px]">{stage.avgDaysInStage}d avg</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded border border-border bg-primary/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Deals</span>
                        <span className="text-sm font-bold text-primary">{stage.count}</span>
                      </div>
                      <div className="rounded border border-border bg-emerald-500/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Value</span>
                        <span className="text-sm font-bold text-emerald-400">{stage.value}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Conversion Efficiency */}
          <TabsContent value="conversion" className="space-y-3">
            {conversionMetrics.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">{m.label}</span>
                      <div className="flex items-center gap-1.5">
                        {trendIcon(m.trend)}
                        <Badge variant="outline" className="text-[9px]">{m.trend}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-primary">{m.rate}%</span>
                      <span className="text-[11px] text-muted-foreground">target: {m.target}%</span>
                      <Badge className={`text-[9px] ${m.rate >= m.target ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {m.rate >= m.target ? 'Above target' : 'Below target'}
                      </Badge>
                    </div>
                    <Progress value={m.rate} className="h-2 mb-1.5" />
                    <span className="text-[10px] text-muted-foreground">{m.volume}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Alert Thresholds */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">KPI Alert Thresholds</span>
                </div>
                <div className="space-y-2">
                  {alertThresholds.map((t, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/5 p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-foreground">{t.metric}</span>
                        <Badge className={`text-[9px] border ${thresholdColor[t.currentStatus]}`}>{t.currentStatus}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="rounded bg-emerald-500/5 p-1.5 text-center">
                          <span className="text-[9px] text-emerald-400 font-medium">🟢 {t.green}</span>
                        </div>
                        <div className="rounded bg-amber-500/5 p-1.5 text-center">
                          <span className="text-[9px] text-amber-400 font-medium">🟡 {t.yellow}</span>
                        </div>
                        <div className="rounded bg-red-500/5 p-1.5 text-center">
                          <span className="text-[9px] text-red-400 font-medium">🔴 {t.red}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Forecast */}
          <TabsContent value="revenue" className="space-y-3">
            {revenueSnapshots.map((snap, i) => (
              <motion.div key={snap.metric} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">{snap.metric}</span>
                      <Badge className={`text-[9px] ${statusStyle[snap.status]}`}>{snap.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-lg font-bold text-primary mb-1.5">{snap.value}</p>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <span className="text-[11px] text-foreground">{snap.detail}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Priority Rules */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Deal Prioritization Decision Guide</span>
                </div>
                <div className="space-y-2.5">
                  {priorityRules.map((rule) => (
                    <div key={rule.priority} className="rounded-lg border border-border bg-muted/5 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-primary">P{rule.priority}</span>
                        </div>
                        <span className="text-[11px] font-medium text-foreground">{rule.condition}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-7">
                        <div className="rounded border border-border bg-primary/5 p-2">
                          <span className="text-[10px] text-muted-foreground block">Action</span>
                          <span className="text-[11px] text-primary">{rule.action}</span>
                        </div>
                        <div className="rounded border border-border bg-muted/10 p-2">
                          <span className="text-[10px] text-muted-foreground block">Escalation</span>
                          <span className="text-[11px] text-foreground">{rule.escalation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deal Alerts */}
          <TabsContent value="alerts" className="space-y-3">
            {dealAlerts.map((alert, i) => (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                        <span className="text-xs font-semibold text-foreground">{alert.dealName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`text-[9px] border ${severityStyle[alert.severity]}`}>{alert.severity}</Badge>
                        <Badge variant="outline" className="text-[9px]">{alert.stalledDays}d stalled</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="rounded border border-border bg-emerald-500/5 p-2">
                        <span className="text-[10px] text-muted-foreground block">Deal Value</span>
                        <span className="text-xs font-bold text-emerald-400">{alert.value}</span>
                      </div>
                      <div className="rounded border border-border bg-muted/10 p-2">
                        <span className="text-[10px] text-muted-foreground block">Assigned Agent</span>
                        <span className="text-xs font-medium text-foreground">{alert.agent}</span>
                      </div>
                    </div>
                    <div className="rounded border border-border bg-red-500/5 p-2 mb-2">
                      <span className="text-[10px] text-muted-foreground block">Issue</span>
                      <span className="text-[11px] text-foreground">{alert.issue}</span>
                    </div>
                    <div className="rounded border border-border bg-primary/5 p-2">
                      <span className="text-[10px] text-muted-foreground block">Recommended Action</span>
                      <span className="text-[11px] text-primary font-medium">{alert.action}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Agent Scoreboard */}
          <TabsContent value="scoreboard" className="space-y-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Daily Agent Performance Scoreboard</span>
                </div>
                <div className="space-y-3">
                  {agentScores.sort((a, b) => b.score - a.score).map((agent, i) => (
                    <motion.div key={agent.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="rounded-lg border border-border bg-muted/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-amber-500/20' : 'bg-muted/20'}`}>
                              <span className="text-[10px] font-bold text-foreground">{i + 1}</span>
                            </div>
                            <span className="text-xs font-semibold text-foreground">{agent.name}</span>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-xs font-bold ${agent.score >= 85 ? 'bg-emerald-500/15 text-emerald-400' : agent.score >= 70 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                            {agent.score}/100
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="rounded border border-border bg-muted/10 p-1.5 text-center">
                            <span className="text-[9px] text-muted-foreground block">Follow-ups</span>
                            <span className="text-[11px] font-medium text-foreground">{agent.followUpsCompleted}/{agent.followUpsTotal}</span>
                          </div>
                          <div className="rounded border border-border bg-muted/10 p-1.5 text-center">
                            <span className="text-[9px] text-muted-foreground block">Completion</span>
                            <span className="text-[11px] font-medium text-primary">{Math.round(agent.followUpsCompleted / agent.followUpsTotal * 100)}%</span>
                          </div>
                          <div className="rounded border border-border bg-muted/10 p-1.5 text-center">
                            <span className="text-[9px] text-muted-foreground block">Progressed</span>
                            <span className="text-[11px] font-medium text-foreground">{agent.dealsProgressed} deals</span>
                          </div>
                          <div className="rounded border border-border bg-muted/10 p-1.5 text-center">
                            <span className="text-[9px] text-muted-foreground block">Resp. Time</span>
                            <span className={`text-[11px] font-medium ${parseInt(agent.responseTime) <= 30 ? 'text-emerald-400' : parseInt(agent.responseTime) <= 60 ? 'text-amber-400' : 'text-red-400'}`}>{agent.responseTime}</span>
                          </div>
                        </div>
                        <Progress value={agent.score} className="h-1 mt-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Ritual */}
          <TabsContent value="ritual" className="space-y-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Daily Operational Review Ritual</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">Non-negotiable daily rhythm for maintaining conversion momentum and deal pipeline health.</p>
                <div className="space-y-2.5">
                  {reviewRituals.map((r, i) => (
                    <motion.div key={r.time} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="rounded-lg border border-border bg-muted/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-12 rounded bg-primary/15 px-1.5 py-0.5 text-center">
                              <span className="text-[10px] font-bold text-primary">{r.time}</span>
                            </div>
                            <span className="text-xs font-semibold text-foreground">{r.activity}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px]">{r.duration}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-14">
                          <div className="rounded border border-border bg-muted/10 p-2">
                            <span className="text-[10px] text-muted-foreground block">Participants</span>
                            <span className="text-[11px] text-foreground">{r.participants}</span>
                          </div>
                          <div className="rounded border border-border bg-primary/5 p-2">
                            <span className="text-[10px] text-muted-foreground block">Expected Output</span>
                            <span className="text-[11px] text-primary">{r.output}</span>
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
