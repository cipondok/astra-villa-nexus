import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Globe, DollarSign, Briefcase, CheckCircle, AlertTriangle, Shield,
  TrendingUp, Target, Copy, Eye, Layers, BarChart3, Zap, MapPin, Users
} from "lucide-react";
import { toast } from "sonner";

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

/* ── SECTION 1: National Liquidity Grid ───────────────────────────────── */
const gridPhases = [
  {
    phase: "Phase 1 — Metro Anchor Formation",
    period: "Quarter 1–2",
    color: "text-amber-400",
    tactics: [
      { t: "5-City Anchor Strategy", d: "Secure dominant inventory share in top 5 metro areas (Jakarta, Surabaya, Bandung, Bali, Medan). Minimum 200 active listings per city." },
      { t: "Large Brokerage Portfolio Deals", d: "Sign exclusive partnerships with 3+ major agencies per city. Bulk onboard entire portfolios in one sprint." },
      { t: "Price Tier Balancing", d: "Ensure 40% affordable / 35% mid-range / 25% premium split. Avoid luxury-only trap in new markets." },
      { t: "District Density Mapping", d: "Heat-map listing density per district. Target ≥ 50 listings in top 3 districts per city." },
    ],
    kpis: ["1,000+ national active listings", "5 cities with ≥ 200 listings", "Top 15 districts with ≥ 50 each"],
  },
  {
    phase: "Phase 2 — Demand Routing Network",
    period: "Quarter 3–4",
    color: "text-emerald-400",
    tactics: [
      { t: "Cross-City Buyer Routing", d: "When Jakarta buyer searches exceed supply, recommend Bandung/Surabaya alternatives with comparative pricing data." },
      { t: "National Market Pulse Reports", d: "Weekly publication comparing opportunity across cities: pricing trends, demand velocity, investment potential." },
      { t: "Synchronized Promotions", d: "Run national 'Property Week' campaigns across all cities simultaneously. Create unified demand surge." },
      { t: "Investment Migration Alerts", d: "Push notifications: 'Investors are moving to [City] — prices 30% lower, demand rising 15%/month.'" },
    ],
    kpis: ["Cross-city inquiries > 15% of total", "Demand routing conversion > 8%", "National campaign ROI > 5:1"],
  },
  {
    phase: "Phase 3 — Transaction Momentum Grid",
    period: "Quarter 5–6",
    color: "text-blue-400",
    tactics: [
      { t: "Real-Time National Activity Dashboard", d: "Public-facing live metrics: viewings today, deals this week, trending districts across all cities." },
      { t: "Fastest-Closing City Leaderboard", d: "Highlight which city closes deals fastest. Create inter-city competitive momentum." },
      { t: "National Market Share Claim", d: "Publish quarterly 'State of Property' report positioning Astra as #1 transaction discovery platform." },
      { t: "Developer Network Integration", d: "Onboard top 10 national developers. Institutional-grade supply layer across all cities." },
    ],
    kpis: ["National market share > 15%", "Inquiry velocity #1 in 3+ cities", "Deal cycle < 10 days nationally"],
  },
];

/* ── SECTION 2: Profit Optimization ───────────────────────────────────── */
const profitPillars = [
  {
    pillar: "Revenue Depth Expansion",
    icon: DollarSign,
    color: "text-emerald-400",
    tactics: [
      { t: "4-Tier Vendor Subscription", d: "Free → Starter (Rp 500K/mo) → Pro (Rp 1.5M/mo) → Enterprise (Rp 5M/mo). Each tier unlocks analytics, leads, and visibility." },
      { t: "Enterprise Campaign Packages", d: "Developer launch packages: Rp 25–100M for 90-day featured placement + lead generation + weekly reports." },
      { t: "Data Intelligence Products", d: "District-level market reports sold to investors, developers, and financial institutions. Rp 5–15M per report." },
      { t: "Transaction Commission Optimization", d: "2.5% platform fee with performance-based agent splits. Elite partners earn up to 85/15 split." },
    ],
    scripts: {
      id: `ENTERPRISE PITCH DECK NARRATIVE:

"Astra PropTech — Revenue Model Overview

💰 4 Revenue Streams:
1. Transaction Commissions (2.5% platform fee)
2. Vendor Subscriptions (Rp 500K – 5M/bulan)
3. Developer Campaign Packages (Rp 25 – 100M)
4. Data Intelligence Products (Rp 5 – 15M/report)

📈 Target Revenue Mix (Month 18):
• Commissions: 35%
• Subscriptions: 30% (recurring)
• Campaigns: 20%
• Data Products: 15%

🎯 Unit Economics:
• CAC: Rp [X]M | LTV: Rp [Y]M | Ratio: [Z]:1
• Contribution Margin: [A]%"`,
      en: `ENTERPRISE PITCH DECK NARRATIVE:

"Astra PropTech — Revenue Model Overview

💰 4 Revenue Streams:
1. Transaction Commissions (2.5% platform fee)
2. Vendor Subscriptions (Rp 500K – 5M/month)
3. Developer Campaign Packages (Rp 25 – 100M)
4. Data Intelligence Products (Rp 5 – 15M/report)

📈 Target Revenue Mix (Month 18):
• Commissions: 35%
• Subscriptions: 30% (recurring)
• Campaigns: 20%
• Data Products: 15%

🎯 Unit Economics:
• CAC: Rp [X]M | LTV: Rp [Y]M | Ratio: [Z]:1
• Contribution Margin: [A]%"`,
    },
  },
  {
    pillar: "Cost Efficiency Governance",
    icon: BarChart3,
    color: "text-amber-400",
    tactics: [
      { t: "Marketing Spend Optimization", d: "Allocate 70% budget to top 3 performing channels. Cut underperforming channels quarterly." },
      { t: "Automation-First Operations", d: "Automate onboarding, listing quality checks, lead routing, and performance reporting. Target 60% task automation." },
      { t: "Low-Conversion Traffic Elimination", d: "Kill campaigns with < 2% inquiry conversion rate. Redirect budget to high-intent channels." },
      { t: "Shared Services Model", d: "Centralize customer support, content creation, and analytics across cities. Avoid per-city overhead duplication." },
    ],
    scripts: {
      id: `MONTHLY COST REVIEW TEMPLATE:

"📊 Cost Efficiency Review — [Bulan]

💸 Total Opex: Rp [X]
📉 vs Budget: [+/-Y]%
🤖 Automation Coverage: [Z]%

Channel Performance:
• [Channel A]: CPA Rp [X], Conv [Y]% ✅
• [Channel B]: CPA Rp [X], Conv [Y]% ⚠️
• [Channel C]: CPA Rp [X], Conv [Y]% ❌ → CUT

Action: Reallocate Rp [Amount] from [C] → [A]
Target: Reduce blended CPA by 15% next month"`,
      en: `MONTHLY COST REVIEW TEMPLATE:

"📊 Cost Efficiency Review — [Month]

💸 Total Opex: Rp [X]
📉 vs Budget: [+/-Y]%
🤖 Automation Coverage: [Z]%

Channel Performance:
• [Channel A]: CPA Rp [X], Conv [Y]% ✅
• [Channel B]: CPA Rp [X], Conv [Y]% ⚠️
• [Channel C]: CPA Rp [X], Conv [Y]% ❌ → CUT

Action: Reallocate Rp [Amount] from [C] → [A]
Target: Reduce blended CPA by 15% next month"`,
    },
  },
  {
    pillar: "Unit Economics Discipline",
    icon: TrendingUp,
    color: "text-blue-400",
    tactics: [
      { t: "City-Level P&L Tracking", d: "Each city has own contribution margin dashboard. Underperforming cities get 90-day improvement or pause." },
      { t: "LTV:CAC Monitoring", d: "Minimum 5:1 ratio across all segments. Alert when any segment drops below 4:1." },
      { t: "Revenue Per Listing Optimization", d: "Track and improve RPL monthly. Target 15% quarterly improvement through upsell and conversion." },
      { t: "Break-Even Timeline Governance", d: "Every new city must reach break-even within 9 months. Gate further expansion on this metric." },
    ],
    scripts: {
      id: `UNIT ECONOMICS DASHBOARD:

"📈 Unit Economics — [Periode]

Per City Performance:
| City | Revenue | Cost | Margin | LTV:CAC |
|------|---------|------|--------|---------|
| Jakarta | Rp [X] | Rp [Y] | [Z]% | [R]:1 |
| Surabaya | Rp [X] | Rp [Y] | [Z]% | [R]:1 |
| Bandung | Rp [X] | Rp [Y] | [Z]% | [R]:1 |

🎯 National Blended:
• Contribution Margin: [X]%
• LTV:CAC: [Y]:1
• Revenue/Active Listing: Rp [Z]"`,
      en: `UNIT ECONOMICS DASHBOARD:

"📈 Unit Economics — [Period]

Per City Performance:
| City | Revenue | Cost | Margin | LTV:CAC |
|------|---------|------|--------|---------|
| Jakarta | Rp [X] | Rp [Y] | [Z]% | [R]:1 |
| Surabaya | Rp [X] | Rp [Y] | [Z]% | [R]:1 |
| Bandung | Rp [X] | Rp [Y] | [Z]% | [R]:1 |

🎯 National Blended:
• Contribution Margin: [X]%
• LTV:CAC: [Y]:1
• Revenue/Active Listing: Rp [Z]"`,
    },
  },
];

/* ── SECTION 3: Series-A Fundraising ──────────────────────────────────── */
const fundraisingPillars = [
  {
    pillar: "Growth Proof Positioning",
    icon: TrendingUp,
    color: "text-emerald-400",
    items: [
      "Demonstrate repeatable city launch playbook: 'We replicated Jakarta success in Surabaya in 90 days.'",
      "Show accelerating network effects: inquiry velocity growing 20%+ month-over-month",
      "Present predictable revenue growth curve with < 15% variance from forecast",
      "Highlight transaction milestone progression: 100 → 300 → 1,000 deals trajectory",
      "Showcase vendor retention > 80% proving product-market fit",
    ],
  },
  {
    pillar: "Strategic Vision Communication",
    icon: Globe,
    color: "text-amber-400",
    items: [
      "Position as 'national property transaction intelligence infrastructure' — not just a marketplace",
      "Articulate TAM expansion: transaction fees → subscriptions → data products → financing referrals",
      "Demonstrate capital efficiency: revenue per dollar invested vs competitors",
      "Present 5-year vision: national grid → institutional partnerships → regional expansion → IPO pathway",
      "Emphasize defensibility: behavioral data moat + network effects + ecosystem switching costs",
    ],
  },
  {
    pillar: "Investor Confidence Reinforcement",
    icon: Briefcase,
    color: "text-blue-400",
    items: [
      "Present transparent KPI dashboards: real-time metrics investors can monitor",
      "Show LTV:CAC > 5:1 with improving trajectory",
      "Demonstrate operational discipline: controlled burn rate, break-even city model",
      "Align fundraising narrative with 18-month execution milestones",
      "Maintain founder ownership > 75% with disciplined dilution strategy",
    ],
  },
];

const fundraisingScript = {
  id: `SERIES-A PITCH NARRATIVE:

"Astra PropTech: Infrastruktur Transaksi Properti Nasional

🎯 Problem: Pasar properti Indonesia senilai $170B terfragmentasi — 85% transaksi masih offline, lambat, dan tidak transparan.

💡 Solution: Platform intelligence-driven yang menghubungkan buyer, agent, dan developer dalam grid likuiditas nasional.

📈 Traction:
• [X] deals closed dalam [Y] bulan
• [Z] kota aktif
• Revenue growth [A]% MoM
• LTV:CAC [B]:1

💰 Ask: $[Amount] Series-A
• 40% → City expansion (5 → 15 kota)
• 30% → Technology & AI intelligence
• 20% → Sales team scaling
• 10% → Operations & compliance

🎯 18-Month Target:
• 3,000+ closed deals
• 15 active cities
• $[X]M ARR
• Path to profitability"`,
  en: `SERIES-A PITCH NARRATIVE:

"Astra PropTech: National Property Transaction Infrastructure

🎯 Problem: Indonesia's $170B property market is fragmented — 85% of transactions remain offline, slow, and opaque.

💡 Solution: An intelligence-driven platform connecting buyers, agents, and developers in a national liquidity grid.

📈 Traction:
• [X] deals closed in [Y] months
• [Z] active cities
• Revenue growth [A]% MoM
• LTV:CAC [B]:1

💰 Ask: $[Amount] Series-A
• 40% → City expansion (5 → 15 cities)
• 30% → Technology & AI intelligence
• 20% → Sales team scaling
• 10% → Operations & compliance

🎯 18-Month Target:
• 3,000+ closed deals
• 15 active cities
• $[X]M ARR
• Path to profitability"`,
};

/* ── SECTION 4: Semi-Annual Checklist ─────────────────────────────────── */
const checklist = [
  { category: "National Liquidity Grid Health", items: [
    "Review listings density per city vs target (≥ 200 per metro)",
    "Assess cross-city demand routing conversion rate",
    "Measure national market share growth trajectory",
    "Evaluate developer partnership pipeline and onboarding progress",
    "Compare deal cycle duration across cities — identify outliers",
  ]},
  { category: "Profit & Unit Economics", items: [
    "Track contribution margin by city — flag any below 20%",
    "Review LTV:CAC ratio sustainability (minimum 5:1)",
    "Assess recurring revenue ratio growth (target > 35%)",
    "Evaluate marketing spend ROI by channel — cut underperformers",
    "Monitor automation coverage progress (target 60%)",
  ]},
  { category: "Fundraising Readiness", items: [
    "Update investor deck with latest metrics and milestones",
    "Prepare 3 city launch case studies with repeatable playbook proof",
    "Ensure financial model updated with 18-month projections",
    "Review term sheet positioning: valuation, dilution, governance",
    "Stage investor pipeline: 30+ targets, 10+ warm intros, 5+ deep conversations",
  ]},
  { category: "Strategic Position & Risk", items: [
    "Assess competitive landscape changes",
    "Review regulatory environment in expansion cities",
    "Evaluate team capacity vs growth demands",
    "Monitor vendor ecosystem health and satisfaction",
    "Plan next 6-month expansion and revenue priorities",
  ]},
];

/* ── SECTION 5: Risk Indicators ───────────────────────────────────────── */
const risks = [
  { risk: "Scale-Profit Imbalance", signal: "Revenue grows but contribution margin declines for 2+ consecutive quarters", mitigation: "Pause expansion. Focus on monetization depth in existing cities. Cut low-ROI marketing. Improve automation coverage." },
  { risk: "Liquidity Grid Fragmentation", signal: "3+ cities with < 100 active listings and declining agent participation", mitigation: "Consolidate to profitable cities. Run intensive vendor acquisition in weak markets. Merge underperforming zones." },
  { risk: "Fundraising Narrative Gap", signal: "Investor meetings not converting — < 20% proceed to deep-dive after first meeting", mitigation: "Sharpen growth proof metrics. Simplify vision narrative. Lead with unit economics strength. Get warm introductions." },
  { risk: "CAC Inflation", signal: "Customer acquisition cost increasing > 10% quarterly without proportional LTV growth", mitigation: "Shift to organic/referral channels. Optimize paid campaigns. Improve conversion funnel efficiency. Increase vendor subscription mix." },
  { risk: "Competitive Encroachment", signal: "New competitor gaining > 5% market share in core cities within one quarter", mitigation: "Deepen vendor loyalty programs. Accelerate feature differentiation. Lock exclusive partnerships. Increase switching costs." },
];

/* ── MAIN ──────────────────────────────────────────────────────────────── */
const NationalLiquidityProfitSeriesA = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-7 w-7 text-primary" /> National Liquidity Grid + Profit Optimization + Series-A
          </h2>
          <p className="text-sm text-muted-foreground mt-1">National scale blueprint — liquidity coordination, margin expansion & fundraising execution</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="grid"><Globe className="h-4 w-4 mr-1" />Liquidity Grid</TabsTrigger>
          <TabsTrigger value="profit"><DollarSign className="h-4 w-4 mr-1" />Profit</TabsTrigger>
          <TabsTrigger value="fundraising"><Briefcase className="h-4 w-4 mr-1" />Series-A</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* TAB 1: Liquidity Grid */}
        <TabsContent value="grid" className="space-y-4">
          {gridPhases.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className={`h-5 w-5 ${p.color}`} /> {p.phase}
                    </CardTitle>
                    <Badge variant="outline">{p.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {p.tactics.map((t, j) => (
                      <div key={j} className="bg-muted/40 rounded-lg p-3 border border-border/30">
                        <p className="font-semibold text-sm text-foreground">{t.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.kpis.map((k, j) => (
                      <Badge key={j} className="bg-primary/10 text-primary border-primary/20 text-xs">{k}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/60">
            <CardContent className="pt-6 space-y-3">
              <p className="font-semibold text-sm text-foreground">National Liquidity Grid Milestones</p>
              {[
                { label: "Metro Anchor Formation (Q1–Q2)", pct: 33 },
                { label: "Demand Routing Network (Q3–Q4)", pct: 67 },
                { label: "Transaction Momentum Grid (Q5–Q6)", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.label}</span><span>{m.pct}%</span></div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Profit Optimization */}
        <TabsContent value="profit" className="space-y-4">
          {profitPillars.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <p.icon className={`h-5 w-5 ${p.color}`} /> {p.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {p.tactics.map((t, j) => (
                      <div key={j} className="bg-muted/40 rounded-lg p-3 border border-border/30">
                        <p className="font-semibold text-sm text-foreground">{t.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 border border-border/30 relative">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Template</p>
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {lang === "id" ? p.scripts.id : p.scripts.en}
                    </pre>
                    <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copy(lang === "id" ? p.scripts.id : p.scripts.en)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Profit KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { label: "Contribution margin", target: "> 25%" },
                  { label: "LTV:CAC", target: "> 5:1" },
                  { label: "Recurring revenue", target: "> 35%" },
                  { label: "Automation coverage", target: "> 60%" },
                ].map((k, i) => (
                  <div key={i} className="bg-background rounded-lg p-3 border border-border/30 text-center">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-sm font-bold text-primary mt-1">{k.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Series-A */}
        <TabsContent value="fundraising" className="space-y-4">
          {fundraisingPillars.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <p.icon className={`h-5 w-5 ${p.color}`} /> {p.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {p.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div custom={3} variants={fade} initial="hidden" animate="visible">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Series-A Pitch Narrative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/40 rounded-lg p-4 border border-border/30 relative">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {lang === "id" ? fundraisingScript.id : fundraisingScript.en}
                  </pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copy(lang === "id" ? fundraisingScript.id : fundraisingScript.en)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Fundraising KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Meeting → term sheet", target: "> 15% conversion" },
                  { label: "Founder ownership post-round", target: "> 65%" },
                  { label: "Investor pipeline", target: "30+ targets" },
                ].map((k, i) => (
                  <div key={i} className="bg-background rounded-lg p-3 border border-border/30 text-center">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-sm font-bold text-primary mt-1">{k.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Checklist */}
        <TabsContent value="checklist" className="space-y-4">
          {checklist.map((c, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {c.items.map((item, j) => (
                      <label key={j} className="flex items-start gap-2 cursor-pointer group">
                        <input type="checkbox" className="mt-1 rounded border-border" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* TAB 5: Risks */}
        <TabsContent value="risks" className="space-y-4">
          {risks.map((r, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-sm text-foreground">{r.risk}</p>
                      <div className="bg-destructive/10 rounded-lg p-2 border border-destructive/20">
                        <p className="text-xs text-destructive"><Eye className="h-3 w-3 inline mr-1" />Signal: {r.signal}</p>
                      </div>
                      <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400"><Shield className="h-3 w-3 inline mr-1" />Mitigation: {r.mitigation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NationalLiquidityProfitSeriesA;
