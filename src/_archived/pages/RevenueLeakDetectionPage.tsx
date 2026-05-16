import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRevenueLeakDetection } from '@/hooks/useRevenueLeakDetection';
import {
  ShieldAlert, Target, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2,
  DollarSign, Bell, BarChart3, Shield, Zap, Handshake, CreditCard,
  Building2, Users, Wrench,
} from 'lucide-react';

const sevColors: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  medium: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const statusColors: Record<string, string> = {
  healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const effortColors: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400',
  medium: 'bg-amber-500/15 text-amber-400',
  high: 'bg-red-500/15 text-red-400',
};

const prioColors: Record<string, string> = {
  immediate: 'bg-red-500/15 text-red-400',
  short_term: 'bg-amber-500/15 text-amber-400',
  medium_term: 'bg-blue-500/15 text-blue-400',
};

const catIcons: Record<string, React.ReactNode> = {
  deals: <Handshake className="w-3.5 h-3.5" />,
  listings: <Building2 className="w-3.5 h-3.5" />,
  subscriptions: <Users className="w-3.5 h-3.5" />,
  vendors: <Wrench className="w-3.5 h-3.5" />,
  payments: <CreditCard className="w-3.5 h-3.5" />,
};

export default function RevenueLeakDetectionPage() {
  const { leaks, opportunities, correctiveActions, financialKPIs, alertRules, deployment, severityCounts, categories } = useRevenueLeakDetection();
  const [activeCat, setActiveCat] = useState<string>('all');

  const filteredLeaks = activeCat === 'all' ? leaks : leaks.filter(l => l.category === activeCat);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Revenue Leak Detection & Protection
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">AI-driven monetization protection intelligence</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Severity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['critical', 'high', 'medium', 'low'] as const).map(sev => (
            <Card key={sev} className="border-border bg-card">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{sev}</span>
                  <p className="text-lg font-bold text-foreground">{severityCounts[sev]}</p>
                </div>
                <Badge className={`text-[10px] border ${sevColors[sev]}`}>{sev}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="leaks" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="leaks" className="text-xs">Leak Signals</TabsTrigger>
            <TabsTrigger value="opportunities" className="text-xs">Opportunities</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">Financial KPIs</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
            <TabsTrigger value="deployment" className="text-xs">Roadmap</TabsTrigger>
          </TabsList>

          {/* Leak Signals */}
          <TabsContent value="leaks" className="space-y-3">
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant={activeCat === 'all' ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setActiveCat('all')}>All</Badge>
              {categories.map(cat => (
                <Badge key={cat} variant={activeCat === cat ? 'default' : 'outline'} className="cursor-pointer text-xs capitalize" onClick={() => setActiveCat(cat)}>
                  {cat}
                </Badge>
              ))}
            </div>
            {filteredLeaks.map((leak, i) => (
              <motion.div key={leak.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{catIcons[leak.category]}</span>
                        <span className="text-xs font-semibold text-foreground">{leak.signal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-[10px] bg-primary/15 text-primary">Weight: {leak.weight}%</Badge>
                        <Badge className={`text-[9px] border ${sevColors[leak.severity]}`}>{leak.severity}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Detection Logic</span>
                        </div>
                        <p className="text-[11px] text-foreground">{leak.detectionLogic}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Estimated Loss</span>
                        </div>
                        <p className="text-[11px] text-foreground">{leak.estimatedLoss}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Monetization Opportunities */}
          <TabsContent value="opportunities" className="space-y-3">
            {opportunities.map((opp, i) => (
              <motion.div key={opp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">{opp.opportunity}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{opp.category}</Badge>
                        <Badge className={`text-[9px] ${prioColors[opp.priority]}`}>{opp.priority.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="rounded border border-border bg-muted/10 p-2">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">Current State</span>
                        <span className="text-[11px] text-foreground">{opp.currentState}</span>
                      </div>
                      <div className="rounded border border-border bg-primary/5 p-2">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">Potential Revenue</span>
                        <span className="text-[11px] text-primary font-medium">{opp.potentialRevenue}</span>
                      </div>
                      <div className="rounded border border-border bg-muted/10 p-2">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">Action Required</span>
                        <span className="text-[11px] text-foreground">{opp.actionRequired}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Corrective Actions */}
          <TabsContent value="actions" className="space-y-3">
            {correctiveActions.map((act, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">{act.leakType}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] ${effortColors[act.implementationEffort]}`}>Effort: {act.implementationEffort}</Badge>
                        <Badge variant="outline" className="text-[9px]">{act.timeToImpact}</Badge>
                      </div>
                    </div>
                    <p className="text-[11px] text-foreground mb-2">{act.action}</p>
                    <div className="rounded-lg border border-border bg-primary/5 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Expected Recovery</span>
                      </div>
                      <p className="text-[11px] text-primary font-medium">{act.expectedRecovery}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Financial KPIs */}
          <TabsContent value="kpis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {financialKPIs.map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-foreground">{kpi.label}</span>
                        </div>
                        <Badge className={`text-[9px] border ${statusColors[kpi.status]}`}>{kpi.status}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-2">{kpi.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded border border-border bg-muted/10 p-2">
                          <span className="text-[10px] text-muted-foreground block">Benchmark</span>
                          <span className="text-[11px] text-foreground font-medium">{kpi.benchmark}</span>
                        </div>
                        <div className="rounded border border-border bg-muted/10 p-2">
                          <span className="text-[10px] text-muted-foreground block">Alert Threshold</span>
                          <span className="text-[11px] text-foreground">{kpi.alertThreshold}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Alert Rules */}
          <TabsContent value="alerts" className="space-y-3">
            {alertRules.map((rule, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{rule.name}</span>
                      </div>
                      <Badge className={`text-[9px] border ${sevColors[rule.severity]}`}>{rule.severity}</Badge>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Condition</span>
                      <p className="text-[11px] text-foreground mt-0.5">{rule.condition}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Bell className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Notification</span>
                        </div>
                        <p className="text-[11px] text-foreground">{rule.notification}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Auto Action</span>
                        </div>
                        <p className="text-[11px] text-foreground">{rule.autoAction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Deployment Roadmap */}
          <TabsContent value="deployment" className="space-y-3">
            {deployment.map((phase, i) => (
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
