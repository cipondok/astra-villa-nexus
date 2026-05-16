import React from "react";
import {
  Globe, Brain, Shield, Eye, Users, TrendingUp, Activity,
  Crown, Landmark, Network, Radio, BookOpen, Heart, Scale
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — CIVILIZATION COORDINATION AI
   ═══════════════════════════════════════════════ */

const coordinationPillars = [
  { pillar: "Global Liquidity Synchronization", icon: Globe, color: "text-chart-4",
    systems: [
      { name: "Cross-City Equilibrium Engine", detail: "Monitors demand-supply ratios across 100+ cities simultaneously. Identifies capital migration patterns 6-18 months before traditional indicators. Generates real-time liquidity heat differentials between markets." },
      { name: "Capital Allocation Guidance Layer", detail: "Routes institutional capital toward underserved markets with high growth potential. Balances portfolio risk across geographies, asset classes, and currency exposures. Provides yield-gradient maps for sovereign wealth and pension fund allocation." },
      { name: "Predictive Urban Development Mapper", detail: "Ingests satellite imagery, permit data, infrastructure spending, and population flow to forecast district-level transformation 5-15 years ahead. Powers early-mover advantage for institutional investors." },
    ]},
  { pillar: "Market Behavior Stabilization", icon: Shield, color: "text-chart-2",
    systems: [
      { name: "Bubble & Crash Early Warning System", detail: "Tracks 14 leading indicators including speculative velocity, leverage ratios, price-to-rent divergence, and foreign capital concentration. Issues graduated alerts: Watch → Caution → Warning → Critical across city and district granularity." },
      { name: "Transaction Timing Intelligence", detail: "Advises institutional actors on optimal entry/exit windows based on cycle phase identification, seasonal patterns, and liquidity momentum. Reduces portfolio volatility by 15-25% through timing optimization." },
      { name: "Adaptive Pricing Transparency Engine", detail: "Publishes real-time fair market value indices that reduce information asymmetry. Creates pricing anchors that naturally dampen speculative overshoots and panic-driven undershoots." },
    ]},
  { pillar: "Infrastructure-Grade Decision Intelligence", icon: Landmark, color: "text-primary",
    systems: [
      { name: "Long-Cycle Trend Forecasting", detail: "Models 10-30 year property trends incorporating demographic shifts, climate migration, infrastructure investment, and urbanization velocity. Serves as reference data for national planning agencies." },
      { name: "Government Collaboration Channels", detail: "Structured data feeds for housing ministries, central banks, and urban planning authorities. Anonymized aggregate intelligence that improves policy decisions without compromising individual privacy." },
      { name: "Macro-Market Resilience Simulator", detail: "Stress-tests entire regional property markets against scenarios: interest rate shocks, currency crises, pandemic disruptions, climate events. Provides systemic resilience scores and vulnerability maps." },
    ]},
];

const ethicalBoundaries = [
  { principle: "Market Neutrality Commitment", detail: "Platform intelligence must inform, never manipulate. All pricing signals include confidence intervals and methodology disclosure. No proprietary trading on platform intelligence.", priority: "CRITICAL" },
  { principle: "Systemic Stability Over Profit", detail: "If platform intelligence could destabilize a market, the system must suppress or delay the signal. Revenue generation never justifies systemic risk amplification.", priority: "CRITICAL" },
  { principle: "Universal Access Floor", detail: "Core market transparency data remains freely accessible. Premium intelligence provides depth and speed advantages — never information exclusion.", priority: "HIGH" },
  { principle: "Regulatory Partnership Over Resistance", detail: "Proactively share aggregate intelligence with regulators. Position as ally of market stability, not adversary of oversight.", priority: "HIGH" },
  { principle: "Algorithmic Impact Assessment", detail: "Annual third-party audit of platform's market influence. Measure whether intelligence outputs have concentrated or distributed market power.", priority: "HIGH" },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — BEHAVIORAL INTELLIGENCE UNIVERSE
   ═══════════════════════════════════════════════ */

const signalConstellations = [
  { constellation: "Buyer Journey Behavioral Clustering", icon: Users, color: "text-chart-4",
    signals: ["Search pattern evolution over 3-24 month decision cycles", "Price sensitivity elasticity curves by segment and geography", "Feature preference drift tracking across demographic cohorts", "Decision trigger identification: what converts browsing to action"],
    insight: "Reveals not just WHAT buyers want, but HOW and WHEN they decide — enabling predictive matching 60-90 days before intent crystallizes." },
  { constellation: "Investor Risk Appetite Segmentation", icon: TrendingUp, color: "text-primary",
    signals: ["Portfolio composition analysis revealing true risk tolerance", "Behavioral divergence from stated investment criteria", "Market cycle response patterns: do they buy dips or flee?", "Capital deployment velocity and concentration preferences"],
    insight: "Builds dynamic risk profiles that evolve with market conditions — more accurate than self-reported preferences by 3-5x." },
  { constellation: "Vendor Performance Reputation Graph", icon: Network, color: "text-chart-2",
    signals: ["Transaction completion reliability scoring", "Response time consistency across inquiry types", "Pricing accuracy: listed vs. actual transaction prices", "Client satisfaction trajectory over multi-year relationships"],
    insight: "Creates self-reinforcing quality marketplace — high performers attract more opportunities, incentivizing continuous improvement across the ecosystem." },
];

const predictiveEngines = [
  { engine: "Generational Preference Forecasting", detail: "Models how property preferences shift across generations. Tracks millennial → Gen-Z → Gen-Alpha housing preference evolution. Predicts demand for property types, locations, and ownership models 10-20 years ahead." },
  { engine: "Migration & Urban Density Intelligence", detail: "Combines remote work adoption, climate risk, infrastructure investment, and lifestyle preference data to forecast population redistribution. Identifies emerging demand hotspots 5-10 years before price discovery." },
  { engine: "Ownership Lifecycle Value Analytics", detail: "Tracks complete ownership journeys from acquisition through renovation, rental, refinancing, and exit. Identifies optimal hold periods, renovation timing, and exit strategies by property type and market conditions." },
];

const knowledgeExpansion = [
  { path: "Data Ecosystem Partnerships", items: ["Land registry and notary transaction feeds", "Banking mortgage approval and default rate intelligence", "Construction permit and completion data pipelines", "Climate risk and insurance underwriting datasets"] },
  { path: "Cross-Asset Intelligence Integration", items: ["REIT performance correlation with direct property markets", "Infrastructure bond yields as leading indicators for property values", "Currency and commodity markets impact on cross-border investment", "Equity market sentiment spillover into property allocation decisions"] },
  { path: "Continuous Learning Feedback Loops", items: ["Prediction accuracy tracking with automated model recalibration", "User correction signals: when humans override AI recommendations", "Market outcome validation: comparing forecasts to actual prices", "Adversarial testing: deliberately challenging model assumptions"] },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — FOUNDER MYTH & ARCHETYPE
   ═══════════════════════════════════════════════ */

const archetypes = [
  { archetype: "The Architect of Market Clarity", icon: Eye,
    description: "Saw the chaos of opaque, fragmented property markets — and chose to build the infrastructure of transparency. Not a disruptor who destroys, but an architect who constructs the systems that make fair markets possible.",
    essence: "Clarity is not a feature. It is a moral position." },
  { archetype: "The Builder of Coordinated Ecosystems", icon: Network,
    description: "Understood that property markets are not transactions — they are ecosystems of human decisions. Built the coordination layer that connects buyers, sellers, investors, and institutions into a single intelligence fabric.",
    essence: "The most powerful platform is the one that makes every participant smarter." },
  { archetype: "The Steward of Capital Flow Intelligence", icon: Activity,
    description: "Recognized that real estate is the world's largest asset class — and the least intelligent. Committed to ensuring that capital flows to where it creates the most value, not where it creates the most speculation.",
    essence: "Capital should flow toward productivity, not toward information asymmetry." },
];

const mythNarrative = {
  origin: "In a market where a family's largest financial decision was made with less data than choosing a restaurant, one builder asked: what if every property decision could be as informed as every stock trade?",
  transformation: [
    "Year 1: Built intelligence for a single city — and proved that transparency creates liquidity",
    "Year 5: Scaled across a nation — demonstrating that coordinated markets grow faster than fragmented ones",
    "Year 10: Became infrastructure — when institutions began treating platform data as market reference",
    "Year 25: Influenced global standards — when governments adopted platform methodologies for housing policy",
    "Year 50+: Legacy institution — when the platform's intelligence became inseparable from how property markets function",
  ],
  taglines: [
    "Where capital meets clarity.",
    "The intelligence layer of real estate.",
    "Building the operating system for property markets.",
    "Every property decision, informed.",
    "From fragmentation to coordination. From opacity to intelligence.",
  ],
};

const leadershipTone = [
  { principle: "Calm Authority", detail: "Speak with the quiet confidence of infrastructure. Not the urgency of a startup, but the steadiness of a system that will outlast market cycles." },
  { principle: "Evidence Over Assertion", detail: "Every claim backed by data. Every vision grounded in demonstrated capability. Let traction speak louder than ambition." },
  { principle: "Institutional Gravity", detail: "Communicate as an institution communicates: measured, responsible, long-term. Earn trust through consistency, not through excitement." },
  { principle: "Generational Perspective", detail: "Frame decisions in decades, not quarters. Discuss impact in terms of markets transformed, not revenue captured." },
];

const influenceMilestones = [
  { decade: "2024–2034", milestone: "National Reference", description: "Platform data cited in government housing reports. Banking institutions use AI valuations for mortgage underwriting. Brand recognized as industry standard in Indonesia." },
  { decade: "2034–2044", milestone: "Regional Infrastructure", description: "5+ Southeast Asian governments reference platform indices. Cross-border investment routing becomes primary institutional channel. Platform methodology adopted by ASEAN economic bodies." },
  { decade: "2044–2064", milestone: "Global Coordination", description: "Platform liquidity indices cited by central banks alongside GDP. Real estate transaction standards influenced by platform protocols. Founder narrative studied in business schools as category creation archetype." },
  { decade: "2064–2100+", milestone: "Civilization Layer", description: "Platform intelligence inseparable from property market function globally. Institutional governance model studied as template for responsible technology stewardship. Multi-generational leadership continuity maintained through cultural and structural design." },
];

/* ═══════════════════════════════════════════════ */

const CivilizationCoordinationBlueprint: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Civilization Market Coordination"
        description="Civilization-scale AI coordination, behavioral intelligence universe & founder myth archetype"
        icon={Globe}
        badge={{ text: "🌍 Civilization", variant: "outline" }}
      />

      <Tabs defaultValue="coordination" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="coordination" className="text-xs">Coordination AI</TabsTrigger>
          <TabsTrigger value="behavioral" className="text-xs">Behavioral Universe</TabsTrigger>
          <TabsTrigger value="myth" className="text-xs">Founder Myth</TabsTrigger>
          <TabsTrigger value="ethics" className="text-xs">Ethics & Governance</TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs">Influence Milestones</TabsTrigger>
        </TabsList>

        {/* ── COORDINATION AI ── */}
        <TabsContent value="coordination" className="mt-4 space-y-4">
          {coordinationPillars.map((cp, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", cp.color)}>
                  <cp.icon className="h-4 w-4" /> {cp.pillar}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cp.systems.map((s, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── BEHAVIORAL UNIVERSE ── */}
        <TabsContent value="behavioral" className="mt-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Signal Constellations</h3>
            {signalConstellations.map((sc, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <sc.icon className={cn("h-4 w-4", sc.color)} />
                    <h4 className={cn("text-sm font-bold", sc.color)}>{sc.constellation}</h4>
                  </div>
                  <div className="space-y-1">
                    {sc.signals.map((s, j) => (
                      <div key={j} className="flex items-start gap-2 text-[11px] text-foreground">
                        <span className="text-primary shrink-0">→</span> {s}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-primary font-medium">{sc.insight}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Predictive Insight Engines</h3>
            {predictiveEngines.map((pe, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{pe.engine}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{pe.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Knowledge Network Expansion</h3>
            {knowledgeExpansion.map((ke, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">{ke.path}</p>
                  {ke.items.map((item, j) => (
                    <p key={j} className="text-[10px] text-muted-foreground">• {item}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── FOUNDER MYTH ── */}
        <TabsContent value="myth" className="mt-4 space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <p className="text-[9px] font-semibold text-primary uppercase tracking-wider">Origin Story</p>
              <p className="text-sm text-foreground italic leading-relaxed">"{mythNarrative.origin}"</p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Archetypes</h3>
            {archetypes.map((a, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <a.icon className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">{a.archetype}</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{a.description}</p>
                  <p className="text-[11px] text-primary font-semibold italic">"{a.essence}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border">
            <CardContent className="p-4 space-y-2">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Transformation Milestones</p>
              {mythNarrative.transformation.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                  <span className="text-chart-2 shrink-0">◆</span> {t}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 space-y-2">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Symbolic Taglines</p>
              {mythNarrative.taglines.map((t, i) => (
                <p key={i} className="text-sm font-bold text-foreground">"{t}"</p>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Leadership Tone Principles</h3>
            {leadershipTone.map((lt, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{lt.principle}</p>
                  <p className="text-[10px] text-muted-foreground">{lt.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── ETHICS & GOVERNANCE ── */}
        <TabsContent value="ethics" className="mt-4 space-y-3">
          {ethicalBoundaries.map((eb, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={eb.priority === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{eb.priority}</Badge>
                  <p className="text-xs font-semibold text-foreground">{eb.principle}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{eb.detail}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── INFLUENCE MILESTONES ── */}
        <TabsContent value="milestones" className="mt-4 space-y-3">
          {influenceMilestones.map((im, i) => (
            <Card key={i} className={cn("border-border", i === 0 && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{im.decade}</Badge>
                  <h4 className="text-sm font-bold text-foreground">{im.milestone}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{im.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivilizationCoordinationBlueprint;
