import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Globe, TrendingUp, Users, Zap, Target, DollarSign,
  BarChart3, Brain, Layers, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line
} from 'recharts';

/* ─── Simulation ─── */
type ScenarioMode = 'gradual' | 'ai_accelerated' | 'hyper_connected';
const SCENARIOS: Record<ScenarioMode, { label: string; growth: number; autoSat: number }> = {
  gradual: { label: 'Gradual Adoption', growth: 1.18, autoSat: 0.6 },
  ai_accelerated: { label: 'AI-Accelerated', growth: 1.28, autoSat: 0.85 },
  hyper_connected: { label: 'Hyper-Connected', growth: 1.38, autoSat: 0.95 },
};

const YEAR_MARKS = [1, 5, 20, 50, 100];

interface SimVars {
  urbanization: number;
  digitalAdoption: number;
  pricingEfficiency: number;
  capitalHarmonization: number;
  regulatoryIntegration: number;
}

const DEFAULT_VARS: SimVars = {
  urbanization: 68,
  digitalAdoption: 45,
  pricingEfficiency: 35,
  capitalHarmonization: 28,
  regulatoryIntegration: 22,
};

const formatGMV = (v: number) => {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`;
  if (v >= 1) return `$${v.toFixed(0)}B`;
  return `$${(v * 1000).toFixed(0)}M`;
};

const CenturyEvolutionSimulator = () => {
  const [yearSlider, setYearSlider] = useState([20]);
  const [scenario, setScenario] = useState<ScenarioMode>('ai_accelerated');
  const [vars, setVars] = useState<SimVars>(DEFAULT_VARS);

  const currentYear = yearSlider[0];
  const sc = SCENARIOS[scenario];

  const projections = useMemo(() => {
    const data = [];
    for (let y = 0; y <= 100; y += (y < 10 ? 1 : y < 50 ? 5 : 10)) {
      const urbanFactor = 1 + (vars.urbanization / 100) * (y / 100);
      const digitalFactor = Math.min(1, (vars.digitalAdoption / 100) + y * 0.008 * sc.growth);
      const gmv = 0.8 * Math.pow(sc.growth, Math.min(y, 30)) * urbanFactor * (1 + digitalFactor);
      const markets = Math.min(195, 6 + Math.round(y * 2.2 * (sc.growth - 1) * 10));
      const vendors = Math.round(600 * Math.pow(1 + 0.15 * (sc.growth - 1) * 10, Math.min(y, 40)));
      const automation = Math.min(sc.autoSat * 100, 15 + y * 1.2 * sc.autoSat);
      const penetration = Math.min(85, 2 + y * 0.9 * (sc.growth - 1) * 20);

      data.push({ year: y, label: `Y${y}`, gmv: Math.round(gmv * 10) / 10, markets, vendors: Math.min(vendors, 500000), automation: Math.round(automation), penetration: Math.round(penetration * 10) / 10 });
    }
    return data;
  }, [sc, vars]);

  const currentProj = useMemo(() => {
    let closest = projections[0];
    for (const p of projections) {
      if (Math.abs(p.year - currentYear) < Math.abs(closest.year - currentYear)) closest = p;
    }
    return closest;
  }, [projections, currentYear]);

  const updateVar = (key: keyof SimVars, val: number[]) => setVars(prev => ({ ...prev, [key]: val[0] }));

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">100-Year Evolution Simulator</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-primary border-primary/20">SPECULATIVE</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(SCENARIOS) as ScenarioMode[]).map(mode => (
            <Button key={mode} variant={scenario === mode ? 'default' : 'outline'} size="sm" className="h-5 text-[7px] px-2" onClick={() => setScenario(mode)}>
              {SCENARIOS[mode].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Year Slider */}
      <Card className="border-border/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-muted-foreground w-14">Year {currentYear}</span>
            <Slider value={yearSlider} onValueChange={setYearSlider} min={1} max={100} step={1} className="flex-1" />
            <span className="text-[9px] text-muted-foreground w-8">Y100</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            {YEAR_MARKS.map(y => (
              <button key={y} onClick={() => setYearSlider([y])} className={cn("text-[7px] px-1.5 py-0.5 rounded transition-colors", currentYear === y ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}>
                Y{y}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projected KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Global GMV', value: formatGMV(currentProj.gmv), icon: DollarSign },
          { label: 'Markets', value: currentProj.markets.toString(), icon: Globe },
          { label: 'Vendor Network', value: currentProj.vendors >= 1000 ? `${(currentProj.vendors / 1000).toFixed(0)}K` : currentProj.vendors.toString(), icon: Users },
          { label: 'Automation', value: `${currentProj.automation}%`, icon: Zap },
          { label: 'Penetration', value: `${currentProj.penetration}%`, icon: Target },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/20">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <kpi.icon className="h-2.5 w-2.5 text-muted-foreground" />
                <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* GMV Curve */}
        <Card className="border-border/20">
          <CardHeader className="p-2.5 pb-1.5">
            <CardTitle className="text-[10px] font-semibold">GMV Trajectory — {sc.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={projections} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCentury" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => formatGMV(v)} width={40} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} formatter={(v: number) => [formatGMV(v), 'GMV']} />
                <Area type="monotone" dataKey="gmv" stroke="hsl(var(--primary))" fill="url(#gCentury)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Simulation Variables */}
        <Card className="border-border/20">
          <CardHeader className="p-2.5 pb-1.5">
            <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
              <Brain className="h-3 w-3 text-primary" />Simulation Variables
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-3">
            {[
              { key: 'urbanization' as const, label: 'Global Urbanization Velocity', icon: TrendingUp },
              { key: 'digitalAdoption' as const, label: 'Digital Transaction Adoption', icon: Zap },
              { key: 'pricingEfficiency' as const, label: 'Autonomous Pricing Efficiency', icon: Brain },
              { key: 'capitalHarmonization' as const, label: 'Capital Liquidity Harmonization', icon: DollarSign },
              { key: 'regulatoryIntegration' as const, label: 'Regulatory Integration Maturity', icon: Layers },
            ].map(v => (
              <div key={v.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <v.icon className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[8px] text-muted-foreground">{v.label}</span>
                  </div>
                  <span className="text-[8px] font-semibold text-foreground tabular-nums">{vars[v.key]}%</span>
                </div>
                <Slider value={[vars[v.key]]} onValueChange={val => updateVar(v.key, val)} min={5} max={95} step={5} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Multi-metric evolution */}
      <Card className="border-border/20">
        <CardHeader className="p-2.5 pb-1.5">
          <CardTitle className="text-[10px] font-semibold">Multi-Metric Evolution</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={projections} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="label" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
              <Line type="monotone" dataKey="automation" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Automation %" />
              <Line type="monotone" dataKey="penetration" stroke="hsl(var(--chart-1))" strokeWidth={1.5} dot={false} name="Penetration %" />
              <Line type="monotone" dataKey="markets" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} name="Markets" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-1">
            {[
              { label: 'Automation', color: 'bg-primary' },
              { label: 'Penetration', color: 'bg-chart-1' },
              { label: 'Markets', color: 'bg-chart-2' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <span className={cn("h-1.5 w-1.5 rounded-sm", l.color)} />
                <span className="text-[7px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenturyEvolutionSimulator;
