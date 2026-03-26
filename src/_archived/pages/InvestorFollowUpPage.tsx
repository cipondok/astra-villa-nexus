import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInvestorFollowUpAutomation } from '@/hooks/useInvestorFollowUpAutomation';
import {
  Workflow, Eye, Bell, Briefcase, Clock, Send, ArrowRight,
  BarChart3, Rocket, Target, CheckCircle2, AlertTriangle,
  MessageSquare, Zap, GitBranch,
} from 'lucide-react';

const catIcon: Record<string, React.ReactNode> = {
  viewing: <Eye className="w-4 h-4" />,
  alert: <Bell className="w-4 h-4" />,
  portfolio: <Briefcase className="w-4 h-4" />,
  inactivity: <Clock className="w-4 h-4" />,
};

const catLabel: Record<string, string> = {
  viewing: 'Viewing Events',
  alert: 'Alert Interactions',
  portfolio: 'Portfolio Milestones',
  inactivity: 'Inactivity Detection',
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

const channelBadge: Record<string, string> = {
  WhatsApp: 'bg-emerald-500/15 text-emerald-400',
  Email: 'bg-blue-500/15 text-blue-400',
  Push: 'bg-purple-500/15 text-purple-400',
};

const nodeStyle: Record<string, { icon: React.ReactNode; bg: string }> = {
  trigger: { icon: <Zap className="w-3 h-3" />, bg: 'bg-primary/15 border-primary/30 text-primary' },
  condition: { icon: <GitBranch className="w-3 h-3" />, bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
  action: { icon: <Send className="w-3 h-3" />, bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
  delay: { icon: <Clock className="w-3 h-3" />, bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
};

export default function InvestorFollowUpPage() {
  const { triggers, sequences, engagementKPIs, rolloutPhases, workflowNodes, triggerCategories } = useInvestorFollowUpAutomation();
  const [activeCat, setActiveCat] = useState<string>('viewing');

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Workflow className="w-5 h-5 text-primary" />
            Investor Follow-Up Automation System
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Intelligent engagement workflows for investor nurture & conversion</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="workflow" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="workflow" className="text-xs">Workflow</TabsTrigger>
            <TabsTrigger value="triggers" className="text-xs">Triggers</TabsTrigger>
            <TabsTrigger value="sequences" className="text-xs">Sequences</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">KPIs</TabsTrigger>
            <TabsTrigger value="rollout" className="text-xs">Rollout</TabsTrigger>
          </TabsList>

          {/* Workflow Diagram */}
          <TabsContent value="workflow">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" />
                  Automation Workflow Architecture
                </CardTitle>
                <p className="text-xs text-muted-foreground">Event-driven engagement pipeline from trigger to response</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {workflowNodes.map((node, i) => {
                    const style = nodeStyle[node.type];
                    return (
                      <motion.div key={node.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                        <div className={`rounded-lg border p-2.5 ${style.bg}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {style.icon}
                            <Badge variant="outline" className="text-[8px]">{node.type}</Badge>
                          </div>
                          <p className="text-[11px] font-medium">{node.label}</p>
                          {node.next && (
                            <div className="flex items-center gap-1 mt-1">
                              <ArrowRight className="w-3 h-3 opacity-50" />
                              <span className="text-[9px] opacity-60">{node.next.length} path{node.next.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  {Object.entries(nodeStyle).map(([type, style]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded border ${style.bg}`} />
                      <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Triggers */}
          <TabsContent value="triggers" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {triggerCategories.map(cat => (
                <Card
                  key={cat}
                  className={`border cursor-pointer transition-all ${cat === activeCat ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/20'}`}
                  onClick={() => setActiveCat(cat)}
                >
                  <CardContent className="p-3 flex items-center gap-2">
                    <span className="text-primary">{catIcon[cat]}</span>
                    <span className="text-xs font-medium text-foreground">{catLabel[cat]}</span>
                    <Badge variant="outline" className="text-[9px] ml-auto">{triggers.filter(t => t.category === cat).length}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            {triggers.filter(t => t.category === activeCat).map((trigger, i) => (
              <motion.div key={trigger.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{catIcon[trigger.category]}</span>
                        <span className="text-sm font-semibold text-foreground">{trigger.event}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{trigger.delay}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{trigger.description}</p>
                    <div className="space-y-1.5">
                      {trigger.actions.map((action, ai) => (
                        <div key={ai} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Message Sequences */}
          <TabsContent value="sequences" className="space-y-4">
            {sequences.map((seq, si) => (
              <motion.div key={seq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        {seq.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px]">Trigger: {seq.trigger}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {seq.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-muted/10 p-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">D{step.day}</span>
                          </div>
                          {i < seq.steps.length - 1 && <div className="w-px h-3 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[9px] ${channelBadge[step.channel] || 'bg-muted text-muted-foreground'}`}>{step.channel}</Badge>
                            <span className="text-[10px] text-muted-foreground italic">{step.goal}</span>
                          </div>
                          <p className="text-[11px] text-foreground leading-relaxed">{step.message}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Engagement KPIs */}
          <TabsContent value="kpis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {engagementKPIs.map((kpi) => (
                <Card key={kpi.label} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusDot[kpi.status]}`} />
                        <span className="text-xs font-medium text-foreground">{kpi.label}</span>
                      </div>
                      <Badge className={`text-[10px] border ${statusColors[kpi.status]}`}>{kpi.benchmark}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{kpi.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rollout Roadmap */}
          <TabsContent value="rollout" className="space-y-3">
            {rolloutPhases.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{phase.phase}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{phase.title}</p>
                          <Badge variant="outline" className="text-[9px]">{phase.duration}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.deliverables.map((d, di) => (
                        <div key={di} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{d}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Target className="w-3 h-3 text-primary" />
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
