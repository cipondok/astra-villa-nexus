import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Landmark, Briefcase, BarChart3, Shield, Users, TrendingUp,
  Building2, Globe, FileText, CheckCircle, ArrowRight, Target,
  Layers, DollarSign, Lock, Activity, Eye, Zap, Scale, PieChart
} from "lucide-react";

const GATEWAY_MODULES = [
  {
    title: "Portfolio Builder",
    icon: Briefcase,
    accent: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    description: "Bulk acquisition planning with diversification analytics across cities, asset classes, and yield profiles.",
    capabilities: [
      "Multi-city portfolio construction with HHI concentration limits",
      "Asset class allocation optimizer (residential, commercial, mixed-use)",
      "Monte Carlo yield simulation for 5-25 year horizons",
      "Bulk LOI generation and pipeline tracking",
    ],
    metrics: [
      { label: "Max Portfolio Size", value: "500+ assets" },
      { label: "Diversification Models", value: "4 strategies" },
      { label: "Simulation Scenarios", value: "10,000 runs" },
    ],
  },
  {
    title: "Liquidity Intelligence",
    icon: Activity,
    accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    description: "District-level liquidity indices, absorption analytics, and predictive pricing for institutional decision-making.",
    capabilities: [
      "Real-time liquidity index across 12 Indonesian cities",
      "Price trend forecasting with 94.7% historical accuracy",
      "Absorption rate tracking by district and property type",
      "Capital flow heatmaps and rotation signal detection",
    ],
    metrics: [
      { label: "Data Points", value: "2.4M+" },
      { label: "Update Frequency", value: "Real-time" },
      { label: "Forecast Window", value: "3-36 months" },
    ],
  },
  {
    title: "Deal Execution",
    icon: Scale,
    accent: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    description: "Dedicated institutional pipeline with escrow coordination, legal workflows, and transaction tracking dashboards.",
    capabilities: [
      "White-glove deal pipeline with priority matching",
      "Integrated escrow and legal document coordination",
      "7-stage deal state machine with institutional SLAs",
      "Real-time transaction reporting and audit trails",
    ],
    metrics: [
      { label: "Avg Close Speed", value: "40% faster" },
      { label: "Deal Stages", value: "7 automated" },
      { label: "Commission Rate", value: "0.5-1.5%" },
    ],
  },
  {
    title: "Relationship Management",
    icon: Users,
    accent: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
    description: "Institutional onboarding, account tiering, KYC verification, and periodic performance reporting.",
    capabilities: [
      "Tiered access: Explorer → Professional → Institutional → Strategic",
      "Enhanced KYC/AML verification with document OCR",
      "Quarterly portfolio performance reports with benchmarks",
      "Dedicated relationship manager assignment",
    ],
    metrics: [
      { label: "Onboarding Time", value: "< 48 hours" },
      { label: "Account Tiers", value: "4 levels" },
      { label: "Report Cadence", value: "Monthly/Quarterly" },
    ],
  },
];

const ONBOARDING_STEPS = [
  { step: 1, title: "Registration & NDA", description: "Institutional entity registration with NDA execution and preliminary interest declaration", icon: FileText, duration: "Day 1" },
  { step: 2, title: "KYC/AML Verification", description: "Enhanced due diligence — entity documents, beneficial ownership, source of funds verification", icon: Shield, duration: "Day 1-3" },
  { step: 3, title: "Tier Classification", description: "Capital commitment assessment, investment mandate review, and access tier assignment", icon: Layers, duration: "Day 3-5" },
  { step: 4, title: "Platform Onboarding", description: "API credentials, dashboard access, RM assignment, and intelligence feed activation", icon: Zap, duration: "Day 5-7" },
  { step: 5, title: "Portfolio Strategy Session", description: "Dedicated strategy call with market intelligence briefing and allocation recommendations", icon: Target, duration: "Day 7-10" },
  { step: 6, title: "Deal Pipeline Activation", description: "Curated deal flow based on mandate, first LOI facilitation, and ongoing intelligence delivery", icon: CheckCircle, duration: "Day 10+" },
];

const REVENUE_STREAMS = [
  { stream: "Intelligence Subscription", tiers: ["Pro: Rp 2.5M/mo", "Institutional: Rp 15M/mo", "Strategic: Rp 50M/mo"], share: 35 },
  { stream: "Transaction Facilitation", tiers: ["0.5% standard", "1.0% full-service", "1.5% white-glove"], share: 40 },
  { stream: "Data API Licensing", tiers: ["Basic: $500/mo", "Professional: $2,500/mo", "Enterprise: Custom"], share: 15 },
  { stream: "Advisory & Reports", tiers: ["Market Reports: Rp 5M", "Custom Analysis: Rp 25M", "Retainer: Rp 75M/qtr"], share: 10 },
];

const ROLLOUT_PHASES = [
  { phase: "Phase 1: Foundation", timeline: "Month 1-3", progress: 60, items: ["Institutional registration portal", "Enhanced KYC pipeline", "Tier classification engine", "Basic portfolio analytics"] },
  { phase: "Phase 2: Intelligence", timeline: "Month 4-6", progress: 25, items: ["Liquidity index API access", "Price forecasting dashboards", "Absorption rate analytics", "Capital flow heatmaps"] },
  { phase: "Phase 3: Execution", timeline: "Month 7-9", progress: 5, items: ["Dedicated deal pipeline", "Escrow coordination interface", "Transaction reporting", "SLA monitoring"] },
  { phase: "Phase 4: Scale", timeline: "Month 10-12", progress: 0, items: ["Cross-border investor onboarding", "Multi-currency support", "Syndication facilitation", "Secondary market access"] },
];

export default function InstitutionalCapitalGatewayPanel() {
  const [activeTab, setActiveTab] = useState("modules");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Landmark className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Institutional Capital Gateway</h2>
            <p className="text-sm text-muted-foreground">Enterprise-grade capital allocation infrastructure for institutional real estate investment</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs">
          <Lock className="h-3 w-3" />
          Institutional Access
        </Badge>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Institutions", value: "—", icon: Building2, note: "Onboarding open" },
          { label: "Capital Pipeline", value: "—", icon: DollarSign, note: "Pre-launch" },
          { label: "Intelligence Coverage", value: "12 Cities", icon: Globe, note: "Indonesia-wide" },
          { label: "Deal Velocity", value: "40% faster", icon: TrendingUp, note: "vs. traditional" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                <p className="text-[9px] text-muted-foreground/70">{s.note}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="modules" className="text-xs">Gateway Modules</TabsTrigger>
          <TabsTrigger value="onboarding" className="text-xs">Onboarding Flow</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs">Monetization</TabsTrigger>
          <TabsTrigger value="rollout" className="text-xs">Rollout Plan</TabsTrigger>
        </TabsList>

        {/* Gateway Modules */}
        <TabsContent value="modules" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {GATEWAY_MODULES.map((mod) => (
              <Card key={mod.title}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${mod.accent}`}>
                      <mod.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-semibold">{mod.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                  <Separator />
                  <div className="space-y-1.5">
                    {mod.capabilities.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2">
                    {mod.metrics.map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="text-xs font-bold">{m.value}</p>
                        <p className="text-[9px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onboarding Flow */}
        <TabsContent value="onboarding" className="space-y-4 mt-4">
          <div className="space-y-3">
            {ONBOARDING_STEPS.map((s, i) => (
              <Card key={s.step}>
                <CardContent className="py-3.5 flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${i < 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-medium">{s.duration}</span>
                  </div>
                  {i < ONBOARDING_STEPS.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0 hidden md:block" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                  <Badge variant={i < 2 ? "default" : "outline"} className="text-[9px] h-5 flex-shrink-0">
                    Step {s.step}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monetization */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REVENUE_STREAMS.map((r) => (
              <Card key={r.stream}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{r.stream}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{r.share}% of revenue</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={r.share} className="h-1.5 flex-1" />
                  </div>
                  {r.tiers.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-muted-foreground/40" : i === 1 ? "bg-primary/60" : "bg-primary"}`} />
                      <span>{t}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Mix Chart Placeholder */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Projected Revenue Mix — Year 1</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {REVENUE_STREAMS.map((r) => (
                  <div key={r.stream} className="flex items-center gap-2">
                    <div className="h-8 rounded bg-primary/20 flex items-center justify-center px-3">
                      <span className="text-xs font-bold">{r.share}%</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{r.stream}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rollout Plan */}
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
                      <CheckCircle className={`h-3 w-3 flex-shrink-0 ${p.progress > 30 ? "text-emerald-500" : "text-muted-foreground/30"}`} />
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
