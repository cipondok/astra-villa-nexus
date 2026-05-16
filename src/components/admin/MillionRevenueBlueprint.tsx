import React, { useState } from "react";
import {
  DollarSign, BarChart3, Globe, Shield, TrendingUp,
  AlertTriangle, Zap, Target, Star, Crown,
  Layers, Building2, Landmark, BriefcaseBusiness,
  Trophy, Users, MapPin, Rocket, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — $1M MONTHLY REVENUE ENGINE
   ═══════════════════════════════════════════════ */

const revenueArchitecture = [
  { stream: "Enterprise Vendor & Developer Revenue", icon: Building2, color: "text-chart-4", targetPct: "35%", targetAmount: "$350K/mo",
    tactics: [
      { tactic: "Enterprise agency SaaS contracts", detail: "Annual contracts with top 50 agencies nationwide: Rp 15-50M/month per agency for full-suite access (team management, analytics, CRM integration, priority support, branded pages). 50 agencies × avg Rp 25M = $80K MRR. Lock-in with 12-month contracts and volume discounts." },
      { tactic: "Developer mega-project launch packages", detail: "Full-stack digital launch: Rp 200-500M per project (3-6 month campaign). Includes: dedicated microsite, investor database targeting, virtual showroom, progress tracking dashboard, weekly performance reports. 5 active developer campaigns = $60-160K/month. This is your highest-margin stream." },
      { tactic: "White-label intelligence for brokerages", detail: "License your market analytics engine to large brokerages under their own brand: Rp 30-75M/month. They get district intelligence, pricing recommendations, lead scoring — powered by Astra data. 10 brokerage clients = $20-50K MRR with near-zero marginal cost." },
    ]},
  { stream: "Investor Intelligence & Premium", icon: Target, color: "text-primary", targetPct: "25%", targetAmount: "$250K/mo",
    tactics: [
      { tactic: "Institutional Terminal at scale", detail: "Rp 50-100M/month for fund-level access: portfolio analytics, deal flow API, custom market models, bulk screening, regulatory compliance dashboards. Target: 15-25 institutional clients across SE Asia. Each client = $3-6K MRR with 90%+ gross margin." },
      { tactic: "Pro investor tier mass adoption", detail: "Scale to 5,000+ Pro subscribers (Rp 499K-999K/month) across all cities. Key: prove that Pro investors close 3x more deals. Monthly intelligence reports, early access, priority matching. 5,000 × Rp 700K avg = $220K MRR." },
      { tactic: "Syndication facilitation fees", detail: "For large deals (>Rp 50B), facilitate investor syndication: group 3-5 qualified investors for co-investment. Platform fee: 1-2% of syndicated capital. 3 syndicated deals/month × Rp 75B avg × 1% = $15K/month. Low volume, high value." },
    ]},
  { stream: "Transaction Ecosystem Revenue", icon: Layers, color: "text-chart-2", targetPct: "25%", targetAmount: "$250K/mo",
    tactics: [
      { tactic: "Platform transaction fees at volume", detail: "0.5-1% fee on facilitated transactions. At $1M/mo revenue target, platform should be facilitating Rp 500B-1T/month in deals across 8-10 cities. Even capturing 0.3% on 30% of volume generates substantial revenue. Key: make facilitation so valuable that vendors prefer platform-assisted transactions." },
      { tactic: "Financial services ecosystem", detail: "Mortgage referrals (Rp 10-20M/deal × 100 deals/mo = $65-130K), insurance referrals (Rp 2-5M/policy × 200/mo = $25-65K), legal/notary services (Rp 3-8M/transaction × 150/mo = $30-75K). Aggregate: $120-270K/month from ancillary services. Each closed deal generates 3-5 service opportunities." },
      { tactic: "Escrow and payment processing", detail: "Offer secure escrow for earnest deposits and milestone payments. Fee: 0.5-1% of escrowed amount. Builds trust (buyer protection) while generating revenue. At Rp 200B/month in escrow flow × 0.5% = $65K/month. Requires banking license partnership." },
    ]},
  { stream: "Data Products & Licensing", icon: BarChart3, color: "text-chart-5", targetPct: "15%", targetAmount: "$150K/mo",
    tactics: [
      { tactic: "Market intelligence API licensing", detail: "Sell aggregated, anonymized market data feeds to: banks (credit risk models), insurers (property valuation), government (urban planning), consultancies (market research). Rp 20-50M/month per client. 20 data clients = $25-65K MRR. Your proprietary data is a non-depletable asset." },
      { tactic: "Quarterly Indonesia Property Report", detail: "Premium annual subscription: Rp 75-150M for institutional-grade quarterly reports. 200+ pages of district-level analysis, transaction velocity, yield trends, demand forecasting. 30 institutional subscribers = $15-30K/month. Positions Astra as THE authority on Indonesian real estate." },
      { tactic: "Custom research commissions", detail: "Bespoke market studies for developers, funds, or government: Rp 100-500M per project. Feasibility studies, demand analysis, pricing optimization research. 2-3 projects per quarter = $15-30K/month. High-margin, leverages existing data infrastructure." },
    ]},
];

const scaleMilestones = [
  { period: "Q1", target: "$600-700K/mo", focus: "Enterprise vendor contracts + developer campaigns pipeline + institutional terminal scaling", kpi: "50 enterprise vendors, 3,000 Pro investors, 10 institutional clients" },
  { period: "Q2", target: "$750-850K/mo", focus: "Transaction ecosystem activation + financial services partnerships + data API licensing", kpi: "Transaction facilitation >Rp 300B/mo, 15 data API clients, 5 bank partnerships" },
  { period: "Q3", target: "$850-950K/mo", focus: "White-label licensing + syndication facilitation + escrow service launch", kpi: "5 white-label clients, 2 syndicated deals/mo, escrow service live" },
  { period: "Q4", target: "$950K-1M+/mo", focus: "Revenue predictability >70% recurring + margin optimization + geographic diversification", kpi: ">70% recurring revenue, >45% gross margin, 10+ cities contributing" },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — NATIONAL BRAND DOMINATION
   ═══════════════════════════════════════════════ */

const dominationPillars = [
  { pillar: "Nationwide Liquidity Network", icon: MapPin, color: "text-chart-4", strategies: [
    { strategy: "Dominant listings share in top 10 cities", detail: "Target: >40% of active online listings in Jakarta, Surabaya, Bandung, Bali, Medan, Makassar, Semarang, Yogyakarta, Balikpapan, Batam. Achieve by: exclusive developer partnerships (accounts for 30% of supply), agency network contracts (40%), and direct vendor acquisition (30%). Dominance = being the default platform buyers check first." },
    { strategy: "Exclusive major developer alliances", detail: "Secure 'Exclusive Digital Launch Partner' agreements with Indonesia's top 20 developers: Ciputra, Agung Podomoro, Sinarmas Land, Lippo, Summarecon, etc. Exclusive means: new projects launch on Astra 14-30 days before any competitor. This creates FOMO for investors who aren't on the platform." },
    { strategy: "High-intent investor acquisition machine", detail: "Build a 50,000+ verified investor database segmented by: city preference, budget range, property type, investment strategy, risk appetite. Automated matching: when a new listing meets investor criteria → instant notification. Investors stay because the deal flow is better than anywhere else." },
  ]},
  { pillar: "Authority & Trust Amplification", icon: Crown, color: "text-primary", strategies: [
    { strategy: "National property intelligence publication", detail: "'Astra Indonesia Property Index' — monthly publication tracking: national price trends, city-by-city performance, hot district rankings, transaction velocity metrics. Published free, covered by media. Becomes the reference point for property market discussion. Like Bloomberg for Indonesian real estate." },
    { strategy: "Annual Property Summit", detail: "'Astra National Property Summit' — 1,000+ attendee annual event. Keynotes from developers, economists, government officials, international investors. Sponsor-funded (Rp 2-5B in sponsorship from banks, developers, insurers). Net revenue-positive while being the premier property event in Indonesia." },
    { strategy: "Mainstream media presence", detail: "Regular media columns in Kompas, Detik Finance, CNBC Indonesia. Founder positioned as go-to property market expert. Monthly TV appearances discussing market trends. Target: unprompted brand awareness >40% among property seekers in Tier-1 cities." },
  ]},
  { pillar: "Competitive Moat Reinforcement", icon: Shield, color: "text-chart-2", strategies: [
    { strategy: "Intelligence-driven discovery that can't be replicated", detail: "Competitors can copy listings but can't copy: 5 years of behavioral data, predictive yield models trained on millions of interactions, district-level demand forecasting, personalized investment scoring. Every month of operation makes the moat deeper. Time is your ultimate competitive advantage." },
    { strategy: "Vendor ecosystem lock-in depth", detail: "Vendor success on Astra depends on: accumulated review scores, performance history, verified badges, client relationships, analytics dashboards, CRM data. Switching means losing ALL of this. After 12 months of active use, switching cost is prohibitively high. This isn't predatory — it's earned value." },
    { strategy: "National agent certification program", detail: "'Astra Certified Agent' — free training program with exam. Certified agents get special badge, priority in search results, access to premium tools. Creates professional standard associated with YOUR brand. 5,000 certified agents = a national professional network that reinforces platform dominance." },
  ]},
];

const dominationKpis = [
  { metric: "National active listings market share", target: ">35%", warning: "<20%" },
  { metric: "Unprompted brand awareness (Tier-1 cities)", target: ">40%", warning: "<20%" },
  { metric: "Transaction volume market leadership", target: "#1 or #2 nationally", warning: "Below #3" },
  { metric: "Developer exclusive partnerships", target: ">15 active", warning: "<5" },
  { metric: "Verified investor database size", target: ">50,000", warning: "<20,000" },
  { metric: "Certified agent network", target: ">5,000", warning: "<1,000" },
  { metric: "Media mentions (monthly)", target: ">20", warning: "<5" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — GLOBAL CAPITAL INTEGRATION
   ═══════════════════════════════════════════════ */

const globalSegments = [
  { segment: "International Property Funds", icon: Globe, size: "15-30 funds", value: "VERY HIGH",
    proposition: "Indonesia-focused deal flow curated by AI: yield analysis, market timing signals, regulatory guidance, local partner matching. 'Your intelligent gateway to Indonesia's fastest-growing property markets — backed by 5 years of proprietary transaction data.'",
    engagement: "Attend MIPIM, PropTech conferences in Singapore, Hong Kong, Dubai. Lead with data: 'Indonesian property yields are 2-3x Singapore at comparable risk profiles. Here's our evidence.' Start with data partnership → co-investment facilitation → strategic equity discussion." },
  { segment: "Sovereign Wealth & Pension Funds", icon: Landmark, size: "5-10 relationships", value: "TRANSFORMATIONAL",
    proposition: "Institutional-grade market infrastructure: standardized reporting, regulatory compliance, ESG-aligned investment screening, large-block transaction facilitation. Position Astra as infrastructure, not marketplace — SWFs invest in infrastructure.",
    engagement: "Government-to-government introductions via BKPM or investment ministry. Anchor pitch: 'Astra is the digital infrastructure modernizing Indonesia's Rp 5,000T real estate market. Your investment accelerates financial inclusion and market transparency.' Long cycle: 18-36 months to close." },
  { segment: "Cross-Border Family Offices", icon: BriefcaseBusiness, size: "25-50 clients", value: "HIGH",
    proposition: "Diversification into Indonesian real estate with full-service support: opportunity screening, due diligence facilitation, legal/tax guidance, property management referrals, rental yield monitoring. White-glove service for $500K-50M allocations.",
    engagement: "Partner with Singapore/HK private banks for client referrals. Offer 'Indonesia Property Masterclass' — exclusive dinner events in Singapore, Hong Kong, Dubai. Convert 10% of attendees to platform subscribers, 2% to active investors within 12 months." },
  { segment: "International Financing Institutions", icon: Building2, size: "5-8 partners", value: "HIGH",
    proposition: "Cross-border mortgage facilitation for foreign buyers. Market data feeds for international property lending decisions. Regulatory compliance frameworks for foreign ownership structures (PT PMA, leasehold, freehold eligibility).",
    engagement: "Approach Singapore, Malaysian, and Australian banks with Indonesian property desks. Offer: integrated mortgage application from within the Astra platform + pre-qualified buyer leads. Revenue: mortgage referral commissions + data licensing." },
];

const globalKpis = [
  { metric: "International investor registrations", target: ">2,000", warning: "<500" },
  { metric: "Cross-border transaction volume (monthly)", target: ">Rp 100B", warning: "<Rp 20B" },
  { metric: "International capital inflow growth (QoQ)", target: ">25%", warning: "<5%" },
  { metric: "Global fund partnerships active", target: ">10", warning: "<3" },
  { metric: "International investor retention (12-month)", target: ">70%", warning: "<40%" },
];

/* ═══════════════════════════════════════════════
   MONITORING & RISKS
   ═══════════════════════════════════════════════ */

const operationalChecklist = [
  { task: "Review MRR by stream — any stream declining or stagnating?", category: "Revenue" },
  { task: "Analyze per-city P&L — which cities are profitable, which need investment?", category: "Efficiency" },
  { task: "Review enterprise pipeline — enough contracts in negotiation?", category: "Growth" },
  { task: "Check institutional client health — usage, satisfaction, renewal likelihood", category: "Retention" },
  { task: "Evaluate global investor engagement — registrations, activity, conversions", category: "Global" },
  { task: "Review competitive landscape — any competitor moves requiring response?", category: "Strategy" },
  { task: "Assess team capacity — hiring aligned with growth trajectory?", category: "Operations" },
  { task: "Review data product pipeline — new intelligence offerings in development?", category: "Product" },
  { task: "Check brand health metrics — NPS, awareness, media presence", category: "Brand" },
  { task: "Evaluate margin trajectory — improving or compressing?", category: "Efficiency" },
];

const hyperScaleRisks = [
  { risk: "Organizational scaling bottleneck — team can't keep up with growth", severity: "CRITICAL", mitigation: "At $1M/mo you need 50-80 people minimum. Hire ahead of growth, not behind. Key hires NOW: VP Sales (enterprise), VP Engineering (platform scalability), Country Managers (per-city operations), Head of Data (intelligence products). Every month of delayed hiring = revenue left on the table." },
  { risk: "Technology infrastructure fails under load", severity: "CRITICAL", mitigation: "At national scale: millions of daily page views, thousands of concurrent transactions, real-time data processing. Invest in: CDN (Cloudflare), database read replicas, caching layers, queue-based processing. Target: <2s page load, 99.9% uptime, <50ms API response. One major outage = vendor trust erosion that takes months to recover." },
  { risk: "Regulatory risk from cross-border capital flows", severity: "HIGH", mitigation: "Foreign property investment in Indonesia has complex regulations (KITAS requirements, negative list, PMA structures). Hire in-house legal counsel specializing in foreign investment law. Build compliance frameworks BEFORE scaling international investors. One regulatory violation = existential risk." },
  { risk: "Revenue concentration in few large clients", severity: "HIGH", mitigation: "If top 10 clients represent >30% of revenue, you're vulnerable. Diversification rule: no single client >5% of MRR, no single stream >35% of total revenue. Build a long tail of smaller subscribers alongside enterprise accounts. Resilient revenue = distributed revenue." },
  { risk: "National expansion dilutes city-level dominance", severity: "MEDIUM", mitigation: "Common mistake: launching in 15 cities but dominating none. Better: dominate 5 cities completely (>40% market share) than be present in 15 with 10% each. Expansion criteria: don't launch new city until existing cities are profitable. Depth before breadth, always." },
];

const categoryBadgeColors: Record<string, string> = {
  Revenue: "bg-chart-4/10 text-chart-4",
  Efficiency: "bg-muted text-muted-foreground",
  Growth: "bg-chart-2/10 text-chart-2",
  Retention: "bg-destructive/10 text-destructive",
  Global: "bg-primary/10 text-primary",
  Strategy: "bg-chart-1/10 text-chart-1",
  Operations: "bg-chart-5/10 text-chart-5",
  Product: "bg-chart-3/10 text-chart-3",
  Brand: "bg-chart-4/10 text-chart-4",
};

/* ═══════════════════════════════════════════════ */

const MillionRevenueBlueprint: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const toggle = (idx: number) => setCheckedItems(prev => {
    const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="$1M Monthly Hyper-Scale"
        description="Revenue hyper-scaling, national brand domination & global capital integration"
        icon={Rocket}
        badge={{ text: "🌍 Hyper-Scale", variant: "outline" }}
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="revenue" className="text-xs">$1M Revenue</TabsTrigger>
          <TabsTrigger value="domination" className="text-xs">National Domination</TabsTrigger>
          <TabsTrigger value="global" className="text-xs">Global Capital</TabsTrigger>
          <TabsTrigger value="monitor" className="text-xs">Operations Monitor</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Hyper-Scale Risks</TabsTrigger>
        </TabsList>

        {/* ── $1M REVENUE ── */}
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
            <CardHeader className="pb-2"><CardTitle className="text-sm">Quarterly Scale Trajectory</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {scaleMilestones.map((sm, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs font-semibold text-foreground">{sm.period}</p>
                    <Badge variant="default" className="text-[9px]">🎯 {sm.target}</Badge>
                  </div>
                  <p className="text-[9px] text-chart-2">{sm.focus}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{sm.kpi}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NATIONAL DOMINATION ── */}
        <TabsContent value="domination" className="mt-4 space-y-4">
          {dominationPillars.map((dp, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", dp.color)}>
                  <dp.icon className="h-4 w-4" /> {dp.pillar}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dp.strategies.map((s, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{s.strategy}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">National Domination KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dominationKpis.map((dk, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20 flex-wrap gap-1">
                  <p className="text-[10px] text-foreground font-medium">{dk.metric}</p>
                  <div className="flex gap-1">
                    <Badge variant="default" className="text-[8px]">🎯 {dk.target}</Badge>
                    <Badge variant="destructive" className="text-[8px]">⚠ {dk.warning}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── GLOBAL CAPITAL ── */}
        <TabsContent value="global" className="mt-4 space-y-4">
          {globalSegments.map((gs, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <gs.icon className="h-4 w-4 text-primary" /> {gs.segment}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[8px]">{gs.size}</Badge>
                    <Badge variant="default" className="text-[8px]">{gs.value}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-lg border border-border/40 p-3 space-y-1">
                  <p className="text-[9px] font-semibold text-chart-2 uppercase tracking-wider">Value Proposition</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{gs.proposition}</p>
                </div>
                <div className="rounded-lg border border-border/40 p-3 space-y-1">
                  <p className="text-[9px] font-semibold text-primary uppercase tracking-wider">Engagement Strategy</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{gs.engagement}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Global Capital Integration KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {globalKpis.map((gk, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20 flex-wrap gap-1">
                  <p className="text-[10px] text-foreground font-medium">{gk.metric}</p>
                  <div className="flex gap-1">
                    <Badge variant="default" className="text-[8px]">🎯 {gk.target}</Badge>
                    <Badge variant="destructive" className="text-[8px]">⚠ {gk.warning}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── OPERATIONS MONITOR ── */}
        <TabsContent value="monitor" className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hyper-Scale Operations Checklist</h3>
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

        {/* ── HYPER-SCALE RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          {hyperScaleRisks.map((sr, i) => (
            <Card key={i} className={cn("border-border", sr.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className={cn("h-4 w-4", sr.severity === "CRITICAL" ? "text-destructive" : "text-chart-4")} />
                  <Badge variant={sr.severity === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{sr.severity}</Badge>
                  <p className="text-xs font-semibold text-foreground">{sr.risk}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{sr.mitigation}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MillionRevenueBlueprint;
