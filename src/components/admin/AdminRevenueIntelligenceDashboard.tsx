import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAdminRevenueIntelligence } from '@/hooks/useAdminRevenueIntelligence';
import { useCurrencyStore, CURRENCY_META } from '@/stores/currencyStore';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Building2,
  ShoppingBag, CreditCard, MapPin, Award, Loader2, BarChart3,
  Activity, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function formatCurrency(amount: number) {
  const { currency, rates } = useCurrencyStore.getState();
  const config = CURRENCY_META[currency];
  const converted = amount * rates[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(converted);
}

function formatShort(amount: number) {
  const { currency, rates } = useCurrencyStore.getState();
  const config = CURRENCY_META[currency];
  const converted = amount * rates[currency];
  if (converted >= 1e9) return `${config.symbol} ${(converted / 1e9).toFixed(1)}B`;
  if (converted >= 1e6) return `${config.symbol} ${(converted / 1e6).toFixed(1)}M`;
  if (converted >= 1e3) return `${config.symbol} ${(converted / 1e3).toFixed(0)}K`;
  return `${config.symbol} ${converted.toFixed(0)}`;
}

function GrowthBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <Badge variant="outline" className="text-muted-foreground text-xs"><Minus className="h-3 w-3 mr-1" />N/A</Badge>;
  const pct = ((current - previous) / previous * 100).toFixed(1);
  const isUp = current >= previous;
  return (
    <Badge variant="outline" className={`text-xs ${isUp ? 'text-chart-1 border-chart-1/30' : 'text-destructive border-destructive/30'}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
      {isUp ? '+' : ''}{pct}%
    </Badge>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, trend }: {
  title: string; value: string; subtitle?: string; icon: React.ElementType; trend?: React.ReactNode;
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-xl font-black tabular-nums text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Overview Tab ──
function OverviewTab({ data }: { data: ReturnType<typeof useAdminRevenueIntelligence>['data'] }) {
  if (!data) return null;
  const totalRevenue = (data.sales.total_commission || 0) + (data.rental.total_revenue || 0) + (data.vendor.platform_fee_total || 0) + (data.subscriptions.mrr * 12 || 0);
  const thisMonthRevenue = (data.sales.this_month_commission || 0) + (data.rental.this_month_revenue || 0) + (data.vendor.this_month_revenue || 0) + (data.subscriptions.mrr || 0);

  const sourceBreakdown = [
    { name: 'Sales Commission', value: data.sales.total_commission || 0 },
    { name: 'Rental Fees', value: data.rental.total_revenue || 0 },
    { name: 'Vendor Marketplace', value: data.vendor.platform_fee_total || 0 },
    { name: 'Subscriptions', value: data.subscriptions.mrr * 12 || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Revenue" value={formatShort(totalRevenue)} icon={DollarSign}
          trend={<GrowthBadge current={data.sales.this_month_commission} previous={data.sales.prev_month_commission} />} />
        <KPICard title="MRR" value={formatShort(data.subscriptions.mrr)} subtitle={`${data.subscriptions.active_subscribers} subscribers`} icon={CreditCard} />
        <KPICard title="Commission Earned" value={formatShort(data.sales.total_commission)} subtitle={`Avg ${(data.sales.avg_commission_rate || 0).toFixed(1)}%`} icon={Award} />
        <KPICard title="This Month" value={formatShort(thisMonthRevenue)} icon={Activity}
          trend={<GrowthBadge current={data.sales.this_month_commission} previous={data.sales.prev_month_commission} />} />
        <KPICard title="Transactions" value={data.sales.transaction_count.toLocaleString()} subtitle={`+ ${data.rental.total_bookings} rentals`} icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-day trend */}
        <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-1" /> 30-Day Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.daily_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { day: 'numeric' })} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatShort(v)} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
                <Area type="monotone" dataKey="sales" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} name="Sales" />
                <Area type="monotone" dataKey="rental" stackId="1" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.3} name="Rental" />
                <Area type="monotone" dataKey="vendor" stackId="1" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.3} name="Vendor" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by source */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sourceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                  {sourceBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {sourceBreakdown.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatShort(s.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Sales Commission Tab ──
function SalesTab({ data }: { data: ReturnType<typeof useAdminRevenueIntelligence>['data'] }) {
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Transaction Value" value={formatShort(data.sales.total_transaction_value)} icon={DollarSign} />
        <KPICard title="Commission Earned" value={formatShort(data.sales.total_commission)} icon={Award}
          trend={<GrowthBadge current={data.sales.this_month_commission} previous={data.sales.prev_month_commission} />} />
        <KPICard title="Avg Commission Rate" value={`${(data.sales.avg_commission_rate || 0).toFixed(1)}%`} icon={Activity} />
        <KPICard title="Total Transactions" value={data.sales.transaction_count.toLocaleString()} icon={BarChart3} />
      </div>

      {/* Top agents */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-chart-3" /> Top Performing Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.top_agents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No agent commission data yet</p>
          ) : (
            <div className="space-y-3">
              {data.top_agents.map((agent, i) => (
                <div key={agent.agent_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {agent.avatar_url ? (
                      <img src={agent.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <Users className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.full_name}</p>
                    <p className="text-xs text-muted-foreground">{agent.transaction_count} transactions</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-chart-1">{formatShort(agent.total_commission)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Rental Tab ──
function RentalTab({ data }: { data: ReturnType<typeof useAdminRevenueIntelligence>['data'] }) {
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Rental Revenue" value={formatShort(data.rental.total_revenue)} icon={Building2} />
        <KPICard title="Active Contracts" value={data.rental.active_contracts.toLocaleString()} icon={Activity} />
        <KPICard title="Avg Booking Value" value={formatShort(data.rental.avg_booking_value)} icon={DollarSign} />
        <KPICard title="Total Bookings" value={data.rental.total_bookings.toLocaleString()} subtitle={`${data.rental.completed_bookings} completed`} icon={BarChart3} />
      </div>
    </div>
  );
}

// ── Vendor Marketplace Tab ──
function VendorTab({ data }: { data: ReturnType<typeof useAdminRevenueIntelligence>['data'] }) {
  if (!data) return null;
  const feeData = [
    { name: 'Platform Fee', value: data.vendor.platform_fee_total || 0 },
    { name: 'Provider Earnings', value: data.vendor.provider_earnings_total || 0 },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={formatShort(data.vendor.total_revenue)} icon={ShoppingBag} />
        <KPICard title="Platform Fees" value={formatShort(data.vendor.platform_fee_total)} icon={DollarSign} />
        <KPICard title="Completion Rate" value={`${data.vendor.completion_rate}%`} icon={Activity} />
        <KPICard title="Total Bookings" value={data.vendor.total_bookings.toLocaleString()} subtitle={`${data.vendor.completed_bookings} completed`} icon={BarChart3} />
      </div>

      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Platform Fee vs Provider Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={feeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tickFormatter={(v) => formatShort(v)} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {feeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Subscription Tab ──
function SubscriptionTab({ data }: { data: ReturnType<typeof useAdminRevenueIntelligence>['data'] }) {
  if (!data) return null;
  const planData = data.subscriptions.plan_distribution || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="MRR" value={formatShort(data.subscriptions.mrr)} icon={CreditCard} />
        <KPICard title="Active Subscribers" value={data.subscriptions.active_subscribers.toLocaleString()} icon={Users} />
        <KPICard title="ARR (Projected)" value={formatShort(data.subscriptions.mrr * 12)} icon={TrendingUp} />
        <KPICard title="Churned This Month" value={data.subscriptions.churned_this_month.toLocaleString()} icon={TrendingDown} />
      </div>

      {planData.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planData} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {planData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── City Performance Tab ──
function CityTab({ data }: { data: ReturnType<typeof useAdminRevenueIntelligence>['data'] }) {
  if (!data) return null;
  const cities = data.city_breakdown || [];
  const maxRevenue = Math.max(...cities.map(c => c.revenue), 1);

  return (
    <div className="space-y-4">
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-chart-4" /> City Performance Heat Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No city data available yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">City</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Transactions</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Revenue</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Avg Value</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground w-32">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city, i) => {
                    const intensity = city.revenue / maxRevenue;
                    const hue = intensity > 0.7 ? 'bg-chart-1/15 text-chart-1' : intensity > 0.3 ? 'bg-chart-3/15 text-chart-3' : 'bg-muted/50 text-muted-foreground';
                    return (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-2 px-3 font-medium">{city.city}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{city.transactions}</td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold">{formatShort(city.revenue)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatShort(city.avg_value)}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                              <div className="h-full rounded-full bg-chart-1 transition-all" style={{ width: `${intensity * 100}%` }} />
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${hue}`}>
                              {(intensity * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Dashboard ──
export default function AdminRevenueIntelligenceDashboard() {
  const { data, isLoading, error } = useAdminRevenueIntelligence();
  const [tab, setTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading revenue intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/30">
        <CardContent className="p-6 text-center">
          <p className="text-destructive font-medium">Failed to load revenue data</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-chart-1" />
            Revenue Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Unified financial performance across all monetization streams</p>
        </div>
        <Badge variant="outline" className="text-chart-1 border-chart-1/30">
          <Activity className="h-3 w-3 mr-1" /> Live
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="sales" className="text-xs">Sales & Commission</TabsTrigger>
          <TabsTrigger value="rental" className="text-xs">Rental Revenue</TabsTrigger>
          <TabsTrigger value="vendor" className="text-xs">Service Marketplace</TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-xs">Subscriptions</TabsTrigger>
          <TabsTrigger value="cities" className="text-xs">City Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab data={data} /></TabsContent>
        <TabsContent value="sales"><SalesTab data={data} /></TabsContent>
        <TabsContent value="rental"><RentalTab data={data} /></TabsContent>
        <TabsContent value="vendor"><VendorTab data={data} /></TabsContent>
        <TabsContent value="subscriptions"><SubscriptionTab data={data} /></TabsContent>
        <TabsContent value="cities"><CityTab data={data} /></TabsContent>
      </Tabs>
    </div>
  );
}
