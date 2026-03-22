import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Rocket, Landmark, Crown, CheckCircle, AlertTriangle, Shield,
  TrendingUp, Target, Copy, Eye, Globe, BarChart3, DollarSign, Users, Zap
} from "lucide-react";
import { toast } from "sonner";

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

/* ── SECTION 1: Series-B Hyper-Growth ─────────────────────────────────── */
const hyperPhases = [
  {
    phase: "Phase 1 — Market Expansion Blitz",
    period: "Quarter 1–2",
    color: "text-amber-400",
    tactics: [
      { t: "15-City Grid Activation", d: "Expand from 5 to 15 cities. Prioritize metros with $1B+ annual transaction volume. Use 90-day launch playbook per city." },
      { t: "Regional Marketing Command", d: "Hire regional growth leads per cluster (Java, Sumatra, Bali-Nusra, Kalimantan). Localized execution with central strategy." },
      { t: "Developer Portfolio Blitz", d: "Sign top 20 national developers. Onboard entire project portfolios. Target 500+ developer listings in 6 months." },
      { t: "Synchronized National Campaigns", d: "Quarterly 'National Property Week' — unified branding, promotions, and PR across all active cities." },
    ],
    kpis: ["15 active cities", "3,000+ national listings", "100+ deals/month nationally"],
  },
  {
    phase: "Phase 2 — Liquidity Flywheel at Scale",
    period: "Quarter 3–4",
    color: "text-emerald-400",
    tactics: [
      { t: "Agent Network 500+", d: "Scale to 500+ active agents nationally. Tiered performance program: Silver → Gold → Platinum → Diamond." },
      { t: "Cross-City Buyer Intelligence", d: "AI-powered buyer matching across cities. 'Based on your Jakarta search, consider these Surabaya opportunities.'" },
      { t: "Transaction Velocity Engine", d: "Target < 7-day average deal cycle nationally. Automated offer coordination, instant comparables, and closing support." },
      { t: "Repeat & Referral Growth Loop", d: "20%+ of deals from repeat buyers or referrals. Automated re-engagement every 90 days with curated opportunities." },
    ],
    kpis: ["150+ deals/month", "Cross-city deals > 20%", "Repeat/referral > 20% of pipeline"],
  },
  {
    phase: "Phase 3 — Revenue Power Scaling",
    period: "Quarter 5–6",
    color: "text-blue-400",
    tactics: [
      { t: "Enterprise Subscription Tier", d: "Launch Rp 10M+/month enterprise tier for large agencies: white-label analytics, dedicated support, API access." },
      { t: "Developer Campaign Revenue", d: "Rp 50–200M project launch packages. Target 10+ enterprise campaigns per quarter." },
      { t: "Data Intelligence Monetization", d: "Institutional-grade market reports, district analytics, and portfolio intelligence products. Rp 15–50M per engagement." },
      { t: "Financing Referral Revenue", d: "Bank partnership commissions on mortgage referrals. Target 5–10% of closed deals generating financing revenue." },
    ],
    kpis: ["$500K+ MRR", "Recurring revenue > 40%", "4+ revenue streams active"],
  },
];

/* ── SECTION 2: Institutional Capital Integration ─────────────────────── */
const capitalPillars = [
  {
    pillar: "Institutional Deal Pipeline",
    icon: DollarSign,
    color: "text-emerald-400",
    tactics: [
      { t: "Curated Investment Portfolios", d: "AI-filtered deal feeds for institutional investors: yield-optimized, risk-rated, liquidity-scored property bundles." },
      { t: "Standardized Deal Intelligence", d: "One-page deal summaries: FMV, comparable analysis, demand score, liquidity index, expected yield, risk rating." },
      { t: "Opportunity Segmentation", d: "Segment by yield profile (Income/Growth/Value), risk tier (Conservative/Moderate/Aggressive), and geography." },
      { t: "Bulk Transaction Facilitation", d: "Enable portfolio-level transactions: 5–50 properties per deal. Dedicated closing coordination team." },
    ],
    scripts: {
      id: `INSTITUTIONAL INVESTOR OUTREACH:

"Yth. [Nama Fund Manager],

Astra PropTech mengelola grid likuiditas properti nasional dengan [X]+ listing aktif di [Y] kota.

Kami menawarkan akses eksklusif ke:
📊 AI-curated deal feed berdasarkan profil yield Anda
🏠 Portfolio bulk acquisition (5–50 unit per transaksi)
📈 Real-time liquidity intelligence per distrik

Minggu ini tersedia [Z] peluang investasi yield 8–12% di [Kota].

Jadwalkan briefing 20 menit? 📞"`,
      en: `INSTITUTIONAL INVESTOR OUTREACH:

"Dear [Fund Manager Name],

Astra PropTech operates a national property liquidity grid with [X]+ active listings across [Y] cities.

We offer exclusive access to:
📊 AI-curated deal feed based on your yield profile
🏠 Portfolio bulk acquisition (5–50 units per transaction)
📈 Real-time liquidity intelligence per district

This week [Z] investment opportunities yielding 8–12% are available in [City].

Schedule a 20-minute briefing? 📞"`,
    },
  },
  {
    pillar: "Strategic Partnership Activation",
    icon: Landmark,
    color: "text-amber-400",
    tactics: [
      { t: "Tiered Institutional Program", d: "Explorer (data access) → Partner (deal flow + analytics) → Strategic (co-investment + governance). Progressive engagement." },
      { t: "Family Office Network", d: "Quarterly exclusive briefings for HNW families. Curated off-market opportunities. White-glove transaction support." },
      { t: "Bank & REIT Integration", d: "API-connected deal flow to partner banks for financing. REIT pipeline for portfolio-grade properties." },
      { t: "Co-Investment Syndication", d: "Platform-facilitated syndication for large deals. Minimum ticket Rp 500M–5B. Structured SPV formation support." },
    ],
    scripts: {
      id: `PARTNERSHIP TIER PROPOSAL:

"Program Kemitraan Institusional Astra

🔹 Explorer (Gratis):
• Akses laporan market intelligence bulanan
• Dashboard likuiditas per kota

🔸 Partner (Rp 25M/tahun):
• AI-curated deal feed real-time
• Priority access bulk acquisition
• Dedicated relationship manager

🔶 Strategic (Custom):
• Co-investment syndication access
• Governance advisory participation
• Custom portfolio analytics API
• Exclusive off-market deal flow"`,
      en: `PARTNERSHIP TIER PROPOSAL:

"Astra Institutional Partnership Program

🔹 Explorer (Free):
• Monthly market intelligence reports
• Per-city liquidity dashboard access

🔸 Partner (Rp 25M/year):
• Real-time AI-curated deal feed
• Priority bulk acquisition access
• Dedicated relationship manager

🔶 Strategic (Custom):
• Co-investment syndication access
• Governance advisory participation
• Custom portfolio analytics API
• Exclusive off-market deal flow"`,
    },
  },
  {
    pillar: "Capital Flow Visibility & Trust",
    icon: BarChart3,
    color: "text-blue-400",
    tactics: [
      { t: "Institutional Performance Dashboard", d: "Portfolio-level analytics: IRR tracking, yield benchmarking, geographic concentration (HHI), risk-adjusted returns." },
      { t: "Investment Case Studies", d: "Published success stories: 'Fund X deployed $2M across 15 properties, achieving 11.5% IRR in 18 months via Astra.'" },
      { t: "Transparent Governance Signals", d: "Quarterly institutional investor reports. Audited transaction data. Clear fee structure disclosure." },
      { t: "Capital Flow Intelligence", d: "Real-time dashboard showing institutional capital movement trends across markets. Inform allocation decisions." },
    ],
    scripts: {
      id: `INSTITUTIONAL QUARTERLY REPORT:

"📊 Laporan Kuartalan Institusional — Q[X] [Tahun]

Portfolio Performance:
• Total AUM Managed: Rp [X]B
• Weighted IRR: [Y]%
• Properties in Portfolio: [Z]
• Geographic Distribution: [Cities]

Market Intelligence:
• Highest Yield Districts: [Top 3]
• Demand Growth Leaders: [Top 3]
• Liquidity Index Trend: [↑/→/↓]

Opportunities Pipeline:
• [N] new investment-grade listings
• Estimated combined yield: [Y]%"`,
      en: `INSTITUTIONAL QUARTERLY REPORT:

"📊 Institutional Quarterly Report — Q[X] [Year]

Portfolio Performance:
• Total AUM Managed: Rp [X]B
• Weighted IRR: [Y]%
• Properties in Portfolio: [Z]
• Geographic Distribution: [Cities]

Market Intelligence:
• Highest Yield Districts: [Top 3]
• Demand Growth Leaders: [Top 3]
• Liquidity Index Trend: [↑/→/↓]

Opportunities Pipeline:
• [N] new investment-grade listings
• Estimated combined yield: [Y]%"`,
    },
  },
];

/* ── SECTION 3: Category Leadership Narrative ─────────────────────────── */
const categoryPillars = [
  {
    pillar: "Category Definition Positioning",
    icon: Crown,
    color: "text-amber-400",
    items: [
      "Shift language: 'Property Marketplace' → 'Liquidity Intelligence Infrastructure'",
      "Introduce proprietary metrics: 'Liquidity Index', 'Deal Velocity Score', 'Capital Attraction Rate'",
      "Frame competitive advantage: 'We don't list properties — we orchestrate transactions'",
      "Publish 'State of Property Liquidity' annual report defining the category",
      "Patent or trademark key intelligence methodologies and scoring systems",
    ],
  },
  {
    pillar: "Authority Amplification",
    icon: Globe,
    color: "text-emerald-400",
    items: [
      "Keynote appearances at Asia PropTech, MIPIM, and regional investment forums",
      "Monthly 'National Liquidity Intelligence' report syndicated to business media",
      "Strategic partnerships announced with banks, REITs, and technology platforms",
      "Founder thought leadership: weekly LinkedIn essays on property market transformation",
      "Industry advisory board featuring prominent real estate and fintech leaders",
    ],
  },
  {
    pillar: "Ecosystem Confidence Signals",
    icon: TrendingUp,
    color: "text-blue-400",
    items: [
      "Display network-effect metrics: '10,000+ listings, 500+ agents, 15 cities, 3,000+ deals'",
      "Highlight recurring revenue growth: 'Subscription revenue grew 150% YoY'",
      "Showcase institutional adoption: '[X] funds and family offices actively using platform'",
      "Publish NPS and satisfaction metrics: 'Agent satisfaction: 88%, Buyer trust score: 91%'",
      "Align brand narrative with measurable societal impact: 'Reduced average transaction time by 60%'",
    ],
  },
];

/* ── SECTION 4: Annual Checklist ──────────────────────────────────────── */
const annualChecklist = [
  { category: "Hyper-Growth Execution", items: [
    "Review annual deal count vs 3,000+ target trajectory",
    "Assess city expansion progress (target: 15+ active cities)",
    "Evaluate revenue growth velocity vs Series-B benchmarks ($500K+ MRR)",
    "Track agent network scale (target: 500+ active nationally)",
    "Measure cross-city transaction contribution (target: > 20%)",
  ]},
  { category: "Institutional Capital Health", items: [
    "Count institutional partners by tier (Explorer/Partner/Strategic)",
    "Measure capital volume influenced through platform annually",
    "Track repeat institutional engagement frequency",
    "Review investment case study publication pace (target: 4+/year)",
    "Assess institutional revenue contribution (target: > 15% of total)",
  ]},
  { category: "Category Leadership Position", items: [
    "Track brand search trend growth vs competitors",
    "Measure inbound strategic partnership requests (target: 20+/year)",
    "Review media coverage and thought leadership reach",
    "Assess category terminology adoption in industry discourse",
    "Evaluate valuation multiple premium vs comparable companies",
  ]},
  { category: "Financial & Governance Discipline", items: [
    "Validate LTV:CAC sustainability > 5:1 at scale",
    "Review contribution margin by city — flag any below 20%",
    "Assess burn rate vs runway — ensure 18+ months at current velocity",
    "Prepare Series-B fundraising materials with updated metrics",
    "Align board reporting with institutional governance standards",
  ]},
];

/* ── SECTION 5: Risks ─────────────────────────────────────────────────── */
const risks = [
  { risk: "Over-Expansion Capital Drain", signal: "Burn rate exceeds revenue growth by 2x+ for consecutive quarters", mitigation: "Pause city launches. Focus on profitable core markets. Renegotiate marketing spend. Extend runway to 24+ months." },
  { risk: "Institutional Engagement Stall", signal: "< 5 institutional partners after 12 months of active outreach", mitigation: "Simplify institutional onboarding. Lead with data products (lower commitment). Build credibility through published case studies first." },
  { risk: "Category Narrative Dilution", signal: "Competitors adopting similar positioning language without differentiation erosion", mitigation: "Double down on proprietary metrics. Accelerate patent/trademark filings. Deepen ecosystem integrations that competitors can't replicate." },
  { risk: "Revenue Concentration Risk", signal: "Single revenue stream contributing > 50% of total for 2+ quarters", mitigation: "Accelerate diversification: push subscription adoption, launch data products, activate financing referrals. Balance to no stream > 35%." },
  { risk: "Agent Ecosystem Fragility", signal: "Top 10% of agents generating > 60% of deals with declining mid-tier productivity", mitigation: "Invest in mid-tier agent coaching. Improve lead distribution fairness. Introduce performance-based incentives across all tiers." },
];

/* ── MAIN ──────────────────────────────────────────────────────────────── */
const SeriesBInstitutionalCategoryLeadership = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-7 w-7 text-primary" /> Series-B Hyper-Growth + Institutional Capital + Category Leadership
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Late-stage scaling blueprint — aggressive expansion, institutional integration & market category creation</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="growth"><Rocket className="h-4 w-4 mr-1" />Hyper-Growth</TabsTrigger>
          <TabsTrigger value="capital"><Landmark className="h-4 w-4 mr-1" />Institutional</TabsTrigger>
          <TabsTrigger value="category"><Crown className="h-4 w-4 mr-1" />Category</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* TAB 1: Hyper-Growth */}
        <TabsContent value="growth" className="space-y-4">
          {hyperPhases.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className={`h-5 w-5 ${p.color}`} /> {p.phase}
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
              <p className="font-semibold text-sm text-foreground">Series-B Growth Milestones</p>
              {[
                { label: "Market Expansion Blitz (Q1–Q2)", pct: 33 },
                { label: "Liquidity Flywheel at Scale (Q3–Q4)", pct: 67 },
                { label: "Revenue Power Scaling (Q5–Q6)", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.label}</span><span>{m.pct}%</span></div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Institutional */}
        <TabsContent value="capital" className="space-y-4">
          {capitalPillars.map((p, i) => (
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
              <p className="font-semibold text-sm text-foreground mb-2">Institutional Capital KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { label: "Institutional partners", target: "15+" },
                  { label: "Capital influenced", target: "Rp 500B+" },
                  { label: "Repeat engagement", target: "> 60%" },
                  { label: "Revenue contribution", target: "> 15%" },
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

        {/* TAB 3: Category Leadership */}
        <TabsContent value="category" className="space-y-4">
          {categoryPillars.map((p, i) => (
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
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Category Leadership KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Brand authority growth", target: "+100% YoY search" },
                  { label: "Partnership inbound", target: "20+ requests/year" },
                  { label: "Valuation multiple", target: "> 15x revenue" },
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
          {annualChecklist.map((c, i) => (
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

export default SeriesBInstitutionalCategoryLeadership;
