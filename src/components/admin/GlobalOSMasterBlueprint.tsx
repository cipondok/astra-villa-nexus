import React, { useState } from "react";
import {
  Globe, Database, Layers, TrendingUp, Shield, Zap, Users, Cpu,
  BarChart3, Target, Mic, RefreshCw, AlertTriangle, ChevronDown,
  ChevronUp, Lock, Eye, Activity, Building, DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — GLOBAL OS ARCHITECTURE LAYERS
   ═══════════════════════════════════════════════ */

const osLayers = [
  {
    id: "liquidity",
    title: "Marketplace Liquidity Engine",
    icon: Activity,
    color: "text-primary",
    bg: "bg-primary/10",
    modules: [
      { name: "Supply Acquisition Intelligence", desc: "Identifies undersupplied segments via unmatched search queries and filter gaps. Auto-generates vendor outreach targets ranked by district demand intensity." },
      { name: "Demand Prediction Module", desc: "7-30 day forward-looking inquiry volume forecasts using behavioral velocity, seasonal patterns, and macro signals. 82%+ accuracy with 6-hour retraining." },
      { name: "Listing Performance Scoring", desc: "12-factor quality score (image clarity 25%, description 20%, price vs market 20%, location detail 15%, agent response 10%, conversion history 10%)." },
      { name: "District Liquidity Heat Mapping", desc: "Real-time absorption rates and liquidity strength by district. Weighted scoring: Viewing (10%), Offer (25%), Escrow (35%), Closed (30%)." },
    ],
    defensibility: "Transaction data compounds — each deal improves prediction accuracy, which attracts more capital, which generates more transactions. 2+ year replication gap for competitors.",
  },
  {
    id: "monetization",
    title: "Monetization & Capital Flow Layer",
    icon: DollarSign,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    modules: [
      { name: "Dynamic Pricing Intelligence", desc: "Surge pricing for boosts during high-demand windows. Base × (1 + Demand×0.25 + Liquidity×0.20 + Segment×0.20 + Competition×0.15 + WTP×0.20)." },
      { name: "Investor Unlock Monetization", desc: "Tiered access: Free (basic search) → Pro Rp 299K (AI scores) → Premium Rp 999K (predictions) → Institutional Rp 50M (terminal + API)." },
      { name: "Vendor Subscription Revenue", desc: "Growth to Dominance tiers with escalating visibility, lead priority, and analytics depth. 85%+ retention through multi-service dependency." },
      { name: "Premium Scarcity Management", desc: "Limited featured slots per district (max 5%) create urgency. Waitlist mechanics and auction dynamics maximize revenue per placement." },
    ],
    defensibility: "5-layer revenue stack (transactions, vendor subs, investor SaaS, data APIs, capital markets) makes single-revenue competitors structurally weaker.",
  },
  {
    id: "intelligence",
    title: "Intelligence & Data Compounding Core",
    icon: Database,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    modules: [
      { name: "Behavioral Signal Ingestion", desc: "14+ event types captured via useTrackEvent: views, saves, inquiries, comparisons, map interactions. Session-windowed aggregation with <50ms latency." },
      { name: "Predictive Deal Success Modeling", desc: "DSP engine: Buyer Intent (20%), Seller Motivation (18%), Liquidity Trend (17%), Negotiation Gap (16%), Documentation (15%), Agent Performance (14%)." },
      { name: "Supply Gap Forecasting", desc: "Analyzes search-to-listing ratios by segment to identify undersupplied zones. Outputs developer acquisition targets and optimal pricing recommendations." },
      { name: "Liquidity Equilibrium Optimization", desc: "Autonomous flywheel balancer: detects supply/demand imbalances and triggers targeted campaigns, pricing adjustments, or vendor incentives to restore equilibrium." },
    ],
    defensibility: "450+ data tables with cross-model learning transfer. Every new city's data improves every other city's predictions. Intelligence gap widens exponentially.",
  },
  {
    id: "ecosystem",
    title: "Ecosystem Integration Layer",
    icon: Layers,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    modules: [
      { name: "Financing & Mortgage Partners", desc: "Pre-qualification integration with bank partners. Captures highest-value transaction moment. Commission revenue + reduced investor friction." },
      { name: "Renovation & Services Marketplace", desc: "AI-matched vendor routing: Performance (30%), Demand (25%), Proximity (20%), Capacity (15%), Price (10%). Post-purchase GMV capture." },
      { name: "Ownership Lifecycle Services", desc: "Rental management, yield analytics, insurance, and legal document automation. Users consuming 3+ services show 95%+ retention." },
      { name: "Cross-City Investor Routing", desc: "9-parameter deal matching across cities: Capital Range, Risk Appetite, District Focus, Property Type, Historical Engagement, and 4 behavioral signals." },
    ],
    defensibility: "Multi-service dependency creates exponential switching costs. No single competitor offers the full Discovery → Ownership lifecycle stack.",
  },
  {
    id: "expansion",
    title: "Global Expansion Control Grid",
    icon: Globe,
    color: "text-destructive",
    bg: "bg-destructive/10",
    modules: [
      { name: "Multi-City Performance Intelligence", desc: "Unified dashboard tracking district-level KPIs across all operational cities. Automated anomaly detection with 8 trigger types." },
      { name: "Expansion Readiness Scoring", desc: "ERS: Liquidity (25%), Revenue Trajectory (22%), Network Density (20%), Investor Momentum (18%), Ops Scalability (15%). Threshold-gated launch decisions." },
      { name: "Capital Deployment Optimization", desc: "Kelly-criterion-inspired allocation across cities. Automated rebalancing signals when risk-adjusted returns shift between markets." },
      { name: "International Replication Framework", desc: "90-day city launch playbook: Intelligence Prep → Supply Activation → Demand Activation → Transaction Kickstart → Social Proof → Scale Trigger." },
    ],
    defensibility: "Local liquidity with global intelligence transfer. Each new market strengthens the entire network's predictive capability.",
  },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — FOUNDER LEGACY NARRATIVES
   ═══════════════════════════════════════════════ */

const narrativeFormats = [
  {
    format: "Keynote Speech",
    icon: Mic,
    color: "text-primary",
    narrative: `Real estate is the world's largest asset class — $380 trillion — yet it runs on phone calls, gut feelings, and information asymmetry.

We asked a simple question: what if every property transaction was informed by intelligence instead of instinct?

What we've built isn't a listing portal. It's an operating system. 450+ data tables. 30+ autonomous AI engines. District-level predictions across 38 provinces. Every transaction makes us smarter. Every data point widens our moat.

We're not participating in the real estate market. We ARE becoming the market infrastructure. The rails that every investor, developer, and agent will depend on.

In 10 years, every property transaction globally will flow through an intelligence layer. The only question is: who builds it? We already have.

The future of real estate isn't about listings. It's about liquidity intelligence. And we own that category.`
  },
  {
    format: "Investor Manifesto",
    icon: TrendingUp,
    color: "text-chart-4",
    narrative: `THE THESIS: Real estate transactions are the last major capital allocation decisions made without systematic intelligence. This is a $380T market running on 1990s infrastructure.

THE SHIFT: We've built the intelligence layer that transforms property from an opaque, illiquid asset class into a transparent, data-driven capital market.

THE MOAT: Our data advantage compounds with every transaction. 2+ years of behavioral, pricing, and liquidity data that no competitor can replicate without equivalent transaction history. Our AI accuracy improves 2-3% per quarter — autonomously.

THE OPPORTUNITY: 5-layer revenue stack capturing value at every stage of the property lifecycle. From Rp 299K investor subscriptions to Rp 50M institutional terminals. Current trajectory targets $10M ARR within 24 months.

THE INEVITABILITY: Southeast Asia's 680M people and $3T real estate market will digitize. The question isn't if — it's who controls the data layer. We intend to be that infrastructure.`
  },
  {
    format: "Media Soundbites",
    icon: Users,
    color: "text-chart-2",
    narrative: `"We're building the Bloomberg Terminal for property — except we also control the transaction rails."

"Every real estate market will have an intelligence layer within 10 years. We're building it now, city by city."

"Our AI doesn't guess — it learns from every transaction. The more deals flow through us, the smarter we get. That's a moat competitors can't buy."

"We don't sell listings. We sell liquidity intelligence. That's a fundamentally different business."

"Think of us as the operating system for real estate wealth creation. Discovery, evaluation, transaction, ownership — one intelligent platform."`
  },
  {
    format: "Team Inspiration",
    icon: Zap,
    color: "text-chart-3",
    narrative: `What we're building matters.

Right now, somewhere in Indonesia, a first-time investor is about to make the biggest financial decision of their life — and they're doing it with almost no data. No prediction accuracy. No liquidity signals. No fair market validation.

We're changing that. Every line of code we write, every AI model we train, every market we enter — it gives people the intelligence they deserve for the most important investment they'll ever make.

We're not just building a company. We're building the infrastructure that makes real estate fair, transparent, and intelligent. For everyone. Everywhere.

That's worth the long hours. That's worth the hard days. Because when we look back in 10 years, we'll know we built the system that changed how the world invests in property.`
  },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — AUTOMATION COMMAND ARCHITECTURE
   ═══════════════════════════════════════════════ */

const automationLayers = [
  {
    layer: "Signal Monitoring",
    icon: Eye,
    color: "text-primary",
    systems: [
      { name: "Inquiry Velocity Tracker", status: "active", confidence: 92, desc: "Real-time inquiry rate monitoring with 2.5σ anomaly detection. Alerts on sudden drops (>30%) or surges." },
      { name: "Vendor Responsiveness Analytics", status: "active", confidence: 88, desc: "Response time percentile ranking within cohort. Flags agents with >2h avg response for coaching intervention." },
      { name: "Monetization Conversion Monitor", status: "active", confidence: 85, desc: "Tracks premium upgrade funnel with >25% WoW decline alerts. Revenue-per-session trend analysis." },
      { name: "Market Anomaly Detection", status: "active", confidence: 90, desc: "8 trigger types: liquidity drops, demand surges, vendor churn spikes, traffic quality deterioration, and 4 more." },
    ],
  },
  {
    layer: "Action Recommendation Engine",
    icon: Target,
    color: "text-chart-4",
    systems: [
      { name: "Boost Campaign Timing", status: "active", confidence: 78, desc: "Recommends optimal visibility boost windows based on demand signals. 40-60% revenue uplift during surge periods." },
      { name: "Vendor Acquisition Targeting", status: "active", confidence: 75, desc: "Identifies high-demand districts with supply gaps. Auto-generates prioritized vendor outreach lists." },
      { name: "Investor Urgency Messaging", status: "active", confidence: 82, desc: "Triggers personalized alerts when watchlist properties show demand acceleration. 3x conversion vs. generic notifications." },
      { name: "Pricing Adjustment Proposals", status: "evolving", confidence: 68, desc: "Suggests listing price optimizations based on market position and AI FMV. Human approval required for changes >5%." },
    ],
  },
  {
    layer: "Execution Governance",
    icon: Shield,
    color: "text-chart-2",
    systems: [
      { name: "Confidence Scoring Gate", status: "active", confidence: 95, desc: "Actions require ≥90% confidence for auto-execution. 70-90% = recommendation. <70% = human-only decision." },
      { name: "Human Override Dashboard", status: "active", confidence: 98, desc: "Real-time control panel showing all pending, approved, and auto-executed actions with rollback capability." },
      { name: "Low-Risk Auto-Execution", status: "active", confidence: 91, desc: "Automated actions: alert dispatch, listing visibility adjustments, vendor badge updates. No financial actions without approval." },
      { name: "Outcome Feedback Loop", status: "active", confidence: 87, desc: "Every action's result feeds back into confidence scoring. Success raises future autonomy; failure triggers review." },
    ],
  },
  {
    layer: "Self-Learning Cycle",
    icon: RefreshCw,
    color: "text-chart-3",
    systems: [
      { name: "Experiment Reinforcement", status: "active", confidence: 72, desc: "A/B test outcomes update scoring weights via gradient adjustment. Max ±5% weight change per cycle to prevent overcorrection." },
      { name: "Model Accuracy Tracking", status: "active", confidence: 85, desc: "Continuous MAE, R², and calibration monitoring across all prediction models. Drift detection triggers auto-retraining." },
      { name: "Growth Action ROI Engine", status: "evolving", confidence: 65, desc: "Compares predicted vs. actual ROI of growth actions. Ranks future recommendations by historical performance." },
      { name: "Liquidity Stabilization Logic", status: "evolving", confidence: 70, desc: "Detects supply/demand imbalances and proposes targeted interventions. Autonomous execution at Phase 3 maturity." },
    ],
  },
];

const maturityRoadmap = [
  { phase: "Phase 1 — Assisted Intelligence", timeline: "Current → Month 6", autonomy: 25, description: "Human-directed with AI recommendations. All decisions require confirmation. Focus: data collection and model training.", color: "text-muted-foreground" },
  { phase: "Phase 2 — Augmented Operations", timeline: "Month 6-12", autonomy: 50, description: "Low-risk actions auto-execute (alerts, visibility, badges). Medium-risk actions recommended with confidence scores.", color: "text-chart-4" },
  { phase: "Phase 3 — Semi-Autonomous Platform", timeline: "Month 12-24", autonomy: 75, description: "Pricing, campaign timing, and vendor targeting operate within guardrails. Humans focus on strategy and edge cases.", color: "text-primary" },
  { phase: "Phase 4 — Intelligence-Driven OS", timeline: "Month 24+", autonomy: 92, description: "Self-evolving system discovers optimization opportunities, designs experiments, and compounds intelligence advantages autonomously.", color: "text-chart-2" },
];

const keyRisks = [
  { risk: "Data quality degradation", severity: "HIGH", mitigation: "Automated validation pipelines, anomaly detection on ingestion, and quality scoring for every data source." },
  { risk: "Model drift in new markets", severity: "HIGH", mitigation: "Shadow testing for 2 hours before promotion. Auto-rollback if any primary KPI degrades >5%." },
  { risk: "Over-automation without governance", severity: "CRITICAL", mitigation: "Confidence-gated execution. Financial actions always require human approval. Explainability audit trail for every decision." },
  { risk: "Ecosystem partner dependency", severity: "MEDIUM", mitigation: "Multi-partner strategy per service layer. No single partner >30% of any revenue stream." },
  { risk: "Geographic expansion capital burn", severity: "HIGH", mitigation: "ERS threshold-gated launches. Break-even target by month 9-10 per city. Kill criteria at month 6 if KPIs <40% of target." },
  { risk: "Competitive replication of features", severity: "MEDIUM", mitigation: "Features are replicable; data isn't. Focus on intelligence moat depth over feature breadth." },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

const GlobalOSMasterBlueprint: React.FC = () => {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Global Operating System Blueprint"
        description="Unified master architecture — 5-layer OS, founder narrative, automation command framework & maturity roadmap"
        icon={Globe}
        badge={{ text: "🌍 Master OS", variant: "outline" }}
      />

      {/* System overview strip */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "OS Layers", value: "5", icon: Layers },
          { label: "AI Engines", value: "30+", icon: Cpu },
          { label: "Data Tables", value: "450+", icon: Database },
          { label: "Revenue Streams", value: "5", icon: DollarSign },
          { label: "Provinces", value: "38", icon: Globe },
          { label: "Automation", value: "Phase 2", icon: Zap },
        ].map((s, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-3 text-center">
              <s.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="architecture" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="architecture" className="text-xs">OS Architecture</TabsTrigger>
          <TabsTrigger value="narrative" className="text-xs">Founder Vision</TabsTrigger>
          <TabsTrigger value="automation" className="text-xs">Automation</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Maturity</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Risks</TabsTrigger>
        </TabsList>

        {/* ── SECTION 1: OS ARCHITECTURE ── */}
        <TabsContent value="architecture" className="mt-4 space-y-3">
          {osLayers.map((layer) => (
            <Card key={layer.id} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}>
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-xl shrink-0", layer.bg)}>
                      <layer.icon className={cn("h-5 w-5", layer.color)} />
                    </div>
                    <div>
                      <h4 className={cn("text-sm font-bold", layer.color)}>{layer.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{layer.modules.length} modules</p>
                    </div>
                  </div>
                  {expandedLayer === layer.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>

                {expandedLayer === layer.id && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {layer.modules.map((m, j) => (
                        <div key={j} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
                          <p className="text-xs font-semibold text-foreground">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{m.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/20">
                      <p className="text-[10px] font-semibold text-chart-2">DEFENSIBILITY</p>
                      <p className="text-[11px] text-foreground mt-0.5">{layer.defensibility}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── SECTION 2: FOUNDER NARRATIVE ── */}
        <TabsContent value="narrative" className="mt-4 space-y-4">
          {narrativeFormats.map((nf, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <nf.icon className={cn("h-4 w-4", nf.color)} /> {nf.format}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-xs text-foreground/85 leading-relaxed bg-muted/10 rounded-lg p-4 border border-border/20">
                  {nf.narrative}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── SECTION 3: AUTOMATION COMMAND ── */}
        <TabsContent value="automation" className="mt-4 space-y-4">
          {automationLayers.map((al, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <al.icon className={cn("h-4 w-4", al.color)} /> {al.layer}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {al.systems.map((sys, j) => (
                  <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-foreground">{sys.name}</p>
                        <Badge variant={sys.status === "active" ? "default" : "secondary"} className="text-[8px]">{sys.status}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{sys.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold", sys.confidence >= 85 ? "text-chart-2" : sys.confidence >= 70 ? "text-chart-4" : "text-muted-foreground")}>{sys.confidence}%</p>
                      <p className="text-[8px] text-muted-foreground">confidence</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── MATURITY ROADMAP ── */}
        <TabsContent value="roadmap" className="mt-4 space-y-3">
          {maturityRoadmap.map((p, i) => (
            <Card key={i} className={cn("border-border", i === 1 && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={cn("text-sm font-bold", p.color)}>{p.phase}</h4>
                    <p className="text-[10px] text-muted-foreground">{p.timeline}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-lg font-bold", p.color)}>{p.autonomy}%</p>
                    <p className="text-[8px] text-muted-foreground">Autonomy</p>
                  </div>
                </div>
                <Progress value={p.autonomy} className="h-2" />
                <p className="text-[11px] text-foreground">{p.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-2">
          {keyRisks.map((r, i) => (
            <Card key={i} className={cn("border-border", r.severity === "CRITICAL" && "border-destructive/30")}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-0.5", r.severity === "CRITICAL" ? "text-destructive" : r.severity === "HIGH" ? "text-chart-4" : "text-muted-foreground")} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">{r.risk}</p>
                      <Badge variant={r.severity === "CRITICAL" ? "destructive" : r.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{r.severity}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{r.mitigation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalOSMasterBlueprint;
