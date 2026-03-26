import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFounderResilienceSystem } from '@/hooks/useFounderResilienceSystem';
import {
  Shield, Clock, AlertTriangle, Heart, Rocket,
  ArrowRight, Brain, Zap, Users, Coffee,
} from 'lucide-react';

const energyIcon: Record<string, React.ReactNode> = {
  focus: <Brain className="w-3 h-3" />,
  recovery: <Coffee className="w-3 h-3" />,
  strategic: <Zap className="w-3 h-3" />,
  social: <Users className="w-3 h-3" />,
};

const energyColor: Record<string, string> = {
  focus: 'bg-primary/15 text-primary',
  recovery: 'bg-emerald-500/15 text-emerald-400',
  strategic: 'bg-amber-500/15 text-amber-400',
  social: 'bg-blue-500/15 text-blue-400',
};

const severityStyle: Record<string, string> = {
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-orange-500/15 text-orange-400',
  critical: 'bg-destructive/15 text-destructive',
};

export default function FounderResilienceSystemPage() {
  const { dailyRoutine, stressIndicators, sustainabilityGuidelines, leadershipRoadmap, energyTypeLabels } = useFounderResilienceSystem();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Founder Resilience & Performance Sustainability
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Stress-resilient leadership system for sustained execution capacity</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="routine" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="routine" className="text-xs">Daily Routine</TabsTrigger>
            <TabsTrigger value="stress" className="text-xs">Stress Indicators</TabsTrigger>
            <TabsTrigger value="sustainability" className="text-xs">Sustainability</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-xs">Leadership Roadmap</TabsTrigger>
          </TabsList>

          {/* Daily Routine */}
          <TabsContent value="routine" className="space-y-0">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Circadian Execution Architecture</span>
                </div>
                {dailyRoutine.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="flex items-stretch gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-foreground">{r.time}</span>
                        </div>
                        {i < dailyRoutine.length - 1 && <div className="w-0.5 flex-1 bg-border my-1" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-bold text-foreground">{r.block}</span>
                          <Badge className={`text-[8px] ${energyColor[r.energyType]} flex items-center gap-0.5`}>
                            {energyIcon[r.energyType]} {energyTypeLabels[r.energyType]}
                          </Badge>
                          {r.duration !== '—' && <Badge variant="outline" className="text-[8px]">{r.duration}</Badge>}
                        </div>
                        <p className="text-[10px] text-foreground">{r.activity}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5 italic">{r.purpose}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stress Indicators */}
          <TabsContent value="stress" className="space-y-3">
            {stressIndicators.map((si, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">{si.signal}</span>
                      </div>
                      <Badge className={`text-[9px] ${severityStyle[si.severity]}`}>{si.severity}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="rounded border border-border bg-muted/10 p-2">
                        <span className="text-[9px] text-muted-foreground block mb-0.5 font-medium">Detection</span>
                        <span className="text-[10px] text-foreground">{si.detection}</span>
                      </div>
                      <div className="rounded border border-border bg-primary/5 p-2">
                        <span className="text-[9px] text-muted-foreground block mb-0.5 font-medium">Intervention</span>
                        <span className="text-[10px] text-primary">{si.intervention}</span>
                      </div>
                      <div className="rounded border border-border bg-muted/10 p-2">
                        <span className="text-[9px] text-muted-foreground block mb-0.5 font-medium">Threshold</span>
                        <span className="text-[10px] text-foreground">{si.threshold}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Sustainability Guidelines */}
          <TabsContent value="sustainability" className="space-y-3">
            {sustainabilityGuidelines.map((sg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground">{sg.domain}</span>
                      <Badge variant="outline" className="text-[9px]">{sg.metric}</Badge>
                    </div>
                    <div className="rounded-lg border border-border bg-primary/5 p-2.5 mb-3">
                      <span className="text-[10px] text-primary font-medium">{sg.principle}</span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {sg.practices.map((p, ii) => (
                        <div key={ii} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{p}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded border border-destructive/20 bg-destructive/5 p-2">
                      <span className="text-[9px] text-destructive font-medium">Anti-Pattern: </span>
                      <span className="text-[10px] text-foreground">{sg.antiPattern}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Leadership Roadmap */}
          <TabsContent value="roadmap" className="space-y-3">
            {leadershipRoadmap.map((phase, i) => (
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
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Focus</span>
                      <p className="text-[11px] text-foreground mt-0.5">{phase.focus}</p>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.capabilities.map((c, ii) => (
                        <div key={ii} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{c}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded border border-border bg-emerald-500/5 p-2">
                        <span className="text-[9px] text-emerald-500 font-medium block">Milestone</span>
                        <span className="text-[10px] text-foreground">{phase.milestone}</span>
                      </div>
                      <div className="rounded border border-border bg-amber-500/5 p-2">
                        <span className="text-[9px] text-amber-500 font-medium block">Risk to Manage</span>
                        <span className="text-[10px] text-foreground">{phase.riskToManage}</span>
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
