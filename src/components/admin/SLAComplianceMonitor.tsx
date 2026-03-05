import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertTriangle, XCircle, TrendingUp, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SLAMetric {
  id: string;
  name: string;
  target: string;
  current: number;
  threshold: number;
  status: "met" | "at-risk" | "breached";
  trend: "up" | "down" | "stable";
  breachCount: number;
  totalTickets: number;
}

const slaMetrics: SLAMetric[] = [
  { id: "1", name: "First Response Time", target: "< 2 hours", current: 92, threshold: 90, status: "met", trend: "up", breachCount: 12, totalTickets: 150 },
  { id: "2", name: "Resolution Time", target: "< 24 hours", current: 87, threshold: 85, status: "met", trend: "stable", breachCount: 19, totalTickets: 150 },
  { id: "3", name: "Customer Satisfaction", target: "> 4.5/5", current: 94, threshold: 90, status: "met", trend: "up", breachCount: 9, totalTickets: 150 },
  { id: "4", name: "Uptime SLA", target: "99.9%", current: 99.95, threshold: 99.9, status: "met", trend: "stable", breachCount: 0, totalTickets: 720 },
  { id: "5", name: "Property Listing Review", target: "< 4 hours", current: 78, threshold: 85, status: "breached", trend: "down", breachCount: 33, totalTickets: 150 },
  { id: "6", name: "KYC Verification", target: "< 48 hours", current: 88, threshold: 90, status: "at-risk", trend: "down", breachCount: 18, totalTickets: 150 },
];

const weeklyData = [
  { day: "Mon", met: 42, breached: 3 },
  { day: "Tue", met: 38, breached: 5 },
  { day: "Wed", met: 45, breached: 2 },
  { day: "Thu", met: 40, breached: 4 },
  { day: "Fri", met: 50, breached: 1 },
  { day: "Sat", met: 20, breached: 2 },
  { day: "Sun", met: 15, breached: 1 },
];

const statusColors: Record<string, string> = {
  met: "hsl(var(--chart-2))",
  "at-risk": "hsl(var(--chart-3))",
  breached: "hsl(var(--destructive))",
};

const SLAComplianceMonitor = () => {
  const [period, setPeriod] = useState("7d");

  const overallCompliance = useMemo(() => {
    const total = slaMetrics.reduce((sum, m) => sum + m.current, 0);
    return (total / slaMetrics.length).toFixed(1);
  }, []);

  const statusDistribution = useMemo(() => [
    { name: "Met", value: slaMetrics.filter(m => m.status === "met").length, color: statusColors.met },
    { name: "At Risk", value: slaMetrics.filter(m => m.status === "at-risk").length, color: statusColors["at-risk"] },
    { name: "Breached", value: slaMetrics.filter(m => m.status === "breached").length, color: statusColors.breached },
  ], []);

  const getStatusIcon = (status: string) => {
    if (status === "met") return <CheckCircle className="h-4 w-4 text-chart-2" />;
    if (status === "at-risk") return <AlertTriangle className="h-4 w-4 text-chart-3" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">SLA Compliance Monitor</h2>
          <p className="text-sm text-muted-foreground">Track service level agreements across all operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Overall Compliance</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{overallCompliance}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">SLAs Met</span>
            </div>
            <p className="text-2xl font-bold text-chart-2">{slaMetrics.filter(m => m.status === "met").length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-chart-3" />
              <span className="text-xs text-muted-foreground">At Risk</span>
            </div>
            <p className="text-2xl font-bold text-chart-3">{slaMetrics.filter(m => m.status === "at-risk").length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Breached</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{slaMetrics.filter(m => m.status === "breached").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weekly SLA Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="met" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Met" />
                <Bar dataKey="breached" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Breached" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SLA Table */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">SLA Metrics Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slaMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                {getStatusIcon(metric.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{metric.name}</span>
                    <Badge variant={metric.status === "met" ? "default" : metric.status === "at-risk" ? "secondary" : "destructive"} className="text-[10px]">
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">Target: {metric.target}</span>
                    <span className="text-xs text-muted-foreground">Breaches: {metric.breachCount}/{metric.totalTickets}</span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{metric.current}%</span>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <Progress value={metric.current} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SLAComplianceMonitor;
