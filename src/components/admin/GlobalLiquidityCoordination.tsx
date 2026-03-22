import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Globe, Activity, Zap, Shield, TrendingUp, Lightbulb, Radio } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { motion } from 'framer-motion';

const flowData = [
  { hour: '00', seAsia: 120, midEast: 85, europe: 45, americas: 30 },
  { hour: '04', seAsia: 95, midEast: 110, europe: 60, americas: 25 },
  { hour: '08', seAsia: 150, midEast: 130, europe: 140, americas: 55 },
  { hour: '12', seAsia: 180, midEast: 95, europe: 175, americas: 160 },
  { hour: '16', seAsia: 200, midEast: 120, europe: 155, americas: 210 },
  { hour: '20', seAsia: 165, midEast: 145, europe: 80, americas: 180 },
];

const resilienceRadar = [
  { axis: 'Redundancy', score: 82 },
  { axis: 'Recovery Speed', score: 75 },
  { axis: 'Diversity', score: 88 },
  { axis: 'Throughput', score: 70 },
  { axis: 'Stability', score: 78 },
  { axis: 'Adaptability', score: 85 },
];

const clusters = [
  { region: 'Southeast Asia', density: 92, velocity: 'High', transactions: '12.4K', status: 'Active' },
  { region: 'Middle East & GCC', density: 78, velocity: 'Accelerating', transactions: '8.2K', status: 'Active' },
  { region: 'Western Europe', density: 65, velocity: 'Stable', transactions: '5.8K', status: 'Emerging' },
  { region: 'North America', density: 45, velocity: 'Building', transactions: '3.1K', status: 'Entry' },
  { region: 'East Africa', density: 22, velocity: 'Nascent', transactions: '0.4K', status: 'Planned' },
];

const syncSignals = [
  { pair: 'Jakarta ↔ Dubai', sync: 88, trend: 'Converging', volume: '$2.4B' },
  { pair: 'Singapore ↔ London', sync: 72, trend: 'Stabilizing', volume: '$1.8B' },
  { pair: 'Bali ↔ Abu Dhabi', sync: 65, trend: 'Emerging', volume: '$0.9B' },
  { pair: 'KL ↔ Riyadh', sync: 58, trend: 'Building', volume: '$0.6B' },
];

const GlobalLiquidityCoordination = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Autonomous Global Liquidity Coordination</h2>
          <Badge variant="outline">🌐 Infrastructure</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Synchronizing transaction activity across global property markets</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Coordination Score', value: '84/100', icon: Radio, color: 'text-primary' },
          { label: 'Cross-Regional Efficiency', value: '78.5%', icon: Zap, color: 'text-emerald-500' },
          { label: 'Stabilization Signal', value: 'Strong', icon: Shield, color: 'text-primary' },
          { label: 'Network Resilience', value: '82/100', icon: Activity, color: 'text-amber-500' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card><CardContent className="p-4 text-center">
              <m.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Global Transaction Flow (24h)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="seAsia" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.3)" name="SE Asia" />
                <Area type="monotone" dataKey="midEast" stackId="1" stroke="hsl(var(--chart-2, 200 80% 55%))" fill="hsl(var(--chart-2, 200 80% 55%)/0.2)" name="Middle East" />
                <Area type="monotone" dataKey="europe" stackId="1" stroke="hsl(var(--chart-3, 150 60% 50%))" fill="hsl(var(--chart-3, 150 60% 50%)/0.15)" name="Europe" />
                <Area type="monotone" dataKey="americas" stackId="1" stroke="hsl(var(--chart-4, 280 60% 60%))" fill="hsl(var(--chart-4, 280 60% 60%)/0.1)" name="Americas" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Network Resilience</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={resilienceRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity Clusters */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Liquidity Density Clusters</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {clusters.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-3 h-3 rounded-full shrink-0 ${c.density > 70 ? 'bg-emerald-500' : c.density > 40 ? 'bg-amber-500' : 'bg-muted-foreground/40'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{c.region}</p>
                    <Badge variant={c.status === 'Active' ? 'default' : 'secondary'} className="text-xs">{c.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <Progress value={c.density} className="h-1.5 flex-1 max-w-32" />
                    <span className="text-xs text-muted-foreground">{c.density}% density</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{c.transactions}</p>
                <p className="text-xs text-muted-foreground">{c.velocity}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Synchronization Signals */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Demand-Supply Synchronization Signals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {syncSignals.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground text-sm">{s.pair}</p>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{s.volume}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={s.sync} className="h-2 flex-1" />
                    <span className="text-xs font-medium text-foreground">{s.sync}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trend: {s.trend}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Coordination Insight</p>
            <p className="text-sm text-muted-foreground">Liquidity convergence emerging between Southeast Asia and Middle East urban corridors — cross-regional transaction efficiency improving at 3.2% monthly rate.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalLiquidityCoordination;
