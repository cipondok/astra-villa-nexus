import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, CreditCard, Users, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfMonth, eachDayOfInterval } from "date-fns";

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

  const { data: transactionData } = useQuery({
    queryKey: ["revenue-transactions", period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_summary")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as Array<{
        amount: number | null;
        transaction_type: string | null;
        status: string | null;
        created_at: string;
        payment_method: string | null;
      }>;
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

  // Compute metrics
  const totalRevenue = (transactionData || [])
    .filter((t) => t.status === "completed" || t.status === "success")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalTransactions = (transactionData || []).length;
  const completedTransactions = (transactionData || []).filter((t) => t.status === "completed" || t.status === "success").length;
  const avgTransactionValue = completedTransactions > 0 ? totalRevenue / completedTransactions : 0;
  const totalCommissions = (commissionData || []).reduce((sum, c) => sum + (Number(c.commission_amount) || 0), 0);

  // Daily revenue chart data
  const dailyRevenue = (() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), daysBack), end: new Date() });
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTransactions = (transactionData || []).filter(
        (t) => format(new Date(t.created_at), "yyyy-MM-dd") === dayStr && (t.status === "completed" || t.status === "success")
      );
      return {
        date: format(day, "MMM dd"),
        revenue: dayTransactions.reduce((s, t) => s + (Number(t.amount) || 0), 0),
        count: dayTransactions.length,
      };
    });
  })();

  // Revenue by type
  const revenueByType = (() => {
    const types: Record<string, number> = {};
    (transactionData || [])
      .filter((t) => t.status === "completed" || t.status === "success")
      .forEach((t) => {
        const type = t.transaction_type || "other";
        types[type] = (types[type] || 0) + (Number(t.amount) || 0);
      });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  })();

  // Payment method breakdown
  const paymentMethods = (() => {
    const methods: Record<string, number> = {};
    (transactionData || []).forEach((t) => {
      const method = t.payment_method || "unknown";
      methods[method] = (methods[method] || 0) + 1;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
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
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, trend: "+12.5%" },
          { label: "Transactions", value: totalTransactions.toLocaleString(), icon: CreditCard, trend: `${completedTransactions} completed` },
          { label: "Avg Value", value: formatCurrency(avgTransactionValue), icon: TrendingUp, trend: null },
          { label: "Commissions Paid", value: formatCurrency(totalCommissions), icon: Users, trend: null },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              {kpi.trend && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.trend}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="h-8">
          <TabsTrigger value="overview" className="text-xs h-7">Revenue Trend</TabsTrigger>
          <TabsTrigger value="breakdown" className="text-xs h-7">By Type</TabsTrigger>
          <TabsTrigger value="methods" className="text-xs h-7">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
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
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
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
                <p className="text-center text-sm text-muted-foreground py-12">No transaction data yet</p>
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

        <TabsContent value="methods">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {paymentMethods.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">No payment data yet</p>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={220}>
                    <PieChart>
                      <Pie data={paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                        {paymentMethods.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {paymentMethods.map((m, i) => (
                      <div key={m.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs text-foreground capitalize">{m.name}</span>
                        <span className="text-xs text-muted-foreground">({m.value})</span>
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
