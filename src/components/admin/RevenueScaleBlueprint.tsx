import React, { useState } from "react";
import {
  DollarSign, BarChart3, Users, Shield, TrendingUp,
  AlertTriangle, Zap, Target, Star, Globe,
  Eye, Trophy, Handshake, Building2, Crown,
  Landmark, BriefcaseBusiness, MapPin, Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — $500K REVENUE SCALE ENGINE
   ═══════════════════════════════════════════════ */

const revenueStreams = [
  { stream: "Premium Listing & Campaign Revenue", icon: Zap, color: "text-chart-4", targetPct: "30%", targetAmount: "$150K/mo",
    tactics: [
      { tactic: "Enterprise listing packages for developers", detail: "New-development launch packages: Rp 50-150M for 30-90 day exclusive campaigns including featured placement, push notifications to matched investors, dedicated landing page, and weekly performance reports. One developer deal = $3-10K revenue. Target: 5 active developer campaigns per city." },
      { tactic: "Dynamic boost pricing by demand zone", detail: "Hot districts (>50 inquiries/week): boost costs 2x standard. Cool districts: 50% discount to stimulate activity. Revenue follows demand — charge premium where value is highest. Auto-adjust pricing weekly based on inquiry density data." },
      { tactic: "Seasonal campaign packages", detail: "Pre-designed campaign bundles: 'Ramadan Property Fair' (Rp 25M, 2-week intensive), 'Year-End Investment Push' (Rp 35M, 3-week), 'New Year Launch' (Rp 20M). Vendors buy turnkey visibility. 4 seasonal campaigns/year × 20 participants = $80K+ annually per city." },
    ]},
  { stream: "Vendor Subscription Revenue (Recurring)", icon: Star, color: "text-primary", targetPct: "30%", targetAmount: "$150K/mo",
    tactics: [
      { tactic: "Enterprise agency plans", detail: "Agency-level subscription: Rp 5-15M/month for 10-50 agent seats. Includes team analytics dashboard, centralized lead routing, brand page, and priority support. Converting 20 agencies at avg Rp 8M = $10K MRR per city. Scale across 5 cities = $50K MRR." },
      { tactic: "Performance-linked pricing model", detail: "Base subscription Rp 299K + Rp 50K per qualified inquiry delivered. Vendors pay proportional to value received. Higher-performing vendors pay more but gladly — they're earning more. Aligns platform incentives with vendor success." },
      { tactic: "Dominance tier with exclusivity perks", detail: "Rp 7.5M/month 'Dominance' tier: guaranteed top-3 placement in district, exclusive lead allocation for matching criteria, quarterly business review with dedicated account manager. Limited to 3 per district — scarcity drives urgency." },
    ]},
  { stream: "Investor Intelligence Premium", icon: Target, color: "text-chart-2", targetPct: "20%", targetAmount: "$100K/mo",
    tactics: [
      { tactic: "Institutional Terminal access", detail: "Rp 25-50M/month for fund-level access: portfolio analytics, market heatmaps, deal flow API, bulk opportunity screening, custom alerts. 5 institutional clients at avg Rp 35M = $11K MRR. Small volume, high value — each client requires dedicated onboarding." },
      { tactic: "Data intelligence API licensing", detail: "Monthly data feed for banks, appraisers, consultancies: district pricing trends, transaction velocity, demand heatmaps. Rp 10-25M/month per client. Non-competing buyers of YOUR proprietary data. Target: 10 API clients across Indonesia." },
      { tactic: "Pro investor subscription scaling", detail: "Scale Pro tier (Rp 499K/mo) to 2,000+ subscribers across all cities. Features: early access, full analytics, saved search alerts, monthly intelligence reports. At scale: 2,000 × Rp 499K = $63K MRR." },
    ]},
  { stream: "Transaction & Service Ecosystem", icon: Handshake, color: "text-chart-5", targetPct: "20%", targetAmount: "$100K/mo",
    tactics: [
      { tactic: "Transaction facilitation fees at scale", detail: "0.5-1% fee on platform-facilitated transactions. At $500K/mo revenue target, transaction volume should be ~Rp 150-200B/month across all cities. Even at 0.5% capture on 20% of volume: significant revenue stream." },
      { tactic: "Mortgage referral commissions", detail: "Partner with 5-8 banks. Each approved mortgage referral: Rp 5-15M commission. Target: 50 mortgage referrals/month across all cities = $30-50K/month. Banks pay because your leads are pre-qualified and high-intent." },
      { tactic: "Vendor marketplace commissions", detail: "Renovation, legal, insurance, moving services. 8-12% commission on each completed service booking. Build service volume alongside transaction volume — every closed deal generates 3-5 service opportunities." },
    ]},
];

const quarterlyMilestones = [
  { quarter: "Q1 (Month 1-3)", target: "$150-200K/mo", focus: "Multi-city subscription scaling + enterprise agency plans + first institutional clients", metric: "200+ paying vendors, 500+ Pro investors, 2 institutional clients" },
  { quarter: "Q2 (Month 4-6)", target: "$250-350K/mo", focus: "Developer campaign revenue + data API licensing + mortgage partnerships at scale", metric: "5 developer campaigns active, 5 API clients, 30+ mortgage referrals/mo" },
  { quarter: "Q3 (Month 7-9)", target: "$350-450K/mo", focus: "Transaction fee volume + service ecosystem + dynamic pricing optimization", metric: "Transaction volume >Rp 100B/mo, 15% service attach rate" },
  { quarter: "Q4 (Month 10-12)", target: "$450-500K+/mo", focus: "Revenue predictability + margin optimization + preparation for next milestone", metric: ">60% recurring revenue, <15% vendor churn, positive unit economics all segments" },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — REGIONAL MARKET LEADERSHIP
   ═══════════════════════════════════════════════ */

const dominancePillars = [
  { pillar: "Liquidity Density Supremacy", icon: Layers, color: "text-chart-4", strategies: [
    { strategy: "District-level inventory domination", detail: "Target: >40% of active listings in top 10 districts per city. When buyers search a district, Astra should have the most and best options. Below 25% market share = not yet dominant. Above 50% = category leader." },
    { strategy: "Exclusive inventory agreements", detail: "Offer top developers 'Exclusive Digital Partner' status: their new launches appear ONLY on Astra for the first 14 days. In return: premium placement, dedicated campaign support, priority investor matching. 3 exclusive developer relationships per city = massive competitive moat." },
    { strategy: "High-transaction category focus", detail: "Identify the 3 property types driving 70% of transactions in each city (e.g., apartments Rp 1-3B, landed houses Rp 2-5B, commercial Rp 5-15B). Concentrate supply acquisition here first. Depth beats breadth at this stage." },
  ]},
  { pillar: "Brand Authority Positioning", icon: Crown, color: "text-primary", strategies: [
    { strategy: "Regional Market Intelligence Reports", detail: "Quarterly 'Astra Property Market Report — [Region]'. 30-page analysis: price trends, hot districts, yield analysis, transaction velocity, demand forecasts. Free download with email capture. Media coverage + thought leadership + lead generation in one asset." },
    { strategy: "Investor & Agent Summit events", detail: "Semi-annual 'Astra Property Summit' in each major city. 200-500 attendees. Keynote speakers: developers, economists, successful investors. Sponsor-funded (banks, developers). Zero cost to platform, massive brand authority positioning." },
    { strategy: "Strategic developer co-branding", detail: "Co-branded marketing with top 3 developers per city: 'Presented by [Developer] × Astra'. Developer gets distribution, Astra gets credibility association. Joint press releases, co-hosted launch events." },
  ]},
  { pillar: "Competitive Barrier Reinforcement", icon: Shield, color: "text-chart-2", strategies: [
    { strategy: "Vendor loyalty program", detail: "'Astra Partner Rewards': every Rp 1M spent on platform = 100 points. Points redeemable for boosts, premium features, or cash back. 12-month loyalty tiers: Silver→Gold→Platinum with escalating benefits. Switching cost: losing accumulated rewards and tier status." },
    { strategy: "Intelligence-driven discovery moat", detail: "Buyers can't get the same quality of property discovery anywhere else. Personalized recommendations, yield calculations, area intelligence, investment scoring — all powered by YOUR proprietary data. Competitors can copy listings but can't copy intelligence." },
    { strategy: "Platform switching cost escalation", detail: "Agent performance history, client relationships, review ratings, analytics data — all trapped in the platform. After 6 months of active use, switching means losing: reputation score, client history, verified badges, loyalty tier. Make leaving painful." },
  ]},
];

const leadershipKpis = [
  { metric: "Market share of active listings (per city)", target: ">35%", warning: "<20%" },
  { metric: "Inquiry velocity vs next competitor", target: ">2x", warning: "<1.2x" },
  { metric: "Unprompted brand awareness (survey)", target: ">25%", warning: "<10%" },
  { metric: "Exclusive inventory percentage", target: ">15%", warning: "<5%" },
  { metric: "Vendor retention (12-month)", target: ">80%", warning: "<60%" },
  { metric: "Net Promoter Score (regional)", target: ">50", warning: "<20" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — INSTITUTIONAL INVESTOR PARTNERSHIPS
   ═══════════════════════════════════════════════ */

const institutionalSegments = [
  { segment: "Property Investment Funds", icon: Building2, size: "5-15 target", value: "HIGH",
    proposition: "Curated deal flow pipeline filtered by fund criteria (geography, yield, size, type). Quarterly portfolio performance benchmarking against market. Early access to off-market opportunities from developer relationships.",
    engagement: "Start with free market intelligence briefing. Provide 3-month trial of Institutional Terminal. After demonstrating data quality, propose annual subscription + success fee on facilitated acquisitions." },
  { segment: "Developer Financing Partners", icon: Landmark, size: "3-8 target", value: "VERY HIGH",
    proposition: "Real-time demand intelligence for development planning. Pre-sales channel with qualified investor database. Market absorption analysis before ground-breaking. Co-marketing for launch campaigns.",
    engagement: "Approach with district-level demand data: 'Our data shows [X] investors actively searching [Area] for [Type] at [Price Range]. Your upcoming project fits perfectly.' Data credibility opens the door." },
  { segment: "Family Offices & Asset Managers", icon: BriefcaseBusiness, size: "10-25 target", value: "HIGH",
    proposition: "Diversified property portfolio construction across multiple cities. Risk-adjusted yield optimization. Hands-off investment facilitation — from discovery to acquisition to management referral. Monthly portfolio intelligence reports.",
    engagement: "Warm introductions through existing investor network or banking partnerships. Position as 'your property investment intelligence partner, not another broker.' Offer bespoke portfolio analysis as conversation starter." },
  { segment: "Corporate Real Estate Teams", icon: Globe, size: "5-10 target", value: "MEDIUM",
    proposition: "Employee housing benefit programs. Corporate relocation support with curated property options. Bulk negotiation leverage for multi-unit corporate purchases. Workspace and commercial property sourcing.",
    engagement: "HR department approach: 'We help your employees find homes faster. Integration with your relocation process. No cost to the company — vendors pay us.' Low barrier, high volume potential." },
];

const partnershipScripts = [
  { type: "Executive Introduction Email", script: `Subject: Property Market Intelligence Partnership — [Fund/Company Name]

Dear [Name],

I lead Astra, Indonesia's property intelligence platform processing Rp [X]T+ in transaction data across [Y] cities. We serve [Z]+ institutional and individual investors.

I'm reaching out because our data suggests significant opportunity alignment with [Fund/Company]'s investment thesis:

• [Specific data point relevant to their portfolio — e.g., "Bali villa yields are outperforming Jakarta apartments by 3.2% this quarter"]
• [Market trend insight — e.g., "Investor demand in Bandung has grown 45% YoY, but supply hasn't kept pace"]

I'd welcome 20 minutes to share our market intelligence and explore how we might support [Fund/Company]'s property investment strategy.

Would [specific date/time] work for a brief call?

Best regards,
[Founder Name]
Founder & CEO, Astra` },
  { type: "Data Credibility Presentation Flow", script: `SLIDE 1: Market Context
"Indonesia's property market is Rp [X]T annually. 85% of transactions still happen through fragmented, opaque channels."

SLIDE 2: Our Intelligence Edge
"Astra processes [X] data points daily across [Y] cities. We see buyer behavior, pricing trends, and demand signals before they appear in traditional market reports."

SLIDE 3: Relevant Insights for [Client]
[3 specific data visualizations relevant to their portfolio/mandate]

SLIDE 4: Partnership Model
"Three ways we work with institutional partners:
1. Intelligence Subscription — ongoing market data access
2. Deal Flow Curation — opportunities filtered to your criteria
3. Co-Investment Facilitation — end-to-end transaction support"

SLIDE 5: Next Steps
"Pilot program: 90-day trial of our Institutional Terminal at [discounted rate]. Full data access, dedicated analyst, monthly briefings."` },
];

const institutionalKpis = [
  { metric: "Institutional clients onboarded", target: "10+ within 12 months", warning: "<3 after 6 months" },
  { metric: "Institutional MRR contribution", target: ">$30K/mo", warning: "<$10K/mo" },
  { metric: "Capital volume routed through platform", target: ">Rp 50B/quarter", warning: "<Rp 10B/quarter" },
  { metric: "Repeat partnership engagement rate", target: ">70%", warning: "<40%" },
  { metric: "Deal pipeline value from institutional leads", target: ">Rp 200B", warning: "<Rp 50B" },
];

/* ═══════════════════════════════════════════════
   QUARTERLY CHECKLIST & RISKS
   ═══════════════════════════════════════════════ */

const quarterlyChecklist = [
  { task: "Review revenue breakdown by stream — is diversification on track?", category: "Revenue" },
  { task: "Analyze per-city revenue performance — which cities underperforming?", category: "Revenue" },
  { task: "Evaluate enterprise vendor pipeline — enough agencies converting?", category: "Growth" },
  { task: "Review institutional client pipeline — active conversations progressing?", category: "Partnerships" },
  { task: "Publish quarterly Market Intelligence Report", category: "Authority" },
  { task: "Assess competitive positioning — any market share shifts?", category: "Strategy" },
  { task: "Review vendor churn by tier — where are we losing and why?", category: "Retention" },
  { task: "Evaluate pricing elasticity — any tiers need adjustment?", category: "Revenue" },
  { task: "Plan next quarter's developer campaign pipeline", category: "Revenue" },
  { task: "Review unit economics by segment — CAC:LTV trending correctly?", category: "Efficiency" },
];

const scaleRisks = [
  { risk: "Multi-city operational complexity exceeds team capacity", severity: "HIGH", mitigation: "Standardize EVERYTHING: launch playbooks, vendor onboarding, support processes. Hire city managers when a city exceeds 200 active vendors. Each city should run semi-independently with centralized technology and brand. Rule: don't launch city N+1 until city N is operationally self-sustaining." },
  { risk: "Revenue growth but margin compression", severity: "HIGH", mitigation: "Track contribution margin per stream and per city. At $500K/mo, you need >40% gross margin to be venture-viable. If margins shrink: automation (reduce human facilitation costs), pricing power (increase rates where justified), efficiency (reduce CAC through organic/referral channels). Revenue without margin = burning cash faster." },
  { risk: "Institutional partnerships consume disproportionate resources", severity: "MEDIUM", mitigation: "Each institutional client requires high-touch service. Cap at 3 institutional onboardings per quarter until you have dedicated enterprise team. Standardize onboarding: templated dashboards, automated reporting, self-service analytics. The goal is institutional revenue with SaaS-level margins, not consulting-level labor." },
  { risk: "Competitor raises large funding round for aggressive expansion", severity: "HIGH", mitigation: "Speed of execution > size of funding. Your advantages: proprietary data moat, existing vendor relationships, intelligence differentiation. If competitor launches in your city: double down on vendor loyalty programs, exclusive inventory, and buyer experience. They can buy traffic but can't buy trust." },
  { risk: "Regulatory changes affecting platform transaction fees", severity: "MEDIUM", mitigation: "Diversify revenue so no single stream exceeds 35% of total. Maintain government affairs engagement — join industry associations, participate in regulatory consultations. If transaction fees are regulated: shift to subscription and data monetization (regulation-resistant streams)." },
];

const categoryBadgeColors: Record<string, string> = {
  Revenue: "bg-chart-4/10 text-chart-4",
  Growth: "bg-chart-2/10 text-chart-2",
  Partnerships: "bg-primary/10 text-primary",
  Authority: "bg-chart-5/10 text-chart-5",
  Strategy: "bg-chart-1/10 text-chart-1",
  Retention: "bg-destructive/10 text-destructive",
  Efficiency: "bg-muted text-muted-foreground",
};

/* ═══════════════════════════════════════════════ */

const RevenueScaleBlueprint: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const toggle = (idx: number) => setCheckedItems(prev => {
    const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="$500K Revenue Scale"
        description="Revenue depth expansion, regional dominance & institutional partnerships"
        icon={TrendingUp}
        badge={{ text: "🚀 Scale", variant: "outline" }}
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="revenue" className="text-xs">$500K Revenue</TabsTrigger>
          <TabsTrigger value="leadership" className="text-xs">Regional Leadership</TabsTrigger>
          <TabsTrigger value="institutional" className="text-xs">Institutional</TabsTrigger>
          <TabsTrigger value="monitor" className="text-xs">Quarterly Monitor</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Scale Risks</TabsTrigger>
        </TabsList>

        {/* ── REVENUE ── */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          {revenueStreams.map((rs, i) => (
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
            <CardHeader className="pb-2"><CardTitle className="text-sm">Quarterly Revenue Trajectory</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {quarterlyMilestones.map((qm, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs font-semibold text-foreground">{qm.quarter}</p>
                    <Badge variant="default" className="text-[9px]">🎯 {qm.target}</Badge>
                  </div>
                  <p className="text-[9px] text-chart-2">{qm.focus}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{qm.metric}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── REGIONAL LEADERSHIP ── */}
        <TabsContent value="leadership" className="mt-4 space-y-4">
          {dominancePillars.map((dp, i) => (
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
            <CardHeader className="pb-2"><CardTitle className="text-sm">Leadership KPIs</CardTitle></CardHeader>
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

        {/* ── INSTITUTIONAL ── */}
        <TabsContent value="institutional" className="mt-4 space-y-4">
          {institutionalSegments.map((seg, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <seg.icon className="h-4 w-4 text-primary" /> {seg.segment}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[8px]">{seg.size}</Badge>
                    <Badge variant="default" className="text-[8px]">{seg.value}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-lg border border-border/40 p-3 space-y-1">
                  <p className="text-[9px] font-semibold text-chart-2 uppercase tracking-wider">Value Proposition</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{seg.proposition}</p>
                </div>
                <div className="rounded-lg border border-border/40 p-3 space-y-1">
                  <p className="text-[9px] font-semibold text-primary uppercase tracking-wider">Engagement Approach</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{seg.engagement}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {partnershipScripts.map((ps, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{ps.type}</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-[10px] text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/30">{ps.script}</pre>
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Institutional Partnership KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {institutionalKpis.map((ik, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20 flex-wrap gap-1">
                  <p className="text-[10px] text-foreground font-medium">{ik.metric}</p>
                  <div className="flex gap-1">
                    <Badge variant="default" className="text-[8px]">🎯 {ik.target}</Badge>
                    <Badge variant="destructive" className="text-[8px]">⚠ {ik.warning}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── QUARTERLY MONITOR ── */}
        <TabsContent value="monitor" className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quarterly Scale Monitoring</h3>
            <Badge variant="outline" className="text-[9px]">{checkedItems.size}/{quarterlyChecklist.length}</Badge>
          </div>
          <Progress value={(checkedItems.size / quarterlyChecklist.length) * 100} className="h-2 mb-3" />
          {quarterlyChecklist.map((item, i) => (
            <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border border-border/40", checkedItems.has(i) && "opacity-50")}>
              <Checkbox checked={checkedItems.has(i)} onCheckedChange={() => toggle(i)} />
              <div className="flex-1">
                <p className={cn("text-xs text-foreground", checkedItems.has(i) && "line-through")}>{item.task}</p>
              </div>
              <Badge className={cn("text-[8px]", categoryBadgeColors[item.category] || "bg-muted text-muted-foreground")}>{item.category}</Badge>
            </div>
          ))}
        </TabsContent>

        {/* ── SCALE RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          {scaleRisks.map((sr, i) => (
            <Card key={i} className={cn("border-border", sr.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className={cn("h-4 w-4", sr.severity === "HIGH" ? "text-chart-4" : "text-muted-foreground")} />
                  <Badge variant={sr.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{sr.severity}</Badge>
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

export default RevenueScaleBlueprint;
