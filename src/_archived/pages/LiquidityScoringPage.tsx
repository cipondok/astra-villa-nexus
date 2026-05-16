import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, TrendingUp, Eye, Target, Clock, BarChart3,
  AlertTriangle, Zap, ArrowUpRight, Gauge, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { calculateLiquidityScore, LIQUIDITY_WEIGHTS, type LiquidityInput } from '@/lib/liquidityScoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FADE = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const TIER_COLORS: Record<string, string> = {
  HIGHLY_LIQUID: 'hsl(var(--chart-1))',
  LIQUID: 'hsl(var(--chart-2))',
  MODERATE: 'hsl(var(--chart-3))',
  LOW: 'hsl(var(--chart-4))',
  ILLIQUID: 'hsl(var(--destructive))',
};

const SCENARIOS: { name: string; description: string; input: LiquidityInput }[] = [
  {
    name: 'Hot Property — South Jakarta',
    description: 'New luxury apartment in premium district, competitively priced',
    input: { views_per_day: 42, inquiry_conversion_rate: 22, viewing_bookings_per_week: 7, price_vs_market_pct: -3, days_on_market: 12, district_demand_index: 88, absorption_rate_pct: 72, negotiation_success_rate: 65 },
  },
  {
    name: 'Moderate — Bandung Suburban',
    description: 'Mid-range house in growing suburban area',
    input: { views_per_day: 15, inquiry_conversion_rate: 10, viewing_bookings_per_week: 3, price_vs_market_pct: 5, days_on_market: 45, district_demand_index: 55, absorption_rate_pct: 35, negotiation_success_rate: 40 },
  },
  {
    name: 'Stale — Overpriced Villa',
    description: 'Luxury villa priced significantly above market comps',
    input: { views_per_day: 4, inquiry_conversion_rate: 2, viewing_bookings_per_week: 0, price_vs_market_pct: 15, days_on_market: 120, district_demand_index: 30, absorption_rate_pct: 12, negotiation_success_rate: 10 },
  },
];

const SLIDERS: { key: keyof LiquidityInput; label: string; min: number; max: number; step: number; unit: string }[] = [
  { key: 'views_per_day', label: 'Views/Day', min: 0, max: 80, step: 1, unit: '' },
  { key: 'inquiry_conversion_rate', label: 'Inquiry Conv %', min: 0, max: 40, step: 0.5, unit: '%' },
  { key: 'viewing_bookings_per_week', label: 'Viewings/Week', min: 0, max: 15, step: 1, unit: '' },
  { key: 'price_vs_market_pct', label: 'Price vs Market', min: -15, max: 25, step: 1, unit: '%' },
  { key: 'days_on_market', label: 'Days on Market', min: 0, max: 200, step: 1, unit: 'd' },
  { key: 'district_demand_index', label: 'District Demand', min: 0, max: 100, step: 1, unit: '' },
  { key: 'absorption_rate_pct', label: 'Absorption Rate', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'negotiation_success_rate', label: 'Negotiation Success', min: 0, max: 100, step: 1, unit: '%' },
];

export default function LiquidityScoringPage() {
  const [input, setInput] = useState<LiquidityInput>(SCENARIOS[0].input);
  const result = useMemo(() => calculateLiquidityScore(input), [input]);

  const chartData = result.breakdown.map(b => ({
    name: b.variable,
    contribution: b.contribution,
    normalised: b.normalised,
  }));

  const setField = (key: keyof LiquidityInput, val: number) =>
    setInput(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div variants={FADE} initial="hidden" animate="show" className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Droplets className="h-7 w-7 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Property Liquidity Scoring Engine</h1>
              <p className="text-sm text-muted-foreground">Quantitative model predicting transaction velocity from 8 weighted signals</p>
            </div>
          </div>
        </motion.div>

        {/* Score Hero */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <Card className="border-2" style={{ borderColor: TIER_COLORS[result.tier] }}>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
                <div className="col-span-2 md:col-span-1 text-center">
                  <div className="text-5xl font-black tabular-nums" style={{ color: TIER_COLORS[result.tier] }}>{result.score}</div>
                  <Badge className="mt-1 text-xs" style={{ background: TIER_COLORS[result.tier], color: '#fff' }}>{result.tier.replace('_', ' ')}</Badge>
                </div>
                {[
                  { label: 'Est. Days to Sell', value: `${result.estimated_days_to_sell.min}–${result.estimated_days_to_sell.max}`, icon: Clock },
                  { label: 'Visibility Boost', value: result.visibility_boost, icon: Eye },
                  { label: 'Deal Alert Priority', value: result.deal_alert_priority, icon: AlertTriangle },
                  { label: 'Variables', value: `${result.breakdown.length} signals`, icon: Activity },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <m.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-bold text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="formula">Formula</TabsTrigger>
          </TabsList>

          {/* ── Simulator ── */}
          <TabsContent value="simulator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" />Input Variables</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  {SLIDERS.map(s => (
                    <div key={s.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-foreground">{s.label}</label>
                        <span className="text-sm font-bold tabular-nums text-primary">
                          {s.key === 'price_vs_market_pct' && (input[s.key] as number) > 0 ? '+' : ''}
                          {input[s.key]}{s.unit}
                        </span>
                      </div>
                      <Slider
                        min={s.min} max={s.max} step={s.step}
                        value={[input[s.key] as number]}
                        onValueChange={([v]) => setField(s.key, v)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Contribution Chart</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                          formatter={(v: number) => [v.toFixed(1), 'Contribution']}
                        />
                        <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Breakdown ── */}
          <TabsContent value="breakdown" className="space-y-4">
            {result.breakdown.map((b, i) => (
              <motion.div key={b.variable} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{b.variable}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] tabular-nums">Raw: {b.raw}</Badge>
                            <Badge variant="secondary" className="text-[10px] tabular-nums">Weight: {(b.weight * 100).toFixed(0)}%</Badge>
                          </div>
                        </div>
                        <Progress value={b.normalised} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Normalised: {b.normalised}</span>
                          <span className="font-semibold text-foreground">Contribution: {b.contribution.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <Card className="bg-muted/30">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Raw Score</span>
                <span className="text-lg font-black tabular-nums text-primary">
                  {result.breakdown.reduce((s, b) => s + b.contribution, 0).toFixed(1)} → {result.score}
                </span>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Scenarios ── */}
          <TabsContent value="scenarios" className="space-y-5">
            {SCENARIOS.map((sc, i) => {
              const r = calculateLiquidityScore(sc.input);
              return (
                <motion.div key={sc.name} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}>
                  <Card className="border-l-4 cursor-pointer hover:shadow-md transition-shadow" style={{ borderLeftColor: TIER_COLORS[r.tier] }}
                    onClick={() => setInput(sc.input)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-semibold text-foreground">{sc.name}</p>
                          <p className="text-xs text-muted-foreground">{sc.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {r.breakdown.map(b => (
                              <Badge key={b.variable} variant="outline" className="text-[9px] tabular-nums">{b.variable}: {b.contribution.toFixed(1)}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-center shrink-0">
                          <div className="text-3xl font-black tabular-nums" style={{ color: TIER_COLORS[r.tier] }}>{r.score}</div>
                          <Badge className="text-[10px]" style={{ background: TIER_COLORS[r.tier], color: '#fff' }}>{r.tier.replace('_', ' ')}</Badge>
                          <p className="text-[10px] text-muted-foreground mt-1">{r.estimated_days_to_sell.min}–{r.estimated_days_to_sell.max} days</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            <p className="text-xs text-muted-foreground text-center">Click a scenario to load its values into the simulator</p>
          </TabsContent>

          {/* ── Formula ── */}
          <TabsContent value="formula" className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Mathematical Model</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-2">
                  <p className="text-foreground font-semibold">Raw Score = Σ (normalised(Vᵢ) × Wᵢ)</p>
                  <p className="text-foreground font-semibold">Decay Factor = max(0.4, 1 − 0.012 × days_inactive)</p>
                  <p className="text-foreground font-semibold">Liquidity Score = clamp(Raw × Decay, 0, 100)</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Weight Allocation</p>
                  {LIQUIDITY_WEIGHTS.map(w => (
                    <div key={w.key} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">{w.label}</span>
                      <div className="flex items-center gap-3">
                        <Progress value={w.weight * 100} className="w-24 h-1.5" />
                        <span className="text-sm font-bold tabular-nums w-12 text-right">{(w.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Score Tier Mapping</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { tier: 'HIGHLY_LIQUID', range: '80–100', days: '7–21d', boost: 'None' },
                    { tier: 'LIQUID', range: '60–79', days: '21–45d', boost: 'Low' },
                    { tier: 'MODERATE', range: '40–59', days: '45–75d', boost: 'Medium' },
                    { tier: 'LOW', range: '20–39', days: '75–180d', boost: 'High' },
                    { tier: 'ILLIQUID', range: '0–19', days: '180–365d', boost: 'Urgent' },
                  ].map(t => (
                    <div key={t.tier} className="p-3 rounded-lg border text-center space-y-1" style={{ borderColor: TIER_COLORS[t.tier] }}>
                      <p className="text-xs font-bold" style={{ color: TIER_COLORS[t.tier] }}>{t.tier.replace('_', ' ')}</p>
                      <p className="text-lg font-black tabular-nums text-foreground">{t.range}</p>
                      <p className="text-[10px] text-muted-foreground">{t.days}</p>
                      <Badge variant="outline" className="text-[9px]">Boost: {t.boost}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Normalisation Rules</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    { var: 'Views/Day', rule: 'Linear 0→50 maps to 0→100' },
                    { var: 'Inquiry Conv %', rule: 'Linear 0→30% maps to 0→100' },
                    { var: 'Viewings/Week', rule: 'Linear 0→10 maps to 0→100' },
                    { var: 'Price vs Market', rule: '≤-10% = 100, ≥+20% = 0 (linear between)' },
                    { var: 'Days on Market', rule: 'Inverse: 0 days = 100, 180+ days = 0' },
                    { var: 'District Demand', rule: 'Pass-through (already 0–100)' },
                    { var: 'Absorption Rate', rule: 'Pass-through (already 0–100)' },
                    { var: 'Negotiation Success', rule: 'Pass-through (already 0–100)' },
                  ].map(r => (
                    <div key={r.var} className="flex items-start gap-3 p-2 rounded-lg bg-muted/40">
                      <span className="text-foreground font-medium w-40 shrink-0">{r.var}</span>
                      <span className="text-muted-foreground">{r.rule}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
