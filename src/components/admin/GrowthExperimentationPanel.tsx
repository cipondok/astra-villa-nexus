import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  FlaskConical, Zap, TrendingUp, Users, DollarSign, Bell,
  Eye, BarChart3, CheckCircle, XCircle, Pause, Play,
  RotateCcw, Target, Layers, ArrowUpRight, ArrowDownRight,
  Activity, Megaphone, CreditCard, RefreshCw, Shield
} from "lucide-react";

type ExperimentStatus = "running" | "scaling" | "paused" | "completed" | "rolled_back";

interface Experiment {
  id: string;
  name: string;
  category: string;
  status: ExperimentStatus;
  confidence: number;
  lift: number;
  kpi: string;
  startDate: string;
  traffic: number;
  icon: typeof FlaskConical;
}

const EXPERIMENTS: Experiment[] = [
  { id: "exp-01", name: "Premium Listing Price +15%", category: "Monetization", status: "running", confidence: 78, lift: 12.4, kpi: "Revenue/Listing", startDate: "2026-03-01", traffic: 30, icon: DollarSign },
  { id: "exp-02", name: "Push Notification 9AM vs 2PM", category: "Engagement", status: "scaling", confidence: 94, lift: 23.1, kpi: "Open Rate", startDate: "2026-02-15", traffic: 50, icon: Bell },
  { id: "exp-03", name: "Referral Bonus Rp 500k vs Rp 250k", category: "Acquisition", status: "running", confidence: 62, lift: 8.7, kpi: "Referral Conv.", startDate: "2026-03-10", traffic: 25, icon: Users },
  { id: "exp-04", name: "Onboarding 3-Step vs 5-Step", category: "Engagement", status: "completed", confidence: 91, lift: 18.3, kpi: "Activation Rate", startDate: "2026-01-20", traffic: 100, icon: Layers },
  { id: "exp-05", name: "Visibility Boost Free Trial 7d", category: "Liquidity", status: "paused", confidence: 45, lift: -2.1, kpi: "Listing Views", startDate: "2026-03-05", traffic: 15, icon: Eye },
  { id: "exp-06", name: "Commission 2% vs 2.5%", category: "Monetization", status: "rolled_back", confidence: 88, lift: -14.2, kpi: "Deal Volume", startDate: "2026-02-01", traffic: 0, icon: CreditCard },
  { id: "exp-07", name: "Instagram Ad Creative V3", category: "Acquisition", status: "running", confidence: 71, lift: 15.8, kpi: "CPA", startDate: "2026-03-12", traffic: 20, icon: Megaphone },
  { id: "exp-08", name: "Investor Newsletter Personalization", category: "Engagement", status: "scaling", confidence: 96, lift: 31.4, kpi: "CTR", startDate: "2026-02-20", traffic: 75, icon: Target },
];

const STATUS_CONFIG: Record<ExperimentStatus, { label: string; color: string; icon: typeof Play }> = {
  running: { label: "Running", color: "bg-blue-500", icon: Play },
  scaling: { label: "Auto-Scaling", color: "bg-emerald-500", icon: ArrowUpRight },
  paused: { label: "Paused", color: "bg-amber-500", icon: Pause },
  completed: { label: "Completed", color: "bg-primary", icon: CheckCircle },
  rolled_back: { label: "Rolled Back", color: "bg-destructive", icon: RotateCcw },
};

const CATEGORY_ICONS: Record<string, typeof FlaskConical> = {
  Acquisition: Users,
  Monetization: DollarSign,
  Engagement: Bell,
  Liquidity: Activity,
};

const KPI_FRAMEWORK = [
  { category: "Acquisition", kpis: ["CAC by channel", "Signup-to-activation rate", "Referral conversion %", "Ad ROAS"], target: "CAC < Rp 95k blended" },
  { category: "Monetization", kpis: ["Revenue per listing", "Subscription conversion", "Commission yield", "ARPU growth"], target: "ARPU +15% QoQ" },
  { category: "Engagement", kpis: ["DAU/MAU ratio", "Notification open rate", "Session duration", "Feature adoption"], target: "DAU/MAU > 35%" },
  { category: "Liquidity", kpis: ["Listing views velocity", "Inquiry-to-offer rate", "Time-to-first-inquiry", "Deal closure speed"], target: "Avg close < 45 days" },
];

const ROLLOUT_PHASES = [
  { phase: "Phase 1: Manual Experiments", timeline: "Month 1-2", progress: 80, items: ["Admin experiment creation UI", "A/B traffic splitting logic", "KPI tracking integration", "Manual winner selection"] },
  { phase: "Phase 2: Semi-Autonomous", timeline: "Month 3-4", progress: 30, items: ["Confidence auto-calculation", "Auto-pause on negative KPI", "Scaling recommendations", "Rollback triggers"] },
  { phase: "Phase 3: Fully Autonomous", timeline: "Month 5-6", progress: 5, items: ["AI-generated experiment hypotheses", "Auto-scaling winning variants", "Multi-armed bandit allocation", "Cross-experiment interference detection"] },
];

export default function GrowthExperimentationPanel() {
  const [activeTab, setActiveTab] = useState("experiments");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = categoryFilter === "all" ? EXPERIMENTS : EXPERIMENTS.filter((e) => e.category === categoryFilter);
  const categories = ["all", ...new Set(EXPERIMENTS.map((e) => e.category))];

  const running = EXPERIMENTS.filter((e) => e.status === "running" || e.status === "scaling").length;
  const avgLift = EXPERIMENTS.filter((e) => e.lift > 0).reduce((s, e) => s + e.lift, 0) / Math.max(1, EXPERIMENTS.filter((e) => e.lift > 0).length);
  const highConf = EXPERIMENTS.filter((e) => e.confidence >= 90).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Growth Experimentation Engine</h2>
            <p className="text-sm text-muted-foreground">Autonomous A/B testing, auto-scaling winners, and rollback safety</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs">
          <RefreshCw className="h-3 w-3 animate-spin" />
          {running} Active
        </Badge>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Experiments", value: String(running), icon: Play, note: "Running + Scaling" },
          { label: "Avg Positive Lift", value: `+${avgLift.toFixed(1)}%`, icon: TrendingUp, note: "Winning variants" },
          { label: "High Confidence", value: String(highConf), icon: Shield, note: "≥90% significance" },
          { label: "Total Experiments", value: String(EXPERIMENTS.length), icon: FlaskConical, note: "All time" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="experiments" className="text-xs">Live Experiments</TabsTrigger>
          <TabsTrigger value="kpis" className="text-xs">KPI Framework</TabsTrigger>
          <TabsTrigger value="automation" className="text-xs">AI Controls</TabsTrigger>
          <TabsTrigger value="rollout" className="text-xs">Rollout Plan</TabsTrigger>
        </TabsList>

        {/* Live Experiments */}
        <TabsContent value="experiments" className="space-y-3 mt-4">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <Button key={c} variant={categoryFilter === c ? "default" : "outline"} size="sm" className="h-7 text-xs capitalize" onClick={() => setCategoryFilter(c)}>
                {c === "all" ? "All" : c}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map((exp) => {
              const sc = STATUS_CONFIG[exp.status];
              const isPositive = exp.lift > 0;
              return (
                <Card key={exp.id}>
                  <CardContent className="py-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                      <exp.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{exp.name}</p>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 flex-shrink-0">{exp.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>KPI: {exp.kpi}</span>
                        <span>Since {exp.startDate}</span>
                        {exp.traffic > 0 && <span>Traffic: {exp.traffic}%</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Lift */}
                      <div className="text-right">
                        <div className={`flex items-center gap-0.5 text-sm font-bold ${isPositive ? "text-emerald-600" : "text-destructive"}`}>
                          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          {isPositive ? "+" : ""}{exp.lift}%
                        </div>
                        <p className="text-[9px] text-muted-foreground">lift</p>
                      </div>
                      {/* Confidence */}
                      <div className="w-16 text-right">
                        <div className="flex items-center gap-1">
                          <Progress value={exp.confidence} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-medium">{exp.confidence}%</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground">confidence</p>
                      </div>
                      {/* Status */}
                      <Badge variant="secondary" className="gap-1 text-[9px] h-5 min-w-[80px] justify-center">
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.color}`} />
                        {sc.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* KPI Framework */}
        <TabsContent value="kpis" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {KPI_FRAMEWORK.map((k) => {
              const Icon = CATEGORY_ICONS[k.category] || BarChart3;
              return (
                <Card key={k.category}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold">{k.category}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[9px]">{k.target}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      {k.kpis.map((kpi) => (
                        <div key={kpi} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                          <span>{kpi}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* AI Controls */}
        <TabsContent value="automation" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Auto-Scale Winners",
                icon: ArrowUpRight,
                description: "Automatically increase traffic allocation when experiment reaches ≥90% confidence with positive lift >10%.",
                rules: ["Confidence ≥ 90%", "Lift > 10%", "Min 500 samples", "No conflicting experiments"],
                status: "Active",
              },
              {
                title: "Auto-Pause Losers",
                icon: Pause,
                description: "Pause experiments showing statistically significant negative KPI impact to prevent revenue damage.",
                rules: ["Confidence ≥ 85%", "Lift < -5%", "Running > 7 days", "Admin notified on pause"],
                status: "Active",
              },
              {
                title: "Rollback Safety",
                icon: RotateCcw,
                description: "Instantly revert experiment changes when critical KPIs breach safety thresholds.",
                rules: ["Revenue drop > 10%", "Conversion drop > 15%", "User complaints spike", "Immediate full rollback"],
                status: "Active",
              },
              {
                title: "Hypothesis Generator",
                icon: FlaskConical,
                description: "AI analyzes platform data to suggest new experiment hypotheses with predicted impact ranges.",
                rules: ["Weekly hypothesis generation", "Impact prediction scoring", "Priority ranking by ROI", "Auto-create draft experiments"],
                status: "Planned",
              },
            ].map((ctrl) => (
              <Card key={ctrl.title}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ctrl.icon className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold">{ctrl.title}</CardTitle>
                    </div>
                    <Badge variant={ctrl.status === "Active" ? "default" : "outline"} className="text-[9px] h-4">{ctrl.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{ctrl.description}</p>
                  <Separator />
                  <div className="space-y-1">
                    {ctrl.rules.map((r) => (
                      <div key={r} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rollout */}
        <TabsContent value="rollout" className="space-y-4 mt-4">
          {ROLLOUT_PHASES.map((p) => (
            <Card key={p.phase}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{p.phase}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{p.timeline}</Badge>
                    <span className="text-xs font-medium text-muted-foreground">{p.progress}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={p.progress} className="h-1.5" />
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {p.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs">
                      <CheckCircle className={`h-3 w-3 flex-shrink-0 ${p.progress > 50 ? "text-emerald-500" : "text-muted-foreground/30"}`} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
