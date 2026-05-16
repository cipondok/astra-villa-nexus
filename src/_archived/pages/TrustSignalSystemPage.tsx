import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTrustSignalSystem } from '@/hooks/useTrustSignalSystem';
import {
  ShieldCheck, Home, UserCheck, Wrench, Globe, BarChart3,
  ArrowRight, Target, CheckCircle2, MessageSquare, Heart,
  Layout, Sparkles, TrendingUp, Eye,
} from 'lucide-react';

const catMeta: Record<string, { icon: React.ReactNode; label: string }> = {
  listing: { icon: <Home className="w-4 h-4" />, label: 'Listing Signals' },
  agent: { icon: <UserCheck className="w-4 h-4" />, label: 'Agent Credibility' },
  vendor: { icon: <Wrench className="w-4 h-4" />, label: 'Vendor Quality' },
  platform: { icon: <Globe className="w-4 h-4" />, label: 'Platform Trust' },
};

const statusColors: Record<string, string> = {
  excellent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  good: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  caution: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const statusDot: Record<string, string> = {
  excellent: 'bg-emerald-400', good: 'bg-blue-400', caution: 'bg-amber-400', critical: 'bg-red-400',
};

export default function TrustSignalSystemPage() {
  const { signals, scoreComponents, credibilityMessages, loyaltyTriggers, trustKPIs, roadmapPhases, uiIndicators, categories } = useTrustSignalSystem();
  const [activeCat, setActiveCat] = useState<string>('listing');

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Trust Signal Strengthening System
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Credibility infrastructure for high-value transaction confidence</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="framework" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="framework" className="text-xs">Framework</TabsTrigger>
            <TabsTrigger value="score" className="text-xs">Trust Score</TabsTrigger>
            <TabsTrigger value="ui" className="text-xs">UI Design</TabsTrigger>
            <TabsTrigger value="messaging" className="text-xs">Messaging</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">KPIs</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-xs">Roadmap</TabsTrigger>
          </TabsList>

          {/* Framework */}
          <TabsContent value="framework" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <Card key={cat} className={`border cursor-pointer transition-all ${cat === activeCat ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/20'}`} onClick={() => setActiveCat(cat)}>
                  <CardContent className="p-3 flex items-center gap-2">
                    <span className="text-primary">{catMeta[cat].icon}</span>
                    <span className="text-xs font-medium text-foreground">{catMeta[cat].label}</span>
                    <Badge variant="outline" className="text-[9px] ml-auto">{signals.filter(s => s.category === cat).length}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {signals.filter(s => s.category === activeCat).map((sig, i) => (
              <motion.div key={sig.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{catMeta[sig.category].icon}</span>
                        <span className="text-sm font-semibold text-foreground">{sig.signal}</span>
                      </div>
                      <Badge className="text-[10px] bg-primary/15 text-primary">Weight: {sig.weight}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{sig.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Eye className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">UI Indicator</span>
                        </div>
                        <p className="text-[11px] text-foreground">{sig.indicator}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Conversion Impact</span>
                        </div>
                        <p className="text-[11px] text-foreground">{sig.conversionImpact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Trust Score Composition */}
          <TabsContent value="score">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Trust Confidence Score Composition
                </CardTitle>
                <p className="text-xs text-muted-foreground">Weighted composite scoring model (0-100)</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {scoreComponents.map((comp, i) => (
                  <motion.div key={comp.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-border bg-muted/10 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{comp.label}</span>
                      <Badge className="text-xs bg-primary/15 text-primary">{comp.weight}%</Badge>
                    </div>
                    <Progress value={comp.weight} className="h-1.5 mb-3" />
                    <div className="grid grid-cols-2 gap-1.5">
                      {comp.inputs.map((input, ii) => (
                        <div key={ii} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-muted-foreground">{input}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* UI Design Indicators */}
          <TabsContent value="ui">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uiIndicators.map((ind, i) => (
                <motion.div key={ind.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border-border bg-card h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Layout className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{ind.name}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-1.5">
                          <Badge variant="outline" className="text-[9px] shrink-0">Location</Badge>
                          <span className="text-[11px] text-muted-foreground">{ind.location}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Badge variant="outline" className="text-[9px] shrink-0">Visual</Badge>
                          <span className="text-[11px] text-muted-foreground">{ind.visual}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Badge variant="outline" className="text-[9px] shrink-0">Data</Badge>
                          <span className="text-[11px] text-muted-foreground">{ind.dataSource}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Credibility Messaging + Loyalty */}
          <TabsContent value="messaging" className="space-y-5">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Credibility Messaging Framework
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {['Context', 'Message', 'Placement', 'Trigger'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {credibilityMessages.map((msg, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-foreground">{msg.context}</td>
                          <td className="px-4 py-2.5 text-foreground italic">{msg.message}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{msg.placement}</td>
                          <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{msg.trigger}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Loyalty Reinforcement Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loyaltyTriggers.map((lt, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-lg border border-border bg-muted/10 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-foreground">{lt.event}</span>
                      <Badge variant="outline" className="text-[9px] ml-auto">{lt.timing}</Badge>
                    </div>
                    <p className="text-[11px] text-foreground mb-1.5">{lt.action}</p>
                    <Badge className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">{lt.expectedLift}</Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPIs */}
          <TabsContent value="kpis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trustKPIs.map(kpi => (
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

          {/* Roadmap */}
          <TabsContent value="roadmap" className="space-y-3">
            {roadmapPhases.map((phase, i) => (
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
                      <div className="flex items-center gap-1.5 mb-1">
                        <Target className="w-3 h-3 text-primary" />
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
