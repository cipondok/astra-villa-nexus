import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Eye, MousePointer, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface HeatmapSection {
  section: string;
  views: number;
  clicks: number;
  avgTimeSpent: number;
  bounceRate: number;
  engagement: "hot" | "warm" | "cold";
}

const sections: HeatmapSection[] = [
  { section: "Hero / Search Bar", views: 45000, clicks: 18500, avgTimeSpent: 12, bounceRate: 15, engagement: "hot" },
  { section: "Featured Properties", views: 38000, clicks: 9200, avgTimeSpent: 25, bounceRate: 22, engagement: "hot" },
  { section: "Property Detail - Gallery", views: 32000, clicks: 14800, avgTimeSpent: 35, bounceRate: 8, engagement: "hot" },
  { section: "Property Detail - Info", views: 30000, clicks: 4500, avgTimeSpent: 45, bounceRate: 12, engagement: "warm" },
  { section: "AI Recommendations", views: 22000, clicks: 5500, avgTimeSpent: 18, bounceRate: 30, engagement: "warm" },
  { section: "Map View", views: 18000, clicks: 7200, avgTimeSpent: 40, bounceRate: 20, engagement: "warm" },
  { section: "Agent Profile", views: 12000, clicks: 3600, avgTimeSpent: 22, bounceRate: 35, engagement: "warm" },
  { section: "Mortgage Calculator", views: 8000, clicks: 2400, avgTimeSpent: 55, bounceRate: 25, engagement: "cold" },
  { section: "Blog / Articles", views: 5500, clicks: 1100, avgTimeSpent: 90, bounceRate: 45, engagement: "cold" },
  { section: "Footer Links", views: 3200, clicks: 960, avgTimeSpent: 5, bounceRate: 65, engagement: "cold" },
];

const hourlyData = [
  { hour: "6AM", views: 800 }, { hour: "8AM", views: 2200 }, { hour: "10AM", views: 4500 },
  { hour: "12PM", views: 5800 }, { hour: "2PM", views: 5200 }, { hour: "4PM", views: 4800 },
  { hour: "6PM", views: 6200 }, { hour: "8PM", views: 7500 }, { hour: "10PM", views: 5500 },
  { hour: "12AM", views: 2100 },
];

const engagementConfig = {
  hot: { color: "text-destructive", bg: "bg-destructive/10", label: "🔥 Hot" },
  warm: { color: "text-chart-3", bg: "bg-chart-3/10", label: "🌡️ Warm" },
  cold: { color: "text-muted-foreground", bg: "bg-muted/30", label: "❄️ Cold" },
};

const PropertyHeatmapAnalytics = () => {
  const [sortBy, setSortBy] = useState<"views" | "clicks" | "avgTimeSpent">("views");
  const sorted = useMemo(() => [...sections].sort((a, b) => b[sortBy] - a[sortBy]), [sortBy]);

  const totalViews = sections.reduce((s, sec) => s + sec.views, 0);
  const totalClicks = sections.reduce((s, sec) => s + sec.clicks, 0);
  const avgBounce = (sections.reduce((s, sec) => s + sec.bounceRate, 0) / sections.length).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Property Heatmap Analytics</h2>
          <p className="text-sm text-muted-foreground">User engagement intensity across page sections</p>
        </div>
        <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="views">By Views</SelectItem>
            <SelectItem value="clicks">By Clicks</SelectItem>
            <SelectItem value="avgTimeSpent">By Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Eye className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{(totalViews / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-muted-foreground">Total Views</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <MousePointer className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-foreground">{(totalClicks / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-muted-foreground">Total Clicks</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <MousePointer className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{((totalClicks / totalViews) * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Avg CTR</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-foreground">{avgBounce}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Bounce</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Section Engagement</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sorted.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="section" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={150} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Views" />
                <Bar dataKey="clicks" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Peak Hours</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">All Sections</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sorted.map((sec, i) => {
            const config = engagementConfig[sec.engagement];
            return (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${config.bg} border border-border/30`}>
                <span className="text-xs font-bold text-muted-foreground w-6 text-center">#{i + 1}</span>
                <Flame className={`h-3.5 w-3.5 ${config.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{sec.section}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                  <span>{sec.views.toLocaleString()} views</span>
                  <span>{sec.clicks.toLocaleString()} clicks</span>
                  <span>{sec.avgTimeSpent}s avg</span>
                  <span>{sec.bounceRate}% bounce</span>
                  <Badge variant="outline" className="text-[9px]">{config.label}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyHeatmapAnalytics;
