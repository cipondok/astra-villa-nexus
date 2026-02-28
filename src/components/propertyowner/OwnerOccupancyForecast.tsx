import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Price from "@/components/ui/Price";
import { getCurrencyFormatter } from "@/stores/currencyStore";
import { format, startOfMonth, subMonths, addMonths, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Loader2, TrendingUp, TrendingDown, Home, DollarSign, CalendarDays,
  BarChart3, Target, Building, Zap, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, AreaChart, Area, ComposedChart, Legend
} from "recharts";

const TOOLTIP_STYLE = {
  fontSize: 11,
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
};

const OwnerOccupancyForecast = () => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState("occupancy");
  const [selectedProperty, setSelectedProperty] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["occupancy-forecast", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: properties } = await supabase
        .from("properties")
        .select("id, title, city, status, listing_type, price")
        .eq("owner_id", user.id);

      if (!properties?.length) return null;
      const propIds = properties.map(p => p.id);

      const { data: bookings } = await supabase
        .from("rental_bookings")
        .select("id, property_id, check_in_date, check_out_date, total_amount, total_days, booking_status, payment_status, created_at")
        .in("property_id", propIds)
        .order("created_at", { ascending: true })
        .limit(1000);

      return { properties, bookings: bookings || [] };
    },
    enabled: !!user,
  });

  const analytics = useMemo(() => {
    if (!data) return null;
    const { properties, bookings } = data;
    const now = new Date();
    const activeBookings = bookings.filter(b => !["cancelled"].includes(b.booking_status || ""));

    // Filter by selected property
    const filteredBookings = selectedProperty === "all"
      ? activeBookings
      : activeBookings.filter(b => b.property_id === selectedProperty);

    const filteredProperties = selectedProperty === "all"
      ? properties
      : properties.filter(p => p.id === selectedProperty);

    // Monthly occupancy & revenue (last 12 months)
    const monthlyData: { month: string; monthDate: Date; occupancyRate: number; revenue: number; bookings: number; forecast?: boolean }[] = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const daysInMonth = monthEnd.getDate();
      const monthLabel = format(monthStart, "MMM yy", { locale: idLocale });

      let totalBookedDays = 0;
      const monthBookings = filteredBookings.filter(b => {
        if (!b.check_in_date || !b.check_out_date) return false;
        const ci = new Date(b.check_in_date);
        const co = new Date(b.check_out_date);
        return ci <= monthEnd && co >= monthStart;
      });

      monthBookings.forEach(b => {
        const ci = new Date(b.check_in_date!);
        const co = new Date(b.check_out_date!);
        const overlapStart = ci > monthStart ? ci : monthStart;
        const overlapEnd = co < monthEnd ? co : monthEnd;
        const days = Math.max(0, differenceInDays(overlapEnd, overlapStart) + 1);
        totalBookedDays += days;
      });

      const maxDays = daysInMonth * filteredProperties.length;
      const occupancyRate = maxDays > 0 ? Math.min(100, Math.round((totalBookedDays / maxDays) * 100)) : 0;
      const revenue = filteredBookings
        .filter(b => {
          const d = new Date(b.created_at);
          return d.getFullYear() === monthStart.getFullYear() && d.getMonth() === monthStart.getMonth();
        })
        .reduce((s, b) => s + (b.total_amount || 0), 0);

      monthlyData.push({
        month: monthLabel,
        monthDate: monthStart,
        occupancyRate,
        revenue,
        bookings: monthBookings.length,
      });
    }

    // Simple forecast: next 3 months using weighted moving average of last 3 months
    const last3 = monthlyData.slice(-3);
    const weights = [0.2, 0.3, 0.5];
    const avgOccupancy = Math.round(last3.reduce((s, m, i) => s + m.occupancyRate * weights[i], 0));
    const avgRevenue = Math.round(last3.reduce((s, m, i) => s + m.revenue * weights[i], 0));

    // Seasonal adjustment: compare same month last year if available
    const forecastData: typeof monthlyData = [];
    for (let i = 1; i <= 3; i++) {
      const futureMonth = addMonths(now, i);
      const label = format(startOfMonth(futureMonth), "MMM yy", { locale: idLocale });

      // Check same month from previous year data
      const sameMonthLastYear = monthlyData.find(m =>
        m.monthDate.getMonth() === futureMonth.getMonth()
      );

      let forecastOcc = avgOccupancy;
      let forecastRev = avgRevenue;

      if (sameMonthLastYear && sameMonthLastYear.occupancyRate > 0) {
        // Blend: 60% trend + 40% seasonal
        forecastOcc = Math.min(100, Math.round(avgOccupancy * 0.6 + sameMonthLastYear.occupancyRate * 0.4));
        forecastRev = Math.round(avgRevenue * 0.6 + sameMonthLastYear.revenue * 0.4);
      }

      forecastData.push({
        month: label,
        monthDate: startOfMonth(futureMonth),
        occupancyRate: forecastOcc,
        revenue: forecastRev,
        bookings: 0,
        forecast: true,
      });
    }

    // Per-property occupancy
    const propertyOccupancy = properties.map(p => {
      const pBookings = activeBookings.filter(b => b.property_id === p.id);
      const totalDays = pBookings.reduce((s, b) => s + (b.total_days || 0), 0);
      const revenue = pBookings.reduce((s, b) => s + (b.total_amount || 0), 0);
      const occupancy = Math.min(100, Math.round((totalDays / 365) * 100));
      return { ...p, totalDays, revenue, occupancy, bookingCount: pBookings.length };
    }).sort((a, b) => b.occupancy - a.occupancy);

    // Seasonal pattern (by month name)
    const seasonalMap = new Map<number, { occ: number[]; rev: number[] }>();
    monthlyData.forEach(m => {
      const monthNum = m.monthDate.getMonth();
      if (!seasonalMap.has(monthNum)) seasonalMap.set(monthNum, { occ: [], rev: [] });
      const entry = seasonalMap.get(monthNum)!;
      entry.occ.push(m.occupancyRate);
      entry.rev.push(m.revenue);
    });

    const seasonalTrend = Array.from(seasonalMap.entries())
      .map(([monthNum, data]) => ({
        month: format(new Date(2024, monthNum, 1), "MMM", { locale: idLocale }),
        monthNum,
        avgOccupancy: Math.round(data.occ.reduce((a, b) => a + b, 0) / data.occ.length),
        avgRevenue: Math.round(data.rev.reduce((a, b) => a + b, 0) / data.rev.length),
      }))
      .sort((a, b) => a.monthNum - b.monthNum);

    // Current vs previous month
    const currentMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];
    const occChange = prevMonth ? currentMonth.occupancyRate - prevMonth.occupancyRate : 0;
    const revChange = prevMonth && prevMonth.revenue > 0
      ? Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
      : 0;

    const combinedChart = [...monthlyData.slice(-6), ...forecastData];

    return {
      monthlyData,
      forecastData,
      combinedChart,
      propertyOccupancy,
      seasonalTrend,
      currentOccupancy: currentMonth?.occupancyRate || 0,
      currentRevenue: currentMonth?.revenue || 0,
      occChange,
      revChange,
      avgOccupancy,
      forecastRevenue: forecastData.reduce((s, f) => s + f.revenue, 0),
      totalProperties: filteredProperties.length,
    };
  }, [data, selectedProperty]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!analytics || !data?.properties.length) {
    return (
      <Card className="p-8 text-center">
        <Building className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm font-medium">Belum ada data</p>
        <p className="text-xs text-muted-foreground">Tambahkan properti dan booking untuk melihat forecast</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-sm sm:text-base font-bold text-foreground">Occupancy & Revenue Forecast</h2>
        </div>
      </div>

      {/* Property Filter */}
      <Select value={selectedProperty} onValueChange={setSelectedProperty}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Properti ({data.properties.length})</SelectItem>
          {data.properties.map(p => (
            <SelectItem key={p.id} value={p.id} className="text-xs">{p.title} — {p.city}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          {
            icon: Home, label: "Occupancy Bulan Ini",
            value: `${analytics.currentOccupancy}%`,
            change: analytics.occChange,
            color: analytics.currentOccupancy >= 60 ? "text-chart-1" : "text-chart-3",
            bg: analytics.currentOccupancy >= 60 ? "bg-chart-1/10" : "bg-chart-3/10",
          },
          {
            icon: DollarSign, label: "Revenue Bulan Ini",
            value: getCurrencyFormatter()(analytics.currentRevenue),
            change: analytics.revChange,
            color: "text-primary", bg: "bg-primary/10",
          },
          {
            icon: TrendingUp, label: "Forecast Occupancy",
            value: `${analytics.avgOccupancy}%`,
            change: null,
            color: "text-chart-5", bg: "bg-chart-5/10",
          },
          {
            icon: Zap, label: "Forecast Revenue (3bln)",
            value: getCurrencyFormatter()(analytics.forecastRevenue),
            change: null,
            color: "text-chart-1", bg: "bg-chart-1/10",
          },
        ].map((s, i) => (
          <Card key={i} className="p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${s.bg}`}>
                <s.icon className={`h-3 w-3 ${s.color}`} />
              </div>
              <span className="text-[9px] text-muted-foreground leading-tight">{s.label}</span>
            </div>
            <p className={`text-xs sm:text-sm font-bold ${s.color}`}>{s.value}</p>
            {s.change !== null && (
              <div className="flex items-center gap-0.5 mt-0.5">
                {s.change >= 0 ? (
                  <ArrowUpRight className="h-2.5 w-2.5 text-chart-1" />
                ) : (
                  <ArrowDownRight className="h-2.5 w-2.5 text-destructive" />
                )}
                <span className={`text-[9px] font-medium ${s.change >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                  {s.change >= 0 ? '+' : ''}{s.change}{typeof s.change === 'number' && s.label.includes('Revenue') ? '%' : 'pp'}
                </span>
                <span className="text-[8px] text-muted-foreground">vs bulan lalu</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Sub Tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="occupancy" className="text-[10px] h-6 gap-1 px-2">
            <Home className="h-3 w-3" /> Occupancy
          </TabsTrigger>
          <TabsTrigger value="forecast" className="text-[10px] h-6 gap-1 px-2">
            <TrendingUp className="h-3 w-3" /> Forecast
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="text-[10px] h-6 gap-1 px-2">
            <CalendarDays className="h-3 w-3" /> Seasonal
          </TabsTrigger>
          <TabsTrigger value="properties" className="text-[10px] h-6 gap-1 px-2">
            <Building className="h-3 w-3" /> Per Properti
          </TabsTrigger>
        </TabsList>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy" className="space-y-3 mt-2">
          <Card className="p-2.5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5 text-primary" /> Occupancy Rate (12 bulan)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Occupancy"]} />
                  <Bar dataKey="occupancyRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occupancy gauge */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Rata-rata Occupancy</span>
              <Badge variant={analytics.avgOccupancy >= 70 ? "default" : analytics.avgOccupancy >= 40 ? "secondary" : "destructive"} className="text-[10px]">
                {analytics.avgOccupancy >= 70 ? '🟢 Sangat Baik' : analytics.avgOccupancy >= 40 ? '🟡 Cukup' : '🔴 Perlu Ditingkatkan'}
              </Badge>
            </div>
            <Progress value={analytics.avgOccupancy} className="h-2.5" />
            <p className="text-right text-xs font-bold mt-1 text-primary">{analytics.avgOccupancy}%</p>
          </Card>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-3 mt-2">
          <Card className="p-2.5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-chart-1" /> Occupancy & Revenue Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={analytics.combinedChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="occ" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <YAxis yAxisId="rev" orientation="right" tick={{ fontSize: 8 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: number, name: string) => {
                      if (name === "occupancyRate") return [`${v}%`, "Occupancy"];
                      return [getCurrencyFormatter()(v), "Revenue"];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="rev" dataKey="revenue" fill="hsl(var(--chart-1) / 0.3)" stroke="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} name="Revenue" />
                  <Line yAxisId="occ" type="monotone" dataKey="occupancyRate" stroke="hsl(var(--primary))" strokeWidth={2} dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        key={`dot-${payload.month}`}
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill={payload.forecast ? "hsl(var(--chart-3))" : "hsl(var(--primary))"}
                        stroke={payload.forecast ? "hsl(var(--chart-3))" : "hsl(var(--primary))"}
                        strokeDasharray={payload.forecast ? "3 3" : "0"}
                      />
                    );
                  }} name="Occupancy" />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-3 justify-center mt-1">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <div className="w-3 h-0.5 bg-primary rounded" /> Aktual
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <div className="w-3 h-0.5 bg-chart-3 rounded" style={{ borderTop: "1px dashed" }} /> Forecast
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Summary Cards */}
          <div className="space-y-2">
            {analytics.forecastData.map((f, i) => (
              <Card key={i} className="p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-chart-5/10 flex items-center justify-center">
                      <CalendarDays className="h-4 w-4 text-chart-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{f.month}</p>
                      <p className="text-[10px] text-muted-foreground">Prediksi</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-xs font-bold text-primary">{f.occupancyRate}%</p>
                      <p className="text-[9px] text-muted-foreground">Occupancy</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-chart-1"><Price amount={f.revenue} /></p>
                      <p className="text-[9px] text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Seasonal Tab */}
        <TabsContent value="seasonal" className="space-y-3 mt-2">
          <Card className="p-2.5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-chart-3" /> Tren Musiman
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.seasonalTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Avg Occupancy"]} />
                  <Bar dataKey="avgOccupancy" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak & low season */}
          {analytics.seasonalTrend.length > 0 && (() => {
            const peak = [...analytics.seasonalTrend].sort((a, b) => b.avgOccupancy - a.avgOccupancy)[0];
            const low = [...analytics.seasonalTrend].sort((a, b) => a.avgOccupancy - b.avgOccupancy)[0];
            return (
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-2.5 border-chart-1/30 bg-chart-1/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
                    <span className="text-[10px] font-medium">Peak Season</span>
                  </div>
                  <p className="text-sm font-bold text-chart-1">{peak.month}</p>
                  <p className="text-[10px] text-muted-foreground">Avg {peak.avgOccupancy}% occupancy</p>
                </Card>
                <Card className="p-2.5 border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-[10px] font-medium">Low Season</span>
                  </div>
                  <p className="text-sm font-bold text-destructive">{low.month}</p>
                  <p className="text-[10px] text-muted-foreground">Avg {low.avgOccupancy}% occupancy</p>
                </Card>
              </div>
            );
          })()}

          {/* Seasonal Revenue */}
          <Card className="p-2.5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-chart-1" /> Revenue per Bulan (Rata-rata)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={analytics.seasonalTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 8 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [getCurrencyFormatter()(v), "Avg Revenue"]} />
                  <Area type="monotone" dataKey="avgRevenue" fill="hsl(var(--chart-1) / 0.15)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Per Property Tab */}
        <TabsContent value="properties" className="space-y-2 mt-2">
          {analytics.propertyOccupancy.map((p, i) => (
            <Card key={p.id} className="p-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold text-muted-foreground w-4 text-center">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">{p.city} • {p.bookingCount} booking</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1">
                      <Progress value={p.occupancy} className="h-1.5" />
                    </div>
                    <span className={`text-[10px] font-bold ${p.occupancy >= 60 ? 'text-chart-1' : p.occupancy >= 30 ? 'text-chart-3' : 'text-destructive'}`}>
                      {p.occupancy}%
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-chart-1"><Price amount={p.revenue} /></p>
                  <p className="text-[9px] text-muted-foreground">{p.totalDays} hari terpakai</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerOccupancyForecast;
