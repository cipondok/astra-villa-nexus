import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, TrendingUp, TrendingDown, Users, CheckCircle, Clock, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: "running" | "completed" | "paused";
  startDate: string;
  endDate: string | null;
  variants: {
    name: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    isWinner: boolean;
  }[];
  metric: string;
  confidence: number;
}

const tests: ABTest[] = [
  {
    id: "1", name: "CTA Button Color", description: "Testing gold vs blue CTA on property detail page",
    status: "completed", startDate: "2026-02-10", endDate: "2026-03-01", metric: "Inquiry Rate",
    confidence: 97.2,
    variants: [
      { name: "Control (Blue)", visitors: 12450, conversions: 498, conversionRate: 4.0, isWinner: false },
      { name: "Variant A (Gold)", visitors: 12380, conversions: 620, conversionRate: 5.01, isWinner: true },
    ]
  },
  {
    id: "2", name: "Search Results Layout", description: "Grid vs List view as default for search results",
    status: "running", startDate: "2026-02-25", endDate: null, metric: "Click-through Rate",
    confidence: 72.5,
    variants: [
      { name: "Control (Grid)", visitors: 8200, conversions: 1640, conversionRate: 20.0, isWinner: false },
      { name: "Variant A (List)", visitors: 8150, conversions: 1793, conversionRate: 22.0, isWinner: true },
    ]
  },
  {
    id: "3", name: "AI Recommendation Placement", description: "Sidebar vs inline recommendations",
    status: "running", startDate: "2026-03-01", endDate: null, metric: "Recommendation CTR",
    confidence: 58.3,
    variants: [
      { name: "Control (Sidebar)", visitors: 4500, conversions: 315, conversionRate: 7.0, isWinner: true },
      { name: "Variant A (Inline)", visitors: 4480, conversions: 291, conversionRate: 6.5, isWinner: false },
    ]
  },
  {
    id: "4", name: "Onboarding Flow", description: "3-step vs 5-step onboarding for new users",
    status: "paused", startDate: "2026-02-15", endDate: null, metric: "Completion Rate",
    confidence: 45.0,
    variants: [
      { name: "Control (5-step)", visitors: 2100, conversions: 1260, conversionRate: 60.0, isWinner: false },
      { name: "Variant A (3-step)", visitors: 2080, conversions: 1456, conversionRate: 70.0, isWinner: true },
    ]
  },
];

const conversionTrend = [
  { day: "D1", control: 3.8, variant: 4.2 },
  { day: "D3", control: 3.9, variant: 4.5 },
  { day: "D5", control: 4.0, variant: 4.8 },
  { day: "D7", control: 4.0, variant: 5.0 },
  { day: "D10", control: 4.1, variant: 5.0 },
  { day: "D14", control: 4.0, variant: 5.0 },
];

const ABTestResults = () => {
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? tests : tests.filter(t => t.status === tab);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">A/B Test Results</h2>
          <p className="text-sm text-muted-foreground">Experiment outcomes and statistical significance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <FlaskConical className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{tests.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Tests</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-2xl font-bold text-chart-3">{tests.filter(t => t.status === "running").length}</p>
          <p className="text-[10px] text-muted-foreground">Running</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Trophy className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-2xl font-bold text-chart-2">{tests.filter(t => t.status === "completed").length}</p>
          <p className="text-[10px] text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{tests.reduce((s, t) => s + t.variants.reduce((vs, v) => vs + v.visitors, 0), 0).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Participants</p>
        </CardContent></Card>
      </div>

      {/* Winner highlight */}
      <Card className="border-chart-2/30 bg-chart-2/5">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-chart-2" /> Latest Winner: CTA Button Color</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={conversionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[3, 6]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="control" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Control" />
              <Line type="monotone" dataKey="variant" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Gold CTA" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Gold CTA increased inquiry rate by <span className="text-chart-2 font-medium">+25.2%</span> with 97.2% confidence</p>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-3 mt-3">
          {filtered.map((test) => (
            <Card key={test.id} className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-foreground">{test.name}</h4>
                      <Badge variant={test.status === "running" ? "default" : test.status === "completed" ? "secondary" : "outline"} className="text-[9px]">
                        {test.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{test.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className={`text-sm font-bold ${test.confidence >= 95 ? "text-chart-2" : test.confidence >= 80 ? "text-chart-3" : "text-muted-foreground"}`}>
                      {test.confidence}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {test.variants.map((v, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${v.isWinner && test.confidence >= 90 ? "bg-chart-2/10 border border-chart-2/20" : "bg-muted/30"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{v.name}</span>
                          {v.isWinner && test.confidence >= 90 && <Badge className="text-[8px] bg-chart-2">Winner</Badge>}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{v.visitors.toLocaleString()} visitors · {v.conversions.toLocaleString()} conversions</span>
                      </div>
                      <div className="w-20 text-right">
                        <p className="text-sm font-bold text-foreground">{v.conversionRate}%</p>
                        <p className="text-[9px] text-muted-foreground">{test.metric}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>Started: {test.startDate}</span>
                  {test.endDate && <span>Ended: {test.endDate}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ABTestResults;
