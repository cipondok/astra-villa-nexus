import React, { useState } from "react";
import { Mic, TrendingUp, Shield, Layers, Globe, Zap, ChevronDown, ChevronUp, Target, BarChart3, Users, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ─── Narrative Scenarios ─── */

const narratives = [
  {
    id: "tech-inevitability",
    title: "Technology Inevitability",
    subtitle: "We are not building a product — we are building the infrastructure that makes every future property transaction intelligent.",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    psychology: "Triggers loss-aversion bias. Investors fear being on the wrong side of a technology shift more than they fear overpaying. Positions the platform as an unstoppable force rather than a startup seeking validation.",
    pitchFraming: [
      "Every real estate market globally will digitize intelligence within 10 years. The question is not if — it's who controls the data layer.",
      "We've built 450+ data tables and 30+ autonomous AI engines. This isn't a listing portal — it's a real estate operating system.",
      "Our intelligence compounds: every transaction makes our predictions more accurate, which attracts more capital, which generates more transactions.",
    ],
    metricsToHighlight: [
      { metric: "AI Prediction Accuracy", value: "82%+", context: "Improving 2-3% per quarter via self-learning engine" },
      { metric: "Intelligence Coverage", value: "38 Provinces", context: "District-level pricing, demand, and liquidity signals" },
      { metric: "Autonomous AI Workers", value: "30+", context: "Zero-latency scoring across opportunity, liquidity, pricing" },
      { metric: "Data Moat Depth", value: "450+ Tables", context: "Behavioral, transactional, and market intelligence layers" },
    ],
    riskMitigation: [
      { risk: "Technology is replicable", response: "Our data advantage compounds. A competitor starting today needs 2+ years of transaction data to match our model accuracy. By then, we're 3 generations ahead." },
      { risk: "AI is hype-driven", response: "Our AI isn't a feature — it's the architecture. Every scoring engine runs on real outcomes, not training data. We show accuracy metrics publicly." },
    ],
    investorReaction: { excited: 45, interested: 35, cautious: 15, skeptical: 5 },
    valuationUplift: "2.5-4x revenue multiple premium vs. traditional portal",
    credibilityActions: ["Publish quarterly AI accuracy reports", "Open-source a non-core prediction model", "Secure academic partnership for model validation"],
  },
  {
    id: "market-infrastructure",
    title: "Market Infrastructure Control",
    subtitle: "We don't participate in the market — we ARE the market. Every transaction, every valuation, every deal flows through our rails.",
    icon: Layers,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    psychology: "Activates the 'toll-booth' investment thesis. Infrastructure companies command premium valuations because they capture value from every participant regardless of who wins. Investors see predictable, defensible revenue.",
    pitchFraming: [
      "Think of us as the Bloomberg Terminal for property investment — except we also control the transaction rails.",
      "We're building the layer between capital and real estate that every investor, agent, and developer will depend on.",
      "Our monetization deepens with every layer: listings → transactions → financing → data APIs → capital markets.",
    ],
    metricsToHighlight: [
      { metric: "Revenue Layers", value: "5 Active", context: "Marketplace, vendor subs, investor SaaS, data APIs, capital markets" },
      { metric: "Vendor Lock-in", value: "85%+ Retention", context: "Multi-service dependency creates natural switching cost" },
      { metric: "Transaction Rails", value: "End-to-End", context: "Discovery → evaluation → transaction → ownership lifecycle" },
      { metric: "Institutional Pipeline", value: "$1B+ Visibility", context: "Annual deal flow accessible through platform intelligence" },
    ],
    riskMitigation: [
      { risk: "Infrastructure takes time to build", response: "We've already built it. 450+ tables, 30+ AI engines, 5 revenue layers. We're past the 'building' phase — we're in the 'compounding' phase." },
      { risk: "Regulatory risk in financial infrastructure", response: "We're information infrastructure, not financial infrastructure. We inform decisions; we don't hold capital or issue financial products." },
    ],
    investorReaction: { excited: 40, interested: 40, cautious: 15, skeptical: 5 },
    valuationUplift: "3-5x multiple premium — infrastructure businesses trade at 15-25x ARR",
    credibilityActions: ["Announce first institutional data API partnership", "Publish infrastructure reliability SLA commitments", "Demonstrate multi-revenue-stream unit economics"],
  },
  {
    id: "liquidity-network",
    title: "Liquidity Network Effect Dominance",
    subtitle: "More investors attract more listings. More listings attract more investors. We've ignited the flywheel — and it's accelerating.",
    icon: TrendingUp,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    psychology: "Network effect narratives are the strongest driver of venture valuations. Investors understand that once a marketplace achieves liquidity density, it becomes nearly impossible to displace. This triggers urgency — the window to invest at current valuations is closing.",
    pitchFraming: [
      "We measure liquidity density, not just listings. Our districts hit the tipping point where every new participant accelerates the entire network.",
      "Our flywheel has 6 stages: Supply → Quality → Demand → Monetization → Intelligence → Authority. Each stage reinforces the next.",
      "Network effects in property are local — which means you need to win city by city. We've cracked the playbook and can replicate it in 90 days per city.",
    ],
    metricsToHighlight: [
      { metric: "Flywheel Velocity", value: "Accelerating", context: "6-stage compounding loop with measurable stage health" },
      { metric: "Liquidity Density", value: "District-Level", context: "Absorption rates, inquiry velocity, and conversion tracking" },
      { metric: "City Replication Time", value: "90 Days", context: "Proven playbook from first city to operational liquidity" },
      { metric: "Cross-Side Effects", value: "2.3x", context: "Each new vendor attracts 2.3 additional investor sessions" },
    ],
    riskMitigation: [
      { risk: "Network effects haven't proven yet", response: "We track cross-side elasticity live. Our dashboard shows that each 10% supply increase drives 15% demand increase. The flywheel is measured, not assumed." },
      { risk: "Local network effects don't scale", response: "We've designed for local density with global intelligence. Each city's data improves every other city's predictions. Local liquidity, global learning." },
    ],
    investorReaction: { excited: 50, interested: 30, cautious: 15, skeptical: 5 },
    valuationUplift: "4-8x premium — marketplace network effects justify winner-take-most pricing",
    credibilityActions: ["Show live flywheel dashboard to investors", "Demonstrate city-2 replication metrics vs. city-1", "Publish cross-side elasticity data quarterly"],
  },
  {
    id: "super-platform",
    title: "Ecosystem Super-Platform Transformation",
    subtitle: "We started as a marketplace. We're becoming the operating system for real estate wealth creation across Southeast Asia.",
    icon: Globe,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    psychology: "Super-app narratives justify the highest valuations because they imply expanding TAM. Investors see multiple $B opportunities within a single investment. This narrative works best when the core marketplace has proven traction and the expansion layers are credibly adjacent.",
    pitchFraming: [
      "Our 5-layer ecosystem covers the entire property investment lifecycle: Discovery, Evaluation, Transaction, Ownership, and Growth.",
      "We're not just capturing the transaction — we're capturing the lifetime value of every property relationship.",
      "Southeast Asia has 680M people and $3T in real estate. There is no super-app for property intelligence. We're building it.",
    ],
    metricsToHighlight: [
      { metric: "Ecosystem Layers", value: "5 Active", context: "Marketplace, Intelligence, Services, Community, Infrastructure" },
      { metric: "TAM Expansion", value: "$3T+", context: "SE Asia real estate — capturing transaction, services, and financing layers" },
      { metric: "Lifecycle Coverage", value: "End-to-End", context: "Discovery through ownership — no competitor covers this span" },
      { metric: "Revenue per User", value: "Expanding", context: "Multi-service attachment rate growing 15% MoM" },
    ],
    riskMitigation: [
      { risk: "Super-app is overambitious", response: "We're executing in phases. Phase 1 (marketplace) is proven. Phase 2 (transactions) is live. Phases 3-4 are roadmapped with validated demand signals." },
      { risk: "Spreading too thin", response: "Each layer reinforces the core. Financing deepens transactions. Services increase retention. Data intelligence improves matching. Nothing is standalone." },
    ],
    investorReaction: { excited: 35, interested: 35, cautious: 20, skeptical: 10 },
    valuationUplift: "5-10x multiple premium at scale — super-app platforms valued on ecosystem GMV",
    credibilityActions: ["Launch one adjacent service with proven demand", "Show multi-layer user journey analytics", "Announce strategic partnership for financing layer"],
  },
];

/* ─── Reaction Spectrum Colors ─── */
const reactionColors: Record<string, string> = {
  excited: "text-chart-2",
  interested: "text-primary",
  cautious: "text-chart-4",
  skeptical: "text-destructive",
};

/* ─── Component ─── */

const InvestorNarrativeDominance: React.FC = () => {
  const [expandedNarrative, setExpandedNarrative] = useState<string | null>("tech-inevitability");

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Investor Narrative Dominance"
        description="4 positioning scenarios with psychological impact analysis, pitch framing, risk mitigation & valuation uplift simulation"
        icon={Mic}
        badge={{ text: "🎯 Narrative", variant: "outline" }}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {narratives.map(n => (
          <Card key={n.id} className={cn("border-border cursor-pointer hover:border-primary/30 transition-all", expandedNarrative === n.id && "border-primary/50 bg-primary/5")} onClick={() => setExpandedNarrative(n.id)}>
            <CardContent className="p-3 text-center">
              <n.icon className={cn("h-4 w-4 mx-auto mb-1", n.color)} />
              <p className="text-xs font-bold text-foreground">{n.title}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{n.valuationUplift.split("—")[0].trim()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed view */}
      {narratives.filter(n => n.id === expandedNarrative).map(n => (
        <div key={n.id} className="space-y-4">
          {/* Hero */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={cn("p-2.5 rounded-xl shrink-0", n.bg)}>
                  <n.icon className={cn("h-5 w-5", n.color)} />
                </div>
                <div>
                  <h3 className={cn("text-lg font-bold", n.color)}>{n.title}</h3>
                  <p className="text-sm text-foreground/80 italic mt-1">"{n.subtitle}"</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="psychology" className="w-full">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="psychology" className="text-xs">Psychology</TabsTrigger>
              <TabsTrigger value="pitch" className="text-xs">Pitch Framing</TabsTrigger>
              <TabsTrigger value="metrics" className="text-xs">Key Metrics</TabsTrigger>
              <TabsTrigger value="risks" className="text-xs">Risk Mitigation</TabsTrigger>
              <TabsTrigger value="simulation" className="text-xs">Simulation</TabsTrigger>
            </TabsList>

            {/* Psychology */}
            <TabsContent value="psychology" className="mt-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Investor Psychological Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed">{n.psychology}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pitch Framing */}
            <TabsContent value="pitch" className="mt-4 space-y-3">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Mic className="h-4 w-4 text-chart-4" /> Suggested Pitch Language</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {n.pitchFraming.map((line, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-chart-4/5 border border-chart-4/15">
                      <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5">{i + 1}</Badge>
                      <p className="text-sm text-foreground italic">"{line}"</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Key Metrics */}
            <TabsContent value="metrics" className="mt-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-2" /> Traction Metrics to Highlight</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {n.metricsToHighlight.map((m, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{m.metric}</span>
                        <span className="text-sm font-bold text-foreground">{m.value}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{m.context}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk Mitigation */}
            <TabsContent value="risks" className="mt-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-destructive" /> Risk Perception Mitigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {n.riskMitigation.map((r, i) => (
                    <div key={i} className="rounded-lg border border-border/40 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[9px]">Objection</Badge>
                        <p className="text-xs font-semibold text-foreground">"{r.risk}"</p>
                      </div>
                      <div className="flex items-start gap-2 pl-2 border-l-2 border-chart-2/40">
                        <p className="text-[11px] text-foreground">{r.response}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Simulation */}
            <TabsContent value="simulation" className="mt-4 space-y-4">
              {/* Reaction Spectrum */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Investor Reaction Spectrum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(n.investorReaction).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-medium capitalize", reactionColors[key])}>{key}</span>
                        <span className={cn("text-sm font-bold", reactionColors[key])}>{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Valuation & Credibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-2" /> Valuation Uplift</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-chart-2">{n.valuationUplift.split("—")[0].trim()}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{n.valuationUplift.includes("—") ? n.valuationUplift.split("—")[1].trim() : ""}</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-chart-4" /> Credibility Reinforcement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {n.credibilityActions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-chart-2 text-xs mt-0.5">✓</span>
                        <p className="text-[11px] text-foreground">{a}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ))}
    </div>
  );
};

export default InvestorNarrativeDominance;
