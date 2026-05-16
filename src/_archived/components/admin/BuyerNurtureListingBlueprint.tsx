
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, BarChart3, TrendingUp, AlertTriangle, ClipboardCheck, Copy, Check, Target, Zap, Bell, Star, Flame } from 'lucide-react';
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

const nurture = {
  lifecycleSegments: [
    { segment: 'Active Searcher (0–14 days)', behavior: 'Browsing daily, submitting inquiries', strategy: 'High-frequency curated alerts + viewing push', cadence: 'Every 2–3 days', priority: 'Critical' },
    { segment: 'Considering (15–45 days)', behavior: 'Slowing down, comparing options', strategy: 'Weekly digest + price drop alerts + financing tips', cadence: 'Weekly', priority: 'High' },
    { segment: 'Hesitant (46–90 days)', behavior: 'Occasional visits, no new inquiries', strategy: 'Monthly market insights + success stories + event invites', cadence: 'Bi-weekly', priority: 'Medium' },
    { segment: 'Dormant (91–180 days)', behavior: 'No activity, still subscribed', strategy: 'Quarterly re-engagement campaign + "market has changed" messaging', cadence: 'Monthly', priority: 'Low' },
    { segment: 'Lapsed (180+ days)', behavior: 'No engagement at all', strategy: 'Final win-back sequence: "We miss you" + exclusive deal offer', cadence: 'One-time sequence', priority: 'Recovery' },
  ],
  automationFlows: [
    { flow: 'Monthly Curated Recommendations', channel: 'Email + WhatsApp', template: `🏠 Rekomendasi Properti Bulanan — [Month]

Hai [Name],

Berdasarkan preferensi Anda (🏡 [Type] di [District], budget Rp [Range]):

📊 Market Update:
• Harga rata-rata di [District]: Rp [Avg] (+[X]% vs bulan lalu)
• [Y] properti baru listing bulan ini
• Demand level: [🟡 MEDIUM / 🔴 HIGH]

🌟 Top 3 Pilihan Untuk Anda:

1️⃣ [Property] — Rp [Price]
   📍 [Location] | [Beds] KT [Baths] KM | LB [Area]m²
   💡 Kenapa cocok: [AI reasoning]

2️⃣ [Property] — Rp [Price]
   📍 [Location] | [Beds] KT [Baths] KM | LB [Area]m²
   💰 Harga turun [X]% dari listing awal

3️⃣ [Property] — Rp [Price]
   📍 [Location] | [Beds] KT [Baths] KM | LB [Area]m²
   ⭐ Baru listing — belum banyak yang tahu

📈 Insight: Buyer yang membeli di [District] tahun lalu sudah menikmati apresiasi [X]%.

👉 Lihat semua rekomendasi: [link]
📞 Konsultasi gratis: [Agent phone]`, frequency: 'Monthly (tanggal 1)' },
    { flow: 'Dormant Re-engagement Sequence', channel: 'WhatsApp → Email → Push', template: `👋 Hai [Name], lama tidak jumpa!

Sejak terakhir kali Anda mencari properti di ASTRA Villa, banyak yang berubah:

📊 Update Pasar [District]:
• [X] properti baru listing
• Harga bergerak [up/down] [Y]%
• [Z] deal berhasil ditutup bulan ini

🎁 Khusus untuk Anda:
• Akses eksklusif ke [X] listing belum dipublish
• Free consultation dengan top agent kami
• Priority viewing untuk properti pilihan

💬 "Saya melihat banyak buyer yang sempat ragu, akhirnya menemukan properti impian mereka setelah kembali aktif." — [Agent Name]

Masih mencari? Ceritakan update preferensi Anda:
👉 [link to preference update form]

Atau langsung chat: [WhatsApp link]`, frequency: 'Day 1, 7, 14 of re-engagement' },
    { flow: 'Success Story Inspiration', channel: 'Email + Social', template: `✅ KISAH SUKSES: [Buyer Name] menemukan rumah impian di [District]

🕐 Timeline pembelian:
• Mulai mencari: [Date]
• Properti dilihat: [X] unit
• Viewing dilakukan: [Y] kali
• Penawaran diajukan: [Z] kali
• DEAL CLOSED: [Date] ✅

💰 Detail transaksi:
• Tipe: [Property type]
• Harga akhir: Rp [Price]
• Negosiasi: [X]% di bawah listing price
• Proses dari offer ke closing: [Y] hari

💬 "[Testimonial quote dari buyer]"

🔑 Tips dari [Buyer Name]:
1. [Tip 1]
2. [Tip 2]
3. [Tip 3]

👉 Mulai perjalanan Anda: [link]`, frequency: 'Bi-weekly' },
  ],
  trustContent: [
    { type: 'Educational Series', topics: ['Cara negosiasi harga properti yang efektif', 'Checklist dokumen KPR lengkap', 'Tips survey properti sebelum beli', '5 kesalahan umum pembeli pertama'], format: 'Blog + Short video' },
    { type: 'Market Intelligence', topics: ['Tren harga bulanan per district', 'Area dengan potensi apresiasi tertinggi', 'Perbandingan ROI sewa vs jual', 'Analisis supply-demand lokal'], format: 'Infographic + Newsletter' },
    { type: 'Community Building', topics: ['Monthly property investment webinar', 'Exclusive open house events', 'Buyer networking meetups', 'Q&A sessions with agents'], format: 'Event + Live session' },
  ],
  kpis: [
    { metric: 'Reactivated Buyer Inquiry Rate', target: '≥15% of dormant leads', current: '3%' },
    { metric: 'Repeat Viewing from Nurtured Leads', target: '≥25%', current: '8%' },
    { metric: 'Long-Cycle Deal Conversion (>60 days)', target: '≥8%', current: '2%' },
    { metric: 'Nurture Email Open Rate', target: '≥35%', current: '18%' },
    { metric: 'WhatsApp Response Rate', target: '≥45%', current: '22%' },
  ],
};

const topListings = {
  enhancementChecklist: [
    { area: 'Headline & Title', actions: ['Lead with property type + key benefit (e.g., "Rumah Modern 3KT, View Gunung")', 'Include district name for search visibility', 'Use emotional triggers: "Siap Huni", "Langka", "Exclusive"'], impact: 'High', effort: 'Low' },
    { area: 'Hero Photo', actions: ['Use wide-angle exterior shot with good lighting', 'Ensure high resolution (min 1200px wide)', 'Show property in best condition — no clutter'], impact: 'Critical', effort: 'Medium' },
    { area: 'Photo Sequence', actions: ['Order: Exterior → Living → Master Bed → Kitchen → Bathroom → Garden/View', 'Minimum 8 photos per listing', 'Include floor plan or layout diagram'], impact: 'High', effort: 'Medium' },
    { area: 'Description Copy', actions: ['Lead with 3 strongest selling points as bullets', 'Include lifestyle angle: "5 menit ke mall", "area tenang"', 'End with clear CTA: "Jadwalkan viewing hari ini"'], impact: 'Medium', effort: 'Low' },
    { area: 'Pricing Position', actions: ['Show price vs area average comparison', 'Highlight value: "Rp X/m² — below market average"', 'Add flexibility signals: "Harga bisa nego"'], impact: 'High', effort: 'Low' },
    { area: 'Engagement Boosters', actions: ['Add 30-sec video walkthrough', 'Show nearby amenities with distance', 'Display demand indicators: "[X] orang melihat minggu ini"'], impact: 'Critical', effort: 'High' },
  ],
  performanceMonitoring: [
    { signal: 'Views high but 0 inquiries', diagnosis: 'Price too high or poor description', action: 'Suggest 5-10% price reduction or description rewrite' },
    { signal: 'Inquiries but 0 viewings', diagnosis: 'Response too slow or scheduling friction', action: 'Alert agent to respond <5min; offer scheduling assistance' },
    { signal: 'Viewings but 0 offers', diagnosis: 'Property doesn\'t match expectations', action: 'Improve photos accuracy; add video; adjust description tone' },
    { signal: 'Listing >30 days with declining views', diagnosis: 'Listing fatigue / market saturation', action: 'Refresh photos, update price, reposition headline' },
    { signal: 'High save rate but low inquiry', diagnosis: 'Buyer interest but not ready to commit', action: 'Send "saved property" reminder alerts; show price drop trigger' },
  ],
  refreshCadence: [
    { days: '0–7', action: 'Monitor initial traction; no changes needed if performing', checkpoints: 'Views, saves, inquiry count' },
    { days: '8–14', action: 'First optimization pass: adjust title if views low', checkpoints: 'View-to-inquiry conversion' },
    { days: '15–21', action: 'Photo refresh + description enhancement if inquiries below avg', checkpoints: 'Inquiry rate vs category avg' },
    { days: '22–30', action: 'Price adjustment recommendation if no offer received', checkpoints: 'Offer submissions, viewing feedback' },
    { days: '31+', action: 'Full listing refresh: new photos, repositioned price, premium boost offer', checkpoints: 'Complete performance reset' },
  ],
  kpis: [
    { metric: 'Inquiry per Listing (top quartile)', target: '≥5/week' },
    { metric: 'View-to-Inquiry Conversion', target: '≥8%' },
    { metric: 'Viewing Conversion from Inquiry', target: '≥40%' },
    { metric: 'Listing Engagement Time', target: '≥90 seconds avg' },
    { metric: 'Listing Refresh Compliance', target: '≥80% refreshed by day 21' },
  ],
};

const priceSurge = {
  detectionSignals: [
    { signal: 'Inquiry Velocity Spike', threshold: '≥2x normal inquiry rate in 7-day window', confidence: 91, leadTime: '5–10 days before price movement' },
    { signal: 'Transaction Cluster', threshold: '≥3 deals closed in same district within 14 days', confidence: 87, leadTime: '2–4 weeks of momentum' },
    { signal: 'Listing Absorption Rate', threshold: 'Active listings declining >15% while demand stable', confidence: 84, leadTime: '7–14 days before supply squeeze' },
    { signal: 'Search Volume Concentration', threshold: '≥40% of district searches in one property type', confidence: 78, leadTime: 'Early category demand signal' },
    { signal: 'Price Benchmark Shift', threshold: 'New listings pricing ≥5% above 30-day avg', confidence: 82, leadTime: 'Confirms upward pressure' },
  ],
  campaigns: [
    { type: 'Buyer Urgency Campaign', template: `📈 HARGA NAIK DI [DISTRICT]!

Data ASTRA Villa menunjukkan:
• Harga rata-rata naik [X]% dalam 30 hari
• [Y] deal sukses ditutup bulan ini
• Supply menurun [Z]% — listing makin langka

⏰ Window Kesempatan:
Buyer yang membeli sekarang masih bisa dapat harga [X]% di bawah proyeksi 3 bulan ke depan.

🏠 Top Opportunities Sekarang:
1️⃣ [Property] — Rp [Price] (📊 di bawah avg area)
2️⃣ [Property] — Rp [Price] (🆕 Baru listing)
3️⃣ [Property] — Rp [Price] (💰 Harga nego)

👉 Jadwalkan viewing sekarang: [link]
📊 Lihat trend harga lengkap: [link]`, channel: 'WhatsApp + Email + Push', timing: 'Within 48hrs of surge detection' },
    { type: 'Vendor Supply Activation', template: `🔥 DEMAND SURGE ALERT — [District]

Pak/Bu [Agent Name],

📊 Real-time data ASTRA Villa:
• Inquiry rate: [X]x di atas normal
• Buyer aktif mencari: [Y] orang
• Listing tersedia: hanya [Z] unit
• Harga area naik [W]% dalam 30 hari

💰 Ini artinya untuk Anda:
• Listing baru = instant exposure ke [Y] buyer aktif
• Estimasi waktu ke inquiry pertama: <12 jam
• Potensi harga jual di atas rata-rata market

🎁 Incentive khusus surge period:
• FREE Premium Boost 7 hari
• Priority placement di homepage
• Dedicated buyer matching

👉 Upload listing sekarang: [link]
📞 Bantuan upload: [Phone]`, channel: 'WhatsApp + Dashboard', timing: 'Immediately on surge detection' },
    { type: 'Social Proof Amplification', template: `📊 [DISTRICT] Market Report — [Month]

🔥 Sedang Trending:
• [X] properti terjual dalam [Y] hari rata-rata
• Harga naik [Z]% — tertinggi dalam 6 bulan
• [W] buyer baru aktif mencari

🏆 Deal Highlights:
• [Property type] di [Area] — sold in [X] days
• [Property type] di [Area] — [Y] offers received
• [Property type] di [Area] — above asking price

📈 Apa artinya?
[District] sedang dalam fase pertumbuhan. Buyer yang sudah familiar dengan area ini punya keuntungan timing.

👉 Explore opportunities: [link]`, channel: 'Instagram + Facebook + Blog', timing: 'Weekly during surge period' },
  ],
  kpis: [
    { metric: 'Inquiry Spike After Campaign', target: '+50% within 72hrs' },
    { metric: 'New Listings in Surge Zone', target: '+30% within 1 week' },
    { metric: 'Offer Submission Increase', target: '+40% during surge period' },
    { metric: 'Campaign Engagement Rate', target: '≥35%' },
    { metric: 'Surge-to-Deal Conversion', target: '≥12%' },
  ],
};

const monthlyChecklist = [
  { category: 'Buyer Lifecycle', items: ['Review segment distribution (active/considering/hesitant/dormant/lapsed)', 'Audit nurture email open & click rates vs targets', 'Check reactivation campaign response rates', 'Update buyer preference profiles from recent activity'] },
  { category: 'Listing Performance', items: ['Identify top 10 and bottom 10 performing listings', 'Execute refresh actions for listings >21 days old', 'Review photo quality compliance rate', 'Track view-to-inquiry conversion trends'] },
  { category: 'Price Surge Campaigns', items: ['Refresh surge detection signals across all districts', 'Evaluate campaign ROI from previous surge activations', 'Monitor vendor response to supply activation alerts', 'Validate pricing data accuracy in surge messaging'] },
  { category: 'Revenue Impact', items: ['Calculate revenue attributed to nurtured buyer conversions', 'Measure premium listing upgrade rate from performance recommendations', 'Track commission from surge-driven deal closures', 'Assess overall buyer lifetime value trends'] },
];

const risks = [
  { signal: 'Nurture fatigue — declining open rates below 15%', severity: 85, mitigation: 'Reduce frequency; improve personalization; add preference center; test content formats (video vs text)' },
  { signal: 'Listing quality degradation despite guidelines', severity: 82, mitigation: 'Implement minimum quality gate before publish; offer free photo assistance; auto-reject low-quality submissions' },
  { signal: 'False surge signals triggering premature campaigns', severity: 90, mitigation: 'Require ≥2 confirming signals before campaign launch; add confidence threshold ≥80%; manual review for first 5 campaigns' },
  { signal: 'Buyer trust erosion from repeated urgency messaging', severity: 88, mitigation: 'Cap urgency messages to 1/week per buyer; use data-backed claims only; add transparency disclaimers' },
  { signal: 'Vendor price inflation expectations from surge alerts', severity: 79, mitigation: 'Frame surge as opportunity window not permanent trend; include historical correction data; guide realistic pricing' },
];

const BuyerNurtureListingBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Heart className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Buyer Nurture + Listing Performance + Price Surge Campaigns</h2>
          <p className="text-sm text-muted-foreground">Long-term engagement, listing optimization & demand-driven activation</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="nurture" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="nurture"><Heart className="h-4 w-4 mr-1.5" />Buyer Nurture</TabsTrigger>
        <TabsTrigger value="listings"><Star className="h-4 w-4 mr-1.5" />Listing Performance</TabsTrigger>
        <TabsTrigger value="surge"><Flame className="h-4 w-4 mr-1.5" />Price Surge</TabsTrigger>
        <TabsTrigger value="monthly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Monthly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* BUYER NURTURE TAB */}
      <TabsContent value="nurture" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Lifecycle Segments & Strategy</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {nurture.lifecycleSegments.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.segment}</span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{s.cadence}</Badge>
                      <Badge className={`text-[10px] ${s.priority === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : s.priority === 'High' ? 'bg-chart-3/10 text-chart-3 border-chart-3/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{s.priority}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">📊 {s.behavior}</p>
                  <p className="text-[11px] text-foreground">→ {s.strategy}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Nurture KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {nurture.kpis.map((k, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{k.metric}</span><div className="flex gap-1.5"><Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge><Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {k.target}</Badge></div></div>
                    <Progress value={parseInt(k.current)} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Trust-Building Content</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {nurture.trustContent.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{t.type}</span>
                      <Badge variant="outline" className="text-[10px]">{t.format}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {t.topics.map((topic, j) => (
                        <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">▸ {topic}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {nurture.automationFlows.map((f, i) => (
          <motion.div key={i} {...anim(i + 4)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{f.flow}</CardTitle>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{f.channel}</Badge>
                    <Badge className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/20">{f.frequency}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={f.template} /></CardContent>
            </Card>
          </motion.div>
        ))}
      </TabsContent>

      {/* LISTING PERFORMANCE TAB */}
      <TabsContent value="listings" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-chart-3" />Enhancement Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topListings.enhancementChecklist.map((e, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{e.area}</span>
                    <div className="flex gap-1.5">
                      <Badge className={`text-[10px] ${e.impact === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>Impact: {e.impact}</Badge>
                      <Badge variant="outline" className="text-[10px]">Effort: {e.effort}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {e.actions.map((a, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">▸ {a}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-destructive" />Performance Diagnostics</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {topListings.performanceMonitoring.map((p, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs font-semibold text-foreground mb-0.5">⚠️ {p.signal}</p>
                    <p className="text-[10px] text-muted-foreground">Diagnosis: {p.diagnosis}</p>
                    <p className="text-[11px] text-primary mt-0.5">→ {p.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Refresh Cadence Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {topListings.refreshCadence.map((r, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">Day {r.days}</span>
                      <Badge variant="outline" className="text-[10px]">{r.checkpoints}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{r.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Listing KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {topListings.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* PRICE SURGE TAB */}
      <TabsContent value="surge" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-destructive" />Surge Detection Signals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {priceSurge.detectionSignals.map((d, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{d.signal}</span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{d.leadTime}</Badge>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{d.confidence}%</Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Threshold: {d.threshold}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {priceSurge.campaigns.map((c, i) => (
          <motion.div key={i} {...anim(i + 2)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{c.type}</CardTitle>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                    <Badge className="text-[10px] bg-chart-3/10 text-chart-3 border-chart-3/20">{c.timing}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={c.template} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Surge Campaign KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {priceSurge.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* MONTHLY CHECK TAB */}
      <TabsContent value="monthly" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthlyChecklist.map((cat, i) => (
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

export default BuyerNurtureListingBlueprint;
