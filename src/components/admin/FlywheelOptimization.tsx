import React, { useState, useMemo } from "react";
import { RefreshCw, TrendingUp, AlertTriangle, Zap, ChevronDown, ChevronUp, ArrowRight, Target, Users, DollarSign, Brain, Award, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── types ───────── */

interface FlywheelStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  healthScore: number;
  levers: { name: string; tactic: string; impact: number; effort: number }[];
  kpis: { metric: string; current: string; target: string }[];
  bottlenecks: string[];
}

interface PhaseAction {
  phase: string;
  timeline: string;
  badge: "default" | "secondary" | "destructive";
  actions: { action: string; stage: string; priority: "P0" | "P1" | "P2" }[];
}

/* ───────── data ───────── */

const buildStages = (listings: number, inquiryVel: number, vendorPart: number, monetConv: number, retention: number): FlywheelStage[] => [
  {
    id: "supply", label: "Supply Acquisition", icon: <Building2 className="h-5 w-5" />, color: "text-primary",
    description: "Vendor onboarding momentum — getting quality listings onto the platform at increasing velocity",
    healthScore: Math.min(100, Math.round(listings / 50 + vendorPart * 0.8)),
    levers: [
      { name: "Vendor blitz outreach", tactic: "Dedicated city-level vendor acquisition team executing 50 contacts/day with pre-built pitch scripts", impact: 90, effort: 60 },
      { name: "'List Free for 90 Days' campaign", tactic: "Zero-risk onboarding removes objection barrier — convert 30% to paid after free period expires", impact: 85, effort: 25 },
      { name: "Developer partnership pipeline", tactic: "Bulk inventory injection from developer pre-launch agreements — 200-500 units per partnership", impact: 92, effort: 70 },
      { name: "Agent referral incentive", tactic: "Rp 500K reward per verified agent referral that lists 3+ properties within 14 days", impact: 72, effort: 30 },
    ],
    kpis: [
      { metric: "New listings/week", current: `${Math.round(listings * 0.08)}`, target: `${Math.round(listings * 0.15)}` },
      { metric: "Vendor activation rate", current: `${vendorPart}%`, target: "75%" },
      { metric: "Avg listing quality score", current: "62", target: "80" },
    ],
    bottlenecks: [
      "Vendor onboarding friction — too many steps between signup and first listing",
      "Low listing quality reduces investor engagement, creating negative feedback loop",
      "Vendor inactivity after initial listing — no re-engagement automation",
    ],
  },
  {
    id: "quality", label: "Listing Quality & Visibility", icon: <Award className="h-5 w-5" />, color: "text-chart-2",
    description: "Ensuring every listing is investment-grade — complete data, professional imagery, accurate pricing",
    healthScore: Math.min(100, Math.round(55 + vendorPart * 0.3 + listings * 0.005)),
    levers: [
      { name: "AI listing quality scorer", tactic: "Real-time LQS feedback during listing creation — flag missing photos, incomplete data, unrealistic pricing", impact: 88, effort: 55 },
      { name: "Professional photo service", tactic: "Free photography for top 20% listings — creates quality benchmark that lifts platform perception", impact: 82, effort: 65 },
      { name: "Price vs FMV validation", tactic: "AI-powered fair market value check prevents overpriced listings that damage marketplace credibility", impact: 86, effort: 50 },
      { name: "Featured listing rotation", tactic: "Algorithmic rotation of quality listings to homepage — rewards quality with visibility, creating virtuous cycle", impact: 75, effort: 20 },
    ],
    kpis: [
      { metric: "Avg LQS score", current: "62", target: "82" },
      { metric: "Listings with 5+ photos", current: "38%", target: "75%" },
      { metric: "Price accuracy (vs FMV)", current: "±18%", target: "±8%" },
    ],
    bottlenecks: [
      "Vendors upload minimum-effort listings with 1-2 photos and incomplete descriptions",
      "No feedback mechanism tells vendors their listing underperforms vs. competitors",
    ],
  },
  {
    id: "demand", label: "Investor Demand Attraction", icon: <Users className="h-5 w-5" />, color: "text-chart-3",
    description: "Attracting and engaging serious property investors through intelligence-driven discovery",
    healthScore: Math.min(100, Math.round(inquiryVel * 1.2 + retention * 0.5)),
    levers: [
      { name: "AI-personalized digest", tactic: "Weekly email with DNA-matched properties — drives 35% higher return visit rate than generic newsletters", impact: 87, effort: 50 },
      { name: "District intelligence reports", tactic: "Gated market reports generate registrations — 50% signup lift with content-driven acquisition", impact: 84, effort: 40 },
      { name: "Social proof urgency", tactic: "'12 investors viewed this week' badges increase inquiry rate by 22% through competitive psychology", impact: 78, effort: 15 },
      { name: "Retargeting lookalike campaign", tactic: "Meta/Google lookalike audiences from top 10% engaged investors — CAC reduction of 40%", impact: 80, effort: 45 },
    ],
    kpis: [
      { metric: "Daily inquiry velocity", current: `${inquiryVel}`, target: `${Math.round(inquiryVel * 1.8)}` },
      { metric: "Investor WAU", current: "—", target: "+60%" },
      { metric: "Session depth (pages)", current: "3.2", target: "6.5" },
    ],
    bottlenecks: [
      "Traffic quality mixed — many casual browsers, not serious investors",
      "Inquiry-to-viewing conversion low due to delayed agent response",
    ],
  },
  {
    id: "monetization", label: "Transaction & Monetization", icon: <DollarSign className="h-5 w-5" />, color: "text-chart-4",
    description: "Converting marketplace activity into revenue through commissions, subscriptions, and premium features",
    healthScore: Math.min(100, Math.round(monetConv * 2.5 + inquiryVel * 0.3)),
    levers: [
      { name: "Urgency countdown on boosts", tactic: "48h limited-time pricing on premium slots increases purchase conversion by 25%", impact: 82, effort: 10 },
      { name: "Subscription bundle experiment", tactic: "Combine listing boost + analytics + priority support at 20% discount vs. à la carte — increases ARPU 40%", impact: 88, effort: 35 },
      { name: "Embedded mortgage pre-qual", tactic: "Financing widget at inquiry point increases transaction completion by 35% and creates bank referral revenue", impact: 90, effort: 70 },
      { name: "Dynamic surge pricing", tactic: "Higher boost prices in high-demand districts — demand-based pricing increases boost ARPU by 30%", impact: 78, effort: 55 },
    ],
    kpis: [
      { metric: "Monetization conversion", current: `${monetConv}%`, target: `${Math.min(15, monetConv + 5)}%` },
      { metric: "ARPU (paying users)", current: "Rp 1.2M", target: "Rp 2.8M" },
      { metric: "Revenue per listing", current: "Rp 85K", target: "Rp 220K" },
    ],
    bottlenecks: [
      "Free tier too generous — insufficient motivation to upgrade",
      "Premium value proposition unclear — vendors don't see ROI of boost",
    ],
  },
  {
    id: "intelligence", label: "Data Intelligence Learning", icon: <Brain className="h-5 w-5" />, color: "text-chart-5",
    description: "Every interaction generates intelligence that makes predictions more accurate and recommendations more relevant",
    healthScore: Math.min(100, Math.round(40 + listings * 0.01 + inquiryVel * 0.5 + retention * 0.3)),
    levers: [
      { name: "Behavioral signal capture", tactic: "Track search patterns, dwell time, and comparison behavior to build investor DNA profiles", impact: 92, effort: 60 },
      { name: "Prediction accuracy loop", tactic: "Compare AI price predictions to actual sale prices — recalibrate models weekly for improving accuracy", impact: 95, effort: 70 },
      { name: "Liquidity signal pipeline", tactic: "Real-time viewing/offer/escrow events feed district liquidity scoring — compounds with every transaction", impact: 90, effort: 65 },
      { name: "Recommendation feedback", tactic: "Track which AI-recommended properties get inquired vs. ignored — reinforcement learning improves match quality 15%/month", impact: 88, effort: 50 },
    ],
    kpis: [
      { metric: "Prediction accuracy", current: "72%", target: "90%" },
      { metric: "Recommendation CTR", current: "4.2%", target: "12%" },
      { metric: "Data points/listing", current: "18", target: "50+" },
    ],
    bottlenecks: [
      "Insufficient transaction volume for statistically significant model training",
      "Data silos between marketplace events and intelligence pipeline",
    ],
  },
  {
    id: "authority", label: "Brand Authority Feedback", icon: <Award className="h-5 w-5" />, color: "text-primary",
    description: "Market perception reinforcement — success stories, media coverage, and word-of-mouth create organic growth loop",
    healthScore: Math.min(100, Math.round(30 + retention * 0.8 + vendorPart * 0.2)),
    levers: [
      { name: "Success story automation", tactic: "Auto-generate case studies from completed transactions — publish weekly for social proof", impact: 80, effort: 30 },
      { name: "Vendor performance showcase", tactic: "Top vendor leaderboard creates competitive quality and public credibility signal", impact: 75, effort: 25 },
      { name: "PR intelligence reports", tactic: "Monthly city-level market insight publications position platform as authoritative data source", impact: 85, effort: 45 },
      { name: "Investor community loop", tactic: "Social network features turn satisfied investors into advocates — 2.3x referral multiplier", impact: 88, effort: 55 },
    ],
    kpis: [
      { metric: "NPS score", current: "42", target: "65" },
      { metric: "Organic traffic share", current: "28%", target: "55%" },
      { metric: "Referral-driven signups", current: "12%", target: "30%" },
    ],
    bottlenecks: [
      "No systematic process for capturing and distributing success stories",
      "Brand perception still 'startup' rather than 'infrastructure'",
    ],
  },
];

const phases: PhaseAction[] = [
  {
    phase: "Phase 1 — Friction Removal", timeline: "0-4 weeks", badge: "default",
    actions: [
      { action: "Simplify vendor onboarding to 3-step flow", stage: "Supply", priority: "P0" },
      { action: "Deploy AI listing quality scorer with real-time feedback", stage: "Quality", priority: "P0" },
      { action: "Add urgency countdown on premium boost purchases", stage: "Monetization", priority: "P0" },
      { action: "Implement WhatsApp deep-link on inquiry CTA", stage: "Demand", priority: "P0" },
      { action: "Launch social proof badges on high-engagement listings", stage: "Demand", priority: "P1" },
    ],
  },
  {
    phase: "Phase 2 — Growth Acceleration", timeline: "4-12 weeks", badge: "secondary",
    actions: [
      { action: "Execute vendor blitz outreach in top 3 districts", stage: "Supply", priority: "P0" },
      { action: "Launch AI-personalized weekly digest emails", stage: "Demand", priority: "P1" },
      { action: "Deploy subscription bundle experiment", stage: "Monetization", priority: "P1" },
      { action: "Activate behavioral signal capture pipeline", stage: "Intelligence", priority: "P1" },
      { action: "Publish first monthly market intelligence report", stage: "Authority", priority: "P1" },
      { action: "Launch vendor performance leaderboard", stage: "Authority", priority: "P2" },
    ],
  },
  {
    phase: "Phase 3 — Flywheel Compounding", timeline: "12-24 weeks", badge: "destructive",
    actions: [
      { action: "Integrate embedded mortgage pre-qualification", stage: "Monetization", priority: "P1" },
      { action: "Deploy prediction accuracy feedback loop", stage: "Intelligence", priority: "P1" },
      { action: "Launch investor referral reward program", stage: "Authority", priority: "P1" },
      { action: "Activate dynamic surge pricing for boosts", stage: "Monetization", priority: "P2" },
      { action: "Scale developer partnership pipeline", stage: "Supply", priority: "P1" },
    ],
  },
];

/* ───────── component ───────── */

const FlywheelOptimization: React.FC = () => {
  const [listings, setListings] = useState(2500);
  const [inquiryVel, setInquiryVel] = useState(45);
  const [vendorPart, setVendorPart] = useState(55);
  const [monetConv, setMonetConv] = useState(4);
  const [retention, setRetention] = useState(38);
  const [expandedStage, setExpandedStage] = useState<string | null>("supply");

  const stages = useMemo(() => buildStages(listings, inquiryVel, vendorPart, monetConv, retention), [listings, inquiryVel, vendorPart, monetConv, retention]);
  const avgHealth = Math.round(stages.reduce((s, st) => s + st.healthScore, 0) / stages.length);
  const weakest = [...stages].sort((a, b) => a.healthScore - b.healthScore)[0];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Flywheel Optimization Engine"
        description="6-stage marketplace flywheel — supply, quality, demand, monetization, intelligence & authority with bottleneck detection"
        icon={RefreshCw}
        badge={{ text: "⚙️ Flywheel", variant: "outline" }}
      />

      {/* Input sliders */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Platform Health Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {[
            { label: "Live Listings", value: listings, set: setListings, min: 100, max: 20000, step: 100, fmt: (v: number) => v.toLocaleString() },
            { label: "Daily Inquiry Velocity", value: inquiryVel, set: setInquiryVel, min: 5, max: 200, step: 5, fmt: (v: number) => `${v}/day` },
            { label: "Vendor Participation %", value: vendorPart, set: setVendorPart, min: 10, max: 95, step: 5, fmt: (v: number) => `${v}%` },
            { label: "Monetization Conv %", value: monetConv, set: setMonetConv, min: 1, max: 20, step: 0.5, fmt: (v: number) => `${v}%` },
            { label: "7-Day Retention %", value: retention, set: setRetention, min: 10, max: 80, step: 2, fmt: (v: number) => `${v}%` },
          ].map(s => (
            <div key={s.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
                <span className="text-xs font-bold text-foreground">{s.fmt(s.value)}</span>
              </div>
              <Slider value={[s.value]} onValueChange={v => s.set(v[0])} min={s.min} max={s.max} step={s.step} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Health overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border"><CardContent className="p-3 text-center">
          <RefreshCw className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{avgHealth}</p>
          <p className="text-[10px] text-muted-foreground">Overall Flywheel Health</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{weakest.label}</p>
          <p className="text-[10px] text-muted-foreground">Weakest Stage ({weakest.healthScore})</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-foreground">{stages.reduce((s, st) => s + st.levers.length, 0)}</p>
          <p className="text-[10px] text-muted-foreground">Optimization Levers</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-4" />
          <p className="text-xl font-bold text-foreground">{stages.reduce((s, st) => s + st.bottlenecks.length, 0)}</p>
          <p className="text-[10px] text-muted-foreground">Bottlenecks Detected</p>
        </CardContent></Card>
      </div>

      {/* Flywheel visual ring */}
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Flywheel Stage Health</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center flex-wrap gap-2">
            {stages.map((st, i) => (
              <React.Fragment key={st.id}>
                <div
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all min-w-[120px]",
                    expandedStage === st.id ? "ring-2 ring-primary/40 border-primary/30 bg-primary/5" : "border-border/40 bg-muted/20 hover:bg-muted/40"
                  )}
                  onClick={() => setExpandedStage(expandedStage === st.id ? null : st.id)}
                >
                  <div className={cn("mb-1", st.color)}>{st.icon}</div>
                  <span className="text-[10px] font-semibold text-foreground text-center">{st.label}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Progress value={st.healthScore} className="h-1.5 w-12" />
                    <span className={cn("text-[10px] font-bold", st.healthScore >= 70 ? "text-chart-2" : st.healthScore >= 45 ? "text-chart-4" : "text-destructive")}>{st.healthScore}</span>
                  </div>
                </div>
                {i < stages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden md:block" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stages" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="stages" className="text-xs">Stage Deep Dive</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Execution Roadmap</TabsTrigger>
          <TabsTrigger value="bottlenecks" className="text-xs">Bottleneck Map</TabsTrigger>
        </TabsList>

        {/* Stage deep dive */}
        <TabsContent value="stages" className="space-y-3 mt-4">
          {stages.filter(st => !expandedStage || st.id === expandedStage).map(st => (
            <Card key={st.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={st.color}>{st.icon}</div>
                    <CardTitle className="text-sm">{st.label}</CardTitle>
                    <Badge variant={st.healthScore >= 70 ? "default" : st.healthScore >= 45 ? "secondary" : "destructive"} className="text-[9px]">
                      Health: {st.healthScore}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{st.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Levers */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Optimization Levers</span>
                  {st.levers.sort((a, b) => (b.impact - b.effort) - (a.impact - a.effort)).map((l, i) => (
                    <div key={i} className="bg-muted/20 rounded-[6px] p-3 border border-border/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{l.name}</span>
                        <Badge variant="secondary" className="text-[9px]">ROI: {l.impact - l.effort}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{l.tactic}</p>
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-muted-foreground w-10">Impact</span>
                          <Progress value={l.impact} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-bold text-chart-2">{l.impact}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-muted-foreground w-10">Effort</span>
                          <Progress value={l.effort} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-bold text-foreground">{l.effort}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* KPIs */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Success KPIs</span>
                  {st.kpis.map((k, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/20">
                      <span className="text-xs text-foreground">{k.metric}</span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-muted-foreground">{k.current}</span>
                        <ArrowRight className="h-3 w-3 text-chart-2" />
                        <span className="font-bold text-chart-2">{k.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {expandedStage && (
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => setExpandedStage(null)}>
              Show all stages
            </Button>
          )}
        </TabsContent>

        {/* Execution roadmap */}
        <TabsContent value="roadmap" className="space-y-4 mt-4">
          {phases.map((p, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{p.phase}</CardTitle>
                  <Badge variant={p.badge} className="text-[10px]">{p.timeline}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {p.actions.map((a, j) => (
                  <div key={j} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <Badge variant={a.priority === "P0" ? "default" : a.priority === "P1" ? "secondary" : "destructive"} className="text-[9px] w-8 justify-center shrink-0">
                      {a.priority}
                    </Badge>
                    <span className="text-xs text-foreground flex-1">{a.action}</span>
                    <Badge variant="secondary" className="text-[9px] shrink-0">{a.stage}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Bottleneck map */}
        <TabsContent value="bottlenecks" className="space-y-3 mt-4">
          {stages.map(st => (
            <Card key={st.id} className={cn("border-border", st.healthScore < 50 && "border-destructive/30")}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={st.color}>{st.icon}</div>
                  <CardTitle className="text-sm">{st.label}</CardTitle>
                  <Badge variant={st.healthScore < 50 ? "destructive" : "secondary"} className="text-[9px]">
                    {st.healthScore < 50 ? "⚠️ Critical" : "Monitored"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {st.bottlenecks.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground">{b}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlywheelOptimization;
