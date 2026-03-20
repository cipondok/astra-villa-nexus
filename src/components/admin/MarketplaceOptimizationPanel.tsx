import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Eye, Truck, DollarSign, Megaphone, ShieldCheck, RotateCcw,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, Zap,
  ArrowUpRight, ArrowDownRight, Minus, Bot
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

/* ─── mock data generators ─────────────────────────────────────── */

const feedbackLoopData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  signals: Math.round(120 + Math.random() * 80),
  decisions: Math.round(90 + Math.random() * 60),
  rollbacks: Math.round(Math.random() * 8),
}));

const optimizationModules = [
  {
    id: "listing-visibility",
    title: "Listing Visibility Allocation",
    icon: Eye,
    status: "active" as const,
    confidence: 87,
    lastAction: "Boosted 14 high-liquidity listings in Jakarta Selatan",
    actionsToday: 47,
    kpiImpact: +3.2,
    description: "Dynamically adjusts ranking based on demand signals, prioritizes high-liquidity properties, detects stagnated inventory.",
    metrics: [
      { label: "Visibility Adjustments", value: 47, trend: "up" },
      { label: "Stagnation Detections", value: 6, trend: "down" },
      { label: "Liquidity Boost Triggers", value: 14, trend: "up" },
      { label: "Avg Ranking Shift", value: "+4.2 positions", trend: "up" },
    ],
  },
  {
    id: "vendor-lead",
    title: "Vendor Lead Distribution",
    icon: Truck,
    status: "active" as const,
    confidence: 91,
    lastAction: "Redistributed 8 high-value renovation leads to top-rated vendors",
    actionsToday: 23,
    kpiImpact: +5.7,
    description: "Routes jobs to highest performance vendors, balances workload distribution, predicts vendor churn risk.",
    metrics: [
      { label: "Leads Routed", value: 23, trend: "up" },
      { label: "Churn Risk Detected", value: 3, trend: "neutral" },
      { label: "Workload Rebalances", value: 11, trend: "up" },
      { label: "Vendor Satisfaction", value: "94%", trend: "up" },
    ],
  },
  {
    id: "pricing-monetization",
    title: "Pricing & Monetization",
    icon: DollarSign,
    status: "active" as const,
    confidence: 78,
    lastAction: "Suggested 12% premium slot price increase for BSD corridor",
    actionsToday: 9,
    kpiImpact: +2.1,
    description: "Experiments with premium slot pricing, optimizes subscription upgrade triggers, forecasts commission elasticity.",
    metrics: [
      { label: "Price Experiments", value: 4, trend: "up" },
      { label: "Upgrade Triggers Fired", value: 9, trend: "up" },
      { label: "Commission Elasticity", value: "0.73", trend: "neutral" },
      { label: "Revenue Lift Est.", value: "+Rp 8.4M", trend: "up" },
    ],
  },
  {
    id: "growth-campaigns",
    title: "Growth Campaign Automation",
    icon: Megaphone,
    status: "paused" as const,
    confidence: 64,
    lastAction: "Demand gap detected in Tangerang — campaign draft prepared",
    actionsToday: 2,
    kpiImpact: -0.3,
    description: "Launches targeted campaigns when demand gaps detected, optimizes marketing channel ROI, activates referral incentives.",
    metrics: [
      { label: "Campaigns Launched", value: 2, trend: "neutral" },
      { label: "Demand Gaps Found", value: 5, trend: "up" },
      { label: "Channel ROI Optimized", value: 3, trend: "neutral" },
      { label: "Referral Activations", value: 0, trend: "down" },
    ],
  },
];

const decisionLog = [
  { id: 1, time: "14:32", module: "Listing Visibility", action: "Boosted 3 listings in Menteng", confidence: 92, outcome: "positive", kpi: "+2.1% inquiry rate" },
  { id: 2, time: "14:18", module: "Vendor Lead", action: "Redirected renovation lead #4821", confidence: 88, outcome: "positive", kpi: "+15min response time" },
  { id: 3, time: "13:55", module: "Pricing", action: "Premium slot A/B test started", confidence: 74, outcome: "pending", kpi: "Monitoring..." },
  { id: 4, time: "13:40", module: "Listing Visibility", action: "Deprioritized 2 stale listings", confidence: 95, outcome: "positive", kpi: "-4.2 days avg stagnation" },
  { id: 5, time: "13:12", module: "Growth Campaigns", action: "Paused Tangerang campaign — negative ROI", confidence: 81, outcome: "rollback", kpi: "Saved Rp 1.2M" },
  { id: 6, time: "12:48", module: "Vendor Lead", action: "Churn risk alert for 2 vendors", confidence: 77, outcome: "pending", kpi: "Admin review needed" },
];

const safetyRadarData = [
  { axis: "Confidence", value: 84 },
  { axis: "Rollback Rate", value: 92 },
  { axis: "KPI Alignment", value: 78 },
  { axis: "Decision Speed", value: 88 },
  { axis: "Override Rate", value: 95 },
  { axis: "Explainability", value: 82 },
];

const kpiTrendData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  liquidity: +(62 + i * 1.4 + Math.random() * 6).toFixed(1),
  revenue: +(48 + i * 2.1 + Math.random() * 8).toFixed(1),
  satisfaction: +(71 + i * 0.8 + Math.random() * 4).toFixed(1),
}));

/* ─── sub-components ────────────────────────────────────────────── */

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function ModuleCard({
  mod,
  enabled,
  onToggle,
}: {
  mod: (typeof optimizationModules)[0];
  enabled: boolean;
  onToggle: () => void;
}) {
  const Icon = mod.icon;
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{mod.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-[260px]">{mod.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={mod.status === "active" ? "default" : "secondary"} className="text-[10px] uppercase tracking-wide">
              {mod.status}
            </Badge>
            <Switch checked={enabled} onCheckedChange={onToggle} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Confidence bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">AI Confidence</span>
            <span className="font-medium tabular-nums">{mod.confidence}%</span>
          </div>
          <Progress value={mod.confidence} className="h-1.5" />
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          {mod.metrics.map((m) => (
            <div key={m.label} className="rounded-md bg-muted/50 px-2.5 py-1.5">
              <div className="flex items-center gap-1">
                <TrendIcon trend={m.trend} />
                <span className="text-xs font-semibold tabular-nums">{m.value}</span>
              </div>
              <span className="text-[10px] text-muted-foreground leading-none">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Last action */}
        <div className="rounded-md border border-border/40 bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
            <Clock className="h-3 w-3" /> Last Autonomous Action
          </div>
          <p className="text-xs">{mod.lastAction}</p>
        </div>

        {/* KPI impact */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">KPI Impact Today</span>
          <span className={`font-semibold tabular-nums ${mod.kpiImpact >= 0 ? "text-emerald-500" : "text-red-400"}`}>
            {mod.kpiImpact >= 0 ? "+" : ""}{mod.kpiImpact}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── main panel ────────────────────────────────────────────────── */

const MarketplaceOptimizationPanel: React.FC = () => {
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    "listing-visibility": true,
    "vendor-lead": true,
    "pricing-monetization": true,
    "growth-campaigns": false,
  });
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [autoRollback, setAutoRollback] = useState(true);

  const toggleModule = (id: string) =>
    setEnabledModules((prev) => ({ ...prev, [id]: !prev[id] }));

  const activeCount = Object.values(enabledModules).filter(Boolean).length;
  const avgConfidence = useMemo(
    () => Math.round(optimizationModules.reduce((s, m) => s + m.confidence, 0) / optimizationModules.length),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Autonomous Marketplace Optimizer
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Self-adjusting AI layer for liquidity, revenue & satisfaction
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1 text-xs">
            <Activity className="h-3 w-3" /> {activeCount}/4 Modules Active
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs">
            <Zap className="h-3 w-3" /> Avg Confidence {avgConfidence}%
          </Badge>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Decisions Today", value: "81", icon: CheckCircle, delta: "+12 vs yesterday" },
          { label: "Rollbacks", value: "1", icon: RotateCcw, delta: "1.2% rate" },
          { label: "Net KPI Lift", value: "+4.7%", icon: TrendingUp, delta: "Across all modules" },
          { label: "Admin Overrides", value: "3", icon: ShieldCheck, delta: "Last 24h" },
        ].map((k) => (
          <Card key={k.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <k.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums leading-none">{k.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k.label}</p>
                <p className="text-[10px] text-muted-foreground/70">{k.delta}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">Optimization Modules</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Loop</TabsTrigger>
          <TabsTrigger value="decisions">Decision Log</TabsTrigger>
          <TabsTrigger value="safety">Safety Controls</TabsTrigger>
        </TabsList>

        {/* ── Modules ──────────────────────────────────── */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {optimizationModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                enabled={enabledModules[mod.id]}
                onToggle={() => toggleModule(mod.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── Feedback Loop ────────────────────────────── */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Real-Time Signal → Decision Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={feedbackLoopData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="signals" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.15)" name="Signals Ingested" />
                    <Area type="monotone" dataKey="decisions" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/.12)" name="Decisions Made" />
                    <Area type="monotone" dataKey="rollbacks" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive)/.1)" name="Rollbacks" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">14-Day KPI Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={kpiTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={2} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="liquidity" fill="hsl(var(--primary))" name="Liquidity" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="satisfaction" fill="hsl(var(--chart-4))" name="Satisfaction" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Decision Log ─────────────────────────────── */}
        <TabsContent value="decisions" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Explainable Decision Log — Last 24 Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {decisionLog.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/20 px-3 py-2.5">
                    <span className="text-[10px] text-muted-foreground tabular-nums w-10 shrink-0">{d.time}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{d.module}</Badge>
                    <p className="text-xs flex-1">{d.action}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] tabular-nums text-muted-foreground">{d.confidence}%</span>
                      {d.outcome === "positive" && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                      {d.outcome === "rollback" && <RotateCcw className="h-3.5 w-3.5 text-amber-500" />}
                      {d.outcome === "pending" && <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums w-32 text-right shrink-0">{d.kpi}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Safety Controls ──────────────────────────── */}
        <TabsContent value="safety" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Safety Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={safetyRadarData} outerRadius="75%">
                    <PolarGrid className="stroke-border/40" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Safety Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.2)" />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Admin Override Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Confidence threshold */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Minimum Confidence Threshold</span>
                    <span className="font-semibold tabular-nums">{confidenceThreshold[0]}%</span>
                  </div>
                  <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} min={50} max={95} step={5} />
                  <p className="text-[10px] text-muted-foreground">
                    Decisions below this threshold require admin approval
                  </p>
                </div>

                {/* Auto-rollback */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Auto-Rollback on Negative KPI</p>
                    <p className="text-[10px] text-muted-foreground">Revert actions if KPI drops &gt;2% within 1h</p>
                  </div>
                  <Switch checked={autoRollback} onCheckedChange={setAutoRollback} />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <RotateCcw className="h-3 w-3" /> Rollback Last Action
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <AlertTriangle className="h-3 w-3" /> Pause All Modules
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <ShieldCheck className="h-3 w-3" /> Force Safety Audit
                  </Button>
                </div>

                {/* Safety status list */}
                <div className="space-y-1.5 pt-2">
                  {[
                    { label: "Decision Explainability", ok: true },
                    { label: "KPI Guardrails Active", ok: true },
                    { label: "Admin Override Channel", ok: true },
                    { label: "Rollback Mechanism Tested", ok: true },
                    { label: "Anomaly Detection Online", ok: autoRollback },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-xs">
                      {s.ok ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceOptimizationPanel;
