import React, { useState } from "react";
import {
  Hourglass, Globe, Shield, Users, AlertTriangle, TrendingUp,
  Eye, Scale, BookOpen, Brain, Crown, Lock, Activity, Heart,
  Building, ChevronRight, Landmark
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — 100-YEAR VISION
   ═══════════════════════════════════════════════ */

const decades = [
  { era: "2024–2034", title: "Intelligence Dominance", phase: "Foundation → Scale", color: "text-chart-4",
    description: "Build and prove the intelligence advantage. Achieve $100M ARR. IPO. Establish platform as Indonesia's real estate operating system.",
    capabilities: ["AI-driven property valuation becomes banking standard", "30+ cities with >50% listing coverage", "Transaction infrastructure processing 5,000+ deals/month", "Institutional data terminal serving sovereign funds and banks"],
    marketContext: "Indonesia urbanization accelerating. Digital property adoption inflection point. First-mover advantage window." },
  { era: "2034–2044", title: "Regional Infrastructure", phase: "Scale → Institution", color: "text-primary",
    description: "Expand across Southeast Asia via licensing/JV. Platform data becomes regional benchmark. Begin cross-border capital coordination.",
    capabilities: ["12+ country presence via technology licensing partnerships", "Cross-border investment routing for institutional capital", "Regulatory technology partner to 5+ national governments", "AI prediction accuracy exceeds human expert consensus by 40%"],
    marketContext: "ASEAN economic integration deepens. Real estate tokenization matures. Climate-driven urban migration reshapes demand." },
  { era: "2044–2054", title: "Global Coordination Layer", phase: "Institution → Infrastructure", color: "text-chart-2",
    description: "Platform evolves from marketplace to global real estate intelligence infrastructure. Pricing data referenced by central banks worldwide.",
    capabilities: ["Global real estate liquidity index published quarterly — cited in monetary policy", "Property lifecycle fully digitized: discovery → ownership → management → exit", "AI models self-evolve with minimal human intervention", "Platform processes $1T+ in annual transaction intelligence"],
    marketContext: "Autonomous AI systems mature. Quantum computing enables real-time global market simulation. Climate adaptation reshapes property values." },
  { era: "2054–2074", title: "Economic Coordination System", phase: "Infrastructure → System", color: "text-chart-1",
    description: "Platform becomes an economic coordination layer — optimizing capital allocation across real estate and adjacent asset classes globally.",
    capabilities: ["Cross-asset intelligence: real estate ↔ infrastructure ↔ energy ↔ urban planning", "Autonomous market equilibrium maintenance — supply/demand self-balancing", "Government urban planning uses platform simulations for policy decisions", "Fractional ownership and tokenized real estate becomes dominant ownership model"],
    marketContext: "Space habitation creates new property asset classes. Neural interfaces change how properties are experienced. Climate migration reshapes entire national economies." },
  { era: "2074–2124", title: "Civilization Infrastructure", phase: "System → Civilization Layer", color: "text-foreground",
    description: "Platform transcends real estate — becomes fundamental infrastructure for how humanity coordinates spatial resource allocation across physical and virtual environments.",
    capabilities: ["Spatial resource coordination across physical, virtual, and orbital environments", "Self-governing AI systems with ethical oversight from independent global board", "Platform intelligence integrated into urban planning, climate response, and migration policy", "Multi-generational institutional knowledge preserved and evolved autonomously"],
    marketContext: "Post-scarcity economics emerge in developed markets. Virtual real estate becomes significant asset class. Interplanetary property rights frameworks develop." },
];

const scenarioVariations = [
  { scenario: "Stable Growth", probability: "35%", description: "Steady urbanization, gradual digitization, predictable regulatory evolution. Platform grows methodically through each decade.", color: "text-chart-2",
    implications: ["Slow but steady moat compounding", "Lower capital requirements", "Risk: complacency allows competitors to catch up", "Revenue CAGR: 15-25% sustained over 30 years"] },
  { scenario: "Accelerated Disruption", probability: "40%", description: "Rapid AI advancement, blockchain-native property systems, and regulatory upheaval compress timelines by 50%.", color: "text-chart-4",
    implications: ["Must invest heavily in R&D to stay ahead", "Tokenization adoption accelerates revenue from capital markets layer", "Risk: technology shifts make current architecture obsolete", "Revenue CAGR: 30-50% with higher volatility"] },
  { scenario: "Crisis Resilience", probability: "25%", description: "Major economic crises, climate disasters, or geopolitical conflicts disrupt property markets repeatedly.", color: "text-destructive",
    implications: ["Intelligence products become MORE valuable during uncertainty", "Counter-cyclical revenue from risk analytics and insurance data", "Risk: prolonged downturn reduces transaction volume 60%+", "Revenue volatility ±40% annually, but long-term trend positive"] },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — DATA POWER RISK
   ═══════════════════════════════════════════════ */

const dataGovernance = [
  { domain: "Data Influence Responsibility", icon: Eye, frameworks: [
    { principle: "Predictive intelligence published with methodology transparency", detail: "All AI valuations include confidence intervals, data sources, and model version. No black-box predictions for market-moving assessments.", priority: "CRITICAL" },
    { principle: "Fair access tiering: retail investors receive core intelligence free", detail: "Basic market data, price trends, and listing access remain free forever. Premium = speed advantage and depth, not information exclusion.", priority: "HIGH" },
    { principle: "Annual independent AI audit by academic institution", detail: "Partner with top university to audit model bias, accuracy, and market impact. Publish results publicly regardless of findings.", priority: "HIGH" },
    { principle: "Stakeholder advisory council with vendor, investor, and public representation", detail: "Quarterly meetings with elected representatives from each user segment to review platform policies and pricing decisions.", priority: "MEDIUM" },
  ]},
  { domain: "Monopoly & Regulatory Risk", icon: Scale, frameworks: [
    { principle: "Voluntary market share cap: self-limit to <50% in any single district", detail: "If market share exceeds 50% in a district, actively promote competitor listings and reduce promotional spend in that area.", priority: "HIGH" },
    { principle: "Open API ecosystem: allow competitors to access anonymized market data", detail: "Publish anonymized aggregate data (price indices, volume trends) as public good. Maintain competitive advantage through intelligence depth, not data exclusion.", priority: "HIGH" },
    { principle: "Multi-jurisdiction compliance architecture", detail: "Dedicated compliance officer per major jurisdiction. Proactive regulatory engagement: submit to oversight before mandated. Singapore HoldCo for ASEAN, Luxembourg for EU.", priority: "CRITICAL" },
    { principle: "Data portability guarantee for all participants", detail: "Vendors and investors can export their complete data at any time. No lock-in through data hostage. Compete on value, not exit barriers.", priority: "HIGH" },
  ]},
  { domain: "Systemic Stability Safeguards", icon: Shield, frameworks: [
    { principle: "Anti-manipulation controls on AI pricing signals", detail: "Rate-limit pricing updates. Human review required for any AI valuation that deviates >15% from 30-day moving average. Circuit breaker for extreme signals.", priority: "CRITICAL" },
    { principle: "Infrastructure redundancy: no single point of failure", detail: "Multi-region cloud deployment. Hot standby for all critical systems. Published 99.95% uptime SLA with financial penalties for breach.", priority: "HIGH" },
    { principle: "Crisis communication protocol with pre-approved messaging", detail: "Board-approved crisis response templates for: data breach, AI error, market distortion allegation, regulatory investigation. 4-hour response commitment.", priority: "HIGH" },
    { principle: "Independent data verification through third-party audit trails", detail: "Partner with land registries and notaries for transaction verification. Platform data validated against government records quarterly.", priority: "MEDIUM" },
  ]},
];

/* ═══════════════════════════════════════════════
   SECTION 3 — FOUNDER EVOLUTION
   ═══════════════════════════════════════════════ */

const founderStages = [
  { stage: "Operator", timeline: "Year 0–5", subtitle: "$0 → $10M ARR", color: "bg-chart-4",
    capabilities: ["Rapid decision execution — make 50+ decisions/day with 70% accuracy", "Direct marketplace intervention: personally close deals, onboard vendors, resolve crises", "Technical product intuition: understand every system, review every major feature", "Resilience under uncertainty: operate for months without clear market validation"],
    psychRisks: ["Burnout from unsustainable personal workload", "Micromanagement as team grows beyond 10 people", "Identity fusion: self-worth tied entirely to company metrics", "Decision fatigue leading to avoidance of hard choices"],
    rituals: ["Morning: 15-min silent planning before any communication", "Weekly: 2-hour 'founder reflection' — what would I do differently?", "Monthly: 1 day completely disconnected from work", "Quarterly: conversation with mentor/advisor outside the industry"] },
  { stage: "Architect", timeline: "Year 5–15", subtitle: "$10M → $500M ARR", color: "bg-primary",
    capabilities: ["Delegation mastery: hire people better than you in every function", "Capital allocation: deploy $100M+ across growth, R&D, and M&A", "Institutional relationship: comfortable with sovereign funds, regulators, board dynamics", "Strategic patience: invest in 3-5 year outcomes while managing quarterly expectations"],
    psychRisks: ["Loneliness at the top — fewer peers who understand the pressure", "Imposter syndrome as company outgrows founder's operational expertise", "Political complexity: managing board dynamics, investor expectations, executive egos", "Loss of product intuition as layers of management insulate from users"],
    rituals: ["Weekly: 1-on-1 with 3 direct reports — deep strategic discussion, not status updates", "Monthly: spend 1 day as a user — list a property, inquire, use the product anonymously", "Quarterly: present long-term vision to entire company — reinforce mission clarity", "Annually: 1-week sabbatical for deep strategic reflection and personal renewal"] },
  { stage: "Steward", timeline: "Year 15–30+", subtitle: "$500M+ ARR / Post-IPO", color: "bg-chart-2",
    capabilities: ["Vision continuity: ensure institutional memory survives leadership transitions", "Cultural stewardship: reinforce values as organization scales to 1,000+ people", "Industry statesmanship: shape regulation, mentor founders, advance the ecosystem", "Legacy architecture: build governance structures that outlast personal involvement"],
    psychRisks: ["Relevance anxiety: fear of being sidelined by the organization you built", "Difficulty letting go: intervening in operational decisions that are no longer yours", "Legacy obsession: optimizing for historical narrative over current organizational needs", "Succession resistance: delaying transition because no successor feels 'ready enough'"],
    rituals: ["Monthly: mentor 2-3 emerging leaders inside and outside the company", "Quarterly: review institutional governance — is the company healthy without me?", "Annually: update personal 'letter to the future' — what matters in 20 years?", "Ongoing: invest in health, relationships, and interests outside the company"] },
];

const guidingPrinciples = [
  { principle: "Intelligence serves transparency, not advantage", detail: "The platform exists to make property markets more transparent and efficient for all participants. Any intelligence capability that advantages one group at the expense of market integrity must be reconsidered." },
  { principle: "Infrastructure must be more reliable than any single institution", detail: "As the platform becomes market infrastructure, uptime, accuracy, and fairness become non-negotiable obligations — not competitive features. Treat reliability as a public responsibility." },
  { principle: "Data power demands proportional accountability", detail: "The more market influence the platform accumulates, the greater the obligation to transparency, independent oversight, and self-governance. Power without accountability is fragile." },
  { principle: "Generational thinking over quarterly optimization", detail: "Every major decision should be evaluated against a 20-year horizon. Short-term revenue optimization that weakens long-term trust or moat is always the wrong choice." },
  { principle: "The founder's greatest contribution is building something that doesn't need the founder", detail: "The ultimate measure of success is an institution that thrives, innovates, and serves its mission long after the founder's direct involvement ends." },
];

/* ═══════════════════════════════════════════════ */

const CenturyVisionBlueprint: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="100-Year Strategic Vision"
        description="Century-scale platform evolution, data power governance & founder leadership evolution"
        icon={Hourglass}
        badge={{ text: "♾️ Century", variant: "outline" }}
      />

      <Tabs defaultValue="vision" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="vision" className="text-xs">100-Year Vision</TabsTrigger>
          <TabsTrigger value="scenarios" className="text-xs">Scenarios</TabsTrigger>
          <TabsTrigger value="data-power" className="text-xs">Data Power Risk</TabsTrigger>
          <TabsTrigger value="founder" className="text-xs">Founder Evolution</TabsTrigger>
          <TabsTrigger value="principles" className="text-xs">Guiding Principles</TabsTrigger>
        </TabsList>

        {/* ── 100-YEAR VISION ── */}
        <TabsContent value="vision" className="mt-4 space-y-3">
          {decades.map((d, i) => (
            <Card key={i} className={cn("border-border", i === 0 && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{d.era}</Badge>
                    <h4 className={cn("text-sm font-bold", d.color)}>{d.title}</h4>
                  </div>
                  <Badge variant="secondary" className="text-[8px]">{d.phase}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{d.description}</p>
                <div className="space-y-1">
                  {d.capabilities.map((c, j) => (
                    <div key={j} className="flex items-start gap-2 text-[11px] text-foreground">
                      <span className="text-primary shrink-0">→</span> {c}
                    </div>
                  ))}
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-[9px] font-semibold text-muted-foreground">MARKET CONTEXT</p>
                  <p className="text-[10px] text-foreground">{d.marketContext}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── SCENARIOS ── */}
        <TabsContent value="scenarios" className="mt-4 space-y-3">
          {scenarioVariations.map((s, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={cn("text-sm", s.color)}>{s.scenario}</CardTitle>
                  <Badge variant="outline" className="text-[9px]">Probability: {s.probability}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-[11px] text-muted-foreground">{s.description}</p>
                <div className="space-y-1">
                  {s.implications.map((imp, j) => (
                    <div key={j} className="flex items-start gap-2 text-[11px] text-foreground">
                      <span className={j === 2 ? "text-destructive shrink-0" : "text-primary shrink-0"}>
                        {j === 2 ? "⚠" : "→"}
                      </span> {imp}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── DATA POWER RISK ── */}
        <TabsContent value="data-power" className="mt-4 space-y-4">
          {dataGovernance.map((dg, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <dg.icon className="h-4 w-4 text-primary" /> {dg.domain}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dg.frameworks.map((f, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={f.priority === "CRITICAL" ? "destructive" : f.priority === "HIGH" ? "default" : "secondary"} className="text-[8px]">{f.priority}</Badge>
                      <p className="text-xs font-semibold text-foreground">{f.principle}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{f.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── FOUNDER EVOLUTION ── */}
        <TabsContent value="founder" className="mt-4 space-y-4">
          {founderStages.map((fs, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", fs.color)} />
                  <h4 className="text-sm font-bold text-foreground">{fs.stage}</h4>
                  <Badge variant="outline" className="text-[8px]">{fs.timeline}</Badge>
                  <Badge variant="secondary" className="text-[8px]">{fs.subtitle}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-semibold text-chart-2">✅ CAPABILITIES TO BUILD</p>
                    {fs.capabilities.map((c, j) => (
                      <p key={j} className="text-[10px] text-foreground">• {c}</p>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-semibold text-destructive">⚠ PSYCHOLOGICAL RISKS</p>
                    {fs.psychRisks.map((r, j) => (
                      <p key={j} className="text-[10px] text-foreground">• {r}</p>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-[9px] font-semibold text-primary mb-1.5">🧘 REFLECTION RITUALS</p>
                  <div className="space-y-1">
                    {fs.rituals.map((r, j) => (
                      <p key={j} className="text-[10px] text-foreground">{r}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── GUIDING PRINCIPLES ── */}
        <TabsContent value="principles" className="mt-4 space-y-3">
          {guidingPrinciples.map((gp, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-lg font-bold text-primary">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{gp.principle}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{gp.detail}</p>
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

export default CenturyVisionBlueprint;
