import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Zap, AlertTriangle, Clock, Server, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const hourlyTraffic = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  requests: Math.floor(Math.random() * 800 + 200 + (i >= 8 && i <= 20 ? 600 : 0)),
  errors: Math.floor(Math.random() * 15 + (i >= 8 && i <= 20 ? 5 : 1)),
}));

const endpoints = [
  { path: "core-engine", calls: 42500, avgLatency: 145, errorRate: 0.8, p99: 420, status: "healthy" },
  { path: "ai-engine", calls: 28300, avgLatency: 890, errorRate: 1.2, p99: 2100, status: "warning" },
  { path: "auth-engine", calls: 35200, avgLatency: 65, errorRate: 0.3, p99: 180, status: "healthy" },
  { path: "payment-engine", calls: 8900, avgLatency: 320, errorRate: 0.5, p99: 850, status: "healthy" },
  { path: "notification-engine", calls: 15600, avgLatency: 210, errorRate: 1.8, p99: 650, status: "warning" },
  { path: "vendor-engine", calls: 12400, avgLatency: 180, errorRate: 0.4, p99: 520, status: "healthy" },
];

const dailyData = [
  { day: "Mon", calls: 18500, errors: 185 },
  { day: "Tue", calls: 21200, errors: 148 },
  { day: "Wed", calls: 24800, errors: 198 },
  { day: "Thu", calls: 22100, errors: 155 },
  { day: "Fri", calls: 26500, errors: 212 },
  { day: "Sat", calls: 15800, errors: 95 },
  { day: "Sun", calls: 13200, errors: 79 },
];

const ApiUsageMonitor = () => {
  const [period, setPeriod] = useState("24h");
  const totalCalls = endpoints.reduce((s, e) => s + e.calls, 0);
  const avgLatency = Math.round(endpoints.reduce((s, e) => s + e.avgLatency, 0) / endpoints.length);
  const avgErrorRate = (endpoints.reduce((s, e) => s + e.errorRate, 0) / endpoints.length).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">API Usage Monitor</h2>
          <p className="text-sm text-muted-foreground">Edge function performance and traffic analytics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{(totalCalls / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground">Total Calls</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-foreground">{avgLatency}ms</p>
          <p className="text-[10px] text-muted-foreground">Avg Latency</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{avgErrorRate}%</p>
          <p className="text-[10px] text-muted-foreground">Error Rate</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Server className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{endpoints.filter(e => e.status === "healthy").length}/{endpoints.length}</p>
          <p className="text-[10px] text-muted-foreground">Healthy Endpoints</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Hourly Traffic</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="requests" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Requests" />
                <Area type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} name="Errors" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Volume</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Endpoint Performance</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {endpoints.map((ep, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <Activity className={`h-4 w-4 shrink-0 ${ep.status === "healthy" ? "text-chart-2" : "text-chart-3"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-medium text-foreground">{ep.path}</code>
                  <Badge variant={ep.status === "healthy" ? "secondary" : "destructive"} className="text-[9px]">{ep.status}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>{ep.calls.toLocaleString()} calls</span>
                  <span>Avg: {ep.avgLatency}ms</span>
                  <span>P99: {ep.p99}ms</span>
                  <span className={ep.errorRate > 1 ? "text-destructive" : "text-chart-2"}>{ep.errorRate}% errors</span>
                </div>
              </div>
              <div className="w-20 shrink-0">
                <Progress value={Math.min(100, (ep.avgLatency / 1000) * 100)} className="h-1.5" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiUsageMonitor;
