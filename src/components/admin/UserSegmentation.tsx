import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Target, TrendingUp, Crown, Eye, Home, Star, Zap } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Segment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  percentage: number;
  avgSessionDuration: string;
  avgPageViews: number;
  conversionRate: number;
  topAction: string;
  color: string;
  icon: typeof Users;
}

const segments: Segment[] = [
  { id: "1", name: "Active Searchers", description: "Users who search 3+ times per week", userCount: 18500, percentage: 28, avgSessionDuration: "8m 30s", avgPageViews: 12, conversionRate: 4.2, topAction: "Search properties", color: "hsl(var(--primary))", icon: Eye },
  { id: "2", name: "Window Shoppers", description: "Browse listings but rarely inquire", userCount: 24000, percentage: 36, avgSessionDuration: "3m 15s", avgPageViews: 5, conversionRate: 0.8, topAction: "View listings", color: "hsl(var(--chart-3))", icon: Home },
  { id: "3", name: "Serious Buyers", description: "High inquiry rate, save properties, use calculator", userCount: 6200, percentage: 9, avgSessionDuration: "15m 45s", avgPageViews: 22, conversionRate: 12.5, topAction: "Send inquiry", color: "hsl(var(--chart-2))", icon: Target },
  { id: "4", name: "VIP Power Users", description: "Premium members with high engagement", userCount: 3800, percentage: 6, avgSessionDuration: "20m 10s", avgPageViews: 28, conversionRate: 18.2, topAction: "Schedule viewing", color: "hsl(var(--chart-4))", icon: Crown },
  { id: "5", name: "Dormant Users", description: "No activity in last 30 days", userCount: 12000, percentage: 18, avgSessionDuration: "0m", avgPageViews: 0, conversionRate: 0, topAction: "None", color: "hsl(var(--muted-foreground))", icon: Users },
  { id: "6", name: "New Users (<7d)", description: "Recently registered, exploring platform", userCount: 2500, percentage: 3, avgSessionDuration: "5m 20s", avgPageViews: 8, conversionRate: 2.1, topAction: "Complete profile", color: "hsl(var(--chart-5))", icon: Star },
];

const pieData = segments.map(s => ({ name: s.name, value: s.percentage, color: s.color }));

const engagementData = segments.filter(s => s.avgPageViews > 0).map(s => ({
  name: s.name.split(" ").slice(0, 2).join(" "),
  pageViews: s.avgPageViews,
  conversion: s.conversionRate,
}));

const UserSegmentation = () => {
  const totalUsers = segments.reduce((s, seg) => s + seg.userCount, 0);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Segmentation</h2>
          <p className="text-sm text-muted-foreground">Behavioral cohorts and engagement patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{(totalUsers / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground">Total Users</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Target className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{segments.length}</p>
          <p className="text-[10px] text-muted-foreground">Segments</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{segments.find(s => s.name === "Serious Buyers")?.userCount.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Serious Buyers</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{segments.find(s => s.name.includes("Dormant"))?.percentage}%</p>
          <p className="text-[10px] text-muted-foreground">Dormant</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Segment Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} label={({ name, value }) => `${value}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Engagement by Segment</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pageViews" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Page Views" />
                <Bar dataKey="conversion" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Conv. Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">All Segments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {segments.map(seg => {
            const Icon = seg.icon;
            return (
              <div key={seg.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${seg.color}20` }}>
                  <Icon className="h-4 w-4" style={{ color: seg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{seg.name}</span>
                    <Badge variant="outline" className="text-[9px]">{seg.percentage}%</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{seg.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                  <span>{seg.userCount.toLocaleString()} users</span>
                  <span>{seg.avgSessionDuration}</span>
                  <span className="text-chart-2">{seg.conversionRate}% CVR</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSegmentation;
