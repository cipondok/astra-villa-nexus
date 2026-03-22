import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingDown, AlertTriangle, Server, Database, HardDrive, Zap, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const costTrend = [
  { month: 'Oct', cost: 1240, revenue: 8500 },
  { month: 'Nov', cost: 1380, revenue: 11200 },
  { month: 'Dec', cost: 1520, revenue: 14800 },
  { month: 'Jan', cost: 1450, revenue: 18400 },
  { month: 'Feb', cost: 1680, revenue: 22100 },
  { month: 'Mar', cost: 1590, revenue: 26500 },
];

const serviceBreakdown = [
  { name: 'Database (Supabase)', value: 580, pct: 36.5 },
  { name: 'Edge Functions', value: 320, pct: 20.1 },
  { name: 'Storage & CDN', value: 280, pct: 17.6 },
  { name: 'Auth & Realtime', value: 210, pct: 13.2 },
  { name: 'Analytics & AI', value: 120, pct: 7.5 },
  { name: 'Monitoring', value: 80, pct: 5.0 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)', 'hsl(200 70% 50%)', 'hsl(var(--muted-foreground))'];

const alerts = [
  { type: 'warning', title: 'Storage growth accelerating', desc: 'Image storage increasing 18%/month — consider enabling WebP auto-conversion to reduce by ~40%', action: 'Optimize' },
  { type: 'info', title: 'Underutilized read replica', desc: 'Read replica at 8% utilization — defer activation until 50K+ concurrent users', action: 'Review' },
  { type: 'success', title: 'Edge function efficiency improved', desc: 'Cold start optimization reduced compute cost by 12% this month', action: 'Noted' },
];

const CostOptimizationDashboard = () => {
  const totalCost = 1590;
  const activeUsers = 4200;
  const transactions = 380;
  const costPerUser = (totalCost / activeUsers).toFixed(2);
  const costPerTx = (totalCost / transactions).toFixed(2);
  const revenueRatio = (26500 / totalCost).toFixed(1);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <DollarSign className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Cost Optimization & Cloud Efficiency</h2>
          <Badge variant="outline">💰 FinOps</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Infrastructure cost tracking, efficiency ratios, and optimization opportunities</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Monthly Cloud Cost', value: `$${totalCost}`, sub: '-5.3% vs last month' },
          { label: 'Cost / Active User', value: `$${costPerUser}`, sub: `${activeUsers.toLocaleString()} users` },
          { label: 'Cost / Transaction', value: `$${costPerTx}`, sub: `${transactions} deals` },
          { label: 'Revenue / Cost Ratio', value: `${revenueRatio}x`, sub: 'Efficiency multiplier' },
          { label: 'Cost Trend', value: '↓ 5.3%', sub: 'Month-over-month' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="trend">
        <TabsList><TabsTrigger value="trend">Cost vs Revenue</TabsTrigger><TabsTrigger value="breakdown">Service Breakdown</TabsTrigger><TabsTrigger value="alerts">Optimization Alerts</TabsTrigger></TabsList>

        <TabsContent value="trend" className="mt-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Monthly Cost vs Revenue ($)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={costTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36% / 0.1)" name="Revenue" />
                  <Area type="monotone" dataKey="cost" stroke="hsl(0 84% 60%)" fill="hsl(0 84% 60% / 0.1)" name="Infra Cost" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Cost Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={serviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} stroke="hsl(var(--background))">
                      {serviceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Service Cost Details</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {serviceBreakdown.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm text-foreground flex-1">{s.name}</span>
                    <span className="text-sm font-bold text-foreground">${s.value}</span>
                    <Badge variant="secondary" className="text-xs">{s.pct}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4 space-y-3">
          {alerts.map((a, i) => (
            <Card key={i} className={a.type === 'warning' ? 'border-amber-500/30' : ''}>
              <CardContent className="p-4 flex items-start gap-3">
                {a.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" /> :
                 a.type === 'success' ? <TrendingDown className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" /> :
                 <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />}
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{a.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{a.desc}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{a.action}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostOptimizationDashboard;
