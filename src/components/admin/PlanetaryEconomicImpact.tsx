import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, TrendingUp, Building, Users, Lightbulb, BarChart3, Gauge } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

const PlanetaryEconomicImpact = () => {
  const [penetration, setPenetration] = useState([15]);
  const [growthRate, setGrowthRate] = useState([25]);

  const pen = penetration[0];
  const gr = growthRate[0];
  const housingImpact = pen * 2.8;
  const productivityUplift = pen * 0.6 + gr * 0.15;
  const infraScore = Math.min(100, pen * 1.5 + gr * 0.8);

  const projectionData = Array.from({ length: 10 }, (_, i) => {
    const year = 2025 + i;
    const base = pen * (1 + gr / 100) ** i;
    return {
      year: `${year}`,
      accessibility: Math.min(95, housingImpact + i * 3.5),
      productivity: Math.min(40, productivityUplift + i * 1.2),
      influence: Math.min(100, infraScore * (1 + i * 0.08)),
    };
  });

  const regionalImpact = [
    { region: 'Indonesia', housing: 42, productivity: 8.5, infra: 72 },
    { region: 'SE Asia', housing: 28, productivity: 5.2, infra: 55 },
    { region: 'Middle East', housing: 18, productivity: 4.8, infra: 48 },
    { region: 'Europe', housing: 12, productivity: 3.1, infra: 32 },
    { region: 'Americas', housing: 8, productivity: 2.4, infra: 22 },
  ];

  const capitalFlowData = [
    { quarter: 'Q1', domestic: 850, cross_border: 220 },
    { quarter: 'Q2', domestic: 1020, cross_border: 380 },
    { quarter: 'Q3', domestic: 1280, cross_border: 520 },
    { quarter: 'Q4', domestic: 1500, cross_border: 720 },
    { quarter: 'Q5P', domestic: 1800, cross_border: 950 },
    { quarter: 'Q6P', domestic: 2200, cross_border: 1300 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Planetary Economic Infrastructure Impact</h2>
          <Badge variant="outline">🌍 Macro Simulation</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Estimating long-term economic influence of marketplace expansion</p>
      </motion.div>

      {/* Simulation Controls */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Simulation Parameters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Market Penetration</Label><span className="text-sm font-medium text-primary">{pen}%</span></div>
              <Slider value={penetration} onValueChange={setPenetration} min={1} max={50} step={1} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Transaction Volume Growth Rate</Label><span className="text-sm font-medium text-primary">{gr}%</span></div>
              <Slider value={growthRate} onValueChange={setGrowthRate} min={5} max={80} step={5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Housing Accessibility', value: `+${housingImpact.toFixed(1)}%`, color: 'text-emerald-500' },
          { label: 'Productivity Uplift', value: `+${productivityUplift.toFixed(1)}%`, color: 'text-primary' },
          { label: 'Infrastructure Score', value: `${infraScore.toFixed(0)}/100`, color: 'text-amber-500' },
          { label: 'Capital Mobilized', value: '$4.2B+', color: 'text-primary' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">10-Year Impact Projection</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="accessibility" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} name="Housing Accessibility %" />
                <Area type="monotone" dataKey="influence" stroke="hsl(var(--chart-2, 200 80% 55%))" fill="hsl(var(--chart-2, 200 80% 55%)/0.1)" name="Infrastructure Influence" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Capital Flow Acceleration ($M)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capitalFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="quarter" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="domestic" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Domestic" />
                <Bar dataKey="cross_border" fill="hsl(var(--chart-2, 200 80% 55%))" radius={[4, 4, 0, 0]} name="Cross-Border" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Comparison */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Regional Development Impact</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {regionalImpact.map((r, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground text-sm">{r.region}</p>
                <Badge variant="secondary" className="text-xs">Infra Score: {r.infra}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Housing Impact</p>
                  <Progress value={r.housing} className="h-1.5" />
                  <p className="text-xs text-foreground mt-0.5">+{r.housing}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Productivity</p>
                  <Progress value={r.productivity * 10} className="h-1.5" />
                  <p className="text-xs text-foreground mt-0.5">+{r.productivity}%</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Economic Infrastructure Insight</p>
            <p className="text-sm text-muted-foreground">At {pen}% market penetration, platform could improve housing accessibility by {housingImpact.toFixed(1)}% and generate ${(pen * 0.28).toFixed(1)}B in economic productivity gains across primary markets.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanetaryEconomicImpact;
