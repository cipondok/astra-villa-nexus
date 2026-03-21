import React, { useState } from "react";
import { Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart3, Check, ChevronDown, ChevronUp, Copy, Gauge, Layers, Shield, Target, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── types & data ───────── */

interface KPIMetric {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  trendValue: string;
  weight: number;
  status: "healthy" | "warning" | "critical";
}

interface DominationIndex {
  id: string;
  title: string;
  icon: React.ReactNode;
  score: number;
  description: string;
  formula: string;
  metrics: KPIMetric[];
  alerts: { threshold: string; condition: string; severity: "info" | "warning" | "critical" }[];
  controlActions: { trigger: string; action: string; expectedImpact: string }[];
}

const statusColors = {
  healthy: "text-chart-3 bg-chart-3/10 border-chart-3/30",
  warning: "text-chart-4 bg-chart-4/10 border-chart-4/30",
  critical: "text-chart-1 bg-chart-1/10 border-chart-1/30",
};

const severityColors = {
  info: "bg-primary/10 text-primary border-primary/30",
  warning: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  critical: "bg-chart-1/10 text-chart-1 border-chart-1/30",
};

const indices: DominationIndex[] = [
  {
    id: "liquidity",
    title: "Liquidity Strength Index",
    icon: <Layers className="h-5 w-5" />,
    score: 72,
    description: "Composite measure of marketplace transaction readiness — how quickly listings convert to inquiries, viewings, and closed deals across all active districts.",
    formula: "LSI = (Inquiry Velocity × 0.25) + (Viewing Conversion × 0.20) + (Offer Rate × 0.20) + (Absorption Rate × 0.20) + (Days-on-Market Inverse × 0.15)",
    metrics: [
      { label: "Daily Inquiry Velocity", value: "127/day", trend: "up", trendValue: "+18% WoW", weight: 25, status: "healthy" },
      { label: "Viewing Conversion Rate", value: "34%", trend: "up", trendValue: "+3.2pp WoW", weight: 20, status: "healthy" },
      { label: "Offer-to-Inquiry Ratio", value: "12.4%", trend: "down", trendValue: "-1.8pp WoW", weight: 20, status: "warning" },
      { label: "District Absorption Rate", value: "6.2%/mo", trend: "flat", trendValue: "+0.1pp", weight: 20, status: "healthy" },
      { label: "Avg Days on Market", value: "38 days", trend: "up", trendValue: "-4 days WoW", weight: 15, status: "healthy" },
    ],
    alerts: [
      { threshold: "LSI < 50", condition: "Liquidity drought — marketplace friction exceeds sustainable levels", severity: "critical" },
      { threshold: "LSI 50-65", condition: "Liquidity softening — early intervention recommended", severity: "warning" },
      { threshold: "Inquiry velocity drops >30% WoW", condition: "Demand shock — immediate supply or marketing action required", severity: "critical" },
      { threshold: "Days on market increases >20% MoM", condition: "Stale inventory risk — activate vendor engagement", severity: "warning" },
    ],
    controlActions: [
      { trigger: "LSI drops below 60", action: "Activate supply acquisition blitz — target 50 new listings in 14 days", expectedImpact: "+8-12 LSI points within 3 weeks" },
      { trigger: "Inquiry velocity stalls for 5+ days", action: "Deploy demand stimulation campaign — investor push notifications + email blast", expectedImpact: "+25% inquiry velocity within 7 days" },
      { trigger: "Absorption rate falls below 4%", action: "Launch 'Guaranteed Inquiry' vendor promotion to improve listing quality", expectedImpact: "+2pp absorption within 30 days" },
    ],
  },
  {
    id: "demand",
    title: "Demand Acceleration Index",
    icon: <TrendingUp className="h-5 w-5" />,
    score: 78,
    description: "Measures the velocity and intensity of investor demand signals — search frequency, engagement depth, repeat visits, and conversion intent strength.",
    formula: "DAI = (Search Volume Growth × 0.20) + (Session Depth × 0.20) + (Repeat Visit Rate × 0.20) + (Watchlist Growth × 0.20) + (Deal Unlock Rate × 0.20)",
    metrics: [
      { label: "Search Volume Growth", value: "+22% WoW", trend: "up", trendValue: "Accelerating", weight: 20, status: "healthy" },
      { label: "Avg Session Depth", value: "4.8 pages", trend: "up", trendValue: "+0.6 pages WoW", weight: 20, status: "healthy" },
      { label: "7-Day Repeat Visit Rate", value: "41%", trend: "up", trendValue: "+3pp WoW", weight: 20, status: "healthy" },
      { label: "Watchlist Growth Rate", value: "+15%/week", trend: "down", trendValue: "Was +19% last week", weight: 20, status: "warning" },
      { label: "Deal Unlock Conversion", value: "8.2%", trend: "up", trendValue: "+1.1pp WoW", weight: 20, status: "healthy" },
    ],
    alerts: [
      { threshold: "DAI < 55", condition: "Demand contraction — investor confidence declining", severity: "critical" },
      { threshold: "Repeat visit rate drops below 30%", condition: "Engagement decay — content or UX quality issue", severity: "warning" },
      { threshold: "Search volume declines >15% for 3+ consecutive days", condition: "Traffic quality deterioration — check acquisition channels", severity: "critical" },
      { threshold: "Watchlist growth turns negative", condition: "Interest evaporation — review listing quality and pricing", severity: "warning" },
    ],
    controlActions: [
      { trigger: "DAI drops below 65", action: "Launch AI-curated 'Weekly Hot Deals' push to all registered investors", expectedImpact: "+30% session starts within 48hrs" },
      { trigger: "Repeat visit rate declines 3 consecutive weeks", action: "Deploy new deal discovery features — smart recommendations, map explorer updates", expectedImpact: "+5pp repeat rate within 14 days" },
      { trigger: "Deal unlock rate below 5%", action: "A/B test unlock pricing and bundling — reduce friction to first conversion", expectedImpact: "+2-3pp unlock rate within 7 days" },
    ],
  },
  {
    id: "monetization",
    title: "Monetization Efficiency Score",
    icon: <Target className="h-5 w-5" />,
    score: 64,
    description: "Tracks revenue extraction efficiency from marketplace activity — how effectively platform interactions convert into paid actions, subscriptions, and premium features.",
    formula: "MES = (ARPU Growth × 0.25) + (Conversion Rate × 0.25) + (Revenue/Inquiry × 0.20) + (Subscription Retention × 0.15) + (Upsell Rate × 0.15)",
    metrics: [
      { label: "ARPU (Monthly)", value: "Rp 48K", trend: "up", trendValue: "+12% MoM", weight: 25, status: "healthy" },
      { label: "Free-to-Paid Conversion", value: "6.8%", trend: "down", trendValue: "-0.4pp WoW", weight: 25, status: "warning" },
      { label: "Revenue per Inquiry", value: "Rp 3,200", trend: "up", trendValue: "+8% WoW", weight: 20, status: "healthy" },
      { label: "Subscription Retention (90d)", value: "74%", trend: "flat", trendValue: "Stable", weight: 15, status: "warning" },
      { label: "Premium Upsell Rate", value: "11.5%", trend: "up", trendValue: "+2.3pp MoM", weight: 15, status: "healthy" },
    ],
    alerts: [
      { threshold: "MES < 50", condition: "Monetization failure — revenue model not capturing platform value", severity: "critical" },
      { threshold: "Free-to-paid conversion below 5%", condition: "Conversion friction — paywall or pricing misalignment", severity: "critical" },
      { threshold: "ARPU declining 2+ consecutive months", condition: "Revenue dilution — review pricing tiers and feature gating", severity: "warning" },
      { threshold: "Subscription retention below 70%", condition: "Value perception gap — premium features not delivering ROI", severity: "warning" },
    ],
    controlActions: [
      { trigger: "MES drops below 55", action: "Activate pricing psychology experiments — anchoring, charm pricing, urgency timers", expectedImpact: "+8-15% conversion within 21 days" },
      { trigger: "Conversion rate below 5% for 14 days", action: "Launch limited-time trial upgrade with auto-convert — reduce first-payment friction", expectedImpact: "+3pp conversion within 14 days" },
      { trigger: "ARPU stagnates for 30+ days", action: "Deploy tiered value-add bundles (AI reports + priority viewing) to increase basket size", expectedImpact: "+18% ARPU within 30 days" },
    ],
  },
  {
    id: "defensibility",
    title: "Network Defensibility Indicator",
    icon: <Shield className="h-5 w-5" />,
    score: 81,
    description: "Measures the strength of marketplace network effects, switching costs, and data moat — the structural barriers that protect against competitive displacement.",
    formula: "NDI = (Data Moat Depth × 0.25) + (Cross-Side Network × 0.25) + (Vendor Lock-In × 0.20) + (Investor Stickiness × 0.20) + (Intelligence Advantage × 0.10)",
    metrics: [
      { label: "Proprietary Data Points", value: "2.4M+", trend: "up", trendValue: "+180K/month", weight: 25, status: "healthy" },
      { label: "Cross-Side Density", value: "7.2 investors/listing", trend: "up", trendValue: "+0.8 WoW", weight: 25, status: "healthy" },
      { label: "Vendor 90-Day Retention", value: "87%", trend: "up", trendValue: "+1.2pp MoM", weight: 20, status: "healthy" },
      { label: "Investor Multi-Action Rate", value: "62%", trend: "up", trendValue: "+4pp MoM", weight: 20, status: "healthy" },
      { label: "AI Prediction Accuracy", value: "84%", trend: "up", trendValue: "+2pp MoM", weight: 10, status: "healthy" },
    ],
    alerts: [
      { threshold: "NDI < 60", condition: "Defensibility erosion — competitive vulnerability increasing", severity: "critical" },
      { threshold: "Cross-side density below 4 investors/listing", condition: "Network thinning — marketplace approaching illiquidity", severity: "critical" },
      { threshold: "Vendor retention drops below 80%", condition: "Supply leakage — vendor value proposition weakening", severity: "warning" },
      { threshold: "AI accuracy declines >5pp in 30 days", condition: "Intelligence degradation — model retraining required", severity: "warning" },
    ],
    controlActions: [
      { trigger: "NDI drops below 70", action: "Accelerate proprietary data acquisition — add 3 new signal sources within 30 days", expectedImpact: "+5 NDI points within 45 days" },
      { trigger: "Vendor retention below 82%", action: "Deploy vendor success program — dedicated account management for top 20% vendors", expectedImpact: "+4pp retention within 60 days" },
      { trigger: "Cross-side density below 5", action: "Investor acquisition blitz — referral incentives + content marketing push", expectedImpact: "+1.5 investors/listing within 30 days" },
    ],
  },
];

const executiveSummary = {
  overallScore: 74,
  status: "Expanding" as const,
  topSignal: "Demand acceleration outpacing supply — prioritize vendor acquisition",
  riskSignal: "Monetization conversion softening — pricing experiment recommended",
};

/* ───────── component ───────── */

const DominationKPIControl: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>("liquidity");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const overallColor = executiveSummary.overallScore >= 75 ? "text-chart-3" : executiveSummary.overallScore >= 55 ? "text-chart-4" : "text-chart-1";

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Domination KPI Control"
        description="Real-time marketplace domination signals — liquidity, demand, monetization & network defensibility with automated control actions"
        icon={Gauge}
        badge={{ text: "⚡ Command", variant: "outline" }}
      />

      {/* Executive Summary Strip */}
      <Card className="border-border overflow-hidden">
        <div className={cn("h-1 bg-gradient-to-r", executiveSummary.overallScore >= 75 ? "from-chart-3/60 via-chart-3/30 to-chart-3/60" : "from-chart-4/60 via-chart-4/30 to-chart-4/60")} />
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4 items-center">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Domination Score</p>
              <p className={cn("text-4xl font-bold", overallColor)}>{executiveSummary.overallScore}<span className="text-lg">/100</span></p>
            </div>
            {indices.map(idx => {
              const color = idx.score >= 75 ? "text-chart-3" : idx.score >= 55 ? "text-chart-4" : "text-chart-1";
              return (
                <div key={idx.id} className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(idx.id)}>
                  <div className="h-8 w-8 rounded-[6px] bg-primary/10 flex items-center justify-center">{idx.icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground truncate">{idx.title.replace(" Index", "").replace(" Score", "").replace(" Indicator", "")}</p>
                    <p className={cn("text-xl font-bold", color)}>{idx.score}</p>
                  </div>
                  <Progress value={idx.score} className="h-1.5 w-16 shrink-0" />
                </div>
              );
            })}
          </div>
          <div className="grid md:grid-cols-2 gap-2 mt-4">
            <div className="flex items-start gap-2 bg-chart-3/5 rounded-[6px] p-2 border border-chart-3/20">
              <ArrowUpRight className="h-3.5 w-3.5 text-chart-3 mt-0.5 shrink-0" />
              <p className="text-[11px] text-foreground">{executiveSummary.topSignal}</p>
            </div>
            <div className="flex items-start gap-2 bg-chart-4/5 rounded-[6px] p-2 border border-chart-4/20">
              <AlertTriangle className="h-3.5 w-3.5 text-chart-4 mt-0.5 shrink-0" />
              <p className="text-[11px] text-foreground">{executiveSummary.riskSignal}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Index Detail Cards */}
      {indices.map(index => {
        const scoreColor = index.score >= 75 ? "text-chart-3" : index.score >= 55 ? "text-chart-4" : "text-chart-1";
        return (
          <Card key={index.id} className="border-border overflow-hidden">
            <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(prev => prev === index.id ? null : index.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{index.icon}</div>
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                      {index.title}
                      <span className={cn("text-lg font-bold", scoreColor)}>{index.score}/100</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{index.description}</p>
                  </div>
                </div>
                {expanded === index.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardHeader>

            {expanded === index.id && (
              <CardContent className="pt-0 space-y-4">
                {/* Formula */}
                <div className="bg-muted/30 rounded-[6px] p-3 group">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Calculation Formula</p>
                  <p className="text-xs font-mono text-foreground">{index.formula}</p>
                  <div className="flex justify-end mt-1">
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100" onClick={() => copy(index.formula, `${index.id}-formula`)}>
                      {copiedId === `${index.id}-formula` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="metrics" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="metrics" className="text-xs">Live Metrics</TabsTrigger>
                    <TabsTrigger value="alerts" className="text-xs">Alert Thresholds</TabsTrigger>
                    <TabsTrigger value="actions" className="text-xs">Control Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="metrics" className="space-y-2 mt-3">
                    {index.metrics.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-[6px] p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{m.label}</p>
                        </div>
                        <span className="text-sm font-bold text-foreground shrink-0">{m.value}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {m.trend === "up" ? <ArrowUpRight className="h-3 w-3 text-chart-3" /> : m.trend === "down" ? <ArrowDownRight className="h-3 w-3 text-chart-1" /> : <Activity className="h-3 w-3 text-muted-foreground" />}
                          <span className="text-[10px] text-muted-foreground">{m.trendValue}</span>
                        </div>
                        <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", statusColors[m.status])}>{m.status}</Badge>
                        <div className="flex items-center gap-1 shrink-0">
                          <Progress value={m.weight} className="h-1 w-8" />
                          <span className="text-[9px] text-muted-foreground">{m.weight}%</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="alerts" className="space-y-2 mt-3">
                    {index.alerts.map((alert, i) => (
                      <div key={i} className={cn("rounded-[6px] border p-3 space-y-1", severityColors[alert.severity])}>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px]">{alert.threshold}</Badge>
                          <Badge variant="outline" className="text-[9px] uppercase">{alert.severity}</Badge>
                        </div>
                        <p className="text-xs opacity-80">{alert.condition}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-2 mt-3">
                    {index.controlActions.map((ca, i) => (
                      <div key={i} className="rounded-[6px] border border-border p-3 space-y-2 group">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge variant="outline" className="text-[10px] mb-1.5">{ca.trigger}</Badge>
                            <p className="text-sm font-medium text-foreground">{ca.action}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => copy(ca.action, `${index.id}-action-${i}`)}>
                            {copiedId === `${index.id}-action-${i}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-[11px] text-muted-foreground">{ca.expectedImpact}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Drill-Down Hierarchy */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Analytics Drill-Down Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { level: "L1 — Executive", desc: "4 domination indices + overall score. Single-glance marketplace health. Updated every 5 minutes.", items: ["Overall Domination Score", "Index trend sparklines", "Top signal / risk signal"] },
              { level: "L2 — Operational", desc: "20 component metrics with weights, trends, and status flags. Enables tactical decision-making.", items: ["Per-metric trend charts", "Weight contribution bars", "Alert threshold proximity"] },
              { level: "L3 — Diagnostic", desc: "Raw event-level data for root cause analysis. District-level breakdowns and cohort segmentation.", items: ["District-level heatmaps", "Cohort conversion funnels", "Signal event timeline"] },
            ].map((level, i) => (
              <div key={i} className="rounded-[6px] border border-border bg-card p-3 space-y-2">
                <span className="text-sm font-semibold text-foreground">{level.level}</span>
                <p className="text-[11px] text-muted-foreground">{level.desc}</p>
                <div className="space-y-1 pt-1 border-t border-border/50">
                  {level.items.map((item, j) => (
                    <p key={j} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>{item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DominationKPIControl;
