import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smile, Frown, Meh, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sentimentTrend = [
  { date: "Feb 1", positive: 65, neutral: 25, negative: 10 },
  { date: "Feb 8", positive: 68, neutral: 22, negative: 10 },
  { date: "Feb 15", positive: 62, neutral: 28, negative: 10 },
  { date: "Feb 22", positive: 70, neutral: 20, negative: 10 },
  { date: "Mar 1", positive: 72, neutral: 18, negative: 10 },
  { date: "Mar 5", positive: 75, neutral: 17, negative: 8 },
];

const categoryBreakdown = [
  { category: "Property Listings", positive: 78, neutral: 15, negative: 7 },
  { category: "Search & Filters", positive: 65, neutral: 22, negative: 13 },
  { category: "Customer Support", positive: 82, neutral: 12, negative: 6 },
  { category: "Payment Process", positive: 55, neutral: 25, negative: 20 },
  { category: "Mobile App", positive: 70, neutral: 20, negative: 10 },
  { category: "AI Features", positive: 88, neutral: 8, negative: 4 },
];

const topKeywords = [
  { word: "easy to use", count: 245, sentiment: "positive" },
  { word: "fast response", count: 189, sentiment: "positive" },
  { word: "great photos", count: 156, sentiment: "positive" },
  { word: "loading slow", count: 98, sentiment: "negative" },
  { word: "confusing filters", count: 76, sentiment: "negative" },
  { word: "helpful agent", count: 134, sentiment: "positive" },
  { word: "needs improvement", count: 67, sentiment: "neutral" },
  { word: "love the AI", count: 112, sentiment: "positive" },
];

const FeedbackSentimentAnalysis = () => {
  const [period, setPeriod] = useState("30d");

  const { data: feedbackCount } = useQuery({
    queryKey: ["feedback-count"],
    queryFn: async () => {
      const { count } = await supabase.from("feedback").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const pieData = useMemo(() => [
    { name: "Positive", value: 72, color: "hsl(var(--chart-2))" },
    { name: "Neutral", value: 18, color: "hsl(var(--chart-3))" },
    { name: "Negative", value: 10, color: "hsl(var(--destructive))" },
  ], []);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Feedback Sentiment Analysis</h2>
          <p className="text-sm text-muted-foreground">AI-powered sentiment breakdown of user feedback</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-3 text-center">
            <MessageSquare className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold text-foreground">{feedbackCount?.toLocaleString() || "—"}</p>
            <p className="text-[10px] text-muted-foreground">Total Feedback</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3 text-center">
            <Smile className="h-4 w-4 mx-auto mb-1 text-chart-2" />
            <p className="text-xl font-bold text-chart-2">72%</p>
            <p className="text-[10px] text-muted-foreground">Positive</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3 text-center">
            <Meh className="h-4 w-4 mx-auto mb-1 text-chart-3" />
            <p className="text-xl font-bold text-chart-3">18%</p>
            <p className="text-[10px] text-muted-foreground">Neutral</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3 text-center">
            <Frown className="h-4 w-4 mx-auto mb-1 text-destructive" />
            <p className="text-xl font-bold text-destructive">10%</p>
            <p className="text-[10px] text-muted-foreground">Negative</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold text-foreground">+7%</p>
            <p className="text-[10px] text-muted-foreground">Sentiment ↑</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="keywords">Top Keywords</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 border-border/40">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Sentiment Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={sentimentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="positive" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.4} />
                    <Area type="monotone" dataKey="neutral" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.4} />
                    <Area type="monotone" dataKey="negative" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribution</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}%`}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="border-border/40">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Sentiment by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="positive" stackId="a" fill="hsl(var(--chart-2))" name="Positive" />
                  <Bar dataKey="neutral" stackId="a" fill="hsl(var(--chart-3))" name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill="hsl(var(--destructive))" name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card className="border-border/40">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Feedback Keywords</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topKeywords.map((kw, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    {kw.sentiment === "positive" ? <ThumbsUp className="h-4 w-4 text-chart-2 shrink-0" /> :
                     kw.sentiment === "negative" ? <ThumbsDown className="h-4 w-4 text-destructive shrink-0" /> :
                     <Meh className="h-4 w-4 text-chart-3 shrink-0" />}
                    <span className="text-sm font-medium text-foreground flex-1">"{kw.word}"</span>
                    <Badge variant="secondary" className="text-[10px]">{kw.count}x</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackSentimentAnalysis;
