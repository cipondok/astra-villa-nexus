import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, TrendingUp, Shield, AlertTriangle, Lightbulb, BarChart3, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const regionAllocation = [
  { name: 'Southeast Asia', allocation: 45, yield: 7.2, growth: 12, color: 'hsl(var(--primary))' },
  { name: 'East Asia', allocation: 20, yield: 4.8, growth: 6, color: 'hsl(var(--chart-2, 200 80% 55%))' },
  { name: 'Middle East', allocation: 15, yield: 6.1, growth: 9, color: 'hsl(var(--chart-3, 150 60% 50%))' },
  { name: 'Europe', allocation: 12, yield: 3.5, growth: 3, color: 'hsl(var(--chart-4, 40 80% 55%))' },
  { name: 'Americas', allocation: 8, yield: 4.2, growth: 5, color: 'hsl(var(--chart-5, 280 70% 55%))' },
];

const yieldComparison = [
  { region: 'Jakarta', yield: 7.2, appreciation: 12 },
  { region: 'Bangkok', yield: 5.8, appreciation: 8 },
  { region: 'Dubai', yield: 6.5, appreciation: 15 },
  { region: 'Tokyo', yield: 3.2, appreciation: 4 },
  { region: 'London', yield: 3.0, appreciation: 2 },
  { region: 'Singapore', yield: 3.8, appreciation: 6 },
];

const diversificationRadar = [
  { factor: 'Geographic Spread', score: 72 },
  { factor: 'Currency Mix', score: 55 },
  { factor: 'Property Types', score: 80 },
  { factor: 'Yield Sources', score: 68 },
  { factor: 'Liquidity Balance', score: 60 },
  { factor: 'Risk Distribution', score: 65 },
];

const opportunities = [
  { city: 'Ho Chi Minh City', country: 'Vietnam', growth: '+18%', yield: '8.5%', risk: 'Medium', rank: 1 },
  { city: 'Bali South', country: 'Indonesia', growth: '+22%', yield: '9.2%', risk: 'Medium-High', rank: 2 },
  { city: 'Dubai Marina', country: 'UAE', growth: '+15%', yield: '7.0%', risk: 'Low-Medium', rank: 3 },
  { city: 'Phuket', country: 'Thailand', growth: '+12%', yield: '6.8%', risk: 'Medium', rank: 4 },
];

const GlobalDiversificationStrategy = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Global Diversification Strategy</h2>
          <Badge variant="outline">🌍 Portfolio</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Visualize geographic diversification and cross-border investment opportunities</p>
      </motion.div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Diversification Score', value: '72/100', color: 'text-primary' },
          { label: 'Regions Active', value: '5', color: 'text-emerald-500' },
          { label: 'Avg Portfolio Yield', value: '5.8%', color: 'text-primary' },
          { label: 'Currency Exposure', value: 'Moderate', color: 'text-amber-500' },
          { label: 'Growth Momentum', value: '+8.4%', color: 'text-emerald-500' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Pie */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Regional Allocation</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regionAllocation} dataKey="allocation" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} strokeWidth={2} stroke="hsl(var(--background))">
                    {regionAllocation.map((r, i) => <Cell key={i} fill={r.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {regionAllocation.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-foreground">{r.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{r.allocation}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Diversification Radar */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Diversification Balance</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={diversificationRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Yield Comparison */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Regional Yield Comparison</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis type="category" dataKey="region" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={75} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="yield" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Yield %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Rankings */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Cross-Border Investment Opportunity Ranking</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {opportunities.map((o, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">#{o.rank}</div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{o.city}</p>
                      <p className="text-xs text-muted-foreground">{o.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{o.yield} yield</Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{o.growth}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Risk: {o.risk}</p>
                  </div>
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
            <p className="font-medium text-foreground text-sm">Strategic Insight</p>
            <p className="text-sm text-muted-foreground">Expanding into emerging coastal cities in Southeast Asia may improve long-term portfolio resilience while maintaining above-average yield.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalDiversificationStrategy;
