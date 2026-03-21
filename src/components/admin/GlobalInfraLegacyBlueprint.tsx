import React from "react";
import {
  Globe, Landmark, Crown, Shield, AlertTriangle, TrendingUp,
  Users, Cpu, Layers, Eye, ChevronRight, Activity, Scale,
  Building, BookOpen, Radio, Lock, Megaphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — GLOBAL ECONOMIC INFRASTRUCTURE
   ═══════════════════════════════════════════════ */

const infraPillars = [
  {
    pillar: "Capital Flow Intelligence Layer",
    icon: TrendingUp,
    timeline: "Year 5–15",
    systems: [
      { name: "Cross-Border Opportunity Router", detail: "AI routes investment opportunities to institutional investors across jurisdictions based on risk appetite, regulatory constraints, and yield targets.", maturity: 20 },
      { name: "Liquidity Visibility Index", detail: "Real-time district and city-level liquidity scores published as industry benchmark — cited by central banks and sovereign funds.", maturity: 15 },
      { name: "Institutional Data Terminal", detail: "Bloomberg-grade real estate intelligence feed: pricing predictions, absorption rates, capital flow vectors. Licensed at $50K-500K/year.", maturity: 25 },
      { name: "Predictive Capital Migration", detail: "72-hour advance signals on capital flow shifts between cities/countries, enabling pre-positioning for institutional clients.", maturity: 10 },
    ],
  },
  {
    pillar: "Market Standardization Influence",
    icon: Scale,
    timeline: "Year 7–20",
    systems: [
      { name: "Digital Transaction Protocol", detail: "Platform-defined standards for property transaction data exchange become industry norm — adopted by brokerages, banks, and regulators.", maturity: 10 },
      { name: "Pricing Transparency Benchmark", detail: "AI Fair Market Value becomes reference standard for mortgage underwriting, insurance valuation, and tax assessment.", maturity: 15 },
      { name: "Regulatory Collaboration Framework", detail: "Co-design digital property regulations with OJK, MAS, HKMA. Platform becomes regulatory technology partner.", maturity: 5 },
    ],
  },
  {
    pillar: "Ecosystem Infrastructure Integration",
    icon: Layers,
    timeline: "Year 4–12",
    systems: [
      { name: "Property Lifecycle Orchestration", detail: "Discovery → Transaction → Ownership → Management → Exit — all services coordinated through platform APIs.", maturity: 30 },
      { name: "Government Data Partnership", detail: "Two-way data sharing with land registries, tax authorities, urban planning agencies. Platform becomes public-private infrastructure.", maturity: 5 },
      { name: "Multi-Service Interoperability", detail: "Open API standard enabling third-party fintech, insurtech, and proptech services to plug into platform infrastructure.", maturity: 20 },
    ],
  },
  {
    pillar: "Network Gravity & Dependency",
    icon: Lock,
    timeline: "Year 3–10+",
    systems: [
      { name: "Switching Cost Escalation", detail: "Each year of vendor data, reputation, and client relationships on platform increases exit cost exponentially. Year 3+ vendors have <3% churn.", maturity: 35 },
      { name: "Exclusive Intelligence Signals", detail: "Behavioral data from 100K+ users creates prediction accuracy impossible to replicate. Intelligence gap widens with each transaction.", maturity: 25 },
      { name: "Industry Default Behavior", detail: "Agents check platform first. Investors analyze through platform. Developers launch on platform. Participation becomes non-optional.", maturity: 10 },
    ],
  },
];

const systemicRisks = [
  { risk: "Regulatory anti-monopoly intervention as market share exceeds 40%", governance: "Proactive self-governance: published fairness metrics, open data initiatives, voluntary market share caps per district. Engage regulators as partners before they become adversaries.", severity: "CRITICAL" },
  { risk: "Over-dependence on platform creates systemic fragility — single point of failure", governance: "Multi-region infrastructure redundancy. Published disaster recovery SLAs. Data portability guarantees for all participants. Industry coalition governance.", severity: "HIGH" },
  { risk: "AI pricing influence distorts actual market values", governance: "Transparent methodology publication. Independent academic audit of AI models annually. Human override mandatory for valuations >$10M.", severity: "HIGH" },
  { risk: "Cross-border data sovereignty conflicts across jurisdictions", governance: "Data localization per jurisdiction. Singapore HoldCo for ASEAN, Luxembourg for EU, Cayman for global capital. Local compliance officers per market.", severity: "MEDIUM" },
  { risk: "Platform power imbalance between institutional and retail participants", governance: "Retail investor protections: fair access to intelligence, anti-front-running controls, delayed institutional signal publication to prevent information asymmetry.", severity: "HIGH" },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — FOUNDER LEGACY NARRATIVE
   ═══════════════════════════════════════════════ */

const narrativeFormats = [
  {
    format: "Global Keynote Vision",
    icon: Megaphone,
    narrative: `"Every year, $300 trillion in real estate changes hands guided by incomplete information, fragmented relationships, and opaque pricing. We are building the intelligence infrastructure that makes every property decision — from a first-time homebuyer in Jakarta to a sovereign fund allocating $500 million — more transparent, more efficient, and more fair. This is not a marketplace. This is the coordination layer for the world's largest asset class. And it is inevitable."`,
  },
  {
    format: "Investor Legacy Manifesto",
    icon: Landmark,
    narrative: `"We did not set out to build a listing portal. We set out to solve a fundamental coordination failure in real estate markets — the absence of intelligence infrastructure. Today, banks price mortgages using our data. Developers plan launches based on our demand signals. Investors discover opportunities through our AI before they appear on any other platform. What we have built is not easily replicated, because it is not just technology — it is the accumulated intelligence of every transaction, every search, every decision made through our system. This compounds. And it creates an asset that becomes more valuable with every year of operation."`,
  },
  {
    format: "Internal Leadership Message",
    icon: Users,
    narrative: `"We are not building features. We are building a system that changes how an entire industry operates. Every line of code, every agent relationship, every investor interaction adds a layer of intelligence that no competitor can replicate without the time we have already invested. The mission is generational: create a world where property markets are as transparent and efficient as public equity markets. That journey takes decades, not quarters. Stay patient. Stay rigorous. The compound effect will become undeniable."`,
  },
  {
    format: "Documentary-Style Summary",
    icon: BookOpen,
    narrative: `"In 2024, a single founder in Indonesia began building what would become the most consequential real estate intelligence platform in Southeast Asia. The thesis was simple but audacious: property markets, the world's largest asset class, operated on 20th-century information infrastructure. By 2030, the platform processed more property transaction intelligence than any institution in the region. By 2035, its pricing data was referenced by central banks, its liquidity indices cited in sovereign fund reports, and its transaction protocols adopted as industry standard across 12 countries. The platform did not disrupt real estate. It became real estate's operating system."`,
  },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — POST-IPO MARKET CONTROL
   ═══════════════════════════════════════════════ */

const postIPOStrategies = [
  {
    category: "Dominance Reinforcement",
    icon: Crown,
    strategies: [
      { strategy: "Continuous liquidity density expansion: target >70% listing coverage in all active cities within 3 years post-IPO", timeline: "Year 1-3 post-IPO", impact: "CRITICAL" },
      { strategy: "Ecosystem bundling: financing + insurance + renovation as integrated checkout flow — 40% of transactions use ≥2 services", timeline: "Year 1-2 post-IPO", impact: "HIGH" },
      { strategy: "Long-term vendor loyalty architecture: 3-year contracts with volume-based pricing tiers and annual loyalty credits", timeline: "Ongoing", impact: "HIGH" },
      { strategy: "Investor retention flywheel: portfolio tracking + AI watchlist + community create daily engagement habit", timeline: "Ongoing", impact: "HIGH" },
    ],
  },
  {
    category: "Innovation & Intelligence Leadership",
    icon: Cpu,
    strategies: [
      { strategy: "Dedicated AI research lab: 15% of R&D budget on next-gen prediction models, NLP property search, computer vision valuation", timeline: "Year 1+ post-IPO", impact: "HIGH" },
      { strategy: "Strategic acquisitions: 1-2 tuck-in acquisitions/year targeting data assets, geographic coverage, or technology capabilities", timeline: "Ongoing", impact: "HIGH" },
      { strategy: "Data moat acceleration: every new market, service, and user interaction feeds back into prediction models — accuracy gap widens each quarter", timeline: "Continuous", impact: "CRITICAL" },
      { strategy: "Publish annual 'State of Real Estate Intelligence' report — establish platform as industry's primary analytical voice", timeline: "Annual", impact: "MEDIUM" },
    ],
  },
  {
    category: "Capital Markets Confidence",
    icon: Landmark,
    strategies: [
      { strategy: "Transparent quarterly reporting: consistent metric framework (ARR, NRR, LTV:CAC, liquidity density) — no metric changes without explanation", timeline: "Quarterly", impact: "CRITICAL" },
      { strategy: "Analyst day cadence: annual deep-dive on product roadmap, unit economics, and competitive moat — build long-term holder base", timeline: "Annual", impact: "HIGH" },
      { strategy: "Category leadership narrative: position in earnings calls as 'real estate intelligence infrastructure' not 'marketplace' — justify premium multiple", timeline: "Ongoing", impact: "HIGH" },
      { strategy: "ESG integration: publish diversity metrics, environmental impact of digitization, and affordable housing data contribution", timeline: "Annual", impact: "MEDIUM" },
    ],
  },
  {
    category: "Defensive Strategy Against Disruptors",
    icon: Shield,
    strategies: [
      { strategy: "Competitive intelligence unit: monitor patent filings, funding announcements, and talent movements in PropTech globally", timeline: "Ongoing", impact: "HIGH" },
      { strategy: "Pricing power preservation: maintain value-based pricing, never engage in price wars — compete on intelligence depth not cost", timeline: "Ongoing", impact: "CRITICAL" },
      { strategy: "Ecosystem lock-in acceleration: open API partnerships create dependency network — 50+ integrated services make platform irreplaceable", timeline: "Year 2-5 post-IPO", impact: "HIGH" },
      { strategy: "Talent moat: hire top AI/ML engineers from global firms, offer equity retention, create research publication culture", timeline: "Ongoing", impact: "MEDIUM" },
    ],
  },
];

const decadePriorities = [
  { decade: "Year 1–10", role: "Builder → CEO", priorities: ["Build product, find market fit, reach $100M ARR", "Hire world-class executive team", "Establish category and brand authority", "IPO or major strategic milestone"] },
  { decade: "Year 10–20", role: "CEO → Chairman", priorities: ["Sustain dominance post-IPO through innovation", "Expand to 30+ countries via licensing/JV", "Establish government and institutional partnerships", "Begin transition from operator to strategic governance"] },
  { decade: "Year 20–30+", role: "Chairman → Founder Emeritus", priorities: ["Shape industry standards through advisory and board roles", "Establish research foundation for real estate technology", "Ensure institutional independence survives beyond founder involvement", "Legacy: transparent, efficient global property markets"] },
];

/* ═══════════════════════════════════════════════ */

const GlobalInfraLegacyBlueprint: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Global Infrastructure & Founder Legacy"
        description="Economic infrastructure domination, founder legacy narrative & post-IPO sustained market control"
        icon={Globe}
        badge={{ text: "🏛 Legacy", variant: "outline" }}
      />

      <Tabs defaultValue="infrastructure" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="infrastructure" className="text-xs">Global Infra</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Systemic Risk</TabsTrigger>
          <TabsTrigger value="legacy" className="text-xs">Founder Legacy</TabsTrigger>
          <TabsTrigger value="post-ipo" className="text-xs">Post-IPO Control</TabsTrigger>
          <TabsTrigger value="decades" className="text-xs">Decade Vision</TabsTrigger>
        </TabsList>

        {/* ── GLOBAL INFRASTRUCTURE ── */}
        <TabsContent value="infrastructure" className="mt-4 space-y-4">
          {infraPillars.map((p, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <p.icon className="h-4 w-4 text-primary" /> {p.pillar}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">{p.timeline}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {p.systems.map((s, j) => (
                  <div key={j} className="p-2.5 rounded-lg bg-muted/20 border border-border/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">{s.name}</p>
                      <div className="flex items-center gap-1.5">
                        <Progress value={s.maturity} className="h-1 w-10" />
                        <span className="text-[8px] text-muted-foreground">{s.maturity}%</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── SYSTEMIC RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-2">
          {systemicRisks.map((r, i) => (
            <Card key={i} className={cn("border-border", r.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{r.risk}</p>
                  <Badge variant={r.severity === "CRITICAL" ? "destructive" : r.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{r.severity}</Badge>
                </div>
                <div className="pl-3 border-l-2 border-chart-2/30">
                  <p className="text-[9px] font-semibold text-chart-2 mb-0.5">GOVERNANCE FRAMEWORK</p>
                  <p className="text-[10px] text-foreground">{r.governance}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── FOUNDER LEGACY ── */}
        <TabsContent value="legacy" className="mt-4 space-y-3">
          {narrativeFormats.map((n, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <n.icon className="h-4 w-4 text-primary" /> {n.format}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/30 italic">
                  <p className="text-[11px] text-foreground leading-relaxed whitespace-pre-line">{n.narrative}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── POST-IPO CONTROL ── */}
        <TabsContent value="post-ipo" className="mt-4 space-y-4">
          {postIPOStrategies.map((cat, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <cat.icon className="h-4 w-4 text-primary" /> {cat.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {cat.strategies.map((s, j) => (
                  <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
                    <Badge variant={s.impact === "CRITICAL" ? "destructive" : s.impact === "HIGH" ? "default" : "secondary"} className="text-[8px] shrink-0">{s.impact}</Badge>
                    <div>
                      <p className="text-[11px] text-foreground">{s.strategy}</p>
                      <span className="text-[9px] text-muted-foreground">{s.timeline}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── DECADE VISION ── */}
        <TabsContent value="decades" className="mt-4 space-y-3">
          {decadePriorities.map((d, i) => (
            <Card key={i} className={cn("border-border", i === 0 && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[9px]">{d.decade}</Badge>
                  <span className="text-sm font-bold text-primary">{d.role}</span>
                </div>
                <div className="space-y-1.5">
                  {d.priorities.map((p, j) => (
                    <div key={j} className="flex items-start gap-2 text-[11px] text-foreground">
                      <span className="text-primary shrink-0">#{j + 1}</span> {p}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalInfraLegacyBlueprint;
