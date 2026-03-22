import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Download, Globe, TrendingUp, Users, Shield, Zap, Building2,
  BarChart3, Target, DollarSign, ArrowUpRight, Brain, Activity, Lock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const formatRp = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

/* ─── Data ─── */
const QUARTERLY_REVENUE = [
  { q: 'Q1 2025', revenue: 180_000_000_000, gmv: 1_200_000_000_000 },
  { q: 'Q2 2025', revenue: 290_000_000_000, gmv: 1_800_000_000_000 },
  { q: 'Q3 2025', revenue: 420_000_000_000, gmv: 2_600_000_000_000 },
  { q: 'Q4 2025', revenue: 580_000_000_000, gmv: 3_400_000_000_000 },
  { q: 'Q1 2026', revenue: 720_000_000_000, gmv: 4_200_000_000_000 },
];

const MARKET_READINESS = [
  { city: 'Bali', readiness: 98, vendors: 284, gmv: 847, status: 'Dominant' },
  { city: 'Jakarta', readiness: 85, vendors: 156, gmv: 425, status: 'Growing' },
  { city: 'Surabaya', readiness: 62, vendors: 67, gmv: 128, status: 'Emerging' },
  { city: 'Lombok', readiness: 55, vendors: 43, gmv: 89, status: 'Emerging' },
  { city: 'Bandung', readiness: 42, vendors: 35, gmv: 62, status: 'Exploring' },
];

const REVENUE_QUALITY = [
  { name: 'Recurring Subscriptions', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Transaction Commissions', value: 42, color: 'hsl(var(--chart-2))' },
  { name: 'Premium Campaigns', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'Data Intelligence', value: 8, color: 'hsl(var(--primary))' },
];

const VENDOR_METRICS = [
  { label: 'Total Vendors', value: '613' },
  { label: 'Active Rate', value: '78%' },
  { label: 'Avg Tenure', value: '8.2 mo' },
  { label: 'Retention (90d)', value: '91%' },
  { label: 'Revenue/Vendor', value: 'Rp 24M' },
  { label: 'NPS Score', value: '72' },
];

const AI_METRICS = [
  { label: 'Listings Scored', value: '12,847', pct: 94 },
  { label: 'Price Predictions', value: '8,920', pct: 87 },
  { label: 'Deal Optimizations', value: '3,241', pct: 78 },
  { label: 'Automation Rate', value: '62%', pct: 62 },
];

/* ─── Downloadable Card ─── */
const MetricCard = ({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: React.ElementType }) => (
  <Card className="border-border/20">
    <CardContent className="p-3 flex items-start justify-between">
      <div>
        <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-foreground tabular-nums leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-[8px] text-chart-1 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-1">
        <Icon className="h-4 w-4 text-muted-foreground/40" />
      </div>
    </CardContent>
  </Card>
);

const InstitutionalDataRoom = () => {
  const handleDownload = (section: string) => {
    toast.success(`${section} report downloaded`);
  };

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Institutional Data Room</h2>
          <Badge variant="outline" className="text-[7px] h-4 border-primary/20 text-primary">CONFIDENTIAL</Badge>
        </div>
        <Button variant="outline" size="sm" className="h-6 text-[9px] gap-1" onClick={() => handleDownload('Full')}>
          <Download className="h-3 w-3" />Export All
        </Button>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="h-7 p-0.5 bg-muted/20">
          <TabsTrigger value="performance" className="text-[9px] h-6 px-3">Performance</TabsTrigger>
          <TabsTrigger value="expansion" className="text-[9px] h-6 px-3">Expansion</TabsTrigger>
          <TabsTrigger value="revenue" className="text-[9px] h-6 px-3">Revenue Quality</TabsTrigger>
          <TabsTrigger value="network" className="text-[9px] h-6 px-3">Vendor Network</TabsTrigger>
          <TabsTrigger value="ai" className="text-[9px] h-6 px-3">AI Advantage</TabsTrigger>
        </TabsList>

        {/* Performance Overview */}
        <TabsContent value="performance" className="mt-3 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricCard label="Quarterly GMV" value="Rp 4.2T" sub="+24% QoQ" icon={DollarSign} />
            <MetricCard label="Net Revenue" value="Rp 720B" sub="+38% QoQ" icon={TrendingUp} />
            <MetricCard label="Transactions" value="3,241" sub="+18% growth" icon={Activity} />
            <MetricCard label="Active Markets" value="6" sub="3 new in pipeline" icon={Globe} />
          </div>
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-semibold">Revenue Growth Trajectory</CardTitle>
              <Button variant="ghost" size="sm" className="h-5 text-[8px]" onClick={() => handleDownload('Revenue')}>
                <Download className="h-2.5 w-2.5 mr-1" />PDF
              </Button>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={QUARTERLY_REVENUE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDataRoom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="q" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1e9).toFixed(0)}B`} width={40} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} formatter={(v: number) => formatRp(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#gDataRoom)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expansion Readiness */}
        <TabsContent value="expansion" className="mt-3 space-y-3">
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-semibold">Market Expansion Readiness</CardTitle>
              <Button variant="ghost" size="sm" className="h-5 text-[8px]" onClick={() => handleDownload('Expansion')}>
                <Download className="h-2.5 w-2.5 mr-1" />PDF
              </Button>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-2">
              {MARKET_READINESS.map(m => (
                <div key={m.city} className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-foreground w-20">{m.city}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.readiness}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className={cn("h-full rounded-full",
                        m.readiness >= 80 ? 'bg-chart-1' : m.readiness >= 50 ? 'bg-chart-2' : 'bg-chart-3'
                      )}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-foreground tabular-nums w-8 text-right">{m.readiness}%</span>
                  <Badge variant="outline" className="text-[7px] h-3.5 w-16 justify-center">{m.status}</Badge>
                  <span className="text-[8px] text-muted-foreground w-16 text-right">{m.vendors} vendors</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Quality */}
        <TabsContent value="revenue" className="mt-3">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-3">
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold">Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={REVENUE_QUALITY} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                      {REVENUE_QUALITY.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <CardContent className="p-2.5 pt-0 space-y-1">
                {REVENUE_QUALITY.map(r => (
                  <div key={r.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: r.color }} />
                    <span className="text-[9px] text-muted-foreground flex-1">{r.name}</span>
                    <span className="text-[9px] font-medium text-foreground tabular-nums">{r.value}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold">Revenue Quality Indicators</CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0 space-y-3">
                {[
                  { label: 'Recurring Revenue Ratio', value: '35%', target: '50%', health: 'growing' },
                  { label: 'Revenue Per Active Listing', value: 'Rp 4.2M', target: 'Rp 5M', health: 'good' },
                  { label: 'CAC Payback Period', value: '4.2 months', target: '< 6 mo', health: 'excellent' },
                  { label: 'LTV:CAC Ratio', value: '8.4x', target: '> 5x', health: 'excellent' },
                  { label: 'Gross Margin', value: '72%', target: '> 65%', health: 'excellent' },
                  { label: 'Net Revenue Retention', value: '118%', target: '> 110%', health: 'excellent' },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className={cn("h-1.5 w-1.5 rounded-full",
                      m.health === 'excellent' ? 'bg-chart-1' : m.health === 'good' ? 'bg-chart-2' : 'bg-chart-3'
                    )} />
                    <span className="text-[9px] text-muted-foreground flex-1">{m.label}</span>
                    <span className="text-[10px] font-semibold text-foreground tabular-nums">{m.value}</span>
                    <span className="text-[7px] text-muted-foreground">target: {m.target}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vendor Network */}
        <TabsContent value="network" className="mt-3 space-y-3">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {VENDOR_METRICS.map(m => (
              <Card key={m.label} className="border-border/20">
                <CardContent className="p-2.5 text-center">
                  <p className="text-[7px] text-muted-foreground uppercase">{m.label}</p>
                  <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Advantage */}
        <TabsContent value="ai" className="mt-3 space-y-3">
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Brain className="h-3 w-3 text-primary" />AI Intelligence Penetration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-2">
              {AI_METRICS.map(m => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="text-[9px] text-muted-foreground w-32">{m.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-foreground tabular-nums w-14 text-right">{m.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="Proprietary Data Points" value="4.2M+" sub="Growing 12K/day" icon={Shield} />
            <MetricCard label="Prediction Accuracy" value="87%" sub="+3% this quarter" icon={Target} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstitutionalDataRoom;
