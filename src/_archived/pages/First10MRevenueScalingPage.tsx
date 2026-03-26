import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFirst10MRevenueScaling } from '@/hooks/useFirst10MRevenueScaling';
import {
  DollarSign, TrendingUp, Layers, Map, Target,
  ArrowRight, Zap, BarChart3, PieChart, RefreshCw,
  ChevronRight, Trophy, Rocket, Building2, Users,
} from 'lucide-react';

const phaseIcons = [Rocket, TrendingUp, Map, Trophy];
const phaseColors = ['text-chart-1', 'text-chart-2', 'text-chart-3', 'text-chart-4'];
const phaseBg = ['bg-chart-1/10', 'bg-chart-2/10', 'bg-chart-3/10', 'bg-chart-4/10'];

const anim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.35 } };

export default function First10MRevenueScalingPage() {
  const { phases, streams, benchmarks, reinvestment } = useFirst10MRevenueScaling();
  const [expandedPhase, setExpandedPhase] = useState<string | null>('ignition');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div {...anim} className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <DollarSign className="w-4 h-4" /> FIRST $10M REVENUE MASTER PLAN
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Revenue Scaling Execution Roadmap
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Structured 36-month path from early traction to $10M cumulative revenue through transaction scale, monetization depth, and market expansion.
          </p>
        </motion.div>

        {/* Cumulative Revenue Visual */}
        <motion.div {...anim} transition={{ delay: 0.1 }}>
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="w-5 h-5 text-primary" /> Revenue Milestone Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {benchmarks.filter((_, i) => i % 2 === 0).map((b, i) => (
                  <div key={b.quarter} className="text-center p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="text-xs text-muted-foreground font-medium">{b.quarter}</div>
                    <div className="text-lg font-bold text-foreground mt-1">{b.cumulative_revenue}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{b.key_milestone}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="phases" className="space-y-6">
          <TabsList className="grid grid-cols-4 max-w-xl mx-auto">
            <TabsTrigger value="phases" className="text-xs sm:text-sm"><Layers className="w-3.5 h-3.5 mr-1" />Phases</TabsTrigger>
            <TabsTrigger value="monetization" className="text-xs sm:text-sm"><PieChart className="w-3.5 h-3.5 mr-1" />Streams</TabsTrigger>
            <TabsTrigger value="benchmarks" className="text-xs sm:text-sm"><Target className="w-3.5 h-3.5 mr-1" />KPIs</TabsTrigger>
            <TabsTrigger value="reinvestment" className="text-xs sm:text-sm"><RefreshCw className="w-3.5 h-3.5 mr-1" />Capital</TabsTrigger>
          </TabsList>

          {/* PHASES */}
          <TabsContent value="phases">
            <AnimatePresence mode="wait">
              <motion.div {...anim} key="phases" className="space-y-4">
                {phases.map((phase, pi) => {
                  const Icon = phaseIcons[pi];
                  const isOpen = expandedPhase === phase.id;
                  return (
                    <Card key={phase.id} className={`cursor-pointer transition-all ${isOpen ? 'ring-2 ring-primary/30' : ''}`} onClick={() => setExpandedPhase(isOpen ? null : phase.id)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${phaseBg[pi]}`}><Icon className={`w-5 h-5 ${phaseColors[pi]}`} /></div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">{phase.phase}</Badge>
                                <span className="font-bold text-foreground">{phase.label}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span>{phase.timeline}</span>
                                <span className="font-semibold text-primary">{phase.cumulative_target}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </div>
                      </CardHeader>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                            <CardContent className="pt-0 space-y-5">
                              <p className="text-sm text-muted-foreground">{phase.description}</p>
                              <div className="grid md:grid-cols-3 gap-4">
                                {phase.pillars.map((p) => (
                                  <div key={p.name} className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" />{p.name}</h4>
                                    <ul className="space-y-1.5">
                                      {p.actions.map((a, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                          <ArrowRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />{a}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {phase.kpis.map((k) => (
                                  <div key={k.metric} className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-center">
                                    <div className="text-[10px] text-muted-foreground">{k.metric}</div>
                                    <div className="text-sm font-bold text-foreground">{k.target}</div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* MONETIZATION STREAMS */}
          <TabsContent value="monetization">
            <AnimatePresence mode="wait">
              <motion.div {...anim} key="mon" className="space-y-4">
                {streams.map((s, i) => (
                  <Card key={s.name}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">#{s.priority}</div>
                          <div>
                            <h4 className="font-semibold text-foreground">{s.name}</h4>
                            <p className="text-xs text-muted-foreground">{s.timeline} · ARPU: {s.arpu}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{s.current_contribution_pct}% → {s.target_contribution_pct}%</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Current Share</span><span>Target Share</span>
                        </div>
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: `${s.target_contribution_pct}%` }} />
                          <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all" style={{ width: `${s.current_contribution_pct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">Scaling Lever:</span> {s.scaling_lever}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* QUARTERLY BENCHMARKS */}
          <TabsContent value="benchmarks">
            <AnimatePresence mode="wait">
              <motion.div {...anim} key="bench">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/40">
                            {['Quarter', 'Cumulative', 'MRR', 'Deals/mo', 'Subscribers', 'Cities', 'Milestone'].map((h) => (
                              <th key={h} className="px-4 py-3 text-left font-semibold text-foreground text-xs whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {benchmarks.map((b, i) => (
                            <tr key={b.quarter} className={`border-b border-border/50 ${i === benchmarks.length - 1 ? 'bg-primary/5 font-semibold' : ''}`}>
                              <td className="px-4 py-3 font-medium text-foreground">{b.quarter}</td>
                              <td className="px-4 py-3 text-primary font-semibold">{b.cumulative_revenue}</td>
                              <td className="px-4 py-3 text-foreground">{b.mrr_target}</td>
                              <td className="px-4 py-3 text-foreground">{b.deals_per_month}</td>
                              <td className="px-4 py-3 text-foreground">{b.active_subscribers.toLocaleString()}</td>
                              <td className="px-4 py-3 text-foreground">{b.cities_live}</td>
                              <td className="px-4 py-3 text-muted-foreground text-xs">{b.key_milestone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* REINVESTMENT */}
          <TabsContent value="reinvestment">
            <AnimatePresence mode="wait">
              <motion.div {...anim} key="reinv" className="space-y-4">
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2"><RefreshCw className="w-5 h-5 text-primary" /> Capital Reinvestment Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reinvestment.map((r) => (
                      <div key={r.category} className="p-4 rounded-xl bg-muted/40 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{r.category}</h4>
                          <Badge className="bg-primary/10 text-primary border-primary/20">{r.pct}%</Badge>
                        </div>
                        <Progress value={r.pct} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">{r.rationale}</p>
                        <p className="text-xs mt-1"><span className="font-medium text-foreground">Expected ROI:</span> <span className="text-primary">{r.expected_roi}</span></p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
