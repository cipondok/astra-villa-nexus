
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, MapPinPlus, Megaphone, AlertTriangle, ClipboardCheck, Copy, Check, Target, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const CopyBlock = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="text-xs bg-muted/50 border border-border/40 rounded-lg p-3 whitespace-pre-wrap font-mono">{text}</pre>
      <Button size="sm" variant="ghost" className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied'); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

const decisionDeadline = {
  timeline: [
    { phase: 'Post-Viewing (0–24hrs)', window: 'Golden Window', actions: ['Same-day follow-up call within 4hrs', 'Send property summary + comparable data', 'Ask direct: "Apakah properti ini masuk shortlist Anda?"'], urgencyLevel: 'Critical', conversionProbability: '45%' },
    { phase: 'Decision Phase (24–72hrs)', window: 'Action Window', actions: ['Send "next steps" guide (offer, financing, second viewing)', 'Share demand signal: "[X] buyer lain juga interested"', 'Offer second viewing slot within 48hrs'], urgencyLevel: 'High', conversionProbability: '30%' },
    { phase: 'Commitment Push (72hrs–7 days)', window: 'Closing Window', actions: ['Pricing comparison showing market movement', 'Financing readiness check-in', 'Gentle deadline: "Seller reviewing offers end of week"'], urgencyLevel: 'Medium', conversionProbability: '18%' },
    { phase: 'Extension (7–14 days)', window: 'Recovery Window', actions: ['Alternative property suggestions', 'Market insight: "Harga area naik [X]% bulan ini"', 'Final opportunity framing before listing refresh'], urgencyLevel: 'Low', conversionProbability: '8%' },
  ],
  scripts: [
    { scenario: 'Same-Day Post-Viewing Follow-Up', template: `Hai [Name]! 👋

Terima kasih sudah viewing [Property Name] hari ini.

📊 Quick Summary:
• Harga: Rp [Price] (📉 [X]% di bawah avg area)
• Kondisi: [Key highlights]
• Demand: [Y] buyer lain juga tertarik

🤔 Bagaimana kesan Anda?

Langkah selanjutnya yang bisa kita bantu:
1️⃣ Jadwalkan second viewing → [link]
2️⃣ Diskusi penawaran → [link]
3️⃣ Cek kelayakan KPR → [link]
4️⃣ Lihat properti serupa → [link]

⏰ Tips: Buyer yang submit offer dalam 48 jam setelah viewing punya success rate 3x lebih tinggi.

Best regards,
[Agent Name] | ASTRA Villa`, channel: 'WhatsApp (within 4hrs)' },
    { scenario: '72-Hour Decision Nudge', template: `Hai [Name],

Update untuk [Property Name]:

📊 Sejak viewing Anda:
• [X] inquiry baru masuk
• [Y] viewing request baru
• Listing sudah [Z] hari di market

💡 Data kami menunjukkan properti dengan demand level ini biasanya terjual dalam [W] hari.

Apakah Anda ingin:
□ Submit penawaran? → Kami bantu prepare
□ Second viewing? → Slot tersedia [Date/Time]
□ Konsultasi financing? → Free assessment
□ Masih mempertimbangkan? → Kami kirim update jika ada perubahan harga

👉 Reply angka 1-4 untuk next step.`, channel: 'WhatsApp' },
    { scenario: 'Ethical Scarcity Signal', template: `📊 MARKET UPDATE — [Property Name]

Hai [Name],

Sebagai transparansi, berikut update real-time:

🏠 Status Properti:
• Total views: [X] (minggu ini)
• Inquiry aktif: [Y] buyer
• Viewing scheduled: [Z] orang
• Status: Masih tersedia ✅

📈 Konteks Pasar [District]:
• Avg days-on-market: [W] hari
• Properti serupa bulan lalu: terjual dalam [V] hari
• Trend harga: [up/stable] [X]%

⚠️ Kami tidak ingin Anda terburu-buru — tapi kami ingin Anda punya informasi lengkap untuk keputusan terbaik.

Siap diskusi? [Agent phone]`, channel: 'WhatsApp / Email' },
  ],
  commitmentTools: [
    { tool: 'Soft Reservation Option', description: 'Allow buyer to "express interest" without full offer — signals intent to seller', benefit: 'Reduces commitment anxiety while creating momentum' },
    { tool: 'Offer Preparation Checklist', description: 'Step-by-step guide: budget confirmation → financing check → offer letter draft', benefit: 'Breaks intimidating decision into manageable steps' },
    { tool: 'Comparable Deal Report', description: 'Auto-generated report showing recent transactions in same area/category', benefit: 'Validates pricing and reduces uncertainty' },
    { tool: 'Decision Confidence Score', description: 'Simple assessment: budget fit + location match + timing readiness = confidence %', benefit: 'Helps buyer self-qualify and feel prepared' },
  ],
  kpis: [
    { metric: 'Viewing-to-Offer Cycle', target: '≤5 days avg', current: '14 days' },
    { metric: 'Response Rate to Deadline Nudges', target: '≥50%', current: '22%' },
    { metric: 'Offer Submission Frequency', target: '+60% increase', current: 'Baseline' },
    { metric: 'Decision Confidence Score Completion', target: '≥30% of viewed buyers', current: '0%' },
  ],
};

const multiDistrict = {
  opportunityMapping: [
    { step: 'Identify Expansion Zones', logic: 'High inquiry + low listing density + adjacent to agent\'s current coverage', dataPoints: ['Inquiry-to-listing ratio per district', 'Agent proximity and local knowledge', 'Price tier alignment with portfolio'], priority: 'Primary' },
    { step: 'Benchmark Performance Gaps', logic: 'Compare agent\'s districts vs platform average to show untapped potential', dataPoints: ['Revenue per listing by district', 'Inquiry velocity comparison', 'Competitor presence analysis'], priority: 'Supporting' },
    { step: 'Match Agent Expertise', logic: 'Suggest districts matching agent\'s successful property types and price ranges', dataPoints: ['Historical deal types and sizes', 'Client preference patterns', 'Agent specialization score'], priority: 'Personalization' },
  ],
  incentives: [
    { tier: 'Explorer', requirement: 'First 3 listings in a new district', reward: 'Free Premium Boost (7 days) for all new-district listings', duration: '30-day activation window' },
    { tier: 'Expander', requirement: '10+ listings across 3+ districts', reward: 'Featured Agent badge + priority lead routing in new zones', duration: 'Ongoing while active' },
    { tier: 'Territory Leader', requirement: '25+ listings across 5+ districts with ≥3 deals closed', reward: 'Exclusive territory insights + co-marketing campaigns + reduced commission rate', duration: 'Quarterly review' },
  ],
  outreachScripts: [
    { type: 'Expansion Opportunity Alert', template: `📍 PELUANG EKSPANSI — [New District]

Pak/Bu [Agent Name],

Berdasarkan performa luar biasa Anda di [Current District], kami lihat peluang di [New District]:

📊 Data Pasar [New District]:
• Inquiry aktif: [X]/minggu (🔴 HIGH)
• Listing tersedia: hanya [Y] unit
• Gap supply-demand: [Z] unit
• Avg harga: Rp [Avg] (cocok dengan portfolio Anda)

🏆 Kenapa Anda cocok:
• [X]% deal Anda di [Current District] mirip tipe properti yang dicari di [New District]
• Anda sudah punya [Y] client yang pernah cari di area sekitar
• Harga range Anda (Rp [Min]-[Max]) match dengan demand area

🎁 Incentive Ekspansi:
• FREE Premium Boost 7 hari untuk 3 listing pertama
• Priority lead routing ke Anda di [New District]
• Support onboarding: kami bantu riset harga area

👉 Mulai upload: [link]
📞 Diskusi strategi: [Phone]`, channel: 'WhatsApp + Email' },
    { type: 'Success Story Expansion', template: `🏆 INSPIRASI: Agen [Name] sukses ekspansi ke [X] district!

Sebelum: [Y] listing di 1 district → Rp [Revenue]/bulan
Setelah: [Z] listing di [W] districts → Rp [Revenue2]/bulan

📈 Peningkatan:
• Inquiry: +[X]%
• Deal closure: +[Y]%
• Revenue: +[Z]%

💬 "[Quote dari agent tentang pengalaman ekspansi]"

Tips dari [Name]:
1. Mulai dengan 3-5 listing di area baru
2. Fokus tipe properti yang sudah dikuasai
3. Manfaatkan data platform untuk pricing

👉 Mulai ekspansi Anda: [link]`, channel: 'Email newsletter' },
  ],
  kpis: [
    { metric: 'New District Listings per Agent', target: '≥5/month' },
    { metric: 'Vendor Geographic Coverage Growth', target: '+30% districts covered' },
    { metric: 'Inquiry Share from Expanded Zones', target: '≥20% of total' },
    { metric: 'Cross-District Deal Conversion', target: '≥6%' },
  ],
};

const categorySpotlight = {
  detectionSignals: [
    { signal: 'Search Filter Concentration', threshold: '≥35% of searches using same property type filter in 7 days', confidence: 88, actionTrigger: 'Auto-flag category for spotlight' },
    { signal: 'Inquiry Velocity by Type', threshold: '≥2x inquiry rate vs 30-day avg for category', confidence: 92, actionTrigger: 'Launch buyer campaign within 48hrs' },
    { signal: 'Viewing Concentration', threshold: '≥60% of viewings in district for same type', confidence: 85, actionTrigger: 'Activate vendor supply alert' },
    { signal: 'Saved Search Patterns', threshold: '≥50 active saved searches for same criteria', confidence: 80, actionTrigger: 'Create dedicated landing page' },
    { signal: 'Price Premium Willingness', threshold: 'Offers submitted ≥5% above listing price', confidence: 90, actionTrigger: 'Signal strong seller\'s market for category' },
  ],
  campaigns: [
    { type: 'Most Requested This Month', template: `🔥 PALING DICARI BULAN INI: [Category] di [District]

📊 Data Real-Time ASTRA Villa:
• [X] buyer aktif mencari [Category]
• Inquiry rate: [Y]x di atas rata-rata
• Hanya [Z] unit tersedia

🏠 Top [Category] Pilihan:

1️⃣ [Property] — Rp [Price]
   📍 [Location] | [Specs]
   🔥 [X] inquiry minggu ini
   
2️⃣ [Property] — Rp [Price]
   📍 [Location] | [Specs]
   ⭐ Baru listing — first mover advantage

3️⃣ [Property] — Rp [Price]
   📍 [Location] | [Specs]
   💰 Best value in category

💡 Insight: [Category] di [District] rata-rata terjual dalam [X] hari — lebih cepat dari kategori lain.

👉 Lihat semua [Category]: [link]
📊 Market report [Category]: [link]`, channel: 'Email + WhatsApp + Push', target: 'Buyers with matching preferences' },
    { type: 'Vendor Category Supply Drive', template: `📈 HIGH DEMAND ALERT: [Category]

Pak/Bu [Agent Name],

[Category] sedang sangat diminati di platform kami:

📊 Demand Data:
• [X] buyer aktif mencari
• Supply gap: [Y] unit dibutuhkan
• Avg inquiry per listing [Category]: [Z]x lebih tinggi dari rata-rata

💰 Keuntungan upload [Category] sekarang:
• Instant visibility ke [X] buyer aktif
• Estimasi waktu ke inquiry: <6 jam
• Premium placement di "[Category] Spotlight" page

🎁 Spotlight Bonus:
• FREE featured placement selama campaign (14 hari)
• Badge "High Demand Category" di listing
• Priority push notification ke matched buyers

Punya [Category] untuk dilist?
👉 Upload sekarang: [link]`, channel: 'WhatsApp + Dashboard', target: 'Agents with relevant inventory' },
    { type: 'Social Spotlight Content', template: `📊 CATEGORY SPOTLIGHT: [Category]

Kenapa [Category] jadi primadona di [District]?

📈 Trend Data:
• Harga naik [X]% dalam 6 bulan
• Demand meningkat [Y]% year-over-year
• Rata-rata ROI sewa: [Z]%/tahun

🏠 Yang membuat [Category] menarik:
• [Benefit 1 — e.g., "Layout modern cocok untuk keluarga muda"]
• [Benefit 2 — e.g., "Lokasi strategis dekat sekolah & mall"]
• [Benefit 3 — e.g., "Potensi apresiasi tinggi karena infrastruktur baru"]

🎯 Profil Buyer Ideal:
• [Demographic/psychographic description]
• Budget range: Rp [Min] – [Max]
• Motivasi: [Investment / Lifestyle / Both]

👉 Explore [Category]: [link]`, channel: 'Instagram + Blog + Facebook', target: 'General awareness' },
  ],
  kpis: [
    { metric: 'Inquiry Uplift for Spotlighted Category', target: '+50% within campaign period' },
    { metric: 'New Listings Matching Campaign Theme', target: '+25 within 2 weeks' },
    { metric: 'Category Content Engagement Rate', target: '≥40%' },
    { metric: 'Spotlight-to-Deal Conversion', target: '≥10%' },
    { metric: 'Landing Page Conversion Rate', target: '≥12%' },
  ],
};

const weeklyChecklist = [
  { category: 'Decision Urgency', items: ['Review avg viewing-to-offer cycle vs 5-day target', 'Audit deadline nudge delivery & response rates', 'Track offer submission frequency trend', 'Identify buyers stuck >7 days post-viewing'] },
  { category: 'Multi-District Supply', items: ['Review new listings in expansion districts', 'Check vendor geographic coverage growth', 'Monitor inquiry share from new zones', 'Follow up on expansion incentive redemptions'] },
  { category: 'Category Spotlight', items: ['Refresh category demand detection signals', 'Evaluate active campaign performance vs KPIs', 'Track vendor listing response to supply drives', 'Review landing page conversion rates'] },
  { category: 'Ecosystem Balance', items: ['Calculate supply-demand ratio by category and district', 'Review buyer decision confidence scores', 'Check vendor satisfaction with expansion support', 'Assess revenue impact from urgency & spotlight initiatives'] },
];

const risks = [
  { signal: 'Decision fatigue from excessive urgency messaging', severity: 87, mitigation: 'Cap urgency messages to 1/interaction cycle; use calm authority tone; provide genuine "no rush" option with market context' },
  { signal: 'Vendor over-expansion without quality maintenance', severity: 83, mitigation: 'Require minimum quality score before incentive payout; monitor listing quality in new districts; offer quality coaching' },
  { signal: 'Category spotlight creating artificial demand perception', severity: 89, mitigation: 'Use only verified data; show methodology; include confidence levels; add "data as of [date]" timestamps' },
  { signal: 'Cross-district listings diluting agent focus', severity: 78, mitigation: 'Recommend maximum 5 active districts per agent; track performance per district; suggest consolidation if conversion drops' },
  { signal: 'Buyer mistrust from perceived pressure tactics', severity: 91, mitigation: 'Always frame as information-sharing not pressure; provide easy opt-out; include "take your time" language alongside data' },
];

const BuyerDecisionDistrictBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Timer className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Buyer Decision Deadline + Multi-District Expansion + Category Spotlight</h2>
          <p className="text-sm text-muted-foreground">Urgency acceleration, territory scaling & demand-driven category campaigns</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="deadline" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="deadline"><Timer className="h-4 w-4 mr-1.5" />Decision Deadline</TabsTrigger>
        <TabsTrigger value="expansion"><MapPinPlus className="h-4 w-4 mr-1.5" />Multi-District</TabsTrigger>
        <TabsTrigger value="spotlight"><Megaphone className="h-4 w-4 mr-1.5" />Category Spotlight</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* DECISION DEADLINE TAB */}
      <TabsContent value="deadline" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Timer className="h-4 w-4 text-primary" />Post-Viewing Decision Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {decisionDeadline.timeline.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{t.phase}</span>
                    <div className="flex gap-1.5">
                      <Badge className={`text-[10px] ${t.urgencyLevel === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : t.urgencyLevel === 'High' ? 'bg-chart-3/10 text-chart-3 border-chart-3/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{t.urgencyLevel}</Badge>
                      <Badge variant="outline" className="text-[10px]">Conv: {t.conversionProbability}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-primary mb-1">⏰ {t.window}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.actions.map((a, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">▸ {a}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-3" />Commitment Tools</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {decisionDeadline.commitmentTools.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-foreground mb-0.5">{t.tool}</p>
                  <p className="text-[10px] text-muted-foreground mb-1">{t.description}</p>
                  <p className="text-[10px] text-primary">→ {t.benefit}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Decision KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {decisionDeadline.kpis.map((k, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{k.metric}</span><div className="flex gap-1.5"><Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge><Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {k.target}</Badge></div></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {decisionDeadline.scripts.map((s, i) => (
          <motion.div key={i} {...anim(i + 4)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{s.scenario}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{s.channel}</Badge>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={s.template} /></CardContent>
            </Card>
          </motion.div>
        ))}
      </TabsContent>

      {/* MULTI-DISTRICT TAB */}
      <TabsContent value="expansion" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MapPinPlus className="h-4 w-4 text-chart-3" />Expansion Opportunity Mapping</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {multiDistrict.opportunityMapping.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.step}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{s.priority}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">{s.logic}</p>
                  <div className="flex flex-wrap gap-1">
                    {s.dataPoints.map((d, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">📊 {d}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Expansion Incentive Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {multiDistrict.incentives.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{t.tier}</span>
                    <Badge variant="outline" className="text-[10px]">{t.duration}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Requirement: {t.requirement}</p>
                  <p className="text-[11px] text-primary mt-0.5">🎁 {t.reward}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Expansion KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {multiDistrict.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {multiDistrict.outreachScripts.map((s, i) => (
          <motion.div key={i} {...anim(i + 4)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{s.type}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{s.channel}</Badge>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={s.template} /></CardContent>
            </Card>
          </motion.div>
        ))}
      </TabsContent>

      {/* CATEGORY SPOTLIGHT TAB */}
      <TabsContent value="spotlight" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-destructive" />Category Demand Detection</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {categorySpotlight.detectionSignals.map((d, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{d.signal}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{d.confidence}%</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Threshold: {d.threshold}</p>
                  <p className="text-[10px] text-primary mt-0.5">→ {d.actionTrigger}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {categorySpotlight.campaigns.map((c, i) => (
          <motion.div key={i} {...anim(i + 2)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{c.type}</CardTitle>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                    <Badge className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/20">{c.target}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={c.template} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Spotlight Campaign KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {categorySpotlight.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* WEEKLY CHECK TAB */}
      <TabsContent value="weekly" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyChecklist.map((cat, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">{cat.category}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cat.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-4 w-4 rounded border border-border/60 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* RISKS TAB */}
      <TabsContent value="risks" className="space-y-4">
        {risks.map((r, i) => (
          <motion.div key={i} {...anim(i + 1)}>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${r.severity >= 85 ? 'text-destructive' : 'text-chart-3'}`} />
                    <span className="text-sm font-medium text-foreground">{r.signal}</span>
                  </div>
                  <Badge variant={r.severity >= 85 ? 'destructive' : 'outline'} className="text-[10px]">{r.severity}%</Badge>
                </div>
                <Progress value={r.severity} className="h-1.5 mb-2" />
                <p className="text-xs text-muted-foreground">⚡ {r.mitigation}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </TabsContent>
    </Tabs>
  </div>
);

export default BuyerDecisionDistrictBlueprint;
