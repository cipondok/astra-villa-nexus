import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Target, Lightbulb, DollarSign, ArrowUpRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const windowData = [
  { month: 'Apr', favorability: 72 }, { month: 'May', favorability: 78 },
  { month: 'Jun', favorability: 85 }, { month: 'Jul', favorability: 88 },
  { month: 'Aug', favorability: 82 }, { month: 'Sep', favorability: 75 },
  { month: 'Oct', favorability: 70 }, { month: 'Nov', favorability: 65 },
  { month: 'Dec', favorability: 60 },
];

const scenarioComparison = [
  { month: 'Now', sellNow: 2200, hold6: 2200, refinance: 2200 },
  { month: '+3mo', sellNow: 2200, hold6: 2320, refinance: 2250 },
  { month: '+6mo', sellNow: 2200, hold6: 2450, refinance: 2350 },
  { month: '+12mo', sellNow: 2200, hold6: 2580, refinance: 2500 },
  { month: '+18mo', sellNow: 2200, hold6: 2650, refinance: 2620 },
  { month: '+24mo', sellNow: 2200, hold6: 2700, refinance: 2750 },
];

const demandAcceleration = [
  { week: 'W1', demand: 45 }, { week: 'W2', demand: 52 }, { week: 'W3', demand: 58 },
  { week: 'W4', demand: 65 }, { week: 'W5', demand: 72 }, { week: 'W6', demand: 78 },
  { week: 'W7', demand: 82 }, { week: 'W8', demand: 88 },
];

const exitProperties = [
  { title: 'Jakarta Sudirman Tower Unit 12A', readiness: 88, absorption: '45 days', profit: '+Rp 380M', strategy: 'Sell Now' },
  { title: 'BSD Green Valley Villa B7', readiness: 72, absorption: '60 days', profit: '+Rp 520M', strategy: 'Hold 6mo' },
  { title: 'Bali Seminyak Resort Unit 3', readiness: 65, absorption: '90 days', profit: '+Rp 280M', strategy: 'Refinance' },
];

const LiquidityExitStrategyPlanner = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Liquidity Exit Strategy Planner</h2>
          <Badge variant="outline">🚀 Exit Intelligence</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Determine optimal timing and method for property liquidation</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Exit Readiness', value: '75/100', color: 'text-primary' },
          { label: 'Market Liquidity', value: 'Strong', color: 'text-emerald-500' },
          { label: 'Avg Absorption', value: '52 days', color: 'text-amber-500' },
          { label: 'Profit Potential', value: '+Rp 1.18B', color: 'text-emerald-500' },
          { label: 'Best Window', value: 'Jun–Aug', color: 'text-primary' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Optimal Listing Window</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={windowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="favorability" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" name="Market Favorability" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Exit Scenario Comparison (Value in M)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scenarioComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="sellNow" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Sell Now" />
                <Line type="monotone" dataKey="hold6" stroke="hsl(var(--primary))" strokeWidth={2} name="Hold 6mo" />
                <Line type="monotone" dataKey="refinance" stroke="hsl(var(--chart-2, 200 80% 55%))" name="Refinance" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Property Exit Cards */}
      <div className="space-y-3">
        {exitProperties.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{p.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">Absorption: {p.absorption}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{p.profit}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Readiness</p>
                    <p className="text-sm font-bold text-foreground">{p.readiness}/100</p>
                  </div>
                  <Badge variant={p.strategy === 'Sell Now' ? 'default' : 'secondary'} className="text-xs">{p.strategy}</Badge>
                  <Button size="sm" variant="outline">Details</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Exit Strategy Insight</p>
            <p className="text-sm text-muted-foreground">Current market conditions favor listing within the Jun–Aug window. Holding BSD villa 6 months may yield additional Rp 520M based on demand acceleration trends.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiquidityExitStrategyPlanner;
