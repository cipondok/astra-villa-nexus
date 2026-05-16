import React, { useState } from "react";
import {
  DollarSign, BarChart3, Globe, Shield, TrendingUp,
  AlertTriangle, Zap, Target, Star, Crown,
  Layers, Building2, Landmark, BriefcaseBusiness,
  Trophy, Users, MapPin, Rocket, Activity,
  Handshake, Network, Map
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — $3M MONTHLY REVENUE ENGINE
   ═══════════════════════════════════════════════ */

const revenueArchitecture = [
  { stream: "Multi-Market Vendor & Developer Revenue", icon: Building2, color: "text-chart-4", targetPct: "35%", targetAmount: "$1.05M/mo",
    tactics: [
      { tactic: "Standardized city launch monetization playbook", detail: "Codified 90-day playbook tested across 10+ Indonesian cities, now replicated to SE Asian markets. Each new city follows: Week 1-4 (supply seeding, 0 revenue), Week 5-8 (first boost sales, $2-5K), Week 9-12 (subscription activation, $10-20K MRR). By Month 6, each city should generate $30-60K MRR. 20 revenue-producing cities × $50K avg = $1M/mo from vendor stream alone." },
      { tactic: "Developer consortium launch packages", detail: "Multi-developer campaign bundles: partner 3-5 developers in a region for a coordinated 'Property Season' launch. Package: Rp 500M-1B ($30-60K) per consortium event. Developers share costs, platform aggregates buyer demand. 5 consortium campaigns/quarter across SE Asia = $150-300K per quarter." },
      { tactic: "Regional brokerage franchise licensing", detail: "License the Astra platform to major brokerage networks in new countries under co-branded or white-label agreements. Licensing fee: $10-30K/month per franchise territory. 15 franchise territories across Vietnam, Philippines, Thailand, Malaysia = $150-450K MRR. They bring supply and local knowledge; you bring technology and intelligence." },
    ]},
  { stream: "Institutional Intelligence & Capital Services", icon: Landmark, color: "text-primary", targetPct: "25%", targetAmount: "$750K/mo",
    tactics: [
      { tactic: "Continental Institutional Terminal", detail: "Upgrade from Indonesia-only to SE Asia-wide institutional analytics: cross-border yield comparison, capital flow mapping, regulatory landscape intelligence, portfolio construction tools across 6 countries. Pricing: $5-15K/month per institutional seat. 80 institutional clients × $9K avg = $720K MRR." },
      { tactic: "Managed investment services", detail: "For qualified investors: end-to-end deal facilitation from discovery to acquisition to management referral. Service fee: 2-3% of transaction value on facilitated deals. Monthly facilitated volume target: $50M across all markets × 2% = $1M/month potential. Start with 0.5% capture growing to 2% as trust builds." },
      { tactic: "Proprietary index licensing", detail: "'Astra SE Asia Property Index' licensed to Bloomberg, Reuters, financial data terminals. Annual licensing fee: $200-500K per terminal provider. Plus: research subscriptions for consulting firms, banks, government agencies at $50-150K/year each. 20 data clients = $100-250K MRR." },
    ]},
  { stream: "Transaction Ecosystem & Financial Services", icon: Layers, color: "text-chart-2", targetPct: "25%", targetAmount: "$750K/mo",
    tactics: [
      { tactic: "Cross-border transaction facilitation", detail: "Facilitate international property purchases: foreign investor buys Indonesian/Vietnamese/Thai property through platform. Handle: currency conversion guidance, legal structure setup, regulatory compliance, escrow. Platform fee: 1-2% of transaction value. Target: $30M/month in cross-border deals × 1.5% = $450K/month." },
      { tactic: "Regional mortgage aggregator", detail: "Connect buyers with optimal mortgage products across partner banks in each country. Commission: 0.3-0.8% of mortgage value. Facilitate 200 mortgages/month × avg $200K × 0.5% = $200K/month. Requires banking partnerships in each market — start with Indonesia, Malaysia, Thailand." },
      { tactic: "Property lifecycle services platform", detail: "Post-acquisition services: property management referrals (10% of first-year management fee), insurance brokerage (5% annual premium commission), renovation marketplace (8-12% commission). Each closed transaction generates $500-2,000 in ancillary service revenue over 12 months. At 500 transactions/month = $250K-1M/month lifecycle revenue." },
    ]},
  { stream: "Data Intelligence Products", icon: BarChart3, color: "text-chart-5", targetPct: "15%", targetAmount: "$450K/mo",
    tactics: [
      { tactic: "Government urban planning data partnerships", detail: "Sell anonymized demand intelligence to city planning departments and national housing agencies across SE Asia. 'Where are people searching? What do they want? Where is undersupply critical?' Annual contracts: $50-200K per government entity. 10 government clients = $50-170K MRR." },
      { tactic: "Developer feasibility intelligence service", detail: "Before ground-breaking, developers need: demand validation, price point optimization, absorption forecasting, competitive landscape analysis. Bespoke report: $15-50K per project. At 20 reports/month across all markets = $300K-1M/month. Leverages existing data with minimal marginal cost." },
      { tactic: "Real estate AI model licensing", detail: "License predictive models (pricing, yield, demand forecasting) to PropTech companies in non-competing markets (Europe, Americas, Africa). Model licensing: $20-50K/month per licensee. 10 licensees = $200-500K MRR. Your SE Asia training data creates globally applicable intelligence." },
    ]},
];

const expansionMilestones = [
  { period: "Q1", target: "$1.5-1.8M/mo", focus: "Indonesia 15-city consolidation + first 3 SE Asian market entries (Vietnam, Thailand, Malaysia)", kpi: "15 Indonesian cities profitable, 3 new country launches initiated, 50 institutional clients" },
  { period: "Q2", target: "$2.0-2.3M/mo", focus: "SE Asian franchise licensing activation + cross-border transaction facilitation + government data contracts", kpi: "5 franchise territories live, $10M/mo cross-border volume, 5 government data clients" },
  { period: "Q3", target: "$2.5-2.8M/mo", focus: "Regional mortgage aggregation + developer consortium campaigns + AI model licensing", kpi: "100+ mortgages/mo facilitated, 3 consortium campaigns, 5 AI model licensees" },
  { period: "Q4", target: "$2.8-3.0M+/mo", focus: "Revenue predictability >65% recurring + continental institutional terminal + Philippines/Cambodia entry", kpi: ">65% recurring revenue, 80 institutional clients, 6 countries with revenue" },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — CONTINENTAL LEADERSHIP
   ═══════════════════════════════════════════════ */

const leadershipPillars = [
  { pillar: "Cross-Country Liquidity Network", icon: Globe, color: "text-chart-4", strategies: [
    { strategy: "Metropolitan cluster dominance strategy", detail: "Dominate the top 5 metro areas in each SE Asian country: Jakarta-Bandung-Surabaya (ID), HCMC-Hanoi (VN), Bangkok-Phuket-Chiang Mai (TH), KL-Penang-JB (MY), Manila-Cebu (PH). Total: 15-20 metro clusters with >30% listing market share each. When you own the top metros, you own the market." },
    { strategy: "Cross-border investor routing engine", detail: "Singapore investor searching for yield? Route to: Bali villas (7.5% yield), Bangkok condos (6.2%), HCMC apartments (8.1%), KL landed (5.8%). Platform becomes THE discovery layer for SE Asian property investment. No competitor offers unified cross-border intelligence. This is the continental moat." },
    { strategy: "Exclusive continental developer alliances", detail: "Partner with the top 10 pan-Asian developers (CapitaLand, Sinarmas, Vingroup, Ayala, etc.) for exclusive digital launch rights across ALL their markets. One alliance = supply in 3-5 countries simultaneously. Target: 5 pan-Asian developer exclusives = dominant supply position across the continent." },
  ]},
  { pillar: "Authority & Category Leadership", icon: Crown, color: "text-primary", strategies: [
    { strategy: "Astra SE Asia Property Intelligence Index", detail: "Monthly publication covering all 6 markets: price trends, yield comparisons, capital flow analysis, demand heatmaps, regulatory updates. Published in English (institutional), Bahasa, Vietnamese, Thai. Becomes the Bloomberg Terminal reference for SE Asian property. Media coverage across all markets — positions Astra as the continental authority." },
    { strategy: "Annual Astra Asia Property Summit", detail: "2,000+ attendee event rotating between Singapore, Jakarta, Bangkok. Keynotes from sovereign wealth funds, major developers, government ministers. Sponsor-funded: $500K-1M in sponsorship revenue. THE must-attend event for SE Asian property professionals. Creates unmatched brand gravity." },
    { strategy: "Category redefinition messaging", detail: "Stop competing as 'property portal'. Redefine category: 'Real Estate Intelligence Infrastructure'. Portal = listing aggregator (commodity). Infrastructure = essential operating system (monopoly). Every press release, investor deck, and partnership pitch uses infrastructure language. Change how the market sees you." },
  ]},
  { pillar: "Competitive Moat Reinforcement", icon: Shield, color: "text-chart-2", strategies: [
    { strategy: "Continental data network effect", detail: "Every transaction in Indonesia improves pricing models in Vietnam (similar development patterns). Every investor behavior signal in Thailand enhances recommendation algorithms in Malaysia. Cross-market data creates intelligence that no single-country competitor can replicate. The more countries you operate in, the smarter you get everywhere." },
    { strategy: "Ecosystem integration depth", detail: "In each country: integrate with 3+ banks (mortgage), 2+ law firms (conveyancing), 5+ service providers (renovation, insurance, management). Vendor and investor workflows become deeply embedded in Astra. Switching means rebuilding ALL these integrations. After 18 months in a market, switching cost is effectively prohibitive." },
    { strategy: "Astra Certified Professional program (continental)", detail: "Expand certification to all SE Asian markets. 'Astra Certified Agent — Thailand', 'Astra Certified Investor Advisor — Vietnam'. Create a pan-Asian professional standard associated with YOUR brand. 20,000 certified professionals across SE Asia = a continental army that promotes your platform daily." },
  ]},
];

const leadershipKpis = [
  { metric: "Continental active listings (total across markets)", target: ">500,000", warning: "<200,000" },
  { metric: "Cross-border investor transactions (monthly)", target: ">200", warning: "<50" },
  { metric: "Brand awareness in active markets (avg)", target: ">30%", warning: "<15%" },
  { metric: "Pan-Asian developer exclusives", target: ">5", warning: "<2" },
  { metric: "Certified professionals (continental)", target: ">20,000", warning: "<5,000" },
  { metric: "Markets with >30% listing share", target: ">10 metros", warning: "<5 metros" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — GLOBAL ALLIANCE COMMAND
   ═══════════════════════════════════════════════ */

const allianceCategories = [
  { category: "Developer Consortium Alliances", icon: Building2, partners: "CapitaLand, Sinarmas, Vingroup, Ayala Land, Frasers", value: "TRANSFORMATIONAL",
    creation: "Shared buyer demand intelligence → developers get pre-qualified investor pipeline. Astra gets exclusive supply for 14-30 day windows. Co-branded launches increase credibility for both parties. Revenue-sharing: 60% Astra / 40% developer on premium campaign fees.",
    governance: "Quarterly business reviews. Joint KPI dashboard: listings published, inquiries generated, viewings scheduled, deals closed. Minimum commitment: 5 project launches per year per developer. Non-exclusivity penalty: reduced campaign priority." },
  { category: "Brokerage Franchise Network", icon: Users, partners: "ERA, Century 21, PropNex, Savills regional offices", value: "HIGH",
    creation: "Brokerages bring: local agent networks (100-500 agents each), market knowledge, client relationships. Astra provides: technology platform, data intelligence, cross-border buyer routing, brand authority. Combined: more listings, better conversion, shared revenue.",
    governance: "Franchise agreement: 3-year minimum, territory exclusivity, quarterly performance targets. Revenue model: platform licensing fee + revenue share on premium features (70/30 split). Performance floor: <80% of targets for 2 consecutive quarters = franchise review." },
  { category: "Financial Ecosystem Partners", icon: Landmark, partners: "DBS, OCBC, UOB, Mandiri, BCA, Bangkok Bank", value: "VERY HIGH",
    creation: "Integrated mortgage pre-approval within property search flow. Banks get: pre-qualified leads, property valuation data, default risk intelligence. Astra gets: mortgage referral commissions (0.3-0.8%), enhanced buyer conversion (financing available = faster decisions), premium positioning.",
    governance: "Annual partnership agreements with quarterly pipeline reviews. API integration: buyer applies for mortgage within 2 clicks of viewing a listing. SLA: bank responds to pre-approval in <48 hours. Data exchange: anonymized transaction outcomes improve both parties' models." },
  { category: "Property Services & Asset Management", icon: Handshake, partners: "JLL, CBRE, Colliers (regional), local service platforms", value: "HIGH",
    creation: "Post-transaction service marketplace: property management, renovation, insurance, legal — all accessible through Astra. Asset managers get: deal origination pipeline, portfolio analytics. Astra gets: lifecycle revenue, user retention (stay on platform even after purchase), data depth.",
    governance: "Service-level agreements with quality guarantees. Customer satisfaction thresholds: <4.0/5.0 rating for 2 months = partner review. Revenue model: 8-15% commission on all services booked through platform. Exclusive partnerships by service category per district." },
];

const allianceKpis = [
  { metric: "Revenue from partnership channels (% of total)", target: ">25%", warning: "<10%" },
  { metric: "Capital volume facilitated via alliances (quarterly)", target: ">$200M", warning: "<$50M" },
  { metric: "Strategic partner retention rate (annual)", target: ">90%", warning: "<70%" },
  { metric: "Active alliance integrations (API/tech)", target: ">30", warning: "<10" },
  { metric: "Partner NPS (satisfaction score)", target: ">50", warning: "<20" },
];

/* ═══════════════════════════════════════════════
   MONITORING & RISKS
   ═══════════════════════════════════════════════ */

const operationalChecklist = [
  { task: "Review per-country P&L — which markets profitable, which investing?", category: "Revenue" },
  { task: "Analyze franchise territory performance — any underperformers?", category: "Expansion" },
  { task: "Check cross-border transaction pipeline — volume trending up?", category: "Transactions" },
  { task: "Review institutional client health — renewals, usage, satisfaction", category: "Retention" },
  { task: "Evaluate developer consortium campaign ROI by market", category: "Partnerships" },
  { task: "Assess competitive moves in each active market", category: "Strategy" },
  { task: "Review hiring pipeline — country managers, sales, engineering", category: "Operations" },
  { task: "Check data product pipeline — new intelligence offerings?", category: "Product" },
  { task: "Monitor regulatory changes in all active jurisdictions", category: "Compliance" },
  { task: "Review continental brand health — awareness, media, NPS", category: "Brand" },
  { task: "Evaluate alliance health scores — any at-risk partnerships?", category: "Partnerships" },
  { task: "Assess margin trajectory per market and per stream", category: "Efficiency" },
];

const expansionRisks = [
  { risk: "Cross-border regulatory complexity paralyzes expansion", severity: "CRITICAL", mitigation: "Each SE Asian country has different: foreign ownership laws, data protection regulations, financial services licensing, tax structures. Solution: hire in-country legal counsel BEFORE launch (not after). Budget $50-100K per country for regulatory setup. Use Singapore holding company for clean international structure. Partner with local law firms who specialize in PropTech/FinTech regulation." },
  { risk: "Currency and economic volatility across markets", severity: "HIGH", mitigation: "Revenue in 6 different currencies = FX risk. Hedging: price institutional products in USD, keep operating expenses in local currency. Natural hedge: costs and revenue in same currency per country. Treasury policy: maintain 3-month operating reserves per country. Monitor: IDR, VND, THB, MYR, PHP against USD weekly." },
  { risk: "Local competitor with government backing in new market", severity: "HIGH", mitigation: "Some SE Asian markets have state-backed property platforms or heavily funded local competitors. Strategy: don't compete head-on initially. Enter through institutional/data channel (harder to replicate) before expanding to consumer marketplace. Partner with local brokerages rather than competing with them. Intelligence superiority > marketing spend." },
  { risk: "Cultural and operational misalignment in new markets", severity: "HIGH", mitigation: "What works in Indonesia may fail in Vietnam or Thailand. Every market needs: local leadership team (not expat management), localized product (language, payment methods, property types), culturally appropriate marketing. Rule: Country Manager must be a local hire with 10+ years in local real estate. Never remote-manage a country." },
  { risk: "Alliance partners become competitors", severity: "MEDIUM", mitigation: "Large brokerage or developer partner builds their own platform using insights gained from your data. Mitigation: maintain proprietary AI models and core algorithms in-house. Share outputs (reports, recommendations) not inputs (raw data, model architecture). Contract clause: 24-month non-compete on digital platform development. But ultimately: speed of innovation is your best defense." },
];

const categoryBadgeColors: Record<string, string> = {
  Revenue: "bg-chart-4/10 text-chart-4",
  Expansion: "bg-chart-2/10 text-chart-2",
  Transactions: "bg-primary/10 text-primary",
  Retention: "bg-destructive/10 text-destructive",
  Partnerships: "bg-chart-5/10 text-chart-5",
  Strategy: "bg-chart-1/10 text-chart-1",
  Operations: "bg-muted text-muted-foreground",
  Product: "bg-chart-3/10 text-chart-3",
  Compliance: "bg-destructive/10 text-destructive",
  Brand: "bg-chart-4/10 text-chart-4",
  Efficiency: "bg-muted text-muted-foreground",
};

/* ═══════════════════════════════════════════════ */

const ContinentalExpansionBlueprint: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const toggle = (idx: number) => setCheckedItems(prev => {
    const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="$3M Continental Expansion"
        description="Multi-market revenue replication, continental leadership & global alliance command"
        icon={Globe}
        badge={{ text: "🌏 Continental", variant: "outline" }}
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="revenue" className="text-xs">$3M Revenue</TabsTrigger>
          <TabsTrigger value="leadership" className="text-xs">Continental Lead</TabsTrigger>
          <TabsTrigger value="alliances" className="text-xs">Alliance Command</TabsTrigger>
          <TabsTrigger value="monitor" className="text-xs">Ops Monitor</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Expansion Risks</TabsTrigger>
        </TabsList>

        {/* ── $3M REVENUE ── */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          {revenueArchitecture.map((rs, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm flex items-center gap-2", rs.color)}>
                    <rs.icon className="h-4 w-4" /> {rs.stream}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[9px]">{rs.targetPct}</Badge>
                    <Badge variant="default" className="text-[9px]">{rs.targetAmount}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {rs.tactics.map((t, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{t.tactic}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{t.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Quarterly Expansion Trajectory</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {expansionMilestones.map((em, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs font-semibold text-foreground">{em.period}</p>
                    <Badge variant="default" className="text-[9px]">🎯 {em.target}</Badge>
                  </div>
                  <p className="text-[9px] text-chart-2">{em.focus}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{em.kpi}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CONTINENTAL LEADERSHIP ── */}
        <TabsContent value="leadership" className="mt-4 space-y-4">
          {leadershipPillars.map((lp, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", lp.color)}>
                  <lp.icon className="h-4 w-4" /> {lp.pillar}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lp.strategies.map((s, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{s.strategy}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Continental Leadership KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {leadershipKpis.map((lk, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20 flex-wrap gap-1">
                  <p className="text-[10px] text-foreground font-medium">{lk.metric}</p>
                  <div className="flex gap-1">
                    <Badge variant="default" className="text-[8px]">🎯 {lk.target}</Badge>
                    <Badge variant="destructive" className="text-[8px]">⚠ {lk.warning}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ALLIANCE COMMAND ── */}
        <TabsContent value="alliances" className="mt-4 space-y-4">
          {allianceCategories.map((ac, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ac.icon className="h-4 w-4 text-primary" /> {ac.category}
                  </CardTitle>
                  <Badge variant="default" className="text-[8px]">{ac.value}</Badge>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">Target partners: {ac.partners}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-lg border border-border/40 p-3 space-y-1">
                  <p className="text-[9px] font-semibold text-chart-2 uppercase tracking-wider">Value Creation</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{ac.creation}</p>
                </div>
                <div className="rounded-lg border border-border/40 p-3 space-y-1">
                  <p className="text-[9px] font-semibold text-primary uppercase tracking-wider">Governance & Scaling</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{ac.governance}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Alliance Performance KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {allianceKpis.map((ak, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20 flex-wrap gap-1">
                  <p className="text-[10px] text-foreground font-medium">{ak.metric}</p>
                  <div className="flex gap-1">
                    <Badge variant="default" className="text-[8px]">🎯 {ak.target}</Badge>
                    <Badge variant="destructive" className="text-[8px]">⚠ {ak.warning}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── OPS MONITOR ── */}
        <TabsContent value="monitor" className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Late Growth-Stage Operations</h3>
            <Badge variant="outline" className="text-[9px]">{checkedItems.size}/{operationalChecklist.length}</Badge>
          </div>
          <Progress value={(checkedItems.size / operationalChecklist.length) * 100} className="h-2 mb-3" />
          {operationalChecklist.map((item, i) => (
            <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border border-border/40", checkedItems.has(i) && "opacity-50")}>
              <Checkbox checked={checkedItems.has(i)} onCheckedChange={() => toggle(i)} />
              <div className="flex-1">
                <p className={cn("text-xs text-foreground", checkedItems.has(i) && "line-through")}>{item.task}</p>
              </div>
              <Badge className={cn("text-[8px]", categoryBadgeColors[item.category] || "bg-muted text-muted-foreground")}>{item.category}</Badge>
            </div>
          ))}
        </TabsContent>

        {/* ── EXPANSION RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          {expansionRisks.map((er, i) => (
            <Card key={i} className={cn("border-border", er.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className={cn("h-4 w-4", er.severity === "CRITICAL" ? "text-destructive" : "text-chart-4")} />
                  <Badge variant={er.severity === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{er.severity}</Badge>
                  <p className="text-xs font-semibold text-foreground">{er.risk}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{er.mitigation}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContinentalExpansionBlueprint;
