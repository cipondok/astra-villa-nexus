import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Landmark, TrendingUp, DollarSign, Users, BarChart3,
  Shield, Award, ArrowUpRight, Layers, Target, Zap, Activity
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueScaling = [
  { month: "Jan", mrr: 45, gtv: 320 }, { month: "Feb", mrr: 72, gtv: 480 },
  { month: "Mar", mrr: 108, gtv: 720 }, { month: "Apr", mrr: 162, gtv: 1080 },
  { month: "May", mrr: 225, gtv: 1500 }, { month: "Jun", mrr: 306, gtv: 2040 },
  { month: "Jul", mrr: 400, gtv: 2800 }, { month: "Aug", mrr: 510, gtv: 3600 },
  { month: "Sep", mrr: 640, gtv: 4500 }, { month: "Oct", mrr: 790, gtv: 5600 },
  { month: "Nov", mrr: 960, gtv: 6800 }, { month: "Dec", mrr: 1150, gtv: 8200 },
];

const unitEconomics = [
  { metric: "CAC", value: 85, target: 60, unit: "USD" },
  { metric: "LTV", value: 420, target: 500, unit: "USD" },
  { metric: "LTV:CAC", value: 4.9, target: 5, unit: "x" },
  { metric: "Payback", value: 4.2, target: 3, unit: "months" },
  { metric: "Churn", value: 3.8, target: 3, unit: "%" },
  { metric: "NDR", value: 118, target: 120, unit: "%" },
];

const readinessMetrics = [
  { label: "Revenue Growth (MoM)", value: 22, target: "20%", score: 95 },
  { label: "GTV (Monthly)", value: "Rp 8.2B", target: "10B", score: 82 },
  { label: "Marketplace Liquidity", value: "68%", target: "75%", score: 72 },
  { label: "Network Effect Index", value: "7.2/10", target: "8/10", score: 75 },
  { label: "Retention Rate", value: "78%", target: "85%", score: 68 },
  { label: "Repeat Usage", value: "42%", target: "50%", score: 65 },
];

const phases = [
  { label: "Pre-Series A Ready", threshold: 40, achieved: true },
  { label: "Scaling Phase", threshold: 60, achieved: true },
  { label: "Growth Stage", threshold: 75, achieved: false },
  { label: "IPO Trajectory", threshold: 90, achieved: false },
];

const compositeScore = 72;

const IPOReadinessMetrics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            IPO Readiness Metrics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Investor-grade analytics & funding readiness</p>
        </div>
        <Card className="border-primary/20 bg-primary/5 px-5 py-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{compositeScore}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">IPO Score</div>
          </div>
        </Card>
      </div>

      {/* Phase Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {phases.map((p, i) => (
          <motion.div key={p.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`border-border/50 ${p.achieved ? "bg-chart-1/5 border-chart-1/20" : "bg-muted/20"}`}>
              <CardContent className="p-3 text-center">
                <Award className={`h-4 w-4 mx-auto mb-1 ${p.achieved ? "text-chart-1" : "text-muted-foreground"}`} />
                <div className="text-xs font-bold text-foreground">{p.label}</div>
                <Badge className={`text-[10px] mt-1 ${p.achieved ? "bg-chart-1/15 text-chart-1" : ""}`} variant={p.achieved ? "default" : "secondary"}>
                  {p.achieved ? "✅ Achieved" : `${p.threshold}+ needed`}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Scaling */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Revenue Scaling Curve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueScaling}>
              <defs>
                <linearGradient id="ipoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
              <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#ipoGrad)" strokeWidth={2} name="MRR (M IDR)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unit Economics */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Unit Economics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unitEconomics.map((ue, i) => (
              <motion.div key={ue.metric} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-2 rounded-lg border border-border/30">
                <span className="text-xs font-bold text-foreground w-16">{ue.metric}</span>
                <div className="flex-1">
                  <Progress value={Math.min((ue.value / ue.target) * 100, 100)} className="h-1.5" />
                </div>
                <span className="text-xs font-mono text-foreground w-14 text-right">{ue.value} {ue.unit}</span>
                <span className="text-[10px] text-muted-foreground w-16 text-right">/{ue.target}</span>
                {ue.value >= ue.target ?
                  <ArrowUpRight className="h-3 w-3 text-chart-1" /> :
                  <Activity className="h-3 w-3 text-chart-3" />
                }
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Readiness */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Readiness Scorecard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {readinessMetrics.map((rm, i) => (
              <motion.div key={rm.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-2 rounded-lg border border-border/30">
                <span className="text-[10px] text-foreground w-32 truncate">{rm.label}</span>
                <div className="flex-1">
                  <Progress value={rm.score} className="h-1.5" />
                </div>
                <span className="text-xs font-mono text-foreground w-14 text-right">{typeof rm.value === "number" ? `${rm.value}%` : rm.value}</span>
                <Badge className={`text-[10px] w-10 justify-center ${rm.score >= 80 ? "bg-chart-1/15 text-chart-1" : rm.score >= 65 ? "bg-chart-3/15 text-chart-3" : "bg-destructive/15 text-destructive"}`} variant="secondary">
                  {rm.score}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Assessment */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground mb-1">IPO Readiness Assessment</p>
              <p className="text-xs text-muted-foreground">
                Composite score {compositeScore}/100 — <span className="text-primary font-medium">Scaling Phase achieved</span>.
                Focus areas: Improve marketplace liquidity ratio to 75%+ and increase retention rate to 85%+ to enter Growth Stage trajectory.
                LTV:CAC ratio at 4.9x approaching target 5x threshold.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IPOReadinessMetrics;
