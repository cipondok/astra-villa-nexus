import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Eye, MessageSquare, Calendar, DollarSign, TrendingUp,
  Image, Tag, ArrowUpRight, Zap, BarChart3, Target, Star, AlertTriangle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const weeklyData = [
  { day: "Mon", views: 42, inquiries: 5, viewings: 2 },
  { day: "Tue", views: 58, inquiries: 8, viewings: 3 },
  { day: "Wed", views: 35, inquiries: 4, viewings: 1 },
  { day: "Thu", views: 72, inquiries: 10, viewings: 4 },
  { day: "Fri", views: 65, inquiries: 9, viewings: 3 },
  { day: "Sat", views: 95, inquiries: 14, viewings: 6 },
  { day: "Sun", views: 88, inquiries: 12, viewings: 5 },
];

const listings = [
  { title: "Modern Villa Seminyak", views: 342, inquiries: 28, score: 88, status: "strong" },
  { title: "Apartment Canggu", views: 215, inquiries: 15, score: 72, status: "moderate" },
  { title: "Beach House Nusa Dua", views: 89, inquiries: 4, score: 45, status: "weak" },
];

const improvements = [
  { icon: Image, text: "Add 4 more interior photos to Villa listing", impact: "+35% views", priority: "high" },
  { icon: DollarSign, text: "Reduce Apartment price 3% to match district median", impact: "+28% inquiries", priority: "high" },
  { icon: Tag, text: "Add 'Furnished' and 'Sea View' tags to Beach House", impact: "+18% discovery", priority: "medium" },
  { icon: Zap, text: "Upgrade Beach House to premium visibility", impact: "+3.5x exposure", priority: "medium" },
];

const benchmarks = [
  { label: "Your Avg Views/Listing", value: 215, market: 180, better: true },
  { label: "Inquiry Rate", value: "7.3%", market: "5.8%", better: true },
  { label: "Avg Days on Market", value: 28, market: 22, better: false },
  { label: "Price Competitiveness", value: "92%", market: "85%", better: true },
];

const priorityColor = (p: string) => p === "high" ? "border-chart-3/30 bg-chart-3/5" : "border-primary/30 bg-primary/5";

const SellerPerformanceInsight: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Seller Performance Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Listing analytics & optimization guidance</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">3 Active Listings</Badge>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Total Views", value: "646", delta: "+22% WoW", icon: Eye, color: "text-primary" },
          { label: "Inquiries", value: "47", delta: "+18% WoW", icon: MessageSquare, color: "text-chart-1" },
          { label: "Viewings", value: "12", delta: "+33% WoW", icon: Calendar, color: "text-chart-2" },
          { label: "Price Score", value: "92/100", delta: "Competitive", icon: Target, color: "text-chart-3" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                <div className="text-lg font-bold text-foreground">{m.value}</div>
                <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
                <div className="text-[9px] text-chart-1 flex items-center justify-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="h-2.5 w-2.5" />{m.delta}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Weekly Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="sellerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 11 }} />
              <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#sellerGrad)" strokeWidth={2} name="Views" />
              <Area type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} strokeWidth={2} name="Inquiries" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Per-Listing Performance */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Listing Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {listings.map((l, i) => (
              <motion.div key={l.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border/30">
                  <CardContent className="p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground truncate flex-1">{l.title}</span>
                      <Badge className={`text-[8px] ${
                        l.status === "strong" ? "bg-chart-1/15 text-chart-1" :
                        l.status === "moderate" ? "bg-primary/15 text-primary" :
                        "bg-destructive/15 text-destructive"
                      }`}>{l.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs font-bold text-foreground">{l.views}</div>
                        <div className="text-[8px] text-muted-foreground">Views</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{l.inquiries}</div>
                        <div className="text-[8px] text-muted-foreground">Inquiries</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{l.score}%</div>
                        <div className="text-[8px] text-muted-foreground">Quality</div>
                      </div>
                    </div>
                    <Progress value={l.score} className="h-1 mt-1.5" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Improvement Tips */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-chart-1" /> Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {improvements.map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className={priorityColor(tip.priority)}>
                  <CardContent className="p-2.5 flex items-start gap-2">
                    <tip.icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground">{tip.text}</p>
                      <Badge variant="secondary" className="text-[8px] mt-1">{tip.impact}</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-[9px] flex-shrink-0">Action</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Market Benchmark */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Market Comparison Benchmark
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {benchmarks.map((b, i) => (
              <div key={b.label} className="p-2.5 rounded-lg border border-border/30 text-center">
                <div className="text-[10px] text-muted-foreground uppercase mb-1">{b.label}</div>
                <div className="text-sm font-bold text-foreground">{b.value}</div>
                <div className={`text-[9px] flex items-center justify-center gap-0.5 mt-0.5 ${b.better ? "text-chart-1" : "text-destructive"}`}>
                  {b.better ? <ArrowUpRight className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5" />}
                  Market: {b.market}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerPerformanceInsight;
