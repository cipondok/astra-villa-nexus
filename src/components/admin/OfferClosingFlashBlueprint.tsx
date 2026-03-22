
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Handshake, Zap, AlertTriangle, ClipboardCheck, Copy, Check, Target, TrendingUp, DollarSign, Flame, Shield } from 'lucide-react';
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

const closingPsychology = {
  techniques: [
    { technique: 'Value Anchoring', description: 'Reframe price as investment return, not cost', application: 'Show projected appreciation, rental yield, or cost-per-sqm vs alternatives', timing: 'During offer preparation', impact: 'High' },
    { technique: 'Loss Aversion Framing', description: 'Emphasize what buyer stands to lose by waiting', application: '"Properti serupa 3 bulan lalu harga Rp [X] — sekarang sudah Rp [Y]"', timing: 'Post-viewing follow-up', impact: 'Critical' },
    { technique: 'Social Proof Validation', description: 'Reference similar successful transactions', application: '"Buyer dengan profil serupa baru saja closing di [District] dengan terms yang mirip"', timing: 'During negotiation', impact: 'High' },
    { technique: 'Commitment Escalation', description: 'Build small commitments leading to offer', application: 'Saved → Viewed → Second View → Soft Interest → Formal Offer', timing: 'Throughout funnel', impact: 'Medium' },
    { technique: 'Authority Positioning', description: 'Present platform data as objective market authority', application: 'Use ASTRA market reports and comp data as neutral third-party validation', timing: 'Pricing discussions', impact: 'High' },
    { technique: 'Reciprocity Trigger', description: 'Provide valuable insights before asking for commitment', application: 'Free financing assessment → neighborhood report → then suggest offer', timing: 'Pre-offer stage', impact: 'Medium' },
  ],
  scripts: [
    { scenario: 'Offer Preparation Confidence Builder', template: `Hai [Name],

Setelah viewing dan diskusi kita, saya ingin share analisis objektif untuk membantu keputusan Anda:

📊 ANALISIS PROPERTI — [Property Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Posisi Harga:
• Listing price: Rp [Price]
• Avg [Type] di [District]: Rp [Avg]
• Posisi: [X]% [below/at] market — ✅ Kompetitif

📈 Proyeksi Nilai:
• Apresiasi area 12 bulan terakhir: +[X]%
• Estimasi nilai 2 tahun ke depan: Rp [Projected]
• Potential gain: Rp [Gain] (+[Y]%)

🏠 Faktor Pembanding:
• [Comp 1]: Terjual Rp [Price] ([X] hari lalu)
• [Comp 2]: Terjual Rp [Price] ([Y] hari lalu)
• [Comp 3]: Masih listing Rp [Price] (belum terjual)

💡 Rekomendasi Offer Range:
• Aggressive: Rp [Low] (kemungkinan counter-offer)
• Sweet spot: Rp [Mid] (balance value + acceptance probability)
• Strong: Rp [High] (high acceptance probability)

⏰ Timing Context:
• [Z] buyer lain sedang aktif inquiry
• Avg days-on-market untuk tipe ini: [W] hari
• Listing ini sudah [V] hari — [sweet spot / getting attention]

Mau kita prepare offer? Saya siap bantu draft dan kirim hari ini.

Best,
[Agent Name]`, channel: 'WhatsApp / Email' },
    { scenario: 'Counter-Offer Win-Win Framing', template: `Hai [Name],

Seller sudah respond terhadap penawaran Anda:

📋 STATUS NEGOSIASI:
• Offer Anda: Rp [Buyer Offer]
• Counter dari seller: Rp [Counter]
• Gap: Rp [Difference] ([X]%)

🤝 Analisis Win-Win:
Dari sisi seller:
• Mereka sudah bergerak [Y]% dari listing price
• Ini menunjukkan motivasi dan fleksibilitas
• Counter ini [within/close to] range market

Dari sisi Anda:
• Counter price masih [Z]% di bawah avg area
• Dibanding properti serupa, ini tetap value yang baik
• Financing di harga ini: est. Rp [Monthly]/bulan

💡 Opsi yang bisa kita pertimbangkan:
1️⃣ Accept counter → proses langsung, deal secured
2️⃣ Split the difference → Rp [Mid] (profesional, shows good faith)
3️⃣ Final offer → Rp [Final] dengan terms tambahan (timeline/DP flexibility)

⏰ Saya rekomendasikan respond dalam 24 jam untuk maintain momentum negosiasi.

Mau diskusi opsi mana yang paling sesuai?`, channel: 'WhatsApp' },
    { scenario: 'Final Closing Push', template: `Hai [Name],

Great news! Negosiasi sudah di tahap akhir:

✅ DEAL SUMMARY:
• Properti: [Property Name]
• Harga final: Rp [Agreed Price]
• Savings vs listing: Rp [Saved] ([X]%)
• Terms: [Key terms]

📋 NEXT STEPS (3 langkah sederhana):
1️⃣ Tanda tangan LOI (Letter of Intent) — hari ini
2️⃣ DP booking fee Rp [Amount] — dalam 3 hari
3️⃣ Proses notaris & dokumen — kami koordinasikan

🛡️ Perlindungan Anda:
• Semua dokumen diverifikasi oleh tim legal kami
• Booking fee refundable jika ada masalah dokumen
• Kami dampingi sampai serah terima kunci

💬 "[Reassuring quote] — selamat atas keputusan investasi yang bijak!"

👉 Konfirmasi deal: [link]
📞 Pertanyaan? [Phone] — available 24/7 sampai closing.`, channel: 'WhatsApp + Email' },
  ],
  workflow: [
    { stage: 'Offer Submitted', sla: 'Confirm receipt within 1hr', followUp: 'T+4hrs: Status update to buyer', escalation: 'If no seller response in 24hrs → agent call seller directly' },
    { stage: 'Counter-Offer Received', sla: 'Relay to buyer within 2hrs', followUp: 'T+12hrs: Decision support package', escalation: 'If buyer silent 48hrs → phone call with options' },
    { stage: 'Terms Agreed', sla: 'Send LOI draft within 4hrs', followUp: 'T+24hrs: DP payment reminder', escalation: 'If no LOI signed 72hrs → founder intervention call' },
    { stage: 'Closing Process', sla: 'Document checklist within 24hrs', followUp: 'Daily status updates', escalation: 'Any delay >3 days → dedicated coordinator assigned' },
  ],
  kpis: [
    { metric: 'Offer-to-Deal Conversion', target: '≥40%', current: '18%' },
    { metric: 'Negotiation Duration', target: '≤7 days avg', current: '18 days' },
    { metric: 'Final-Stage Drop-Off Rate', target: '≤15%', current: '38%' },
    { metric: 'Counter-Offer Response Time', target: '≤12hrs', current: '48hrs' },
  ],
};

const revenueShare = {
  tiers: [
    { tier: 'Silver Partner', criteria: '≥3 deals/quarter + ≥10 active listings', revenueShare: '70/30 (Agent/Platform)', benefits: ['Standard lead routing', 'Monthly performance report', 'Platform badge on profile'], commitment: '3-month rolling' },
    { tier: 'Gold Partner', criteria: '≥8 deals/quarter + ≥25 active listings + <5min avg response', revenueShare: '75/25 (Agent/Platform)', benefits: ['Priority lead routing', 'Free Premium Boost (5/month)', 'Co-branded marketing', 'Quarterly strategy session'], commitment: '6-month agreement' },
    { tier: 'Platinum Partner', criteria: '≥15 deals/quarter + ≥50 listings + exclusive inventory', revenueShare: '80/20 (Agent/Platform)', benefits: ['Exclusive territory leads', 'Unlimited Premium Boost', 'Joint PR campaigns', 'Revenue share on referrals', 'Annual partner retreat'], commitment: '12-month agreement' },
    { tier: 'Diamond Partner', criteria: 'Top 3 agents nationally + strategic market maker', revenueShare: '85/15 (Agent/Platform) + equity options', benefits: ['All Platinum benefits', 'Advisory board seat', 'Equity participation program', 'Custom product features', 'Personal account manager'], commitment: 'Annual with renewal' },
  ],
  proposalTemplate: `🤝 PARTNERSHIP PROPOSAL — [Agent Name]

ASTRA Villa × [Agent/Agency Name]
Revenue Share Partnership Agreement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 YOUR PERFORMANCE:
• Deals closed (last 90 days): [X]
• Active listings: [Y]
• Avg response time: [Z] min
• Platform ranking: Top [W]%

🏆 PROPOSED TIER: [Gold/Platinum/Diamond]

💰 REVENUE STRUCTURE:
• Commission split: [X]/[Y] (You/Platform)
• Est. monthly earnings at current pace: Rp [Amount]
• With partnership benefits: Rp [Enhanced Amount] (+[Z]%)

🎁 EXCLUSIVE BENEFITS:
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]
• [Benefit 4]

📈 GROWTH PROJECTIONS:
• With priority lead routing: +[X]% more qualified leads
• With Premium Boost: +[Y]% listing visibility
• With co-marketing: +[Z]% brand awareness in territory

📋 TERMS:
• Duration: [X] months
• Performance review: Quarterly
• Renewal: Automatic if targets maintained
• Exit: 30-day notice either party

🤝 MUTUAL COMMITMENTS:

You commit to:
□ Maintain ≥[X] active quality listings
□ Response time ≤[Y] minutes
□ [Z] deals per quarter minimum
□ Exclusive new listings first on ASTRA

We commit to:
□ Priority lead routing in [Territory]
□ [X] free Premium Boosts per month
□ Quarterly co-marketing campaigns
□ Dedicated partner support line

👉 Accept partnership: [link]
📞 Discuss terms: [Phone]`,
  governance: [
    { checkpoint: 'Monthly', review: 'Performance metrics vs targets', action: 'Adjust lead routing priority based on performance' },
    { checkpoint: 'Quarterly', review: 'Deal volume + listing quality + revenue contribution', action: 'Tier upgrade/downgrade assessment + strategy session' },
    { checkpoint: 'Semi-Annual', review: 'Partnership ROI + market share impact', action: 'Revenue share renegotiation if warranted' },
    { checkpoint: 'Annual', review: 'Full partnership health assessment', action: 'Renewal decision + next-year target setting' },
  ],
  kpis: [
    { metric: 'Deal Share from Elite Partners', target: '≥60% of total deals' },
    { metric: 'Exclusive Inventory Growth', target: '+40% per quarter' },
    { metric: 'Partner Retention Rate', target: '≥90% annual' },
    { metric: 'Revenue per Partner', target: '+25% quarter-over-quarter' },
  ],
};

const flashPromotion = {
  selectionCriteria: [
    { criteria: 'Price Advantage', weight: '30%', logic: '≥8% below district average OR recent ≥5% price reduction' },
    { criteria: 'District Liquidity', weight: '25%', logic: 'Inquiry-to-listing ratio ≥4:1 in last 14 days' },
    { criteria: 'Demand Signals', weight: '20%', logic: '≥5 saves + ≥3 inquiries in last 7 days' },
    { criteria: 'Visual Quality', weight: '15%', logic: '≥10 photos + video tour + verified badge' },
    { criteria: 'Agent Readiness', weight: '10%', logic: 'Agent response time <5min + confirmed availability for viewings' },
  ],
  campaigns: [
    { format: '48-Hour Flash Deal', template: `⚡ FLASH DEAL — 48 JAM SAJA! ⚡

🏠 [Property Name] — [District]
💰 Rp [Price] (🔥 [X]% di bawah market!)

⏰ Flash window: [Start Time] — [End Time]

📊 Kenapa ini flash deal:
• Harga [X]% di bawah avg [District]
• [Y] buyer sudah inquiry — demand TINGGI
• Seller ready untuk fast closing
• Properti serupa terjual dalam [Z] hari

🎁 Flash Deal Exclusive:
• Priority viewing untuk yang book dalam 24 jam
• Free property inspection report
• Fast-track financing assessment

📅 VIEWING SLOTS (first come first served):
• [Slot 1] — ✅ Available
• [Slot 2] — ✅ Available
• [Slot 3] — ✅ Available
• [Slot 4] — ⏳ Almost full

👉 BOOK NOW: [link]
📞 Instant booking: [Phone]

⚠️ Setelah 48 jam, listing kembali ke harga normal.`, channel: 'WhatsApp + Push + Email', duration: '48 hours' },
    { format: 'Weekend Power Listing', template: `🏠 WEEKEND POWER LISTINGS — [District]

3 properti terbaik untuk weekend viewing:

1️⃣ ⭐ [Property 1] — Rp [Price]
   📍 [Location] | [Specs]
   🔥 Flash price — save Rp [Amount]!
   📅 Viewing: [Sat/Sun Time]

2️⃣ 💎 [Property 2] — Rp [Price]
   📍 [Location] | [Specs]
   📈 Area trending — harga naik [X]%/bulan
   📅 Viewing: [Sat/Sun Time]

3️⃣ 🆕 [Property 3] — Rp [Price]
   📍 [Location] | [Specs]
   ⭐ Baru listing — belum banyak yang tahu
   📅 Viewing: [Sat/Sun Time]

💡 Weekend Bonus:
• Book 2+ viewings → free neighborhood guide
• Submit offer weekend ini → priority processing

👉 Book weekend viewing: [link]`, channel: 'WhatsApp Thursday evening', duration: 'Thu PM — Sun PM' },
    { format: 'Investor Flash Alert', template: `💰 INVESTOR FLASH — HIGH-YIELD OPPORTUNITY

🏠 [Property Name] — [District]
💰 Price: Rp [Price]

📊 INVESTMENT METRICS:
• Rental yield: [X]%/year (vs avg [Y]%)
• Price/sqm: Rp [Z] (📉 [W]% below area)
• Occupancy rate area: [V]%
• Projected appreciation: +[U]%/year

🔥 WHY NOW:
• [Reason 1 — e.g., "New infrastructure project nearby"]
• [Reason 2 — e.g., "Area rezoning approved"]  
• [Reason 3 — e.g., "Limited remaining inventory"]

⏰ Alert valid: 72 hours
📊 [X] investors already tracking this property

👉 Full analysis: [link]
📞 Investment consultation: [Phone]`, channel: 'Email + WhatsApp to investor segment', duration: '72 hours' },
  ],
  executionFlow: [
    { step: 'T-48hrs', action: 'Select listings + confirm agent readiness + prepare assets', owner: 'Growth Lead' },
    { step: 'T-24hrs', action: 'Create social posts + WhatsApp templates + email draft', owner: 'Content Team' },
    { step: 'T-0 (Launch)', action: 'Activate all channels simultaneously + homepage banner', owner: 'Marketing' },
    { step: 'T+4hrs', action: 'Monitor initial response + adjust targeting if needed', owner: 'Growth Lead' },
    { step: 'T+24hrs', action: 'Mid-campaign push: "X slots remaining" update', owner: 'Marketing' },
    { step: 'T+48hrs', action: 'Campaign close + follow-up all leads + schedule viewings', owner: 'Agent + Coordinator' },
    { step: 'T+72hrs', action: 'Post-campaign review + conversion tracking + next selection', owner: 'Founder' },
  ],
  kpis: [
    { metric: 'Inquiry Surge During Flash', target: '+100% vs baseline' },
    { metric: 'Viewing Bookings per Flash', target: '≥12' },
    { metric: 'Offer Submissions Post-Flash', target: '≥4 within 7 days' },
    { metric: 'Flash-to-Deal Conversion', target: '≥25% within 30 days' },
    { metric: 'Campaign ROI', target: '≥5x cost of promotion' },
  ],
};

const weeklyChecklist = [
  { category: 'Closing Psychology', items: ['Review offer-to-deal conversion rate vs 40% target', 'Audit counter-offer response times (<12hrs)', 'Track final-stage drop-off reasons', 'Identify stalled negotiations needing escalation'] },
  { category: 'Revenue Share Partners', items: ['Review partner deal contributions vs targets', 'Check exclusive inventory pipeline from partners', 'Send weekly partner performance summaries', 'Flag any partners below tier requirements'] },
  { category: 'Flash Promotions', items: ['Select next flash deal candidates (score top 5)', 'Review last campaign inquiry and conversion metrics', 'Coordinate agent availability for upcoming flash', 'Analyze channel performance (WhatsApp vs social vs email)'] },
  { category: 'Revenue Impact', items: ['Calculate closing rate improvement trend', 'Track revenue from partner-sourced deals', 'Measure flash campaign ROI', 'Assess overall deal velocity improvement'] },
];

const risks = [
  { signal: 'Deal fatigue — buyers receiving too many closing nudges', severity: 87, mitigation: 'Max 3 touchpoints per negotiation cycle; vary message format; always include genuine "take your time" option' },
  { signal: 'Revenue share margins becoming unsustainable at Diamond tier', severity: 83, mitigation: 'Model LTV per partner tier; ensure platform value-add justifies split; cap Diamond partners at 5 nationally' },
  { signal: 'Flash promotion devaluing regular listings', severity: 89, mitigation: 'Limit to 1 flash/week per district; rotate property types; maintain quality threshold; never discount below actual market value' },
  { signal: 'Partner agents becoming too dominant (concentration risk)', severity: 81, mitigation: 'Cap single agent at ≤15% of total deals; actively develop pipeline of new partners; maintain fair lead distribution baseline' },
  { signal: 'Urgency messaging eroding platform trust and credibility', severity: 91, mitigation: 'Use only verified data in all claims; add "data as of [date]" timestamps; create trust audit process; allow buyer feedback on messaging' },
];

const OfferClosingFlashBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Brain className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Offer Closing Psychology + Revenue Share + Flash Promotions</h2>
          <p className="text-sm text-muted-foreground">Deal psychology, elite partnerships & high-velocity demand activation</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="closing" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="closing"><Brain className="h-4 w-4 mr-1.5" />Closing Psychology</TabsTrigger>
        <TabsTrigger value="revenue"><Handshake className="h-4 w-4 mr-1.5" />Revenue Share</TabsTrigger>
        <TabsTrigger value="flash"><Zap className="h-4 w-4 mr-1.5" />Flash Promo</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* CLOSING PSYCHOLOGY TAB */}
      <TabsContent value="closing" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />Psychological Techniques</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {closingPsychology.techniques.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{t.technique}</span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{t.timing}</Badge>
                      <Badge className={`text-[10px] ${t.impact === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{t.impact}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t.description}</p>
                  <p className="text-[11px] text-foreground mt-0.5">→ {t.application}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-chart-3" />Closing Workflow SLAs</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {closingPsychology.workflow.map((w, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className="text-[10px] w-36 justify-center flex-shrink-0 mt-0.5">{w.stage}</Badge>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[11px] text-foreground">⏰ SLA: {w.sla}</p>
                    <p className="text-[10px] text-muted-foreground">📋 {w.followUp}</p>
                    <p className="text-[10px] text-destructive">🚨 {w.escalation}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {closingPsychology.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                    <span className="text-[10px] text-muted-foreground">→</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{k.target}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {closingPsychology.scripts.map((s, i) => (
          <motion.div key={i} {...anim(i + 7)}>
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

      {/* REVENUE SHARE TAB */}
      <TabsContent value="revenue" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-chart-3" />Partnership Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {revenueShare.tiers.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{t.tier}</span>
                    <div className="flex gap-1.5">
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{t.revenueShare}</Badge>
                      <Badge variant="outline" className="text-[10px]">{t.commitment}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">Criteria: {t.criteria}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.benefits.map((b, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">✅ {b}</Badge>
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
              <CardHeader className="pb-3"><CardTitle className="text-sm">Governance Checkpoints</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {revenueShare.governance.map((g, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{g.checkpoint}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">📊 {g.review}</p>
                    <p className="text-[10px] text-primary mt-0.5">→ {g.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Partnership KPIs</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {revenueShare.kpis.map((k, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                    <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                    <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Partnership Proposal Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={revenueShare.proposalTemplate} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* FLASH PROMO TAB */}
      <TabsContent value="flash" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-destructive" />Flash Deal Selection Scoring</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {flashPromotion.selectionCriteria.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{c.criteria}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Weight: {c.weight}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.logic}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-chart-3" />Execution Flow</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {flashPromotion.executionFlow.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className="text-[10px] w-20 justify-center flex-shrink-0">{e.step}</Badge>
                  <span className="text-[11px] text-foreground flex-1">{e.action}</span>
                  <Badge className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">{e.owner}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {flashPromotion.campaigns.map((c, i) => (
          <motion.div key={i} {...anim(i + 3)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{c.format}</CardTitle>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                    <Badge className="text-[10px] bg-chart-3/10 text-chart-3 border-chart-3/20">{c.duration}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={c.template} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div {...anim(6)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Flash Campaign KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {flashPromotion.kpis.map((k, i) => (
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

export default OfferClosingFlashBlueprint;
