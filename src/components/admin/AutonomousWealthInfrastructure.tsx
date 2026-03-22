import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Brain, Shield,
  Zap, Target, BarChart3, CheckCircle, Activity, Landmark, Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar
} from 'recharts';

interface WealthRegion {
  id: string; name: string; capitalFlow: number; yieldOpt: number;
  frictionReduction: number; wealthScore: number; trend: 'up' | 'stable' | 'down';
}

const REGIONS: WealthRegion[] = [
  { id: 'bali', name: 'Bali', capitalFlow: 8.4, yieldOpt: 14.2, frictionReduction: 68, wealthScore: 92, trend: 'up' },
  { id: 'jkt', name: 'Jakarta', capitalFlow: 4.8, yieldOpt: 11.5, frictionReduction: 55, wealthScore: 78, trend: 'up' },
  { id: 'dubai', name: 'Dubai', capitalFlow: 12.5, yieldOpt: 9.8, frictionReduction: 48, wealthScore: 82, trend: 'stable' },
  { id: 'sg', name: 'Singapore', capitalFlow: 6.2, yieldOpt: 8.2, frictionReduction: 72, wealthScore: 88, trend: 'stable' },
  { id: 'bangkok', name: 'Bangkok', capitalFlow: 2.8, yieldOpt: 12.8, frictionReduction: 38, wealthScore: 62, trend: 'up' },
  { id: 'kl', name: 'Kuala Lumpur', capitalFlow: 3.2, yieldOpt: 10.5, frictionReduction: 42, wealthScore: 65, trend: 'stable' },
  { id: 'hcm', name: 'Ho Chi Minh', capitalFlow: 2.1, yieldOpt: 15.2, frictionReduction: 32, wealthScore: 55, trend: 'up' },
  { id: 'lombok', name: 'Lombok', capitalFlow: 0.8, yieldOpt: 18.5, frictionReduction: 22, wealthScore: 42, trend: 'up' },
];

const STRATEGIES = [
  { id: '1', action: 'Auto-optimize yield allocation across Bali luxury cluster', impact: '+$2.4M projected', region: 'Bali', urgency: 'high' },
  { id: '2', action: 'Rebalance capital flow: oversupplied KL → high-demand Lombok', impact: '+18% efficiency', region: 'Multi', urgency: 'critical' },
  { id: '3', action: 'Activate dynamic pricing stabilization — Dubai marina segment', impact: '-12% volatility', region: 'Dubai', urgency: 'high' },
  { id: '4', action: 'Deploy liquidity acceleration protocol — Ho Chi Minh emerging cluster', impact: '+35% throughput', region: 'HCM', urgency: 'medium' },
];

const AutonomousWealthInfrastructure = () => {
  const [aiIntensity, setAiIntensity] = useState([65]);
  const [riskTolerance, setRiskTolerance] = useState([50]);

  const simFactor = useMemo(() => 1 + (aiIntensity[0] - 50) * 0.005 + (riskTolerance[0] - 50) * 0.003, [aiIntensity, riskTolerance]);

  const wealthCurve = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    year: `Y${i + 1}`,
    traditional: 100 + i * 6 + Math.random() * 4,
    aiOptimized: 100 + i * 6 * simFactor + Math.random() * 4,
    yieldDelta: (simFactor - 1) * 100 * (1 + i * 0.15) + Math.random() * 2,
  })), [simFactor]);

  const capitalData = REGIONS.map(r => ({
    name: r.name,
    flow: r.capitalFlow,
    yield: r.yieldOpt,
    friction: 100 - r.frictionReduction,
  }));

  const totalCapital = REGIONS.reduce((s, r) => s + r.capitalFlow, 0);
  const avgYield = (REGIONS.reduce((s, r) => s + r.yieldOpt, 0) / REGIONS.length).toFixed(1);
  const avgFriction = Math.round(REGIONS.reduce((s, r) => s + r.frictionReduction, 0) / REGIONS.length);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Autonomous Wealth Infrastructure Engine</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">ACTIVE</Badge>
        </div>
        <span className={cn("text-[9px] font-bold tabular-nums", simFactor >= 1 ? "text-chart-1" : "text-destructive")}>
          Sim Factor: {simFactor.toFixed(3)}x
        </span>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Total Capital Flow', value: `$${totalCapital.toFixed(1)}B`, icon: DollarSign, delta: '+14%', up: true },
          { label: 'Avg Yield Optimization', value: `${avgYield}%`, icon: TrendingUp, delta: '+2.4%', up: true },
          { label: 'Friction Reduction', value: `${avgFriction}%`, icon: Zap, delta: '+8%', up: true },
          { label: 'Active Strategies', value: `${STRATEGIES.length}`, icon: Brain, delta: '+1', up: true },
          { label: 'Wealth Regions', value: `${REGIONS.length}`, icon: Target, delta: '+2', up: true },
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
          {/* Wealth Projection */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-chart-1" />Wealth Distribution Projection — Traditional vs AI-Optimized
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={wealthCurve} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Area type="monotone" dataKey="traditional" stroke="hsl(var(--muted-foreground))" fill="none" strokeWidth={1} strokeDasharray="3 3" name="Traditional" />
                  <Area type="monotone" dataKey="aiOptimized" stroke="hsl(var(--chart-1))" fill="url(#gWealth)" strokeWidth={2} name="AI-Optimized" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Capital Flow by Region */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Layers className="h-3 w-3 text-chart-2" />Global Wealth Flow by Region
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={capitalData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Bar dataKey="flow" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} name="Capital Flow ($B)" />
                  <Bar dataKey="yield" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} opacity={0.6} name="Yield %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">
          {/* Controls */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Brain className="h-3 w-3 text-primary" />Optimization Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-foreground">AI Optimization Intensity</span>
                  <span className="text-[8px] font-semibold text-foreground tabular-nums">{aiIntensity[0]}%</span>
                </div>
                <Slider value={aiIntensity} onValueChange={setAiIntensity} min={0} max={100} step={5} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-foreground">Risk Tolerance</span>
                  <span className="text-[8px] font-semibold text-foreground tabular-nums">{riskTolerance[0]}%</span>
                </div>
                <Slider value={riskTolerance} onValueChange={setRiskTolerance} min={0} max={100} step={5} />
              </div>
            </CardContent>
          </Card>

          {/* Wealth Ranking */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Shield className="h-3 w-3 text-chart-1" />Wealth Score Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1">
              {[...REGIONS].sort((a, b) => b.wealthScore - a.wealthScore).map((r, i) => (
                <div key={r.id} className="flex items-center gap-2 py-0.5">
                  <span className="text-[8px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
                  <span className="text-[9px] font-medium text-foreground flex-1 truncate">{r.name}</span>
                  <div className="w-12 h-1 rounded-full bg-muted/20 overflow-hidden">
                    <div className={cn("h-full rounded-full", r.wealthScore >= 75 ? "bg-chart-1" : r.wealthScore >= 55 ? "bg-chart-2" : "bg-chart-3")} style={{ width: `${r.wealthScore}%` }} />
                  </div>
                  <span className="text-[8px] tabular-nums text-foreground w-5 text-right">{r.wealthScore}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strategies */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Activity className="h-3 w-3 text-chart-3" />Automated Wealth Strategies
                <Badge variant="outline" className="text-[6px] h-3 ml-auto">{STRATEGIES.length} queued</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {STRATEGIES.map((s, i) => {
                const urgStyle = s.urgency === 'critical' ? 'text-destructive border-destructive/20 bg-destructive/5' : s.urgency === 'high' ? 'text-chart-3 border-chart-3/20 bg-chart-3/5' : 'text-chart-2 border-chart-2/20 bg-chart-2/5';
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className={cn("px-2 py-1.5 rounded-lg border", urgStyle)}>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={cn("text-[5px] h-3 px-1 shrink-0 uppercase", urgStyle)}>{s.urgency}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-medium text-foreground leading-tight">{s.action}</p>
                        <span className="text-[6px] text-chart-1 tabular-nums">{s.impact}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-5 text-[6px] px-1.5 shrink-0">
                        <CheckCircle className="h-2.5 w-2.5 mr-0.5" />Approve
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

export default AutonomousWealthInfrastructure;
