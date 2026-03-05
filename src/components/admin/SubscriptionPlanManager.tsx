import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Users, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  activeUsers: number;
  churnRate: number;
  mrr: number;
  color: string;
  features: string[];
}

const plans: Plan[] = [
  { id: "1", name: "Free", price: 0, interval: "forever", activeUsers: 42000, churnRate: 0, mrr: 0, color: "hsl(var(--muted-foreground))", features: ["5 saved properties", "Basic search"] },
  { id: "2", name: "Starter", price: 99000, interval: "month", activeUsers: 8500, churnRate: 4.2, mrr: 841500000, color: "hsl(var(--chart-2))", features: ["50 saved", "AI match", "Alerts"] },
  { id: "3", name: "Professional", price: 299000, interval: "month", activeUsers: 3200, churnRate: 2.1, mrr: 956800000, color: "hsl(var(--primary))", features: ["Unlimited", "Priority support", "Analytics"] },
  { id: "4", name: "Enterprise", price: 999000, interval: "month", activeUsers: 450, churnRate: 0.8, mrr: 449550000, color: "hsl(var(--chart-4))", features: ["Custom", "API access", "Dedicated AM"] },
];

const mrrTrend = [
  { month: "Oct", free: 0, starter: 720, pro: 820, enterprise: 380 },
  { month: "Nov", free: 0, starter: 760, pro: 860, enterprise: 400 },
  { month: "Dec", free: 0, starter: 780, pro: 890, enterprise: 410 },
  { month: "Jan", free: 0, starter: 810, pro: 920, enterprise: 430 },
  { month: "Feb", free: 0, starter: 830, pro: 940, enterprise: 440 },
  { month: "Mar", free: 0, starter: 842, pro: 957, enterprise: 450 },
];

const conversionFunnel = [
  { stage: "Free", users: 42000 },
  { stage: "Trial", users: 5200 },
  { stage: "Starter", users: 8500 },
  { stage: "Pro", users: 3200 },
  { stage: "Enterprise", users: 450 },
];

const pieDist = plans.filter(p => p.mrr > 0).map(p => ({ name: p.name, value: p.mrr / 1e6, color: p.color }));

const SubscriptionPlanManager = () => {
  const totalMRR = plans.reduce((s, p) => s + p.mrr, 0);
  const totalPaid = plans.filter(p => p.price > 0).reduce((s, p) => s + p.activeUsers, 0);
  const avgChurn = (plans.filter(p => p.price > 0).reduce((s, p) => s + p.churnRate, 0) / 3).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Subscription Plan Manager</h2>
        <p className="text-sm text-muted-foreground">Plan performance, MRR tracking, and conversion analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {(totalMRR / 1e9).toFixed(1)}B</p>
          <p className="text-[10px] text-muted-foreground">Total MRR</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{(totalPaid / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground">Paid Users</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-foreground">{((totalPaid / (totalPaid + plans[0].activeUsers)) * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Conversion Rate</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <ArrowDownRight className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{avgChurn}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Churn</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">MRR by Plan (Rp M)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={mrrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="starter" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.4} name="Starter" />
                <Area type="monotone" dataKey="pro" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} name="Professional" />
                <Area type="monotone" dataKey="enterprise" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.4} name="Enterprise" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">MRR Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieDist} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45} label={({ name, value }) => `${name}: ${value.toFixed(0)}M`}>
                  {pieDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Plan Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {plans.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${p.color}20` }}>
                <Crown className="h-4 w-4" style={{ color: p.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <Badge variant="outline" className="text-[9px]">Rp {p.price > 0 ? (p.price / 1000).toFixed(0) + "K" : "Free"}/{p.interval}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>{p.activeUsers.toLocaleString()} users</span>
                  {p.mrr > 0 && <span className="text-chart-2">MRR: Rp {(p.mrr / 1e6).toFixed(0)}M</span>}
                  {p.churnRate > 0 && <span className="text-destructive">{p.churnRate}% churn</span>}
                </div>
              </div>
              {p.price > 0 && (
                <div className="w-20 shrink-0">
                  <Progress value={100 - p.churnRate * 10} className="h-1.5" />
                  <p className="text-[9px] text-muted-foreground text-center mt-0.5">{(100 - p.churnRate).toFixed(1)}% retention</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Conversion Funnel</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={conversionFunnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={70} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPlanManager;
