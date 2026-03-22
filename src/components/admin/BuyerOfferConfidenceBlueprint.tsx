
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, FolderOpen, BarChart3, ClipboardCheck, AlertTriangle, Copy, Check, Target, TrendingUp, Zap, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const CopyBlock = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="text-xs bg-muted/50 border border-border/40 rounded-lg p-3 whitespace-pre-wrap font-mono">{text}</pre>
      <Button size="icon-sm" variant="ghost" className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied'); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

const offerConfidence = {
  hesitations: [
    { issue: 'Unsure if price is fair', impact: 93, fix: 'Auto-show CMA range + "Fair Offer Zone" indicator on listing page' },
    { issue: 'Fear of negotiation mistakes', impact: 86, fix: 'Provide guided negotiation tips + platform mediation option' },
    { issue: 'Unclear next steps after viewing', impact: 80, fix: 'Auto-send "Your Next Steps" guide within 1hr post-viewing' },
    { issue: 'Emotional commitment anxiety', impact: 74, fix: 'Frame offer as "expression of interest" — low-pressure language' },
  ],
  clarityTools: [
    { tool: 'Fair Price Indicator', desc: 'Traffic-light badge on listings: 🟢 Below avg / 🟡 At market / 🔴 Above avg', placement: 'Listing detail page' },
    { tool: 'Recent Sold Ticker', desc: '"Similar property sold for Rp X in [District] — 12 days ago"', placement: 'Below price section' },
    { tool: 'Offer Range Guide', desc: '"Recommended offer: Rp [Low]–[High] based on area comps"', placement: 'Offer submission form' },
    { tool: 'Demand Pulse', desc: '"[X] buyers viewed this week • [Y] inquiries in 48hrs"', placement: 'Listing sidebar' },
  ],
  momentumMessages: [
    { trigger: 'Post-viewing (1hr)', message: 'Terima kasih sudah viewing! Bagaimana kesan Anda? Mau kami bantu estimasi harga wajar?', tone: 'warm' },
    { trigger: 'Interest signal detected', message: 'Properti ini diminati [X] buyer lain minggu ini. Jika serius, submit offer untuk prioritas.', tone: 'urgency' },
    { trigger: 'Offer page visited but not submitted', message: 'Masih ragu? Offer bisa direvisi — ini bukan komitmen final. Kami bantu proses negosiasi.', tone: 'reassurance' },
    { trigger: '48hr post-viewing silence', message: 'Ada pertanyaan tentang [Property]? Kami bisa share data harga area + opsi financing.', tone: 'helpful' },
  ],
  offerWorkflow: [
    'Step 1: Select "Make Offer" → see Fair Price Range + demand data',
    'Step 2: Enter offer amount + payment method + preferred timeline',
    'Step 3: Platform confirms receipt → routes to agent within 30min',
    'Step 4: Agent responds (accept/counter/decline) within 48hr SLA',
    'Step 5: Counter-offer mediation with data-backed compromise zone',
    'Step 6: Agreement → next-steps checklist (legal, financing, docs)',
  ],
  kpis: [
    { metric: 'Viewing-to-Offer Rate', target: '≥28%', current: '11%' },
    { metric: 'Decision Cycle Duration', target: '<5 days', current: '14 days' },
    { metric: 'Offer Submission Rate', target: '≥15% of serious inquiries', current: '4%' },
    { metric: 'Offer-to-Close Ratio', target: '≥35%', current: '12%' },
  ],
};

const vendorExpansion = {
  incentives: [
    { program: 'Portfolio Bonus', desc: 'Upload 10+ listings → get 2 free Premium boosts', target: 'All agents', impact: 'high' },
    { program: 'Category Pioneer', desc: 'First to list in new category (land/commercial) → 30-day featured placement', target: 'Niche agents', impact: 'high' },
    { program: 'District Champion', desc: 'Most listings in a district → exclusive "Top Agent" badge + priority leads', target: 'Local specialists', impact: 'medium' },
    { program: 'Referral Builder', desc: 'Refer 3 new agents → 1 month Premium free for all your listings', target: 'Network builders', impact: 'medium' },
  ],
  diversityTargets: [
    { category: 'Residential (Houses/Villas)', current: '65%', target: '45%', status: 'Over-indexed — diversify' },
    { category: 'Apartments/Condos', current: '15%', target: '20%', status: 'Grow moderately' },
    { category: 'Land/Plots', current: '8%', target: '15%', status: 'Major growth needed' },
    { category: 'Commercial/Retail', current: '5%', target: '10%', status: 'Recruit specialists' },
    { category: 'Rental Properties', current: '7%', target: '10%', status: 'Activate rental agents' },
  ],
  coachingScript: `Pak/Bu [Agent Name],

Berikut performa listing Anda minggu ini:

📊 Ringkasan:
• [Property A]: [X] views, [Y] inquiries ✅
• [Property B]: [X] views, [Y] inquiries ⚠️
• [Property C]: [X] views, 0 inquiries ❌

💡 Rekomendasi:
• [Property B]: Kurangi harga 5-8% — saat ini di atas rata-rata area
• [Property C]: Update foto (min 8 foto) + tambah deskripsi lifestyle
• Upload 3-5 listing baru untuk meningkatkan eksposur total Anda

🏆 Top agent di area Anda: [Top Agent] dengan [X] listings & [Y] deals bulan ini.

Mau kami bantu optimasi? Reply pesan ini.

Tim ASTRA Villa`,
  kpis: [
    { metric: 'Listings per Active Vendor', target: '≥8 avg' },
    { metric: 'New Category Coverage', target: '5 categories active' },
    { metric: 'District Coverage Expansion', target: '+3 new districts/month' },
    { metric: 'Portfolio Upload Rate', target: '≥5 new listings/vendor/month' },
  ],
};

const priceIntelligence = {
  contentFormats: [
    {
      type: 'Weekly District Price Report',
      template: `📊 LAPORAN HARGA PROPERTI [DISTRICT]
Minggu ke-[X], [Month] 2026

🏠 Rata-rata Harga:
• Rumah: Rp [X] — [↑/↓] [Y]% vs bulan lalu
• Apartemen: Rp [X] — [↑/↓] [Y]%
• Tanah: Rp [X]/m² — [↑/↓] [Y]%

🔥 Area Terpanas: [Sub-district] — [X] transaksi bulan ini
📈 Tren: Harga [naik/stabil/turun] [X]% YoY
💰 Range Investasi Populer: Rp [Low]–[High]

👉 Lihat properti terbaik di [District]: [link]

#ASTRAVilla #PropertyIntelligence #[District]`,
      channel: 'Social media + Blog',
      frequency: 'Weekly',
    },
    {
      type: 'Investment Opportunity Alert',
      template: `🎯 PELUANG INVESTASI MINGGU INI

[District], [City]

Mengapa sekarang?
• Harga masih [X]% di bawah rata-rata area premium sekitar
• [Y] proyek infrastruktur baru dalam radius 5km
• Demand buyer meningkat [Z]% dalam 3 bulan terakhir

📊 Data ASTRA Villa:
• Inquiry rate: [X] per listing per minggu
• Avg days on market: [Y] hari
• Yield estimasi: [Z]%/tahun

🏠 Top 3 Properti Investasi:
1. [Property] — Rp [Price]
2. [Property] — Rp [Price]
3. [Property] — Rp [Price]

👉 Explore semua opsi: [link]`,
      channel: 'Email + WhatsApp broadcast',
      frequency: 'Bi-weekly',
    },
    {
      type: 'Demand Hotspot Infographic',
      template: `Visual elements:
• District map with color-coded demand zones
• Price per sqm comparison bars
• Inquiry volume trend line (3-month)
• Top 5 most-viewed property types
• "Best value" zone highlight

Caption: "Di mana buyer paling aktif mencari? Data ASTRA Villa [Month] 2026 📊"`,
      channel: 'Instagram/TikTok carousel',
      frequency: 'Monthly',
    },
  ],
  amplificationStrategy: [
    { channel: 'SEO Landing Pages', action: '"Property Prices in [District] 2026" — evergreen page updated monthly', goal: 'Organic traffic capture' },
    { channel: 'Social Media', action: 'Infographic snippets + carousel posts with key stats', goal: 'Brand awareness & shares' },
    { channel: 'WhatsApp Broadcast', action: 'Weekly price update to buyer & investor lists', goal: 'Engagement & inquiry spikes' },
    { channel: 'YouTube Shorts', action: '60-sec "Market Minute" video with data overlay', goal: 'Authority building' },
    { channel: 'Email Newsletter', action: 'Monthly "Market Intelligence Digest" with deep analysis', goal: 'Lead nurturing' },
  ],
  kpis: [
    { metric: 'Content Engagement Rate', target: '≥6%' },
    { metric: 'Inquiry Uplift Post-Publication', target: '+20% within 48hrs' },
    { metric: 'Brand Search Volume Growth', target: '+40% in 90 days' },
    { metric: 'Content-to-Listing Click-Through', target: '≥12%' },
  ],
};

const weeklyChecklist = [
  { category: 'Buyer Confidence', items: ['Review viewing-to-offer conversion trend', 'Audit Fair Price Indicator accuracy', 'Check post-viewing follow-up completion rate', 'Update CMA data for active listings'] },
  { category: 'Vendor Portfolio', items: ['Track listings per vendor growth', 'Identify vendors with <3 listings for coaching', 'Monitor category diversity balance', 'Process portfolio bonus rewards'] },
  { category: 'Price Intelligence', items: ['Publish weekly district price report', 'Update SEO landing page data', 'Schedule social media content queue', 'Track content engagement metrics'] },
  { category: 'Growth Health', items: ['Monitor supply-demand ratio by district', 'Check vendor churn risk signals', 'Review buyer satisfaction feedback', 'Audit pricing data accuracy'] },
];

const risks = [
  { signal: 'Offer submissions remain flat despite viewing growth', severity: 91, mitigation: 'A/B test offer UX — simplify to 2-click process; add "No commitment" framing' },
  { signal: 'Vendors uploading low-quality bulk listings', severity: 86, mitigation: 'Enforce minimum photo/description standards; quality score gates visibility' },
  { signal: 'Price intelligence data perceived as inaccurate', severity: 88, mitigation: 'Source from verified transactions only; add methodology disclaimer; peer review' },
  { signal: 'Single category dominating 70%+ of listings', severity: 77, mitigation: 'Launch targeted recruitment for underrepresented categories; offer pioneer bonuses' },
  { signal: 'Content engagement declining over time', severity: 72, mitigation: 'Rotate formats (video/carousel/report); add interactive elements; survey audience' },
];

const BuyerOfferConfidenceBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><ThumbsUp className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Buyer Offer Confidence + Vendor Portfolio + Price Intelligence</h2>
          <p className="text-sm text-muted-foreground">Decision acceleration, supply depth & market authority positioning</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="confidence" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="confidence"><ThumbsUp className="h-4 w-4 mr-1.5" />Offer Confidence</TabsTrigger>
        <TabsTrigger value="portfolio"><FolderOpen className="h-4 w-4 mr-1.5" />Vendor Portfolio</TabsTrigger>
        <TabsTrigger value="intelligence"><BarChart3 className="h-4 w-4 mr-1.5" />Price Intelligence</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* OFFER CONFIDENCE TAB */}
      <TabsContent value="confidence" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Buyer Hesitation Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {offerConfidence.hesitations.map((h, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{h.issue}</span><Badge variant="outline" className="text-[10px]">{h.impact}%</Badge></div>
                    <Progress value={h.impact} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground">→ {h.fix}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Confidence KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {offerConfidence.kpis.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs font-medium text-foreground">{k.metric}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {k.target}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-1" />Market Clarity Tools</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {offerConfidence.clarityTools.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{t.tool}</span>
                    <Badge variant="outline" className="text-[10px]">{t.placement}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Decision Momentum Messages</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {offerConfidence.momentumMessages.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant={m.tone === 'urgency' ? 'destructive' : 'outline'} className="text-[10px] min-w-[90px] justify-center flex-shrink-0">{m.trigger}</Badge>
                  <div>
                    <p className="text-xs text-foreground">{m.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Tone: {m.tone}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4 text-primary" />Guided Offer Workflow</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {offerConfidence.offerWorkflow.map((s, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>{s.substring(s.indexOf(':') + 2)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* VENDOR PORTFOLIO TAB */}
      <TabsContent value="portfolio" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary" />Expansion Incentive Programs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {vendorExpansion.incentives.map((inc, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{inc.program}</span>
                      <Badge variant={inc.impact === 'high' ? 'default' : 'outline'} className="text-[10px]">{inc.target}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{inc.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-1" />Category Diversity Targets</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {vendorExpansion.diversityTargets.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{d.category}</span>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className="text-[10px] text-destructive">{d.current}</Badge>
                        <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {d.target}</Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{d.status}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Vendor Performance Coaching Script</CardTitle></CardHeader>
            <CardContent><CopyBlock text={vendorExpansion.coachingScript} /></CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Portfolio KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {vendorExpansion.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* PRICE INTELLIGENCE TAB */}
      <TabsContent value="intelligence" className="space-y-4">
        {priceIntelligence.contentFormats.map((f, i) => (
          <motion.div key={i} {...anim(i + 1)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{f.type}</CardTitle>
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

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Amplification Strategy</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {priceIntelligence.amplificationStrategy.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.channel}</span>
                    <Badge variant="outline" className="text-[10px]">{s.goal}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{s.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Intelligence Content KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {priceIntelligence.kpis.map((k, i) => (
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

export default BuyerOfferConfidenceBlueprint;
