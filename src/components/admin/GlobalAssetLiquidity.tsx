import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Zap, TrendingUp, ArrowUpRight, ArrowDownRight, Globe, Activity,
  DollarSign, BarChart3, Brain, Clock, Target, CheckCircle, Droplets
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, LineChart, Line
} from 'recharts';

interface LiquidityRegion {
  id: string; name: string; liquidityScore: number; dealVelocity: number;
  avgSettlement: number; capitalFlow: number; pricingStability: number;
  trend: 'improving' | 'stable' | 'declining';
}

const REGIONS: LiquidityRegion[] = [
  { id: 'bali', name: 'Bali', liquidityScore: 94, dealVelocity: 88, avgSettlement: 12, capitalFlow: 8.4, pricingStability: 82, trend: 'improving' },
  { id: 'sg', name: 'Singapore', liquidityScore: 88, dealVelocity: 92, avgSettlement: 8, capitalFlow: 6.2, pricingStability: 90, trend: 'stable' },
  { id: 'jkt', name: 'Jakarta', liquidityScore: 78, dealVelocity: 72, avgSettlement: 18, capitalFlow: 4.8, pricingStability: 68, trend: 'improving' },
  { id: 'dubai', name: 'Dubai', liquidityScore: 82, dealVelocity: 78, avgSettlement: 14, capitalFlow: 12.5, pricingStability: 72, trend: 'stable' },
  { id: 'bangkok', name: 'Bangkok', liquidityScore: 62, dealVelocity: 55, avgSettlement: 28, capitalFlow: 2.8, pricingStability: 58, trend: 'declining' },
  { id: 'kl', name: 'Kuala Lumpur', liquidityScore: 65, dealVelocity: 62, avgSettlement: 22, capitalFlow: 3.2, pricingStability: 65, trend: 'stable' },
  { id: 'hcm', name: 'Ho Chi Minh', liquidityScore: 55, dealVelocity: 48, avgSettlement: 35, capitalFlow: 2.1, pricingStability: 52, trend: 'improving' },
  { id: 'lombok', name: 'Lombok', liquidityScore: 35, dealVelocity: 28, avgSettlement: 48, capitalFlow: 0.8, pricingStability: 42, trend: 'improving' },
];

const VELOCITY_DATA = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  baseline: 42 + Math.random() * 8,
  aiOptimized: 35 - i * 0.8 + Math.random() * 5,
  throughput: 120 + i * 12 + Math.random() * 30,
}));

const CAPITAL_FLOW_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  inflow: 2.4 + i * 0.3 + Math.random() * 0.8,
  outflow: 1.8 + Math.random() * 0.6,
  net: 0.6 + i * 0.2 + Math.random() * 0.4,
}));

const TREND_STYLE = {
  improving: { text: 'text-chart-1', icon: ArrowUpRight },
  stable: { text: 'text-chart-2', icon: Activity },
  declining: { text: 'text-destructive', icon: ArrowDownRight },
};

const INTERVENTIONS = [
  { id: '1', type: 'pricing', action: 'Deploy dynamic pricing stabilization — Bali luxury cluster', impact: '-8% volatility', urgency: 'high' },
  { id: '2', type: 'liquidity', action: 'Activate cross-regional demand balancing — Bangkok ↔ Bali', impact: '+22% throughput', urgency: 'critical' },
  { id: '3', type: 'listing', action: 'Global listing liquidity optimization — 1,200 properties', impact: '-4 days settlement', urgency: 'high' },
  { id: '4', type: 'capital', action: 'Redirect capital flow: oversupplied KL → undersupplied Lombok', impact: '+18% efficiency', urgency: 'medium' },
];

const PlanetaryAssetLiquidity = () => {
  const [view, setView] = useState<'heat' | 'velocity' | 'capital'>('heat');

  const avgLiquidity = Math.round(REGIONS.reduce((s, r) => s + r.liquidityScore, 0) / REGIONS.length);
  const totalCapital = REGIONS.reduce((s, r) => s + r.capitalFlow, 0);
  const avgSettlement = Math.round(REGIONS.reduce((s, r) => s + r.avgSettlement, 0) / REGIONS.length);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Autonomous Global Asset Liquidity Network</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">LIVE</Badge>
        </div>
        <div className="flex items-center gap-1">
          {(['heat', 'velocity', 'capital'] as const).map(v => (
            <Button key={v} variant={view === v ? 'default' : 'outline'} size="sm" className="h-5 text-[6px] px-1.5 capitalize" onClick={() => setView(v)}>{v}</Button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Global Liquidity Index', value: `${avgLiquidity}/100`, icon: Droplets, delta: '+5.2', up: true },
          { label: 'Capital Flow', value: `$${totalCapital.toFixed(1)}B`, icon: DollarSign, delta: '+12.4%', up: true },
          { label: 'Avg Settlement', value: `${avgSettlement}d`, icon: Clock, delta: '-3d', up: true },
          { label: 'AI Interventions', value: '42/hr', icon: Brain, delta: '+18%', up: true },
          { label: 'Pricing Stability', value: '78/100', icon: Target, delta: '+6.2', up: true },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/20">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <kpi.icon className="h-2.5 w-2.5 text-muted-foreground" />
                <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              </div>
              <div className="flex items-end gap-1.5">
                <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
                <span className={cn("text-[7px] tabular-nums flex items-center gap-0.5 mb-0.5", kpi.up ? "text-chart-1" : "text-destructive")}>
                  {kpi.up ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}{kpi.delta}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* LEFT */}
        <div className="space-y-3">
          {/* Liquidity Heat Grid */}
          {view === 'heat' && (
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                  <BarChart3 className="h-3 w-3 text-primary" />Asset Liquidity Heat Grid
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0 space-y-1.5">
                {[...REGIONS].sort((a, b) => b.liquidityScore - a.liquidityScore).map((r, i) => {
                  const tStyle = TREND_STYLE[r.trend];
                  const TrendIcon = tStyle.icon;
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 py-1 px-2 rounded-lg border border-border/10 hover:border-border/20 transition-colors">
                      <span className="text-[8px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
                      <span className="text-[9px] font-medium text-foreground w-24 truncate">{r.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${r.liquidityScore}%` }} transition={{ delay: i * 0.08, duration: 0.6 }}
                          className={cn("h-full rounded-full", r.liquidityScore >= 80 ? "bg-chart-1" : r.liquidityScore >= 60 ? "bg-chart-2" : "bg-chart-3")} />
                      </div>
                      <span className="text-[8px] font-bold text-foreground tabular-nums w-6">{r.liquidityScore}</span>
                      <div className="flex items-center gap-3 text-[7px] tabular-nums">
                        <span className="text-muted-foreground w-10">V:{r.dealVelocity}</span>
                        <span className="text-muted-foreground w-10">S:{r.avgSettlement}d</span>
                        <span className="text-muted-foreground w-12">${r.capitalFlow}B</span>
                      </div>
                      <TrendIcon className={cn("h-2.5 w-2.5", tStyle.text)} />
                      <Badge variant="outline" className={cn("text-[5px] h-3 px-1", tStyle.text)}>{r.trend}</Badge>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Deal Velocity */}
          {view === 'velocity' && (
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                  <Zap className="h-3 w-3 text-chart-1" />Deal Throughput Velocity — Settlement Time Reduction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={VELOCITY_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gVelBase" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gVelOpt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                    <Area type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="url(#gVelBase)" strokeWidth={1} strokeDasharray="3 3" name="Baseline Settlement (days)" />
                    <Area type="monotone" dataKey="aiOptimized" stroke="hsl(var(--chart-1))" fill="url(#gVelOpt)" strokeWidth={2} name="AI-Optimized (days)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Capital Flow */}
          {view === 'capital' && (
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-chart-2" />Cross-Market Capital Flow Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={CAPITAL_FLOW_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                    <Bar dataKey="inflow" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} name="Capital Inflow ($B)" />
                    <Bar dataKey="outflow" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} opacity={0.5} name="Capital Outflow ($B)" />
                    <Line type="monotone" dataKey="net" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Net Flow ($B)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT — Interventions + Pricing */}
        <div className="space-y-3">
          {/* Pricing Stabilization */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Target className="h-3 w-3 text-primary" />Dynamic Pricing Stabilization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1">
              {REGIONS.slice(0, 6).map((r, i) => (
                <div key={r.id} className="flex items-center gap-2 py-0.5">
                  <span className="text-[8px] text-foreground w-16 truncate">{r.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted/10 overflow-hidden">
                    <div className={cn("h-full rounded-full", r.pricingStability >= 75 ? "bg-chart-1" : r.pricingStability >= 55 ? "bg-chart-2" : "bg-destructive")}
                      style={{ width: `${r.pricingStability}%` }} />
                  </div>
                  <span className="text-[7px] tabular-nums text-foreground w-5">{r.pricingStability}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Interventions */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Brain className="h-3 w-3 text-chart-1" />Batch Automation Controls
                <Badge variant="outline" className="text-[6px] h-3 ml-auto">{INTERVENTIONS.length} queued</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {INTERVENTIONS.map((int, i) => {
                const urgencyStyle = int.urgency === 'critical' ? 'text-destructive border-destructive/20 bg-destructive/5' : int.urgency === 'high' ? 'text-chart-3 border-chart-3/20 bg-chart-3/5' : 'text-chart-2 border-chart-2/20 bg-chart-2/5';
                return (
                  <motion.div key={int.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className={cn("px-2 py-1.5 rounded-lg border", urgencyStyle)}>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={cn("text-[5px] h-3 px-1 shrink-0 uppercase", urgencyStyle)}>{int.urgency}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-medium text-foreground leading-tight">{int.action}</p>
                        <span className="text-[6px] text-chart-1 tabular-nums">{int.impact}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-5 text-[6px] px-1.5 shrink-0">
                        <CheckCircle className="h-2.5 w-2.5 mr-0.5" />Execute
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryAssetLiquidity;
