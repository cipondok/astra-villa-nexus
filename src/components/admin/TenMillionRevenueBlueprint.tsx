import React, { useState } from "react";
import {
  Rocket, DollarSign, Radio, Globe, AlertTriangle, CheckCircle,
  TrendingUp, Users, Zap, Shield, BarChart3, Target, Crown,
  Activity, Cpu, ChevronRight, Layers, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — $10M REVENUE ENGINE
   ═══════════════════════════════════════════════ */

const revenueStages = [
  {
    stage: "Stage 1 — Marketplace Activation",
    range: "$0 → $100K ARR",
    timeline: "Month 1–6",
    color: "text-chart-4",
    focus: "First paid customers, validated willingness-to-pay, proven conversion funnel",
    streams: [
      { stream: "Listing Boosts", target: "$3K/mo", tactic: "Free trial → paid conversion. Anchor at Rp 2.5M, launch at Rp 1.5M. Performance guarantee." },
      { stream: "Vendor Subscriptions", target: "$3K/mo", tactic: "3-tier (Basic free → Growth Rp 1.5M → Dominance Rp 5M). Target 15 paid vendors." },
      { stream: "Investor Pro", target: "$2K/mo", tactic: "Freemium gate: 3 free unlocks/month → Rp 499K Pro. AI deal alerts as hook." },
    ],
    kpis: ["≥50 paid customers", "MRR >Rp 130M", "Blended ARPU >Rp 2.5M", "Churn <8%/month"],
    gate: "Do not proceed to Stage 2 without ≥Rp 100M MRR from real customers",
  },
  {
    stage: "Stage 2 — Network Expansion",
    range: "$100K → $1M ARR",
    timeline: "Month 6–14",
    color: "text-primary",
    focus: "Multi-city revenue, vendor subscription at scale, investor premium monetization",
    streams: [
      { stream: "Listing Boosts", target: "$15K/mo", tactic: "Dynamic pricing per district demand. Scarcity slots (max 10/district). 3-city rollout." },
      { stream: "Vendor Subscriptions", target: "$30K/mo", tactic: "Upgrade automation: trigger upsell when vendor gets ≥20 inquiries. Annual pre-pay 2mo free." },
      { stream: "Investor Intelligence", target: "$20K/mo", tactic: "Launch Institutional tier at Rp 5M/mo. Portfolio tracking + AI watchlist as retention hook." },
      { stream: "Featured Campaigns", target: "$15K/mo", tactic: "Developer launch campaigns: Rp 15-50M packages for new project visibility." },
    ],
    kpis: ["3 cities generating revenue", "200+ paid customers", "Net Revenue Retention >110%", "CAC payback <4 months"],
    gate: "Prove unit economics are positive across ≥2 cities before scaling spend",
  },
  {
    stage: "Stage 3 — Data Platform Transition",
    range: "$1M → $3M ARR",
    timeline: "Month 14–24",
    color: "text-chart-2",
    focus: "Data monetization, institutional clients, platform-level pricing power",
    streams: [
      { stream: "Marketplace Revenue", target: "$80K/mo", tactic: "Transaction commission (0.5-1%) on platform-facilitated deals. Escrow integration." },
      { stream: "Subscriptions (Blended)", target: "$100K/mo", tactic: "500+ vendors + 1000+ investor subscribers across 5+ cities." },
      { stream: "Data & Analytics APIs", target: "$40K/mo", tactic: "Market intelligence reports, pricing APIs for banks/developers. Rp 10-50M/month enterprise." },
      { stream: "Capital Markets", target: "$30K/mo", tactic: "Syndication facilitation fees. Deal flow routing to institutional investors." },
    ],
    kpis: ["5+ cities active", "Revenue diversification: no stream >40%", "Gross margin >70%", "Annual contracts >30%"],
    gate: "Establish ≥2 enterprise data clients before claiming 'platform' positioning to investors",
  },
  {
    stage: "Stage 4 — Infrastructure Dominance",
    range: "$3M → $10M ARR",
    timeline: "Month 24–36",
    color: "text-chart-1",
    focus: "Market infrastructure positioning, 10+ cities, institutional-grade services",
    streams: [
      { stream: "Transaction Layer", target: "$300K/mo", tactic: "Commission on all platform deals (1-2%). Escrow + settlement services. Target 200+ deals/month." },
      { stream: "SaaS Revenue", target: "$250K/mo", tactic: "2000+ subscribers. Enterprise plans for brokerages and developers. White-label intelligence." },
      { stream: "Data Infrastructure", target: "$150K/mo", tactic: "Predictive pricing feeds, market indices, API licensing to financial institutions." },
      { stream: "Ecosystem Services", target: "$130K/mo", tactic: "Mortgage referral commissions, renovation marketplace take-rate, insurance partnerships." },
    ],
    kpis: ["10+ cities", "$10M ARR run-rate", "LTV:CAC >5x", "Rule of 40 score >40", "Path to profitability visible"],
    gate: "$10M ARR milestone — platform is now venture-scale infrastructure",
  },
];

const pricingExperiments = [
  { experiment: "Anchor price test: show 'market rate' vs discounted platform price", metric: "Conversion rate uplift", expected: "+15-25%", complexity: "Low" },
  { experiment: "Charm pricing: Rp 1.499M vs Rp 1.5M on listing boosts", metric: "Click-to-purchase rate", expected: "+5-8%", complexity: "Low" },
  { experiment: "Bundle vs à la carte: 3-month package vs monthly at same effective price", metric: "Average contract length", expected: "+40% duration", complexity: "Medium" },
  { experiment: "Urgency timer: '2 premium slots left in Menteng' with countdown", metric: "Time-to-purchase", expected: "-50% decision time", complexity: "Low" },
  { experiment: "Social proof pricing: 'Chosen by 47 agents in Jakarta this month'", metric: "Trial-to-paid conversion", expected: "+12-18%", complexity: "Low" },
  { experiment: "Usage-based upgrade trigger at 80% free-tier limit", metric: "Free-to-paid upgrade rate", expected: "+20-30%", complexity: "Medium" },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — AUTONOMOUS CONTROL TOWER
   ═══════════════════════════════════════════════ */

const controlTowerLayers = [
  {
    layer: "Signal Intelligence Grid",
    icon: Radio,
    maturity: "Assisted → Semi-Autonomous",
    systems: [
      { name: "Inquiry Velocity Monitor", description: "Real-time tracking of inquiry rate per listing, district, and city. Alerts on >30% WoW decline.", confidence: 85, status: "active" },
      { name: "Vendor Health Scanner", description: "Login frequency, listing freshness, response time. Flags vendors at churn risk (no login >7 days).", confidence: 80, status: "active" },
      { name: "Monetization Conversion Tracker", description: "Funnel analysis: impression → click → trial → paid. Detects >25% drop anomalies.", confidence: 75, status: "active" },
      { name: "Supply-Demand Equilibrium", description: "District-level ratio of active listings to active investor searches. Triggers supply/demand alerts.", confidence: 70, status: "partial" },
    ],
  },
  {
    layer: "Predictive Recommendation Engine",
    icon: Cpu,
    maturity: "Semi-Autonomous",
    systems: [
      { name: "Campaign Timing Optimizer", description: "Predicts optimal time windows for boost campaigns based on historical engagement patterns.", confidence: 65, status: "planned" },
      { name: "Vendor Acquisition Targeting", description: "Identifies high-potential agent segments based on market activity and competitor gaps.", confidence: 60, status: "planned" },
      { name: "Dynamic Pricing Advisor", description: "Suggests listing boost price adjustments based on district demand elasticity and competitor pricing.", confidence: 55, status: "planned" },
      { name: "Liquidity Balancer", description: "Recommends supply acquisition zones when investor demand exceeds available inventory.", confidence: 70, status: "partial" },
    ],
  },
  {
    layer: "Execution Governance",
    icon: Shield,
    maturity: "Human-in-the-Loop",
    systems: [
      { name: "Confidence Gate", description: "Actions require ≥90% confidence for auto-execution. 70-89% → recommendation with approval. <70% → manual only.", confidence: 90, status: "active" },
      { name: "Escalation Router", description: "High-value decisions (>Rp 50M impact) always require founder approval regardless of confidence.", confidence: 95, status: "active" },
      { name: "Rollback Visualizer", description: "Every automated action has a 24h rollback window with before/after performance comparison.", confidence: 80, status: "partial" },
      { name: "Audit Trail Logger", description: "All AI-driven actions logged with decision rationale, confidence score, and outcome tracking.", confidence: 90, status: "active" },
    ],
  },
  {
    layer: "Continuous Learning Loop",
    icon: Activity,
    maturity: "Evolving",
    systems: [
      { name: "Experiment Reinforcement", description: "A/B test outcomes feed back into recommendation weights. Winning variants auto-promoted.", confidence: 60, status: "partial" },
      { name: "Model Accuracy Tracker", description: "MAE/R² tracking for pricing predictions. Alerts when accuracy degrades >10% from baseline.", confidence: 75, status: "active" },
      { name: "Growth ROI Comparator", description: "Compares ROI across growth actions (ads, partnerships, content) to auto-prioritize budget allocation.", confidence: 50, status: "planned" },
      { name: "Weight Recalibrator", description: "Scoring model weights auto-adjusted quarterly based on actual transaction outcome correlation.", confidence: 65, status: "partial" },
    ],
  },
];

const maturityRoadmap = [
  { phase: "Phase 1: Manual Operations", autonomy: 10, timeline: "Month 0-3", description: "Founder manually monitors all KPIs. Decisions based on gut + basic analytics. Spreadsheet tracking.", color: "bg-muted-foreground" },
  { phase: "Phase 2: Assisted Intelligence", autonomy: 35, timeline: "Month 3-9", description: "Dashboards surface key signals. AI generates recommendations. Founder approves all actions.", color: "bg-chart-4" },
  { phase: "Phase 3: Semi-Autonomous", autonomy: 65, timeline: "Month 9-18", description: "Low-risk actions auto-executed (email campaigns, listing refreshes). Medium-risk actions recommended with 1-click approval.", color: "bg-primary" },
  { phase: "Phase 4: Strategic Control Tower", autonomy: 85, timeline: "Month 18-36", description: "Platform self-optimizes pricing, campaign timing, and vendor engagement. Founder focuses on strategy and partnerships.", color: "bg-chart-2" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — CATEGORY DOMINATION
   ═══════════════════════════════════════════════ */

const dominationPillars = [
  {
    pillar: "Liquidity Density Supremacy",
    icon: Target,
    strength: 70,
    strategies: [
      { strategy: "Exclusive inventory program: 20% of listings only on platform via developer partnerships", impact: "HIGH", timeline: "Month 6-12" },
      { strategy: "Gravity effect: investors check platform first because it has the most actionable deals", impact: "CRITICAL", timeline: "Month 12-24" },
      { strategy: "District saturation targeting: achieve >60% listing coverage in priority districts before expanding", impact: "HIGH", timeline: "Month 3-9" },
    ],
    defensibility: "Network effects compound: more listings → more investors → more agent listings. 18-month replication gap for competitors.",
  },
  {
    pillar: "Intelligence Moat Compounding",
    icon: Cpu,
    strength: 85,
    strategies: [
      { strategy: "Behavioral data flywheel: every interaction improves AI scoring accuracy, widening competitor gap", impact: "CRITICAL", timeline: "Continuous" },
      { strategy: "Predictive deal alerts: AI identifies opportunities 24-48h before market awareness — exclusive to Pro subscribers", impact: "HIGH", timeline: "Month 6-18" },
      { strategy: "Proprietary market indices: publish monthly city/district intelligence reports establishing data authority", impact: "HIGH", timeline: "Month 9-24" },
    ],
    defensibility: "Self-reinforcing data advantage. Each transaction makes predictions more accurate. Cannot be replicated without equivalent transaction volume.",
  },
  {
    pillar: "Ecosystem Lock-In",
    icon: Layers,
    strength: 55,
    strategies: [
      { strategy: "Financing integration: mortgage pre-qualification on listing pages, referral commission from bank partners", impact: "HIGH", timeline: "Month 12-18" },
      { strategy: "Vendor services marketplace: renovation, legal, insurance bundled into transaction flow", impact: "MEDIUM", timeline: "Month 18-30" },
      { strategy: "Ownership lifecycle: post-purchase services (property management, rental optimization) increase switching cost", impact: "HIGH", timeline: "Month 24-36" },
    ],
    defensibility: "Each additional service layer increases switching cost. Users who use ≥3 services have <5% annual churn.",
  },
  {
    pillar: "Brand & Perception Control",
    icon: Crown,
    strength: 40,
    strategies: [
      { strategy: "Thought leadership: founder as the 'voice of PropTech intelligence' in Indonesia media", impact: "HIGH", timeline: "Month 3-ongoing" },
      { strategy: "Liquidity Index publication: quarterly data report cited by media, creating earned authority", impact: "HIGH", timeline: "Month 9-ongoing" },
      { strategy: "Institutional trust signals: bank partnerships, government data collaboration, industry board membership", impact: "CRITICAL", timeline: "Month 18-36" },
    ],
    defensibility: "Brand authority compounds over years. First-mover in 'real estate intelligence' category definition is extremely difficult to displace.",
  },
];

const competitiveResponses = [
  { threat: "Well-funded listing portal launches AI features", response: "Emphasize depth vs breadth: their AI is a feature, ours is the entire architecture. 2-year data advantage cannot be replicated with funding alone.", severity: "HIGH" },
  { threat: "Super-app (Grab/Gojek) enters property vertical", response: "They optimize for volume, we optimize for intelligence. Position as the 'Bloomberg Terminal' to their 'Yahoo Finance'. Partner don't compete — API integration.", severity: "MEDIUM" },
  { threat: "International PropTech enters Indonesia", response: "Localization moat: Indonesia-specific regulations, local agent relationships, Bahasa Indonesia AI, IDR pricing psychology. 12-18 month localization disadvantage for entrants.", severity: "MEDIUM" },
  { threat: "Vendor price war from desperate competitor", response: "Do not engage in price war. Increase value instead: add free analytics, improve lead quality, show ROI data. Competing on price signals commodity; compete on intelligence.", severity: "HIGH" },
];

const executionRisks = [
  { risk: "Revenue concentration in single city delays scaling narrative", severity: "HIGH", dependency: "City 2 launch by Month 6", mitigation: "Pre-seed City 2 agent relationships during Month 3-5 to compress launch timeline." },
  { risk: "Enterprise data clients require compliance infrastructure not yet built", severity: "MEDIUM", dependency: "SOC 2 or equivalent by Month 18", mitigation: "Start with informal data partnerships (PDF reports) before API access requires compliance." },
  { risk: "AI prediction accuracy insufficient for premium pricing", severity: "HIGH", dependency: "≥10K real transactions for model training", mitigation: "Supplement with manual expert analysis in early stages. Hybrid human+AI until model matures." },
  { risk: "Founder bandwidth insufficient for simultaneous sales + product + fundraising", severity: "CRITICAL", dependency: "First hire by Month 4", mitigation: "Hire ops/sales lead. Founder focuses on product + investors. Automate everything possible." },
  { risk: "Market downturn reduces transaction volume and investor appetite", severity: "MEDIUM", dependency: "External economic factors", mitigation: "Counter-cyclical positioning: 'In a downturn, intelligence matters more, not less.' Shift to rental yield focus." },
];

const founderPriorities = [
  { stage: "$0-100K ARR", priorities: ["Get 30+ real listings live", "Close first 10 paying customers", "Prove conversion funnel works", "Do NOT build more features — sell what exists"] },
  { stage: "$100K-1M ARR", priorities: ["Hire first 2 team members (ops + sales)", "Launch City 2 with compressed playbook", "Achieve Net Revenue Retention >100%", "Build investor data room with real metrics"] },
  { stage: "$1M-3M ARR", priorities: ["Raise Series A with validated unit economics", "Sign first enterprise data client", "Establish brand authority via content + PR", "Begin institutional investor relationships"] },
  { stage: "$3M-10M ARR", priorities: ["Scale to 10+ cities with proven playbook", "Build autonomous control tower to reduce founder dependency", "Achieve path-to-profitability metrics", "Position for Series B or strategic partnership"] },
];

/* ═══════════════════════════════════════════════ */

const TenMillionRevenueBlueprint: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="$10M Revenue & Category Domination"
        description="Revenue scaling engine, autonomous control tower architecture & global category leadership strategy"
        icon={Rocket}
        badge={{ text: "🚀 $10M", variant: "outline" }}
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="revenue" className="text-xs">$10M Engine</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs">Pricing Lab</TabsTrigger>
          <TabsTrigger value="tower" className="text-xs">Control Tower</TabsTrigger>
          <TabsTrigger value="domination" className="text-xs">Category Kill</TabsTrigger>
          <TabsTrigger value="execution" className="text-xs">Exec Priorities</TabsTrigger>
        </TabsList>

        {/* ── $10M REVENUE ── */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          {revenueStages.map((s, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm flex items-center gap-2", s.color)}>
                    <DollarSign className="h-4 w-4" /> {s.stage}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{s.range}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{s.timeline}</Badge>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">{s.focus}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {s.streams.map((st, j) => (
                    <div key={j} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                      <Badge variant="default" className="text-[8px] min-w-[80px] justify-center shrink-0">{st.target}</Badge>
                      <div>
                        <p className="text-xs font-medium text-foreground">{st.stream}</p>
                        <p className="text-[10px] text-muted-foreground">{st.tactic}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {s.kpis.map((k, j) => (
                    <div key={j} className="p-1.5 rounded bg-chart-2/5 border border-chart-2/20 text-center">
                      <p className="text-[9px] text-foreground">{k}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-[9px] font-semibold text-destructive">🚫 STAGE GATE</p>
                  <p className="text-[10px] text-foreground">{s.gate}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── PRICING LAB ── */}
        <TabsContent value="pricing" className="mt-4 space-y-2">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-4" /> Pricing Elasticity Experiments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {pricingExperiments.map((e, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex-1">
                    <p className="text-xs text-foreground">{e.experiment}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[9px] text-muted-foreground">📊 {e.metric}</span>
                      <Badge variant="default" className="text-[8px]">{e.expected}</Badge>
                      <Badge variant={e.complexity === "Low" ? "secondary" : "outline"} className="text-[8px]">{e.complexity}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CONTROL TOWER ── */}
        <TabsContent value="tower" className="mt-4 space-y-4">
          {controlTowerLayers.map((l, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <l.icon className="h-4 w-4 text-primary" /> {l.layer}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">{l.maturity}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {l.systems.map((s, j) => (
                  <div key={j} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    {s.status === "active" ? <CheckCircle className="h-3.5 w-3.5 text-chart-2 shrink-0 mt-0.5" />
                      : s.status === "partial" ? <Activity className="h-3.5 w-3.5 text-chart-4 shrink-0 mt-0.5" />
                      : <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">{s.name}</p>
                        <div className="flex items-center gap-1">
                          <Progress value={s.confidence} className="h-1 w-8" />
                          <span className="text-[8px] text-muted-foreground">{s.confidence}%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{s.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Maturity Roadmap */}
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><ChevronRight className="h-4 w-4 text-primary" /> Autonomy Maturity Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {maturityRoadmap.map((m, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{m.phase}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px]">{m.timeline}</Badge>
                      <div className="flex items-center gap-1">
                        <div className={cn("h-2 rounded-full", m.color)} style={{ width: `${m.autonomy * 0.6}px` }} />
                        <span className="text-[9px] font-bold text-foreground">{m.autonomy}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{m.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CATEGORY DOMINATION ── */}
        <TabsContent value="domination" className="mt-4 space-y-4">
          {dominationPillars.map((p, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <p.icon className="h-4 w-4 text-primary" /> {p.pillar}
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <Progress value={p.strength} className="h-1.5 w-16" />
                    <span className={cn("text-xs font-bold", p.strength >= 70 ? "text-chart-2" : p.strength >= 50 ? "text-chart-4" : "text-destructive")}>{p.strength}/100</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {p.strategies.map((s, j) => (
                    <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
                      <Badge variant={s.impact === "CRITICAL" ? "destructive" : "default"} className="text-[8px] shrink-0">{s.impact}</Badge>
                      <div>
                        <p className="text-[11px] text-foreground">{s.strategy}</p>
                        <span className="text-[9px] text-muted-foreground">{s.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                  <p className="text-[9px] font-semibold text-chart-2">🛡 DEFENSIBILITY</p>
                  <p className="text-[10px] text-foreground">{p.defensibility}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Competitive Responses */}
          <Card className="border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-destructive" /> Competitive Response Playbook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {competitiveResponses.map((c, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={c.severity === "HIGH" ? "destructive" : "default"} className="text-[8px]">{c.severity}</Badge>
                    <p className="text-xs font-semibold text-foreground">{c.threat}</p>
                  </div>
                  <div className="pl-2 border-l-2 border-chart-2/40">
                    <p className="text-[10px] text-foreground">{c.response}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EXECUTION PRIORITIES ── */}
        <TabsContent value="execution" className="mt-4 space-y-4">
          {/* Risks */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Key Execution Risks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {executionRisks.map((r, i) => (
                <div key={i} className={cn("rounded-lg border p-3 space-y-1.5", r.severity === "CRITICAL" ? "border-destructive/30 bg-destructive/5" : "border-border/40")}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{r.risk}</p>
                    <Badge variant={r.severity === "CRITICAL" ? "destructive" : r.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{r.severity}</Badge>
                  </div>
                  <p className="text-[9px] text-muted-foreground">Dependency: {r.dependency}</p>
                  <p className="text-[10px] text-chart-2">↳ {r.mitigation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Founder Priorities per Stage */}
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Founder Decision Priorities by Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {founderPriorities.map((fp, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
                  <Badge variant="outline" className="text-[9px]">{fp.stage}</Badge>
                  <div className="space-y-1">
                    {fp.priorities.map((p, j) => (
                      <div key={j} className="flex items-start gap-2 text-[11px] text-foreground">
                        <span className="text-primary shrink-0">#{j + 1}</span> {p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenMillionRevenueBlueprint;
