import { motion } from 'framer-motion';
import {
  Globe, Target, TrendingUp, Shield, Zap, Layers,
  ArrowRight, CheckCircle2, Clock, AlertTriangle,
  Crown, Rocket, Building, Brain, Users, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGlobalProptechEmpire } from '@/hooks/useGlobalProptechEmpire';
import { cn } from '@/lib/utils';

const PILLAR_ICONS: Record<string, typeof Globe> = {
  liquidity: BarChart3,
  multiproduct: Layers,
  ecosystem: Users,
  innovation: Brain,
};

const PRIORITY_STYLE: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive',
  high: 'bg-primary/15 text-primary',
  medium: 'bg-muted text-muted-foreground',
};

const STATUS_STYLE: Record<string, string> = {
  'on-track': 'bg-chart-2/15 text-chart-2',
  'at-risk': 'bg-chart-4/15 text-chart-4',
  'ahead': 'bg-primary/15 text-primary',
};

const TREND_ICON: Record<string, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

const TREND_COLOR: Record<string, string> = {
  up: 'text-chart-2',
  down: 'text-destructive',
  stable: 'text-muted-foreground',
};

const PHASE_STYLE: Record<string, { border: string; badge: string; icon: typeof Rocket }> = {
  active: { border: 'border-primary/30 bg-primary/5', badge: 'bg-primary/15 text-primary', icon: Zap },
  upcoming: { border: 'border-chart-4/20', badge: 'bg-chart-4/15 text-chart-4', icon: Clock },
  future: { border: 'border-muted', badge: 'bg-muted text-muted-foreground', icon: Rocket },
};

export default function GlobalProptechEmpirePage() {
  const { pillars, evolutionRoadmap, leadershipKPIs, positioningNarrative } = useGlobalProptechEmpire();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            Global Proptech Empire Master Strategy
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Long-term category leadership blueprint — intelligence infrastructure for global real estate capital</p>
        </motion.div>

        <Tabs defaultValue="narrative" className="space-y-5">
          <TabsList className="bg-muted/50 flex-wrap h-auto">
            <TabsTrigger value="narrative">Positioning</TabsTrigger>
            <TabsTrigger value="pillars">Empire Pillars</TabsTrigger>
            <TabsTrigger value="roadmap">Evolution Roadmap</TabsTrigger>
            <TabsTrigger value="kpis">Leadership KPIs</TabsTrigger>
          </TabsList>

          {/* ═══ POSITIONING NARRATIVE ═══ */}
          <TabsContent value="narrative" className="space-y-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-6 px-6">
                  <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">Platform Positioning</p>
                  <h2 className="text-xl font-bold text-foreground mb-3">{positioningNarrative.headline}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{positioningNarrative.thesis}</p>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Competitive Moats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {positioningNarrative.moats.map((m, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
                        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{m}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Key Differentiators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {positioningNarrative.differentiators.map((d, i) => {
                      const [ours, theirs] = d.split(' vs ');
                      return (
                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-primary">{ours}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground">vs</span>
                          <div className="flex-1 text-right">
                            <p className="text-xs text-muted-foreground">{theirs}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ═══ EMPIRE PILLARS ═══ */}
          <TabsContent value="pillars" className="space-y-5">
            {pillars.map((pillar, pi) => {
              const PillarIcon = PILLAR_ICONS[pillar.id] || Globe;
              const avgMaturity = Math.round(pillar.capabilities.reduce((s, c) => s + c.maturity, 0) / pillar.capabilities.length);
              return (
                <motion.div key={pillar.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <PillarIcon className="w-4 h-4 text-primary" />
                          {pillar.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">Maturity</span>
                          <Badge className="bg-primary/15 text-primary text-[10px]">{avgMaturity}%</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{pillar.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-foreground mb-2">Capability Maturity</p>
                          {pillar.capabilities.map((c, ci) => (
                            <div key={ci} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-foreground">{c.name}</span>
                                  <Badge className={cn('text-[9px]', PRIORITY_STYLE[c.priority])}>{c.priority}</Badge>
                                </div>
                                <span className="text-xs font-bold text-foreground">{c.maturity}%</span>
                              </div>
                              <Progress value={c.maturity} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-foreground mb-2">Target KPIs</p>
                          {pillar.kpis.map((k, ki) => (
                            <div key={ki} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                              <div>
                                <p className="text-xs font-medium text-foreground">{k.metric}</p>
                                <p className="text-[10px] text-muted-foreground">Target: {k.target}</p>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{k.current}</span>
                                <Badge className={cn('text-[9px]', STATUS_STYLE[k.status])}>{k.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ EVOLUTION ROADMAP ═══ */}
          <TabsContent value="roadmap" className="space-y-5">
            {evolutionRoadmap.map((phase, pi) => {
              const style = PHASE_STYLE[phase.status];
              const PhaseIcon = style.icon;
              return (
                <motion.div key={pi} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
                  <Card className={cn('border', style.border)}>
                    <CardContent className="py-5 px-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center',
                            phase.status === 'active' ? 'bg-primary/20' : 'bg-muted')}>
                            <PhaseIcon className={cn('w-4 h-4', phase.status === 'active' ? 'text-primary' : 'text-muted-foreground')} />
                          </div>
                          <div>
                            <p className="text-base font-bold text-foreground">Phase {phase.phase}: {phase.name}</p>
                            <p className="text-xs text-muted-foreground">{phase.timeline}</p>
                          </div>
                        </div>
                        <Badge className={cn('text-[10px]', style.badge)}>{phase.status}</Badge>
                      </div>

                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
                        <p className="text-xs text-primary italic">&ldquo;{phase.theme}&rdquo;</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                            <Target className="w-3 h-3 text-primary" /> Objectives
                          </p>
                          {phase.objectives.map((o, i) => (
                            <div key={i} className="flex items-start gap-1.5 mb-1.5">
                              <CheckCircle2 className="w-3 h-3 text-chart-2 shrink-0 mt-0.5" />
                              <span className="text-[11px] text-foreground">{o}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                            <Building className="w-3 h-3 text-chart-4" /> Key Investments
                          </p>
                          {phase.investments.map((inv, i) => (
                            <div key={i} className="flex items-start gap-1.5 mb-1.5">
                              <ArrowRight className="w-3 h-3 text-chart-4 shrink-0 mt-0.5" />
                              <span className="text-[11px] text-foreground">{inv}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/10">
                          <p className="text-xs font-semibold text-chart-2 mb-2 flex items-center gap-1.5">
                            <Rocket className="w-3 h-3" /> Unlocks
                          </p>
                          {phase.unlocks.map((u, i) => (
                            <div key={i} className="flex items-start gap-1.5 mb-1.5">
                              <Zap className="w-3 h-3 text-chart-2 shrink-0 mt-0.5" />
                              <span className="text-[11px] text-foreground">{u}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ LEADERSHIP KPIS ═══ */}
          <TabsContent value="kpis" className="space-y-5">
            {leadershipKPIs.map((domain, di) => (
              <motion.div key={di} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.06 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      {domain.domain}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {domain.metrics.map((m, mi) => (
                        <div key={mi} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="text-xs font-medium text-foreground">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground">Benchmark: {m.benchmark}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-foreground">{m.value}</span>
                            <span className={cn('text-sm font-bold', TREND_COLOR[m.trend])}>{TREND_ICON[m.trend]}</span>
                          </div>
                        </div>
                      ))}
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
