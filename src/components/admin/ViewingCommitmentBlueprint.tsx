
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarCheck, Crown, Zap, ClipboardCheck, AlertTriangle, Copy, Check, Eye, Users, Bell, TrendingUp, Target, Shield } from 'lucide-react';
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

const viewingCommitment = {
  dropOffCauses: [
    { cause: 'Buyer indecision / schedule conflicts', impact: 92, fix: '3-step confirmation flow: booking → calendar invite → same-day reminder with easy reschedule' },
    { cause: 'Unclear property expectations', impact: 85, fix: 'Pre-viewing brief with 5 key highlights, video walkthrough, and neighborhood context' },
    { cause: 'No urgency to attend', impact: 78, fix: 'Show competing interest: "3 other buyers viewing this week" + limited slot messaging' },
    { cause: 'Weak follow-up coordination', impact: 74, fix: 'Automated 3-touch sequence: confirmation → reminder → post-viewing feedback request' },
  ],
  preViewingFlow: [
    { step: 'Instant Confirmation', timing: 'T+0 (booking)', actions: ['Send WhatsApp confirmation with property summary card', 'Include Google Calendar invite link', 'Share exact location pin + parking/access instructions'], script: `✅ Viewing Confirmed!

🏠 [Property Name] — [District]
📅 [Date], [Time]
📍 Location: [Google Maps link]

Highlights:
• [Key feature 1]
• [Key feature 2]  
• [Price] — [X]% below area average

⚠️ [X] other buyers juga tertarik minggu ini.

Butuh reschedule? Reply "UBAH" + waktu baru.` },
    { step: 'Pre-Viewing Brief', timing: 'T-24hrs', actions: ['Send 30-sec video walkthrough or photo carousel', 'Include comparable price data for context', 'Mention what to look for during visit'], script: `📋 Pre-Viewing Brief — [Property Name]

🎬 Video walkthrough: [link]

🔑 5 Hal Penting:
1. Layout [X] KT / [X] KM — cocok untuk [target]
2. Renovasi terakhir: [year]
3. Area demand: [X] inquiry bulan ini
4. Harga vs tetangga: [X]% lebih kompetitif
5. ROI rental estimate: [X]%/tahun

⏰ Reminder: Viewing besok [Time]
📍 [Location link]

Ada pertanyaan sebelum viewing? Reply di sini 👇` },
    { step: 'Same-Day Reminder', timing: 'T-2hrs', actions: ['Send final reminder with agent contact', 'Confirm meeting point details', 'Include emergency reschedule option'], script: `⏰ Reminder: Viewing HARI INI

🏠 [Property Name]
🕐 [Time] — dalam 2 jam
📍 [Location link]
👤 Agent: [Name] — [Phone]

💡 Tip: Perhatikan pencahayaan alami dan kondisi struktur.

Tidak bisa hadir? Reply "RESCHEDULE" sekarang.` },
  ],
  commitmentTriggers: [
    { trigger: 'Limited Slots', message: '"Hanya 2 slot viewing tersisa minggu ini — amankan jadwal Anda"', psychology: 'Scarcity bias' },
    { trigger: 'Social Proof', message: '"4 buyer lain telah menjadwalkan viewing properti ini"', psychology: 'Bandwagon effect' },
    { trigger: 'Loss Aversion', message: '"Properti serupa di area ini terjual dalam 14 hari rata-rata"', psychology: 'Fear of missing out' },
    { trigger: 'Commitment Escalation', message: '"Anda sudah shortlist properti ini — viewing adalah langkah terbaik berikutnya"', psychology: 'Consistency principle' },
  ],
  kpis: [
    { metric: 'Viewing Attendance Rate', target: '≥80%', current: '52%' },
    { metric: 'Inquiry-to-Viewing Ratio', target: '≥35%', current: '18%' },
    { metric: 'No-Show Reduction', target: '≤15%', current: '38%' },
    { metric: 'Post-Viewing Offer Intent', target: '≥25%', current: '10%' },
  ],
};

const eliteAgentCircle = {
  qualificationCriteria: [
    { factor: 'Response Speed', weight: 30, benchmark: '80%+ inquiries responded <5 min', icon: '⚡' },
    { factor: 'Deal Closure Rate', weight: 30, benchmark: '≥5 closed deals via platform', icon: '🏆' },
    { factor: 'Listing Quality Score', weight: 20, benchmark: 'Avg ≥8/10 (photos, description, pricing)', icon: '📸' },
    { factor: 'Client Satisfaction', weight: 20, benchmark: '≥4.5/5 buyer feedback rating', icon: '⭐' },
  ],
  tiers: [
    { name: '💎 Diamond Elite', threshold: 'Score ≥90', count: 'Top 3%', benefits: ['First-access to all hot leads (<2 min exclusive window)', 'Free Spotlight listing every week', 'Co-branded marketing campaigns', 'Quarterly revenue-share bonus (8%)', 'VIP invitation to developer preview events'], color: 'text-primary' },
    { name: '🥇 Gold Elite', threshold: 'Score 75–89', count: 'Top 10%', benefits: ['Priority lead routing (5-min exclusive window)', 'Discounted Premium listings (60% off)', 'Monthly market intelligence briefing', 'Featured agent badge + profile spotlight', 'Semi-annual performance review dinner'], color: 'text-chart-3' },
    { name: '🥈 Silver Rising', threshold: 'Score 60–74', count: 'Top 25%', benefits: ['Enhanced lead rotation priority', 'Access to training & coaching resources', 'Performance improvement roadmap', 'Quarterly promotion assessment', 'Pathway to Gold Elite within 90 days'], color: 'text-muted-foreground' },
  ],
  invitationScript: `Pak/Bu [Agent Name],

Selamat! 🏆 Anda terpilih masuk ELITE AGENT CIRCLE — ASTRA Villa.

📊 Performance Score Anda: [X]/100
• Response speed: Top [X]% 
• Deal closures: [X] transaksi via platform
• Listing quality: [X]/10
• Buyer satisfaction: [X]/5

💎 Sebagai [Diamond/Gold] Elite Member:
✅ Akses prioritas ke semua hot leads
✅ [Tier-specific benefit 1]
✅ [Tier-specific benefit 2]
✅ Revenue-share bonus [X]%
✅ Exclusive networking events

🤝 Yang kami harapkan:
• Maintain response time <5 menit
• Minimum [X] active listings
• Exclusive listing commitment untuk [District]
• Monthly performance review participation

Apakah Bapak/Ibu bersedia bergabung? 
Meeting 30 menit minggu ini untuk onboarding?

Best regards,
[Your Name] — ASTRA Villa Elite Partnership`,
  communityActivities: [
    { activity: 'Monthly Elite Briefing', format: '60-min virtual meeting', content: 'Market trends, platform updates, deal pipeline review, peer recognition' },
    { activity: 'Quarterly Market Summit', format: 'In-person networking event', content: 'Developer previews, investment insights, top performer awards ceremony' },
    { activity: 'Private Intelligence Channel', format: 'WhatsApp/Telegram group', content: 'Real-time hot deal alerts, demand signals, pricing insights, peer support' },
    { activity: 'Annual Elite Retreat', format: 'Full-day strategic session', content: 'Market outlook, partnership deepening, exclusive project allocations' },
  ],
  kpis: [
    { metric: 'Elite Agent Deal Volume', target: '≥60% of platform deals' },
    { metric: 'Exclusive Listing Share', target: '≥25% of total inventory' },
    { metric: 'Elite Retention Rate', target: '≥95% annual' },
    { metric: 'Elite NPS Score', target: '≥9/10' },
  ],
};

const demandSurge = {
  detectionLogic: [
    { signal: 'Inquiry Spike', threshold: '≥3x avg daily inquiries in district', window: '48-hour rolling', confidence: 92 },
    { signal: 'Search Concentration', threshold: '≥50% increase in district-specific searches', window: '7-day rolling', confidence: 85 },
    { signal: 'Viewing Cluster', threshold: '≥5 viewing requests in same district/week', window: '7-day rolling', confidence: 88 },
    { signal: 'Price Watch Surge', threshold: '≥10 users adding price alerts for area', window: '14-day rolling', confidence: 78 },
    { signal: 'Listing Depletion', threshold: 'Active listings drop ≥20% while inquiries stable', window: '30-day rolling', confidence: 82 },
  ],
  alertTemplates: [
    { audience: 'Buyers', type: 'Opportunity Alert', template: `🔥 DEMAND SURGE: [District]!

📊 Minggu ini di [District]:
• [X]x lebih banyak inquiry dari biasanya
• Hanya [Y] properti tersedia
• [Z] buyer sudah jadwalkan viewing

🏠 Top Opportunities:
1. [Property] — Rp [Price] | [X] views
2. [Property] — Rp [Price] | Baru listing
3. [Property] — Rp [Price] | Below market

⏰ Window sempit — properti di area ini rata-rata terjual dalam [X] hari.

👉 Lihat semua: [link]` },
    { audience: 'Agents/Vendors', type: 'Supply Activation Alert', template: `📈 SURGE ALERT untuk Agent — [District]

Demand buyer di [District] melonjak [X]x!

📊 Data real-time:
• [X] inquiry aktif tanpa listing match
• Buyer mencari: [property types]
• Budget range: Rp [X]–[Y]
• Viewing requests: [X] minggu ini

💰 Peluang Anda:
• Upload listing di [District] sekarang = visibility maksimal
• Premium Boost GRATIS untuk 3 listing pertama di surge zone
• Estimated time-to-inquiry: <24 jam

👉 Upload sekarang: [link]` },
    { audience: 'Dashboard', type: 'Heat Indicator', template: `SURGE STATUS: [District]
━━━━━━━━━━━━━━━━━
Level: 🔴 HIGH DEMAND
Inquiry velocity: [X]x normal
Supply gap: [Y] listings needed
Confidence: [Z]%
Active since: [date]
━━━━━━━━━━━━━━━━━
ACTION: Recruit agents + boost visibility` },
  ],
  actionActivation: [
    { trigger: 'Surge detected (confidence ≥80%)', vendorAction: 'Push notification: "Upload listing in [District] — instant visibility"', buyerAction: 'Alert: "High demand — act fast on available properties"', platformAction: 'Increase ad spend in surge district' },
    { trigger: 'Supply gap widening', vendorAction: 'Offer free Premium Boost for new listings in zone', buyerAction: 'Show expanded area suggestions with similar properties', platformAction: 'Activate agent recruitment outreach for district' },
    { trigger: 'Surge cooling (3-day decline)', vendorAction: 'Send pricing guidance: "Market stabilizing — competitive pricing recommended"', buyerAction: 'Notify: "Demand easing — good negotiation window"', platformAction: 'Reduce surge intensity indicators' },
  ],
  kpis: [
    { metric: 'Listing Uploads After Surge Alert', target: '+40% within 72hrs' },
    { metric: 'Inquiry Conversion in Surge Zone', target: '+25% vs baseline' },
    { metric: 'Alert Engagement Rate', target: '≥35% open/click' },
    { metric: 'Surge-to-Deal Acceleration', target: '2x faster than avg' },
  ],
};

const weeklyChecklist = [
  { category: 'Viewing Commitment', items: ['Review viewing attendance rate vs target (≥80%)', 'Audit pre-viewing brief delivery compliance', 'Check no-show patterns and top drop-off reasons', 'Send post-viewing feedback survey to attendees'] },
  { category: 'Elite Agent Circle', items: ['Update agent performance scores and rankings', 'Process new Elite qualification applications', 'Send monthly intelligence briefing to Elite members', 'Review exclusive listing contribution metrics'] },
  { category: 'Demand Surge Signals', items: ['Review active surge zones and confidence levels', 'Track listing upload response to surge alerts', 'Analyze surge-to-deal conversion metrics', 'Calibrate detection thresholds based on accuracy'] },
  { category: 'Deal Momentum', items: ['Count viewings scheduled this week vs last', 'Track offer intent signals from post-viewing', 'Monitor agent response SLA compliance', 'Identify stuck deals needing founder intervention'] },
];

const risks = [
  { signal: 'Viewing attendance dropping below 60%', severity: 90, mitigation: 'Implement deposit-hold system for premium viewings; add phone confirmation step; reduce booking-to-viewing gap' },
  { signal: 'Elite agents monopolizing >70% of leads', severity: 84, mitigation: 'Cap elite lead share at 60%; ensure rising agents get baseline exposure; monitor ecosystem health' },
  { signal: 'Surge alerts causing panic buying / false urgency', severity: 88, mitigation: 'Use verified data only; add confidence intervals; cap alert frequency to 1/district/week; transparent methodology' },
  { signal: 'Agent fatigue from too many platform notifications', severity: 76, mitigation: 'Smart notification bundling; preference settings for alert types; daily digest option vs real-time' },
  { signal: 'Viewing quality declining (rushed, unprepared agents)', severity: 80, mitigation: 'Mandatory agent preparation checklist; buyer feedback scoring; coaching for below-threshold performers' },
];

const ViewingCommitmentBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><CalendarCheck className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Viewing Commitment + Elite Agent Circle + Demand Surge Alerts</h2>
          <p className="text-sm text-muted-foreground">Deal attendance, premium vendor ecosystem & demand-driven liquidity signaling</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="viewing" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="viewing"><Eye className="h-4 w-4 mr-1.5" />Viewing Commitment</TabsTrigger>
        <TabsTrigger value="elite"><Crown className="h-4 w-4 mr-1.5" />Elite Circle</TabsTrigger>
        <TabsTrigger value="surge"><Zap className="h-4 w-4 mr-1.5" />Demand Surge</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* VIEWING TAB */}
      <TabsContent value="viewing" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Drop-Off Causes & Fixes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {viewingCommitment.dropOffCauses.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{d.cause}</span><Badge variant="outline" className="text-[10px]">{d.impact}%</Badge></div>
                    <Progress value={d.impact} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground">→ {d.fix}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Viewing KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {viewingCommitment.kpis.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs font-medium text-foreground">{k.metric}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {k.target}</Badge>
                    </div>
                  </div>
                ))}
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Commitment Psychology Triggers</p>
                  {viewingCommitment.commitmentTriggers.map((t, i) => (
                    <div key={i} className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold text-foreground">{t.trigger}</span>
                        <Badge variant="outline" className="text-[9px]">{t.psychology}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{t.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-4">
          {viewingCommitment.preViewingFlow.map((step, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Step {i + 1}: {step.step}</CardTitle>
                    <Badge className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/20">{step.timing}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1">
                    {step.actions.map((a, j) => (
                      <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-primary">▸</span>{a}</li>
                    ))}
                  </ul>
                  <CopyBlock text={step.script} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* ELITE CIRCLE TAB */}
      <TabsContent value="elite" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-chart-3" />Qualification Criteria</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {eliteAgentCircle.qualificationCriteria.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{c.icon} {c.factor}</span><Badge variant="outline" className="text-[10px]">{c.weight}%</Badge></div>
                    <Progress value={c.weight * 3.3} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">Benchmark: {c.benchmark}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-primary" />Elite Tiers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {eliteAgentCircle.tiers.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${t.color}`}>{t.name}</span>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{t.threshold}</Badge>
                        <Badge className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/20">{t.count}</Badge>
                      </div>
                    </div>
                    <ul className="space-y-0.5 mt-1">
                      {t.benefits.map((b, j) => (
                        <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-primary">✓</span>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Elite Circle Invitation Script</CardTitle></CardHeader>
            <CardContent><CopyBlock text={eliteAgentCircle.invitationScript} /></CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-chart-1" />Community Activities</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {eliteAgentCircle.communityActivities.map((a, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{a.activity}</span>
                      <Badge variant="outline" className="text-[10px]">{a.format}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{a.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(5)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Elite Circle KPIs</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {eliteAgentCircle.kpis.map((k, i) => (
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

      {/* DEMAND SURGE TAB */}
      <TabsContent value="surge" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-3" />Surge Detection Logic</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {demandSurge.detectionLogic.map((d, i) => (
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

        {demandSurge.alertTemplates.map((t, i) => (
          <motion.div key={i} {...anim(i + 2)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t.type}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">→ {t.audience}</Badge>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={t.template} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Action Activation Matrix</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {demandSurge.actionActivation.map((a, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs font-semibold text-foreground mb-1.5">⚡ {a.trigger}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                    <div className="text-[11px]"><span className="text-chart-3 font-medium">Vendor:</span> <span className="text-muted-foreground">{a.vendorAction}</span></div>
                    <div className="text-[11px]"><span className="text-primary font-medium">Buyer:</span> <span className="text-muted-foreground">{a.buyerAction}</span></div>
                    <div className="text-[11px]"><span className="text-chart-1 font-medium">Platform:</span> <span className="text-muted-foreground">{a.platformAction}</span></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(6)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Surge Alert KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {demandSurge.kpis.map((k, i) => (
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

export default ViewingCommitmentBlueprint;
