import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Image, FileText, MapPin, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface QualityMetric {
  name: string;
  weight: number;
  avgScore: number;
  passRate: number;
}

const qualityMetrics: QualityMetric[] = [
  { name: "Photo Quality", weight: 25, avgScore: 72, passRate: 68 },
  { name: "Photo Count (≥5)", weight: 15, avgScore: 65, passRate: 58 },
  { name: "Description Length", weight: 15, avgScore: 78, passRate: 75 },
  { name: "Price Accuracy", weight: 15, avgScore: 85, passRate: 82 },
  { name: "Location Detail", weight: 10, avgScore: 90, passRate: 88 },
  { name: "Feature Completeness", weight: 10, avgScore: 68, passRate: 62 },
  { name: "Contact Responsiveness", weight: 10, avgScore: 74, passRate: 70 },
];

const scoreDistribution = [
  { range: "90-100", count: 1200, color: "hsl(var(--chart-2))" },
  { range: "70-89", count: 3500, color: "hsl(var(--primary))" },
  { range: "50-69", count: 2800, color: "hsl(var(--chart-3))" },
  { range: "30-49", count: 1100, color: "hsl(var(--chart-4))" },
  { range: "0-29", count: 400, color: "hsl(var(--destructive))" },
];

const topIssues = [
  { issue: "Missing floor plan", count: 2340, severity: "medium" },
  { issue: "Less than 3 photos", count: 1890, severity: "high" },
  { issue: "No description or <50 chars", count: 1560, severity: "high" },
  { issue: "Outdated pricing (>90 days)", count: 980, severity: "medium" },
  { issue: "Missing property type", count: 650, severity: "low" },
  { issue: "No nearby facilities", count: 1200, severity: "low" },
];

const PropertyQualityScore = () => {
  const [sortBy, setSortBy] = useState<"avgScore" | "passRate" | "weight">("weight");
  const sorted = useMemo(() => [...qualityMetrics].sort((a, b) => b[sortBy] - a[sortBy]), [sortBy]);

  const overallScore = Math.round(qualityMetrics.reduce((s, m) => s + (m.avgScore * m.weight / 100), 0));
  const totalListings = scoreDistribution.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Property Quality Score</h2>
          <p className="text-sm text-muted-foreground">Listing quality assessment across all properties</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${overallScore >= 75 ? "text-chart-2" : overallScore >= 60 ? "text-chart-3" : "text-destructive"}`}>{overallScore}/100</p>
          <p className="text-xs text-muted-foreground">Platform Avg</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Star className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{overallScore}</p>
          <p className="text-[10px] text-muted-foreground">Avg Quality Score</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{scoreDistribution[0].count + scoreDistribution[1].count}</p>
          <p className="text-[10px] text-muted-foreground">High Quality (70+)</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{scoreDistribution[3].count + scoreDistribution[4].count}</p>
          <p className="text-[10px] text-muted-foreground">{"Low Quality (<50)"}</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalListings.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Scored</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Listings">
                  {scoreDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Issues</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topIssues.slice(0, 5).map((issue, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <AlertTriangle className={`h-3 w-3 shrink-0 ${issue.severity === "high" ? "text-destructive" : issue.severity === "medium" ? "text-chart-3" : "text-muted-foreground"}`} />
                <span className="text-[11px] text-foreground flex-1">{issue.issue}</span>
                <Badge variant="outline" className="text-[9px]">{issue.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Quality Metrics Breakdown</CardTitle>
            <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
              <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">By Weight</SelectItem>
                <SelectItem value="avgScore">By Score</SelectItem>
                <SelectItem value="passRate">By Pass Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{m.name}</span>
                  <Badge variant="outline" className="text-[9px]">Weight: {m.weight}%</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">Pass rate: {m.passRate}%</span>
              </div>
              <div className="w-32 shrink-0">
                <div className="flex justify-between mb-1">
                  <span className={`text-sm font-bold ${m.avgScore >= 80 ? "text-chart-2" : m.avgScore >= 60 ? "text-chart-3" : "text-destructive"}`}>{m.avgScore}%</span>
                </div>
                <Progress value={m.avgScore} className="h-1.5" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyQualityScore;
