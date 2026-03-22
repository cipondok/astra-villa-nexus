import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, Home, DollarSign, ArrowUpRight, Users,
  AlertTriangle, BarChart3, Calendar, CheckCircle, Clock
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const cashflowData = [
  { month: "Oct", income: 42, expense: 15 }, { month: "Nov", income: 42, expense: 12 },
  { month: "Dec", income: 45, expense: 18 }, { month: "Jan", income: 48, expense: 14 },
  { month: "Feb", income: 48, expense: 16 }, { month: "Mar", income: 50, expense: 13 },
];

const properties = [
  { title: "Villa Seminyak", rent: "Rp 42M/mo", occupancy: 92, yield: 12.3, tenant: "Paid", vacancy: "low" },
  { title: "Apt Canggu", rent: "Rp 18M/mo", occupancy: 85, yield: 12.0, tenant: "Due in 3 days", vacancy: "medium" },
];

const tenantPayments = [
  { tenant: "Villa Tenant A", amount: "Rp 42M", status: "paid", date: "Mar 1" },
  { tenant: "Villa Tenant B", amount: "Rp 42M", status: "paid", date: "Mar 1" },
  { tenant: "Apt Tenant", amount: "Rp 18M", status: "pending", date: "Mar 25" },
];

const benchmarks = [
  { label: "Your Avg Yield", value: "12.2%", market: "8.5%", better: true },
  { label: "Occupancy Rate", value: "89%", market: "82%", better: true },
  { label: "Vacancy Days", value: "8 days", market: "15 days", better: true },
  { label: "Expense Ratio", value: "28%", market: "32%", better: true },
];

const payStatus = (s: string) => s === "paid" ? "bg-chart-1/15 text-chart-1" : "bg-chart-3/15 text-chart-3";
const vacancyColor = (v: string) => v === "low" ? "bg-chart-1/15 text-chart-1" : v === "medium" ? "bg-chart-3/15 text-chart-3" : "bg-destructive/15 text-destructive";

const RentalYieldMonitoring: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Rental Yield Monitoring
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Income performance & occupancy intelligence</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">12.2% Avg Yield</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Monthly Income", value: "Rp 60M", icon: DollarSign, color: "text-chart-1", delta: "+8.3% MoM" },
          { label: "Avg Occupancy", value: "89%", icon: Home, color: "text-primary", delta: "2 properties" },
          { label: "Net Yield", value: "12.2%", icon: TrendingUp, color: "text-chart-2", delta: "vs 8.5% market" },
          { label: "Annual Income", value: "Rp 720M", icon: Wallet, color: "text-chart-3", delta: "Projected" },
          { label: "Tenants", value: "3 active", icon: Users, color: "text-primary", delta: "All verified" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-border/50">
              <CardContent className="p-2.5 text-center">
                <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                <div className="text-sm font-bold text-foreground">{m.value}</div>
                <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
                <div className="text-[9px] text-chart-1 flex items-center justify-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="h-2.5 w-2.5" />{m.delta}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Cashflow Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Cashflow Stability Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cashflowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 11 }} formatter={(v: number) => [`Rp ${v}M`, ""]} />
              <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4,4,0,0]} name="Expense" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          {/* Property Yield Cards */}
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Property Rental Performance</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {properties.map((p, i) => (
                <motion.div key={p.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border-border/30">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-foreground">{p.title}</div>
                        <Badge className={`${vacancyColor(p.vacancy)} text-[8px]`}>Vacancy: {p.vacancy}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div><div className="text-[9px] text-muted-foreground">Rent</div><div className="text-[11px] font-bold text-chart-1">{p.rent}</div></div>
                        <div><div className="text-[9px] text-muted-foreground">Occupancy</div><div className="text-[11px] font-bold text-foreground">{p.occupancy}%</div></div>
                        <div><div className="text-[9px] text-muted-foreground">Yield</div><div className="text-[11px] font-bold text-chart-1">{p.yield}%</div></div>
                        <div><div className="text-[9px] text-muted-foreground">Payment</div><div className={`text-[11px] font-bold ${p.tenant === "Paid" ? "text-chart-1" : "text-chart-3"}`}>{p.tenant}</div></div>
                      </div>
                      <Progress value={p.occupancy} className="h-1.5 mt-2" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insight */}
          <Card className="border-chart-1/20 bg-chart-1/5">
            <CardContent className="p-3 flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-chart-1 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-foreground">Yield Optimization Insight</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Rental yield for Apt Canggu may improve by 8% by adjusting monthly rate to Rp 19.5M — matching current district demand trends and reducing vacancy risk.</p>
              </div>
            </CardContent>
          </Card>

          {/* Benchmark */}
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Yield Benchmark Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {benchmarks.map(b => (
                  <div key={b.label} className="p-2 rounded-lg border border-border/30 text-center">
                    <div className="text-[9px] text-muted-foreground uppercase">{b.label}</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">{b.value}</div>
                    <div className={`text-[9px] flex items-center justify-center gap-0.5 mt-0.5 ${b.better ? "text-chart-1" : "text-destructive"}`}>
                      <ArrowUpRight className="h-2.5 w-2.5" />Market: {b.market}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-xs flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> Tenant Payments</CardTitle></CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {tenantPayments.map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded border border-border/20">
                  {t.status === "paid" ? <CheckCircle className="h-3 w-3 text-chart-1 flex-shrink-0" /> : <Clock className="h-3 w-3 text-chart-3 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-foreground truncate">{t.tenant}</div>
                    <div className="text-[9px] text-muted-foreground">{t.amount} • {t.date}</div>
                  </div>
                  <Badge className={`${payStatus(t.status)} text-[7px]`}>{t.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-chart-3/20 bg-chart-3/5">
            <CardContent className="p-3">
              <AlertTriangle className="h-4 w-4 text-chart-3 mb-1" />
              <div className="text-xs font-bold text-foreground">Vacancy Risk Alert</div>
              <p className="text-[9px] text-muted-foreground mt-1">Apt Canggu tenant lease expires in 45 days. Consider renewal negotiation or listing preparation.</p>
              <Progress value={70} className="h-1.5 mt-2" />
              <div className="text-[8px] text-muted-foreground mt-0.5">45 days remaining</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RentalYieldMonitoring;
