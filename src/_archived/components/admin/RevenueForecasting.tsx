import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, Target, Calendar, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const monthlyForecast = [
  { month: "Jan", actual: 125, forecast: null },
  { month: "Feb", actual: 142, forecast: null },
  { month: "Mar", actual: 168, forecast: 165 },
  { month: "Apr", actual: null, forecast: 185 },
  { month: "May", actual: null, forecast: 198 },
  { month: "Jun", actual: null, forecast: 215 },
  { month: "Jul", actual: null, forecast: 228 },
  { month: "Aug", actual: null, forecast: 245 },
  { month: "Sep", actual: null, forecast: 260 },
];

const revenueByStream = [
  { stream: "Listing Fees", current: 82, projected: 95, growth: 15.8 },
  { stream: "Premium Subs", current: 45, projected: 62, growth: 37.8 },
  { stream: "Commissions", current: 28, projected: 35, growth: 25.0 },
  { stream: "Featured Ads", current: 18, projected: 24, growth: 33.3 },
  { stream: "B2B API", current: 8, projected: 15, growth: 87.5 },
  { stream: "Concierge", current: 5, projected: 12, growth: 140.0 },
];

const quarterlyTargets = [
  { quarter: "Q1 2026", target: 435, projected: 435, status: "on-track" },
  { quarter: "Q2 2026", target: 598, projected: 580, status: "at-risk" },
  { quarter: "Q3 2026", target: 733, projected: 750, status: "ahead" },
  { quarter: "Q4 2026", target: 890, projected: 920, status: "ahead" },
];

const streamBarData = revenueByStream.map(s => ({ name: s.stream.split(" ")[0], current: s.current, projected: s.projected }));

const RevenueForecasting = () => {
  const [horizon, setHorizon] = useState("6m");

  const totalCurrent = revenueByStream.reduce((s, r) => s + r.current, 0);
  const totalProjected = revenueByStream.reduce((s, r) => s + r.projected, 0);
  const overallGrowth = ((totalProjected - totalCurrent) / totalCurrent * 100).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Revenue Forecasting</h2>
          <p className="text-sm text-muted-foreground">Projected revenue streams and growth targets</p>
        </div>
        <Select value={horizon} onValueChange={setHorizon}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="12m">12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {totalCurrent}M</p>
          <p className="text-[10px] text-muted-foreground">Current MRR</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Target className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">Rp {totalProjected}M</p>
          <p className="text-[10px] text-muted-foreground">Projected MRR</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <ArrowUpRight className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">+{overallGrowth}%</p>
          <p className="text-[10px] text-muted-foreground">Projected Growth</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {(totalProjected * 12 / 1000).toFixed(1)}B</p>
          <p className="text-[10px] text-muted-foreground">Projected ARR</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Forecast (Rp Millions)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Actual" />
                <Area type="monotone" dataKey="forecast" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} strokeDasharray="5 5" name="Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">By Revenue Stream</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={streamBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="current" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Current" />
                <Bar dataKey="projected" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Projected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Targets */}
      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Quarterly Targets</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {quarterlyTargets.map((q, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{q.quarter}</span>
                  <Badge variant={q.status === "ahead" ? "default" : q.status === "on-track" ? "secondary" : "destructive"} className="text-[9px]">
                    {q.status === "ahead" ? "📈 Ahead" : q.status === "on-track" ? "✅ On Track" : "⚠️ At Risk"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="text-muted-foreground">Target: Rp {q.target}M</span>
                <span className={q.projected >= q.target ? "text-chart-2" : "text-destructive"}>Projected: Rp {q.projected}M</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Revenue Streams Detail */}
      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Stream Growth</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {revenueByStream.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
              <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground flex-1">{s.stream}</span>
              <span className="text-xs text-muted-foreground">Rp {s.current}M → Rp {s.projected}M</span>
              <Badge variant={s.growth >= 50 ? "default" : "secondary"} className="text-[9px]">
                <TrendingUp className="h-2.5 w-2.5 mr-0.5" />+{s.growth}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueForecasting;
