import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, CreditCard, Users } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { subDays } from "date-fns";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ec4899",
];

const RevenueAnalyticsDashboard = () => {
  const [period, setPeriod] = useState("30d");

  const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = subDays(new Date(), daysBack).toISOString();

  const { data: summaryData } = useQuery({
    queryKey: ["revenue-summary", period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_summary")
        .select("*")
        .gte("date", startDate.slice(0, 10));

      if (error) throw error;
      return data || [];
    },
  });

  const { data: commissionData } = useQuery({
    queryKey: ["revenue-commissions", period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_commissions")
        .select("commission_amount, status, created_at")
        .gte("created_at", startDate);

      if (error) throw error;
      return data || [];
    },
  });

  const rows = summaryData || [];

  const totalRevenue = rows.reduce((s, r) => s + (Number(r.total_revenue) || 0), 0);
  const totalTransactions = rows.reduce((s, r) => s + (Number(r.total_transactions) || 0), 0);
  const completedTransactions = rows.reduce((s, r) => s + (Number(r.completed) || 0), 0);
  const avgTransactionValue = completedTransactions > 0 ? totalRevenue / completedTransactions : 0;
  const totalCommissions = (commissionData || []).reduce((s, c) => s + (Number(c.commission_amount) || 0), 0);

  // Daily revenue: group by date
  const dailyRevenue = (() => {
    const byDate: Record<string, number> = {};
    rows.forEach((r) => {
      const d = r.date || "";
      byDate[d] = (byDate[d] || 0) + (Number(r.total_revenue) || 0);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date: date.slice(5), revenue }));
  })();

  // Revenue by type
  const revenueByType = (() => {
    const types: Record<string, number> = {};
    rows.forEach((r) => {
      const type = r.transaction_type || "other";
      types[type] = (types[type] || 0) + (Number(r.total_revenue) || 0);
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  })();

  // Status breakdown
  const statusBreakdown = (() => {
    const completed = rows.reduce((s, r) => s + (Number(r.completed) || 0), 0);
    const pending = rows.reduce((s, r) => s + (Number(r.pending) || 0), 0);
    const cancelled = rows.reduce((s, r) => s + (Number(r.cancelled) || 0), 0);
    return [
      { name: "Completed", value: completed },
      { name: "Pending", value: pending },
      { name: "Cancelled", value: cancelled },
    ].filter((s) => s.value > 0);
  })();

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(v);

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Revenue Analytics</h2>
        </div>
        <div className="flex gap-1">
          {["7d", "30d", "90d"].map((p) => (
            <Badge
              key={p}
              variant={period === p ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Badge>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign },
          { label: "Transactions", value: totalTransactions.toLocaleString(), icon: CreditCard, sub: `${completedTransactions} completed` },
          { label: "Avg Value", value: formatCurrency(avgTransactionValue), icon: TrendingUp },
          { label: "Commissions", value: formatCurrency(totalCommissions), icon: Users },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              {"sub" in kpi && kpi.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="h-8">
          <TabsTrigger value="overview" className="text-xs h-7">Revenue Trend</TabsTrigger>
          <TabsTrigger value="breakdown" className="text-xs h-7">By Type</TabsTrigger>
          <TabsTrigger value="status" className="text-xs h-7">Status Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {dailyRevenue.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">No revenue data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailyRevenue}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Revenue by Transaction Type</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {revenueByType.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueByType}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Transaction Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {statusBreakdown.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">No data</p>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={220}>
                    <PieChart>
                      <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {statusBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {statusBreakdown.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs text-foreground">{s.name}</span>
                        <span className="text-xs text-muted-foreground">({s.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueAnalyticsDashboard;
