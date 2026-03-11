import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, Shield, TrendingDown, TrendingUp, Zap, Activity, Target, BarChart3, Flame } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  useStressTestScan, useStressScenarios, useStressProjections,
  useStressSurvival, useStressRecovery, useStressStrategies,
} from '@/hooks/useStressTestEngine';

function riskColor(v: number) {
  if (v >= 70) return 'text-red-400';
  if (v >= 40) return 'text-amber-400';
  return 'text-emerald-400';
}

function severityBadge(v: number) {
  if (v >= 80) return 'bg-red-500/15 text-red-400 border-red-500/30';
  if (v >= 60) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
}

function signalBadge(s: string) {
  const m: Record<string, string> = {
    buy_now: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    accumulate: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    wait: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    monitor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    avoid: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return m[s] || 'bg-muted text-muted-foreground';
}

function decisionBadge(d: string) {
  const m: Record<string, string> = {
    hold: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    sell: 'bg-red-500/15 text-red-400 border-red-500/30',
    refinance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rotate: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    reallocate: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };
  return m[d] || 'bg-muted text-muted-foreground';
}

export default function StressTestEnginePage() {
  const [tab, setTab] = useState('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<string | undefined>();
  const scan = useStressTestScan();
  const { data: scenarios, isLoading: scLoading } = useStressScenarios();
  const { data: projections, isLoading: projLoading } = useStressProjections(selectedScenario);
  const { data: survival, isLoading: survLoading } = useStressSurvival(selectedScenario);
  const { data: recovery, isLoading: recLoading } = useStressRecovery(selectedScenario);
  const { data: strategies, isLoading: stratLoading } = useStressStrategies(selectedScenario);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Flame className="h-7 w-7 text-destructive" />
              Black Swan Stress Testing
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Institutional-grade crisis simulation & portfolio resilience analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            {scenarios && scenarios.length > 0 && (
              <Select value={selectedScenario || 'all'} onValueChange={v => setSelectedScenario(v === 'all' ? undefined : v)}>
                <SelectTrigger className="w-[220px] text-xs">
                  <SelectValue placeholder="All Scenarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scenarios</SelectItem>
                  {scenarios.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.scenario_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => scan.mutate('full_stress')} disabled={scan.isPending} className="gap-2">
              {scan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Run Stress Test
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/50 border border-border rounded-[6px] p-1 h-auto w-full flex flex-wrap gap-1">
            {[
              { v: 'scenarios', l: 'Scenarios', i: AlertTriangle },
              { v: 'projections', l: 'Projections', i: TrendingDown },
              { v: 'survival', l: 'Survival', i: Shield },
              { v: 'recovery', l: 'Recovery', i: TrendingUp },
              { v: 'strategies', l: 'Strategies', i: Target },
            ].map(t => (
              <TabsTrigger key={t.v} value={t.v} className="text-xs sm:text-sm rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5">
                <t.i className="h-4 w-4" />{t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* SCENARIOS */}
          <TabsContent value="scenarios" className="space-y-4 mt-4">
            {scLoading ? <Loading /> : !scenarios?.length ? <Empty /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenarios.map((s: any) => (
                  <Card key={s.id} className="bg-card/80 backdrop-blur border-border/50 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { setSelectedScenario(s.id); setTab('projections'); }}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{s.scenario_name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                        </div>
                        <Badge className={`${severityBadge(s.severity_score)} border text-xs shrink-0 ml-2`}>
                          {s.severity_score}/100
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Duration</span>
                          <span className="font-semibold text-foreground">{s.shock_duration_months} mo</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Geo Impact</span>
                          <span className={`font-semibold ${riskColor(s.geographic_impact_probability)}`}>{s.geographic_impact_probability}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Liq. Freeze</span>
                          <span className={`font-semibold ${riskColor(s.liquidity_freeze_risk)}`}>{s.liquidity_freeze_risk}%</span>
                        </div>
                      </div>
                      <Progress value={s.severity_score} className="h-1.5" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PROJECTIONS */}
          <TabsContent value="projections" className="space-y-4 mt-4">
            {projLoading ? <Loading /> : !projections?.length ? <Empty /> : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projections.slice(0, 15)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="city" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="value_decline_pct" fill="hsl(var(--chart-1))" name="Value Decline %" />
                      <Bar dataKey="rental_contraction_pct" fill="hsl(var(--chart-2))" name="Rental Contraction %" />
                      <Bar dataKey="transaction_volume_drop_pct" fill="hsl(var(--chart-3))" name="Volume Drop %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="text-left py-3 px-2">#</th>
                        <th className="text-left py-3 px-2">City</th>
                        <th className="text-left py-3 px-2">Type</th>
                        <th className="text-right py-3 px-2">Value ↓</th>
                        <th className="text-right py-3 px-2">Rental ↓</th>
                        <th className="text-right py-3 px-2">Volume ↓</th>
                        <th className="text-right py-3 px-2">TTM</th>
                        <th className="text-right py-3 px-2">Containment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projections.slice(0, 30).map((p: any, i: number) => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-2 text-muted-foreground font-mono text-xs">{i + 1}</td>
                          <td className="py-2 px-2 font-medium text-foreground">{p.city}</td>
                          <td className="py-2 px-2 text-muted-foreground capitalize">{p.property_type}</td>
                          <td className="py-2 px-2 text-right"><span className={riskColor(p.value_decline_pct)}>-{p.value_decline_pct}%</span></td>
                          <td className="py-2 px-2 text-right"><span className={riskColor(p.rental_contraction_pct)}>-{p.rental_contraction_pct}%</span></td>
                          <td className="py-2 px-2 text-right font-mono">-{p.transaction_volume_drop_pct}%</td>
                          <td className="py-2 px-2 text-right">{p.time_to_market_months} mo</td>
                          <td className="py-2 px-2 text-right"><span className={riskColor(100 - p.loss_containment_prob)}>{p.loss_containment_prob}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>

          {/* SURVIVAL */}
          <TabsContent value="survival" className="space-y-4 mt-4">
            {survLoading ? <Loading /> : !survival?.length ? <Empty /> : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={survival.slice(0, 15)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="city" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, color: 'hsl(var(--foreground))' }} />
                      <Area type="monotone" dataKey="survival_index" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} name="Survival Index" />
                      <Area type="monotone" dataKey="forced_liquidation_prob" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} name="Forced Liq. %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {survival.slice(0, 12).map((s: any) => (
                    <Card key={s.id} className="bg-card/80 backdrop-blur border-border/50">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-foreground text-sm">{s.city}</span>
                          <span className="text-xs text-muted-foreground capitalize">{s.property_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Survival</span>
                          <Progress value={s.survival_index} className="h-2 flex-1" />
                          <span className={`text-xs font-bold ${riskColor(100 - s.survival_index)}`}>{s.survival_index}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground block">Capital Buffer</span><span className="font-semibold text-foreground">{s.min_capital_buffer_pct}%</span></div>
                          <div><span className="text-muted-foreground block">Forced Liq.</span><span className={`font-semibold ${riskColor(s.forced_liquidation_prob * 1.5)}`}>{s.forced_liquidation_prob}%</span></div>
                          <div><span className="text-muted-foreground block">Debt Risk</span><span className={`font-semibold ${riskColor(s.debt_servicing_risk)}`}>{s.debt_servicing_risk}</span></div>
                          <div><span className="text-muted-foreground block">Emerg. Liq.</span><span className="font-semibold text-foreground">{s.emergency_liquidity_months} mo</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* RECOVERY */}
          <TabsContent value="recovery" className="space-y-4 mt-4">
            {recLoading ? <Loading /> : !recovery?.length ? <Empty /> : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recovery.slice(0, 12)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="city" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="recovery_horizon_months" fill="hsl(var(--chart-4))" name="Recovery Horizon (mo)" />
                      <Bar dataKey="hotspot_emergence_score" fill="hsl(var(--chart-5))" name="Hotspot Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="text-left py-3 px-2">#</th>
                        <th className="text-left py-3 px-2">City</th>
                        <th className="text-right py-3 px-2">Recovery</th>
                        <th className="text-right py-3 px-2">Appreciation</th>
                        <th className="text-right py-3 px-2">Rental Norm.</th>
                        <th className="text-right py-3 px-2">Hotspot</th>
                        <th className="text-center py-3 px-2">Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recovery.slice(0, 20).map((r: any) => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-2 text-muted-foreground font-mono text-xs">{r.post_crisis_opportunity_rank}</td>
                          <td className="py-2 px-2 font-medium text-foreground">{r.city}</td>
                          <td className="py-2 px-2 text-right">{r.recovery_horizon_months} mo</td>
                          <td className="py-2 px-2 text-right text-emerald-400">{r.appreciation_recovery_pct}%</td>
                          <td className="py-2 px-2 text-right">{r.rental_normalization_months} mo</td>
                          <td className="py-2 px-2 text-right font-semibold">{r.hotspot_emergence_score}</td>
                          <td className="py-2 px-2 text-center">
                            <Badge className={`${signalBadge(r.reinvestment_signal)} border text-xs capitalize`}>{r.reinvestment_signal}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>

          {/* STRATEGIES */}
          <TabsContent value="strategies" className="space-y-4 mt-4">
            {stratLoading ? <Loading /> : !strategies?.length ? <Empty /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategies.map((s: any) => (
                  <Card key={s.id} className="bg-card/80 backdrop-blur border-border/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`${decisionBadge(s.decision)} border text-xs capitalize`}>{s.decision}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">{s.strategy_type.replace('_', ' ')}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{s.city}</span>
                      </div>
                      <p className="text-sm text-foreground">{s.action_description}</p>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Capital Pres.</span>
                          <span className="font-semibold text-primary">{s.capital_preservation_score}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Priority</span>
                          <span className="font-semibold text-foreground">#{s.restructuring_priority}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Defensive %</span>
                          <span className="font-semibold text-amber-400">{s.defensive_allocation_pct}%</span>
                        </div>
                      </div>
                      <Progress value={s.capital_preservation_score} className="h-1.5" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-sm text-muted-foreground">Loading stress data...</span>
    </div>
  );
}

function Empty() {
  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No stress test data. Run a Black Swan Stress Test to simulate crisis scenarios.</p>
      </CardContent>
    </Card>
  );
}
