
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Price from "@/components/ui/Price";
import { getCurrencyFormatter } from "@/stores/currencyStore";
import { format, startOfMonth, subMonths } from "date-fns";
import {
  DollarSign, TrendingUp, TrendingDown, Percent, Building, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

const OwnerFinancialAnalytics = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["owner-financial-analytics", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get owner's properties
      const { data: properties } = await supabase
        .from("properties")
        .select("id, title")
        .eq("owner_id", user.id);

      if (!properties || properties.length === 0) return null;
      const propertyIds = properties.map(p => p.id);
      const propertyMap = Object.fromEntries(properties.map(p => [p.id, p.title || "Tanpa Judul"]));

      // Fetch invoices and expenses in parallel
      const [invoicesRes, expensesRes] = await Promise.all([
        supabase
          .from("rental_invoices")
          .select("id, amount, total_amount, tax_amount, status, created_at, property_id, invoice_type, paid_at")
          .in("property_id", propertyIds)
          .limit(1000),
        supabase
          .from("property_expenses")
          .select("id, amount, category, status, expense_date, property_id, title")
          .eq("owner_id", user.id)
          .limit(1000),
      ]);

      const invoices = invoicesRes.data || [];
      const expenses = expensesRes.data || [];

      return { invoices, expenses, propertyMap, propertyIds };
    },
    enabled: !!user,
  });

  const analytics = useMemo(() => {
    if (!data) return null;
    const { invoices, expenses, propertyMap, propertyIds } = data;

    const paidInvoices = invoices.filter(i => i.status === "paid");
    const paidExpenses = expenses.filter(e => e.status === "paid");

    const totalRevenue = paidInvoices.reduce((s, i) => s + (i.total_amount || 0), 0);
    const totalExpenses = paidExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    // Monthly data (last 6 months)
    const now = new Date();
    const monthlyData: { month: string; revenue: number; expenses: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const ms = startOfMonth(subMonths(now, i));
      const label = format(ms, "MMM yy");
      const mInvoices = paidInvoices.filter(inv => {
        const d = new Date(inv.paid_at || inv.created_at);
        return d.getFullYear() === ms.getFullYear() && d.getMonth() === ms.getMonth();
      });
      const mExpenses = paidExpenses.filter(exp => {
        const d = new Date(exp.expense_date);
        return d.getFullYear() === ms.getFullYear() && d.getMonth() === ms.getMonth();
      });
      const rev = mInvoices.reduce((s, i) => s + (i.total_amount || 0), 0);
      const exp = mExpenses.reduce((s, e) => s + (e.amount || 0), 0);
      monthlyData.push({ month: label, revenue: rev, expenses: exp, profit: rev - exp });
    }

    // Expense breakdown by category
    const categoryMap: Record<string, number> = {};
    paidExpenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
    const expenseByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Per-property P&L
    const propertyPnL = propertyIds.map(pid => {
      const rev = paidInvoices.filter(i => i.property_id === pid).reduce((s, i) => s + (i.total_amount || 0), 0);
      const exp = paidExpenses.filter(e => e.property_id === pid).reduce((s, e) => s + (e.amount || 0), 0);
      return { name: propertyMap[pid], revenue: rev, expenses: exp, profit: rev - exp };
    }).filter(p => p.revenue > 0 || p.expenses > 0);

    return { totalRevenue, totalExpenses, netProfit, profitMargin, monthlyData, expenseByCategory, propertyPnL };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-4">
        <div className="text-center py-6">
          <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-xs font-medium">Belum ada data keuangan</p>
          <p className="text-[9px] text-muted-foreground">Data akan muncul setelah ada invoice & pengeluaran</p>
        </div>
      </Card>
    );
  }

  const { totalRevenue, totalExpenses, netProfit, profitMargin, monthlyData, expenseByCategory, propertyPnL } = analytics;

  return (
    <div className="space-y-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { icon: DollarSign, label: "Pendapatan", amount: totalRevenue, color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: TrendingDown, label: "Pengeluaran", amount: totalExpenses, color: "text-destructive", bg: "bg-destructive/10" },
          { icon: TrendingUp, label: "Laba Bersih", amount: netProfit, color: netProfit >= 0 ? "text-chart-1" : "text-destructive", bg: netProfit >= 0 ? "bg-chart-1/10" : "bg-destructive/10" },
          { icon: Percent, label: "Margin", amount: null, displayValue: `${profitMargin.toFixed(1)}%`, color: "text-primary", bg: "bg-primary/10" },
        ].map((card, i) => (
          <Card key={i} className="p-2">
            <div className="flex items-center gap-1.5">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] text-muted-foreground">{card.label}</p>
                <p className="text-[11px] font-bold truncate">{'amount' in card && card.amount !== null ? <Price amount={card.amount} short /> : card.displayValue}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs">Pendapatan vs Pengeluaran</CardTitle>
          <CardDescription className="text-[9px]">6 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip formatter={(value: number) => getCurrencyFormatter()(value)} labelStyle={{ fontSize: 10 }} />
              <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Pendapatan" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Pengeluaran" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Trend + Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Profit Trend */}
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs">Tren Laba Bulanan</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                <Tooltip formatter={(value: number) => getCurrencyFormatter()(value)} labelStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Laba" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense by Category */}
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            {expenseByCategory.length === 0 ? (
              <p className="text-[9px] text-muted-foreground text-center py-8">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    style={{ fontSize: 8 }}
                  >
                    {expenseByCategory.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => getCurrencyFormatter()(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-Property P&L Table */}
      {propertyPnL.length > 0 && (
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-1">
              <Building className="h-3 w-3" /> Laba Rugi per Properti
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[9px] h-7 px-2">Properti</TableHead>
                  <TableHead className="text-[9px] h-7 px-2 text-right">Pendapatan</TableHead>
                  <TableHead className="text-[9px] h-7 px-2 text-right">Pengeluaran</TableHead>
                  <TableHead className="text-[9px] h-7 px-2 text-right">Laba</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertyPnL.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-[9px] px-2 py-1.5 max-w-[120px] truncate">{row.name}</TableCell>
                    <TableCell className="text-[9px] px-2 py-1.5 text-right text-chart-1"><Price amount={row.revenue} short /></TableCell>
                    <TableCell className="text-[9px] px-2 py-1.5 text-right text-destructive"><Price amount={row.expenses} short /></TableCell>
                    <TableCell className={`text-[9px] px-2 py-1.5 text-right font-semibold ${row.profit >= 0 ? "text-chart-1" : "text-destructive"}`}>
                      <Price amount={row.profit} short />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OwnerFinancialAnalytics;
