import { motion } from 'framer-motion';
import {
  RefreshCw, TrendingUp, MapPin, Shield, Target, Zap,
  ArrowRight, CheckCircle2, Flag, Clock, BarChart3,
  Crown, Building2, Users, Megaphone, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNationalDominationBlueprint } from '@/hooks/useNationalDominationBlueprint';
import { cn } from '@/lib/utils';

const PILLAR_ICONS = [BarChart3, Building2, Users, Megaphone];
const PILLAR_COLORS = [
  { bg: 'bg-chart-1/10', text: 'text-chart-1', border: 'border-chart-1/30' },
  { bg: 'bg-chart-2/10', text: 'text-chart-2', border: 'border-chart-2/30' },
  { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-chart-3/30' },
  { bg: 'bg-chart-4/10', text: 'text-chart-4', border: 'border-chart-4/30' },
];

const STATUS_BADGE: Record<string, string> = {
  live: 'bg-chart-2/20 text-chart-2',
  launching: 'bg-chart-4/20 text-chart-4',
  planned: 'bg-primary/20 text-primary',
  future: 'bg-muted text-muted-foreground',
  leading: 'bg-chart-2/20 text-chart-2',
  growing: 'bg-chart-4/20 text-chart-4',
  emerging: 'bg-primary/20 text-primary',
  active: 'border-primary/30 bg-primary/5',
  upcoming: 'border-chart-4/20',
};

const SEVERITY_STYLE: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  low: 'bg-muted text-muted-foreground border-muted',
};

function scoreColor(s: number) {
  return s >= 70 ? 'text-chart-2' : s >= 40 ? 'text-chart-4' : 'text-destructive';
}

export default function NationalDominationBlueprintPage() {
  const { data, isLoading, refetch } = useNationalDominationBlueprint();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              National Property Market Domination
            </h1>
            <p className="text-sm text-muted-foreground mt-1">14-region liquidity expansion blueprint — supply density, demand intelligence & operational excellence</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Domination Score</p>
              <p className={cn('text-3xl font-bold', scoreColor(data.dominationScore))}>{data.dominationScore}%</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </motion.div>

        {/* National Metrics Strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.nationalMetrics.map((m, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <TrendingUp className={cn('w-3.5 h-3.5', m.trend === 'up' ? 'text-chart-2' : 'text-muted-foreground')} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="regions" className="space-y-5">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="regions">Regional Scoring</TabsTrigger>
            <TabsTrigger value="pillars">Strategy Pillars</TabsTrigger>
            <TabsTrigger value="rollout">Rollout Timeline</TabsTrigger>
            <TabsTrigger value="risks">Risk Mitigation</TabsTrigger>
          </TabsList>

          {/* ═══ REGIONAL SCORING ═══ */}
          <TabsContent value="regions">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Regional Prioritization Decision Framework — 14 Target Metros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.regions.sort((a, b) => b.compositeScore - a.compositeScore).map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                          r.compositeScore >= 80 ? 'bg-chart-2/20 text-chart-2' :
                          r.compositeScore >= 65 ? 'bg-chart-4/20 text-chart-4' : 'bg-muted text-muted-foreground')}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{r.region}</p>
                          <p className="text-[10px] text-muted-foreground">{r.province} · {r.populationM}M pop</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">Wave {r.wave}</Badge>
                        <Badge className={cn('text-[10px]', STATUS_BADGE[r.status])}>{r.status}</Badge>
                        <span className={cn('text-lg font-bold', scoreColor(r.compositeScore))}>{r.compositeScore}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {[
                        { l: 'Tx Potential', v: r.transactionPotential },
                        { l: 'Digital', v: r.digitalReadiness },
                        { l: 'Competition', v: r.competitorPresence },
                        { l: 'Yield', v: r.yieldAttractiveness },
                        { l: 'Listings', v: r.listings, raw: true },
                        { l: 'Deals', v: r.deals, raw: true },
                        { l: 'Agents', v: r.agents, raw: true },
                      ].map((s, si) => (
                        <div key={si} className="text-center p-1.5 rounded bg-background/50">
                          <p className="text-xs font-bold text-foreground">{(s as any).raw ? s.v : `${s.v}%`}</p>
                          <p className="text-[9px] text-muted-foreground">{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ STRATEGY PILLARS ═══ */}
          <TabsContent value="pillars" className="space-y-4">
            {data.pillars.map((p, pi) => {
              const Icon = PILLAR_ICONS[pi];
              const c = PILLAR_COLORS[pi];
              return (
                <motion.div key={pi} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
                  <Card className={cn('border', c.border)}>
                    <CardContent className="py-5 px-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-lg', c.bg)}>
                            <Icon className={cn('w-5 h-5', c.text)} />
                          </div>
                          <div>
                            <p className="text-base font-bold text-foreground">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.description}</p>
                          </div>
                        </div>
                        <Badge className={cn('text-[10px]', STATUS_BADGE[p.status])}>{p.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {p.kpis.map((k, ki) => {
                          const pct = k.unit === 'days'
                            ? Math.min(100, Math.round(((k.target) / Math.max(k.current, 1)) * 100))
                            : Math.min(100, Math.round((k.current / k.target) * 100));
                          return (
                            <div key={ki} className="p-2.5 rounded-lg bg-muted/30">
                              <p className="text-[10px] text-muted-foreground">{k.label}</p>
                              <p className={cn('text-lg font-bold', scoreColor(pct))}>{k.current}{typeof k.current === 'number' && k.unit !== 'listings' && k.unit !== 'agents' && k.unit !== 'cities' && k.unit !== 'partners' && k.unit !== '/year' && k.unit !== 'pts' && k.unit !== '/month' ? k.unit : ''}</p>
                              <Progress value={pct} className="h-1 mt-1" />
                              <p className="text-[9px] text-muted-foreground mt-0.5">Target: {k.target} {k.unit}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {p.tactics.map((t, ti) => (
                          <div key={ti} className="flex items-start gap-2 p-2 rounded bg-muted/20">
                            <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                            <span className="text-xs text-foreground">{t}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ ROLLOUT TIMELINE ═══ */}
          <TabsContent value="rollout" className="space-y-4">
            {data.rollout.map((r, ri) => (
              <motion.div key={ri} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.08 }}>
                <Card className={cn('border', r.status === 'active' ? 'border-primary/30 bg-primary/5' : r.status === 'upcoming' ? 'border-chart-4/20' : 'border-muted')}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          r.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                          {ri + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{r.phase}</p>
                          <p className="text-xs text-muted-foreground">{r.timeline} · Investment: {r.investment}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status === 'active' ? <Zap className="w-4 h-4 text-primary" /> : <Flag className="w-4 h-4 text-muted-foreground" />}
                        <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      {r.regions.map((rg, rgi) => (
                        <Badge key={rgi} className="bg-primary/10 text-primary text-[10px]">{rg}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {r.objectives.map((o, oi) => (
                        <div key={oi} className="flex items-start gap-2 p-2 rounded bg-muted/20">
                          <Target className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                          <span className="text-xs text-foreground">{o}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 rounded bg-muted/30 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-chart-4 shrink-0" />
                      <span className="text-xs text-foreground"><span className="font-semibold">Gate:</span> {r.gate}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border-muted">
              <CardContent className="py-4 px-5">
                <p className="text-sm font-bold text-foreground mb-2">Total Investment Projection</p>
                <div className="grid grid-cols-4 gap-3">
                  {data.rollout.map((r, ri) => (
                    <div key={ri} className="p-2.5 rounded bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">Wave {ri + 1}</p>
                      <p className="text-sm font-bold text-foreground">{r.investment}</p>
                      <p className="text-[10px] text-muted-foreground">{r.regions.length} regions</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right">Total: Rp 16.7B across 14 metro regions over 30 months</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ RISK MITIGATION ═══ */}
          <TabsContent value="risks">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-chart-4" />
                  Risk Scenario Response Playbook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.risks.sort((a, b) => (a.severity === 'high' ? -1 : a.severity === 'medium' ? 0 : 1) - (b.severity === 'high' ? -1 : b.severity === 'medium' ? 0 : 1))
                  .map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={cn('p-3.5 rounded-lg border', SEVERITY_STYLE[r.severity])}>
                    <div className="flex items-start justify-between mb-1.5">
                      <p className="text-sm font-semibold text-foreground">{r.risk}</p>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <Badge variant="outline" className="text-[10px]">{r.pillar}</Badge>
                        <Badge className={cn('text-[10px]', r.severity === 'high' ? 'bg-destructive/20 text-destructive' : r.severity === 'medium' ? 'bg-chart-4/20 text-chart-4' : 'bg-muted text-muted-foreground')}>{r.severity}</Badge>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Shield className="w-3.5 h-3.5 mt-0.5 text-chart-2 shrink-0" />
                      <p className="text-xs text-foreground">{r.mitigation}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
