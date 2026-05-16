import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Crown, TrendingUp, Building2, Users, DollarSign, Target,
  BarChart3, Award, ArrowUpRight, Layers, Zap, Shield
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from "recharts";

const yearlyGrowth = [
  { month: "Jan", listings: 32, deals: 5, revenue: 45, marketShare: 2 },
  { month: "Feb", listings: 48, deals: 8, revenue: 72, marketShare: 3 },
  { month: "Mar", listings: 65, deals: 12, revenue: 108, marketShare: 5 },
  { month: "Apr", listings: 82, deals: 18, revenue: 162, marketShare: 7 },
  { month: "May", listings: 105, deals: 25, revenue: 225, marketShare: 9 },
  { month: "Jun", listings: 128, deals: 34, revenue: 306, marketShare: 12 },
  { month: "Jul", listings: 155, deals: 42, revenue: 400, marketShare: 15 },
  { month: "Aug", listings: 185, deals: 52, revenue: 510, marketShare: 18 },
  { month: "Sep", listings: 220, deals: 65, revenue: 640, marketShare: 22 },
  { month: "Oct", listings: 260, deals: 78, revenue: 790, marketShare: 26 },
  { month: "Nov", listings: 305, deals: 92, revenue: 960, marketShare: 30 },
  { month: "Dec", listings: 360, deals: 110, revenue: 1150, marketShare: 35 },
];

const districtLeadership = [
  { district: "Seminyak", marketShare: 38, position: 1, listings: 45, competitors: 3, status: "leader" },
  { district: "Kuta", marketShare: 32, position: 1, listings: 38, competitors: 4, status: "leader" },
  { district: "Canggu", marketShare: 28, position: 2, listings: 32, competitors: 3, status: "challenger" },
  { district: "Denpasar", marketShare: 22, position: 2, listings: 28, competitors: 5, status: "challenger" },
  { district: "Ubud", marketShare: 18, position: 3, listings: 18, competitors: 4, status: "growing" },
  { district: "Nusa Dua", marketShare: 15, position: 3, listings: 22, competitors: 3, status: "growing" },
  { district: "Sanur", marketShare: 10, position: 4, listings: 10, competitors: 3, status: "entering" },
  { district: "Jimbaran", marketShare: 8, position: 4, listings: 6, competitors: 2, status: "entering" },
];

const competitiveIndex = {
  listingsDominance: 28,
  buyerTrafficShare: 22,
  dealVolumeShare: 25,
  agentNetworkSize: 35,
  brandRecognition: 18,
};

const milestones = [
  { label: "Top 3 Platform in District", achieved: 4, total: 8, icon: Award },
  { label: "Market Leader in Key Zone", achieved: 2, total: 8, icon: Crown },
  { label: "Network Effect Strengthening", achieved: true, description: "Referral growth > organic growth", icon: Zap },
];

const statusColor = (s: string) => {
  switch (s) {
    case "leader": return "bg-chart-1/15 text-chart-1 border-chart-1/30";
    case "challenger": return "bg-primary/15 text-primary border-primary/30";
    case "growing": return "bg-chart-3/15 text-chart-3 border-chart-3/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const AnnualMarketLeadershipProgress: React.FC = () => {
  const currentMarketShare = yearlyGrowth[yearlyGrowth.length - 1].marketShare;
  const compositeIndex = Math.round(Object.values(competitiveIndex).reduce((s, v) => s + v, 0) / Object.keys(competitiveIndex).length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            Annual Market Leadership Progress
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Long-term trajectory toward market dominance</p>
        </div>
        <Card className="border-primary/20 bg-primary/5 px-5 py-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{currentMarketShare}%</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Market Share</div>
          </div>
        </Card>
      </div>

      {/* Competitive Index */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Listings Dominance", value: `${competitiveIndex.listingsDominance}%`, icon: Building2 },
          { label: "Buyer Traffic", value: `${competitiveIndex.buyerTrafficShare}%`, icon: Users },
          { label: "Deal Volume", value: `${competitiveIndex.dealVolumeShare}%`, icon: TrendingUp },
          { label: "Agent Network", value: `${competitiveIndex.agentNetworkSize}%`, icon: Shield },
          { label: "Brand Recognition", value: `${competitiveIndex.brandRecognition}%`, icon: Target },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3">
              <m.icon className="h-4 w-4 text-primary mb-1" />
              <div className="text-lg font-bold text-foreground flex items-center gap-1">
                {m.value} <ArrowUpRight className="h-3 w-3 text-chart-1" />
              </div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Curve */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Yearly Growth Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={yearlyGrowth}>
              <defs>
                <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
              <Area type="monotone" dataKey="marketShare" stroke="hsl(var(--primary))" fill="url(#mktGrad)" strokeWidth={2} name="Market Share %" />
              <Line type="monotone" dataKey="deals" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 2 }} name="Deals" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* District Leadership */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> District Leadership Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {districtLeadership.map((d, i) => (
            <motion.div key={d.district} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-2 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
              <div className="text-sm font-bold text-primary w-6 text-center">#{d.position}</div>
              <span className="text-xs font-bold text-foreground w-20">{d.district}</span>
              <Progress value={d.marketShare} className="flex-1 h-2" />
              <span className="text-xs font-mono text-foreground w-8">{d.marketShare}%</span>
              <Badge className={`${statusColor(d.status)} text-[10px] w-20 justify-center`}>{d.status}</Badge>
              <span className="text-[10px] text-muted-foreground w-16">{d.listings}L • {d.competitors}C</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-chart-3" /> Leadership Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {milestones.map((ms, i) => (
            <motion.div key={ms.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${typeof ms.achieved === "number" ? (ms.achieved > 0 ? "border-chart-1/20 bg-chart-1/5" : "border-border/40") : ms.achieved ? "border-chart-1/20 bg-chart-1/5" : "border-border/40 bg-muted/20"}`}>
              <ms.icon className={`h-5 w-5 ${typeof ms.achieved === "number" ? (ms.achieved > 0 ? "text-chart-1" : "text-muted-foreground") : ms.achieved ? "text-chart-1" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <span className="text-xs font-bold text-foreground">{ms.label}</span>
                <p className="text-[10px] text-muted-foreground">
                  {typeof ms.achieved === "number" ? `${ms.achieved}/${ms.total} districts` : ms.description}
                </p>
              </div>
              {typeof ms.achieved === "number" ? (
                <Badge className="bg-chart-1/15 text-chart-1 text-[10px]">{ms.achieved}/{ms.total}</Badge>
              ) : (
                <Badge className={ms.achieved ? "bg-chart-1/15 text-chart-1 text-[10px]" : "text-[10px]"} variant={ms.achieved ? "default" : "secondary"}>
                  {ms.achieved ? "✅ Active" : "Pending"}
                </Badge>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnualMarketLeadershipProgress;
