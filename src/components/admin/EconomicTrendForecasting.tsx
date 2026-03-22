import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, AlertTriangle, Lightbulb, BarChart3, Building, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const priceCycleData = [
  { year: '2018', price: 100 }, { year: '2019', price: 105 }, { year: '2020', price: 98 },
  { year: '2021', price: 102 }, { year: '2022', price: 112 }, { year: '2023', price: 120 },
  { year: '2024', price: 128 }, { year: '2025', price: 138 }, { year: '2026', price: 148 },
  { year: '2027P', price: 155 }, { year: '2028P', price: 162 },
];

const supplyPipeline = [
  { quarter: 'Q1 25', residential: 4200, commercial: 1800 },
  { quarter: 'Q2 25', residential: 3800, commercial: 2100 },
  { quarter: 'Q3 25', residential: 5100, commercial: 1500 },
  { quarter: 'Q4 25', residential: 4600, commercial: 1900 },
  { quarter: 'Q1 26', residential: 5500, commercial: 2200 },
  { quarter: 'Q2 26', residential: 6200, commercial: 2800 },
];

const correlationData = [
  { factor: 'Interest Rates', correlation: -0.72, trend: 'declining', impact: 'positive' },
  { factor: 'GDP Growth', correlation: 0.85, trend: 'rising', impact: 'positive' },
  { factor: 'Urbanization Rate', correlation: 0.78, trend: 'rising', impact: 'positive' },
  { factor: 'Construction Costs', correlation: -0.45, trend: 'stable', impact: 'neutral' },
  { factor: 'Foreign Investment', correlation: 0.65, trend: 'rising', impact: 'positive' },
  { factor: 'Inflation', correlation: -0.38, trend: 'declining', impact: 'positive' },
];

const demandProjection = [
  { month: 'Jul', demand: 82 }, { month: 'Aug', demand: 85 }, { month: 'Sep', demand: 88 },
  { month: 'Oct', demand: 92 }, { month: 'Nov', demand: 95 }, { month: 'Dec', demand: 90 },
  { month: 'Jan', demand: 88 }, { month: 'Feb', demand: 93 }, { month: 'Mar', demand: 98 },
];

const EconomicTrendForecasting = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Economic Trend Forecasting</h2>
          <Badge variant="outline">📊 Macro Intelligence</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Forecast real estate cycle movements using macroeconomic indicators</p>
      </motion.div>

      {/* Cycle Stage KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Cycle Phase', value: 'Early Growth', color: 'text-emerald-500' },
          { label: 'Housing Demand', value: '+9.2%', color: 'text-emerald-500' },
          { label: 'Interest Rate Trend', value: 'Declining', color: 'text-emerald-500' },
          { label: 'Supply Pipeline', value: 'Moderate', color: 'text-amber-500' },
          { label: 'Urbanization Index', value: '78/100', color: 'text-primary' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Cycle */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Property Price Cycle (Indexed)</CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Early Growth Phase</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceCycleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" strokeWidth={2} name="Price Index" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supply Pipeline */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Construction Supply Pipeline</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyPipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="quarter" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="residential" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Residential" />
                <Bar dataKey="commercial" fill="hsl(var(--primary)/0.4)" radius={[4, 4, 0, 0]} name="Commercial" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demand Projection */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Housing Demand Growth Projection</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="demand" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Demand Index" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Economic Correlations */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Economic Factor Correlation</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {correlationData.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    {c.impact === 'positive' ? <ArrowUpRight className="h-4 w-4 text-emerald-500" /> : c.impact === 'neutral' ? <BarChart3 className="h-4 w-4 text-amber-500" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.factor}</p>
                      <p className="text-xs text-muted-foreground">Trend: {c.trend}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${c.correlation > 0 ? 'text-emerald-500' : 'text-destructive'}`}>{c.correlation > 0 ? '+' : ''}{c.correlation}</p>
                    <Badge variant="secondary" className="text-xs">{c.impact}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Forecast Insight</p>
            <p className="text-sm text-muted-foreground">Urban mid-range housing segment entering early growth phase — declining interest rates and rising urbanization support strong demand over the next 12–18 months.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomicTrendForecasting;
