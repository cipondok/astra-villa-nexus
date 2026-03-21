import React, { useState } from "react";
import { Shield, Database, Users, TrendingUp, Layers, Lock, AlertTriangle, ChevronDown, ChevronUp, Zap, Globe, BarChart3, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ─── Moat Pillars ─── */

const moatPillars = [
  {
    id: "data-intelligence",
    title: "Data Intelligence Compounding",
    icon: Database,
    color: "text-primary",
    bg: "bg-primary/10",
    currentStrength: 72,
    targetStrength: 92,
    compoundingMechanism: "Every transaction, inquiry, and viewing generates behavioral data that improves prediction accuracy. Competitors starting today need 2+ years of transaction history to match current model precision. The advantage widens with each data cycle.",
    strategies: [
      { action: "Expand behavioral event capture to 25+ signal types", impact: "HIGH", effort: "LOW", timeline: "Month 1-2", detail: "Each new signal type improves model accuracy by 0.5-1.5%. Compound effect over 12 months = 8-15% accuracy advantage." },
      { action: "Build proprietary district-level pricing indices", impact: "HIGH", effort: "MEDIUM", timeline: "Month 2-4", detail: "No competitor has sub-district pricing data for Indonesian cities. First-mover data advantage becomes permanent reference standard." },
      { action: "Launch AI accuracy transparency reports", impact: "MEDIUM", effort: "LOW", timeline: "Month 3", detail: "Publishing prediction accuracy builds trust and signals data moat depth to investors and institutional partners." },
      { action: "Create cross-city intelligence transfer learning", impact: "HIGH", effort: "HIGH", timeline: "Month 4-8", detail: "Models trained on City 1 data accelerate City 2 predictions by 40%. Each new city strengthens every other city's intelligence." },
    ],
    weaknessSignals: ["Model accuracy stagnating for 2+ quarters", "Competitor publishing similar prediction capabilities", "Data ingestion pipeline gaps >24 hours"],
    imitationRisk: 35,
  },
  {
    id: "vendor-lockin",
    title: "Vendor Lock-In & Switching Cost",
    icon: Lock,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    currentStrength: 58,
    targetStrength: 85,
    compoundingMechanism: "Multi-service dependency creates exponential switching costs. When vendors use listing, CRM, lead management, analytics, and financing tools on one platform, migration becomes prohibitively expensive in time, data loss, and workflow disruption.",
    strategies: [
      { action: "Launch vendor CRM with lead history and pipeline tracking", impact: "HIGH", effort: "MEDIUM", timeline: "Month 1-3", detail: "Once agents store 6+ months of lead history, switching cost exceeds perceived benefit of any alternative." },
      { action: "Introduce vendor performance scoring with public badges", impact: "MEDIUM", effort: "LOW", timeline: "Month 2", detail: "Reputation portability is zero — top-rated vendors lose their credibility score if they leave. Social proof becomes a retention anchor." },
      { action: "Build exclusive inventory incentive program", impact: "HIGH", effort: "MEDIUM", timeline: "Month 3-5", detail: "Vendors listing exclusively get 3x visibility boost and priority lead routing. Creates supply-side network effect that attracts demand." },
      { action: "Deploy vendor analytics dashboard with ROI attribution", impact: "MEDIUM", effort: "MEDIUM", timeline: "Month 4-6", detail: "When vendors can see exactly how much revenue the platform generates for them, the switching conversation shifts from cost to value." },
    ],
    weaknessSignals: ["Vendor retention dropping below 80%", "Multi-platform listing rate exceeding 40%", "Vendor NPS declining 2+ consecutive quarters"],
    imitationRisk: 50,
  },
  {
    id: "investor-habits",
    title: "Investor Engagement Habit Formation",
    icon: Users,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    currentStrength: 65,
    targetStrength: 88,
    compoundingMechanism: "Habitual engagement creates psychological switching costs. When investors check the platform daily for market signals, receive personalized alerts, and build watchlists with months of curated data, the platform becomes their default decision-making environment.",
    strategies: [
      { action: "Implement daily market intelligence briefing (push/email)", impact: "HIGH", effort: "LOW", timeline: "Month 1", detail: "Morning briefing creates daily habit loop. Open rates >40% indicate habit formation. Target: 60% of active investors check daily." },
      { action: "Build investment portfolio tracker with performance alerts", impact: "HIGH", effort: "MEDIUM", timeline: "Month 2-4", detail: "Once investors track their portfolio on the platform, it becomes their financial command center. Migration means losing historical tracking." },
      { action: "Launch investor community with deal discussion threads", impact: "MEDIUM", effort: "MEDIUM", timeline: "Month 3-5", detail: "Social engagement creates belonging. Investors who participate in discussions are 3x less likely to churn than passive users." },
      { action: "Create personalized AI deal alerts with learning feedback", impact: "HIGH", effort: "LOW", timeline: "Month 1-2", detail: "Alerts that improve with feedback create a personalization moat. The longer an investor uses the system, the more accurate recommendations become." },
    ],
    weaknessSignals: ["Daily active investor ratio dropping below 15%", "Alert open rates declining below 30%", "Watchlist abandonment rate exceeding 25%"],
    imitationRisk: 40,
  },
  {
    id: "pricing-power",
    title: "Pricing Power Evolution",
    icon: TrendingUp,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    currentStrength: 45,
    targetStrength: 80,
    compoundingMechanism: "Pricing power increases as the platform becomes the default transaction venue. When vendors and investors can't achieve comparable results elsewhere, willingness-to-pay increases. Dynamic pricing based on demand signals maximizes revenue without volume loss.",
    strategies: [
      { action: "Implement value-based tiered pricing with ROI guarantees", impact: "HIGH", effort: "MEDIUM", timeline: "Month 2-4", detail: "Shift pricing conversation from cost to ROI. Vendors paying Rp 500K/month who generate Rp 50M in deals see 100x return." },
      { action: "Launch premium intelligence tier for institutional investors", impact: "HIGH", effort: "MEDIUM", timeline: "Month 3-6", detail: "Institutional terminals at Rp 5-50M/month capture high-value demand. Intelligence quality justifies premium pricing." },
      { action: "Deploy dynamic boost pricing based on demand signals", impact: "MEDIUM", effort: "LOW", timeline: "Month 2-3", detail: "Surge pricing for listing boosts during high-demand periods. Revenue per boost increases 40-60% during peak signals." },
      { action: "Create data API monetization for external platforms", impact: "HIGH", effort: "HIGH", timeline: "Month 6-12", detail: "Licensing proprietary data to banks, insurers, and appraisers creates entirely new revenue stream with near-zero marginal cost." },
    ],
    weaknessSignals: ["Price increase attempts causing >5% volume decline", "Competitors undercutting on core listing fees", "Vendor price sensitivity surveys showing resistance"],
    imitationRisk: 55,
  },
  {
    id: "ecosystem-integration",
    title: "Ecosystem Service Integration",
    icon: Layers,
    color: "text-destructive",
    bg: "bg-destructive/10",
    currentStrength: 40,
    targetStrength: 82,
    compoundingMechanism: "Each additional service layer (financing, legal, renovation, insurance) deepens platform dependency and expands TAM. Users who consume 3+ services have 95%+ retention because no single competitor offers the full stack.",
    strategies: [
      { action: "Launch mortgage pre-qualification with bank partners", impact: "HIGH", effort: "HIGH", timeline: "Month 3-6", detail: "Financing integration captures the highest-value transaction moment. Reduces investor friction and creates bank partnership revenue." },
      { action: "Integrate renovation vendor marketplace with property purchase", impact: "MEDIUM", effort: "MEDIUM", timeline: "Month 4-7", detail: "Post-purchase services extend the relationship and capture additional GMV. Renovation is a natural next step for every buyer." },
      { action: "Build rental management tools for investor-owners", impact: "HIGH", effort: "MEDIUM", timeline: "Month 5-8", detail: "Ongoing rental management creates permanent recurring relationship. Owners using yield tracking will never leave the platform." },
      { action: "Deploy legal document automation for transactions", impact: "MEDIUM", effort: "MEDIUM", timeline: "Month 6-9", detail: "Automated contracts, notary coordination, and compliance checks reduce transaction friction by 60% and create process dependency." },
    ],
    weaknessSignals: ["Multi-service attachment rate below 1.5 services per user", "Partner integration delays exceeding 3 months", "Service quality complaints in adjacent verticals"],
    imitationRisk: 30,
  },
];

/* ─── Defensibility Roadmap ─── */

const roadmapPhases = [
  { phase: "Phase 1 — Foundation Hardening", timeline: "Months 0-3", focus: "Lock core data advantage + vendor retention", target: 55, actions: ["Expand signal capture", "Launch vendor CRM", "Deploy daily investor briefings", "Implement exclusive listing incentives"] },
  { phase: "Phase 2 — Switching Cost Escalation", timeline: "Months 3-6", focus: "Make leaving expensive through multi-service dependency", target: 68, actions: ["Launch financing integration", "Build portfolio tracker", "Deploy dynamic pricing", "Create vendor performance badges"] },
  { phase: "Phase 3 — Network Effect Acceleration", timeline: "Months 6-12", focus: "Cross-side effects compound faster than competitors can build", target: 78, actions: ["Cross-city intelligence transfer", "Investor community launch", "Data API monetization", "Renovation marketplace integration"] },
  { phase: "Phase 4 — Permanent Advantage", timeline: "Months 12-24", focus: "Moat becomes self-reinforcing — competitors face 3+ year gap", target: 90, actions: ["Full lifecycle ecosystem", "Institutional intelligence monopoly", "Regulatory standard-setting participation", "Brand becomes category synonym"] },
];

/* ─── Component ─── */

const PlatformMoatStrategy: React.FC = () => {
  const [expandedPillar, setExpandedPillar] = useState<string | null>("data-intelligence");
  const [moatInputs, setMoatInputs] = useState({ liquidity: 65, dataVolume: 72, monetization: 45, partnerships: 40, expansion: 35 });

  const overallMoatScore = Math.round(
    moatInputs.liquidity * 0.25 + moatInputs.dataVolume * 0.25 + moatInputs.monetization * 0.2 + moatInputs.partnerships * 0.15 + moatInputs.expansion * 0.15
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Platform Moat Reinforcement"
        description="5 defensibility pillars with compounding mechanisms, actionable strategies, weakness signals & improvement roadmap"
        icon={Shield}
        badge={{ text: "🏰 Moat", variant: "outline" }}
      />

      {/* Moat inputs */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Current Moat Assessment</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { key: "liquidity" as const, label: "Liquidity Strength" },
            { key: "dataVolume" as const, label: "Data Signal Volume" },
            { key: "monetization" as const, label: "Monetization Depth" },
            { key: "partnerships" as const, label: "Partnership Density" },
            { key: "expansion" as const, label: "Geographic Scale" },
          ].map(inp => (
            <div key={inp.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{inp.label}</span>
                <span className={cn("text-xs font-bold", moatInputs[inp.key] >= 60 ? "text-chart-2" : "text-chart-4")}>{moatInputs[inp.key]}%</span>
              </div>
              <Slider value={[moatInputs[inp.key]]} onValueChange={v => setMoatInputs(p => ({ ...p, [inp.key]: v[0] }))} min={0} max={100} step={5} />
            </div>
          ))}
          <div className="flex flex-col items-center justify-center">
            <p className={cn("text-2xl font-bold", overallMoatScore >= 65 ? "text-chart-2" : overallMoatScore >= 45 ? "text-chart-4" : "text-destructive")}>{overallMoatScore}</p>
            <p className="text-[10px] text-muted-foreground">Overall Moat Score</p>
          </div>
        </CardContent>
      </Card>

      {/* Pillar selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {moatPillars.map(p => (
          <Card key={p.id} className={cn("border-border cursor-pointer hover:border-primary/30 transition-all", expandedPillar === p.id && "border-primary/50 bg-primary/5")} onClick={() => setExpandedPillar(p.id)}>
            <CardContent className="p-3 text-center">
              <p.icon className={cn("h-4 w-4 mx-auto mb-1", p.color)} />
              <p className="text-[11px] font-bold text-foreground">{p.title.split(" ").slice(0, 2).join(" ")}</p>
              <div className="mt-1.5 space-y-0.5">
                <Progress value={p.currentStrength} className="h-1.5" />
                <p className="text-[9px] text-muted-foreground">{p.currentStrength}% → {p.targetStrength}%</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pillar detail */}
      {moatPillars.filter(p => p.id === expandedPillar).map(pillar => (
        <div key={pillar.id} className="space-y-4">
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={cn("p-2.5 rounded-xl shrink-0", pillar.bg)}>
                  <pillar.icon className={cn("h-5 w-5", pillar.color)} />
                </div>
                <div className="flex-1">
                  <h3 className={cn("text-lg font-bold", pillar.color)}>{pillar.title}</h3>
                  <p className="text-sm text-foreground/80 mt-1">{pillar.compoundingMechanism}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Imitation Risk</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Progress value={pillar.imitationRisk} className="h-1.5 w-16" />
                        <span className={cn("text-xs font-bold", pillar.imitationRisk <= 35 ? "text-chart-2" : pillar.imitationRisk <= 50 ? "text-chart-4" : "text-destructive")}>{pillar.imitationRisk}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Current → Target</span>
                      <p className="text-xs font-bold text-foreground">{pillar.currentStrength}% → {pillar.targetStrength}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="strategies" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="strategies" className="text-xs">Strategies</TabsTrigger>
              <TabsTrigger value="warnings" className="text-xs">Weakness Signals</TabsTrigger>
              <TabsTrigger value="imitation" className="text-xs">Imitation Risk</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies" className="mt-4 space-y-2">
              {pillar.strategies.map((s, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-foreground">{s.action}</p>
                          <Badge variant={s.impact === "HIGH" ? "default" : "secondary"} className="text-[8px]">{s.impact} Impact</Badge>
                          <Badge variant="outline" className="text-[8px]">{s.effort} Effort</Badge>
                          <Badge variant="outline" className="text-[8px] text-muted-foreground">{s.timeline}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{s.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="warnings" className="mt-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Early Moat Weakness Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pillar.weaknessSignals.map((sig, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/15">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground">{sig}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="imitation" className="mt-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-chart-4" /> Competitor Imitation Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Imitation Risk Level</span>
                      <span className={cn("text-sm font-bold", pillar.imitationRisk <= 35 ? "text-chart-2" : "text-chart-4")}>{pillar.imitationRisk}%</span>
                    </div>
                    <Progress value={pillar.imitationRisk} className="h-2" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {pillar.imitationRisk <= 35
                      ? "Low imitation risk — advantage requires proprietary data accumulation that cannot be replicated without equivalent transaction history and time."
                      : pillar.imitationRisk <= 50
                      ? "Moderate imitation risk — structural advantage exists but well-funded competitors could replicate features within 12-18 months. Speed of execution is critical."
                      : "Elevated imitation risk — competitive advantage is primarily operational, not structural. Must deepen switching costs and data dependency before competitors close the gap."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ))}

      {/* Defensibility Roadmap */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Defensibility Improvement Roadmap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {roadmapPhases.map((phase, i) => (
            <div key={i} className={cn("rounded-lg border p-4 space-y-2", i === 0 ? "border-primary/30 bg-primary/5" : "border-border/40")}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={cn("text-sm font-bold", i === 0 ? "text-primary" : "text-foreground")}>{phase.phase}</h4>
                  <p className="text-[10px] text-muted-foreground">{phase.timeline} — {phase.focus}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-lg font-bold", phase.target >= 75 ? "text-chart-2" : "text-chart-4")}>{phase.target}%</p>
                  <p className="text-[9px] text-muted-foreground">Target Moat Score</p>
                </div>
              </div>
              <Progress value={phase.target} className="h-1.5" />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {phase.actions.map((a, j) => (
                  <Badge key={j} variant="outline" className="text-[9px]">{a}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformMoatStrategy;
