import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, AlertTriangle, TrendingDown, MapPin, Zap, Target, Activity, CheckCircle2, ArrowUpRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from 'recharts';
import {
  useHedgingScan,
  useHedgingMacroRisk,
  useHedgingExposure,
  useHedgingStrategies,
  useHedgingDownside,
  useHedgingSafeHavens,
} from '@/hooks/useHedgingEngine';

function getRiskColor(v: number) {
  if (v >= 70) return 'text-red-400';
  if (v >= 40) return 'text-amber-400';
  return 'text-emerald-400';
}

function getRiskBg(v: number) {
  if (v >= 70) return 'bg-red-500/15 text-red-400 border-red-500/30';
  if (v >= 40) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
}

function getPhaseBadge(phase: string) {
  const map: Record<string, string> = {
    expansion: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    peak: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    contraction: 'bg-red-500/15 text-red-400 border-red-500/30',
    trough: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    recovery: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  };
  return map[phase] || 'bg-muted text-muted-foreground';
}

export default function HedgingEnginePage() {
  const [tab, setTab] = useState('macro');
  const scan = useHedgingScan();
  const { data: macroData, isLoading: macroLoading } = useHedgingMacroRisk();
  const { data: exposureData, isLoading: expLoading } = useHedgingExposure();
  const { data: stratData, isLoading: stratLoading } = useHedgingStrategies();
  const { data: downsideData, isLoading: downLoading } = useHedgingDownside();
  const { data: havenData, isLoading: havenLoading } = useHedgingSafeHavens();

  const anyLoading = macroLoading || expLoading || stratLoading || downLoading || havenLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              AI Risk Hedging Engine
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Hedge-fund-style portfolio protection & macro risk management
            </p>
          </div>
          <Button
            onClick={() => scan.mutate('full_hedge')}
            disabled={scan.isPending}
            className="gap-2"
          >
            {scan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Full Risk Hedge Analysis
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/50 border border-border rounded-[6px] p-1 h-auto w-full flex flex-wrap gap-1">
            {[
              { v: 'macro', l: 'Macro Risk', i: Activity },
              { v: 'exposure', l: 'Exposure', i: Target },
              { v: 'strategies', l: 'Strategies', i: Shield },
              { v: 'downside', l: 'Downside', i: TrendingDown },
              { v: 'havens', l: 'Safe Havens', i: MapPin },
            ].map(t => (
              <TabsTrigger key={t.v} value={t.v} className="text-xs sm:text-sm rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5">
                <t.i className="h-4 w-4" />{t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* MACRO RISK TAB */}
          <TabsContent value="macro" className="space-y-4 mt-4">
            {macroLoading ? <LoadingSkeleton /> : !macroData?.length ? <EmptyState /> : (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={macroData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="city" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="interest_rate_risk" fill="hsl(var(--chart-1))" name="Interest Rate" />
                      <Bar dataKey="inflation_momentum" fill="hsl(var(--chart-2))" name="Inflation" />
                      <Bar dataKey="currency_volatility" fill="hsl(var(--chart-3))" name="Currency" />
                      <Bar dataKey="policy_tightening_risk" fill="hsl(var(--chart-4))" name="Policy" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {macroData.map((m: any) => (
                    <Card key={m.id} className="bg-card/80 backdrop-blur border-border/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{m.city}</span>
                          <div className="flex gap-2">
                            <Badge className={`${getPhaseBadge(m.cycle_phase)} border text-xs`}>{m.cycle_phase}</Badge>
                            <Badge className={`${getRiskBg(m.macro_risk_pressure_index)} border text-xs`}>
                              {m.macro_risk_pressure_index}/100
                            </Badge>
                          </div>
                        </div>
                        <Progress value={m.macro_risk_pressure_index} className="h-2" />
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <span>Capital Flight: <strong className={getRiskColor(m.capital_flight_probability * 2)}>{m.capital_flight_probability}%</strong></span>
                          <span>Construction: <strong className={getRiskColor(m.construction_cost_trend)}>{m.construction_cost_trend}</strong></span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* PORTFOLIO EXPOSURE TAB */}
          <TabsContent value="exposure" className="space-y-4 mt-4">
            {expLoading ? <LoadingSkeleton /> : !exposureData?.length ? <EmptyState /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs">
                      <th className="text-left py-3 px-2">City</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-left py-3 px-2">Tier</th>
                      <th className="text-right py-3 px-2">Alloc%</th>
                      <th className="text-right py-3 px-2">Vulnerability</th>
                      <th className="text-right py-3 px-2">Geo Risk</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exposureData.map((e: any) => (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2.5 px-2 font-medium text-foreground">{e.city}</td>
                        <td className="py-2.5 px-2 text-muted-foreground capitalize">{e.property_type}</td>
                        <td className="py-2.5 px-2 text-muted-foreground capitalize">{e.price_tier}</td>
                        <td className="py-2.5 px-2 text-right font-mono">{e.allocation_pct}%</td>
                        <td className="py-2.5 px-2 text-right">
                          <span className={`font-semibold ${getRiskColor(e.vulnerability_score)}`}>{e.vulnerability_score}</span>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">{e.geo_concentration_risk}</td>
                        <td className="py-2.5 px-2 text-center">
                          {e.overexposure_flag ? (
                            <Badge className="bg-red-500/15 text-red-400 border-red-500/30 border text-xs">Overexposed</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border text-xs">OK</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* HEDGING STRATEGIES TAB */}
          <TabsContent value="strategies" className="space-y-4 mt-4">
            {stratLoading ? <LoadingSkeleton /> : !stratData?.length ? <EmptyState /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stratData.map((s: any) => (
                  <Card key={s.id} className="bg-card/80 backdrop-blur border-border/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/15 text-primary border-primary/30 border text-xs capitalize">{s.strategy_type}</Badge>
                          <span className="text-xs text-muted-foreground">#{s.priority_rank}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{s.city}</span>
                      </div>
                      <p className="text-sm text-foreground">{s.action_description}</p>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Risk Reduction</span>
                          <span className="font-semibold text-emerald-400">{s.risk_reduction_pct}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Capital Pres.</span>
                          <span className="font-semibold text-primary">{s.capital_preservation_prob}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Return Imp.</span>
                          <span className="font-semibold text-amber-400">+{s.risk_adjusted_return_improvement}%</span>
                        </div>
                      </div>
                      <Progress value={s.capital_preservation_prob} className="h-1.5" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* DOWNSIDE PROTECTION TAB */}
          <TabsContent value="downside" className="space-y-4 mt-4">
            {downLoading ? <LoadingSkeleton /> : !downsideData?.length ? <EmptyState /> : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={downsideData.slice(0, 12)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="city" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, color: 'hsl(var(--foreground))' }} />
                      <Area type="monotone" dataKey="max_drawdown_pct" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} name="Max Drawdown %" />
                      <Area type="monotone" dataKey="downside_resilience_index" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} name="Resilience Index" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {downsideData.map((d: any) => (
                    <Card key={d.id} className="bg-card/80 backdrop-blur border-border/50">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground text-sm">{d.city}</span>
                          <span className="text-xs text-muted-foreground capitalize">{d.property_type}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground block">Max Drawdown</span>
                            <span className={`font-bold ${getRiskColor(d.max_drawdown_pct * 2)}`}>-{d.max_drawdown_pct}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Recovery</span>
                            <span className="font-semibold text-foreground">{d.time_to_recovery_months} mo</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Income Decline</span>
                            <span className={`font-semibold ${getRiskColor(d.income_decline_prob)}`}>{d.income_decline_prob}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Forced Liq. Risk</span>
                            <span className={`font-semibold ${getRiskColor(d.forced_liquidation_risk * 2.5)}`}>{d.forced_liquidation_risk}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-muted-foreground">Resilience</span>
                          <span className={`font-semibold ${getRiskColor(100 - d.downside_resilience_index)}`}>{d.downside_resilience_index}/100</span>
                        </div>
                        <Progress value={d.downside_resilience_index} className="h-1.5" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* SAFE HAVENS TAB */}
          <TabsContent value="havens" className="space-y-4 mt-4">
            {havenLoading ? <LoadingSkeleton /> : !havenData?.length ? <EmptyState /> : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={havenData.slice(0, 6).map((h: any) => ({
                      city: h.city,
                      Defensive: h.defensive_score,
                      Rental: h.rental_stability,
                      Policy: h.policy_protection_score,
                      Infra: h.infra_backed_growth,
                      Capital: h.capital_protection_score,
                    }))} cx="50%" cy="50%" outerRadius="65%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="city" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Defensive" dataKey="Defensive" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} />
                      <Radar name="Capital" dataKey="Capital" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="text-left py-3 px-2">#</th>
                        <th className="text-left py-3 px-2">City</th>
                        <th className="text-right py-3 px-2">Defensive</th>
                        <th className="text-right py-3 px-2">Rental</th>
                        <th className="text-right py-3 px-2">Policy</th>
                        <th className="text-right py-3 px-2">Infra</th>
                        <th className="text-right py-3 px-2">Capital Prot.</th>
                        <th className="text-right py-3 px-2">Alloc %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {havenData.map((h: any) => (
                        <tr key={h.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 px-2 font-mono text-muted-foreground">{h.safe_haven_rank}</td>
                          <td className="py-2.5 px-2 font-semibold text-foreground">{h.city}</td>
                          <td className="py-2.5 px-2 text-right">{h.defensive_score}</td>
                          <td className="py-2.5 px-2 text-right">{h.rental_stability}</td>
                          <td className="py-2.5 px-2 text-right">{h.policy_protection_score}</td>
                          <td className="py-2.5 px-2 text-right">{h.infra_backed_growth}</td>
                          <td className="py-2.5 px-2 text-right font-semibold text-primary">{h.capital_protection_score}</td>
                          <td className="py-2.5 px-2 text-right font-mono">{h.recommended_allocation_pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-sm text-muted-foreground">Loading risk data...</span>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardContent className="p-8 text-center">
        <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No hedging data yet. Run a Full Risk Hedge Analysis to populate.</p>
      </CardContent>
    </Card>
  );
}
