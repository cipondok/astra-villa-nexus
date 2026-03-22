import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Diamond, Globe, Crown, CheckCircle, AlertTriangle, Shield,
  TrendingUp, Target, Copy, Eye, BarChart3, DollarSign, Zap, Landmark
} from "lucide-react";
import { toast } from "sonner";

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

/* ── SECTION 1: Unicorn Valuation Acceleration ───────────────────────── */
const valuationPhases = [
  {
    phase: "Phase 1 — Growth Signal Amplification",
    period: "Quarter 1–3",
    color: "text-amber-400",
    tactics: [
      { t: "Milestone Transaction Velocity", d: "Publish landmark achievements: 5,000 → 10,000 → 25,000 deals closed. Each milestone triggers coordinated PR, investor update, and ecosystem broadcast." },
      { t: "Expansion Success Case Studies", d: "Document repeatable city domination playbooks with quantified outcomes: 'City X reached 500 deals in 9 months with 35% margin.' Minimum 6 published annually." },
      { t: "Network-Effect Proof Points", d: "Track and present flywheel metrics: each new agent generates 2.5x more buyer inquiries, cross-city routing increases conversion by 40%, repeat buyers grow 25% QoQ." },
      { t: "Revenue Predictability Dashboard", d: "Investor-facing metrics: 90%+ forecast accuracy, < 8% MoM revenue variance, 18+ month forward visibility through contracted subscriptions and pipeline." },
    ],
    kpis: ["Revenue growth > 100% YoY", "Forecast accuracy > 90%", "Network-effect multiplier > 2x"],
  },
  {
    phase: "Phase 2 — Monetization Power Scaling",
    period: "Quarter 2–5",
    color: "text-emerald-400",
    tactics: [
      { t: "Enterprise Subscription Penetration", d: "Target 60%+ of active agencies on paid tiers. Introduce Rp 15M+/month enterprise plans with white-label analytics, API access, and dedicated support." },
      { t: "Developer Campaign Revenue Engine", d: "Scale to 20+ enterprise launch campaigns per quarter. Average ticket Rp 150–500M. Full-funnel attribution proving 5x+ ROI for developers." },
      { t: "Data Intelligence Product Tiers", d: "3-tier pricing: Standard (Rp 5M — district reports), Professional (Rp 25M — predictive analytics), Enterprise (Rp 75M+ — custom portfolio intelligence)." },
      { t: "Financing Ecosystem Revenue", d: "Mortgage referral commissions, insurance partnerships, legal service marketplace. Target 10%+ of total revenue from ecosystem services." },
    ],
    kpis: ["Recurring revenue > 50%", "$1M+ MRR achieved", "4+ active revenue streams"],
  },
  {
    phase: "Phase 3 — Investor Confidence Reinforcement",
    period: "Quarter 4–6",
    color: "text-blue-400",
    tactics: [
      { t: "Unit Economics Excellence", d: "LTV:CAC > 8:1 demonstrated across all markets. Contribution margin > 40% in mature cities. Payback period < 6 months for new customer acquisition." },
      { t: "Profitability Trajectory Proof", d: "Show clear path from current margins to 25%+ operating profit. Demonstrate operating leverage: revenue grows 3x while costs grow 1.5x." },
      { t: "Governance Upgrade Program", d: "Big 4 audit engagement. Independent board members. SOC 2 compliance. Quarterly investor reporting with institutional-grade transparency." },
      { t: "Pre-Unicorn Fundraising Positioning", d: "Target $50–100M round at $800M–1.2B valuation. Lead with infrastructure narrative: 'We're building the operating system for property transactions.'" },
    ],
    kpis: ["LTV:CAC > 8:1", "Operating margin trajectory > 25%", "Valuation > $800M"],
  },
];

/* ── SECTION 2: Global Liquidity Synchronization ─────────────────────── */
const liquidityPillars = [
  {
    pillar: "Cross-Market Supply Alignment",
    icon: Globe,
    color: "text-emerald-400",
    tactics: [
      { t: "Global Inventory Grid", d: "Balanced listing clusters in 5+ countries. Minimum 2,000 listings per country. Standardized quality scoring and presentation across all markets." },
      { t: "Universal Listing Intelligence", d: "Proprietary scoring system applied globally: Demand Score (0–100), Liquidity Index (0–100), Price Fairness Rating, and Investment Grade classification." },
      { t: "Synchronized Developer Launches", d: "Coordinate project launches across countries. 'Global Property Week' — simultaneous campaigns in 5+ markets driving cross-border discovery." },
      { t: "Supply Quality Governance", d: "Automated listing quality audits. Minimum photo count, description standards, pricing validation. Delist underperforming inventory after 90 days." },
    ],
  },
  {
    pillar: "Demand Routing Intelligence",
    icon: TrendingUp,
    color: "text-amber-400",
    tactics: [
      { t: "Cross-Border Buyer Matching", d: "AI-powered: 'Singapore investors interested in Bali yield properties' → auto-curate and push matched listings. Target 25%+ cross-border inquiry rate." },
      { t: "Global Comparative Insights", d: "Interactive dashboards comparing yield, growth, and liquidity across cities/countries. Enable investors to discover optimal allocation opportunities." },
      { t: "Coordinated Promotional Momentum", d: "Quarterly global campaigns targeting diaspora buyers, international investors, and digital nomad property seekers. Unified messaging, localized execution." },
      { t: "Predictive Demand Surge Alerts", d: "ML-based demand forecasting per district/city/country. Alert agents and developers 2–4 weeks before predicted demand spikes. Enable proactive inventory preparation." },
    ],
  },
  {
    pillar: "Transaction Efficiency Optimization",
    icon: Zap,
    color: "text-blue-400",
    tactics: [
      { t: "Centralized Deal Coordination", d: "Single transaction management layer across all markets. Standardized offer flow, document management, and closing support. Target < 10-day global average deal cycle." },
      { t: "Multi-Currency Settlement Support", d: "Facilitate cross-border payments via banking partnerships. Currency conversion transparency, escrow coordination, and regulatory compliance per jurisdiction." },
      { t: "Unified Discovery Infrastructure", d: "Single search experience spanning all markets. Filters by country, yield, risk, property type. Seamless transition from discovery to transaction regardless of geography." },
      { t: "Performance Benchmarking", d: "Global leaderboard: fastest markets, highest conversion rates, best agent performance. Drive competitive improvement across regions." },
    ],
  },
];

/* ── SECTION 3: Institutional Brand Authority ────────────────────────── */
const authorityPillars = [
  {
    pillar: "Strategic Infrastructure Positioning",
    icon: Landmark,
    color: "text-amber-400",
    items: [
      "Frame as 'Transaction Intelligence Infrastructure' — not a marketplace, but the coordination layer enabling efficient property capital allocation",
      "Introduce proprietary terminology: 'Liquidity Synchronization Index', 'Capital Velocity Score', 'Transaction Intelligence Quotient (TIQ)'",
      "Quantify impact: '$2B+ capital deployed through platform, 60% faster transaction cycles, 40% reduction in information asymmetry'",
      "Position in investor materials alongside infrastructure companies (Bloomberg, CoStar, MSCI) rather than marketplaces",
      "Publish annual 'Global Property Liquidity Report' establishing category-defining benchmarks",
    ],
    scripts: {
      id: `POSITIONING NARRATIVE — INVESTOR DECK:

"Astra PropTech bukan sekadar marketplace properti.

Kami adalah infrastruktur intelijen transaksi yang mengoordinasikan aliran modal properti global.

📊 Skala Dampak:
• $2B+ modal properti dikoordinasikan melalui platform
• [X]+ kota di [Y] negara tersinkronisasi
• Siklus transaksi 60% lebih cepat dari rata-rata industri
• Asimetri informasi berkurang 40%

🏗️ Posisi Strategis:
• Bukan listing portal → Liquidity Intelligence Infrastructure
• Bukan broker → Transaction Coordination Layer
• Bukan data vendor → Capital Allocation Operating System

💎 Keunggulan Kompetitif:
• Proprietary Liquidity Synchronization Index
• Cross-border demand routing AI
• Network-effect flywheel: setiap user baru meningkatkan nilai 2.5x untuk semua peserta

Kami membangun Bloomberg-nya real estate Asia Tenggara."`,
      en: `POSITIONING NARRATIVE — INVESTOR DECK:

"Astra PropTech is not just a property marketplace.

We are the transaction intelligence infrastructure coordinating global property capital flow.

📊 Impact at Scale:
• $2B+ property capital coordinated through platform
• [X]+ cities across [Y] countries synchronized
• Transaction cycles 60% faster than industry average
• Information asymmetry reduced by 40%

🏗️ Strategic Positioning:
• Not a listing portal → Liquidity Intelligence Infrastructure
• Not a broker → Transaction Coordination Layer
• Not a data vendor → Capital Allocation Operating System

💎 Competitive Advantage:
• Proprietary Liquidity Synchronization Index
• Cross-border demand routing AI
• Network-effect flywheel: each new user increases value 2.5x for all participants

We're building the Bloomberg of Southeast Asian real estate."`,
    },
  },
  {
    pillar: "Authority Amplification Campaigns",
    icon: Crown,
    color: "text-emerald-400",
    items: [
      "Keynote at MIPIM, Asia PropTech Summit, Bloomberg Real Estate Forum — founder as category-defining thought leader",
      "Quarterly 'Global Liquidity Intelligence Report' syndicated to Financial Times, Bloomberg, Nikkei Asia, and regional business media",
      "Strategic partnership announcements: major banks, sovereign wealth fund collaborations, technology platform integrations",
      "Founder op-eds in tier-1 business publications: 'The Future of Property Capital Allocation' and 'Why Real Estate Needs a Liquidity Layer'",
      "Industry advisory board featuring former central bankers, REIT CEOs, and fintech pioneers",
    ],
    scripts: {
      id: `MEDIA PITCH — THOUGHT LEADERSHIP:

"📰 Pitch ke Editor Bisnis:

Subject: Bagaimana AI Mengubah Alokasi Modal Properti Global

Yth. [Nama Editor],

Pasar properti global senilai $326 triliun masih beroperasi dengan infrastruktur transaksi era 1990-an. Astra PropTech sedang mengubah ini.

Angle Cerita:
1. Data eksklusif: Tren likuiditas properti 2025 di [X] kota Asia Tenggara
2. Wawancara founder: Perjalanan membangun 'Bloomberg untuk real estate'
3. Dampak terukur: Bagaimana AI mengurangi siklus transaksi 60%

Tersedia untuk interview mendalam minggu depan.

Kontak: [Detail]"`,
      en: `MEDIA PITCH — THOUGHT LEADERSHIP:

"📰 Pitch to Business Editor:

Subject: How AI Is Transforming Global Property Capital Allocation

Dear [Editor Name],

The $326 trillion global property market still operates on 1990s-era transaction infrastructure. Astra PropTech is changing that.

Story Angles:
1. Exclusive data: 2025 property liquidity trends across [X] Southeast Asian cities
2. Founder interview: The journey building 'Bloomberg for real estate'
3. Measurable impact: How AI reduces transaction cycles by 60%

Available for in-depth interview next week.

Contact: [Details]"`,
    },
  },
  {
    pillar: "Trust & Credibility Reinforcement",
    icon: Shield,
    color: "text-blue-400",
    items: [
      "Institutional-grade transparency: audited financials, SOC 2 Type II compliance, quarterly investor reports with variance analysis",
      "Customer proof points: '95% agent retention rate, 88 NPS score, 70% of institutional partners renew annually'",
      "Operational discipline storytelling: 'Every city launch follows our proven 90-day playbook with 85%+ adherence score'",
      "Long-term profitability pathway: 'Clear trajectory from current margins to 25%+ operating profit within 24 months'",
      "ESG alignment: sustainable building promotion, carbon footprint tracking for portfolios, inclusive access programs",
    ],
    scripts: {
      id: `INSTITUTIONAL TRUST SIGNAL — QUARTERLY UPDATE:

"📊 Update Kuartalan untuk Investor Institusional — Q[X] [Tahun]

🔒 Governance & Trust:
• Audit keuangan: [Big 4] — clean opinion
• SOC 2 Type II: compliant
• Transparansi KPI: dashboard real-time tersedia

📈 Performa Operasional:
• Revenue growth: [Y]% YoY
• Recurring revenue ratio: [Z]%
• LTV:CAC: [R]:1
• Operating margin trajectory: [M]%

🌐 Skala Dampak:
• [N] kota aktif di [C] negara
• [D]+ deals closed kuartal ini
• [A]+ agent aktif di jaringan
• NPS score: [S]

🎯 Outlook Q[X+1]:
• Target ekspansi: [Cities]
• Revenue projection: Rp [V]
• Key initiatives: [Initiatives]"`,
      en: `INSTITUTIONAL TRUST SIGNAL — QUARTERLY UPDATE:

"📊 Quarterly Update for Institutional Investors — Q[X] [Year]

🔒 Governance & Trust:
• Financial audit: [Big 4] — clean opinion
• SOC 2 Type II: compliant
• KPI transparency: real-time dashboard available

📈 Operational Performance:
• Revenue growth: [Y]% YoY
• Recurring revenue ratio: [Z]%
• LTV:CAC: [R]:1
• Operating margin trajectory: [M]%

🌐 Impact at Scale:
• [N] active cities in [C] countries
• [D]+ deals closed this quarter
• [A]+ active agents in network
• NPS score: [S]

🎯 Q[X+1] Outlook:
• Expansion targets: [Cities]
• Revenue projection: Rp [V]
• Key initiatives: [Initiatives]"`,
    },
  },
];

/* ── SECTION 4: Multi-Year Checklist ─────────────────────────────────── */
const checklist = [
  { category: "Valuation Acceleration Health", items: [
    "Revenue growth sustained > 80% YoY for 3+ consecutive years",
    "Recurring revenue ratio > 50% with < 5% monthly churn",
    "LTV:CAC > 8:1 demonstrated across all mature markets",
    "Operating margin improving > 5 percentage points per year",
    "Big 4 audit engagement completed with clean opinion",
  ]},
  { category: "Global Liquidity Synchronization", items: [
    "5+ countries with active liquidity grids above minimum density",
    "Cross-border transaction participation > 20% of total volume",
    "Universal listing intelligence scoring deployed across all markets",
    "Average global deal cycle < 12 days (vs industry 30+ days)",
    "Predictive demand surge alerts achieving > 75% accuracy",
  ]},
  { category: "Institutional Brand Authority", items: [
    "Category terminology adopted by 3+ industry analysts",
    "Founder keynoted at 2+ tier-1 international conferences annually",
    "Global Liquidity Intelligence Report published and syndicated quarterly",
    "15+ institutional partnerships across 3+ tiers (Explorer/Partner/Strategic)",
    "Inbound strategic partnership requests exceeding 30+ per year",
  ]},
  { category: "Governance & Risk Discipline", items: [
    "Independent board members comprising > 40% of board",
    "SOC 2 Type II compliance maintained and renewed annually",
    "Rule of 40 score sustained > 45% for 4+ consecutive quarters",
    "Runway maintained at 24+ months at current burn rate",
    "Crisis response protocols tested and updated semi-annually",
  ]},
];

/* ── SECTION 5: Risks ─────────────────────────────────────────────────── */
const risks = [
  { risk: "Valuation Perception Distortion", signal: "Valuation exceeds 30x forward revenue without corresponding unit economics improvement. Investor skepticism increasing.", mitigation: "Anchor valuation narrative in unit economics proof. Demonstrate clear profitability timeline. Reduce reliance on growth-only storytelling. Show operating leverage through margin expansion." },
  { risk: "Global Liquidity Fragmentation", signal: "3+ international markets below minimum density thresholds for 2+ quarters. Cross-border transactions declining.", mitigation: "Consolidate to strongest markets. Redeploy capital from underperforming regions. Strengthen core before expanding. Consider strategic market exits." },
  { risk: "Institutional Credibility Gap", signal: "Institutional partnership conversion rate < 15%. Major investors questioning category positioning authenticity.", mitigation: "Lead with data products (lower commitment). Build credibility through published research first. Engage advisory board members for introductions. Focus on demonstrable impact metrics." },
  { risk: "Competitive Category Erosion", signal: "2+ well-funded competitors adopting similar positioning. Differentiation perception weakening.", mitigation: "Accelerate proprietary data advantages. Deepen ecosystem integrations creating switching costs. Patent key methodologies. Strengthen exclusive developer partnerships." },
  { risk: "Growth-Profitability Imbalance", signal: "Burn rate increasing faster than revenue for 3+ consecutive quarters. Rule of 40 score dropping below 35%.", mitigation: "Immediate cost optimization review. Pause discretionary expansion. Focus on revenue depth in existing markets. Prepare contingency fundraising with revised growth narrative." },
];

/* ── MAIN ──────────────────────────────────────────────────────────────── */
const UnicornLiquidityInstitutionalAuthority = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Diamond className="h-7 w-7 text-primary" /> Unicorn Valuation + Global Liquidity + Institutional Authority
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Unicorn-trajectory blueprint — valuation acceleration, liquidity synchronization & institutional brand authority</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="valuation" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="valuation"><Diamond className="h-4 w-4 mr-1" />Valuation</TabsTrigger>
          <TabsTrigger value="liquidity"><Globe className="h-4 w-4 mr-1" />Global Liquidity</TabsTrigger>
          <TabsTrigger value="authority"><Crown className="h-4 w-4 mr-1" />Brand Authority</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* TAB 1: Valuation */}
        <TabsContent value="valuation" className="space-y-4">
          {valuationPhases.map((p, i) => (
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
              <p className="font-semibold text-sm text-foreground">Unicorn Valuation Trajectory</p>
              {[
                { label: "Growth Signal Amplification (Q1–Q3)", pct: 33 },
                { label: "Monetization Power Scaling (Q2–Q5)", pct: 67 },
                { label: "Investor Confidence Lock (Q4–Q6)", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.label}</span><span>{m.pct}%</span></div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Global Liquidity */}
        <TabsContent value="liquidity" className="space-y-4">
          {liquidityPillars.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <p.icon className={`h-5 w-5 ${p.color}`} /> {p.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {p.tactics.map((t, j) => (
                      <div key={j} className="bg-muted/40 rounded-lg p-3 border border-border/30">
                        <p className="font-semibold text-sm text-foreground">{t.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.d}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Global Liquidity KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { label: "Countries active", target: "5+" },
                  { label: "Cross-border deals", target: "> 20%" },
                  { label: "Global deal cycle", target: "< 12 days" },
                  { label: "Demand forecast accuracy", target: "> 75%" },
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

        {/* TAB 3: Brand Authority */}
        <TabsContent value="authority" className="space-y-4">
          {authorityPillars.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <p.icon className={`h-5 w-5 ${p.color}`} /> {p.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {p.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{item}</p>
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

export default UnicornLiquidityInstitutionalAuthority;
