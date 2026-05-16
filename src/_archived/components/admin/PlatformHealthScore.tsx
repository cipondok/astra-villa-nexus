import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Shield, Zap, Database, Server, Globe, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface HealthMetric {
  name: string;
  score: number;
  status: "healthy" | "warning" | "critical";
  details: string;
  icon: typeof Heart;
}

const healthMetrics: HealthMetric[] = [
  { name: "Database Performance", score: 95, status: "healthy", details: "Avg query time: 12ms, 0 slow queries", icon: Database },
  { name: "API Response Time", score: 88, status: "healthy", details: "P95 latency: 245ms, 99.8% success rate", icon: Zap },
  { name: "Security Posture", score: 92, status: "healthy", details: "RLS enabled on all tables, no vulnerabilities", icon: Shield },
  { name: "User Experience", score: 78, status: "warning", details: "LCP: 2.8s (target: 2.5s), CLS: 0.05", icon: Globe },
  { name: "Error Rate", score: 96, status: "healthy", details: "0.2% error rate (last 24h), 3 unique errors", icon: Server },
  { name: "Content Quality", score: 85, status: "healthy", details: "92% listings with photos, 78% with full descriptions", icon: CheckCircle },
  { name: "Revenue Health", score: 82, status: "healthy", details: "MoM growth: +8%, churn rate: 2.1%", icon: TrendingUp },
  { name: "Infrastructure", score: 70, status: "warning", details: "Edge function cold starts: ~400ms, storage 65% used", icon: Server },
];

const radarData = healthMetrics.map(m => ({ metric: m.name.split(" ")[0], score: m.score }));

const PlatformHealthScore = () => {
  const overallScore = useMemo(() => {
    return Math.round(healthMetrics.reduce((sum, m) => sum + m.score, 0) / healthMetrics.length);
  }, []);

  const healthyCount = healthMetrics.filter(m => m.status === "healthy").length;
  const warningCount = healthMetrics.filter(m => m.status === "warning").length;
  const criticalCount = healthMetrics.filter(m => m.status === "critical").length;

  const pieData = [
    { name: "Healthy", value: healthyCount, color: "hsl(var(--chart-2))" },
    { name: "Warning", value: warningCount, color: "hsl(var(--chart-3))" },
    { name: "Critical", value: criticalCount || 0.1, color: "hsl(var(--destructive))" },
  ];

  const scoreColor = overallScore >= 85 ? "text-chart-2" : overallScore >= 70 ? "text-chart-3" : "text-destructive";

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Platform Health Score</h2>
          <p className="text-sm text-muted-foreground">Comprehensive platform wellness assessment</p>
        </div>
        <div className="text-right">
          <p className={`text-4xl font-bold ${scoreColor}`}>{overallScore}</p>
          <p className="text-xs text-muted-foreground">Overall Score</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-chart-2/30 bg-chart-2/5"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-2xl font-bold text-chart-2">{healthyCount}</p>
          <p className="text-[10px] text-muted-foreground">Healthy</p>
        </CardContent></Card>
        <Card className="border-chart-3/30 bg-chart-3/5"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-2xl font-bold text-chart-3">{warningCount}</p>
          <p className="text-[10px] text-muted-foreground">Warnings</p>
        </CardContent></Card>
        <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
          <p className="text-[10px] text-muted-foreground">Critical</p>
        </CardContent></Card>
        <Card className="border-primary/30 bg-primary/5"><CardContent className="p-3 text-center">
          <Heart className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-primary">{overallScore}%</p>
          <p className="text-[10px] text-muted-foreground">Health Index</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Health Radar</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Status Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">All Health Metrics</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {healthMetrics.map((metric, i) => {
            const Icon = metric.icon;
            const color = metric.status === "healthy" ? "text-chart-2" : metric.status === "warning" ? "text-chart-3" : "text-destructive";
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{metric.name}</span>
                    <Badge variant={metric.status === "healthy" ? "default" : metric.status === "warning" ? "secondary" : "destructive"} className="text-[9px]">
                      {metric.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{metric.details}</p>
                </div>
                <div className="w-28 shrink-0">
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-bold ${color}`}>{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformHealthScore;
