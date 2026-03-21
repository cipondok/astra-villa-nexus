import React, { useState } from "react";
import { Handshake, ChevronDown, ChevronUp, Copy, Check, Building2, Landmark, Wrench, Brain, Users, TrendingUp, Shield, Clock, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── types ───────── */

interface Partner {
  id: string;
  category: string;
  icon: React.ReactNode;
  name: string;
  strategicBenefit: string;
  liquidityImpact: number;
  revenueAcceleration: number;
  integrationComplexity: number;
  negotiationLeverage: string;
  examples: string[];
  phase: "quick-win" | "expansion" | "lock-in";
}

/* ───────── data ───────── */

const partners: Partner[] = [
  {
    id: "dev-alliance", category: "Real Estate Developer", icon: <Building2 className="h-5 w-5" />,
    name: "Developer Alliance Program",
    strategicBenefit: "Direct access to new project inventory before public launch — creates exclusive supply moat and first-mover advantage for investors on the platform",
    liquidityImpact: 92, revenueAcceleration: 88, integrationComplexity: 35,
    negotiationLeverage: "Developers need demand channels; platform offers qualified investor traffic and data-driven pricing validation that reduces their sales cycle by 40%",
    examples: ["Agung Podomoro", "Ciputra Group", "Sinar Mas Land", "Summarecon Agung"],
    phase: "quick-win",
  },
  {
    id: "brokerage-net", category: "Brokerage Network", icon: <Users className="h-5 w-5" />,
    name: "Brokerage Network Integration",
    strategicBenefit: "Aggregates distributed agent inventory into unified marketplace — increases listing density by 3-5x per city without direct vendor acquisition cost",
    liquidityImpact: 95, revenueAcceleration: 72, integrationComplexity: 55,
    negotiationLeverage: "Agents need digital presence and qualified leads; platform provides performance analytics and lead routing that increases their closing rate by 25%",
    examples: ["ERA Indonesia", "Ray White", "Century 21", "Independent agent networks"],
    phase: "quick-win",
  },
  {
    id: "mortgage", category: "Mortgage & Financing", icon: <Landmark className="h-5 w-5" />,
    name: "Mortgage & Financing Partnership",
    strategicBenefit: "Embedded financing creates transaction completion engine — converts browsing investors into committed buyers by removing financing friction at decision point",
    liquidityImpact: 78, revenueAcceleration: 90, integrationComplexity: 65,
    negotiationLeverage: "Banks need digital origination channels; platform offers pre-qualified borrowers with property-matched profiles reducing their underwriting cost by 30%",
    examples: ["BCA", "Bank Mandiri", "BNI", "BTN", "CIMB Niaga"],
    phase: "expansion",
  },
  {
    id: "prop-services", category: "Property Services", icon: <Wrench className="h-5 w-5" />,
    name: "Property Services Marketplace",
    strategicBenefit: "Post-transaction service layer captures ongoing owner spend — transforms one-time transaction revenue into recurring service marketplace commissions",
    liquidityImpact: 45, revenueAcceleration: 75, integrationComplexity: 40,
    negotiationLeverage: "Service providers need customer acquisition; platform offers intent-verified property owners at exact moment of renovation, moving, or management need",
    examples: ["Interior designers", "Moving companies", "Property management", "Home insurance", "Legal/notary"],
    phase: "expansion",
  },
  {
    id: "data-ai", category: "Data & AI Technology", icon: <Brain className="h-5 w-5" />,
    name: "Data Intelligence Alliance",
    strategicBenefit: "Proprietary data enrichment deepens intelligence moat — satellite imagery, demographic overlays, and economic indicators compound platform prediction accuracy",
    liquidityImpact: 60, revenueAcceleration: 55, integrationComplexity: 70,
    negotiationLeverage: "Data providers need distribution and application context; platform offers real-world validation loop that improves their model accuracy and creates joint IP",
    examples: ["BPS (Statistics Bureau)", "Satellite imagery providers", "Geospatial analytics", "Credit scoring APIs"],
    phase: "lock-in",
  },
  {
    id: "institutional", category: "Institutional Capital", icon: <DollarSign className="h-5 w-5" />,
    name: "Institutional Capital Gateway",
    strategicBenefit: "Unlocks large-ticket capital deployment through platform — positions marketplace as infrastructure for institutional deal flow, creating permanent demand anchor",
    liquidityImpact: 85, revenueAcceleration: 92, integrationComplexity: 80,
    negotiationLeverage: "Institutions need deal sourcing and due-diligence infrastructure in emerging markets; platform offers vetted, data-rich deal pipeline unavailable elsewhere",
    examples: ["Family offices", "REITs", "Pension funds", "Sovereign wealth allocators", "PE real estate funds"],
    phase: "lock-in",
  },
  {
    id: "gov-urban", category: "Government & Urban Planning", icon: <Shield className="h-5 w-5" />,
    name: "Government & Urban Data Partnership",
    strategicBenefit: "Exclusive access to zoning, permit, and infrastructure data creates unassailable intelligence advantage — no competitor can replicate government-sourced data pipelines",
    liquidityImpact: 50, revenueAcceleration: 40, integrationComplexity: 85,
    negotiationLeverage: "Government agencies need digital transparency tools and market monitoring dashboards; platform offers real-time market intelligence reports in exchange for data access",
    examples: ["BPN (Land Agency)", "Municipal planning offices", "Smart city initiatives", "Infrastructure ministries"],
    phase: "lock-in",
  },
];

const phaseConfig = {
  "quick-win": { label: "Phase 1 — Quick Wins", badge: "⚡ 0-3 months", color: "text-chart-2", desc: "Fastest liquidity & supply injection — low complexity, high immediate impact partnerships" },
  "expansion": { label: "Phase 2 — Ecosystem Expansion", badge: "🚀 3-12 months", color: "text-primary", desc: "Monetization channel diversification and transaction completion infrastructure" },
  "lock-in": { label: "Phase 3 — Platform Lock-In", badge: "🏰 12-24 months", color: "text-chart-4", desc: "Long-term defensibility through exclusive data, institutional capital, and regulatory moats" },
};

const networkEffects = [
  { outcome: "Supply density increases → investor inquiry rate rises 2.4x", driver: "Developer + Brokerage partnerships", score: 95 },
  { outcome: "Embedded financing → transaction completion rate improves 35%", driver: "Mortgage partnerships", score: 88 },
  { outcome: "Post-transaction services → LTV increases 3.2x per user", driver: "Property services marketplace", score: 82 },
  { outcome: "Institutional capital → average deal size increases 8x", driver: "Institutional capital gateway", score: 90 },
  { outcome: "Government data → prediction accuracy reaches 92%+", driver: "Government data partnership", score: 78 },
  { outcome: "Cross-partner data loop → replication barrier exceeds 24 months", driver: "Combined ecosystem effect", score: 96 },
];

/* ───────── component ───────── */

const PartnershipStrategy: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>("dev-alliance");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Global Partnership Strategy"
        description="Alliance roadmap for liquidity acceleration, monetization channels & ecosystem lock-in across 7 partnership categories"
        icon={Handshake}
        badge={{ text: "🤝 Alliances", variant: "outline" }}
      />

      {/* Scoring summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Partnership Categories", value: partners.length, icon: <Handshake className="h-4 w-4 text-primary" /> },
          { label: "Avg Liquidity Impact", value: Math.round(partners.reduce((s, p) => s + p.liquidityImpact, 0) / partners.length), icon: <TrendingUp className="h-4 w-4 text-chart-2" /> },
          { label: "Avg Revenue Acceleration", value: Math.round(partners.reduce((s, p) => s + p.revenueAcceleration, 0) / partners.length), icon: <DollarSign className="h-4 w-4 text-chart-3" /> },
          { label: "Network Effects", value: networkEffects.length, icon: <Zap className="h-4 w-4 text-chart-4" /> },
        ].map((s, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="partnerships" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="partnerships" className="text-xs">Partnerships</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Phased Roadmap</TabsTrigger>
          <TabsTrigger value="network" className="text-xs">Network Effects</TabsTrigger>
        </TabsList>

        {/* Partnership Cards */}
        <TabsContent value="partnerships" className="space-y-3 mt-4">
          {partners.map(p => {
            const isOpen = expanded === p.id;
            const phase = phaseConfig[p.phase];
            return (
              <Card key={p.id} className="border-border overflow-hidden">
                <CardHeader className="cursor-pointer select-none py-4" onClick={() => setExpanded(isOpen ? null : p.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{p.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-semibold text-foreground">{p.name}</CardTitle>
                          <Badge variant="secondary" className="text-[9px]">{p.category}</Badge>
                        </div>
                        <span className={cn("text-[10px] font-medium", phase.color)}>{phase.badge}</span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </CardHeader>

                {isOpen && (
                  <CardContent className="pt-0 space-y-4">
                    {/* Strategic benefit */}
                    <div className="bg-muted/30 rounded-[6px] p-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Strategic Benefit</span>
                          <p className="text-sm text-foreground mt-1">{p.strategicBenefit}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => copy(p.strategicBenefit, `${p.id}-benefit`)}>
                          {copiedId === `${p.id}-benefit` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Liquidity Impact</span>
                        <div className="flex items-center gap-1.5">
                          <Progress value={p.liquidityImpact} className="h-2 flex-1" />
                          <span className="text-xs font-bold text-foreground">{p.liquidityImpact}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Revenue Acceleration</span>
                        <div className="flex items-center gap-1.5">
                          <Progress value={p.revenueAcceleration} className="h-2 flex-1" />
                          <span className="text-xs font-bold text-foreground">{p.revenueAcceleration}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Integration Complexity</span>
                        <div className="flex items-center gap-1.5">
                          <Progress value={p.integrationComplexity} className="h-2 flex-1" />
                          <span className="text-xs font-bold text-foreground">{p.integrationComplexity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Negotiation leverage */}
                    <div className="bg-primary/5 border border-primary/20 rounded-[6px] p-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Negotiation Leverage</span>
                          <p className="text-xs text-foreground mt-1">{p.negotiationLeverage}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => copy(p.negotiationLeverage, `${p.id}-leverage`)}>
                          {copiedId === `${p.id}-leverage` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    {/* Target examples */}
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Target Partners</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {p.examples.map((ex, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{ex}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* Phased Roadmap */}
        <TabsContent value="roadmap" className="space-y-4 mt-4">
          {(["quick-win", "expansion", "lock-in"] as const).map(phase => {
            const cfg = phaseConfig[phase];
            const phasePartners = partners.filter(p => p.phase === phase);
            return (
              <Card key={phase} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{cfg.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {phasePartners.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                      <div className="h-8 w-8 rounded-[6px] bg-primary/10 flex items-center justify-center shrink-0">{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.category}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] shrink-0">
                        <div className="text-center">
                          <p className="text-muted-foreground">Liquidity</p>
                          <p className="font-bold text-foreground">{p.liquidityImpact}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-bold text-chart-2">{p.revenueAcceleration}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Complexity</p>
                          <p className="font-bold text-foreground">{p.integrationComplexity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Network Effects */}
        <TabsContent value="network" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-4" /> Expected Network Effect Reinforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {networkEffects.sort((a, b) => b.score - a.score).map((ne, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="h-7 w-7 rounded-full bg-chart-4/10 flex items-center justify-center text-[10px] font-bold text-chart-4 shrink-0">{ne.score}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{ne.outcome}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Driver: {ne.driver}</p>
                  </div>
                  <Progress value={ne.score} className="h-1.5 w-20 shrink-0 mt-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prioritization scoring */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Partnership Prioritization Score Formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { weight: "35%", factor: "Liquidity Impact", desc: "How much does this partnership increase listing density, inquiry velocity, or transaction completion?" },
                { weight: "30%", factor: "Revenue Acceleration", desc: "Direct and indirect monetization potential — commission streams, subscription uplift, ARPU increase" },
                { weight: "20%", factor: "Inverse Complexity", desc: "Lower integration effort scores higher — quick-to-deploy partnerships get prioritized" },
                { weight: "15%", factor: "Moat Reinforcement", desc: "Long-term defensibility contribution — exclusive data access, switching cost creation, network lock-in" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="default" className="text-[10px] shrink-0 mt-0.5">{f.weight}</Badge>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{f.factor}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
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

export default PartnershipStrategy;
