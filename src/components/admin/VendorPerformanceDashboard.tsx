import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Star, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, ThumbsUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalJobs: number;
  completionRate: number;
  avgResponseTime: string;
  revenue: number;
  status: "active" | "warning" | "suspended";
  satisfactionScore: number;
}

const vendors: Vendor[] = [
  { id: "1", name: "CleanPro Services", category: "Cleaning", rating: 4.8, totalJobs: 342, completionRate: 97, avgResponseTime: "2h", revenue: 185000000, status: "active", satisfactionScore: 94 },
  { id: "2", name: "FixIt Maintenance", category: "Maintenance", rating: 4.5, totalJobs: 256, completionRate: 92, avgResponseTime: "4h", revenue: 142000000, status: "active", satisfactionScore: 88 },
  { id: "3", name: "SecureGuard", category: "Security", rating: 4.7, totalJobs: 180, completionRate: 99, avgResponseTime: "1h", revenue: 220000000, status: "active", satisfactionScore: 96 },
  { id: "4", name: "GreenScape Gardens", category: "Landscaping", rating: 4.2, totalJobs: 128, completionRate: 85, avgResponseTime: "8h", revenue: 78000000, status: "warning", satisfactionScore: 78 },
  { id: "5", name: "MovePro Logistics", category: "Moving", rating: 3.8, totalJobs: 95, completionRate: 78, avgResponseTime: "12h", revenue: 65000000, status: "warning", satisfactionScore: 72 },
  { id: "6", name: "PaintMaster", category: "Renovation", rating: 4.6, totalJobs: 210, completionRate: 94, avgResponseTime: "3h", revenue: 168000000, status: "active", satisfactionScore: 91 },
];

const categoryPerformance = [
  { category: "Cleaning", jobs: 520, satisfaction: 92, completion: 95 },
  { category: "Maintenance", jobs: 380, satisfaction: 86, completion: 90 },
  { category: "Security", jobs: 280, satisfaction: 95, completion: 98 },
  { category: "Landscaping", jobs: 195, satisfaction: 80, completion: 87 },
  { category: "Moving", jobs: 150, satisfaction: 75, completion: 82 },
  { category: "Renovation", jobs: 310, satisfaction: 90, completion: 93 },
];

const radarData = [
  { metric: "Response Time", value: 85 },
  { metric: "Quality", value: 88 },
  { metric: "Completion", value: 92 },
  { metric: "Satisfaction", value: 87 },
  { metric: "Value", value: 82 },
  { metric: "Reliability", value: 90 },
];

const VendorPerformanceDashboard = () => {
  const [sortBy, setSortBy] = useState<"rating" | "totalJobs" | "revenue">("rating");
  const sorted = [...vendors].sort((a, b) => b[sortBy] - a[sortBy]);
  const avgRating = (vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1);
  const totalRevenue = vendors.reduce((s, v) => s + v.revenue, 0);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Vendor Performance</h2>
          <p className="text-sm text-muted-foreground">Service provider metrics and quality tracking</p>
        </div>
        <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="totalJobs">Jobs</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Store className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{vendors.length}</p>
          <p className="text-[10px] text-muted-foreground">Active Vendors</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Star className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{avgRating}</p>
          <p className="text-[10px] text-muted-foreground">Avg Rating</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{Math.round(vendors.reduce((s, v) => s + v.completionRate, 0) / vendors.length)}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Completion</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {(totalRevenue / 1e9).toFixed(1)}B</p>
          <p className="text-[10px] text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Category Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Jobs" />
                <Bar dataKey="satisfaction" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Satisfaction %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Overall Quality</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Vendor Leaderboard</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sorted.map((v, i) => (
            <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">#{i + 1}</div>
              <div className="p-2 rounded-lg bg-primary/10 shrink-0"><Store className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{v.name}</span>
                  <Badge variant={v.status === "active" ? "default" : "destructive"} className="text-[9px]">{v.status}</Badge>
                  <Badge variant="outline" className="text-[9px]">{v.category}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>★ {v.rating}</span>
                  <span>{v.totalJobs} jobs</span>
                  <span>{v.completionRate}% completion</span>
                  <span>Rp {(v.revenue / 1e6).toFixed(0)}M revenue</span>
                </div>
              </div>
              <div className="w-20 shrink-0">
                <Progress value={v.satisfactionScore} className="h-1.5" />
                <p className="text-[9px] text-muted-foreground text-center mt-0.5">{v.satisfactionScore}% sat.</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPerformanceDashboard;
