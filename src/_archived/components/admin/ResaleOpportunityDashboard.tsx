import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, BarChart3, Target, Lightbulb, ArrowUpRight, Users } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

const appreciationData = [
  { month: 'Oct', value: 2000 }, { month: 'Nov', value: 2050 }, { month: 'Dec', value: 2080 },
  { month: 'Jan', value: 2120 }, { month: 'Feb', value: 2180 }, { month: 'Mar', value: 2240 },
  { month: 'Apr', value: 2300 }, { month: 'May', value: 2380 }, { month: 'Jun', value: 2420 },
];

const comparables = [
  { address: 'Jl. Sudirman Lot 12', price: 'Rp 2.4B', sqm: 'Rp 18M/m²', date: '2 weeks ago', change: '+5%' },
  { address: 'Menteng Residence A3', price: 'Rp 2.1B', sqm: 'Rp 16.5M/m²', date: '1 month ago', change: '+3%' },
  { address: 'BSD Green Valley B7', price: 'Rp 2.6B', sqm: 'Rp 19M/m²', date: '3 weeks ago', change: '+7%' },
  { address: 'PIK Marina Unit 8', price: 'Rp 2.3B', sqm: 'Rp 17.5M/m²', date: '1 month ago', change: '+4%' },
];

const scenarioData = [
  { month: 'Now', conservative: 2200, optimal: 2200, aggressive: 2200 },
  { month: '+3mo', conservative: 2250, optimal: 2350, aggressive: 2450 },
  { month: '+6mo', conservative: 2300, optimal: 2500, aggressive: 2700 },
  { month: '+9mo', conservative: 2320, optimal: 2580, aggressive: 2850 },
  { month: '+12mo', conservative: 2350, optimal: 2650, aggressive: 2950 },
];

const demandByMonth = [
  { month: 'Jan', demand: 62 }, { month: 'Feb', demand: 68 }, { month: 'Mar', demand: 75 },
  { month: 'Apr', demand: 82 }, { month: 'May', demand: 88 }, { month: 'Jun', demand: 85 },
  { month: 'Jul', demand: 79 }, { month: 'Aug', demand: 72 }, { month: 'Sep', demand: 70 },
];

const ResaleOpportunityDashboard = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Resale Opportunity Dashboard</h2>
          <Badge variant="outline">📈 Market Timing</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Identify optimal resale timing and maximize profit realization</p>
      </motion.div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Resale Readiness', value: '82/100', icon: Target, color: 'text-emerald-500' },
          { label: 'Market Demand', value: 'High', icon: Users, color: 'text-primary' },
          { label: 'Appreciation YTD', value: '+12%', icon: ArrowUpRight, color: 'text-emerald-500' },
          { label: 'Optimal Window', value: '3-6 mo', icon: Clock, color: 'text-amber-500' },
          { label: 'Buyer Intensity', value: '88/100', icon: BarChart3, color: 'text-primary' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-3 text-center">
                <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appreciation Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Price Appreciation Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appreciationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" name="Value (M)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scenario Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profit Realization Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="conservative" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Conservative" />
                <Line type="monotone" dataKey="optimal" stroke="hsl(var(--primary))" strokeWidth={2} name="Optimal" />
                <Line type="monotone" dataKey="aggressive" stroke="hsl(var(--chart-2, var(--primary)))" name="Aggressive" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demand Seasonality */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Buyer Demand Seasonality</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Demand Index" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Comparables */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Comparable Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparables.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.address}</p>
                    <p className="text-xs text-muted-foreground">{c.sqm} · {c.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{c.price}</p>
                    <Badge variant="secondary" className="text-xs text-emerald-600">{c.change}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insight */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Timing Recommendation</p>
            <p className="text-sm text-muted-foreground">Listing within the next 3–6 months may maximize resale value due to rising demand and favorable seasonal patterns in this district.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResaleOpportunityDashboard;
