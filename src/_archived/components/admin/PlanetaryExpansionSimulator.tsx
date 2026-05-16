import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, TrendingUp, Users, Activity, Zap, MapPin,
  ArrowUpRight, Target, DollarSign, BarChart3, Brain, Layers,
  Play, Settings2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line
} from 'recharts';

/* ─── City Data ─── */
interface SimCity {
  id: string;
  name: string;
  country: string;
  readiness: number;
  vendorVelocity: number;
  liquidityIndex: number;
  regulatoryFriction: number;
  demandElasticity: number;
  deployCost: number; // billions IDR
  launchYear: number; // conservative
  x: number; y: number;
  status: 'active' | 'planned' | 'future';
}

const CITIES: SimCity[] = [
  { id: 'bali', name: 'Bali', country: 'ID', readiness: 95, vendorVelocity: 89, liquidityIndex: 92, regulatoryFriction: 15, demandElasticity: 88, deployCost: 1.2, launchYear: 0, x: 32, y: 42, status: 'active' },
  { id: 'jakarta', name: 'Jakarta', country: 'ID', readiness: 82, vendorVelocity: 72, liquidityIndex: 78, regulatoryFriction: 22, demandElasticity: 75, deployCost: 1.8, launchYear: 0, x: 25, y: 48, status: 'active' },
  { id: 'surabaya', name: 'Surabaya', country: 'ID', readiness: 65, vendorVelocity: 48, liquidityIndex: 55, regulatoryFriction: 18, demandElasticity: 62, deployCost: 1.0, launchYear: 1, x: 30, y: 50, status: 'active' },
  { id: 'lombok', name: 'Lombok', country: 'ID', readiness: 58, vendorVelocity: 35, liquidityIndex: 42, regulatoryFriction: 20, demandElasticity: 70, deployCost: 0.8, launchYear: 1, x: 34, y: 44, status: 'planned' },
  { id: 'bandung', name: 'Bandung', country: 'ID', readiness: 45, vendorVelocity: 30, liquidityIndex: 38, regulatoryFriction: 16, demandElasticity: 55, deployCost: 0.7, launchYear: 2, x: 26, y: 50, status: 'planned' },
  { id: 'makassar', name: 'Makassar', country: 'ID', readiness: 38, vendorVelocity: 22, liquidityIndex: 28, regulatoryFriction: 25, demandElasticity: 48, deployCost: 0.9, launchYear: 3, x: 38, y: 52, status: 'future' },
  { id: 'dubai', name: 'Dubai', country: 'AE', readiness: 42, vendorVelocity: 28, liquidityIndex: 65, regulatoryFriction: 30, demandElasticity: 82, deployCost: 3.5, launchYear: 3, x: 52, y: 28, status: 'future' },
  { id: 'bangkok', name: 'Bangkok', country: 'TH', readiness: 35, vendorVelocity: 20, liquidityIndex: 48, regulatoryFriction: 28, demandElasticity: 60, deployCost: 2.2, launchYear: 4, x: 42, y: 35, status: 'future' },
  { id: 'singapore', name: 'Singapore', country: 'SG', readiness: 30, vendorVelocity: 15, liquidityIndex: 72, regulatoryFriction: 35, demandElasticity: 78, deployCost: 4.0, launchYear: 4, x: 38, y: 48, status: 'future' },
  { id: 'kualalumpur', name: 'KL', country: 'MY', readiness: 28, vendorVelocity: 18, liquidityIndex: 45, regulatoryFriction: 24, demandElasticity: 55, deployCost: 2.0, launchYear: 5, x: 40, y: 42, status: 'future' },
  { id: 'sydney', name: 'Sydney', country: 'AU', readiness: 20, vendorVelocity: 10, liquidityIndex: 68, regulatoryFriction: 40, demandElasticity: 72, deployCost: 5.0, launchYear: 7, x: 60, y: 72, status: 'future' },
  { id: 'london', name: 'London', country: 'UK', readiness: 15, vendorVelocity: 8, liquidityIndex: 75, regulatoryFriction: 45, demandElasticity: 65, deployCost: 6.0, launchYear: 8, x: 48, y: 15, status: 'future' },
];

type ScenarioMode = 'conservative' | 'ai_accelerated' | 'aggressive';

const SCENARIO_MULTIPLIERS: Record<ScenarioMode, { speed: number; cost: number; label: string }> = {
  conservative: { speed: 1.0, cost: 1.0, label: 'Conservative Rollout' },
  ai_accelerated: { speed: 1.6, cost: 0.85, label: 'AI-Accelerated Expansion' },
  aggressive: { speed: 2.2, cost: 1.15, label: 'Aggressive Category Capture' },
};

const formatRp = (v: number) => {
  if (v >= 1000) return `Rp ${(v / 1000).toFixed(1)}T`;
  if (v >= 1) return `Rp ${v.toFixed(1)}B`;
  return `Rp ${(v * 1000).toFixed(0)}M`;
};

const PlanetaryExpansionSimulator = () => {
  const [year, setYear] = useState([2]);
  const [scenario, setScenario] = useState<ScenarioMode>('ai_accelerated');

  const currentYear = year[0];
  const mult = SCENARIO_MULTIPLIERS[scenario];

  const activeCities = useMemo(() => {
    return CITIES.filter(c => {
      const adjustedLaunch = Math.max(0, Math.round(c.launchYear / mult.speed));
      return adjustedLaunch <= currentYear;
    });
  }, [currentYear, mult.speed]);

  const projections = useMemo(() => {
    const data = [];
    for (let y = 0; y <= 10; y++) {
      const launched = CITIES.filter(c => Math.round(c.launchYear / mult.speed) <= y).length;
      const baseGMV = 1.6; // T year 0
      const growthFactor = 1 + (0.35 * mult.speed);
      const gmv = baseGMV * Math.pow(growthFactor, y);
      const vendors = 400 + launched * 120 * mult.speed;
      const penetration = Math.min(98, 12 + y * 8 * mult.speed);
      const complexity = 10 + launched * 8;
      data.push({ year: `Y${y}`, gmv: Math.round(gmv * 10) / 10, vendors: Math.round(vendors), penetration: Math.round(penetration), complexity: Math.round(complexity), markets: launched });
    }
    return data;
  }, [mult.speed]);

  const currentProj = projections[currentYear] || projections[0];

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Planetary Expansion Simulator</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">SIMULATION</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(SCENARIO_MULTIPLIERS) as ScenarioMode[]).map(mode => (
            <Button
              key={mode}
              variant={scenario === mode ? 'default' : 'outline'}
              size="sm"
              className="h-5 text-[8px] px-2"
              onClick={() => setScenario(mode)}
            >
              {SCENARIO_MULTIPLIERS[mode].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline Slider */}
      <Card className="border-border/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-muted-foreground w-12">Year {currentYear}</span>
            <Slider value={year} onValueChange={setYear} min={0} max={10} step={1} className="flex-1" />
            <span className="text-[9px] text-muted-foreground w-10">Y10</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[8px] text-muted-foreground">{activeCities.length} of {CITIES.length} markets launched</span>
            <Badge className="text-[7px] h-3.5 bg-primary/10 text-primary border-0">{mult.label}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Simulated GMV', value: `Rp ${currentProj.gmv}T`, icon: DollarSign, change: `+${Math.round((currentProj.gmv / 1.6 - 1) * 100)}%` },
          { label: 'Markets Active', value: currentProj.markets.toString(), icon: Globe },
          { label: 'Vendor Network', value: currentProj.vendors.toLocaleString(), icon: Users },
          { label: 'Penetration', value: `${currentProj.penetration}%`, icon: Target },
          { label: 'Complexity', value: `${currentProj.complexity}/100`, icon: Layers },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/20">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <kpi.icon className="h-2.5 w-2.5 text-muted-foreground" />
                <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
              {kpi.change && <p className="text-[7px] text-chart-1">{kpi.change} from baseline</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Map + Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* Map */}
        <Card className="border-border/20 overflow-hidden">
          <CardHeader className="p-2.5 pb-1.5">
            <CardTitle className="text-[10px] font-semibold">Global Expansion Map — Year {currentYear}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative" style={{ minHeight: 320 }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute inset-4">
              {CITIES.map(city => {
                const adjustedLaunch = Math.round(city.launchYear / mult.speed);
                const isLaunched = adjustedLaunch <= currentYear;
                const size = isLaunched ? 10 + (city.readiness / 100) * 18 : 6;
                return (
                  <motion.div
                    key={city.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: isLaunched ? 1 : 0.5, opacity: isLaunched ? 1 : 0.25 }}
                    transition={{ duration: 0.5 }}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${city.x}%`, top: `${city.y}%` }}
                  >
                    <div
                      className={cn(
                        "rounded-full border-2 transition-all",
                        isLaunched ? "bg-primary/30 border-primary" : "bg-muted/20 border-border/20"
                      )}
                      style={{ width: size, height: size }}
                    >
                      {isLaunched && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20"
                          animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <span className={cn(
                      "text-[6px] font-medium mt-0.5 whitespace-nowrap",
                      isLaunched ? "text-foreground" : "text-muted-foreground/40"
                    )}>{city.name}</span>
                    {isLaunched && (
                      <span className="text-[5px] text-chart-1 tabular-nums">R:{city.readiness}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* City readiness list */}
        <Card className="border-border/20">
          <CardHeader className="p-2.5 pb-1.5">
            <CardTitle className="text-[10px] font-semibold">Market Readiness</CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-1.5">
            {CITIES.sort((a, b) => b.readiness - a.readiness).map(city => {
              const adjustedLaunch = Math.round(city.launchYear / mult.speed);
              const isLaunched = adjustedLaunch <= currentYear;
              return (
                <div key={city.id} className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", isLaunched ? "bg-chart-1" : "bg-muted-foreground/30")} />
                  <span className="text-[9px] font-medium text-foreground w-16 truncate">{city.name}</span>
                  <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
                    <div className={cn("h-full rounded-full", isLaunched ? "bg-primary" : "bg-muted-foreground/20")} style={{ width: `${city.readiness}%` }} />
                  </div>
                  <span className="text-[8px] tabular-nums text-foreground w-6 text-right">{city.readiness}</span>
                  <Badge variant="outline" className={cn("text-[6px] h-3 px-1", isLaunched ? "text-chart-1 border-chart-1/20" : "text-muted-foreground border-border/20")}>
                    {isLaunched ? 'LIVE' : `Y${adjustedLaunch}`}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* GMV Growth Curve */}
      <Card className="border-border/20">
        <CardHeader className="p-2.5 pb-1.5">
          <CardTitle className="text-[10px] font-semibold">Projected GMV Growth — {mult.label}</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={projections} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gPlanetary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}T`} width={35} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} formatter={(v: number) => [`Rp ${v}T`, 'GMV']} />
              <Area type="monotone" dataKey="gmv" stroke="hsl(var(--primary))" fill="url(#gPlanetary)" strokeWidth={2} />
              {/* Current year indicator */}
              {currentYear <= 10 && (
                <Line type="monotone" dataKey={() => null} />
              )}
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[7px] text-muted-foreground">Year {currentYear}: Rp {currentProj.gmv}T projected GMV across {currentProj.markets} markets</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanetaryExpansionSimulator;
