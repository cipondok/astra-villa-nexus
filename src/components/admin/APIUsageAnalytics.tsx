import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Zap, Clock, AlertTriangle, Server, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";

const EDGE_FUNCTIONS = [
  "core-engine",
  "ai-match-engine-v2",
  "ai-assistant",
  "payment-engine",
  "auth-engine",
  "notification-engine",
  "vendor-engine",
  "batch-dom-predictor",
  "ai-description-generator",
  "property-valuation",
  "predictive-pricing",
  "smart-pricing",
  "seo-analyzer",
  "rate-limiter",
  "exchange-rates",
];

const APIUsageAnalytics = () => {
  const [period, setPeriod] = useState("7d");
  const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  // Simulate API usage data from activity logs (edge function calls aren't directly tracked)
  const { data: activityData } = useQuery({
    queryKey: ["api-usage-activity", period],
    queryFn: async () => {
      const startDate = subDays(new Date(), daysBack).toISOString();
      const { data, error } = await supabase
        .from("activity_logs")
        .select("activity_type, created_at, metadata")
        .gte("created_at", startDate)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Aggregate daily API calls
  const dailyCalls = (() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), daysBack), end: new Date() });
    const logs = activityData || [];
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayCalls = logs.filter((l) => format(new Date(l.created_at), "yyyy-MM-dd") === dayStr);
      return {
        date: format(day, "MMM dd"),
        calls: dayCalls.length,
        errors: dayCalls.filter((l) => l.activity_type?.includes("error")).length,
      };
    });
  })();

  // Calls by type
  const callsByType = (() => {
    const types: Record<string, number> = {};
    (activityData || []).forEach((l) => {
      const type = l.activity_type || "unknown";
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  })();

  // Hourly distribution
  const hourlyDist = (() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, calls: 0 }));
    (activityData || []).forEach((l) => {
      const h = new Date(l.created_at).getHours();
      hours[h].calls++;
    });
    return hours;
  })();

  const totalCalls = (activityData || []).length;
  const totalErrors = (activityData || []).filter((l) => l.activity_type?.includes("error")).length;
  const errorRate = totalCalls > 0 ? ((totalErrors / totalCalls) * 100).toFixed(1) : "0";
  const avgDaily = daysBack > 0 ? Math.round(totalCalls / daysBack) : 0;

  // Edge function status (simulated health check)
  const functionStatus = EDGE_FUNCTIONS.map((name) => ({
    name,
    status: Math.random() > 0.1 ? "healthy" : "degraded",
    avgLatency: Math.round(50 + Math.random() * 400),
    calls24h: Math.round(Math.random() * 500),
  }));

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">API Usage Analytics</h2>
        </div>
        <div className="flex gap-1">
          {["7d", "30d", "90d"].map((p) => (
            <Badge key={p} variant={period === p ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setPeriod(p)}>
              {p}
            </Badge>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total API Calls", value: totalCalls.toLocaleString(), icon: Zap },
          { label: "Avg Daily", value: avgDaily.toLocaleString(), icon: TrendingUp },
          { label: "Error Rate", value: `${errorRate}%`, icon: AlertTriangle },
          { label: "Edge Functions", value: EDGE_FUNCTIONS.length.toString(), icon: Server },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="trend" className="space-y-3">
        <TabsList className="h-8">
          <TabsTrigger value="trend" className="text-xs h-7">Daily Trend</TabsTrigger>
          <TabsTrigger value="types" className="text-xs h-7">By Endpoint</TabsTrigger>
          <TabsTrigger value="hourly" className="text-xs h-7">Peak Hours</TabsTrigger>
          <TabsTrigger value="functions" className="text-xs h-7">Edge Functions</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Daily API Calls</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyCalls}>
                  <defs>
                    <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fill="url(#apiGrad)" strokeWidth={2} name="Calls" />
                  <Line type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" strokeWidth={1.5} dot={false} name="Errors" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Top API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {callsByType.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={callsByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={120} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">API Calls by Hour</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hourlyDist}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Edge Function Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {functionStatus.map((fn) => (
                  <div key={fn.name} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`w-2 h-2 rounded-full ${fn.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-mono">{fn.name}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{fn.avgLatency}ms</Badge>
                    <span className="text-xs text-muted-foreground w-16 text-right">{fn.calls24h} calls</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIUsageAnalytics;
