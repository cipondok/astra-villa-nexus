import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Globe, Cpu, Crown, CheckCircle, AlertTriangle, Shield,
  TrendingUp, Target, Copy, Eye, BarChart3, Layers, Landmark, Zap
} from "lucide-react";
import { toast } from "sonner";

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

/* ── SECTION 1: Decacorn Strategic Simulation ────────────────────────── */
const simPhases = [
  {
    phase: "Phase 1 — Continental Expansion Pathway",
    period: "Year 1–3",
    color: "text-amber-400",
    tactics: [
      { t: "Southeast Asia Dominance Lock", d: "Complete coverage: Indonesia (30 cities), Malaysia, Thailand, Vietnam, Philippines. 50,000+ listings, 5,000+ deals/month. Revenue base: $30M+ ARR." },
      { t: "Middle East & South Asia Entry", d: "UAE, Saudi Arabia, India (Tier-1 cities). Partner with regional mega-developers. Leverage cross-border investor flows from SEA diaspora. Target: $15M ARR by Year 3." },
      { t: "Revenue Diversification Modeling", d: "No single country > 40% of revenue. Target: SEA 50%, MENA 25%, South Asia 15%, Others 10%. Stress-test scenarios for regional economic shocks." },
      { t: "Operational Discipline Pacing", d: "Maximum 2 new countries per year. Each must achieve positive contribution margin within 12 months. Stage-gate approval with board sign-off." },
    ],
    kpis: ["$50M+ ARR", "5+ countries active", "No country > 40% revenue"],
  },
  {
    phase: "Phase 2 — Monetization Evolution",
    period: "Year 2–5",
    color: "text-emerald-400",
    tactics: [
      { t: "Enterprise Intelligence Products", d: "Institutional-grade analytics suite: $100K–500K/year per client. Portfolio intelligence, market forecasting, capital flow analysis. Target: 50+ enterprise clients." },
      { t: "Cross-Border Investment Coordination", d: "Platform-facilitated international transactions. Syndication tools, multi-currency settlement, regulatory compliance layers. 1% coordination fee on $2B+ annual volume." },
      { t: "Ecosystem Transaction Facilitation", d: "Mortgage referrals, insurance, legal services, property management. 15%+ of revenue from ecosystem services. Build switching costs through integrated workflows." },
      { t: "Data Licensing Revenue", d: "Anonymized market intelligence feeds to institutional investors, banks, and governments. API-based pricing: $50K–200K/year. Target: 100+ data subscribers." },
    ],
    kpis: ["$120M+ ARR", "Recurring revenue > 60%", "5+ revenue streams"],
  },
  {
    phase: "Phase 3 — Competitive Moat Stress-Testing",
    period: "Year 3–7",
    color: "text-blue-400",
    tactics: [
      { t: "Behavioral Data Fortress", d: "10B+ data points from user interactions. Proprietary models trained on 100K+ transactions. 18–24 month replication barrier for any new entrant." },
      { t: "New Entrant Disruption Simulation", d: "Quarterly war-gaming: well-funded vertical player enters your #1 market. Response playbook: deepen integrations, activate loyalty programs, accelerate exclusive partnerships." },
      { t: "Ecosystem Lock-In Reinforcement", d: "Agent CRM deeply integrated. Developer inventory APIs embedded in workflows. Investor portfolios managed on platform. Switching cost: 6–12 months of operational disruption." },
      { t: "Regulatory Moat Building", d: "First-mover advantage in regulatory compliance per jurisdiction. Certified data provider status. Government partnership for housing market transparency initiatives." },
    ],
    kpis: ["Replication barrier > 18 months", "Agent retention > 92%", "Switching cost > 6 months"],
  },
];

/* ── SECTION 2: Autonomous Intelligence OS ───────────────────────────── */
const osPillars = [
  {
    pillar: "Global Signal Aggregation Engine",
    icon: Globe,
    color: "text-emerald-400",
    tactics: [
      { t: "Unified Data Fabric", d: "Real-time ingestion from all markets: listing events, inquiry signals, pricing movements, transaction completions, agent activity, buyer behavior. < 30s global propagation latency." },
      { t: "Universal Liquidity Scoring", d: "Standardized 0–100 Liquidity Index per district/city/country. Composite of: supply density (25%), demand velocity (30%), transaction speed (25%), price stability (20%)." },
      { t: "Predictive Opportunity Mapping", d: "ML models forecasting: demand surges (2–4 week horizon), price movements (quarterly), supply gaps (monthly). Accuracy target: > 80% for top-tier predictions." },
      { t: "Cross-Market Correlation Intelligence", d: "Detect capital flow patterns between markets. 'When Singapore demand drops 15%, Bali inquiry volume increases within 6 weeks.' Enable proactive positioning." },
    ],
  },
  {
    pillar: "Autonomous Growth Orchestration",
    icon: Zap,
    color: "text-amber-400",
    tactics: [
      { t: "Signal-Triggered Campaign Activation", d: "Auto-deploy marketing campaigns when demand signals breach thresholds. E.g., inquiry velocity +30% in district → activate listing boost + buyer notification cascade." },
      { t: "Adaptive Lead Routing Engine", d: "ML-optimized lead distribution considering: agent performance score, specialization match, response speed, capacity, and buyer intent confidence. Real-time rebalancing." },
      { t: "Dynamic Monetization Recommender", d: "AI suggests optimal monetization actions per listing/agent: 'Boost this listing now — 85% probability of inquiry spike in 48 hours. Estimated ROI: 4.2x.'" },
      { t: "Self-Healing Market Operations", d: "Detect operational anomalies (response time spikes, conversion drops) and auto-trigger interventions: reassign leads, escalate to managers, activate contingency campaigns." },
    ],
  },
  {
    pillar: "Governance & Strategic Oversight",
    icon: Shield,
    color: "text-blue-400",
    tactics: [
      { t: "Executive Command Dashboard", d: "Global real-time view: revenue by country/city, deal velocity heatmap, risk alerts, autonomous action log. Manual override capability for all automated decisions." },
      { t: "AI Decision Audit Trail", d: "Every automated action logged with: trigger signal, confidence score, expected outcome, actual outcome. Monthly AI performance review by executive team." },
      { t: "Ethical Intelligence Principles", d: "No discriminatory pricing recommendations. Fair lead distribution. Transparent scoring methodologies. Annual third-party AI ethics audit." },
      { t: "Human-in-the-Loop Escalation", d: "Automated actions above defined thresholds require human approval: campaigns > $50K, market exits, partnership changes, pricing model adjustments." },
    ],
  },
];

/* ── SECTION 3: Founder Category Creator Legacy ──────────────────────── */
const legacyPillars = [
  {
    pillar: "Category Creation Vision",
    icon: Crown,
    color: "text-amber-400",
    items: [
      "Define new category: 'Real Estate Intelligence Infrastructure (REII)' — distinct from marketplaces, data vendors, and brokerages",
      "Introduce proprietary lexicon: 'Liquidity Synchronization', 'Capital Velocity Optimization', 'Transaction Intelligence Quotient'",
      "Publish category-defining manifesto: 'Why Property Markets Need an Operating System' — distributed to 10,000+ industry stakeholders",
      "Establish annual 'REII Summit' — the Davos of property intelligence, convening institutional investors, developers, and policymakers",
      "Commission academic research partnerships validating platform's impact on market efficiency and capital allocation optimization",
    ],
    scripts: {
      id: `CATEGORY CREATION MANIFESTO:

"MENGAPA PASAR PROPERTI MEMBUTUHKAN OPERATING SYSTEM

Pasar properti global senilai $326 triliun adalah kelas aset terbesar di dunia — namun beroperasi dengan infrastruktur transaksi yang masih tertinggal beberapa dekade.

🔴 Masalah Sistemik:
• Asimetri informasi menciptakan inefisiensi $50B+/tahun
• Siklus transaksi rata-rata 45+ hari — vs 3 detik di pasar saham
• Modal terkonsentrasi karena kurangnya transparansi likuiditas
• Investor membuat keputusan berdasarkan data fragmentaris

🟢 Solusi REII (Real Estate Intelligence Infrastructure):
Astra PropTech membangun lapisan intelijen transaksi yang:
• Menyinkronkan sinyal likuiditas secara real-time di [X] kota, [Y] negara
• Mengurangi siklus transaksi 60% melalui koordinasi otomatis
• Mendemokratisasi akses ke intelijen investasi kelas institusional
• Mengoptimalkan alokasi modal melalui pemetaan peluang prediktif

📊 Dampak Terukur:
• $[X]B+ modal dikoordinasikan melalui platform
• [Y]K+ transaksi difasilitasi
• [Z]% peningkatan efisiensi alokasi modal untuk pengguna institusional

Ini bukan marketplace. Ini adalah infrastruktur ekonomi digital untuk properti.

— [Nama Founder], Founder & CEO, Astra PropTech"`,
      en: `CATEGORY CREATION MANIFESTO:

"WHY PROPERTY MARKETS NEED AN OPERATING SYSTEM

The $326 trillion global property market is the world's largest asset class — yet operates on transaction infrastructure that lags decades behind.

🔴 Systemic Problems:
• Information asymmetry creates $50B+/year in inefficiency
• Average transaction cycle: 45+ days — vs 3 seconds in equity markets
• Capital concentrated due to lack of liquidity transparency
• Investors making decisions on fragmented data

🟢 The REII Solution (Real Estate Intelligence Infrastructure):
Astra PropTech builds the transaction intelligence layer that:
• Synchronizes liquidity signals in real-time across [X] cities, [Y] countries
• Reduces transaction cycles 60% through autonomous coordination
• Democratizes access to institutional-grade investment intelligence
• Optimizes capital allocation through predictive opportunity mapping

📊 Measurable Impact:
• $[X]B+ capital coordinated through platform
• [Y]K+ transactions facilitated
• [Z]% improvement in capital allocation efficiency for institutional users

This is not a marketplace. This is digital economic infrastructure for property.

— [Founder Name], Founder & CEO, Astra PropTech"`,
    },
  },
  {
    pillar: "Leadership Journey Architecture",
    icon: Landmark,
    color: "text-emerald-400",
    items: [
      "Document the origin story: 'From first 10 deals in one Jakarta district to coordinating billions in global property capital'",
      "Milestone narratives: each growth phase documented with challenges overcome, decisions made, and lessons learned",
      "Resilience storytelling: 'How we survived market downturns, competitive attacks, and scaling crises while maintaining our mission'",
      "Ethical technology stewardship: 'We chose transparency over opacity, fair access over exclusive deals, long-term trust over short-term profit'",
      "Succession planning narrative: 'Building an institution that outlasts any individual — governance structures ensuring mission continuity'",
    ],
    scripts: {
      id: `FOUNDER KEYNOTE — PERJALANAN KATEGORI CREATOR:

"10 tahun lalu, saya memulai dengan satu pertanyaan sederhana:

'Mengapa membeli properti masih sesulit ini di era digital?'

📍 Fase 1: Survival (Tahun 1–2)
Dari 10 deal pertama di satu distrik Jakarta. Setiap transaksi adalah pelajaran. Setiap kegagalan adalah data.

📍 Fase 2: Traction (Tahun 2–4)
1,000 deal. 10 kota. Tim dari 5 menjadi 50. Kami mulai melihat pola yang tidak terlihat orang lain.

📍 Fase 3: Intelligence (Tahun 4–6)
Kami berhenti menjadi marketplace. Kami menjadi infrastruktur intelijen. Data kami mulai memprediksi pasar, bukan hanya mencerminkannya.

📍 Fase 4: Global Scale (Tahun 6–10)
[X] negara. $[Y]B modal dikoordinasikan. Kami tidak hanya mengikuti pasar — kami membentuknya.

Pelajaran terbesar: Kategori baru tidak ditemukan. Mereka dibangun — satu transaksi pada satu waktu, satu pasar pada satu waktu.

Kami tidak membangun perusahaan. Kami membangun infrastruktur ekonomi.

— [Nama Founder]"`,
      en: `FOUNDER KEYNOTE — CATEGORY CREATOR JOURNEY:

"10 years ago, I started with one simple question:

'Why is buying property still this difficult in the digital age?'

📍 Phase 1: Survival (Year 1–2)
From the first 10 deals in one Jakarta district. Every transaction was a lesson. Every failure was data.

📍 Phase 2: Traction (Year 2–4)
1,000 deals. 10 cities. Team from 5 to 50. We started seeing patterns no one else could see.

📍 Phase 3: Intelligence (Year 4–6)
We stopped being a marketplace. We became intelligence infrastructure. Our data started predicting markets, not just reflecting them.

📍 Phase 4: Global Scale (Year 6–10)
[X] countries. $[Y]B capital coordinated. We didn't just follow markets — we shaped them.

The biggest lesson: New categories aren't discovered. They're built — one transaction at a time, one market at a time.

We're not building a company. We're building economic infrastructure.

— [Founder Name]"`,
    },
  },
  {
    pillar: "Ecosystem Influence & Cultural Impact",
    icon: TrendingUp,
    color: "text-blue-400",
    items: [
      "Inspire open-source property data standards — contribute to industry-wide transparency improvements",
      "Shape policy dialogue: advise governments on digital property market regulation and housing affordability intelligence",
      "Establish 'Astra Fellowship' — annual grants for PropTech innovation, academic research, and emerging market inclusion projects",
      "Cultural narrative: 'Technology should make markets fairer, not just faster — our commitment to inclusive access and ethical AI'",
      "Measurable societal outcomes: track and publish impact on transaction costs, market transparency, and investment accessibility",
    ],
    scripts: {
      id: `DAMPAK EKOSISTEM — LAPORAN TAHUNAN:

"📊 Laporan Dampak Ekosistem Astra PropTech — [Tahun]

🌐 Skala Infrastruktur:
• [X] kota, [Y] negara tersinkronisasi
• $[Z]B+ modal properti dikoordinasikan
• [N]K+ transaksi difasilitasi

💰 Dampak Ekonomi:
• Biaya transaksi rata-rata turun [A]%
• Siklus transaksi berkurang dari [B] hari menjadi [C] hari
• Asimetri informasi berkurang [D]% (diukur melalui bid-ask spread)

🤝 Dampak Sosial:
• [E]K+ investor ritel mendapat akses ke intelijen kelas institusional
• [F]+ proyek perumahan terjangkau dipromosikan melalui platform
• [G] beasiswa Astra Fellowship diberikan

🌱 Keberlanjutan:
• [H]% listing menyertakan sertifikasi green building
• Carbon footprint tracking tersedia untuk [I]% portfolio institusional
• Partnership dengan [J] lembaga riset untuk transparansi pasar"`,
      en: `ECOSYSTEM IMPACT — ANNUAL REPORT:

"📊 Astra PropTech Ecosystem Impact Report — [Year]

🌐 Infrastructure Scale:
• [X] cities, [Y] countries synchronized
• $[Z]B+ property capital coordinated
• [N]K+ transactions facilitated

💰 Economic Impact:
• Average transaction costs reduced [A]%
• Transaction cycles shortened from [B] days to [C] days
• Information asymmetry reduced [D]% (measured via bid-ask spread)

🤝 Social Impact:
• [E]K+ retail investors gained access to institutional-grade intelligence
• [F]+ affordable housing projects promoted through platform
• [G] Astra Fellowship scholarships awarded

🌱 Sustainability:
• [H]% of listings include green building certification
• Carbon footprint tracking available for [I]% of institutional portfolios
• Partnership with [J] research institutions for market transparency"`,
    },
  },
];

/* ── SECTION 4: Multi-Decade Checklist ───────────────────────────────── */
const checklist = [
  { category: "Decacorn Scale Trajectory", items: [
    "ARR exceeding $120M+ with > 80% YoY growth sustained for 3+ years",
    "Active operations in 5+ countries with balanced revenue diversification",
    "Institutional capital volume influenced exceeding $5B+ annually",
    "50+ enterprise intelligence product clients with > 85% annual retention",
    "Cross-border transactions contributing > 25% of total deal volume",
  ]},
  { category: "Autonomous Intelligence OS Maturity", items: [
    "Automation-driven revenue contribution exceeding 30% of total revenue",
    "Predictive deal probability accuracy > 80% for top-tier forecasts",
    "Signal-to-action latency < 60 seconds for high-priority triggers",
    "AI decision audit trail 100% complete with monthly executive review",
    "Self-healing operations resolving > 70% of anomalies without human intervention",
  ]},
  { category: "Category Creator Legacy Indicators", items: [
    "'REII' terminology adopted by 5+ industry analysts and media outlets",
    "Annual REII Summit attracting 1,000+ attendees from 20+ countries",
    "Founder recognized in global PropTech/FinTech leadership rankings",
    "Academic research partnerships publishing 3+ papers annually citing platform data",
    "Government advisory engagements in 3+ countries on digital property market policy",
  ]},
  { category: "Long-Term Governance & Sustainability", items: [
    "Independent board majority with relevant industry expertise",
    "ESG reporting integrated into quarterly investor communications",
    "Succession planning documented and board-approved",
    "Crisis response protocols tested annually with tabletop exercises",
    "Data governance framework externally audited and certified annually",
  ]},
];

/* ── SECTION 5: Risks ─────────────────────────────────────────────────── */
const risks = [
  { risk: "Continental Over-Expansion", signal: "3+ international markets failing to reach positive contribution margin within 18 months. Total burn rate exceeding 2x revenue growth.", mitigation: "Enforce strict stage-gate expansion protocol. Exit underperforming markets decisively. Consolidate to profitable core before attempting further expansion. Maintain 24+ months runway." },
  { risk: "Autonomous System Failure Cascade", signal: "Automated decisions generating > 5% error rate. False-positive campaign triggers wasting > $100K/quarter. Agent or buyer trust declining due to AI actions.", mitigation: "Tighten confidence thresholds for automated actions. Increase human-in-the-loop for high-impact decisions. Implement circuit breakers halting automation when error rates spike. Transparent communication with affected users." },
  { risk: "Category Narrative-Execution Disconnect", signal: "Investor or analyst skepticism about 'REII' positioning. Competitor successfully positioning with simpler messaging. Media coverage declining despite PR investment.", mitigation: "Ground all narrative claims in quantified impact data. Simplify messaging for broader audiences. Focus on demonstrable outcomes over aspirational terminology. Let results speak before labels." },
  { risk: "Institutional Dependency Risk", signal: "Single institutional client contributing > 15% of revenue. Enterprise product roadmap driven by 2–3 large clients rather than market needs.", mitigation: "Diversify institutional client base aggressively. Maintain product roadmap independence. Set maximum revenue concentration limits per client (< 8%). Build self-serve enterprise products reducing dependency." },
  { risk: "Founder Transition Vulnerability", signal: "Platform brand and investor confidence disproportionately tied to founder presence. No clear succession pathway documented.", mitigation: "Build institutional brand alongside personal brand. Develop strong C-suite bench. Document succession plan with board approval. Gradually increase public visibility of leadership team beyond founder." },
];

/* ── MAIN ──────────────────────────────────────────────────────────────── */
const DecacornIntelligenceOSLegacy = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-7 w-7 text-primary" /> Decacorn Simulation + Intelligence OS + Category Creator Legacy
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Decacorn-trajectory blueprint — continental scale simulation, autonomous marketplace OS & founder legacy narrative</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="simulation" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="simulation"><Globe className="h-4 w-4 mr-1" />Decacorn Sim</TabsTrigger>
          <TabsTrigger value="os"><Cpu className="h-4 w-4 mr-1" />Intelligence OS</TabsTrigger>
          <TabsTrigger value="legacy"><Crown className="h-4 w-4 mr-1" />Legacy</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* TAB 1: Decacorn Simulation */}
        <TabsContent value="simulation" className="space-y-4">
          {simPhases.map((p, i) => (
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
              <p className="font-semibold text-sm text-foreground">Decacorn Trajectory Milestones</p>
              {[
                { label: "Continental Expansion (Year 1–3)", pct: 25 },
                { label: "Monetization Evolution (Year 2–5)", pct: 50 },
                { label: "Moat Stress-Testing (Year 3–7)", pct: 75 },
                { label: "Decacorn Valuation ($10B+)", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.label}</span><span>{m.pct}%</span></div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Intelligence OS */}
        <TabsContent value="os" className="space-y-4">
          {osPillars.map((p, i) => (
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
              <p className="font-semibold text-sm text-foreground mb-2">Intelligence OS KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { label: "Auto-revenue ratio", target: "> 30%" },
                  { label: "Prediction accuracy", target: "> 80%" },
                  { label: "Signal latency", target: "< 60s" },
                  { label: "Self-healing rate", target: "> 70%" },
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

        {/* TAB 3: Legacy */}
        <TabsContent value="legacy" className="space-y-4">
          {legacyPillars.map((p, i) => (
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

export default DecacornIntelligenceOSLegacy;
