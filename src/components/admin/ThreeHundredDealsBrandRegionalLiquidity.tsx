import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Layers, Award, Map, CheckCircle, AlertTriangle, Shield,
  TrendingUp, Target, Copy, Eye, Users, MessageSquare, Zap, BarChart3
} from "lucide-react";
import { toast } from "sonner";

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

/* ── SECTION 1: 300 Deals Scaling Engine ──────────────────────────────── */
const scalingPhases = [
  {
    phase: "Phase 1 — Pipeline Volume Expansion (Deals 1–100)",
    weeks: "Month 1–3",
    color: "text-amber-400",
    tactics: [
      { t: "Rolling Hot-50 Shortlist", d: "Maintain a daily-updated list of 50 highest-probability listings ranked by inquiry volume, viewing density & price competitiveness." },
      { t: "Dense Viewing Clusters", d: "Schedule 8+ viewings per hot listing per week. Create visible demand pressure that accelerates buyer decisions." },
      { t: "Early Negotiation Initiation", d: "After 2nd viewing, proactively open soft-offer conversation. Don't wait for buyer to initiate." },
      { t: "Agent Focus Zone Assignment", d: "Assign each agent to 1–2 districts max. Deep expertise > thin spread." },
    ],
    kpis: ["15–20 deals/month", "Inquiry-to-viewing > 35%", "50+ active pipeline prospects"],
  },
  {
    phase: "Phase 2 — Conversion Discipline (Deals 101–200)",
    weeks: "Month 4–6",
    color: "text-emerald-400",
    tactics: [
      { t: "Deal-Stage Dashboard", d: "Visual kanban tracking every deal through 7 stages: Inquiry → Viewing → Interest → Negotiation → Offer → Agreement → Closed." },
      { t: "48-Hour Stall Intervention", d: "Any deal inactive > 48hrs triggers escalation. Founder or senior agent takes over negotiation." },
      { t: "Urgency Signal Deployment", d: "Share real viewing counts and competing interest data with hesitant buyers. 'This property had 6 viewings this week.'" },
      { t: "Seller Response Acceleration", d: "Coach sellers to respond to offers within 24 hours. Provide market data supporting price alignment." },
    ],
    kpis: ["25–30 deals/month", "Viewing-to-offer > 30%", "Negotiation cycle < 7 days"],
  },
  {
    phase: "Phase 3 — Closing Consistency (Deals 201–300)",
    weeks: "Month 7–9",
    color: "text-blue-400",
    tactics: [
      { t: "Standardized Closing Checklist", d: "Every deal follows identical 10-step closing process. No improvisation — system execution." },
      { t: "District Expansion Trigger", d: "When a district hits 30+ closed deals, replicate playbook in adjacent high-demand area." },
      { t: "Weekly Closure Sprint", d: "Dedicated 'closing day' each Friday — all agents focus on pushing near-close deals over the line." },
      { t: "Pipeline Depth Guarantee", d: "Maintain minimum 3:1 pipeline ratio — 900 active prospects feeding 300 closures." },
    ],
    kpis: ["30–35 deals/month", "Pipeline ratio ≥ 3:1", "Closure consistency > 85% of target"],
  },
];

/* ── SECTION 2: Brand Authority ───────────────────────────────────────── */
const brandPillars = [
  {
    pillar: "Transaction Proof Visibility",
    icon: BarChart3,
    color: "text-emerald-400",
    tactics: [
      { t: "Milestone Celebration Campaigns", d: "At Deals #50, #100, #200, #300 — run major social media and community announcements." },
      { t: "District Activity Reports", d: "Weekly 'Most Active Districts' report showing viewing counts, deal closures, price trends." },
      { t: "Real-Time Activity Feed", d: "Display live marketplace momentum: 'X viewings today', 'Y deals this week' on platform." },
      { t: "Deal Counter Badge", d: "Prominent '300+ Deals Closed' credibility badge on all marketing materials." },
    ],
    scripts: {
      id: `POST MILESTONE MEDIA:

"🏆 MILESTONE: 100 Deal Berhasil Ditutup via Astra!

Dalam [X] bulan, platform kami telah membantu:
✅ 100+ transaksi properti berhasil
🏠 [Y] district aktif
👥 [Z] agent partner terpercaya

Terima kasih kepada semua buyer, seller, dan agent yang telah percaya. Perjalanan menuju 300 deal dimulai sekarang! 🚀

#AstraPropTech #PropertyIndonesia #100Deals"`,
      en: `MILESTONE MEDIA POST:

"🏆 MILESTONE: 100 Deals Successfully Closed via Astra!

In [X] months, our platform has facilitated:
✅ 100+ successful property transactions
🏠 [Y] active districts
👥 [Z] trusted agent partners

Thank you to all buyers, sellers, and agents who trusted us. The journey to 300 deals starts now! 🚀

#AstraPropTech #PropertyIndonesia #100Deals"`,
    },
  },
  {
    pillar: "Trust Signaling Campaigns",
    icon: Shield,
    color: "text-amber-400",
    tactics: [
      { t: "Agent & Buyer Testimonials", d: "Collect video/text testimonials after every 10th deal. Feature on landing pages and social." },
      { t: "Speed-to-Deal Metrics", d: "Publish average time from first inquiry to closed deal. 'Average buyer finds their property in 21 days.'" },
      { t: "Verified Platform Badge", d: "Introduce 'Astra Verified Agent' and 'Astra Verified Listing' quality marks." },
      { t: "Responsive Support Proof", d: "Share average response time metrics. 'We respond to every inquiry within 2 hours.'" },
    ],
    scripts: {
      id: `TESTIMONIAL REQUEST TEMPLATE:

"Halo [Nama], selamat atas deal properti Anda! 🎉

Kami ingin menampilkan pengalaman Anda di platform kami. Boleh minta 2–3 kalimat tentang:
• Apa yang membuat Anda memilih Astra?
• Bagaimana pengalaman proses transaksinya?

Testimoni Anda sangat berarti untuk membantu buyer lain. Terima kasih! 🙏"`,
      en: `TESTIMONIAL REQUEST TEMPLATE:

"Hi [Name], congratulations on your property deal! 🎉

We'd love to feature your experience on our platform. Could you share 2–3 sentences about:
• What made you choose Astra?
• How was the transaction experience?

Your testimonial really helps other buyers. Thank you! 🙏"`,
    },
  },
  {
    pillar: "Thought Leadership Activation",
    icon: Award,
    color: "text-blue-400",
    tactics: [
      { t: "District Opportunity Reports", d: "Monthly deep-dive reports on top 5 districts — pricing trends, demand signals, investment potential." },
      { t: "Influencer Viewing Collaborations", d: "Invite local property influencers to exclusive viewing events. Co-create content." },
      { t: "Market Insight Newsletter", d: "Weekly email to all registered users: 'This Week in Property — Top Opportunities & Market Moves.'" },
      { t: "Media Placement Strategy", d: "Pitch founder interviews to property and business media. Focus on data-driven market insights." },
    ],
    scripts: {
      id: `NEWSLETTER INTRO TEMPLATE:

"📊 Market Pulse Mingguan — Astra PropTech

Minggu ini di pasar properti:
🔥 District terpanas: [District] (+[X]% inquiry)
💰 Deal highlight: [Tipe properti] di [Lokasi] closed di [Harga]
📈 Trend: [Insight singkat tentang market]

Lihat listing terbaik minggu ini → [Link]"`,
      en: `NEWSLETTER INTRO TEMPLATE:

"📊 Weekly Market Pulse — Astra PropTech

This week in property:
🔥 Hottest district: [District] (+[X]% inquiries)
💰 Deal highlight: [Property type] in [Location] closed at [Price]
📈 Trend: [Brief market insight]

See this week's best listings → [Link]"`,
    },
  },
];

/* ── SECTION 3: Regional Liquidity Leadership ─────────────────────────── */
const regionalTactics = [
  {
    pillar: "Multi-District Supply Density",
    icon: Layers,
    color: "text-emerald-400",
    actions: [
      "Identify top 5 districts by inquiry volume — ensure ≥ 30 active listings per district",
      "Onboard 2–3 anchor agencies per expansion district before marketing push",
      "Balance listings across price tiers: 40% affordable, 35% mid-range, 25% premium",
      "Run 'Listing Blitz Week' in new districts — goal: 50+ listings in 7 days",
    ],
  },
  {
    pillar: "Cross-District Demand Routing",
    icon: Map,
    color: "text-amber-400",
    actions: [
      "Guide buyers searching in saturated districts toward nearby opportunity zones",
      "Publish 'District Comparison Guide' — price, demand level, investment potential side-by-side",
      "Run localized campaigns: 'Discover [District] — the next hotspot with 20% lower prices'",
      "Activate push notifications for watchlist buyers when hot listings appear in adjacent areas",
    ],
  },
  {
    pillar: "Momentum Signaling & Perception",
    icon: TrendingUp,
    color: "text-blue-400",
    actions: [
      "Display district activity heatmap showing viewing and deal density",
      "Publish 'Fastest Closing Districts' leaderboard monthly",
      "Reinforce narrative: 'Astra is the most active marketplace in [Region]'",
      "Share cumulative deal counter and growth trajectory charts publicly",
    ],
  },
];

/* ── SECTION 4: Monthly Checklist ─────────────────────────────────────── */
const monthlyChecklist = [
  { category: "Deal Pipeline & Velocity", items: [
    "Review monthly deal count vs growth trajectory target",
    "Analyze conversion rates at each pipeline stage",
    "Identify top 20 highest-probability deals for priority push",
    "Measure average negotiation cycle duration — target < 7 days",
    "Track weekly closure consistency vs monthly target",
  ]},
  { category: "Brand Authority & Trust", items: [
    "Collect and publish 2+ new testimonials",
    "Release district opportunity report or market insight content",
    "Measure brand search trend growth (Google Trends)",
    "Track inbound partnership and listing requests",
    "Post milestone achievement if applicable",
  ]},
  { category: "Regional Liquidity", items: [
    "Review listings density per priority district",
    "Compare inquiry velocity across expansion zones",
    "Measure time-to-first-deal in new districts",
    "Assess cross-district demand routing effectiveness",
    "Plan next month's expansion district priorities",
  ]},
  { category: "Ecosystem & Revenue", items: [
    "Track active agent count and retention rate",
    "Review revenue per closed deal trend",
    "Measure premium listing upgrade conversion",
    "Assess referral-sourced inquiry percentage",
    "Evaluate overall flywheel health — accelerating or decelerating?",
  ]},
];

/* ── SECTION 5: Risk Indicators ───────────────────────────────────────── */
const risks = [
  { risk: "Scale Fragmentation", signal: "Deal growth spread too thin across many districts without depth in any", mitigation: "Re-concentrate supply in top 3–5 districts. Achieve density dominance before expanding further. Quality over breadth." },
  { risk: "Trust Plateau", signal: "Brand search growth stalls, inbound listing requests flat for 4+ weeks", mitigation: "Launch aggressive testimonial and success story campaign. Increase media placement frequency. Partner with influencers." },
  { risk: "Conversion Rate Decay", signal: "Viewing-to-offer ratio drops below 20% as volume scales", mitigation: "Audit listing quality. Retrain agents on negotiation confidence scripts. Improve buyer matching accuracy." },
  { risk: "Agent Capacity Overload", signal: "Top agents handling 30+ active listings with declining response speed", mitigation: "Redistribute pipeline load. Onboard additional agents in high-volume zones. Introduce agent specialization by price tier." },
  { risk: "Regional Liquidity Imbalance", signal: "Strong demand in districts with low inventory, or oversupply in low-demand areas", mitigation: "Run targeted vendor acquisition campaigns in supply-gap districts. Redirect marketing spend to high-inventory zones." },
];

/* ── MAIN COMPONENT ───────────────────────────────────────────────────── */
const ThreeHundredDealsBrandRegionalLiquidity = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-7 w-7 text-primary" /> 300 Deals Scale + Brand Authority + Regional Liquidity
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Regional scaling blueprint — transaction consistency, market credibility & multi-district leadership</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="deals"><Target className="h-4 w-4 mr-1" />300 Deals</TabsTrigger>
          <TabsTrigger value="brand"><Award className="h-4 w-4 mr-1" />Brand</TabsTrigger>
          <TabsTrigger value="regional"><Map className="h-4 w-4 mr-1" />Regional</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* TAB 1: 300 Deals */}
        <TabsContent value="deals" className="space-y-4">
          {scalingPhases.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className={`h-5 w-5 ${p.color}`} /> {p.phase}
                    </CardTitle>
                    <Badge variant="outline">{p.weeks}</Badge>
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
              <p className="font-semibold text-sm text-foreground">Deal Milestone Tracker</p>
              {[
                { label: "Pipeline Volume (1–100)", pct: 33 },
                { label: "Conversion Discipline (101–200)", pct: 67 },
                { label: "Closing Consistency (201–300)", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.label}</span><span>{m.pct}%</span></div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Brand Authority */}
        <TabsContent value="brand" className="space-y-4">
          {brandPillars.map((p, i) => (
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
                    <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Script Template</p>
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
              <p className="font-semibold text-sm text-foreground mb-2">Brand Authority KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Brand search growth", target: "+50% quarterly" },
                  { label: "Inbound listing requests", target: "+20 per month" },
                  { label: "Trust sentiment", target: "> 85% positive" },
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

        {/* TAB 3: Regional Liquidity */}
        <TabsContent value="regional" className="space-y-4">
          {regionalTactics.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <p.icon className={`h-5 w-5 ${p.color}`} /> {p.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {p.actions.map((a, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{a}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Regional Liquidity KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Listings per priority district", target: "≥ 30 active" },
                  { label: "Inquiry velocity leadership", target: "#1 in region" },
                  { label: "Time to first deal (new zone)", target: "< 30 days" },
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
          {monthlyChecklist.map((c, i) => (
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

export default ThreeHundredDealsBrandRegionalLiquidity;
