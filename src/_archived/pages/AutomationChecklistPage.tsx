import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAutomationChecklist, AutomationStatus, AutomationPriority } from '@/hooks/useAutomationChecklist';
import {
  Bot, CheckCircle2, Circle, Loader2, Clock, Zap, Shield,
  ArrowRight, TrendingUp, Users, BarChart3, Workflow,
} from 'lucide-react';

const statusConfig: Record<AutomationStatus, { label: string; icon: React.ReactNode; badge: string }> = {
  deployed: { label: 'Deployed', icon: <CheckCircle2 className="w-4 h-4 text-primary" />, badge: 'bg-primary/15 text-primary border-primary/30' },
  in_progress: { label: 'In Progress', icon: <Loader2 className="w-4 h-4 text-accent-foreground animate-spin" />, badge: 'bg-accent/15 text-accent-foreground border-accent/30' },
  planned: { label: 'Planned', icon: <Clock className="w-4 h-4 text-muted-foreground" />, badge: 'bg-muted text-muted-foreground border-border' },
  not_started: { label: 'Not Started', icon: <Circle className="w-4 h-4 text-muted-foreground/40" />, badge: 'bg-muted/50 text-muted-foreground/60 border-border' },
};

const priorityColor: Record<AutomationPriority, string> = {
  P0: 'bg-destructive/15 text-destructive border-destructive/30',
  P1: 'bg-primary/15 text-primary border-primary/30',
  P2: 'bg-muted text-muted-foreground border-border',
  P3: 'bg-muted/50 text-muted-foreground/60 border-border',
};

const domainIcon: Record<string, React.ReactNode> = {
  'Deal Pipeline': <Workflow className="w-4 h-4" />,
  'Vendor Routing': <Users className="w-4 h-4" />,
  'Investor Intelligence': <Zap className="w-4 h-4" />,
  'Growth Monitoring': <BarChart3 className="w-4 h-4" />,
};

const anim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AutomationChecklistPage() {
  const { items, toggleStatus, domainStats, efficiencyKPIs, totalDeployed, totalItems, totalPct } = useAutomationChecklist();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Automation Deployment Checklist
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Sales · Vendor · Investor · Growth Automation</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{totalDeployed}<span className="text-sm text-muted-foreground font-normal"> / {totalItems}</span></p>
              <p className="text-[10px] text-muted-foreground">systems deployed</p>
            </div>
            <div className="w-28">
              <Progress value={totalPct} className="h-2.5" />
              <p className="text-[10px] text-muted-foreground text-center mt-0.5">{totalPct}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Domain Progress Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          {domainStats.map((d) => (
            <motion.div key={d.domain} variants={anim}>
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-primary">{domainIcon[d.domain]}</div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.domain}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{d.deployed}/{d.total}</p>
                  <Progress value={d.pct} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="checklist" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="checklist" className="text-xs">Deployment Checklist</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">Efficiency KPIs</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-xs">Scaling Roadmap</TabsTrigger>
          </TabsList>

          {/* ── Checklist ── */}
          <TabsContent value="checklist" className="space-y-4">
            {['Deal Pipeline', 'Vendor Routing', 'Investor Intelligence', 'Growth Monitoring'].map(domain => (
              <Card key={domain} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="text-primary">{domainIcon[domain]}</div>
                    {domain}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {items.filter(i => i.domain === domain).map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/20 transition-colors rounded px-2"
                      onClick={() => toggleStatus(item.id)}
                    >
                      <div className="shrink-0">{statusConfig[item.status].icon}</div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium ${item.status === 'deployed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {item.title}
                          </span>
                          <Badge variant="outline" className={`text-[9px] ${priorityColor[item.priority]}`}>{item.priority}</Badge>
                          <Badge variant="outline" className={`text-[9px] ${statusConfig[item.status].badge}`}>{statusConfig[item.status].label}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-right shrink-0 hidden md:block">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="font-medium">Trigger:</span> {item.trigger}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-primary">
                          <ArrowRight className="w-2.5 h-2.5" /> {item.kpiImpact}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── Efficiency KPIs ── */}
          <TabsContent value="kpis" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {efficiencyKPIs.map((kpi) => {
                const positive = kpi.improvement.startsWith('+');
                return (
                  <Card key={kpi.label} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{kpi.label}</span>
                        <Badge variant="outline" className="text-[10px]">{kpi.domain}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Before</p>
                          <p className="text-sm font-semibold text-muted-foreground">{kpi.before}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">After</p>
                          <p className="text-sm font-semibold text-foreground">{kpi.after}</p>
                        </div>
                        <Badge className={`ml-auto text-xs ${positive ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'}`}>
                          {kpi.improvement}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Roadmap ── */}
          <TabsContent value="roadmap" className="space-y-4">
            {[
              { phase: 1, title: 'Foundation Automation', weeks: '1–4', focus: 'Deploy critical P0 systems for deal pipeline and investor alerts', items: items.filter(i => i.phase === 1) },
              { phase: 2, title: 'Operational Scaling', weeks: '5–10', focus: 'Activate vendor routing, SLA monitoring, and growth anomaly detection', items: items.filter(i => i.phase === 2) },
              { phase: 3, title: 'Intelligence Autonomy', weeks: '11–16', focus: 'Enable AI-driven recommendations, churn prevention, and full autonomy', items: items.filter(i => i.phase === 3) },
            ].map((phase) => {
              const deployed = phase.items.filter(i => i.status === 'deployed').length;
              const pct = Math.round((deployed / phase.items.length) * 100);
              return (
                <Card key={phase.phase} className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Phase {phase.phase}: {phase.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px]">Weeks {phase.weeks}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{phase.focus}</p>
                  </CardHeader>
                  <CardContent>
                    <Progress value={pct} className="h-2 mb-3" />
                    <div className="space-y-1.5">
                      {phase.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 py-1">
                          {statusConfig[item.status].icon}
                          <span className="text-xs text-foreground flex-1">{item.title}</span>
                          <Badge variant="outline" className={`text-[9px] ${priorityColor[item.priority]}`}>{item.priority}</Badge>
                          <Badge variant="outline" className={`text-[9px] ${statusConfig[item.status].badge}`}>{statusConfig[item.status].label}</Badge>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">{deployed}/{phase.items.length} deployed ({pct}%)</p>
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
