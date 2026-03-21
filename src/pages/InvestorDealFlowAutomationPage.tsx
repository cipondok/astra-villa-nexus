import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInvestorDealFlowAutomation } from '@/hooks/useInvestorDealFlowAutomation';
import {
  Workflow, Target, Users, Zap, BarChart3, Rocket,
  ArrowRight, Shield, Clock, Bell, AlertTriangle,
} from 'lucide-react';

const catIcon: Record<string, React.ReactNode> = {
  investor_profile: <Users className="w-3 h-3" />,
  behavior: <BarChart3 className="w-3 h-3" />,
  market: <Target className="w-3 h-3" />,
  urgency: <AlertTriangle className="w-3 h-3" />,
};

const prioStyle: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive',
  high: 'bg-amber-500/15 text-amber-400',
  medium: 'bg-primary/15 text-primary',
  low: 'bg-muted text-muted-foreground',
};

export default function InvestorDealFlowAutomationPage() {
  const {
    matchingSignals, totalSignalWeight, signalsByCategory,
    segmentRules, automationSequence, engagementKPIs, rolloutPhases,
    categories, categoryLabels,
  } = useInvestorDealFlowAutomation();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Workflow className="w-5 h-5 text-primary" />
            Investor Deal Flow Automation
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Intelligent opportunity matching & distribution system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="matching" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
            <TabsTrigger value="matching" className="text-xs">Matching Algorithm</TabsTrigger>
            <TabsTrigger value="segments" className="text-xs">Investor Segments</TabsTrigger>
            <TabsTrigger value="automation" className="text-xs">Automation Flow</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">Engagement KPIs</TabsTrigger>
            <TabsTrigger value="rollout" className="text-xs">Rollout Roadmap</TabsTrigger>
          </TabsList>

          {/* Matching Algorithm */}
          <TabsContent value="matching" className="space-y-4">
            {categories.map(cat => (
              <div key={cat} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary">{catIcon[cat]}</span>
                  <span className="text-xs font-semibold text-foreground">{categoryLabels[cat]}</span>
                  <Badge variant="outline" className="text-[9px]">
                    {signalsByCategory(cat).reduce((s, m) => s + m.weight, 0)}% weight
                  </Badge>
                </div>
                {signalsByCategory(cat).map((sig, i) => (
                  <motion.div key={sig.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-border bg-card">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-foreground">{sig.signal}</span>
                          <Badge className="text-[9px] bg-primary/15 text-primary">{sig.weight}%</Badge>
                        </div>
                        <p className="text-[10px] text-foreground mb-1.5">{sig.description}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-muted-foreground">Source:</span>
                          <code className="text-[9px] text-primary bg-primary/5 px-1 rounded">{sig.dataSource}</code>
                        </div>
                        <Progress value={(sig.weight / totalSignalWeight) * 100} className="h-1 mt-2" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ))}
          </TabsContent>

          {/* Investor Segments */}
          <TabsContent value="segments" className="space-y-3">
            {segmentRules.map((seg, i) => (
              <motion.div key={seg.segment} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">{seg.segment}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`text-[9px] ${prioStyle[seg.priority]}`}>{seg.priority}</Badge>
                        <Badge variant="outline" className="text-[9px]">{seg.estimatedSize}</Badge>
                      </div>
                    </div>
                    <div className="rounded border border-border bg-muted/10 p-2 mb-2">
                      <span className="text-[10px] text-muted-foreground">Criteria: </span>
                      <span className="text-[10px] text-foreground">{seg.criteria}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded border border-border bg-primary/5 p-2">
                        <span className="text-[10px] text-muted-foreground block">Deal Frequency</span>
                        <span className="text-[10px] text-primary font-medium">{seg.dealFrequency}</span>
                      </div>
                      <div className="rounded border border-border bg-muted/10 p-2">
                        <span className="text-[10px] text-muted-foreground block">Channels</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {seg.channels.map(ch => (
                            <Badge key={ch} variant="outline" className="text-[8px]">{ch}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Automation Flow */}
          <TabsContent value="automation" className="space-y-0">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">7-Step Automation Sequence</span>
                </div>
                {automationSequence.map((step, i) => (
                  <motion.div key={step.step} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-stretch gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{step.step}</span>
                        </div>
                        {i < automationSequence.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 my-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Bell className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{step.trigger}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-foreground block">{step.action}</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 mt-1.5">
                          <div className="rounded border border-border bg-muted/10 p-1.5 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[9px] text-foreground">{step.timing}</span>
                          </div>
                          <div className="rounded border border-border bg-primary/5 p-1.5">
                            <span className="text-[9px] text-primary">{step.channel}</span>
                          </div>
                          <div className="rounded border border-border bg-muted/10 p-1.5">
                            <span className="text-[9px] text-muted-foreground">Fallback: </span>
                            <span className="text-[9px] text-foreground">{step.fallback}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement KPIs */}
          <TabsContent value="kpis" className="space-y-3">
            {engagementKPIs.map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-foreground">{kpi.metric}</span>
                      <Badge className="text-[9px] bg-primary/15 text-primary">Weight {kpi.weight}%</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{kpi.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="rounded border border-border bg-muted/10 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Current</span>
                        <span className="text-[11px] font-medium text-foreground">{kpi.current}</span>
                      </div>
                      <div className="rounded border border-border bg-primary/5 p-2 text-center">
                        <span className="text-[10px] text-muted-foreground block">Target</span>
                        <span className="text-[11px] font-bold text-primary">{kpi.target}</span>
                      </div>
                    </div>
                    <Progress value={kpi.weight} className="h-1" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Rollout Roadmap */}
          <TabsContent value="rollout" className="space-y-3">
            {rolloutPhases.map((phase, i) => (
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
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Scope</span>
                      <p className="text-[11px] text-foreground mt-0.5">{phase.scope}</p>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.deliverables.map((d, ii) => (
                        <div key={ii} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{d}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Success Criteria</span>
                      </div>
                      <p className="text-[11px] text-foreground">{phase.successCriteria}</p>
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
