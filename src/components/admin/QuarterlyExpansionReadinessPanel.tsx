import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Compass, TrendingUp, Building2, Users, DollarSign, Target,
  BarChart3, Award, ArrowUpRight, Shield, Zap, Layers
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const readinessMetrics = {
  supplyDensity: 72,
  buyerDemand: 68,
  dealCycleEfficiency: 65,
  revenuePredictability: 58,
  agentNetworkStrength: 75,
};

const compositeScore = Math.round(Object.values(readinessMetrics).reduce((s, v) => s + v, 0) / Object.keys(readinessMetrics).length);

const radarData = [
  { metric: "Supply", value: readinessMetrics.supplyDensity },
  { metric: "Demand", value: readinessMetrics.buyerDemand },
  { metric: "Deal Cycle", value: readinessMetrics.dealCycleEfficiency },
  { metric: "Revenue", value: readinessMetrics.revenuePredictability },
  { metric: "Agent Net", value: readinessMetrics.agentNetworkStrength },
];

const districtMaturity = [
  { district: "Seminyak", maturity: 85, stage: "mature", listings: 35, deals: 14, agents: 8 },
  { district: "Kuta", maturity: 78, stage: "mature", listings: 30, deals: 12, agents: 6 },
  { district: "Canggu", maturity: 68, stage: "growing", listings: 28, deals: 10, agents: 5 },
  { district: "Denpasar", maturity: 62, stage: "growing", listings: 22, deals: 8, agents: 7 },
  { district: "Nusa Dua", maturity: 52, stage: "early", listings: 18, deals: 6, agents: 4 },
  { district: "Ubud", maturity: 45, stage: "early", listings: 14, deals: 5, agents: 3 },
  { district: "Sanur", maturity: 35, stage: "nascent", listings: 8, deals: 3, agents: 2 },
  { district: "Jimbaran", maturity: 28, stage: "nascent", listings: 5, deals: 2, agents: 1 },
];

const milestones = [
  { label: "Local Liquidity Stability Achieved", achieved: true, description: "2+ districts with 80+ maturity score" },
  { label: "Expansion Preparation Phase", achieved: compositeScore >= 65, description: "Composite readiness score above 65" },
  { label: "Scalable Marketplace Signal", achieved: false, description: "All core districts above 70 maturity" },
];

const expansionCandidates = [
  { city: "Surabaya", population: "2.9M", demandSignal: 72, competitorDensity: "Low", readiness: "High", priority: 1 },
  { city: "Bandung", population: "2.5M", demandSignal: 65, competitorDensity: "Medium", readiness: "Medium", priority: 2 },
  { city: "Yogyakarta", population: "0.4M", demandSignal: 58, competitorDensity: "Low", readiness: "Medium", priority: 3 },
];

const stageColor = (s: string) => {
  switch (s) {
    case "mature": return "bg-chart-1/15 text-chart-1 border-chart-1/30";
    case "growing": return "bg-primary/15 text-primary border-primary/30";
    case "early": return "bg-chart-3/15 text-chart-3 border-chart-3/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const QuarterlyExpansionReadinessPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            Quarterly Expansion Readiness Scoreboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Structured assessment for geographic expansion</p>
        </div>
        <Card className="border-primary/20 bg-primary/5 px-6 py-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{compositeScore}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Composite Readiness</div>
          </div>
        </Card>
      </div>

      {/* Readiness Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Supply Density", value: readinessMetrics.supplyDensity, icon: Building2 },
          { label: "Buyer Demand", value: readinessMetrics.buyerDemand, icon: Users },
          { label: "Deal Efficiency", value: readinessMetrics.dealCycleEfficiency, icon: TrendingUp },
          { label: "Revenue Predict.", value: readinessMetrics.revenuePredictability, icon: DollarSign },
          { label: "Agent Network", value: readinessMetrics.agentNetworkStrength, icon: Shield },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3">
              <m.icon className="h-4 w-4 text-primary mb-1" />
              <div className="flex items-center gap-2">
                <Progress value={m.value} className="flex-1 h-2" />
                <span className="text-sm font-bold text-foreground">{m.value}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Readiness Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                <Radar name="Readiness" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-chart-3" />
              Strategic Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((ms, i) => (
              <motion.div key={ms.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${ms.achieved ? "border-chart-1/20 bg-chart-1/5" : "border-border/40 bg-muted/20"}`}>
                {ms.achieved ? <Zap className="h-5 w-5 text-chart-1" /> : <Target className="h-5 w-5 text-muted-foreground" />}
                <div className="flex-1">
                  <span className="text-xs font-bold text-foreground">{ms.label}</span>
                  <p className="text-[10px] text-muted-foreground">{ms.description}</p>
                </div>
                <Badge className={ms.achieved ? "bg-chart-1/15 text-chart-1 text-[10px]" : "text-[10px]"} variant={ms.achieved ? "default" : "secondary"}>
                  {ms.achieved ? "✅ Achieved" : "Pending"}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* District Maturity */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            District Maturity Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {districtMaturity.map((d, i) => (
            <motion.div key={d.district} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-2 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
              <span className="text-xs font-bold text-foreground w-20">{d.district}</span>
              <Progress value={d.maturity} className="flex-1 h-2" />
              <span className="text-xs font-mono text-foreground w-8 text-right">{d.maturity}</span>
              <Badge className={`${stageColor(d.stage)} text-[10px] w-16 justify-center`}>{d.stage}</Badge>
              <span className="text-[10px] text-muted-foreground w-24">{d.listings}L • {d.deals}D • {d.agents}A</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Expansion Candidates */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Compass className="h-4 w-4 text-chart-2" />
            Next Expansion Candidates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {expansionCandidates.map((c, i) => (
            <motion.div key={c.city} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-primary">#{c.priority}</div>
                <div>
                  <span className="text-sm font-bold text-foreground">{c.city}</span>
                  <p className="text-[10px] text-muted-foreground">Pop: {c.population} • Demand: {c.demandSignal} • Competition: {c.competitorDensity}</p>
                </div>
              </div>
              <Badge className={c.readiness === "High" ? "bg-chart-1/15 text-chart-1 border-chart-1/30 text-[10px]" : "text-[10px]"} variant={c.readiness === "High" ? "default" : "secondary"}>
                {c.readiness} Readiness
              </Badge>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuarterlyExpansionReadinessPanel;
