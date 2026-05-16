import React from "react";
import {
  Orbit, Globe, Brain, Eye, Users, Shield, Activity, Network,
  Sparkles, BookOpen, Heart, Scale, Landmark, Crown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — POST-CIVILIZATION ECONOMIC INTELLIGENCE
   ═══════════════════════════════════════════════ */

const economicIntelligence = [
  { theme: "Planetary-Scale Liquidity Awareness", icon: Globe, color: "text-chart-4", systems: [
    { name: "Settlement Flow Predictive Mapping", detail: "Synthesizes climate migration models, demographic projections, infrastructure investment patterns, and economic opportunity gradients to forecast where humanity will live and invest across 25-100 year horizons. Moves beyond city-level to continental-scale settlement intelligence." },
    { name: "Generational Capital Allocation Guidance", detail: "Models how wealth transfers between generations reshape property demand. Tracks inheritance patterns, millennial-to-Gen-Alpha preference shifts, and longevity economics to guide capital positioning across multi-decade investment horizons." },
    { name: "Environmental-Demographic Integration Layer", detail: "Merges sea-level projections, extreme weather probability maps, water scarcity indices, and agricultural productivity forecasts with property valuation models. Creates climate-adjusted fair market values that reflect 50-year habitability risk." },
  ]},
  { theme: "Coordinated Economic Decision Layers", icon: Network, color: "text-primary", systems: [
    { name: "Shared Urban Planning Intelligence", detail: "Anonymized aggregate demand signals fed to municipal planning agencies. When platform intelligence shows 200% demand growth in a corridor, infrastructure investment can be coordinated proactively — preventing the lag that creates housing crises." },
    { name: "Macro-Risk Stabilization Signals", detail: "Real-time composite indicators combining transaction velocity, leverage ratios, foreign capital concentration, and speculative activity. Published as public-good indices that help central banks, regulators, and institutional investors maintain market stability." },
    { name: "Collaborative Intelligence Ecosystems", detail: "Federated data partnerships where institutions contribute anonymized signals and receive enhanced intelligence. No single entity controls the full picture — collective intelligence emerges from coordinated contribution." },
  ]},
  { theme: "Evolution Beyond Platform Identity", icon: Sparkles, color: "text-chart-2", systems: [
    { name: "From Service to Societal Utility", detail: "The platform ceases to be perceived as a company and becomes perceived as infrastructure — like electricity grids or internet protocols. Revenue model shifts from direct monetization to infrastructure licensing, with public-good data access guaranteed." },
    { name: "Global Economic Resilience Contribution", detail: "Platform intelligence reduces systemic property market volatility by 15-30% through improved information symmetry. Fewer bubbles, softer corrections, more efficient capital allocation — measurable contribution to economic stability." },
    { name: "Ethical Stewardship at Systemic Scale", detail: "When platform decisions influence trillions in capital allocation, the governance obligation approaches that of central banks. Independent oversight board, published methodology, algorithmic impact assessments, and voluntary power constraints become existential requirements." },
  ]},
];

const philosophicalReflections = [
  { theme: "Sustainability", reflection: "A system that optimizes property markets without accounting for ecological carrying capacity accelerates resource depletion. True intelligence must incorporate planetary boundaries into every valuation model — not as an externality, but as a fundamental input." },
  { theme: "Fairness", reflection: "Information asymmetry is the root of most market injustice. A platform that democratizes intelligence must resist the economic incentive to re-create asymmetry at higher levels. The challenge is sustaining a business model where fairness IS the competitive advantage." },
  { theme: "Unintended Consequences", reflection: "Transparent pricing intelligence could homogenize markets — eliminating the local knowledge that creates healthy diversity. Over-optimization of capital allocation could drain peripheral regions. The system must preserve market diversity as deliberately as it creates efficiency." },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — FOUNDER IMMORTALITY LEGACY
   ═══════════════════════════════════════════════ */

const missionMythology = {
  origin: "Before the platform existed, a family in Jakarta spent their life savings on a property — relying on a broker's word, a neighbor's rumor, and a prayer. They overpaid by 40%. That family's story became the founding wound — the injustice that demanded a systemic answer.",
  turningPoints: [
    { moment: "The First Truth", detail: "When the platform published the first transparent price index for a Jakarta district, vendors initially resisted. Within 6 months, listings with platform-verified pricing sold 3x faster. The market chose transparency." },
    { moment: "The Institutional Crossing", detail: "When a sovereign wealth fund integrated platform intelligence into their $2B ASEAN property allocation model, the platform crossed from 'startup tool' to 'market infrastructure.' The founder's vision was no longer aspirational — it was operational." },
    { moment: "The Regulatory Embrace", detail: "When Indonesia's housing ministry adopted platform methodology as the basis for affordable housing policy, the platform transcended commercial identity. It became the intelligence layer that governments trusted to serve the public interest." },
    { moment: "The Succession Test", detail: "When the founder stepped back from daily operations and the platform continued to evolve, improve, and serve — that was the ultimate validation. The mission had been encoded into the institution itself." },
  ],
};

const culturalTransmission = [
  { mechanism: "Encoded Leadership Philosophy", detail: "Decision frameworks embedded into organizational rituals: every product review begins with 'Does this increase transparency for the least-informed participant?' Every pricing decision tested against 'Would we publish our methodology?' Values survive leadership transitions because they're structural, not personal." },
  { mechanism: "Narrative Continuity Architecture", detail: "Annual 'Origin Day' where new employees experience the founding story firsthand. Quarterly 'Transparency Reports' published externally — demonstrating accountability. Decade retrospectives documenting how the mission evolved without losing its core." },
  { mechanism: "Mentorship & Institutional Memory", detail: "Structured mentorship chains: every senior leader mentors 3 emerging leaders, explicitly transmitting institutional values and decision-making philosophy. Recorded 'Decision Diaries' preserving the reasoning behind pivotal choices for future leadership." },
];

const archetypeEvolution = [
  { phase: "The Builder (Year 0–10)", description: "Known for relentless execution and product obsession. Public narrative: 'the founder who couldn't accept that property markets were broken.' Recognized by industry for doing, not just talking." },
  { phase: "The Reformer (Year 10–25)", description: "Known for reshaping market norms and regulatory frameworks. Public narrative: 'the architect who proved transparency creates more value than opacity.' Invited to shape policy, not just comment on it." },
  { phase: "The Elder (Year 25–50+)", description: "Known for institutional stewardship and generational thinking. Public narrative: 'the founder whose institution became inseparable from how markets function.' Legacy measured not in revenue, but in systemic change." },
];

const legacyMantras = [
  "The market remembers who brought clarity.",
  "Build the system that doesn't need you.",
  "Intelligence is a responsibility, not a product.",
  "Transparency compounds. Opacity decays.",
  "The founder's greatest creation is the institution that outlives the founder.",
];

/* ═══════════════════════════════════════════════
   SECTION 3 — GLOBAL MARKET CONSCIOUSNESS
   ═══════════════════════════════════════════════ */

const consciousnessLayers = [
  { layer: "Collective Sentiment Mapping", icon: Brain, color: "text-chart-4", components: [
    { name: "Macro Optimism-Caution Index", detail: "Aggregates millions of micro-signals — search patterns, inquiry velocity, offer aggressiveness, negotiation behavior — into a composite market mood indicator. Published quarterly as a leading indicator for institutional planning." },
    { name: "Cross-Regional Synchronization Detection", detail: "Identifies when investment behavior synchronizes across geographically distant markets — often a leading indicator of either coordinated opportunity or systemic risk. Synchronization above 0.8 triggers enhanced monitoring." },
    { name: "Long-Term Preference Evolution Tracker", detail: "Maps how collective property preferences shift across decades: suburban → urban → peri-urban cycles, ownership → rental → hybrid models, physical → digital-augmented spaces. Powers 20-year demand forecasting." },
  ]},
  { layer: "Emergent Intelligence Dynamics", icon: Activity, color: "text-primary", components: [
    { name: "Transparency-Decision Feedback Loop", detail: "When the platform publishes pricing intelligence, market participants adjust behavior — which changes the data — which updates the intelligence. This recursive loop can stabilize markets (rational correction) or amplify them (herding). Understanding and managing this feedback is the platform's deepest responsibility." },
    { name: "Cycle Stabilization vs. Amplification", detail: "Transparent analytics can dampen speculative cycles by making overpricing visible. But the same transparency can amplify panic during downturns by making losses visible. The system must asymmetrically apply transparency — full visibility on upside risk, measured communication on downside to prevent panic cascades." },
    { name: "Rational Participation Enhancement", detail: "The ultimate goal: every market participant makes decisions with institutional-grade information quality. When retail investors have the same analytical foundation as sovereign funds, market efficiency improves for everyone." },
  ]},
];

const ethicalGovernance = [
  { concern: "Decision Autonomy Preservation", icon: Users, detail: "Intelligence must inform, never prescribe. The platform provides the map — participants choose the route. Any system that narrows decision diversity weakens market resilience.", safeguard: "Maintain multiple analytical perspectives in every output. Never present a single 'correct' answer." },
  { concern: "Systemic Bias Prevention", icon: Scale, detail: "If the platform's intelligence systematically favors certain demographics, property types, or regions, it concentrates rather than distributes economic opportunity.", safeguard: "Annual bias audit across all AI models. Geographic and demographic fairness metrics published publicly." },
  { concern: "Predictive Trust Maintenance", icon: Shield, detail: "As intelligence accuracy improves, dependency increases. A single major prediction failure could trigger systemic loss of confidence — and market instability.", safeguard: "Published accuracy tracking with confidence intervals. Graceful degradation protocols. Never claim certainty." },
];

const illustrativeScenarios = [
  { scenario: "Positive Coordination", type: "positive", detail: "Platform detects early-stage oversupply in 3 Southeast Asian cities simultaneously. Aggregate intelligence shared with developers and institutional investors leads to coordinated supply reduction — preventing a regional correction that historical data suggests would have eliminated $12B in market value. Market stabilizes naturally without regulatory intervention." },
  { scenario: "Systemic Risk", type: "risk", detail: "Platform's pricing algorithm develops a bias toward urban core properties due to training data concentration. Over 5 years, this systematically undervalues suburban and rural properties — concentrating investment in cities and accelerating regional inequality. The bias is invisible because participants trust the intelligence. Detected only through external academic audit." },
];

const generationalMilestones = [
  { horizon: "Generation 1 (2024–2050)", milestone: "Infrastructure Establishment", description: "Platform becomes recognized market infrastructure in 20+ countries. Founder transitions from operator to steward. Intelligence methodology adopted by 5+ national regulators. Annual reports cited alongside government statistics." },
  { horizon: "Generation 2 (2050–2080)", milestone: "Systemic Integration", description: "Platform intelligence embedded in urban planning, central banking, and climate adaptation decisions globally. Governance structure ensures institutional continuity beyond founding team. Behavioral intelligence universe processes 10B+ signals annually." },
  { horizon: "Generation 3 (2080–2120+)", milestone: "Civilizational Utility", description: "Platform transcends corporate identity — becomes public utility infrastructure for spatial resource coordination. Founder legacy preserved as institutional mythology. Market consciousness framework contributes to measurably more efficient and equitable global property markets." },
];

/* ═══════════════════════════════════════════════ */

const PostCivilizationBlueprint: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Post-Civilization Intelligence"
        description="Economic intelligence evolution, founder immortality legacy & global market consciousness"
        icon={Orbit}
        badge={{ text: "🔮 Post-Civilization", variant: "outline" }}
      />

      <Tabs defaultValue="intelligence" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="intelligence" className="text-xs">Economic Intelligence</TabsTrigger>
          <TabsTrigger value="legacy" className="text-xs">Founder Legacy</TabsTrigger>
          <TabsTrigger value="consciousness" className="text-xs">Market Consciousness</TabsTrigger>
          <TabsTrigger value="ethics" className="text-xs">Ethics & Risk</TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs">Generational Arc</TabsTrigger>
        </TabsList>

        {/* ── ECONOMIC INTELLIGENCE ── */}
        <TabsContent value="intelligence" className="mt-4 space-y-4">
          {economicIntelligence.map((ei, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", ei.color)}>
                  <ei.icon className="h-4 w-4" /> {ei.theme}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ei.systems.map((s, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-primary">Philosophical Reflections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {philosophicalReflections.map((pr, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs font-bold text-foreground">{pr.theme}</p>
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">{pr.reflection}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FOUNDER LEGACY ── */}
        <TabsContent value="legacy" className="mt-4 space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <p className="text-[9px] font-semibold text-primary uppercase tracking-wider">The Founding Wound</p>
              <p className="text-sm text-foreground italic leading-relaxed">"{missionMythology.origin}"</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Defining Turning Points</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missionMythology.turningPoints.map((tp, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3 space-y-1">
                  <p className="text-xs font-bold text-foreground">{tp.moment}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{tp.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cultural Transmission Mechanisms</h3>
            {culturalTransmission.map((ct, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{ct.mechanism}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{ct.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Archetype Evolution</h3>
            {archetypeEvolution.map((ae, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 space-y-1">
                  <p className="text-xs font-bold text-foreground">{ae.phase}</p>
                  <p className="text-[10px] text-muted-foreground">{ae.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border">
            <CardContent className="p-4 space-y-2">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Legacy Mantras</p>
              {legacyMantras.map((m, i) => (
                <p key={i} className="text-sm font-bold text-foreground italic">"{m}"</p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MARKET CONSCIOUSNESS ── */}
        <TabsContent value="consciousness" className="mt-4 space-y-4">
          {consciousnessLayers.map((cl, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", cl.color)}>
                  <cl.icon className="h-4 w-4" /> {cl.layer}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cl.components.map((c, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{c.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Illustrative Scenarios</h3>
            {illustrativeScenarios.map((is_, i) => (
              <Card key={i} className={cn("border-border", is_.type === "positive" ? "border-chart-2/30 bg-chart-2/5" : "border-destructive/30 bg-destructive/5")}>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={is_.type === "positive" ? "default" : "destructive"} className="text-[8px]">
                      {is_.type === "positive" ? "POSITIVE" : "RISK"}
                    </Badge>
                    <p className="text-xs font-bold text-foreground">{is_.scenario}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{is_.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── ETHICS & RISK ── */}
        <TabsContent value="ethics" className="mt-4 space-y-3">
          {ethicalGovernance.map((eg, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <eg.icon className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold text-foreground">{eg.concern}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{eg.detail}</p>
                <div className="p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                  <p className="text-[9px] font-semibold text-chart-2">SAFEGUARD</p>
                  <p className="text-[10px] text-foreground">{eg.safeguard}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── GENERATIONAL ARC ── */}
        <TabsContent value="milestones" className="mt-4 space-y-3">
          {generationalMilestones.map((gm, i) => (
            <Card key={i} className={cn("border-border", i === 0 && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[9px]">{gm.horizon}</Badge>
                  <h4 className="text-sm font-bold text-foreground">{gm.milestone}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{gm.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostCivilizationBlueprint;
