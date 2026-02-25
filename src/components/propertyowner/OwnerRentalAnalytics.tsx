import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRentalAnalytics } from "@/hooks/useRentalAnalytics";
import { formatIDR } from "@/utils/currency";
import { Loader2, TrendingUp, Home, DollarSign, CalendarDays, BarChart3, Users, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-1))", "hsl(var(--chart-3))", "hsl(var(--destructive))"];

const OwnerRentalAnalytics = () => {
  const { data: analytics, isLoading } = useRentalAnalytics();

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

  const statCards = [
    { icon: CalendarDays, label: "Total Booking", value: analytics.totalBookings, color: "text-primary", bg: "bg-primary/10" },
    { icon: Home, label: "Tingkat Hunian", value: `${analytics.occupancyRate}%`, color: "text-chart-1", bg: "bg-chart-1/10" },
    { icon: DollarSign, label: "Total Pendapatan", value: formatIDR(analytics.totalRevenue), color: "text-chart-1", bg: "bg-chart-1/10" },
    { icon: TrendingUp, label: "Rata-rata/Booking", value: formatIDR(analytics.avgBookingValue), color: "text-primary", bg: "bg-primary/10" },
    { icon: Percent, label: "Belum Dibayar", value: formatIDR(analytics.unpaidRevenue), color: "text-destructive", bg: "bg-destructive/10" },
    { icon: Users, label: "Durasi Rata-rata", value: `${analytics.avgBookingDuration} hari`, color: "text-chart-3", bg: "bg-chart-3/10" },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {statCards.map((s, i) => (
          <Card key={i} className="p-3 border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${s.bg}`}>
                <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
              </div>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="p-3 border-border">
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
                formatter={(value: number) => [formatIDR(value), "Pendapatan"]}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Booking Trend */}
      <Card className="p-3 border-border">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-xs flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-primary" /> Tren Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={analytics.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ fontSize: 11, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
              />
              <Line type="monotone" dataKey="bookings" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--chart-1))" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Status Breakdown */}
        {analytics.statusBreakdown.length > 0 && (
          <Card className="p-3 border-border">
            <CardHeader className="p-0 pb-1">
              <CardTitle className="text-[10px]">Status Booking</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={analytics.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} innerRadius={25}>
                    {analytics.statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center">
                {analytics.statusBreakdown.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {s.name} ({s.value})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Breakdown */}
        {analytics.paymentBreakdown.length > 0 && (
          <Card className="p-3 border-border">
            <CardHeader className="p-0 pb-1">
              <CardTitle className="text-[10px]">Status Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={analytics.paymentBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} innerRadius={25}>
                    {analytics.paymentBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center">
                {analytics.paymentBreakdown.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {s.name} ({s.value})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OwnerRentalAnalytics;
