import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ThumbsUp, ThumbsDown, Star, Search, TrendingUp, Users, Filter, Smile, Frown, Meh } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { toast } from "sonner";

interface FeedbackItem {
  id: string;
  user: string;
  category: string;
  rating: number;
  sentiment: "positive" | "neutral" | "negative";
  message: string;
  feature: string;
  createdAt: string;
  status: "new" | "reviewed" | "actioned";
}

const feedbackItems: FeedbackItem[] = [
  { id: "1", user: "Ahmad R.", category: "UX", rating: 5, sentiment: "positive", message: "AI property matching is incredible! Found my dream apartment in 2 days.", feature: "AI Match", createdAt: "2026-03-05", status: "reviewed" },
  { id: "2", user: "Sarah D.", category: "Bug", rating: 2, sentiment: "negative", message: "Search filters reset when I go back from a listing detail page.", feature: "Search", createdAt: "2026-03-05", status: "new" },
  { id: "3", user: "Michael T.", category: "Feature", rating: 4, sentiment: "positive", message: "Would love to see virtual tours integrated directly into listings.", feature: "Listings", createdAt: "2026-03-04", status: "new" },
  { id: "4", user: "Putri A.", category: "Performance", rating: 3, sentiment: "neutral", message: "Map view loads slowly on mobile, especially with many markers.", feature: "Map", createdAt: "2026-03-04", status: "actioned" },
  { id: "5", user: "David L.", category: "UX", rating: 5, sentiment: "positive", message: "The mortgage calculator is very helpful for planning.", feature: "Calculator", createdAt: "2026-03-03", status: "reviewed" },
  { id: "6", user: "Rina S.", category: "Bug", rating: 1, sentiment: "negative", message: "Cannot upload more than 3 photos on mobile browser.", feature: "Upload", createdAt: "2026-03-03", status: "new" },
  { id: "7", user: "Budi S.", category: "Feature", rating: 4, sentiment: "positive", message: "Compare tool is great but needs a share/export option.", feature: "Compare", createdAt: "2026-03-02", status: "reviewed" },
  { id: "8", user: "Citra W.", category: "Support", rating: 3, sentiment: "neutral", message: "Response time could be faster for urgent property inquiries.", feature: "Support", createdAt: "2026-03-02", status: "new" },
];

const sentimentTrend = [
  { week: "W1", positive: 65, neutral: 22, negative: 13 },
  { week: "W2", positive: 68, neutral: 20, negative: 12 },
  { week: "W3", positive: 62, neutral: 25, negative: 13 },
  { week: "W4", positive: 70, neutral: 18, negative: 12 },
  { week: "W5", positive: 72, neutral: 18, negative: 10 },
  { week: "W6", positive: 74, neutral: 16, negative: 10 },
];

const categoryDist = [
  { name: "UX", value: 35, color: "hsl(var(--primary))" },
  { name: "Bug", value: 22, color: "hsl(var(--destructive))" },
  { name: "Feature", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Performance", value: 10, color: "hsl(var(--chart-3))" },
  { name: "Support", value: 8, color: "hsl(var(--chart-4))" },
];

const featureRatings = [
  { feature: "AI Match", avg: 4.6, count: 320 },
  { feature: "Search", avg: 3.8, count: 580 },
  { feature: "Listings", avg: 4.2, count: 450 },
  { feature: "Map", avg: 3.5, count: 280 },
  { feature: "Calculator", avg: 4.5, count: 190 },
  { feature: "Compare", avg: 4.1, count: 150 },
];

const sentimentIcon = { positive: Smile, neutral: Meh, negative: Frown };
const sentimentColor = { positive: "text-chart-2", neutral: "text-chart-3", negative: "text-destructive" };

const PlatformFeedbackHub = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [items, setItems] = useState(feedbackItems);

  const filtered = items.filter(f => {
    const matchSearch = !search || f.message.toLowerCase().includes(search.toLowerCase()) || f.user.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || f.category.toLowerCase() === catFilter;
    return matchSearch && matchCat;
  });

  const avgRating = (items.reduce((s, f) => s + f.rating, 0) / items.length).toFixed(1);
  const posPercent = Math.round((items.filter(f => f.sentiment === "positive").length / items.length) * 100);

  const markReviewed = (id: string) => {
    setItems(prev => prev.map(f => f.id === id ? { ...f, status: "reviewed" as const } : f));
    toast.success("Marked as reviewed");
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Platform Feedback Hub</h2>
        <p className="text-sm text-muted-foreground">User feedback, sentiment analysis, and feature ratings</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <MessageSquare className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{items.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Feedback</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Star className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{avgRating}/5</p>
          <p className="text-[10px] text-muted-foreground">Avg Rating</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Smile className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{posPercent}%</p>
          <p className="text-[10px] text-muted-foreground">Positive</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Filter className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-foreground">{items.filter(f => f.status === "new").length}</p>
          <p className="text-[10px] text-muted-foreground">Unreviewed</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Sentiment Trend (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="positive" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Positive" />
                <Line type="monotone" dataKey="neutral" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Neutral" />
                <Line type="monotone" dataKey="negative" stroke="hsl(var(--destructive))" strokeWidth={2} name="Negative" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}%`}>
                  {categoryDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Feature Ratings</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={featureRatings} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={70} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Avg Rating" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search feedback..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ux">UX</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(f => {
          const SentIcon = sentimentIcon[f.sentiment];
          return (
            <Card key={f.id} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <SentIcon className={`h-4 w-4 shrink-0 mt-0.5 ${sentimentColor[f.sentiment]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{f.user}</span>
                      <Badge variant="outline" className="text-[9px]">{f.category}</Badge>
                      <Badge variant="outline" className="text-[9px]">{f.feature}</Badge>
                      <span className="text-[10px] text-chart-3">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                      {f.status === "new" && <Badge variant="destructive" className="text-[8px]">New</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{f.message}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{f.createdAt}</p>
                  </div>
                  {f.status === "new" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => markReviewed(f.id)}>Review</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformFeedbackHub;
