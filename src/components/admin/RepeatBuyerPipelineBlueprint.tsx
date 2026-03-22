
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, BarChart3, AlertTriangle, ClipboardCheck, Copy, Check, Target, TrendingUp, Zap, Bell, Heart, Users, Package } from 'lucide-react';
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

const repeatBuyer = {
  lifecycleStages: [
    { stage: 'First Visit', dropOff: 72, retentionTactic: 'Capture email/WhatsApp via "Get alerts for similar properties" prompt', timing: 'On first listing view' },
    { stage: 'Inquiry Submitted', dropOff: 55, retentionTactic: 'Instant curated shortlist of 3 similar properties + weekly digest enrollment', timing: 'Within 5 min of inquiry' },
    { stage: 'Viewing Completed', dropOff: 48, retentionTactic: 'Post-viewing follow-up + "properties you might have missed" next-day message', timing: '4hrs + 24hrs post-viewing' },
    { stage: 'No Offer After Viewing', dropOff: 65, retentionTactic: 'Weekly market updates + price drop alerts on viewed properties + financing reminder', timing: 'Day 3, 7, 14 post-viewing' },
    { stage: 'Dormant (30+ days)', dropOff: 85, retentionTactic: 'Re-engagement campaign: "New opportunities in your preferred area" + event invite', timing: 'Day 30, 45, 60' },
  ],
  engagementFlows: [
    { flow: 'Weekly Opportunity Digest', channel: 'WhatsApp + Email', template: `🏠 Properti Pilihan Minggu Ini — [District]

Hai [Name], berdasarkan preferensi Anda:

1️⃣ [Property] — Rp [Price]
   📍 [Location] | [X] KT [Y] KM | LB [Z]m²
   🔥 [X] orang tertarik minggu ini
   
2️⃣ [Property] — Rp [Price]  
   📍 [Location] | [X] KT [Y] KM | LB [Z]m²
   💰 Harga turun [X]% dari bulan lalu

3️⃣ [Property] — Rp [Price]
   📍 [Location] | [X] KT [Y] KM | LB [Z]m²
   ⭐ Baru listing — belum banyak yang tahu

💡 Market insight: Harga di [District] naik [X]% dalam 3 bulan.

👉 Lihat semua: [link]
📞 Butuh bantuan? [Agent phone]`, frequency: 'Weekly (Senin pagi)' },
    { flow: 'Price Drop Alert', channel: 'WhatsApp + Push', template: `💰 PRICE DROP ALERT!

Properti yang Anda lihat/simpan mengalami penurunan harga:

🏠 [Property Name] — [District]
❌ Harga lama: Rp [Old Price]
✅ Harga baru: Rp [New Price] (-[X]%)

📊 Konteks:
• Sudah [X] hari di market
• [Y] buyer lain juga tracking harga ini
• Harga baru ini [Z]% di bawah rata-rata area

⏰ Window bagus untuk negosiasi.

👉 Jadwalkan viewing: [link]`, frequency: 'Real-time on price change' },
    { flow: 'Post-Viewing Re-engagement', channel: 'WhatsApp', template: `Hai [Name]! 👋

Sudah [X] hari sejak viewing di [Property Name].

📊 Update terbaru:
• [X] buyer baru inquiry properti ini
• Harga di [District] naik [Y]% bulan ini
• [Z] properti serupa baru listing

Masih mempertimbangkan? Kami punya beberapa opsi baru yang mungkin cocok:
👉 [link to curated list]

Atau siap submit offer?
👉 [link to offer form]

Best regards, [Agent Name]`, frequency: 'Day 3, 7, 14 post-viewing' },
  ],
  habitFormation: [
    { trigger: 'Monday 8am', action: '"Top 5 Opportunities This Week" push notification', goal: 'Weekly check-in habit', metric: 'Open rate ≥40%' },
    { trigger: 'New listing matching saved search', action: 'Instant "New match found!" alert', goal: 'Platform as primary discovery', metric: 'Click rate ≥25%' },
    { trigger: 'District price trend change', action: '"Market Update: [District] prices moved [X]%"', goal: 'Intelligence dependency', metric: 'Engagement ≥15%' },
    { trigger: '7 days since last visit', action: '"You have [X] new matches since last visit"', goal: 'Prevent churn', metric: 'Return rate ≥30%' },
  ],
  kpis: [
    { metric: 'Repeat Visit Rate (7-day)', target: '≥40%', current: '15%' },
    { metric: 'Returning Buyer Inquiry Ratio', target: '≥30% of all inquiries', current: '8%' },
    { metric: 'Time-to-Decision', target: '≤14 days avg', current: '35 days' },
    { metric: 'Buyer Churn Rate (30-day)', target: '≤40%', current: '72%' },
  ],
};

const pipelineForecast = {
  stages: [
    { stage: 'New Leads', icon: '📥', description: 'Inquiries received, not yet contacted', probability: '10%', actions: ['Respond within 5 min', 'Qualify budget & timeline', 'Send property brief'], avgDays: '0–1' },
    { stage: 'Contacted & Qualified', icon: '📞', description: 'Initial response sent, buyer qualified', probability: '25%', actions: ['Schedule viewing within 48hrs', 'Send curated shortlist', 'Confirm financing status'], avgDays: '1–3' },
    { stage: 'Viewing Scheduled', icon: '📅', description: 'Viewing appointment confirmed', probability: '40%', actions: ['Send pre-viewing brief', 'Confirm day-of attendance', 'Prepare comparable data'], avgDays: '3–7' },
    { stage: 'Viewing Completed', icon: '👁️', description: 'Buyer has visited property', probability: '55%', actions: ['Same-day follow-up call', 'Share offer guidance', 'Address objections'], avgDays: '7–12' },
    { stage: 'Offer Submitted', icon: '📋', description: 'Formal offer presented to seller', probability: '70%', actions: ['Facilitate seller response', 'Provide comp data to seller', 'Manage counter-offers'], avgDays: '12–19' },
    { stage: 'Under Negotiation', icon: '🤝', description: 'Active negotiation between parties', probability: '80%', actions: ['Daily status updates', 'Pricing alignment support', 'Financing confirmation push'], avgDays: '19–28' },
    { stage: 'Closing', icon: '✅', description: 'Terms agreed, processing completion', probability: '95%', actions: ['Document checklist tracking', 'Legal/notary coordination', 'Payment milestone monitoring'], avgDays: '28–45' },
  ],
  forecastTemplate: `📊 AGENT PIPELINE FORECAST — [Agent Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Forecast Period: [Month]
🎯 Monthly Deal Target: [X]

PIPELINE SUMMARY:
📥 New Leads:        [X] leads × 10% = [Y] expected
📞 Contacted:        [X] leads × 25% = [Y] expected  
📅 Viewing Sched:    [X] leads × 40% = [Y] expected
👁️ Viewed:           [X] leads × 55% = [Y] expected
📋 Offer Submitted:  [X] leads × 70% = [Y] expected
🤝 Negotiating:      [X] leads × 80% = [Y] expected
✅ Closing:          [X] leads × 95% = [Y] expected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 TOTAL FORECAST:   [Sum] deals this month
💰 EST. COMMISSION:  Rp [Amount]

⚠️ ALERTS:
• [X] leads stuck in [Stage] >7 days
• [Y] listings need price adjustment
• Response speed: [X] min avg (target: <5)

🎯 TOP 3 FOCUS DEALS:
1. [Property] — [Buyer] — [Stage] — Rp [Value]
2. [Property] — [Buyer] — [Stage] — Rp [Value]
3. [Property] — [Buyer] — [Stage] — Rp [Value]

📅 Next review: [Date]`,
  optimizationGuidance: [
    { signal: 'Leads stuck in "New" >48hrs', recommendation: 'Immediate outreach — leads decay 50% after 48hrs', priority: 'Critical' },
    { signal: 'Viewing completed but no offer >5 days', recommendation: 'Send decision support package + urgency signal', priority: 'High' },
    { signal: 'Listing with 5+ views but 0 offers', recommendation: 'Suggest price adjustment or listing quality improvement', priority: 'Medium' },
    { signal: 'Negotiation stalled >7 days', recommendation: 'Escalate — provide fresh comp data + founder intervention offer', priority: 'High' },
    { signal: 'Low conversion from viewing to offer (<15%)', recommendation: 'Review viewing preparation quality; improve pre-viewing briefs', priority: 'Medium' },
  ],
  kpis: [
    { metric: 'Forecast Accuracy', target: '±20% of actual' },
    { metric: 'Agent Productivity (deals/month)', target: '≥4' },
    { metric: 'Pipeline Velocity (avg days)', target: '≤30 days' },
    { metric: 'Stage Conversion Rates', target: 'Within ±10% of benchmarks' },
  ],
};

const supplyShortage = {
  detectionLogic: [
    { signal: 'High Inquiry-to-Listing Ratio', threshold: '≥5 inquiries per active listing in district', confidence: 94, window: '7-day rolling' },
    { signal: 'Rapid Price Appreciation', threshold: '≥5% avg price increase in 30 days', confidence: 82, window: '30-day rolling' },
    { signal: 'Listing Depletion Rate', threshold: 'Active listings declined ≥20% while demand stable', confidence: 88, window: '14-day comparison' },
    { signal: 'Repeated Unmatched Searches', threshold: '≥20 searches/week returning <3 results in category', confidence: 78, window: '7-day rolling' },
    { signal: 'Viewing Waitlist Formation', threshold: '≥3 buyers waiting for same property type in area', confidence: 85, window: 'Real-time' },
  ],
  vendorAlerts: [
    { type: 'Supply Gap Opportunity', template: `📈 SUPPLY SHORTAGE ALERT — [District]

Pak/Bu [Agent Name], peluang besar!

📊 Data real-time ASTRA Villa:
• [X] buyer aktif mencari properti di [District]
• Hanya [Y] listing tersedia — gap [Z] unit
• Inquiry rate: [X]x di atas rata-rata
• Harga area naik [Y]% dalam 30 hari

💰 Keuntungan upload sekarang:
• Listing baru = instant visibility ke [X] buyer aktif
• Estimasi waktu ke inquiry: <24 jam
• Premium Boost GRATIS untuk 3 listing pertama

🏠 Yang dicari buyer:
• Type: [Property types]
• Budget: Rp [Min]–[Max]
• Preferensi: [Key features]

👉 Upload listing sekarang: [link]`, channel: 'WhatsApp + Dashboard notification' },
    { type: 'Pricing Advantage Signal', template: `💡 PRICING INSIGHT — [District]

Karena supply terbatas di [District]:

📊 Posisi harga Anda:
• Listing Anda: Rp [Price]
• Avg area: Rp [Avg] 
• Demand level: [🔴 HIGH]
• Posisi Anda: [X]% [above/below] market

💰 Rekomendasi:
[If below] "Harga Anda kompetitif — buyer akan cepat tertarik. Pertimbangkan apakah ada room untuk adjustment."
[If at market] "Harga sesuai market — fokus pada listing quality untuk stand out."
[If above] "Demand kuat tapi harga sedikit tinggi — monitor inquiry rate minggu ini."`, channel: 'WhatsApp weekly' },
  ],
  buyerAlerts: [
    { scenario: 'Limited availability in preferred area', message: '"Hanya [X] properti tersedia di [District] sesuai kriteria Anda — pertimbangkan viewing segera"', goal: 'Accelerate viewing commitment' },
    { scenario: 'Price trend rising', message: '"Harga di [District] naik [X]% bulan ini — window pembelian saat ini masih menguntungkan"', goal: 'Create decision urgency' },
    { scenario: 'New listing in shortage zone', message: '"🆕 Listing baru di [District]! Area ini sangat diminati — [X] buyer lain juga tracking"', goal: 'First-mover advantage' },
    { scenario: 'Alternative suggestions', message: '"Supply terbatas di [District]? Cek [Adjacent District] — harga [X]% lebih rendah, demand mulai naik"', goal: 'Redistribute demand' },
  ],
  kpis: [
    { metric: 'Listings Uploaded After Alert', target: '+40% within 72hrs' },
    { metric: 'Inquiry Conversion in Shortage Zone', target: '+30% vs baseline' },
    { metric: 'Alert Engagement Rate', target: '≥35%' },
    { metric: 'Price Confidence Improvement', target: '+15% faster negotiation' },
  ],
};

const weeklyChecklist = [
  { category: 'Buyer Retention', items: ['Review repeat visit rate vs 40% target', 'Audit weekly digest delivery & open rates', 'Check price drop alert accuracy & timeliness', 'Analyze post-viewing follow-up completion rate'] },
  { category: 'Agent Pipeline', items: ['Review pipeline stage distribution per agent', 'Identify deals stuck >7 days at any stage', 'Compare forecast vs actual deal closures', 'Send weekly pipeline summary to all agents'] },
  { category: 'Supply Shortage Signals', items: ['Refresh shortage detection across all districts', 'Track listing upload response to vendor alerts', 'Monitor pricing impact in shortage zones', 'Validate shortage signals against actual data'] },
  { category: 'Ecosystem Balance', items: ['Calculate overall supply-demand ratio by district', 'Review buyer churn rate trend', 'Check agent pipeline velocity improvement', 'Assess revenue impact of shortage-driven listings'] },
];

const risks = [
  { signal: 'Buyer notification fatigue (open rates dropping below 20%)', severity: 88, mitigation: 'Reduce frequency to 1/week max; improve personalization accuracy; add preference settings; A/B test content formats' },
  { signal: 'Pipeline forecasts consistently off by >40%', severity: 84, mitigation: 'Recalibrate probability weights using 90-day actual data; add agent-level adjustment factors; simplify to 3-stage model initially' },
  { signal: 'Supply shortage alerts not generating listing uploads', severity: 86, mitigation: 'Strengthen incentives (free boost, priority exposure); add direct agent outreach by team; verify alert targeting accuracy' },
  { signal: 'Artificial scarcity perception damaging trust', severity: 92, mitigation: 'Show methodology transparently; use verified data only; add confidence levels to alerts; allow buyer opt-out' },
  { signal: 'Agent over-reliance on platform leads (no self-sourcing)', severity: 76, mitigation: 'Cap platform lead allocation; incentivize agent-sourced listings; coaching on independent lead generation' },
];

const RepeatBuyerPipelineBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><RefreshCw className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Repeat Buyer Engagement + Agent Pipeline + Supply Shortage Alerts</h2>
          <p className="text-sm text-muted-foreground">Buyer retention, deal forecasting & scarcity-driven supply activation</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="retention" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="retention"><Heart className="h-4 w-4 mr-1.5" />Buyer Retention</TabsTrigger>
        <TabsTrigger value="pipeline"><BarChart3 className="h-4 w-4 mr-1.5" />Agent Pipeline</TabsTrigger>
        <TabsTrigger value="shortage"><Package className="h-4 w-4 mr-1.5" />Supply Shortage</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* BUYER RETENTION TAB */}
      <TabsContent value="retention" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-destructive" />Lifecycle Drop-Off Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {repeatBuyer.lifecycleStages.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{s.stage}</span><Badge variant="outline" className="text-[10px] text-destructive">{s.dropOff}% drop</Badge></div>
                    <Progress value={s.dropOff} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground">→ {s.retentionTactic}</p>
                    <p className="text-[10px] text-primary">⏰ {s.timing}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Retention KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {repeatBuyer.kpis.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs font-medium text-foreground">{k.metric}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {k.target}</Badge>
                    </div>
                  </div>
                ))}
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Habit Formation Triggers</p>
                  {repeatBuyer.habitFormation.map((h, i) => (
                    <div key={i} className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold text-foreground">{h.trigger}</span>
                        <Badge variant="outline" className="text-[9px]">{h.metric}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{h.action}</p>
                      <p className="text-[10px] text-primary">→ {h.goal}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {repeatBuyer.engagementFlows.map((f, i) => (
          <motion.div key={i} {...anim(i + 3)}>
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

      {/* AGENT PIPELINE TAB */}
      <TabsContent value="pipeline" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-3" />Pipeline Stages & Probability</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {pipelineForecast.stages.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.icon} {s.stage}</span>
                    <div className="flex gap-1.5">
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{s.probability}</Badge>
                      <Badge variant="outline" className="text-[10px]">Day {s.avgDays}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">{s.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.actions.map((a, j) => (
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
            <CardHeader className="pb-3"><CardTitle className="text-sm">Pipeline Forecast Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={pipelineForecast.forecastTemplate} /></CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-destructive" />Optimization Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {pipelineForecast.optimizationGuidance.map((g, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{g.signal}</span>
                      <Badge variant={g.priority === 'Critical' ? 'destructive' : 'outline'} className="text-[10px]">{g.priority}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">→ {g.recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(4)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Pipeline KPIs</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {pipelineForecast.kpis.map((k, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                    <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                    <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </TabsContent>

      {/* SUPPLY SHORTAGE TAB */}
      <TabsContent value="shortage" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-chart-3" />Shortage Detection Logic</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {supplyShortage.detectionLogic.map((d, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{d.signal}</span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{d.window}</Badge>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{d.confidence}%</Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Threshold: {d.threshold}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {supplyShortage.vendorAlerts.map((a, i) => (
          <motion.div key={i} {...anim(i + 2)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{a.type}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{a.channel}</Badge>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={a.template} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />Buyer Shortage Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {supplyShortage.buyerAlerts.map((b, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{b.scenario}</span>
                    <Badge variant="outline" className="text-[10px]">{b.goal}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">"{b.message}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Shortage Alert KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {supplyShortage.kpis.map((k, i) => (
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

export default RepeatBuyerPipelineBlueprint;
