
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wallet, Crown, PartyPopper, ClipboardCheck, AlertTriangle, Copy, Check, Target, TrendingUp, Zap, Users, DollarSign, Calendar } from 'lucide-react';
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

const financingFunnel = {
  barriers: [
    { issue: 'Uncertain loan eligibility', impact: 91, fix: 'Embed quick eligibility calculator — income × 3 rule preview' },
    { issue: 'Down payment confusion', impact: 84, fix: 'Show DP scenarios: 10%, 20%, 30% with monthly payment impact' },
    { issue: 'Slow bank response', impact: 78, fix: 'Pre-connect with partner mortgage brokers for 24hr pre-approval' },
    { issue: 'Offer hesitation without financing clarity', impact: 73, fix: 'Link pre-assessment to "Make Offer" button — confidence unlock' },
  ],
  funnelStages: [
    { stage: '1. Awareness', action: '"Can I afford this?" calculator on every listing page', conversion: 'Listing view → calculator use: 15%' },
    { stage: '2. Education', action: 'Short guide: "5 Steps to Property Financing in Indonesia"', conversion: 'Calculator use → guide read: 40%' },
    { stage: '3. Pre-Assessment', action: 'Simple form: income, DP budget, property preference → instant estimate', conversion: 'Guide read → form submit: 25%' },
    { stage: '4. Advisor Connection', action: 'Route to partner bank/broker within 2hrs of form submission', conversion: 'Form submit → advisor call: 60%' },
    { stage: '5. Deal Enablement', action: 'Pre-approval letter → viewing priority → offer confidence', conversion: 'Advisor call → offer made: 35%' },
  ],
  accelerationScripts: {
    affordability: `Pak/Bu [Name],

Berdasarkan estimasi awal, dengan penghasilan Rp [X]/bulan dan DP Rp [Y]:

📊 Estimasi KPR:
• Plafon: Rp [Amount]
• Cicilan: ~Rp [Monthly]/bulan (tenor 20 tahun)
• Bank partner: [Bank Name] — bunga [X]%

🏠 Properti yang cocok di range ini:
• [Property 1] — Rp [Price]
• [Property 2] — Rp [Price]

Mau kami jadwalkan viewing + konsultasi financing gratis?

Tim ASTRA Villa 🙏`,
    preApproval: `CHECKLIST DOKUMEN PRE-APPROVAL KPR

✅ KTP & KK (fotokopi)
✅ NPWP
✅ Slip gaji 3 bulan terakhir / SPT (wiraswasta)
✅ Rekening koran 3 bulan terakhir
✅ Surat keterangan kerja (karyawan)

📋 Kirim dokumen via WhatsApp ke tim kami
⏱️ Estimasi pre-approval: 2–5 hari kerja

Setelah pre-approval, Anda bisa:
• Viewing dengan percaya diri
• Submit offer yang kredibel
• Negosiasi dari posisi yang kuat`,
  },
  kpis: [
    { metric: 'Financing Calculator Usage', target: '≥20% of listing views', current: '0%' },
    { metric: 'Pre-Assessment Submissions', target: '50+/month', current: '0' },
    { metric: 'Viewing-to-Offer Improvement', target: '+15% lift', current: 'baseline' },
    { metric: 'Deal Closure Time Reduction', target: '-30% avg days', current: 'baseline' },
  ],
};

const premiumUpsell = {
  valueTiers: [
    { name: 'Standard', price: 'Free', features: ['Basic listing visibility', 'Standard search position', 'Manual inquiry routing'], highlight: false },
    { name: 'Premium', price: 'Rp 500K/month', features: ['3× more visibility', 'Priority search ranking', 'Featured badge', 'Performance analytics'], highlight: true },
    { name: 'Spotlight', price: 'Rp 1.5M/month', features: ['Homepage showcase', 'Social media promotion', 'Dedicated inquiry coordinator', 'Weekly performance report'], highlight: false },
  ],
  triggerLogic: [
    { trigger: 'Listing gets 5+ inquiries in 48hrs', action: '"Your listing is trending! Boost to Premium for 3× more exposure"', timing: 'Immediate' },
    { trigger: 'Listing active >14 days with <3 inquiries', action: '"Not getting results? Premium listings get 3× more views on average"', timing: 'Day 14' },
    { trigger: 'Agent closes first deal via platform', action: '"Congratulations! Upgrade your other listings to replicate success"', timing: 'Post-deal' },
    { trigger: 'New competitor listings in same area', action: '"[X] new listings nearby — stay ahead with Premium visibility"', timing: 'Real-time' },
    { trigger: 'Seasonal demand spike detected', action: '"Peak season! Premium listings get [X]% more views right now"', timing: 'Seasonal' },
  ],
  scripts: {
    whatsapp: `Pak/Bu [Agent Name],

Listing Anda "[Property Name]" mendapat [X] inquiry dalam [Y] hari — ini di atas rata-rata! 🔥

Dengan upgrade ke Premium (Rp 500K/bulan), listing Anda akan:
✅ Tampil 3× lebih sering di hasil pencarian
✅ Mendapat badge "Featured" yang meningkatkan trust
✅ Akses analytics performa real-time

📊 Data kami: listing Premium rata-rata closing 40% lebih cepat.

Mau aktifkan sekarang? Reply "YA" dan kami proses dalam 5 menit.

Tim ASTRA Villa`,
    dashboardNotif: `🚀 Boost Available!
Your listing "[Property]" is getting attention — [X] views today.
Premium listings in this area get 3× more inquiries.
→ Upgrade Now (Rp 500K/mo) | Learn More`,
    emailFollowUp: `Subject: Your listing performance report — opportunity detected

Hi [Agent Name],

Here's your weekly listing performance:
• [Property Name]: [X] views, [Y] inquiries
• Area average: [Z] views, [W] inquiries

Your listing is performing [above/below] average.

[If above]: Lock in this momentum with Premium — get 3× visibility and close faster.
[If below]: Premium listings in your area average 3× more inquiries. Upgrade to compete.

→ Upgrade to Premium

Best,
ASTRA Villa Team`,
  },
  kpis: [
    { metric: 'Premium Conversion Rate', target: '≥12% of active vendors' },
    { metric: 'Revenue per Active Vendor', target: 'Rp 350K+/month avg' },
    { metric: 'Repeat Upgrade Rate', target: '≥65%' },
    { metric: 'Upsell Message CTR', target: '≥8%' },
  ],
};

const localEvents = {
  concepts: [
    {
      name: 'Weekend Open House Cluster Tour',
      desc: 'Curated tour visiting 4–6 properties in one district in 3 hours',
      format: 'Saturday morning, guided by platform coordinator',
      audience: 'Serious buyers with active search behavior',
      cost: 'Rp 2–5M (transport + refreshments)',
    },
    {
      name: 'Investor Insight Meetup',
      desc: 'Small-group discussion: "Property Investment Returns in [District]"',
      format: 'Weekday evening, café or co-working space, 90 min',
      audience: 'First-time and active investors',
      cost: 'Rp 1–3M (venue + materials)',
    },
    {
      name: 'Developer Project Preview',
      desc: 'Exclusive first-look showcase for new development projects',
      format: 'On-site at project location, weekend, 2 hours',
      audience: 'Pre-qualified buyers from platform database',
      cost: 'Sponsored by developer partner',
    },
  ],
  promotionPlan: [
    { channel: 'WhatsApp Broadcast', timing: '7 days + 2 days + same day', message: 'Invite → reminder → last spots' },
    { channel: 'Instagram/Facebook Ads', timing: '10 days before', message: 'Geo-targeted within 15km radius' },
    { channel: 'Agent Network', timing: '7 days before', message: 'Incentivize agents to bring qualified buyers' },
    { channel: 'Email to Active Leads', timing: '5 days before', message: 'Personalized invite with matching properties' },
  ],
  postEventFlow: [
    { time: '0–2 hours after', action: 'Send thank-you + curated property shortlist based on interests expressed' },
    { time: 'Same day', action: 'Schedule follow-up viewing slots for top-interest properties' },
    { time: 'Day 2', action: 'Share event highlights on social media (photos, testimonials)' },
    { time: 'Day 3–5', action: 'Personal WhatsApp follow-up: "Which property stood out most?"' },
    { time: 'Day 7', action: 'Send comparable options for attendees who haven\'t scheduled viewings' },
  ],
  kpis: [
    { metric: 'Attendee Registration', target: '30+ per event' },
    { metric: 'Post-Event Inquiry Spike', target: '+40% within 7 days' },
    { metric: 'Event-to-Viewing Conversion', target: '≥25% of attendees' },
    { metric: 'Deals Influenced by Events', target: '≥3 per quarter' },
  ],
};

const weeklyChecklist = [
  { category: 'Financing Funnel', items: ['Review calculator usage analytics', 'Check pre-assessment form submissions', 'Follow up on pending advisor connections', 'Update partner bank rates & offers'] },
  { category: 'Premium Upsell', items: ['Review upsell trigger performance', 'Audit premium listing renewal rates', 'A/B test upsell messaging variants', 'Track revenue per vendor trend'] },
  { category: 'Events Pipeline', items: ['Confirm next event logistics', 'Check registration numbers vs target', 'Prepare post-event follow-up materials', 'Collect & publish event testimonials'] },
  { category: 'Revenue Health', items: ['Monitor total monetization revenue', 'Check deal closure pipeline status', 'Review vendor churn risk signals', 'Audit buyer satisfaction feedback'] },
];

const risks = [
  { signal: 'Financing leads not converting to viewings', severity: 90, mitigation: 'Shorten funnel: instant pre-assessment → same-day advisor call → next-day viewing' },
  { signal: 'Premium upsell perceived as pushy', severity: 85, mitigation: 'Lead with data & ROI proof; limit upsell messages to 2x/week per vendor' },
  { signal: 'Events with low attendance (<10)', severity: 78, mitigation: 'Over-invite by 3x; add urgency with "limited spots"; partner with agents to bring clients' },
  { signal: 'Partner banks slow to respond', severity: 82, mitigation: 'Set SLA agreement; have 2+ bank partners per city for backup routing' },
  { signal: 'Free-tier vendors see no reason to upgrade', severity: 75, mitigation: 'Gate premium analytics behind paywall; show performance gap vs premium competitors' },
];

const BuyerFinancingBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Wallet className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Buyer Financing + Premium Upsell + Local Events</h2>
          <p className="text-sm text-muted-foreground">Deal enablement, monetization acceleration & hyper-local activation</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="financing" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="financing"><Wallet className="h-4 w-4 mr-1.5" />Financing Funnel</TabsTrigger>
        <TabsTrigger value="upsell"><Crown className="h-4 w-4 mr-1.5" />Premium Upsell</TabsTrigger>
        <TabsTrigger value="events"><PartyPopper className="h-4 w-4 mr-1.5" />Local Events</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* FINANCING TAB */}
      <TabsContent value="financing" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Buyer Barrier Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {financingFunnel.barriers.map((b, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{b.issue}</span><Badge variant="outline" className="text-[10px]">{b.impact}%</Badge></div>
                    <Progress value={b.impact} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground">→ {b.fix}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Funnel KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {financingFunnel.kpis.map((k, i) => (
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
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-1" />5-Stage Financing Funnel</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {financingFunnel.funnelStages.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Badge className="text-[10px] min-w-[90px] justify-center flex-shrink-0 bg-primary/10 text-primary border-primary/20">{s.stage}</Badge>
                  <div>
                    <p className="text-xs text-foreground">{s.action}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.conversion}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Affordability Message Script</CardTitle></CardHeader>
              <CardContent><CopyBlock text={financingFunnel.accelerationScripts.affordability} /></CardContent>
            </Card>
          </motion.div>
          <motion.div {...anim(5)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Pre-Approval Document Checklist</CardTitle></CardHeader>
              <CardContent><CopyBlock text={financingFunnel.accelerationScripts.preApproval} /></CardContent>
            </Card>
          </motion.div>
        </div>
      </TabsContent>

      {/* UPSELL TAB */}
      <TabsContent value="upsell" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {premiumUpsell.valueTiers.map((t, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className={t.highlight ? 'border-primary/50 bg-primary/5' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{t.name}</CardTitle>
                    <Badge variant={t.highlight ? 'default' : 'outline'} className="text-[10px]">{t.price}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {t.features.map((f, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-primary mt-0.5">✓</span>{f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-3" />Upsell Trigger Logic</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {premiumUpsell.triggerLogic.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className="text-[10px] min-w-[70px] justify-center flex-shrink-0">{t.timing}</Badge>
                  <div>
                    <p className="text-xs font-medium text-foreground">{t.trigger}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">→ {t.action}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div {...anim(5)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">WhatsApp Upsell Script</CardTitle></CardHeader>
              <CardContent><CopyBlock text={premiumUpsell.scripts.whatsapp} /></CardContent>
            </Card>
          </motion.div>
          <motion.div {...anim(6)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Dashboard Notification</CardTitle></CardHeader>
              <CardContent><CopyBlock text={premiumUpsell.scripts.dashboardNotif} /></CardContent>
            </Card>
          </motion.div>
          <motion.div {...anim(7)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Email Follow-Up</CardTitle></CardHeader>
              <CardContent><CopyBlock text={premiumUpsell.scripts.emailFollowUp} /></CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(8)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Upsell KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {premiumUpsell.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* EVENTS TAB */}
      <TabsContent value="events" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {localEvents.concepts.map((e, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">{e.name}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{e.desc}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Format:</span><span className="text-foreground">{e.format}</span></div>
                    <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Audience:</span><span className="text-foreground">{e.audience}</span></div>
                    <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Cost:</span><span className="text-foreground">{e.cost}</span></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Promotion Plan</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {localEvents.promotionPlan.map((p, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{p.channel}</span>
                      <Badge variant="outline" className="text-[10px]">{p.timing}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{p.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(5)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-chart-1" />Post-Event Follow-Up Flow</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {localEvents.postEventFlow.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                    <Badge variant="outline" className="text-[10px] min-w-[80px] justify-center flex-shrink-0">{f.time}</Badge>
                    <span className="text-xs text-foreground">{f.action}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(6)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Event KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {localEvents.kpis.map((k, i) => (
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

export default BuyerFinancingBlueprint;
