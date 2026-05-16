import React, { useState } from "react";
import { Crosshair, Shield, Swords, Eye, TrendingUp, ChevronDown, ChevronUp, AlertTriangle, ArrowRight, Brain, Globe, Users, DollarSign, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── types ───────── */

interface Competitor {
  name: string;
  type: string;
  scores: { intelligence: number; liquidity: number; ecosystem: number; brand: number; monetization: number };
  threat: "low" | "medium" | "high";
  strengths: string[];
  weaknesses: string[];
}

interface DominationStrategy {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  offensive: string[];
  defensive: string[];
  timeline: string;
}

/* ───────── data ───────── */

const platform = { name: "ASTRA", scores: { intelligence: 88, liquidity: 72, ecosystem: 65, brand: 58, monetization: 60 } };

const competitors: Competitor[] = [
  {
    name: "Traditional Listing Portals", type: "Listing Portal",
    scores: { intelligence: 20, liquidity: 65, ecosystem: 30, brand: 75, monetization: 70 },
    threat: "medium",
    strengths: ["Established brand recognition", "Large existing vendor base", "Proven advertising revenue model"],
    weaknesses: ["Zero intelligence layer", "No investor-specific features", "Advertising-dependent — misaligned incentives", "Static listings without performance data"],
  },
  {
    name: "Brokerage Networks", type: "Brokerage",
    scores: { intelligence: 35, liquidity: 55, ecosystem: 45, brand: 60, monetization: 50 },
    threat: "medium",
    strengths: ["Agent relationships and trust", "Transaction expertise", "Local market knowledge"],
    weaknesses: ["Fragmented, not unified platform", "No data aggregation capability", "High commission structure limits scale", "Technology adoption resistance"],
  },
  {
    name: "Classified Platforms", type: "Classifieds",
    scores: { intelligence: 10, liquidity: 70, ecosystem: 15, brand: 80, monetization: 65 },
    threat: "low",
    strengths: ["Massive traffic volume", "Strong SEO presence", "Low-cost listing model"],
    weaknesses: ["No vertical specialization", "Zero transaction intelligence", "Mixed-quality listings", "No investor conversion funnel"],
  },
  {
    name: "Super-App Property Verticals", type: "Super-App",
    scores: { intelligence: 40, liquidity: 50, ecosystem: 70, brand: 85, monetization: 75 },
    threat: "high",
    strengths: ["Massive user base", "Cross-service ecosystem", "Deep funding capacity", "Payment infrastructure"],
    weaknesses: ["Property is secondary vertical", "No deep domain intelligence", "Generic UX for property", "Distracted by multi-vertical operations"],
  },
  {
    name: "Global PropTech Entrants", type: "PropTech",
    scores: { intelligence: 55, liquidity: 30, ecosystem: 40, brand: 35, monetization: 45 },
    threat: "medium",
    strengths: ["Modern tech stack", "Investor-first mindset", "Innovation narrative"],
    weaknesses: ["No local market knowledge", "Zero existing supply", "High CAC in new market", "Cultural-regulatory blind spots"],
  },
];

const capabilities = ["Intelligence", "Liquidity", "Ecosystem", "Brand", "Monetization"];
const capKeys: (keyof typeof platform.scores)[] = ["intelligence", "liquidity", "ecosystem", "brand", "monetization"];

const strategies: DominationStrategy[] = [
  {
    id: "redefine", title: "Redefine Category Language", icon: <Globe className="h-5 w-5" />,
    description: "Shift industry perception from 'listing portal' to 'property intelligence infrastructure' — own the vocabulary so competitors play in your frame",
    offensive: [
      "Publish monthly 'Intelligence Index' that media and industry reference as the standard",
      "Coin and trademark category term — 'Property Intelligence Platform' — use in all PR and investor materials",
      "Position competitors as 'listing portals' in every comparison — frame them as previous generation",
      "Launch industry report series that redefines success metrics from 'listings count' to 'liquidity density score'",
    ],
    defensive: [
      "File trademarks on key category terminology before competitors adopt similar language",
      "Build media relationships that default to ASTRA for market commentary and data citations",
    ],
    timeline: "0-6 months",
  },
  {
    id: "intelligence", title: "Intelligence Moat Acceleration", icon: <Brain className="h-5 w-5" />,
    description: "Widen the data and prediction accuracy gap daily — every transaction makes the moat deeper and replication harder",
    offensive: [
      "Deploy prediction accuracy leaderboard — publicly show ASTRA vs. broker accuracy on price forecasts",
      "Launch open API for district-level intelligence — create developer ecosystem dependent on ASTRA data",
      "Partner with academic institutions for joint research — creates credibility and proprietary datasets",
      "Ship AI deal discovery features competitors can't replicate without 18+ months of data accumulation",
    ],
    defensive: [
      "Accelerate data ingestion velocity — more signals per listing = harder to catch up",
      "Patent key scoring algorithms and intelligence pipeline architectures",
      "Maintain prediction accuracy audit trail for institutional credibility",
    ],
    timeline: "Ongoing — compounds monthly",
  },
  {
    id: "ecosystem", title: "Ecosystem Lock-In Deepening", icon: <Layers className="h-5 w-5" />,
    description: "Embed into vendor and investor workflows so deeply that switching cost exceeds any competitor's value proposition",
    offensive: [
      "Launch vendor analytics dashboard that becomes their primary business intelligence tool",
      "Embed mortgage pre-qualification at inquiry point — own the transaction completion layer",
      "Build investor portfolio tracker that aggregates cross-platform holdings — become the 'single pane of glass'",
      "Create vendor certification program that becomes industry credibility standard",
    ],
    defensive: [
      "Long-term vendor contracts with graduated pricing — loyalty rewarded, switching penalized",
      "Data portability friction — make exports available but ensure intelligence layer is non-portable",
      "Community features that create social switching cost — investor networks, deal discussions, reputation scores",
    ],
    timeline: "3-18 months",
  },
  {
    id: "network", title: "Network Effect Amplification", icon: <Users className="h-5 w-5" />,
    description: "Accelerate the virtuous cycle where more vendors attract more investors attract more vendors — make the flywheel irreversible",
    offensive: [
      "Launch referral reward loops — investors referring investors, vendors referring vendors",
      "Create 'Exclusive Launch' partnerships with developers — supply only available on ASTRA first",
      "Investor social features that create content flywheel — deal discussions, market commentary, success stories",
      "Geographic density strategy — dominate district-by-district rather than spreading thin",
    ],
    defensive: [
      "Monitor vendor dual-listing rates — vendors listing on competitors signals network weakness",
      "Track investor session depth trends — declining engagement predicts churn before it happens",
      "Maintain vendor exclusivity incentives in highest-liquidity districts",
    ],
    timeline: "Ongoing — accelerates with scale",
  },
];

const earlyWarnings = [
  { signal: "Competitor launches AI-powered property recommendations", severity: "high", response: "Accelerate intelligence feature releases, publish accuracy comparison, emphasize data depth advantage" },
  { signal: "Major portal acquires PropTech startup for data capability", severity: "high", response: "Fast-track API ecosystem launch, lock vendor contracts, publish 'years of data' moat narrative" },
  { signal: "Super-app subsidizes property vertical with below-cost pricing", severity: "medium", response: "Emphasize intelligence value over price, activate vendor loyalty program, target their weakest segment" },
  { signal: "Competitor hires aggressive BD team in expansion cities", severity: "medium", response: "Pre-sign developer partnerships, launch 'First 90 Days Free' in contested cities, accelerate city launch playbook" },
  { signal: "New entrant raises $50M+ Series B for Indonesia market", severity: "high", response: "Accelerate fundraise timeline, lock exclusive partnerships, publish market leadership metrics, dominate media narrative" },
  { signal: "Vendor dual-listing rate exceeds 40% in any district", severity: "medium", response: "Deploy vendor exclusivity incentives, launch vendor analytics advantage, increase premium slot value" },
];

/* ───────── component ───────── */

const CompetitiveDomination: React.FC = () => {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>("redefine");
  const [showWarnings, setShowWarnings] = useState(false);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Competitive Domination Map"
        description="Category positioning matrix, capability comparison, domination strategies & early warning intelligence"
        icon={Crosshair}
        badge={{ text: "🎯 Domination", variant: "outline" }}
      />

      {/* Platform vs field summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {capabilities.map((cap, i) => {
          const key = capKeys[i];
          const platformScore = platform.scores[key];
          const maxCompetitor = Math.max(...competitors.map(c => c.scores[key]));
          const leading = platformScore > maxCompetitor;
          return (
            <Card key={cap} className="border-border">
              <CardContent className="p-3 text-center space-y-1">
                <span className="text-[10px] text-muted-foreground">{cap}</span>
                <div className="flex items-center justify-center gap-2">
                  <span className={cn("text-lg font-bold", leading ? "text-chart-2" : "text-destructive")}>{platformScore}</span>
                  <span className="text-[10px] text-muted-foreground">vs {maxCompetitor}</span>
                </div>
                <Badge variant={leading ? "default" : "destructive"} className="text-[9px]">
                  {leading ? "Leading" : "Gap"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="matrix" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="matrix" className="text-xs">Capability Matrix</TabsTrigger>
          <TabsTrigger value="strategies" className="text-xs">Domination</TabsTrigger>
          <TabsTrigger value="warnings" className="text-xs">Early Warnings</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Roadmap</TabsTrigger>
        </TabsList>

        {/* Capability Matrix */}
        <TabsContent value="matrix" className="mt-4 space-y-3">
          {/* Comparison table */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Capability Comparison Matrix</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">Player</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">Type</th>
                    {capabilities.map(c => <th key={c} className="text-center py-2 px-1 text-muted-foreground font-medium">{c}</th>)}
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">Threat</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ASTRA row */}
                  <tr className="border-b border-primary/20 bg-primary/5">
                    <td className="py-2.5 px-2 font-bold text-primary">ASTRA</td>
                    <td className="py-2.5 px-2 text-foreground">Intelligence Platform</td>
                    {capKeys.map(k => (
                      <td key={k} className="py-2.5 px-1 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <Progress value={platform.scores[k]} className="h-1.5 w-12" />
                          <span className="font-bold text-primary">{platform.scores[k]}</span>
                        </div>
                      </td>
                    ))}
                    <td className="py-2.5 px-2 text-center"><Badge variant="default" className="text-[9px]">Us</Badge></td>
                  </tr>
                  {competitors.map(c => (
                    <tr key={c.name} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="py-2.5 px-2 font-medium text-foreground">{c.name}</td>
                      <td className="py-2.5 px-2 text-muted-foreground">{c.type}</td>
                      {capKeys.map(k => (
                        <td key={k} className="py-2.5 px-1 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <Progress value={c.scores[k]} className="h-1.5 w-12" />
                            <span className={cn("font-medium", c.scores[k] > platform.scores[k] ? "text-destructive" : "text-muted-foreground")}>{c.scores[k]}</span>
                          </div>
                        </td>
                      ))}
                      <td className="py-2.5 px-2 text-center">
                        <Badge variant={c.threat === "high" ? "destructive" : c.threat === "medium" ? "secondary" : "default"} className="text-[9px]">
                          {c.threat}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Competitor profiles */}
          {competitors.map(c => (
            <Card key={c.name} className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{c.name}</span>
                    <Badge variant="secondary" className="text-[9px]">{c.type}</Badge>
                  </div>
                  <Badge variant={c.threat === "high" ? "destructive" : "secondary"} className="text-[9px]">
                    {c.threat === "high" ? "⚠️ High Threat" : c.threat === "medium" ? "📊 Medium" : "✅ Low"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-chart-2 uppercase">Strengths</span>
                    {c.strengths.map((s, i) => (
                      <p key={i} className="text-[11px] text-foreground flex items-start gap-1"><span className="text-chart-2">+</span>{s}</p>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-destructive uppercase">Weaknesses</span>
                    {c.weaknesses.map((w, i) => (
                      <p key={i} className="text-[11px] text-foreground flex items-start gap-1"><span className="text-destructive">−</span>{w}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Domination Strategies */}
        <TabsContent value="strategies" className="mt-4 space-y-3">
          {strategies.map(s => {
            const isOpen = expandedStrategy === s.id;
            return (
              <Card key={s.id} className="border-border overflow-hidden">
                <CardHeader className="cursor-pointer select-none py-4" onClick={() => setExpandedStrategy(isOpen ? null : s.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{s.icon}</div>
                      <div>
                        <CardTitle className="text-sm">{s.title}</CardTitle>
                        <span className="text-[10px] text-muted-foreground">{s.timeline}</span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Swords className="h-3.5 w-3.5 text-chart-2" />
                          <span className="text-[10px] font-semibold uppercase text-chart-2">Offensive Moves</span>
                        </div>
                        {s.offensive.map((o, i) => (
                          <div key={i} className="bg-chart-2/5 border border-chart-2/15 rounded-[6px] p-2.5">
                            <p className="text-[11px] text-foreground">{o}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-semibold uppercase text-primary">Defensive Positions</span>
                        </div>
                        {s.defensive.map((d, i) => (
                          <div key={i} className="bg-primary/5 border border-primary/15 rounded-[6px] p-2.5">
                            <p className="text-[11px] text-foreground">{d}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* Early Warnings */}
        <TabsContent value="warnings" className="mt-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-chart-4" /> Competitive Early Warning Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {earlyWarnings.map((w, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Badge variant={w.severity === "high" ? "destructive" : "secondary"} className="text-[9px] shrink-0 mt-0.5">
                      {w.severity.toUpperCase()}
                    </Badge>
                    <p className="text-xs font-medium text-foreground">{w.signal}</p>
                  </div>
                  <div className="flex items-start gap-1.5 ml-14">
                    <ArrowRight className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-muted-foreground">{w.response}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap */}
        <TabsContent value="roadmap" className="mt-4 space-y-3">
          {[
            { phase: "Phase 1 — Category Definition (0-6m)", badge: "default" as const, actions: [
              "Publish category-defining terminology and own the narrative",
              "Launch Intelligence Index as industry reference standard",
              "Achieve prediction accuracy leadership vs. all competitors",
              "Secure media positioning as the 'Bloomberg of property'",
            ]},
            { phase: "Phase 2 — Ecosystem Entrenchment (6-18m)", badge: "secondary" as const, actions: [
              "Deploy vendor analytics making ASTRA indispensable for business decisions",
              "Embed financing and services creating full transaction stack",
              "Lock exclusive developer launch partnerships in top cities",
              "Build investor social network with high switching cost",
            ]},
            { phase: "Phase 3 — Market Irreversibility (18-36m)", badge: "destructive" as const, actions: [
              "Data moat exceeds 24-month replication barrier",
              "Network density creates self-reinforcing liquidity in 10+ cities",
              "Institutional capital flows through platform as default infrastructure",
              "Category language universally adopted — competitors forced to position relative to ASTRA",
            ]},
          ].map((p, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{p.phase}</CardTitle>
                  <Badge variant={p.badge} className="text-[10px]">Phase {i + 1}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {p.actions.map((a, j) => (
                  <div key={j} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{j + 1}</div>
                    <p className="text-xs text-foreground">{a}</p>
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

export default CompetitiveDomination;
