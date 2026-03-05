import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Globe, TrendingUp, TrendingDown, Minus, Users, Building, Star, ExternalLink } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Competitor {
  id: string;
  name: string;
  url: string;
  marketShare: number;
  listings: number;
  monthlyVisitors: string;
  avgRating: number;
  strengths: string[];
  weaknesses: string[];
  trend: "up" | "down" | "stable";
  threatLevel: "high" | "medium" | "low";
}

const competitors: Competitor[] = [
  {
    id: "1", name: "Rumah123", url: "rumah123.com", marketShare: 28, listings: 450000,
    monthlyVisitors: "12M", avgRating: 4.2, strengths: ["Brand awareness", "SEO dominance", "Bank partnerships"],
    weaknesses: ["Outdated UI", "Slow mobile"], trend: "stable", threatLevel: "high"
  },
  {
    id: "2", name: "OLX Property", url: "olx.co.id", marketShare: 22, listings: 320000,
    monthlyVisitors: "8M", avgRating: 3.8, strengths: ["User base", "Multi-category", "Trust"],
    weaknesses: ["Property focus diluted", "No virtual tours"], trend: "down", threatLevel: "medium"
  },
  {
    id: "3", name: "99.co Indonesia", url: "99.co/id", marketShare: 15, listings: 180000,
    monthlyVisitors: "4M", avgRating: 4.4, strengths: ["Modern UI", "AI features", "Data analytics"],
    weaknesses: ["Small market share", "Limited cities"], trend: "up", threatLevel: "high"
  },
  {
    id: "4", name: "Lamudi", url: "lamudi.co.id", marketShare: 10, listings: 120000,
    monthlyVisitors: "3M", avgRating: 4.0, strengths: ["New project focus", "Developer relationships"],
    weaknesses: ["Low brand recall", "Limited features"], trend: "stable", threatLevel: "low"
  },
];

const radarData = [
  { feature: "Listings", us: 65, comp1: 90, comp2: 75 },
  { feature: "AI/ML", us: 95, comp1: 40, comp2: 80 },
  { feature: "UX/UI", us: 90, comp1: 55, comp2: 85 },
  { feature: "Mobile", us: 85, comp1: 60, comp2: 75 },
  { feature: "SEO", us: 70, comp1: 95, comp2: 70 },
  { feature: "Trust", us: 60, comp1: 85, comp2: 65 },
];

const trafficComparison = [
  { month: "Oct", us: 800, rumah123: 12000, olx: 8000, nine9co: 4000 },
  { month: "Nov", us: 1200, rumah123: 12500, olx: 7800, nine9co: 4200 },
  { month: "Dec", us: 1800, rumah123: 11800, olx: 7500, nine9co: 4500 },
  { month: "Jan", us: 2500, rumah123: 12200, olx: 7200, nine9co: 4800 },
  { month: "Feb", us: 3200, rumah123: 12000, olx: 7000, nine9co: 5000 },
  { month: "Mar", us: 4500, rumah123: 11500, olx: 6800, nine9co: 5200 },
];

const CompetitorAnalysis = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-chart-2" />;
    if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Competitor Analysis</h2>
          <p className="text-sm text-muted-foreground">Indonesian property portal competitive landscape</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Feature Comparison</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Our Position */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Astra Villa Realty</h3>
                  <p className="text-xs text-muted-foreground">Our competitive advantages: AI-powered matching, 3D/VR tours, blockchain escrow, concierge service</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">~5%</p>
                  <p className="text-[10px] text-muted-foreground">Market Share (Growing)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {competitors.map((comp) => (
              <Card key={comp.id} className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-sm text-foreground">{comp.name}</h4>
                        <span className="text-[10px] text-muted-foreground">{comp.url}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getTrendIcon(comp.trend)}
                      <Badge variant={comp.threatLevel === "high" ? "destructive" : comp.threatLevel === "medium" ? "secondary" : "outline"} className="text-[10px]">
                        {comp.threatLevel} threat
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-1.5 rounded bg-muted/30">
                      <p className="text-xs font-bold text-foreground">{comp.marketShare}%</p>
                      <p className="text-[9px] text-muted-foreground">Market</p>
                    </div>
                    <div className="text-center p-1.5 rounded bg-muted/30">
                      <p className="text-xs font-bold text-foreground">{comp.monthlyVisitors}</p>
                      <p className="text-[9px] text-muted-foreground">Visitors/mo</p>
                    </div>
                    <div className="text-center p-1.5 rounded bg-muted/30">
                      <p className="text-xs font-bold text-foreground">{(comp.listings / 1000).toFixed(0)}K</p>
                      <p className="text-[9px] text-muted-foreground">Listings</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] font-medium text-chart-2">Strengths:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {comp.strengths.map((s, i) => <Badge key={i} variant="outline" className="text-[9px] px-1 py-0">{s}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-destructive">Weaknesses:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {comp.weaknesses.map((w, i) => <Badge key={i} variant="outline" className="text-[9px] px-1 py-0 border-destructive/30">{w}</Badge>)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Feature Comparison Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="feature" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Astra Villa" dataKey="us" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Radar name="Rumah123" dataKey="comp1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.15} />
                  <Radar name="99.co" dataKey="comp2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Monthly Traffic Comparison (visitors in thousands)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trafficComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="us" name="Astra Villa" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rumah123" name="Rumah123" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nine9co" name="99.co" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompetitorAnalysis;
