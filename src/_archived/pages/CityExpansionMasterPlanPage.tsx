import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, MapPin, Rocket, Target, Shield, Zap, TrendingUp, Users,
  DollarSign, Building2, ChevronRight, CheckCircle2, AlertTriangle,
  XCircle, BarChart3, Clock, Flag, Layers, ArrowRight, Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useCityExpansionMasterPlan, type CityPlan, type RiskLevel, type PhaseKey } from '@/hooks/useCityExpansionMasterPlan';
import { cn } from '@/lib/utils';

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}M`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

const WAVE_COLORS = {
  wave_1: { bg: 'bg-chart-1/10', border: 'border-chart-1/30', text: 'text-chart-1', badge: 'bg-chart-1/20 text-chart-1' },
  wave_2: { bg: 'bg-chart-2/10', border: 'border-chart-2/30', text: 'text-chart-2', badge: 'bg-chart-2/20 text-chart-2' },
  wave_3: { bg: 'bg-chart-4/10', border: 'border-chart-4/30', text: 'text-chart-4', badge: 'bg-chart-4/20 text-chart-4' },
};

const PHASE_LABELS: Record<PhaseKey, string> = {
  qualification: 'Qualification', pilot: 'Pilot Launch', density: 'Density Build', stabilization: 'Stabilization',
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'bg-chart-2/20 text-chart-2', medium: 'bg-chart-4/20 text-chart-4', high: 'bg-destructive/20 text-destructive',
};

export default function CityExpansionMasterPlanPage() {
  const { cities, waves, phases, summary } = useCityExpansionMasterPlan();
  const [selectedCity, setSelectedCity] = useState(cities[0].city);
  const detail = cities.find(c => c.city === selectedCity)!;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            First 10 Cities — Expansion Master Plan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Disciplined geographic scaling across 3 waves with phase-gated execution</p>
        </motion.div>

        {/* Summary Strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Cities', value: summary.cityCount.toString(), icon: MapPin },
            { label: 'Total Budget', value: fmt(summary.totalBudget), icon: DollarSign },
            { label: 'Target Listings', value: summary.totalTargetListings.toLocaleString(), icon: Building2 },
            { label: 'Target Deals/mo', value: summary.totalTargetDeals.toString(), icon: Target },
            { label: 'Target Revenue/mo', value: fmt(summary.totalTargetRevenue), icon: TrendingUp },
          ].map((s, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <s.icon className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="waves" className="space-y-5">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="waves">Wave Timeline</TabsTrigger>
            <TabsTrigger value="scoring">City Scoring</TabsTrigger>
            <TabsTrigger value="detail">City Deep Dive</TabsTrigger>
            <TabsTrigger value="phases">Phase Playbook</TabsTrigger>
            <TabsTrigger value="risks">Risk Matrix</TabsTrigger>
          </TabsList>

          {/* ═══ WAVE TIMELINE ═══ */}
          <TabsContent value="waves" className="space-y-5">
            {waves.map((w, wi) => {
              const wc = WAVE_COLORS[w.wave];
              const waveCities = cities.filter(c => c.wave === w.wave);
              return (
                <motion.div key={w.wave} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: wi * 0.08 }}>
                  <Card className={cn('border', wc.border)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Rocket className={cn('w-4 h-4', wc.text)} />
                          {w.label}
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{w.timeline}</Badge>
                          <span className="text-sm font-bold text-foreground">{fmt(w.totalBudget)}</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">🏠 {w.targetListings} listings</span>
                        <span className="text-xs text-muted-foreground">🤝 {w.targetDeals} deals/mo</span>
                        <span className="text-xs text-muted-foreground">🏙️ {w.cities.length} cities</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {waveCities.map(c => (
                          <div key={c.city} className={cn('p-3 rounded-lg border', wc.border, wc.bg)}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <MapPin className={cn('w-3.5 h-3.5', wc.text)} />
                                <span className="text-sm font-semibold text-foreground">{c.city}</span>
                              </div>
                              <Badge className={cn('text-[10px]', wc.badge)}>{c.tier}</Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">Phase:</span>
                              <span className="text-xs font-medium text-foreground">{PHASE_LABELS[c.currentPhase]}</span>
                            </div>
                            <Progress value={c.phasePct} className="h-1.5" />
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                              {c.kpis.slice(0, 2).map((k, ki) => (
                                <p key={ki} className="text-[10px] text-muted-foreground">{k.label}: <span className="font-medium text-foreground">{k.unit === 'Rp' ? fmt(k.target) : k.target}</span></p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ CITY SCORING ═══ */}
          <TabsContent value="scoring">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  City Prioritization Scoring Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cities.map((c, i) => {
                    const wc = WAVE_COLORS[c.wave];
                    return (
                      <motion.div key={c.city} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedCity(c.city)}
                      >
                        <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{c.city}</span>
                            <Badge className={cn('text-[10px]', wc.badge)}>{c.tier}</Badge>
                            <Badge variant="outline" className="text-[10px]">{c.province}</Badge>
                          </div>
                          <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-muted-foreground">Pop: {(c.population / 1_000_000).toFixed(1)}M</span>
                            <span className="text-[10px] text-muted-foreground">Txn/mo: {c.monthlyTxn}</span>
                            <span className="text-[10px] text-muted-foreground">Yield: {c.rentalYield}%</span>
                            <span className="text-[10px] text-muted-foreground">Gap: {c.competitorGap}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24">
                            <Progress value={c.priorityScore} className="h-2" />
                          </div>
                          <span className={cn('text-lg font-bold', c.priorityScore >= 75 ? 'text-chart-2' : c.priorityScore >= 60 ? 'text-chart-4' : 'text-muted-foreground')}>
                            {c.priorityScore}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <p className="text-xs font-semibold text-foreground mb-1">Scoring Methodology</p>
                  <p className="text-xs text-muted-foreground">Composite of: Transaction Volume (25%) + Digital Adoption (15%) + Rental Yield (15%) + Infrastructure Momentum (15%) + Competitor Gap (15%) + Population Density (10%) + Foreign Interest (5%)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ CITY DEEP DIVE ═══ */}
          <TabsContent value="detail" className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {cities.map(c => (
                <Badge key={c.city} variant={c.city === selectedCity ? 'default' : 'outline'}
                  className="cursor-pointer text-xs" onClick={() => setSelectedCity(c.city)}>
                  {c.city.split(' ')[0]}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* KPI Milestones */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    {detail.city} — KPI Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {detail.kpis.map((k, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-muted/30 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{k.label}</p>
                        <p className="text-xs text-muted-foreground">Target by Month {k.byMonth}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{k.unit === 'Rp' ? fmt(k.target) : `${k.target} ${k.unit}`}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Launch Budget</span>
                    <span className="text-sm font-bold text-foreground">{fmt(detail.launchBudget)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Allocation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Resource Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {[
                    { label: 'Team Size', value: `${detail.resourceAllocation.teamSize} people`, icon: Users },
                    { label: 'Marketing Budget', value: fmt(detail.resourceAllocation.marketingBudget), icon: TrendingUp },
                    { label: 'Agent Incentives', value: fmt(detail.resourceAllocation.agentIncentives), icon: DollarSign },
                    { label: 'Tech Infrastructure', value: fmt(detail.resourceAllocation.techInfra), icon: Zap },
                  ].map((r, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <r.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{r.label}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{r.value}</span>
                    </div>
                  ))}

                  {/* Risks */}
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> City-Specific Risks
                    </p>
                    {detail.risks.map((r, i) => (
                      <div key={i} className="p-2 rounded-lg bg-muted/20 mb-1.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge className={cn('text-[10px] px-1.5', RISK_COLORS[r.level])}>{r.level}</Badge>
                          <span className="text-xs font-medium text-foreground">{r.risk}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground pl-1">→ {r.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══ PHASE PLAYBOOK ═══ */}
          <TabsContent value="phases" className="space-y-4">
            {phases.map((p, pi) => (
              <motion.div key={p.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
                <Card>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          pi === 0 ? 'bg-chart-4/20 text-chart-4' : pi === 1 ? 'bg-primary/20 text-primary' :
                          pi === 2 ? 'bg-chart-2/20 text-chart-2' : 'bg-chart-1/20 text-chart-1')}>
                          {pi + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.duration}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{p.gateMetric}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {p.milestones.map((m, mi) => (
                        <div key={mi} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-foreground">{m}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ═══ RISK MATRIX ═══ */}
          <TabsContent value="risks">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-destructive" />
                  Cross-City Risk Mitigation Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cities.flatMap(c => c.risks.map(r => ({ ...r, city: c.city })))
                  .sort((a, b) => (a.level === 'high' ? -1 : a.level === 'medium' ? 0 : 1) - (b.level === 'high' ? -1 : b.level === 'medium' ? 0 : 1))
                  .map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      {r.level === 'high' ? <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" /> :
                       r.level === 'medium' ? <AlertTriangle className="w-4 h-4 text-chart-4 shrink-0 mt-0.5" /> :
                       <Shield className="w-4 h-4 text-chart-2 shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-foreground">{r.risk}</span>
                          <Badge className={cn('text-[10px]', RISK_COLORS[r.level])}>{r.level}</Badge>
                          <Badge variant="outline" className="text-[10px]">{r.city}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">→ {r.mitigation}</p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
