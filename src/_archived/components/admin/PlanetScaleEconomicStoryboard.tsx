import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Brain, Network, TrendingUp, Sparkles, ChevronRight, BarChart3,
  ArrowUpRight, Zap, MapPin, Activity, Target
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SCENES = [
  { id: 'A', title: 'Global Market Fragmentation', subtitle: 'Disconnected property economies operating in isolation — $280T addressable market', icon: Globe, color: 'text-destructive' },
  { id: 'B', title: 'ASTRA Intelligence Grid Activation', subtitle: 'Coordinated data networks linking vendors, investors, and assets across 12+ markets', icon: Brain, color: 'text-primary' },
  { id: 'C', title: 'Cross-Border Transaction Flows', subtitle: 'Synchronized capital movement and deal execution across continental corridors', icon: Network, color: 'text-chart-1' },
  { id: 'D', title: 'Emerging Urban Region Expansion', subtitle: 'Predictive intelligence identifying and activating next-generation property markets', icon: MapPin, color: 'text-chart-2' },
  { id: 'E', title: 'Long-Term Economic Efficiency', subtitle: 'Measurable improvement in transaction velocity, pricing accuracy, and market stability', icon: TrendingUp, color: 'text-chart-1' },
];

const EFFICIENCY_DATA = Array.from({ length: 20 }, (_, i) => ({
  year: `Y${i + 1}`,
  txnVelocity: 35 + i * 3 + Math.random() * 4,
  pricingAccuracy: 55 + i * 2 + Math.random() * 3,
  marketStability: 42 + i * 2.5 + Math.random() * 3,
  friction: Math.max(8, 65 - i * 2.8 + Math.random() * 3),
}));

const EXPANSION_CITIES = [
  { name: 'Bali', readiness: 94, phase: 'Active', growth: '+42%' },
  { name: 'Jakarta', readiness: 88, phase: 'Active', growth: '+28%' },
  { name: 'Dubai', readiness: 82, phase: 'Active', growth: '+35%' },
  { name: 'Singapore', readiness: 92, phase: 'Active', growth: '+18%' },
  { name: 'Bangkok', readiness: 68, phase: 'Expanding', growth: '+52%' },
  { name: 'Ho Chi Minh', readiness: 55, phase: 'Emerging', growth: '+68%' },
  { name: 'Lombok', readiness: 42, phase: 'Frontier', growth: '+85%' },
  { name: 'Nairobi', readiness: 28, phase: 'Scouting', growth: '+120%' },
];

const PlanetScaleEconomicStoryboard = () => {
  const [scene, setScene] = useState(0);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Planet-Scale Economic Intelligence Storyboard</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-2 border-chart-2/20">PRESENTATION</Badge>
        </div>
        <div className="flex items-center gap-1">
          {SCENES.map((s, i) => (
            <Button key={s.id} variant={scene === i ? 'default' : 'outline'} size="sm" className="h-5 text-[6px] px-1.5"
              onClick={() => setScene(i)}>Scene {s.id}</Button>
          ))}
        </div>
      </div>

      {/* Scene Header */}
      <Card className="border-border/20">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {React.createElement(SCENES[scene].icon, { className: cn("h-3.5 w-3.5", SCENES[scene].color) })}
            <div>
              <p className="text-[8px] text-primary uppercase tracking-wider">Scene {SCENES[scene].id} / {SCENES.length}</p>
              <p className="text-xs font-semibold text-foreground">{SCENES[scene].title}</p>
              <p className="text-[8px] text-muted-foreground">{SCENES[scene].subtitle}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2" disabled={scene === 0} onClick={() => setScene(s => s - 1)}>Prev</Button>
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2 gap-0.5" onClick={() => setScene(s => s < 4 ? s + 1 : 0)}>
              {scene < 4 ? 'Next' : 'Restart'}<ChevronRight className="h-2.5 w-2.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="border-border/20 overflow-hidden">
        <CardContent className="p-0 relative" style={{ minHeight: 340 }}>
          <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

          <AnimatePresence mode="wait">
            {scene === 0 && (
              <motion.div key="sA" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: '80%', height: '80%' }}>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.15 + Math.random() * 0.15 }}
                      transition={{ delay: i * 0.03 }}
                      className="absolute rounded-full bg-destructive/20 border border-destructive/10"
                      style={{ left: `${5 + Math.random() * 90}%`, top: `${5 + Math.random() * 90}%`, width: 2 + Math.random() * 6, height: 2 + Math.random() * 6 }} />
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                    className="absolute text-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                    <p className="text-2xl font-bold text-foreground/20 tabular-nums">$280T</p>
                    <p className="text-[8px] text-muted-foreground mt-1">Fragmented · Opaque · Inefficient</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {scene === 1 && (
              <motion.div key="sB" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: '75%', height: '75%' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                    className="absolute flex flex-col items-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                    <div className="relative h-10 w-10 rounded-full bg-primary/25 border-2 border-primary flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                      <motion.div className="absolute inset-0 rounded-full bg-primary/10" animate={{ scale: [1, 3, 1], opacity: [0.2, 0, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
                    </div>
                    <span className="text-[7px] font-bold text-primary mt-1.5">ASTRA GRID</span>
                  </motion.div>
                  {[{ l: 'Bali', x: 20, y: 15 }, { l: 'Jakarta', x: 80, y: 15 }, { l: 'Dubai', x: 15, y: 50 }, { l: 'Singapore', x: 85, y: 50 }, { l: 'Bangkok', x: 25, y: 85 }, { l: 'Tokyo', x: 75, y: 85 }].map((n, i) => (
                    <React.Fragment key={n.l}>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <motion.line x1="50%" y1="50%" x2={`${n.x}%`} y2={`${n.y}%`} stroke="hsl(var(--chart-1))" strokeWidth="0.6" strokeDasharray="2 4"
                          initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.6 + i * 0.12 }} />
                      </svg>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                        className="absolute flex flex-col items-center" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%,-50%)' }}>
                        <div className="h-3.5 w-3.5 rounded-full bg-chart-1/20 border border-chart-1/30" />
                        <span className="text-[6px] text-muted-foreground mt-0.5">{n.l}</span>
                      </motion.div>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}

            {scene === 2 && (
              <motion.div key="sC" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-3 max-w-md px-4">
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-foreground text-center mb-4">Cross-Border Transaction Corridors</motion.p>
                  {[
                    { from: 'Singapore', to: 'Bali', volume: '$2.8B', velocity: '94/100' },
                    { from: 'Dubai', to: 'Jakarta', volume: '$1.4B', velocity: '78/100' },
                    { from: 'Tokyo', to: 'Singapore', volume: '$1.1B', velocity: '82/100' },
                    { from: 'London', to: 'Dubai', volume: '$0.9B', velocity: '68/100' },
                    { from: 'Sydney', to: 'Bali', volume: '$0.7B', velocity: '72/100' },
                  ].map((flow, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20 bg-card/30">
                      <span className="text-[8px] text-muted-foreground w-16">{flow.from}</span>
                      <ArrowUpRight className="h-3 w-3 text-chart-1" />
                      <span className="text-[8px] font-medium text-foreground w-16">{flow.to}</span>
                      <span className="text-[8px] font-bold text-chart-1 tabular-nums ml-auto">{flow.volume}</span>
                      <Badge variant="outline" className="text-[5px] h-3">v:{flow.velocity}</Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {scene === 3 && (
              <motion.div key="sD" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-lg px-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground text-center mb-3">Expansion Readiness — Emerging Urban Regions</p>
                  {EXPANSION_CITIES.map((city, i) => {
                    const phaseStyle = city.phase === 'Active' ? 'text-chart-1 border-chart-1/20' : city.phase === 'Expanding' ? 'text-chart-2 border-chart-2/20' : city.phase === 'Emerging' ? 'text-chart-3 border-chart-3/20' : 'text-muted-foreground border-border/20';
                    return (
                      <motion.div key={city.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/15 bg-card/20">
                        <MapPin className="h-2.5 w-2.5 text-primary" />
                        <span className="text-[9px] font-medium text-foreground w-20">{city.name}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted/10 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${city.readiness}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                            className={cn("h-full rounded-full", city.readiness >= 80 ? "bg-chart-1" : city.readiness >= 50 ? "bg-chart-2" : "bg-chart-3")} />
                        </div>
                        <span className="text-[7px] tabular-nums text-foreground w-5">{city.readiness}</span>
                        <Badge variant="outline" className={cn("text-[5px] h-3 px-1", phaseStyle)}>{city.phase}</Badge>
                        <span className="text-[7px] text-chart-1 tabular-nums">{city.growth}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {scene === 4 && (
              <motion.div key="sE" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-4">
                <p className="text-xs font-semibold text-foreground text-center mb-3">Long-Term Economic Efficiency Indicators</p>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={EFFICIENCY_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gEff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                    <Area type="monotone" dataKey="txnVelocity" stroke="hsl(var(--chart-1))" fill="url(#gEff)" strokeWidth={2} name="Transaction Velocity" />
                    <Area type="monotone" dataKey="pricingAccuracy" stroke="hsl(var(--primary))" fill="none" strokeWidth={1.5} name="Pricing Accuracy" />
                    <Area type="monotone" dataKey="marketStability" stroke="hsl(var(--chart-2))" fill="none" strokeWidth={1.5} name="Market Stability" />
                    <Area type="monotone" dataKey="friction" stroke="hsl(var(--destructive))" fill="none" strokeWidth={1} strokeDasharray="2 2" name="Friction Index" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-5 mt-2">
                  {[
                    { label: 'Txn Velocity', color: 'bg-chart-1' },
                    { label: 'Pricing Accuracy', color: 'bg-primary' },
                    { label: 'Market Stability', color: 'bg-chart-2' },
                    { label: 'Friction ↓', color: 'bg-destructive', dashed: true },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1">
                      <span className={cn("h-1.5 w-3 rounded-sm", l.color, l.dashed && "opacity-50")} />
                      <span className="text-[7px] text-muted-foreground">{l.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanetScaleEconomicStoryboard;
