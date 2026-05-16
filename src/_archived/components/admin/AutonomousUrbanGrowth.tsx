import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, TrendingUp, Users, Zap, MapPin, ArrowUpRight,
  Target, Activity, Brain, Layers, BarChart3, Settings2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, BarChart, Bar
} from 'recharts';

/* ─── City Data ─── */
interface CityDistrict {
  id: string; name: string; x: number; y: number;
  densityGrowth: number; infraScore: number; demandIndex: number;
  yieldScore: number; vendorMaturity: number; listingLiquidity: number;
  txnVelocity: number; status: 'expanding' | 'stable' | 'emerging' | 'saturated';
}

const DISTRICTS: CityDistrict[] = [
  { id: 'seminyak', name: 'Seminyak', x: 28, y: 35, densityGrowth: 2.8, infraScore: 92, demandIndex: 88, yieldScore: 72, vendorMaturity: 95, listingLiquidity: 90, txnVelocity: 85, status: 'saturated' },
  { id: 'canggu', name: 'Canggu', x: 22, y: 42, densityGrowth: 8.5, infraScore: 78, demandIndex: 95, yieldScore: 84, vendorMaturity: 82, listingLiquidity: 75, txnVelocity: 88, status: 'expanding' },
  { id: 'ubud', name: 'Ubud', x: 45, y: 32, densityGrowth: 5.2, infraScore: 65, demandIndex: 72, yieldScore: 88, vendorMaturity: 68, listingLiquidity: 58, txnVelocity: 52, status: 'emerging' },
  { id: 'uluwatu', name: 'Uluwatu', x: 35, y: 72, densityGrowth: 12.4, infraScore: 55, demandIndex: 82, yieldScore: 92, vendorMaturity: 45, listingLiquidity: 42, txnVelocity: 38, status: 'expanding' },
  { id: 'sanur', name: 'Sanur', x: 55, y: 52, densityGrowth: 3.1, infraScore: 85, demandIndex: 55, yieldScore: 68, vendorMaturity: 78, listingLiquidity: 72, txnVelocity: 62, status: 'stable' },
  { id: 'pererenan', name: 'Pererenan', x: 18, y: 38, densityGrowth: 15.8, infraScore: 42, demandIndex: 78, yieldScore: 95, vendorMaturity: 32, listingLiquidity: 28, txnVelocity: 35, status: 'emerging' },
  { id: 'denpasar', name: 'Denpasar', x: 50, y: 48, densityGrowth: 4.2, infraScore: 88, demandIndex: 48, yieldScore: 52, vendorMaturity: 85, listingLiquidity: 82, txnVelocity: 72, status: 'stable' },
  { id: 'nusa_dua', name: 'Nusa Dua', x: 58, y: 68, densityGrowth: 6.8, infraScore: 72, demandIndex: 68, yieldScore: 78, vendorMaturity: 58, listingLiquidity: 55, txnVelocity: 48, status: 'expanding' },
];

const MIGRATION_FLOWS = [
  { from: 'seminyak', to: 'canggu', volume: 340 },
  { from: 'seminyak', to: 'pererenan', volume: 185 },
  { from: 'canggu', to: 'uluwatu', volume: 120 },
  { from: 'denpasar', to: 'sanur', volume: 95 },
  { from: 'ubud', to: 'nusa_dua', volume: 75 },
  { from: 'canggu', to: 'ubud', volume: 62 },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  expanding: { bg: 'bg-chart-1/15', text: 'text-chart-1' },
  stable: { bg: 'bg-chart-2/15', text: 'text-chart-2' },
  emerging: { bg: 'bg-chart-3/15', text: 'text-chart-3' },
  saturated: { bg: 'bg-muted/15', text: 'text-muted-foreground' },
};

const AutonomousUrbanGrowth = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [simVendorIncentive, setSimVendorIncentive] = useState([50]);
  const [simInfraInvest, setSimInfraInvest] = useState([50]);
  const [simPolicyEase, setSimPolicyEase] = useState([50]);

  const selected = selectedDistrict ? DISTRICTS.find(d => d.id === selectedDistrict) : null;

  const simFactor = useMemo(() => {
    return 1 + (simVendorIncentive[0] - 50) * 0.004 + (simInfraInvest[0] - 50) * 0.006 + (simPolicyEase[0] - 50) * 0.003;
  }, [simVendorIncentive, simInfraInvest, simPolicyEase]);

  const radarData = selected ? [
    { metric: 'Vendor Maturity', value: selected.vendorMaturity },
    { metric: 'Listing Liquidity', value: selected.listingLiquidity },
    { metric: 'Txn Velocity', value: selected.txnVelocity },
    { metric: 'Demand Index', value: selected.demandIndex },
    { metric: 'Infra Score', value: selected.infraScore },
    { metric: 'Yield Score', value: selected.yieldScore },
  ] : [];

  const growthProjection = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      baseline: 45 + i * 2.5 + Math.random() * 5,
      simulated: 45 + i * 2.5 * simFactor + Math.random() * 5,
    }));
  }, [simFactor]);

  const opportunityRanking = [...DISTRICTS].sort((a, b) => {
    const scoreA = (a.yieldScore * 0.35 + a.demandIndex * 0.3 + a.densityGrowth * 2) * simFactor;
    const scoreB = (b.yieldScore * 0.35 + b.demandIndex * 0.3 + b.densityGrowth * 2) * simFactor;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Autonomous Urban Growth Intelligence</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">PREDICTIVE</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* LEFT */}
        <div className="space-y-3">
          {/* District Expansion Map */}
          <Card className="border-border/20 overflow-hidden">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <MapPin className="h-3 w-3 text-chart-3" />City Expansion Heat · Demand Migration Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative" style={{ minHeight: 300 }}>
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

              {/* Migration flow arrows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {MIGRATION_FLOWS.map((flow, i) => {
                  const from = DISTRICTS.find(d => d.id === flow.from);
                  const to = DISTRICTS.find(d => d.id === flow.to);
                  if (!from || !to) return null;
                  return (
                    <motion.line key={i}
                      x1={`${from.x}%`} y1={`${from.y}%`}
                      x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={0.5 + flow.volume / 300}
                      strokeDasharray="3 4"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.15 + flow.volume / 1200 }}
                      transition={{ delay: i * 0.12 }}
                    />
                  );
                })}
              </svg>

              {/* District nodes */}
              {DISTRICTS.map((d, i) => {
                const size = 10 + (d.densityGrowth / 16) * 16;
                const isSelected = selectedDistrict === d.id;
                const style = STATUS_STYLE[d.status];
                return (
                  <motion.button key={d.id}
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setSelectedDistrict(isSelected ? null : d.id)}
                    className={cn("absolute flex flex-col items-center z-10 group", isSelected && "z-20")}
                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                  >
                    <div className={cn("rounded-full border-2 transition-all", isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent", style.bg)}
                      style={{ width: size, height: size }}
                    >
                      {d.status === 'expanding' && (
                        <motion.div className={cn("absolute inset-0 rounded-full", style.bg)}
                          animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          style={{ width: size, height: size }}
                        />
                      )}
                    </div>
                    <span className={cn("text-[7px] font-medium mt-0.5 whitespace-nowrap", isSelected ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground")}>{d.name}</span>
                    <span className="text-[5px] tabular-nums text-muted-foreground">+{d.densityGrowth}%</span>
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
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { l: 'Growth', v: `+${selected.densityGrowth}%` },
                        { l: 'Infra', v: `${selected.infraScore}/100` },
                        { l: 'Demand', v: `${selected.demandIndex}/100` },
                        { l: 'Yield', v: `${selected.yieldScore}/100` },
                        { l: 'Velocity', v: `${selected.txnVelocity}/100` },
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

          {/* Simulation Controls + Growth Projection */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Settings2 className="h-3 w-3 text-primary" />Policy & Investment Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                {/* Sliders */}
                <div className="space-y-3">
                  {[
                    { label: 'Vendor Incentive Level', value: simVendorIncentive, onChange: setSimVendorIncentive, icon: Users },
                    { label: 'Infrastructure Investment', value: simInfraInvest, onChange: setSimInfraInvest, icon: Building },
                    { label: 'Policy Ease Index', value: simPolicyEase, onChange: setSimPolicyEase, icon: Layers },
                  ].map(s => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <s.icon className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[8px] text-muted-foreground">{s.label}</span>
                        </div>
                        <span className="text-[8px] font-semibold text-foreground tabular-nums">{s.value[0]}%</span>
                      </div>
                      <Slider value={s.value} onValueChange={s.onChange} min={10} max={90} step={5} />
                    </div>
                  ))}
                  <div className="pt-1 border-t border-border/20">
                    <p className="text-[7px] text-muted-foreground">Simulation Factor</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{simFactor.toFixed(3)}x</p>
                  </div>
                </div>
                {/* Chart */}
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={growthProjection} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gSim" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                    <Area type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" strokeWidth={1} fill="none" strokeDasharray="3 3" name="Baseline" />
                    <Area type="monotone" dataKey="simulated" stroke="hsl(var(--chart-1))" fill="url(#gSim)" strokeWidth={2} name="Simulated" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">
          {/* Infrastructure Readiness Radar */}
          {selected && (
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                  <Target className="h-3 w-3 text-chart-2" />Infrastructure Readiness — {selected.name}
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

          {/* Investment Opportunity Index */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Brain className="h-3 w-3 text-chart-1" />Investment Opportunity Index
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1">
              {opportunityRanking.map((d, i) => {
                const score = Math.round((d.yieldScore * 0.35 + d.demandIndex * 0.3 + d.densityGrowth * 2) * simFactor);
                const style = STATUS_STYLE[d.status];
                return (
                  <div key={d.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-muted/5 rounded px-1" onClick={() => setSelectedDistrict(d.id)}>
                    <span className="text-[8px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
                    <span className="text-[9px] font-medium text-foreground flex-1 truncate">{d.name}</span>
                    <Badge className={cn("text-[5px] h-3 px-1", style.bg, style.text)}>{d.status}</Badge>
                    <div className="w-14 h-1 rounded-full bg-muted/20 overflow-hidden">
                      <div className={cn("h-full rounded-full", score >= 70 ? "bg-chart-1" : score >= 50 ? "bg-chart-2" : "bg-chart-3")} style={{ width: `${Math.min(100, score)}%` }} />
                    </div>
                    <span className="text-[8px] tabular-nums text-foreground w-5 text-right">{score}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Demand Migration Summary */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Activity className="h-3 w-3 text-chart-3" />Top Demand Migration Flows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {MIGRATION_FLOWS.slice(0, 5).map((flow, i) => {
                const from = DISTRICTS.find(d => d.id === flow.from);
                const to = DISTRICTS.find(d => d.id === flow.to);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[8px] text-muted-foreground w-16 truncate">{from?.name}</span>
                    <ArrowUpRight className="h-2.5 w-2.5 text-chart-1" />
                    <span className="text-[8px] font-medium text-foreground w-16 truncate">{to?.name}</span>
                    <span className="text-[7px] text-chart-1 tabular-nums ml-auto">+{flow.volume}</span>
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

export default AutonomousUrbanGrowth;
