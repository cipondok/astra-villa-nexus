import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, TrendingUp, Building, Lightbulb, Target, ArrowUpRight, Train } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { motion } from 'framer-motion';

const roiProjection = [
  { year: 'Y1', conservative: 5, moderate: 8, aggressive: 12 },
  { year: 'Y2', conservative: 12, moderate: 18, aggressive: 28 },
  { year: 'Y3', conservative: 18, moderate: 28, aggressive: 45 },
  { year: 'Y4', conservative: 22, moderate: 38, aggressive: 60 },
  { year: 'Y5', conservative: 28, moderate: 48, aggressive: 75 },
];

const supplyDemand = [
  { district: 'South Corridor', supply: 35, demand: 82 },
  { district: 'East Suburban', supply: 28, demand: 75 },
  { district: 'North Transit', supply: 42, demand: 68 },
  { district: 'West Industrial', supply: 55, demand: 60 },
  { district: 'Central CBD', supply: 70, demand: 72 },
];

const feasibilityRadar = [
  { factor: 'Demand Signal', score: 88 },
  { factor: 'Infrastructure', score: 82 },
  { factor: 'Land Availability', score: 65 },
  { factor: 'Regulatory', score: 72 },
  { factor: 'Capital Access', score: 78 },
  { factor: 'Exit Liquidity', score: 70 },
];

const opportunities = [
  { location: 'South Jakarta Transport Corridor', type: 'Mixed-Use Residential', appreciation: '+22%', confidence: 88, infra: 'MRT Extension 2027', rank: 1 },
  { location: 'Tangerang Selatan Suburban Belt', type: 'Affordable Housing', appreciation: '+18%', confidence: 82, infra: 'Toll Road Expansion', rank: 2 },
  { location: 'Bekasi Transit Hub Zone', type: 'Transit-Oriented Development', appreciation: '+15%', confidence: 78, infra: 'LRT Station 2026', rank: 3 },
  { location: 'Bogor Highland Retreat', type: 'Leisure & Villa', appreciation: '+12%', confidence: 72, infra: 'Highway Upgrade', rank: 4 },
];

const DevOpportunityAnalyzer = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Building className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Development Opportunity Analyzer</h2>
          <Badge variant="outline">🏗️ AI Discovery</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Identify locations and property types with strong development potential</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Opportunities Found', value: '12', color: 'text-primary' },
          { label: 'Avg Appreciation', value: '+16.8%', color: 'text-emerald-500' },
          { label: 'Top Confidence', value: '88%', color: 'text-primary' },
          { label: 'Infra Projects', value: '8 Active', color: 'text-amber-500' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Feasibility Assessment</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={feasibilityRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Supply-Demand Imbalance</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyDemand} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis type="category" dataKey="district" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} width={95} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Demand" />
                <Bar dataKey="supply" fill="hsl(var(--muted-foreground)/0.3)" radius={[0, 4, 4, 0]} name="Supply" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Development ROI Projection</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roiProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="aggressive" stroke="hsl(var(--chart-2, 200 80% 55%))" fill="hsl(var(--chart-2, 200 80% 55%)/0.1)" name="Aggressive" />
                <Area type="monotone" dataKey="moderate" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" strokeWidth={2} name="Moderate" />
                <Area type="monotone" dataKey="conservative" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground)/0.08)" name="Conservative" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Rankings */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Strategic Location Rankings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {opportunities.map((o, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">#{o.rank}</div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{o.location}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{o.type}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Train className="h-3 w-3" />{o.infra}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{o.appreciation}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Confidence: {o.confidence}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Development Insight</p>
            <p className="text-sm text-muted-foreground">Emerging South Jakarta transport corridor shows strong residential development potential — MRT extension and demand-supply imbalance create a compelling investment case.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevOpportunityAnalyzer;
