import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, TrendingUp, Users, Zap, MapPin, ArrowUpRight, ArrowDownRight,
  Target, Activity, Brain, Layers, BarChart3, TreePine, Building, Home
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface HabitatRegion {
  id: string; name: string; x: number; y: number;
  population: number; densityGrowth: number; demandCluster: number;
  infraScore: number; affordability: number; liquidity: number;
  sustainability: number; livability: number;
  status: 'megacity' | 'expanding' | 'emerging' | 'frontier';
}

const REGIONS: HabitatRegion[] = [
  { id: 'jkt', name: 'Jakarta Metro', x: 28, y: 52, population: 34.5, densityGrowth: 3.8, demandCluster: 92, infraScore: 78, affordability: 45, liquidity: 82, sustainability: 55, livability: 62, status: 'megacity' },
  { id: 'bali', name: 'Bali Corridor', x: 36, y: 56, population: 4.3, densityGrowth: 8.2, demandCluster: 88, infraScore: 65, affordability: 38, liquidity: 94, sustainability: 72, livability: 85, status: 'expanding' },
  { id: 'dubai', name: 'Dubai-Abu Dhabi', x: 54, y: 30, population: 5.8, densityGrowth: 5.5, demandCluster: 82, infraScore: 95, affordability: 35, liquidity: 78, sustainability: 68, livability: 88, status: 'megacity' },
  { id: 'sg', name: 'Singapore', x: 38, y: 50, population: 5.9, densityGrowth: 1.2, demandCluster: 75, infraScore: 98, affordability: 22, liquidity: 88, sustainability: 82, livability: 92, status: 'megacity' },
  { id: 'bangkok', name: 'Bangkok Metro', x: 40, y: 38, population: 16.2, densityGrowth: 2.8, demandCluster: 68, infraScore: 72, affordability: 62, liquidity: 65, sustainability: 48, livability: 58, status: 'expanding' },
  { id: 'lombok', name: 'Lombok SEZ', x: 38, y: 58, population: 3.4, densityGrowth: 14.5, demandCluster: 52, infraScore: 35, affordability: 78, liquidity: 32, sustainability: 65, livability: 55, status: 'frontier' },
  { id: 'surabaya', name: 'Surabaya', x: 32, y: 54, population: 12.8, densityGrowth: 4.2, demandCluster: 58, infraScore: 62, affordability: 68, liquidity: 48, sustainability: 52, livability: 55, status: 'emerging' },
  { id: 'kl', name: 'Kuala Lumpur', x: 36, y: 46, population: 8.4, densityGrowth: 3.5, demandCluster: 65, infraScore: 82, affordability: 55, liquidity: 62, sustainability: 58, livability: 72, status: 'expanding' },
  { id: 'ho_chi_minh', name: 'Ho Chi Minh', x: 42, y: 42, population: 13.3, densityGrowth: 6.8, demandCluster: 72, infraScore: 58, affordability: 72, liquidity: 55, sustainability: 45, livability: 52, status: 'emerging' },
  { id: 'manila', name: 'Manila Metro', x: 46, y: 42, population: 28.4, densityGrowth: 2.2, demandCluster: 62, infraScore: 48, affordability: 65, liquidity: 42, sustainability: 38, livability: 42, status: 'megacity' },
];

const MIGRATION_FLOWS = [
  { from: 'jkt', to: 'bali', volume: 420, trend: 'accelerating' },
  { from: 'sg', to: 'bali', volume: 280, trend: 'stable' },
  { from: 'jkt', to: 'surabaya', volume: 180, trend: 'stable' },
  { from: 'bangkok', to: 'bali', volume: 145, trend: 'accelerating' },
  { from: 'kl', to: 'jkt', volume: 120, trend: 'decelerating' },
  { from: 'dubai', to: 'bali', volume: 95, trend: 'accelerating' },
  { from: 'sg', to: 'kl', volume: 85, trend: 'stable' },
  { from: 'ho_chi_minh', to: 'bangkok', volume: 72, trend: 'stable' },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; glow: string }> = {
  megacity: { bg: 'bg-primary/20', text: 'text-primary', glow: 'primary' },
  expanding: { bg: 'bg-chart-1/20', text: 'text-chart-1', glow: 'chart-1' },
  emerging: { bg: 'bg-chart-3/20', text: 'text-chart-3', glow: 'chart-3' },
  frontier: { bg: 'bg-chart-2/20', text: 'text-chart-2', glow: 'chart-2' },
};

const EXPANSION_DATA = Array.from({ length: 20 }, (_, i) => ({
  year: `Y${i + 1}`,
  urbanDensity: 42 + i * 2.2 + Math.random() * 3,
  propDemand: 35 + i * 2.8 + Math.random() * 4,
  infraCoverage: 38 + i * 1.8 + Math.random() * 3,
}));

const PlanetaryHabitatGrid = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'density' | 'expansion' | 'sustainability' | 'migration'>('density');

  const selected = selectedRegion ? REGIONS.find(r => r.id === selectedRegion) : null;

  const radarData = selected ? [
    { metric: 'Infrastructure', value: selected.infraScore },
    { metric: 'Affordability', value: selected.affordability },
    { metric: 'Liquidity', value: selected.liquidity },
    { metric: 'Sustainability', value: selected.sustainability },
    { metric: 'Livability', value: selected.livability },
    { metric: 'Demand', value: selected.demandCluster },
  ] : [];

  const avgLivability = Math.round(REGIONS.reduce((s, r) => s + r.livability, 0) / REGIONS.length);
  const totalPop = REGIONS.reduce((s, r) => s + r.population, 0);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Planetary Habitat Intelligence Grid</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">PREDICTIVE</Badge>
        </div>
        <div className="flex items-center gap-1">
          {(['density', 'expansion', 'sustainability', 'migration'] as const).map(l => (
            <Button key={l} variant={activeLayer === l ? 'default' : 'outline'} size="sm" className="h-5 text-[6px] px-1.5 capitalize" onClick={() => setActiveLayer(l)}>{l}</Button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Total Population Covered', value: `${totalPop.toFixed(1)}M`, icon: Users, delta: '+4.2%', up: true },
          { label: 'Habitat Regions', value: `${REGIONS.length}`, icon: MapPin, delta: '+2', up: true },
          { label: 'Avg Livability Index', value: `${avgLivability}/100`, icon: TreePine, delta: '+3.8', up: true },
          { label: 'Expansion Zones', value: `${REGIONS.filter(r => r.status === 'expanding' || r.status === 'frontier').length}`, icon: Building, delta: '+1', up: true },
          { label: 'Migration Flows', value: `${MIGRATION_FLOWS.length}`, icon: Activity, delta: '+12%', up: true },
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
        {/* LEFT — Map */}
        <div className="space-y-3">
          <Card className="border-border/20 overflow-hidden">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Layers className="h-3 w-3 text-primary" />Habitat Density & Demand Clusters
                <Badge variant="outline" className="text-[6px] h-3 ml-auto">click regions to inspect</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative" style={{ minHeight: 320 }}>
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

              {/* Migration flow arrows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {activeLayer === 'migration' && MIGRATION_FLOWS.map((flow, i) => {
                  const from = REGIONS.find(r => r.id === flow.from);
                  const to = REGIONS.find(r => r.id === flow.to);
                  if (!from || !to) return null;
                  return (
                    <motion.line key={i}
                      x1={`${from.x}%`} y1={`${from.y}%`}
                      x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke={flow.trend === 'accelerating' ? 'hsl(var(--chart-1))' : 'hsl(var(--muted-foreground))'}
                      strokeWidth={0.5 + flow.volume / 350}
                      strokeDasharray="3 4"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.12 + flow.volume / 1500 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  );
                })}
              </svg>

              {/* Region nodes */}
              {REGIONS.map((region, i) => {
                const size = activeLayer === 'density' ? 8 + (region.population / 35) * 18
                  : activeLayer === 'expansion' ? 8 + (region.densityGrowth / 15) * 18
                  : activeLayer === 'sustainability' ? 8 + (region.sustainability / 100) * 18
                  : 8 + (region.demandCluster / 100) * 18;
                const isSelected = selectedRegion === region.id;
                const style = STATUS_STYLE[region.status];
                return (
                  <motion.button key={region.id}
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setSelectedRegion(isSelected ? null : region.id)}
                    className={cn("absolute flex flex-col items-center z-10 group", isSelected && "z-20")}
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  >
                    <div className="relative">
                      <div className={cn("rounded-full border-2 transition-all", isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-foreground/20", style.bg)}
                        style={{ width: size, height: size }}
                      />
                      {(region.status === 'expanding' || region.status === 'frontier') && (
                        <motion.div className={cn("absolute inset-0 rounded-full", style.bg)}
                          animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 3.5, repeat: Infinity }}
                          style={{ width: size, height: size }}
                        />
                      )}
                    </div>
                    <span className={cn("text-[7px] font-medium mt-0.5 whitespace-nowrap", isSelected ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground")}>{region.name}</span>
                    <span className="text-[5px] tabular-nums text-muted-foreground">{region.population}M · +{region.densityGrowth}%</span>
                  </motion.button>
                );
              })}

              {/* Selected detail */}
              <AnimatePresence>
                {selected && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-2 left-2 right-2 p-3 rounded-lg border border-border/30 bg-background/90 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{selected.name}</span>
                      <Badge className={cn("text-[6px] h-3 px-1", STATUS_STYLE[selected.status].bg, STATUS_STYLE[selected.status].text)}>{selected.status}</Badge>
                      <span className="text-[7px] text-muted-foreground ml-auto">{selected.population}M population</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { l: 'Demand', v: `${selected.demandCluster}/100` },
                        { l: 'Infra', v: `${selected.infraScore}/100` },
                        { l: 'Afford.', v: `${selected.affordability}/100` },
                        { l: 'Liquidity', v: `${selected.liquidity}/100` },
                        { l: 'Sustain.', v: `${selected.sustainability}/100` },
                        { l: 'Livability', v: `${selected.livability}/100` },
                      ].map(s => (
                        <div key={s.l} className="text-center">
                          <p className="text-[6px] text-muted-foreground">{s.l}</p>
                          <p className="text-[10px] font-bold text-foreground tabular-nums">{s.v}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Expansion Trajectory */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-chart-2" />Urban Expansion Trajectory — 20-Year Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={EXPANSION_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Area type="monotone" dataKey="urbanDensity" stroke="hsl(var(--primary))" fill="url(#gDensity)" strokeWidth={2} name="Urban Density %" />
                  <Area type="monotone" dataKey="propDemand" stroke="hsl(var(--chart-1))" fill="url(#gDemand)" strokeWidth={2} name="Property Demand" />
                  <Area type="monotone" dataKey="infraCoverage" stroke="hsl(var(--chart-3))" fill="none" strokeWidth={1} strokeDasharray="3 3" name="Infra Coverage" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-1">
                {[
                  { label: 'Urban Density', color: 'bg-primary' },
                  { label: 'Property Demand', color: 'bg-chart-1' },
                  { label: 'Infra Coverage', color: 'bg-chart-3' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <span className={cn("h-1.5 w-3 rounded-sm", l.color)} />
                    <span className="text-[7px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">
          {/* Livability Radar */}
          {selected && (
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                  <Target className="h-3 w-3 text-chart-2" />Sustainability & Livability — {selected.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0">
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 6, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Habitat Ranking */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Brain className="h-3 w-3 text-chart-1" />Habitat Intelligence Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1">
              {[...REGIONS].sort((a, b) => {
                const sa = a.livability * 0.25 + a.sustainability * 0.2 + a.demandCluster * 0.2 + a.infraScore * 0.2 + a.liquidity * 0.15;
                const sb = b.livability * 0.25 + b.sustainability * 0.2 + b.demandCluster * 0.2 + b.infraScore * 0.2 + b.liquidity * 0.15;
                return sb - sa;
              }).map((r, i) => {
                const score = Math.round(r.livability * 0.25 + r.sustainability * 0.2 + r.demandCluster * 0.2 + r.infraScore * 0.2 + r.liquidity * 0.15);
                const style = STATUS_STYLE[r.status];
                return (
                  <div key={r.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-muted/5 rounded px-1" onClick={() => setSelectedRegion(r.id)}>
                    <span className="text-[8px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
                    <span className="text-[9px] font-medium text-foreground flex-1 truncate">{r.name}</span>
                    <Badge className={cn("text-[5px] h-3 px-1", style.bg, style.text)}>{r.status}</Badge>
                    <div className="w-14 h-1 rounded-full bg-muted/20 overflow-hidden">
                      <div className={cn("h-full rounded-full", score >= 70 ? "bg-chart-1" : score >= 50 ? "bg-chart-2" : "bg-chart-3")} style={{ width: `${Math.min(100, score)}%` }} />
                    </div>
                    <span className="text-[8px] tabular-nums text-foreground w-5 text-right">{score}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Migration Summary */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Activity className="h-3 w-3 text-chart-3" />Demand Migration Flows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {MIGRATION_FLOWS.slice(0, 6).map((flow, i) => {
                const from = REGIONS.find(r => r.id === flow.from);
                const to = REGIONS.find(r => r.id === flow.to);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[8px] text-muted-foreground w-20 truncate">{from?.name}</span>
                    <ArrowUpRight className="h-2.5 w-2.5 text-chart-1" />
                    <span className="text-[8px] font-medium text-foreground w-20 truncate">{to?.name}</span>
                    <Badge variant="outline" className={cn("text-[5px] h-3 px-1 ml-auto", flow.trend === 'accelerating' ? 'text-chart-1 border-chart-1/20' : 'text-muted-foreground')}>{flow.trend}</Badge>
                    <span className="text-[7px] text-chart-1 tabular-nums">+{flow.volume}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryHabitatGrid;
