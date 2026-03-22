import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Crosshair, TrendingUp, Shield, Eye, BarChart3, Layers,
  ArrowUpRight, ArrowDownRight, Target, Activity
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const competitors = [
  { name: "ASTRA", listings: 360, traffic: 35, deals: 110, velocity: 8.2, features: 92, color: "text-primary" },
  { name: "Competitor A", listings: 520, traffic: 28, deals: 85, velocity: 6.5, features: 75, color: "text-chart-1" },
  { name: "Competitor B", listings: 280, traffic: 18, deals: 55, velocity: 5.2, features: 68, color: "text-chart-2" },
  { name: "Competitor C", listings: 180, traffic: 12, deals: 30, velocity: 4.1, features: 55, color: "text-chart-3" },
];

const radarData = [
  { metric: "Listings", ASTRA: 70, CompA: 100, CompB: 54 },
  { metric: "Traffic", ASTRA: 88, CompA: 70, CompB: 45 },
  { metric: "Deals", ASTRA: 85, CompA: 65, CompB: 42 },
  { metric: "Speed", ASTRA: 92, CompA: 73, CompB: 58 },
  { metric: "Features", ASTRA: 95, CompA: 78, CompB: 70 },
  { metric: "Trust", ASTRA: 88, CompA: 72, CompB: 65 },
];

const shareTrend = [
  { month: "Jan", astra: 8, compA: 35, compB: 22 },
  { month: "Feb", astra: 12, compA: 33, compB: 21 },
  { month: "Mar", astra: 16, compA: 31, compB: 20 },
  { month: "Apr", astra: 22, compA: 28, compB: 19 },
  { month: "May", astra: 28, compA: 26, compB: 18 },
  { month: "Jun", astra: 35, compA: 24, compB: 17 },
];

const insights = [
  { text: "Competitor A dominates luxury segment but lacks mid-range inventory depth.", type: "opportunity" },
  { text: "ASTRA's deal velocity is 26% faster than nearest competitor.", type: "strength" },
  { text: "Competitor B increasing marketing spend in Canggu — monitor listing acquisition.", type: "threat" },
];

const CompetitiveMarketIntelligence: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crosshair className="h-6 w-6 text-primary" />
          Competitive Marketplace Intelligence
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Market positioning & rival platform tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Market Position", value: "#2", icon: Target, color: "text-primary", sub: "rising" },
          { label: "Price Index", value: "0.95", icon: BarChart3, color: "text-chart-1", sub: "competitive" },
          { label: "Traffic Share", value: "35%", icon: Eye, color: "text-chart-2", sub: "+7% MoM" },
          { label: "Feature Lead", value: "+17", icon: Shield, color: "text-chart-3", sub: "vs avg" },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <div className="text-xl font-bold text-foreground">{m.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
              <div className="text-[9px] text-chart-1">{m.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Strength Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Radar name="ASTRA" dataKey="ASTRA" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Comp A" dataKey="CompA" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} strokeWidth={1} />
                <Radar name="Comp B" dataKey="CompB" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} strokeWidth={1} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Share Trend */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Market Share Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={shareTrend}>
                <defs>
                  <linearGradient id="astraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                <Area type="monotone" dataKey="astra" stroke="hsl(var(--primary))" fill="url(#astraGrad)" strokeWidth={2} name="ASTRA %" />
                <Area type="monotone" dataKey="compA" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.05} strokeWidth={1} name="Comp A %" />
                <Area type="monotone" dataKey="compB" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.05} strokeWidth={1} name="Comp B %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Competitive Positioning Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {competitors.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-2 rounded-lg border ${c.name === "ASTRA" ? "border-primary/20 bg-primary/5" : "border-border/30"} hover:bg-muted/30 transition-colors`}>
              <span className={`text-xs font-bold w-24 ${c.color}`}>{c.name}</span>
              <div className="flex-1 flex gap-3 text-[10px] text-muted-foreground">
                <span>{c.listings}L</span>
                <span>{c.traffic}% traffic</span>
                <span>{c.deals} deals</span>
                <span>{c.velocity} vel</span>
              </div>
              <Progress value={c.features} className="w-20 h-1.5" />
              <span className="text-xs font-mono text-foreground w-8">{c.features}</span>
              {c.name === "ASTRA" && <Badge className="bg-chart-1/15 text-chart-1 text-[10px]">You</Badge>}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Strategic Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.map((ins, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`${ins.type === "opportunity" ? "border-chart-2/20 bg-chart-2/5" : ins.type === "strength" ? "border-chart-1/20 bg-chart-1/5" : "border-destructive/20 bg-destructive/5"}`}>
                <CardContent className="p-3 flex items-start gap-2">
                  {ins.type === "strength" ? <ArrowUpRight className="h-4 w-4 text-chart-1 flex-shrink-0 mt-0.5" /> :
                   ins.type === "threat" ? <ArrowDownRight className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" /> :
                   <Target className="h-4 w-4 text-chart-2 flex-shrink-0 mt-0.5" />}
                  <p className="text-xs text-foreground">{ins.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitiveMarketIntelligence;
