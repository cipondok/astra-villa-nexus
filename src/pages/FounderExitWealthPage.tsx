import { motion } from 'framer-motion';
import {
  RefreshCw, TrendingUp, Crown, Shield, Landmark, Wallet,
  ArrowRight, CheckCircle2, Flag, Clock, BarChart3, Scale,
  ChevronRight, Target, Zap, Users, Building2, Gem,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFounderExitWealth } from '@/hooks/useFounderExitWealth';
import { cn } from '@/lib/utils';

const SCENARIO_ICONS = [Building2, Landmark, Wallet, Crown];

function pctColor(p: number) {
  return p >= 70 ? 'text-chart-2' : p >= 40 ? 'text-chart-4' : 'text-destructive';
}

const STATUS_STYLE: Record<string, string> = {
  active: 'border-primary/30 bg-primary/5',
  upcoming: 'border-chart-4/20',
  completed: 'border-chart-2/20 bg-chart-2/5',
  future: 'border-muted',
};

export default function FounderExitWealthPage() {
  const { data, isLoading, refetch } = useFounderExitWealth();

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
              <Gem className="w-6 h-6 text-primary" />
              Founder Exit & Wealth Strategy
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Long-term equity creation, exit optionality, governance preservation & personal financial resilience</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Founder Equity Value</p>
              <p className="text-2xl font-bold text-primary">{data.netWorthEstimate}</p>
              <p className="text-[10px] text-muted-foreground">{data.founderOwnership}% ownership</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </motion.div>

        <Tabs defaultValue="equity" className="space-y-5">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="equity">Equity Value</TabsTrigger>
            <TabsTrigger value="exits">Exit Scenarios</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="resilience">Financial Resilience</TabsTrigger>
            <TabsTrigger value="roadmap">Wealth Roadmap</TabsTrigger>
          </TabsList>

          {/* ═══ EQUITY VALUE ═══ */}
          <TabsContent value="equity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.equityMetrics.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border-border/50 h-full">
                    <CardContent className="py-4 px-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <TrendingUp className={cn('w-3.5 h-3.5',
                          m.trend === 'up' ? 'text-chart-2' : m.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                        )} />
                      </div>
                      <p className={cn('text-xl font-bold', pctColor(m.pctOfTarget))}>{m.value}</p>
                      <Progress value={m.pctOfTarget} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground">{m.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ═══ EXIT SCENARIOS ═══ */}
          <TabsContent value="exits" className="space-y-4">
            {data.exitScenarios.map((sc, i) => {
              const Icon = SCENARIO_ICONS[i];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card>
                    <CardContent className="py-5 px-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-foreground">{sc.pathway}</p>
                            <p className="text-xs text-muted-foreground">{sc.timeline} · Probability: {sc.probability}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{sc.valuationRange}</p>
                          <p className="text-xs text-muted-foreground">Founder: {sc.founderProceeds}</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/30 mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Probability</span>
                          <span className="text-xs font-bold">{sc.probability}%</span>
                        </div>
                        <Progress value={sc.probability} className="h-2" />
                        <p className="text-[10px] text-muted-foreground mt-1">Control: {sc.controlRetained}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/20">
                          <p className="text-xs font-semibold text-chart-2 mb-1.5">Advantages</p>
                          {sc.pros.map((p, pi) => (
                            <div key={pi} className="flex items-start gap-1.5 mb-1">
                              <CheckCircle2 className="w-3 h-3 mt-0.5 text-chart-2 shrink-0" />
                              <span className="text-[11px] text-foreground">{p}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                          <p className="text-xs font-semibold text-destructive mb-1.5">Risks</p>
                          {sc.cons.map((c, ci) => (
                            <div key={ci} className="flex items-start gap-1.5 mb-1">
                              <Flag className="w-3 h-3 mt-0.5 text-destructive shrink-0" />
                              <span className="text-[11px] text-foreground">{c}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs font-semibold text-primary mb-1.5">Trigger Conditions</p>
                          {sc.triggers.map((t, ti) => (
                            <div key={ti} className="flex items-start gap-1.5 mb-1">
                              <Target className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                              <span className="text-[11px] text-foreground">{t}</span>
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

          {/* ═══ GOVERNANCE ═══ */}
          <TabsContent value="governance" className="space-y-4">
            {data.governancePhases.map((gp, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className={cn('border', STATUS_STYLE[gp.status] || '')}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          gp.status === 'active' ? 'bg-primary/20 text-primary' :
                          gp.status === 'completed' ? 'bg-chart-2/20 text-chart-2' : 'bg-muted text-muted-foreground')}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{gp.phase}</p>
                          <p className="text-xs text-muted-foreground">{gp.timeline} · {gp.boardComposition}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{gp.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">Founder Ownership</p>
                        <p className="text-lg font-bold text-foreground">{gp.founderControl}%</p>
                        <Progress value={gp.founderControl} className="h-1.5 mt-1" />
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">Voting Power</p>
                        <p className="text-lg font-bold text-primary">{gp.votingPower}%</p>
                        <Progress value={gp.votingPower} className="h-1.5 mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {gp.actions.map((a, ai) => (
                        <div key={ai} className="flex items-start gap-2 p-2 rounded bg-muted/20">
                          <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                          <span className="text-xs text-foreground">{a}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ═══ FINANCIAL RESILIENCE ═══ */}
          <TabsContent value="resilience">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Personal Financial Resilience — Diversified Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.resilienceAllocation.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-3.5 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.category}</p>
                        <p className="text-xs text-muted-foreground">{r.strategy}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-xl font-bold text-primary">{r.allocation}%</p>
                      </div>
                    </div>
                    <Progress value={r.allocation} className="h-1.5 mb-2" />
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.vehicles.map((v, vi) => (
                        <Badge key={vi} variant="outline" className="text-[10px]">{v}</Badge>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">Tax: {r.taxEfficiency}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ WEALTH ROADMAP ═══ */}
          <TabsContent value="roadmap" className="space-y-4">
            {data.wealthRoadmap.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className={cn('border', STATUS_STYLE[m.status] || '')}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          m.status === 'active' ? 'bg-primary/20 text-primary' :
                          m.status === 'completed' ? 'bg-chart-2/20 text-chart-2' : 'bg-muted text-muted-foreground')}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{m.stage}</p>
                          <p className="text-xs text-muted-foreground">{m.timeline}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{m.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="p-2.5 rounded bg-muted/30 text-center">
                        <p className="text-[10px] text-muted-foreground">Equity Value</p>
                        <p className="text-sm font-bold text-foreground">{m.equityValue}</p>
                      </div>
                      <div className="p-2.5 rounded bg-muted/30 text-center">
                        <p className="text-[10px] text-muted-foreground">Liquid Wealth</p>
                        <p className="text-sm font-bold text-chart-2">{m.liquidWealth}</p>
                      </div>
                      <div className="p-2.5 rounded bg-primary/5 text-center">
                        <p className="text-[10px] text-muted-foreground">Key Action</p>
                        <p className="text-xs font-medium text-primary">{m.action}</p>
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
