import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  TrendingUp, Droplets, BarChart3, Target, Award,
  ArrowUpRight, Building2, Users, DollarSign, Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const monthlyData = [
  { month: "Jan", listings: 32, inquiries: 85, deals: 5, revenue: 45 },
  { month: "Feb", listings: 48, inquiries: 120, deals: 8, revenue: 72 },
  { month: "Mar", listings: 65, inquiries: 165, deals: 12, revenue: 108 },
  { month: "Apr", listings: 82, inquiries: 210, deals: 18, revenue: 162 },
  { month: "May", listings: 105, inquiries: 280, deals: 25, revenue: 225 },
  { month: "Jun", listings: 128, inquiries: 350, deals: 34, revenue: 306 },
];

const districtDominance = [
  { district: "Seminyak", liquidity: 82, listings: 35, deals: 14, status: "secured", milestone: "District Liquidity Secured" },
  { district: "Canggu", liquidity: 68, listings: 28, deals: 10, status: "emerging", milestone: null },
  { district: "Kuta", liquidity: 75, listings: 30, deals: 12, status: "secured", milestone: "District Liquidity Secured" },
  { district: "Denpasar", liquidity: 60, listings: 22, deals: 8, status: "building", milestone: null },
  { district: "Ubud", liquidity: 45, listings: 14, deals: 5, status: "early", milestone: null },
  { district: "Sanur", liquidity: 35, listings: 8, deals: 3, status: "early", milestone: null },
  { district: "Nusa Dua", liquidity: 52, listings: 18, deals: 6, status: "building", milestone: null },
  { district: "Jimbaran", liquidity: 28, listings: 5, deals: 2, status: "early", milestone: null },
];

const milestones = [
  { label: "District Liquidity Secured", achieved: 2, total: 8, icon: Droplets },
  { label: "City Network Effect Emerging", achieved: false, threshold: "60% districts at 50+ liquidity", icon: Zap },
  { label: "Marketplace Leadership Signal", achieved: false, threshold: "100+ monthly deals", icon: Award },
];

const statusColor = (s: string) => {
  switch (s) {
    case "secured": return "bg-chart-1/15 text-chart-1 border-chart-1/30";
    case "emerging": return "bg-chart-2/15 text-chart-2 border-chart-2/30";
    case "building": return "bg-primary/15 text-primary border-primary/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const MonthlyLiquidityDominancePanel: React.FC = () => {
  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const listingsGrowth = Math.round(((currentMonth.listings - prevMonth.listings) / prevMonth.listings) * 100);
  const dealsGrowth = Math.round(((currentMonth.deals - prevMonth.deals) / prevMonth.deals) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          Monthly Liquidity Domination Progress
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Marketplace strength development month over month</p>
      </div>

      {/* Key Growth Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Listings Growth", value: `+${listingsGrowth}%`, sub: `${currentMonth.listings} total`, icon: Building2, color: "text-primary" },
          { label: "Inquiry Expansion", value: currentMonth.inquiries, sub: "this month", icon: Users, color: "text-chart-2" },
          { label: "Deal Velocity", value: currentMonth.deals, sub: `+${dealsGrowth}% MoM`, icon: TrendingUp, color: "text-chart-1" },
          { label: "Revenue (M IDR)", value: currentMonth.revenue, sub: "monthly run-rate", icon: DollarSign, color: "text-chart-3" },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <m.icon className={`h-4 w-4 ${m.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
              </div>
              <div className="text-xl font-bold text-foreground flex items-center gap-1">
                {m.value}
                <ArrowUpRight className="h-3.5 w-3.5 text-chart-1" />
              </div>
              <div className="text-[10px] text-muted-foreground">{m.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traction Momentum Curve */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Monthly Traction Momentum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
              <Area type="monotone" dataKey="listings" stroke="hsl(var(--primary))" fill="url(#liqGrad)" strokeWidth={2} name="Listings" />
              <Line type="monotone" dataKey="deals" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="Deals" />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} name="Revenue (M)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* District Dominance Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            District Liquidity Strength Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {districtDominance.sort((a, b) => b.liquidity - a.liquidity).map((d, i) => (
              <motion.div key={d.district} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
                <span className="text-xs font-bold text-foreground w-20">{d.district}</span>
                <Progress value={d.liquidity} className="flex-1 h-2" />
                <span className="text-xs font-mono text-foreground w-8 text-right">{d.liquidity}</span>
                <Badge className={`${statusColor(d.status)} text-[10px] w-20 justify-center`}>{d.status}</Badge>
                {d.milestone && (
                  <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-[10px] animate-pulse">🏆 {d.milestone}</Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Milestones */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-chart-3" />
            Strategic Milestone Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {milestones.map((ms, i) => (
            <motion.div key={ms.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${typeof ms.achieved === 'number' ? 'border-chart-1/20 bg-chart-1/5' : 'border-border/40 bg-muted/20'}`}>
              <ms.icon className={`h-5 w-5 ${typeof ms.achieved === 'number' ? 'text-chart-1' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <span className="text-sm font-bold text-foreground">{ms.label}</span>
                <p className="text-[10px] text-muted-foreground">
                  {typeof ms.achieved === 'number' ? `${ms.achieved}/${ms.total} districts achieved` : `Threshold: ${ms.threshold}`}
                </p>
              </div>
              {typeof ms.achieved === 'number' ? (
                <Badge className="bg-chart-1/15 text-chart-1 text-[10px]">{ms.achieved}/{ms.total}</Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">In Progress</Badge>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyLiquidityDominancePanel;
