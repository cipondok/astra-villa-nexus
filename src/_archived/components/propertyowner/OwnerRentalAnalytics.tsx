import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRentalAnalytics } from "@/hooks/useRentalAnalytics";
import Price from "@/components/ui/Price";
import { getCurrencyFormatter } from "@/stores/currencyStore";
import { Loader2, TrendingUp, Home, DollarSign, CalendarDays, BarChart3, Users, Percent, ArrowUpRight, ArrowDownRight, Target, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Area, AreaChart, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-1))", "hsl(var(--chart-3))", "hsl(var(--destructive))", "hsl(var(--chart-5))"];

const OwnerRentalAnalytics = () => {
  const { data: analytics, isLoading } = useRentalAnalytics();
  const [subTab, setSubTab] = useState("overview");

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!analytics || analytics.totalBookings === 0) {
    return (
      <Card className="p-8 border-border">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Data Analitik</h3>
          <p className="text-sm text-muted-foreground">Data akan muncul setelah ada booking rental.</p>
        </div>
      </Card>
    );
  }

  // Compute growth from monthly revenue
  const months = analytics.monthlyRevenue;
  const lastMonth = months[months.length - 1];
  const prevMonth = months.length > 1 ? months[months.length - 2] : null;
  const revenueGrowth = prevMonth && prevMonth.revenue > 0
    ? Math.round(((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
    : 0;
  const bookingGrowth = prevMonth && prevMonth.bookings > 0
    ? Math.round(((lastMonth.bookings - prevMonth.bookings) / prevMonth.bookings) * 100)
    : 0;

  const collectionRate = analytics.totalRevenue > 0 
    ? Math.round((analytics.paidRevenue / analytics.totalRevenue) * 100) : 0;

  const statCards = [
    { icon: CalendarDays, label: "Total Booking", value: analytics.totalBookings.toString(), trend: bookingGrowth, color: "text-primary", bg: "bg-primary/10" },
    { icon: Home, label: "Tingkat Hunian", value: `${analytics.occupancyRate}%`, trend: null, color: "text-chart-1", bg: "bg-chart-1/10" },
    { icon: DollarSign, label: "Total Pendapatan", value: null, amount: analytics.totalRevenue, trend: revenueGrowth, color: "text-chart-1", bg: "bg-chart-1/10" },
    { icon: TrendingUp, label: "Rata-rata/Booking", value: null, amount: analytics.avgBookingValue, trend: null, color: "text-primary", bg: "bg-primary/10" },
    { icon: Percent, label: "Collection Rate", value: `${collectionRate}%`, trend: null, color: collectionRate >= 80 ? "text-chart-1" : "text-destructive", bg: collectionRate >= 80 ? "bg-chart-1/10" : "bg-destructive/10" },
    { icon: Users, label: "Durasi Rata-rata", value: `${analytics.avgBookingDuration} hari`, trend: null, color: "text-chart-3", bg: "bg-chart-3/10" },
  ];

  // Revenue cumulative for area chart
  const cumulativeRevenue = months.reduce((acc: { month: string; cumulative: number; revenue: number }[], m) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({ month: m.month, cumulative: prev + m.revenue, revenue: m.revenue });
    return acc;
  }, []);

  return (
    <div className="space-y-3">
      {/* Summary Header */}
      <Card className="border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-chart-1/5 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">Total Pendapatan</p>
              <p className="text-lg font-bold text-foreground"><Price amount={analytics.totalRevenue} /></p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                {revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-chart-1" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                )}
                <span className={`text-xs font-bold ${revenueGrowth >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground">vs bulan lalu</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground">Lunas</p>
              <p className="text-xs font-semibold text-chart-1"><Price amount={analytics.paidRevenue} short /></p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground">Belum Bayar</p>
              <p className="text-xs font-semibold text-destructive"><Price amount={analytics.unpaidRevenue} short /></p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground">Collection</p>
              <Progress value={collectionRate} className="h-1.5 mt-1" />
              <p className="text-[9px] font-medium text-foreground mt-0.5">{collectionRate}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="w-full h-7 p-0.5">
          <TabsTrigger value="overview" className="text-[8px] h-5 gap-0.5 flex-1">
            <BarChart3 className="h-2.5 w-2.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="text-[8px] h-5 gap-0.5 flex-1">
            <DollarSign className="h-2.5 w-2.5" /> Pendapatan
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-[8px] h-5 gap-0.5 flex-1">
            <Target className="h-2.5 w-2.5" /> Performa
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3 mt-2">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {statCards.map((s, i) => (
              <Card key={i} className="p-2.5 border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`h-3 w-3 ${s.color}`} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{s.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <p className={`text-xs font-bold ${s.color}`}>{s.amount !== undefined ? <Price amount={s.amount} short /> : s.value}</p>
                  {s.trend !== null && (
                    <span className={`text-[8px] font-medium ${s.trend >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                      {s.trend >= 0 ? '↑' : '↓'}{Math.abs(s.trend)}%
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pie Charts Row */}
          <div className="grid grid-cols-2 gap-2">
            {analytics.statusBreakdown.length > 0 && (
              <Card className="p-2.5 border-border">
                <CardHeader className="p-0 pb-1">
                  <CardTitle className="text-[10px]">Status Booking</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ResponsiveContainer width="100%" height={110}>
                    <PieChart>
                      <Pie data={analytics.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={22}>
                        {analytics.statusBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 10, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {analytics.statusBreakdown.map((s, i) => (
                      <div key={i} className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {s.name} ({s.value})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {analytics.paymentBreakdown.length > 0 && (
              <Card className="p-2.5 border-border">
                <CardHeader className="p-0 pb-1">
                  <CardTitle className="text-[10px]">Status Bayar</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ResponsiveContainer width="100%" height={110}>
                    <PieChart>
                      <Pie data={analytics.paymentBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={22}>
                        {analytics.paymentBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 10, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {analytics.paymentBreakdown.map((s, i) => (
                      <div key={i} className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {s.name} ({s.value})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Bookings */}
          {analytics.recentBookings.length > 0 && (
            <Card className="border-border">
              <CardHeader className="p-2.5 pb-1">
                <CardTitle className="text-[10px] flex items-center gap-1">
                  <Zap className="h-3 w-3 text-chart-3" /> Booking Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0 space-y-1.5">
                {analytics.recentBookings.map((b: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded-md bg-muted/30 border border-border/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-medium text-foreground truncate">
                        {b.properties?.title || 'Properti'}
                      </p>
                      <p className="text-[8px] text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[9px] font-semibold text-foreground"><Price amount={b.total_amount} short /></p>
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1">
                        {b.booking_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-3 mt-2">
          {/* Monthly Revenue Bar */}
          <Card className="p-2.5 border-border">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-chart-1" /> Pendapatan Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [getCurrencyFormatter()(value), "Pendapatan"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Revenue Area */}
          <Card className="p-2.5 border-border">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5 text-primary" /> Pendapatan Kumulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={cumulativeRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [getCurrencyFormatter()(value), "Kumulatif"]}
                  />
                  <Area type="monotone" dataKey="cumulative" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-2.5 border-border">
              <p className="text-[9px] text-muted-foreground mb-1">Sudah Dibayar</p>
              <p className="text-sm font-bold text-chart-1"><Price amount={analytics.paidRevenue} /></p>
              <Progress value={collectionRate} className="h-1 mt-1.5" />
            </Card>
            <Card className="p-2.5 border-border">
              <p className="text-[9px] text-muted-foreground mb-1">Belum Dibayar</p>
              <p className="text-sm font-bold text-destructive"><Price amount={analytics.unpaidRevenue} /></p>
              <Progress value={100 - collectionRate} className="h-1 mt-1.5" />
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-3 mt-2">
          {/* Booking Trend */}
          <Card className="p-2.5 border-border">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-primary" /> Tren Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 11, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--chart-1))" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-2.5 border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <Home className="h-3 w-3 text-chart-1" />
                <p className="text-[9px] text-muted-foreground">Occupancy Rate</p>
              </div>
              <p className="text-lg font-bold text-foreground">{analytics.occupancyRate}%</p>
              <Progress value={analytics.occupancyRate} className="h-1.5 mt-1" />
              <p className="text-[8px] text-muted-foreground mt-0.5">
                {analytics.occupancyRate >= 70 ? '🟢 Sangat Baik' : analytics.occupancyRate >= 40 ? '🟡 Cukup' : '🔴 Perlu Ditingkatkan'}
              </p>
            </Card>
            <Card className="p-2.5 border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="h-3 w-3 text-primary" />
                <p className="text-[9px] text-muted-foreground">Conversion</p>
              </div>
              <p className="text-lg font-bold text-foreground">
                {analytics.totalBookings > 0 ? Math.round((analytics.completedBookings / analytics.totalBookings) * 100) : 0}%
              </p>
              <Progress value={analytics.totalBookings > 0 ? (analytics.completedBookings / analytics.totalBookings) * 100 : 0} className="h-1.5 mt-1" />
              <p className="text-[8px] text-muted-foreground mt-0.5">
                {analytics.completedBookings} selesai dari {analytics.totalBookings}
              </p>
            </Card>
          </div>

          {/* Cancellation Rate */}
          <Card className="p-2.5 border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Percent className="h-3 w-3 text-destructive" />
                <p className="text-[10px] font-medium text-foreground">Tingkat Pembatalan</p>
              </div>
              <Badge variant="outline" className="text-[8px] h-4">
                {analytics.totalBookings > 0 ? Math.round((analytics.cancelledBookings / analytics.totalBookings) * 100) : 0}%
              </Badge>
            </div>
            <Progress 
              value={analytics.totalBookings > 0 ? (analytics.cancelledBookings / analytics.totalBookings) * 100 : 0} 
              className="h-1.5" 
            />
            <p className="text-[8px] text-muted-foreground mt-1">
              {analytics.cancelledBookings} dari {analytics.totalBookings} booking dibatalkan
            </p>
          </Card>

          {/* Duration Stats */}
          <Card className="p-2.5 border-border">
            <CardHeader className="p-0 pb-1.5">
              <CardTitle className="text-[10px] flex items-center gap-1">
                <Users className="h-3 w-3 text-chart-3" /> Statistik Durasi Sewa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-md bg-muted/30">
                  <p className="text-[8px] text-muted-foreground">Rata-rata</p>
                  <p className="text-sm font-bold text-foreground">{analytics.avgBookingDuration}</p>
                  <p className="text-[8px] text-muted-foreground">hari</p>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/30">
                  <p className="text-[8px] text-muted-foreground">Booking Aktif</p>
                  <p className="text-sm font-bold text-chart-1">{analytics.activeBookings}</p>
                  <p className="text-[8px] text-muted-foreground">unit</p>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/30">
                  <p className="text-[8px] text-muted-foreground">Selesai</p>
                  <p className="text-sm font-bold text-primary">{analytics.completedBookings}</p>
                  <p className="text-[8px] text-muted-foreground">unit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerRentalAnalytics;
