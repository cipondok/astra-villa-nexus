import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Activity, TrendingUp, Users, DollarSign, Building2, Zap,
  ArrowUpRight, AlertTriangle, Eye, Phone, MessageSquare,
  BarChart3, Target, Shield, Clock
} from "lucide-react";

const headlineMetrics = [
  { label: "Active Deals", value: "18", delta: "+3", icon: Activity, color: "text-primary" },
  { label: "Supply Growth", value: "+12%", delta: "WoW", icon: Building2, color: "text-chart-1" },
  { label: "Demand Pulse", value: "78/100", delta: "Strong", icon: TrendingUp, color: "text-chart-2" },
  { label: "Revenue Run-Rate", value: "Rp 1.15B", delta: "+22% MoM", icon: DollarSign, color: "text-chart-3" },
  { label: "Agent Network", value: "62 Active", delta: "+8 this week", icon: Users, color: "text-primary" },
  { label: "Liquidity Score", value: "72/100", delta: "Building", icon: Shield, color: "text-chart-1" },
];

const urgentAlerts = [
  { type: "deal", text: "Deal D-412: Buyer financing confirmation overdue — Rp 4.2B Seminyak Villa", priority: "critical" },
  { type: "supply", text: "North District: 3 listings below liquidity threshold — recruit agents", priority: "high" },
  { type: "revenue", text: "2 premium listing upgrades expiring — potential Rp 8M revenue loss", priority: "medium" },
];

const pipeline = [
  { stage: "Inquiry", count: 45, width: 100 },
  { stage: "Viewing", count: 28, width: 62 },
  { stage: "Negotiation", count: 15, width: 33 },
  { stage: "Closing", count: 8, width: 18 },
  { stage: "Closed", count: 5, width: 11 },
];

const districtHeat = [
  { name: "Seminyak", heat: 92, deals: 5 },
  { name: "Canggu", heat: 85, deals: 4 },
  { name: "Kuta", heat: 72, deals: 3 },
  { name: "Ubud", heat: 68, deals: 2 },
  { name: "Denpasar", heat: 58, deals: 2 },
  { name: "Nusa Dua", heat: 52, deals: 1 },
  { name: "Sanur", heat: 38, deals: 1 },
  { name: "Jimbaran", heat: 32, deals: 0 },
];

const quickActions = [
  { label: "Open Top Deal", icon: Eye, variant: "default" as const },
  { label: "Contact Agent", icon: Phone, variant: "outline" as const },
  { label: "Message Buyer", icon: MessageSquare, variant: "outline" as const },
  { label: "View Pipeline", icon: BarChart3, variant: "outline" as const },
];

const executionScore = 74;
const priorityColor = (p: string) => p === "critical" ? "border-destructive/30 bg-destructive/5" : p === "high" ? "border-chart-3/30 bg-chart-3/5" : "border-primary/30 bg-primary/5";
const priorityIcon = (p: string) => p === "critical" ? "text-destructive" : p === "high" ? "text-chart-3" : "text-primary";

const UltimateFounderOneScreen: React.FC = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Founder Command Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Entire business status — one screen</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="border-primary/20 bg-primary/5 px-4 py-2">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{executionScore}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Execution Score</div>
            </div>
          </Card>
          <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 animate-pulse text-xs">
            <Clock className="h-3 w-3 mr-1" /> Live
          </Badge>
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {headlineMetrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-border/50">
              <CardContent className="p-2.5 text-center">
                <m.icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${m.color}`} />
                <div className="text-base font-bold text-foreground leading-tight">{m.value}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
                <div className="text-[9px] text-chart-1 flex items-center justify-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="h-2.5 w-2.5" />{m.delta}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alert Strip */}
      <Card className="border-border/50">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-chart-3" /> Strategic Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-1.5">
          {urgentAlerts.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`${priorityColor(a.priority)}`}>
                <CardContent className="p-2 flex items-center gap-2">
                  <AlertTriangle className={`h-3.5 w-3.5 flex-shrink-0 ${priorityIcon(a.priority)}`} />
                  <span className="text-[11px] text-foreground flex-1">{a.text}</span>
                  <Badge variant="secondary" className="text-[9px]">{a.priority}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pipeline Funnel */}
        <Card className="border-border/50">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-primary" /> Deal Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-1.5">
            {pipeline.map((p, i) => (
              <div key={p.stage} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16">{p.stage}</span>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.width}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-full bg-primary/70 rounded flex items-center justify-end px-1">
                    <span className="text-[9px] font-bold text-primary-foreground">{p.count}</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* District Heat */}
        <Card className="border-border/50">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-chart-1" /> District Traction
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-1">
            {districtHeat.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="text-[10px] text-foreground w-16 truncate">{d.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${d.heat}%`,
                    background: d.heat > 80 ? "hsl(var(--chart-1))" : d.heat > 60 ? "hsl(var(--primary))" : d.heat > 40 ? "hsl(var(--chart-3))" : "hsl(var(--muted-foreground))"
                  }} />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground w-6">{d.heat}</span>
                <span className="text-[9px] text-foreground w-4">{d.deals}d</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions + Score */}
        <Card className="border-border/50">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            {quickActions.map((qa) => (
              <Button key={qa.label} variant={qa.variant} size="sm" className="w-full justify-start text-xs h-8">
                <qa.icon className="h-3.5 w-3.5 mr-2" />{qa.label}
              </Button>
            ))}
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Daily Execution</span>
                <span className="text-xs font-bold text-primary">{executionScore}%</span>
              </div>
              <Progress value={executionScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UltimateFounderOneScreen;
