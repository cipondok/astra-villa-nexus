import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Droplets, TrendingDown, Shield, Clock, BarChart3, AlertTriangle, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Legend, Cell,
} from 'recharts';
import {
  useLiquidityScan, useLiquidityAbsorption, useLiquidityElasticity,
  useLiquidityRental, useLiquidityCrisis, useLiquidityExit,
} from '@/hooks/useLiquidityEngine';

const COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
];

const strategyLabel: Record<string, string> = {
  aggressive_discount: 'Aggressive Discount',
  market_rate: 'Market Rate',
  premium_hold: 'Premium Hold',
  staged_reduction: 'Staged Reduction',
};

const scenarioLabel: Record<string, string> = {
  recession: 'Recession',
  rate_spike: 'Rate Spike',
  policy_tightening: 'Policy Tightening',
  natural_disaster: 'Natural Disaster',
  tourism_collapse: 'Tourism Collapse',
};

export default function LiquidityEnginePage() {
  const [tab, setTab] = useState('overview');
  const scan = useLiquidityScan();
  const { data: absorption } = useLiquidityAbsorption();
  const { data: elasticity } = useLiquidityElasticity();
  const { data: rental } = useLiquidityRental();
  const { data: crisis } = useLiquidityCrisis();
  const { data: exitData } = useLiquidityExit();

  // Aggregations for overview
  const avgLiquidityIndex = absorption?.length
    ? Math.round(absorption.reduce((s, r) => s + Number(r.liquidity_speed_index), 0) / absorption.length)
    : 0;
  const avgExitDifficulty = absorption?.length
    ? +(absorption.reduce((s, r) => s + Number(r.exit_difficulty), 0) / absorption.length).toFixed(2)
    : 0;
  const avgCashflow = rental?.length
    ? +(rental.filter(r => Number(r.cashflow_reliability_index) > 0).reduce((s, r) => s + Number(r.cashflow_reliability_index), 0) / rental.filter(r => Number(r.cashflow_reliability_index) > 0).length).toFixed(1)
    : 0;

  // Bar chart: absorption by city
  const cityAbsorption = absorption
    ? Object.values(
        absorption.reduce<Record<string, { city: string; avg: number; count: number }>>((acc, r) => {
          if (!acc[r.city]) acc[r.city] = { city: r.city, avg: 0, count: 0 };
          acc[r.city].avg += Number(r.liquidity_speed_index);
          acc[r.city].count += 1;
          return acc;
        }, {})
      ).map(c => ({ city: c.city, liquidity_index: Math.round(c.avg / c.count) }))
    : [];

  // Radar: rental stability by city (exclude land)
  const rentalRadar = rental
    ? Object.values(
        rental.filter(r => r.property_type !== 'land').reduce<Record<string, { city: string; occ: number; cf: number; vac: number; n: number }>>((acc, r) => {
          if (!acc[r.city]) acc[r.city] = { city: r.city, occ: 0, cf: 0, vac: 0, n: 0 };
          acc[r.city].occ += Number(r.occupancy_stability) * 100;
          acc[r.city].cf += Number(r.cashflow_reliability_index);
          acc[r.city].vac += Number(r.vacancy_risk) * 100;
          acc[r.city].n += 1;
          return acc;
        }, {})
      ).map(c => ({
        city: c.city,
        Occupancy: Math.round(c.occ / c.n),
        Cashflow: Math.round(c.cf / c.n),
        Vacancy: Math.round(c.vac / c.n),
      }))
    : [];

  // Area chart: exit ROI
  const exitChart = exitData
    ? exitData.filter(r => r.property_type !== 'land').map(r => ({
        name: `${r.city} ${r.property_type}`,
        flip: Number(r.flip_profitability),
        hold: Number(r.hold_profitability),
        adjusted: Number(r.liquidity_adjusted_roi),
      })).slice(0, 20)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              Liquidity Forecast Engine
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Predict exit timing, absorption velocity, and crisis resilience
            </p>
          </div>
          <Button onClick={() => scan.mutate('full_forecast')} disabled={scan.isPending} size="sm">
            {scan.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Full Liquidity Forecast
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/50 border border-border rounded-[6px] p-1 w-full flex flex-wrap gap-1 h-auto mb-6">
            <TabsTrigger value="overview" className="text-xs rounded-[4px]"><BarChart3 className="h-3.5 w-3.5 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="elasticity" className="text-xs rounded-[4px]"><TrendingDown className="h-3.5 w-3.5 mr-1" />Demand Elasticity</TabsTrigger>
            <TabsTrigger value="rental" className="text-xs rounded-[4px]"><Droplets className="h-3.5 w-3.5 mr-1" />Rental Stability</TabsTrigger>
            <TabsTrigger value="crisis" className="text-xs rounded-[4px]"><Shield className="h-3.5 w-3.5 mr-1" />Crisis Stress Test</TabsTrigger>
            <TabsTrigger value="exit" className="text-xs rounded-[4px]"><Clock className="h-3.5 w-3.5 mr-1" />Exit Timing</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card border-border"><CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{avgLiquidityIndex}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Liquidity Index</p>
              </CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-destructive">{(avgExitDifficulty * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Exit Difficulty</p>
              </CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-chart-1">{avgCashflow}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Cashflow Reliability</p>
              </CardContent></Card>
            </div>
            {cityAbsorption.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-sm">Absorption by City</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cityAbsorption}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="city" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                        <Bar dataKey="liquidity_index" name="Liquidity Index" radius={[4, 4, 0, 0]}>
                          {cityAbsorption.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* DEMAND ELASTICITY */}
          <TabsContent value="elasticity" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm">Price Sensitivity & Demand Coefficients</CardTitle>
                <CardDescription className="text-xs">Lower elasticity = more price-sensitive buyers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground">City</th>
                        <th className="text-left p-2 text-muted-foreground">Type</th>
                        <th className="text-right p-2 text-muted-foreground">Elasticity</th>
                        <th className="text-right p-2 text-muted-foreground">Price Risk</th>
                        <th className="text-right p-2 text-muted-foreground">Supply</th>
                        <th className="text-right p-2 text-muted-foreground">Competition</th>
                        <th className="text-left p-2 text-muted-foreground">Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {elasticity?.map(r => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-2 font-medium text-foreground">{r.city}</td>
                          <td className="p-2 text-muted-foreground capitalize">{r.property_type}</td>
                          <td className="p-2 text-right text-foreground">{Number(r.elasticity_coefficient).toFixed(2)}</td>
                          <td className="p-2 text-right">
                            <span className={Number(r.price_reduction_risk) > 0.5 ? 'text-destructive' : 'text-chart-1'}>
                              {(Number(r.price_reduction_risk) * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="p-2 text-right text-foreground">{(Number(r.supply_pressure) * 100).toFixed(0)}%</td>
                          <td className="p-2 text-right text-foreground">{(Number(r.competition_intensity) * 100).toFixed(0)}%</td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-[10px]">
                              {strategyLabel[r.optimal_pricing_strategy] || r.optimal_pricing_strategy}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RENTAL STABILITY */}
          <TabsContent value="rental" className="space-y-4">
            {rentalRadar.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-sm">Rental Stability by City</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={rentalRadar}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="city" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <PolarRadiusAxis tick={{ fontSize: 9 }} />
                        <Radar name="Occupancy" dataKey="Occupancy" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} />
                        <Radar name="Cashflow" dataKey="Cashflow" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.2} />
                        <Radar name="Vacancy" dataKey="Vacancy" stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.1} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rental?.filter(r => r.property_type !== 'land').slice(0, 8).map(r => (
                <Card key={r.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-foreground">{r.city}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{r.property_type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Cashflow:</span> <span className="font-medium text-foreground">{Number(r.cashflow_reliability_index).toFixed(0)}</span></div>
                      <div><span className="text-muted-foreground">Vacancy:</span> <span className="font-medium text-destructive">{(Number(r.vacancy_risk) * 100).toFixed(0)}%</span></div>
                      <div><span className="text-muted-foreground">ST Viability:</span> <span className="font-medium text-foreground">{Number(r.short_term_viability).toFixed(0)}</span></div>
                      <div><span className="text-muted-foreground">LT Viability:</span> <span className="font-medium text-foreground">{Number(r.long_term_viability).toFixed(0)}</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CRISIS STRESS TEST */}
          <TabsContent value="crisis" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['recession', 'rate_spike', 'policy_tightening', 'natural_disaster', 'tourism_collapse'].map(scenario => {
                const items = crisis?.filter(r => r.scenario === scenario) || [];
                const avgStress = items.length ? +(items.reduce((s, r) => s + Number(r.stress_liquidity_score), 0) / items.length).toFixed(1) : 0;
                const avgForced = items.length ? +(items.reduce((s, r) => s + Number(r.forced_sale_risk), 0) / items.length).toFixed(2) : 0;
                return (
                  <Card key={scenario} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-accent-foreground" />
                        <span className="text-sm font-semibold text-foreground">{scenarioLabel[scenario]}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Stress Score</span>
                          <span className={`font-bold ${avgStress > 60 ? 'text-chart-1' : 'text-destructive'}`}>{avgStress}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${avgStress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Forced Sale Risk</span>
                          <span className="text-destructive font-bold">{(avgForced * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* EXIT TIMING */}
          <TabsContent value="exit" className="space-y-4">
            {exitChart.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-sm">Exit ROI Comparison</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={exitChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} angle={-30} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Area type="monotone" dataKey="flip" name="Flip ROI %" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} />
                        <Area type="monotone" dataKey="hold" name="Hold ROI %" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.15} />
                        <Area type="monotone" dataKey="adjusted" name="Liq-Adj ROI %" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.15} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm">Optimal Exit Windows</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground">City</th>
                        <th className="text-left p-2 text-muted-foreground">Type</th>
                        <th className="text-center p-2 text-muted-foreground">Best Window</th>
                        <th className="text-right p-2 text-muted-foreground">Hold (mo)</th>
                        <th className="text-right p-2 text-muted-foreground">Flip ROI%</th>
                        <th className="text-right p-2 text-muted-foreground">Hold ROI%</th>
                        <th className="text-right p-2 text-muted-foreground">Liq-Adj ROI%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exitData?.map(r => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-2 font-medium text-foreground">{r.city}</td>
                          <td className="p-2 capitalize text-muted-foreground">{r.property_type}</td>
                          <td className="p-2 text-center"><Badge variant="outline" className="text-[10px]">{r.best_sell_window}</Badge></td>
                          <td className="p-2 text-right text-foreground">{r.optimal_hold_months}</td>
                          <td className="p-2 text-right text-chart-1">{Number(r.flip_profitability).toFixed(1)}</td>
                          <td className="p-2 text-right text-chart-2">{Number(r.hold_profitability).toFixed(1)}</td>
                          <td className="p-2 text-right font-bold text-primary">{Number(r.liquidity_adjusted_roi).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
