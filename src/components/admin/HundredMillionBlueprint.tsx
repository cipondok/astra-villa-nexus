import React from "react";
import {
  Globe, DollarSign, Landmark, Brain, AlertTriangle, CheckCircle,
  TrendingUp, Users, Shield, BarChart3, Target, Crown, Activity,
  Cpu, Layers, Eye, ChevronRight, Building, Scale
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — $100M REVENUE ENGINE
   ═══════════════════════════════════════════════ */

const revenuePhases = [
  {
    phase: "Phase 1 — Multi-City Compounding",
    range: "$10M → $25M ARR",
    timeline: "Year 3–4",
    color: "text-chart-4",
    streams: [
      { name: "Transaction Commissions", target: "$8M", detail: "1-2% on 500+ platform-facilitated deals/month across 15 cities. Escrow + settlement integrated." },
      { name: "SaaS Subscriptions", target: "$7M", detail: "5,000+ vendor subscribers (avg $80/mo) + 3,000+ investor Pro/Institutional subscribers." },
      { name: "Developer Campaigns", target: "$5M", detail: "New-launch visibility packages: $5K-50K per project across 15+ active developers." },
      { name: "Data & API Licensing", target: "$3M", detail: "Pricing feeds to 10+ banks/funds. Market intelligence reports to 50+ enterprise clients." },
      { name: "Ecosystem Services", target: "$2M", detail: "Mortgage referrals, insurance, renovation marketplace take-rates. 3-5% on partner GMV." },
    ],
    efficiency: { grossMargin: "72%", cacPayback: "3 months", nrr: "125%" },
    gate: "Prove multi-city unit economics are consistent before scaling beyond 15 cities",
  },
  {
    phase: "Phase 2 — Platform Revenue Flywheel",
    range: "$25M → $50M ARR",
    timeline: "Year 4–5",
    color: "text-primary",
    streams: [
      { name: "Transaction Layer", target: "$18M", detail: "1,500+ deals/month. Full-stack transaction: discovery → negotiation → escrow → close → post-sale." },
      { name: "Intelligence Products", target: "$12M", detail: "Institutional terminal ($5K-50K/mo). Predictive indices licensed by sovereign wealth and pension funds." },
      { name: "SaaS Revenue", target: "$10M", detail: "10K+ subscribers. White-label intelligence for brokerages. API-first B2B distribution." },
      { name: "Ecosystem GMV Share", target: "$7M", detail: "Financing, legal, renovation, insurance — platform captures 2-5% of $200M+ ancillary GMV." },
      { name: "International Licensing", target: "$3M", detail: "Technology licensing to partner operators in 2-3 Southeast Asian markets." },
    ],
    efficiency: { grossMargin: "76%", cacPayback: "2.5 months", nrr: "130%" },
    gate: "Achieve Rule of 40 score >50 before aggressive international expansion",
  },
  {
    phase: "Phase 3 — Infrastructure Dominance",
    range: "$50M → $100M ARR",
    timeline: "Year 5–7",
    color: "text-chart-2",
    streams: [
      { name: "Transaction Infrastructure", target: "$35M", detail: "3,000+ deals/month. Settlement, title transfer, tax calculation as platform services." },
      { name: "Data Infrastructure", target: "$25M", detail: "Real estate pricing backbone for banking sector. Government partnership for market indices." },
      { name: "Platform SaaS", target: "$18M", detail: "20K+ subscribers. Enterprise contracts >$100K/year with brokerages and developers." },
      { name: "Ecosystem & Fintech", target: "$15M", detail: "Fractional investment facilitation, REIT-like products, property-backed lending referrals." },
      { name: "Global Licensing & JVs", target: "$7M", detail: "5+ international markets via licensing/JV model. Technology export without capital-heavy operations." },
    ],
    efficiency: { grossMargin: "80%", cacPayback: "2 months", nrr: "135%" },
    gate: "$100M ARR = IPO-ready infrastructure company with sustainable competitive moat",
  },
];

const marginDrivers = [
  { driver: "Automation replaces manual ops", impact: "+8% margin", timeline: "Year 3-4", detail: "AI handles 70% of vendor onboarding, listing QA, and inquiry routing — reducing headcount per city by 40%." },
  { driver: "Network effects reduce CAC", impact: "+5% margin", timeline: "Year 4-5", detail: "Organic + referral acquisition exceeds 60% of new users. Paid CAC drops 50% as brand awareness compounds." },
  { driver: "Vendor lifecycle revenue compounds", impact: "+4% margin", timeline: "Year 4-6", detail: "Average vendor revenue grows from $960/yr to $3,200/yr as upsell and cross-sell activates ecosystem services." },
  { driver: "Data products have near-zero marginal cost", impact: "+6% margin", timeline: "Year 5-7", detail: "Intelligence products scale without proportional cost. Each new data client is ~95% gross margin." },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — IPO READINESS
   ═══════════════════════════════════════════════ */

const ipoReadiness = [
  {
    category: "Financial Performance",
    icon: DollarSign,
    score: 40,
    targetScore: 90,
    metrics: [
      { metric: "Revenue Growth Rate", current: "Pre-revenue", target: ">40% YoY at $50M+", status: "not-ready" as const },
      { metric: "Gross Margin", current: "N/A", target: ">75%", status: "not-ready" as const },
      { metric: "Net Revenue Retention", current: "N/A", target: ">120%", status: "not-ready" as const },
      { metric: "Rule of 40", current: "N/A", target: ">50 (growth% + margin%)", status: "not-ready" as const },
      { metric: "Revenue Predictability", current: "0% recurring", target: ">70% recurring/contracted", status: "not-ready" as const },
    ],
  },
  {
    category: "Marketplace Dominance",
    icon: Crown,
    score: 55,
    targetScore: 85,
    metrics: [
      { metric: "Market Share (Indonesia)", current: "0%", target: ">30% of digital property transactions", status: "not-ready" as const },
      { metric: "Liquidity Density", current: "Sample data", target: ">60% listing coverage in top 10 cities", status: "not-ready" as const },
      { metric: "Transaction Volume", current: "0", target: ">1,000 deals/month on-platform", status: "not-ready" as const },
      { metric: "Vendor Ecosystem", current: "0 real vendors", target: ">10,000 active agents/developers", status: "not-ready" as const },
      { metric: "Intelligence Moat", current: "Architecture built", target: "Proven accuracy advantage over alternatives", status: "partial" as const },
    ],
  },
  {
    category: "Governance & Compliance",
    icon: Scale,
    score: 30,
    targetScore: 95,
    metrics: [
      { metric: "Board Composition", current: "Founder only", target: "Independent majority + audit committee", status: "not-ready" as const },
      { metric: "Financial Audit", current: "None", target: "Big 4 audited financials (3 years)", status: "not-ready" as const },
      { metric: "SOC 2 / ISO 27001", current: "Not started", target: "Type II certified", status: "not-ready" as const },
      { metric: "Dual-Class Structure", current: "Not established", target: "Class B 10x voting with 15yr sunset", status: "not-ready" as const },
      { metric: "Holding Structure", current: "Not established", target: "Singapore/Cayman HoldCo for global capital access", status: "not-ready" as const },
    ],
  },
  {
    category: "Capital Markets Perception",
    icon: Landmark,
    score: 50,
    targetScore: 90,
    metrics: [
      { metric: "Category Definition", current: "Internal narrative only", target: "Analyst-recognized 'RE Intelligence Infrastructure'", status: "partial" as const },
      { metric: "Comparable Companies", current: "CoStar ($35B), Zillow ($15B)", target: "Positioned between with SEA premium", status: "partial" as const },
      { metric: "Institutional Relationships", current: "None", target: "10+ institutional investors in regular dialogue", status: "not-ready" as const },
      { metric: "Media Authority", current: "None", target: "Regular coverage in Bloomberg/TechCrunch/DealStreetAsia", status: "not-ready" as const },
      { metric: "Valuation Framework", current: "Revenue multiple model", target: "15-25x ARR justified by growth + moat + TAM", status: "partial" as const },
    ],
  },
];

const perceptionShift = [
  { from: "Startup with a product", to: "Platform with market traction", trigger: "First $1M ARR + 3 cities", timeline: "Year 1-2" },
  { from: "Platform with traction", to: "Category leader in Indonesia", trigger: "Top 3 market share + media recognition", timeline: "Year 2-4" },
  { from: "Category leader", to: "Market infrastructure provider", trigger: "Banks/institutions depend on platform data", timeline: "Year 4-6" },
  { from: "Infrastructure provider", to: "Public market institution", trigger: "IPO or strategic acquisition at $1B+ valuation", timeline: "Year 6-8" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — SELF-DRIVING MARKETPLACE
   ═══════════════════════════════════════════════ */

const evolutionStages = [
  {
    stage: "Assisted Intelligence",
    autonomy: 25,
    timeline: "Year 1-2",
    color: "bg-muted-foreground",
    capabilities: [
      "AI-scored deal recommendations with manual review",
      "Liquidity imbalance alerts for founder action",
      "Semi-automated vendor onboarding with human QA",
      "Predictive pricing suggestions requiring approval",
    ],
    governance: "All decisions require human approval. AI provides analysis and recommendations only.",
  },
  {
    stage: "Semi-Autonomous Optimization",
    autonomy: 55,
    timeline: "Year 2-4",
    color: "bg-chart-4",
    capabilities: [
      "Automated campaign activation on confidence >85%",
      "Dynamic listing boost pricing within approved ranges",
      "Self-adjusting search ranking based on engagement",
      "Automated vendor health interventions (churn prevention)",
    ],
    governance: "Low-risk actions auto-executed. Medium-risk requires 1-click approval. High-value decisions remain manual.",
  },
  {
    stage: "Strategic Control Tower",
    autonomy: 80,
    timeline: "Year 4-6",
    color: "bg-primary",
    capabilities: [
      "Cross-city capital flow optimization recommendations",
      "Behavioral market forecasting with 72h prediction windows",
      "Ecosystem service orchestration across vendor network",
      "Autonomous A/B testing with auto-promotion of winners",
    ],
    governance: "Platform operates with strategic guardrails. Founder focuses on vision, partnerships, and capital markets. Override available within 24h.",
  },
  {
    stage: "Marketplace Civilization",
    autonomy: 92,
    timeline: "Year 6-10+",
    color: "bg-chart-2",
    capabilities: [
      "Industry behavioral standard-setting through platform design",
      "Institutional adoption of platform analytics as market benchmark",
      "Cross-border capital routing intelligence for global investors",
      "Self-evolving pricing models that respond to macro-economic shifts",
    ],
    governance: "Ethical AI board oversight. Systemic risk monitoring. Regulatory collaboration frameworks. Anti-monopoly self-governance protocols.",
  },
];

const ethicalConsiderations = [
  { concern: "Market manipulation risk", framework: "Platform pricing recommendations must be transparent. No artificial scarcity creation. Published methodology for all indices.", severity: "CRITICAL" },
  { concern: "Data concentration power", framework: "Establish data governance board. Anonymized data sharing with regulators. Open API for academic research.", severity: "HIGH" },
  { concern: "Vendor dependency", framework: "Ensure vendor data portability. No exclusive lock-in contracts >12 months. Fair platform access regardless of spending.", severity: "HIGH" },
  { concern: "Algorithmic bias", framework: "Regular bias audits on AI scoring. Ensure geographic and demographic fairness in recommendations. Public model accuracy reports.", severity: "MEDIUM" },
  { concern: "Systemic market influence", framework: "Self-imposed market share caps per district. Proactive regulatory engagement. Industry coalition participation.", severity: "MEDIUM" },
];

const scaleRisks = [
  { risk: "Regulatory intervention as platform reaches dominant market position", severity: "HIGH", mitigation: "Proactive engagement with OJK and property regulators. Self-governance framework before mandated regulation." },
  { risk: "Technology architecture cannot handle 100x current load", severity: "HIGH", mitigation: "Migrate to multi-region cloud infrastructure by Year 3. Performance testing at 10x-100x simulated load." },
  { risk: "Key person dependency on founder for institutional relationships", severity: "CRITICAL", mitigation: "Build executive team by Year 2. Distribute key relationships across C-suite by Year 3." },
  { risk: "International expansion cultural/regulatory mismatch", severity: "MEDIUM", mitigation: "JV/licensing model with local operators. Do not attempt direct operations without local expertise." },
  { risk: "Macro-economic downturn reduces transaction volume 40%+", severity: "HIGH", mitigation: "Counter-cyclical revenue: data products grow during downturns as intelligence demand increases. Maintain 18mo runway." },
];

const founderEvolution = [
  { stage: "$0–$10M ARR", role: "Builder & Seller", focus: ["Close first 100 vendor relationships personally", "Ship product features that drive conversion", "Validate unit economics in 3+ cities", "Raise Series A/B with real traction data"] },
  { stage: "$10M–$25M ARR", role: "CEO & Strategist", focus: ["Hire VP Engineering, VP Sales, VP Product", "Establish board governance and advisory network", "Drive enterprise data partnerships", "Begin institutional investor relationship building"] },
  { stage: "$25M–$50M ARR", role: "Category Leader", focus: ["Position platform as industry infrastructure", "Keynote at global PropTech conferences", "Establish government and regulatory relationships", "Evaluate IPO vs late-stage private capital"] },
  { stage: "$50M–$100M ARR", role: "Institution Builder", focus: ["Prepare IPO-grade governance and compliance", "Build executive team capable of public company operations", "Establish global licensing/JV partnerships", "Transition from operator to strategic chairman"] },
];

/* ═══════════════════════════════════════════════ */

const HundredMillionBlueprint: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="$100M Scale & Global IPO Domination"
        description="Revenue scaling to $100M ARR, IPO institutional readiness, autonomous marketplace civilization vision"
        icon={Globe}
        badge={{ text: "🌍 $100M", variant: "outline" }}
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="revenue" className="text-xs">$100M Engine</TabsTrigger>
          <TabsTrigger value="margins" className="text-xs">Margin Levers</TabsTrigger>
          <TabsTrigger value="ipo" className="text-xs">IPO Readiness</TabsTrigger>
          <TabsTrigger value="civilization" className="text-xs">Self-Driving</TabsTrigger>
          <TabsTrigger value="leadership" className="text-xs">Founder Path</TabsTrigger>
        </TabsList>

        {/* ── $100M REVENUE ── */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          {revenuePhases.map((p, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm flex items-center gap-2", p.color)}>
                    <TrendingUp className="h-4 w-4" /> {p.phase}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{p.range}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{p.timeline}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.streams.map((s, j) => (
                  <div key={j} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <Badge variant="default" className="text-[8px] min-w-[55px] justify-center shrink-0">{s.target}</Badge>
                    <div>
                      <p className="text-xs font-medium text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.detail}</p>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(p.efficiency).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-chart-2/5 border border-chart-2/20 text-center">
                      <p className="text-[8px] text-muted-foreground uppercase">{k.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-sm font-bold text-chart-2">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-[9px] font-semibold text-destructive">🚫 GATE</p>
                  <p className="text-[10px] text-foreground">{p.gate}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── MARGIN LEVERS ── */}
        <TabsContent value="margins" className="mt-4 space-y-2">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-2" /> Operating Leverage Drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {marginDrivers.map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{d.driver}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[8px]">{d.impact}</Badge>
                      <Badge variant="outline" className="text-[8px]">{d.timeline}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{d.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── IPO READINESS ── */}
        <TabsContent value="ipo" className="mt-4 space-y-4">
          {ipoReadiness.map((cat, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-primary" /> {cat.category}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Progress value={cat.score} className="h-1.5 w-16" />
                    <span className={cn("text-xs font-bold", cat.score >= 60 ? "text-chart-2" : cat.score >= 40 ? "text-chart-4" : "text-destructive")}>{cat.score}%</span>
                    <span className="text-[8px] text-muted-foreground">→{cat.targetScore}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {cat.metrics.map((m, j) => (
                  <div key={j} className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/30">
                    {m.status === "partial" ? <Activity className="h-3.5 w-3.5 text-chart-4 shrink-0 mt-0.5" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{m.metric}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[9px] text-destructive">Now: {m.current}</span>
                        <span className="text-[9px] text-chart-2">Target: {m.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Perception Shift */}
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><ChevronRight className="h-4 w-4 text-primary" /> Perception Evolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {perceptionShift.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-destructive line-through min-w-[140px]">{p.from}</span>
                  <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                  <span className="text-[10px] font-semibold text-chart-2 min-w-[160px]">{p.to}</span>
                  <Badge variant="outline" className="text-[8px] shrink-0">{p.timeline}</Badge>
                  <span className="text-[9px] text-muted-foreground hidden md:inline">{p.trigger}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SELF-DRIVING MARKETPLACE ── */}
        <TabsContent value="civilization" className="mt-4 space-y-4">
          {evolutionStages.map((s, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">{s.stage}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px]">{s.timeline}</Badge>
                    <div className="flex items-center gap-1">
                      <div className={cn("h-2.5 rounded-full", s.color)} style={{ width: `${s.autonomy * 0.8}px` }} />
                      <span className="text-xs font-bold text-foreground">{s.autonomy}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {s.capabilities.map((c, j) => (
                    <div key={j} className="flex items-start gap-2 text-[11px] text-foreground">
                      <span className="text-primary mt-0.5">→</span> {c}
                    </div>
                  ))}
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-[9px] font-semibold text-muted-foreground">🛡 GOVERNANCE</p>
                  <p className="text-[10px] text-foreground">{s.governance}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Ethics */}
          <Card className="border-chart-4/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-chart-4" /> Ethical Governance Framework</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ethicalConsiderations.map((e, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={e.severity === "CRITICAL" ? "destructive" : e.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{e.severity}</Badge>
                    <p className="text-xs font-semibold text-foreground">{e.concern}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{e.framework}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FOUNDER PATH ── */}
        <TabsContent value="leadership" className="mt-4 space-y-4">
          {/* Risks */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Scale Sustainability Risks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scaleRisks.map((r, i) => (
                <div key={i} className={cn("rounded-lg border p-3 space-y-1", r.severity === "CRITICAL" ? "border-destructive/30 bg-destructive/5" : "border-border/40")}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{r.risk}</p>
                    <Badge variant={r.severity === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{r.severity}</Badge>
                  </div>
                  <p className="text-[10px] text-chart-2">↳ {r.mitigation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Founder Evolution */}
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Founder Role Evolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {founderEvolution.map((f, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{f.stage}</Badge>
                    <span className="text-xs font-bold text-primary">{f.role}</span>
                  </div>
                  <div className="space-y-1">
                    {f.focus.map((p, j) => (
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

export default HundredMillionBlueprint;
