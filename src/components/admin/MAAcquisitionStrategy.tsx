import React, { useState } from "react";
import { Handshake, Copy, Check, ChevronDown, ChevronUp, Target, Shield, TrendingUp, AlertTriangle, Zap, BarChart3, Clock, DollarSign, Layers, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── data ───────── */

interface AcquisitionScenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  targetProfile: string;
  estimatedCost: string;
  timeToClose: string;
  strategicBenefits: string[];
  liquidityImpact: { metric: string; projection: string }[];
  revenueImpact: { metric: string; projection: string }[];
  integrationComplexity: { area: string; difficulty: "low" | "medium" | "high"; detail: string }[];
  risks: { risk: string; severity: "low" | "medium" | "high"; mitigation: string }[];
  evaluation: { criterion: string; score: number; rationale: string }[];
}

const difficultyColors = {
  low: "text-chart-3 bg-chart-3/10 border-chart-3/30",
  medium: "text-chart-4 bg-chart-4/10 border-chart-4/30",
  high: "text-chart-1 bg-chart-1/10 border-chart-1/30",
};

const scenarios: AcquisitionScenario[] = [
  {
    id: "listing-portal",
    title: "Local Listing Portal Consolidation",
    icon: <Building className="h-5 w-5" />,
    targetProfile: "Small-to-mid regional listing portals with 500-2,000 active listings, established vendor relationships, and moderate traffic (50K-200K monthly visits). Typically bootstrapped or lightly funded, operating in tier-2 Indonesian cities.",
    estimatedCost: "Rp 2-8B ($130K-$520K) per acquisition",
    timeToClose: "60-90 days",
    strategicBenefits: [
      "Instant supply injection — acquire 500-2,000 verified listings per portal without vendor-by-vendor onboarding",
      "Vendor relationship transfer — inherit established trust with local agents and developers",
      "Geographic beachhead — enter new cities with existing market presence rather than cold-start",
      "Traffic absorption — redirect existing organic traffic to ASTRA platform",
      "Competitive elimination — remove fragmented competitors from the landscape",
    ],
    liquidityImpact: [
      { metric: "Listings added per acquisition", projection: "+500-2,000 within 30 days of integration" },
      { metric: "Inquiry velocity boost", projection: "+35-60% in target city within 60 days" },
      { metric: "Cross-side density improvement", projection: "+2.5 investors/listing from traffic redirect" },
    ],
    revenueImpact: [
      { metric: "Immediate subscription migration", projection: "Rp 40-80M/month from existing vendor plans" },
      { metric: "Upsell opportunity", projection: "30% of migrated vendors upgrade within 90 days" },
      { metric: "12-month revenue contribution", projection: "Rp 600M-1.2B per acquired portal" },
    ],
    integrationComplexity: [
      { area: "Data migration", difficulty: "medium", detail: "Listing data cleanup, image re-hosting, schema normalization. Estimate 2-4 weeks." },
      { area: "Vendor transition", difficulty: "high", detail: "Personal communication required for each vendor. 15-20% churn risk during migration." },
      { area: "Technology sunset", difficulty: "low", detail: "Redirect domains, sunset legacy platform. Minimal technical complexity." },
      { area: "Brand consolidation", difficulty: "medium", detail: "Rebrand under ASTRA while preserving local trust signals." },
    ],
    risks: [
      { risk: "Vendor churn during migration — agents may leave during platform transition", severity: "high", mitigation: "Offer 3-month free premium access to all migrating vendors. Assign dedicated account manager." },
      { risk: "Data quality degradation — legacy listings may have incomplete or outdated information", severity: "medium", mitigation: "Run automated quality audit before migration. Flag and quarantine sub-standard listings." },
      { risk: "Overpayment for declining assets — portal traffic may be artificially inflated", severity: "medium", mitigation: "Require 6-month verified analytics access. Use independent traffic verification." },
    ],
    evaluation: [
      { criterion: "Capital Efficiency", score: 78, rationale: "Moderate cost per listing acquired ($65-260/listing) vs organic CAC. Positive ROI within 8-12 months." },
      { criterion: "Moat Strengthening", score: 85, rationale: "Eliminates fragmented competitors and increases data density in target markets." },
      { criterion: "Time-to-Market Acceleration", score: 92, rationale: "Bypasses 4-6 month cold-start city launch. Immediate supply and traffic presence." },
      { criterion: "Valuation Impact", score: 70, rationale: "Demonstrates consolidation capability. Increases TAM capture narrative for investors." },
    ],
  },
  {
    id: "tech-startup",
    title: "Niche Technology Startup Acquisition",
    icon: <Zap className="h-5 w-5" />,
    targetProfile: "Early-stage PropTech startups with specialized capabilities: AI valuation models, 3D property scanning, mortgage comparison engines, or tenant screening tools. Team size 3-12, pre-revenue or early revenue.",
    estimatedCost: "Rp 5-15B ($325K-$975K) acqui-hire + technology",
    timeToClose: "90-120 days",
    strategicBenefits: [
      "Technology capability injection — acquire 6-18 months of R&D in a single transaction",
      "Talent acquisition — secure specialized engineering and data science talent",
      "Product differentiation acceleration — add unique features competitors cannot easily replicate",
      "Patent and IP portfolio expansion — strengthen defensive intellectual property position",
      "Innovation narrative for investors — demonstrate aggressive technology strategy",
    ],
    liquidityImpact: [
      { metric: "Indirect liquidity boost from enhanced UX", projection: "+15-25% engagement depth within 90 days of feature integration" },
      { metric: "New user acquisition from product differentiation", projection: "+20% organic traffic from unique feature marketing" },
      { metric: "Conversion improvement from better matching", projection: "+3-5pp inquiry-to-viewing rate" },
    ],
    revenueImpact: [
      { metric: "New monetization surface", projection: "AI valuation reports: Rp 50-99K/report × estimated 500/month = Rp 25-50M/month" },
      { metric: "Subscription premium justification", projection: "Enable 20-30% price increase on premium tiers" },
      { metric: "18-month revenue contribution", projection: "Rp 450M-900M from new product lines" },
    ],
    integrationComplexity: [
      { area: "Technology integration", difficulty: "high", detail: "Different tech stacks, API design patterns. Estimate 2-4 months for full integration." },
      { area: "Team integration", difficulty: "high", detail: "Culture alignment, role clarity, retention risk. Key-person dependencies." },
      { area: "Product roadmap alignment", difficulty: "medium", detail: "Reprioritize acquired team's backlog to align with ASTRA roadmap." },
      { area: "IP transfer and licensing", difficulty: "low", detail: "Standard asset purchase agreement. Clean IP assignment." },
    ],
    risks: [
      { risk: "Key talent departure post-acquisition — founders or lead engineers may leave after vesting", severity: "high", mitigation: "Structure earn-out over 24-36 months. Retention bonuses tied to integration milestones." },
      { risk: "Technology debt inheritance — acquired codebase may be unmaintainable", severity: "medium", mitigation: "Conduct thorough technical due diligence. Budget for rebuild if needed." },
      { risk: "Integration distraction — engineering bandwidth diverted from core product", severity: "medium", mitigation: "Isolate integration team. Set strict 90-day integration timeline with kill switch." },
    ],
    evaluation: [
      { criterion: "Capital Efficiency", score: 62, rationale: "Higher upfront cost with longer payback. Justified only for significant capability gaps." },
      { criterion: "Moat Strengthening", score: 90, rationale: "Directly expands intelligence moat. Acquired IP becomes permanent competitive advantage." },
      { criterion: "Time-to-Market Acceleration", score: 85, rationale: "Saves 12-18 months of internal R&D. Immediate product differentiation." },
      { criterion: "Valuation Impact", score: 88, rationale: "Strong narrative value. Demonstrates technology-first strategy to institutional investors." },
    ],
  },
  {
    id: "brokerage-network",
    title: "Brokerage Network Integration",
    icon: <Handshake className="h-5 w-5" />,
    targetProfile: "Established real estate brokerage firms with 50-200 active agents, strong brand in specific districts, and existing transaction infrastructure. Revenue Rp 2-10B/year from commissions.",
    estimatedCost: "Rp 10-30B ($650K-$1.95M) — equity swap or structured buyout",
    timeToClose: "120-180 days",
    strategicBenefits: [
      "Transaction layer acquisition — gain immediate access to deal flow, closing infrastructure, and commission streams",
      "Agent network — onboard 50-200 verified agents with existing client relationships in a single transaction",
      "Revenue acceleration — inherit Rp 2-10B/year in existing commission revenue",
      "Trust signal amplification — leverage established brokerage brand for marketplace credibility",
      "Exclusive listing pipeline — secure priority access to off-market and pre-launch properties",
    ],
    liquidityImpact: [
      { metric: "Agent-sourced listing injection", projection: "+200-800 exclusive listings within 60 days" },
      { metric: "Transaction velocity boost", projection: "+40-60% closed deals/month in target districts" },
      { metric: "Off-market deal flow", projection: "15-25% of brokerage pipeline becomes platform-exclusive" },
    ],
    revenueImpact: [
      { metric: "Commission revenue inheritance", projection: "Rp 2-10B/year immediately post-close" },
      { metric: "Platform monetization uplift", projection: "Agents drive +Rp 80-150M/month in boost and premium purchases" },
      { metric: "24-month total revenue contribution", projection: "Rp 5-22B including platform effects" },
    ],
    integrationComplexity: [
      { area: "Agent workflow migration", difficulty: "high", detail: "Agents have established workflows. Change management requires 3-6 month transition." },
      { area: "Commission structure harmonization", difficulty: "high", detail: "Reconcile brokerage splits with platform fee model. Sensitive negotiation." },
      { area: "Legal and compliance", difficulty: "medium", detail: "Real estate brokerage licensing, regulatory filings, liability transfer." },
      { area: "Brand integration", difficulty: "medium", detail: "Dual-brand or absorption strategy. Market perception management." },
    ],
    risks: [
      { risk: "Agent rebellion — experienced agents may resist platform-mandated workflows", severity: "high", mitigation: "Co-design transition with top 10 agents. Offer income guarantees for first 6 months." },
      { risk: "Commission margin compression — brokerage economics may conflict with platform fee model", severity: "high", mitigation: "Model hybrid revenue share that rewards platform-generated leads at premium rates." },
      { risk: "Regulatory complexity — brokerage acquisition may trigger licensing requirements", severity: "medium", mitigation: "Engage regulatory counsel pre-LOI. Structure as asset purchase if licensing transfer is complex." },
    ],
    evaluation: [
      { criterion: "Capital Efficiency", score: 55, rationale: "Highest cost scenario. Justified only if brokerage is profitable and strategic fit is strong." },
      { criterion: "Moat Strengthening", score: 82, rationale: "Transaction layer control creates powerful defensibility. Competitors cannot easily replicate." },
      { criterion: "Time-to-Market Acceleration", score: 75, rationale: "Complex integration offsets speed advantage. Net 6-month acceleration vs organic." },
      { criterion: "Valuation Impact", score: 92, rationale: "Revenue-accretive acquisition dramatically improves ARR metrics for next funding round." },
    ],
  },
  {
    id: "data-platform",
    title: "Data Intelligence Platform Merger",
    icon: <BarChart3 className="h-5 w-5" />,
    targetProfile: "Analytics or data companies with proprietary real estate datasets — price indices, rental yield databases, construction permit data, demographic overlays. May include government data aggregators or academic spin-offs.",
    estimatedCost: "Rp 8-25B ($520K-$1.6M) — merger of equals or majority acquisition",
    timeToClose: "120-150 days",
    strategicBenefits: [
      "Data moat explosion — acquire years of historical market data that cannot be replicated organically",
      "Prediction accuracy leap — enrich AI models with external signals for dramatically better forecasting",
      "Institutional product enablement — data depth required for enterprise and fund manager products",
      "API monetization foundation — create licensable data products for third-party consumption",
      "Category definition reinforcement — position as 'intelligence infrastructure' not just marketplace",
    ],
    liquidityImpact: [
      { metric: "Prediction accuracy improvement", projection: "+12-18pp accuracy within 90 days of data integration" },
      { metric: "Investor confidence boost", projection: "+25% deal unlock rate from enhanced intelligence" },
      { metric: "Institutional inquiry pipeline", projection: "3-5 institutional leads within 6 months" },
    ],
    revenueImpact: [
      { metric: "Data API licensing", projection: "Rp 50-200M/month from institutional and developer access" },
      { metric: "Premium tier upgrade justification", projection: "+35% subscription upgrade rate from enriched analytics" },
      { metric: "24-month revenue contribution", projection: "Rp 1.2-4.8B from data monetization + indirect effects" },
    ],
    integrationComplexity: [
      { area: "Data pipeline integration", difficulty: "high", detail: "Schema harmonization, ETL pipelines, quality assurance. Estimate 3-5 months." },
      { area: "Model retraining", difficulty: "medium", detail: "Incorporate new data signals into existing AI models. 4-8 weeks of ML engineering." },
      { area: "Team and culture", difficulty: "medium", detail: "Data scientists may have different product philosophy. Alignment sessions required." },
      { area: "Data licensing and rights", difficulty: "high", detail: "Verify data provenance, licensing terms, and commercial use rights for all datasets." },
    ],
    risks: [
      { risk: "Data quality uncertainty — acquired datasets may have gaps, biases, or freshness issues", severity: "high", mitigation: "Conduct 30-day data quality audit pre-close. Include quality guarantees in purchase agreement." },
      { risk: "Licensing restrictions — some data may not be commercially transferable", severity: "medium", mitigation: "Full legal review of all data source agreements. Carve out restricted datasets from valuation." },
      { risk: "Integration timeline overrun — data integration is notoriously complex and unpredictable", severity: "medium", mitigation: "Phase integration in 3 stages. Accept 60% value in first 90 days, full integration by month 6." },
    ],
    evaluation: [
      { criterion: "Capital Efficiency", score: 68, rationale: "Moderate cost relative to value of proprietary data. Positive ROI within 12-18 months from API licensing alone." },
      { criterion: "Moat Strengthening", score: 95, rationale: "Strongest moat impact of all scenarios. Proprietary data is the ultimate defensibility layer." },
      { criterion: "Time-to-Market Acceleration", score: 80, rationale: "Saves 2-3 years of organic data collection. Enables institutional products immediately." },
      { criterion: "Valuation Impact", score: 90, rationale: "Transforms valuation narrative from 'marketplace' to 'intelligence infrastructure' — 3-5x multiple expansion." },
    ],
  },
];

const phaseRoadmap = [
  { phase: "Phase 1 — Opportunistic Consolidation (Months 1-12)", items: ["Acquire 2-3 local listing portals in expansion target cities", "Budget: Rp 6-24B total", "Goal: Instant supply injection + competitor elimination", "Priority: Cities with highest demand signals and weakest incumbent portals"] },
  { phase: "Phase 2 — Capability Acceleration (Months 6-18)", items: ["Acquire 1 niche tech startup for AI/ML capability gap", "Budget: Rp 5-15B", "Goal: 12-18 month R&D shortcut + talent acquisition", "Priority: Valuation engine or property scanning technology"] },
  { phase: "Phase 3 — Revenue Transformation (Months 12-24)", items: ["Strategic brokerage partnership or minority acquisition", "Budget: Rp 10-20B or equity swap", "Goal: Transaction layer control + commission revenue stream", "Priority: Top 3 brokerage in Jakarta or Surabaya"] },
  { phase: "Phase 4 — Intelligence Dominance (Months 18-30)", items: ["Data platform merger for institutional-grade intelligence", "Budget: Rp 8-25B", "Goal: Unassailable data moat + API monetization", "Priority: Historical price data + demographic overlay provider"] },
];

/* ───────── component ───────── */

const MAAcquisitionStrategy: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>("listing-portal");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copy(text, id)}>
      {copiedId === id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="M&A Acquisition Strategy"
        description="Strategic acquisition & merger simulations — listing portals, tech startups, brokerage networks & data platforms with evaluation scoring"
        icon={Handshake}
        badge={{ text: "🏗️ M&A", variant: "outline" }}
      />

      {/* Scenario Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenarios.map(s => {
          const avgScore = Math.round(s.evaluation.reduce((sum, e) => sum + e.score, 0) / s.evaluation.length);
          const color = avgScore >= 80 ? "text-chart-3" : avgScore >= 65 ? "text-chart-4" : "text-chart-1";
          return (
            <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow border-border" onClick={() => setExpanded(s.id)}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-xs font-semibold text-foreground truncate">{s.title.replace(" Acquisition", "").replace(" Consolidation", "").replace(" Integration", "").replace(" Merger", "")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{s.estimatedCost.split("(")[0].trim()}</span>
                  <span className={cn("text-lg font-bold", color)}>{avgScore}</span>
                </div>
                <Progress value={avgScore} className="h-1.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scenario Detail Cards */}
      {scenarios.map(scenario => {
        const avgScore = Math.round(scenario.evaluation.reduce((sum, e) => sum + e.score, 0) / scenario.evaluation.length);
        return (
          <Card key={scenario.id} className="border-border overflow-hidden">
            <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(prev => prev === scenario.id ? null : scenario.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{scenario.icon}</div>
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">{scenario.title}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]"><DollarSign className="h-3 w-3 mr-0.5" />{scenario.estimatedCost.split("(")[0].trim()}</Badge>
                      <Badge variant="outline" className="text-[10px]"><Clock className="h-3 w-3 mr-0.5" />{scenario.timeToClose}</Badge>
                    </div>
                  </div>
                </div>
                {expanded === scenario.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardHeader>

            {expanded === scenario.id && (
              <CardContent className="pt-0 space-y-4">
                {/* Target Profile */}
                <div className="bg-muted/30 rounded-[6px] p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Target Profile</p>
                  <p className="text-xs text-foreground">{scenario.targetProfile}</p>
                </div>

                <Tabs defaultValue="benefits" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="benefits" className="text-[11px]">Benefits</TabsTrigger>
                    <TabsTrigger value="impact" className="text-[11px]">Impact</TabsTrigger>
                    <TabsTrigger value="risks" className="text-[11px]">Risks</TabsTrigger>
                    <TabsTrigger value="evaluation" className="text-[11px]">Evaluation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="benefits" className="space-y-1.5 mt-3">
                    {scenario.strategicBenefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-[6px] p-2.5 group">
                        <TrendingUp className="h-3.5 w-3.5 text-chart-3 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground flex-1">{b}</p>
                        <CopyBtn text={b} id={`${scenario.id}-b-${i}`} />
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="impact" className="space-y-4 mt-3">
                    <div className="space-y-2">
                      <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-primary" /> Liquidity Impact</h6>
                      {scenario.liquidityImpact.map((li, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/30 rounded-[6px] p-2.5">
                          <span className="text-xs text-foreground">{li.metric}</span>
                          <Badge variant="outline" className="text-[10px]">{li.projection}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-primary" /> Revenue Impact</h6>
                      {scenario.revenueImpact.map((ri, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/30 rounded-[6px] p-2.5">
                          <span className="text-xs text-foreground">{ri.metric}</span>
                          <Badge variant="outline" className="text-[10px]">{ri.projection}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-chart-4" /> Integration Complexity</h6>
                      {scenario.integrationComplexity.map((ic, i) => (
                        <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-[6px] p-2.5">
                          <span className="text-xs font-medium text-foreground w-28 shrink-0">{ic.area}</span>
                          <Badge variant="outline" className={cn("text-[9px] shrink-0", difficultyColors[ic.difficulty])}>{ic.difficulty}</Badge>
                          <span className="text-[11px] text-muted-foreground">{ic.detail}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="risks" className="space-y-2 mt-3">
                    {scenario.risks.map((r, i) => (
                      <div key={i} className={cn("rounded-[6px] border p-3 space-y-2", difficultyColors[r.severity])}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium">{r.risk}</p>
                          <Badge variant="outline" className="text-[9px] uppercase shrink-0">{r.severity}</Badge>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Shield className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          <p className="text-[11px] opacity-80">{r.mitigation}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="evaluation" className="space-y-2 mt-3">
                    {scenario.evaluation.map((ev, i) => {
                      const color = ev.score >= 80 ? "text-chart-3" : ev.score >= 65 ? "text-chart-4" : "text-chart-1";
                      return (
                        <div key={i} className="rounded-[6px] border border-border p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">{ev.criterion}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={ev.score} className="h-1.5 w-16" />
                              <span className={cn("text-sm font-bold", color)}>{ev.score}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{ev.rationale}</p>
                        </div>
                      );
                    })}
                    <div className="rounded-[6px] bg-primary/5 border border-primary/20 p-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">Composite Score</span>
                        <span className="text-xl font-bold text-primary">{avgScore}/100</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Phased Roadmap */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> M&A Execution Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {phaseRoadmap.map((phase, i) => (
              <div key={i} className="rounded-[6px] border border-border bg-card p-3 space-y-2">
                <span className="text-sm font-semibold text-foreground">{phase.phase}</span>
                <div className="space-y-1">
                  {phase.items.map((item, j) => (
                    <p key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
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

export default MAAcquisitionStrategy;
