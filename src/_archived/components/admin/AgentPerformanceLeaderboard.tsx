import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Star, TrendingUp, Users, DollarSign, Target, Medal, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

interface Agent {
  id: string;
  name: string;
  rank: number;
  totalSales: number;
  revenue: number;
  listings: number;
  avgRating: number;
  responseRate: number;
  conversionRate: number;
  closingTime: number;
  badge: string;
  trend: "up" | "down" | "stable";
}

const agents: Agent[] = [
  { id: "1", name: "Ahmad Rizki", rank: 1, totalSales: 28, revenue: 85000000000, listings: 45, avgRating: 4.9, responseRate: 98, conversionRate: 18.5, closingTime: 22, badge: "Diamond", trend: "up" },
  { id: "2", name: "Sarah Dewi", rank: 2, totalSales: 24, revenue: 72000000000, listings: 38, avgRating: 4.8, responseRate: 96, conversionRate: 16.2, closingTime: 25, badge: "Platinum", trend: "up" },
  { id: "3", name: "Budi Santoso", rank: 3, totalSales: 20, revenue: 58000000000, listings: 42, avgRating: 4.7, responseRate: 94, conversionRate: 14.8, closingTime: 28, badge: "Platinum", trend: "stable" },
  { id: "4", name: "Citra Wulandari", rank: 4, totalSales: 18, revenue: 52000000000, listings: 35, avgRating: 4.6, responseRate: 92, conversionRate: 13.5, closingTime: 30, badge: "Gold", trend: "up" },
  { id: "5", name: "David Lim", rank: 5, totalSales: 15, revenue: 45000000000, listings: 30, avgRating: 4.5, responseRate: 90, conversionRate: 12.0, closingTime: 32, badge: "Gold", trend: "down" },
  { id: "6", name: "Rina Sari", rank: 6, totalSales: 12, revenue: 38000000000, listings: 28, avgRating: 4.4, responseRate: 88, conversionRate: 10.5, closingTime: 35, badge: "Silver", trend: "stable" },
  { id: "7", name: "Michael Tan", rank: 7, totalSales: 10, revenue: 32000000000, listings: 25, avgRating: 4.3, responseRate: 85, conversionRate: 9.8, closingTime: 38, badge: "Silver", trend: "down" },
  { id: "8", name: "Putri Anggraini", rank: 8, totalSales: 8, revenue: 25000000000, listings: 22, avgRating: 4.5, responseRate: 91, conversionRate: 8.5, closingTime: 40, badge: "Bronze", trend: "up" },
];

const topAgentRadar = agents.slice(0, 3).length >= 2 ? [
  { metric: "Sales", A: 100, B: 86, C: 71 },
  { metric: "Rating", A: 98, B: 96, C: 94 },
  { metric: "Response", A: 98, B: 96, C: 94 },
  { metric: "Conversion", A: 93, B: 88, C: 80 },
  { metric: "Speed", A: 90, B: 82, C: 74 },
] : [];

const monthlySales = [
  { month: "Oct", sales: 32, revenue: 95 },
  { month: "Nov", sales: 38, revenue: 112 },
  { month: "Dec", sales: 28, revenue: 82 },
  { month: "Jan", sales: 42, revenue: 128 },
  { month: "Feb", sales: 45, revenue: 135 },
  { month: "Mar", sales: 48, revenue: 145 },
];

const badgeColor: Record<string, string> = {
  Diamond: "text-primary", Platinum: "text-chart-2", Gold: "text-chart-3", Silver: "text-muted-foreground", Bronze: "text-chart-4"
};
const trendIcon: Record<string, string> = { up: "↑", down: "↓", stable: "→" };
const trendColor: Record<string, string> = { up: "text-chart-2", down: "text-destructive", stable: "text-muted-foreground" };

const AgentPerformanceLeaderboard = () => {
  const [period, setPeriod] = useState("month");

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Agent Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Top performing agents by sales, ratings, and efficiency</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Trophy className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{agents.length}</p>
          <p className="text-[10px] text-muted-foreground">Active Agents</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Target className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{agents.reduce((s, a) => s + a.totalSales, 0)}</p>
          <p className="text-[10px] text-muted-foreground">Total Sales</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {(agents.reduce((s, a) => s + a.revenue, 0) / 1e12).toFixed(1)}T</p>
          <p className="text-[10px] text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Star className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{(agents.reduce((s, a) => s + a.avgRating, 0) / agents.length).toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">Avg Rating</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sales" />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Revenue (Rp B)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top 3 Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={topAgentRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                <Radar name={agents[0]?.name} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                <Radar name={agents[1]?.name} dataKey="B" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                <Radar name={agents[2]?.name} dataKey="C" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Rankings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {agents.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${a.rank <= 3 ? "bg-chart-3/10" : "bg-muted/50"}`}>
                {a.rank <= 3 ? <Medal className={`h-4 w-4 ${a.rank === 1 ? "text-chart-3" : a.rank === 2 ? "text-muted-foreground" : "text-chart-4"}`} /> : <span className="text-xs font-bold text-muted-foreground">#{a.rank}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{a.name}</span>
                  <Badge variant="outline" className={`text-[9px] ${badgeColor[a.badge]}`}>{a.badge}</Badge>
                  <span className={`text-xs font-bold ${trendColor[a.trend]}`}>{trendIcon[a.trend]}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>{a.totalSales} sales</span>
                  <span>Rp {(a.revenue / 1e9).toFixed(0)}B</span>
                  <span>★ {a.avgRating}</span>
                  <span>{a.responseRate}% response</span>
                  <span>{a.conversionRate}% CVR</span>
                  <span>{a.closingTime}d avg close</span>
                </div>
              </div>
              <div className="w-16 shrink-0">
                <Progress value={a.conversionRate * 5} className="h-1.5" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentPerformanceLeaderboard;
